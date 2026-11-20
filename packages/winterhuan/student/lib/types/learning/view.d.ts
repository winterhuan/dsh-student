import type { ErrorType, ExerciseItem, StudyState, UnitFocus, Variant, VariationAxis } from '../schema.ts';
import { type CurriculumRelationKind, type CurriculumScope, type CurriculumSubject } from '../curriculum.ts';
import { type CheckInRecord, type ObjectiveInsight, type StudyInsight } from './mastery.ts';
/**
 * Resolve a learning objective, custom or shipped, across any shipped scope.
 * @param state - current durable learning state.
 * @param objectiveId - objective to resolve.
 * @returns the objective, or undefined when unknown in any shipped map.
 */
export declare function objectiveOf(state: StudyState, objectiveId: string): {
    id: string;
    subject: "chinese" | "math" | "english";
    title: string;
    goal: string;
    conceptIds: string[];
    method: "listen" | "context" | "recognize" | "read-evidence" | "express" | "represent" | "reason" | "verify" | "speak";
    errorTypes?: ("carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete")[] | undefined;
    questionPoints?: string[] | undefined;
    variationAxes?: ("reverse" | "context" | "numbers" | "representation" | "explain")[] | undefined;
} | undefined;
/**
 * Title and subject of a learning objective, custom or shipped, for projections.
 * @param state - current durable learning state.
 * @param objectiveId - objective to resolve.
 * @returns title and subject, or undefined when the objective is unknown in this profile.
 */
export declare function objectiveInfo(state: StudyState, objectiveId: string): {
    title: string;
    subject: CurriculumSubject;
} | undefined;
export type Worksheet = StudyState['worksheets'][number];
export type WorksheetItem = Worksheet['items'][number];
/** Published question goals are frozen; legacy items can use only their saved sheet goal. */
export declare function itemObjectiveId(_state: StudyState, worksheet: Pick<Worksheet, 'objectiveId'>, item: Pick<WorksheetItem, 'objectiveId' | 'mistakeId'>): string | undefined;
export declare function questionObjectiveId(state: StudyState, worksheet: Worksheet, itemId: string): string | undefined;
/** A printed sheet still waiting for at least one graded question. Discarded sheets never wait. */
export declare function sheetOpen(state: StudyState, worksheet: Worksheet): boolean;
/** Combine workspace-saved exercises and shipped exercises for one objective, workspace first. */
export declare function exercisesFor(state: StudyState, objectiveId: string): ExerciseItem[];
/** The elements a review or daily question can draw on for one objective, shipped or custom. */
export interface ObjectiveElements {
    facts: string[];
    misconceptions: string[];
    examples: string[];
    errorTypes: ErrorType[];
    questionPoints: string[];
    variationAxes: VariationAxis[];
    /** Three hint rungs for an ordinary try: point at the givens, check the registered slip, then the steps. */
    hintLadder: [string, string, string];
    /** Structured reference exercises for this objective (workspace-saved and shipped). */
    exercises: ExerciseItem[];
}
/**
 * Elements for one objective: its concepts' misconceptions and examples plus the objective's own error
 * causes, question points, variation axes and structured exercises. Shipped objectives read the same-term
 * knowledge map; custom objectives read the workspace's confirmed concepts and the objective record.
 * @param state - current durable learning state.
 * @param objectiveId - objective to describe.
 * @returns the merged elements, or undefined for an unknown objective.
 */
