import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type ManualSaveRequest } from './files/manual.ts';
import type { StudentTransportConfig, StudentQueryRequest, StudentQueryResult, StudentManualContext, StudentManualReply, StudentManualSaveRequest, StudentWatchFrame, StudentSessionId, StudentSubmissionRequest, StudentSubmissionInspection } from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Student queries and explicit manual saves scoped to registered main Session identities. */
        student: StudentRemote;
    }
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        /** Student queries and saves require an existing registered main Agent. */
        'student/main-session-required': Record<string, never>;
    }
}
/** Host owner for the generated student Remote namespace. */
export declare class StudentRemote extends TypertRemoteService {
    private readonly config;
    static inject: string[];
    static Config: z<StudentTransportConfig>;
    /**
     * @param ctx - Host services containing authorized native Agent lookups.
     * @param config - validated refresh interval and complete wire-response limit.
     */
    constructor(ctx: Context, config: StudentTransportConfig);
    /**
     * Read a shared validated Student projection without activating an absent Agent.
     * @param sessionId - native Session identity resolved through the registered main Agent lookup.
     * @param request - shared projection selector; it never names a learning block as a Session.
     * @param signal - complete source and filesystem read cancellation.
     * @returns current projection, actual file versions, cut and explicit partial or unavailable status.
     */
    query(sessionId: StudentSessionId, request: StudentQueryRequest, signal: AbortSignal): Promise<StudentQueryResult>;
    /**
     * Follow current files and time thresholds; unchanged version/cut/projection tokens produce no frame.
     * @param sessionId - registered main native Session identity, authorized before the stream opens.
     * @param request - shared bounded projection selector.
     * @param signal - cancellation stops reads and the owned refresh timer.
     * @returns an initial snapshot and later changes or recoverable read-failure frames.
     */
    watch(sessionId: StudentSessionId, request: StudentQueryRequest, signal: AbortSignal): AsyncIterable<StudentWatchFrame>;
    /**
     * Capture the shared owner's edited-field values from one actual read.
     * @param sessionId - registered main native Session identity.
     * @param intent - typed manual operation; setup must identify editedProfileFields.
     * @param signal - cancellation for source and official-file reads.
     * @returns exact current term identity, observed versions, draft baseline and read issues.
     */
    manualContext(sessionId: StudentSessionId, intent: ManualSaveRequest['intent'], signal: AbortSignal): Promise<StudentManualContext>;
    /**
     * Save an explicit manual draft through the shared guarded filesystem owner.
     * @param sessionId - registered main native Session identity.
     * @param request - actual observed term, file versions, edited fields and retained baseline.
     * @param signal - cancellation passed through the application save.
     * @returns thin save outcome, current edited values and versions for subsequent draft saves.
     */
    saveManual(sessionId: StudentSessionId, request: StudentManualSaveRequest, signal: AbortSignal): Promise<StudentManualReply>;
    /**
     * Inspect an uncertain submission before deliberate recovery; this method never submits input.
     * @param sessionId - registered main native Session identity.
     * @param request - original native request and optional term/owner/response identity.
     * @param signal - cancellation for the independent Session and file reads.
     * @returns admission, saved-answer and valid-assessment facts separately; omitted admission remains unknown.
     */
    inspectSubmission(sessionId: StudentSessionId, request: StudentSubmissionRequest, signal: AbortSignal): Promise<StudentSubmissionInspection>;
    private wire;
    private readFacts;
    private mainAgent;
}
export default StudentRemote;
//# sourceMappingURL=remote-service.d.ts.map