import { expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { canonical } from '../src/learning/shared.ts'
import { validateStudyFiles } from '../src/files/validation.ts'
import { deriveEvidence } from '../src/learning/evidence.ts'
import { NOW, setup } from './fixtures.ts'

const snapshot = { id: 'official-question', type: 'single', question: 'Which equals one half?', options: [{ value: 'A', label: '1/2' }, { value: 'B', label: '0.5' }], answer: ['A'], analysis: 'Both values equal one half.' }
const source = { kind: 'openmaic', bindingId: 'binding-1', attemptId: 'attempt-1', sceneId: 'scene-1', questionId: snapshot.id, submission: { id: 'submitted-1', seq: 1, createdAt: '2026-11-20T01:00:00Z' }, submittedAnswer: 'B' }
const official = { recordId: 'reviewed-1', seq: 2, createdAt: '2026-11-20T01:01:00Z', result: { questionId: snapshot.id, correct: false, status: 'incorrect', earned: 0 } }
function input() {
  return [
    { path: '.study/settings.json', value: { format: 2, kind: 'term-settings', learnerId: 'child-1', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] } },
    { path: '.study/blocks/block-1.json', value: { format: 2, kind: 'block', learnerId: 'child-1', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, currentQuestionId: 'q1',
      questions: [{ id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Frozen official question' }, topic: 'Fractions', prompt: snapshot.question, answer: '1/2', explanation: snapshot.analysis, answerEvidence: 'One half equals 0.5', openmaic: { bindingId: 'binding-1', sceneId: 'scene-1', questionId: snapshot.id, snapshot, snapshotHash: createHash('sha256').update(canonical(snapshot)).digest('hex'), revision: { kind: 'manifest', stageRev: 1, sceneRev: 1 } } }],
      responses: [{ id: 'r1', questionId: 'q1', rawResponse: '"B"', assistance: 'unknown', answerDate: { kind: 'unknown' }, source }], hints: [], assessments: [{ id: 'a1', responseId: 'r1', result: 'correct', grading: 'equivalent', official, assistance: 'unknown', feedback: 'Equivalent value', answerEvidence: 'One half equals 0.5', assessedAt: NOW }] } },
  ]
}
it('preserves official grading but excludes an agent declaration from trusted learning evidence', () => {
  const read = validateStudyFiles(input())
  expect(read.valid).toBe(true)
  expect(deriveEvidence(read.workspace!).entries).toMatchObject([{ rawResponse: '"B"', sourceStatus: 'unknown', result: 'unassessed', assistance: 'unknown', answerDate: { kind: 'unknown' }, official }])
})

import { OpenmaicConnection } from '../src/openmaic/connection.ts'
import { OpenmaicGeneration } from '../src/openmaic/generation.ts'
import { OpenmaicFeedback, gradeOpenmaicAnswer } from '../src/openmaic/feedback.ts'
const signal = new AbortController().signal
async function officialFixture(originalQuestion = snapshot) {
  const saved = new Map<string, unknown>()
  const captures = new Map<string, unknown>()
  let records: unknown[] = []
  let sessions: unknown[] = []
  let rev = 1
  let missingManifest = false
  let forbidden = false
  let reads = 0
  let changeDuringRead = false
  const envelope = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } })
  const token = `fixture.${Buffer.from(JSON.stringify({ exp: 7 * 86400 })).toString('base64url')}.signature`
  const network: typeof fetch = async (url) => {
    const path = new URL(String(url)).pathname
    if (path.endsWith('/learner-key')) return envelope({ learnerKey: 'user:fixture-parent' })
    if (path === '/api/generate-classroom') return envelope({ jobId: 'job-1', pollUrl: '/api/generate-classroom/job-1' })
    if (path === '/api/generate-classroom/job-1') return envelope({ status: 'succeeded', result: { classroomId: 'stage-1' } })
    if (path.endsWith('/manifest') && missingManifest) return envelope({}, 404)
    if (path.endsWith('/manifest')) return envelope({ rev, scenes: [{ id: 'scene-1', order: 0, rev }] })
    if (path === '/api/persistence/documents/stage-1') return envelope({ dslVersion: '0.3.0', stage: { id: 'stage-1' }, scenes: [{ id: 'scene-1', stageId: 'stage-1', type: 'quiz', content: { type: 'quiz', questions: [originalQuestion] } }] })
    reads++
    if (forbidden) return envelope({}, 403)
    if (path.endsWith('/records')) { if (changeDuringRead) rev++; return envelope(records.filter(item => typeof item === 'object' && item !== null && 'sessionId' in item && path.includes(String(item.sessionId)))) }
    if (path.endsWith('/sessions')) return envelope(sessions)
    return envelope(sessions.find(item => typeof item === 'object' && item !== null && 'id' in item && path.endsWith(String(item.id))))
  }
  const connection = () => new OpenmaicConnection({ baseUrl: 'https://classroom.test', accountBaseUrl: 'https://account.test/api', accountRef: '', passwordRef: '', tokenRef: 'token', accountId: '' }, { async resolve() { return token }, async load() { return undefined }, async save() {} }, { fetch: network, now: () => 0 })
  const jobs = { async load(owner: { learnerId: string }) { return saved.get(owner.learnerId) }, async save(owner: { learnerId: string }, value: unknown) { saved.set(owner.learnerId, structuredClone(value)) } }
  const owner = { learnerId: 'child-1', termId: 'term-1', blockId: 'block-1' }
  const generation = new OpenmaicGeneration(connection(), jobs)
  await generation.run({ ...owner, requirement: 'Equivalent fractions' }, signal)
  await generation.run(owner, signal)
  const captureStore = { async load(key: string) { return captures.get(key) }, async claim(key: string, value: unknown) { if (!captures.has(key)) captures.set(key, structuredClone(value)); return captures.get(key) } }
  const feedback = () => new OpenmaicFeedback(connection(), captureStore, (request, stage, signal) => generation.verify(request, stage, signal))
  const target = { goalId: 'm.sub', familyId: 'math.sub-basic', scope: { id: 'within20', description: 'Written subtraction within20', modality: 'written' as const, numberMax: 20 } }
  const lesson = { ...owner, classroomId: 'stage-1', base: 'https://classroom.test', learnerKey: 'user:fixture-parent' }
  return { feedback, lesson, target, setRecords(next: ReturnType<typeof record>[]) { records = next; sessions = [...new Set(next.map(item => item.sessionId))].map(id => ({ id, runtimeDslVersion: '0.1.0', kind: 'quizAttempt', stageId: 'stage-1', learnerKey: lesson.learnerKey, status: 'completed', createdAt: '2026-11-20T01:00:00Z', updatedAt: '2026-11-20T01:01:00Z' })) }, setSessions(next: unknown[]) { sessions = next }, async anotherChild() { const other = { ...owner, learnerId: 'child-2' }; await generation.run({ ...other, requirement: 'Equivalent fractions' }, signal); await generation.run(other, signal); return { ...lesson, ...other } }, changeDuringRead() { changeDuringRead = true }, noManifest() { missingManifest = true }, setRevision() { rev++ }, deny() { forbidden = true }, readCount() { return reads } }
}
const record = (seq: number, phase: string, answers = { [snapshot.id]: 'B' }, results?: unknown[]) => ({ id: `record-${seq}`, sessionId: 'attempt-1', seq, sceneId: 'scene-1', createdAt: '2026-11-20T01:00:00Z', payload: { payloadVersion: 1, phase, answers, ...(results ? { results } : {}) } })
it('reauthorizes submitted answers after restart and applies an independently checked equivalent choice', async () => {
  const f = await officialFixture()
  const prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  expect(prepared.questions).toHaveLength(1)
  f.setRecords([record(0, 'draft'), record(1, 'submitted'), record(2, 'reviewed', undefined, [official.result])])
  const read = await f.feedback().read(f.lesson, prepared.binding, signal)
  expect(read.observations).toMatchObject([{ sourceStatus: 'known', result: 'correct', grading: 'equivalent', source: { submittedAnswer: 'B', submission: { seq: 1 } }, official: { seq: 2, result: { correct: false } } }])
  expect(f.readCount()).toBeGreaterThan(1)
  expect(await f.feedback().verify(f.lesson, prepared.binding, signal, read.revision)).toBe(true)
  f.setRecords([record(0, 'draft'), record(1, 'submitted'), record(2, 'reviewed', undefined, [official.result]), record(3, 'reviewed', undefined, [{ ...official.result, correct: true, status: 'correct', earned: 1 }])])
  expect(await f.feedback().verify(f.lesson, prepared.binding, signal, read.revision)).toBe(false)
  f.deny()
  await expect(f.feedback().read(f.lesson, prepared.binding, signal)).rejects.toMatchObject({ code: 'permission-denied' })
})

