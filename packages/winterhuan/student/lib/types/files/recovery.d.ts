import { z } from 'zod';
import { type OfficialFile, type TermId } from './schema.ts';
import { type FileIssue } from './validation.ts';
import type { ObservedFile, WorkspaceRead, StudyFiles } from './read.ts';
/**
 * Hash original bytes for backup/source verification and recoverable migration identity.
 * @param bytes - exact observed source bytes, before compatibility transformation.
 * @returns their SHA-256 digest.
 */
export declare function sourceSha256(bytes: Uint8Array): string;
/**
 * Locate stable entity outputs required by a preserved v1 source, allowing subsequent content corrections.
 * @param source - parsed original v1 material whose bytes have been verified independently.
 * @returns official paths required by the migrated term.
 */
export declare function migrationOutputPaths(source: unknown): string[];
/** One proposed migration file; existing valid output is resumed under its original identity. */
export interface MigrationOutput {
    path: string;
    file: OfficialFile;
    status: 'missing' | 'already-valid' | 'conflict';
}
/** Unsupported legacy facts remain located in the preserved source material. */
export interface PendingLegacyFact {
    sourcePath: string;
    row: string;
    fields: string[];
    reason: string;
}
/** Migration description identifies exact source/backup bytes and every independent output. */
export interface MigrationPlan {
    status: 'ready' | 'partial' | 'blocked';
    termId?: TermId;
    sourceSha256: string;
    sourceVersion?: string;
    backupPath?: string;
    outputs: MigrationOutput[];
    pending: PendingLegacyFact[];
    issues: FileIssue[];
}
/**
 * Describe a v1 conversion only after verifying a distinct original-byte backup.
 * @param read - freshly observed, non-mutating legacy read.
 * @param backup - independently observed original-byte backup, never an overwritten existing original.
 * @param existing - independently read existing v2 output for interrupted-operation recovery.
 * @returns stable entities, named unsupported facts and explicit partial/conflicting outputs; performs no writes.
 */
export declare function describeMigration(read: WorkspaceRead, backup: ObservedFile, existing?: readonly {
    path: string;
    file: OfficialFile;
}[]): MigrationPlan;
/** A validated observed-version backup, separate from business authority. */
export declare const backupSchema: z.ZodObject<{
    format: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"observed-version">;
    sourcePath: z.ZodString;
    targetKey: z.ZodString;
    version: z.ZodString;
    observedAt: z.ZodNumber;
    sha256: z.ZodString;
    bytesBase64: z.ZodString;
}, z.core.$strict>;
/** Stored backup bytes and source observation. */
export type ObservedBackup = z.infer<typeof backupSchema>;
/**
 * Inspect existing backup candidates without restoring or deleting original invalid files.
 * @param fs - read-capable workspace adapter.
 * @param signal - cancellation signal.
 * @returns byte-verified backup records and bounded per-file failures.
 */
export declare function readBackups(fs: StudyFiles, signal: AbortSignal): Promise<{
    backups: {
        path: string;
        backup: ObservedBackup;
    }[];
    issues: FileIssue[];
}>;
/**
 * Retain observed valid source bytes with three versions per entity, 128 files and 32 MiB total.
 * @param fs - application adapter with guarded backup writes and deletion.
 * @param read - current consistent validated read; invalid originals are never replaced.
 * @param now - observation clock, distinct from answer time.
 * @param signal - cancellation signal.
 * @returns verified retained candidates and explicit backup failures.
 */
export declare function retainObservedBackups(fs: StudyFiles, read: WorkspaceRead, now: number, signal: AbortSignal): Promise<Awaited<ReturnType<typeof readBackups>>>;
/**
 * Decode byte-verified backup files for available preserved-version comparison.
 * @param backups - explicitly retained observed-version candidates.
 * @returns strict official source files; malformed backups supply no trusted comparison.
 */
export declare function backupVersions(backups: readonly {
    path: string;
    backup: ObservedBackup;
}[]): {
    path: string;
    file: OfficialFile;
}[];
/** Restore is an explicit choice with invalid-current-byte preservation, never an automatic overwrite. */
export interface RestoreDescription {
    status: 'available' | 'blocked';
    destinationPath: string;
    backupPath: string;
    sourceSha256: string;
    preserveCurrent?: {
        path: string;
        version: string;
        sha256: string;
    };
    issues: FileIssue[];
}
/**
 * Validate a chosen restore candidate against independently read current entities.
 * @param read - current files, including invalid original bytes and retained verified observations.
 * @param chosen - explicit user-selected verified backup.
 * @returns destination, preserved-current descriptor and revalidation issues; performs no writes.
 */
export declare function describeRestore(read: WorkspaceRead, chosen: {
    path: string;
    backup: ObservedBackup;
}): RestoreDescription;
/** Independent archive/export and active-term replacement outcomes. */
export interface ArchiveDescription {
    termId: TermId;
    archivePath: string;
    status: 'export-needed' | 'export-valid-active-retained' | 'export-valid-active-unknown' | 'complete' | 'conflict';
    missingPaths: string[];
    issues: FileIssue[];
}
/**
 * Inspect a partial term archive without recreating an existing valid export or changing the active term.
 * @param source - observed source term.
 * @param archive - independently read exported term directory.
 * @param active - current active term after the separate replacement step.
 * @returns stable archive identity, missing outputs and explicit partial outcome.
 */
export declare function describeArchive(source: WorkspaceRead, archive: WorkspaceRead, active: WorkspaceRead): ArchiveDescription | undefined;
//# sourceMappingURL=recovery.d.ts.map