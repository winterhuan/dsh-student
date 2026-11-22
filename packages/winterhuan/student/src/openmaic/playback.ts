/** Authorized playback opening preserves original Student lesson and learner ownership. */
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-typert-registry'
import type {} from './service.ts'
import { z } from 'zod'
import { readStudentWorkspace } from '../transport.ts'
import { readInteractiveLessons } from '../openmaic.ts'
import type { StudentSessionId } from '../types.ts'
import type { OpenmaicBrowserResult } from './browser.ts'

declare module '@deepseek-ai/cordis' { interface Context { /** Same-workspace lesson playback through dedicated authenticated Chrome. */ studentOpenmaicPlayback: StudentOpenmaicPlayback } }
/** Safe opening outcome retains pending ownership and parent login failures. */
export type OpenmaicPlaybackResult = OpenmaicBrowserResult | { status: 'unavailable' | 'ownership-unresolved'; reason: string }
/** Browser opening is a Client action, not a model-visible secret exchange. */
export class StudentOpenmaicPlayback extends TypertRemoteService {
  static inject = ['typert', 'agents', 'studentOpenmaic']
  constructor(ctx: Context) { super(ctx, 'studentOpenmaicPlayback') }
  /**
   * Open one independently read lesson after checking original learner, term and block.
   * @param sessionId - Registered main Student conversation identity.
   * @param lessonId - Original agent-authored lesson-log entry.
   * @param signal - Cancellation for independent reads and browser opening.
   * @returns Safe playback, unresolved ownership or recovery outcome.
   */
  @Remote({ resources: { session: sessionId => sessionId } })
  async open(sessionId: StudentSessionId, lessonId: string, signal: AbortSignal): Promise<OpenmaicPlaybackResult> {
    const agent = this.ctx.agents.get(sessionId)
    if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === 'subagent') return { status: 'unavailable', reason: 'Open the original Student conversation to continue this classroom.' }
    const { read } = await readStudentWorkspace({ agent, signal })
    if (!read.workspace) return { status: 'unavailable', reason: 'Restore valid Student files before opening this classroom.' }
    const settings = z.object({ learnerId: z.string(), termId: z.string() }).safeParse(read.workspace.settings)
    const lessons = await readInteractiveLessons(agent, signal, undefined)
    const lesson = lessons.lessons.find(item => item.id === lessonId)
    if (!settings.success || !lesson || !lesson.learnerId || !lesson.termId || !lesson.blockId || !lesson.learnerKey) return { status: 'ownership-unresolved', reason: 'A parent must confirm the original learner and lesson ownership.' }
    const identity = await this.ctx.studentOpenmaic.connection.identity(signal)
    if (lesson.learnerId !== settings.data.learnerId || lesson.termId !== settings.data.termId || lesson.learnerKey !== identity.learnerKey || lesson.base !== identity.baseUrl || !read.workspace.blocks.some(block => block.id === lesson.blockId)) return { status: 'ownership-unresolved', reason: 'The classroom belongs to a different learner, term, block or service.' }
    if (lesson.status !== 'ready' || !lesson.classroomId) return { status: 'unavailable', reason: 'Continue the existing generation job before opening its classroom.' }
    return this.ctx.studentOpenmaic.browser.open(lesson.classroomId, signal)
  }
}
