import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Browser image payload follows DSH's native attachment admission path. */
export interface StudyPhoto { mediaType: 'image/png' | 'image/jpeg' | 'image/webp'; data: string; preview: string; name: string }
/** Admission is independent from saved Student responses and assessments. */
export interface StudySubmission { requestId: string; admission: 'accepted' | 'unknown' }
export type AskTutor = (text: string, photo?: StudyPhoto) => Promise<StudySubmission | void>

/** A failed native call retains its request identity for deliberate inspection. */
export class StudySubmissionError extends Error {
  constructor(readonly requestId: string, reason: unknown) { super(reason instanceof Error ? reason.message : String(reason)) }
}

/** Register the native submission echo without changing the user's composer draft. */
export function tutorBridge(context: Context, sessionId: SessionId, unavailable: string, failed: string): AskTutor {
  return async (text, photo) => {
    const session = context.sessions.binding(sessionId)?.session
    if (!session) throw new Error(unavailable)
    const submission = session.beginSubmission({ mode: 'queue', text, attachments: photo ? [{ type: 'image', value: { previewUrl: photo.preview, name: photo.name } }] : [] })
    try {
      const result = await session.prompt([{ type: 'text', text }, ...(photo ? [{ type: 'image' as const, mediaType: photo.mediaType, data: photo.data, name: photo.name }] : [])], 'queue', undefined, submission.requestId)
      if (!result.ok) throw new Error(result.error.message || failed)
      return { requestId: submission.requestId, admission: 'accepted' }
    } catch (error) { submission.abandon(); throw new StudySubmissionError(submission.requestId, error) }
  }
}
