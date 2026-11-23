import type { Context } from '@deepseek-ai/cordis';
import type { StudentFeedbackSyncRequest, StudentFeedbackSyncReply } from '../types.ts';
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
/** Native system feedback and cancellation keep the composer and selected pane untouched. */
export interface StudentSessionActions {
    syncFeedback: (lessonId: string, trigger: StudentFeedbackSyncRequest['trigger']) => Promise<StudentFeedbackSyncReply>;
    cancel: () => Promise<void>;
}
/**
 * Bind original-session controls without creating a user submission or changing the composer.
 * @param context - Client context with native Session bindings and the Student Remote namespace.
 * @param sessionId - original native Session to synchronize or cancel.
 * @param unavailable - localized error when the original Session is no longer available.
 * @returns controls whose rejected calls preserve the remote/native error; synchronization reports admission only.
 */
export declare function studentSessionBridge(context: Context, sessionId: SessionId, unavailable: string): StudentSessionActions;
//# sourceMappingURL=bridge.d.ts.map