var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
import { applicationStudyFiles } from "./files/application.js";
import { readWorkspace } from "./files/read.js";
import { readBackups, backupVersions, retainObservedBackups } from "./files/recovery.js";
import { resolveNativeSources } from "./native-source.js";
/**
 * Read official files with receipt observations obtained from the calling Agent's authorized Session service.
 * @param exec - registered execution Agent and caller cancellation; missing source service leaves dates unknown.
 * Receipt matching covers only the calling Session. Earlier-Session responses remain saved, but their dates stay unknown without separately authorized source observations.
 * @returns shared validated facts and explicit native source availability, with no retained Session lease.
 */
export async function readStudentWorkspace(exec) {
    exec.signal.throwIfAborted();
    if (!exec.agent)
        throw new Error('Student reads require a registered Agent.');
    const query = exec.agent.ctx.get('sessionQuery');
    let native = { status: 'unavailable', inputs: [], admissions: [], observations: [], omitted: 0, omittedAdmissions: 0, reason: 'Session source observation is unavailable.' };
    if (query) {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const observation = __addDisposableResource(env_1, await query.observeSession(exec.agent.session.id, { signal: exec.signal, projectionMode: 'none' }), false);
            native = resolveNativeSources(observation);
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    }
    exec.signal.throwIfAborted();
    const files = applicationStudyFiles(exec);
    const backups = await readBackups(files, exec.signal);
    const backupIssues = backups.issues.slice();
    const read = await readWorkspace(files, exec.signal, backupVersions(backups.backups), native.observations);
    if (read.status === 'valid') {
        const retained = await retainObservedBackups(files, read, Date.now(), exec.signal);
        backupIssues.push(...retained.issues);
    }
    exec.signal.throwIfAborted();
    return { read, native, backupIssues };
}
//# sourceMappingURL=transport.js.map