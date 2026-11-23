import { z } from 'zod';
import { OpenmaicConnection } from './connection.ts';
import { feedbackBindingSchema, feedbackCheckpointSchema, officialAnswerSchema, officialResultSchema, openmaicQuestionSchema, type OpenmaicInputObservation, type OpenmaicGrading, type PendingOpenmaic } from './feedback-schema.ts';
/** Protected source-capture storage owns partition admission, never grades or learner responses. */
export interface OpenmaicCaptureStore {
    load(key: string): Promise<unknown>;
    claim(key: string, value: unknown): Promise<unknown>;
}
/** Original lesson ownership to verify before any runtime read. */
export interface OpenmaicLessonOwner {
    learnerId: string;
    termId: string;
    blockId: string;
    classroomId: string;
    base: string;
    learnerKey: string;
}
/** Frozen source preparation returned for explicit agent-authored question/binding files. */
export interface OpenmaicPreparation {
    binding: z.infer<typeof feedbackBindingSchema>;
    questions: z.infer<typeof openmaicQuestionSchema>[];
}
/** Bounded independent source read, including the exact replay checkpoint candidate. */
export interface OpenmaicFeedbackRead {
    revision: string;
    observations: OpenmaicInputObservation[];
    pending: PendingOpenmaic[];
    checkpoint: z.infer<typeof feedbackCheckpointSchema>;
    drafts: number;
    omitted: number;
}
/**
 * Return stable Student entity identity for one source question or response.
 * @param kind - Academic entity identity to derive.
 * @param tuple - Full opaque original binding, attempt, scene and question tuple.
 * @returns Filename-safe identity; records and grading do not change response identity.
 */
export declare function openmaicEntityId(kind: 'q' | 'r' | 'a', tuple: readonly string[]): string;
/**
 * Check a submitted choice against the frozen criterion and separately compare the official grade.
 * @param snapshot - Original independently captured quiz question.
 * @param answer - Exact submitted values.
 * @param official - Current original official result when available.
 * @returns Effective result and explicit agreement, numeric equivalence, unresolved conflict or pending criterion.
 */
export declare function gradeOpenmaicAnswer(snapshot: unknown, answer: z.infer<typeof officialAnswerSchema>, official?: z.infer<typeof officialResultSchema> | null): {
    result: OpenmaicInputObservation['result'];
    grading: OpenmaicGrading;
};
/** Source reader reauthorizes every read; protected captures authenticate content without persisting grades. */
export declare class OpenmaicFeedback {
    private readonly connection;
    private readonly captures;
    private readonly owns;
    constructor(connection: OpenmaicConnection, captures: OpenmaicCaptureStore, owns: (owner: OpenmaicLessonOwner, stage: string, signal: AbortSignal) => Promise<boolean>);
    private key;
    private authorize;
    private manifest;
    private runtime;
    /**
     * Capture the original generated classroom before playback; an existing partition keeps its owner and capture.
     * @param owner - Independently validated original lesson and Student ownership.
     * @param target - Current capability/family/scope selected in formal learning files.
     * @param signal - Cancellation for source and protected capture admission.
     * @returns Exact source question snapshots and the binding for native agent authoring.
     */
    prepare(owner: OpenmaicLessonOwner, target: Omit<z.infer<typeof feedbackBindingSchema>, 'bindingId' | 'learnerId' | 'termId' | 'blockId'>, signal: AbortSignal): Promise<OpenmaicPreparation>;
    private capture;
    private preparation;
    /**
     * Recheck original source authorization after downstream file reads.
     * @param owner - Original source partition and Student owner.
     * @param binding - Saved binding checked against protected capture metadata.
     * @param signal - Caller cancellation.
     * @param revision - Original read fingerprint; a changed source requires another complete file/source read.
     * @returns Whether source content still matches the independently observed cut.
     */
    verify(owner: OpenmaicLessonOwner, binding: z.infer<typeof feedbackBindingSchema>, signal: AbortSignal, revision?: string): Promise<boolean>;
    /**
     * Reread exact original partition/attempts and compare current revisions with its protected capture.
     * @param owner - Original authorized classroom ownership.
     * @param binding - Agent-authored declaration checked against the protected original binding.
     * @param signal - Cancellation for complete independent source reads.
     * @returns Source responses and grades with explicit historical/revision uncertainty; performs no academic writes.
     */
    read(owner: OpenmaicLessonOwner, binding: z.infer<typeof feedbackBindingSchema>, signal: AbortSignal): Promise<OpenmaicFeedbackRead>;
}
//# sourceMappingURL=feedback.d.ts.map