import { openmaicAcademicQuestion, matchOpenmaicResponse, consumeOpenmaicFeedback } from '../src/openmaic/feedback-consumer.ts'
it('requires the independently reread source, snapshot and official grade before checkpoint acceptance', async () => {
  const f = await officialFixture()
  const prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  f.setRecords([record(0, 'draft'), record(1, 'submitted'), record(2, 'reviewed', undefined, [official.result])])
  const sourceRead = await f.feedback().read(f.lesson, prepared.binding, signal)
  const observation = sourceRead.observations[0]!
  const question = openmaicAcademicQuestion(observation)
  const response = { id: observation.responseId, questionId: question.id, rawResponse: JSON.stringify(observation.source.submittedAnswer), assistance: 'unknown', answerDate: { kind: 'unknown' }, source: observation.source }
  const assessment = { id: 'a1', responseId: response.id, result: observation.result, grading: observation.grading, official: observation.official, officialHistory: observation.officialHistory, assistance: 'unknown', feedback: 'Equivalent value', answerEvidence: question.answerEvidence, assessedAt: NOW }
  const files = input()
  const block = files[1]!.value
  Object.assign(block, { questions: [question], currentQuestionId: question.id, responses: [response], assessments: [assessment] })
  const validated = validateStudyFiles(files, [], [], sourceRead.observations)
  expect(validated.valid).toBe(true)
  expect(deriveEvidence(validated.workspace!).entries).toMatchObject([{ sourceStatus: 'known', result: 'correct', grading: 'equivalent', answerDate: { kind: 'unknown' }, assistance: 'unknown' }])
  expect(consumeOpenmaicFeedback(validated.workspace!, sourceRead)).toMatchObject({ status: 'accepted', missingResponseIds: [], conflicts: [] })
  expect(consumeOpenmaicFeedback(validateStudyFiles(input()).workspace!, sourceRead)).toMatchObject({ status: 'pending', missingResponseIds: [response.id] })
  expect(matchOpenmaicResponse(observation, validated.workspace!.blocks[0]!, { ...response, rawResponse: 'A' }, question, assessment)).toBe(false)
  expect(deriveEvidence(validateStudyFiles(files).workspace!).entries[0]!.sourceStatus).toBe('unknown')
})
it('keeps drafts out of responses and applies grading corrections under the same submitted identity', async () => {
  const f = await officialFixture()
  const prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  f.setRecords([record(0, 'draft')])
  expect(await f.feedback().read(f.lesson, prepared.binding, signal)).toMatchObject({ observations: [], drafts: 1 })
  f.setRecords([record(0, 'draft'), record(1, 'submitted'), record(2, 'reviewed', undefined, [official.result])])
  const before = await f.feedback().read(f.lesson, prepared.binding, signal)
  f.setRecords([record(3, 'reviewed', undefined, [{ ...official.result, correct: true, status: 'correct', earned: 1 }]), record(2, 'reviewed', undefined, [official.result]), record(0, 'draft'), record(1, 'submitted')])
  const corrected = await f.feedback().read(f.lesson, prepared.binding, signal)
  expect(corrected.observations).toHaveLength(1)
  expect(corrected.observations[0]).toMatchObject({ responseId: before.observations[0]!.responseId, source: before.observations[0]!.source, result: 'correct', grading: 'aligned', official: { seq: 3 }, officialHistory: [{ seq: 2 }, { seq: 3 }] })
  expect(await f.feedback().read(f.lesson, prepared.binding, signal)).toEqual(corrected)
})
it('preserves source answers with pending history when capture occurs after submission or content revision changes', async () => {
  const historical = await officialFixture()
  historical.setRecords([record(0, 'submitted'), record(1, 'reviewed', undefined, [official.result])])
  const late = await historical.feedback().prepare(historical.lesson, historical.target, signal)
  expect(await historical.feedback().read(historical.lesson, late.binding, signal)).toMatchObject({ observations: [{ sourceStatus: 'unknown', result: 'unassessed', source: { submittedAnswer: 'B' } }] })
  const f = await officialFixture()
  const prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  f.setRecords([record(0, 'submitted'), record(1, 'reviewed', undefined, [official.result])])
  f.setRevision()
  expect(await f.feedback().read(f.lesson, prepared.binding, signal)).toMatchObject({ observations: [{ sourceStatus: 'unknown', question: prepared.questions[0], source: { submittedAnswer: 'B' } }] })
})
it('rejects changed Student ownership, source partition and internally conflicting answers without borrowing another source', async () => {
  const f = await officialFixture()
  const prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  await expect(f.feedback().prepare({ ...f.lesson, learnerId: 'child-2' }, f.target, signal)).rejects.toMatchObject({ code: 'identity-changed' })
  await expect(f.feedback().read({ ...f.lesson, learnerKey: 'user:foreign' }, prepared.binding, signal)).rejects.toMatchObject({ code: 'identity-changed' })
  f.setRecords([record(0, 'submitted'), record(1, 'reviewed', { [snapshot.id]: 'A' }, [official.result])])
  expect(await f.feedback().read(f.lesson, prepared.binding, signal)).toMatchObject({ observations: [], pending: [{ reason: 'conflicting-submissions' }, { reason: 'conflicting-submissions' }] })
})

