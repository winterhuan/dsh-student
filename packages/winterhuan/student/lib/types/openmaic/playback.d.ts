/** Authorized playback opening preserves original Student lesson and learner ownership. */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
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
/** Browser opening is a Client action, not a model-visible secret exchange. */
export declare class StudentOpenmaicPlayback extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
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