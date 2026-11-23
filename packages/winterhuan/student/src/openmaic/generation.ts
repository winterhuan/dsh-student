/** Durable generation transport identity is separate from agent-authored learning files. */
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { boundedOpenmaicOperation, OpenmaicConnection, OpenmaicError } from './connection.ts'
const id = z.string().min(1).max(200)
/** Generation and continuation input with stable Student activity ownership. */
export const generationRequestSchema = z.object({ learnerId: id, termId: id, blockId: id, jobId: id.optional(), requirement: z.string().trim().min(1).max(8000).optional(), language: z.enum(['zh-CN', 'en-US']).optional(), enableWebSearch: z.boolean().optional(), enableImageGeneration: z.boolean().optional(), enableVideoGeneration: z.boolean().optional(), enableTTS: z.boolean().optional(), agentMode: z.enum(['default', 'generate']).optional() }).strict()
/** Generation input; a continuation does not need to resend the requirement. */
export type OpenmaicGenerationRequest = z.infer<typeof generationRequestSchema>
const jobSchema = z.object({ learnerId: id, termId: id, blockId: id, learnerKey: id, baseUrl: z.string(), requirementHash: z.string(), status: z.enum(['starting', 'generating', 'ready', 'failed']), jobId: id.optional(), pollUrl: z.string().optional(), classroomId: id.optional(), url: z.string().optional() }).strict()
/** Protected Host transport storage; values never count as learning evidence. */
export interface OpenmaicJobStore { load(owner: OpenmaicGenerationRequest): Promise<unknown>; save(owner: OpenmaicGenerationRequest, value: unknown): Promise<void> }
/** Safe generation metadata ready for native tool logging and agent-authored lesson files. */
export interface OpenmaicGenerationResult { status: 'generating' | 'ready' | 'failed'; jobId: string; pollUrl: string; base: string; learnerId: string; termId: string; blockId: string; learnerKey: string; classroomId?: string; url?: string; retryable: boolean }
function object(value: unknown): Record<string, unknown> { const parsed = z.record(z.string(), z.unknown()).safeParse(value); if (!parsed.success) throw new OpenmaicError('invalid-response'); return parsed.data }
function pollingUrl(value: string, jobId: string, base: string): string {
  let poll: URL
  try { poll = new URL(value, base) } catch { throw new OpenmaicError('unsafe-origin') }
  if (!['http:', 'https:'].includes(poll.protocol) || poll.origin !== new URL(base).origin || poll.pathname !== `/api/generate-classroom/${encodeURIComponent(jobId)}` || poll.search || poll.hash || poll.username || poll.password) throw new OpenmaicError('unsafe-origin')
  return poll.href
}
/** Submit once per activity; subsequent calls poll the durably retained official job. */
export class OpenmaicGeneration {
  private readonly running = new Map<string, Promise<OpenmaicGenerationResult>>()
  constructor(private readonly connection: OpenmaicConnection, private readonly jobs: OpenmaicJobStore) {}
  /**
   * Return structured job identity promptly; a missing result never causes a new submission.
   * @param input - Stable Student ownership and initial requirement or original job identity.
   * @param signal - Cancel local waiting; an accepted job remains durable and is not canceled remotely.
   * @returns Safe generation state from the same durable official job.
   */
  async run(input: OpenmaicGenerationRequest, signal: AbortSignal): Promise<OpenmaicGenerationResult> {
    const request = generationRequestSchema.parse(input)
    return boundedOpenmaicOperation(signal, this.connection.operationTimeoutMs, signal => this.resume(request, signal))
  }
  private async resume(request: OpenmaicGenerationRequest, signal: AbortSignal): Promise<OpenmaicGenerationResult> {
    const key = JSON.stringify([request.learnerId, request.termId, request.blockId])
    const existing = this.running.get(key)
    if (existing) return existing
    const work = this.perform(request, signal)
    this.running.set(key, work)
    try { return await work } finally { if (this.running.get(key) === work) this.running.delete(key) }
  }
  /**
   * Verify the protected original job without polling or creating another classroom.
   * @param owner - Explicit original Student learner, term and block.
   * @param classroomId - Saved official classroom identity.
   * @param signal - Cancellation for same-account verification.
   * @returns Whether the protected ready job owns this exact classroom.
   */
  async verify(owner: Pick<OpenmaicGenerationRequest, 'learnerId' | 'termId' | 'blockId'>, classroomId: string, signal: AbortSignal): Promise<boolean> {
    const identity = await this.connection.identity(signal)
    const job = jobSchema.safeParse(await this.jobs.load(owner))
    return job.success && job.data.status === 'ready' && job.data.classroomId === classroomId && job.data.baseUrl === identity.baseUrl && job.data.learnerKey === identity.learnerKey && job.data.learnerId === owner.learnerId && job.data.termId === owner.termId && job.data.blockId === owner.blockId
  }
  private async perform(request: OpenmaicGenerationRequest, signal: AbortSignal): Promise<OpenmaicGenerationResult> {
    const identity = await this.connection.identity(signal)
    const saved = await this.jobs.load(request)
    let job: z.infer<typeof jobSchema>
    if (saved !== undefined) {
      const parsed = jobSchema.safeParse(saved)
      if (!parsed.success) throw new OpenmaicError('invalid-response')
      job = parsed.data
      if (job.baseUrl !== identity.baseUrl || job.learnerKey !== identity.learnerKey || job.learnerId !== request.learnerId || job.termId !== request.termId || job.blockId !== request.blockId || request.jobId && request.jobId !== job.jobId) throw new OpenmaicError('identity-changed')
      if (request.requirement && createHash('sha256').update(request.requirement).digest('hex') !== job.requirementHash) throw new OpenmaicError('identity-changed')
      if (!job.jobId || !job.pollUrl) throw new OpenmaicError('generation-unknown')
      job.pollUrl = pollingUrl(job.pollUrl, job.jobId, identity.baseUrl)
    } else {
      if (request.jobId) throw new OpenmaicError('identity-changed')
      if (!request.requirement) throw new OpenmaicError('invalid-response')
      job = { learnerId: request.learnerId, termId: request.termId, blockId: request.blockId, learnerKey: identity.learnerKey, baseUrl: identity.baseUrl, requirementHash: createHash('sha256').update(request.requirement).digest('hex'), status: 'starting' }
      await this.connection.prepareGeneration(signal)
      await this.jobs.save(request, job)
      const { learnerId: _learner, termId: _term, blockId: _block, jobId: _job, ...body } = request
      const submitted = object(await this.connection.request('/api/generate-classroom', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }, signal))
      if (typeof submitted.jobId !== 'string' || !submitted.jobId || typeof submitted.pollUrl !== 'string') throw new OpenmaicError('invalid-response')
      const poll = pollingUrl(submitted.pollUrl, submitted.jobId, identity.baseUrl)
      job = { ...job, status: 'generating', jobId: submitted.jobId, pollUrl: poll }
      await this.jobs.save(request, job)
      return this.result(job)
    }
    const response = object(await this.connection.request(job.pollUrl!, {}, signal))
    if (response.jobId !== undefined && response.jobId !== job.jobId) throw new OpenmaicError('identity-changed')
    if (response.status === 'succeeded') {
      const result = object(response.result)
      if (typeof result.classroomId !== 'string' || !result.classroomId) throw new OpenmaicError('invalid-response')
      const url = new URL(`/classroom/${encodeURIComponent(result.classroomId)}`, identity.baseUrl).href
      job = { ...job, status: 'ready', classroomId: result.classroomId, url }
    } else if (response.status === 'failed') job = { ...job, status: 'failed' }
    else if (!['queued', 'running', 'pending', 'generating', 'awaiting_outline_confirmation'].includes(String(response.status))) throw new OpenmaicError('invalid-response')
    await this.jobs.save(request, job)
    return this.result(job)
  }
  private result(job: z.infer<typeof jobSchema>): OpenmaicGenerationResult {
    if (!job.jobId || !job.pollUrl || job.status === 'starting') throw new OpenmaicError('generation-unknown')
    return { status: job.status, jobId: job.jobId, pollUrl: job.pollUrl, base: job.baseUrl, learnerId: job.learnerId, termId: job.termId, blockId: job.blockId, learnerKey: job.learnerKey, ...(job.classroomId ? { classroomId: job.classroomId } : {}), ...(job.url ? { url: job.url } : {}), retryable: job.status === 'generating' }
  }
}
