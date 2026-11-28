import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionQuery from '@deepseek-ai/dsh-session-query'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import RemoteAccessService from '@deepseek-ai/dsh-api-remote-access'
import TypertGatewayService from '@deepseek-ai/dsh-api-gateway'
import { Peer } from '@deepseek-ai/dsh-client-connection'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import StudentRemote from '../src/remote-service.ts'
import { NOW, setup, updateStudy, mistake, confirm, material, course } from './fixtures.ts'
import type { ManualSaveRequest } from '../src/files/manual.ts'
import type { StudentManualSaveRequest } from '../src/types.ts'
import ToolRuntime, { type ToolRunContext } from '@deepseek-ai/dsh-tools'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import { registerOpenmaicFeedback } from '../src/openmaic/feedback-agent.ts'
import type { OpenmaicFeedbackRead } from '../src/openmaic/feedback.ts'
import { OpenmaicError } from '../src/openmaic/connection.ts'
import { applicationStudyFiles } from '../src/files/application.ts'
import { readStudentWorkspace } from '../src/transport.ts'
import { readWorkspace } from '../src/files/read.ts'
import { retainObservedBackups, readBackups } from '../src/files/recovery.ts'
import { StudyBackupRetention } from '../src/files/backup-retention.ts'
import { resolveNativeSources } from '../src/native-source.ts'
import { blockSchema, collectionsSchema, termSettingsSchema } from '../src/files/schema.ts'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller'

async function fixture(maxWireBytes = 1_048_576, child = false, refreshIntervalMs = 3000) {
  const cwd = await mkdtemp(join(tmpdir(), 'student-transport-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await ctx.plugin(LocalFileSystem, { cwd })
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionQuery)
  await ctx.plugin(TypertRegistry)
  await ctx.plugin(RemoteAccessService)
  await ctx.plugin(TypertGatewayService)
  await mkdir(join(cwd, '.study'))
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }))
  const id = SessionId('student-main')
  const session = ctx.sessions.create(id, { meta: { cwd, ...(child ? { origin: 'subagent' as const } : {}) } })
  // This registered lookup is the external native Agent seat; no model is driven by this fixture.
  const agent = { session, ctx: { root: ctx.root, get: (name: string) => name === 'sandboxPolicy' ? { resolve: () => undefined } : ctx.get(name) } } as Agent
  const get = vi.fn((wire: SessionId) => wire === id ? agent : undefined)
  const resolve = vi.fn((wire: SessionId) => wire === id ? agent : undefined)
  ctx.provide('agents', { get } as Context['agents'])
  ctx.provide('studentTextbooks', { command: vi.fn(async () => ({ books: [] })) } as Context['studentTextbooks'])
  ctx.typert.lookups.register('agent', { parameter: 'agent', wire: 'agentId', resource: 'session', hostTypeSymbol: '@deepseek-ai/dsh-agent#Agent', wireTypeSymbol: '@deepseek-ai/dsh-session#SessionId', resolve })
  await ctx.plugin(StudentRemote, { refreshIntervalMs, maxWireBytes })
  return { cwd, ctx, id, agent, get, resolve, signal: new AbortController().signal }
}

it('rejects absent and child Agents without invoking the cold activation lookup', async () => {
  const { ctx, id, get, resolve, signal } = await fixture(1_048_576, true)
  for (const target of [SessionId('absent'), id]) await expect(ctx.student.query(target, { kind: 'dashboard' }, signal)).rejects.toMatchObject({ code: 'student/main-session-required' })
  expect(get.mock.calls.map(([target]) => target)).toEqual(['absent', id])
  expect(resolve).not.toHaveBeenCalled()
})

it('keeps a cold main Session watch alive until native admission registers its Agent', async () => {
  const { ctx, id, agent, get, resolve } = await fixture(1_048_576, false, 1)
  get.mockReturnValue(undefined)
  const abort = new AbortController()
  const iterator = ctx.student.watch(id, { kind: 'dashboard' }, abort.signal)[Symbol.asyncIterator]()
  onTestFinished(async () => { abort.abort(); await iterator.return?.() })
  expect((await iterator.next()).value).toMatchObject({ kind: 'failure', reason: 'main-session-required' })
  expect(resolve).not.toHaveBeenCalled()
  get.mockReturnValue(agent)
  expect((await iterator.next()).value).toMatchObject({ kind: 'snapshot', value: { status: 'valid', data: { study: { profile: setup.profile } } } })
  abort.abort()
  expect(await iterator.next()).toEqual({ done: true, value: undefined })
})

