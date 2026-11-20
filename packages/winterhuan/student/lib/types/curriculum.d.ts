import { z } from 'zod';
import { type ErrorType, type ExerciseItem, type VariationAxis } from './schema.ts';
declare const subjectSchema: z.ZodEnum<{
    chinese: "chinese";
    math: "math";
    english: "english";
}>;
declare const methodSchema: z.ZodEnum<{
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
declare const relationKindSchema: z.ZodEnum<{
    prerequisite: "prerequisite";
    "part-of": "part-of";
    contrast: "contrast";
    explains: "explains";
    "cause-effect": "cause-effect";
}>;
/** The learner fields that select a shipped knowledge map. */
export interface CurriculumScope {
    grade: number;
    term: 'first' | 'second';
}
/** One of the three supported subjects. */
export type CurriculumSubject = z.infer<typeof subjectSchema>;
/** A learning method a shipped objective may use; each value is also a workbench locale key. */
export type CurriculumMethod = z.infer<typeof methodSchema>;
/** A shipped concept-relation kind; each value is also a workbench locale key. */
export type CurriculumRelationKind = z.infer<typeof relationKindSchema>;
/** Subject methods a shipped learning objective may use; mirrors the state schema. */
export declare const curriculumMethods: Record<CurriculumSubject, readonly string[]>;
declare const ideaSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    definition: z.ZodString;
    example: z.ZodString;
}, z.core.$strict>;
/** One subject's concepts. A concept is shared by the subject and is not divided by grade or unit. Its definition states only what is required to identify it, and admits one reading. */
export declare const ideaCatalogSchema: z.ZodObject<{
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    ideas: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        definition: z.ZodString;
        example: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** One shipped concept: the meaning a subject uses, independent of grade and unit. */
export type SubjectIdea = z.infer<typeof ideaSchema>;
/** One subject's shipped exercise bank, validated against shipped objectives and error types. */
export declare const exerciseCatalogSchema: z.ZodObject<{
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    exercises: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
}, z.core.$strict>;
/** One shipped knowledge map: units, knowledge points, objectives and relations for one subject, grade and term. */
export declare const curriculumSchema: z.ZodObject<{
    id: z.ZodString;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    grade: z.ZodNumber;
    term: z.ZodEnum<{
        first: "first";
        second: "second";
    }>;
    title: z.ZodString;
    basis: z.ZodString;
    units: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        summary: z.ZodString;
        focus: z.ZodOptional<z.ZodEnum<{
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
        }>>;
    }, z.core.$strict>>;
    concepts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        unit: z.ZodString;
        definition: z.ZodString;
        example: z.ZodString;
        source: z.ZodString;
        ideaIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        facts: z.ZodOptional<z.ZodArray<z.ZodString>>;
        misconceptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        examples: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    objectives: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
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
    }, z.core.$strict>>;
    relations: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
}, z.core.$strict>;
/** A validated shipped knowledge map. */
export type Curriculum = z.infer<typeof curriculumSchema>;
/** One shipped learning objective resolved with its subject and unit. */
export interface BuiltinObjective {
    id: string;
    subject: CurriculumSubject;
    title: string;
    goal: string;
    conceptIds: string[];
    method: CurriculumMethod;
    unit: string;
    unitName: string;
    errorTypes?: ErrorType[] | undefined;
    questionPoints?: string[] | undefined;
    variationAxes?: VariationAxis[] | undefined;
}
/** One shipped knowledge point resolved with its subject. */
export interface BuiltinConcept {
    id: string;
    subject: CurriculumSubject;
    name: string;
    unit: string;
    definition: string;
    example: string;
    source: string;
    ideaIds?: string[] | undefined;
    facts?: string[] | undefined;
    misconceptions?: string[] | undefined;
    examples?: string[] | undefined;
}
/**
 * The concepts of one subject. The same concept is shared by every grade and unit of that subject.
 * @param subject - requested subject.
 * @returns the validated concept list.
 */
export declare function subjectIdeas(subject: CurriculumSubject): SubjectIdea[];
/**
 * One subject's shipped knowledge map for the profile's grade and term.
 * @param scope - learner grade and term.
 * @param subject - requested subject.
 * @returns the validated map, or undefined outside grades one and two.
 */
export declare function curriculumFor(scope: CurriculumScope, subject: CurriculumSubject): Curriculum | undefined;
/**
 * Every shipped knowledge map for the profile's grade and term, in subject order.
 * @param scope - learner grade and term.
 * @returns validated maps; empty outside grades one and two.
 */
export declare function curriculumFiles(scope: CurriculumScope): Curriculum[];
/**
 * All shipped learning objectives for one subject within an arbitrary scope, with unit names resolved.
 * @param scope - grade and term to read; may differ from the learner profile.
 * @param subject - requested subject.
 * @returns resolved objectives; empty outside grades one and two.
 */
export declare function builtinObjectivesIn(scope: CurriculumScope, subject: CurriculumSubject): BuiltinObjective[];
/**
 * Resolve one shipped objective by ID within an arbitrary scope.
 * @param scope - grade and term to read; may differ from the learner profile.
 * @param subject - requested subject.
 * @param objectiveId - objective to resolve.
 * @returns the resolved objective, or undefined when it is not shipped for this scope.
 */
export declare function builtinObjectiveIn(scope: CurriculumScope, subject: CurriculumSubject, objectiveId: string): BuiltinObjective | undefined;
/**
 * All shipped learning objectives for the profile, in subject and map order.
 * @param scope - learner grade and term.
 * @returns resolved objectives; empty outside grades one and two.
 */
export declare function builtinObjectives(scope: CurriculumScope): BuiltinObjective[];
/**
 * Resolve one shipped objective by ID across every shipped map, current term or another.
 * @param objectiveId - objective to resolve.
 * @returns the resolved objective, or undefined when it is not shipped anywhere.
 */
export declare function builtinObjectiveAnywhere(objectiveId: string): BuiltinObjective | undefined;
/**
 * Resolve one shipped objective by ID within the profile's grade and term.
 * @param scope - learner grade and term.
 * @param objectiveId - objective to resolve.
 * @returns the resolved objective, or undefined when it is not shipped for this scope.
 */
export declare function builtinObjective(scope: CurriculumScope, objectiveId: string): BuiltinObjective | undefined;
/**
 * The unit a shipped objective belongs to, within an arbitrary scope.
 * @param scope - grade and term to read; may differ from the learner profile.
 * @param subject - requested subject.
 * @param objectiveId - objective to locate.
 * @returns the unit id, or undefined when the objective is not shipped for this scope.
 */
export declare function builtinUnitOf(scope: CurriculumScope, subject: CurriculumSubject, objectiveId: string): string | undefined;
/**
 * All shipped knowledge points for one subject within the profile's grade and term.
 * @param scope - learner grade and term.
 * @param subject - requested subject.
 * @returns resolved knowledge points; empty outside grades one and two.
 */
export declare function builtinConcepts(scope: CurriculumScope, subject: CurriculumSubject): BuiltinConcept[];
/**
 * Validated shipped exercise items for one subject across grades one and two.
 * @param subject - requested subject.
 * @returns the validated exercise list.
 */
export declare function subjectExercises(subject: CurriculumSubject): ExerciseItem[];
/**
 * Shipped exercise items targeting one learning objective.
 * @param objectiveId - objective to look up.
 * @returns matching shipped exercises, or empty when none exist.
 */
export declare function exercisesForObjective(objectiveId: string): ExerciseItem[];
export {};
//# sourceMappingURL=curriculum.d.ts.map