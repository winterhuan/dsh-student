import type { SessionObservation } from '@deepseek-ai/dsh-session-query';
import type { NativeInputObservation } from './files/validation.ts';
/** Independently observed Session cut; it is separate from official-file versions. */
export interface NativeSourceCut {
    sessionId: string;
    cursor: number;
    source: 'live' | 'prepared';
    inheritedEventCount: number;
    revision?: string;
}
/** Receipt time is known only for an exactly claimed and consumed continuous input version. */
export type NativeReceipt = {
    kind: 'known';
    at: number;
    seq: number;
} | {
    kind: 'unknown';
    reason: string;
};
/** Bounded consumed text context, with a version of the complete source and attachment snapshot. */
export interface NativeConsumedInput {
    status: 'consumed';
    messageId: string;
    requestId?: string;
    inputVersion: string;
    consumedSeq: number;
    rawResponse?: string;
    textUnavailable?: string;
    receipt: NativeReceipt;
    attachments: {
        kind: 'image' | 'file';
        attachmentId: string;
    }[];
    omittedAttachments: number;
}
/** A logged inbox insertion establishes admission, while consumption and removal remain separate states. */
export interface NativeAdmission {
    messageId: string;
    requestId?: string;
    status: 'pending' | 'claimed' | 'consumed' | 'removed';
}
/** Source reconstruction failure stops all independently trusted receipt observations. */
export interface NativeSourceContext {
    status: 'available' | 'unavailable';
    cut?: NativeSourceCut;
    inputs: NativeConsumedInput[];
    admissions: NativeAdmission[];
    observations: NativeInputObservation[];
    omitted: number;
    omittedAdmissions: number;
    reason?: string;
}
/**
 * Replay the complete immutable prefix and identify native versions actually consumed in entered steps.
 * @param observation - caller-owned raw observation; this function does not retain or dispose it.
 * @returns bounded text context and exact shared native observations, or explicit unavailability.
 */
export declare function resolveNativeSources(observation: Pick<SessionObservation, 'header' | 'events' | 'cursor' | 'source' | 'inheritedEventCount' | 'revision'>): NativeSourceContext;
//# sourceMappingURL=native-source.d.ts.map