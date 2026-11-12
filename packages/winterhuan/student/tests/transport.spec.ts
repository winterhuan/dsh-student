import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionQuery from '@deepseek-ai/dsh-session-query'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import StudentRemote from '../src/remote-service.ts'
import { NOW, setup } from './fixtures.ts'
import type { ManualSaveRequest } from '../src/files/manual.ts'
import type { StudentManualSaveRequest } from '../src/types.ts'
import { applicationStudyFiles } from '../src/files/application.ts'
import { readWorkspace } from '../src/files/read.ts'
import { retainObservedBackups, readBackups } from '../src/files/recovery.ts'
import { StudyBackupRetention } from '../src/files/backup-retention.ts'
import { resolveNativeSources } from '../src/native-source.ts'
import { blockSchema, collectionsSchema } from '../src/files/schema.ts'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller'

async function fixture(maxWireBytes = 1_048_576, child = false) {
  const cwd = await mkdtemp(join(tmpdir(), 'student-transport-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await ctx.plugin(LocalFileSystem, { cwd })
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionQuery)
  await ctx.plugin(TypertRegistry)
  await mkdir(join(cwd, '.study'))
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }))
  const id = SessionId('student-main')
  const session = ctx.sessions.create(id, { meta: { cwd, ...(child ? { origin: 'subagent' as const } : {}) } })
  // This registered lookup is the external native Agent seat; no model is driven by this fixture.
  const agent = { session, ctx: { root: ctx.root, get: (name: string) => name === 'sandboxPolicy' ? { resolve: () => undefined } : ctx.get(name) } } as Agent
  const get = vi.fn((wire: SessionId) => wire === id ? agent : undefined)
  const resolve = vi.fn((wire: SessionId) => wire === id ? agent : undefined)
  ctx.provide('agents', { get } as Context['agents'])
  ctx.typert.lookups.register('agent', { parameter: 'agent', wire: 'agentId', resource: 'session', hostTypeSymbol: '@deepseek-ai/dsh-agent#Agent', wireTypeSymbol: '@deepseek-ai/dsh-session#SessionId', resolve })
  await ctx.plugin(StudentRemote, { refreshIntervalMs: 3000, maxWireBytes })
  return { cwd, ctx, id, agent, get, resolve, signal: new AbortController().signal }
}

it('rejects absent and child Agents without invoking the cold activation lookup', async () => {
  const { ctx, id, get, resolve, signal } = await fixture(1_048_576, true)
  for (const target of [SessionId('absent'), id]) await expect(ctx.student.query(target, { kind: 'dashboard' }, signal)).rejects.toMatchObject({ code: 'student/main-session-required' })
  expect(get.mock.calls.map(([target]) => target)).toEqual(['absent', id])
  expect(resolve).not.toHaveBeenCalled()
})

it('reads paged and filtered notebooks and browsed maps through the resource Remote query', async () => {
  const { ctx, id, cwd, signal } = await fixture()
  const mistakes = Array.from({ length: 21 }, (_, index) => ({ id: `error-${index}`, subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: NOW, userConfirmation: 'Parent checked' }))
  await writeFile(join(cwd, '.study/collections.json'), JSON.stringify(collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes, rewards: [], teachingQueue: [] })))
  const page = await ctx.student.query(id, { kind: 'dashboard', options: { mistakeOffset: 20, subject: 'math', tab: 'mistakes' } }, signal)
  expect(page).toMatchObject({ status: 'valid', data: { study: { confirmedCount: 21, confirmedOffset: 20, confirmedMistakes: [{ id: 'error-0' }] } } })
  expect(await ctx.student.query(id, { kind: 'dashboard', options: { subject: 'math', mistakeStatus: 'mastered' } }, signal)).toMatchObject({ data: { study: { confirmedCount: 0 } } })
  expect(await ctx.student.query(id, { kind: 'dashboard', options: { subject: 'math', mapGrade: 1, mapTerm: 'second', tab: 'map' } }, signal)).toMatchObject({ data: { study: { curriculum: { id: 'math-grade1-second', lite: false, scope: { current: false } } } } })
  expect(await ctx.student.query(id, { kind: 'dashboard', options: { subject: 'math', tab: 'today' } }, signal)).toMatchObject({ data: { study: { curriculum: { lite: true, concepts: [] } } } })
})

