import type { StudyState } from '../schema.ts';
import { type EvidenceIndex } from './evidence.ts';
/** Existing spaced-review intervals, in days for stages one through four. */
export declare const REVIEW_DAYS: readonly [1, 7, 16, 35];
/** Midnight in the teaching timezone that starts the given calendar day. */
export declare function dayStart(day: string): number;
/** One mistake's earned stage and historical review opportunity within a calendar window. */
export interface MistakeReplay {
    stage: number;
    independentDays: string[];
    dueAt?: number;
    opportunity: boolean;
    completed: boolean;
    consolidatedDay?: string;
}
/**
 * Replay a stable mistake identity, preserving earned stages and conservative same-day difficulty.
 * @param mistake - confirmed mistake declaration.
 * @param index - effective actual-answer facts.
 * @param now - historical/current cutoff.
 * @param windowStart - optional seven-day window start for review completion.
 * @returns earned stage, current due date and one review opportunity/completion per mistake.
 */
export declare function replayMistake(mistake: StudyState['mistakes'][number], index: EvidenceIndex, now: number, windowStart?: number): MistakeReplay;
/**
 * Update display-only review fields through the shared replay owner.
 * @param state - parsed display projection; persisted stages are ignored.
 * @param now - optional explicit cutoff; omission replays every dated effective fact.
 * @returns the same state with derived review fields.
 */
export declare function scheduleMistakes(state: StudyState, now?: number): StudyState;
//# sourceMappingURL=schedule.d.ts.map