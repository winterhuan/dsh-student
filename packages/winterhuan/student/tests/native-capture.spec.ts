import { createHash } from 'node:crypto'
import { StudentOpenmaicPlayback } from '../src/openmaic/playback.ts'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import SessionQuery from '@deepseek-ai/dsh-session-query'
import * as JsonlPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import SandboxPolicy from '@deepseek-ai/dsh-sandbox-policy'
import * as ToolSkill from '@deepseek-ai/dsh-tool-skill'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import RemoteAccessService from '@deepseek-ai/dsh-api-remote-access'
import TypertGatewayService from '@deepseek-ai/dsh-api-gateway'
import { Peer } from '@deepseek-ai/dsh-client-connection'
import StudentRemote from '../src/remote-service.ts'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { SessionId, SessionSeq } from '@deepseek-ai/dsh-session'
import { LlmAdapter, createUserMessage, ToolCallId, type GenerateOptions, type StreamChunk } from '@deepseek-ai/dsh-llm'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, it, onTestFinished } from 'vitest'
import * as Student from '../src/agent.ts'
import { readStudentWorkspace } from '../src/transport.ts'
import { deriveEvidence } from '../src/learning/evidence.ts'
import { resolveNativeSources } from '../src/native-source.ts'
import { validateStudyFiles } from '../src/files/validation.ts'
import { queryWorkspace } from '../src/learning/queries.ts'
import { NOW, setup } from './fixtures.ts'

class Replies extends LlmAdapter {
  requests: GenerateOptions[] = []
  beforeReply?: (options: GenerateOptions) => Promise<void>
  async listModels(provider: string) { return [{ provider, id: 'native-fixture', name: 'Native fixture' }] }
  async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    await this.beforeReply?.(options)
    options.signal?.throwIfAborted()
    yield { type: 'block-start', index: 0, blockType: 'text' }
    yield { type: 'text-delta', index: 0, text: 'Original answer received.' }
    yield { type: 'block-end', index: 0, block: { type: 'text', text: 'Original answer received.' } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }
}
async function fixture(fault?: 'unreadable' | 'invalid' | 'no-workspace' | 'subagent') {
  const cwd = await mkdtemp(join(tmpdir(), 'student-native-capture-'))
  const ctx = new Context()
  const failures: unknown[] = []
  ctx.on('agent/error', ({ error }) => { failures.push(error) })
  onTestFinished(async () => { await ctx.fiber.dispose(); await rm(cwd, { recursive: true, force: true }) })
  await ctx.plugin(LocalFileSystem, { cwd })
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
  await ctx.plugin(SandboxPolicy, { mode: 'danger-full-access' })
  await ctx.plugin(SessionQuery)
  await ctx.plugin(SkillRegistry)
  await ctx.plugin(JsonlPersistence, { root: join(cwd, 'history'), compression: 'zstd' })
  await ctx.plugin(AgentLoop, { agents: [] })
  const adapter = new Replies()
  ctx.llm.registerAdapter(['native-fixture'], adapter)
  const settings = { format: 2, kind: 'term-settings', learnerId: 'child-1', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const block = { format: 2, kind: 'block', learnerId: 'child-1', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, currentQuestionId: 'q1', questions: [{ id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original question' }, topic: 'Subtraction', prompt: '62 - 38?', answer: '24', explanation: 'Regroup one ten', answerEvidence: '24 + 38 = 62' }], responses: [], assessments: [], hints: [] }
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  const settingsPath = join(cwd, '.study/settings.json'), blockPath = join(cwd, '.study/blocks/block-1.json')
  await writeFile(settingsPath, JSON.stringify(settings)); await writeFile(blockPath, JSON.stringify(block))
  if (fault === 'unreadable') { await rm(join(cwd, '.study/blocks'), { recursive: true }); await writeFile(join(cwd, '.study/blocks'), 'not a directory') }
  if (fault === 'invalid') await writeFile(settingsPath, '{')
  const handle = await ctx.agents.create({ sessionId: SessionId('native-main'), agentOptions: { provider: 'native-fixture', model: 'native-fixture' }, meta: { ...(fault === 'no-workspace' ? {} : { cwd }), ...(fault === 'subagent' ? { origin: 'subagent' as const } : {}) }, setup: async agentCtx => { await agentCtx.plugin(Student) } })
  const agent = handle.agent
  const read = () => readStudentWorkspace({ agent, signal: new AbortController().signal })
  const answer = async (text = '24') => { agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text }] })); await agent.whenIdle(); expect(failures).toEqual([]) }
  return { ctx, agent, handle, adapter, cwd, settings, block, settingsPath, blockPath, read, answer }
}

