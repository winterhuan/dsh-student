/** Explicit original Session references are independently authorized before bounded public history reads. */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { WorkspaceRead } from './files/read.ts';
import type { NativeInputObservation } from './files/validation.ts';
/** A historical source failure is distinct from file validity and never redirects to today's Session. */
export interface NativeHistoryVerification {
    sessionId: string;
    status: 'available' | 'unavailable';
    reason?: string;
}
/**
 * Verify explicitly referenced original native inputs without activating any historical Agent.
 * @param agent - Authorized calling main Agent and filesystem provider.
 * @param read - Validated current/explicitly referenced archive entities.
 * @param signal - Caller cancellation; a bounded deadline also applies to history reads.
 * @param invocation - Current Remote context for prior-Session permission checks; native calls use their existing Agent ownership and omit it.
 * @returns Referenced exact original tuples and explicit per-source failures; normal public decoding is provider-owned.
 */
export declare function readNativeHistory(agent: Agent, read: WorkspaceRead, signal: AbortSignal, invocation?: Context): Promise<{
    observations: NativeInputObservation[];
    verification: NativeHistoryVerification[];
    recheck: () => Promise<void>;
}>;
//# sourceMappingURL=native-history.d.ts.map