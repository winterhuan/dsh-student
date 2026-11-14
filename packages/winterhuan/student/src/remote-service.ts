/** Student Remote methods retain native Session authorization and shared official-file ownership. */
import { createHash } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-typert-registry'
import type {} from '@deepseek-ai/dsh-api-gateway'
import { queryWorkspace, queryWorkspaceDashboard, queryJsonData } from './learning/queries.ts'
import { readInteractiveLessons } from './openmaic.ts'
import { readStudentWorkspace } from './transport.ts'
import { applicationStudyFiles } from './files/application.ts'
import { manualFields, saveManual, type ManualSaveRequest } from './files/manual.ts'
import type { WorkspaceRead } from './files/read.ts'
import type { StudentTransportConfig, StudentQueryRequest, StudentQueryResult, StudentManualContext, StudentManualReply, StudentManualSaveRequest, StudentWatchFrame, StudentSessionId, StudentSubmissionRequest, StudentSubmissionInspection } from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Student queries and explicit manual saves scoped to registered main Session identities. */
    student: StudentRemote
  }
}
declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** Student queries and saves require an existing registered main Agent. */
    'student/main-session-required': Record<string, never>
  }
}
/** Host owner for the generated student Remote namespace. */
export class StudentRemote extends TypertRemoteService {
  static inject = ['typert', 'sessionQuery', 'agents']
  static Config: z<StudentTransportConfig> = z.object({ refreshIntervalMs: z.number().step(1).min(1).max(2_147_483_647).default(3000), maxWireBytes: z.number().step(1).min(1024).default(1_048_576) })
  /**
   * @param ctx - Host services containing authorized native Agent lookups.
   * @param config - validated refresh interval and complete wire-response limit.
   */
  constructor(ctx: Context, private readonly config: StudentTransportConfig) { super(ctx, 'student') }

  /**
   * Read a shared validated Student projection without activating an absent Agent.
   * @param sessionId - native Session identity resolved through the registered main Agent lookup.
   * @param request - shared projection selector; it never names a learning block as a Session.
   * @param signal - complete source and filesystem read cancellation.
   * @returns current projection, actual file versions, cut and explicit partial or unavailable status.
   */
  @Remote({ resources: { session: sessionId => sessionId } })
  async query(sessionId: StudentSessionId, request: StudentQueryRequest, signal: AbortSignal): Promise<StudentQueryResult> {
    const agent = await this.mainAgent(sessionId, signal)
    this.wire(request)
    const { read, native, backupIssues } = await readStudentWorkspace({ agent, signal })
    const now = Date.now()
    const query = request.kind === 'dashboard'
      ? queryWorkspaceDashboard(read, now, request.options, read.workspace ? await readInteractiveLessons(agent, signal, read.workspace.settings.openmaic?.baseUrl) : undefined)
      : queryWorkspace(read, request, now)
    const { observations: _observations, ...view } = native
    const { data: _data, ...facts } = query
    const result: StudentQueryResult = { ...facts, data: queryJsonData(query), readAt: now, refreshAfter: query.refreshAfter ?? now + this.config.refreshIntervalMs, token: createHash('sha256').update(JSON.stringify([query, view, backupIssues])).digest('hex'), native: view, backupIssues }
    signal.throwIfAborted()
    return this.wire(result)
  }
  /**
   * Follow current files and time thresholds; unchanged version/cut/projection tokens produce no frame.
   * @param sessionId - registered main native Session identity, authorized before the stream opens.
   * @param request - shared bounded projection selector.
   * @param signal - cancellation stops reads and the owned refresh timer.
   * @returns an initial snapshot and later changes or recoverable read-failure frames.
   */
  @Remote({ mode: 'stream', resources: { session: sessionId => sessionId } })
  async *watch(sessionId: StudentSessionId, request: StudentQueryRequest, signal: AbortSignal): AsyncIterable<StudentWatchFrame> {
    await this.mainAgent(sessionId, signal)
    let token: string | undefined
    while (!signal.aborted) {
      let delay = this.config.refreshIntervalMs
      try {
        const value = await this.query(sessionId, request, signal)
        if (value.token !== token) { yield this.wire({ kind: 'snapshot', value } as const); token = value.token }
        delay = Math.max(1, Math.min(delay, value.refreshAfter - Date.now()))
      } catch (error) {
        if (signal.aborted) return
        token = undefined
        yield this.wire({ kind: 'failure', message: (error instanceof Error ? error.message : 'Student data could not be read.').slice(0, 200) } as const)
      }
      try { await setTimeout(delay, undefined, { signal }) }
      catch (error) { if (signal.aborted) return; throw error }
    }
  }

