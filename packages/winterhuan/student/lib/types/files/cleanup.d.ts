/** Explicit cleanup retires only confirmed empty activities and repairs their plan references. */
import type { LearningBlock, DailyPlan, TermSettings } from './schema.ts';
/**
 * Decide whether an ended block contains no learning or pending question evidence.
 * @param block - Complete original record before deletion.
 * @returns Whether this empty activity can be selected for explicit retirement.
 */
export declare function emptyRetiredBlock(block: LearningBlock): boolean;
/**
 * Remove only tasks owned by explicitly retired empty blocks and their local choice references.
 * @param plan - Original plan; the caller retains an exact backup and verifies versions.
 * @param removed - Stable retired block identities.
 * @returns Repaired tasks and choices; no learning outcome is created.
 */
export declare function pruneRetiredPlan(plan: DailyPlan, removed: ReadonlySet<string>): DailyPlan;
/**
 * Identify explicit retired blocks; independent reading verifies every preserved empty source.
 * @param settings - Current formal settings.
 * @returns IDs used solely for cleanup reference reconciliation.
 */
export declare function retiredBlockIds(settings: TermSettings): Set<string>;
//# sourceMappingURL=cleanup.d.ts.map