it('captures an ordinary native composer answer before academic writes and exposes its stable response owner', async () => {
  const f = await fixture()
  const before = await readFile(f.blockPath, 'utf8')
  await f.answer()
  expect(await readFile(f.blockPath, 'utf8')).toBe(before)
  const observed = await f.read()
  expect(observed.native).toMatchObject({ inputs: [{ rawResponse: '24', learningScope: { learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', questionId: 'q1', responseId: expect.stringMatching(/^native_[a-f0-9]{64}$/u) } }] })
  const source = observed.native.observations[0]!
  const responseId = source.learningScope!.responseId!
  await writeFile(f.blockPath, JSON.stringify({ ...f.block, responses: [{ id: responseId, questionId: 'q1', rawResponse: '24', assistance: 'independent', source: { kind: 'native', sessionId: source.sessionId, messageId: source.messageId, inputVersion: source.inputVersion, receiptAt: source.receiptAt }, answerDate: { kind: 'instant', at: source.receiptAt, basis: 'native-input', sourceVersion: source.inputVersion } }], assessments: [{ id: 'a1', responseId, result: 'correct', assistance: 'independent', feedback: 'Correct', answerEvidence: '24 + 38 = 62', assessedAt: NOW }] }))
  const consumed = await f.read()
  expect(deriveEvidence(consumed.read.workspace!).entries[0]).toMatchObject({ sourceStatus: 'known', answerDate: { kind: 'instant', at: source.receiptAt }, result: 'correct' })
  expect(consumed.native.observations[0]!.learningScope!.responseId).toBe(responseId)
  expect(JSON.stringify(f.adapter.requests[0]!.messages)).not.toContain('plugin:student/native-owner')
  const changed = validateStudyFiles([{ path: '.study/settings.json', value: f.settings }, { path: '.study/blocks/block-1.json', value: { ...JSON.parse(await readFile(f.blockPath, 'utf8')), questions: [{ ...f.block.questions[0], prompt: '63 - 38?' }] } }], [], observed.native.observations)
  expect(changed.valid).toBe(true)
  expect(deriveEvidence(changed.workspace!).entries[0]).toMatchObject({ sourceStatus: 'unknown', answerDate: { kind: 'unknown' } })

  await f.handle.dispose()
  expect(f.ctx.sessions.get(f.agent.session.id)).toBeUndefined()
  const later = await f.ctx.agents.create({ sessionId: SessionId('later-main'), agentOptions: { provider: 'native-fixture', model: 'native-fixture' }, meta: { cwd: f.cwd }, setup: async agentCtx => { await agentCtx.plugin(Student) } })
  const cold = await readStudentWorkspace({ agent: later.agent, signal: new AbortController().signal })
  expect(cold.read.sourceVerification?.native).toMatchObject([{ sessionId: 'native-main', status: 'available' }])
  expect(deriveEvidence(cold.read.workspace!).entries[0]).toMatchObject({ sourceStatus: 'known', responseId, answerDate: { kind: 'instant', at: source.receiptAt } })
  const resumed = await f.ctx.agents.resume({ resumeSessionId: f.agent.session.id, agentOptions: { provider: 'native-fixture', model: 'native-fixture' }, setup: async agentCtx => { await agentCtx.plugin(Student) } })
  resumed.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '24' }] }))
  await resumed.agent.whenIdle()
  const reanswered = await readStudentWorkspace({ agent: resumed.agent, signal: new AbortController().signal })
  const newer = reanswered.native.observations.at(-1)!
  expect(newer.learningScope).toMatchObject({ learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', questionId: 'q1' })
  expect(newer.learningScope!.responseId).not.toBe(responseId)
})

it.each(['learner', 'term', 'block', 'question', 'question-body'])('never rebinds an idle answer to %s changed by an external edit after receipt', async change => {
  const f = await fixture()
  const entered = Promise.withResolvers<void>(), release = Promise.withResolvers<void>()
  onTestFinished(() => release.resolve())
  const stop = f.ctx.on('agent/pre-step', async (_event, next) => { entered.resolve(); await release.promise; return next() })
  f.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '24' }] }))
  await entered.promise
  const settings = { ...f.settings }, block = { ...f.block, questions: f.block.questions.map(question => ({ ...question })) }
  let path = f.blockPath
  if (change === 'learner') { settings.learnerId = 'child-2'; block.learnerId = 'child-2' }
  if (change === 'learner' || change === 'term') { settings.termId = 'term-2'; block.termId = 'term-2'; block.id = 'block-2'; path = join(f.cwd, '.study/blocks/block-2.json'); await rm(f.blockPath) }
  if (change === 'block') { block.id = 'block-2'; path = join(f.cwd, '.study/blocks/block-2.json'); await rm(f.blockPath) }
  if (change === 'question') { block.currentQuestionId = 'q2'; block.questions[0]!.id = 'q2' }
  if (change === 'question-body') block.questions[0]!.prompt = '63 - 38?'
  await writeFile(f.settingsPath, JSON.stringify(settings)); await writeFile(path, JSON.stringify(block))
  release.resolve()
  await f.agent.whenIdle()
  stop()
  const observed = await f.read()
  expect(observed.read.issues).toEqual([])
  expect(observed.read.status).toBe('valid')
  expect(observed.native.inputs[0]).toMatchObject({ rawResponse: '24', receipt: { kind: 'known' } })
  expect(observed.native.inputs[0]!.learningScope).toBeUndefined()
  expect(observed.native.observations[0]!.learningScope).toBeUndefined()
  await f.answer()
  expect((await f.read()).native.inputs.at(-1)!.learningScope).toMatchObject({ learnerId: settings.learnerId, termId: settings.termId, blockId: block.id, questionId: block.currentQuestionId })
})

