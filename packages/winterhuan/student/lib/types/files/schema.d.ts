/** Strict official Student files. Entity identity is independent of file observation and business revision. */
import { z } from 'zod';
import type { Branded } from '@deepseek-ai/dsh-brand';
/** Stable learning-term identity. */
export type TermId = Branded<'StudentTermId'>;
/** Stable learning-block identity; distinct from a native DSH Session. */
export type BlockId = Branded<'StudentBlockId'>;
/** Stable worksheet identity. */
export type WorksheetId = Branded<'StudentWorksheetId'>;
/** Stable response identity within one owning entity. */
export type ResponseId = Branded<'StudentResponseId'>;
/** Known assistance and unknown assistance remain separate from correctness. */
export declare const assistanceSchema: z.ZodEnum<{
    unknown: "unknown";
    independent: "independent";
    hint: "hint";
    "worked-example": "worked-example";
}>;
/** Actual answer time; parent day precision never supplies a within-day order. */
export declare const answerDateSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"unknown">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"day">;
    day: z.ZodString;
    parentConfirmation: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"instant">;
    at: z.ZodNumber;
    basis: z.ZodEnum<{
        "native-input": "native-input";
        "current-manual": "current-manual";
    }>;
    sourceVersion: z.ZodString;
}, z.core.$strict>], "kind">;
/** Native input version or preserved source; missing receipt matching is explicitly unknown. */
export declare const responseSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"unknown">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"native">;
    sessionId: z.ZodString;
    messageId: z.ZodString;
    inputVersion: z.ZodString;
    receiptAt: z.ZodOptional<z.ZodNumber>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"paper">;
    imagePaths: z.ZodArray<z.ZodString>;
    parentConfirmation: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"manual">;
    entry: z.ZodEnum<{
        current: "current";
        historical: "historical";
    }>;
    parentConfirmation: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"legacy">;
    sourcePath: z.ZodString;
    row: z.ZodString;
}, z.core.$strict>], "kind">;
/** Published question source, including unresolved legacy material. */
export declare const questionSourceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"authored">;
    description: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"exercise">;
    exerciseId: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"mistake">;
    mistakeId: z.ZodString;
    description: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"legacy">;
    sourcePath: z.ZodString;
    row: z.ZodString;
}, z.core.$strict>], "kind">;
/** Published question content reused by blocks and worksheets, including every supported figure. */
export declare const questionSchema: z.ZodObject<{
    id: z.ZodString;
    objectiveId: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        kind: z.ZodLiteral<"pending">;
        reason: z.ZodString;
    }, z.core.$strict>]>;
    mistakeId: z.ZodOptional<z.ZodString>;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"authored">;
        description: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"exercise">;
        exerciseId: z.ZodString;
        description: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"mistake">;
        mistakeId: z.ZodString;
        description: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"legacy">;
        sourcePath: z.ZodString;
        row: z.ZodString;
    }, z.core.$strict>], "kind">;
    topic: z.ZodString;
    prompt: z.ZodString;
    answer: z.ZodString;
    explanation: z.ZodString;
    answerEvidence: z.ZodString;
    basisStatus: z.ZodOptional<z.ZodLiteral<"legacy-pending">>;
    choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
    steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
    figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"bar-model">;
        bars: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            segments: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                units: z.ZodNumber;
                style: z.ZodOptional<z.ZodEnum<{
                    solid: "solid";
                    dashed: "dashed";
                }>>;
            }, z.core.$strict>>;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"money">;
        items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
            "1\u5206": "1分";
            "2\u5206": "2分";
            "5\u5206": "5分";
            "1\u89D2": "1角";
            "2\u89D2": "2角";
            "5\u89D2": "5角";
            "1\u5143": "1元";
            "5\u5143": "5元";
            "10\u5143": "10元";
            "20\u5143": "20元";
            "50\u5143": "50元";
            "100\u5143": "100元";
        }>, z.ZodObject<{
            denomination: z.ZodEnum<{
                "1\u5206": "1分";
                "2\u5206": "2分";
                "5\u5206": "5分";
                "1\u89D2": "1角";
                "2\u89D2": "2角";
                "5\u89D2": "5角";
                "1\u5143": "1元";
                "5\u5143": "5元";
                "10\u5143": "10元";
                "20\u5143": "20元";
                "50\u5143": "50元";
                "100\u5143": "100元";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>]>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"place-value">;
        tens: z.ZodNumber;
        ones: z.ZodNumber;
        crossTens: z.ZodNumber;
        crossOnes: z.ZodNumber;
        regroup: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"hundred-chart">;
        hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        window: z.ZodOptional<z.ZodObject<{
            center: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"number-line">;
        from: z.ZodNumber;
        to: z.ZodNumber;
        step: z.ZodNumber;
        marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodNumber;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
            from: z.ZodNumber;
            to: z.ZodNumber;
            label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"clock">;
        clocks: z.ZodArray<z.ZodObject<{
            hour: z.ZodNumber;
            minute: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"sticks">;
        bundles: z.ZodNumber;
        singles: z.ZodNumber;
        crossBundles: z.ZodOptional<z.ZodNumber>;
        crossSingles: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"vertical">;
        count: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"shapes">;
        rows: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            shape: z.ZodEnum<{
                circle: "circle";
                square: "square";
                triangle: "triangle";
            }>;
            count: z.ZodNumber;
            blank: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"overlap">;
        left: z.ZodString;
        right: z.ZodString;
        leftOnly: z.ZodString;
        both: z.ZodString;
        rightOnly: z.ZodString;
        total: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"split">;
        parts: z.ZodArray<z.ZodObject<{
            top: z.ZodString;
            left: z.ZodString;
            right: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"sequence">;
        items: z.ZodArray<z.ZodObject<{
            shape: z.ZodEnum<{
                circle: "circle";
                square: "square";
                triangle: "triangle";
                star: "star";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>>;
        blank: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"wall">;
        rows: z.ZodArray<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"grid">;
        columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
        rows: z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            cells: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"dot-array">;
        rows: z.ZodNumber;
        columns: z.ZodNumber;
        total: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"plane">;
        items: z.ZodArray<z.ZodObject<{
            shape: z.ZodEnum<{
                circle: "circle";
                square: "square";
                triangle: "triangle";
                rectangle: "rectangle";
                quadrilateral: "quadrilateral";
                curved: "curved";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>>;
        mark: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"solid">;
        items: z.ZodArray<z.ZodObject<{
            shape: z.ZodEnum<{
                cube: "cube";
                cuboid: "cuboid";
                cylinder: "cylinder";
                sphere: "sphere";
            }>;
            count: z.ZodNumber;
        }, z.core.$strict>>;
        mark: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"counter">;
        hundreds: z.ZodNumber;
        tens: z.ZodNumber;
        ones: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"measure">;
        bars: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            length: z.ZodNumber;
            style: z.ZodOptional<z.ZodEnum<{
                curved: "curved";
                straight: "straight";
            }>>;
        }, z.core.$strict>>;
        ruler: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"compass">;
        blank: z.ZodEnum<{
            yes: "yes";
            no: "no";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"balance">;
        left: z.ZodString;
        right: z.ZodString;
        tilt: z.ZodEnum<{
            left: "left";
            right: "right";
            level: "level";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"writing">;
        style: z.ZodEnum<{
            tianzige: "tianzige";
            fourline: "fourline";
        }>;
        count: z.ZodOptional<z.ZodNumber>;
        example: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"sketch">;
        height: z.ZodNumber;
        elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            draw: z.ZodLiteral<"line">;
            from: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            to: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"polyline">;
            points: z.ZodArray<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>>;
            closed: z.ZodOptional<z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"rect">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"circle">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            radius: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"text">;
            x: z.ZodNumber;
            y: z.ZodNumber;
            label: z.ZodString;
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            draw: z.ZodLiteral<"arrow">;
            from: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            to: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>], "draw">>;
    }, z.core.$strict>], "kind">>;
    phase: z.ZodOptional<z.ZodEnum<{
        demo: "demo";
        try: "try";
        vary: "vary";
        guide: "guide";
    }>>;
    variant: z.ZodOptional<z.ZodEnum<{
        numeric: "numeric";
        context: "context";
        reasoning: "reasoning";
    }>>;
    space: z.ZodOptional<z.ZodEnum<{
        line: "line";
        none: "none";
        lines: "lines";
        box: "box";
    }>>;
}, z.core.$strict>;
/** Original learner wording and its actual date; assessments cannot replace these fields. */
export declare const responseSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
    questionId: z.ZodString;
    rawResponse: z.ZodString;
    response: z.ZodOptional<z.ZodString>;
    assistance: z.ZodEnum<{
        unknown: "unknown";
        independent: "independent";
        hint: "hint";
        "worked-example": "worked-example";
    }>;
    assistanceConfirmation: z.ZodOptional<z.ZodString>;
    answerDateConfirmation: z.ZodOptional<z.ZodString>;
    answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"unknown">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"day">;
        day: z.ZodString;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"instant">;
        at: z.ZodNumber;
        basis: z.ZodEnum<{
            "native-input": "native-input";
            "current-manual": "current-manual";
        }>;
        sourceVersion: z.ZodString;
    }, z.core.$strict>], "kind">>;
    source: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"unknown">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"native">;
        sessionId: z.ZodString;
        messageId: z.ZodString;
        inputVersion: z.ZodString;
        receiptAt: z.ZodOptional<z.ZodNumber>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"paper">;
        imagePaths: z.ZodArray<z.ZodString>;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"manual">;
        entry: z.ZodEnum<{
            current: "current";
            historical: "historical";
        }>;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"legacy">;
        sourcePath: z.ZodString;
        row: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
/** The current assessment of one response. A correction replaces this entry under the same response identity. */
export declare const assessmentSchema: z.ZodObject<{
    id: z.ZodString;
    responseId: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
    result: z.ZodEnum<{
        correct: "correct";
        partial: "partial";
        incorrect: "incorrect";
        unassessed: "unassessed";
        stuck: "stuck";
    }>;
    assistance: z.ZodEnum<{
        unknown: "unknown";
        independent: "independent";
        hint: "hint";
        "worked-example": "worked-example";
    }>;
    feedback: z.ZodString;
    answerEvidence: z.ZodString;
    assessedAt: z.ZodNumber;
    correctedAt: z.ZodOptional<z.ZodNumber>;
    userConfirmation: z.ZodOptional<z.ZodString>;
    errorType: z.ZodOptional<z.ZodEnum<{
        "carry-borrow": "carry-borrow";
        "place-value": "place-value";
        "operation-choice": "operation-choice";
        calculation: "calculation";
        "unit-quantity": "unit-quantity";
        "reading-task": "reading-task";
        pattern: "pattern";
        "geometry-feature": "geometry-feature";
        "money-measure": "money-measure";
        "reasoning-incomplete": "reasoning-incomplete";
        "pinyin-tone": "pinyin-tone";
        "character-form": "character-form";
        "character-usage": "character-usage";
        "word-meaning": "word-meaning";
        "reading-evidence": "reading-evidence";
        order: "order";
        "expression-incomplete": "expression-incomplete";
        punctuation: "punctuation";
        listening: "listening";
        spelling: "spelling";
        "word-form": "word-form";
        "sentence-pattern": "sentence-pattern";
        "usage-context": "usage-context";
        "spoken-response": "spoken-response";
        "writing-complete": "writing-complete";
    }>>;
}, z.core.$strict>;
/** One term owns profile, material, course and compound school-progress settings. */
export declare const termSettingsSchema: z.ZodObject<{
    kind: z.ZodLiteral<"term-settings">;
    revision: z.ZodNumber;
    updatedAt: z.ZodNumber;
    profile: z.ZodObject<{
        region: z.ZodString;
        grade: z.ZodNumber;
        term: z.ZodEnum<{
            first: "first";
            second: "second";
        }>;
        schoolYear: z.ZodString;
        schoolSystem: z.ZodEnum<{
            "five-four": "five-four";
            "six-three": "six-three";
        }>;
        nickname: z.ZodString;
        schoolAlias: z.ZodString;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>;
    materials: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        scope: z.ZodObject<{
            region: z.ZodString;
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            schoolYear: z.ZodString;
            schoolSystem: z.ZodEnum<{
                "five-four": "five-four";
                "six-three": "six-three";
            }>;
        }, z.core.$strict>;
        title: z.ZodString;
        publisher: z.ZodString;
        edition: z.ZodString;
        editionStatus: z.ZodEnum<{
            unconfirmed: "unconfirmed";
            identified: "identified";
        }>;
        kind: z.ZodEnum<{
            "official-textbook": "official-textbook";
            "school-material": "school-material";
            reference: "reference";
            generated: "generated";
        }>;
        locator: z.ZodString;
        evidence: z.ZodString;
    }, z.core.$strict>>;
    courses: z.ZodArray<z.ZodObject<{
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        materialId: z.ZodString;
        unit: z.ZodString;
        progress: z.ZodOptional<z.ZodObject<{
            unitId: z.ZodString;
            confirmedAt: z.ZodNumber;
            posture: z.ZodEnum<{
                "keep-up": "keep-up";
                "catch-up": "catch-up";
            }>;
            preview: z.ZodBoolean;
            pace: z.ZodEnum<{
                review: "review";
                teaching: "teaching";
            }>;
        }, z.core.$strict>>;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>>;
    interests: z.ZodOptional<z.ZodObject<{
        tags: z.ZodArray<z.ZodString>;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>>;
    openmaic: z.ZodOptional<z.ZodObject<{
        baseUrl: z.ZodString;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>>;
    archivedAt: z.ZodOptional<z.ZodNumber>;
    migration: z.ZodOptional<z.ZodObject<{
        sourcePath: z.ZodString;
        sourceSha256: z.ZodString;
        backupPath: z.ZodString;
    }, z.core.$strict>>;
    format: z.ZodLiteral<2>;
    termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
}, z.core.$strict>;
/** One block owns its historical course context, questions, responses, hints and assessments. */
export declare const blockSchema: z.ZodObject<{
    kind: z.ZodLiteral<"block">;
    id: z.ZodPipe<z.ZodString, z.ZodTransform<BlockId, string>>;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    mode: z.ZodEnum<{
        review: "review";
        diagnose: "diagnose";
        foundation: "foundation";
        school: "school";
        explore: "explore";
    }>;
    intensity: z.ZodOptional<z.ZodEnum<{
        light: "light";
        standard: "standard";
        deep: "deep";
    }>>;
    startedAt: z.ZodNumber;
    endedAt: z.ZodOptional<z.ZodNumber>;
    spentMs: z.ZodOptional<z.ZodNumber>;
    reflection: z.ZodOptional<z.ZodString>;
    context: z.ZodObject<{
        profile: z.ZodOptional<z.ZodObject<{
            region: z.ZodString;
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            schoolYear: z.ZodString;
            schoolSystem: z.ZodEnum<{
                "five-four": "five-four";
                "six-three": "six-three";
            }>;
            nickname: z.ZodString;
            schoolAlias: z.ZodString;
            parentConfirmation: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>>;
        pendingProfile: z.ZodOptional<z.ZodString>;
        scope: z.ZodOptional<z.ZodObject<{
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            units: z.ZodOptional<z.ZodArray<z.ZodString>>;
            objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        material: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            scope: z.ZodObject<{
                region: z.ZodString;
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                schoolYear: z.ZodString;
                schoolSystem: z.ZodEnum<{
                    "five-four": "five-four";
                    "six-three": "six-three";
                }>;
            }, z.core.$strict>;
            title: z.ZodString;
            publisher: z.ZodString;
            edition: z.ZodString;
            editionStatus: z.ZodEnum<{
                unconfirmed: "unconfirmed";
                identified: "identified";
            }>;
            kind: z.ZodEnum<{
                "official-textbook": "official-textbook";
                "school-material": "school-material";
                reference: "reference";
                generated: "generated";
            }>;
            locator: z.ZodString;
            evidence: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    currentQuestionId: z.ZodOptional<z.ZodString>;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        objectiveId: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            kind: z.ZodLiteral<"pending">;
            reason: z.ZodString;
        }, z.core.$strict>]>;
        mistakeId: z.ZodOptional<z.ZodString>;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"authored">;
            description: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"exercise">;
            exerciseId: z.ZodString;
            description: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"mistake">;
            mistakeId: z.ZodString;
            description: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"legacy">;
            sourcePath: z.ZodString;
            row: z.ZodString;
        }, z.core.$strict>], "kind">;
        topic: z.ZodString;
        prompt: z.ZodString;
        answer: z.ZodString;
        explanation: z.ZodString;
        answerEvidence: z.ZodString;
        basisStatus: z.ZodOptional<z.ZodLiteral<"legacy-pending">>;
        choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
        steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
        figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"bar-model">;
            bars: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                segments: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    units: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        solid: "solid";
                        dashed: "dashed";
                    }>>;
                }, z.core.$strict>>;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"money">;
            items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                "1\u5206": "1分";
                "2\u5206": "2分";
                "5\u5206": "5分";
                "1\u89D2": "1角";
                "2\u89D2": "2角";
                "5\u89D2": "5角";
                "1\u5143": "1元";
                "5\u5143": "5元";
                "10\u5143": "10元";
                "20\u5143": "20元";
                "50\u5143": "50元";
                "100\u5143": "100元";
            }>, z.ZodObject<{
                denomination: z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>]>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"place-value">;
            tens: z.ZodNumber;
            ones: z.ZodNumber;
            crossTens: z.ZodNumber;
            crossOnes: z.ZodNumber;
            regroup: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"hundred-chart">;
            hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            window: z.ZodOptional<z.ZodObject<{
                center: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"number-line">;
            from: z.ZodNumber;
            to: z.ZodNumber;
            step: z.ZodNumber;
            marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                value: z.ZodNumber;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
            jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                from: z.ZodNumber;
                to: z.ZodNumber;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"clock">;
            clocks: z.ZodArray<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sticks">;
            bundles: z.ZodNumber;
            singles: z.ZodNumber;
            crossBundles: z.ZodOptional<z.ZodNumber>;
            crossSingles: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"vertical">;
            count: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"shapes">;
            rows: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                }>;
                count: z.ZodNumber;
                blank: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"overlap">;
            left: z.ZodString;
            right: z.ZodString;
            leftOnly: z.ZodString;
            both: z.ZodString;
            rightOnly: z.ZodString;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"split">;
            parts: z.ZodArray<z.ZodObject<{
                top: z.ZodString;
                left: z.ZodString;
                right: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sequence">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                    star: "star";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            blank: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"wall">;
            rows: z.ZodArray<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"grid">;
            columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
            rows: z.ZodArray<z.ZodObject<{
                name: z.ZodOptional<z.ZodString>;
                cells: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"dot-array">;
            rows: z.ZodNumber;
            columns: z.ZodNumber;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"plane">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                    rectangle: "rectangle";
                    quadrilateral: "quadrilateral";
                    curved: "curved";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            mark: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"solid">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    cube: "cube";
                    cuboid: "cuboid";
                    cylinder: "cylinder";
                    sphere: "sphere";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            mark: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"counter">;
            hundreds: z.ZodNumber;
            tens: z.ZodNumber;
            ones: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"measure">;
            bars: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                length: z.ZodNumber;
                style: z.ZodOptional<z.ZodEnum<{
                    curved: "curved";
                    straight: "straight";
                }>>;
            }, z.core.$strict>>;
            ruler: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"compass">;
            blank: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"balance">;
            left: z.ZodString;
            right: z.ZodString;
            tilt: z.ZodEnum<{
                left: "left";
                right: "right";
                level: "level";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"writing">;
            style: z.ZodEnum<{
                tianzige: "tianzige";
                fourline: "fourline";
            }>;
            count: z.ZodOptional<z.ZodNumber>;
            example: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sketch">;
            height: z.ZodNumber;
            elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                draw: z.ZodLiteral<"line">;
                from: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"polyline">;
                points: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>>;
                closed: z.ZodOptional<z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"rect">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"circle">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                radius: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"text">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                label: z.ZodString;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"arrow">;
                from: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>], "draw">>;
        }, z.core.$strict>], "kind">>;
        phase: z.ZodOptional<z.ZodEnum<{
            demo: "demo";
            try: "try";
            vary: "vary";
            guide: "guide";
        }>>;
        variant: z.ZodOptional<z.ZodEnum<{
            numeric: "numeric";
            context: "context";
            reasoning: "reasoning";
        }>>;
        space: z.ZodOptional<z.ZodEnum<{
            line: "line";
            none: "none";
            lines: "lines";
            box: "box";
        }>>;
    }, z.core.$strict>>;
    responses: z.ZodArray<z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
        questionId: z.ZodString;
        rawResponse: z.ZodString;
        response: z.ZodOptional<z.ZodString>;
        assistance: z.ZodEnum<{
            unknown: "unknown";
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        assistanceConfirmation: z.ZodOptional<z.ZodString>;
        answerDateConfirmation: z.ZodOptional<z.ZodString>;
        answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"unknown">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"day">;
            day: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"instant">;
            at: z.ZodNumber;
            basis: z.ZodEnum<{
                "native-input": "native-input";
                "current-manual": "current-manual";
            }>;
            sourceVersion: z.ZodString;
        }, z.core.$strict>], "kind">>;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"unknown">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"native">;
            sessionId: z.ZodString;
            messageId: z.ZodString;
            inputVersion: z.ZodString;
            receiptAt: z.ZodOptional<z.ZodNumber>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"paper">;
            imagePaths: z.ZodArray<z.ZodString>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"manual">;
            entry: z.ZodEnum<{
                current: "current";
                historical: "historical";
            }>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"legacy">;
            sourcePath: z.ZodString;
            row: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>>;
    currentResponseId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>>;
    hints: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        responseId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>>;
        level: z.ZodNumber;
        at: z.ZodNumber;
    }, z.core.$strict>>;
    stuckSignals: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        at: z.ZodNumber;
    }, z.core.$strict>>>;
    assessments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        responseId: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
            stuck: "stuck";
        }>;
        assistance: z.ZodEnum<{
            unknown: "unknown";
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        feedback: z.ZodString;
        answerEvidence: z.ZodString;
        assessedAt: z.ZodNumber;
        correctedAt: z.ZodOptional<z.ZodNumber>;
        userConfirmation: z.ZodOptional<z.ZodString>;
        errorType: z.ZodOptional<z.ZodEnum<{
            "carry-borrow": "carry-borrow";
            "place-value": "place-value";
            "operation-choice": "operation-choice";
            calculation: "calculation";
            "unit-quantity": "unit-quantity";
            "reading-task": "reading-task";
            pattern: "pattern";
            "geometry-feature": "geometry-feature";
            "money-measure": "money-measure";
            "reasoning-incomplete": "reasoning-incomplete";
            "pinyin-tone": "pinyin-tone";
            "character-form": "character-form";
            "character-usage": "character-usage";
            "word-meaning": "word-meaning";
            "reading-evidence": "reading-evidence";
            order: "order";
            "expression-incomplete": "expression-incomplete";
            punctuation: "punctuation";
            listening: "listening";
            spelling: "spelling";
            "word-form": "word-form";
            "sentence-pattern": "sentence-pattern";
            "usage-context": "usage-context";
            "spoken-response": "spoken-response";
            "writing-complete": "writing-complete";
        }>>;
    }, z.core.$strict>>;
    pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sourcePath: z.ZodString;
        row: z.ZodString;
        fields: z.ZodArray<z.ZodString>;
        reason: z.ZodString;
    }, z.core.$strict>>>;
    format: z.ZodLiteral<2>;
    termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
}, z.core.$strict>;
/** One worksheet owns frozen question targets, photo drafts and all confirmed workbook outcomes. */
export declare const worksheetSchema: z.ZodObject<{
    kind: z.ZodLiteral<"worksheet">;
    id: z.ZodPipe<z.ZodString, z.ZodTransform<WorksheetId, string>>;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    worksheetKind: z.ZodOptional<z.ZodEnum<{
        review: "review";
        daily: "daily";
        practice: "practice";
    }>>;
    origin: z.ZodEnum<{
        prepared: "prepared";
        workbook: "workbook";
    }>;
    createdAt: z.ZodNumber;
    discardedAt: z.ZodOptional<z.ZodNumber>;
    context: z.ZodObject<{
        profile: z.ZodOptional<z.ZodObject<{
            region: z.ZodString;
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            schoolYear: z.ZodString;
            schoolSystem: z.ZodEnum<{
                "five-four": "five-four";
                "six-three": "six-three";
            }>;
            nickname: z.ZodString;
            schoolAlias: z.ZodString;
            parentConfirmation: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>>;
        pendingProfile: z.ZodOptional<z.ZodString>;
        scope: z.ZodOptional<z.ZodObject<{
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            units: z.ZodOptional<z.ZodArray<z.ZodString>>;
            objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"unknown">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"day">;
        day: z.ZodString;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"instant">;
        at: z.ZodNumber;
        basis: z.ZodEnum<{
            "native-input": "native-input";
            "current-manual": "current-manual";
        }>;
        sourceVersion: z.ZodString;
    }, z.core.$strict>], "kind">>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        objectiveId: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            kind: z.ZodLiteral<"pending">;
            reason: z.ZodString;
        }, z.core.$strict>]>;
        mistakeId: z.ZodOptional<z.ZodString>;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"authored">;
            description: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"exercise">;
            exerciseId: z.ZodString;
            description: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"mistake">;
            mistakeId: z.ZodString;
            description: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"legacy">;
            sourcePath: z.ZodString;
            row: z.ZodString;
        }, z.core.$strict>], "kind">;
        topic: z.ZodString;
        prompt: z.ZodString;
        answer: z.ZodString;
        explanation: z.ZodString;
        answerEvidence: z.ZodString;
        basisStatus: z.ZodOptional<z.ZodLiteral<"legacy-pending">>;
        choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
        steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
        figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"bar-model">;
            bars: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                segments: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    units: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        solid: "solid";
                        dashed: "dashed";
                    }>>;
                }, z.core.$strict>>;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"money">;
            items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                "1\u5206": "1分";
                "2\u5206": "2分";
                "5\u5206": "5分";
                "1\u89D2": "1角";
                "2\u89D2": "2角";
                "5\u89D2": "5角";
                "1\u5143": "1元";
                "5\u5143": "5元";
                "10\u5143": "10元";
                "20\u5143": "20元";
                "50\u5143": "50元";
                "100\u5143": "100元";
            }>, z.ZodObject<{
                denomination: z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>]>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"place-value">;
            tens: z.ZodNumber;
            ones: z.ZodNumber;
            crossTens: z.ZodNumber;
            crossOnes: z.ZodNumber;
            regroup: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"hundred-chart">;
            hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            window: z.ZodOptional<z.ZodObject<{
                center: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"number-line">;
            from: z.ZodNumber;
            to: z.ZodNumber;
            step: z.ZodNumber;
            marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                value: z.ZodNumber;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
            jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                from: z.ZodNumber;
                to: z.ZodNumber;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"clock">;
            clocks: z.ZodArray<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sticks">;
            bundles: z.ZodNumber;
            singles: z.ZodNumber;
            crossBundles: z.ZodOptional<z.ZodNumber>;
            crossSingles: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"vertical">;
            count: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"shapes">;
            rows: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                }>;
                count: z.ZodNumber;
                blank: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"overlap">;
            left: z.ZodString;
            right: z.ZodString;
            leftOnly: z.ZodString;
            both: z.ZodString;
            rightOnly: z.ZodString;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"split">;
            parts: z.ZodArray<z.ZodObject<{
                top: z.ZodString;
                left: z.ZodString;
                right: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sequence">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                    star: "star";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            blank: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"wall">;
            rows: z.ZodArray<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"grid">;
            columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
            rows: z.ZodArray<z.ZodObject<{
                name: z.ZodOptional<z.ZodString>;
                cells: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"dot-array">;
            rows: z.ZodNumber;
            columns: z.ZodNumber;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"plane">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                    rectangle: "rectangle";
                    quadrilateral: "quadrilateral";
                    curved: "curved";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            mark: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"solid">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    cube: "cube";
                    cuboid: "cuboid";
                    cylinder: "cylinder";
                    sphere: "sphere";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            mark: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"counter">;
            hundreds: z.ZodNumber;
            tens: z.ZodNumber;
            ones: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"measure">;
            bars: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                length: z.ZodNumber;
                style: z.ZodOptional<z.ZodEnum<{
                    curved: "curved";
                    straight: "straight";
                }>>;
            }, z.core.$strict>>;
            ruler: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"compass">;
            blank: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"balance">;
            left: z.ZodString;
            right: z.ZodString;
            tilt: z.ZodEnum<{
                left: "left";
                right: "right";
                level: "level";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"writing">;
            style: z.ZodEnum<{
                tianzige: "tianzige";
                fourline: "fourline";
            }>;
            count: z.ZodOptional<z.ZodNumber>;
            example: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sketch">;
            height: z.ZodNumber;
            elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                draw: z.ZodLiteral<"line">;
                from: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"polyline">;
                points: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>>;
                closed: z.ZodOptional<z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"rect">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"circle">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                radius: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"text">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                label: z.ZodString;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"arrow">;
                from: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>], "draw">>;
        }, z.core.$strict>], "kind">>;
        phase: z.ZodOptional<z.ZodEnum<{
            demo: "demo";
            try: "try";
            vary: "vary";
            guide: "guide";
        }>>;
        variant: z.ZodOptional<z.ZodEnum<{
            numeric: "numeric";
            context: "context";
            reasoning: "reasoning";
        }>>;
        space: z.ZodOptional<z.ZodEnum<{
            line: "line";
            none: "none";
            lines: "lines";
            box: "box";
        }>>;
    }, z.core.$strict>>;
    responses: z.ZodArray<z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
        questionId: z.ZodString;
        rawResponse: z.ZodString;
        response: z.ZodOptional<z.ZodString>;
        assistance: z.ZodEnum<{
            unknown: "unknown";
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        assistanceConfirmation: z.ZodOptional<z.ZodString>;
        answerDateConfirmation: z.ZodOptional<z.ZodString>;
        answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"unknown">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"day">;
            day: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"instant">;
            at: z.ZodNumber;
            basis: z.ZodEnum<{
                "native-input": "native-input";
                "current-manual": "current-manual";
            }>;
            sourceVersion: z.ZodString;
        }, z.core.$strict>], "kind">>;
        source: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"unknown">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"native">;
            sessionId: z.ZodString;
            messageId: z.ZodString;
            inputVersion: z.ZodString;
            receiptAt: z.ZodOptional<z.ZodNumber>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"paper">;
            imagePaths: z.ZodArray<z.ZodString>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"manual">;
            entry: z.ZodEnum<{
                current: "current";
                historical: "historical";
            }>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"legacy">;
            sourcePath: z.ZodString;
            row: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>>;
    assessments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        responseId: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
            stuck: "stuck";
        }>;
        assistance: z.ZodEnum<{
            unknown: "unknown";
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        feedback: z.ZodString;
        answerEvidence: z.ZodString;
        assessedAt: z.ZodNumber;
        correctedAt: z.ZodOptional<z.ZodNumber>;
        userConfirmation: z.ZodOptional<z.ZodString>;
        errorType: z.ZodOptional<z.ZodEnum<{
            "carry-borrow": "carry-borrow";
            "place-value": "place-value";
            "operation-choice": "operation-choice";
            calculation: "calculation";
            "unit-quantity": "unit-quantity";
            "reading-task": "reading-task";
            pattern: "pattern";
            "geometry-feature": "geometry-feature";
            "money-measure": "money-measure";
            "reasoning-incomplete": "reasoning-incomplete";
            "pinyin-tone": "pinyin-tone";
            "character-form": "character-form";
            "character-usage": "character-usage";
            "word-meaning": "word-meaning";
            "reading-evidence": "reading-evidence";
            order: "order";
            "expression-incomplete": "expression-incomplete";
            punctuation: "punctuation";
            listening: "listening";
            spelling: "spelling";
            "word-form": "word-form";
            "sentence-pattern": "sentence-pattern";
            "usage-context": "usage-context";
            "spoken-response": "spoken-response";
            "writing-complete": "writing-complete";
        }>>;
    }, z.core.$strict>>;
    drafts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        questionId: z.ZodString;
        response: z.ZodString;
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
            stuck: "stuck";
        }>;
        assistance: z.ZodEnum<{
            unknown: "unknown";
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        confidence: z.ZodEnum<{
            high: "high";
            low: "low";
        }>;
        uncertainties: z.ZodString;
        imagePaths: z.ZodArray<z.ZodString>;
        receivedAt: z.ZodNumber;
    }, z.core.$strict>>;
    pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sourcePath: z.ZodString;
        row: z.ZodString;
        fields: z.ZodArray<z.ZodString>;
        reason: z.ZodString;
    }, z.core.$strict>>>;
    format: z.ZodLiteral<2>;
    termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
}, z.core.$strict>;
/** Bounded non-block collections with explicit ownership; rewards have one calendar day/reason identity. */
export declare const collectionsSchema: z.ZodObject<{
    kind: z.ZodLiteral<"collections">;
    mistakes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        confirmedAt: z.ZodOptional<z.ZodNumber>;
        materialId: z.ZodOptional<z.ZodString>;
        topic: z.ZodString;
        prompt: z.ZodString;
        learnerAnswer: z.ZodString;
        correction: z.ZodString;
        explanation: z.ZodString;
        answerEvidence: z.ZodString;
        imagePath: z.ZodOptional<z.ZodString>;
        uncertainties: z.ZodString;
        objectiveId: z.ZodOptional<z.ZodString>;
        errorType: z.ZodOptional<z.ZodEnum<{
            "carry-borrow": "carry-borrow";
            "place-value": "place-value";
            "operation-choice": "operation-choice";
            calculation: "calculation";
            "unit-quantity": "unit-quantity";
            "reading-task": "reading-task";
            pattern: "pattern";
            "geometry-feature": "geometry-feature";
            "money-measure": "money-measure";
            "reasoning-incomplete": "reasoning-incomplete";
            "pinyin-tone": "pinyin-tone";
            "character-form": "character-form";
            "character-usage": "character-usage";
            "word-meaning": "word-meaning";
            "reading-evidence": "reading-evidence";
            order: "order";
            "expression-incomplete": "expression-incomplete";
            punctuation: "punctuation";
            listening: "listening";
            spelling: "spelling";
            "word-form": "word-form";
            "sentence-pattern": "sentence-pattern";
            "usage-context": "usage-context";
            "spoken-response": "spoken-response";
            "writing-complete": "writing-complete";
        }>>;
        source: z.ZodOptional<z.ZodObject<{
            worksheetId: z.ZodString;
            itemId: z.ZodString;
        }, z.core.$strict>>;
        userConfirmation: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    exercises: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        objectiveId: z.ZodString;
        role: z.ZodEnum<{
            daily: "daily";
            diagnose: "diagnose";
            demo: "demo";
            try: "try";
            vary: "vary";
        }>;
        variant: z.ZodEnum<{
            numeric: "numeric";
            context: "context";
            reasoning: "reasoning";
        }>;
        prompt: z.ZodString;
        choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
        figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"bar-model">;
            bars: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                segments: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    units: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        solid: "solid";
                        dashed: "dashed";
                    }>>;
                }, z.core.$strict>>;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"money">;
            items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                "1\u5206": "1分";
                "2\u5206": "2分";
                "5\u5206": "5分";
                "1\u89D2": "1角";
                "2\u89D2": "2角";
                "5\u89D2": "5角";
                "1\u5143": "1元";
                "5\u5143": "5元";
                "10\u5143": "10元";
                "20\u5143": "20元";
                "50\u5143": "50元";
                "100\u5143": "100元";
            }>, z.ZodObject<{
                denomination: z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>]>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"place-value">;
            tens: z.ZodNumber;
            ones: z.ZodNumber;
            crossTens: z.ZodNumber;
            crossOnes: z.ZodNumber;
            regroup: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"hundred-chart">;
            hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            window: z.ZodOptional<z.ZodObject<{
                center: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"number-line">;
            from: z.ZodNumber;
            to: z.ZodNumber;
            step: z.ZodNumber;
            marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                value: z.ZodNumber;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
            jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                from: z.ZodNumber;
                to: z.ZodNumber;
                label: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"clock">;
            clocks: z.ZodArray<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sticks">;
            bundles: z.ZodNumber;
            singles: z.ZodNumber;
            crossBundles: z.ZodOptional<z.ZodNumber>;
            crossSingles: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"vertical">;
            count: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"shapes">;
            rows: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                }>;
                count: z.ZodNumber;
                blank: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"overlap">;
            left: z.ZodString;
            right: z.ZodString;
            leftOnly: z.ZodString;
            both: z.ZodString;
            rightOnly: z.ZodString;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"split">;
            parts: z.ZodArray<z.ZodObject<{
                top: z.ZodString;
                left: z.ZodString;
                right: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sequence">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                    star: "star";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            blank: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"wall">;
            rows: z.ZodArray<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"grid">;
            columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
            rows: z.ZodArray<z.ZodObject<{
                name: z.ZodOptional<z.ZodString>;
                cells: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"dot-array">;
            rows: z.ZodNumber;
            columns: z.ZodNumber;
            total: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"plane">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    circle: "circle";
                    square: "square";
                    triangle: "triangle";
                    rectangle: "rectangle";
                    quadrilateral: "quadrilateral";
                    curved: "curved";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            mark: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"solid">;
            items: z.ZodArray<z.ZodObject<{
                shape: z.ZodEnum<{
                    cube: "cube";
                    cuboid: "cuboid";
                    cylinder: "cylinder";
                    sphere: "sphere";
                }>;
                count: z.ZodNumber;
            }, z.core.$strict>>;
            mark: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"counter">;
            hundreds: z.ZodNumber;
            tens: z.ZodNumber;
            ones: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"measure">;
            bars: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                length: z.ZodNumber;
                style: z.ZodOptional<z.ZodEnum<{
                    curved: "curved";
                    straight: "straight";
                }>>;
            }, z.core.$strict>>;
            ruler: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"compass">;
            blank: z.ZodEnum<{
                yes: "yes";
                no: "no";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"balance">;
            left: z.ZodString;
            right: z.ZodString;
            tilt: z.ZodEnum<{
                left: "left";
                right: "right";
                level: "level";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"writing">;
            style: z.ZodEnum<{
                tianzige: "tianzige";
                fourline: "fourline";
            }>;
            count: z.ZodOptional<z.ZodNumber>;
            example: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"sketch">;
            height: z.ZodNumber;
            elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                draw: z.ZodLiteral<"line">;
                from: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"polyline">;
                points: z.ZodArray<z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>>;
                closed: z.ZodOptional<z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"rect">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"circle">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                radius: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"text">;
                x: z.ZodNumber;
                y: z.ZodNumber;
                label: z.ZodString;
                align: z.ZodOptional<z.ZodEnum<{
                    left: "left";
                    center: "center";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                draw: z.ZodLiteral<"arrow">;
                from: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>], "draw">>;
        }, z.core.$strict>], "kind">>;
        steps: z.ZodArray<z.ZodString>;
        answer: z.ZodString;
        explanation: z.ZodString;
        answerEvidence: z.ZodString;
        errorType: z.ZodOptional<z.ZodEnum<{
            "carry-borrow": "carry-borrow";
            "place-value": "place-value";
            "operation-choice": "operation-choice";
            calculation: "calculation";
            "unit-quantity": "unit-quantity";
            "reading-task": "reading-task";
            pattern: "pattern";
            "geometry-feature": "geometry-feature";
            "money-measure": "money-measure";
            "reasoning-incomplete": "reasoning-incomplete";
            "pinyin-tone": "pinyin-tone";
            "character-form": "character-form";
            "character-usage": "character-usage";
            "word-meaning": "word-meaning";
            "reading-evidence": "reading-evidence";
            order: "order";
            "expression-incomplete": "expression-incomplete";
            punctuation: "punctuation";
            listening: "listening";
            spelling: "spelling";
            "word-form": "word-form";
            "sentence-pattern": "sentence-pattern";
            "usage-context": "usage-context";
            "spoken-response": "spoken-response";
            "writing-complete": "writing-complete";
        }>>;
        savedAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>>;
    concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        name: z.ZodString;
        definition: z.ZodString;
        example: z.ZodString;
        source: z.ZodString;
        facts: z.ZodOptional<z.ZodArray<z.ZodString>>;
        misconceptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        confirmedAt: z.ZodOptional<z.ZodNumber>;
        userConfirmation: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    objectives: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        title: z.ZodString;
        goal: z.ZodString;
        conceptIds: z.ZodArray<z.ZodString>;
        method: z.ZodEnum<{
            listen: "listen";
            context: "context";
            recognize: "recognize";
            "read-evidence": "read-evidence";
            express: "express";
            represent: "represent";
            reason: "reason";
            verify: "verify";
            speak: "speak";
        }>;
        errorTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            "carry-borrow": "carry-borrow";
            "place-value": "place-value";
            "operation-choice": "operation-choice";
            calculation: "calculation";
            "unit-quantity": "unit-quantity";
            "reading-task": "reading-task";
            pattern: "pattern";
            "geometry-feature": "geometry-feature";
            "money-measure": "money-measure";
            "reasoning-incomplete": "reasoning-incomplete";
            "pinyin-tone": "pinyin-tone";
            "character-form": "character-form";
            "character-usage": "character-usage";
            "word-meaning": "word-meaning";
            "reading-evidence": "reading-evidence";
            order: "order";
            "expression-incomplete": "expression-incomplete";
            punctuation: "punctuation";
            listening: "listening";
            spelling: "spelling";
            "word-form": "word-form";
            "sentence-pattern": "sentence-pattern";
            "usage-context": "usage-context";
            "spoken-response": "spoken-response";
            "writing-complete": "writing-complete";
        }>>>;
        questionPoints: z.ZodOptional<z.ZodArray<z.ZodString>>;
        variationAxes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            reverse: "reverse";
            context: "context";
            numbers: "numbers";
            representation: "representation";
            explain: "explain";
        }>>>;
    }, z.core.$strict>>>;
    relations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        fromId: z.ZodString;
        toId: z.ZodString;
        kind: z.ZodEnum<{
            prerequisite: "prerequisite";
            "part-of": "part-of";
            contrast: "contrast";
            explains: "explains";
            "cause-effect": "cause-effect";
        }>;
        explanation: z.ZodString;
        source: z.ZodString;
    }, z.core.$strict>>>;
    teachingQueue: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        prompt: z.ZodString;
        objectiveId: z.ZodOptional<z.ZodString>;
        confirmedAt: z.ZodNumber;
        sourceDraftId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    rewards: z.ZodArray<z.ZodObject<{
        reason: z.ZodEnum<{
            reflection: "reflection";
            participation: "participation";
        }>;
        day: z.ZodString;
    }, z.core.$strict>>;
    pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sourcePath: z.ZodString;
        row: z.ZodString;
        fields: z.ZodArray<z.ZodString>;
        reason: z.ZodString;
    }, z.core.$strict>>>;
    format: z.ZodLiteral<2>;
    termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
}, z.core.$strict>;
/** Machine-readable file definitions shared by CLI, application reads and manual saves. */
export declare const officialFileSchemas: {
    readonly 'term-settings': z.ZodObject<{
        kind: z.ZodLiteral<"term-settings">;
        revision: z.ZodNumber;
        updatedAt: z.ZodNumber;
        profile: z.ZodObject<{
            region: z.ZodString;
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            schoolYear: z.ZodString;
            schoolSystem: z.ZodEnum<{
                "five-four": "five-four";
                "six-three": "six-three";
            }>;
            nickname: z.ZodString;
            schoolAlias: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>;
        materials: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            scope: z.ZodObject<{
                region: z.ZodString;
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                schoolYear: z.ZodString;
                schoolSystem: z.ZodEnum<{
                    "five-four": "five-four";
                    "six-three": "six-three";
                }>;
            }, z.core.$strict>;
            title: z.ZodString;
            publisher: z.ZodString;
            edition: z.ZodString;
            editionStatus: z.ZodEnum<{
                unconfirmed: "unconfirmed";
                identified: "identified";
            }>;
            kind: z.ZodEnum<{
                "official-textbook": "official-textbook";
                "school-material": "school-material";
                reference: "reference";
                generated: "generated";
            }>;
            locator: z.ZodString;
            evidence: z.ZodString;
        }, z.core.$strict>>;
        courses: z.ZodArray<z.ZodObject<{
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            materialId: z.ZodString;
            unit: z.ZodString;
            progress: z.ZodOptional<z.ZodObject<{
                unitId: z.ZodString;
                confirmedAt: z.ZodNumber;
                posture: z.ZodEnum<{
                    "keep-up": "keep-up";
                    "catch-up": "catch-up";
                }>;
                preview: z.ZodBoolean;
                pace: z.ZodEnum<{
                    review: "review";
                    teaching: "teaching";
                }>;
            }, z.core.$strict>>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>>;
        interests: z.ZodOptional<z.ZodObject<{
            tags: z.ZodArray<z.ZodString>;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>>;
        openmaic: z.ZodOptional<z.ZodObject<{
            baseUrl: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>>;
        archivedAt: z.ZodOptional<z.ZodNumber>;
        migration: z.ZodOptional<z.ZodObject<{
            sourcePath: z.ZodString;
            sourceSha256: z.ZodString;
            backupPath: z.ZodString;
        }, z.core.$strict>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
    }, z.core.$strict>;
    readonly block: z.ZodObject<{
        kind: z.ZodLiteral<"block">;
        id: z.ZodPipe<z.ZodString, z.ZodTransform<BlockId, string>>;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        mode: z.ZodEnum<{
            review: "review";
            diagnose: "diagnose";
            foundation: "foundation";
            school: "school";
            explore: "explore";
        }>;
        intensity: z.ZodOptional<z.ZodEnum<{
            light: "light";
            standard: "standard";
            deep: "deep";
        }>>;
        startedAt: z.ZodNumber;
        endedAt: z.ZodOptional<z.ZodNumber>;
        spentMs: z.ZodOptional<z.ZodNumber>;
        reflection: z.ZodOptional<z.ZodString>;
        context: z.ZodObject<{
            profile: z.ZodOptional<z.ZodObject<{
                region: z.ZodString;
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                schoolYear: z.ZodString;
                schoolSystem: z.ZodEnum<{
                    "five-four": "five-four";
                    "six-three": "six-three";
                }>;
                nickname: z.ZodString;
                schoolAlias: z.ZodString;
                parentConfirmation: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>;
            pendingProfile: z.ZodOptional<z.ZodString>;
            scope: z.ZodOptional<z.ZodObject<{
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                units: z.ZodOptional<z.ZodArray<z.ZodString>>;
                objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
            material: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                subject: z.ZodEnum<{
                    chinese: "chinese";
                    math: "math";
                    english: "english";
                }>;
                scope: z.ZodObject<{
                    region: z.ZodString;
                    grade: z.ZodNumber;
                    term: z.ZodEnum<{
                        first: "first";
                        second: "second";
                    }>;
                    schoolYear: z.ZodString;
                    schoolSystem: z.ZodEnum<{
                        "five-four": "five-four";
                        "six-three": "six-three";
                    }>;
                }, z.core.$strict>;
                title: z.ZodString;
                publisher: z.ZodString;
                edition: z.ZodString;
                editionStatus: z.ZodEnum<{
                    unconfirmed: "unconfirmed";
                    identified: "identified";
                }>;
                kind: z.ZodEnum<{
                    "official-textbook": "official-textbook";
                    "school-material": "school-material";
                    reference: "reference";
                    generated: "generated";
                }>;
                locator: z.ZodString;
                evidence: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        currentQuestionId: z.ZodOptional<z.ZodString>;
        questions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectiveId: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                kind: z.ZodLiteral<"pending">;
                reason: z.ZodString;
            }, z.core.$strict>]>;
            mistakeId: z.ZodOptional<z.ZodString>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"authored">;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"exercise">;
                exerciseId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"mistake">;
                mistakeId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
            topic: z.ZodString;
            prompt: z.ZodString;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
            basisStatus: z.ZodOptional<z.ZodLiteral<"legacy-pending">>;
            choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
            steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
            figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"bar-model">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    segments: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        units: z.ZodNumber;
                        style: z.ZodOptional<z.ZodEnum<{
                            solid: "solid";
                            dashed: "dashed";
                        }>>;
                    }, z.core.$strict>>;
                    total: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"money">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>, z.ZodObject<{
                    denomination: z.ZodEnum<{
                        "1\u5206": "1分";
                        "2\u5206": "2分";
                        "5\u5206": "5分";
                        "1\u89D2": "1角";
                        "2\u89D2": "2角";
                        "5\u89D2": "5角";
                        "1\u5143": "1元";
                        "5\u5143": "5元";
                        "10\u5143": "10元";
                        "20\u5143": "20元";
                        "50\u5143": "50元";
                        "100\u5143": "100元";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>]>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"place-value">;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
                crossTens: z.ZodNumber;
                crossOnes: z.ZodNumber;
                regroup: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"hundred-chart">;
                hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                window: z.ZodOptional<z.ZodObject<{
                    center: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"number-line">;
                from: z.ZodNumber;
                to: z.ZodNumber;
                step: z.ZodNumber;
                marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    value: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    from: z.ZodNumber;
                    to: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"clock">;
                clocks: z.ZodArray<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sticks">;
                bundles: z.ZodNumber;
                singles: z.ZodNumber;
                crossBundles: z.ZodOptional<z.ZodNumber>;
                crossSingles: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"vertical">;
                count: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"shapes">;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                    }>;
                    count: z.ZodNumber;
                    blank: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"overlap">;
                left: z.ZodString;
                right: z.ZodString;
                leftOnly: z.ZodString;
                both: z.ZodString;
                rightOnly: z.ZodString;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"split">;
                parts: z.ZodArray<z.ZodObject<{
                    top: z.ZodString;
                    left: z.ZodString;
                    right: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sequence">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        star: "star";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                blank: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"wall">;
                rows: z.ZodArray<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"grid">;
                columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodOptional<z.ZodString>;
                    cells: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"dot-array">;
                rows: z.ZodNumber;
                columns: z.ZodNumber;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"plane">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        rectangle: "rectangle";
                        quadrilateral: "quadrilateral";
                        curved: "curved";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"solid">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        cube: "cube";
                        cuboid: "cuboid";
                        cylinder: "cylinder";
                        sphere: "sphere";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"counter">;
                hundreds: z.ZodNumber;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"measure">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    length: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        curved: "curved";
                        straight: "straight";
                    }>>;
                }, z.core.$strict>>;
                ruler: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"compass">;
                blank: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"balance">;
                left: z.ZodString;
                right: z.ZodString;
                tilt: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    level: "level";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"writing">;
                style: z.ZodEnum<{
                    tianzige: "tianzige";
                    fourline: "fourline";
                }>;
                count: z.ZodOptional<z.ZodNumber>;
                example: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sketch">;
                height: z.ZodNumber;
                elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    draw: z.ZodLiteral<"line">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"polyline">;
                    points: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                    closed: z.ZodOptional<z.ZodEnum<{
                        yes: "yes";
                        no: "no";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"rect">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"circle">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    radius: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"text">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    label: z.ZodString;
                    align: z.ZodOptional<z.ZodEnum<{
                        left: "left";
                        center: "center";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"arrow">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "draw">>;
            }, z.core.$strict>], "kind">>;
            phase: z.ZodOptional<z.ZodEnum<{
                demo: "demo";
                try: "try";
                vary: "vary";
                guide: "guide";
            }>>;
            variant: z.ZodOptional<z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>>;
            space: z.ZodOptional<z.ZodEnum<{
                line: "line";
                none: "none";
                lines: "lines";
                box: "box";
            }>>;
        }, z.core.$strict>>;
        responses: z.ZodArray<z.ZodObject<{
            id: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
            questionId: z.ZodString;
            rawResponse: z.ZodString;
            response: z.ZodOptional<z.ZodString>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            assistanceConfirmation: z.ZodOptional<z.ZodString>;
            answerDateConfirmation: z.ZodOptional<z.ZodString>;
            answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"day">;
                day: z.ZodString;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"instant">;
                at: z.ZodNumber;
                basis: z.ZodEnum<{
                    "native-input": "native-input";
                    "current-manual": "current-manual";
                }>;
                sourceVersion: z.ZodString;
            }, z.core.$strict>], "kind">>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"native">;
                sessionId: z.ZodString;
                messageId: z.ZodString;
                inputVersion: z.ZodString;
                receiptAt: z.ZodOptional<z.ZodNumber>;
                attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"paper">;
                imagePaths: z.ZodArray<z.ZodString>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"manual">;
                entry: z.ZodEnum<{
                    current: "current";
                    historical: "historical";
                }>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        currentResponseId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>>;
        hints: z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            responseId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>>;
            level: z.ZodNumber;
            at: z.ZodNumber;
        }, z.core.$strict>>;
        stuckSignals: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            at: z.ZodNumber;
        }, z.core.$strict>>>;
        assessments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            responseId: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
            result: z.ZodEnum<{
                correct: "correct";
                partial: "partial";
                incorrect: "incorrect";
                unassessed: "unassessed";
                stuck: "stuck";
            }>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            feedback: z.ZodString;
            answerEvidence: z.ZodString;
            assessedAt: z.ZodNumber;
            correctedAt: z.ZodOptional<z.ZodNumber>;
            userConfirmation: z.ZodOptional<z.ZodString>;
            errorType: z.ZodOptional<z.ZodEnum<{
                "carry-borrow": "carry-borrow";
                "place-value": "place-value";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                pattern: "pattern";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                listening: "listening";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
        }, z.core.$strict>>;
        pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourcePath: z.ZodString;
            row: z.ZodString;
            fields: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
    }, z.core.$strict>;
    readonly worksheet: z.ZodObject<{
        kind: z.ZodLiteral<"worksheet">;
        id: z.ZodPipe<z.ZodString, z.ZodTransform<WorksheetId, string>>;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        worksheetKind: z.ZodOptional<z.ZodEnum<{
            review: "review";
            daily: "daily";
            practice: "practice";
        }>>;
        origin: z.ZodEnum<{
            prepared: "prepared";
            workbook: "workbook";
        }>;
        createdAt: z.ZodNumber;
        discardedAt: z.ZodOptional<z.ZodNumber>;
        context: z.ZodObject<{
            profile: z.ZodOptional<z.ZodObject<{
                region: z.ZodString;
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                schoolYear: z.ZodString;
                schoolSystem: z.ZodEnum<{
                    "five-four": "five-four";
                    "six-three": "six-three";
                }>;
                nickname: z.ZodString;
                schoolAlias: z.ZodString;
                parentConfirmation: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>;
            pendingProfile: z.ZodOptional<z.ZodString>;
            scope: z.ZodOptional<z.ZodObject<{
                grade: z.ZodNumber;
                term: z.ZodEnum<{
                    first: "first";
                    second: "second";
                }>;
                units: z.ZodOptional<z.ZodArray<z.ZodString>>;
                objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"unknown">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"day">;
            day: z.ZodString;
            parentConfirmation: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"instant">;
            at: z.ZodNumber;
            basis: z.ZodEnum<{
                "native-input": "native-input";
                "current-manual": "current-manual";
            }>;
            sourceVersion: z.ZodString;
        }, z.core.$strict>], "kind">>;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectiveId: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                kind: z.ZodLiteral<"pending">;
                reason: z.ZodString;
            }, z.core.$strict>]>;
            mistakeId: z.ZodOptional<z.ZodString>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"authored">;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"exercise">;
                exerciseId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"mistake">;
                mistakeId: z.ZodString;
                description: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
            topic: z.ZodString;
            prompt: z.ZodString;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
            basisStatus: z.ZodOptional<z.ZodLiteral<"legacy-pending">>;
            choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
            steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
            figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"bar-model">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    segments: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        units: z.ZodNumber;
                        style: z.ZodOptional<z.ZodEnum<{
                            solid: "solid";
                            dashed: "dashed";
                        }>>;
                    }, z.core.$strict>>;
                    total: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"money">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>, z.ZodObject<{
                    denomination: z.ZodEnum<{
                        "1\u5206": "1分";
                        "2\u5206": "2分";
                        "5\u5206": "5分";
                        "1\u89D2": "1角";
                        "2\u89D2": "2角";
                        "5\u89D2": "5角";
                        "1\u5143": "1元";
                        "5\u5143": "5元";
                        "10\u5143": "10元";
                        "20\u5143": "20元";
                        "50\u5143": "50元";
                        "100\u5143": "100元";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>]>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"place-value">;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
                crossTens: z.ZodNumber;
                crossOnes: z.ZodNumber;
                regroup: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"hundred-chart">;
                hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                window: z.ZodOptional<z.ZodObject<{
                    center: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"number-line">;
                from: z.ZodNumber;
                to: z.ZodNumber;
                step: z.ZodNumber;
                marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    value: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    from: z.ZodNumber;
                    to: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"clock">;
                clocks: z.ZodArray<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sticks">;
                bundles: z.ZodNumber;
                singles: z.ZodNumber;
                crossBundles: z.ZodOptional<z.ZodNumber>;
                crossSingles: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"vertical">;
                count: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"shapes">;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                    }>;
                    count: z.ZodNumber;
                    blank: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"overlap">;
                left: z.ZodString;
                right: z.ZodString;
                leftOnly: z.ZodString;
                both: z.ZodString;
                rightOnly: z.ZodString;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"split">;
                parts: z.ZodArray<z.ZodObject<{
                    top: z.ZodString;
                    left: z.ZodString;
                    right: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sequence">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        star: "star";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                blank: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"wall">;
                rows: z.ZodArray<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"grid">;
                columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodOptional<z.ZodString>;
                    cells: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"dot-array">;
                rows: z.ZodNumber;
                columns: z.ZodNumber;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"plane">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        rectangle: "rectangle";
                        quadrilateral: "quadrilateral";
                        curved: "curved";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"solid">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        cube: "cube";
                        cuboid: "cuboid";
                        cylinder: "cylinder";
                        sphere: "sphere";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"counter">;
                hundreds: z.ZodNumber;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"measure">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    length: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        curved: "curved";
                        straight: "straight";
                    }>>;
                }, z.core.$strict>>;
                ruler: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"compass">;
                blank: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"balance">;
                left: z.ZodString;
                right: z.ZodString;
                tilt: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    level: "level";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"writing">;
                style: z.ZodEnum<{
                    tianzige: "tianzige";
                    fourline: "fourline";
                }>;
                count: z.ZodOptional<z.ZodNumber>;
                example: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sketch">;
                height: z.ZodNumber;
                elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    draw: z.ZodLiteral<"line">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"polyline">;
                    points: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                    closed: z.ZodOptional<z.ZodEnum<{
                        yes: "yes";
                        no: "no";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"rect">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"circle">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    radius: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"text">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    label: z.ZodString;
                    align: z.ZodOptional<z.ZodEnum<{
                        left: "left";
                        center: "center";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"arrow">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "draw">>;
            }, z.core.$strict>], "kind">>;
            phase: z.ZodOptional<z.ZodEnum<{
                demo: "demo";
                try: "try";
                vary: "vary";
                guide: "guide";
            }>>;
            variant: z.ZodOptional<z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>>;
            space: z.ZodOptional<z.ZodEnum<{
                line: "line";
                none: "none";
                lines: "lines";
                box: "box";
            }>>;
        }, z.core.$strict>>;
        responses: z.ZodArray<z.ZodObject<{
            id: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
            questionId: z.ZodString;
            rawResponse: z.ZodString;
            response: z.ZodOptional<z.ZodString>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            assistanceConfirmation: z.ZodOptional<z.ZodString>;
            answerDateConfirmation: z.ZodOptional<z.ZodString>;
            answerDate: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"day">;
                day: z.ZodString;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"instant">;
                at: z.ZodNumber;
                basis: z.ZodEnum<{
                    "native-input": "native-input";
                    "current-manual": "current-manual";
                }>;
                sourceVersion: z.ZodString;
            }, z.core.$strict>], "kind">>;
            source: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"unknown">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"native">;
                sessionId: z.ZodString;
                messageId: z.ZodString;
                inputVersion: z.ZodString;
                receiptAt: z.ZodOptional<z.ZodNumber>;
                attachments: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"paper">;
                imagePaths: z.ZodArray<z.ZodString>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"manual">;
                entry: z.ZodEnum<{
                    current: "current";
                    historical: "historical";
                }>;
                parentConfirmation: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"legacy">;
                sourcePath: z.ZodString;
                row: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>>;
        assessments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            responseId: z.ZodPipe<z.ZodString, z.ZodTransform<ResponseId, string>>;
            result: z.ZodEnum<{
                correct: "correct";
                partial: "partial";
                incorrect: "incorrect";
                unassessed: "unassessed";
                stuck: "stuck";
            }>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            feedback: z.ZodString;
            answerEvidence: z.ZodString;
            assessedAt: z.ZodNumber;
            correctedAt: z.ZodOptional<z.ZodNumber>;
            userConfirmation: z.ZodOptional<z.ZodString>;
            errorType: z.ZodOptional<z.ZodEnum<{
                "carry-borrow": "carry-borrow";
                "place-value": "place-value";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                pattern: "pattern";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                listening: "listening";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
        }, z.core.$strict>>;
        drafts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            questionId: z.ZodString;
            response: z.ZodString;
            result: z.ZodEnum<{
                correct: "correct";
                partial: "partial";
                incorrect: "incorrect";
                unassessed: "unassessed";
                stuck: "stuck";
            }>;
            assistance: z.ZodEnum<{
                unknown: "unknown";
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>;
            confidence: z.ZodEnum<{
                high: "high";
                low: "low";
            }>;
            uncertainties: z.ZodString;
            imagePaths: z.ZodArray<z.ZodString>;
            receivedAt: z.ZodNumber;
        }, z.core.$strict>>;
        pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourcePath: z.ZodString;
            row: z.ZodString;
            fields: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
    }, z.core.$strict>;
    readonly collections: z.ZodObject<{
        kind: z.ZodLiteral<"collections">;
        mistakes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            confirmedAt: z.ZodOptional<z.ZodNumber>;
            materialId: z.ZodOptional<z.ZodString>;
            topic: z.ZodString;
            prompt: z.ZodString;
            learnerAnswer: z.ZodString;
            correction: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
            imagePath: z.ZodOptional<z.ZodString>;
            uncertainties: z.ZodString;
            objectiveId: z.ZodOptional<z.ZodString>;
            errorType: z.ZodOptional<z.ZodEnum<{
                "carry-borrow": "carry-borrow";
                "place-value": "place-value";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                pattern: "pattern";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                listening: "listening";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
            source: z.ZodOptional<z.ZodObject<{
                worksheetId: z.ZodString;
                itemId: z.ZodString;
            }, z.core.$strict>>;
            userConfirmation: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        exercises: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            objectiveId: z.ZodString;
            role: z.ZodEnum<{
                daily: "daily";
                diagnose: "diagnose";
                demo: "demo";
                try: "try";
                vary: "vary";
            }>;
            variant: z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>;
            prompt: z.ZodString;
            choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
            figure: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"bar-model">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    segments: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        units: z.ZodNumber;
                        style: z.ZodOptional<z.ZodEnum<{
                            solid: "solid";
                            dashed: "dashed";
                        }>>;
                    }, z.core.$strict>>;
                    total: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"money">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodEnum<{
                    "1\u5206": "1分";
                    "2\u5206": "2分";
                    "5\u5206": "5分";
                    "1\u89D2": "1角";
                    "2\u89D2": "2角";
                    "5\u89D2": "5角";
                    "1\u5143": "1元";
                    "5\u5143": "5元";
                    "10\u5143": "10元";
                    "20\u5143": "20元";
                    "50\u5143": "50元";
                    "100\u5143": "100元";
                }>, z.ZodObject<{
                    denomination: z.ZodEnum<{
                        "1\u5206": "1分";
                        "2\u5206": "2分";
                        "5\u5206": "5分";
                        "1\u89D2": "1角";
                        "2\u89D2": "2角";
                        "5\u89D2": "5角";
                        "1\u5143": "1元";
                        "5\u5143": "5元";
                        "10\u5143": "10元";
                        "20\u5143": "20元";
                        "50\u5143": "50元";
                        "100\u5143": "100元";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>]>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"place-value">;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
                crossTens: z.ZodNumber;
                crossOnes: z.ZodNumber;
                regroup: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"hundred-chart">;
                hidden: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                window: z.ZodOptional<z.ZodObject<{
                    center: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"number-line">;
                from: z.ZodNumber;
                to: z.ZodNumber;
                step: z.ZodNumber;
                marks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    value: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                jumps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    from: z.ZodNumber;
                    to: z.ZodNumber;
                    label: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"clock">;
                clocks: z.ZodArray<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sticks">;
                bundles: z.ZodNumber;
                singles: z.ZodNumber;
                crossBundles: z.ZodOptional<z.ZodNumber>;
                crossSingles: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"vertical">;
                count: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"shapes">;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                    }>;
                    count: z.ZodNumber;
                    blank: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"overlap">;
                left: z.ZodString;
                right: z.ZodString;
                leftOnly: z.ZodString;
                both: z.ZodString;
                rightOnly: z.ZodString;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"split">;
                parts: z.ZodArray<z.ZodObject<{
                    top: z.ZodString;
                    left: z.ZodString;
                    right: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sequence">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        star: "star";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                blank: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"wall">;
                rows: z.ZodArray<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"grid">;
                columns: z.ZodOptional<z.ZodArray<z.ZodString>>;
                rows: z.ZodArray<z.ZodObject<{
                    name: z.ZodOptional<z.ZodString>;
                    cells: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"dot-array">;
                rows: z.ZodNumber;
                columns: z.ZodNumber;
                total: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"plane">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        circle: "circle";
                        square: "square";
                        triangle: "triangle";
                        rectangle: "rectangle";
                        quadrilateral: "quadrilateral";
                        curved: "curved";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"solid">;
                items: z.ZodArray<z.ZodObject<{
                    shape: z.ZodEnum<{
                        cube: "cube";
                        cuboid: "cuboid";
                        cylinder: "cylinder";
                        sphere: "sphere";
                    }>;
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                mark: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"counter">;
                hundreds: z.ZodNumber;
                tens: z.ZodNumber;
                ones: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"measure">;
                bars: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    length: z.ZodNumber;
                    style: z.ZodOptional<z.ZodEnum<{
                        curved: "curved";
                        straight: "straight";
                    }>>;
                }, z.core.$strict>>;
                ruler: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"compass">;
                blank: z.ZodEnum<{
                    yes: "yes";
                    no: "no";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"balance">;
                left: z.ZodString;
                right: z.ZodString;
                tilt: z.ZodEnum<{
                    left: "left";
                    right: "right";
                    level: "level";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"writing">;
                style: z.ZodEnum<{
                    tianzige: "tianzige";
                    fourline: "fourline";
                }>;
                count: z.ZodOptional<z.ZodNumber>;
                example: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"sketch">;
                height: z.ZodNumber;
                elements: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    draw: z.ZodLiteral<"line">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"polyline">;
                    points: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                    closed: z.ZodOptional<z.ZodEnum<{
                        yes: "yes";
                        no: "no";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"rect">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"circle">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    radius: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"text">;
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                    label: z.ZodString;
                    align: z.ZodOptional<z.ZodEnum<{
                        left: "left";
                        center: "center";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    draw: z.ZodLiteral<"arrow">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>], "draw">>;
            }, z.core.$strict>], "kind">>;
            steps: z.ZodArray<z.ZodString>;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
            errorType: z.ZodOptional<z.ZodEnum<{
                "carry-borrow": "carry-borrow";
                "place-value": "place-value";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                pattern: "pattern";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                listening: "listening";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>;
            savedAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>>>;
        concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            name: z.ZodString;
            definition: z.ZodString;
            example: z.ZodString;
            source: z.ZodString;
            facts: z.ZodOptional<z.ZodArray<z.ZodString>>;
            misconceptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
            confirmedAt: z.ZodOptional<z.ZodNumber>;
            userConfirmation: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        objectives: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            title: z.ZodString;
            goal: z.ZodString;
            conceptIds: z.ZodArray<z.ZodString>;
            method: z.ZodEnum<{
                listen: "listen";
                context: "context";
                recognize: "recognize";
                "read-evidence": "read-evidence";
                express: "express";
                represent: "represent";
                reason: "reason";
                verify: "verify";
                speak: "speak";
            }>;
            errorTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                "carry-borrow": "carry-borrow";
                "place-value": "place-value";
                "operation-choice": "operation-choice";
                calculation: "calculation";
                "unit-quantity": "unit-quantity";
                "reading-task": "reading-task";
                pattern: "pattern";
                "geometry-feature": "geometry-feature";
                "money-measure": "money-measure";
                "reasoning-incomplete": "reasoning-incomplete";
                "pinyin-tone": "pinyin-tone";
                "character-form": "character-form";
                "character-usage": "character-usage";
                "word-meaning": "word-meaning";
                "reading-evidence": "reading-evidence";
                order: "order";
                "expression-incomplete": "expression-incomplete";
                punctuation: "punctuation";
                listening: "listening";
                spelling: "spelling";
                "word-form": "word-form";
                "sentence-pattern": "sentence-pattern";
                "usage-context": "usage-context";
                "spoken-response": "spoken-response";
                "writing-complete": "writing-complete";
            }>>>;
            questionPoints: z.ZodOptional<z.ZodArray<z.ZodString>>;
            variationAxes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                reverse: "reverse";
                context: "context";
                numbers: "numbers";
                representation: "representation";
                explain: "explain";
            }>>>;
        }, z.core.$strict>>>;
        relations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            fromId: z.ZodString;
            toId: z.ZodString;
            kind: z.ZodEnum<{
                prerequisite: "prerequisite";
                "part-of": "part-of";
                contrast: "contrast";
                explains: "explains";
                "cause-effect": "cause-effect";
            }>;
            explanation: z.ZodString;
            source: z.ZodString;
        }, z.core.$strict>>>;
        teachingQueue: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodEnum<{
                chinese: "chinese";
                math: "math";
                english: "english";
            }>;
            prompt: z.ZodString;
            objectiveId: z.ZodOptional<z.ZodString>;
            confirmedAt: z.ZodNumber;
            sourceDraftId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        rewards: z.ZodArray<z.ZodObject<{
            reason: z.ZodEnum<{
                reflection: "reflection";
                participation: "participation";
            }>;
            day: z.ZodString;
        }, z.core.$strict>>;
        pendingLegacy: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourcePath: z.ZodString;
            row: z.ZodString;
            fields: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        format: z.ZodLiteral<2>;
        termId: z.ZodPipe<z.ZodString, z.ZodTransform<TermId, string>>;
    }, z.core.$strict>;
};
/** Validated official term file. */
export type TermSettings = z.infer<typeof termSettingsSchema>;
/** Validated official block file. */
export type LearningBlock = z.infer<typeof blockSchema>;
/** Validated official worksheet file. */
export type WorksheetFile = z.infer<typeof worksheetSchema>;
/** Validated bounded collection file. */
export type CollectionsFile = z.infer<typeof collectionsSchema>;
/** One official entity file. */
export type OfficialFile = TermSettings | LearningBlock | WorksheetFile | CollectionsFile;
/** Actual answer precision. */
export type AnswerDate = z.infer<typeof answerDateSchema>;
/** One saved original response. */
export type LearnerResponse = z.infer<typeof responseSchema>;
/** One current response assessment. */
export type Assessment = z.infer<typeof assessmentSchema>;
//# sourceMappingURL=schema.d.ts.map