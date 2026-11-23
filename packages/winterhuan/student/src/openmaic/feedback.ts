/** Authorized original classroom records feed the shared reader; only the native agent writes academic files. */
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { canonical } from '../learning/shared.ts'
import { OpenmaicConnection, OpenmaicError } from './connection.ts'
import { feedbackBindingSchema, feedbackCheckpointSchema, officialQuestionSchema, officialAnswerSchema, officialResultSchema, openmaicQuestionSchema, type OpenmaicInputObservation, type OpenmaicGrading } from './feedback-schema.ts'
const sourceId = z.string().min(1).max(500).refine(value => value !== '.' && value !== '..' && !/[\u0000-\u001f]/u.test(value))
const stamp = z.string().max(80).refine(value => Number.isFinite(Date.parse(value)))
const sessionSchema = z.object({ id: sourceId, runtimeDslVersion: z.literal('0.1.0'), kind: z.string(), stageId: sourceId, learnerKey: sourceId, status: z.enum(['active', 'completed', 'archived']), createdAt: stamp, updatedAt: stamp }).passthrough()
const recordSchema = z.object({ id: sourceId, sessionId: sourceId, seq: z.number().int().nonnegative(), createdAt: stamp, sceneId: sourceId.optional(), payload: z.unknown() }).passthrough()
const payloadSchema = z.object({ payloadVersion: z.literal(1), phase: z.enum(['draft', 'submitted', 'reviewed']), answers: z.record(sourceId, officialAnswerSchema), results: z.array(officialResultSchema).max(200).optional() }).passthrough()
const manifestSchema = z.object({ rev: z.number().int().nonnegative(), scenes: z.array(z.object({ id: sourceId, order: z.number().int(), rev: z.number().int().nonnegative() }).strict()).max(500) }).strict()
const documentSchema = z.object({ dslVersion: z.literal('0.3.0'), stage: z.object({ id: sourceId }).passthrough(), scenes: z.array(z.object({ id: sourceId, stageId: sourceId, type: z.string(), content: z.unknown() }).passthrough()).max(500) }).passthrough()
const captureSchema = z.object({ binding: feedbackBindingSchema, stageId: sourceId, base: z.string(), learnerKey: sourceId, questions: z.array(openmaicQuestionSchema).max(200), heads: feedbackCheckpointSchema.shape.attempts }).strict()
/** Protected source-capture storage owns partition admission, never grades or learner responses. */
export interface OpenmaicCaptureStore { load(key: string): Promise<unknown>; claim(key: string, value: unknown): Promise<unknown> }
/** Original lesson ownership to verify before any runtime read. */
export interface OpenmaicLessonOwner { learnerId: string; termId: string; blockId: string; classroomId: string; base: string; learnerKey: string }
/** Frozen source preparation returned for explicit agent-authored question/binding files. */
export interface OpenmaicPreparation { binding: z.infer<typeof feedbackBindingSchema>; questions: z.infer<typeof openmaicQuestionSchema>[] }
/** Bounded independent source read, including the exact replay checkpoint candidate. */
export interface OpenmaicFeedbackRead { revision: string; observations: OpenmaicInputObservation[]; checkpoint: z.infer<typeof feedbackCheckpointSchema>; drafts: number; omitted: number }
const digest = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex')
const part = (value: string) => encodeURIComponent(sourceId.parse(value))
/**
 * Return stable Student entity identity for one source question or response.
 * @param kind - Academic entity identity to derive.
 * @param tuple - Full opaque original binding, attempt, scene and question tuple.
 * @returns Filename-safe identity; records and grading do not change response identity.
 */
