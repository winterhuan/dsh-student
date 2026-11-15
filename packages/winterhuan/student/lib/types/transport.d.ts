/** Authorized Host reads pair independent native Session observations with shared file validation. */
import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import { type WorkspaceRead } from './files/read.ts';
import { type NativeSourceContext } from './native-source.ts';
import type { FileIssue } from './files/validation.ts';
/** One independently observed Session cut and one validated official-file read. */
export interface StudentWorkspaceRead {
    read: WorkspaceRead;
    native: NativeSourceContext;
    backupIssues: FileIssue[];
}
/**
 * Read official files with receipt observations obtained from the calling Agent's authorized Session service.
 * @param exec - registered execution Agent and caller cancellation; missing source service leaves dates unknown.
 * Receipt matching covers only the calling Session. Earlier-Session responses remain saved, but their dates stay unknown without separately authorized source observations.
 * @returns shared validated facts and explicit native source availability, with no retained Session lease.
 */
export declare function readStudentWorkspace(exec: Pick<ToolExecution, 'agent' | 'signal'>): Promise<StudentWorkspaceRead>;
//# sourceMappingURL=transport.d.ts.map