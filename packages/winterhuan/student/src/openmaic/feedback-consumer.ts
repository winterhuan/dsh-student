/** Independent file consumption checks original official tuples and grading before business progress advances. */
import { z } from 'zod'
import { canonical } from '../learning/shared.ts'
import { questionSchema, type LearningBlock, type WorksheetFile, type LearnerResponse, type Assessment } from '../files/schema.ts'
import type { ValidatedWorkspace } from '../files/validation.ts'
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
  const binding = observation.binding
  if (observation.sourceStatus !== 'known' || file.learnerId !== binding.learnerId || file.termId !== binding.termId || file.kind !== 'block' || file.id !== binding.blockId || response.id !== observation.responseId || question.id !== observation.questionId || response.questionId !== question.id || response.rawResponse !== JSON.stringify(observation.source.submittedAnswer) || canonical(response.source) !== canonical(observation.source) || canonical(question) !== canonical(openmaicAcademicQuestion(observation))) return false
  if (canonical(assessment?.official) !== canonical(observation.official) || canonical(assessment?.officialHistory) !== canonical(observation.officialHistory)) return false
  if (assessment && (assessment.result !== observation.result || assessment.grading !== observation.grading)) return false
  return true
}
/**
 * Inspect saved import completion; source uncertainty and invalid/partial writes leave the previous checkpoint.
 * @param workspace - Independently validated exact file read.
 * @param source - Fresh original runtime observation, never an agent-created verified marker.
 * @returns Candidate checkpoint and missing/conflicting response identities; performs no business write.
 */
export function consumeOpenmaicFeedback(workspace: ValidatedWorkspace, source: OpenmaicFeedbackRead) {
  const missingResponseIds: string[] = [], conflicts: string[] = []
  for (const observation of source.observations) {
    const file = workspace.blocks.find(block => block.id === observation.binding.blockId && block.termId === observation.binding.termId)
    const response = file?.responses.find(response => response.id === observation.responseId)
    const question = file?.questions.find(question => question.id === observation.questionId)
    const assessment = file?.assessments.find(assessment => assessment.responseId === response?.id)
    if (!file || !response || !question || !assessment || !matchOpenmaicResponse(observation, file, response, question, assessment)) missingResponseIds.push(observation.responseId)
    if (observation.grading === 'conflict' || observation.sourceStatus === 'unknown') conflicts.push(observation.responseId)
  }
  return { status: missingResponseIds.length || conflicts.length || source.omitted ? 'pending' as const : 'accepted' as const, checkpoint: source.checkpoint, missingResponseIds, conflicts }
}
