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
        }
        catch (error) {
            submission.abandon();
            throw error;
        }
    };
}
//# sourceMappingURL=bridge.js.map