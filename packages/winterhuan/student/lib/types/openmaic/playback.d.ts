import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { OpenmaicGenerationResult } from './generation.ts';
import type { StudentSessionId } from '../types.ts';
import type { OpenmaicBrowserResult } from './browser.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        studentOpenmaicPlayback: StudentOpenmaicPlayback;
    }
}
/** Safe opening outcome retains pending ownership and parent login failures. */
export type OpenmaicPlaybackResult = OpenmaicBrowserResult | {
    status: 'unavailable' | 'ownership-unresolved';
    reason: string;
};
/** Live transport state is displayed without overwriting agent-authored learning files. */
export type LessonGenerationStatus = {
    checkedAt: number;
    result?: OpenmaicGenerationResult;
    failure?: string;
};
/** Browser opening is a Client action, not a model-visible secret exchange. */
export declare class StudentOpenmaicPlayback extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
    /** Read a versioned teaching card without model inference or learning writes.
     * @param sessionId - Authorized main session.
     * @param miniId - Saved mini-lesson identity; never an arbitrary path.
     * @param signal - Cancels bounded content reads.
     * @returns Verified original HTML for sandboxed display.
     */
    mini(sessionId: StudentSessionId, miniId: string, signal: AbortSignal): Promise<{
        id: string;
        html: string;
    }>;
    /** Poll an existing authorized job without inference or academic writes.
     * @param sessionId - Authorized main session.
     * @param lessonId - Saved lesson identity.
     * @param signal - Cancels transport polling.
     * @returns Real transport result or a safe recovery reason and check time.
     */
    progress(sessionId: StudentSessionId, lessonId: string, signal: AbortSignal): Promise<LessonGenerationStatus>;
    /**
     * Open one independently read lesson after checking original learner, term and block.
     * @param sessionId - Registered main Student conversation identity.
     * @param lessonId - Original agent-authored lesson-log entry.
     * @param signal - Cancellation for independent reads and browser opening.
     * @returns Safe playback, unresolved ownership or recovery outcome.
     */
    open(sessionId: StudentSessionId, lessonId: string, signal: AbortSignal): Promise<OpenmaicPlaybackResult>;
}
//# sourceMappingURL=playback.d.ts.map