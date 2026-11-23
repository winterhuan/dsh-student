/** Official source identities and frozen snapshots shared by files and authorized readers. */
import { z } from 'zod'
import { capabilityScopeSchema, knowledgeIdSchema } from '../capability-schema.ts'
import type { StudentJsonValue } from '../types.ts'
const sourceId = z.string().min(1).max(500).refine(value => value !== '.' && value !== '..' && !/[\u0000-\u001f]/u.test(value), 'Use one opaque source identifier.')
const stamp = z.string().min(1).max(80).refine(value => Number.isFinite(Date.parse(value)), 'Preserve a valid source timestamp.')
const sourceJsonSchema: z.ZodType<StudentJsonValue> = z.json()
/** Quiz answer representation is preserved without label or option substitution. */
export const officialAnswerSchema = z.union([z.string().max(2000), z.array(z.string().max(2000)).max(100)])
/** Original official browser grading, separate from Student effective grading. */
export const officialResultSchema = z.object({ questionId: sourceId, correct: z.boolean().nullable(), status: z.enum(['correct', 'incorrect']), earned: z.number().finite().nonnegative(), aiComment: z.string().max(2000).optional() }).catchall(sourceJsonSchema)
/** Current official grading record; a correction retains the original response identity. */
export const officialReviewSchema = z.object({ recordId: sourceId, seq: z.number().int().nonnegative(), createdAt: stamp, result: officialResultSchema.nullable() }).strict()
/** An immutable submitted answer; reviewed records belong to its assessment. */
export const openmaicResponseSourceSchema = z.object({ kind: z.literal('openmaic'), bindingId: sourceId, attemptId: sourceId, sceneId: sourceId, questionId: sourceId,
  submission: z.object({ id: sourceId, seq: z.number().int().nonnegative(), createdAt: stamp }).strict(), submittedAnswer: officialAnswerSchema,
}).strict()
/** Original runtime payload and extension fields retained for unresolved source associations. */
export const officialRuntimePayloadSchema = z.object({ payloadVersion: z.literal(1), phase: z.enum(['draft', 'submitted', 'reviewed']), answers: z.record(sourceId, officialAnswerSchema), results: z.array(officialResultSchema).max(200).optional() }).catchall(z.json())
/** Complete source event; its ID identifies an event, never a Student answer. */
export const officialRuntimeRecordSchema = z.object({ id: sourceId, sessionId: sourceId, seq: z.number().int().nonnegative(), createdAt: stamp, sceneId: sourceId.optional(), payload: officialRuntimePayloadSchema }).catchall(z.json())
/** Content freshness is a revision observation, never an answer date. */
export const snapshotRevisionSchema = z.discriminatedUnion('kind', [z.object({ kind: z.literal('manifest'), stageRev: z.number().int().nonnegative(), sceneRev: z.number().int().nonnegative() }).strict(), z.object({ kind: z.literal('unavailable') }).strict()])
/** Exact source question bytes remain frozen when today's content changes. */
export const openmaicQuestionSchema = z.object({ bindingId: sourceId, sceneId: sourceId, questionId: sourceId, snapshot: z.json(), snapshotHash: z.string().regex(/^[a-f0-9]{64}$/u), revision: snapshotRevisionSchema }).strict()
/** Original explicit Student ownership returned by the protected source preparation. */
export const feedbackBindingSchema = z.object({ bindingId: sourceId, learnerId: knowledgeIdSchema, termId: knowledgeIdSchema, blockId: knowledgeIdSchema, goalId: knowledgeIdSchema, familyId: knowledgeIdSchema, scope: capabilityScopeSchema }).strict()
/** Unassociated source facts stay within their original academic owner and never become response evidence. */
export const pendingOpenmaicSchema = z.object({ binding: feedbackBindingSchema, record: officialRuntimeRecordSchema, reason: z.enum(['missing-submission', 'conflicting-submissions', 'ambiguous-session', 'unresolved-question']) }).strict()
/** One complete original event awaiting source or question association. */
export type PendingOpenmaic = z.infer<typeof pendingOpenmaicSchema>
/** Agent advances this business checkpoint only after independent consumer acceptance. */
export const feedbackCheckpointSchema = z.object({ bindingId: sourceId, attempts: z.array(z.object({ attemptId: sourceId, seq: z.number().int().min(-1) }).strict()).max(100) }).strict().superRefine((checkpoint, ctx) => {
  if (new Set(checkpoint.attempts.map(attempt => attempt.attemptId)).size !== checkpoint.attempts.length) ctx.addIssue({ code: 'custom', path: ['attempts'], message: 'Keep one checkpoint head per original attempt.' })
})
/** Parsed frozen official quiz question; passthrough retains source extension fields. */
export const officialQuestionSchema = z.object({ id: sourceId, type: z.enum(['single', 'multiple', 'short_answer']), question: z.string().min(1).max(2000),
  options: z.array(z.object({ value: z.string().max(2000), label: z.string().max(2000) }).passthrough()).max(100).optional(), answer: officialAnswerSchema.optional(), analysis: z.string().max(2000).optional(), commentPrompt: z.string().max(2000).optional(), hasAnswer: z.boolean().optional(), points: z.number().finite().nonnegative().optional(),
}).passthrough()
/** Read-derived outcome; persisted status declarations do not authenticate these facts. */
export type OpenmaicGrading = 'aligned' | 'equivalent' | 'conflict' | 'pending'
/** One independent Host observation from authorized original records and capture metadata. */
export interface OpenmaicInputObservation {
  binding: z.infer<typeof feedbackBindingSchema>; questionId: string; responseId: string
  question: z.infer<typeof openmaicQuestionSchema>; source: z.infer<typeof openmaicResponseSourceSchema>; official?: z.infer<typeof officialReviewSchema>
  officialHistory?: z.infer<typeof officialReviewSchema>[]; answerExposure?: 'possible'
  sourceStatus: 'known' | 'unknown'; reason?: string; result: 'correct' | 'incorrect' | 'partial' | 'unassessed'; grading: OpenmaicGrading
}
/** Source reads expose omissions and failures without changing academic files. */
export interface OpenmaicSourceVerification { bindingId?: string; lessonId: string; learnerId?: string; termId?: string; blockId?: string; status: 'available' | 'unavailable' | 'ownership-unresolved'; reason?: string; failure?: import('./connection.ts').OpenmaicError['code']; consumption?: 'pending' | 'accepted'; pendingCount?: number; conflictCount?: number; omitted: number }
