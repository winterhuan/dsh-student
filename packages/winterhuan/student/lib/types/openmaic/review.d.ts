import { z } from 'zod';
import type { Context } from '@deepseek-ai/cordis';
import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import type { InteractiveLesson } from '../openmaic.ts';
import type { OpenmaicFeedback, OpenmaicPreparation } from './feedback.ts';
/** Immutable independently loaded input; review callers cannot supply a verdict. */
export interface CourseReviewInput {
    owner: {
        workspace: string;
        learnerId: string;
        termId: string;
        blockId: string;
        lessonId: string;
    };
    provenance: Pick<InteractiveLesson, 'purpose' | 'course' | 'foundationConfirmation' | 'sourceLessonIds'>;
    subject: string;
    requirement: string;
    teaching: NonNullable<InteractiveLesson['teaching']>;
    plan: NonNullable<InteractiveLesson['questionPlan']>;
    source: string;
    content?: Awaited<ReturnType<OpenmaicFeedback['content']>>;
    questions?: OpenmaicPreparation['questions'];
}
declare const resultSchema: z.ZodObject<{
    policy: z.ZodLiteral<"student-course-review-7">;
    inputHash: z.ZodString;
    reviewId: z.ZodString;
    model: z.ZodString;
    status: z.ZodEnum<{
        passed: "passed";
        rejected: "rejected";
    }>;
    checkedAt: z.ZodNumber;
    issues: z.ZodArray<z.ZodString>;
    verdict: z.ZodObject<{
        questions: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            solvedAnswer: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
            completedSentence: z.ZodString;
            grammar: z.ZodNullable<z.ZodBoolean>;
            facts: z.ZodNullable<z.ZodBoolean>;
            uniqueAnswer: z.ZodNullable<z.ZodBoolean>;
            criterion: z.ZodNullable<z.ZodBoolean>;
            source: z.ZodNullable<z.ZodBoolean>;
            analysisCheck: z.ZodObject<{
                text: z.ZodString;
                correct: z.ZodNullable<z.ZodBoolean>;
                reason: z.ZodString;
            }, z.core.$strip>;
            reason: z.ZodString;
        }, z.core.$strip>>;
        scope: z.ZodNullable<z.ZodBoolean>;
        teaching: z.ZodNullable<z.ZodBoolean>;
        contentCorrect: z.ZodNullable<z.ZodBoolean>;
        stages: z.ZodObject<{
            [x: string]: z.ZodNullable<z.ZodString>;
        }, z.core.$catchall<z.ZodNullable<z.ZodString>>>;
        issues: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
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
}, z.core.$strict>;
/** Protected review receipt, never learner performance or mastery evidence. */
export type CourseReviewResult = z.infer<typeof resultSchema>;
/** Host-owned receipt storage, inaccessible through academic JSON editing. */
export interface CourseReviewStore {
    load(id: string): Promise<unknown>;
    save(id: string, value: unknown): Promise<void>;
}
/** Runs one bounded fresh-context request and caches only complete validated review receipts. */
export declare class CourseReviewer {
    private readonly store;
    private readonly running;
    constructor(store: CourseReviewStore);
    /** Review a saved plan or actual classroom with the current model and no conversation or tools.
     * @param input - Source, owner and exact candidate content loaded by the Host.
     * @param model - Complete route fingerprint including reasoning effort.
     * @param generate - Isolated text completion, injectable for deterministic transport tests.
     * @param signal - Cancels review; incomplete responses never grant playback.
     * @returns Cached or newly authenticated verdict and optional academic quality draft.
     */
    review(input: CourseReviewInput, model: string, generate: (system: string, user: string, signal: AbortSignal) => Promise<string>, signal: AbortSignal): Promise<CourseReviewResult>;
    /** Verify the saved academic quality against its protected receipt, without inference.
     * @param input - Fresh source/content/plan with immutable original owner.
     * @param quality - Agent-authored quality to compare, never an authority by itself.
     * @returns True only for the same complete, passing review under the current policy.
     */
    accepts(input: CourseReviewInput, quality: NonNullable<InteractiveLesson['quality']>): Promise<boolean>;
    /** Confirm that this exact plan and material authorized the original job submission.
     * @param input - Current plan without generated content.
     * @param reviewId - Protected identity recovered from the original job.
     * @returns Whether the original pre-generation review still applies.
     */
    approvedPlan(input: CourseReviewInput, reviewId: string | undefined): Promise<boolean>;
    private perform;
}
/** Use the calling agent's model route for one isolated review, without conversation/tool inheritance.
 * @param ctx - Agent-scoped LLM service.
 * @param exec - Current execution supplying model identity and cancellation.
 * @returns Route fingerprint and bounded text-only completion.
 */
export declare function courseReviewModel(ctx: Context, exec: Pick<ToolExecution, 'agent' | 'signal'>): {
    model: string;
    generate: (system: string, user: string, signal: AbortSignal) => Promise<string>;
};
export {};
//# sourceMappingURL=review.d.ts.map