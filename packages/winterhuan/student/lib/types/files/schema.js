/** Strict official Student files. Entity identity is independent of file observation and business revision. */
import { z } from 'zod';
import { openmaicResponseSourceSchema, openmaicQuestionSchema, officialReviewSchema, pendingOpenmaicSchema } from "../openmaic/feedback-schema.js";
import { knowledgeIdSchema, capabilityScopeSchema, knowledgeExtensionSchema, capabilityBindingSchema } from "../capability-schema.js";
import { stateSchema, figureSchema, phaseSchema, variantSchema, errorTypeSchema, sheetKindSchema } from "../schema.js";
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const text = z.string().min(1).max(2000);
const time = z.number().int().nonnegative().max(8_640_000_000_000_000);
const subject = z.enum(['chinese', 'math', 'english']);
const learnerId = id.transform(value => value);
const termId = id.transform(value => value);
const blockId = id.transform(value => value);
const worksheetId = id.transform(value => value);
const responseId = id.transform(value => value);
const base = { format: z.literal(2), termId, learnerId: learnerId.optional() };
const scope = stateSchema.shape.sessions.element.shape.scope.unwrap();
/** Known assistance and unknown assistance remain separate from correctness. */
export const assistanceSchema = z.enum(['independent', 'hint', 'worked-example', 'unknown']);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).refine(value => {
    const parsed = Date.parse(`${value}T00:00:00+08:00`);
    return Number.isFinite(parsed) && new Date(parsed + 28_800_000).toISOString().slice(0, 10) === value;
}, 'Use an actual calendar date.');
/** Actual answer time; parent day precision never supplies a within-day order. */
export const answerDateSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('unknown') }).strict(),
    z.object({ kind: z.literal('day'), day, parentConfirmation: text }).strict(),
    z.object({ kind: z.literal('instant'), at: time, basis: z.enum(['native-input', 'current-manual']), sourceVersion: text }).strict(),
]);
/** Native input version or preserved source; missing receipt matching is explicitly unknown. */
export const responseSourceSchema = z.discriminatedUnion('kind', [
    openmaicResponseSourceSchema,
    z.object({ kind: z.literal('unknown') }).strict(),
    z.object({ kind: z.literal('native'), sessionId: text, messageId: text, inputVersion: text, receiptAt: time.optional(), attachments: z.array(text).max(8).optional() }).strict(),
    z.object({ kind: z.literal('paper'), imagePaths: z.array(text).max(8), parentConfirmation: text }).strict(),
    z.object({ kind: z.literal('manual'), entry: z.enum(['current', 'historical']), parentConfirmation: text }).strict(),
    z.object({ kind: z.literal('legacy'), sourcePath: text, row: text }).strict(),
]);
const target = z.union([knowledgeIdSchema, z.object({ kind: z.literal('pending'), reason: text }).strict()]);
/** Published question source, including unresolved legacy material. */
export const questionSourceSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('authored'), description: text }).strict(),
    z.object({ kind: z.literal('exercise'), exerciseId: id, description: text }).strict(),
    z.object({ kind: z.literal('mistake'), mistakeId: id, description: text }).strict(),
    z.object({ kind: z.literal('legacy'), sourcePath: text, row: text }).strict(),
]);
export { capabilityBindingSchema };
/** A persisted allowance counts entered mothers and presented instances, independently of answer evidence. */
export const learningRoundSchema = z.object({
    id, kind: z.enum(['check', 'review']), startedAt: time,
    members: z.array(capabilityBindingSchema.extend({ mistakeId: id.optional() })).min(1).max(3),
    enteredFamilyIds: z.array(knowledgeIdSchema).max(3), presentedQuestionIds: z.array(id).max(200),
    endedAt: time.optional(), endReason: z.enum(['complete', 'budget-exhausted', 'stopped']).optional(),
    moreReview: z.object({ afterRoundId: id, request: text }).strict().optional(),
}).strict();
/** References reuse original archived responses without copying or changing their dates. */
export const archiveEvidenceReferenceSchema = z.object({ learnerId, termId, ownerKind: z.enum(['block', 'worksheet']), ownerId: id, responseId, goalId: knowledgeIdSchema, scope: capabilityScopeSchema,
    review: z.object({ mistakeId: id, stage: z.number().int().min(0).max(4), dueAt: time, independentDays: z.array(day).max(1000) }).strict().optional(),
}).strict();
/** Published question content reused by blocks and worksheets, including every supported figure. */
export const questionSchema = z.object({ id, objectiveId: target, capability: capabilityBindingSchema.optional(), mistakeId: id.optional(), source: questionSourceSchema,
    topic: text, prompt: text, answer: text, explanation: text, answerEvidence: text, openmaic: openmaicQuestionSchema.optional(),
    basisStatus: z.literal('legacy-pending').optional(), legacyRecord: z.json().optional(),
    choices: z.array(text).min(2).max(4).optional(), steps: z.array(text.max(240)).min(2).max(5).optional(),
    figure: figureSchema.optional(), phase: phaseSchema.optional(), variant: variantSchema.optional(), space: z.enum(['none', 'line', 'lines', 'box']).optional(),
}).strict();
/** Original learner wording and its actual date; assessments cannot replace these fields. */
export const responseSchema = z.object({ id: responseId, questionId: id, rawResponse: text, response: text.optional(), legacyRecord: z.json().optional(), assistance: assistanceSchema,
    assistanceConfirmation: text.optional(),
    answerDateConfirmation: text.optional(),
    answerDate: answerDateSchema.optional(), source: responseSourceSchema }).strict();
