import { y as applicationStudyFiles } from "./queries-Do-cB2_C.js";
import { F as canonical, _ as readBackups, f as backupVersions, u as readWorkspace, v as retainObservedBackups } from "./openmaic-oaD578Fa.js";
import { createHash } from "node:crypto";
import { KNOWN_SESSION_EVENT_TYPES } from "@deepseek-ai/dsh-session";
//#region lib/types/native-source.js
/** Exact consumed native input versions from one immutable Session observation. */
/**
* Replay the complete immutable prefix and identify native versions actually consumed in entered steps.
* @param observation - caller-owned raw observation; this function does not retain or dispose it.
* @returns bounded text context and exact shared native observations, or explicit unavailability.
*/
function resolveNativeSources(observation) {
	const cut = {
		sessionId: observation.header.id,
		cursor: observation.cursor,
		source: observation.source,
		inheritedEventCount: observation.inheritedEventCount,
		...observation.revision === void 0 ? {} : { revision: observation.revision }
	};
	const unavailable = (reason) => ({
		status: "unavailable",
		cut,
		inputs: [],
		admissions: [],
		observations: [],
		omitted: 0,
		omittedAdmissions: 0,
		reason
	});
	if (observation.cursor !== observation.events.length - 1) return unavailable("Session cut is incomplete.");
	if (observation.events.length > 1e5) return unavailable("Native source replay exceeds 100000 events.");
	let replayBytes = 0;
	const pending = {
		"next-turn": [],
		"next-step": []
	};
	const seen = /* @__PURE__ */ new Set();
	let claims = [];
	let sealed = [];
	let turn;
	let entered = false;
	let claimWindow = false;
	let firstStep = false;
	const claimTargets = /* @__PURE__ */ new Set();
	const inputs = [];
	const observations = [];
	const admissions = [];
	for (const [seq, event] of observation.events.entries()) {
		replayBytes += Buffer.byteLength(JSON.stringify(event));
		if (replayBytes > 16777216) return unavailable("Native source replay exceeds 16 MiB.");
		if (event.seq !== seq) return unavailable("Session events are not contiguous.");
		if (!event.ignorable && !KNOWN_SESSION_EVENT_TYPES.has(event.type)) return unavailable("Native source replay contains an unsupported required event.");
		switch (event.type) {
			case "agent/inbox/spliced": {
				const { target, start, removedCount = 0, inserted, outcome } = event.data;
				if (!Number.isSafeInteger(start) || !Number.isSafeInteger(removedCount) || start < 0 || removedCount < 0 || start > pending[target].length || start + removedCount > pending[target].length) return unavailable("Invalid inbox splice coordinates.");
				const removed = pending[target].slice(start, start + removedCount);
				const slots = inserted.map((message) => {
					const previous = removed.find((slot) => slot.message.id === message.id);
					let receipt = {
						kind: "unknown",
						reason: "Previously used ID has no continuous snapshot."
					};
					if (!seen.has(message.id)) receipt = {
						kind: "known",
						at: event.time,
						seq: event.seq
					};
					else if (previous && canonical(previous.message) === canonical(message)) receipt = previous.receipt;
					else if (previous && removed.length === 1 && inserted.length === 1 && canonical(previous.message.source) === canonical(message.source)) receipt = {
						kind: "known",
						at: event.time,
						seq: event.seq
					};
					seen.add(message.id);
					if (event.seq < observation.inheritedEventCount) receipt = {
						kind: "unknown",
						reason: "Inherited input has no independently observed original Session."
					};
					const admission = event.seq < observation.inheritedEventCount || message.source.kind !== "user" ? void 0 : previous?.admission ?? {
						messageId: message.id,
						..."rpcId" in message.source ? { requestId: message.source.rpcId } : {},
						status: "pending"
					};
					if (admission && !previous?.admission) admissions.push(admission);
					return {
						message,
						receipt,
						...admission ? { admission } : {}
					};
				});
				pending[target].splice(start, removedCount, ...slots);
				const ids = [...pending["next-turn"], ...pending["next-step"]].map((slot) => slot.message.id);
				if (new Set(ids).size !== ids.length) return unavailable("Duplicate pending message ID.");
				if (outcome === void 0 && inserted.length === 0 && removed.length > 0 && claimWindow && start === 0 && !claimTargets.has(target) && (target === "next-step" ? removedCount === removed.length && pending[target].length === 0 : firstStep && removedCount === 1)) {
					claims.push(...removed);
					for (const slot of removed) if (slot.admission) slot.admission.status = "claimed";
					claimTargets.add(target);
				} else for (const slot of removed) if (slot.admission && !slots.some((current) => current.admission === slot.admission)) slot.admission.status = "removed";
				break;
			}
			case "turn/start":
				turn = event.data.turn;
				firstStep = true;
				claimWindow = true;
				claims = [];
				sealed = [];
				entered = false;
				claimTargets.clear();
				break;
			case "step/start":
				sealed = event.data.turn === turn && claimWindow ? claims : [];
				claims = [];
				entered = true;
				claimWindow = false;
				firstStep = false;
				break;
			case "user/message": {
				const message = event.data;
				if (message.source.kind !== "user") break;
				const matches = sealed.flatMap((slot, index) => canonical(slot.message) === canonical(message) ? [index] : []);
				const match = matches.length === 1 && entered && event.surfaceOp === "append" ? matches[0] : -1;
				const consumed = match < 0 ? void 0 : sealed.splice(match, 1)[0];
				if (consumed?.admission) consumed.admission.status = "consumed";
				const receipt = event.seq < observation.inheritedEventCount ? {
					kind: "unknown",
					reason: "Inherited consumption is not new input in this Session."
				} : consumed?.receipt ?? {
					kind: "unknown",
					reason: "No exact claim in the entered step."
				};
				const inputVersion = `dsh-native-v1:${createHash("sha256").update(canonical({
					algorithm: "dsh-native-v1",
					sessionId: cut.sessionId,
					consumedSeq: event.seq,
					message
				})).digest("hex")}`;
				const text = message.content.filter((block) => block.type === "text").map((block) => block.text).join("");
				const rawResponse = text.length > 0 && text.length <= 2e3 ? text : void 0;
				const attachments = message.content.flatMap((block) => block.type === "image" || block.type === "file" ? [{
					kind: block.type,
					attachmentId: block.attachment.attachmentId
				}] : []);
				const input = {
					status: "consumed",
					messageId: message.id,
					inputVersion,
					consumedSeq: event.seq,
					...rawResponse === void 0 ? { textUnavailable: "Exact native text is empty or exceeds 2000 characters." } : { rawResponse },
					receipt,
					..."rpcId" in message.source ? { requestId: message.source.rpcId } : {},
					attachments: attachments.slice(0, 8),
					omittedAttachments: Math.max(0, attachments.length - 8)
				};
				inputs.push(input);
				if (receipt.kind === "known" && rawResponse !== void 0) observations.push({
					sessionId: cut.sessionId,
					messageId: message.id,
					inputVersion,
					rawResponse,
					receiptAt: receipt.at
				});
				break;
			}
			case "step/end":
				claims = [];
				sealed = [];
				entered = false;
				claimWindow = true;
				claimTargets.clear();
				break;
			case "turn/end":
				claims = [];
				sealed = [];
				entered = false;
				claimWindow = false;
				turn = void 0;
		}
	}
	const bounded = inputs.slice(-20);
	const boundedAdmissions = admissions.slice(-20);
	const view = () => ({
		status: "available",
		cut,
		inputs: bounded,
		admissions: boundedAdmissions,
		omitted: inputs.length - bounded.length,
		omittedAdmissions: admissions.length - boundedAdmissions.length
	});
	while (Buffer.byteLength(JSON.stringify(view())) > 32768 && (bounded.length || boundedAdmissions.length)) if (bounded.length) bounded.shift();
	else boundedAdmissions.shift();
	return {
		...view(),
		observations
	};
}
//#endregion
//#region lib/types/transport.js
var __addDisposableResource = function(env, value, async) {
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
		if (inner) dispose = function() {
			try {
				inner.call(this);
			} catch (e) {
				return Promise.reject(e);
			}
		};
		env.stack.push({
			value,
			dispose,
			async
		});
	} else if (async) env.stack.push({ async: true });
	return value;
};
var __disposeResources = (function(SuppressedError) {
	return function(env) {
		function fail(e) {
			env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
			env.hasError = true;
		}
		var r, s = 0;
		function next() {
			while (r = env.stack.pop()) try {
				if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
				if (r.dispose) {
					var result = r.dispose.call(r.value);
					if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
						fail(e);
						return next();
					});
				} else s |= 1;
			} catch (e) {
				fail(e);
			}
			if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
			if (env.hasError) throw env.error;
		}
		return next();
	};
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
	var e = new Error(message);
	return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