export function openmaicEntityId(kind: 'q' | 'r' | 'a', tuple: readonly string[]): string { return `maic-${kind}-${digest(tuple).slice(0, 32)}` }
function fraction(value: string): [bigint, bigint] | undefined {
  const text = value.trim().replaceAll('−', '-').replaceAll('﹣', '-').replaceAll('／', '/')
  if (!/^[+-]?\d{1,12}(?:\.\d{1,12}|\/[+-]?\d{1,12})?%?$/u.test(text)) return undefined
  const percent = text.endsWith('%')
  const plain = percent ? text.slice(0, -1) : text
  let numerator: bigint, denominator: bigint
  if (plain.includes('/')) { const [a, b] = plain.split('/'); numerator = BigInt(a!); denominator = BigInt(b!) }
  else { const [a, b = ''] = plain.split('.'); numerator = BigInt(`${a}${b}`); denominator = 10n ** BigInt(b.length) }
  if (denominator === 0n) return undefined
  return [numerator, denominator * (percent ? 100n : 1n)]
}
function equals(left: string, right: string): boolean {
  const a = fraction(left), b = fraction(right)
  return !!a && !!b && a[0] * b[1] === b[0] * a[1]
}
/**
 * Check a submitted choice against the frozen criterion and separately compare the official grade.
 * @param snapshot - Original independently captured quiz question.
 * @param answer - Exact submitted values.
 * @param official - Current original official result when available.
 * @returns Effective result and explicit agreement, numeric equivalence, unresolved conflict or pending criterion.
 */
