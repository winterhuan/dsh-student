/** Student resource streams own current reads, stale failures, reconnect and awaited closure. */
import type { Context } from '@deepseek-ai/cordis';
import type { ResourceProvider } from '@deepseek-ai/dsh-client-resources/client';
import type { RemoteStream, RemoteStreamOptions } from '@deepseek-ai/dsh-api-gateway/client';
import { type TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { StudentSessionId, StudentQueryRequest, StudentQueryResult } from '../types.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface ResourceProtocolMap {
        /** Current Student projection with explicit partial status and independent Session cut. */
        student: StudentQueryResult;
    }
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        /** The resource address does not identify a Student Session query. */
        'student/invalid-address': Record<string, never>;
        /** Current official files cannot supply this projection; the last display remains stale. */
        'student/unavailable': Record<string, never>;
    }
}
/** The generated stream and its native reconnect supervisor are the resource's transport seam. */
export interface StudentResourceRemote {
    readonly student: Pick<Context['remote']['student'], 'watch'>;
    $stream<T>(options: RemoteStreamOptions<T>): RemoteStream<T>;
}
/** Provider and awaited shutdown owned by one Client plugin. */
export interface StudentResourceOwner {
    provider: ResourceProvider<'student'>;
    dispose(): Promise<void>;
}
/**
 * Address one shared query in a native Session; block and term identities remain in query data.
 * @param sessionId - native Session identity.
 * @param request - bounded shared query selector.
 * @returns the resource URI accepted by the Student provider.
 */
export declare function studentResourceAddress(sessionId: StudentSessionId, request: StudentQueryRequest): string;
/**
 * Follow generated Host snapshots through the native reconnect supervisor.
 * @param remote - mounted Student Remote and native stream supervisor.
 * @returns one provider owner; disposal waits for its physical stream iterators.
 */
export declare function createStudentResourceOwner(remote: StudentResourceRemote): StudentResourceOwner;
/**
 * Mount the generated namespace and register its provider under one awaited Client lifetime.
 * @param ctx - Client Context with native Remote and resources services.
 * @param contribution - generated Student descriptors; defaults to the packaged contribution.
 * @returns once both namespace and provider are installed; cleanup is registered on ctx.
 */
export declare function mountStudentResource(ctx: Context, contribution?: TypertRemoteContribution): Promise<void>;
//# sourceMappingURL=resource.d.ts.map