/**
* Read official files with receipt observations obtained from the calling Agent's authorized Session service.
* @param exec - registered execution Agent and caller cancellation; missing source service leaves dates unknown.
* Receipt matching covers only the calling Session. Earlier-Session responses remain saved, but their dates stay unknown without separately authorized source observations.
* @returns shared validated facts and explicit native source availability, with no retained Session lease.
*/
async function readStudentWorkspace(exec) {
	exec.signal.throwIfAborted();
	if (!exec.agent) throw new Error("Student reads require a registered Agent.");
	const query = exec.agent.ctx.get("sessionQuery");
	let native = {
		status: "unavailable",
		inputs: [],
		admissions: [],
		observations: [],
		omitted: 0,
		omittedAdmissions: 0,
		reason: "Session source observation is unavailable."
	};
	if (query) {
		const env_1 = {
			stack: [],
			error: void 0,
			hasError: false
		};
		try {
			native = resolveNativeSources(__addDisposableResource(env_1, await query.observeSession(exec.agent.session.id, {
				signal: exec.signal,
				projectionMode: "none"
			}), false));
		} catch (e_1) {
			env_1.error = e_1;
			env_1.hasError = true;
		} finally {
			__disposeResources(env_1);
		}
	}
	exec.signal.throwIfAborted();
	const files = applicationStudyFiles(exec);
	const backups = await readBackups(files, exec.signal);
	const backupIssues = backups.issues.slice();
	const read = await readWorkspace(files, exec.signal, backupVersions(backups.backups), native.observations);
	if (read.status === "valid") {
		const retained = await retainObservedBackups(files, read, Date.now(), exec.signal);
		backupIssues.push(...retained.issues);
	}
	exec.signal.throwIfAborted();
	read.backupIssues = backupIssues.slice(0, 100);
	return {
		read,
		native,
		backupIssues: read.backupIssues
	};
}
//#endregion
export { readStudentWorkspace as t };
