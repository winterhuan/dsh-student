/** Bounded consistent discovery and version reads shared by Node CLI and DSH application. */
import type { FsInfo, FsTargetKey, FsVersion, FsWriteIntent } from '@deepseek-ai/dsh-fs';
import { type FileIssue, type ValidatedWorkspace, type NativeInputObservation } from './validation.ts';
import type { OfficialFile } from './schema.ts';
import type { BackupRetentionQueue } from './backup-retention.ts';
import { StudyReadCache } from './cache.ts';
/** Stable observation supplied by the execution-world filesystem. */
export interface FileObservation extends FsInfo {
    targetKey: FsTargetKey;
}
/** Narrow filesystem adapter. Read-only clients omit write and backup facilities. */
export interface StudyFiles {
    /** Cache ownership follows this adapter or its application Host. */
    cache?: StudyReadCache;
    /** Application adapters share the Host's retention queue; read-only adapters omit it. */
    backupRetention?: BackupRetentionQueue;
    stat(path: string, signal: AbortSignal): Promise<FileObservation | undefined>;
    list(path: string, signal: AbortSignal): Promise<{
        name: string;
        type: FsInfo['type'];
    }[]>;
    read(path: string, signal: AbortSignal, limit: number): Promise<Uint8Array>;
    write?(path: string, content: string, intent: FsWriteIntent, signal: AbortSignal): Promise<FsVersion>;
    remove?(path: string, version: FsVersion, signal: AbortSignal): Promise<void>;
}
/** One exact source observation, retaining original bytes for verification and recovery. */
export interface ObservedFile {
    path: string;
    targetKey: FsTargetKey;
    version: FsVersion;
    bytes: Uint8Array;
    file?: OfficialFile;
}
/** Validated read; invalid entities remain inspectable and never acquire a current workspace projection. */
export interface WorkspaceRead {
    /** Derived queries reuse the same adapter's validated source observations. */
    cache?: StudyReadCache;
    status: 'valid' | 'missing' | 'invalid' | 'future-format' | 'changing' | 'legacy' | 'archived';
    files: ObservedFile[];
    membership: {
        path: string;
        names: string[];
    }[];
    issues: FileIssue[];
    /** Backup inspection failures remain independent from official-file validity. */
    backupIssues?: FileIssue[];
    workspace?: ValidatedWorkspace;
    legacy?: unknown;
}
/**
 * Read a stable set of official files, checking membership and actual versions on both sides.
 * @param fs - filesystem adapter in the caller's execution world.
 * @param signal - cancels discovery, bounded rereads and byte reads.
 * @param prior - supplied preserved versions; omitted reads use verified observed-version backups for cold frozen-content checks.
 * @param nativeSources - independently resolved consumed input observations, empty for the read-only CLI.
 * @returns validated facts or an explicit incomplete, invalid or changing result.
 */
export declare function readWorkspace(fs: StudyFiles, signal: AbortSignal, prior?: readonly {
    path: string;
    file: OfficialFile;
}[], nativeSources?: readonly NativeInputObservation[]): Promise<WorkspaceRead>;
//# sourceMappingURL=read.d.ts.map