it('rejects inconsistent original source tuples, duplicate submissions, snapshots and official review ordering', () => {
  for (const defect of ['raw', 'tuple', 'learner', 'hash', 'duplicate', 'review']) {
    const files = input(), file = files[1]!.value
    if (!file.responses || !file.questions || !file.assessments) throw new Error('Expected the fixture learning block.')
    if (defect === 'raw') file.responses[0]!.rawResponse = 'B'
    if (defect === 'tuple') file.responses[0]!.source.questionId = 'other'
    if (defect === 'learner') Reflect.deleteProperty(file, 'learnerId')
    if (defect === 'hash') file.questions[0]!.openmaic.snapshotHash = 'a'.repeat(64)
    if (defect === 'duplicate') file.responses.push({ ...file.responses[0]!, id: 'duplicate' })
    if (defect === 'review') Object.assign(file.assessments[0]!, { officialHistory: [official, { ...official, seq: 1 }] })
    expect(validateStudyFiles(files).valid).toBe(false)
  }
})

it('keeps two sessions of the same question pending without assuming that a new session proves a retry', async () => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  const first = [record(0, 'submitted'), record(1, 'reviewed', undefined, [official.result])]
  f.setRecords([...first, ...first.map(item => ({ ...item, id: `retry-${item.id}`, sessionId: 'attempt-2' }))])
  const read = await f.feedback().read(f.lesson, prepared.binding, signal)
  expect(read.observations).toEqual([])
  expect(read.pending).toHaveLength(4)
  expect(read.pending.every(item => item.reason === 'ambiguous-session')).toBe(true)
  expect(read.checkpoint.attempts).toEqual([{ attemptId: 'attempt-1', seq: 1 }, { attemptId: 'attempt-2', seq: 1 }])
})
it('keeps unavailable manifest snapshots unresolved and rejects a separately authorized second child on the original partition', async () => {
  const f = await officialFixture()
  const prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  const other = await f.anotherChild()
  await expect(f.feedback().prepare(other, f.target, signal)).rejects.toMatchObject({ code: 'identity-changed' })
  const unknown = await officialFixture(); unknown.noManifest()
  const frozen = await unknown.feedback().prepare(unknown.lesson, unknown.target, signal)
  expect(frozen.questions[0]!.revision).toEqual({ kind: 'unavailable' })
  unknown.setRecords([record(0, 'submitted'), record(1, 'reviewed', undefined, [official.result])])
  expect(await unknown.feedback().read(unknown.lesson, frozen.binding, signal)).toMatchObject({ observations: [{ sourceStatus: 'unknown', result: 'unassessed' }] })
  expect(prepared.binding.learnerId).toBe('child-1')
})

