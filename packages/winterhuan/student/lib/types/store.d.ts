import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import { type StudyState } from './schema.ts';
/**
 * Turn a saved hint flag into a hint level and strip retired time-limit fields before parsing.
 * Missing workbook drafts, exercises and the teaching queue are filled by the state schema defaults.
 */
export declare function migrateStudyFile(parsed: unknown): unknown;
/**
 * Read or update .study/state.json in the calling Session's filesystem.
 * Reads preserve absence; writes require the observed version and current sandbox policy.
 * A competing writer causes an error, never an automatic replay of learning evidence.
 * Archiving validates the revision and command before writing; archive creation and state
 * replacement remain separate writes, so a later filesystem failure can leave an archive.
 * Parsed states are cached per observed file version, so unchanged reads skip re-reading
 * and re-validating the file; any write or external change drops the cache entry.
 * @param exec - calling agent and cancellation signal.
 * @param command - optional learning update; omission reads the current state.
 * @param expectedRevision - revision observed by a submitting panel, checked before writing.
 * @returns the current or updated state, or undefined before setup or after a saved archive is read.
 */
export declare function studyStore(exec: Pick<ToolExecution, 'agent' | 'signal'>, command?: unknown, expectedRevision?: number): Promise<StudyState | undefined>;
/**
 * Bounded history and status queries. Only the requested collection is computed; offset pagination applies to every collection.
 * @param state - current durable learning state, or undefined before setup.
 * @param kind - record collection or projection to read.
 * @param offset - zero-based collection offset.
 * @param options - optional exact record ID, subject and unit filters, grade/term for browsing another knowledge map or a cross-grade check-in plan.
 * @returns the projection or one page of records.
 */
