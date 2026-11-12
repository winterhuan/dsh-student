import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import { type WorkspaceRead } from './files/read.ts';
import { type StudyState } from './schema.ts';
export { migrateStudyFile } from './files/legacy.ts';
/**
 * Read validated v2 entities or read/update legacy .study/state.json in the calling Session's filesystem.
 * Reads preserve absence; legacy writes require the observed version and current sandbox policy.
 * A competing writer causes an error, never an automatic replay of learning evidence.
 * Archiving validates the revision and command before writing; archive creation and state
 * replacement remain separate writes, so a later filesystem failure can leave an archive.
 * Parsed states are cached per observed file version, so unchanged reads skip re-reading
 * and re-validating the file; any write or external change drops the cache entry.
 * @param exec - calling agent and cancellation signal.
 * @param command - optional legacy learning update; omission reads the current state.
 * @param expectedRevision - revision observed by a submitting panel, checked before writing.
 * @returns the current or updated state, or undefined before setup or after a saved archive is read.
 * @throws StudyDataUnavailable for invalid v2 files; v2 mutation commands require the separate manual-save owner.
 */
export declare function studyStore(exec: Pick<ToolExecution, 'agent' | 'signal'>, command?: unknown, expectedRevision?: number): Promise<StudyState | undefined>;
export { queryStudy } from './learning/queries.ts';
/** A stale sidebar must reload before it can change learning evidence. */
export declare class StudyConflict extends Error {
    constructor();
}
/** Invalid current official files keep prior displays stale until an explicit repair is validated. */
export declare class StudyDataUnavailable extends Error {
    readonly read: WorkspaceRead;
    constructor(read: WorkspaceRead);
}
//# sourceMappingURL=store.d.ts.map