it('keeps exact-choice disagreement and uncheckable text grading pending for review', () => {
  expect(gradeOpenmaicAnswer(snapshot, 'A', official.result)).toEqual({ result: 'unassessed', grading: 'conflict' })
  expect(gradeOpenmaicAnswer({ ...snapshot, type: 'short_answer' }, 'One half', { ...official.result, correct: true, status: 'correct', earned: 1 })).toEqual({ result: 'unassessed', grading: 'pending' })
})

it('keeps a nonnumeric alternative pending rather than inheriting the official incorrect grade', () => {
  const split = { ...snapshot, question: 'Split five into two parts', options: [{ value: 'A', label: '1和4' }, { value: 'C', label: '4和1' }], answer: ['A'] }
  expect(gradeOpenmaicAnswer(split, 'C', official.result)).toEqual({ result: 'unassessed', grading: 'pending' })
})

it('keeps a mixed numeral and word alternative pending until its criterion is confirmed', () => {
  for (const [expected, submitted] of [['15', '十五'], ['十五', '15']]) {
    const mixed = { ...snapshot, options: [{ value: 'A', label: expected }, { value: 'C', label: submitted }], answer: ['A'] }
    expect(gradeOpenmaicAnswer(mixed, 'C', official.result)).toEqual({ result: 'unassessed', grading: 'pending' })
  }
})

