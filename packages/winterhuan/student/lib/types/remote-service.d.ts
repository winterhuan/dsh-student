import type { StudentPanelRequest, StudentPanelReply } from './types.ts';
import type { TextbookCommand, TextbookReply } from './textbooks/schema.ts';
import type { TextbookDevice, TextbookPairing } from './textbooks/service.ts';
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { TypertRemoteService, type Principal } from '@deepseek-ai/dsh-typert-protocol';
import { type ManualSaveRequest } from './files/manual.ts';
import type { StudentTransportConfig, StudentQueryRequest, StudentQueryResult, StudentManualContext, StudentManualReply, StudentManualSaveRequest, StudentWatchFrame, StudentSessionId, StudentSubmissionRequest, StudentSubmissionInspection, StudentFeedbackSyncRequest, StudentFeedbackSyncReply } from './types.ts';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        /** Authenticated panel input; source metadata is intent, not verified learning evidence. */
        'student-panel': {
            kind: 'user';
            rpcId: string;
            principal?: Principal;
            studentRequestHash?: string;
            studentIntent: import('./panel-intent.ts').PanelIntent;
        };
        'student-sync': {
            kind: 'student-sync';
            sessionId: string;
            lessonId: string;
            learnerId: string;
            termId: string;
            blockId: string;
            trigger: 'return' | 'continue' | 'resume';
        };
    }
}
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
    private readonly panelIntents;
    private readonly feedbackIntents;
    static inject: string[];
    static Config: z<StudentTransportConfig>;
    /**
     * @param ctx - Host services containing authorized native Agent lookups.
     * @param config - validated refresh interval and complete wire-response limit.
     */
    constructor(ctx: Context, config: StudentTransportConfig);
    /** Apply a textbook command within the authorized main Session's workspace.
     * @param sessionId - Authorized main Session.
     * @param request - Validated library operation and observed revisions.
     * @param signal - Cancellation while resolving the Session.
     * @returns Persisted library state after the operation.
     */
    textbooks(sessionId: StudentSessionId, request: TextbookCommand, signal: AbortSignal): Promise<TextbookReply>;
    /** Issue a one-time phone pairing grant; this never reveals the DSH management credential.
     * @param sessionId - Authorized main Session.
     * @param signal - Cancellation while resolving the Session.
     * @returns Expiring grant with the HTTPS address and certificate pin.
     */
    textbookPair(sessionId: StudentSessionId, signal: AbortSignal): Promise<TextbookPairing>;
    /** List or revoke only the devices paired with this workspace.
     * @param sessionId - Authorized main Session.
     * @param revoke - Optional device identity whose grant should be removed.
     * @param signal - Cancellation while resolving the Session.
     * @returns Remaining devices without secret credentials.
     */
    textbookDevices(sessionId: StudentSessionId, revoke: string | undefined, signal: AbortSignal): Promise<TextbookDevice[]>;
    /** Admit a browser-selected textbook image through the same durable phone upload owner.
     * @param sessionId - Authorized main Session.
     * @param request - Stable page identity, position and bounded base64 photo.
     * @param signal - Cancellation while resolving the Session.
     * @returns Saved page referencing the retained original.
     */
    textbookUpload(sessionId: StudentSessionId, request: {
        bookId: string;
        pageId: string;
        position: number;
        printedPage: string;
        data: string;
    }, signal: AbortSignal): Promise<TextbookReply>;
    /** Read a page-owned image for desktop proofreading without exposing arbitrary workspace paths.
     * @param sessionId - Authorized main Session.
     * @param bookId - Owning book identity.
     * @param pageId - Owning page identity.
     * @param kind - Original photo or cropped illustration.
     * @param index - Illustration index, ignored for originals.
     * @param candidate - Select the candidate's illustrations when true.
     * @param revision - Observed page revision, checked for illustrations.
     * @param signal - Cancellation while resolving the Session.
     * @returns Bounded base64 image and media type.
     */
    textbookImage(sessionId: StudentSessionId, bookId: string, pageId: string, kind: 'original' | 'asset', index: number, candidate: boolean, revision: number, signal: AbortSignal): Promise<{
        data: string;
        mediaType: string;
    }>;
    /**
     * Admit a compact panel intent as an ordinary native user message.
     * @param sessionId - Authorized main Session.
     * @param request - Stable request identity and bounded panel intent.
     * @param signal - Cancellation before admission.
     * @returns Admission only; the agent authors and validates business files.
     */
    submitIntent(sessionId: StudentSessionId, request: StudentPanelRequest, signal: AbortSignal): Promise<StudentPanelReply>;
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
     * @param sessionId - native Session identity; every read requires a registered main Agent.
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
    /**
     * Queue one authorized feedback intent behind existing native input, or withdraw its pending system message.
     * @param sessionId - Registered main Student Session; Remote authorization is required.
     * @param request - Explicit return, continue or resume trigger; pause removes only this lesson's queued system intent before caller-owned native cancellation.
     * @param signal - Cancellation before admission; admitted work belongs to the native queue.
     * @returns Queue state only. Failure, cancellation and completion allow a later explicit retry; no automatic wake loop or academic write occurs.
     */
    syncFeedback(sessionId: StudentSessionId, request: StudentFeedbackSyncRequest, signal: AbortSignal): Promise<StudentFeedbackSyncReply>;
    private wire;
    private readFacts;
    private mainAgent;
}
export default StudentRemote;
//# sourceMappingURL=remote-service.d.ts.map