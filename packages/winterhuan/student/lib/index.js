import { F as readInteractiveLessons, W as canonical, a as projectWorkspace, c as StudyBackupRetention, h as retainObservedBackups, i as queryWorkspace, m as readBackups, n as queryDashboard, o as readWorkspace, s as applicationStudyFiles, u as backupVersions } from "./queries-CqfPsje6.js";
import { t as studyStore } from "./store-B0nUiFNM.js";
import { n as saveManual, t as manualFields } from "./manual-D6200iES.js";
import { z } from "zod";
import { createHash } from "node:crypto";
import { FsError } from "@deepseek-ai/dsh-fs";
import { KNOWN_SESSION_EVENT_TYPES, SessionId } from "@deepseek-ai/dsh-session";
import { setTimeout } from "node:timers/promises";
import z$1 from "@deepseek-ai/schemastery";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/route.js
/** Browser requests must address the local DSH host and originate from the same authority. */
function trustedStudyRequest(request) {
	try {
		const host = request.headers.host;
		if (!host || request.headers["sec-fetch-site"] === "cross-site") return false;
		const url = new URL(`http://${host}`);
		if (url.host !== host || ![
			"localhost",
			"127.0.0.1",
			"[::1]"
		].includes(url.hostname)) return false;
		const origin = request.headers.origin;
		return origin === void 0 || typeof origin === "string" && new URL(origin).host === url.host;
	} catch {
		return false;
	}
}
function send(response, status, value) {
	response.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff"
	});
	response.end(JSON.stringify(value));
}
/** Read-only local browser projection retains same-authority and registered main-Session checks. */
async function handleStudyRequest(context, request, response) {
	const abort = new AbortController();
	const onClose = () => {
		if (!response.writableEnded) abort.abort();
	};
	response.on("close", onClose);
	try {
		if (!trustedStudyRequest(request)) {
			send(response, 403, { error: "请求来源不受信任" });
			return;
		}
		const url = new URL(request.url ?? "/", "http://localhost");
		if (url.pathname !== "/student/workspace" || request.method !== "GET") {
			send(response, 404, { error: "学习接口不存在" });
			return;
		}
		const rawId = url.searchParams.get("sessionId");
		if (!rawId || rawId.length > 200) {
			send(response, 400, { error: "请先打开学习会话" });
			return;
		}
		if (url.searchParams.has("revision")) z.coerce.number().int().nonnegative().parse(url.searchParams.get("revision"));
		const mistakeOffset = z.coerce.number().int().min(0).max(5e3).parse(url.searchParams.get("mistakeOffset") ?? "0");
		const subject = z.enum([
			"chinese",
			"math",
			"english"
		]).parse(url.searchParams.get("subject") ?? "math");
		const mistakeStatus = z.enum([
			"all",
			"due",
			"reviewing",
			"mastered"
		]).parse(url.searchParams.get("mistakeStatus") ?? "all");
		const mapGrade = url.searchParams.has("mapGrade") ? z.coerce.number().int().min(1).max(2).parse(url.searchParams.get("mapGrade")) : void 0;
		const mapTerm = url.searchParams.has("mapTerm") ? z.enum(["first", "second"]).parse(url.searchParams.get("mapTerm")) : void 0;
		const diagGrade = url.searchParams.has("diagGrade") ? z.coerce.number().int().min(1).max(2).parse(url.searchParams.get("diagGrade")) : void 0;
		const diagTerm = url.searchParams.has("diagTerm") ? z.enum(["first", "second"]).parse(url.searchParams.get("diagTerm")) : void 0;
		const diagUnit = url.searchParams.has("diagUnit") ? z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u).parse(url.searchParams.get("diagUnit")) : void 0;
		const tab = url.searchParams.has("tab") ? z.enum([
			"today",
			"map",
			"mistakes",
			"parent"
		]).parse(url.searchParams.get("tab")) : void 0;
		const agent = context.agents.get(SessionId(rawId));
		if (!agent || agent.session.id !== rawId || agent.session.header.parentSession || agent.session.header.origin === "subagent") {
			send(response, 404, { error: "请在主会话中打开学习工作区" });
			return;
		}
		const state = await studyStore({
			agent,
			signal: abort.signal
		});
		const interactiveLessons = await readInteractiveLessons(agent, abort.signal, state?.openmaic?.baseUrl);
		send(response, 200, {
			...queryDashboard(state, Date.now(), {
				subject,
				mistakeOffset,
				mistakeStatus,
				...tab !== void 0 ? { tab } : {},
				...mapGrade !== void 0 ? { mapGrade } : {},
				...mapTerm !== void 0 ? { mapTerm } : {},
				...diagGrade !== void 0 ? { diagGrade } : {},
				...diagTerm !== void 0 ? { diagTerm } : {},
				...diagUnit !== void 0 ? { diagUnit } : {}
			}),
			interactiveLessons
		});
	} catch (error) {
		send(response, error instanceof FsError && ["FS_STALE_VERSION", "FS_NOT_OBSERVED"].includes(error.code) ? 409 : 400, { error: error instanceof z.ZodError ? "请填写完整且有效的学习资料" : error instanceof Error ? error.message : "学习档案暂时无法读取" });
	} finally {
		response.off("close", onClose);
	}
}
/** Optional web integration leaves the same plugin usable in terminal sessions. */
function registerStudyRoute(context) {
	context.inject(["webServer", "agents"], (ctx) => {
		ctx.effect(() => ctx.webServer.register({
			kind: "prefix",
			path: "/student",
			handler: (request, response) => handleStudyRequest(ctx, request, response)
		}), "student: workspace API");
	});
}
//#endregion
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
	return {
		read,
		native,
		backupIssues
	};
}
//#endregion
//#region lib/types/remote-service.js
/** Student Remote methods retain native Session authorization and shared official-file ownership. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Host owner for the generated student Remote namespace. */
let StudentRemote = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _query_decorators;
	let _watch_decorators;
	let _manualContext_decorators;
	let _saveManual_decorators;
	let _inspectSubmission_decorators;
	return class StudentRemote extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_query_decorators = [Remote({ resources: { session: (sessionId) => sessionId } })];
			_watch_decorators = [Remote({
				mode: "stream",
				resources: { session: (sessionId) => sessionId }
			})];
			_manualContext_decorators = [Remote({ resources: { session: (sessionId) => sessionId } })];
			_saveManual_decorators = [Remote({ resources: { session: (sessionId) => sessionId } })];
			_inspectSubmission_decorators = [Remote({ resources: { session: (sessionId) => sessionId } })];
			__esDecorate(this, null, _query_decorators, {
				kind: "method",
				name: "query",
				static: false,
				private: false,
				access: {
					has: (obj) => "query" in obj,
					get: (obj) => obj.query
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _watch_decorators, {
				kind: "method",
				name: "watch",
				static: false,
				private: false,
				access: {
					has: (obj) => "watch" in obj,
					get: (obj) => obj.watch
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _manualContext_decorators, {
				kind: "method",
				name: "manualContext",
				static: false,
				private: false,
				access: {
					has: (obj) => "manualContext" in obj,
					get: (obj) => obj.manualContext
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _saveManual_decorators, {
				kind: "method",
				name: "saveManual",
				static: false,
				private: false,
				access: {
					has: (obj) => "saveManual" in obj,
					get: (obj) => obj.saveManual
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _inspectSubmission_decorators, {
				kind: "method",
				name: "inspectSubmission",
				static: false,
				private: false,
				access: {
					has: (obj) => "inspectSubmission" in obj,
					get: (obj) => obj.inspectSubmission
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		config = __runInitializers(this, _instanceExtraInitializers);
		static inject = [
			"typert",
			"sessionQuery",
			"agents"
		];
		static Config = z$1.object({
			refreshIntervalMs: z$1.number().step(1).min(1).max(2147483647).default(3e3),
			maxWireBytes: z$1.number().step(1).min(1024).default(1048576)
		});
		/**
		* @param ctx - Host services containing authorized native Agent lookups.
		* @param config - validated refresh interval and complete wire-response limit.
		*/
		constructor(ctx, config) {
			super(ctx, "student");
			this.config = config;
		}
		/**
		* Read a shared validated Student projection without activating an absent Agent.
		* @param sessionId - native Session identity resolved through the registered main Agent lookup.
		* @param request - shared projection selector; it never names a learning block as a Session.
		* @param signal - complete source and filesystem read cancellation.
		* @returns current projection, actual file versions, cut and explicit partial or unavailable status.
		*/
		async query(sessionId, request, signal) {
			const agent = await this.mainAgent(sessionId, signal);
			this.wire(request);
			const { read, native, backupIssues } = await readStudentWorkspace({
				agent,
				signal
			});
			const now = Date.now();
			const query = request.kind === "dashboard" ? {
				status: read.status,
				versions: this.readFacts(read).versions,
				issues: read.issues,
				...read.status === "valid" && read.workspace ? { data: queryDashboard(projectWorkspace(read.workspace, now), now, request.options, await readInteractiveLessons(agent, signal, read.workspace.settings.openmaic?.baseUrl)) } : {}
			} : queryWorkspace(read, request, now);
			const { observations: _observations, ...view } = native;
			const { data, ...facts } = query;
			const result = {
				...facts,
				data: data === void 0 ? null : z.json().parse(JSON.parse(JSON.stringify(data))),
				readAt: now,
				refreshAfter: query.refreshAfter ?? now + this.config.refreshIntervalMs,
				token: createHash("sha256").update(JSON.stringify([
					query,
					view,
					backupIssues
				])).digest("hex"),
				native: view,
				backupIssues
			};
			signal.throwIfAborted();
			return this.wire(result);
		}
		/**
		* Follow current files and time thresholds; unchanged version/cut/projection tokens produce no frame.
		* @param sessionId - registered main native Session identity, authorized before the stream opens.
		* @param request - shared bounded projection selector.
		* @param signal - cancellation stops reads and the owned refresh timer.
		* @returns an initial snapshot and later changes or recoverable read-failure frames.
		*/
		async *watch(sessionId, request, signal) {
			await this.mainAgent(sessionId, signal);
			let token;
			while (!signal.aborted) {
				let delay = this.config.refreshIntervalMs;
				try {
					const value = await this.query(sessionId, request, signal);
					if (value.token !== token) {
						yield this.wire({
							kind: "snapshot",
							value
						});
						token = value.token;
					}
					delay = Math.max(1, Math.min(delay, value.refreshAfter - Date.now()));
				} catch (error) {
					if (signal.aborted) return;
					token = void 0;
					yield this.wire({
						kind: "failure",
						message: (error instanceof Error ? error.message : "Student data could not be read.").slice(0, 200)
					});
				}
				try {
					await setTimeout(delay, void 0, { signal });
				} catch (error) {
					if (signal.aborted) return;
					throw error;
				}
			}
		}
		/**
		* Capture the shared owner's edited-field values from one actual read.
		* @param sessionId - registered main native Session identity.
		* @param intent - typed manual operation; setup must identify editedProfileFields.
		* @param signal - cancellation for source and official-file reads.
		* @returns exact current term identity, observed versions, draft baseline and read issues.
		*/
		async manualContext(sessionId, intent, signal) {
			const agent = await this.mainAgent(sessionId, signal);
			this.wire(intent);
			const { read } = await readStudentWorkspace({
				agent,
				signal
			});
			return this.wire({
				...this.readFacts(read),
				baseline: z.record(z.string(), z.json()).parse(JSON.parse(JSON.stringify(manualFields(read, intent))))
			});
		}
		/**
		* Save an explicit manual draft through the shared guarded filesystem owner.
		* @param sessionId - registered main native Session identity.
		* @param request - actual observed term, file versions, edited fields and retained baseline.
		* @param signal - cancellation passed through the application save.
		* @returns thin save outcome, current edited values and versions for subsequent draft saves.
		*/
		async saveManual(sessionId, request, signal) {
			const agent = await this.mainAgent(sessionId, signal);
			this.wire(request);
			const result = await saveManual(applicationStudyFiles({
				agent,
				signal
			}), request, Date.now(), signal);
			signal.throwIfAborted();
			return this.wire({
				...this.readFacts(result.read),
				status: result.status,
				current: z.record(z.string(), z.json()).parse(JSON.parse(JSON.stringify(result.current))),
				...result.reason === void 0 ? {} : { reason: result.reason }
			});
		}
		/**
		* Inspect an uncertain submission before deliberate recovery; this method never submits input.
		* @param sessionId - registered main native Session identity.
		* @param request - original native request and optional term/owner/response identity.
		* @param signal - cancellation for the independent Session and file reads.
		* @returns admission, saved-answer and valid-assessment facts separately; omitted admission remains unknown.
		*/
		async inspectSubmission(sessionId, request, signal) {
			const agent = await this.mainAgent(sessionId, signal);
			this.wire(request);
			const { read, native } = await readStudentWorkspace({
				agent,
				signal
			});
			const nativeStates = native.admissions.filter((row) => row.requestId === request.requestId).map((row) => row.status);
			const result = {
				requestId: request.requestId,
				admission: nativeStates.length ? "accepted" : "unknown",
				nativeStates,
				nativeSourceStatus: native.status,
				...native.cut ? { cut: native.cut } : {},
				answer: "not-requested",
				assessment: "not-requested",
				...this.readFacts(read)
			};
			if (request.response) {
				const { owner, responseId, termId } = request.response;
				const path = `.study/${owner.kind === "block" ? "blocks" : "worksheets"}/${owner.id}.json`;
				if (!read.workspace || read.workspace.settings.termId !== termId || read.issues.some((issue) => issue.path === path || issue.path === ".study/settings.json")) {
					result.answer = "unavailable";
					result.assessment = "unavailable";
				} else {
					const entity = owner.kind === "block" ? read.workspace.blocks.find((row) => row.id === owner.id) : read.workspace.worksheets.find((row) => row.id === owner.id);
					result.answer = entity?.responses.some((row) => row.id === responseId) ? "saved" : "missing";
					result.assessment = result.answer === "saved" && entity?.assessments.some((row) => row.responseId === responseId) ? "valid" : "pending";
				}
			}
			return this.wire(result);
		}
		wire(value) {
			if (Buffer.byteLength(JSON.stringify(value)) > this.config.maxWireBytes) throw new RemoteError("gateway/bad-request", "Student JSON exceeds the configured limit; request fewer fields or a smaller projection.", {});
			return value;
		}
		readFacts(read) {
			return {
				readStatus: read.status,
				...read.workspace ? { termId: read.workspace.settings.termId } : {},
				versions: read.files.map(({ path, targetKey, version }) => ({
					path,
					targetKey,
					version
				})),
				issues: read.issues
			};
		}
		async mainAgent(sessionId, signal) {
			signal.throwIfAborted();
			const agent = this.ctx.agents.get(sessionId);
			if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === "subagent") throw new RemoteError("student/main-session-required", "Open the Student workspace in a registered main Session.", {});
			return agent;
		}
	};
})();
//#endregion
//#region lib/types/index.js
/** Independent student plugin identity. */
const name = "student";
/** The workspace route mounts when its Host services become available. */
const inject = [];
/** Validated Host refresh interval and serialized response cap. */
const Config = StudentRemote.Config;
/** Register the learning workspace API for the Host lifetime. */
function apply(context, config) {
	registerStudyRoute(context);
	context.plugin(StudyBackupRetention);
	context.plugin(StudentRemote, config);
}
//#endregion
export { Config, StudentRemote, apply, inject, name, readStudentWorkspace, resolveNativeSources };
