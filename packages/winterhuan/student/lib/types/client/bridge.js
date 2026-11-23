/** A failed native call retains its request identity for deliberate inspection. */
export class StudySubmissionError extends Error {
    requestId;
    constructor(requestId, reason) {
        super(reason instanceof Error ? reason.message : String(reason));
        this.requestId = requestId;
    }
}
/** Register the native submission echo without changing the user's composer draft. */
export function tutorBridge(context, sessionId, unavailable, failed) {
    return async (text, photo) => {
        const session = context.sessions.binding(sessionId)?.session;
        if (!session)
            throw new Error(unavailable);
        const submission = session.beginSubmission({ mode: 'queue', text, attachments: photo ? [{ type: 'image', value: { previewUrl: photo.preview, name: photo.name } }] : [] });
        try {
            const result = await session.prompt([{ type: 'text', text }, ...(photo ? [{ type: 'image', mediaType: photo.mediaType, data: photo.data, name: photo.name }] : [])], 'queue', undefined, submission.requestId);
            if (!result.ok)
                throw new Error(result.error.message || failed);
            return { requestId: submission.requestId, admission: 'accepted' };
        }
        catch (error) {
            submission.abandon();
            throw new StudySubmissionError(submission.requestId, error);
        }
    };
}
/**
 * Bind original-session controls without creating a user submission or changing the composer.
 * @param context - Client context with native Session bindings and the Student Remote namespace.
 * @param sessionId - original native Session to synchronize or cancel.
 * @param unavailable - localized error when the original Session is no longer available.
 * @returns controls whose rejected calls preserve the remote/native error; synchronization reports admission only.
 */
export function studentSessionBridge(context, sessionId, unavailable) {
    return {
        async syncFeedback(lessonId, trigger) {
            const result = await context.remote.student.syncFeedback(sessionId, { lessonId, trigger }, new AbortController().signal);
            if (!result.ok)
                throw new Error(result.error.message);
            return result.value;
        },
        async cancel() {
            const session = context.sessions.binding(sessionId)?.session;
            if (!session)
                throw new Error(unavailable);
            const result = await session.cancel();
            if (!result.ok)
                throw new Error(result.error.message);
        },
    };
}
//# sourceMappingURL=bridge.js.map