it('independently reads valid files through the real Remote invocation context', async () => {
  const { ctx, id } = await fixture()
  const peer = new Peer(ctx.root, { principal: { kind: 'owner' } })
  await expect(ctx.typertGateway.invoke({ peer, namespace: 'student', method: 'query', args: { sessionId: id, request: { kind: 'dashboard' } } })).resolves.toMatchObject({ status: 'valid', data: { study: { profile: setup.profile } } })
})

it('invokes textbook commands through the authorized Remote service context', async () => {
  const { ctx, id, agent } = await fixture()
  const peer = new Peer(ctx.root, { principal: { kind: 'owner' } })
  await expect(ctx.typertGateway.invoke({ peer, namespace: 'student', method: 'textbooks', args: { sessionId: id, request: { action: 'list' } } })).resolves.toEqual({ books: [] })
  expect(ctx.studentTextbooks.command).toHaveBeenCalledWith(agent, { action: 'list' })
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

it('preserves visible legacy learning records and separate lessons without rewriting the source', async () => {
  const f = await fixture()
  await rm(join(f.cwd, '.study/settings.json'))
  let state = updateStudy(undefined, setup, NOW)
  for (const command of [{ action: 'material' as const, material }, { action: 'course' as const, course }, { action: 'mistake' as const, mistake }, confirm]) state = updateStudy(state, command, NOW)
  state.worksheets.push({ id: 'old-sheet', subject: 'math', createdAt: NOW, items: [{ id: 'old-question', prompt: '8 + 7?', answer: '15', explanation: 'Make ten', answerEvidence: '8 + 2 + 5 = 15' }] })
  state.openmaic = { baseUrl: 'http://localhost:3456', parentConfirmation: 'The parent confirmed this classroom address.' }
  const bytes = JSON.stringify(state)
  await writeFile(join(f.cwd, '.study/state.json'), bytes)
  await writeFile(join(f.cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons: [{ id: 'old-lesson', subject: 'math', objectiveId: 'm2a-o-sub', status: 'ready', title: 'Saved lesson', requirement: 'Review subtraction', classroomId: 'old-classroom', base: 'http://localhost:3456', createdAt: new Date(NOW).toISOString(), updatedAt: new Date(NOW).toISOString() }] }))
  const view = await f.ctx.student.query(f.id, { kind: 'dashboard', options: { tab: 'mistakes', subject: 'math' } }, f.signal)
  expect(view).toMatchObject({ status: 'legacy', data: { study: { profile: setup.profile, courses: [course], confirmedCount: 1, confirmedMistakes: [{ id: mistake.id }], worksheets: [{ id: 'old-sheet', items: [{ id: 'old-question' }] }] }, interactiveLessons: { baseUrl: 'http://localhost:3456', lessons: [{ id: 'old-lesson' }] } } })
  expect(await readFile(join(f.cwd, '.study/state.json'), 'utf8')).toBe(bytes)
  await expect(readFile(join(f.cwd, '.study/settings.json'))).rejects.toMatchObject({ code: 'ENOENT' })
})

it('rereads files changed during the final official source authorization before publishing a projection', async () => {
  const f = await fixture()
  const settingsPath = join(f.cwd, '.study/settings.json')
  const settings = { ...termSettingsSchema.parse(JSON.parse(await readFile(settingsPath, 'utf8'))), learnerId: 'child-1' }
  await writeFile(settingsPath, JSON.stringify(settings))
  await mkdir(join(f.cwd, '.study/blocks'))
  await writeFile(join(f.cwd, '.study/blocks/block-1.json'), JSON.stringify({ format: 2, kind: 'block', learnerId: 'child-1', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, questions: [], responses: [], hints: [], assessments: [] }))
  const binding = { bindingId: 'binding-1', learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', goalId: 'm.sub', familyId: 'math.sub-basic', scope: { id: 'within20', description: 'Written subtraction within20', modality: 'written', numberMax: 20 } }
  await writeFile(join(f.cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons: [{ id: 'lesson-1', learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', learnerKey: 'user:fixture-parent', classroomId: 'stage-1', base: 'https://classroom.test', status: 'ready', title: 'Original classroom', requirement: 'Subtraction within20', createdAt: new Date(NOW).toISOString(), updatedAt: new Date(NOW).toISOString(), feedback: binding }] }))
  let sourceReads = 0
  const reader = {
    async read() { sourceReads++; return { revision: 'fixture-cut', observations: [], pending: [], drafts: 0, omitted: 0, checkpoint: { bindingId: binding.bindingId, attempts: [] } } },
    async verify() { if (sourceReads === 1) await writeFile(settingsPath, JSON.stringify({ ...settings, profile: { ...settings.profile, nickname: 'Changed during authorization' } })); return true },
  }
  f.ctx.provide('studentOpenmaic', { feedback: () => reader } as Context['studentOpenmaic'])
  const result = await f.ctx.student.query(f.id, { kind: 'settings' }, f.signal)
  expect(sourceReads).toBe(2)
  expect(result).toMatchObject({ status: 'valid', data: { profile: { nickname: 'Changed during authorization' } } })
  expect(await f.ctx.student.query(f.id, { kind: 'learning-context' }, f.signal)).toMatchObject({ data: { sourceVerification: { openmaic: [{ learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', consumption: 'accepted', pendingCount: 0, conflictCount: 0 }] } } })
})

it('exposes complete source, unavailable source and an oversized original event distinctly through the native tool', async () => {
  const f = await fixture()
  const settingsPath = join(f.cwd, '.study/settings.json')
  await writeFile(settingsPath, JSON.stringify({ ...JSON.parse(await readFile(settingsPath, 'utf8')), learnerId: 'child-1' }))
  await mkdir(join(f.cwd, '.study/blocks'))
  await writeFile(join(f.cwd, '.study/blocks/block-1.json'), JSON.stringify({ format: 2, kind: 'block', learnerId: 'child-1', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, questions: [], responses: [], hints: [], assessments: [] }))
  const binding = { bindingId: 'binding-1', learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', goalId: 'm.sub', familyId: 'math.sub-basic', scope: { id: 'within20', description: 'Written subtraction within20', modality: 'written' as const, numberMax: 20 } }
  await writeFile(join(f.cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons: [{ id: 'lesson-1', learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', learnerKey: 'user:fixture-parent', classroomId: 'stage-1', base: 'https://classroom.test', status: 'ready', title: 'Original classroom', requirement: 'Subtraction within20', createdAt: new Date(NOW).toISOString(), updatedAt: new Date(NOW).toISOString(), feedback: binding, checkpoint: { bindingId: binding.bindingId, attempts: [{ attemptId: 'attempt-1', seq: 999 }] } }] }))
  const source: OpenmaicFeedbackRead = { revision: 'original-cut', observations: [], pending: [], drafts: 0, omitted: 0, checkpoint: { bindingId: binding.bindingId, attempts: [] } }
  let mode: 'complete' | 'failure' | 'changing' = 'complete'
  f.ctx.provide('studentOpenmaic', { feedback: () => ({ async read() { if (mode === 'failure') throw new OpenmaicError('unsupported-version'); return structuredClone(source) }, async verify() { return mode !== 'changing' } }) } as Context['studentOpenmaic'])
  await f.ctx.plugin(SystemPrompt)
  await f.ctx.plugin(ToolRuntime)
  registerOpenmaicFeedback(f.ctx)
  const callId = 'native-source' as ToolRunContext['callId']
  const execution: ToolRunContext = { agent: f.agent, signal: f.signal, callId, rootCallId: callId, name: 'openmaic_feedback', arguments: {}, token: Symbol('feedback') as ToolRunContext['token'], deferContext() {}, concludeTurn() {} }
  const read = () => f.ctx.tools.get('openmaic_feedback')!.execute({ action: 'read', lessonId: 'lesson-1' }, execution)
  expect(await read()).toMatchObject({ status: 'available', complete: true, total: 0, nextOffset: null, consumption: { status: 'accepted', checkpoint: { attempts: [] } } })
  mode = 'failure'
  expect(await read()).toMatchObject({ status: 'unavailable', failure: 'unsupported-version', complete: false, total: null, drafts: null })
  mode = 'changing'
  expect(await read()).toMatchObject({ status: 'unavailable', failure: 'incomplete-read', complete: false, total: null })
  mode = 'complete'
  source.pending = [{ binding, reason: 'missing-submission', record: { id: 'review-only', sessionId: 'attempt-1', seq: 0, sceneId: 'scene-1', createdAt: new Date(NOW).toISOString(), payload: { payloadVersion: 1, phase: 'reviewed', answers: { q1: 'A' } }, originalExtension: 'x'.repeat(40_000) } }]
  source.checkpoint.attempts = [{ attemptId: 'attempt-1', seq: 0 }]
  const oversized = await read()
  expect(oversized).toMatchObject({ status: 'unavailable', failure: 'read-limit', complete: false, records: [], nextOffset: 0, omitted: 1 })
  expect(oversized).not.toHaveProperty('consumption')
  source.pending[0]!.record.originalExtension = 'retained'
  expect(await read()).toMatchObject({ status: 'available', complete: true, records: [{ pendingOpenmaic: source.pending[0] }], consumption: { status: 'pending', checkpoint: { attempts: [{ seq: 0 }] } } })
  const path = join(f.cwd, '.study/openmaic-lessons.json')
  const lessons = JSON.parse(await readFile(path, 'utf8'))
  lessons.lessons[0].quality = { status: 'passed', checkedAt: NOW, contentHash: 'a'.repeat(64), stages: Object.fromEntries(['introduction', 'explanation', 'demonstration', 'guidedPractice', 'independentPractice', 'summary'].map(stage => [stage, 'scene-1'])), questions: [{ sceneId: 'scene-1', questionId: 'q1', purpose: 'guided', rationale: 'Answer is demonstrated first' }], scopeChecked: true, criterionChecked: true, notes: 'A worked example, never independent evidence' }
  await writeFile(path, JSON.stringify(lessons))
  source.observations = [{ binding, questionId: 'q1', responseId: 'r1', question: { bindingId: binding.bindingId, sceneId: 'scene-1', questionId: 'q1', snapshot: { id: 'q1', type: 'short_answer', question: '2 - 1?', answer: '1', analysis: 'Subtract one' }, snapshotHash: 'b'.repeat(64), revision: { kind: 'unavailable' } }, source: { kind: 'openmaic', bindingId: binding.bindingId, attemptId: 'attempt-1', sceneId: 'scene-1', questionId: 'q1', submission: { id: 'submitted-1', seq: 0, createdAt: new Date(NOW).toISOString() }, submittedAnswer: '1' }, result: 'correct', grading: 'equivalent', sourceStatus: 'known' }]
  expect(await read()).toMatchObject({ records: [expect.objectContaining({ answerExposure: 'possible' }), expect.anything()] })

})


it.each(['current', 'selected'] as const)('reaches the ninth %s classroom within eight authorized reads', async mode => {
  const f = await fixture()
  const settingsPath = join(f.cwd, '.study/settings.json')
  await writeFile(settingsPath, JSON.stringify({ ...JSON.parse(await readFile(settingsPath, 'utf8')), learnerId: 'child-1' }))
  await mkdir(join(f.cwd, '.study/blocks'))
  const lessons = []
  for (let i = 0; i < 9; i++) {
    const blockId = `block-${i}`
    await writeFile(join(f.cwd, `.study/blocks/${blockId}.json`), JSON.stringify({ format: 2, kind: 'block', learnerId: 'child-1', termId: 'term-1', id: blockId, subject: 'math', mode: 'foundation', startedAt: NOW, ...(i === (mode === 'current' ? 8 : 0) ? {} : { endedAt: NOW + 1 }), context: { profile: setup.profile }, questions: [], responses: [], hints: [], assessments: [] }))
    lessons.push({ id: `lesson-${i}`, learnerId: 'child-1', termId: 'term-1', blockId, learnerKey: 'user:fixture-parent', classroomId: `stage-${i}`, base: 'https://classroom.test', status: 'ready', title: 'Original classroom', requirement: 'Subtraction within20', createdAt: new Date(NOW).toISOString(), updatedAt: new Date(NOW).toISOString(), feedback: { bindingId: `binding-${i}`, learnerId: 'child-1', termId: 'term-1', blockId, goalId: 'm.sub', familyId: 'math.sub-basic', scope: { id: 'within20', description: 'Written subtraction within20', modality: 'written', numberMax: 20 } } })
  }
  await writeFile(join(f.cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons }))
  const requested: string[] = []
  f.ctx.provide('studentOpenmaic', { feedback: () => ({ async read(owner: { classroomId: string }, binding: { bindingId: string }) { requested.push(owner.classroomId); return { revision: 'cut', observations: [], pending: [], drafts: 0, omitted: 0, checkpoint: { bindingId: binding.bindingId, attempts: [] } } }, async verify() { return true } }) } as Context['studentOpenmaic'])
  if (mode === 'selected') {
    await f.ctx.plugin(SystemPrompt); await f.ctx.plugin(ToolRuntime); registerOpenmaicFeedback(f.ctx)
    const callId = 'ninth-classroom' as ToolRunContext['callId']
    const execution: ToolRunContext = { agent: f.agent, signal: f.signal, callId, rootCallId: callId, name: 'openmaic_feedback', arguments: {}, token: Symbol('feedback') as ToolRunContext['token'], deferContext() {}, concludeTurn() {} }
    expect(await f.ctx.tools.get('openmaic_feedback')!.execute({ action: 'read', lessonId: 'lesson-8' }, execution)).toMatchObject({ status: 'available', complete: true, consumption: { status: 'accepted' } })
  } else {
    const result = await readStudentWorkspace({ agent: f.agent, signal: f.signal })
    expect(result.openmaic.find(fact => fact.lessonId === 'lesson-8')).toMatchObject({ status: 'available', consumption: { status: 'accepted' } })
    expect(result.openmaic.filter(fact => fact.failure === 'read-limit')).toHaveLength(1)
  }
  expect(requested).toHaveLength(8)
  expect(requested[0]).toBe('stage-8')
})

it('reauthenticates archived official review from its archived-only classroom log', async () => {
  const { OpenmaicConnection } = await import('../src/openmaic/connection.ts')
  const { OpenmaicFeedback } = await import('../src/openmaic/feedback.ts')
  const { openmaicAcademicQuestion } = await import('../src/openmaic/feedback-consumer.ts')
  const { queryWorkspace } = await import('../src/learning/queries.ts')
  const f = await fixture()
  const days = ['2026-10-01', '2026-10-08', '2026-10-24']
  const questions = days.map((_day, i) => ({ id: `official-${i}`, type: 'single', question: '18 - 3?', options: [{ value: 'A', label: '15' }, { value: 'B', label: '16' }], answer: ['A'], analysis: 'Subtract three.' }))
  const owner = { learnerId: 'child-1', termId: 'old-term', blockId: 'original', classroomId: 'stage-1', base: 'https://classroom.test', learnerKey: 'user:parent' }
  const scope = { id: 'within20', description: 'Written subtraction within twenty', modality: 'written' as const, numberMax: 20 }
  const target = { goalId: 'm.sub', familyId: 'math.sub-basic', scope }
  const captures = new Map<string, unknown>()
  let submitted = false, revoked = false
  const sessions = days.map((day, i) => ({ id: `attempt-${i}`, runtimeDslVersion: '0.1.0', kind: 'quizAttempt', stageId: 'stage-1', learnerKey: owner.learnerKey, status: 'completed', createdAt: `${day}T01:00:00Z`, updatedAt: `${day}T01:00:00Z` }))
  const connection = new OpenmaicConnection({ baseUrl: owner.base, accountBaseUrl: 'https://account.test/api', accountRef: '', passwordRef: '', tokenRef: 'token', accountId: '' }, { async resolve() { return `fixture.${Buffer.from(JSON.stringify({ exp: 7 * 86400 })).toString('base64url')}.signature` }, async load() { return undefined }, async save() {} }, { now: () => 0, fetch: async url => {
    const path = new URL(String(url)).pathname
    const json = (data: unknown) => new Response(JSON.stringify(data))
    if (revoked) return new Response('{}', { status: 403 })
    if (path.endsWith('/learner-key')) return json({ learnerKey: owner.learnerKey })
    if (path.endsWith('/manifest')) return json({ rev: 1, scenes: [{ id: 'scene-1', rev: 1, order: 0 }] })
    if (path.endsWith('/documents/stage-1')) return json({ dslVersion: '0.3.0', stage: { id: 'stage-1' }, scenes: [{ id: 'scene-1', stageId: 'stage-1', type: 'quiz', content: { type: 'quiz', questions } }] })
    if (path.endsWith('/sessions')) return json(submitted ? sessions : [])
    const index = Number(/attempt-(\d)/u.exec(path)?.[1])
    if (path.endsWith('/records')) return json(['submitted', 'reviewed'].map((phase, seq) => ({ id: `event-${index}-${seq}`, sessionId: `attempt-${index}`, seq, sceneId: 'scene-1', createdAt: `${days[index]}T01:00:00Z`, payload: { payloadVersion: 1, phase, answers: { [`official-${index}`]: 'A' }, ...(phase === 'reviewed' ? { results: [{ questionId: `official-${index}`, correct: true, status: 'correct', earned: 1 }] } : {}) } })))
    return json(sessions[index])
  } })
  const feedback = new OpenmaicFeedback(connection, { async load(key) { return captures.get(key) }, async claim(key, value) { if (!captures.has(key)) captures.set(key, structuredClone(value)); return captures.get(key) } }, async () => true)
  const prepared = await feedback.prepare(owner, target, f.signal)
  submitted = true
  const source = await feedback.read(owner, prepared.binding, f.signal)
  expect(source.observations).toHaveLength(3)
  const mistake = { id: 'm1', subject: 'math', objectiveId: 'm.sub', topic: 'Subtract', prompt: '18 - 3?', learnerAnswer: '16', correction: '15', explanation: 'Subtract three', answerEvidence: '15 + 3 = 18', uncertainties: '', confirmedAt: Date.parse('2026-09-30T09:00:00+08:00'), userConfirmation: 'Original error checked' }
  const archivedAt = Date.parse('2026-11-01T12:00:00+08:00')
  const settings = { format: 2, kind: 'term-settings', learnerId: 'child-1', termId: 'old-term', revision: 1, updatedAt: NOW, archivedAt, profile: setup.profile, materials: [], courses: [] }
  const block = { format: 2, kind: 'block', learnerId: 'child-1', termId: 'old-term', id: 'original', subject: 'math', mode: 'review', startedAt: NOW, endedAt: archivedAt, context: { profile: setup.profile }, questions: source.observations.map(observation => ({ ...openmaicAcademicQuestion(observation), mistakeId: 'm1' })), hints: [], responses: source.observations.map((observation, i) => ({ id: observation.responseId, questionId: observation.questionId, rawResponse: JSON.stringify(observation.source.submittedAnswer), source: observation.source, assistance: 'independent', assistanceConfirmation: 'Original independent answer checked', answerDate: { kind: 'day', day: days[i], parentConfirmation: 'Actual answer day checked' } })), assessments: source.observations.map((observation, i) => ({ id: `assessment-${i}`, responseId: observation.responseId, result: observation.result, grading: observation.grading, official: observation.official, officialHistory: observation.officialHistory, assistance: 'independent', feedback: 'Correct', answerEvidence: '15 + 3 = 18', assessedAt: NOW })) }
  const old = join(f.cwd, '.study/archives/old-term')
  await mkdir(join(old, 'blocks'), { recursive: true })
  await writeFile(join(old, 'settings.json'), JSON.stringify(settings))
  await writeFile(join(old, 'collections.json'), JSON.stringify({ format: 2, kind: 'collections', learnerId: 'child-1', termId: 'old-term', mistakes: [mistake], rewards: [], teachingQueue: [] }))
  await writeFile(join(old, 'blocks/original.json'), JSON.stringify(block))
  await writeFile(join(old, 'openmaic-lessons.json'), JSON.stringify({ format: 1, lessons: [{ ...owner, id: 'old-lesson', status: 'ready', title: 'Original classroom', requirement: 'Subtraction', createdAt: new Date(NOW).toISOString(), updatedAt: new Date(NOW).toISOString(), feedback: prepared.binding }] }))
  const review = { mistakeId: 'm1', stage: 3, dueAt: Date.parse('2026-11-09T00:00:00+08:00'), independentDays: days }
  const reference = { learnerId: 'child-1', termId: 'old-term', ownerKind: 'block', ownerId: 'original', responseId: source.observations[2]!.responseId, goalId: 'm.sub', scope, review }
  await writeFile(join(f.cwd, '.study/settings.json'), JSON.stringify({ ...settings, termId: 'new-term', archivedAt: undefined, evidenceReferences: [reference] }))
  let activeFeedback: Pick<typeof feedback, 'read' | 'verify'> = feedback
  f.ctx.provide('studentOpenmaic', { feedback: () => activeFeedback } as Context['studentOpenmaic'])
  const result = await readStudentWorkspace({ agent: f.agent, signal: f.signal })
  expect(result.read.status).toBe('valid')
  expect(result.read.archiveIssues).toEqual([])
  expect(result.openmaic).toMatchObject([{ lessonId: 'old-lesson', status: 'available', consumption: { status: 'accepted' } }])
  expect(queryWorkspace(result.read, { kind: 'mistakes' }, archivedAt + 30 * 86400000)).toMatchObject({ data: { items: [{ id: 'm1', stage: 3, dueAt: review.dueAt, independentDays: days }] } })
  const originalLesson = JSON.parse(await readFile(join(old, 'openmaic-lessons.json'), 'utf8')).lessons[0]
  await writeFile(join(f.cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons: [...Array.from({ length: 8 }, (_unused, i) => ({ ...originalLesson, id: `unrelated-${i}`, classroomId: `other-${i}`, feedback: { ...prepared.binding, bindingId: `unrelated-${i}` } })), originalLesson] }))
  const calls: string[] = []
  activeFeedback = { async read(request: typeof owner, binding: typeof prepared.binding, signal: AbortSignal) { calls.push(request.classroomId); return request.classroomId === 'stage-1' ? feedback.read(request, binding, signal) : { revision: 'other', observations: [], pending: [], drafts: 0, omitted: 0, checkpoint: { bindingId: binding.bindingId, attempts: [] } } }, async verify(request: typeof owner, binding: typeof prepared.binding, signal: AbortSignal, revision: string) { return request.classroomId === 'stage-1' ? feedback.verify(request, binding, signal, revision) : true } }
  const repeated = await readStudentWorkspace({ agent: f.agent, signal: f.signal })
  expect(repeated.read.archiveIssues).toEqual([])
  expect(calls).toHaveLength(8)
  expect(calls[0]).toBe('stage-1')
  expect(calls.filter(id => id === 'stage-1')).toHaveLength(1)
  expect(repeated.openmaic.filter(fact => fact.failure === 'read-limit')).toHaveLength(1)
  calls.length = 0
  await writeFile(join(f.cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons: [{ ...originalLesson, feedback: { ...prepared.binding, bindingId: 'conflicting-binding' } }] }))
  const conflicting = await readStudentWorkspace({ agent: f.agent, signal: f.signal })
  expect(conflicting.read.workspace?.archivedEvidence).toEqual([])
  expect(conflicting.openmaic).toMatchObject([{ status: 'ownership-unresolved', reason: 'Resolve conflicting saved ownership for the same original classroom before importing records.' }])
  expect(calls).toEqual([])
  await rm(join(f.cwd, '.study/openmaic-lessons.json'))
  revoked = true
  const denied = await readStudentWorkspace({ agent: f.agent, signal: f.signal })
  expect(denied.read.workspace?.archivedEvidence).toEqual([])
  expect(denied.openmaic).toMatchObject([{ status: 'unavailable', failure: 'permission-denied' }])
})
