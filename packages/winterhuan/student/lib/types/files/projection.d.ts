/** Compatibility display projection; normalized evidence remains attached to the official read. */
import { type StudyState } from '../schema.ts';
import type { ValidatedWorkspace } from './validation.ts';
/**
 * Project official entities into the existing dashboard's display fields.
 * @param workspace - validated current official files.
 * @param now - explicit query cutoff.
 * @returns display state with the official normalized evidence used by every metric owner.
 */
export declare function projectWorkspace(workspace: ValidatedWorkspace, now: number): StudyState;
//# sourceMappingURL=projection.d.ts.map