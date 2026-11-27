import type { ValidatedWorkspace } from './files/validation.ts';
import { z } from 'zod';
import { miniLessonSchema, type UnitCourse } from './courses.ts';
/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
export declare const DEFAULT_OPENMAIC_BASE = "https://open.maic.chat";
/** Lesson log written by the tutor shell. It is not learning evidence and is not inside state.json. */
export declare const OPENMAIC_LESSONS_PATH = ".study/openmaic-lessons.json";
/** Cookie jar shared by generate, poll, retry and stage reads. Never copy it into chat or state. */
export declare const OPENMAIC_COOKIE_PATH = ".study/openmaic-cookies.txt";
/**
 * Accept an http(s) origin or origin-plus-path. Credentials, queries and hashes are rejected
 * so a saved address cannot smuggle a secret.
 * @param value - parent input or environment value.
 * @returns the normalized base, an empty string when the input is blank, or undefined when it is unsafe.
 */
export declare function normalizeOpenmaicBase(value: string): string | undefined;
/**
 * Parent setting wins, then OPENMAIC_BASE, then the default origin.
 * An invalid saved or environment value is skipped rather than failing a status read.
 * @param saved - the parent's saved base, when present.
 * @param env - the OPENMAIC_BASE environment value, when present.
 * @returns the first valid base or the default origin.
 */
export declare function effectiveOpenmaicBase(saved: string | undefined, env: string | undefined): string;
/**
 * Validate a lesson URL before opening it in the browser.
 * @param value - the recorded lesson address.
 * @returns an http(s) URL with no embedded credentials, or undefined when it is unsafe or invalid.
 */
