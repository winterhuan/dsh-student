import type { ErrorType, StudyState } from '../schema.ts';
import { type CurriculumMethod, type CurriculumScope, type CurriculumSubject } from '../curriculum.ts';
import { type CapabilityScope } from '../capabilities.ts';
import type { ValidatedWorkspace } from '../files/validation.ts';
import type { Assessment, LearningRound } from '../files/schema.ts';
import type { WorkspaceRead } from '../files/read.ts';
import type { OpenmaicSourceVerification } from '../openmaic/feedback-schema.ts';
import type { NativeHistoryVerification } from '../native-history.ts';
import type { EffectiveEvidence } from './evidence.ts';
/** Subject display order shared by check-in plans and history. */
export declare const SUBJECT_ORDER: readonly ["chinese", "math", "english"];
/** A goal's evidence within one explicitly selected tested range. */
export interface CapabilityProgress {
    id: string;
    subject: CurriculumSubject;
    title: string;
    scope: CapabilityScope | null;
    level: 'untouched' | 'practising' | 'weak' | 'due' | 'mastered';
    independentDays: string[];
    firstMasteredDay?: string;
    recoveredDay?: string;
    baseline: boolean;
    missingFamilyIds: string[];
    missingCriteria: {
        familyId: string;
        criteria: NonNullable<Assessment['criteria']>;
    }[];
    feedback: {
        termId: string;
        ownerId: string;
        responseId: string;
        familyId: string;
        result: EffectiveEvidence['result'];
        feedback: string;
        errorType?: ErrorType;
        sourceStatus: EffectiveEvidence['sourceStatus'];
        assistance: EffectiveEvidence['assistance'];
        answerDate: EffectiveEvidence['answerDate'];
    }[];
}
/** One continuation selected from validated files for the native tutor and workbench. */
export interface LearningNextAction {
    kind: 'answer' | 'assess' | 'supplement' | 'teach' | 'review' | 'learn' | 'hold';
    reason: 'unfinished-question' | 'pending-assessment' | 'missing-evidence' | 'current-gap' | 'prerequisite-gap' | 'due-review' | 'new-goal' | 'confirmed-scope-required' | 'check-budget-exhausted' | 'round-paused' | 'no-learnable-goal' | 'source-unavailable' | 'source-pending';
    subject: CurriculumSubject;
    title: string;
    goalId?: string;
    familyId?: string;
    scope?: CapabilityScope;
    blockId?: string;
    roundId?: string;
    questionId?: string;
    responseId?: string;
    requirement?: string;
    source?: {
        kind: 'openmaic';
        verification: OpenmaicSourceVerification;
    } | {
        kind: 'native';
        verification: NativeHistoryVerification;
    };
    supplement?: {
        missingFamilyIds: string[];
        missingCriteria: CapabilityProgress['missingCriteria'];
        maxNewQuestions: number;
        remaining: number;
    };
    review?: {
        mistakeIds: string[];
        familyIds: string[];
        remaining: number;
    };
}
/** The persisted round retains its owning block, including when that block has ended. */
export interface LearningRoundView extends LearningRound {
    blockId: string;
    status: 'active' | 'paused' | 'ended';
    limit: 2 | 3;
    remaining: number;
}
/** Actions and allowances are projected together; consumers do not select a second next step. */
export interface LearningContinuation {
    nextAction: LearningNextAction | null;
    goalProgress: CapabilityProgress[];
    round: LearningRoundView | null;
    legalActions: string[];
    reviewRound: {
        limit: 2;
        usedFamilyIds: string[];
        remaining: number;
        backlog: number;
    };
}
/**
 * Continue one current activity, bounded evidence check or review round without a workflow file.
 * @param workspace - independently validated current and explicitly referenced original term files.
 * @param state - shared evidence and review projection.
 * @param now - actual query cutoff.
 * @param subject - optional selected subject; unfinished activity within that subject retains priority.
 * @param sourceVerification - independently read source availability and consumption for the current owner.
 * @returns one permitted action, scoped progress and the current two-mother review allowance.
 */
