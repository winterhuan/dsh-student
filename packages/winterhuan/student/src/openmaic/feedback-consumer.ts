/** Independent file consumption checks original official tuples and grading before business progress advances. */
import { z } from 'zod'
import { canonical } from '../learning/shared.ts'
import { questionSchema, type LearningBlock, type WorksheetFile, type LearnerResponse, type Assessment } from '../files/schema.ts'
import type { ValidatedWorkspace, NativeInputObservation } from '../files/validation.ts'
import { officialQuestionSchema, type OpenmaicInputObservation } from './feedback-schema.ts'
import type { OpenmaicFeedbackRead } from './feedback.ts'
/**
 * Return authoring content from an independently captured source, without writing a file.
 * @param observation - Original authorized source tuple and immutable question snapshot.
 * @returns A formal question ready for native agent authoring; unavailable content is explicitly pending.
 */
export function openmaicAcademicQuestion(observation: Pick<OpenmaicInputObservation, 'binding' | 'questionId' | 'question'>): z.infer<typeof questionSchema> {
  const source = officialQuestionSchema.safeParse(observation.question.snapshot)
  const question = source.success ? source.data : undefined
  return questionSchema.parse({ id: observation.questionId, objectiveId: observation.binding.goalId,
    capability: { goalId: observation.binding.goalId, familyId: observation.binding.familyId, scope: observation.binding.scope },
    source: { kind: 'authored', description: 'Original authorized OpenMAIC question snapshot.' }, topic: observation.binding.goalId,
    prompt: question?.question ?? 'Historical question content is unavailable; preserve the original source answer for review.',
    answer: question?.answer !== undefined ? JSON.stringify(question.answer) : 'No frozen answer key; assessment remains pending.',
    explanation: question?.analysis || 'Check the original capability criterion before evaluating this response.',
    answerEvidence: question?.commentPrompt || question?.analysis || 'Use the original frozen answer criterion; source grading alone is insufficient.',
    ...(question?.options && question.options.length >= 2 && question.options.length <= 4 ? { choices: question.options.map(option => option.label) } : {}), openmaic: observation.question })
}
/**
 * Match original source, learner/scope and frozen academic content independently of agent-written status flags.
 * @param observation - Host reread original source.
 * @param file - Validated original owner.
 * @param response - Saved immutable answer.
 * @param question - Saved frozen question.
 * @param assessment - Saved current assessment when available.
 * @returns Exact source/content/official-grading match; pending or conflicting effective grades remain separate.
 */
export function matchOpenmaicResponse(observation: OpenmaicInputObservation, file: LearningBlock | WorksheetFile, response: LearnerResponse, question: z.infer<typeof questionSchema>, assessment?: Assessment): boolean {
  return observation.sourceStatus === 'known' && matchesStoredOpenmaic(observation, file, response, question, assessment)
}
function matchesStoredOpenmaic(observation: OpenmaicInputObservation, file: LearningBlock | WorksheetFile, response: LearnerResponse, question: z.infer<typeof questionSchema>, assessment?: Assessment): boolean {
  const binding = observation.binding
  if (file.learnerId !== binding.learnerId || file.termId !== binding.termId || file.kind !== 'block' || file.id !== binding.blockId || response.id !== observation.responseId || question.id !== observation.questionId || response.questionId !== question.id || response.rawResponse !== JSON.stringify(observation.source.submittedAnswer) || canonical(response.source) !== canonical(observation.source) || canonical(question) !== canonical(openmaicAcademicQuestion(observation))) return false
  if (canonical(assessment?.official) !== canonical(observation.official) || canonical(assessment?.officialHistory) !== canonical(observation.officialHistory)) return false
  return true
}
const correctionSchema = z.object({ learnerId: z.string().min(1), termId: z.string().min(1), blockId: z.string().min(1), responseId: z.string().min(1), questionId: z.string().min(1), snapshotHash: z.string().regex(/^[a-f0-9]{64}$/u), submittedAnswer: z.union([z.string(), z.array(z.string())]), result: z.enum(['correct', 'unassessed']), criterion: z.string().min(1).max(2000), parentConfirmation: z.string().min(1).max(2000) }).strict()
/**
 * Resolve the effective grade separately from original-source authentication.
 * @param observation - Fresh authorized original submission and frozen criterion.
 * @param file - Original block owner.
 * @param response - Immutable original answer.
 * @param question - Immutable original question.
 * @param assessment - Current saved assessment and optional parent-native reference.
 * @param nativeSources - Independently consumed exact user input versions.
 * @returns Authorized correction or the independently checked grade; unsupported declarations remain pending.
 */
