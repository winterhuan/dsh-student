import type { UpdateContext } from './index.ts';
import type { StudyState } from '../../schema.ts';
/** Open the next question inside the active block; an unanswered question can be replaced when skipping or switching tasks. */
export declare function applyTask(ctx: UpdateContext<'task'>): StudyState;
/** Save the raw answer or raise the hint level of the current task. */
export declare function applyAnswerOrHint(ctx: UpdateContext<'answer' | 'hint'>): StudyState;
/** Record 不会 on the current task as a stuck attempt. */
export declare function applyStuck(ctx: UpdateContext<'stuck'>): StudyState;
/** Start one learning block, automatically closing any earlier open block and archiving a reused session id. */
export declare function applyStart(ctx: UpdateContext<'start'>): StudyState;
/** Record one assessed attempt against the saved task or sheet. */
export declare function applyRecord(ctx: UpdateContext<'record'>): StudyState;
/** End a block and record elapsed time and rewards. */
export declare function applyStop(ctx: UpdateContext<'stop'>): StudyState;
//# sourceMappingURL=session.d.ts.map