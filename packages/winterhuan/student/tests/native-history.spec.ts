import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionQuery from '@deepseek-ai/dsh-session-query'
import * as JsonlPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, it, onTestFinished, vi } from 'vitest'
import { resolveNativeSources } from '../src/native-source.ts'
import { readNativeHistory } from '../src/native-history.ts'
import { validateStudyFiles } from '../src/files/validation.ts'
import type { WorkspaceRead } from '../src/files/read.ts'
import { NOW, setup } from './fixtures.ts'

async function fixture(foreign = false, scoped = true) {
  const root = await mkdtemp(join(tmpdir(), 'student-original-history-'))
  const cwd = join(root, 'workspace'), ctx = new Context(), seed = new Context()
  onTestFinished(async () => { await seed.fiber.dispose(); await ctx.fiber.dispose(); await rm(root, { recursive: true, force: true }) })
  await mkdir(cwd); await mkdir(join(root, 'foreign'))
  await seed.plugin(SessionStore); await seed.plugin(SessionQuery)
  const original = seed.sessions.create(SessionId('original-main'), { meta: { cwd: foreign ? join(root, 'foreign') : cwd } })
  const scope = { learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', questionId: 'q1', responseId: 'r1' }
  const rawResponse = scoped ? `Student intention:\n${JSON.stringify(scope)}\n15` : '15'
  const message = createUserMessage({ source: { kind: 'user', rpcId: 'original-request' as SessionRequestId }, content: [{ type: 'text', text: rawResponse }] })
  original.append('agent/inbox/spliced', { target: 'next-turn', start: 0, inserted: [message] })
  original.append('turn/start', { turn: 1 })
  original.append('agent/inbox/spliced', { target: 'next-turn', start: 0, removedCount: 1, inserted: [] })
  original.append('step/start', { turn: 1, step: 1 })
  original.append('user/message', message, { surfaceOp: 'append' })
  using observed = await seed.sessionQuery.observeSession(original.id, { signal: new AbortController().signal, projectionMode: 'none' })
  const source = resolveNativeSources(observed).observations[0]!
  await ctx.plugin(LocalFileSystem, { cwd }); await ctx.plugin(SessionStore)
  await ctx.plugin(JsonlPersistence, { root: join(root, 'history'), compression: 'zstd' })
  const handle = await ctx.sessionPersistence.create(original.header)
  try { await handle.append(observed.events); await handle.flush() } finally { await handle.close() }
  await ctx.plugin(SessionQuery)
  expect(ctx.sessions.get(original.id)).toBeUndefined()
  const stored = await ctx.sessionPersistence.stat(original.id)
  expect(stored?.sizeBytes).toBeGreaterThan(0)
  expect(stored?.eventCount).toBeUndefined()
  const current = ctx.sessions.create(SessionId('current-main'), { meta: { cwd } })
  const agent = { ctx, session: current } as Agent
  const parsed = validateStudyFiles([
    { path: '.study/settings.json', value: { format: 2, kind: 'term-settings', learnerId: 'child-1', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] } },
    { path: '.study/blocks/block-1.json', value: { format: 2, kind: 'block', learnerId: 'child-1', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, questions: [{ id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original question' }, topic: 'Math', prompt: '18 − 3?', answer: '15', explanation: 'Subtract three', answerEvidence: '15 + 3 = 18' }], responses: [{ id: 'r1', questionId: 'q1', rawResponse, assistance: 'unknown', source: { kind: 'native', sessionId: source.sessionId, messageId: source.messageId, inputVersion: source.inputVersion, receiptAt: source.receiptAt } }], hints: [], assessments: [] } },
  ])
  expect(parsed.valid).toBe(true)
  const read: WorkspaceRead = { status: 'valid', files: [], membership: [], issues: [], workspace: parsed.workspace! }
  return { ctx, agent, source, read, signal: new AbortController().signal }
}
it('accepts bounded cold compressed public history without optional event counts and rechecks revocation before publication', async () => {
  const f = await fixture()
  let permitted = true
  const invocation = new Context()
  onTestFinished(() => invocation.fiber.dispose())
  const allows = vi.fn(async () => permitted)
  invocation.provide('remoteAccess', { allows } as Context['remoteAccess'])
  const read = await readNativeHistory(f.agent, f.read, f.signal, invocation)
  expect(read.observations).toEqual([f.source])
  expect(read.verification).toMatchObject([{ status: 'available' }])
  permitted = false
  await read.recheck()
  expect(read.observations).toEqual([])
  expect(read.verification).toMatchObject([{ status: 'unavailable' }])
})
it('does not read a denied original Session or trust foreign and unscoped history', async () => {
  const denied = await fixture()
  const invocation = new Context()
  onTestFinished(() => invocation.fiber.dispose())
  invocation.provide('remoteAccess', { allows: async () => false } as Context['remoteAccess'])
  const observe = vi.spyOn(denied.ctx.sessionQuery, 'observeSession')
  expect(await readNativeHistory(denied.agent, denied.read, denied.signal, invocation)).toMatchObject({ observations: [], verification: [{ status: 'unavailable' }] })
  expect(observe).not.toHaveBeenCalled()
  const foreign = await fixture(true)
  expect(await readNativeHistory(foreign.agent, foreign.read, foreign.signal)).toMatchObject({ observations: [], verification: [{ status: 'unavailable' }] })
  const ambiguous = await fixture(false, false)
  expect(await readNativeHistory(ambiguous.agent, ambiguous.read, ambiguous.signal)).toMatchObject({ observations: [], verification: [{ status: 'available' }] })
})