export declare function learningContinuation(workspace: ValidatedWorkspace, state: StudyState, now: number, subject?: CurriculumSubject, sourceVerification?: WorkspaceRead['sourceVerification']): LearningContinuation;
/** Why an objective needs attention; codes are localized by the workbench and read by the model. */
export interface InsightReason {
    code: 'due-mistakes' | 'open-mistakes' | 'recent-help-or-error' | 'recurring-error' | 'not-practised-recently' | 'not-started' | 'diagnosis-due' | 'preview' | 'school-pace' | 'needs-teaching' | 'prerequisite-gap';
    count: number;
}
/** One objective's mastery derived from saved attempts, paper results and linked mistakes. */
export interface ObjectiveInsight {
    id: string;
    subject: CurriculumSubject;
    title: string;
    goal: string;
    method: CurriculumMethod;
    unit: string;
    unitName: string;
    conceptIds: string[];
    level: 'due' | 'weak' | 'stalled' | 'mastered' | 'practising' | 'untouched';
    independentDays: number;
    attempts: number;
    helpedOrWrong: number;
    lastAt?: number;
    /** Actual day when the latest evidence has day precision rather than an exact instant. */
    lastDay?: string;
    activeMistakes: number;
    dueMistakes: number;
    masteredMistakes: number;
    errorTypes: {
        type: ErrorType;
        count: number;
    }[];
    priority: number;
    reasons: InsightReason[];
}
/** How much one check-in block probes: three quick choice questions, six mixed, or twelve with reasoning and progress re-checks. */
export type CheckInIntensity = 'light' | 'standard' | 'deep';
/** Objectives probed per intensity. */
export declare const checkInSizes: Record<CheckInIntensity, number>;
/** One objective selected for a check-in and why. */
export interface DiagnosticSample {
    id: string;
    title: string;
    unit: string;
    unitName: string;
    reason: 'untouched' | 'stalled' | 'recheck' | 'progress';
}
/** One subject's recurring check-in plan: whether a check-in is due, coverage so far and the objectives to probe per intensity. */
export interface DiagnosticPlan {
    subject: CurriculumSubject;
    due: boolean;
    lastAt?: number;
    nextAt?: number;
    untouched: number;
    stalled: number;
    recheck: number;
    coverage: {
        probed: number;
        total: number;
    };
    recommendedIntensity: CheckInIntensity;
    sample: DiagnosticSample[];
    samples: Record<CheckInIntensity, DiagnosticSample[]>;
    scope?: CurriculumScope & {
        units?: string[] | undefined;
        objectiveIds?: string[] | undefined;
    };
}
/** One recorded check-in block with its answers and counts. */
export interface CheckInRecord {
    subject: CurriculumSubject;
    sessionId: string;
    startedAt: number;
    endedAt: number | null;
    intensity: CheckInIntensity;
    counts: {
        independent: number;
        helped: number;
        wrong: number;
        unassessed: number;
    };
    results: {
        id: string;
        objectiveId: string | null;
        title: string;
        result: StudyState['attempts'][number]['result'];
        assistance: StudyState['attempts'][number]['assistance'];
    }[];
}
/** One non-scored "explain it back" nudge derived from today's evidence; never part of mastery. */
export interface UnderstandingReminder {
    code: 'first-explain' | 'after-correction' | 'before-next';
    subject: CurriculumSubject;
    objectiveId?: string;
    title: string;
}
/** Cross-subject insight: every objective's mastery, the weakest points, check-in plans, the error-cause profile and the next recommended step. */
export interface StudyInsight {
    objectives: ObjectiveInsight[];
    weakPoints: ObjectiveInsight[];
    diagnostics: DiagnosticPlan[];
    recommendation: {
        kind: 'review' | 'practice' | 'diagnose' | 'learn' | 'preview' | 'hold';
        subject: CurriculumSubject;
        objectiveId?: string;
        title?: string;
        reason: InsightReason;
        /** Confirmed school unit name for this subject, when the parent has saved one. */
        unitName?: string;
        /** When practice redirects to an unmet prerequisite, the goal that raised the need. */
        redirectedFrom?: {
            id: string;
            title: string;
        };
    } | null;
    /** At most two due mistakes to clear today. A longer overdue list stays in `dueBacklog`. */
    dueToday: DueClear[];
    /** Confirmed due mistakes inside the suggestion range, including `dueToday`. */
    dueBacklog: number;
    /** The same next step, due list and weak points, limited to one subject for the desk. */
    subjectSteps: Record<CurriculumSubject, SubjectStep>;
    errorProfile: {
        subject: CurriculumSubject;
        type: ErrorType;
        count: number;
        objectiveIds: string[];
    }[];
    understandingReminders: UnderstandingReminder[];
}
/** One subject's desk step: recommendation, the two due clears, and the weak points inside that subject. */
export interface SubjectStep {
    recommendation: StudyInsight['recommendation'];
    dueToday: DueClear[];
    dueBacklog: number;
    weakPoints: ObjectiveInsight[];
}
/** One due mistake the Today page asks the learner to clear. */
export interface DueClear {
    id: string;
    subject: CurriculumSubject;
    topic: string;
    objectiveId?: string;
}
/**
 * Derive mastery, weak points and the next step from saved evidence and the shipped knowledge maps.
 * Confirmed mistakes, independent answers on different days and paper results are the only evidence;
 * a helped or wrong answer counts against independence, and an unassessed answer is not an error.
 * A check-in (diagnose block) is due per subject every fourteen days while untouched, stalled or long-mastered
 * objectives remain to probe; its sample rotates across units. The confirmed school frontier is the default
 * suggestion range, not a hard gate: a session scope (grade, term, units or objective IDs) can override it
 * for cross-grade or custom diagnosis and learning. Without a scope, check-ins, weak points and new goals
 * stay in the confirmed unit and earlier ones; preview, if enabled, offers only the next unit after the
 * current unit has no new goal, and a review week adds no new goal.
 * @param state - current durable learning state.
 * @param now - host wall-clock time in milliseconds.
 * @returns objective insights, the five weakest points, per-subject check-in plans, at most two due clears and one recommendation.
 */