it('never borrows a capture from another Session, claim, receipt or proposed step during replay', async () => {
  const f = await fixture()
  await f.answer()
  using observation = await f.ctx.sessionQuery.observeSession(f.agent.session.id, { projectionMode: 'none' })
  const events = observation.events
  const index = events.findIndex(event => event.type as string === 'plugin:student/native-owner')
  expect(index).toBeGreaterThan(0)
  for (const override of [{ sessionId: 'another-session' }, { messageHash: '0'.repeat(64) }, { receiptSeq: 999 }, { step: 99 }, { turn: 99 }, { scope: {} }]) {
    const changed = events.map((event, seq) => seq === index ? { ...event, data: { ...event.data, ...override } } : event)
    expect(resolveNativeSources({ ...observation, events: changed }).observations[0]!.learningScope).toBeUndefined()
  }
  expect(resolveNativeSources({ ...observation, inheritedEventCount: events[index]!.seq + 1 }).observations[0]?.learningScope).toBeUndefined()
})

it.each(['replace', 'remove', 'reject'])('does not credit an input that downstream admission hooks %s', async action => {
  const f = await fixture()
  const stop = f.ctx.on('agent/pre-step', async (_event, next) => {
    const decision = await next()
    if (action === 'reject' || decision.kind === 'reject') return { kind: 'reject' }
    return { ...decision, messages: action === 'remove' ? decision.messages.filter(message => message.source.kind !== 'user') : decision.messages.map(message => message.source.kind === 'user' ? { ...message, content: [{ type: 'text', text: '25' }] } : message) }
  })
  await f.answer()
  stop()
  const observed = await f.read()
  expect(observed.native.observations).toEqual([])
  expect(observed.native.inputs.every(input => input.learningScope === undefined)).toBe(true)
})

