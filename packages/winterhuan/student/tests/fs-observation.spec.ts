import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies, provideWorkingDirectoryFixture } from '@deepseek-ai/dsh-agent-loop-testkit'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import * as ObservationPolicy from '@deepseek-ai/dsh-fs-observation-policy'
import * as FileTools from '@deepseek-ai/dsh-tool-fs'
import { SessionId } from '@deepseek-ai/dsh-session'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { expect, it, onTestFinished } from 'vitest'

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
