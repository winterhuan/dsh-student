import { RemoteStreamCarrierError } from '@deepseek-ai/dsh-api-gateway/client';
import { RemoteError } from '@deepseek-ai/dsh-typert-protocol';
import { TYPERT_REMOTE } from '@winterhuan/dsh-student/remote';
/**
 * Address one shared query in a native Session; block and term identities remain in query data.
 * @param sessionId - native Session identity.
 * @param request - bounded shared query selector.
 * @returns the resource URI accepted by the Student provider.
 */
export function studentResourceAddress(sessionId, request) {
    return `dsh-resource://student/session/${encodeURIComponent(sessionId)}?query=${encodeURIComponent(JSON.stringify(request))}`;
}
/**
 * Follow generated Host snapshots through the native reconnect supervisor.
 * @param remote - mounted Student Remote and native stream supervisor.
 * @returns one provider owner; disposal waits for its physical stream iterators.
 */
export function createStudentResourceOwner(remote) {
    const streams = new Set();
    let disposed = false;
    return {
        provider: {
            protocol: 'student',
            async *open(address, { signal }) {
                if (signal.aborted || disposed)
                    return;
                let input;
                try {
                    const uri = new URL(address);
                    const parts = uri.pathname.split('/');
                    if (uri.protocol !== 'dsh-resource:' || uri.hostname !== 'student' || parts.length !== 3 || parts[1] !== 'session' || !parts[2] || uri.hash || uri.searchParams.getAll('query').length !== 1)
                        throw new Error('Invalid Student address.');
                    input = TYPERT_REMOTE.methods['student/query'].input({ strict: true }).create().parse({ sessionId: decodeURIComponent(parts[2]), request: JSON.parse(uri.searchParams.get('query')) });
                }
                catch (_error) {
                    yield { ok: false, error: new RemoteError('student/invalid-address', 'Invalid Student resource address.', {}) };
                    return;
                }
                let carrier = Promise.withResolvers();
                const stream = remote.$stream({
                    name: 'Student resource',
                    open: generationSignal => remote.student.watch(input.sessionId, input.request, AbortSignal.any([signal, generationSignal])),
                    ended: () => new RemoteStreamCarrierError('Student resource stream ended before cancellation.'),
                    carrierFailed: error => carrier.resolve(error),
                });
                streams.add(stream);
                const abort = () => { void stream.dispose(); };
                signal.addEventListener('abort', abort, { once: true });
                const iterator = stream[Symbol.asyncIterator]();
                let pending = iterator.next();
                try {
                    while (true) {
                        const outcome = await Promise.race([pending.then(result => ({ kind: 'frame', result })), carrier.promise.then(error => ({ kind: 'carrier', error }))]);
                        if (outcome.kind === 'carrier') {
                            carrier = Promise.withResolvers();
                            if (!signal.aborted && !disposed)
                                yield { ok: false, error: new RemoteError('student/unavailable', outcome.error.message, {}) };
                            continue;
                        }
                        if (outcome.result.done)
                            return;
                        const item = outcome.result.value;
                        pending = iterator.next();
                        if (signal.aborted || disposed || item.signal.aborted)
                            return;
                        const frame = item.value;
                        item.accept();
                        if (frame.kind === 'failure') {
                            yield { ok: false, error: new RemoteError('student/unavailable', frame.message, {}) };
                            continue;
                        }
                        const value = frame.value;
                        if (value.status !== 'valid' && value.status !== 'partial' && value.status !== 'missing' && value.status !== 'legacy' && value.status !== 'archived') {
                            yield { ok: false, error: new RemoteError('student/unavailable', value.issues?.[0]?.correction ?? 'Current Student files are unavailable.', {}) };
                        }
                        else
                            yield { ok: true, value };
                    }
                }
                catch (error) {
                    if (!signal.aborted && !disposed)
                        yield { ok: false, error: error instanceof RemoteError ? error : new RemoteError('student/unavailable', error instanceof Error ? error.message : 'Student resource disconnected.', {}) };
                }
                finally {
                    signal.removeEventListener('abort', abort);
                    await stream.dispose();
                    await pending.catch(() => { });
                    streams.delete(stream);
                }
            },
        },
        async dispose() { disposed = true; await Promise.all([...streams].map(stream => stream.dispose())); },
    };
}
/**
 * Mount the generated namespace and register its provider under one awaited Client lifetime.
 * @param ctx - Client Context with native Remote and resources services.
 * @param contribution - generated Student descriptors; defaults to the packaged contribution.
 * @returns once both namespace and provider are installed; cleanup is registered on ctx.
 */
export async function mountStudentResource(ctx, contribution = TYPERT_REMOTE) {
    const remoteDispose = await ctx.remote.$mount(contribution);
    ctx.effect(() => remoteDispose, 'student: remote namespace');
    ctx.inject(['remote.student'], scope => {
        const owner = createStudentResourceOwner({ student: scope.remote.student, $stream: options => scope.remote.$stream(options) });
        const release = scope.resources.register(owner.provider);
        scope.effect(() => async () => { release(); await owner.dispose(); }, 'student: resource transport');
    });
}
//# sourceMappingURL=resource.js.map