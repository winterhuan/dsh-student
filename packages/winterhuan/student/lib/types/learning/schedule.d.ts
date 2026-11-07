import type { StudyState } from '../schema.ts';
/** Midnight in the teaching timezone that starts the given calendar day. */
export declare function dayStart(day: string): number;
/**
 * Replay every confirmed mistake's review evidence: answers that cite it and paper results on items that cite it.
 * A mistake is due from the calendar day after confirmation or after the last wrong answer, not at a clock time.
 * Wrong, partial or helped answers keep the stage and only make it due again the next day. An independent correct
 * answer on any day, earlier than the due day included, advances it at most once per day; the next due day counts
 * from that answer along the 1 / 7 / 16 / 35-day curve.
 * Stage 4 (a 35-day interval) is consolidated.
 */
export declare function scheduleMistakes(state: StudyState): StudyState;
//# sourceMappingURL=schedule.d.ts.map