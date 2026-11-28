import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies, provideWorkingDirectoryFixture } from '@deepseek-ai/dsh-agent-loop-testkit'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import * as ObservationPolicy from '@deepseek-ai/dsh-fs-observation-policy'
import * as FileTools from '@deepseek-ai/dsh-tool-fs'
import { SessionId } from '@deepseek-ai/dsh-session'
import SessionQuery from '@deepseek-ai/dsh-session-query'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import RemoteAccessService from '@deepseek-ai/dsh-api-remote-access'
import SandboxPolicy from '@deepseek-ai/dsh-sandbox-policy'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { expect, it, onTestFinished } from 'vitest'
import StudentRemote from '../src/remote-service.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { readWorkspace } from '../src/files/read.ts'
import type { ManualSaveRequest } from '../src/files/manual.ts'
import { NOW, setup } from './fixtures.ts'

it('Student native file tools reject unread, stale and concurrently created files', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-observation-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(LocalFileSystem, { cwd })
  provideWorkingDirectoryFixture(ctx)
  const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  if (patch.includes('- id: fs-observation-policy\n  disabled: false')) await ctx.plugin(ObservationPolicy)
  await ctx.plugin(FileTools)
  const { agent } = await ctx.agents.create({ sessionId: SessionId('student-observation'), meta: { cwd } })
  let index = 0
  const call = async (name: string, args: object) => (await ctx.tools.execute({ agent, signal: new AbortController().signal, calls: [{ type: 'tool-call', id: ToolCallId(`observation-${++index}`), name, arguments: JSON.stringify(args) }] })).results[0]!.result
  await writeFile(join(cwd, 'record.json'), 'original')
  expect(await call('write', { file_path: 'record.json', content: 'clobber' })).toMatchObject({ isError: true, error: { info: { code: 'FS_NOT_OBSERVED' } } })
  expect((await call('read', { file_path: 'record.json' })).isError).toBe(false)
  await writeFile(join(cwd, 'record.json'), 'parent edit')
  expect(await call('write', { file_path: 'record.json', content: 'stale agent edit' })).toMatchObject({ isError: true, error: { info: { code: 'FS_STALE_VERSION' } } })
  expect(await readFile(join(cwd, 'record.json'), 'utf8')).toBe('parent edit')
  await call('read', { file_path: 'record.json' })
  expect((await call('edit', { file_path: 'record.json', old_string: 'parent edit', new_string: 'merged edit' })).isError).toBe(false)
  expect(await readFile(join(cwd, 'record.json'), 'utf8')).toBe('merged edit')
  await call('read', { file_path: 'created.json' })
  await writeFile(join(cwd, 'created.json'), 'concurrent creator')
  expect((await call('write', { file_path: 'created.json', content: 'clobber' })).isError).toBe(true)
  expect(await readFile(join(cwd, 'created.json'), 'utf8')).toBe('concurrent creator')
})

it.each(['native Session', 'parent saveManual'] as const)('preserves the winner of a %s edit and permits a native reread and merge', async competitor => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-competing-writers-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(LocalFileSystem, { cwd })
  provideWorkingDirectoryFixture(ctx)
  const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  if (patch.includes('- id: fs-observation-policy\n  disabled: false')) await ctx.plugin(ObservationPolicy)
  await ctx.plugin(FileTools)
  await ctx.plugin(SessionQuery)
  await ctx.plugin(TypertRegistry)
  await ctx.plugin(RemoteAccessService)
  // These cases exercise file observation; the textbook service is not called.
  ctx.provide('studentTextbooks', {} as Context['studentTextbooks'])
  await ctx.plugin(StudentRemote)
  await ctx.plugin(SandboxPolicy, { mode: 'danger-full-access' })
  const first = (await ctx.agents.create({ sessionId: SessionId('student-first'), meta: { cwd } })).agent
  const second = (await ctx.agents.create({ sessionId: SessionId('student-second'), meta: { cwd } })).agent
  const signal = new AbortController().signal
  let index = 0
  const call = async (agent: typeof first, name: string, args: object) => (await ctx.tools.execute({ agent, signal, calls: [{ type: 'tool-call', id: ToolCallId(`competing-${++index}`), name, arguments: JSON.stringify(args) }] })).results[0]!.result
  const path = '.study/settings.json'
  const settings = { format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  await mkdir(join(cwd, '.study'))
  await writeFile(join(cwd, path), JSON.stringify(settings))
  expect((await call(first, 'read', { file_path: path })).isError).toBe(false)
  const winner = { ...settings, revision: 2, profile: { ...settings.profile, nickname: 'Concurrent winner' } }
  if (competitor === 'native Session') {
    expect((await call(second, 'read', { file_path: path })).isError).toBe(false)
    expect((await call(second, 'write', { file_path: path, content: JSON.stringify(winner) })).isError).toBe(false)
  } else {
    const intent: ManualSaveRequest['intent'] = { kind: 'settings', editedProfileFields: ['nickname'], command: { ...setup, profile: winner.profile } }
    const original = await ctx.student.manualContext(second.session.id, intent, signal)
    expect(await ctx.student.saveManual(second.session.id, { termId: original.termId!, expectedVersions: original.versions, baseline: original.baseline, intent }, signal)).toMatchObject({ status: 'saved', current: { 'profile:nickname': 'Concurrent winner' } })
  }
  const winningBytes = await readFile(join(cwd, path), 'utf8')
  expect(await call(first, 'write', { file_path: path, content: JSON.stringify({ ...settings, profile: { ...settings.profile, schoolAlias: 'Native school' } }) })).toMatchObject({ isError: true, error: { info: { code: 'FS_STALE_VERSION' } } })
  expect(await readFile(join(cwd, path), 'utf8')).toBe(winningBytes)
  expect((await call(first, 'read', { file_path: path })).isError).toBe(false)
  const merged = { ...JSON.parse(winningBytes), profile: { ...winner.profile, schoolAlias: 'Native school' } }
  expect((await call(first, 'write', { file_path: path, content: JSON.stringify(merged) })).isError).toBe(false)
  expect(await readWorkspace(nodeStudyFiles(cwd), signal)).toMatchObject({ status: 'valid', workspace: { settings: { profile: { nickname: 'Concurrent winner', schoolAlias: 'Native school' } } } })
  expect(await ctx.student.query(second.session.id, { kind: 'settings' }, signal)).toMatchObject({ status: 'valid', data: { profile: { nickname: 'Concurrent winner', schoolAlias: 'Native school' } } })
})
