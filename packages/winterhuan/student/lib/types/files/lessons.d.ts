/** Consistent complete reads for the independent OpenMAIC file. No classroom URL earns learner evidence. */
import { type LessonFile, type InteractiveLesson } from '../openmaic.ts';
import type { StudyFiles, FileObservation } from './read.ts';
import type { FileIssue } from './validation.ts';
/** Complete independent lesson-file read, before application display pagination. */
export interface LessonFileRead {
    status: 'valid' | 'missing' | 'invalid' | 'future-format' | 'changing';
    file?: LessonFile;
    validRows?: InteractiveLesson[];
    observation?: FileObservation;
    issues: FileIssue[];
}
/**
 * Validate every lesson row at one bounded actual file version.
 * @param fs - caller's execution-world adapter.
 * @param signal - cancels bounded version rereads.
 * @returns the complete valid file or explicit failure; performs no repairs or cookie reads.
 */
export declare function readLessonFile(fs: StudyFiles, signal: AbortSignal): Promise<LessonFileRead>;
//# sourceMappingURL=lessons.d.ts.map