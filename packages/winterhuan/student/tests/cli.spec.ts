import { execFile } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { expect, it, onTestFinished } from 'vitest'
import { nodeStudyFiles, readWorkspace, queryWorkspace } from '../src/files/index.ts'
import { officialFileSchemas, validateStudyFiles, lessonFileSchema } from '../src/files/index.ts'
import { authoringExample, authoringSchema } from '../src/files/resources.ts'
import { figureSchema } from '../src/schema.ts'
import { NOW, setup } from './fixtures.ts'

const cli = fileURLToPath(new URL('../lib/cli.js', import.meta.url))
const execute = promisify(execFile)

it('runs the installed CLI without Host peers or development dependencies', async () => {
  const root = await mkdtemp(join(tmpdir(), 'student-cli-installed-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const installed = join(root, 'node_modules/@winterhuan/dsh-student')
  await cp(dirname(cli), join(installed, 'lib'), { recursive: true })
  const require = createRequire(import.meta.url)
  await symlink(dirname(require.resolve('zod/package.json')), join(root, 'node_modules/zod'), 'junction')
  const cwd = join(root, 'workspace')
  await mkdir(join(cwd, '.study'), { recursive: true })
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(authoringExample('term-settings')))
  const env = { ...process.env, NODE_OPTIONS: '', NODE_PATH: '' }
  const executable = join(installed, 'lib/cli.js')
  const invoke = (...args: string[]) => execute(process.execPath, [executable, ...args], { cwd, env })
  expect((await invoke('--help')).stdout).toContain('Read-only validation')
  expect(JSON.parse((await invoke('schema', 'block')).stdout)).toHaveProperty('properties.termId')
  expect(JSON.parse((await invoke('example', 'openmaic-lessons')).stdout)).toHaveProperty('lessons')
  expect(JSON.parse((await invoke('validate')).stdout)).toMatchObject({ ok: true, status: 'valid' })
})

it('validates actual official bytes without writing and gives independent consumers the saved facts', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-cli-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'), { recursive: true })
  const path = join(cwd, '.study/settings.json')
  const bytes = JSON.stringify({ format: 2, kind: 'term-settings', termId: 'term-cli', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] })
  await writeFile(path, bytes)
  const before = await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal)
  const { stdout } = await execute(process.execPath, [cli, 'validate', '--workspace', cwd], { env: { ...process.env, NODE_OPTIONS: '' } })
  expect(JSON.parse(stdout)).toMatchObject({ ok: true, files: [{ path: '.study/settings.json', kind: 'term-settings', termId: 'term-cli', version: before.files[0]!.version }] })
  const after = await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal)
  expect(after.files.map(file => file.version)).toEqual(before.files.map(file => file.version))
  expect(await readFile(path, 'utf8')).toBe(bytes)
  expect(queryWorkspace(after, { kind: 'settings' }, NOW)).toMatchObject({ status: 'valid', data: { termId: 'term-cli', profile: { nickname: setup.profile.nickname } } })
})

it('rejects duplicate reward identities in official bytes and restores the two-reason daily cap after repair', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-cli-rewards-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'), { recursive: true })
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(authoringExample('term-settings')))
  const path = join(cwd, '.study/collections.json')
  const collections = authoringExample('collections') as object
  const bytes = JSON.stringify({ ...collections, rewards: Array.from({ length: 3 }, () => ({ day: '2026-11-14', reason: 'participation' })) })
  await writeFile(path, bytes)
  const failed = await execute(process.execPath, [cli, 'validate', '--workspace', cwd]).then(value => ({ code: 0, signal: null, ...value }), error => error)
  expect(failed.signal).toBeNull()
  expect(failed.code).toBe(1)
  expect(JSON.parse(failed.stdout)).toMatchObject({ ok: false, issues: expect.arrayContaining([expect.objectContaining({ path: '.study/collections.json', rule: 'duplicate-identity' })]) })
  const invalid = await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal)
  expect(queryWorkspace(invalid, { kind: 'status' }, Date.parse('2026-11-14T10:00:00+08:00'))).not.toHaveProperty('data')
  expect(await readFile(path, 'utf8')).toBe(bytes)
  await writeFile(path, JSON.stringify({ ...collections, rewards: [{ day: '2026-11-14', reason: 'participation' }, { day: '2026-11-14', reason: 'reflection' }, { day: '2026-11-13', reason: 'participation' }] }))
  expect(JSON.parse((await execute(process.execPath, [cli, 'validate', '--workspace', cwd])).stdout)).toMatchObject({ ok: true })
  expect(queryWorkspace(await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal), { kind: 'status' }, Date.parse('2026-11-14T10:00:00+08:00'))).toMatchObject({ status: 'valid', data: { stars: 3, todayStars: 2 } })
})

