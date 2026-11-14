import type { ErrorType, StudyState } from '../schema.ts';
import { type StudyInsight } from './mastery.ts';
/** Current session state: either ready to start or actively studying. */
export type StudyPhase = 'ready' | 'studying';
/** Elapsed time summary for the current block and today. */
export interface TimeStatus {
    phase: StudyPhase;
    time: {
        timezone: 'Asia/Shanghai';
        blockElapsed: string | null;
        todayElapsed: string;
    };
}
/**
 * Elapsed clocks for the current block and today, computed from sessions only.
 * Reading never closes a session.
 */
export declare function timeStatus(state: StudyState, now: number): TimeStatus;
/**
 * Summarize elapsed time, course confirmation, rewards and evidence-derived progress.
 * Reading does not close a session; stop records when the learner actually stopped.
 */
export declare function studyStatus(state: StudyState, now: number): {
    active: {
        id: string;
        subject: "chinese" | "math" | "english";
        mode: "review" | "foundation" | "school" | "explore" | "diagnose";
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
    } | null;
    openmaic: {
        baseUrl: string;
        savedBaseUrl: string;
        lessonsPath: string;
        cookiePath: string;
    };
    courses: {
        subject: "chinese" | "math" | "english";
        materialId: string;
        unit: string;
        parentConfirmation: string;
        progress?: {
            unitId: string;
            confirmedAt: number;
            posture: "keep-up" | "catch-up";
            preview: boolean;
            pace: "teaching" | "review";
        } | undefined;
    }[];
    unconfirmedSubjects: string[];
    stars: number;
    todayStars: number;
    dueMistakes: {
        id: string;
        subject: "chinese" | "math" | "english";
        topic: string;
    }[];
    pendingMistakes: string[];
    progress: {
        level: string;
        subject: string;
        topic: string;
        materialId?: string;
        objectiveId?: string;
        attempts: number;
        independentDays: string[];
    }[];
    phase: StudyPhase;
    time: {
        timezone: "Asia/Shanghai";
        blockElapsed: string | null;
        todayElapsed: string;
    };
    task: {
        id: string;
        sessionId: string;
        subject: "chinese" | "math" | "english";
        topic: string;
        prompt: string;
        hintLevel: number;
        choices?: string[] | undefined;
        steps?: string[] | undefined;
        phase?: "demo" | "try" | "vary" | "guide" | undefined;
        variant?: "numeric" | "context" | "reasoning" | undefined;
        mistakeId?: string | undefined;
        objectiveId?: string | undefined;
        figure?: {
            kind: "bar-model";
            bars: {
                name: string;
                segments: {
                    label: string;
                    units: number;
                    style?: "solid" | "dashed" | undefined;
                }[];
                total?: string | undefined;
            }[];
        } | {
            kind: "money";
            items: ("1分" | "2分" | "5分" | "1角" | "2角" | "5角" | "1元" | "5元" | "10元" | "20元" | "50元" | "100元" | {
                denomination: "1分" | "2分" | "5分" | "1角" | "2角" | "5角" | "1元" | "5元" | "10元" | "20元" | "50元" | "100元";
                count: number;
            })[];
        } | {
            kind: "place-value";
            tens: number;
            ones: number;
            crossTens: number;
            crossOnes: number;
            regroup: "yes" | "no";
        } | {
            kind: "hundred-chart";
            hidden?: number[] | undefined;
            window?: {
                center: number;
            } | undefined;
        } | {
            kind: "number-line";
            from: number;
            to: number;
            step: number;
            marks?: {
                value: number;
                label?: string | undefined;
            }[] | undefined;
            jumps?: {
                from: number;
                to: number;
                label?: string | undefined;
            }[] | undefined;
        } | {
            kind: "clock";
            clocks: {
                hour: number;
                minute: number;
            }[];
        } | {
            kind: "sticks";
            bundles: number;
            singles: number;
            crossBundles?: number | undefined;
            crossSingles?: number | undefined;
        } | {
            kind: "vertical";
            count: number;
        } | {
            kind: "shapes";
            rows: {
                name: string;
                shape: "circle" | "square" | "triangle";
                count: number;
                blank: number;
            }[];
        } | {
            kind: "overlap";
            left: string;
            right: string;
            leftOnly: string;
            both: string;
            rightOnly: string;
            total?: string | undefined;
        } | {
            kind: "split";
            parts: {
                top: string;
                left: string;
                right: string;
            }[];
        } | {
            kind: "sequence";
            items: {
                shape: "circle" | "square" | "triangle" | "star";
                count: number;
            }[];
            blank?: number | undefined;
        } | {
            kind: "wall";
            rows: string[][];
        } | {
            kind: "grid";
            rows: {
                cells: string[];
                name?: string | undefined;
            }[];
            columns?: string[] | undefined;
        } | {
            kind: "dot-array";
            rows: number;
            columns: number;
            total?: string | undefined;
        } | {
            kind: "plane";
            items: {
                shape: "circle" | "square" | "triangle" | "rectangle" | "quadrilateral" | "curved";
                count: number;
            }[];
            mark: "yes" | "no";
        } | {
            kind: "solid";
            items: {
                shape: "cube" | "cuboid" | "cylinder" | "sphere";
                count: number;
            }[];
            mark: "yes" | "no";
        } | {
            kind: "counter";
            hundreds: number;
            tens: number;
            ones: number;
        } | {
            kind: "measure";
            bars: {
                name: string;
                length: number;
                style?: "curved" | "straight" | undefined;
            }[];
            ruler: "yes" | "no";
        } | {
            kind: "compass";
            blank: "yes" | "no";
        } | {
            kind: "balance";
            left: string;
            right: string;
            tilt: "left" | "right" | "level";
        } | {
            kind: "writing";
            style: "tianzige" | "fourline";
            count?: number | undefined;
            example?: string | undefined;
        } | {
            kind: "sketch";
            height: number;
            elements: ({
                draw: "line";
                from: {
                    x: number;
                    y: number;
                };
                to: {
                    x: number;
                    y: number;
                };
            } | {
                draw: "polyline";
                points: {
                    x: number;
                    y: number;
                }[];
                closed?: "yes" | "no" | undefined;
            } | {
                draw: "rect";
                x: number;
                y: number;
                width: number;
                height: number;
            } | {
                draw: "circle";
                x: number;
                y: number;
                radius: number;
            } | {
                draw: "text";
                x: number;
                y: number;
                label: string;
                align?: "center" | "left" | undefined;
            } | {
                draw: "arrow";
                from: {
                    x: number;
                    y: number;
                };
                to: {
                    x: number;
                    y: number;
                };
            })[];
        } | undefined;
        response?: string | undefined;
        rawResponse?: string | undefined;
        answeredAt?: number | undefined;
        responseId?: string | undefined;
        stuck?: boolean | undefined;
    } | null;
    feedback: {
        result: "correct" | "partial" | "incorrect" | "unassessed" | "stuck";
        assistance: "unknown" | "independent" | "hint" | "worked-example";
        id: string;
        sessionId: string;
        subject: "chinese" | "math" | "english";
        topic: string;
        prompt: string;
        response: string;
        feedback: string;
        answerEvidence: string;
        at: number;
        mistakeId?: string | undefined;
        objectiveId?: string | undefined;
        variant?: "numeric" | "context" | "reasoning" | undefined;
        figure?: {
            kind: "bar-model";
            bars: {
                name: string;
                segments: {
                    label: string;
                    units: number;
                    style?: "solid" | "dashed" | undefined;
                }[];
                total?: string | undefined;
            }[];
        } | {
            kind: "money";
            items: ("1分" | "2分" | "5分" | "1角" | "2角" | "5角" | "1元" | "5元" | "10元" | "20元" | "50元" | "100元" | {
                denomination: "1分" | "2分" | "5分" | "1角" | "2角" | "5角" | "1元" | "5元" | "10元" | "20元" | "50元" | "100元";
                count: number;
            })[];
        } | {
            kind: "place-value";
            tens: number;
            ones: number;
            crossTens: number;
            crossOnes: number;
            regroup: "yes" | "no";
        } | {
            kind: "hundred-chart";
            hidden?: number[] | undefined;
            window?: {
                center: number;
            } | undefined;
        } | {
            kind: "number-line";
            from: number;
            to: number;
            step: number;
            marks?: {
                value: number;
                label?: string | undefined;
            }[] | undefined;
            jumps?: {
                from: number;
                to: number;
                label?: string | undefined;
            }[] | undefined;
        } | {
            kind: "clock";
            clocks: {
                hour: number;
                minute: number;
            }[];
        } | {
            kind: "sticks";
            bundles: number;
            singles: number;
            crossBundles?: number | undefined;
            crossSingles?: number | undefined;
        } | {
            kind: "vertical";
            count: number;
        } | {
            kind: "shapes";
            rows: {
                name: string;
                shape: "circle" | "square" | "triangle";
                count: number;
                blank: number;
            }[];
        } | {
            kind: "overlap";
            left: string;
            right: string;
            leftOnly: string;
            both: string;
            rightOnly: string;
            total?: string | undefined;
        } | {
            kind: "split";
            parts: {
                top: string;
                left: string;
                right: string;
            }[];
        } | {
            kind: "sequence";
            items: {
                shape: "circle" | "square" | "triangle" | "star";
                count: number;
            }[];
            blank?: number | undefined;
        } | {
            kind: "wall";
            rows: string[][];
        } | {
            kind: "grid";
            rows: {
                cells: string[];
                name?: string | undefined;
            }[];
            columns?: string[] | undefined;
        } | {
            kind: "dot-array";
            rows: number;
            columns: number;
            total?: string | undefined;
        } | {
            kind: "plane";
            items: {
                shape: "circle" | "square" | "triangle" | "rectangle" | "quadrilateral" | "curved";
                count: number;
            }[];
            mark: "yes" | "no";
        } | {
            kind: "solid";
            items: {
                shape: "cube" | "cuboid" | "cylinder" | "sphere";
                count: number;
            }[];
            mark: "yes" | "no";
        } | {
            kind: "counter";
            hundreds: number;
            tens: number;
            ones: number;
        } | {
            kind: "measure";
            bars: {
                name: string;
                length: number;
                style?: "curved" | "straight" | undefined;
            }[];
            ruler: "yes" | "no";
        } | {
            kind: "compass";
            blank: "yes" | "no";
        } | {
            kind: "balance";
            left: string;
            right: string;
            tilt: "left" | "right" | "level";
        } | {
            kind: "writing";
            style: "tianzige" | "fourline";
            count?: number | undefined;
            example?: string | undefined;
        } | {
            kind: "sketch";
            height: number;
            elements: ({
                draw: "line";
                from: {
                    x: number;
                    y: number;
                };
                to: {
                    x: number;
                    y: number;
                };
            } | {
                draw: "polyline";
                points: {
                    x: number;
                    y: number;
                }[];
                closed?: "yes" | "no" | undefined;
            } | {
                draw: "rect";
                x: number;
                y: number;
                width: number;
                height: number;
            } | {
                draw: "circle";
                x: number;
                y: number;
                radius: number;
            } | {
                draw: "text";
                x: number;
                y: number;
                label: string;
                align?: "center" | "left" | undefined;
            } | {
                draw: "arrow";
                from: {
                    x: number;
                    y: number;
                };
                to: {
                    x: number;
                    y: number;
                };
            })[];
        } | undefined;
        materialId?: string | undefined;
        rawResponse?: string | undefined;
        questionId?: string | undefined;
        responseId?: string | undefined;
    } | null;
    revision: number;
    profile: {
        region: string;
        grade: number;
        term: "first" | "second";
        schoolYear: string;
        schoolSystem: "five-four" | "six-three";
        nickname: string;
        schoolAlias: string;
        parentConfirmation: string;
    };
    interests: string[];
    interestFocus: string;
};
/** One week of derived parent-facing summary; every number comes from stored evidence. */
export interface WeeklySummary {
    minutesByDay: {
        day: string;
        minutes: number;
    }[];
    activeDays: number;
    practisedGoals: number;
    masteredGoals: number;
    recoveredGoals: number;
    newMistakes: number;
    consolidatedMistakes: number;
    dueCompletion: {
        done: number;
        total: number;
    };
    errorCauses: {
        type: ErrorType;
        count: number;
    }[];
    suggestion: StudyInsight['recommendation'];
}
/**
 * Summarise the last seven calendar days for the parent: minutes per day, goals practised and
 * newly mastered, mistake flow, due-review completion and this week's top error causes.
 * Purely derived from stored evidence; nothing is stored per week.
 * @param state - current durable learning state.
 * @param now - host wall-clock time in milliseconds.
 * @param insight - precomputed insight for the same state and time, when the caller already has one.
 */
export declare function weeklySummary(state: StudyState, now: number, insight: StudyInsight): WeeklySummary;
/**
 * Cheap elapsed-minute projection for Shanghai today and the preceding six calendar days.
 * @param state - block timing records; answers and grading times are unused.
 * @param now - explicit current clock.
 * @returns per-day minutes with midnight-crossing blocks split across their actual calendar days.
 */
export declare function summaryMinutes(state: StudyState, now: number): {
    day: string;
    minutes: number;
}[];
//# sourceMappingURL=status.d.ts.map