import type { StudyState } from './schema.ts';
import { type InteractiveLessons } from './openmaic.ts';
import type { CurriculumSubject } from './curriculum.ts';
/** Mistake-book filter for the confirmed list. */
export type MistakeStatus = 'all' | 'due' | 'reviewing' | 'mastered';
/** The workbench tab a payload is built for; the map tab carries the full knowledge map, others a lite one. */
export type StudyTab = 'today' | 'map' | 'mistakes' | 'parent';
/**
 * Bounded sidebar projection: status, the selected subject's knowledge map with mastery,
 * weak points, the next step and one page of the mistake notebook.
 * @param state - current durable learning state, or undefined before setup.
 * @param now - host wall-clock time in milliseconds.
 * @param options - selected subject, notebook offset and status filter, an optional grade and term to browse another knowledge map, and an optional check-in scope (grade, term, unit).
 * @returns the dashboard payload served to the workbench.
 */
export declare function dashboard(state: StudyState | undefined, now: number, options?: {
    subject?: CurriculumSubject;
    mistakeOffset?: number;
    mistakeStatus?: MistakeStatus;
    mapGrade?: number;
    mapTerm?: 'first' | 'second';
    diagGrade?: number;
    diagTerm?: 'first' | 'second';
    diagUnit?: string;
    tab?: StudyTab;
}, interactiveLessons?: InteractiveLessons): {
    serverNow: number;
    revision: number;
    study: null;
    interactiveLessons: InteractiveLessons;
} | {
    serverNow: number;
    revision: number;
    study: {
        weekly: import("./learning/status.ts").WeeklySummary;
        diagnostics: import("./learning/mastery.ts").DiagnosticPlan[];
        materials: {
            id: string;
            subject: "chinese" | "math" | "english";
            scope: {
                region: string;
                grade: number;
                term: "first" | "second";
                schoolYear: string;
                schoolSystem: "five-four" | "six-three";
            };
            title: string;
            publisher: string;
            edition: string;
            editionStatus: "unconfirmed" | "identified";
            kind: "official-textbook" | "school-material" | "reference" | "generated";
            locator: string;
            evidence: string;
        }[];
        exercises: {
            id: string;
            subject: "chinese" | "math" | "english";
            objectiveId: string;
            role: "daily" | "diagnose" | "demo" | "try" | "vary";
            variant: "numeric" | "context" | "reasoning";
            prompt: string;
            steps: string[];
            answer: string;
            explanation: string;
            answerEvidence: string;
            choices?: string[] | undefined;
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
                    align?: "left" | "center" | undefined;
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
            errorType?: "carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
            savedAt?: number | undefined;
        }[];
        workbookDrafts: {
            id: string;
            subject: "chinese" | "math" | "english";
            prompt: string;
            outcome: "stuck" | "hinted" | "independent-wrong" | "independent-correct";
            uncertainties: string;
            receivedAt: number;
            response?: string | undefined;
            objectiveId?: string | undefined;
            imagePath?: string | undefined;
        }[];
        workbookResults: {
            id: string;
            subject: "chinese" | "math" | "english";
            prompt: string;
            outcome: "stuck" | "hinted" | "independent-wrong" | "independent-correct";
            uncertainties: string;
            receivedAt: number;
            confirmedAt: number;
            userConfirmation: string;
            response?: string | undefined;
            objectiveId?: string | undefined;
            imagePath?: string | undefined;
            correction?: string | undefined;
            explanation?: string | undefined;
            answerEvidence?: string | undefined;
        }[];
        teachingQueue: {
            id: string;
            subject: "chinese" | "math" | "english";
            prompt: string;
            confirmedAt: number;
            objectiveId?: string | undefined;
            sourceDraftId?: string | undefined;
        }[];
        recentAttempts: {
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
                    align?: "left" | "center" | undefined;
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
        }[];
        recommendation: {
            kind: "review" | "practice" | "diagnose" | "learn" | "preview" | "hold";
            subject: CurriculumSubject;
            objectiveId?: string;
            title?: string;
            reason: import("./learning/mastery.ts").InsightReason;
            unitName?: string;
            redirectedFrom?: {
                id: string;
                title: string;
            };
        } | null;
        dueToday: import("./learning/mastery.ts").DueClear[];
        dueBacklog: number;
        weakPoints: {
            id: string;
            subject: "chinese" | "math" | "english";
            title: string;
            level: "due" | "weak" | "stalled" | "mastered" | "practising" | "untouched";
            priority: number;
            reasons: import("./learning/mastery.ts").InsightReason[];
        }[];
        understandingReminders: import("./learning/mastery.ts").UnderstandingReminder[];
        errorProfile: {
            subject: CurriculumSubject;
            type: import("./schema.ts").ErrorType;
            count: number;
            objectiveIds: string[];
        }[];
        progress: {
            level: string;
            subject: string;
            topic: string;
            materialId?: string;
            objectiveId?: string;
            attempts: number;
            independentDays: string[];
        }[];
        concepts: {
            id: string;
            subject: "chinese" | "math" | "english";
            name: string;
            definition: string;
            example: string;
            source: string;
            facts?: string[] | undefined;
            misconceptions?: string[] | undefined;
            confirmedAt?: number | undefined;
            userConfirmation?: string | undefined;
        }[];
        objectives: {
            id: string;
            subject: "chinese" | "math" | "english";
            title: string;
            goal: string;
            conceptIds: string[];
            method: "listen" | "context" | "recognize" | "read-evidence" | "express" | "represent" | "reason" | "verify" | "speak";
            errorTypes?: ("carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete")[] | undefined;
            questionPoints?: string[] | undefined;
            variationAxes?: ("reverse" | "context" | "numbers" | "representation" | "explain")[] | undefined;
        }[];
        relations: {
            id: string;
            fromId: string;
            toId: string;
            kind: "prerequisite" | "part-of" | "contrast" | "explains" | "cause-effect";
            explanation: string;
            source: string;
        }[];
        worksheets: {
            objectiveTitle: string;
            open: boolean;
            results: {
                errorType?: "carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete";
                itemId: string;
                result: "correct" | "partial" | "incorrect" | "unassessed";
                response: string;
                assistance: "unknown" | "independent" | "hint" | "worked-example";
            }[];
            drafts: {
                confidence?: "high" | "low";
                errorType?: "carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete";
                itemId: string;
                response: string;
                result: "correct" | "partial" | "incorrect" | "unassessed";
                assistance: "unknown" | "independent" | "hint" | "worked-example";
                uncertainties: string;
            }[];
            sources: {
                topic: string;
                stage: number;
                mistakeId?: string;
                itemId: string;
            }[];
            id: string;
            subject: "chinese" | "math" | "english";
            items: {
                id: string;
                prompt: string;
                answer: string;
                explanation: string;
                answerEvidence: string;
                objectiveId?: string | undefined;
                mistakeId?: string | undefined;
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
                        align?: "left" | "center" | undefined;
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
                space?: "line" | "none" | "lines" | "box" | undefined;
            }[];
            createdAt: number;
            kind?: "review" | "daily" | "practice" | undefined;
            objectiveId?: string | undefined;
            discardedAt?: number | undefined;
        }[];
        reviewPlan: {
            picks: number;
            fills: number;
            remaining: number;
            unlinkedDue: number;
            openSheets: number;
        };
        dueMistakes: {
            id: string;
            subject: "chinese" | "math" | "english";
            topic: string;
        }[];
        dueCount: number;
        dueTotal: number;
        dueSubjects: ("chinese" | "math" | "english")[];
        pendingMistakes: {
            id: string;
            subject: "chinese" | "math" | "english";
            topic: string;
            prompt: string;
            learnerAnswer: string;
            correction: string;
            explanation: string;
            answerEvidence: string;
            uncertainties: string;
            independentDays: string[];
            stage: number;
            imagePath?: string | undefined;
            materialId?: string | undefined;
            objectiveId?: string | undefined;
            errorType?: "carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
            confirmedAt?: number | undefined;
            userConfirmation?: string | undefined;
            dueAt?: number | undefined;
            source?: {
                worksheetId: string;
                itemId: string;
            } | undefined;
        }[];
        pendingCount: number;
        confirmedMistakes: {
            id: string;
            subject: "chinese" | "math" | "english";
            topic: string;
            prompt: string;
            learnerAnswer: string;
            correction: string;
            explanation: string;
            answerEvidence: string;
            uncertainties: string;
            independentDays: string[];
            stage: number;
            imagePath?: string | undefined;
            materialId?: string | undefined;
            objectiveId?: string | undefined;
            errorType?: "carry-borrow" | "place-value" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "pattern" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
            confirmedAt?: number | undefined;
            userConfirmation?: string | undefined;
            dueAt?: number | undefined;
            source?: {
                worksheetId: string;
                itemId: string;
            } | undefined;
        }[];
        confirmedCount: number;
        confirmedOffset: number;
        confirmedSubject: "chinese" | "math" | "english";
        mistakeBook: {
            due: number;
            reviewing: number;
            mastered: number;
            pending: number;
        };
        curriculum: import("./learning/view.ts").CurriculumView | null;
        diagnostic: import("./learning/mastery.ts").DiagnosticPlan | null;
        scopedDiagnostic: import("./learning/mastery.ts").DiagnosticPlan | null;
        scopedUnits: {
            id: string;
            name: string;
        }[];
        checkIns: import("./learning/mastery.ts").CheckInRecord[];
        active: {
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
                pace: "review" | "teaching";
            } | undefined;
        }[];
        unconfirmedSubjects: string[];
        stars: number;
        todayStars: number;
        phase: import("./learning/status.ts").StudyPhase;
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
                    align?: "left" | "center" | undefined;
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
                    align?: "left" | "center" | undefined;
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
    interactiveLessons: InteractiveLessons;
};
/** Shared HTTP response shape; client imports this type without host runtime code. */
export type Dashboard = ReturnType<typeof dashboard>;
//# sourceMappingURL=dashboard.d.ts.map