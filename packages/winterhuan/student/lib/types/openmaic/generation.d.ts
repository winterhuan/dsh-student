import { z } from 'zod';
import { OpenmaicConnection } from './connection.ts';
/** Generation and continuation input with stable Student activity ownership. */
export declare const generationRequestSchema: z.ZodObject<{
    learnerId: z.ZodString;
    termId: z.ZodString;
    blockId: z.ZodString;
    reviewId: z.ZodOptional<z.ZodString>;
    jobId: z.ZodOptional<z.ZodString>;
    requirement: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<{
        "zh-CN": "zh-CN";
        "en-US": "en-US";
    }>>;
    enableWebSearch: z.ZodOptional<z.ZodBoolean>;
    enableImageGeneration: z.ZodOptional<z.ZodBoolean>;
    enableVideoGeneration: z.ZodOptional<z.ZodBoolean>;
    enableTTS: z.ZodOptional<z.ZodBoolean>;
    agentMode: z.ZodOptional<z.ZodEnum<{
        default: "default";
        generate: "generate";
    }>>;
}, z.core.$strict>;
/** Generation input; a continuation does not need to resend the requirement. */
export type OpenmaicGenerationRequest = z.infer<typeof generationRequestSchema>;
/** Protected Host transport storage; values never count as learning evidence. */
export interface OpenmaicJobStore {
    load(owner: OpenmaicGenerationRequest): Promise<unknown>;
    save(owner: OpenmaicGenerationRequest, value: unknown): Promise<void>;
}
/** Safe generation metadata ready for native tool logging and agent-authored lesson files. */
export interface OpenmaicGenerationResult {
    status: 'generating' | 'ready' | 'failed';
    jobId: string;
    pollUrl: string;
    base: string;
    learnerId: string;
    termId: string;
    blockId: string;
    learnerKey: string;
    classroomId?: string;
    url?: string;
    retryable: boolean;
}
/** Submit once per activity; subsequent calls poll the durably retained official job. */
export declare class OpenmaicGeneration {
    private readonly connection;
    private readonly jobs;
    private readonly running;
    constructor(connection: OpenmaicConnection, jobs: OpenmaicJobStore);
    /**
     * Return structured job identity promptly; a missing result never causes a new submission.
     * @param input - Stable Student ownership and initial requirement or original job identity.
     * @param signal - Cancel local waiting; an accepted job remains durable and is not canceled remotely.
     * @returns Safe generation state from the same durable official job.
     */
    run(input: OpenmaicGenerationRequest, signal: AbortSignal): Promise<OpenmaicGenerationResult>;
    /** Poll only a previously retained job; this entry can never submit a classroom.
     * @param input - Original academic owner and optional job ID.
     * @param signal - Cancels the status read.
     * @returns Existing generation metadata or a recoverable unknown/missing error.
     */
    poll(input: Pick<OpenmaicGenerationRequest, 'learnerId' | 'termId' | 'blockId' | 'jobId'>, signal: AbortSignal): Promise<OpenmaicGenerationResult>;
    private resume;
    /**
     * Verify the protected original job without polling or creating another classroom.
     * @param owner - Explicit original Student learner, term and block.
     * @param classroomId - Saved official classroom identity.
     * @param signal - Cancellation for same-account verification.
     * @returns Whether the protected ready job owns this exact classroom.
     */
    verify(owner: Pick<OpenmaicGenerationRequest, 'learnerId' | 'termId' | 'blockId'>, classroomId: string, signal: AbortSignal): Promise<boolean>;
    /** Read the protected pre-generation review identity for this original job.
     * @param owner - Original learner, term and block.
     * @returns The review that authorized submission, absent for legacy jobs.
     */
    reviewedPlan(owner: Pick<OpenmaicGenerationRequest, 'learnerId' | 'termId' | 'blockId'>): Promise<string | undefined>;
    private perform;
    private result;
}
//# sourceMappingURL=generation.d.ts.map