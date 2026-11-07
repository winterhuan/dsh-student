import { z } from 'zod';
/** Model-suggested cause of one mistake; the parent can review and change it in the panel. */
export declare const errorTypeSchema: z.ZodEnum<{
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
}>;
/** One mistake's error cause. */
export type ErrorType = z.infer<typeof errorTypeSchema>;
/** How far one review question departs from the original mistake. */
export declare const variantSchema: z.ZodEnum<{
    numeric: "numeric";
    context: "context";
    reasoning: "reasoning";
}>;
/** One review question's variation level. */
export type Variant = z.infer<typeof variantSchema>;
/** How a unit is practised daily, per subject; drives the subject-routine view. */
export declare const unitFocusSchema: z.ZodEnum<{
    calculation: "calculation";
    literacy: "literacy";
    pinyin: "pinyin";
    reading: "reading";
    writing: "writing";
    review: "review";
    concepts: "concepts";
    geometry: "geometry";
    measurement: "measurement";
    words: "words";
    sentences: "sentences";
    story: "story";
    listen: "listen";
    project: "project";
}>;
/** One unit's daily-practice focus. */
export type UnitFocus = z.infer<typeof unitFocusSchema>;
/** Which variation axes one objective supports. */
export declare const variationAxisSchema: z.ZodEnum<{
    reverse: "reverse";
    context: "context";
    numbers: "numbers";
    representation: "representation";
    explain: "explain";
}>;
/** One objective's supported variation axis. */
export type VariationAxis = z.infer<typeof variationAxisSchema>;
/** One printable sheet's role; absent keeps the legacy title heuristic. */
export declare const sheetKindSchema: z.ZodEnum<{
    review: "review";
    daily: "daily";
    practice: "practice";
}>;
/** One exercise item's pedagogical role in diagnosis, Simon four-step teaching, or daily routines. */
export declare const exerciseRoleSchema: z.ZodEnum<{
    daily: "daily";
    diagnose: "diagnose";
    demo: "demo";
    try: "try";
    vary: "vary";
}>;
/** Pedagogical role of a structured exercise item. */
export type ExerciseRole = z.infer<typeof exerciseRoleSchema>;
/** Printable figures drawn by the SVG renderer; an empty label prints an answer box. */
export declare const figureSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "kind">;
declare const figure: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "kind">;
/** A figure shared by an on-screen task and a printed worksheet item. */
export type Figure = z.infer<typeof figure>;
/** One structured exercise item shared by the shipped exercise bank and the workspace collection. */
export declare const exerciseItemSchema: z.ZodObject<{
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
}, z.core.$strict>;
/** One validated exercise item from the shipped bank or the workspace collection. */
export type ExerciseItem = z.infer<typeof exerciseItemSchema>;
/** One step of teaching the current task: show, guide, independent try, then a variation. */
export declare const phaseSchema: z.ZodEnum<{
    demo: "demo";
    try: "try";
    vary: "vary";
    guide: "guide";
}>;
/** One teaching step on the current task. */
export type TeachPhase = z.infer<typeof phaseSchema>;
/** Validated mutations; confirmation fields record user statements, not authenticated identities. */
export declare const commandSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"setup">;
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
        parentConfirmation: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"material">;
    material: z.ZodObject<{
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"course">;
    course: z.ZodObject<{
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        materialId: z.ZodString;
        unit: z.ZodString;
        parentConfirmation: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"start">;
    id: z.ZodString;
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
    scope: z.ZodOptional<z.ZodObject<{
        grade: z.ZodNumber;
        term: z.ZodEnum<{
            first: "first";
            second: "second";
        }>;
        units: z.ZodOptional<z.ZodArray<z.ZodString>>;
        objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"task">;
    task: z.ZodObject<{
        id: z.ZodString;
        sessionId: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        topic: z.ZodString;
        prompt: z.ZodString;
        choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
        steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
        mistakeId: z.ZodOptional<z.ZodString>;
        objectiveId: z.ZodOptional<z.ZodString>;
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"answer">;
    taskId: z.ZodString;
    response: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"hint">;
    taskId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"configure-course">;
    material: z.ZodObject<{
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
    }, z.core.$strict>;
    course: z.ZodObject<{
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        materialId: z.ZodString;
        unit: z.ZodString;
        parentConfirmation: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"school-progress">;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    unitId: z.ZodString;
    posture: z.ZodEnum<{
        "keep-up": "keep-up";
        "catch-up": "catch-up";
    }>;
    preview: z.ZodEnum<{
        on: "on";
        off: "off";
    }>;
    pace: z.ZodEnum<{
        review: "review";
        teaching: "teaching";
    }>;
    parentConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"record">;
    attempt: z.ZodObject<{
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
            stuck: "stuck";
        }>;
        assistance: z.ZodOptional<z.ZodEnum<{
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>>;
        id: z.ZodString;
        sessionId: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        topic: z.ZodString;
        prompt: z.ZodString;
        response: z.ZodString;
        feedback: z.ZodString;
        answerEvidence: z.ZodString;
        mistakeId: z.ZodOptional<z.ZodString>;
        objectiveId: z.ZodOptional<z.ZodString>;
        variant: z.ZodOptional<z.ZodEnum<{
            numeric: "numeric";
            context: "context";
            reasoning: "reasoning";
        }>>;
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"stuck">;
    taskId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"stop">;
    sessionId: z.ZodString;
    reflection: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"mistake">;
    mistake: z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        topic: z.ZodString;
        prompt: z.ZodString;
        learnerAnswer: z.ZodString;
        correction: z.ZodString;
        explanation: z.ZodString;
        answerEvidence: z.ZodString;
        imagePath: z.ZodOptional<z.ZodString>;
        uncertainties: z.ZodString;
        materialId: z.ZodOptional<z.ZodString>;
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"confirm-mistake">;
    id: z.ZodString;
    subject: z.ZodOptional<z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>>;
    topic: z.ZodOptional<z.ZodString>;
    objectiveId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    prompt: z.ZodString;
    learnerAnswer: z.ZodOptional<z.ZodString>;
    correction: z.ZodString;
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
    userConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"delete-mistake">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"save-exercise">;
    exercise: z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        objectiveId: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<{
            daily: "daily";
            diagnose: "diagnose";
            demo: "demo";
            try: "try";
            vary: "vary";
        }>>;
        variant: z.ZodDefault<z.ZodEnum<{
            numeric: "numeric";
            context: "context";
            reasoning: "reasoning";
        }>>;
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"delete-exercise">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"concept">;
    concept: z.ZodObject<{
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"confirm-concept">;
    id: z.ZodString;
    definition: z.ZodOptional<z.ZodString>;
    example: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    userConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"objective">;
    objective: z.ZodObject<{
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"relation">;
    relation: z.ZodObject<{
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
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"link-mistake">;
    mistakeId: z.ZodString;
    objectiveId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"classify-mistake">;
    mistakeId: z.ZodString;
    errorType: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<{
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
    }>, z.ZodLiteral<"">]>>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"worksheet">;
    worksheet: z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        kind: z.ZodOptional<z.ZodEnum<{
            review: "review";
            daily: "daily";
            practice: "practice";
        }>>;
        objectiveId: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectiveId: z.ZodOptional<z.ZodString>;
            mistakeId: z.ZodOptional<z.ZodString>;
            variant: z.ZodOptional<z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>>;
            prompt: z.ZodString;
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
            space: z.ZodOptional<z.ZodEnum<{
                line: "line";
                none: "none";
                lines: "lines";
                box: "box";
            }>>;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"paper-draft">;
    paperDraft: z.ZodObject<{
        worksheetId: z.ZodString;
        itemId: z.ZodString;
        response: z.ZodString;
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
        }>;
        assistance: z.ZodEnum<{
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        uncertainties: z.ZodString;
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
        confidence: z.ZodOptional<z.ZodEnum<{
            high: "high";
            low: "low";
        }>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"grade-sheet">;
    grade: z.ZodObject<{
        worksheetId: z.ZodString;
        results: z.ZodArray<z.ZodObject<{
            itemId: z.ZodString;
            result: z.ZodEnum<{
                correct: "correct";
                partial: "partial";
                incorrect: "incorrect";
            }>;
            response: z.ZodOptional<z.ZodString>;
            assistance: z.ZodOptional<z.ZodEnum<{
                independent: "independent";
                hint: "hint";
                "worked-example": "worked-example";
            }>>;
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
        userConfirmation: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"confirm-paper">;
    worksheetId: z.ZodString;
    results: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
        }>;
        response: z.ZodOptional<z.ZodString>;
        assistance: z.ZodOptional<z.ZodEnum<{
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>>;
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
    userConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"discard-sheet">;
    worksheetId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"workbook-draft">;
    draft: z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        prompt: z.ZodString;
        response: z.ZodOptional<z.ZodString>;
        outcome: z.ZodEnum<{
            stuck: "stuck";
            hinted: "hinted";
            "independent-wrong": "independent-wrong";
            "independent-correct": "independent-correct";
        }>;
        objectiveId: z.ZodOptional<z.ZodString>;
        uncertainties: z.ZodString;
        imagePath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"confirm-workbook">;
    id: z.ZodString;
    outcome: z.ZodOptional<z.ZodEnum<{
        stuck: "stuck";
        hinted: "hinted";
        "independent-wrong": "independent-wrong";
        "independent-correct": "independent-correct";
    }>>;
    objectiveId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    correction: z.ZodOptional<z.ZodString>;
    explanation: z.ZodOptional<z.ZodString>;
    answerEvidence: z.ZodOptional<z.ZodString>;
    userConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"dismiss-teaching">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"archive-term">;
    parentConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"openmaic-settings">;
    baseUrl: z.ZodString;
    parentConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"interests">;
    tags: z.ZodArray<z.ZodString>;
    parentConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>], "action">;
/** One learner and term per workspace; previous materials and attempts are retained. */
export declare const stateSchema: z.ZodObject<{
    format: z.ZodLiteral<1>;
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
        parentConfirmation: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
    archivedAt: z.ZodOptional<z.ZodNumber>;
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
        parentConfirmation: z.ZodDefault<z.ZodString>;
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
    }, z.core.$strict>>;
    sessions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
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
        materialId: z.ZodOptional<z.ZodString>;
        unit: z.ZodOptional<z.ZodString>;
        reflection: z.ZodOptional<z.ZodString>;
        scope: z.ZodOptional<z.ZodObject<{
            grade: z.ZodNumber;
            term: z.ZodEnum<{
                first: "first";
                second: "second";
            }>;
            units: z.ZodOptional<z.ZodArray<z.ZodString>>;
            objectiveIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    attempts: z.ZodArray<z.ZodObject<{
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
            stuck: "stuck";
        }>;
        assistance: z.ZodEnum<{
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        id: z.ZodString;
        sessionId: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        topic: z.ZodString;
        prompt: z.ZodString;
        response: z.ZodString;
        feedback: z.ZodString;
        answerEvidence: z.ZodString;
        mistakeId: z.ZodOptional<z.ZodString>;
        objectiveId: z.ZodOptional<z.ZodString>;
        variant: z.ZodOptional<z.ZodEnum<{
            numeric: "numeric";
            context: "context";
            reasoning: "reasoning";
        }>>;
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
        at: z.ZodNumber;
        materialId: z.ZodOptional<z.ZodString>;
        rawResponse: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    mistakes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        topic: z.ZodString;
        prompt: z.ZodString;
        learnerAnswer: z.ZodString;
        correction: z.ZodString;
        explanation: z.ZodString;
        answerEvidence: z.ZodString;
        imagePath: z.ZodOptional<z.ZodString>;
        uncertainties: z.ZodString;
        materialId: z.ZodOptional<z.ZodString>;
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
        confirmedAt: z.ZodOptional<z.ZodNumber>;
        userConfirmation: z.ZodOptional<z.ZodString>;
        dueAt: z.ZodOptional<z.ZodNumber>;
        source: z.ZodOptional<z.ZodObject<{
            worksheetId: z.ZodString;
            itemId: z.ZodString;
        }, z.core.$strict>>;
        independentDays: z.ZodDefault<z.ZodArray<z.ZodString>>;
        stage: z.ZodDefault<z.ZodNumber>;
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
    worksheets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        kind: z.ZodOptional<z.ZodEnum<{
            review: "review";
            daily: "daily";
            practice: "practice";
        }>>;
        objectiveId: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectiveId: z.ZodOptional<z.ZodString>;
            mistakeId: z.ZodOptional<z.ZodString>;
            variant: z.ZodOptional<z.ZodEnum<{
                numeric: "numeric";
                context: "context";
                reasoning: "reasoning";
            }>>;
            prompt: z.ZodString;
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
            space: z.ZodOptional<z.ZodEnum<{
                line: "line";
                none: "none";
                lines: "lines";
                box: "box";
            }>>;
            answer: z.ZodString;
            explanation: z.ZodString;
            answerEvidence: z.ZodString;
        }, z.core.$strict>>;
        createdAt: z.ZodNumber;
        discardedAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>>;
    paperResults: z.ZodDefault<z.ZodArray<z.ZodObject<{
        worksheetId: z.ZodString;
        itemId: z.ZodString;
        response: z.ZodString;
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
        }>;
        assistance: z.ZodEnum<{
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        feedback: z.ZodString;
        answerEvidence: z.ZodString;
        userConfirmation: z.ZodDefault<z.ZodString>;
        receivedAt: z.ZodNumber;
    }, z.core.$strict>>>;
    paperDrafts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        worksheetId: z.ZodString;
        itemId: z.ZodString;
        response: z.ZodString;
        result: z.ZodEnum<{
            correct: "correct";
            partial: "partial";
            incorrect: "incorrect";
            unassessed: "unassessed";
        }>;
        assistance: z.ZodEnum<{
            independent: "independent";
            hint: "hint";
            "worked-example": "worked-example";
        }>;
        uncertainties: z.ZodString;
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
        confidence: z.ZodOptional<z.ZodEnum<{
            high: "high";
            low: "low";
        }>>;
        receivedAt: z.ZodNumber;
    }, z.core.$strict>>>;
    workbookDrafts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        prompt: z.ZodString;
        response: z.ZodOptional<z.ZodString>;
        outcome: z.ZodEnum<{
            stuck: "stuck";
            hinted: "hinted";
            "independent-wrong": "independent-wrong";
            "independent-correct": "independent-correct";
        }>;
        objectiveId: z.ZodOptional<z.ZodString>;
        uncertainties: z.ZodString;
        imagePath: z.ZodOptional<z.ZodString>;
        receivedAt: z.ZodNumber;
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
    openmaic: z.ZodOptional<z.ZodObject<{
        baseUrl: z.ZodString;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>>;
    interests: z.ZodOptional<z.ZodObject<{
        tags: z.ZodArray<z.ZodString>;
        parentConfirmation: z.ZodString;
    }, z.core.$strict>>;
    rewards: z.ZodArray<z.ZodObject<{
        day: z.ZodString;
        reason: z.ZodEnum<{
            reflection: "reflection";
            participation: "participation";
        }>;
    }, z.core.$strict>>;
    task: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        sessionId: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        topic: z.ZodString;
        prompt: z.ZodString;
        choices: z.ZodOptional<z.ZodArray<z.ZodString>>;
        steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
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
        mistakeId: z.ZodOptional<z.ZodString>;
        objectiveId: z.ZodOptional<z.ZodString>;
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
        response: z.ZodOptional<z.ZodString>;
        rawResponse: z.ZodOptional<z.ZodString>;
        answeredAt: z.ZodOptional<z.ZodNumber>;
        hintLevel: z.ZodNumber;
        stuck: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** The archive command on its own, so the store can intercept it before applying the mutation. */
export declare const archiveTermSchema: z.ZodObject<{
    action: z.ZodLiteral<"archive-term">;
    parentConfirmation: z.ZodDefault<z.ZodString>;
}, z.core.$strict>;
/** A schema-validated learning mutation. */
export type Command = z.infer<typeof commandSchema>;
/** Durable learning evidence, parsed before reads and after every mutation. */
export type StudyState = z.infer<typeof stateSchema>;
export {};
//# sourceMappingURL=schema.d.ts.map