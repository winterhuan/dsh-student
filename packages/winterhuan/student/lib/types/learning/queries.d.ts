/** Read-only application and CLI queries consume the same validated entity files. */
import type { WorkspaceRead, ObservedFile } from '../files/read.ts';
import type { FileIssue } from '../files/validation.ts';
import type { TermSettings } from '../files/schema.ts';
import type { StudyState } from '../schema.ts';
import { dashboard } from '../dashboard.ts';
import type { InteractiveLessons } from '../openmaic.ts';
/** Bounded read query; an explicit clock belongs to the caller. */
export interface WorkspaceQuery {
    kind: 'learning-context' | 'summary' | 'files' | 'settings' | 'status' | 'curriculum' | 'elements' | 'exercises' | 'review-sheet' | 'diagnose' | 'weak' | 'due' | 'pending' | 'progress' | 'concepts' | 'objectives' | 'relations' | 'worksheets' | 'paper-results' | 'materials' | 'mistakes' | 'sessions' | 'attempts';
    subject?: 'math' | 'chinese' | 'english';
    id?: string;
    unit?: string;
    grade?: number;
    term?: 'first' | 'second';
    offset?: number;
}
/** Dynamic CLI projection; typed page consumers use queryDashboard and the validated file DTOs. */
export interface WorkspaceQueryResult<T = unknown> {
    status: WorkspaceRead['status'] | 'partial';
    versions: Pick<ObservedFile, 'path' | 'targetKey' | 'version'>[];
    issues?: FileIssue[];
    refreshAfter?: number;
    data?: T;
}
/**
 * Query current validated facts. Settings and materials remain explicitly partial when unrelated entities fail.
 * @param read - one consistent workspace read.
 * @param request - bounded projection selector.
 * @param now - caller's clock in milliseconds.
 * @returns the requested projection, source versions and next refresh time; cached nested values are read-only to callers.
 */
export declare function queryWorkspace(read: WorkspaceRead, request: WorkspaceQuery & {
    kind: 'settings';
}, now: number): WorkspaceQueryResult<TermSettings>;
/**
 * Query current validated facts; incomplete evidence never produces a complete statistics projection.
 * @param read - one consistent workspace read.
 * @param request - bounded projection selector.
 * @param now - caller's clock in milliseconds.
 * @returns requested data, explicit partial or failure status, versions and next refresh time.
 */
export declare function queryWorkspace(read: WorkspaceRead, request: WorkspaceQuery, now: number): WorkspaceQueryResult;
/**
 * Bounded history and status queries. Only the requested collection is computed; offset pagination applies to every collection.
 * @param state - current durable learning state, or undefined before setup.
 * @param kind - record collection or projection to read.
 * @param offset - zero-based collection offset.
 * @param options - optional exact record ID, subject and unit filters, grade/term for browsing another knowledge map or a cross-grade check-in plan.
 * @param now - explicit query clock; legacy tool callers default to the host clock.
 * @returns the projection or one page of records.
 */
export declare function queryStudy(state: StudyState | undefined, kind: string, offset: number, options?: {
    id?: string;
    subject?: 'chinese' | 'math' | 'english';
    unit?: string;
    grade?: number;
    term?: 'first' | 'second';
}, now?: number): Record<string, unknown>;
/**
 * Compute the next relevant evidence, diagnosis, due-date or Shanghai-day refresh.
 * @param state - current normalized display state.
 * @param now - explicit query clock.
 * @returns the earliest future projection threshold in milliseconds.
 */
export declare function nextRefreshAfter(state: StudyState, now: number): number;
/**
 * Reuse expensive map/mastery projections until an actual file version or time threshold changes.
 * @param state - version-cached current state, or undefined before setup.
 * @param now - explicit query clock.
 * @param options - selected page and scope.
 * @param lessons - independently read external-classroom projection.
 * @returns current elapsed fields, summary minutes and cached business projections with refreshAfter.
 */
export declare function queryDashboard(state: StudyState | undefined, now: number, options?: Parameters<typeof dashboard>[2], lessons?: InteractiveLessons): ReturnType<typeof dashboard> & {
    refreshAfter: number;
};
//# sourceMappingURL=queries.d.ts.map