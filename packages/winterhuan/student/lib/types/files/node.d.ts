import type { StudyFiles } from './read.ts';
/**
 * Create a read-only adapter contained in one local workspace.
 * @param cwd - workspace root; symlink aliases resolve to their actual stable identity.
 * @returns adapter with no business-write or repair capability.
 */
export declare function nodeStudyFiles(cwd: string): StudyFiles;
//# sourceMappingURL=node.d.ts.map