it('accepts one explicit native parent criterion correction without replacing original source or inventing independent credit', async () => {
  const split = { ...snapshot, question: 'Split five into two parts', options: [{ value: 'A', label: '1和4' }, { value: 'C', label: '4和1' }], answer: ['A'] }
  const f = await officialFixture(split), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  f.setRecords([record(0, 'submitted', { [snapshot.id]: 'C' }), record(1, 'reviewed', { [snapshot.id]: 'C' }, [official.result])])
  const sourceRead = await f.feedback().read(f.lesson, prepared.binding, signal), observation = sourceRead.observations[0]!
  const question = openmaicAcademicQuestion(observation)
  const response = { id: observation.responseId, questionId: question.id, rawResponse: '"C"', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: observation.source }
  const decision = { learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', responseId: response.id, questionId: question.id, snapshotHash: observation.question.snapshotHash, submittedAnswer: 'C', result: 'correct', criterion: 'Either order of the two positive parts is valid because 4+1=5.', parentConfirmation: 'I confirm this criterion for this original answer.' }
  const rawResponse = `Student grading correction:\n${JSON.stringify(decision)}`
  const native = { sessionId: 'parent-main', messageId: 'parent-message', inputVersion: 'parent-version', rawResponse, receiptAt: NOW }
  const assessment = { id: 'a1', responseId: response.id, result: 'correct', grading: 'equivalent', official: observation.official, officialHistory: observation.officialHistory, assistance: 'unknown', feedback: decision.criterion, answerEvidence: question.answerEvidence, assessedAt: NOW,
    criterionCorrection: { sessionId: native.sessionId, messageId: native.messageId, inputVersion: native.inputVersion, rawResponse } }
  const files = input()
  Object.assign(files[1]!.value, { questions: [question], currentQuestionId: question.id, responses: [response], assessments: [assessment] })
  const read = validateStudyFiles(files, [], [native], sourceRead.observations)
  expect(read.valid).toBe(true)
  expect(deriveEvidence(read.workspace!).entries).toMatchObject([{ result: 'correct', sourceStatus: 'known', official: { result: { correct: false } }, answerDate: { kind: 'unknown' }, assistance: 'unknown' }])
  expect(consumeOpenmaicFeedback(read.workspace!, sourceRead)).toMatchObject({ status: 'accepted', missingResponseIds: [], conflicts: [] })
  const replay = validateStudyFiles(files, read.files, [native], sourceRead.observations)
  expect(replay.workspace!.blocks[0]!.responses).toHaveLength(1)
  expect(replay.workspace!.blocks[0]!.assessments).toHaveLength(1)
  expect(consumeOpenmaicFeedback(replay.workspace!, sourceRead)).toEqual(consumeOpenmaicFeedback(read.workspace!, sourceRead))
  expect(deriveEvidence(validateStudyFiles(files, [], [], sourceRead.observations).workspace!).entries).toMatchObject([{ result: 'unassessed', sourceStatus: 'known' }])
  expect(deriveEvidence(validateStudyFiles(files, [], [{ ...native, rawResponse: 'model-authored confirmation' }], sourceRead.observations).workspace!).entries).toMatchObject([{ result: 'unassessed', sourceStatus: 'known' }])
  expect(deriveEvidence(validateStudyFiles(files, [], [native], [{ ...observation, sourceStatus: 'unknown' }]).workspace!).entries).toMatchObject([{ result: 'unassessed', sourceStatus: 'unknown' }])
})

it('acknowledges completely saved pending grading without turning it into independent mastery', async () => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  f.setRecords([record(0, 'submitted')])
  const read = await f.feedback().read(f.lesson, prepared.binding, signal), observation = read.observations[0]!
  const question = openmaicAcademicQuestion(observation)
  const response = { id: observation.responseId, questionId: question.id, rawResponse: JSON.stringify(observation.source.submittedAnswer), assistance: 'unknown', answerDate: { kind: 'unknown' }, source: observation.source }
  const files = input()
  Object.assign(files[1]!.value, { questions: [question], currentQuestionId: question.id, responses: [response], assessments: [{ id: 'a1', responseId: response.id, result: observation.result, grading: 'pending', assistance: 'unknown', feedback: 'Original grade is missing.', answerEvidence: question.answerEvidence, assessedAt: NOW }] })
  const validated = validateStudyFiles(files, [], [], read.observations)
  expect(validated.valid).toBe(true)
  expect(consumeOpenmaicFeedback(validated.workspace!, read)).toMatchObject({ status: 'accepted', conflicts: [response.id] })
  expect(deriveEvidence(validated.workspace!).entries).toMatchObject([{ assistance: 'unknown', answerDate: { kind: 'unknown' }, grading: 'pending' }])
})