/** The current assessment of one response. A correction replaces this entry under the same response identity. */
export const assessmentSchema = z.object({ id, responseId, result: z.enum(['correct', 'partial', 'incorrect', 'unassessed', 'stuck']),
    assistance: assistanceSchema, feedback: text, answerEvidence: text, assessedAt: time, correctedAt: time.optional(),
    criteria: z.array(z.enum(['basic', 'method', 'variation'])).min(1).max(3).optional(),
    criterionCorrection: z.object({ sessionId: text, messageId: text, inputVersion: text, rawResponse: text }).strict().optional(),
    userConfirmation: text.optional(), errorType: errorTypeSchema.optional(), official: officialReviewSchema.optional(), officialHistory: z.array(officialReviewSchema).max(2000).optional(), grading: z.enum(['aligned', 'equivalent', 'conflict', 'pending']).optional() }).strict();
const pending = z.object({ sourcePath: text, row: text, fields: z.array(text).min(1).max(20), reason: text }).strict();
/** One term owns profile, material, course and compound school-progress settings. */
export const termSettingsSchema = z.object({ ...base, kind: z.literal('term-settings'), revision: time, updatedAt: time,
    profile: stateSchema.shape.profile.extend({ parentConfirmation: text }), materials: stateSchema.shape.materials,
    courses: z.array(stateSchema.shape.courses.element.extend({ parentConfirmation: text })).max(3),
    learningScopes: z.array(z.object({ subject, goalIds: z.array(knowledgeIdSchema).min(1).max(100).optional(), scope: capabilityScopeSchema, parentConfirmation: text }).strict()).max(30).optional(),
    interests: stateSchema.shape.interests, openmaic: stateSchema.shape.openmaic, archivedAt: time.optional(),
    evidenceReferences: z.array(archiveEvidenceReferenceSchema).max(20000).optional(),
    migration: z.object({ sourcePath: text, sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u), backupPath: text }).strict().optional(),
}).strict();
/** One block owns its historical course context, questions, responses, hints and assessments. */
export const blockSchema = z.object({ ...base, kind: z.literal('block'), id: blockId, subject,
    mode: stateSchema.shape.sessions.element.shape.mode, intensity: stateSchema.shape.sessions.element.shape.intensity,
    startedAt: time, endedAt: time.optional(), spentMs: time.optional(), reflection: z.string().max(2000).optional(),
    context: z.object({ profile: stateSchema.shape.profile.optional(), pendingProfile: text.optional(), scope: scope.optional(), material: stateSchema.shape.materials.element.optional() }).strict(),
    currentQuestionId: id.optional(), questions: z.array(questionSchema).max(200), responses: z.array(responseSchema).max(500),
    currentResponseId: responseId.optional(),
    rounds: z.array(learningRoundSchema).max(100).optional(),
    answerReveals: z.array(z.object({ questionId: id, at: time }).strict()).max(200).optional(),
    hints: z.array(z.object({ questionId: id, responseId: responseId.optional(), level: z.number().int().min(1).max(3), at: time }).strict()).max(500),
    stuckSignals: z.array(z.object({ questionId: id, at: time }).strict()).max(200).optional(),
    assessments: z.array(assessmentSchema).max(500), pendingLegacy: z.array(pending).max(500).optional(), pendingOpenmaic: z.array(pendingOpenmaicSchema).max(2000).optional(),
}).strict();
/** One worksheet owns frozen question targets, photo drafts and all confirmed workbook outcomes. */
export const worksheetSchema = z.object({ ...base, kind: z.literal('worksheet'), id: worksheetId, subject,
    worksheetKind: sheetKindSchema.optional(), origin: z.enum(['prepared', 'workbook']), createdAt: time, discardedAt: time.optional(), archivedAt: time.optional(),
    context: z.object({ profile: stateSchema.shape.profile.optional(), pendingProfile: text.optional(), scope: scope.optional() }).strict(),
    answerDate: answerDateSchema.optional(), items: z.array(questionSchema).min(1).max(8), responses: z.array(responseSchema).max(500),
    assessments: z.array(assessmentSchema).max(500), drafts: z.array(z.object({ id, questionId: id, response: text, result: assessmentSchema.shape.result,
        assistance: assistanceSchema, confidence: z.enum(['high', 'low']), uncertainties: z.string().max(2000), imagePaths: z.array(text).max(8), receivedAt: time,
    }).strict()).max(500), pendingLegacy: z.array(pending).max(500).optional(),
}).strict();
/** Bounded non-block collections with explicit ownership; rewards have one calendar day/reason identity. */
export const collectionsSchema = z.object({ ...base, kind: z.literal('collections'),
    knowledge: knowledgeExtensionSchema.optional(),
    legacyHistory: z.array(z.object({ sourcePath: text, row: text, record: z.json() }).strict()).max(20000).optional(),
    legacyReferences: z.array(z.object({ kind: z.enum(['objective', 'exercise']), oldId: knowledgeIdSchema, status: z.enum(['pending', 'review-required']), candidateGoalIds: z.array(knowledgeIdSchema).max(100),
        routes: z.array(z.object({ goalId: knowledgeIdSchema, familyId: knowledgeIdSchema }).strict()).max(100), reason: text }).strict()).max(5000).optional(),
    mistakes: z.array(stateSchema.shape.mistakes.element.omit({ stage: true, independentDays: true, dueAt: true })).max(5000),
    exercises: stateSchema.shape.exercises, concepts: stateSchema.shape.concepts, objectives: stateSchema.shape.objectives,
    relations: stateSchema.shape.relations, teachingQueue: stateSchema.shape.teachingQueue, rewards: z.array(stateSchema.shape.rewards.element.extend({ day })).max(1000),
    pendingLegacy: z.array(pending).max(5000).optional(),
}).strict();
/** Machine-readable file definitions shared by CLI, application reads and manual saves. */
export const officialFileSchemas = { 'term-settings': termSettingsSchema, block: blockSchema, worksheet: worksheetSchema, collections: collectionsSchema };
/**
 * Locate an original archived entity using validated identities; response selection remains explicit.
 * @param reference - same-learner earlier-term reference.
 * @returns controlled workspace-relative original owner path, without copying evidence.
 */
export function archiveEvidencePath(reference) {
    const valid = archiveEvidenceReferenceSchema.parse(reference);
    return `.study/archives/${valid.termId}/${valid.ownerKind === 'block' ? 'blocks' : 'worksheets'}/${valid.ownerId}.json`;
}
//# sourceMappingURL=schema.js.map