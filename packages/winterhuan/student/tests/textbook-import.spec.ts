import { mkdtemp, readFile, symlink, mkdir } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import sharp from 'sharp'
import { describe, it, expect, onTestFinished } from 'vitest'
import { TextbookStore } from '../src/textbooks/store.ts'
import { textbookCommand, uploadSchema } from '../src/textbooks/schema.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { rm } from 'node:fs/promises'

const model = { provider: 'test', model: 'vision' }
async function fixture() {
  const cwd = await mkdtemp(join(tmpdir(), 'student-textbook-test-'))
  const ctx = new Context()
  await ctx.plugin(LocalFileSystem, { cwd })
  onTestFinished(async () => { await ctx.fiber.dispose(); await rm(cwd, { recursive: true, force: true }) })
  const files = nodeStudyFiles(cwd)
  files.write = async (path, content, intent, signal) => (await ctx.fs.writeText(await ctx.fs.resolve(path, { cwd, signal }), content, intent, signal)).version
  const store = new TextbookStore(cwd, files)
  await store.command({ action: 'create', id: 'math', title: '数学', subject: 'math', expectedPages: 1 }, model)
  const image = await sharp({ create: { width: 100, height: 120, channels: 3, background: '#fff' } }).png().toBuffer()
  const upload = { bookId: 'math', pageId: 'page-1', position: 1, printedPage: '封面' }
  return { cwd, store, image, upload }
}