it('refreshes due counts through Remote when the Shanghai day changes without file edits', async () => {
  const { ctx, id, cwd, signal } = await fixture()
  const mistake = { id: 'error-one', subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: NOW, userConfirmation: 'Parent checked' }
  await writeFile(join(cwd, '.study/collections.json'), JSON.stringify(collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes: [mistake], rewards: [], teachingQueue: [] })))
  const clock = vi.spyOn(Date, 'now').mockReturnValue(NOW)
  onTestFinished(() => clock.mockRestore())
  const first = await ctx.student.query(id, { kind: 'dashboard', options: { subject: 'math', tab: 'today' } }, signal)
  expect(first).toMatchObject({ data: { study: { dueCount: 0 } } })
  clock.mockReturnValue(NOW + 86_400_000)
  const due = await ctx.student.query(id, { kind: 'dashboard', options: { subject: 'math', tab: 'today' } }, signal)
  expect(due).toMatchObject({ data: { study: { dueCount: 1 } } })
  expect(due.versions).toEqual(first.versions)
})
it('reads validated settings through the registered main Session identity with explicit file versions', async () => {
  const { ctx, id, signal } = await fixture()
  const result = await ctx.student.query(id, { kind: 'settings' }, signal)
  expect(result).toMatchObject({ status: 'valid', data: { termId: 'term-1', profile: setup.profile }, native: { status: 'available', cut: { sessionId: id, cursor: -1 } } })
  expect(result.versions).toEqual([expect.objectContaining({ path: '.study/settings.json', targetKey: expect.any(String), version: expect.any(String) })])
  expect(JSON.stringify(result)).not.toContain('"bytes"')
  await expect(ctx.student.query(SessionId('unregistered'), { kind: 'settings' }, signal)).rejects.toMatchObject({ code: 'student/main-session-required' })
})
it('inspects uncertain native admission without treating it as a saved answer or sending again', async () => {
  const { ctx, id, agent, signal } = await fixture()
  const message = createUserMessage({ source: { kind: 'user', rpcId: 'pending-request' as SessionRequestId }, content: [{ type: 'text', text: 'My answer' }] })
  agent.session.append('agent/inbox/spliced', { target: 'next-turn', start: 0, inserted: [message] })
  expect(await ctx.student.inspectSubmission(id, { requestId: 'pending-request' }, signal)).toMatchObject({ admission: 'accepted', nativeStates: ['pending'], answer: 'not-requested', assessment: 'not-requested' })
  expect(await ctx.student.inspectSubmission(id, { requestId: 'unknown-request' }, signal)).toMatchObject({ admission: 'unknown', nativeStates: [] })
})
it('serializes concurrent retention of distinct observed versions and retains at most three per entity', async () => {
  const { agent, signal, cwd } = await fixture()
  const fs = applicationStudyFiles({ agent, signal })
  const reads = []
  for (const nickname of ['one', 'two', 'three', 'four']) {
    await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: { ...setup.profile, nickname }, materials: [], courses: [] }))
    reads.push(await readWorkspace(fs, signal))
    if (reads.length <= 2) await retainObservedBackups(fs, reads.at(-1)!, NOW + reads.length, signal)
  }
  const names = new Set((await fs.list('.study/backups', signal)).map(entry => entry.name))
  const entered = Promise.withResolvers<void>()
  const release = Promise.withResolvers<void>()
  onTestFinished(() => release.resolve())
  let captured = false
  // Atomic directory snapshots are the filesystem boundary; both callers see the same initial set without the owner.
  const raceFs = { ...fs, list(path: string, signal: AbortSignal) {
    if (path !== '.study/backups') return fs.list(path, signal)
    const entries = [...names].map(name => ({ name, type: 'file' as const }))
    if (!captured) { captured = true; entered.resolve(); return release.promise.then(() => entries) }
    return Promise.resolve(entries)
  }, async write(...args: Parameters<NonNullable<typeof fs.write>>) { const result = await fs.write!(...args); names.add(args[0].split('/').at(-1)!); return result }, async remove(...args: Parameters<NonNullable<typeof fs.remove>>) { await fs.remove!(...args); names.delete(args[0].split('/').at(-1)!) } }
  const first = retainObservedBackups(raceFs, reads[2]!, NOW + 3, signal)
  await entered.promise
  const second = retainObservedBackups(raceFs, reads[3]!, NOW + 4, signal)
  release.resolve()
  await Promise.all([first, second])
  expect((await readBackups(fs, signal)).backups).toHaveLength(3)
})
it('cancels queued retention without bypassing predecessors and awaits in-flight teardown', async () => {
  const ctx = new Context()
  const owner = new StudyBackupRetention(ctx)
  const entered = Promise.withResolvers<void>()
  const aborted = Promise.withResolvers<void>()
  const release = Promise.withResolvers<void>()
  onTestFinished(async () => { release.resolve(); await ctx.fiber.dispose() })
  const first = owner.run('settings-target', async signal => { signal.addEventListener('abort', () => aborted.resolve(), { once: true }); entered.resolve(); await release.promise; return 'settled' }, new AbortController().signal)
  await entered.promise
  const queuedAbort = new AbortController()
  let queuedStarted = false
  const queued = owner.run('settings-target', async () => { queuedStarted = true; return 'queued' }, queuedAbort.signal)
  queuedAbort.abort(new Error('Draft closed'))
  await expect(queued).rejects.toThrow('Draft closed')
  let disposed = false
  const closing = ctx.fiber.dispose().then(() => { disposed = true })
  await aborted.promise
  expect(disposed).toBe(false)
  release.resolve()
  await expect(first).rejects.toMatchObject({ name: 'AbortError' })
  await closing
  expect(queuedStarted).toBe(false)
})
it('captures the actual edited-field baseline and rejects old-term or competing manual drafts', async () => {
  const { ctx, id, signal, cwd } = await fixture()
  const intent: ManualSaveRequest['intent'] = { kind: 'settings', editedProfileFields: ['nickname'], command: { ...setup, profile: { ...setup.profile, nickname: 'Draft' } } }
  const original = await ctx.student.manualContext(id, intent, signal)
  expect(original.baseline).toEqual({ 'profile:nickname': setup.profile.nickname })
  const request: StudentManualSaveRequest = { termId: original.termId!, expectedVersions: original.versions, baseline: original.baseline, intent }
  expect(await ctx.student.saveManual(id, request, signal)).toMatchObject({ status: 'saved', termId: original.termId, current: { 'profile:nickname': 'Draft' } })
  expect(await ctx.student.saveManual(id, request, signal)).toMatchObject({ status: 'conflict', current: { 'profile:nickname': 'Draft' } })
  const current = await ctx.student.query(id, { kind: 'settings' }, signal)
  const settings = current.data as { termId: string }
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ ...settings, termId: 'term-2' }))
  expect(await ctx.student.saveManual(id, request, signal)).toMatchObject({ status: 'old-term', termId: 'term-2' })
  expect(JSON.stringify(original)).not.toContain('"bytes"')
})
it('follows changed file versions, exposes invalid current reads and settles cancellation', async () => {
  const { ctx, id, cwd } = await fixture()
  const abort = new AbortController()
  const iterator = ctx.student.watch(id, { kind: 'settings' }, abort.signal)[Symbol.asyncIterator]()
  onTestFinished(async () => { abort.abort(); await iterator.return?.() })
  const first = await iterator.next()
  expect(first.value).toMatchObject({ kind: 'snapshot', value: { status: 'valid' } })
  await writeFile(join(cwd, '.study/settings.json'), '{invalid')
  expect((await iterator.next()).value).toMatchObject({ kind: 'snapshot', value: { status: 'invalid', data: null } })
  abort.abort()
  expect(await iterator.next()).toEqual({ done: true, value: undefined })
})

