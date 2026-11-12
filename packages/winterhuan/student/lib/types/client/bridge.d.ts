import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Browser image payload follows DSH's native attachment admission path. */
export interface StudyPhoto {
    mediaType: 'image/png' | 'image/jpeg' | 'image/webp';
    data: string;
    preview: string;
    name: string;
}
/** Admission is independent from saved Student responses and assessments. */
export interface StudySubmission {
    requestId: string;
    admission: 'accepted' | 'unknown';
}
export type AskTutor = (text: string, photo?: StudyPhoto) => Promise<StudySubmission | void>;
/** A failed native call retains its request identity for deliberate inspection. */
export declare class StudySubmissionError extends Error {
    readonly requestId: string;
    constructor(requestId: string, reason: unknown);
}
/** Register the native submission echo without changing the user's composer draft. */
export declare function tutorBridge(context: Context, sessionId: SessionId, unavailable: string, failed: string): AskTutor;
//# sourceMappingURL=bridge.d.ts.map