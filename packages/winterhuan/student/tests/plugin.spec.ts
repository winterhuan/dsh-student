import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import SkillRegistry, { renderSkillContent } from '@deepseek-ai/dsh-skill'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { apply as applyNativeToolExecutor, inject as nativeToolExecutorInject } from '@deepseek-ai/dsh-tool-executor-native'
import type { ToolCallId } from '@deepseek-ai/dsh-llm'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionQuery from '@deepseek-ai/dsh-session-query'
import { describe, expect, it, onTestFinished, vi } from 'vitest'
import * as student from '../src/agent.ts'
import { createStudySkillProvider } from '../src/skill-provider.ts'
import { studyStore } from '../src/store.ts'
import { NOW, setup } from './fixtures.ts'
import { updateStudy } from '../src/learning/update/index.ts'
import { authoringExample } from '../src/files/resources.ts'

async function fixture() {
  const cwd = await mkdtemp(join(tmpdir(), 'dsh-student-test-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin({ apply: applyNativeToolExecutor, inject: nativeToolExecutorInject })
  await ctx.plugin(SkillRegistry)
  await ctx.plugin(LocalFileSystem, { cwd })
  const plugin = ctx.plugin(student)
  await plugin.await()
  const policy = { resolve: vi.fn(() => undefined) }
  function execution(name = 'study_status', signal = new AbortController().signal, sessionId = 'student-session'): ToolRunContext {
    const agent = { session: { id: sessionId, header: { cwd } }, ctx: { root: ctx, get: (name: string) => name === 'sandboxPolicy' ? policy : ctx.get(name) } } as Agent
    const callId = 'study-call' as ToolRunContext['callId']
    return { agent, signal, callId, rootCallId: callId, name, arguments: {}, token: Symbol('study') as ToolRunContext['token'], deferContext() {}, concludeTurn() {} }
  }
  return { cwd, ctx, plugin, execution }
}

describe('independently loaded student plugin', () => {
  it('provides a platform shell in the learning preset for actions such as printing', async () => {
    const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
    expect(patch).toContain("name: '@deepseek-ai/dsh-tool-bash'\n            disabled: !!js process.platform === 'win32'")
    expect(patch).toContain("name: '@deepseek-ai/dsh-tool-pwsh'\n            disabled: !!js process.platform !== 'win32'")
  })

  it('loads the Skill and references through the DSH provider and disposes all contributions', async () => {
    const { ctx, plugin } = await fixture()
    expect((await ctx.skills.list()).map(item => item.name)).toEqual(['study'])
    const provider = createStudySkillProvider()
    const candidates = await provider.list({})
    if (!Array.isArray(candidates)) throw new Error('Expected a complete catalog')
    const candidate = candidates[0]!
    const skill = (await provider.get(candidate, {}))!
    expect(renderSkillContent(skill)).toContain('Base directory for this skill:')
    if (skill.resourceBase?.kind !== 'directory') throw new Error('Expected a resource directory')
    for (const file of ['materials.md', 'teaching.md', 'default-textbooks.md', 'openmaic.md', 'interest-hooks.md']) expect((await readFile(join(skill.resourceBase.path, 'references', file), 'utf8')).length).toBeGreaterThan(100)
    expect(await provider.get({ ...candidate, path: '/etc/passwd' }, {})).toBeUndefined()
    expect(ctx.tools.get('study_status')).toBeDefined()
    expect(ctx.tools.get('study_update')).toBeUndefined()
    await plugin.dispose()
    expect(await ctx.skills.list()).toEqual([])
    expect(ctx.tools.get('study_update')).toBeUndefined()
    expect(ctx.tools.get('study_status')).toBeUndefined()
  })

  it('reads current official setup and school maps through the registered status tool', async () => {
    const { ctx, execution, cwd } = await fixture()
    const status = ctx.tools.get('study_status')!
    expect(await status.execute({}, execution())).toMatchObject({ status: 'missing', versions: [], native: { status: 'unavailable', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0, reason: expect.any(String) } })
    expect(await readdir(cwd)).toEqual([])
    await mkdir(join(cwd, '.study'))
    await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ format: 2, kind: 'term-settings', termId: 'term-tool', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }))
    expect(await status.execute({ kind: 'curriculum', subject: 'math' }, execution())).toMatchObject({ status: 'valid', data: { curriculum: { id: 'math-grade2-first' } }, versions: [{ path: '.study/settings.json' }] })
    expect(await status.execute({ kind: 'curriculum', subject: 'math', grade: 1, term: 'first' }, execution())).toMatchObject({ data: { curriculum: { id: 'math-grade1-first', scope: { current: false } } } })
    await expect(status.execute({ kind: 'curriculum' }, execution())).rejects.toThrow('科目')
    await expect(status.execute({ offset: -1 }, execution())).rejects.toThrow('offset')
  })

  it('preserves legacy source bytes on reads and reports migration state without business writes', async () => {
    const { ctx, execution, cwd } = await fixture()
    await mkdir(join(cwd, '.study'))
    const bytes = JSON.stringify(updateStudy(undefined, setup, NOW))
    await writeFile(join(cwd, '.study/state.json'), bytes)
    expect((await studyStore(execution()))?.profile.nickname).toBe(setup.profile.nickname)
    expect(await ctx.tools.get('study_status')!.execute({}, execution())).toMatchObject({ status: 'legacy' })
    expect(await readFile(join(cwd, '.study/state.json'), 'utf8')).toBe(bytes)
    expect(await readdir(join(cwd, '.study'))).toEqual(['state.json'])
  })

  it('keeps the real resident parameter JSON below the accepted ceiling', async () => {
    const { ctx } = await fixture()
    const schemas = ctx.tools.schemas().filter(tool => tool.name.startsWith('study_'))
    expect(schemas.map(tool => tool.name)).toEqual(['study_status'])
    expect(schemas.reduce((sum, tool) => sum + JSON.stringify(tool.parameters).length, 0)).toBeLessThanOrEqual(30000)
  })

  it('keeps the current block version in bounded context and replaces large requested histories with explicit file pointers', async () => {
    const { ctx, execution, cwd } = await fixture()
    await mkdir(join(cwd, '.study/blocks'), { recursive: true })
    await mkdir(join(cwd, '.study/worksheets'))
    await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(authoringExample('term-settings')))
    const block = authoringExample('block') as object
    await Promise.all(Array.from({ length: 101 }, (_, index) => writeFile(join(cwd, `.study/blocks/block-${index}.json`), JSON.stringify({ ...block, id: `block-${index}`, endedAt: NOW }))))
    await writeFile(join(cwd, '.study/blocks/zzz-active.json'), JSON.stringify({ ...block, id: 'zzz-active' }))
    const tool = ctx.tools.get('study_status')!
    const status = await tool.execute({}, execution())
    expect(status).toMatchObject({ omittedVersions: 83, learningContext: { data: { activeBlock: { id: 'zzz-active' } } } })
    expect(JSON.stringify(status)).toContain('.study/blocks/zzz-active.json')
    const catalog = await tool.execute({ kind: 'files' }, execution())
    expect(catalog).toMatchObject({ data: { total: 103, items: expect.any(Array), nextOffset: 20 } })
    expect(JSON.stringify(catalog)).not.toContain('questions')
    const worksheet = authoringExample('worksheet') as { items: object[] }
    const question = worksheet.items[0]!
    await writeFile(join(cwd, '.study/worksheets/example.json'), JSON.stringify({ ...worksheet, items: Array.from({ length: 8 }, (_, index) => ({ ...question, id: `q-${index}`, prompt: '题'.repeat(2000), answer: '答'.repeat(2000), explanation: '解'.repeat(2000), answerEvidence: '据'.repeat(2000) })) }))
    const large = await tool.execute({ kind: 'worksheets', id: 'example' }, execution())
    expect(large).toMatchObject({ data: { omitted: true, paths: expect.arrayContaining(['.study/worksheets/example.json']) } })
    const content = [{ type: 'text', text: JSON.stringify(large) }]
    expect(Buffer.byteLength(JSON.stringify(content))).toBeLessThanOrEqual(32768)
  })

  it('returns serializable results through the DSH execution pipeline', async () => {
    const { ctx, execution } = await fixture()
    const callId = 'study-call' as ToolCallId
    const batch = await ctx.tools.execute({
      calls: [{ type: 'tool-call', id: callId, name: 'study_status', arguments: '{}'  }],
      signal: new AbortController().signal,
      agent: execution().agent,
    })
    expect(batch.results).toHaveLength(1)
    const result = batch.results[0]!.result
    expect(result.isError).toBe(false)
    expect(result.content).toEqual([expect.objectContaining({ type: 'text', text: expect.stringContaining('missing') })])
  })

  it('bounds the complete rendered context while retaining recent native input identities and exact omission counts', async () => {
    const { ctx, execution, cwd } = await fixture()
    await ctx.plugin(SessionStore)
    await ctx.plugin(SessionQuery)
    const session = ctx.sessions.create(SessionId('student-session'), { meta: { cwd } })
    for (let index = 0; index < 20; index += 1) {
      const message = { ...createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '题"\\'.repeat(600) }] }), id: `native-${index}` }
      session.append('agent/inbox/spliced', { target: 'next-turn', start: 0, inserted: [message] })
      session.append('turn/start', { turn: index + 1 })
      session.append('agent/inbox/spliced', { target: 'next-turn', start: 0, removedCount: 1, inserted: [] })
      session.append('step/start', { turn: index + 1, step: 1 })
      session.append('user/message', message, { surfaceOp: 'append' })
      session.append('step/end', { turn: index + 1, step: 1 })
      session.append('turn/end', { turn: index + 1, reason: { kind: 'completed' } })
    }
    const status = await ctx.tools.get('study_status')!.execute({}, execution()) as { native: { inputs: { messageId: string }[]; omitted: number; admissions: object[]; omittedAdmissions: number } }
    expect(Buffer.byteLength(JSON.stringify([{ type: 'text', text: JSON.stringify(status) }]))).toBeLessThanOrEqual(32768)
    expect(status.native.inputs.at(-1)?.messageId).toBe('native-19')
    expect(status.native.omitted).toBeGreaterThan(0)
    expect(status.native.inputs.length + status.native.omitted).toBe(20)
    expect(status.native.admissions.length + status.native.omittedAdmissions).toBe(20)
    expect(status.native).not.toHaveProperty('observations')
    expect(await readdir(cwd)).toEqual([])
  })

  it('does not follow a learning directory link outside the workspace', async () => {
    const { ctx, execution, cwd } = await fixture()
    const outside = await mkdtemp(join(tmpdir(), 'dsh-student-outside-'))
    onTestFinished(() => rm(outside, { recursive: true, force: true }))
    await symlink(outside, join(cwd, '.study'))
    await expect(ctx.tools.get('study_status')!.execute({}, execution())).rejects.toThrow('当前工作区内')
    expect(await readdir(outside)).toEqual([])
  })

  it('preserves malformed source bytes and stops cancelled reads', async () => {
    const { ctx, cwd, execution } = await fixture()
    const controller = new AbortController()
    controller.abort()
    await expect(studyStore(execution('study_status', controller.signal))).rejects.toMatchObject({ name: 'AbortError' })
    expect(await readdir(cwd)).toEqual([])
    await mkdir(join(cwd, '.study'))
    await writeFile(join(cwd, '.study/state.json'), '{broken')
    expect(await ctx.tools.get('study_status')!.execute({}, execution())).toMatchObject({ status: 'invalid' })
    await expect(studyStore(execution())).rejects.toThrow()
    expect(await readFile(join(cwd, '.study/state.json'), 'utf8')).toBe('{broken')
  })
})
