import type { StudyFiles } from '../files/read.ts';
import type { InteractiveLesson, LessonFile } from '../openmaic.ts';
import type { CourseReviewInput } from './review.ts';
/** Read the exact retained material and bind review to all authoring inputs.
 * @param files - Contained workspace filesystem.
 * @param workspace - Authorized original workspace identity.
 * @param lesson - Validated original lesson with question plan.
 * @param log - Course directory retaining the material revision.
 * @param signal - Cancels bounded source read.
 * @returns Review input with verified full UTF-8 material, never a claimed excerpt alone.
 */
export declare function courseReviewInput(files: StudyFiles, workspace: string, lesson: InteractiveLesson, log: LessonFile, signal: AbortSignal): Promise<CourseReviewInput>;
/** Compare frozen questions with the complete current classroom, rejecting edited or unbound quizzes.
 * @param input - Review input with independently fetched current scenes and original capture.
 * @returns Whether every current quiz exactly matches its original frozen snapshot.
 */
export declare function reviewQuestionsCurrent(input: CourseReviewInput): boolean;
/** Compose the external teaching contract without internal mastery rubrics or draft reasoning.
 * @param input - Independently loaded plan and material approved before submission.
 * @returns Bounded official requirement with a single authoritative assessment list.
 */
export declare function reviewedCourseRequirement(input: CourseReviewInput): string;
//# sourceMappingURL=review-input.d.ts.map