it.each(['review-only', 'review-before-submit', 'conflicting-submit', 'cross-session'])('preserves %s original events as pending facts and acknowledges only complete saved coverage', async kind => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  const records = kind === 'review-only' ? [record(0, 'reviewed', undefined, [official.result])]
    : kind === 'review-before-submit' ? [record(0, 'reviewed', undefined, [official.result]), record(1, 'submitted')]
      : kind === 'conflicting-submit' ? [record(0, 'submitted'), record(1, 'submitted', { [snapshot.id]: 'A' })]
        : [record(0, 'submitted'), { ...record(0, 'reviewed', undefined, [official.result]), id: 'other-review', sessionId: 'attempt-2' }]
  Object.assign(records[0]!, { extension: { original: ['retained', 1] } })
  f.setRecords(records)
  const read = await f.feedback().read(f.lesson, prepared.binding, signal)
  expect(read.observations).toEqual([])
  expect(read.pending.map(item => item.record)).toEqual(records)
  const files = input()
  Object.assign(files[1]!.value, { questions: [], currentQuestionId: undefined, responses: [], assessments: [], pendingOpenmaic: read.pending })
  const saved = validateStudyFiles(files)
  expect(saved.valid).toBe(true)
  expect(deriveEvidence(saved.workspace!).entries).toEqual([])
  expect(consumeOpenmaicFeedback(saved.workspace!, read)).toMatchObject({ status: 'accepted', missingPendingIds: [] })
  Object.assign(files[1]!.value, { pendingOpenmaic: read.pending.slice(1) })
  expect(consumeOpenmaicFeedback(validateStudyFiles(files).workspace!, read).status).toBe('pending')
  Object.assign(files[1]!.value, { pendingOpenmaic: [read.pending[0], read.pending[0]] })
  expect(validateStudyFiles(files).valid).toBe(false)
  Object.assign(files[1]!.value, { pendingOpenmaic: read.pending.map(item => ({ ...item, binding: { ...item.binding, learnerId: 'another-child' } })) })
  expect(validateStudyFiles(files).valid).toBe(false)
})

