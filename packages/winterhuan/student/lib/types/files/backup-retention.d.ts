/** Host-lifetime serialization keeps independently observed backup versions within shared bounds. */
import { Service, type Context } from '@deepseek-ai/cordis';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** One queue owner shared by application reads and manual saves. */
        studentBackups: StudyBackupRetention;
    }
}
/** Per-workspace retention owner; read-only adapters have none. */
export interface BackupRetentionQueue {
    /**
     * Serialize a complete backup read/prune/write operation for one actual workspace identity.
     * @param identity - current settings file's filesystem target identity.
     * @param operation - complete retention operation, awaited before the next starts.
     * @param signal - cancellation checked after the predecessor settles.
     * @returns the operation result, or rejection when canceled or the owner is disposing.
     */
    run<T>(identity: string, operation: (signal: AbortSignal) => Promise<T>, signal: AbortSignal): Promise<T>;
}
/** Serializes retention and waits for all owned operations during Host teardown. */
export declare class StudyBackupRetention extends Service implements BackupRetentionQueue {
    private readonly tails;
    private readonly lifetime;
    /** @param ctx - Host context whose lifetime owns all backup operations. */
    constructor(ctx: Context);
    run<T>(identity: string, operation: (signal: AbortSignal) => Promise<T>, signal: AbortSignal): Promise<T>;
}
//# sourceMappingURL=backup-retention.d.ts.map