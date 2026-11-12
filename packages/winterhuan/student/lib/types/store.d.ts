import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import { type WorkspaceRead } from './files/read.ts';
import { type StudyState } from './schema.ts';
export { migrateStudyFile } from './files/legacy.ts';
/**
 * Read validated v2 files or preserved legacy v1 bytes in the calling Session's filesystem.
 * Reads preserve absence and legacy bytes; current valid v2 observations can retain bounded backups.
 * @param exec - calling agent and cancellation signal.
 * @returns current projected state, or undefined before setup/after archive.
 * @throws StudyDataUnavailable for invalid current v2 files.
 */
export declare function studyStore(exec: Pick<ToolExecution, 'agent' | 'signal'>): Promise<StudyState | undefined>;
export { queryStudy } from './learning/queries.ts';
/** Invalid current official files keep prior displays stale until an explicit repair is validated. */
export declare class StudyDataUnavailable extends Error {
    readonly read: WorkspaceRead;
    constructor(read: WorkspaceRead);
}
//# sourceMappingURL=store.d.ts.map