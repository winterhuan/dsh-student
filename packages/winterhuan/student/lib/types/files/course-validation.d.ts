import type { LessonFile } from '../openmaic.ts';
import type { ValidatedWorkspace, FileIssue } from './validation.ts';
/**
 * Check directories and activities without deriving mastery from course status.
 * @param file - Structurally valid lesson file.
 * @param workspace - Independently validated academic records.
 * @returns Broken ownership and activity references.
 */
export declare function validateCourseWorkspace(file: LessonFile, workspace: ValidatedWorkspace): FileIssue[];
//# sourceMappingURL=course-validation.d.ts.map