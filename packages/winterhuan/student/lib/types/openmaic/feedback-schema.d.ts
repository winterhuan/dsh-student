/** Official source identities and frozen snapshots shared by files and authorized readers. */
import { z } from 'zod';
import type { StudentJsonValue } from '../types.ts';
/** Quiz answer representation is preserved without label or option substitution. */
export declare const officialAnswerSchema: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
/** Original official browser grading, separate from Student effective grading. */
export declare const officialResultSchema: z.ZodObject<{
    questionId: z.ZodString;
    correct: z.ZodNullable<z.ZodBoolean>;
    status: z.ZodEnum<{
        correct: "correct";
        incorrect: "incorrect";
    }>;
    earned: z.ZodNumber;
    aiComment: z.ZodOptional<z.ZodString>;
}, z.core.$catchall<z.ZodType<StudentJsonValue, unknown, z.core.$ZodTypeInternals<StudentJsonValue, unknown>>>>;
/** Current official grading record; a correction retains the original response identity. */
export declare const officialReviewSchema: z.ZodObject<{
    recordId: z.ZodString;
    seq: z.ZodNumber;
    createdAt: z.ZodString;
    result: z.ZodNullable<z.ZodObject<{
        questionId: z.ZodString;
        correct: z.ZodNullable<z.ZodBoolean>;
        status: z.ZodEnum<{
            correct: "correct";
            incorrect: "incorrect";
        }>;
        earned: z.ZodNumber;
        aiComment: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodType<StudentJsonValue, unknown, z.core.$ZodTypeInternals<StudentJsonValue, unknown>>>>>;
}, z.core.$strict>;
/** An immutable submitted answer; reviewed records belong to its assessment. */
export declare const openmaicResponseSourceSchema: z.ZodObject<{
    kind: z.ZodLiteral<"openmaic">;
    bindingId: z.ZodString;
    attemptId: z.ZodString;
    sceneId: z.ZodString;
    questionId: z.ZodString;
    submission: z.ZodObject<{
        id: z.ZodString;
        seq: z.ZodNumber;
        createdAt: z.ZodString;
    }, z.core.$strict>;
    submittedAnswer: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
}, z.core.$strict>;
/** Original runtime payload and extension fields retained for unresolved source associations. */
export declare const officialRuntimePayloadSchema: z.ZodObject<{
    payloadVersion: z.ZodLiteral<1>;
    phase: z.ZodEnum<{
        submitted: "submitted";
        draft: "draft";
        reviewed: "reviewed";
    }>;
    answers: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    results: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        correct: z.ZodNullable<z.ZodBoolean>;
        status: z.ZodEnum<{
            correct: "correct";
            incorrect: "incorrect";
        }>;
        earned: z.ZodNumber;
        aiComment: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodType<StudentJsonValue, unknown, z.core.$ZodTypeInternals<StudentJsonValue, unknown>>>>>>;
}, z.core.$catchall<z.ZodJSONSchema>>;
/** Complete source event; its ID identifies an event, never a Student answer. */
export declare const officialRuntimeRecordSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    seq: z.ZodNumber;
    createdAt: z.ZodString;
    sceneId: z.ZodOptional<z.ZodString>;
    payload: z.ZodObject<{
        payloadVersion: z.ZodLiteral<1>;
        phase: z.ZodEnum<{
            submitted: "submitted";
            draft: "draft";
            reviewed: "reviewed";
        }>;
        answers: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
        results: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            correct: z.ZodNullable<z.ZodBoolean>;
            status: z.ZodEnum<{
                correct: "correct";
                incorrect: "incorrect";
            }>;
            earned: z.ZodNumber;
            aiComment: z.ZodOptional<z.ZodString>;
        }, z.core.$catchall<z.ZodType<StudentJsonValue, unknown, z.core.$ZodTypeInternals<StudentJsonValue, unknown>>>>>>;
    }, z.core.$catchall<z.ZodJSONSchema>>;
}, z.core.$catchall<z.ZodJSONSchema>>;
/** Content freshness is a revision observation, never an answer date. */
export declare const snapshotRevisionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"manifest">;
    stageRev: z.ZodNumber;
    sceneRev: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"unavailable">;
}, z.core.$strict>], "kind">;
/** Exact source question bytes remain frozen when today's content changes. */
export declare const openmaicQuestionSchema: z.ZodObject<{
    bindingId: z.ZodString;
    sceneId: z.ZodString;
    questionId: z.ZodString;
    snapshot: z.ZodJSONSchema;
    snapshotHash: z.ZodString;
    revision: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"manifest">;
        stageRev: z.ZodNumber;
        sceneRev: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
/** Original explicit Student ownership returned by the protected source preparation. */
export declare const feedbackBindingSchema: z.ZodObject<{
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
}, z.core.$strict>;
/** Unassociated source facts stay within their original academic owner and never become response evidence. */
export declare const pendingOpenmaicSchema: z.ZodObject<{
    binding: z.ZodObject<{
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
    }, z.core.$strict>;
    record: z.ZodObject<{
        id: z.ZodString;
        sessionId: z.ZodString;
        seq: z.ZodNumber;
        createdAt: z.ZodString;
        sceneId: z.ZodOptional<z.ZodString>;
        payload: z.ZodObject<{
            payloadVersion: z.ZodLiteral<1>;
            phase: z.ZodEnum<{
                submitted: "submitted";
                draft: "draft";
                reviewed: "reviewed";
            }>;
            answers: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
            results: z.ZodOptional<z.ZodArray<z.ZodObject<{
                questionId: z.ZodString;
                correct: z.ZodNullable<z.ZodBoolean>;
                status: z.ZodEnum<{
                    correct: "correct";
                    incorrect: "incorrect";
                }>;
                earned: z.ZodNumber;
                aiComment: z.ZodOptional<z.ZodString>;
            }, z.core.$catchall<z.ZodType<StudentJsonValue, unknown, z.core.$ZodTypeInternals<StudentJsonValue, unknown>>>>>>;
        }, z.core.$catchall<z.ZodJSONSchema>>;
    }, z.core.$catchall<z.ZodJSONSchema>>;
    reason: z.ZodEnum<{
        "missing-submission": "missing-submission";
        "conflicting-submissions": "conflicting-submissions";
        "ambiguous-session": "ambiguous-session";
        "unresolved-question": "unresolved-question";
    }>;
}, z.core.$strict>;
/** One complete original event awaiting source or question association. */
export type PendingOpenmaic = z.infer<typeof pendingOpenmaicSchema>;
/** Agent advances this business checkpoint only after independent consumer acceptance. */
export declare const feedbackCheckpointSchema: z.ZodObject<{
    bindingId: z.ZodString;
    attempts: z.ZodArray<z.ZodObject<{
        attemptId: z.ZodString;
        seq: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Parsed frozen official quiz question; passthrough retains source extension fields. */
export declare const officialQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        single: "single";
        multiple: "multiple";
        short_answer: "short_answer";
    }>;
    question: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        label: z.ZodString;
    }, z.core.$loose>>>;
    answer: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    analysis: z.ZodOptional<z.ZodString>;
    commentPrompt: z.ZodOptional<z.ZodString>;
    hasAnswer: z.ZodOptional<z.ZodBoolean>;
    points: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
/** Read-derived outcome; persisted status declarations do not authenticate these facts. */
export type OpenmaicGrading = 'aligned' | 'equivalent' | 'conflict' | 'pending';
/** One independent Host observation from authorized original records and capture metadata. */
export interface OpenmaicInputObservation {
    binding: z.infer<typeof feedbackBindingSchema>;
    questionId: string;
    responseId: string;
    question: z.infer<typeof openmaicQuestionSchema>;
    source: z.infer<typeof openmaicResponseSourceSchema>;
    official?: z.infer<typeof officialReviewSchema>;
    officialHistory?: z.infer<typeof officialReviewSchema>[];
    answerExposure?: 'possible';
    sourceStatus: 'known' | 'unknown';
    reason?: string;
    result: 'correct' | 'incorrect' | 'partial' | 'unassessed';
    grading: OpenmaicGrading;
}
/** Source reads expose omissions and failures without changing academic files. */
export interface OpenmaicSourceVerification {
    bindingId?: string;
    lessonId: string;
    learnerId?: string;
    termId?: string;
    blockId?: string;
    status: 'available' | 'unavailable' | 'ownership-unresolved';
    reason?: string;
    failure?: import('./connection.ts').OpenmaicError['code'];
    consumption?: 'pending' | 'accepted';
    pendingCount?: number;
    conflictCount?: number;
    omitted: number;
}
//# sourceMappingURL=feedback-schema.d.ts.map
