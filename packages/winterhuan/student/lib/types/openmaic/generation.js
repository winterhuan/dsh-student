/** Durable generation transport identity is separate from agent-authored learning files. */
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { boundedOpenmaicOperation, OpenmaicError } from "./connection.js";
const id = z.string().min(1).max(200);
/** Generation and continuation input with stable Student activity ownership. */
export const generationRequestSchema = z.object({ learnerId: id, termId: id, blockId: id, reviewId: z.string().regex(/^[a-f0-9]{64}$/u).optional(), jobId: id.optional(), requirement: z.string().trim().min(1).max(8000).optional(), language: z.enum(['zh-CN', 'en-US']).optional(), enableWebSearch: z.boolean().optional(), enableImageGeneration: z.boolean().optional(), enableVideoGeneration: z.boolean().optional(), enableTTS: z.boolean().optional(), agentMode: z.enum(['default', 'generate']).optional() }).strict();
const jobSchema = z.object({ learnerId: id, termId: id, blockId: id, reviewId: z.string().regex(/^[a-f0-9]{64}$/u).optional(), learnerKey: id, baseUrl: z.string(), requirementHash: z.string(), status: z.enum(['starting', 'generating', 'ready', 'failed']), jobId: id.optional(), pollUrl: z.string().optional(), classroomId: id.optional(), url: z.string().optional() }).strict();
function object(value) { const parsed = z.record(z.string(), z.unknown()).safeParse(value); if (!parsed.success)
    throw new OpenmaicError('invalid-response'); return parsed.data; }