export declare function lessonHttpUrl(value: string): string | undefined;
/** Strict complete lesson row shared by the application and read-only CLI. */
export declare const lessonSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        planned: "planned";
        unknown: "unknown";
        generating: "generating";
        ready: "ready";
        failed: "failed";
    }>;
    purpose: z.ZodOptional<z.ZodEnum<{
        full: "full";
        foundation: "foundation";
        synthesis: "synthesis";
    }>>;
    course: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        sectionId: z.ZodString;
        revision: z.ZodNumber;
        materialRevision: z.ZodString;
    }, z.core.$strict>>;
    teaching: z.ZodOptional<z.ZodObject<{
        revision: z.ZodString;
        goal: z.ZodString;
        scope: z.ZodString;
        materialLimitations: z.ZodString;
        introduction: z.ZodString;
        explanation: z.ZodString;
        demonstration: z.ZodString;
        guidedPractice: z.ZodString;
        independentPractice: z.ZodString;
        summary: z.ZodString;
        maxAssessmentQuestions: z.ZodNumber;
    }, z.core.$strict>>;
    quality: z.ZodOptional<z.ZodObject<{
        reviewId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            passed: "passed";
            rejected: "rejected";
        }>;
        checkedAt: z.ZodNumber;
        contentHash: z.ZodString;
        stages: z.ZodObject<{
            introduction: z.ZodString;
            explanation: z.ZodString;
            demonstration: z.ZodString;
            guidedPractice: z.ZodString;
            independentPractice: z.ZodString;
            summary: z.ZodString;
        }, z.core.$strict>;
        questions: z.ZodArray<z.ZodObject<{
            sceneId: z.ZodString;
            questionId: z.ZodString;
            purpose: z.ZodEnum<{
                example: "example";
                guided: "guided";
                assessment: "assessment";
            }>;
            rationale: z.ZodString;
        }, z.core.$strict>>;
        scopeChecked: z.ZodLiteral<true>;
        criterionChecked: z.ZodLiteral<true>;
        notes: z.ZodString;
    }, z.core.$strict>>;
    questionPlan: z.ZodOptional<z.ZodObject<{
        revision: z.ZodString;
        source: z.ZodObject<{
            path: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>;
        target: z.ZodObject<{
            scope: z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                modality: z.ZodEnum<{
                    written: "written";
                    oral: "oral";
                    listening: "listening";
                    audiovisual: "audiovisual";
                    performed: "performed";
                }>;
                numberMax: z.ZodOptional<z.ZodNumber>;
                vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            goalId: z.ZodString;
            familyId: z.ZodString;
        }, z.core.$strict>;
        questions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<{
                single: "single";
                multiple: "multiple";
                short_answer: "short_answer";
            }>;
            question: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                value: z.ZodString;
                label: z.ZodString;
            }, z.core.$strict>>;
            answer: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
            analysis: z.ZodString;
            sourceQuote: z.ZodString;
            completedAnswer: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    foundationConfirmation: z.ZodOptional<z.ZodString>;
    replacesLessonId: z.ZodOptional<z.ZodString>;
    sourceLessonIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    activity: z.ZodOptional<z.ZodObject<{
        state: z.ZodEnum<{
            "not-started": "not-started";
            learning: "learning";
            paused: "paused";
            ended: "ended";
        }>;
        blockId: z.ZodString;
        position: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    title: z.ZodString;
    requirement: z.ZodString;
    subject: z.ZodOptional<z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>>;
    objectiveId: z.ZodOptional<z.ZodString>;
    base: z.ZodString;
    learnerId: z.ZodOptional<z.ZodString>;
    termId: z.ZodOptional<z.ZodString>;
    blockId: z.ZodOptional<z.ZodString>;
    learnerKey: z.ZodOptional<z.ZodString>;
    jobId: z.ZodOptional<z.ZodString>;
    pollUrl: z.ZodOptional<z.ZodString>;
    runId: z.ZodOptional<z.ZodString>;
    commandId: z.ZodOptional<z.ZodString>;
    retryable: z.ZodOptional<z.ZodBoolean>;
    classroomId: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    warning: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    feedback: z.ZodOptional<z.ZodObject<{
        bindingId: z.ZodString;
        learnerId: z.ZodString;
        termId: z.ZodString;
        blockId: z.ZodString;
        goalId: z.ZodString;
        familyId: z.ZodString;
        scope: z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            modality: z.ZodEnum<{
                written: "written";
                oral: "oral";
                listening: "listening";
                audiovisual: "audiovisual";
                performed: "performed";
            }>;
            numberMax: z.ZodOptional<z.ZodNumber>;
            vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    checkpoint: z.ZodOptional<z.ZodObject<{
        bindingId: z.ZodString;
        attempts: z.ZodArray<z.ZodObject<{
            attemptId: z.ZodString;
            seq: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    summary: z.ZodOptional<z.ZodObject<{
        fetchedAt: z.ZodString;
        outline: z.ZodString;
        scenes: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            summary: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Complete independent OpenMAIC business file; validation checks all eighty possible rows before pagination. */
export declare const lessonFileSchema: z.ZodObject<{
    format: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    lessons: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            unknown: "unknown";
            generating: "generating";
            ready: "ready";
            failed: "failed";
        }>;
        purpose: z.ZodOptional<z.ZodEnum<{
            full: "full";
            foundation: "foundation";
            synthesis: "synthesis";
        }>>;
        course: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            sectionId: z.ZodString;
            revision: z.ZodNumber;
            materialRevision: z.ZodString;
        }, z.core.$strict>>;
        teaching: z.ZodOptional<z.ZodObject<{
            revision: z.ZodString;
            goal: z.ZodString;
            scope: z.ZodString;
            materialLimitations: z.ZodString;
            introduction: z.ZodString;
            explanation: z.ZodString;
            demonstration: z.ZodString;
            guidedPractice: z.ZodString;
            independentPractice: z.ZodString;
            summary: z.ZodString;
            maxAssessmentQuestions: z.ZodNumber;
        }, z.core.$strict>>;
        quality: z.ZodOptional<z.ZodObject<{
            reviewId: z.ZodOptional<z.ZodString>;
            status: z.ZodEnum<{
                passed: "passed";
                rejected: "rejected";
            }>;
            checkedAt: z.ZodNumber;
            contentHash: z.ZodString;
            stages: z.ZodObject<{
                introduction: z.ZodString;
                explanation: z.ZodString;
                demonstration: z.ZodString;
                guidedPractice: z.ZodString;
                independentPractice: z.ZodString;
                summary: z.ZodString;
            }, z.core.$strict>;
            questions: z.ZodArray<z.ZodObject<{
                sceneId: z.ZodString;
                questionId: z.ZodString;
                purpose: z.ZodEnum<{
                    example: "example";
                    guided: "guided";
                    assessment: "assessment";
                }>;
                rationale: z.ZodString;
            }, z.core.$strict>>;
            scopeChecked: z.ZodLiteral<true>;
            criterionChecked: z.ZodLiteral<true>;
            notes: z.ZodString;
        }, z.core.$strict>>;
        questionPlan: z.ZodOptional<z.ZodObject<{
            revision: z.ZodString;
            source: z.ZodObject<{
                path: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>;
            target: z.ZodObject<{
                scope: z.ZodObject<{
                    id: z.ZodString;
                    description: z.ZodString;
                    modality: z.ZodEnum<{
                        written: "written";
                        oral: "oral";
                        listening: "listening";
                        audiovisual: "audiovisual";
                        performed: "performed";
                    }>;
                    numberMax: z.ZodOptional<z.ZodNumber>;
                    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>;
                goalId: z.ZodString;
                familyId: z.ZodString;
            }, z.core.$strict>;
            questions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<{
                    single: "single";
                    multiple: "multiple";
                    short_answer: "short_answer";
                }>;
                question: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    value: z.ZodString;
                    label: z.ZodString;
                }, z.core.$strict>>;
                answer: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
                analysis: z.ZodString;
                sourceQuote: z.ZodString;
                completedAnswer: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        foundationConfirmation: z.ZodOptional<z.ZodString>;
        replacesLessonId: z.ZodOptional<z.ZodString>;
        sourceLessonIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        activity: z.ZodOptional<z.ZodObject<{
            state: z.ZodEnum<{
                "not-started": "not-started";
                learning: "learning";
                paused: "paused";
                ended: "ended";
            }>;
            blockId: z.ZodString;
            position: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        title: z.ZodString;
        requirement: z.ZodString;
        subject: z.ZodOptional<z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>>;
        objectiveId: z.ZodOptional<z.ZodString>;
        base: z.ZodString;
        learnerId: z.ZodOptional<z.ZodString>;
        termId: z.ZodOptional<z.ZodString>;
        blockId: z.ZodOptional<z.ZodString>;
        learnerKey: z.ZodOptional<z.ZodString>;
        jobId: z.ZodOptional<z.ZodString>;
        pollUrl: z.ZodOptional<z.ZodString>;
        runId: z.ZodOptional<z.ZodString>;
        commandId: z.ZodOptional<z.ZodString>;
        retryable: z.ZodOptional<z.ZodBoolean>;
        classroomId: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        warning: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        feedback: z.ZodOptional<z.ZodObject<{
            bindingId: z.ZodString;
            learnerId: z.ZodString;
            termId: z.ZodString;
            blockId: z.ZodString;
            goalId: z.ZodString;
            familyId: z.ZodString;
            scope: z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                modality: z.ZodEnum<{
                    written: "written";
                    oral: "oral";
                    listening: "listening";
                    audiovisual: "audiovisual";
                    performed: "performed";
                }>;
                numberMax: z.ZodOptional<z.ZodNumber>;
                vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        checkpoint: z.ZodOptional<z.ZodObject<{
            bindingId: z.ZodString;
            attempts: z.ZodArray<z.ZodObject<{
                attemptId: z.ZodString;
                seq: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        summary: z.ZodOptional<z.ZodObject<{
            fetchedAt: z.ZodString;
            outline: z.ZodString;
            scenes: z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                summary: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    courses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        learnerId: z.ZodString;
        termId: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        unit: z.ZodString;
        revision: z.ZodNumber;
        materials: z.ZodArray<z.ZodObject<{
            revision: z.ZodString;
            edition: z.ZodString;
            sourcePath: z.ZodString;
            sourceRevision: z.ZodString;
            directory: z.ZodArray<z.ZodString>;
            position: z.ZodEnum<{
                entering: "entering";
                studying: "studying";
                finished: "finished";
            }>;
            currentSectionId: z.ZodOptional<z.ZodString>;
            confirmation: z.ZodObject<{
                quote: z.ZodString;
                at: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        currentMaterialRevision: z.ZodOptional<z.ZodString>;
        sections: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            goalIds: z.ZodArray<z.ZodString>;
            scope: z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                modality: z.ZodEnum<{
                    written: "written";
                    oral: "oral";
                    listening: "listening";
                    audiovisual: "audiovisual";
                    performed: "performed";
                }>;
                numberMax: z.ZodOptional<z.ZodNumber>;
                vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            kind: z.ZodEnum<{
                synthesis: "synthesis";
                lesson: "lesson";
            }>;
            materialRevision: z.ZodOptional<z.ZodString>;
            lessonId: z.ZodOptional<z.ZodString>;
            prerequisiteIds: z.ZodArray<z.ZodString>;
            testPreparation: z.ZodOptional<z.ZodObject<{
                quote: z.ZodString;
                at: z.ZodNumber;
            }, z.core.$strict>>;
            advanceConfirmation: z.ZodOptional<z.ZodObject<{
                quote: z.ZodString;
                at: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>>;
    miniLessons: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        learnerId: z.ZodString;
        termId: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        revision: z.ZodString;
        goalIds: z.ZodArray<z.ZodString>;
        scope: z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            modality: z.ZodEnum<{
                written: "written";
                oral: "oral";
                listening: "listening";
                audiovisual: "audiovisual";
                performed: "performed";
            }>;
            numberMax: z.ZodOptional<z.ZodNumber>;
            vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        purpose: z.ZodEnum<{
            explanation: "explanation";
            review: "review";
            temporary: "temporary";
        }>;
        sourceLessonId: z.ZodOptional<z.ZodString>;
        contentPath: z.ZodString;
        contentHash: z.ZodString;
        createdAt: z.ZodNumber;
    }, z.core.$strict>>>;
}, z.core.$strict>;
/** Validated complete lesson log; distinct from its twenty-row display projection. */
export type LessonFile = z.infer<typeof lessonFileSchema>;
/** One interactive lesson row stored in the workspace log. */
export type InteractiveLesson = z.infer<typeof lessonSchema>;
/** Lesson log projection served with the workbench payload. */
export interface InteractiveLessons {
    baseUrl: string;
    lessonsPath: typeof OPENMAIC_LESSONS_PATH;
    cookiePath: typeof OPENMAIC_COOKIE_PATH;
    lessons: InteractiveLesson[];
    courses?: UnitCourse[];
    miniLessons?: z.infer<typeof miniLessonSchema>[];
    /** Set when the file exists but some or all of it cannot be shown. The rest of the desk still loads. */
    error?: string;
}
/**
 * Build the settings half of the projection before a file read.
 * @param savedBase - the parent's saved base, when present.
 * @param lessons - the lesson rows to display; defaults to an empty list.
 * @param error - a read failure to display alongside the remaining workbench.
 * @returns the lesson rows, resolved base and workspace file paths.
 */
export declare function interactiveLessonsView(savedBase: string | undefined, lessons?: InteractiveLesson[], error?: string): InteractiveLessons;
/**
 * Parse every tutor-written lesson row before display pagination. Invalid and duplicate rows are dropped.
 * @param text - UTF-8 contents of `.study/openmaic-lessons.json`.
 * @returns every independently valid row and an explicit whole-file failure when required.
 */
export declare function parseInteractiveLessons(text: string): {
    lessons: InteractiveLesson[];
    error?: string;
};
/**
 * Read the lesson log from the session workspace.
 * A missing file is an empty list. A bad file sets `error` and does not fail the workspace request.
 * The shared reader checks actual versions on both sides; the desk displays at most twenty valid rows.
 * @param agent - the session workspace and its filesystem service.
 * @param signal - cancels filesystem reads; cancellation rejects the request.
 * @param savedBase - the parent's saved base, when present.
 * @param workspace - Independently validated academic records for course ownership.
 * @returns the lesson projection, with an error for an unreadable file.
 */
export declare function readInteractiveLessons(agent: {
    ctx?: {
        get(name: string): unknown;
    };
    session?: {
        header?: {
            cwd?: string;
        };
    };
}, signal: AbortSignal, savedBase: string | undefined, workspace?: ValidatedWorkspace): Promise<InteractiveLessons>;
//# sourceMappingURL=openmaic.d.ts.map