it.each([['gap', 'incomplete-read'], ['duplicate-event', 'incomplete-read'], ['record-limit', 'read-limit'], ['session-limit', 'read-limit'], ['payload-version', 'unsupported-version'], ['session-version', 'unsupported-version']])('reports %s as %s without a checkpoint', async (kind, code) => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  let events = [record(0, 'submitted')]
  if (kind === 'gap') events = [record(1, 'submitted')]
  if (kind === 'duplicate-event') events = [record(0, 'submitted'), { ...record(1, 'submitted'), id: 'record-0' }]
  if (kind === 'record-limit') events = Array.from({ length: 2001 }, (_, index) => record(index, 'draft'))
  if (kind === 'payload-version') events[0]!.payload.payloadVersion = 2
  f.setRecords(events)
  if (kind === 'session-limit' || kind === 'session-version') f.setSessions(Array.from({ length: kind === 'session-limit' ? 101 : 1 }, (_, index) => ({ id: `attempt-${index}`, runtimeDslVersion: kind === 'session-version' ? '9.0.0' : '0.1.0', kind: 'quizAttempt', stageId: 'stage-1', learnerKey: f.lesson.learnerKey, status: 'completed', createdAt: '2026-11-20T01:00:00Z', updatedAt: '2026-11-20T01:01:00Z' })))
  await expect(f.feedback().read(f.lesson, prepared.binding, signal)).rejects.toMatchObject({ code })
})

it('distinguishes an empty complete source from a source changed during the read', async () => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  const empty = await f.feedback().read(f.lesson, prepared.binding, signal)
  expect(empty).toMatchObject({ observations: [], pending: [], drafts: 0, omitted: 0, checkpoint: { attempts: [] } })
  expect(consumeOpenmaicFeedback(validateStudyFiles(input()).workspace!, empty).status).toBe('accepted')
  f.setRecords([record(0, 'submitted')]); f.changeDuringRead()
  await expect(f.feedback().read(f.lesson, prepared.binding, signal)).rejects.toMatchObject({ code: 'incomplete-read' })
})

it('bounds the aggregate runtime read even when every individual session fits the HTTP response limit', async () => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  f.setRecords([1, 2].map(index => ({ ...record(0, 'submitted'), id: `large-${index}`, sessionId: `attempt-${index}`, extension: 'x'.repeat(4_200_000) })))
  await expect(f.feedback().read(f.lesson, prepared.binding, signal)).rejects.toMatchObject({ code: 'read-limit' })
})

it('preserves original official grading extension fields in matched formal assessments', async () => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  const originalResult = { ...official.result, criterionVersion: 'source-v1', marks: ['original'] }
  f.setRecords([record(0, 'submitted'), record(1, 'reviewed', undefined, [originalResult])])
  const source = await f.feedback().read(f.lesson, prepared.binding, signal), observation = source.observations[0]!
  const question = openmaicAcademicQuestion(observation), response = { id: observation.responseId, questionId: question.id, rawResponse: JSON.stringify(observation.source.submittedAnswer), assistance: 'unknown', answerDate: { kind: 'unknown' }, source: observation.source }
  const files = input()
  Object.assign(files[1]!.value, { currentQuestionId: question.id, questions: [question], responses: [response], assessments: [{ id: 'a1', responseId: response.id, result: observation.result, grading: observation.grading, official: observation.official, officialHistory: observation.officialHistory, assistance: 'unknown', assessedAt: NOW, feedback: 'Equivalent value', answerEvidence: question.answerEvidence }] })
  const saved = validateStudyFiles(files, [], [], source.observations)
  expect(saved.valid).toBe(true)
  expect(saved.workspace!.blocks[0]!.assessments[0]!.official!.result).toEqual(originalResult)
  expect(consumeOpenmaicFeedback(saved.workspace!, source).status).toBe('accepted')
  Object.assign(files[1]!.value, { assessments: [] })
  expect(consumeOpenmaicFeedback(validateStudyFiles(files).workspace!, source)).toMatchObject({ status: 'pending', missingResponseIds: [response.id] })
})

