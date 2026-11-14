import { a as queryWorkspace, b as StudyReadCacheOwner, o as queryWorkspaceDashboard, r as queryJsonData, x as StudyBackupRetention, y as applicationStudyFiles } from "./queries-CN-V8nny.js";
import { c as readInteractiveLessons } from "./openmaic-DWNvScKi.js";
import { t as readStudentWorkspace } from "./transport-DTpeusx9.js";
import { n as saveManual, t as manualFields } from "./manual-BlM4nYyi.js";
import { createHash } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import z from "@deepseek-ai/schemastery";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
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
		static Config = z.object({
			refreshIntervalMs: z.number().step(1).min(1).max(2147483647).default(3e3),
			maxWireBytes: z.number().step(1).min(1024).default(1048576)
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
			const query = request.kind === "dashboard" ? queryWorkspaceDashboard(read, now, request.options, read.workspace ? await readInteractiveLessons(agent, signal, read.workspace.settings.openmaic?.baseUrl) : void 0) : queryWorkspace(read, request, now);
			const { observations: _observations, ...view } = native;
			const { data: _data, ...facts } = query;
			const result = {
				...facts,
				data: queryJsonData(query),
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
				baseline: manualFields(read, intent)
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
				current: result.current,
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
/** Host services mount independently from the optional browser client. */
const inject = [];
/** Validated Host refresh interval and serialized response cap. */
const Config = StudentRemote.Config;
/** Register Student reads, manual saves and backup retention for the Host lifetime. */
function apply(context, config) {
	context.plugin(StudyBackupRetention);
	context.plugin(StudyReadCacheOwner);
	context.plugin(StudentRemote, config);
}
//#endregion
export { Config, StudentRemote, apply, inject, name };
