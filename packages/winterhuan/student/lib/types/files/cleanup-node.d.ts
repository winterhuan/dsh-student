/**
 * Delete explicitly selected ended empty blocks; preserve complete backup and all real evidence.
 * @param cwd - Offline workspace with its owning service stopped.
 * @param ids - Confirmed abandoned block identities, never inferred from an empty lesson index.
 * @returns Exact deleted and modified paths and the retained rollback directory.
 */
export declare function cleanupEmptyActivities(cwd: string, ids: readonly string[]): Promise<{
    deleted: string[];
    modified: string[];
    backup?: string;
}>;
//# sourceMappingURL=cleanup-node.d.ts.map