it.each(['2026-02-29', '2026-02-30', '2026-04-31', '2026-13-01'])('rejects the invalid reward calendar day %s in official bytes', async day => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-cli-reward-day-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'), { recursive: true })
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(authoringExample('term-settings')))
  const path = join(cwd, '.study/collections.json')
  const bytes = JSON.stringify({ ...(authoringExample('collections') as object), rewards: [{ day, reason: 'participation' }] })
  await writeFile(path, bytes)
  const failed = await execute(process.execPath, [cli, 'validate', '--workspace', cwd]).then(value => ({ code: 0, signal: null, ...value }), error => error)
  expect(failed.signal).toBeNull()
  expect(failed.code).toBe(1)
  expect(JSON.parse(failed.stdout)).toMatchObject({ ok: false, issues: expect.arrayContaining([expect.objectContaining({ path: '.study/collections.json', field: 'rewards.0.day', rule: 'schema' })]) })
  expect(queryWorkspace(await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal), { kind: 'status' }, NOW)).not.toHaveProperty('data')
  expect(await readFile(path, 'utf8')).toBe(bytes)
})

it('generates valid examples for every official file kind from the same strict definitions', () => {
  const paths = { 'term-settings': '.study/settings.json', block: '.study/blocks/example.json', worksheet: '.study/worksheets/example.json', collections: '.study/collections.json' }
  const input = Object.entries(officialFileSchemas).map(([kind, schema]) => {
    const name = kind as keyof typeof officialFileSchemas
    const value = authoringExample(name)
    expect(schema.safeParse(value).success).toBe(true)
    expect(authoringSchema(name).additionalProperties).toBe(false)
    return { path: paths[name], value }
  })
  expect(validateStudyFiles(input)).toMatchObject({ valid: true, issues: [] })
  expect(lessonFileSchema.safeParse(authoringExample('openmaic-lessons')).success).toBe(true)
  const figures = authoringExample('figure') as unknown[]
  expect(figures).toHaveLength(23)
  for (const figure of figures) expect(figureSchema.safeParse(figure).success).toBe(true)
})

it('bounds large Unicode diagnostics and explicitly omits success rows after a complete read', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-cli-bounds-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  const settings = authoringExample('term-settings')
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ ...(settings as object), ['疑'.repeat(10000)]: true }))
  const failed = await execute(process.execPath, [cli, 'validate', '--workspace', cwd]).catch(error => error)
  expect(failed.code).toBe(1)
  expect(Buffer.byteLength(failed.stdout)).toBeLessThanOrEqual(32768)
  expect(JSON.parse(failed.stdout).issues[0]).toMatchObject({ path: '.study/settings.json', rule: 'schema' })
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(settings))
  const block = authoringExample('block') as object
  await Promise.all(Array.from({ length: 101 }, (_, index) => writeFile(join(cwd, `.study/blocks/block-${index}.json`), JSON.stringify({ ...block, id: `block-${index}`, endedAt: NOW }))))
  const result = JSON.parse((await execute(process.execPath, [cli, 'validate', '--workspace', cwd])).stdout)
  expect(result).toMatchObject({ ok: true, fileCount: 102, omittedFiles: 2 })
  expect(result.files).toHaveLength(100)
})

