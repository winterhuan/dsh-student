/** Validated source and query caches belong to a Host instance or one read-only adapter. */
import type { FsVersion } from '@deepseek-ai/dsh-fs';
import type { OfficialFile } from './schema.ts';
import type { ObservedBackup } from './recovery.ts';
import type { StudyState } from '../schema.ts';
import type { weeklySummary } from '../learning/status.ts';
/** A version-bound compatibility projection and its bounded query results. */
export interface WorkspaceProjectionCache {
    signature: string;
    state: StudyState;
    at: number;
    refreshAfter: number;
    summary?: ReturnType<typeof weeklySummary>;
    queries: Map<string, Record<string, unknown>>;
}
/** Read-only adapters retain their own observations; application adapters share a disposable Host owner. */
export declare class StudyReadCache {
    readonly files: Map<string, {
        version: FsVersion;
        bytes: Uint8Array;
        value: unknown;
        file?: OfficialFile;
    }>;
    readonly backups: Map<string, {
        version: string;
        backup: ObservedBackup;
    }>;
    readonly queries: Map<string, WorkspaceProjectionCache>;
    readonly legacy: Map<string, {
        version: string;
        state: StudyState;
    }>;
    readonly entities: Map<string, {
        signature: string;
        state: StudyState;
        at: number;
        refreshAfter: number;
    }>;
    /** Release retained source bytes and every derived projection together. */
    clear(): void;
}
//# sourceMappingURL=cache.d.ts.map