it('keeps multiple claimed user messages and answers queued during another open step unowned', async () => {
  const multiple = await fixture()
  multiple.agent.send(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '24' }] }), 'next-step', false)
  await multiple.answer()
  expect((await multiple.read()).native.inputs.every(input => input.learningScope === undefined)).toBe(true)
  const queued = await fixture()
  let inserted = false
  const stop = queued.ctx.on('agent/assistant-stream', ({ agent, frame }) => {
    if (frame.type === 'start' && !inserted) { inserted = true; agent.steer(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '24' }] })) }
  })
  await queued.answer()
  stop()
  const observed = await queued.read()
  expect(observed.native.inputs).toHaveLength(2)
  expect(observed.native.inputs[0]!.learningScope).toBeDefined()
  expect(observed.native.inputs[1]!.learningScope).toBeUndefined()
})

it.each(['unreadable', 'invalid', 'no-workspace', 'subagent'] as const)('keeps ordinary native chat available with %s ownership', async fault => {
  const f = await fixture(fault)
  await f.answer()
  using observation = await f.ctx.sessionQuery.observeSession(f.agent.session.id, { projectionMode: 'none' })
  expect(resolveNativeSources(observation).inputs[0]!.learningScope).toBeUndefined()
})

it('does not authenticate an answer canceled after receipt but before step consumption', async () => {
  const f = await fixture()
  const entered = Promise.withResolvers<void>(), release = Promise.withResolvers<void>()
  onTestFinished(() => release.resolve())
  const stop = f.ctx.on('agent/pre-step', async (_event, next) => { entered.resolve(); await release.promise; return next() })
  f.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '24' }] }))
  await entered.promise
  f.agent.cancel({ kind: 'user' })
  release.resolve()
  await f.agent.whenIdle()
  stop()
  expect((await f.read()).native.observations).toEqual([])
  await f.answer()
  expect((await f.read()).native.observations.at(-1)!.learningScope).toBeDefined()
})

it.each(['edit', 'revert', 'remove-reinsert'] as const)('preserves only continuous receipt ownership through actual inbox %s callbacks', async action => {
  const f = await fixture()
  const original = createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '24' }] })
  f.agent.send(original, 'next-turn', false)
  if (action === 'remove-reinsert') { f.agent.inbox.remove(original.id); f.agent.send(original, 'next-turn', false) }
  else {
    f.agent.inbox.replace(original.id, { ...original, content: [{ type: 'text', text: '25' }] })
    if (action === 'revert') f.agent.inbox.replace(original.id, original)
  }
  f.agent.followup(createUserMessage({ source: { kind: 'system-prompt' }, content: [{ type: 'text', text: 'Continue' }] }))
  await f.agent.whenIdle()
  const observed = (await f.read()).native
  expect(observed.inputs).toHaveLength(1)
  expect(observed.inputs[0]!.rawResponse).toBe(action === 'edit' ? '25' : '24')
  if (action === 'remove-reinsert') expect(observed.observations).toEqual([])
  else expect(observed.observations[0]!.learningScope?.questionId).toBe('q1')
})

async function syncFixture() {
  const f = await fixture()
  await f.ctx.plugin(TypertRegistry)
  await f.ctx.plugin(RemoteAccessService)
  await f.ctx.plugin(TypertGatewayService)
  // These cases exercise feedback; the textbook service is not called.
  f.ctx.provide('studentTextbooks', {} as Context['studentTextbooks'])
  await f.ctx.plugin(StudentRemote, { refreshIntervalMs: 3000, maxWireBytes: 1048576 })
  await writeFile(join(f.cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons: [{ id: 'lesson-1', status: 'ready', createdAt: '2026-11-20T01:00:00Z', updatedAt: '2026-11-20T01:01:00Z', title: 'Subtraction', requirement: 'Within20', base: 'https://classroom.test', learnerId: f.settings.learnerId, termId: f.settings.termId, blockId: f.block.id, classroomId: 'stage-1', learnerKey: 'learner-1', feedback: { bindingId: 'binding-1', learnerId: f.settings.learnerId, termId: f.settings.termId, blockId: f.block.id, goalId: 'm.sub', familyId: 'math.sub-basic', scope: { id: 'within20', description: 'Within20', modality: 'written', numberMax: 20 } } }] }))
  const sync = (trigger: 'return' | 'continue' | 'resume' | 'pause') => f.ctx.student.syncFeedback(f.agent.session.id, { lessonId: 'lesson-1', trigger }, new AbortController().signal)
  return { ...f, sync }
}