export declare function queryStudy(state: StudyState | undefined, kind: string, offset: number, options?: {
    id?: string;
    subject?: 'chinese' | 'math' | 'english';
    unit?: string;
    grade?: number;
    term?: 'first' | 'second';
}): {
    phase: string;
    path: string;
    revision?: never;
    curriculum?: never;
    subject?: never;
    objectives?: never;
    nextOffset?: never;
    more?: never;
    total?: never;
    items?: never;
    diagnostics?: never;
    history?: never;
} | {
    progress: {
        level: string;
        subject: string;
        topic: string;
        materialId?: string;
        objectiveId?: string;
        attempts: number;
        independentDays: string[];
    }[];
    progressCount: number;
    dueMistakes: {
        id: string;
        subject: "chinese" | "math" | "english";
        topic: string;
    }[];
    dueMistakeCount: number;
    pendingMistakes: string[];
    pendingMistakeCount: number;
    teachingQueue: {
        id: string;
        subject: "chinese" | "math" | "english";
        prompt: string;
        confirmedAt: number;
        objectiveId?: string | undefined;
        sourceDraftId?: string | undefined;
    }[];
    teachingQueueCount: number;
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
    workbookDraftCount: number;
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
    workbookResultCount: number;
    more: string;
    weakPoints: {
        id: string;
        subject: "chinese" | "math" | "english";
        title: string;
        level: "practising" | "due" | "weak" | "stalled" | "mastered" | "untouched";
        priority: number;
        reasons: import("./learning/mastery.ts").InsightReason[];
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
        subject: import("./curriculum.ts").CurriculumSubject;
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
    errorProfile: {
        subject: import("./curriculum.ts").CurriculumSubject;
        type: import("./schema.ts").ErrorType;
        count: number;
        objectiveIds: string[];
    }[];
    understandingReminders: import("./learning/mastery.ts").UnderstandingReminder[];
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
        stuck?: boolean | undefined;
    } | null;
    feedback: {
        result: "correct" | "partial" | "incorrect" | "unassessed" | "stuck";
        assistance: "independent" | "hint" | "worked-example";
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
    path?: never;
    curriculum?: never;
    subject?: never;
    objectives?: never;
    nextOffset?: never;
    total?: never;
    items?: never;
    history?: never;
} | {
    revision: number;
    curriculum: import("./learning/view.ts").CurriculumView | null;
    phase?: never;
    path?: never;
    subject?: never;
    objectives?: never;
    nextOffset?: never;
    more?: never;
    total?: never;
    items?: never;
    diagnostics?: never;
    history?: never;
} | {
    revision: number;
    subject: "chinese" | "math" | "english";
    objectives: {
        id: string;
        title: string;
        goal: string;
        method: "context" | "recognize" | "read-evidence" | "express" | "represent" | "reason" | "verify" | "listen" | "speak";
        unit: string;
        errorTypes: ("pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete")[];
        questionPoints: string[];
        variationAxes: ("context" | "numbers" | "representation" | "reverse" | "explain")[];
        misconceptions: string[];
        examples: string[];
        hintLadder: [string, string, string];
        exercises: {
            id: string;
            subject: "chinese" | "math" | "english";
            objectiveId: string;
            role: "diagnose" | "demo" | "try" | "vary" | "daily";
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
            errorType?: "pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
        }[];
        knowledgePoints: {
            examples?: string[];
            misconceptions?: string[];
            facts?: string[];
            ideas?: {
                id: string;
                name: string;
                definition: string;
                example: string;
            }[];
            id: string;
            name: string;
            definition: string;
            example: string;
        }[];
    }[];
    nextOffset: number | null;
    more: string;
    phase?: never;
    path?: never;
    curriculum?: never;
    total?: never;
    items?: never;
    diagnostics?: never;
    history?: never;
} | {
    revision: number;
    total: number;
    items: ({
        source: "workspace";
        id: string;
        subject: "chinese" | "math" | "english";
        objectiveId: string;
        role: "diagnose" | "demo" | "try" | "vary" | "daily";
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
        errorType?: "pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
        savedAt?: number | undefined;
    } | {
        source: "shipped";
        id: string;
        subject: "chinese" | "math" | "english";
        objectiveId: string;
        role: "diagnose" | "demo" | "try" | "vary" | "daily";
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
        errorType?: "pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
    })[];
    nextOffset: number | null;
    phase?: never;
    path?: never;
    curriculum?: never;
    subject?: never;
    objectives?: never;
    more?: never;
    diagnostics?: never;
    history?: never;
} | {
    more: string;
    subject: "chinese" | "math" | "english";
    picks: import("./learning/view.ts").ReviewPick[];
    objectiveFills: import("./learning/view.ts").ObjectiveFill[];
    errorCoverage: {
        type: "pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete";
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
    revision: number;
    phase?: never;
    path?: never;
    curriculum?: never;
    objectives?: never;
    nextOffset?: never;
    total?: never;
    items?: never;
    diagnostics?: never;
    history?: never;
} | {
    revision: number;
    diagnostics: {
        sample: {
            exercise?: {
                id: string;
                subject: "chinese" | "math" | "english";
                objectiveId: string;
                role: "diagnose" | "demo" | "try" | "vary" | "daily";
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
                errorType?: "pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
            };
            id: string;
            title: string;
            unit: string;
            unitName: string;
            reason: "untouched" | "stalled" | "recheck" | "progress";
        }[];
        subject: import("./curriculum.ts").CurriculumSubject;
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
        recommendedIntensity: import("./learning/mastery.ts").CheckInIntensity;
        samples: Record<import("./learning/mastery.ts").CheckInIntensity, import("./learning/mastery.ts").DiagnosticSample[]>;
        scope?: import("./curriculum.ts").CurriculumScope & {
            units?: string[] | undefined;
            objectiveIds?: string[] | undefined;
        };
    }[];
    history: import("./learning/mastery.ts").CheckInRecord[];
    more: string;
    phase?: never;
    path?: never;
    curriculum?: never;
    subject?: never;
    objectives?: never;
    nextOffset?: never;
    total?: never;
    items?: never;
} | {
    weakPoints: {
        id: string;
        subject: "chinese" | "math" | "english";
        title: string;
        goal: string;
        level: "practising" | "due" | "weak" | "stalled" | "mastered" | "untouched";
        priority: number;
        reasons: import("./learning/mastery.ts").InsightReason[];
    }[];
    practised: {
        id: string;
        subject: "chinese" | "math" | "english";
        title: string;
        level: "practising" | "due" | "weak" | "stalled" | "mastered" | "untouched";
        independentDays: number;
        attempts: number;
        helpedOrWrong: number;
        activeMistakes: number;
        dueMistakes: number;
    }[];
    more: string;
    diagnostics: {
        sample: string[];
        nextAt?: number;
        lastAt?: number;
        subject: "chinese" | "math" | "english";
        due: boolean;
    }[];
    recommendation: {
        kind: "review" | "practice" | "diagnose" | "learn" | "preview" | "hold";
        subject: import("./curriculum.ts").CurriculumSubject;
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
    errorProfile: {
        subject: import("./curriculum.ts").CurriculumSubject;
        type: import("./schema.ts").ErrorType;
        count: number;
        objectiveIds: string[];
    }[];
    understandingReminders: import("./learning/mastery.ts").UnderstandingReminder[];
    revision: number;
    phase?: never;
    path?: never;
    curriculum?: never;
    subject?: never;
    objectives?: never;
    nextOffset?: never;
    total?: never;
    items?: never;
    history?: never;
} | {
    revision: number;
    total: number;
    items: ({
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
    } | {
        id: string;
        subject: "chinese" | "math" | "english";
        title: string;
        goal: string;
        conceptIds: string[];
        method: "context" | "recognize" | "read-evidence" | "express" | "represent" | "reason" | "verify" | "listen" | "speak";
        errorTypes?: ("pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete")[] | undefined;
        questionPoints?: string[] | undefined;
        variationAxes?: ("context" | "numbers" | "representation" | "reverse" | "explain")[] | undefined;
    } | {
        id: string;
        fromId: string;
        toId: string;
        kind: "prerequisite" | "part-of" | "contrast" | "explains" | "cause-effect";
        explanation: string;
        source: string;
    } | {
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
            space?: "line" | "none" | "lines" | "box" | undefined;
        }[];
        createdAt: number;
        kind?: "review" | "daily" | "practice" | undefined;
        objectiveId?: string | undefined;
        discardedAt?: number | undefined;
    } | {
        worksheetId: string;
        itemId: string;
        response: string;
        result: "correct" | "partial" | "incorrect" | "unassessed";
        assistance: "independent" | "hint" | "worked-example";
        feedback: string;
        answerEvidence: string;
        userConfirmation: string;
        receivedAt: number;
    } | {
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
        errorType?: "pattern" | "place-value" | "carry-borrow" | "operation-choice" | "calculation" | "unit-quantity" | "reading-task" | "geometry-feature" | "money-measure" | "reasoning-incomplete" | "pinyin-tone" | "character-form" | "character-usage" | "word-meaning" | "reading-evidence" | "order" | "expression-incomplete" | "punctuation" | "listening" | "spelling" | "word-form" | "sentence-pattern" | "usage-context" | "spoken-response" | "writing-complete" | undefined;
        confirmedAt?: number | undefined;
        userConfirmation?: string | undefined;
        dueAt?: number | undefined;
        source?: {
            worksheetId: string;
            itemId: string;
        } | undefined;
    } | {
        result: "correct" | "partial" | "incorrect" | "unassessed" | "stuck";
        assistance: "independent" | "hint" | "worked-example";
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
    } | {
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
    } | {
        level: string;
        subject: string;
        topic: string;
        materialId?: string;
        objectiveId?: string;
        attempts: number;
        independentDays: string[];
    } | {
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
    })[];
    nextOffset: number | null;
    phase?: never;
    path?: never;
    curriculum?: never;
    subject?: never;
    objectives?: never;
    more?: never;
    diagnostics?: never;
    history?: never;
};
/** A stale sidebar must reload before it can change learning evidence. */
export declare class StudyConflict extends Error {
    constructor();
}
//# sourceMappingURL=store.d.ts.map