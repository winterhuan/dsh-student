import { _ as applicationStudyFiles, a as projectWorkspace, i as queryWorkspace, n as queryDashboard, t as nextRefreshAfter, u as scheduleMistakes, v as StudyBackupRetention } from "./queries-BZMV7lLe.js";
import { c as readInteractiveLessons, ct as stateSchema, d as backupVersions, g as retainObservedBackups, h as readBackups, it as migrateStudyFile, v as readWorkspace } from "./openmaic-N9F1Z3na.js";
import { n as resolveNativeSources, t as readStudentWorkspace } from "./transport-BE1rMRq_.js";
import { n as saveManual, t as manualFields } from "./manual-BlusTzBQ.js";
import { z } from "zod";
import { createHash } from "node:crypto";
import { SessionId } from "@deepseek-ai/dsh-session";
import { FsError } from "@deepseek-ai/dsh-fs";
import { setTimeout } from "node:timers/promises";
import z$1 from "@deepseek-ai/schemastery";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/store.js
const MAX_BYTES = 8388608;
const stateCache = /* @__PURE__ */ new Map();
const entityCache = /* @__PURE__ */ new Map();
/**
* Read validated v2 files or preserved legacy v1 bytes in the calling Session's filesystem.
* Reads preserve absence and legacy bytes; current valid v2 observations can retain bounded backups.
* @param exec - calling agent and cancellation signal.
* @returns current projected state, or undefined before setup/after archive.
* @throws StudyDataUnavailable for invalid current v2 files.
*/
async function studyStore(exec) {
	const agent = exec.agent;
	if (!agent?.session.header.cwd) throw new Error("请先在 DSH 中打开学习工作区。");
	exec.signal.throwIfAborted();
	const fs = agent.ctx.get("fs");
	const policy = agent.ctx.get("sandboxPolicy");
	if (!fs || !policy) throw new Error("学生插件需要 DSH 文件系统和沙箱策略服务。");
	const cwd = agent.session.header.cwd;
	const files = applicationStudyFiles(exec);
	if (await files.stat(".study/settings.json", exec.signal)) {
		const backups = await readBackups(files, exec.signal);
		const read = await readWorkspace(files, exec.signal, backupVersions(backups.backups));
		if (read.status === "valid") await retainObservedBackups(files, read, Date.now(), exec.signal);
		if (read.status === "archived") return void 0;
		if (read.status !== "valid" || !read.workspace) throw new StudyDataUnavailable(read);
		const identity = read.files.find((file) => file.path === ".study/settings.json").targetKey;
		const signature = JSON.stringify(read.files.map((file) => [file.targetKey, file.version]));
		const cached = entityCache.get(identity);
		const now = Date.now();
		if (cached?.signature === signature && now >= cached.at && now < cached.refreshAfter) return cached.state;
		const state = projectWorkspace(read.workspace, now);
		if (entityCache.size >= 8) entityCache.clear();
		entityCache.set(identity, {
			signature,
			state,
			at: now,
			refreshAfter: nextRefreshAfter(state, now)
		});
		return state;
	}
	const root = await fs.resolve(cwd, { signal: exec.signal });
	const target = await fs.resolve(".study/state.json", {
		cwd,
		signal: exec.signal
	});
	if (!fs.contains(root, target)) throw new Error("学习档案必须位于当前工作区内。");
	const before = await fs.stat(target, exec.signal);
	let state;
	if (before) {
		if (before.type !== "file") throw new Error(".study/state.json 必须是普通文件。");
		const cached = stateCache.get(target.targetKey);
		if (cached && cached.version === before.version) state = cached.state;
		else {
			const bytes = await fs.readBytes(target, exec.signal, MAX_BYTES);
			const after = await fs.stat(target, exec.signal);
			if (after?.version !== before.version) throw new Error("学习档案已更新，请查询最新状态后重试。");
			const parsed = stateSchema.parse(migrateStudyFile(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes))));
			state = parsed.archivedAt !== void 0 ? void 0 : scheduleMistakes(parsed);
			if (state !== void 0) {
				if (stateCache.size >= 8) stateCache.clear();
				stateCache.set(target.targetKey, {
					version: after?.version ?? before.version,
					state
				});
			}
		}
	}
	return state;
}
/** Invalid current official files keep prior displays stale until an explicit repair is validated. */
var StudyDataUnavailable = class extends Error {
	read;
	constructor(read) {
		super(read.issues[0]?.correction ?? "Current Student files are unavailable.");
		this.read = read;
	}
};
//#endregion
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