it('coalesces authorized system feedback behind a busy turn and queued child input, then permits a new explicit return', async () => {
  const f = await syncFixture()
  const entered = Promise.withResolvers<void>(), release = Promise.withResolvers<void>()
  onTestFinished(() => release.resolve())
  f.adapter.beforeReply = async () => { entered.resolve(); await release.promise }
  f.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'First child input' }] }))
  await entered.promise
  f.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Queued child input' }] }))
  const first = await f.sync('return')
  expect(first.status).toBe('queued')
  expect(await f.sync('continue')).toMatchObject({ status: 'coalesced', messageId: first.messageId })
  expect(f.agent.inbox.nextTurn.map(message => message.source.kind)).toEqual(['user', 'student-sync'])
  release.resolve()
  await f.agent.whenIdle()
  const read = await f.read()
  expect(read.native.inputs.map(input => input.rawResponse)).toEqual(['First child input', 'Queued child input'])
  expect(f.agent.session.snapshotEvents().filter(event => event.type === 'user/message').map(event => event.data.source.kind).filter(kind => kind === 'user' || kind === 'student-sync')).toEqual(['user', 'user', 'student-sync'])
  const again = await f.sync('resume')
  expect(again.status).toBe('queued')
  expect(again.messageId).not.toBe(first.messageId)
  await f.agent.whenIdle()
})

it('pauses only owned queued feedback before native cancellation and retries on the next explicit trigger', async () => {
  const f = await syncFixture()
  const entered = Promise.withResolvers<void>(), release = Promise.withResolvers<void>()
  onTestFinished(() => release.resolve())
  f.adapter.beforeReply = async () => { entered.resolve(); await release.promise }
  f.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Working' }] }))
  await entered.promise
  f.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Keep queued draft' }] }))
  await f.sync('return')
  expect(await f.sync('pause')).toMatchObject({ status: 'paused' })
  expect(f.agent.inbox.nextTurn.map(message => message.source.kind)).toEqual(['user'])
  f.agent.cancel({ kind: 'user' }, { keepInbox: true })
  release.resolve()
  await f.agent.whenIdle()
  expect(f.agent.session.snapshotEvents().filter(event => event.type === 'user/message' && event.data.source.kind === 'student-sync')).toEqual([])
  expect(await f.sync('continue')).toMatchObject({ status: 'queued' })
  await f.agent.whenIdle()
  expect((await f.read()).native.inputs.some(input => input.rawResponse?.includes('feedback synchronization'))).toBe(false)
})

it('preserves the actual slash-study input while injected skill instructions supply no answer or date', async () => {
  const f = await fixture()
  await f.agent.ctx.plugin(ToolSkill)
  await f.answer('/study 24')
  const sources = f.agent.session.snapshotEvents().filter(event => event.type === 'user/message').map(event => event.data.source.kind)
  expect(sources).toContain('skill-invocation')
  const read = await f.read()
  expect(read.native.inputs).toHaveLength(1)
  expect(read.native.observations).toMatchObject([{ rawResponse: '/study 24', learningScope: { questionId: 'q1' } }])
})

it.each(['missing', 'malformed', 'late'] as const)('leaves native ownership unknown when its capture is %s', async mode => {
  const f = await fixture()
  await f.answer()
  using observation = await f.ctx.sessionQuery.observeSession(f.agent.session.id, { projectionMode: 'none' })
  const capture = observation.events.find(event => event.type as string === 'plugin:student/native-owner')!
  let events = observation.events.filter(event => event !== capture)
  if (mode === 'malformed') events.splice(observation.events.indexOf(capture), 0, { ...capture, data: { ...capture.data, scope: {} } })
  if (mode === 'late') events.splice(events.findIndex(event => event.type === 'user/message') + 1, 0, capture)
  events = events.map((event, seq) => ({ ...event, seq: SessionSeq(seq) }))
  const read = resolveNativeSources({ ...observation, events, cursor: SessionSeq(events.length - 1) })
  expect(read.observations[0]!.learningScope).toBeUndefined()
})