  /**
   * Capture the shared owner's edited-field values from one actual read.
   * @param sessionId - registered main native Session identity.
   * @param intent - typed manual operation; setup must identify editedProfileFields.
   * @param signal - cancellation for source and official-file reads.
   * @returns exact current term identity, observed versions, draft baseline and read issues.
   */
  @Remote({ resources: { session: sessionId => sessionId } })
  async manualContext(sessionId: StudentSessionId, intent: ManualSaveRequest['intent'], signal: AbortSignal): Promise<StudentManualContext> {
    const agent = await this.mainAgent(sessionId, signal)
    this.wire(intent)
    const { read } = await readStudentWorkspace({ agent, signal })
    return this.wire({ ...this.readFacts(read), baseline: manualFields(read, intent) })
  }

  /**
   * Save an explicit manual draft through the shared guarded filesystem owner.
   * @param sessionId - registered main native Session identity.
   * @param request - actual observed term, file versions, edited fields and retained baseline.
   * @param signal - cancellation passed through the application save.
   * @returns thin save outcome, current edited values and versions for subsequent draft saves.
   */
  @Remote({ resources: { session: sessionId => sessionId } })
  async saveManual(sessionId: StudentSessionId, request: StudentManualSaveRequest, signal: AbortSignal): Promise<StudentManualReply> {
    const agent = await this.mainAgent(sessionId, signal)
    this.wire(request)
    const result = await saveManual(applicationStudyFiles({ agent, signal }), request, Date.now(), signal)
    signal.throwIfAborted()
    return this.wire({ ...this.readFacts(result.read), status: result.status, current: result.current, ...(result.reason === undefined ? {} : { reason: result.reason }) })
  }
  /**
   * Inspect an uncertain submission before deliberate recovery; this method never submits input.
   * @param sessionId - registered main native Session identity.
   * @param request - original native request and optional term/owner/response identity.
   * @param signal - cancellation for the independent Session and file reads.
   * @returns admission, saved-answer and valid-assessment facts separately; omitted admission remains unknown.
   */
  @Remote({ resources: { session: sessionId => sessionId } })
  async inspectSubmission(sessionId: StudentSessionId, request: StudentSubmissionRequest, signal: AbortSignal): Promise<StudentSubmissionInspection> {
    const agent = await this.mainAgent(sessionId, signal)
    this.wire(request)
    const { read, native } = await readStudentWorkspace({ agent, signal })
    const nativeStates = native.admissions.filter(row => row.requestId === request.requestId).map(row => row.status)
    const result: StudentSubmissionInspection = { requestId: request.requestId, admission: nativeStates.length ? 'accepted' : 'unknown', nativeStates, nativeSourceStatus: native.status, ...(native.cut ? { cut: native.cut } : {}), answer: 'not-requested', assessment: 'not-requested', ...this.readFacts(read) }
    if (request.response) {
      const { owner, responseId, termId } = request.response
      const path = `.study/${owner.kind === 'block' ? 'blocks' : 'worksheets'}/${owner.id}.json`
      if (!read.workspace || read.workspace.settings.termId !== termId || read.issues.some(issue => issue.path === path || issue.path === '.study/settings.json')) { result.answer = 'unavailable'; result.assessment = 'unavailable' }
      else {
        const entity = owner.kind === 'block' ? read.workspace.blocks.find(row => row.id === owner.id) : read.workspace.worksheets.find(row => row.id === owner.id)
        result.answer = entity?.responses.some(row => row.id === responseId) ? 'saved' : 'missing'
        result.assessment = result.answer === 'saved' && entity?.assessments.some(row => row.responseId === responseId) ? 'valid' : 'pending'
      }
    }
    return this.wire(result)
  }

  private wire<T>(value: T): T {
    if (Buffer.byteLength(JSON.stringify(value)) > this.config.maxWireBytes) throw new RemoteError('gateway/bad-request', 'Student JSON exceeds the configured limit; request fewer fields or a smaller projection.', {})
    return value
  }

  private readFacts(read: WorkspaceRead): Omit<StudentManualContext, 'baseline'> {
    return { readStatus: read.status, ...(read.workspace ? { termId: read.workspace.settings.termId } : {}), versions: read.files.map(({ path, targetKey, version }) => ({ path, targetKey, version })), issues: read.issues, ...(read.backupIssues ? { backupIssues: read.backupIssues } : {}) }
  }

  private async mainAgent(sessionId: StudentSessionId, signal: AbortSignal): Promise<Agent> {
    signal.throwIfAborted()
    const agent = this.ctx.agents.get(sessionId)
    if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === 'subagent') throw new RemoteError('student/main-session-required', 'Open the Student workspace in a registered main Session.', {})
    return agent
  }
}
export default StudentRemote