it('caps complete request and response JSON before an oversized manual draft can change files', async () => {
  const { ctx, id, cwd, signal } = await fixture(1024)
  const intent: ManualSaveRequest['intent'] = { kind: 'settings', editedProfileFields: ['nickname'], command: { ...setup, profile: { ...setup.profile, nickname: 'x'.repeat(1900) } } }
  const original = await readFile(join(cwd, '.study/settings.json'), 'utf8')
  const smallIntent = { ...intent, command: setup }
  const context = await ctx.student.manualContext(id, smallIntent, signal)
  await expect(ctx.student.manualContext(id, intent, signal)).rejects.toMatchObject({ code: 'gateway/bad-request' })
  await expect(ctx.student.saveManual(id, { termId: context.termId!, expectedVersions: context.versions, baseline: context.baseline, intent }, signal)).rejects.toMatchObject({ code: 'gateway/bad-request' })
  expect(await readFile(join(cwd, '.study/settings.json'), 'utf8')).toBe(original)
  await expect(ctx.student.inspectSubmission(id, { requestId: 'x'.repeat(1900) }, signal)).rejects.toMatchObject({ code: 'gateway/bad-request' })
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ ...JSON.parse(original), profile: intent.command.profile }))
  await expect(ctx.student.query(id, { kind: 'settings' }, signal)).rejects.toMatchObject({ code: 'gateway/bad-request' })
  await expect(ctx.student.manualContext(id, smallIntent, signal)).rejects.toMatchObject({ code: 'gateway/bad-request' })
})

