/** Student wire DTOs contain projections and current versions, never raw file bytes. */
import type { WorkspaceQuery, WorkspaceQueryResult } from './learning/queries.ts'
import type { NativeSourceCut, NativeConsumedInput, NativeAdmission } from './native-source.ts'
import type { ManualSaveRequest, ManualSaveResult } from './files/manual.ts'
import type { TermId, BlockId, WorksheetId, ResponseId } from './files/schema.ts'
import type { FileIssue } from './files/validation.ts'
import type { WorkspaceRead } from './files/read.ts'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { dashboard } from './dashboard.ts'
export type { NativeSourceCut, NativeConsumedInput, NativeReceipt, NativeAdmission } from './native-source.ts'
/** JSON values owned by this wire face, including dynamic shared query and manual baseline fields. */
export type StudentJsonValue = null | boolean | number | string | StudentJsonValue[] | { [key: string]: StudentJsonValue }
/** Native DSH Session identity; it is never a Student learning block or term identity. */
export type StudentSessionId = SessionId

/** Host refresh and complete serialized-response caps. */
export interface StudentTransportConfig { refreshIntervalMs: number; maxWireBytes: number }
/** Wire context excludes the internal complete receipt-observation list. */
export interface NativeSourceView { status: 'available' | 'unavailable'; cut?: NativeSourceCut; inputs: NativeConsumedInput[]; admissions: NativeAdmission[]; omitted: number; omittedAdmissions: number; reason?: string }
/** Query selector uses shared business query kinds and bounded pagination. */
export type StudentQueryRequest = WorkspaceQuery | { kind: 'dashboard'; options?: Parameters<typeof dashboard>[2] }
/** Current validated projection, explicit partial status and independently observed Session cut. */
export interface StudentQueryResult extends Omit<WorkspaceQueryResult<never>, 'data'> { data: StudentJsonValue; readAt: number; refreshAfter: number; token: string; native: NativeSourceView; backupIssues: FileIssue[] }
/** Only changed snapshots or current read failures cross one resource stream. */
export type StudentWatchFrame = { kind: 'snapshot'; value: StudentQueryResult } | { kind: 'failure'; message: string }
/** The shared manual request with JSON values at its wire baseline. */
export interface StudentManualSaveRequest extends Omit<ManualSaveRequest, 'baseline'> { baseline: Record<string, StudentJsonValue> }
/** Thin current owner/version facts for a retained manual draft; file bytes never cross the wire. */
export interface StudentManualContext { readStatus: WorkspaceRead['status']; termId?: TermId; versions: WorkspaceQueryResult['versions']; baseline: Record<string, StudentJsonValue>; issues: FileIssue[]; backupIssues?: FileIssue[] }
/** Manual save outcome is independent from native message admission and saved assessment outcomes. */
export interface StudentManualReply { status: ManualSaveResult['status']; current: Record<string, StudentJsonValue>; termId?: TermId; versions: WorkspaceQueryResult['versions']; readStatus: WorkspaceRead['status']; issues: FileIssue[]; backupIssues?: FileIssue[]; reason?: string }
/** Recovery inspects the original request and optional stable response identity without resending. */
export interface StudentSubmissionRequest { requestId: string; response?: { termId: TermId; owner: { kind: 'block'; id: BlockId } | { kind: 'worksheet'; id: WorksheetId }; responseId: ResponseId } }
/** Native admission, a saved original answer and a valid saved assessment are independent facts. */
export interface StudentSubmissionInspection { requestId: string; admission: 'accepted' | 'unknown'; nativeStates: NativeAdmission['status'][]; nativeSourceStatus: NativeSourceView['status']; cut?: NativeSourceCut; answer: 'not-requested' | 'saved' | 'missing' | 'unavailable'; assessment: 'not-requested' | 'valid' | 'pending' | 'unavailable'; readStatus: WorkspaceRead['status']; versions: WorkspaceQueryResult['versions']; issues: FileIssue[]; backupIssues?: FileIssue[] }