it.each(['incorrect', 'partial'] as const)('retains an authenticated parent %s grade for the same short answer', async result => {
  const split = { ...snapshot, type: 'short_answer' as const, question: 'Explain how to split five into two parts', answer: ['1 and 4'] }
  const f = await officialFixture(split), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  f.setRecords([record(0, 'submitted', { [snapshot.id]: 'C' }), record(1, 'reviewed', { [snapshot.id]: 'C' }, [official.result])])
  const sourceRead = await f.feedback().read(f.lesson, prepared.binding, signal), observation = sourceRead.observations[0]!
  const question = openmaicAcademicQuestion(observation)
  const response = { id: observation.responseId, questionId: question.id, rawResponse: '"C"', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: observation.source }
  const decision = { learnerId: 'child-1', termId: 'term-1', blockId: 'block-1', responseId: response.id, questionId: question.id, snapshotHash: observation.question.snapshotHash, submittedAnswer: 'C', result, criterion: 'Either order of the two positive parts is valid because 4+1=5.', parentConfirmation: 'I confirm this criterion for this original answer.' }
  const rawResponse = `Student grading correction:\n${JSON.stringify(decision)}`
  const native = { sessionId: 'parent-main', messageId: 'parent-message', inputVersion: 'parent-version', rawResponse, receiptAt: NOW }
  const assessment = { id: 'a1', responseId: response.id, result, grading: 'aligned', official: observation.official, officialHistory: observation.officialHistory, assistance: 'unknown', feedback: decision.criterion, answerEvidence: question.answerEvidence, assessedAt: NOW,
    criterionCorrection: { sessionId: native.sessionId, messageId: native.messageId, inputVersion: native.inputVersion, rawResponse } }
  const files = input()
  Object.assign(files[1]!.value, { questions: [question], currentQuestionId: question.id, responses: [response], assessments: [assessment] })
  const read = validateStudyFiles(files, [], [native], sourceRead.observations)
  expect(read.valid).toBe(true)
  expect(deriveEvidence(read.workspace!).entries).toMatchObject([{ result, sourceStatus: 'known', official: { result: { correct: false } }, answerDate: { kind: 'unknown' }, assistance: 'unknown' }])
  expect(consumeOpenmaicFeedback(read.workspace!, sourceRead)).toMatchObject({ status: 'accepted', missingResponseIds: [], conflicts: [] })
  const replay = validateStudyFiles(files, read.files, [native], sourceRead.observations)
  expect(replay.workspace!.blocks[0]!.responses).toHaveLength(1)
  expect(replay.workspace!.blocks[0]!.assessments).toHaveLength(1)
  expect(consumeOpenmaicFeedback(replay.workspace!, sourceRead)).toEqual(consumeOpenmaicFeedback(read.workspace!, sourceRead))
  expect(deriveEvidence(validateStudyFiles(files, [], [], sourceRead.observations).workspace!).entries).toMatchObject([{ result: 'unassessed', sourceStatus: 'known' }])
  expect(deriveEvidence(validateStudyFiles(files, [], [{ ...native, rawResponse: 'model-authored confirmation' }], sourceRead.observations).workspace!).entries).toMatchObject([{ result: 'unassessed', sourceStatus: 'known' }])
  expect(deriveEvidence(validateStudyFiles(files, [], [native], [{ ...observation, sourceStatus: 'unknown' }]).workspace!).entries).toMatchObject([{ result: 'unassessed', sourceStatus: 'unknown' }])
})