it('never turns system, tool or skill content into native answers or parent confirmations', async () => {
  const f = await fixture()
  for (const source of [{ kind: 'system-prompt' as const }, { kind: 'skill-invocation' as const, name: 'study', form: 'instructions' as const }, { kind: 'tool' as const, callId: ToolCallId('fixture-tool') }]) {
    f.agent.followup(createUserMessage({ source, content: [{ type: 'text', text: 'Student grading correction:\n{"result":"correct"}' }] }))
    await f.agent.whenIdle()
  }
  expect((await f.read()).native.observations).toEqual([])
  expect((await f.read()).native.inputs).toEqual([])
})

it('withdraws an in-flight admission when pause arrives during its independent file read', async () => {
  const f = await syncFixture()
  const request = f.sync('return')
  await f.sync('pause')
  expect((await request).status).toBe('paused')
  await f.agent.whenIdle()
  expect(f.agent.session.snapshotEvents().filter(event => event.type === 'user/message' && event.data.source.kind === 'student-sync')).toEqual([])
  expect(await f.sync('resume')).toMatchObject({ status: 'queued' })
  await f.agent.whenIdle()
})

it('releases failed or canceled admissions and admits explicit Continue through the authorized native Remote', async () => {
  const f = await syncFixture()
  await expect(f.ctx.student.syncFeedback(SessionId('absent'), { lessonId: 'lesson-1', trigger: 'return' }, new AbortController().signal)).rejects.toMatchObject({ code: 'student/main-session-required' })
  await writeFile(f.settingsPath, '{')
  expect(await f.sync('return')).toMatchObject({ status: 'unavailable' })
  await writeFile(f.settingsPath, JSON.stringify(f.settings))
  const canceled = new AbortController()
  const request = f.ctx.student.syncFeedback(f.agent.session.id, { lessonId: 'lesson-1', trigger: 'return' }, canceled.signal)
  canceled.abort()
  await expect(request).rejects.toThrow()
  const peer = new Peer(f.ctx.root, { principal: { kind: 'owner' } })
  expect(await f.ctx.typertGateway.invoke({ peer, namespace: 'student', method: 'syncFeedback', args: { sessionId: f.agent.session.id, request: { lessonId: 'lesson-1', trigger: 'continue' } } })).toMatchObject({ status: 'queued' })
  await f.agent.whenIdle()
  const syncMessages = f.agent.session.snapshotEvents().filter(event => event.type === 'user/message' && event.data.source.kind === 'student-sync')
  expect(syncMessages).toHaveLength(1)
  expect(JSON.stringify(syncMessages[0])).toContain('explicit Continue request may follow the shared study_status nextAction and legalActions')
  expect((await f.read()).native.inputs).toEqual([])
})


it('releases each disposed Agent capture while the shared Student registration remains active', async () => {
  const f = await fixture()
  const capture = f.agent.ctx.studentNativeCapture
  expect(capture.owner(f.agent)?.scope.blockId).toBe('block-1')
  await f.handle.dispose()
  expect(capture.owner(f.agent)).toBeUndefined()
  const later = await f.ctx.agents.create({ sessionId: SessionId('disposal-main'), agentOptions: { provider: 'native-fixture', model: 'native-fixture' }, meta: { cwd: f.cwd }, setup: async ctx => { await ctx.plugin(Student) } })
  expect(later.agent.ctx.studentNativeCapture.owner(later.agent)?.scope.blockId).toBe('block-1')
  later.agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '24' }] }))
  await later.agent.whenIdle()
  expect((await readStudentWorkspace({ agent: later.agent, signal: new AbortController().signal })).native.observations[0]?.learningScope?.blockId).toBe('block-1')
})


