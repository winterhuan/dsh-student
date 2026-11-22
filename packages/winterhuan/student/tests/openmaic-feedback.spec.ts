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
async function officialFixture() {
  const saved = new Map<string, unknown>()
  const captures = new Map<string, unknown>()
  let records: unknown[] = []
  let sessions: unknown[] = []
  let rev = 1
  let missingManifest = false
  let forbidden = false
  let reads = 0
  const envelope = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } })
  const token = `fixture.${Buffer.from(JSON.stringify({ exp: 7 * 86400 })).toString('base64url')}.signature`
  const network: typeof fetch = async (url) => {
    const path = new URL(String(url)).pathname
    if (path.endsWith('/learner-key')) return envelope({ learnerKey: 'user:fixture-parent' })
    if (path === '/api/generate-classroom') return envelope({ jobId: 'job-1', pollUrl: '/api/generate-classroom/job-1' })
    if (path === '/api/generate-classroom/job-1') return envelope({ status: 'succeeded', result: { classroomId: 'stage-1' } })
    if (path.endsWith('/manifest') && missingManifest) return envelope({}, 404)
    if (path.endsWith('/manifest')) return envelope({ rev, scenes: [{ id: 'scene-1', order: 0, rev }] })
    if (path === '/api/persistence/documents/stage-1') return envelope({ dslVersion: '0.3.0', stage: { id: 'stage-1' }, scenes: [{ id: 'scene-1', stageId: 'stage-1', type: 'quiz', content: { type: 'quiz', questions: [snapshot] } }] })
    reads++
    if (forbidden) return envelope({}, 403)
    if (path.endsWith('/records')) return envelope(records.filter(item => typeof item === 'object' && item !== null && 'sessionId' in item && path.includes(String(item.sessionId))))
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
  return { feedback, lesson, target, setRecords(next: ReturnType<typeof record>[]) { records = next; sessions = [...new Set(next.map(item => item.sessionId))].map(id => ({ id, runtimeDslVersion: '0.1.0', kind: 'quizAttempt', stageId: 'stage-1', learnerKey: lesson.learnerKey, status: 'completed', createdAt: '2026-11-20T01:00:00Z', updatedAt: '2026-11-20T01:01:00Z' })) }, async anotherChild() { const other = { ...owner, learnerId: 'child-2' }; await generation.run({ ...other, requirement: 'Equivalent fractions' }, signal); await generation.run(other, signal); return { ...lesson, ...other } }, noManifest() { missingManifest = true }, setRevision() { rev++ }, deny() { forbidden = true }, readCount() { return reads } }
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
  expect(await f.feedback().read(f.lesson, prepared.binding, signal)).toMatchObject({ observations: [{ sourceStatus: 'unknown', result: 'unassessed', reason: 'Attempt contains conflicting submitted answers.' }] })
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

it('gives genuine retries separate identities and keeps answer exposure out of independent evidence', async () => {
  const f = await officialFixture(), prepared = await f.feedback().prepare(f.lesson, f.target, signal)
  const first = [record(0, 'submitted'), record(1, 'reviewed', undefined, [official.result])]
  f.setRecords([...first, ...first.map(item => ({ ...item, id: `retry-${item.id}`, sessionId: 'attempt-2' }))])
  const read = await f.feedback().read(f.lesson, prepared.binding, signal)
  expect(new Set(read.observations.map(item => item.responseId)).size).toBe(2)
  expect(read.observations).toMatchObject([{ answerExposure: 'possible' }, { answerExposure: 'possible' }])
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
