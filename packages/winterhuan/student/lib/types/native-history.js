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
import { SessionId } from '@deepseek-ai/dsh-session';
import { resolveNativeSources } from "./native-source.js";
/**
 * Verify explicitly referenced original native inputs without activating any historical Agent.
 * @param agent - Authorized calling main Agent and filesystem provider.
 * @param read - Validated current/explicitly referenced archive entities.
 * @param signal - Caller cancellation; a bounded deadline also applies to history reads.
 * @param invocation - Current Remote context for prior-Session permission checks; native calls use their existing Agent ownership and omit it.
 * @returns Referenced exact original tuples and explicit per-source failures; normal public decoding is provider-owned.
 */
export async function readNativeHistory(agent, read, signal, invocation) {
    const workspace = read.workspace;
    const query = agent.ctx.get('sessionQuery'), fs = agent.ctx.get('fs');
    const observations = [], verification = [];
    const allows = async (id) => invocation ? await invocation.get('remoteAccess')?.allows({ kind: 'session', id }) ?? false : true;
    if (!workspace)
        return { observations, verification, recheck: async () => { } };
    const owners = [{ workspace, references: undefined }, ...(read.archiveSources ?? workspace.archivedEvidence ?? [])];
    const needed = (owner, file, responseId) => {
        if (!owner.references)
            return true;
        const response = file.responses.find(response => response.id === responseId);
        const question = (file.kind === 'block' ? file.questions : file.items).find(question => question.id === response?.questionId);
        return owner.references.some(reference => reference.learnerId === file.learnerId && reference.termId === file.termId && (reference.ownerKind === file.kind && reference.ownerId === file.id && reference.responseId === responseId || reference.review && reference.review.mistakeId === question?.mistakeId && (question?.capability?.goalId ?? question?.objectiveId) === reference.goalId));
    };
    const references = owners.flatMap(owner => [...owner.workspace.blocks, ...owner.workspace.worksheets].flatMap(file => file.responses.flatMap(response => response.source.kind === 'native' && response.source.sessionId !== agent.session.id && needed(owner, file, response.id) ? [{ file, response, source: response.source }] : [])));
    const corrections = owners.flatMap(owner => owner.workspace.blocks.flatMap(file => file.assessments.flatMap(assessment => assessment.criterionCorrection && assessment.criterionCorrection.sessionId !== agent.session.id && needed(owner, file, assessment.responseId) ? [assessment.criterionCorrection] : [])));
    const ids = [...new Set([...references.map(reference => reference.source.sessionId), ...corrections.map(correction => correction.sessionId)])];
    const deadline = AbortSignal.any([signal, AbortSignal.timeout(30_000)]);
    let physicalBytes = 0, replayBytes = 0;
    const currentRoot = agent.session.header.cwd && fs ? await fs.resolve(agent.session.header.cwd, { signal: deadline }) : undefined;
    for (const [index, rawId] of ids.entries()) {
        const unavailable = (reason) => verification.push({ sessionId: rawId, status: 'unavailable', reason });
        if (index >= 8) {
            unavailable('Historical source count exceeds eight explicitly referenced Sessions.');
            continue;
        }
        if (!query || !fs || !currentRoot) {
            unavailable('Original workspace or source service is unavailable.');
            continue;
        }
        const id = SessionId(rawId);
        try {
            const env_1 = { stack: [], error: void 0, hasError: false };
            try {
                if (!await allows(id)) {
                    unavailable('Original Session access is unavailable.');
                    continue;
                }
                const live = agent.ctx.get('sessions')?.get(id);
                const stored = !live ? await agent.ctx.get('sessionPersistence')?.stat(id, { signal: deadline }) : undefined;
                const header = live?.header ?? stored?.header;
                if (!header || header.id !== id || !header.cwd || header.parentSession || header.origin === 'subagent') {
                    unavailable('Original main Session header is unavailable.');
                    continue;
                }
                const sourceRoot = await fs.resolve(header.cwd, { signal: deadline });
                if (sourceRoot.targetKey !== currentRoot.targetKey) {
                    unavailable('Original Session belongs to another workspace.');
                    continue;
                }
                physicalBytes += stored?.sizeBytes ?? 0;
                if (physicalBytes > 33_554_432 || stored?.eventCount !== undefined && stored.eventCount > 100_000) {
                    unavailable('Original Session metadata exceeds the history read budget.');
                    continue;
                }
                const observation = __addDisposableResource(env_1, await query.observeSession(id, { signal: deadline, projectionMode: 'none' }), false);
                const finalRoot = observation.header.cwd ? await fs.resolve(observation.header.cwd, { signal: deadline }) : undefined;
                if (observation.header.id !== id || observation.header.parentSession || observation.header.origin === 'subagent' || finalRoot?.targetKey !== currentRoot.targetKey || !await allows(id)) {
                    unavailable('Original Session ownership or access changed during the read.');
                    continue;
                }
                replayBytes += Buffer.byteLength(JSON.stringify(observation.events));
                if (replayBytes > 33_554_432) {
                    unavailable('Aggregate original Session replay exceeds 32 MiB.');
                    continue;
                }
                const native = resolveNativeSources(observation);
                if (native.status !== 'available') {
                    unavailable(native.reason ?? 'Original Session replay is unavailable.');
                    continue;
                }
                const selected = references.filter(reference => reference.source.sessionId === rawId);
                observations.push(...native.observations.filter(item => selected.some(reference => reference.source.messageId === item.messageId && reference.source.inputVersion === item.inputVersion && reference.response.rawResponse === item.rawResponse && reference.file.learnerId !== undefined && item.learningScope?.learnerId === reference.file.learnerId && item.learningScope.termId === reference.file.termId && reference.file.kind === 'block' && item.learningScope.blockId === reference.file.id && item.learningScope.questionId === reference.response.questionId && item.learningScope.responseId === reference.response.id) || corrections.some(correction => correction.sessionId === rawId && correction.messageId === item.messageId && correction.inputVersion === item.inputVersion && correction.rawResponse === item.rawResponse)));
                verification.push({ sessionId: rawId, status: 'available' });
            }
            catch (e_1) {
                env_1.error = e_1;
                env_1.hasError = true;
            }
            finally {
                __disposeResources(env_1);
            }
        }
        catch (error) {
            if (signal.aborted)
                throw error;
            unavailable(deadline.aborted ? 'Original Session read deadline expired.' : 'Original Session could not be independently read.');
        }
    }
    return { observations, verification, async recheck() {
            for (const fact of verification.filter(fact => fact.status === 'available')) {
                try {
                    const id = SessionId(fact.sessionId);
                    const allowed = await allows(id);
                    const live = agent.ctx.get('sessions')?.get(id);
                    const header = live?.header ?? (await agent.ctx.get('sessionPersistence')?.stat(id, { signal }))?.header;
                    const current = agent.session.header.cwd && fs ? await fs.resolve(agent.session.header.cwd, { signal }) : undefined;
                    const original = header?.cwd && fs ? await fs.resolve(header.cwd, { signal }) : undefined;
                    if (!allowed || header?.parentSession || header?.origin === 'subagent' || current?.targetKey !== currentRoot?.targetKey || original?.targetKey !== currentRoot?.targetKey)
                        throw new Error('Source authorization changed.');
                }
                catch (error) {
                    if (signal.aborted)
                        throw error;
                    fact.status = 'unavailable';
                    fact.reason = 'Original Session ownership or access changed before publication.';
                    for (let index = observations.length - 1; index >= 0; index--)
                        if (observations[index].sessionId === fact.sessionId)
                            observations.splice(index, 1);
                }
            }
        } };
}
//# sourceMappingURL=native-history.js.map