export declare function studyInsight(state: StudyState, now: number): StudyInsight;
/**
 * A check-in plan for an explicit scope: custom objectives, specific units, or a whole cross-grade map.
 * The scope overrides the confirmed school frontier for this plan; the caller may pass a precomputed
 * insight for the same state and time. Objectives outside the profile use the same mastery rule as the
 * current-term insight.
 * @param state - current durable learning state.
 * @param subject - subject to plan for.
 * @param now - host wall-clock time in milliseconds.
 * @param scope - grade and term with optional unit or objective narrowing.
 * @param insight - precomputed insight for the same state and time, when the caller already has one.
 * @returns the plan for the scoped pool.
 */
export declare function diagnosticFor(state: StudyState, subject: CurriculumSubject, now: number, scope: CurriculumScope & {
    units?: string[] | undefined;
    objectiveIds?: string[] | undefined;
}, insight?: StudyInsight): DiagnosticPlan;
/**
 * Compact projection of the insight for the workbench and the status tool.
 * @param insight - full insight for the current state.
 * @returns up to three weak points, per-subject check-in status with the sampled objective IDs, the error-cause
 *   profile, the understanding reminders and the current recommendation.
 */
export declare function insightSummary(insight: StudyInsight): {
    weakPoints: {
        id: string;
        subject: "chinese" | "math" | "english";
        title: string;
        level: "due" | "weak" | "stalled" | "mastered" | "practising" | "untouched";
        priority: number;
        reasons: InsightReason[];
    }[];
    diagnostics: {
        sample: string[];
        nextAt?: number;
        lastAt?: number;
        subject: "chinese" | "math" | "english";
        due: boolean;
    }[];
    recommendation: {
        kind: "review" | "practice" | "diagnose" | "learn" | "preview" | "hold";
        subject: CurriculumSubject;
        objectiveId?: string;
        title?: string;
        reason: InsightReason;
        /** Confirmed school unit name for this subject, when the parent has saved one. */
        unitName?: string;
        /** When practice redirects to an unmet prerequisite, the goal that raised the need. */
        redirectedFrom?: {
            id: string;
            title: string;
        };
    } | null;
    dueToday: DueClear[];
    dueBacklog: number;
    errorProfile: {
        subject: CurriculumSubject;
        type: ErrorType;
        count: number;
        objectiveIds: string[];
    }[];
    understandingReminders: UnderstandingReminder[];
};
//# sourceMappingURL=mastery.d.ts.map