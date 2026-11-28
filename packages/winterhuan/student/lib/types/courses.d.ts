/** Unit organization and reusable teaching content never grant learning evidence. */
import { z } from 'zod';
/** A retained source revision, including the confirmed within-unit school position. */
export declare const courseMaterialSchema: z.ZodObject<{
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
}, z.core.$strict>;
/** Stable sections are ordered by their array position; classroom versions retain their own original ownership. */
export declare const unitCourseSchema: z.ZodObject<{
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
}, z.core.$strict>;
/** Unit directory with explicit source revisions, separate from capability mastery. */
export type UnitCourse = z.infer<typeof unitCourseSchema>;
/** Required full-classroom pedagogy, checked before submission and against content before playback. */
export declare const teachingPlanSchema: z.ZodObject<{
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
}, z.core.$strict>;
/** Authored assessment plan grounded in a retained local source, independently checked before generation. */
export declare const courseQuestionPlanSchema: z.ZodObject<{
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
}, z.core.$strict>;
/** Content review names the frozen scenes and classifies every original quiz question. */
export declare const courseReviewSchema: z.ZodObject<{
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
}, z.core.$strict>;
/** Content can be reused by a later activity without replacing original generation ownership. */
export declare const miniLessonSchema: z.ZodObject<{
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
}, z.core.$strict>;
/**
 * Explain why the directory cannot yet launch a particular section.
 * @param course - Independently validated directory.
 * @param sectionId - Explicitly selected section.
 * @returns Missing source/progress facts; no implicit preview authorization.
 */
export declare function sectionReadiness(course: UnitCourse, sectionId: string): 'ready' | 'materials' | 'school-position' | 'synthesis-confirmation';
//# sourceMappingURL=courses.d.ts.map