export function effectiveOpenmaicAssessment(observation: OpenmaicInputObservation, file: LearningBlock | WorksheetFile, response: LearnerResponse, question: z.infer<typeof questionSchema>, assessment: Assessment | undefined, nativeSources: readonly NativeInputObservation[] = []): { result: OpenmaicInputObservation['result']; grading: OpenmaicInputObservation['grading'] } {
  if (!matchOpenmaicResponse(observation, file, response, question, assessment)) return { result: 'unassessed', grading: 'pending' }
  const correction = assessment?.criterionCorrection
  if (correction && nativeSources.some(input => input.sessionId === correction.sessionId && input.messageId === correction.messageId && input.inputVersion === correction.inputVersion && input.rawResponse === correction.rawResponse)) {
    const text = /^Student grading correction:\n([^\n]+)$/u.exec(correction.rawResponse)?.[1]
    try {
      const decision = text && correctionSchema.safeParse(JSON.parse(text))
      if (decision && decision.success && file.kind === 'block' && decision.data.learnerId === file.learnerId && decision.data.termId === file.termId && decision.data.blockId === file.id && decision.data.responseId === response.id && decision.data.questionId === question.id && decision.data.snapshotHash === observation.question.snapshotHash && canonical(decision.data.submittedAnswer) === canonical(observation.source.submittedAnswer) && assessment.feedback === decision.data.criterion && assessment.result === decision.data.result && assessment.grading === (decision.data.result === 'correct' ? 'equivalent' : 'pending')) return { result: decision.data.result, grading: assessment.grading }
    } catch { /* Invalid or changed native confirmation cannot authorize grading. */ }
  }
  return assessment?.result === observation.result && assessment.grading === observation.grading ? { result: observation.result, grading: observation.grading } : { result: 'unassessed', grading: 'pending' }
}
/**
 * Inspect complete saved coverage; unresolved original facts may be acknowledged without granting evidence.
 * @param workspace - Independently validated exact file read.
 * @param source - Fresh original runtime observation, never an agent-created verified marker.
 * @returns Candidate checkpoint and missing/conflicting response identities; performs no business write.
 */
export function consumeOpenmaicFeedback(workspace: ValidatedWorkspace, source: OpenmaicFeedbackRead): { status: 'pending' | 'accepted'; checkpoint: OpenmaicFeedbackRead['checkpoint']; missingResponseIds: string[]; missingPendingIds: string[]; conflicts: string[] } {
  const missingResponseIds: string[] = [], conflicts: string[] = []
  for (const observation of source.observations) {
    const file = workspace.blocks.find(block => block.id === observation.binding.blockId && block.termId === observation.binding.termId)
    const response = file?.responses.find(response => response.id === observation.responseId)
    const question = file?.questions.find(question => question.id === observation.questionId)
    const assessment = file?.assessments.find(assessment => assessment.responseId === response?.id)
    const effective = file && response && question ? effectiveOpenmaicAssessment(observation, file, response, question, assessment, workspace.nativeSources) : undefined
    if (!file || !response || !question || !assessment || !matchesStoredOpenmaic(observation, file, response, question, assessment) || assessment.result !== effective?.result || assessment.grading !== effective.grading) missingResponseIds.push(observation.responseId)
    if (!effective || effective.grading === 'conflict' || effective.grading === 'pending' || observation.sourceStatus === 'unknown') conflicts.push(observation.responseId)
  }
  const missingPendingIds = source.pending.filter(pending => !workspace.blocks.some(block => block.learnerId === pending.binding.learnerId && block.termId === pending.binding.termId && block.id === pending.binding.blockId && block.pendingOpenmaic?.some(saved => canonical(saved) === canonical(pending)))).map(pending => canonical([pending.binding.bindingId, pending.record.sessionId, pending.record.id]))
  return { status: missingResponseIds.length || missingPendingIds.length || source.omitted ? 'pending' as const : 'accepted' as const, checkpoint: source.checkpoint, missingResponseIds, missingPendingIds, conflicts }
}
