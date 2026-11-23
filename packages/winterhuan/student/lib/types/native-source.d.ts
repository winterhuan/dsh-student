/** Exact consumed native input versions from one immutable Session observation. */
import { z } from 'zod';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
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
    learningScope?: NativeInputObservation['learningScope'];
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
/** Log-only Host support; losing this record leaves ordinary native ownership unknown. */
export declare const nativeOwnerCaptureSchema: z.ZodObject<{
    sessionId: z.ZodString;
    turn: z.ZodNumber;
    step: z.ZodNumber;
    receiptSeq: z.ZodNumber;
    messageHash: z.ZodString;
    scope: z.ZodObject<{
        questionId: z.ZodString;
        termId: z.ZodString;
        learnerId: z.ZodString;
        blockId: z.ZodString;
    }, z.core.$strip>;
    questionSnapshot: z.ZodString;
    versions: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        targetKey: z.ZodString;
        version: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
type NativeOwnerCapture = z.infer<typeof nativeOwnerCaptureSchema>;
declare module '@deepseek-ai/dsh-session/types' {
    interface PluginRecordMap {
        'plugin:student/native-owner': NativeOwnerCapture;
    }
}
/**
 * Fingerprint an immutable native input including its identity and attachments.
 * @param message - Complete originally inserted or consumed message.
 * @returns Stable hash for exact receipt and consumption matching.
 */
export declare function nativeMessageHash(message: UserMessage): string;
/**
 * Replay the complete immutable prefix and identify native versions actually consumed in entered steps.
 * @param observation - caller-owned raw observation; this function does not retain or dispose it.
 * @returns bounded text context and exact shared native observations, or explicit unavailability.
 */
export declare function resolveNativeSources(observation: Pick<SessionObservation, 'header' | 'events' | 'cursor' | 'source' | 'inheritedEventCount' | 'revision'>): NativeSourceContext;
export {};
//# sourceMappingURL=native-source.d.ts.map