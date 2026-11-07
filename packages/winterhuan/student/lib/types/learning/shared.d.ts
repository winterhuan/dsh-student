import type { StudyState } from '../schema.ts';
import { type CurriculumMethod, type CurriculumScope, type CurriculumSubject } from '../curriculum.ts';
/** Time and size constants shared by schedule maths, status text and update handlers. */
export declare const MINUTE = 60000;
export declare const DAY = 86400000;
export declare const OFFSET: number;
/** Calendar day for the Shanghai teaching profile, independent of the host timezone. */
export declare function studyDay(at: number): string;
export declare function requireValue(condition: unknown, message: string): asserts condition;
/** Key order is not part of a record. Retries that only reorder fields match. */
export declare function canonical(value: unknown): string;
export declare function sameScope(a: StudyState['profile'], b: StudyState['materials'][number]['scope']): boolean;
export declare function spent(session: StudyState['sessions'][number], now: number): number;
/** Case, width and surrounding space are not part of a choice or a copied question. */
export declare function foldText(value: string): string;
export declare function formatDuration(ms: number): string;
/** Clock time in the Shanghai teaching zone, independent of the host timezone. */
export declare function beijingClock(at: number): string;
export declare function showValue(value: unknown): string;
/**
 * Match a learner's choice to one published option.
 * Letter forms use A for the first option. An ambiguous fold matches none.
 * @param choices - options in display order.
 * @param input - the learner's text after schema trimming.
 * @returns the published option, or undefined when none fits.
 */
export declare function matchChoice(choices: readonly string[], input: string): string | undefined;
export declare function choiceMismatch(choices: readonly string[], input: string): string;
export declare function sameSavedAnswer(task: {
    response?: string | undefined;
    rawResponse?: string | undefined;
    choices?: string[] | undefined;
}, incoming: string): boolean;
export type AttemptInput = StudyState['attempts'][number];
export declare function todaySpent(state: StudyState, now: number): number;
export declare function activeSession(state: StudyState): {
    id: string;
    subject: "chinese" | "math" | "english";
    mode: "review" | "diagnose" | "foundation" | "school" | "explore";
    startedAt: number;
    intensity?: "light" | "standard" | "deep" | undefined;
    endedAt?: number | undefined;
    spentMs?: number | undefined;
    materialId?: string | undefined;
    unit?: string | undefined;
    reflection?: string | undefined;
    scope?: {
        grade: number;
        term: "first" | "second";
        units?: string[] | undefined;
        objectiveIds?: string[] | undefined;
    } | undefined;
} | undefined;
/** Parent-confirmed class frontier; the default suggestion range, not a hard gate. Absent progress leaves the whole map in scope. */
export declare function schoolGate(state: StudyState, subject: CurriculumSubject): {
    posture: "keep-up" | "catch-up";
    pace: "review" | "teaching";
    previewUnit?: string;
    taught: Set<string>;
    current: string;
} | undefined;
/**
 * Whether a map unit may be suggested, sampled, or asked about.
 * An explicit session scope overrides the confirmed school frontier; absent both, the whole map is in scope.
 * @param state - current durable learning state.
 * @param subject - subject the unit belongs to.
 * @param unit - map unit id, or '' for a custom goal.
 * @param scope - optional session scope selecting a grade, term and units.
 * @returns whether the unit is in scope.
 */
export declare function taughtUnit(state: StudyState, subject: CurriculumSubject, unit: string, scope?: CurriculumScope & {
    units?: string[] | undefined;
}): boolean;
/**
 * Whether a session scope selects an objective: by explicit ID, by unit, or by grade/term map.
 * @param scope - session scope from the start command.
 * @param subject - subject the objective belongs to.
 * @param unit - map unit id, or '' for a custom goal.
 * @param objectiveId - objective to test.
 * @returns whether the objective is in scope.
 */
export declare function scopeSelects(scope: {
    grade: number;
    term: 'first' | 'second';
    units?: string[] | undefined;
    objectiveIds?: string[] | undefined;
}, subject: CurriculumSubject, unit: string, objectiveId: string): boolean;
export type Outcome = {
    at: number;
    result: string;
    assistance: string;
};
/** One objective's identity fields, shared by shipped and custom objectives in the insight. */
export type ObjectiveBase = {
    id: string;
    subject: CurriculumSubject;
    title: string;
    goal: string;
    method: CurriculumMethod;
    unit: string;
    unitName: string;
    conceptIds: string[];
};
//# sourceMappingURL=shared.d.ts.map