it('retains an earlier Session answer while its receipt stays pending outside the calling Session scope', async () => {
  const { ctx, id, cwd, signal } = await fixture()
  const prior = ctx.sessions.create(SessionId('earlier-main'))
  const message = createUserMessage({ source: { kind: 'user', rpcId: 'prior-request' as SessionRequestId }, content: [{ type: 'text', text: '15' }] })
  prior.append('agent/inbox/spliced', { target: 'next-turn', start: 0, inserted: [message] })
  prior.append('turn/start', { turn: 1 })
  prior.append('agent/inbox/spliced', { target: 'next-turn', start: 0, removedCount: 1, inserted: [] })
  prior.append('step/start', { turn: 1, step: 1 })
  prior.append('user/message', message, { surfaceOp: 'append' })
  using observation = await ctx.sessionQuery.observeSession(prior.id, { signal, projectionMode: 'none' })
  const native = resolveNativeSources(observation).observations[0]!
  expect(native.receiptAt).toEqual(expect.any(Number))
  const block = blockSchema.parse({ format: 2, kind: 'block', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW,
    context: { profile: setup.profile, scope: { grade: 2, term: 'first', objectiveIds: ['m2a-o-sub'] } }, currentQuestionId: 'q1',
    questions: [{ id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original practice' }, topic: 'Addition', prompt: '8 + 7?', answer: '15', explanation: 'Make ten', answerEvidence: '8 + 2 + 5 = 15', phase: 'try' }],
    responses: [{ id: 'r1', questionId: 'q1', rawResponse: '15', assistance: 'independent', source: { kind: 'native', sessionId: native.sessionId, messageId: native.messageId, inputVersion: native.inputVersion, receiptAt: native.receiptAt }, answerDate: { kind: 'instant', at: native.receiptAt, basis: 'native-input', sourceVersion: native.inputVersion } }],
    assessments: [{ id: 'a1', responseId: 'r1', result: 'correct', assistance: 'independent', feedback: 'Correct', answerEvidence: 'Verified', assessedAt: NOW }], hints: [] })
  await mkdir(join(cwd, '.study/blocks'))
  const path = join(cwd, '.study/blocks/block-1.json')
  await writeFile(path, JSON.stringify(block))
  const original = await readFile(path, 'utf8')
  const response = { termId: block.termId, owner: { kind: 'block' as const, id: block.id }, responseId: block.responses[0]!.id }
  expect(await ctx.student.inspectSubmission(id, { requestId: 'prior-request', response }, signal)).toMatchObject({ admission: 'unknown', answer: 'saved', assessment: 'valid' })
  const learning = await ctx.student.query(id, { kind: 'learning-context' }, signal)
  expect(learning).toMatchObject({ native: { cut: { sessionId: id }, inputs: [] }, data: { responses: [{ rawResponse: '15', answerDate: { kind: 'unknown' } }], pendingFacts: [{ responseId: 'r1', fields: ['answerDate', 'source'] }] } })
  expect(await ctx.student.query(id, { kind: 'summary' }, signal)).toMatchObject({ data: { practisedGoals: 0, masteredGoals: 0 } })
  expect(await readFile(path, 'utf8')).toBe(original)
  block.assessments[0]!.responseId = 'absent' as typeof block.responses[0]['id']
  await writeFile(path, JSON.stringify(block))
  expect(await ctx.student.inspectSubmission(id, { requestId: 'prior-request', response }, signal)).toMatchObject({ answer: 'unavailable', assessment: 'unavailable' })
})
