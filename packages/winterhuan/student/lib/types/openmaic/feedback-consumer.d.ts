/** Independent file consumption checks original official tuples and grading before business progress advances. */
import { z } from 'zod';
import { questionSchema, type LearningBlock, type WorksheetFile, type LearnerResponse, type Assessment } from '../files/schema.ts';
import type { ValidatedWorkspace, NativeInputObservation } from '../files/validation.ts';
import { type OpenmaicInputObservation } from './feedback-schema.ts';
import type { OpenmaicFeedbackRead } from './feedback.ts';
/**
 * Return authoring content from an independently captured source, without writing a file.
 * @param observation - Original authorized source tuple and immutable question snapshot.
 * @returns A formal question ready for native agent authoring; unavailable content is explicitly pending.
 */
export declare function openmaicAcademicQuestion(observation: Pick<OpenmaicInputObservation, 'binding' | 'questionId' | 'question'>): z.infer<typeof questionSchema>;
/**
 * Match original source, learner/scope and frozen academic content independently of agent-written status flags.
 * @param observation - Host reread original source.
 * @param file - Validated original owner.
 * @param response - Saved immutable answer.
 * @param question - Saved frozen question.
 * @param assessment - Saved current assessment when available.
 * @returns Exact source/content/official-grading match; pending or conflicting effective grades remain separate.
 */
export declare function matchOpenmaicResponse(observation: OpenmaicInputObservation, file: LearningBlock | WorksheetFile, response: LearnerResponse, question: z.infer<typeof questionSchema>, assessment?: Assessment): boolean;
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
export declare function effectiveOpenmaicAssessment(observation: OpenmaicInputObservation, file: LearningBlock | WorksheetFile, response: LearnerResponse, question: z.infer<typeof questionSchema>, assessment: Assessment | undefined, nativeSources?: readonly NativeInputObservation[]): {
    result: OpenmaicInputObservation['result'];
    grading: OpenmaicInputObservation['grading'];
};
/**
 * Inspect complete saved coverage; unresolved original facts may be acknowledged without granting evidence.
 * @param workspace - Independently validated exact file read.
 * @param source - Fresh original runtime observation, never an agent-created verified marker.
 * @returns Candidate checkpoint and missing/conflicting response identities; performs no business write.
 */
export declare function consumeOpenmaicFeedback(workspace: ValidatedWorkspace, source: OpenmaicFeedbackRead): {
    status: 'pending' | 'accepted';
    checkpoint: OpenmaicFeedbackRead['checkpoint'];
    missingResponseIds: string[];
    missingPendingIds: string[];
    conflicts: string[];
};
//# sourceMappingURL=feedback-consumer.d.ts.map