it('reauthenticates every original native answer before accepting a sole archived review reference', async () => {
  const f = await fixture()
  const scope = { id: 'within100', description: 'Written subtraction within one hundred', modality: 'written', numberMax: 100 }
  const days = ['2026-10-01', '2026-10-08', '2026-10-24']
  const mistake = { id: 'm1', subject: 'math', objectiveId: 'm.sub', topic: 'Subtract', prompt: '62 - 38?', learnerAnswer: '34', correction: '24', explanation: 'Regroup', answerEvidence: '24 + 38 = 62', uncertainties: '', confirmedAt: Date.parse('2026-09-30T09:00:00+08:00'), userConfirmation: 'Original error checked' }
  const collections = { format: 2, kind: 'collections', learnerId: 'child-1', termId: 'term-1', mistakes: [mistake], rewards: [], teachingQueue: [] }
  await writeFile(join(f.cwd, '.study/collections.json'), JSON.stringify(collections))
  const questions = days.map((_day, i) => ({ ...f.block.questions[0], ...(i < 2 ? { prompt: '18 - 3?', answer: '15', explanation: 'Subtract three', answerEvidence: '15 + 3 = 18' } : {}), id: `q${i}`, objectiveId: 'm.sub', mistakeId: 'm1', capability: { goalId: 'm.sub', familyId: 'math.sub-column', scope: i < 2 ? { ...scope, id: 'within20', numberMax: 20 } : scope } }))
  const responses: object[] = [], assessments: object[] = []
  for (const [i, day] of days.entries()) {
    await writeFile(f.blockPath, JSON.stringify({ ...f.block, questions, currentQuestionId: `q${i}` }))
    await f.read()
    await f.answer(questions[i]!.answer)
    const observed = (await f.read()).native.observations.at(-1)!
    const responseId = observed.learningScope!.responseId!
    responses.push({ id: responseId, questionId: `q${i}`, rawResponse: questions[i]!.answer, assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual original answer day checked' }, source: { kind: 'native', sessionId: observed.sessionId, messageId: observed.messageId, inputVersion: observed.inputVersion, receiptAt: observed.receiptAt } })
    assessments.push({ id: `a${i}`, responseId, result: 'correct', assistance: 'independent', feedback: 'Correct', answerEvidence: questions[i]!.answerEvidence, assessedAt: NOW })
  }
  const old = join(f.cwd, '.study/archives/term-1')
  await mkdir(join(old, 'blocks'), { recursive: true })
  await writeFile(join(old, 'settings.json'), JSON.stringify({ ...f.settings, archivedAt: Date.parse('2026-11-01T12:00:00+08:00') }))
  await writeFile(join(old, 'collections.json'), JSON.stringify(collections))
  await writeFile(join(old, 'blocks/block-1.json'), JSON.stringify({ ...f.block, questions, currentQuestionId: 'q2', responses, assessments, endedAt: Date.parse('2026-11-01T11:00:00+08:00') }))
  await rm(f.blockPath); await rm(join(f.cwd, '.study/collections.json'))
  const latest = (responses.at(-1)! as { id: string }).id
  const review = { mistakeId: 'm1', stage: 3, dueAt: Date.parse('2026-11-09T00:00:00+08:00'), independentDays: days }
  const settings = { ...f.settings, termId: 'term-2', evidenceReferences: [{ learnerId: 'child-1', termId: 'term-1', ownerKind: 'block', ownerId: 'block-1', responseId: latest, goalId: 'm.sub', scope, review }] }
  await writeFile(f.settingsPath, JSON.stringify(settings))
  await f.handle.dispose()
  const later = await f.ctx.agents.create({ sessionId: SessionId('archive-reader'), agentOptions: { provider: 'native-fixture', model: 'native-fixture' }, meta: { cwd: f.cwd }, setup: async ctx => { await ctx.plugin(Student) } })
  const read = () => readStudentWorkspace({ agent: later.agent, signal: new AbortController().signal })
  const result = await read()
  expect(result.read.status).toBe('valid')
  expect(result.read.archiveIssues).toEqual([])
  expect(deriveEvidence(result.read.workspace!).entries).toHaveLength(3)
  expect(deriveEvidence(result.read.workspace!).entries.every(entry => entry.sourceStatus === 'known')).toBe(true)
  expect(queryWorkspace(result.read, { kind: 'mistakes' }, Date.parse('2026-11-23T12:00:00+08:00'))).toMatchObject({ data: { items: [{ id: 'm1', stage: 3, dueAt: review.dueAt, independentDays: days }] } })
  expect(queryWorkspace(result.read, { kind: 'learning-context' }, Date.parse('2026-11-23T12:00:00+08:00'))).toMatchObject({ data: { goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.sub', independentDays: ['2026-10-24'], baseline: false })]) } })
  const invocation = new Context()
  onTestFinished(() => invocation.fiber.dispose())
  let historicalChecks = 0
  invocation.provide('remoteAccess', { async allows(resource: { id: string }) { return resource.id === later.agent.session.id || ++historicalChecks < 3 } } as Context['remoteAccess'])
  const revoked = await readStudentWorkspace({ agent: later.agent, signal: new AbortController().signal }, invocation)
  expect(historicalChecks).toBe(3)
  expect(revoked.read.workspace?.archivedEvidence).toEqual([])
  expect(revoked.read.sourceVerification?.native).toMatchObject([{ status: 'unavailable', reason: 'Original Session ownership or access changed before publication.' }])
  await writeFile(f.settingsPath, JSON.stringify({ ...settings, evidenceReferences: [{ ...settings.evidenceReferences[0], review: { ...review, stage: 4 } }] }))
  expect((await read()).read.workspace?.archivedEvidence).toEqual([])
})

it('admits compact panel answers once and rejects reused request IDs with a different answer', async () => {
  const f = await syncFixture()
  const intent = { version: 2 as const, nativeSessionId: f.agent.session.id, learnerId: f.settings.learnerId, termId: f.settings.termId, blockId: f.block.id, questionId: 'q1', responseId: 'panel-r1', operation: { action: 'answer', taskId: 'q1', response: '24' }, request: 'Save original answer first.' }
  const request = { requestId: 'panel-input-1', intent }
  const signal = new AbortController().signal
  await Promise.all([f.ctx.student.submitIntent(f.agent.session.id, request, signal), f.ctx.student.submitIntent(f.agent.session.id, request, signal)])
  await f.agent.whenIdle()
  await f.ctx.student.submitIntent(f.agent.session.id, request, signal)
  await expect(f.ctx.student.submitIntent(f.agent.session.id, { ...request, intent: { ...intent, operation: { ...intent.operation, response: '25' } } }, signal)).rejects.toThrow('different input')
  const observed = (await f.read()).native
  expect(observed.inputs).toHaveLength(1)
  expect(observed.inputs[0]).toMatchObject({ intention: intent, rawResponse: '24', learningScope: { responseId: 'panel-r1', questionId: 'q1' } })
  expect(f.agent.session.snapshotEvents().filter(event => event.type === 'user/message' && event.data.source.kind === 'user').map(event => event.data.content)).toEqual([[{ type: 'text', text: '24' }]])
  expect(JSON.parse(await readFile(f.blockPath, 'utf8')).responses).toEqual([])
})


it('opens only an owned unchanged mini lesson without inference or writes', async () => {
  const f = await syncFixture()
  const playback = new StudentOpenmaicPlayback(f.ctx)
  const html = '<h2>Make ten</h2>'
  await writeFile(join(f.cwd, 'mini.html'), html)
  const mini = { id: 'mini-1', learnerId: f.settings.learnerId, termId: f.settings.termId, subject: 'math', revision: 'v1', goalIds: ['m.add'], scope: { id: 'within20', description: 'Within20', modality: 'written', numberMax: 20 }, purpose: 'review', contentPath: 'mini.html', contentHash: createHash('sha256').update(html).digest('hex'), createdAt: NOW }
  const path = join(f.cwd, '.study/openmaic-lessons.json')
  const original = JSON.stringify({ format: 2, lessons: [], miniLessons: [mini] })
  await writeFile(path, original)
  const signal = new AbortController().signal
  expect(await playback.mini(f.agent.session.id, mini.id, signal)).toEqual({ id: mini.id, html })
  expect(f.adapter.requests).toEqual([])
  expect(await readFile(path, 'utf8')).toBe(original)
  await writeFile(join(f.cwd, 'mini.html'), '<h2>Changed</h2>')
  await expect(playback.mini(f.agent.session.id, mini.id, signal)).rejects.toThrow('changed')
  await writeFile(path, JSON.stringify({ format: 2, lessons: [], miniLessons: [{ ...mini, learnerId: 'another-child' }] }))
  await expect(playback.mini(f.agent.session.id, mini.id, signal)).rejects.toThrow('ownership')
})
