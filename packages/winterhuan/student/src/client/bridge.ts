import { parsePanelIntent, panelDisplay } from '../panel-intent.ts'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@winterhuan/dsh-student/remote'
import type { StudentFeedbackSyncRequest, StudentFeedbackSyncReply } from '../types.ts'
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
    const intent = parsePanelIntent(text)
    const submission = session.beginSubmission({ mode: 'queue', text: intent ? panelDisplay(intent) : text, attachments: photo ? [{ type: 'image', value: { previewUrl: photo.preview, name: photo.name } }] : [] })
    try {
      const result = intent ? await context.remote.student.submitIntent(sessionId, { requestId: submission.requestId, intent, ...(photo ? { photo: { mediaType: photo.mediaType, data: photo.data, name: photo.name } } : {}) }, new AbortController().signal) : await session.prompt([{ type: 'text', text }, ...(photo ? [{ type: 'image' as const, mediaType: photo.mediaType, data: photo.data, name: photo.name }] : [])], 'queue', undefined, submission.requestId)
      if (!result.ok) throw new Error(result.error.message || failed)
      return { requestId: submission.requestId, admission: 'accepted' }
    } catch (error) { submission.abandon(); throw new StudySubmissionError(submission.requestId, error) }
  }
}

/** Native system feedback and cancellation keep the composer and selected pane untouched. */
export interface StudentSessionActions {
  syncFeedback: (lessonId: string, trigger: StudentFeedbackSyncRequest['trigger']) => Promise<StudentFeedbackSyncReply>
  cancel: () => Promise<void>
}

/**
 * Bind original-session controls without creating a user submission or changing the composer.
 * @param context - Client context with native Session bindings and the Student Remote namespace.
 * @param sessionId - original native Session to synchronize or cancel.
 * @param unavailable - localized error when the original Session is no longer available.
 * @returns controls whose rejected calls preserve the remote/native error; synchronization reports admission only.
 */
export function studentSessionBridge(context: Context, sessionId: SessionId, unavailable: string): StudentSessionActions {
  return {
    async syncFeedback(lessonId, trigger) {
      const result = await context.remote.student.syncFeedback(sessionId, { lessonId, trigger }, new AbortController().signal)
      if (!result.ok) throw new Error(result.error.message)
      return result.value
    },
    async cancel() {
      const session = context.sessions.binding(sessionId)?.session
      if (!session) throw new Error(unavailable)
      const result = await session.cancel()
      if (!result.ok) throw new Error(result.error.message)
    },
  }
}
