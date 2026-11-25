import { t as applicationStudyFiles } from "./application-Dbnnwt11.js";
import { At as officialQuestionSchema, Dt as feedbackBindingSchema, Ft as openmaicQuestionSchema, J as canonical, Nt as officialRuntimePayloadSchema, Ot as feedbackCheckpointSchema, Pt as officialRuntimeRecordSchema, T as consumeOpenmaicFeedback, Tt as normalizeOpenmaicBase, l as readBackups, r as backupVersions, t as readWorkspace, u as retainObservedBackups, vt as readLessonFile } from "./read-WhSEc1TX.js";
import { z } from "zod";
import { constants, createHash, publicEncrypt } from "node:crypto";
import { KNOWN_SESSION_EVENT_TYPES, SessionId, pluginRecordOf } from "@deepseek-ai/dsh-session";
//#region lib/types/native-source.js
/** Exact consumed native input versions from one immutable Session observation. */
const learningScopeSchema = z.object({
	learnerId: z.string().min(1),
	termId: z.string().min(1),
	blockId: z.string().min(1),
	questionId: z.string().min(1),
	responseId: z.string().min(1).optional()
});
/** Log-only Host support; losing this record leaves ordinary native ownership unknown. */
const nativeOwnerCaptureSchema = z.object({
	sessionId: z.string().min(1),
	turn: z.number().int().nonnegative(),
	step: z.number().int().positive(),
	receiptSeq: z.number().int().nonnegative(),
	messageHash: z.string().regex(/^[a-f0-9]{64}$/u),
	scope: learningScopeSchema.omit({ responseId: true }),
	questionSnapshot: z.string().min(1).max(65536),
	versions: z.array(z.object({
		path: z.string(),
		targetKey: z.string(),
		version: z.string()
	})).length(2)
});
/**
* Fingerprint an immutable native input including its identity and attachments.
* @param message - Complete originally inserted or consumed message.
* @returns Stable hash for exact receipt and consumption matching.
*/
function nativeMessageHash(message) {
	return createHash("sha256").update(canonical(message)).digest("hex");
}
function learningScope(text) {
	const intention = /(?:^|\n)Student intention:\n([^\n]+)(?:\n|$)/u.exec(text)?.[1];
	if (!intention) return void 0;
	try {
		const scope = learningScopeSchema.safeParse(JSON.parse(intention));
		return scope.success ? {
			learnerId: scope.data.learnerId,
			termId: scope.data.termId,
			blockId: scope.data.blockId,
			questionId: scope.data.questionId,
			...scope.data.responseId ? { responseId: scope.data.responseId } : {}
		} : void 0;
	} catch {
		return;
	}
}
function panelAnswer(text, sessionId) {
	if (!text.startsWith("请加载 study 技能。在当前原生会话处理下面的意图，")) return void 0;
	if (Buffer.byteLength(text) > 32768) return "invalid";
	const lines = /^[^\n]+\nStudent intention:\n([^\n]+)\n([\s\S]*)$/u.exec(text);
	try {
		const intent = lines && z.object({
			...learningScopeSchema.shape,
			responseId: z.string().min(1),
			nativeSessionId: z.literal(sessionId),
			request: z.string(),
			operation: z.object({
				action: z.literal("answer"),
				taskId: z.string().min(1),
				response: z.string().min(1).max(2e3)
			}).passthrough()
		}).passthrough().safeParse(JSON.parse(lines[1]));
		if (!intent || !intent.success || intent.data.request !== lines[2] || intent.data.operation.taskId !== intent.data.questionId) return "invalid";
		const { learnerId, termId, blockId, questionId, responseId } = intent.data;
		return {
			rawResponse: intent.data.operation.response,
			scope: {
				learnerId,
				termId,
				blockId,
				questionId,
				responseId
			}
		};
	} catch {
		return "invalid";
	}
}
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
		const record = pluginRecordOf(event);
		if (record?.type === "plugin:student/native-owner" && event.seq >= observation.inheritedEventCount && claimWindow && !entered) {
			const parsed = nativeOwnerCaptureSchema.safeParse(record.data);
			if (parsed.success && parsed.data.sessionId === cut.sessionId && parsed.data.turn === turn) {
				const slot = claims.find((slot) => slot.receipt.kind === "known" && slot.receipt.seq === parsed.data.receiptSeq && nativeMessageHash(slot.message) === parsed.data.messageHash);
				if (slot && !slot.capture) slot.capture = parsed.data;
			}
		}
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
				for (const slot of sealed) if (slot.capture?.step !== event.data.step) delete slot.capture;
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
				const panel = panelAnswer(text, cut.sessionId);
				const rawResponse = panel === "invalid" ? void 0 : panel?.rawResponse ?? (text.length > 0 && text.length <= 2e3 ? text : void 0);
				const attachments = message.content.flatMap((block) => block.type === "image" || block.type === "file" ? [{
					kind: block.type,
					attachmentId: block.attachment.attachmentId
				}] : []);
				const explicitScope = panel && panel !== "invalid" ? panel.scope : rawResponse === void 0 ? void 0 : learningScope(rawResponse);
				const captured = panel === void 0 && !explicitScope && !/Student (?:intention|grading correction):/u.test(text) ? consumed?.capture : void 0;
				const originalScope = explicitScope ?? (captured ? {
					...captured.scope,
					responseId: `native_${inputVersion.slice(14)}`
				} : void 0);
				const input = {
					status: "consumed",
					messageId: message.id,
					inputVersion,
					consumedSeq: event.seq,
					...rawResponse === void 0 ? { textUnavailable: "Exact native text is empty or exceeds 2000 characters." } : { rawResponse },
					receipt,
					...originalScope ? { learningScope: originalScope } : {},
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
					receiptAt: receipt.at,
					...originalScope ? { learningScope: originalScope } : {},
					...captured ? { questionSnapshot: captured.questionSnapshot } : {}
				});
				if (receipt.kind === "known" && panel && panel !== "invalid" && text.length <= 2e3) observations.push({
					sessionId: cut.sessionId,
					messageId: message.id,
					inputVersion,
					rawResponse: text,
					receiptAt: receipt.at,
					learningScope: panel.scope
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
//#region lib/types/native-history.js
var __addDisposableResource$1 = function(env, value, async) {
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
var __disposeResources$1 = (function(SuppressedError) {
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
* Verify explicitly referenced original native inputs without activating any historical Agent.
* @param agent - Authorized calling main Agent and filesystem provider.
* @param read - Validated current/explicitly referenced archive entities.
* @param signal - Caller cancellation; a bounded deadline also applies to history reads.
* @param invocation - Current Remote context for prior-Session permission checks; native calls use their existing Agent ownership and omit it.
* @returns Referenced exact original tuples and explicit per-source failures; normal public decoding is provider-owned.
*/
async function readNativeHistory(agent, read, signal, invocation) {
	const workspace = read.workspace;
	const query = agent.ctx.get("sessionQuery"), fs = agent.ctx.get("fs");
	const observations = [], verification = [];
	const allows = async (id) => invocation ? await invocation.get("remoteAccess")?.allows({
		kind: "session",
		id
	}) ?? false : true;
	if (!workspace) return {
		observations,
		verification,
		recheck: async () => {}
	};
	const owners = [{
		workspace,
		references: void 0
	}, ...read.archiveSources ?? workspace.archivedEvidence ?? []];
	const needed = (owner, file, responseId) => {
		if (!owner.references) return true;
		const response = file.responses.find((response) => response.id === responseId);
		const question = (file.kind === "block" ? file.questions : file.items).find((question) => question.id === response?.questionId);
		return owner.references.some((reference) => reference.learnerId === file.learnerId && reference.termId === file.termId && (reference.ownerKind === file.kind && reference.ownerId === file.id && reference.responseId === responseId || reference.review && reference.review.mistakeId === question?.mistakeId && (question?.capability?.goalId ?? question?.objectiveId) === reference.goalId));
	};
	const references = owners.flatMap((owner) => [...owner.workspace.blocks, ...owner.workspace.worksheets].flatMap((file) => file.responses.flatMap((response) => response.source.kind === "native" && response.source.sessionId !== agent.session.id && needed(owner, file, response.id) ? [{
		file,
		response,
		source: response.source
	}] : [])));
	const corrections = owners.flatMap((owner) => owner.workspace.blocks.flatMap((file) => file.assessments.flatMap((assessment) => assessment.criterionCorrection && assessment.criterionCorrection.sessionId !== agent.session.id && needed(owner, file, assessment.responseId) ? [assessment.criterionCorrection] : [])));
	const ids = [.../* @__PURE__ */ new Set([...references.map((reference) => reference.source.sessionId), ...corrections.map((correction) => correction.sessionId)])];
	const deadline = AbortSignal.any([signal, AbortSignal.timeout(3e4)]);
	let physicalBytes = 0, replayBytes = 0;
	const currentRoot = agent.session.header.cwd && fs ? await fs.resolve(agent.session.header.cwd, { signal: deadline }) : void 0;
	for (const [index, rawId] of ids.entries()) {
		const unavailable = (reason) => verification.push({
			sessionId: rawId,
			status: "unavailable",
			reason
		});
		if (index >= 8) {
			unavailable("Historical source count exceeds eight explicitly referenced Sessions.");
			continue;
		}
		if (!query || !fs || !currentRoot) {
			unavailable("Original workspace or source service is unavailable.");
			continue;
		}
		const id = SessionId(rawId);
		try {
			const env_1 = {
				stack: [],
				error: void 0,
				hasError: false
			};
			try {
				if (!await allows(id)) {
					unavailable("Original Session access is unavailable.");
					continue;
				}
				const live = agent.ctx.get("sessions")?.get(id);
				const stored = !live ? await agent.ctx.get("sessionPersistence")?.stat(id, { signal: deadline }) : void 0;
				const header = live?.header ?? stored?.header;
				if (!header || header.id !== id || !header.cwd || header.parentSession || header.origin === "subagent") {
					unavailable("Original main Session header is unavailable.");
					continue;
				}
				if ((await fs.resolve(header.cwd, { signal: deadline })).targetKey !== currentRoot.targetKey) {
					unavailable("Original Session belongs to another workspace.");
					continue;
				}
				physicalBytes += stored?.sizeBytes ?? 0;
				if (physicalBytes > 33554432 || stored?.eventCount !== void 0 && stored.eventCount > 1e5) {
					unavailable("Original Session metadata exceeds the history read budget.");
					continue;
				}
				const observation = __addDisposableResource$1(env_1, await query.observeSession(id, {
					signal: deadline,
					projectionMode: "none"
				}), false);
				const finalRoot = observation.header.cwd ? await fs.resolve(observation.header.cwd, { signal: deadline }) : void 0;
				if (observation.header.id !== id || observation.header.parentSession || observation.header.origin === "subagent" || finalRoot?.targetKey !== currentRoot.targetKey || !await allows(id)) {
					unavailable("Original Session ownership or access changed during the read.");
					continue;
				}
				replayBytes += Buffer.byteLength(JSON.stringify(observation.events));
				if (replayBytes > 33554432) {
					unavailable("Aggregate original Session replay exceeds 32 MiB.");
					continue;
				}
				const native = resolveNativeSources(observation);
				if (native.status !== "available") {
					unavailable(native.reason ?? "Original Session replay is unavailable.");
					continue;
				}
				const selected = references.filter((reference) => reference.source.sessionId === rawId);
				observations.push(...native.observations.filter((item) => selected.some((reference) => reference.source.messageId === item.messageId && reference.source.inputVersion === item.inputVersion && reference.response.rawResponse === item.rawResponse && reference.file.learnerId !== void 0 && item.learningScope?.learnerId === reference.file.learnerId && item.learningScope.termId === reference.file.termId && reference.file.kind === "block" && item.learningScope.blockId === reference.file.id && item.learningScope.questionId === reference.response.questionId && item.learningScope.responseId === reference.response.id) || corrections.some((correction) => correction.sessionId === rawId && correction.messageId === item.messageId && correction.inputVersion === item.inputVersion && correction.rawResponse === item.rawResponse)));
				verification.push({
					sessionId: rawId,
					status: "available"
				});
			} catch (e_1) {
				env_1.error = e_1;
				env_1.hasError = true;
			} finally {
				__disposeResources$1(env_1);
			}
		} catch (error) {
			if (signal.aborted) throw error;
			unavailable(deadline.aborted ? "Original Session read deadline expired." : "Original Session could not be independently read.");
		}
	}
	return {
		observations,
		verification,
		async recheck() {
			for (const fact of verification.filter((fact) => fact.status === "available")) try {
				const id = SessionId(fact.sessionId);
				const allowed = await allows(id);
				const header = (agent.ctx.get("sessions")?.get(id))?.header ?? (await agent.ctx.get("sessionPersistence")?.stat(id, { signal }))?.header;
				const current = agent.session.header.cwd && fs ? await fs.resolve(agent.session.header.cwd, { signal }) : void 0;
				const original = header?.cwd && fs ? await fs.resolve(header.cwd, { signal }) : void 0;
				if (!allowed || header?.parentSession || header?.origin === "subagent" || current?.targetKey !== currentRoot?.targetKey || original?.targetKey !== currentRoot?.targetKey) throw new Error("Source authorization changed.");
			} catch (error) {
				if (signal.aborted) throw error;
				fact.status = "unavailable";
				fact.reason = "Original Session ownership or access changed before publication.";
				for (let index = observations.length - 1; index >= 0; index--) if (observations[index].sessionId === fact.sessionId) observations.splice(index, 1);
			}
		}
	};
}
//#endregion
//#region lib/types/openmaic/connection.js
/** Authorized official-service reads and recoverable generation; never writes learning records. */
const authSchema = z.object({
	token: z.string().min(1),
	accountId: z.string().min(1),
	learnerKey: z.string().min(1),
	expiresAt: z.number(),
	baseUrl: z.string(),
	accountBaseUrl: z.string()
});
const jsonObject = z.record(z.string(), z.unknown());
/** Credential failures expose only actionable codes, never server messages or secret payloads. */
var OpenmaicError = class extends Error {
	code;
	status;
	constructor(code, status) {
		super(`OpenMAIC ${code}. ${code === "login-required" || code === "login-challenge" ? "A parent can restore authorization using the official sign-in page or Host credential settings." : "Keep the current activity and retry its existing identity after checking the service."}`);
		this.code = code;
		this.status = status;
	}
};
/**
* Bound local waiting without reporting that the remote job was canceled.
* @param signal - Caller cancellation; its arbitrary reason is never exposed.
* @param timeoutMs - Total operation deadline in milliseconds.
* @param operation - Work receiving the combined cancellation signal.
* @returns The operation result, or a sanitized cancellation/deadline failure.
*/
async function boundedOpenmaicOperation(signal, timeoutMs, operation) {
	const timeout = new AbortController();
	const bounded = AbortSignal.any([signal, timeout.signal]);
	const failure = () => new OpenmaicError(signal.aborted ? "operation-canceled" : "operation-timeout");
	if (bounded.aborted) throw failure();
	const timer = setTimeout(() => timeout.abort(), timeoutMs);
	timer.unref();
	let onAbort = () => {};
	try {
		return await Promise.race([operation(bounded), new Promise((_resolve, reject) => {
			onAbort = () => reject(failure());
			bounded.addEventListener("abort", onAbort, { once: true });
			if (bounded.aborted) onAbort();
		})]);
	} catch (error) {
		if (bounded.aborted) throw failure();
		throw error;
	} finally {
		clearTimeout(timer);
		bounded.removeEventListener("abort", onAbort);
	}
}
/** Same-account login renewal is serialized and replacement follows learner verification. */
var OpenmaicConnection = class {
	config;
	store;
	network;
	/** Normalized official classroom origin used by tools and safe links. */
	baseUrl;
	/** Total local wait limit shared by authorization, generation and continuation. */
	operationTimeoutMs;
	accountBaseUrl;
	external;
	now;
	renewal;
	loaded;
	accessCookie = "";
	constructor(config, store, network = {}) {
		this.config = config;
		this.store = store;
		this.network = network;
		const base = normalizeOpenmaicBase(config.baseUrl);
		const account = normalizeOpenmaicBase(config.accountBaseUrl);
		if (!base || !account) throw new OpenmaicError("unsafe-origin");
		this.baseUrl = base;
		this.accountBaseUrl = account;
		this.external = network.fetch ?? fetch;
		this.now = network.now ?? Date.now;
		this.operationTimeoutMs = config.operationTimeoutMs ?? 12e4;
	}
	async wire(url, init, signal, consume) {
		return boundedOpenmaicOperation(signal, this.config.requestTimeoutMs ?? 3e4, async (signal) => {
			try {
				const origin = new URL(url).origin;
				for (let redirects = 0; redirects <= 5; redirects++) {
					const response = await this.external(url, {
						...init,
						signal,
						redirect: "manual"
					});
					if (![
						301,
						302,
						303,
						307,
						308
					].includes(response.status)) return await consume(response);
					const location = response.headers.get("location");
					await response.body?.cancel();
					let target;
					try {
						if (!location) throw new Error();
						target = new URL(location, url);
					} catch {
						throw new OpenmaicError("unsafe-origin");
					}
					if (!["http:", "https:"].includes(target.protocol) || target.origin !== origin || target.username || target.password || target.hash) throw new OpenmaicError("unsafe-origin");
					if (!["GET", "HEAD"].includes((init.method ?? "GET").toUpperCase()) || redirects === 5) throw new OpenmaicError("service-unavailable");
					url = target.href;
				}
				throw new OpenmaicError("service-unavailable");
			} catch (error) {
				if (signal.aborted || error instanceof OpenmaicError) throw error;
				throw new OpenmaicError("service-unavailable");
			}
		});
	}
	async body(response) {
		if (!response.ok) {
			await response.body?.cancel();
			throw new OpenmaicError(response.status === 401 ? "login-required" : response.status === 403 ? "permission-denied" : response.status === 404 ? "not-found" : "service-unavailable", response.status);
		}
		if (!response.body) throw new OpenmaicError("invalid-response");
		const reader = response.body.getReader();
		const chunks = [];
		let bytes = 0;
		try {
			for (;;) {
				const part = await reader.read();
				if (part.done) break;
				bytes += part.value.byteLength;
				if (bytes > 8388608) {
					await reader.cancel();
					throw new OpenmaicError("response-too-large");
				}
				chunks.push(part.value);
			}
			return JSON.parse(Buffer.concat(chunks, bytes).toString("utf8"));
		} catch (error) {
			if (error instanceof OpenmaicError) throw error;
			throw new OpenmaicError("invalid-response");
		} finally {
			reader.releaseLock();
		}
	}
	async account(path, input, signal) {
		const reply = jsonObject.safeParse(await this.wire(`${this.accountBaseUrl}/${path}`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(input)
		}, signal, (response) => this.body(response)));
		if (!reply.success) throw new OpenmaicError("invalid-response");
		const data = "content" in reply.data ? jsonObject.safeParse(reply.data.content) : reply;
		if (!data.success || data.data.is_success !== true) throw new OpenmaicError("login-challenge");
		return data.data.data;
	}
	async learner(token, signal) {
		const data = jsonObject.safeParse(await this.wire(`${this.baseUrl}/api/persistence/learner-key`, { headers: { cookie: `auth_token=${token}` } }, signal, (response) => this.body(response)));
		if (!data.success || typeof data.data.learnerKey !== "string" || !data.data.learnerKey.startsWith("user:")) throw new OpenmaicError("invalid-response");
		return data.data.learnerKey;
	}
	expires(token) {
		try {
			const exp = z.object({ exp: z.number() }).parse(JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString())).exp * 1e3;
			if (exp <= this.now()) throw new Error();
			return exp;
		} catch {
			throw new OpenmaicError("login-required");
		}
	}
	async renew(signal) {
		const account = await this.store.resolve(this.config.accountRef);
		const password = await this.store.resolve(this.config.passwordRef);
		if (!account || !password) throw new OpenmaicError("login-required");
		const key = z.string().safeParse(await this.account("user/get_public_key", {}, signal));
		if (!key.success) throw new OpenmaicError("invalid-response");
		const encrypt = this.network.encryptPassword ?? (async (plain, publicKey) => publicEncrypt({
			key: publicKey,
			padding: constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256"
		}, Buffer.from(plain)).toString("base64"));
		let encrypted;
		try {
			encrypted = await encrypt(password, key.data);
		} catch {
			throw new OpenmaicError("login-challenge");
		}
		let data = jsonObject.safeParse(await this.account("user/login", {
			account,
			password: encrypted,
			platform: "WEB",
			domain: new URL(this.baseUrl).hostname
		}, signal));
		if (!data.success) throw new OpenmaicError("invalid-response");
		if (typeof data.data.token !== "string") {
			const accounts = z.array(z.object({ account_user_id: z.string() })).safeParse(data.data.accounts);
			const selected = accounts.success ? accounts.data.filter((item) => !this.config.accountId || item.account_user_id === this.config.accountId) : [];
			if (selected.length !== 1 || typeof data.data.auth_token !== "string") throw new OpenmaicError("login-challenge");
			data = jsonObject.safeParse(await this.account("user/account/sign", {
				auth_token: data.data.auth_token,
				account_user_id: selected[0].account_user_id
			}, signal));
		}
		if (!data.success || typeof data.data.token !== "string" || typeof data.data.id !== "string") throw new OpenmaicError("invalid-response");
		const token = data.data.token;
		const learnerKey = await this.learner(token, signal);
		if (this.loaded && (this.loaded.accountId !== data.data.id || this.loaded.learnerKey !== learnerKey)) throw new OpenmaicError("identity-changed");
		if (this.config.accountId && this.config.accountId !== data.data.id) throw new OpenmaicError("identity-changed");
		const fresh = {
			token,
			accountId: data.data.id,
			learnerKey,
			expiresAt: this.expires(token),
			baseUrl: this.baseUrl,
			accountBaseUrl: this.accountBaseUrl
		};
		await this.store.save(fresh);
		this.loaded = fresh;
		return fresh;
	}
	async auth(signal, force = false) {
		if (this.renewal) return this.renewal;
		if (!this.loaded) {
			const saved = authSchema.safeParse(await this.store.load());
			if (saved.success && saved.data.baseUrl === this.baseUrl && saved.data.accountBaseUrl === this.accountBaseUrl) this.loaded = saved.data;
			else if (this.config.tokenRef) {
				const token = await this.store.resolve(this.config.tokenRef);
				if (token) try {
					const learnerKey = await this.learner(token, signal);
					this.loaded = {
						token,
						learnerKey,
						accountId: learnerKey.slice(5),
						expiresAt: this.expires(token),
						baseUrl: this.baseUrl,
						accountBaseUrl: this.accountBaseUrl
					};
				} catch (error) {
					if (!(error instanceof OpenmaicError) || error.code !== "login-required") throw error;
				}
			}
		}
		if (this.renewal) return this.renewal;
		if (!force && this.loaded && this.loaded.expiresAt - this.now() >= 864e5) return this.loaded;
		const renewal = this.renew(signal);
		this.renewal = renewal;
		try {
			return await renewal;
		} finally {
			if (this.renewal === renewal) this.renewal = void 0;
		}
	}
	/**
	* Read safe current account facts after renewal when less than 24 hours remain.
	* @param signal - Cancellation for authorized account operations.
	* @returns Verified account identity without secret values.
	*/
	async identity(signal) {
		return boundedOpenmaicOperation(signal, this.operationTimeoutMs, async (signal) => {
			const { token: _token, accountBaseUrl: _accountBase, ...identity } = await this.auth(signal);
			return identity;
		});
	}
	/**
	* Read authorized persistence JSON without login loops for permission or not-found refusals.
	* @param path - Same-origin persistence API path without a query or fragment.
	* @param signal - Cancellation for this source read.
	* @returns Original official source JSON without evaluating learning results.
	*/
	async read(path, signal) {
		let url;
		try {
			url = new URL(path, this.baseUrl);
		} catch {
			throw new OpenmaicError("unsafe-origin");
		}
		if (!path.startsWith("/api/persistence/") || !url.pathname.startsWith("/api/persistence/") || url.origin !== new URL(this.baseUrl).origin || url.search || url.hash) throw new OpenmaicError("unsafe-origin");
		return this.request(path, {}, signal);
	}
	/**
	* Request the same-origin service; safe reads retry a 401 once, submissions never replay.
	* @param path - Official service path or same-origin URL.
	* @param init - Non-secret request payload and options; Host adds authorization.
	* @param signal - Cancellation for this request and renewal.
	* @returns Official response JSON.
	*/
	async request(path, init, signal) {
		return boundedOpenmaicOperation(signal, this.operationTimeoutMs, (signal) => this.performRequest(path, init, signal));
	}
	async performRequest(path, init, signal) {
		let url;
		try {
			url = new URL(path, `${this.baseUrl}/`);
		} catch {
			throw new OpenmaicError("unsafe-origin");
		}
		if (!["http:", "https:"].includes(url.protocol) || url.origin !== new URL(this.baseUrl).origin || url.username || url.password || url.hash) throw new OpenmaicError("unsafe-origin");
		let auth = await this.auth(signal);
		const send = () => this.wire(url.href, {
			...init,
			headers: {
				...Object.fromEntries(new Headers(init.headers)),
				cookie: `auth_token=${auth.token}${this.accessCookie ? `; openmaic_access=${this.accessCookie}` : ""}`
			}
		}, signal, (response) => this.body(response));
		try {
			return await send();
		} catch (error) {
			if (!(error instanceof OpenmaicError) || error.status !== 401 || !["GET", "HEAD"].includes((init.method ?? "GET").toUpperCase())) throw error;
			auth = await this.auth(signal, true);
			return send();
		}
	}
	/**
	* Verify the separate generation access code without exposing its value to a tool.
	* @param signal - Cancellation for access verification.
	*/
	async prepareGeneration(signal) {
		return boundedOpenmaicOperation(signal, this.operationTimeoutMs, (signal) => this.verifyAccess(signal));
	}
	async verifyAccess(signal) {
		const code = this.config.accessCodeRef ? await this.store.resolve(this.config.accessCodeRef) : void 0;
		if (!code) return;
		const auth = await this.auth(signal);
		await this.wire(`${this.baseUrl}/api/access-code/verify`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie: `auth_token=${auth.token}`
			},
			body: JSON.stringify({ code })
		}, signal, async (response) => {
			const result = jsonObject.safeParse(await this.body(response));
			if (!result.success || result.data.success === false) throw new OpenmaicError("permission-denied");
			this.accessCookie = /(?:^|[;,\s])openmaic_access=([^;,\s]+)/u.exec(response.headers.get("set-cookie") ?? "")?.[1] ?? "";
		});
	}
	/**
	* Build an official browser sign-in recovery URL, separate from Host renewal.
	* @param classroomId - Original classroom identity to resume after sign-in.
	* @returns A safe parent-sign-in URL with no token.
	*/
	browserHandoff(classroomId) {
		const classroom = new URL(`/classroom/${encodeURIComponent(classroomId)}`, this.baseUrl);
		return {
			url: `${this.baseUrl}/api/auth/login?from=${encodeURIComponent(classroom.href)}`,
			automatic: false
		};
	}
};
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
const signature = (read) => JSON.stringify([[...read.files, ...read.archiveFiles ?? []].map(({ path, targetKey, version }) => ({
	path,
	targetKey,
	version
})), read.membership]);
/**
* Read original sources with independent workspace/Remote authorization and consume the same formal files.
* @param exec - Registered main execution Agent and caller cancellation.
* @param invocation - Current Remote context for original-history access checks; native tool calls use their Agent context.
* @param lessonId - Explicit classroom selection takes priority within the eight-source read budget.
* @returns Validated facts and explicit per-source availability; releases every Session lease and never writes academic records.
*/
async function readStudentWorkspace(exec, invocation, lessonId, planDay) {
	exec.signal.throwIfAborted();
	if (!exec.agent) throw new Error("Student reads require a registered Agent.");
	const agent = exec.agent;
	const query = agent.ctx.get("sessionQuery");
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
			native = resolveNativeSources(__addDisposableResource(env_1, await query.observeSession(agent.session.id, {
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
	const files = applicationStudyFiles(exec);
	const backups = await readBackups(files, exec.signal);
	const backupIssues = backups.issues.slice();
	let unstableSources = [];
	for (let attempt = 0; attempt < 3; attempt++) {
		const initial = await readWorkspace(files, exec.signal, backupVersions(backups.backups), native.observations, [], planDay ? { planDay } : {});
		const historical = await readNativeHistory(agent, initial, exec.signal, invocation);
		const openmaic = [], observations = [];
		const service = agent.ctx.get("studentOpenmaic");
		const lessons = await readLessonFile(files, exec.signal);
		const workspace = initial.workspace;
		const sourceLessons = /* @__PURE__ */ new Map();
		const currentBlock = workspace?.blocks.find((block) => block.endedAt === void 0);
		const requiredBindings = new Set((initial.archiveSources ?? []).flatMap((archive) => archive.workspace.blocks.flatMap((block) => block.responses.flatMap((response) => {
			const question = block.questions.find((question) => question.id === response.questionId);
			return response.source.kind === "openmaic" && archive.references.some((reference) => reference.learnerId === block.learnerId && reference.goalId === question?.capability?.goalId && (reference.ownerKind === "block" && reference.ownerId === block.id && reference.responseId === response.id || reference.review && reference.review.mistakeId === question.mistakeId)) ? [response.source.bindingId] : [];
		}))));
		const priority = (lesson) => lesson.id === lessonId ? 0 : lesson.termId === workspace?.settings.termId && lesson.blockId === currentBlock?.id ? 1 : lesson.feedback && requiredBindings.has(lesson.feedback.bindingId) ? 2 : 3;
		const sourceKey = (lesson) => canonical([
			lesson.base,
			lesson.classroomId,
			lesson.learnerKey
		]);
		const sourceOwner = (lesson) => canonical([
			lesson.learnerId,
			lesson.termId,
			lesson.blockId,
			lesson.feedback
		]);
		const unique = /* @__PURE__ */ new Map(), conflicts = /* @__PURE__ */ new Set();
		for (const lesson of [...lessons.status === "valid" ? lessons.file.lessons : [], ...(initial.archiveSources ?? []).flatMap((archive) => archive.lessons.status === "valid" ? archive.lessons.file.lessons.filter((lesson) => lesson.termId === archive.workspace.settings.termId) : [])].filter((lesson) => lesson.status === "ready").sort((a, b) => priority(a) - priority(b))) {
			const key = sourceKey(lesson), previous = unique.get(key);
			if (!previous) unique.set(key, lesson);
			else if (sourceOwner(previous) !== sourceOwner(lesson)) conflicts.add(key);
		}
		const ready = [...unique.values()];
		let sourceReads = 0;
		if (workspace) for (const lesson of ready) {
			const fact = {
				lessonId: lesson.id,
				...lesson.learnerId ? { learnerId: lesson.learnerId } : {},
				...lesson.termId ? { termId: lesson.termId } : {},
				...lesson.blockId ? { blockId: lesson.blockId } : {},
				status: "ownership-unresolved",
				omitted: 0,
				...lesson.feedback ? { bindingId: lesson.feedback.bindingId } : {}
			};
			openmaic.push(fact);
			sourceLessons.set(fact, lesson);
			const original = [workspace, ...(initial.archiveSources ?? []).map((archive) => archive.workspace)].find((owner) => lesson.learnerId === workspace.settings.learnerId && lesson.learnerId === owner.settings.learnerId && lesson.termId === owner.settings.termId && owner.blocks.some((block) => block.id === lesson.blockId && block.learnerId === lesson.learnerId));
			if (conflicts.has(sourceKey(lesson))) {
				fact.reason = "Resolve conflicting saved ownership for the same original classroom before importing records.";
				continue;
			}
			if (!lesson.feedback || !original || !lesson.learnerId || !lesson.termId || !lesson.blockId || !lesson.classroomId || !lesson.learnerKey) {
				fact.reason = "Confirm the original learner and classroom binding before importing records.";
				continue;
			}
			if (!service || !agent.session.header.cwd || sourceReads >= 8) {
				fact.status = "unavailable";
				if (sourceReads >= 8) {
					fact.failure = "read-limit";
					fact.omitted = 1;
				}
				fact.reason = sourceReads >= 8 ? "Official source reads exceed eight bound classrooms." : "Official source connection is unavailable.";
				continue;
			}
			sourceReads++;
			try {
				fact.source = await service.feedback(agent.session.header.cwd).read({
					learnerId: lesson.learnerId,
					termId: lesson.termId,
					blockId: lesson.blockId,
					classroomId: lesson.classroomId,
					base: lesson.base,
					learnerKey: lesson.learnerKey
				}, lesson.feedback, exec.signal);
				fact.status = "available";
				observations.push(...fact.source.observations);
			} catch (error) {
				if (exec.signal.aborted) throw error;
				fact.status = "unavailable";
				fact.failure = error instanceof OpenmaicError ? error.code : "invalid-response";
				fact.reason = error instanceof OpenmaicError ? error.message : "Original official source could not be read completely. Retry the same classroom.";
			}
		}
		let read = await readWorkspace(files, exec.signal, backupVersions(backups.backups), [...native.observations, ...historical.observations], observations, planDay ? { planDay } : {});
		const finalLessons = await readLessonFile(files, exec.signal);
		if (signature(initial) !== signature(read) || lessons.observation?.version !== finalLessons.observation?.version || lessons.observation?.targetKey !== finalLessons.observation?.targetKey) continue;
		if (read.status === "valid") {
			const retained = await retainObservedBackups(files, read, Date.now(), exec.signal);
			backupIssues.push(...retained.issues);
		}
		let sourceChanged = false;
		for (const fact of openmaic) if (fact.source) {
			const lesson = sourceLessons.get(fact);
			try {
				if (!await service.feedback(agent.session.header.cwd).verify({
					learnerId: lesson.learnerId,
					termId: lesson.termId,
					blockId: lesson.blockId,
					classroomId: lesson.classroomId,
					base: lesson.base,
					learnerKey: lesson.learnerKey
				}, lesson.feedback, exec.signal, fact.source.revision)) sourceChanged = true;
			} catch (error) {
				if (exec.signal.aborted) throw error;
				fact.status = "unavailable";
				fact.failure = error instanceof OpenmaicError ? error.code : "incomplete-read";
				fact.reason = "Original official source access changed before publication.";
				const bindingId = fact.bindingId;
				delete fact.source;
				for (let index = observations.length - 1; index >= 0; index--) if (observations[index].binding.bindingId === bindingId) observations.splice(index, 1);
			}
		}
		if (sourceChanged) {
			unstableSources = openmaic.map(({ source: _source, consumption: _consumption, ...fact }) => ({
				...fact,
				status: "unavailable",
				failure: "incomplete-read",
				reason: "Original official source changed during verification. Retry the same classroom."
			}));
			continue;
		}
		await historical.recheck();
		const publication = await readWorkspace(files, exec.signal, backupVersions(backups.backups), [...native.observations, ...historical.observations], observations, planDay ? { planDay } : {});
		const publicationLessons = await readLessonFile(files, exec.signal);
		if (signature(read) !== signature(publication) || finalLessons.observation?.version !== publicationLessons.observation?.version || finalLessons.observation?.targetKey !== publicationLessons.observation?.targetKey) continue;
		read = publication;
		if (invocation && !await invocation.get("remoteAccess")?.allows({
			kind: "session",
			id: agent.session.id
		})) throw new Error("Current Student Session access changed before publication.");
		if (read.workspace) {
			const owners = [read.workspace, ...(read.archiveSources ?? []).map((archive) => archive.workspace)];
			for (const owner of owners) {
				owner.nativeSources = [...native.observations, ...historical.observations];
				owner.openmaicSources = observations;
			}
			for (const fact of openmaic) if (fact.source) {
				const original = owners.find((owner) => owner.settings.termId === sourceLessons.get(fact)?.termId) ?? read.workspace;
				fact.consumption = consumeOpenmaicFeedback(original, fact.source);
			}
		}
		read.sourceVerification = {
			native: historical.verification,
			openmaic: openmaic.map(({ source, consumption, ...fact }) => ({
				...fact,
				...consumption ? {
					consumption: consumption.status,
					pendingCount: source.pending.length,
					conflictCount: consumption.conflicts.length
				} : {}
			}))
		};
		read.backupIssues = backupIssues.slice(0, 100);
		exec.signal.throwIfAborted();
		agent.ctx.get("studentNativeCapture")?.remember(agent, read);
		return {
			read,
			native,
			backupIssues: read.backupIssues,
			openmaic
		};
	}
	return {
		read: {
			status: "changing",
			files: [],
			membership: [],
			issues: [{
				path: ".study",
				field: "",
				rule: "changing-source-reference",
				correction: "Finish related file edits and independently read the original source again."
			}]
		},
		native,
		backupIssues,
		openmaic: unstableSources
	};
}
//#endregion
//#region lib/types/openmaic/feedback.js
/** Authorized original classroom records feed the shared reader; only the native agent writes academic files. */
const sourceId = z.string().min(1).max(500).refine((value) => value !== "." && value !== ".." && !/[\u0000-\u001f]/u.test(value));
const stamp = z.string().max(80).refine((value) => Number.isFinite(Date.parse(value)));
const sessionSchema = z.object({
	id: sourceId,
	runtimeDslVersion: z.literal("0.1.0"),
	kind: z.string(),
	stageId: sourceId,
	learnerKey: sourceId,
	status: z.enum([
		"active",
		"completed",
		"archived"
	]),
	createdAt: stamp,
	updatedAt: stamp
}).passthrough();
const recordSchema = officialRuntimeRecordSchema;
const payloadSchema = officialRuntimePayloadSchema;
const manifestSchema = z.object({
	rev: z.number().int().nonnegative(),
	scenes: z.array(z.object({
		id: sourceId,
		order: z.number().int(),
		rev: z.number().int().nonnegative()
	}).strict()).max(500)
}).strict();
const documentSchema = z.object({
	dslVersion: z.literal("0.3.0"),
	stage: z.object({ id: sourceId }).passthrough(),
	scenes: z.array(z.object({
		id: sourceId,
		stageId: sourceId,
		type: z.string(),
		content: z.unknown()
	}).passthrough()).max(500)
}).passthrough();
const captureSchema = z.object({
	binding: feedbackBindingSchema,
	stageId: sourceId,
	base: z.string(),
	learnerKey: sourceId,
	questions: z.array(openmaicQuestionSchema).max(200),
	heads: feedbackCheckpointSchema.shape.attempts
}).strict();
function parseSource(schema, value) {
	const parsed = schema.safeParse(value);
	if (parsed.success) return parsed.data;
	if (parsed.error.issues.some((issue) => issue.path.some((part) => [
		"runtimeDslVersion",
		"payloadVersion",
		"dslVersion"
	].includes(String(part))))) throw new OpenmaicError("unsupported-version");
	throw new OpenmaicError(parsed.error.issues.some((issue) => issue.code === "too_big") ? "read-limit" : "incomplete-read");
}
const digest = (value) => createHash("sha256").update(canonical(value)).digest("hex");
const part = (value) => encodeURIComponent(sourceId.parse(value));
/**
* Return stable Student entity identity for one source question or response.
* @param kind - Academic entity identity to derive.
* @param tuple - Full opaque original binding, attempt, scene and question tuple.
* @returns Filename-safe identity; records and grading do not change response identity.
*/
function openmaicEntityId(kind, tuple) {
	return `maic-${kind}-${digest(tuple).slice(0, 32)}`;
}
function fraction(value) {
	const text = value.trim().replaceAll("−", "-").replaceAll("﹣", "-").replaceAll("／", "/");
	if (!/^[+-]?\d{1,12}(?:\.\d{1,12}|\/[+-]?\d{1,12})?%?$/u.test(text)) return void 0;
	const percent = text.endsWith("%");
	const plain = percent ? text.slice(0, -1) : text;
	let numerator, denominator;
	if (plain.includes("/")) {
		const [a, b] = plain.split("/");
		numerator = BigInt(a);
		denominator = BigInt(b);
	} else {
		const [a, b = ""] = plain.split(".");
		numerator = BigInt(`${a}${b}`);
		denominator = 10n ** BigInt(b.length);
	}
	if (denominator === 0n) return void 0;
	return [numerator, denominator * (percent ? 100n : 1n)];
}
function equals(left, right) {
	const a = fraction(left), b = fraction(right);
	return !!a && !!b && a[0] * b[1] === b[0] * a[1];
}
/**
* Check a submitted choice against the frozen criterion and separately compare the official grade.
* @param snapshot - Original independently captured quiz question.
* @param answer - Exact submitted values.
* @param official - Current original official result when available.
* @returns Effective result and explicit agreement, numeric equivalence, unresolved conflict or pending criterion.
*/
function gradeOpenmaicAnswer(snapshot, answer, official) {
	const parsed = officialQuestionSchema.safeParse(snapshot);
	if (!parsed.success || parsed.data.type === "short_answer" || parsed.data.answer === void 0) return {
		result: "unassessed",
		grading: "pending"
	};
	const question = parsed.data;
	const values = (value) => typeof value === "string" ? [value] : value;
	const selected = values(answer);
	const expected = values(question.answer);
	const options = question.options ?? [];
	const option = (value, key) => {
		const byValue = options.filter((item) => item.value === value);
		if (byValue.length === 1) return byValue[0];
		const byLabel = key ? options.filter((item) => item.label === value) : [];
		return byLabel.length === 1 ? byLabel[0] : void 0;
	};
	if (!selected.length || !expected.length || new Set(selected).size !== selected.length || new Set(expected).size !== expected.length || question.type === "single" && (selected.length !== 1 || expected.length !== 1)) return {
		result: "unassessed",
		grading: "pending"
	};
	const resolved = expected.map((value) => option(value, true));
	const submitted = selected.map((value) => option(value, false));
	if (options.length && (resolved.some((item) => !item) || submitted.some((item) => !item))) return {
		result: "unassessed",
		grading: "pending"
	};
	const exact = selected.length === expected.length && selected.every((value) => resolved.some((item, index) => value === (item?.value ?? expected[index])));
	const remaining = resolved.map((item, index) => item?.label ?? expected[index]);
	const equivalent = selected.length === expected.length && submitted.every((item, index) => {
		const at = remaining.findIndex((label) => equals(item?.label ?? selected[index], label));
		if (at < 0) return false;
		remaining.splice(at, 1);
		return true;
	});
	const correct = exact || equivalent;
	if (!correct && (submitted.some((item) => !fraction(item?.label ?? "")) || resolved.some((item) => !fraction(item?.label ?? "")))) return {
		result: "unassessed",
		grading: "pending"
	};
	if (!official) return {
		result: correct ? "correct" : "incorrect",
		grading: "pending"
	};
	if (official.correct === null || official.status !== (official.correct ? "correct" : "incorrect") || official.correct && official.earned === 0 || !official.correct && official.earned !== 0 || official.earned > (question.points ?? 1)) return {
		result: "unassessed",
		grading: "conflict"
	};
	if (correct && !official.correct && equivalent && !exact) return {
		result: "correct",
		grading: "equivalent"
	};
	if (correct !== official.correct) return {
		result: "unassessed",
		grading: "conflict"
	};
	return {
		result: correct ? "correct" : "incorrect",
		grading: "aligned"
	};
}
/** Source reader reauthorizes every read; protected captures authenticate content without persisting grades. */
var OpenmaicFeedback = class {
	connection;
	captures;
	owns;
	constructor(connection, captures, owns) {
		this.connection = connection;
		this.captures = captures;
		this.owns = owns;
	}
	key(owner) {
		return digest([
			owner.base,
			owner.classroomId,
			owner.learnerKey
		]);
	}
	async authorize(owner, signal) {
		const identity = await this.connection.identity(signal);
		if (!owner.learnerId || !owner.termId || !owner.blockId || identity.baseUrl !== owner.base || identity.learnerKey !== owner.learnerKey || !await this.owns(owner, owner.classroomId, signal)) throw new OpenmaicError("identity-changed");
		if (z.object({ learnerKey: sourceId }).parse(await this.connection.read("/api/persistence/learner-key", signal)).learnerKey !== owner.learnerKey) throw new OpenmaicError("identity-changed");
	}
	async manifest(stage, signal) {
		try {
			return manifestSchema.parse(await this.connection.request(`/api/stages/${part(stage)}/manifest`, {}, signal));
		} catch (error) {
			if (error instanceof OpenmaicError && ["not-found", "permission-denied"].includes(error.code)) return void 0;
			throw error;
		}
	}
	async runtime(owner, signal) {
		const sessions = parseSource(z.array(sessionSchema).max(100), await this.connection.read(`/api/persistence/runtime/stages/${part(owner.classroomId)}/learners/${part(owner.learnerKey)}/sessions`, signal));
		if (new Set(sessions.map((item) => item.id)).size !== sessions.length || sessions.some((item) => item.stageId !== owner.classroomId || item.learnerKey !== owner.learnerKey)) throw new OpenmaicError("identity-changed");
		let bytes = Buffer.byteLength(JSON.stringify(sessions));
		const attempts = [];
		for (const listed of sessions.filter((item) => item.kind === "quizAttempt")) {
			const session = parseSource(sessionSchema, await this.connection.read(`/api/persistence/runtime/sessions/${part(listed.id)}`, signal));
			if (session.id !== listed.id || session.stageId !== owner.classroomId || session.learnerKey !== owner.learnerKey || session.kind !== "quizAttempt") throw new OpenmaicError("identity-changed");
			const records = parseSource(z.array(recordSchema).max(2e3), await this.connection.read(`/api/persistence/runtime/sessions/${part(session.id)}/records`, signal));
			bytes += Buffer.byteLength(JSON.stringify(records));
			if (bytes > 8388608) throw new OpenmaicError("read-limit");
			records.sort((a, b) => a.seq - b.seq);
			if (records.some((record, index) => record.seq !== index || record.sessionId !== session.id) || new Set(records.map((item) => item.id)).size !== records.length || canonical(session) !== canonical(listed)) throw new OpenmaicError("incomplete-read");
			attempts.push({
				id: session.id,
				records
			});
		}
		const final = parseSource(z.array(sessionSchema).max(100), await this.connection.read(`/api/persistence/runtime/stages/${part(owner.classroomId)}/learners/${part(owner.learnerKey)}/sessions`, signal));
		if (canonical([...sessions].sort((a, b) => a.id.localeCompare(b.id))) !== canonical(final.sort((a, b) => a.id.localeCompare(b.id)))) throw new OpenmaicError("incomplete-read");
		return attempts.sort((left, right) => left.id.localeCompare(right.id));
	}
	/**
	* Capture the original generated classroom before playback; an existing partition keeps its owner and capture.
	* @param owner - Independently validated original lesson and Student ownership.
	* @param target - Current capability/family/scope selected in formal learning files.
	* @param signal - Cancellation for source and protected capture admission.
	* @returns Exact source question snapshots and the binding for native agent authoring.
	*/
	async prepare(owner, target, signal) {
		return boundedOpenmaicOperation(signal, this.connection.operationTimeoutMs, async (signal) => {
			await this.authorize(owner, signal);
			const key = this.key(owner);
			const existing = await this.captures.load(key);
			if (existing !== void 0) return this.preparation(this.capture(existing, owner), target);
			let questions = [];
			const binding = feedbackBindingSchema.parse({
				...target,
				learnerId: owner.learnerId,
				termId: owner.termId,
				blockId: owner.blockId,
				bindingId: `maic-binding-${key.slice(0, 32)}`
			});
			for (let retry = 0; retry < 3; retry++) {
				const before = await this.manifest(owner.classroomId, signal);
				const document = parseSource(documentSchema, await this.connection.read(`/api/persistence/documents/${part(owner.classroomId)}`, signal));
				const after = await this.manifest(owner.classroomId, signal);
				if (canonical(before) !== canonical(after)) {
					if (retry === 2) throw new OpenmaicError("service-unavailable");
					continue;
				}
				if (document.stage.id !== owner.classroomId || document.scenes.some((scene) => scene.stageId !== owner.classroomId) || new Set(document.scenes.map((scene) => scene.id)).size !== document.scenes.length || before && canonical(before.scenes.map((scene) => scene.id).sort()) !== canonical(document.scenes.map((scene) => scene.id).sort())) throw new OpenmaicError("invalid-response");
				questions = document.scenes.flatMap((scene) => {
					if (scene.type !== "quiz") return [];
					const content = z.object({
						type: z.literal("quiz"),
						questions: z.array(officialQuestionSchema).max(200)
					}).passthrough().parse(scene.content);
					if (new Set(content.questions.map((question) => question.id)).size !== content.questions.length) throw new OpenmaicError("invalid-response");
					const rev = before?.scenes.find((item) => item.id === scene.id)?.rev;
					return content.questions.map((question) => openmaicQuestionSchema.parse({
						bindingId: binding.bindingId,
						sceneId: scene.id,
						questionId: question.id,
						snapshot: question,
						snapshotHash: digest(question),
						revision: before && rev !== void 0 ? {
							kind: "manifest",
							stageRev: before.rev,
							sceneRev: rev
						} : { kind: "unavailable" }
					}));
				});
				break;
			}
			if (questions.length > 200) throw new OpenmaicError("invalid-response");
			const attempts = await this.runtime(owner, signal);
			const capture = captureSchema.parse({
				binding,
				stageId: owner.classroomId,
				base: owner.base,
				learnerKey: owner.learnerKey,
				questions,
				heads: attempts.map((attempt) => ({
					attemptId: attempt.id,
					seq: attempt.records.at(-1)?.seq ?? -1
				}))
			});
			await this.authorize(owner, signal);
			return this.preparation(this.capture(await this.captures.claim(key, capture), owner), target);
		});
	}
	capture(raw, owner) {
		const capture = captureSchema.parse(raw);
		if (capture.base !== owner.base || capture.stageId !== owner.classroomId || capture.learnerKey !== owner.learnerKey || capture.binding.learnerId !== owner.learnerId || capture.binding.termId !== owner.termId || capture.binding.blockId !== owner.blockId) throw new OpenmaicError("identity-changed");
		return capture;
	}
	preparation(capture, target) {
		if (canonical({
			goalId: capture.binding.goalId,
			familyId: capture.binding.familyId,
			scope: capture.binding.scope
		}) !== canonical(target)) throw new OpenmaicError("identity-changed");
		return {
			binding: capture.binding,
			questions: capture.questions
		};
	}
	/**
	* Recheck original source authorization after downstream file reads.
	* @param owner - Original source partition and Student owner.
	* @param binding - Saved binding checked against protected capture metadata.
	* @param signal - Caller cancellation.
	* @param revision - Original read fingerprint; a changed source requires another complete file/source read.
	* @returns Whether source content still matches the independently observed cut.
	*/
	async verify(owner, binding, signal, revision) {
		return boundedOpenmaicOperation(signal, this.connection.operationTimeoutMs, async (signal) => {
			await this.authorize(owner, signal);
			if (canonical(this.capture(await this.captures.load(this.key(owner)), owner).binding) !== canonical(binding)) throw new OpenmaicError("identity-changed");
			return revision === void 0 || digest([await this.manifest(owner.classroomId, signal), await this.runtime(owner, signal)]) === revision;
		});
	}
	/**
	* Reread exact original partition/attempts and compare current revisions with its protected capture.
	* @param owner - Original authorized classroom ownership.
	* @param binding - Agent-authored declaration checked against the protected original binding.
	* @param signal - Cancellation for complete independent source reads.
	* @returns Source responses and grades with explicit historical/revision uncertainty; performs no academic writes.
	*/
	async read(owner, binding, signal) {
		return boundedOpenmaicOperation(signal, this.connection.operationTimeoutMs, async (signal) => {
			await this.authorize(owner, signal);
			const capture = this.capture(await this.captures.load(this.key(owner)), owner);
			if (canonical(capture.binding) !== canonical(binding)) throw new OpenmaicError("identity-changed");
			const before = await this.manifest(owner.classroomId, signal);
			const attempts = await this.runtime(owner, signal);
			const after = await this.manifest(owner.classroomId, signal);
			if (canonical(before) !== canonical(after)) throw new OpenmaicError("incomplete-read");
			const observations = [];
			const pending = /* @__PURE__ */ new Map();
			const sessionsByQuestion = /* @__PURE__ */ new Map();
			for (const attempt of attempts) for (const record of attempt.records) if (record.payload.phase !== "draft") for (const questionId of Object.keys(record.payload.answers)) {
				const key = canonical([record.sceneId, questionId]);
				const sessions = sessionsByQuestion.get(key) ?? /* @__PURE__ */ new Set();
				sessions.add(attempt.id);
				sessionsByQuestion.set(key, sessions);
			}
			let drafts = 0;
			for (const attempt of attempts) {
				const grouped = /* @__PURE__ */ new Map();
				for (const record of attempt.records) {
					const payload = payloadSchema.parse(record.payload);
					if (payload.phase === "draft") {
						drafts++;
						continue;
					}
					if (!record.sceneId) throw new OpenmaicError("invalid-response");
					if (payload.results && (new Set(payload.results.map((item) => item.questionId)).size !== payload.results.length || payload.results.some((item) => !Object.hasOwn(payload.answers, item.questionId)))) throw new OpenmaicError("invalid-response");
					for (const [questionId, answer] of Object.entries(payload.answers)) {
						const key = canonical([record.sceneId, questionId]);
						const row = grouped.get(key) ?? {
							conflict: false,
							history: [],
							records: []
						};
						row.records.push(record);
						if (payload.phase === "submitted" && row.submission) row.conflict = true;
						if (row.answer !== void 0 && canonical(row.answer) !== canonical(answer)) row.conflict = true;
						if (payload.phase === "submitted" && !row.submission) {
							row.submission = record;
							row.answer = answer;
						}
						if (payload.phase === "reviewed") {
							row.review = record;
							row.result = payload.results?.find((item) => item.questionId === questionId) ?? null;
							row.history.push({
								recordId: record.id,
								seq: record.seq,
								createdAt: record.createdAt,
								result: row.result
							});
							if (row.answer === void 0) row.answer = answer;
						}
						grouped.set(key, row);
					}
				}
				for (const [tuple, row] of grouped) {
					const [sceneId, questionId] = z.tuple([z.string(), z.string()]).parse(JSON.parse(tuple));
					const snapshot = capture.questions.find((item) => item.sceneId === sceneId && item.questionId === questionId);
					const association = (sessionsByQuestion.get(tuple)?.size ?? 0) > 1 ? "ambiguous-session" : row.conflict ? "conflicting-submissions" : !row.submission || row.history.some((review) => review.seq <= row.submission.seq) ? "missing-submission" : void 0;
					if (association) {
						for (const record of row.records) pending.set(canonical([record.sessionId, record.id]), {
							binding,
							record,
							reason: association
						});
						continue;
					}
					const original = row.submission;
					const question = snapshot ?? openmaicQuestionSchema.parse({
						bindingId: binding.bindingId,
						sceneId,
						questionId,
						snapshot: null,
						snapshotHash: digest(null),
						revision: { kind: "unavailable" }
					});
					const revision = question.revision;
					const known = !!row.submission && !!snapshot && !row.conflict && original.seq > (capture.heads.find((head) => head.attemptId === attempt.id)?.seq ?? -1) && revision.kind === "manifest" && before?.rev === revision.stageRev && before.scenes.find((scene) => scene.id === sceneId)?.rev === revision.sceneRev && canonical(before) === canonical(after);
					if (!known) for (const record of row.records) pending.set(canonical([record.sessionId, record.id]), {
						binding,
						record,
						reason: "unresolved-question"
					});
					const official = row.review ? {
						recordId: row.review.id,
						seq: row.review.seq,
						createdAt: row.review.createdAt,
						result: row.result ?? null
					} : void 0;
					const grade = gradeOpenmaicAnswer(question.snapshot, row.answer, official?.result);
					observations.push({
						binding,
						questionId: openmaicEntityId("q", [
							binding.bindingId,
							sceneId,
							questionId
						]),
						responseId: openmaicEntityId("r", [
							binding.bindingId,
							attempt.id,
							sceneId,
							questionId
						]),
						question,
						source: {
							kind: "openmaic",
							bindingId: binding.bindingId,
							attemptId: attempt.id,
							sceneId,
							questionId,
							submission: {
								id: original.id,
								seq: original.seq,
								createdAt: original.createdAt
							},
							submittedAnswer: row.answer
						},
						...official ? {
							official,
							officialHistory: row.history
						} : {},
						sourceStatus: known ? "known" : "unknown",
						...!known ? { reason: row.conflict ? "Attempt contains conflicting submitted answers." : !row.submission ? "Original submitted record is unavailable." : "Original question capture or content revision is unresolved." } : {},
						result: known ? grade.result : "unassessed",
						grading: known ? grade.grading : "pending"
					});
				}
			}
			for (const observation of observations) if (observations.some((other) => other.source.attemptId !== observation.source.attemptId && other.source.sceneId === observation.source.sceneId && other.source.questionId === observation.source.questionId && other.official)) observation.answerExposure = "possible";
			await this.authorize(owner, signal);
			if (observations.length > 500 || pending.size > 2e3) throw new OpenmaicError("read-limit");
			return {
				revision: digest([after, attempts]),
				observations,
				pending: [...pending.values()],
				drafts,
				omitted: 0,
				checkpoint: {
					bindingId: binding.bindingId,
					attempts: attempts.map((attempt) => ({
						attemptId: attempt.id,
						seq: attempt.records.at(-1)?.seq ?? -1
					})).sort((a, b) => a.attemptId.localeCompare(b.attemptId))
				}
			};
		});
	}
};
//#endregion
//#region lib/types/openmaic/generation.js
/** Durable generation transport identity is separate from agent-authored learning files. */
const id = z.string().min(1).max(200);
/** Generation and continuation input with stable Student activity ownership. */
const generationRequestSchema = z.object({
	learnerId: id,
	termId: id,
	blockId: id,
	jobId: id.optional(),
	requirement: z.string().trim().min(1).max(8e3).optional(),
	language: z.enum(["zh-CN", "en-US"]).optional(),
	enableWebSearch: z.boolean().optional(),
	enableImageGeneration: z.boolean().optional(),
	enableVideoGeneration: z.boolean().optional(),
	enableTTS: z.boolean().optional(),
	agentMode: z.enum(["default", "generate"]).optional()
}).strict();
const jobSchema = z.object({
	learnerId: id,
	termId: id,
	blockId: id,
	learnerKey: id,
	baseUrl: z.string(),
	requirementHash: z.string(),
	status: z.enum([
		"starting",
		"generating",
		"ready",
		"failed"
	]),
	jobId: id.optional(),
	pollUrl: z.string().optional(),
	classroomId: id.optional(),
	url: z.string().optional()
}).strict();
function object(value) {
	const parsed = z.record(z.string(), z.unknown()).safeParse(value);
	if (!parsed.success) throw new OpenmaicError("invalid-response");
	return parsed.data;
}
function pollingUrl(value, jobId, base) {
	let poll;
	try {
		poll = new URL(value, base);
	} catch {
		throw new OpenmaicError("unsafe-origin");
	}
	if (!["http:", "https:"].includes(poll.protocol) || poll.origin !== new URL(base).origin || poll.pathname !== `/api/generate-classroom/${encodeURIComponent(jobId)}` || poll.search || poll.hash || poll.username || poll.password) throw new OpenmaicError("unsafe-origin");
	return poll.href;
}
/** Submit once per activity; subsequent calls poll the durably retained official job. */
var OpenmaicGeneration = class {
	connection;
	jobs;
	running = /* @__PURE__ */ new Map();
	constructor(connection, jobs) {
		this.connection = connection;
		this.jobs = jobs;
	}
	/**
	* Return structured job identity promptly; a missing result never causes a new submission.
	* @param input - Stable Student ownership and initial requirement or original job identity.
	* @param signal - Cancel local waiting; an accepted job remains durable and is not canceled remotely.
	* @returns Safe generation state from the same durable official job.
	*/
	async run(input, signal) {
		const request = generationRequestSchema.parse(input);
		return boundedOpenmaicOperation(signal, this.connection.operationTimeoutMs, (signal) => this.resume(request, signal));
	}
	async resume(request, signal) {
		const key = JSON.stringify([
			request.learnerId,
			request.termId,
			request.blockId
		]);
		const existing = this.running.get(key);
		if (existing) return existing;
		const work = this.perform(request, signal);
		this.running.set(key, work);
		try {
			return await work;
		} finally {
			if (this.running.get(key) === work) this.running.delete(key);
		}
	}
	/**
	* Verify the protected original job without polling or creating another classroom.
	* @param owner - Explicit original Student learner, term and block.
	* @param classroomId - Saved official classroom identity.
	* @param signal - Cancellation for same-account verification.
	* @returns Whether the protected ready job owns this exact classroom.
	*/
	async verify(owner, classroomId, signal) {
		const identity = await this.connection.identity(signal);
		const job = jobSchema.safeParse(await this.jobs.load(owner));
		return job.success && job.data.status === "ready" && job.data.classroomId === classroomId && job.data.baseUrl === identity.baseUrl && job.data.learnerKey === identity.learnerKey && job.data.learnerId === owner.learnerId && job.data.termId === owner.termId && job.data.blockId === owner.blockId;
	}
	async perform(request, signal) {
		const identity = await this.connection.identity(signal);
		const saved = await this.jobs.load(request);
		let job;
		if (saved !== void 0) {
			const parsed = jobSchema.safeParse(saved);
			if (!parsed.success) throw new OpenmaicError("invalid-response");
			job = parsed.data;
			if (job.baseUrl !== identity.baseUrl || job.learnerKey !== identity.learnerKey || job.learnerId !== request.learnerId || job.termId !== request.termId || job.blockId !== request.blockId || request.jobId && request.jobId !== job.jobId) throw new OpenmaicError("identity-changed");
			if (request.requirement && createHash("sha256").update(request.requirement).digest("hex") !== job.requirementHash) throw new OpenmaicError("identity-changed");
			if (!job.jobId || !job.pollUrl) throw new OpenmaicError("generation-unknown");
			job.pollUrl = pollingUrl(job.pollUrl, job.jobId, identity.baseUrl);
		} else {
			if (request.jobId) throw new OpenmaicError("identity-changed");
			if (!request.requirement) throw new OpenmaicError("invalid-response");
			job = {
				learnerId: request.learnerId,
				termId: request.termId,
				blockId: request.blockId,
				learnerKey: identity.learnerKey,
				baseUrl: identity.baseUrl,
				requirementHash: createHash("sha256").update(request.requirement).digest("hex"),
				status: "starting"
			};
			await this.connection.prepareGeneration(signal);
			await this.jobs.save(request, job);
			const { learnerId: _learner, termId: _term, blockId: _block, jobId: _job, ...body } = request;
			const submitted = object(await this.connection.request("/api/generate-classroom", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			}, signal));
			if (typeof submitted.jobId !== "string" || !submitted.jobId || typeof submitted.pollUrl !== "string") throw new OpenmaicError("invalid-response");
			const poll = pollingUrl(submitted.pollUrl, submitted.jobId, identity.baseUrl);
			job = {
				...job,
				status: "generating",
				jobId: submitted.jobId,
				pollUrl: poll
			};
			await this.jobs.save(request, job);
			return this.result(job);
		}
		const response = object(await this.connection.request(job.pollUrl, {}, signal));
		if (response.jobId !== void 0 && response.jobId !== job.jobId) throw new OpenmaicError("identity-changed");
		if (response.status === "succeeded") {
			const result = object(response.result);
			if (typeof result.classroomId !== "string" || !result.classroomId) throw new OpenmaicError("invalid-response");
			const url = new URL(`/classroom/${encodeURIComponent(result.classroomId)}`, identity.baseUrl).href;
			job = {
				...job,
				status: "ready",
				classroomId: result.classroomId,
				url
			};
		} else if (response.status === "failed") job = {
			...job,
			status: "failed"
		};
		else if (![
			"queued",
			"running",
			"pending",
			"generating",
			"awaiting_outline_confirmation"
		].includes(String(response.status))) throw new OpenmaicError("invalid-response");
		await this.jobs.save(request, job);
		return this.result(job);
	}
	result(job) {
		if (!job.jobId || !job.pollUrl || job.status === "starting") throw new OpenmaicError("generation-unknown");
		return {
			status: job.status,
			jobId: job.jobId,
			pollUrl: job.pollUrl,
			base: job.baseUrl,
			learnerId: job.learnerId,
			termId: job.termId,
			blockId: job.blockId,
			learnerKey: job.learnerKey,
			...job.classroomId ? { classroomId: job.classroomId } : {},
			...job.url ? { url: job.url } : {},
			retryable: job.status === "generating"
		};
	}
};
//#endregion
export { openmaicEntityId as a, OpenmaicError as c, gradeOpenmaicAnswer as i, boundedOpenmaicOperation as l, generationRequestSchema as n, readStudentWorkspace as o, OpenmaicFeedback as r, OpenmaicConnection as s, OpenmaicGeneration as t, nativeMessageHash as u };
