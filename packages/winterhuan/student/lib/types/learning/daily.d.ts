import type { DailyPlan, DailyTask } from '../files/schema.ts';
import type { WorkspaceRead } from '../files/read.ts';
import type { StudyState } from '../schema.ts';
import type { CurriculumSubject } from '../curriculum.ts';
import { type LearningNextAction } from './mastery.ts';
/** An executable suggestion and the original evidence explaining it. */
export interface DailySuggestion {
    task: DailyTask;
    nextAction: LearningNextAction;
}
interface DailyOutcomes {
    attempted: number;
    independent: number;
    helped: number;
    pending: number;
    consolidate: number;
}
/** Read-only daily flow, shared by the native tutor and learner page. */
export interface DailyLearning {
    day: string;
    phase: 'home' | 'learning' | 'summary';
    saved: DailyPlan | null;
    preview: DailyPlan | null;
    suggestions: DailySuggestion[];
    recommended: DailySuggestion[];
    currentTaskId: string | null;
    tasks: {
        task: DailyTask;
        title: string;
        attempted: number;
        independent: number;
        helped: number;
        pending: number;
        consolidate: number;
        invalidScope: boolean;
        preparationIncomplete: boolean;
    }[];
    summary: (DailyOutcomes & {
        subject: CurriculumSubject;
        topics: (DailyOutcomes & {
            title: string;
        })[];
    })[];
    completionPending: boolean;
    missingSubjects: CurriculumSubject[];
    nextAction: LearningNextAction | null;
    confirmedScopes: NonNullable<import('../files/schema.ts').TermSettings['learningScopes']>;
    scopeSuggestions: {
        subject: CurriculumSubject;
        goalIds: string[];
        scope: NonNullable<DailyTask['scope']>;
        titles: string[];
    }[];
}
/** Recommend from actual answers; opening this projection never writes or starts teaching. */
export declare function dailyLearning(read: WorkspaceRead, state: StudyState, now: number, selectedSubject?: CurriculumSubject, requestedDay?: string): DailyLearning;
export {};
//# sourceMappingURL=daily.d.ts.map