export function gradeOpenmaicAnswer(snapshot: unknown, answer: z.infer<typeof officialAnswerSchema>, official?: z.infer<typeof officialResultSchema> | null): { result: OpenmaicInputObservation['result']; grading: OpenmaicGrading } {
  const parsed = officialQuestionSchema.safeParse(snapshot)
  if (!parsed.success || parsed.data.type === 'short_answer' || parsed.data.answer === undefined) return { result: 'unassessed', grading: 'pending' }
  const question = parsed.data
  const values = (value: z.infer<typeof officialAnswerSchema>) => typeof value === 'string' ? [value] : value
  const selected = values(answer)
  const expected = values(question.answer!)
  const options = question.options ?? []
  const option = (value: string, key: boolean) => {
    const byValue = options.filter(item => item.value === value)
    if (byValue.length === 1) return byValue[0]
    const byLabel = key ? options.filter(item => item.label === value) : []
    return byLabel.length === 1 ? byLabel[0] : undefined
  }
  if (!selected.length || !expected.length || new Set(selected).size !== selected.length || new Set(expected).size !== expected.length || question.type === 'single' && (selected.length !== 1 || expected.length !== 1)) return { result: 'unassessed', grading: 'pending' }
  const resolved = expected.map(value => option(value, true))
  const submitted = selected.map(value => option(value, false))
  if (options.length && (resolved.some(item => !item) || submitted.some(item => !item))) return { result: 'unassessed', grading: 'pending' }
  const exact = selected.length === expected.length && selected.every(value => resolved.some((item, index) => value === (item?.value ?? expected[index])))
  // Only exact values and explicit numeric equality are automatic; general prose still needs a check.
  const remaining = resolved.map((item, index) => item?.label ?? expected[index]!)
  const equivalent = selected.length === expected.length && submitted.every((item, index) => { const at = remaining.findIndex(label => equals(item?.label ?? selected[index]!, label)); if (at < 0) return false; remaining.splice(at, 1); return true })
  const correct = exact || equivalent
  if (!correct && (submitted.some(item => !fraction(item?.label ?? '')) || resolved.some(item => !fraction(item?.label ?? '')))) return { result: 'unassessed', grading: 'pending' }
  if (!official) return { result: correct ? 'correct' : 'incorrect', grading: 'pending' }
  if (official.correct === null || official.status !== (official.correct ? 'correct' : 'incorrect') || official.correct && official.earned === 0 || !official.correct && official.earned !== 0 || official.earned > (question.points ?? 1)) return { result: 'unassessed', grading: 'conflict' }
  if (correct && !official.correct && equivalent && !exact) return { result: 'correct', grading: 'equivalent' }
  if (correct !== official.correct) return { result: 'unassessed', grading: 'conflict' }
  return { result: correct ? 'correct' : 'incorrect', grading: 'aligned' }
}
/** Source reader reauthorizes every read; protected captures authenticate content without persisting grades. */
export class OpenmaicFeedback {
  constructor(private readonly connection: OpenmaicConnection, private readonly captures: OpenmaicCaptureStore, private readonly owns: (owner: OpenmaicLessonOwner, stage: string, signal: AbortSignal) => Promise<boolean>) {}
  private key(owner: OpenmaicLessonOwner): string { return digest([owner.base, owner.classroomId, owner.learnerKey]) }
  private async authorize(owner: OpenmaicLessonOwner, signal: AbortSignal): Promise<void> {
    const identity = await this.connection.identity(signal)
    if (!owner.learnerId || !owner.termId || !owner.blockId || identity.baseUrl !== owner.base || identity.learnerKey !== owner.learnerKey || !await this.owns(owner, owner.classroomId, signal)) throw new OpenmaicError('identity-changed')
    const actual = z.object({ learnerKey: sourceId }).parse(await this.connection.read('/api/persistence/learner-key', signal))
    if (actual.learnerKey !== owner.learnerKey) throw new OpenmaicError('identity-changed')
  }
  private async manifest(stage: string, signal: AbortSignal): Promise<z.infer<typeof manifestSchema> | undefined> {
    try { return manifestSchema.parse(await this.connection.request(`/api/stages/${part(stage)}/manifest`, {}, signal)) }
    catch (error) { if (error instanceof OpenmaicError && ['not-found', 'permission-denied'].includes(error.code)) return undefined; throw error }
  }
  private async runtime(owner: OpenmaicLessonOwner, signal: AbortSignal) {
    const sessions = z.array(sessionSchema).max(100).parse(await this.connection.read(`/api/persistence/runtime/stages/${part(owner.classroomId)}/learners/${part(owner.learnerKey)}/sessions`, signal))
    if (new Set(sessions.map(item => item.id)).size !== sessions.length || sessions.some(item => item.stageId !== owner.classroomId || item.learnerKey !== owner.learnerKey)) throw new OpenmaicError('identity-changed')
    let bytes = Buffer.byteLength(JSON.stringify(sessions))
    const attempts: { id: string; records: z.infer<typeof recordSchema>[] }[] = []
    for (const listed of sessions.filter(item => item.kind === 'quizAttempt')) {
      const session = sessionSchema.parse(await this.connection.read(`/api/persistence/runtime/sessions/${part(listed.id)}`, signal))
      if (session.id !== listed.id || session.stageId !== owner.classroomId || session.learnerKey !== owner.learnerKey || session.kind !== 'quizAttempt') throw new OpenmaicError('identity-changed')
      const records = z.array(recordSchema).max(2000).parse(await this.connection.read(`/api/persistence/runtime/sessions/${part(session.id)}/records`, signal))
      bytes += Buffer.byteLength(JSON.stringify(records))
      if (bytes > 8_388_608) throw new OpenmaicError('invalid-response')
      records.sort((a, b) => a.seq - b.seq)
      if (records.some((record, index) => record.seq !== index || record.sessionId !== session.id) || new Set(records.map(item => item.id)).size !== records.length) throw new OpenmaicError('invalid-response')
      attempts.push({ id: session.id, records })
    }
    return attempts.sort((left, right) => left.id.localeCompare(right.id))
  }
  /**
   * Capture the original generated classroom before playback; an existing partition keeps its owner and capture.
   * @param owner - Independently validated original lesson and Student ownership.
   * @param target - Current capability/family/scope selected in formal learning files.
   * @param signal - Cancellation for source and protected capture admission.
   * @returns Exact source question snapshots and the binding for native agent authoring.
   */
  async prepare(owner: OpenmaicLessonOwner, target: Omit<z.infer<typeof feedbackBindingSchema>, 'bindingId' | 'learnerId' | 'termId' | 'blockId'>, signal: AbortSignal): Promise<OpenmaicPreparation> {
    await this.authorize(owner, signal)
    const key = this.key(owner)
    const existing = await this.captures.load(key)
    if (existing !== undefined) return this.preparation(this.capture(existing, owner), target)
    let questions: z.infer<typeof openmaicQuestionSchema>[] = []
    const binding = feedbackBindingSchema.parse({ ...target, learnerId: owner.learnerId, termId: owner.termId, blockId: owner.blockId, bindingId: `maic-binding-${key.slice(0, 32)}` })
    for (let retry = 0; retry < 3; retry++) {
      const before = await this.manifest(owner.classroomId, signal)
      const document = documentSchema.parse(await this.connection.read(`/api/persistence/documents/${part(owner.classroomId)}`, signal))
      const after = await this.manifest(owner.classroomId, signal)
      if (canonical(before) !== canonical(after)) { if (retry === 2) throw new OpenmaicError('service-unavailable'); continue }
      if (document.stage.id !== owner.classroomId || document.scenes.some(scene => scene.stageId !== owner.classroomId) || new Set(document.scenes.map(scene => scene.id)).size !== document.scenes.length || before && canonical(before.scenes.map(scene => scene.id).sort()) !== canonical(document.scenes.map(scene => scene.id).sort())) throw new OpenmaicError('invalid-response')
      questions = document.scenes.flatMap(scene => {
        if (scene.type !== 'quiz') return []
        const content = z.object({ type: z.literal('quiz'), questions: z.array(officialQuestionSchema).max(200) }).passthrough().parse(scene.content)
        if (new Set(content.questions.map(question => question.id)).size !== content.questions.length) throw new OpenmaicError('invalid-response')
        const rev = before?.scenes.find(item => item.id === scene.id)?.rev
        return content.questions.map(question => openmaicQuestionSchema.parse({ bindingId: binding.bindingId, sceneId: scene.id, questionId: question.id, snapshot: question, snapshotHash: digest(question), revision: before && rev !== undefined ? { kind: 'manifest', stageRev: before.rev, sceneRev: rev } : { kind: 'unavailable' } }))
      })
      break
    }
    if (questions.length > 200) throw new OpenmaicError('invalid-response')
    const attempts = await this.runtime(owner, signal)
    const capture = captureSchema.parse({ binding, stageId: owner.classroomId, base: owner.base, learnerKey: owner.learnerKey, questions, heads: attempts.map(attempt => ({ attemptId: attempt.id, seq: attempt.records.at(-1)?.seq ?? -1 })) })
    await this.authorize(owner, signal)
    return this.preparation(this.capture(await this.captures.claim(key, capture), owner), target)
  }
  private capture(raw: unknown, owner: OpenmaicLessonOwner): z.infer<typeof captureSchema> {
    const capture = captureSchema.parse(raw)
    if (capture.base !== owner.base || capture.stageId !== owner.classroomId || capture.learnerKey !== owner.learnerKey || capture.binding.learnerId !== owner.learnerId || capture.binding.termId !== owner.termId || capture.binding.blockId !== owner.blockId) throw new OpenmaicError('identity-changed')
    return capture
  }
  private preparation(capture: z.infer<typeof captureSchema>, target: Omit<z.infer<typeof feedbackBindingSchema>, 'bindingId' | 'learnerId' | 'termId' | 'blockId'>): OpenmaicPreparation {
    if (canonical({ goalId: capture.binding.goalId, familyId: capture.binding.familyId, scope: capture.binding.scope }) !== canonical(target)) throw new OpenmaicError('identity-changed')
    return { binding: capture.binding, questions: capture.questions }
  }
  /**
   * Recheck original source authorization after downstream file reads.
   * @param owner - Original source partition and Student owner.
   * @param binding - Saved binding checked against protected capture metadata.
   * @param signal - Caller cancellation.
   * @param revision - Original read fingerprint; a changed source requires another complete file/source read.
   * @returns Whether source content still matches the independently observed cut.
   */
  async verify(owner: OpenmaicLessonOwner, binding: z.infer<typeof feedbackBindingSchema>, signal: AbortSignal, revision?: string): Promise<boolean> {
    await this.authorize(owner, signal)
    if (canonical(this.capture(await this.captures.load(this.key(owner)), owner).binding) !== canonical(binding)) throw new OpenmaicError('identity-changed')
    return revision === undefined || digest([await this.manifest(owner.classroomId, signal), await this.runtime(owner, signal)]) === revision
  }
  /**
   * Reread exact original partition/attempts and compare current revisions with its protected capture.
   * @param owner - Original authorized classroom ownership.
   * @param binding - Agent-authored declaration checked against the protected original binding.
   * @param signal - Cancellation for complete independent source reads.
   * @returns Source responses and grades with explicit historical/revision uncertainty; performs no academic writes.
   */
  async read(owner: OpenmaicLessonOwner, binding: z.infer<typeof feedbackBindingSchema>, signal: AbortSignal): Promise<OpenmaicFeedbackRead> {
    await this.authorize(owner, signal)
    const capture = this.capture(await this.captures.load(this.key(owner)), owner)
    if (canonical(capture.binding) !== canonical(binding)) throw new OpenmaicError('identity-changed')
    const before = await this.manifest(owner.classroomId, signal)
    const attempts = await this.runtime(owner, signal)
    const after = await this.manifest(owner.classroomId, signal)
    const observations: OpenmaicInputObservation[] = []
    let drafts = 0
    for (const attempt of attempts) {
      const grouped = new Map<string, { submission?: z.infer<typeof recordSchema>; answer?: z.infer<typeof officialAnswerSchema>; review?: z.infer<typeof recordSchema>; result?: z.infer<typeof officialResultSchema> | null; history: NonNullable<OpenmaicInputObservation['officialHistory']>; conflict: boolean }>()
      for (const record of attempt.records) {
        const payload = payloadSchema.parse(record.payload)
        if (payload.phase === 'draft') { drafts++; continue }
        if (!record.sceneId) throw new OpenmaicError('invalid-response')
        if (payload.results && (new Set(payload.results.map(item => item.questionId)).size !== payload.results.length || payload.results.some(item => !Object.hasOwn(payload.answers, item.questionId)))) throw new OpenmaicError('invalid-response')
        for (const [questionId, answer] of Object.entries(payload.answers)) {
          const key = canonical([record.sceneId, questionId])
          const row = grouped.get(key) ?? { conflict: false, history: [] }
          if (row.answer !== undefined && canonical(row.answer) !== canonical(answer)) row.conflict = true
          if (payload.phase === 'submitted' && !row.submission) { row.submission = record; row.answer = answer }
          if (payload.phase === 'reviewed') { row.review = record; row.result = payload.results?.find(item => item.questionId === questionId) ?? null; row.history.push({ recordId: record.id, seq: record.seq, createdAt: record.createdAt, result: row.result }); if (row.answer === undefined) row.answer = answer }
          grouped.set(key, row)
        }
      }
      for (const [tuple, row] of grouped) {
        const [sceneId, questionId] = z.tuple([z.string(), z.string()]).parse(JSON.parse(tuple))
        const snapshot = capture.questions.find(item => item.sceneId === sceneId && item.questionId === questionId)
        const original = row.submission ?? row.review!
        const question = snapshot ?? openmaicQuestionSchema.parse({ bindingId: binding.bindingId, sceneId, questionId, snapshot: null, snapshotHash: digest(null), revision: { kind: 'unavailable' } })
        const revision = question.revision
        const known = !!row.submission && !!snapshot && !row.conflict && original.seq > (capture.heads.find(head => head.attemptId === attempt.id)?.seq ?? -1) && revision.kind === 'manifest' && before?.rev === revision.stageRev && before.scenes.find(scene => scene.id === sceneId)?.rev === revision.sceneRev && canonical(before) === canonical(after)
        const official = row.review ? { recordId: row.review.id, seq: row.review.seq, createdAt: row.review.createdAt, result: row.result ?? null } : undefined
        const grade = gradeOpenmaicAnswer(question.snapshot, row.answer!, official?.result)
        observations.push({ binding, questionId: openmaicEntityId('q', [binding.bindingId, sceneId, questionId]), responseId: openmaicEntityId('r', [binding.bindingId, attempt.id, sceneId, questionId]), question,
          source: { kind: 'openmaic', bindingId: binding.bindingId, attemptId: attempt.id, sceneId, questionId, submission: { id: original.id, seq: original.seq, createdAt: original.createdAt }, submittedAnswer: row.answer! }, ...(official ? { official, officialHistory: row.history } : {}),
          sourceStatus: known ? 'known' : 'unknown', ...(!known ? { reason: row.conflict ? 'Attempt contains conflicting submitted answers.' : !row.submission ? 'Original submitted record is unavailable.' : 'Original question capture or content revision is unresolved.' } : {}), result: known ? grade.result : 'unassessed', grading: known ? grade.grading : 'pending' })
      }
    }
    for (const observation of observations) if (observations.some(other => other.source.attemptId !== observation.source.attemptId && other.source.sceneId === observation.source.sceneId && other.source.questionId === observation.source.questionId && other.official)) observation.answerExposure = 'possible'
    await this.authorize(owner, signal)
    if (observations.length > 500) throw new OpenmaicError('invalid-response')
    return { revision: digest([after, attempts]), observations, drafts, omitted: 0, checkpoint: { bindingId: binding.bindingId, attempts: attempts.map(attempt => ({ attemptId: attempt.id, seq: attempt.records.at(-1)?.seq ?? -1 })).sort((a, b) => a.attemptId.localeCompare(b.attemptId)) } }
  }
}