it('rejects invalid official input with bounded corrections, preserves its bytes and accepts an explicit repair', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-cli-repair-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'), { recursive: true })
  const path = join(cwd, '.study/settings.json')
  const valid = { format: 2, kind: 'term-settings', termId: 'term-cli', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  await writeFile(path, JSON.stringify({ ...valid, invented: 'invalid' }))
  const invalidBytes = await readFile(path, 'utf8')
  const failed = await execute(process.execPath, [cli, 'validate', '--workspace', cwd]).then(() => { throw new Error('Invalid files must fail.') }, error => error)
  expect(failed.code).toBe(1)
  expect(failed.signal).toBeNull()
  expect(JSON.parse(failed.stdout)).toMatchObject({ ok: false, issues: expect.arrayContaining([{ path: '.study/settings.json', field: '', rule: 'schema', correction: expect.any(String) }]) })
  expect(failed.stdout.length).toBeLessThan(30000)
  expect(await readFile(path, 'utf8')).toBe(invalidBytes)
  expect(queryWorkspace(await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal), { kind: 'settings' }, NOW)).not.toHaveProperty('data')
  await writeFile(path, JSON.stringify(valid))
  expect(JSON.parse((await execute(process.execPath, [cli, 'validate', '--workspace', cwd])).stdout).ok).toBe(true)
})

it('provides source-derived strict authoring schemas and valid examples including all 23 figure variants', async () => {
  const { stdout } = await execute(process.execPath, [cli, 'schema', 'block'])
  const schema = JSON.parse(stdout)
  expect(schema.additionalProperties).toBe(false)
  expect(schema.properties.termId).toMatchObject({ type: 'string', pattern: '^[a-zA-Z0-9_-]{1,80}$' })
  const example = JSON.parse((await execute(process.execPath, [cli, 'example', 'worksheet'])).stdout)
  expect(example).toMatchObject({ kind: 'worksheet', subject: 'math', context: { scope: { grade: 2, term: 'first' } }, items: [{ objectiveId: 'm2a-o-sub' }] })
  const cwd = await mkdtemp(join(tmpdir(), 'student-cli-examples-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/worksheets'), { recursive: true })
  const settings = JSON.parse((await execute(process.execPath, [cli, 'example', 'term-settings'])).stdout)
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(settings))
  await writeFile(join(cwd, '.study/worksheets/example.json'), JSON.stringify(example))
  expect(JSON.parse((await execute(process.execPath, [cli, 'validate', '--workspace', cwd])).stdout)).toMatchObject({ ok: true })
  example.context.scope = { grade: 1, term: 'first', objectiveIds: ['m2a-o-sub'] }
  const invalidBytes = JSON.stringify(example)
  await writeFile(join(cwd, '.study/worksheets/example.json'), invalidBytes)
  const failed = await execute(process.execPath, [cli, 'validate', '--workspace', cwd]).catch(error => error)
  expect(failed.code).toBe(1)
  expect(failed.signal).toBeNull()
  expect(JSON.parse(failed.stdout)).toMatchObject({ ok: false, issues: expect.arrayContaining([expect.objectContaining({ rule: 'effective-curriculum' })]) })
  expect(await readFile(join(cwd, '.study/worksheets/example.json'), 'utf8')).toBe(invalidBytes)
  const figures = JSON.parse((await execute(process.execPath, [cli, 'example', 'figure'])).stdout)
  expect(figures.map((figure: { kind: string }) => figure.kind)).toEqual(['bar-model', 'money', 'place-value', 'hundred-chart', 'number-line', 'clock', 'sticks', 'vertical', 'shapes', 'overlap', 'split', 'sequence', 'wall', 'grid', 'dot-array', 'plane', 'solid', 'counter', 'measure', 'compass', 'balance', 'writing', 'sketch'])
})
