import { t as applicationStudyFiles } from "./application-BqngjvBs.js";
import { Vt as validateCourseWorkspace, t as readWorkspace, vt as readLessonFile } from "./read-BpRrocGx.js";
import { a as courseReviewInput, c as OpenmaicFeedback, d as readStudentWorkspace, f as OpenmaicConnection, o as reviewQuestionsCurrent, p as OpenmaicError, r as CourseReviewer, t as OpenmaicGeneration } from "./generation-CWbd-geH.js";
import { chmod, lstat, mkdir } from "node:fs/promises";
import { z } from "zod";
import { Service } from "@deepseek-ai/cordis";
import { createHash } from "node:crypto";
import { credentialKey, credentialRef } from "@deepseek-ai/dsh-credentials";
import z$1 from "@deepseek-ai/schemastery";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/openmaic/browser.js
/** Dedicated Chrome uses official sign-in; no cookie injection or token-bearing Student link. */
/** Owns its private browser profile and closes its browser at Host disposal. */
var OpenmaicBrowser = class {
	account;
	config;
	runtime;
	context;
	pages = /* @__PURE__ */ new Map();
	serial = Promise.resolve();
	disposed = false;
	lifetime = new AbortController();
	constructor(account, config, runtime = {}) {
		this.account = account;
		this.config = config;
		this.runtime = runtime;
	}
	/**
	* Open the original classroom, renewing its browser login inside 24 hours of expiry.
	* @param classroomId - Original official classroom identity.
	* @param signal - Cancellation for this opening operation.
	* @returns Safe playback or parent-sign-in outcome.
	*/
	open(classroomId, signal) {
		const deadline = AbortSignal.any([
			signal,
			this.lifetime.signal,
			AbortSignal.timeout(3e4)
		]);
		const work = this.serial.then(() => this.perform(classroomId, deadline));
		this.serial = work.catch((_error) => {});
		return work;
	}
	async browser(identity) {
		if (this.disposed) throw new OpenmaicError("browser-unavailable");
		if (this.context) return this.context;
		const root = resolve(this.config.profileRoot);
		await mkdir(root, {
			recursive: true,
			mode: 448
		});
		const info = await lstat(root);
		if (!info.isDirectory() || info.isSymbolicLink()) throw new OpenmaicError("browser-unavailable");
		if (process.platform !== "win32") await chmod(root, 448);
		const profile = join(root, createHash("sha256").update(JSON.stringify([
			identity.baseUrl,
			identity.accountId,
			identity.learnerKey
		])).digest("hex"));
		await mkdir(profile, {
			recursive: true,
			mode: 448
		});
		const profileInfo = await lstat(profile);
		if (!profileInfo.isDirectory() || profileInfo.isSymbolicLink()) throw new OpenmaicError("browser-unavailable");
		if (process.platform !== "win32") await chmod(profile, 448);
		const context = await (this.runtime.launch ?? ((path, options) => chromium.launchPersistentContext(path, options)))(profile, {
			env: Object.fromEntries(Object.entries(process.env).filter(([name, value]) => value !== void 0 && !/KEY|SECRET|TOKEN|PASSWORD/iu.test(name))),
			channel: "chrome",
			headless: false,
			viewport: null,
			acceptDownloads: false,
			timeout: 3e4
		});
		if (this.disposed) {
			await context.close();
			throw new OpenmaicError("browser-unavailable");
		}
		context.on("close", () => {
			if (this.context === context) {
				this.context = void 0;
				this.pages.clear();
			}
		});
		this.context = context;
		return context;
	}
	async learner(page) {
		return await page.evaluate(async () => {
			const response = await fetch("/api/persistence/learner-key", {
				credentials: "same-origin",
				signal: AbortSignal.timeout(3e4)
			});
			if (!response.ok) return void 0;
			const value = await response.json();
			return typeof value === "object" && value !== null && "learnerKey" in value && typeof value.learnerKey === "string" ? value.learnerKey : void 0;
		});
	}
	async perform(classroomId, signal) {
		signal.throwIfAborted();
		if (!/^[a-zA-Z0-9_-]{1,200}$/u.test(classroomId)) throw new OpenmaicError("invalid-response");
		const identity = await this.account.identity(signal);
		const classroomUrl = new URL(`/classroom/${classroomId}`, identity.baseUrl).href;
		const loginUrl = `${identity.baseUrl}/api/auth/login?from=${encodeURIComponent(classroomUrl)}`;
		let page;
		try {
			const browser = await this.browser(identity);
			page = this.pages.get(classroomId);
			if (!page || page.isClosed()) {
				page = await browser.newPage();
				this.pages.set(classroomId, page);
			}
			const target = page;
			const aborted = () => {
				target.close().catch((_error) => {});
			};
			signal.addEventListener("abort", aborted, { once: true });
			try {
				await page.goto(classroomUrl, {
					waitUntil: "domcontentloaded",
					timeout: 3e4
				});
				signal.throwIfAborted();
				const learner = await this.learner(page);
				signal.throwIfAborted();
				if (learner?.startsWith("user:") && learner !== identity.learnerKey) return {
					status: "identity-mismatch",
					browser: "dedicated-chrome",
					classroomUrl
				};
				const cookie = (await browser.cookies(identity.baseUrl)).find((item) => item.name === "auth_token");
				let expiresAt = 0;
				try {
					const payload = JSON.parse(Buffer.from(cookie?.value.split(".")[1] ?? "", "base64url").toString());
					if (typeof payload === "object" && payload !== null && "exp" in payload && typeof payload.exp === "number") expiresAt = payload.exp * 1e3;
				} catch (_error) {}
				if (learner === identity.learnerKey && expiresAt - (this.runtime.now ?? Date.now)() >= 864e5) {
					await page.bringToFront();
					return {
						status: "opened",
						browser: "dedicated-chrome",
						classroomUrl
					};
				}
				await page.goto(loginUrl, {
					waitUntil: "domcontentloaded",
					timeout: 3e4
				});
				const accountOrigin = new URL(page.url()).origin;
				if (accountOrigin !== "https://maic.chat" && accountOrigin !== new URL(identity.baseUrl).origin) throw new OpenmaicError("unsafe-origin");
				const credentials = await this.config.credentials();
				if (!credentials) return {
					status: "login-required",
					browser: "dedicated-chrome",
					classroomUrl,
					loginUrl,
					reason: "credentials-missing"
				};
				try {
					await page.locator("[role=tab], input[type=\"password\"]").first().waitFor({
						state: "visible",
						timeout: 3e4
					});
				} catch (_error) {
					return {
						status: "login-required",
						browser: "dedicated-chrome",
						classroomUrl,
						loginUrl,
						reason: "form-unavailable"
					};
				}
				const password = page.locator("input[type=\"password\"]").first();
				if (!await password.isVisible()) {
					const switcher = page.getByRole("tab", {
						name: "账号密码登录",
						exact: true
					});
					if (await switcher.isVisible()) await switcher.click();
				}
				try {
					await password.waitFor({
						state: "visible",
						timeout: 3e4
					});
				} catch (_error) {
					return {
						status: "login-required",
						browser: "dedicated-chrome",
						classroomUrl,
						loginUrl,
						reason: "form-unavailable"
					};
				}
				signal.throwIfAborted();
				await page.locator("input[placeholder=\"账号、手机号或邮箱\"]").fill(credentials.account);
				await password.fill(credentials.password);
				const agreement = page.locator("input[type=\"checkbox\"]").first();
				if (await agreement.isVisible() && !await agreement.isChecked()) await agreement.check();
				await page.getByRole("button", {
					name: "立即登录",
					exact: true
				}).click();
				try {
					await page.waitForURL((url) => url.origin === new URL(identity.baseUrl).origin && url.pathname === `/classroom/${classroomId}` && !url.searchParams.has("token"), {
						timeout: 3e4,
						waitUntil: "domcontentloaded"
					});
				} catch (_error) {
					return {
						status: "login-required",
						browser: "dedicated-chrome",
						classroomUrl,
						loginUrl,
						reason: "callback-pending"
					};
				}
				signal.throwIfAborted();
				const confirmed = await this.learner(page);
				signal.throwIfAborted();
				await page.bringToFront();
				return {
					status: confirmed === identity.learnerKey ? "opened" : confirmed?.startsWith("user:") ? "identity-mismatch" : "login-required",
					browser: "dedicated-chrome",
					classroomUrl,
					...confirmed === identity.learnerKey ? {} : { loginUrl }
				};
			} finally {
				signal.removeEventListener("abort", aborted);
			}
		} catch (error) {
			if (signal.aborted) {
				if (page && !page.isClosed()) await page.close();
				signal.throwIfAborted();
			}
			if (error instanceof OpenmaicError) throw error;
			throw new OpenmaicError("browser-unavailable");
		}
	}
	/** Cancel queued and active operations, close owned Chrome, then await quiescence. */
	async dispose() {
		this.disposed = true;
		this.lifetime.abort(new OpenmaicError("browser-unavailable"));
		await this.context?.close();
		await this.serial;
		this.context = void 0;
		this.pages.clear();
	}
};
//#endregion
//#region lib/types/openmaic/service.js
/** Host OpenMAIC connection reuses DSH's protected credential provider. */
/** Host defaults for the official service, credential references and private browser root. */
const openmaicConfig = z$1.object({
	requestTimeoutMs: z$1.number().step(1).min(1).max(2147483647).default(3e4),
	operationTimeoutMs: z$1.number().step(1).min(1).max(2147483647).default(12e4),
	browserProfileRoot: z$1.string().default(""),
	baseUrl: z$1.string().default("https://open.maic.chat"),
	accountBaseUrl: z$1.string().default("https://maic.chat/api"),
	accountRef: z$1.string().default("OPEN_MAIC_USER"),
	passwordRef: z$1.string().default("OPEN_MAIC_PASSWORD"),
	accessCodeRef: z$1.string().default("OPEN_MAIC_ACCESS_CODE"),
	tokenRef: z$1.string().default("OPENMAIC_AUTH_TOKEN"),
	accountId: z$1.string().default("")
});
/** Installed once at Host scope, shared by every Student agent. */
var StudentOpenmaic = class extends Service {
	static inject = ["credentials"];
	static Config = openmaicConfig;
	/** Verified account transport shared across Student conversations. */
	connection;
	/** Dedicated Chrome profile and process owned by this service. */
	browser;
	/** Protected content review receipts; academic quality remains agent-authored. */
	reviewer;
	feedbackReaders = /* @__PURE__ */ new Map();
	generations = /* @__PURE__ */ new Map();
	constructor(ctx, config) {
		super(ctx, "studentOpenmaic");
		for (const ref of [
			config.accountRef,
			config.passwordRef,
			config.accessCodeRef,
			config.tokenRef
		]) if (ref) credentialRef(ref);
		const authKey = credentialKey("student-openmaic", `account-${createHash("sha256").update(JSON.stringify([
			config.baseUrl,
			config.accountBaseUrl,
			config.accountRef,
			config.accountId
		])).digest("hex")}`);
		this.connection = new OpenmaicConnection(config, {
			async resolve(ref) {
				return ref ? (await ctx.credentials.resolve(credentialRef(ref)))?.value : void 0;
			},
			async load() {
				const record = await ctx.credentials.readRecord(authKey);
				return record?.kind === "grant" ? record.payload : void 0;
			},
			async save(payload) {
				await ctx.credentials.modifyRecord(authKey, async () => ({
					kind: "grant",
					payload
				}));
			}
		});
		this.browser = new OpenmaicBrowser(this.connection, {
			profileRoot: config.browserProfileRoot || join(process.env.DSH_HOME || join(homedir(), ".dsh"), "student-openmaic-browser"),
			async credentials() {
				const account = await ctx.credentials.resolve(credentialRef(config.accountRef));
				const password = await ctx.credentials.resolve(credentialRef(config.passwordRef));
				return account && password ? {
					account: account.value,
					password: password.value
				} : void 0;
			}
		});
		this.reviewer = new CourseReviewer({
			load: async (id) => {
				const record = await ctx.credentials.readRecord(credentialKey("student-openmaic", `review-${id}`));
				return record?.kind === "grant" ? record.payload : void 0;
			},
			save: async (id, payload) => {
				await ctx.credentials.modifyRecord(credentialKey("student-openmaic", `review-${id}`), async () => ({
					kind: "grant",
					payload
				}));
			}
		});
		ctx.effect(() => () => this.browser.dispose(), "student-openmaic: browser");
	}
	/**
	* Read original authorized feedback with protected capture ownership shared across children.
	* @param workspace - Authorized original workspace used to verify its generation job.
	* @returns Read-only source transport; academic writes remain native agent operations.
	*/
	feedback(workspace) {
		let reader = this.feedbackReaders.get(workspace);
		if (!reader) {
			const key = (partition) => credentialKey("student-openmaic", `capture-${partition}`);
			reader = new OpenmaicFeedback(this.connection, {
				load: async (partition) => {
					const record = await this.ctx.credentials.readRecord(key(partition));
					return record?.kind === "grant" ? record.payload : void 0;
				},
				claim: async (partition, payload) => {
					const record = await this.ctx.credentials.modifyRecord(key(partition), async (current) => current ?? {
						kind: "grant",
						payload
					});
					return record?.kind === "grant" ? record.payload : void 0;
				}
			}, (owner, stage, signal) => this.generation(workspace).verify(owner, stage, signal));
			this.feedbackReaders.set(workspace, reader);
		}
		return reader;
	}
	/**
	* Recover jobs within their original workspace, learner, term and learning block.
	* @param workspace - Original Student workspace path from the authorized agent.
	* @returns Workspace-scoped official job transport.
	*/
	generation(workspace) {
		let generation = this.generations.get(workspace);
		if (!generation) {
			const key = (owner) => credentialKey("student-openmaic", `job-${createHash("sha256").update(JSON.stringify([
				workspace,
				owner.learnerId,
				owner.termId,
				owner.blockId
			])).digest("hex")}`);
			generation = new OpenmaicGeneration(this.connection, {
				load: async (owner) => {
					const record = await this.ctx.credentials.readRecord(key(owner));
					return record?.kind === "grant" ? record.payload : void 0;
				},
				save: async (owner, payload) => {
					await this.ctx.credentials.modifyRecord(key(owner), async () => ({
						kind: "grant",
						payload
					}));
				}
			});
			this.generations.set(workspace, generation);
		}
		return generation;
	}
};
//#endregion
//#region lib/types/openmaic/playback.js
/** Authorized playback opening preserves original Student lesson and learner ownership. */
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
/** Browser opening is a Client action, not a model-visible secret exchange. */
let StudentOpenmaicPlayback = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _mini_decorators;
	let _progress_decorators;
	let _open_decorators;
	return class StudentOpenmaicPlayback extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_mini_decorators = [Remote({ resources: { session: (sessionId) => sessionId } })];
			_progress_decorators = [Remote({ resources: { session: (sessionId) => sessionId } })];
			_open_decorators = [Remote({ resources: { session: (sessionId) => sessionId } })];
			__esDecorate(this, null, _mini_decorators, {
				kind: "method",
				name: "mini",
				static: false,
				private: false,
				access: {
					has: (obj) => "mini" in obj,
					get: (obj) => obj.mini
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _progress_decorators, {
				kind: "method",
				name: "progress",
				static: false,
				private: false,
				access: {
					has: (obj) => "progress" in obj,
					get: (obj) => obj.progress
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _open_decorators, {
				kind: "method",
				name: "open",
				static: false,
				private: false,
				access: {
					has: (obj) => "open" in obj,
					get: (obj) => obj.open
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
		static inject = [
			"typert",
			"agents",
			"studentOpenmaic",
			"remoteAccess"
		];
		constructor(ctx) {
			super(ctx, "studentOpenmaicPlayback");
			__runInitializers(this, _instanceExtraInitializers);
		}
		/** Read a versioned teaching card without model inference or learning writes.
		* @param sessionId - Authorized main session.
		* @param miniId - Saved mini-lesson identity; never an arbitrary path.
		* @param signal - Cancels bounded content reads.
		* @returns Verified original HTML for sandboxed display.
		*/
		async mini(sessionId, miniId, signal) {
			const agent = this.ctx.agents.get(sessionId);
			if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === "subagent") throw new Error("Open the original main Student session.");
			const files = applicationStudyFiles({
				agent,
				signal
			});
			const read = await readWorkspace(files, signal);
			const lessons = await readLessonFile(files, signal);
			const mini = lessons.file?.miniLessons?.find((item) => item.id === miniId);
			if (read.status !== "valid" || !read.workspace || lessons.status !== "valid" || !mini || validateCourseWorkspace(lessons.file, read.workspace).length) throw new Error("Restore valid original mini-lesson ownership.");
			const bytes = await files.read(mini.contentPath, signal, 262144);
			if (createHash("sha256").update(bytes).digest("hex") !== mini.contentHash) throw new Error("The saved mini-lesson content has changed. Review and save a new content revision.");
			const latest = await readLessonFile(files, signal);
			if (latest.observation?.version !== lessons.observation?.version || latest.observation?.targetKey !== lessons.observation?.targetKey) throw new Error("The mini-lesson changed during reading.");
			return {
				id: mini.id,
				html: new TextDecoder("utf-8", { fatal: true }).decode(bytes)
			};
		}
		/** Poll an existing authorized job without inference or academic writes.
		* @param sessionId - Authorized main session.
		* @param lessonId - Saved lesson identity.
		* @param signal - Cancels transport polling.
		* @returns Real transport result or a safe recovery reason and check time.
		*/
		async progress(sessionId, lessonId, signal) {
			const agent = this.ctx.agents.get(sessionId);
			if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === "subagent" || !agent.session.header.cwd) throw new Error("Open the original main Student session.");
			const fs = applicationStudyFiles({
				agent,
				signal
			});
			const read = await readWorkspace(fs, signal);
			const lessons = await readLessonFile(fs, signal);
			const lesson = lessons.file?.lessons.find((item) => item.id === lessonId);
			if (read.status !== "valid" || !read.workspace || lessons.status !== "valid" || !lesson?.learnerId || !lesson.termId || !lesson.blockId || lesson.learnerId !== read.workspace.settings.learnerId || lesson.termId !== read.workspace.settings.termId || !read.workspace.blocks.some((block) => block.id === lesson.blockId)) throw new Error("Restore the original lesson ownership before checking its job.");
			try {
				return {
					checkedAt: Date.now(),
					result: await this.ctx.studentOpenmaic.generation(agent.session.header.cwd).poll({
						learnerId: lesson.learnerId,
						termId: lesson.termId,
						blockId: lesson.blockId,
						...lesson.jobId ? { jobId: lesson.jobId } : {}
					}, signal)
				};
			} catch (error) {
				if (signal.aborted) throw error;
				return {
					checkedAt: Date.now(),
					failure: error instanceof OpenmaicError ? error.code : "service-unavailable"
				};
			}
		}
		/**
		* Open one independently read lesson after checking original learner, term and block.
		* @param sessionId - Registered main Student conversation identity.
		* @param lessonId - Original agent-authored lesson-log entry.
		* @param signal - Cancellation for independent reads and browser opening.
		* @returns Safe playback, unresolved ownership or recovery outcome.
		*/
		async open(sessionId, lessonId, signal) {
			const agent = this.ctx.agents.get(sessionId);
			if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === "subagent") return {
				status: "unavailable",
				reason: "Open the original Student conversation to continue this classroom."
			};
			const { read } = await readStudentWorkspace({
				agent,
				signal
			}, this.ctx);
			if (!read.workspace) return {
				status: "unavailable",
				reason: "Restore valid Student files before opening this classroom."
			};
			const settings = z.object({
				learnerId: z.string(),
				termId: z.string()
			}).safeParse(read.workspace.settings);
			const files = applicationStudyFiles({
				agent,
				signal
			});
			const lessons = await readLessonFile(files, signal);
			const lesson = lessons.file?.lessons.find((item) => item.id === lessonId);
			if (!settings.success || !lesson || !lesson.learnerId || !lesson.termId || !lesson.blockId || !lesson.learnerKey) return {
				status: "ownership-unresolved",
				reason: "A parent must confirm the original learner and lesson ownership."
			};
			const identity = await this.ctx.studentOpenmaic.connection.identity(signal);
			if (lesson.learnerId !== settings.data.learnerId || lesson.termId !== settings.data.termId || lesson.learnerKey !== identity.learnerKey || lesson.base !== identity.baseUrl || !read.workspace.blocks.some((block) => block.id === lesson.blockId)) return {
				status: "ownership-unresolved",
				reason: "The classroom belongs to a different learner, term, block or service."
			};
			if (lessons.file && validateCourseWorkspace(lessons.file, read.workspace).length) return {
				status: "ownership-unresolved",
				reason: "Restore the original course and activity references."
			};
			const approvedReview = await this.ctx.studentOpenmaic.generation(agent.session.header.cwd).reviewedPlan({
				learnerId: lesson.learnerId,
				termId: lesson.termId,
				blockId: lesson.blockId
			});
			const requiresReview = !!lesson.purpose || !!approvedReview;
			if (requiresReview && lesson.quality?.status !== "passed") return {
				status: "unavailable",
				reason: "Review the generated content, scope, answer criteria and question allowance before playback."
			};
			if (lesson.status !== "ready" || !lesson.classroomId) return {
				status: "unavailable",
				reason: "Continue the existing generation job before opening its classroom."
			};
			if (!lesson.feedback) return {
				status: "ownership-unresolved",
				reason: "Prepare and save this classroom’s original question binding before opening it."
			};
			const target = {
				goalId: lesson.feedback.goalId,
				familyId: lesson.feedback.familyId,
				scope: lesson.feedback.scope
			};
			let prepared;
			try {
				prepared = await this.ctx.studentOpenmaic.feedback(agent.session.header.cwd).prepare({
					learnerId: lesson.learnerId,
					termId: lesson.termId,
					blockId: lesson.blockId,
					classroomId: lesson.classroomId,
					base: lesson.base,
					learnerKey: lesson.learnerKey
				}, target, signal);
			} catch (error) {
				if (signal.aborted) throw error;
				return {
					status: "ownership-unresolved",
					reason: "Restore the original classroom source and prepare its question binding before opening it."
				};
			}
			if (requiresReview) {
				const content = await this.ctx.studentOpenmaic.feedback(agent.session.header.cwd).content({
					learnerId: lesson.learnerId,
					termId: lesson.termId,
					blockId: lesson.blockId,
					classroomId: lesson.classroomId,
					base: lesson.base,
					learnerKey: lesson.learnerKey
				}, signal);
				const quality = lesson.quality;
				const input = await courseReviewInput(files, agent.session.header.cwd, lesson, lessons.file, signal);
				if (!await this.ctx.studentOpenmaic.reviewer.approvedPlan(input, approvedReview)) return {
					status: "unavailable",
					reason: "The saved plan differs from the approved original submission."
				};
				input.content = content;
				input.questions = prepared.questions;
				if (!quality || !reviewQuestionsCurrent(input) || !await this.ctx.studentOpenmaic.reviewer.accepts(input, quality)) return {
					status: "unavailable",
					reason: "This exact material, question plan and classroom need an independent content review before playback."
				};
				const reviewKeys = quality?.questions.map((question) => JSON.stringify([question.sceneId, question.questionId])) ?? [];
				if (!quality || content.contentHash !== quality.contentHash || Object.values(quality.stages).some((sceneId) => !content.scenes.some((scene) => scene.id === sceneId)) || prepared.questions.length > (lesson.teaching?.maxAssessmentQuestions ?? 3) || reviewKeys.length !== prepared.questions.length || new Set(reviewKeys).size !== reviewKeys.length || prepared.questions.some((question) => !reviewKeys.includes(JSON.stringify([question.sceneId, question.questionId])))) return {
					status: "unavailable",
					reason: "The classroom content, teaching stages or question allowance differs from its reviewed source."
				};
			}
			const block = read.workspace.blocks.find((block) => block.id === lesson.blockId);
			if (prepared.binding.bindingId !== lesson.feedback.bindingId || !prepared.questions.every((question) => block?.questions.some((saved) => saved.openmaic?.bindingId === question.bindingId && saved.openmaic.sceneId === question.sceneId && saved.openmaic.questionId === question.questionId && saved.openmaic.snapshotHash === question.snapshotHash))) return {
				status: "ownership-unresolved",
				reason: "Save every prepared original question in its learning block before opening this classroom."
			};
			const latest = await readWorkspace(files, signal);
			const finalLessons = await readLessonFile(files, signal);
			if (latest.status !== "valid" || JSON.stringify(latest.files.map((file) => [
				file.path,
				file.targetKey,
				file.version
			])) !== JSON.stringify(read.files.map((file) => [
				file.path,
				file.targetKey,
				file.version
			])) || finalLessons.observation?.version !== lessons.observation?.version || finalLessons.observation?.targetKey !== lessons.observation?.targetKey) return {
				status: "ownership-unresolved",
				reason: "Learning files changed during preparation; continue the original classroom after reading them again."
			};
			return this.ctx.studentOpenmaic.browser.open(lesson.classroomId, signal);
		}
	};
})();
//#endregion
export { OpenmaicBrowser as i, StudentOpenmaic as n, openmaicConfig as r, StudentOpenmaicPlayback as t };
