/** Frozen-instance answer exposure is shared by file validation and effective evidence. */
import type { LearnerResponse, LearningBlock, WorksheetFile } from './schema.ts';
/**
 * Check whether this frozen instance's answer could already have been revealed.
 * @param file - original question and response owner.
 * @param response - answer being assessed, retaining actual date precision.
 * @returns true unless the answer is demonstrably before every explicit reveal and other worked example.
 */
export declare function answerWasExposed(file: LearningBlock | WorksheetFile, response: LearnerResponse): boolean;
//# sourceMappingURL=answer-exposure.d.ts.map