export declare function objectiveElements(state: StudyState, objectiveId: string): ObjectiveElements | undefined;
/** One review question to write: the confirmed mistake it targets, its ladder level and what went wrong. */
export interface ReviewPick {
    kind: 'mistake';
    id: string;
    objectiveId: string;
    objectiveTitle: string;
    topic: string;
    prompt: string;
    learnerAnswer: string;
    correction: string;
    explanation: string;
    stage: number;
    dueToday: boolean;
    variantLevel: Variant;
    errorType?: ErrorType;
    elements?: ObjectiveElements;
    referenceExercise?: ExerciseItem;
}
/** One weak goal to re-ask on the same sheet with a fresh variant when no due mistake covers it. */
export interface ObjectiveFill {
    kind: 'objective';
    id: string;
    objectiveId: string;
    title: string;
    level: ObjectiveInsight['level'];
    variantLevel: Variant;
    elements?: ObjectiveElements;
    referenceExercise?: ExerciseItem;
}
/**
 * Mistakes for the next printed review sheet of one subject: confirmed, goal-linked mistakes due today or
 * tomorrow, lowest review stage first, at most two per error cause, one question each, none already printed on
 * a sheet that is still ungraded, and none behind the parent-confirmed class frontier. Two of the sheet's slots
 * stay for weak goals without a due mistake, returned as objective fills. Due mistakes without a goal are
 * listed so they can be classified first.
 * @param state - current durable learning state.
 * @param subject - subject of the sheet.
 * @param now - host time.
 * @param size - most questions on one sheet.
 * @param insight - precomputed insight for the same state and time, when the caller already has it.
 * @returns picks, objective fills, error-cause coverage, and the open-sheet and unlinked summaries.
 */
export declare function reviewPlan(state: StudyState, subject: CurriculumSubject, now: number, size?: number, insight?: StudyInsight): {
    subject: "chinese" | "math" | "english";
    picks: ReviewPick[];
    objectiveFills: ObjectiveFill[];
    errorCoverage: {
        type: "carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete";
        count: number;
    }[];
    remaining: number;
    unlinkedDue: string[];
    openSheets: {
        id: string;
        createdAt: number;
        items: number;
        graded: number;
    }[];
};
/** One knowledge point with mastery rolled up from the objectives that teach it. */
export interface ConceptView {
    id: string;
    name: string;
    unit: string;
    definition: string;
    example: string;
    source: string;
    ideaIds?: string[];
    facts?: string[];
    level: ObjectiveInsight['level'];
    objectiveIds: string[];
    independentDays: number;
    attempts: number;
    activeMistakes: number;
    dueMistakes: number;
    lastAt?: number;
}
/** One unit's knowledge-point counts by mastery state. */
export interface UnitView {
    id: string;
    name: string;
    summary: string;
    focus?: UnitFocus;
    concepts: number;
    mastered: number;
    learning: number;
    weak: number;
    due: number;
    untouched: number;
}
/** One concept: what a mathematical or language idea means, apart from the lesson that teaches it. */
export interface IdeaView {
    id: string;
    name: string;
    definition: string;
    example: string;
}
/** The shipped knowledge map for one subject with mastery overlaid. */
export interface CurriculumView {
    id: string;
    title: string;
    basis: string;
    units: UnitView[];
    ideas: IdeaView[];
    concepts: ConceptView[];
    objectives: ObjectiveInsight[];
    relations: {
        id: string;
        fromId: string;
        toId: string;
        kind: CurriculumRelationKind;
        explanation: string;
    }[];
    summary: {
        concepts: number;
        objectives: number;
        mastered: number;
        practising: number;
        weak: number;
        due: number;
        stalled: number;
        untouched: number;
    };
    scope: {
        grade: number;
        term: 'first' | 'second';
        current: boolean;
    };
    order: string[];
    /** True when heavy collections (concepts, relations, ideas, order) were dropped for a lighter payload. */
    lite: boolean;
}
/**
 * Project one subject's shipped knowledge map with mastery overlaid.
 * @param state - current durable learning state, providing grade and term.
 * @param subject - subject to project.
 * @param insight - insight computed for the same state and time.
 * @param scope - grade and term to browse; defaults to the profile, the only scope that carries mastery.
 * @returns the map view, or null outside grades one and two.
 */
export declare function curriculumView(state: StudyState, subject: CurriculumSubject, insight: StudyInsight, scope?: CurriculumScope): CurriculumView | null;
/**
 * Recent check-in blocks per subject, newest first, with per-answer results and counts.
 * @param state - current durable learning state.
 * @param limitPerSubject - how many recent blocks to keep for each subject.
 * @returns check-in records across the three subjects.
 */
export declare function checkInHistory(state: StudyState, limitPerSubject?: number): CheckInRecord[];
//# sourceMappingURL=view.d.ts.map