describe('durable textbook import', () => {
  it('retains byte-identical originals, admits retries once and rejects reused identities', async () => {
    const { cwd, store, image, upload } = await fixture()
    const first = await store.upload(upload, image)
    expect(await store.upload(upload, image)).toEqual(first)
    expect(await readFile(join(cwd, first.original))).toEqual(image)
    expect(await store.pages('math')).toHaveLength(1)
    await expect(store.upload({ ...upload, position: 2 }, image)).rejects.toMatchObject({ code: 'conflict' })
    await expect(store.upload({ ...upload, pageId: 'bad' }, Buffer.from('not an image'))).rejects.toThrow()
    expect(await store.pages('math')).toHaveLength(1)
  })

  it('commits Markdown and crops before review and protects human revisions from stale saves and reparse', async () => {
    const { store, image, upload } = await fixture()
    let page = await store.upload(upload, image)
    page = (await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: page.revision }, model)).page!
    page = await store.savePage({ ...page, status: 'parsing' }, page.revision)
    page = await store.parsed(page, '# 课文\n\n![图](asset:1)\n\n$x+1$', ['字迹待核对'], [{ left: 0, top: 0, width: 30, height: 40 }])
    const draft = await store.command({ action: 'page', bookId: 'math', pageId: page.id }, model)
    expect(draft.markdown).toContain('../assets/')
    expect(await sharp(await store.bytes(page.content!.assets[0]!.path)).metadata()).toMatchObject({ width: 30, height: 40 })
    const correction = { action: 'edit' as const, bookId: 'math', pageId: page.id, revision: page.revision, markdown: '# 人工校对', printedPage: '1', position: 1, confirm: true, useCandidate: false }
    page = (await store.command(correction, model)).page!
    await expect(store.command(correction, model)).rejects.toMatchObject({ code: 'conflict' })
    page = (await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: page.revision }, model)).page!
    page = await store.savePage({ ...page, status: 'parsing' }, page.revision)
    page = await store.parsed(page, '# 新解析', [], [])
    expect((await store.command({ action: 'page', bookId: 'math', pageId: page.id }, model))).toMatchObject({ markdown: '# 人工校对', candidateMarkdown: '# 新解析', page: { status: 'review' } })
    expect(await store.bytes(page.original)).toEqual(image)
  })

  it('requires expected page coverage, unique photos and explicit proofreading before completing a book', async () => {
    const { store, image, upload } = await fixture()
    let page = await store.upload(upload, image)
    await expect(store.command({ action: 'complete', bookId: 'math', revision: 1 }, model)).rejects.toMatchObject({ code: 'invalid' })
    page = (await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: page.revision }, model)).page!
    page = await store.savePage({ ...page, status: 'parsing' }, page.revision)
    page = await store.parsed(page, '# 完整正文', [], [])
    await store.command({ action: 'edit', bookId: 'math', pageId: page.id, revision: page.revision, markdown: '# 完整正文', printedPage: '', position: 1, confirm: true, useCandidate: false }, model)
    expect((await store.command({ action: 'complete', bookId: 'math', revision: 1 }, model)).book?.confirmedAt).toBeTypeOf('number')
    await store.upload({ ...upload, pageId: 'extra', position: 2 }, image)
    expect((await store.book('math')).confirmedAt).toBeUndefined()
  })

  it('rejects oversized decoded illustrations before publishing an unreadable revision', async () => {
    const { store, upload } = await fixture()
    const pixels = randomBytes(3072 * 3072 * 3)
    const image = await sharp(pixels, { raw: { width: 3072, height: 3072, channels: 3 } }).jpeg({ quality: 90 }).toBuffer()
    let page = await store.upload(upload, image)
    page = (await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: page.revision }, model)).page!
    page = await store.savePage({ ...page, status: 'parsing' }, page.revision)
    await expect(store.parsed(page, '![图](asset:1)', [], [{ left: 0, top: 0, width: 3072, height: 3072 }])).rejects.toMatchObject({ code: 'invalid' })
    expect((await store.page('math', page.id)).content).toBeUndefined()
    expect((await store.bytes(page.original)).equals(image)).toBe(true)
  }, 30000)

  it('recovers committed queue state in a new store and never treats received images as parsed', async () => {
    const { cwd, store, image, upload } = await fixture()
    const page = await store.upload(upload, image)
    await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: page.revision }, model)
    const reopened = new TextbookStore(cwd, nodeStudyFiles(cwd))
    expect(await reopened.page('math', page.id)).toMatchObject({ status: 'queued', job: { model } })
    expect((await reopened.page('math', page.id)).content).toBeUndefined()
    expect(await reopened.bytes(page.original)).toEqual(image)
  })

  it('rejects traversal, symlink escapes and unowned Markdown references', async () => {
    const { cwd, store, image, upload } = await fixture()
    expect(uploadSchema.safeParse({ ...upload, bookId: '../private' }).success).toBe(false)
    expect(textbookCommand.safeParse({ action: 'list', workspace: '/tmp' }).success).toBe(false)
    await mkdir(join(cwd, '.study/textbooks/math/pages'), { recursive: true })
    await symlink(tmpdir(), join(cwd, '.study/textbooks/math/pages/escape'))
    await expect(store.upload({ ...upload, pageId: 'escape' }, image)).rejects.toThrow()
    let page = await store.upload(upload, image)
    page = (await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: page.revision }, model)).page!
    page = await store.savePage({ ...page, status: 'parsing' }, page.revision)
    await expect(store.parsed(page, '![x](https://example.com/tracker)', [], [])).rejects.toMatchObject({ code: 'invalid' })
    await expect(store.parsed(page, '[open][secret]\n\n[secret]: file:///private/data', [], [])).rejects.toMatchObject({ code: 'invalid' })
    await expect(store.parsed(page, '<img src="file:///private/data">', [], [])).rejects.toMatchObject({ code: 'invalid' })
    await expect(store.parsed(page, '![x](asset:1)', [], [{ left: 99, top: 0, width: 30, height: 40 }])).rejects.toMatchObject({ code: 'invalid' })
    expect((await store.page('math', page.id)).content).toBeUndefined()
  })

  it('keeps multi-digit crop references distinct and excludes duplicate photographs without deleting them', async () => {
    const { store, image, upload } = await fixture()
    let page = await store.upload(upload, image)
    page = (await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: page.revision, requestId: 'job' }, model)).page!
    page = await store.savePage({ ...page, status: 'parsing' }, page.revision)
    page = await store.parsed(page, '![first](asset:1)\n\n![tenth](asset:10)', [], Array.from({ length: 10 }, () => ({ left: 0, top: 0, width: 10, height: 10 })))
    const markdown = (await store.bytes(page.content!.path)).toString()
    expect(markdown).toContain('../assets/job-10.png')
    const duplicate = await store.upload({ ...upload, pageId: 'duplicate', position: 2 }, image)
    await store.command({ action: 'exclude', bookId: 'math', pageId: duplicate.id, revision: duplicate.revision, excluded: true }, model)
    await store.command({ action: 'edit', bookId: 'math', pageId: page.id, revision: page.revision, markdown, printedPage: '1', position: 1, confirm: true, useCandidate: false }, model)
    expect((await store.command({ action: 'complete', bookId: 'math', revision: 1 }, model)).book?.confirmedAt).toBeTypeOf('number')
    expect(await store.bytes(duplicate.original)).toEqual(image)
    expect((await store.command({ action: 'queue', bookId: 'math', pageId: page.id, revision: 1, requestId: 'job' }, model)).page?.status).toBe('confirmed')
  })
})