function pollingUrl(value, jobId, base) {
    let poll;
    try {
        poll = new URL(value, base);
    }
    catch {
        throw new OpenmaicError('unsafe-origin');
    }
    if (!['http:', 'https:'].includes(poll.protocol) || poll.origin !== new URL(base).origin || poll.pathname !== `/api/generate-classroom/${encodeURIComponent(jobId)}` || poll.search || poll.hash || poll.username || poll.password)
        throw new OpenmaicError('unsafe-origin');
    return poll.href;
}
/** Submit once per activity; subsequent calls poll the durably retained official job. */
export class OpenmaicGeneration {
    connection;
    jobs;
    running = new Map();
    constructor(connection, jobs) {
        this.connection = connection;
        this.jobs = jobs;
    }
    /**
     * Return structured job identity promptly; a missing result never causes a new submission.
     * @param input - Stable Student ownership and initial requirement or original job identity.
     * @param signal - Cancel local waiting; an accepted job remains durable and is not canceled remotely.
     * @returns Safe generation state from the same durable official job.
     */
    async run(input, signal) {
        const request = generationRequestSchema.parse(input);
        return boundedOpenmaicOperation(signal, this.connection.operationTimeoutMs, signal => this.resume(request, signal));
    }
    /** Poll only a previously retained job; this entry can never submit a classroom.
     * @param input - Original academic owner and optional job ID.
     * @param signal - Cancels the status read.
     * @returns Existing generation metadata or a recoverable unknown/missing error.
     */
    async poll(input, signal) {
        const saved = jobSchema.safeParse(await this.jobs.load(input));
        if (!saved.success || !saved.data.jobId)
            throw new OpenmaicError('generation-unknown');
        return this.run({ ...input, jobId: input.jobId ?? saved.data.jobId }, signal);
    }
    async resume(request, signal) {
        const key = JSON.stringify([request.learnerId, request.termId, request.blockId]);
        const existing = this.running.get(key);
        if (existing)
            return existing;
        const work = this.perform(request, signal);
        this.running.set(key, work);
        try {
            return await work;
        }
        finally {
            if (this.running.get(key) === work)
                this.running.delete(key);
        }
    }
    /**
     * Verify the protected original job without polling or creating another classroom.
     * @param owner - Explicit original Student learner, term and block.
     * @param classroomId - Saved official classroom identity.
     * @param signal - Cancellation for same-account verification.
     * @returns Whether the protected ready job owns this exact classroom.
     */
    async verify(owner, classroomId, signal) {
        const identity = await this.connection.identity(signal);
        const job = jobSchema.safeParse(await this.jobs.load(owner));
        return job.success && job.data.status === 'ready' && job.data.classroomId === classroomId && job.data.baseUrl === identity.baseUrl && job.data.learnerKey === identity.learnerKey && job.data.learnerId === owner.learnerId && job.data.termId === owner.termId && job.data.blockId === owner.blockId;
    }
    /** Read the protected pre-generation review identity for this original job.
     * @param owner - Original learner, term and block.
     * @returns The review that authorized submission, absent for legacy jobs.
     */
    async reviewedPlan(owner) {
        const job = jobSchema.safeParse(await this.jobs.load(owner));
        return job.success ? job.data.reviewId : undefined;
    }
    async perform(request, signal) {
        const identity = await this.connection.identity(signal);
        const saved = await this.jobs.load(request);
        let job;
        if (saved !== undefined) {
            const parsed = jobSchema.safeParse(saved);
            if (!parsed.success)
                throw new OpenmaicError('invalid-response');
            job = parsed.data;
            if (job.baseUrl !== identity.baseUrl || job.learnerKey !== identity.learnerKey || job.learnerId !== request.learnerId || job.termId !== request.termId || job.blockId !== request.blockId || request.jobId && request.jobId !== job.jobId)
                throw new OpenmaicError('identity-changed');
            if (request.requirement && createHash('sha256').update(request.requirement).digest('hex') !== job.requirementHash)
                throw new OpenmaicError('identity-changed');
            if (!job.jobId || !job.pollUrl)
                throw new OpenmaicError('generation-unknown');
            job.pollUrl = pollingUrl(job.pollUrl, job.jobId, identity.baseUrl);
        }
        else {
            if (request.jobId)
                throw new OpenmaicError('identity-changed');
            if (!request.requirement)
                throw new OpenmaicError('invalid-response');
            job = { learnerId: request.learnerId, termId: request.termId, blockId: request.blockId, learnerKey: identity.learnerKey, baseUrl: identity.baseUrl, ...(request.reviewId ? { reviewId: request.reviewId } : {}), requirementHash: createHash('sha256').update(request.requirement).digest('hex'), status: 'starting' };
            await this.connection.prepareGeneration(signal);
            await this.jobs.save(request, job);
            const { learnerId: _learner, termId: _term, blockId: _block, jobId: _job, reviewId: _review, ...body } = request;
            const submitted = object(await this.connection.request('/api/generate-classroom', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }, signal));
            if (typeof submitted.jobId !== 'string' || !submitted.jobId || typeof submitted.pollUrl !== 'string')
                throw new OpenmaicError('invalid-response');
            const poll = pollingUrl(submitted.pollUrl, submitted.jobId, identity.baseUrl);
            job = { ...job, status: 'generating', jobId: submitted.jobId, pollUrl: poll };
            await this.jobs.save(request, job);
            return this.result(job);
        }
        const response = object(await this.connection.request(job.pollUrl, {}, signal));
        if (response.jobId !== undefined && response.jobId !== job.jobId)
            throw new OpenmaicError('identity-changed');
        if (response.status === 'succeeded') {
            const result = object(response.result);
            if (typeof result.classroomId !== 'string' || !result.classroomId)
                throw new OpenmaicError('invalid-response');
            const url = new URL(`/classroom/${encodeURIComponent(result.classroomId)}`, identity.baseUrl).href;
            job = { ...job, status: 'ready', classroomId: result.classroomId, url };
        }
        else if (response.status === 'failed')
            job = { ...job, status: 'failed' };
        else if (!['queued', 'running', 'pending', 'generating', 'awaiting_outline_confirmation'].includes(String(response.status)))
            throw new OpenmaicError('invalid-response');
        await this.jobs.save(request, job);
        return this.result(job);
    }
    result(job) {
        if (!job.jobId || !job.pollUrl || job.status === 'starting')
            throw new OpenmaicError('generation-unknown');
        return { status: job.status, jobId: job.jobId, pollUrl: job.pollUrl, base: job.baseUrl, learnerId: job.learnerId, termId: job.termId, blockId: job.blockId, learnerKey: job.learnerKey, ...(job.classroomId ? { classroomId: job.classroomId } : {}), ...(job.url ? { url: job.url } : {}), retryable: job.status === 'generating' };
    }
}
//# sourceMappingURL=generation.js.map