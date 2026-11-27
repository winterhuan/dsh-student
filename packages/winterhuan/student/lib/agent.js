import { t as applicationStudyFiles } from "./application-BqngjvBs.js";
import { J as canonical, O as openmaicAcademicQuestion, Ot as sectionReadiness, Vt as validateCourseWorkspace, t as readWorkspace, vt as readLessonFile } from "./read-BpRrocGx.js";
import { a as courseReviewInput, d as readStudentWorkspace, h as nativeMessageHash, i as courseReviewModel, n as generationRequestSchema, o as reviewQuestionsCurrent, s as reviewedCourseRequirement, u as openmaicEntityId } from "./generation-CWbd-geH.js";
import { a as queryWorkspace } from "./queries-CiBrxUDd.js";
import "node:module";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { z } from "zod";
import { Service } from "@deepseek-ai/cordis";
import { appendPluginRecord } from "@deepseek-ai/dsh-session";
import { apply as apply$1 } from "./openmaic/lib/index.js";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region lib/types/skill-provider.js
/** Provide the study Skill, teaching references and default textbook pages from the installed package. */
function createStudySkillProvider() {
	const root = fileURLToPath(new URL("../knowledge/skills/study/", import.meta.url));
	const path = `${root}SKILL.md`;
	const read = async () => {
		const source = await readFile(path, "utf8");
		const match = /^---\r?\n[\s\S]*?^description: (.+)\r?\n[\s\S]*?^---\r?\n([\s\S]*)$/mu.exec(source);
		if (!match?.[1] || !match[2]) throw new Error("study SKILL.md requires description frontmatter and a body.");
		return {
			description: match[1],
			content: match[2]
		};
	};
	const identity = {
		name: "study",
		provider: "student",
		source: "bundled",
		invocation: {
			modelInvocable: true,
			userInvocable: true
		},
		resourceBase: {
			kind: "directory",
			path: root
		},
		path
	};
	return {
		name: "student",
		async list() {
			return [{
				...identity,
				description: (await read()).description,
				rank: BUNDLED_SKILL_RANK,
				locator: pathToFileURL(path)
			}];
		},
		async get(candidate) {
			if (candidate.name !== identity.name || candidate.provider !== identity.provider || candidate.path !== path) return void 0;
			return {
				...identity,
				...await read()
			};
		}
	};
}
//#endregion
//#region lib/types/tools.js
function boundedRead(result, paths) {
	const versions = result.versions.filter((file) => paths.includes(file.path));
	return {
		...result,
		versions: versions.slice(0, 20),
		omittedVersions: result.versions.length - Math.min(versions.length, 20),
		issues: result.issues?.slice(0, 20).map((issue) => ({
			path: issue.path.slice(0, 240),
			field: issue.field.slice(0, 240),
			rule: issue.rule.slice(0, 80),
			correction: issue.correction.slice(0, 500)
		})),
		omittedIssues: Math.max(0, (result.issues?.length ?? 0) - 20)
	};
}
/** Register the bounded read-only Student lookup in DSH's native tool runtime. */
function registerStudyTools(context) {
	context.tools.register(defineTool({
		name: "study_status",
		description: "Read validated Student files, observed versions, pending work and learning context. Load the study skill to author official files and run the packaged read-only CLI.",
		parameters: {
			kind: {
				type: "string",
				enum: [
					"status",
					"daily-plan",
					"capability-progress",
					"capabilities",
					"families",
					"knowledge-sources",
					"legacy-references",
					"learning-context",
					"files",
					"settings",
					"summary",
					"materials",
					"mistakes",
					"due",
					"pending",
					"attempts",
					"sessions",
					"progress",
					"concepts",
					"objectives",
					"relations",
					"worksheets",
					"paper-results",
					"curriculum",
					"weak",
					"elements",
					"exercises",
					"diagnose",
					"review-sheet"
				],
				description: "daily-plan returns the deterministic preview, saved arrangement, legal continuation and actual summary; capability-progress returns the shared capability/range evidence projection. status (default) returns validated status and learning context; capabilities and families page source-backed goals and canonical mothers (optional subject/id); knowledge-sources returns official curriculum sources and coverage limits; legacy-references pages pending old-ID routes and never grants mastery; learning-context returns current block/question, saved responses, pending assessment, selected scope, target facts/method and at most three seeds; files pages official file identities and paths; settings returns term setup; summary returns seven Shanghai calendar days; collections page 20 records with offset. curriculum needs subject (grade and term browse another map); elements needs subject and returns question-writing elements, exercises and the hint ladder; exercises pages shipped and workspace exercises (optional subject, unit or id/objectiveId); diagnose returns check-in plans (grade, term or unit narrow the scope); review-sheet needs subject; weak lists weak points."
			},
			offset: {
				type: "integer",
				description: "Zero-based collection offset; defaults to 0."
			},
			id: {
				type: "string",
				description: "Optional exact record ID (or objectiveId for kind=exercises) for materials, mistakes, attempts, sessions, concepts, objectives, exercises or worksheets."
			},
			subject: {
				type: "string",
				enum: [
					"chinese",
					"math",
					"english"
				],
				description: "Optional subject filter for subject-owned records; required for kind=curriculum and kind=elements."
			},
			unit: {
				type: "string",
				description: "Optional map unit filter for kind=elements and kind=exercises; for kind=diagnose with grade/term, narrow the cross-grade plan to one unit."
			},
			grade: {
				type: "integer",
				description: "Optional grade (1 or 2) to browse another map (kind=curriculum) or build a cross-grade check-in plan (kind=diagnose); defaults to the learner profile."
			},
			term: {
				type: "string",
				enum: ["first", "second"],
				description: "Optional term for kind=curriculum and kind=diagnose; defaults to the learner profile."
			}
		},
		output: {
			schema: { type: "json" },
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		isConcurrencySafe: () => true,
		async execute(args, exec) {
			const offset = args.offset ?? 0;
			if (offset < 0) throw new Error("offset 不能为负数。");
			const { read, native: source, backupIssues } = await readStudentWorkspace(exec, void 0, void 0, args.kind === "daily-plan" && args.id && /^\d{4}-\d{2}-\d{2}$/u.test(args.id) ? args.id : void 0);
			const now = Date.now();
			const active = read.workspace?.blocks.find((block) => block.endedAt === void 0);
			const paths = [
				".study/settings.json",
				...read.files.filter((file) => file.file?.kind === "daily-plan").map((file) => file.path),
				...active ? [`.study/blocks/${active.id}.json`] : [],
				...read.files.filter((file) => file.file && "id" in file.file && file.file.id === args.id).map((file) => file.path)
			];
			const result = boundedRead(queryWorkspace(read, {
				...args,
				kind: args.kind ?? "status",
				offset
			}, now), paths);
			if (args.kind === "files") {
				const matching = read.files.filter((file) => args.id === void 0 || file.file && "id" in file.file && file.file.id === args.id);
				result.data = {
					total: matching.length,
					items: matching.slice(offset, offset + 20).map((file) => ({
						path: file.path,
						version: file.version,
						kind: file.file?.kind,
						termId: file.file?.termId,
						...file.file && "id" in file.file ? { id: file.file.id } : {}
					})),
					nextOffset: offset + 20 < matching.length ? offset + 20 : null
				};
			}
			if (args.kind === "capability-progress" && Array.isArray(result.data)) {
				const items = result.data;
				result.data = {
					items: items.slice(offset, offset + 20),
					total: items.length,
					nextOffset: offset + 20 < items.length ? offset + 20 : null
				};
			}
			if (args.kind === "curriculum" && result.data) {
				const data = z.record(z.string(), z.unknown()).parse(result.data);
				if (data.curriculum !== null) {
					const curriculum = z.record(z.string(), z.unknown()).parse(data.curriculum);
					result.data = { curriculum: {
						...Object.fromEntries([
							"id",
							"subject",
							"grade",
							"term",
							"title",
							"scope",
							"units"
						].filter((key) => key in curriculum).map((key) => [key, curriculum[key]])),
						more: "Use elements with a subject and goal ID for facts/methods, or read the matching installed knowledge/curriculum JSON for the full map."
					} };
				}
			}
			const context = args.kind === "learning-context" ? result : args.kind === void 0 || args.kind === "status" ? boundedRead(queryWorkspace(read, {
				kind: "learning-context",
				...args.subject ? { subject: args.subject } : {}
			}, now), paths) : void 0;
			if (context?.data) {
				const data = z.record(z.string(), z.unknown()).parse(context.data);
				const responses = z.array(z.record(z.string(), z.unknown())).parse(data.responses);
				const saved = z.record(z.string(), z.unknown()).nullable().parse(data.savedResponse);
				const selected = responses.filter((response) => response.id === saved?.id);
				data.goalProgress = Array.isArray(data.goalProgress) ? data.goalProgress.filter((item) => item && typeof item === "object" && "id" in item && item.id === data.nextAction?.goalId).slice(0, 3) : [];
				delete data.activeQuestions;
				if (data.daily && typeof data.daily === "object") {
					const daily = data.daily;
					data.daily = {
						day: daily.day,
						phase: daily.phase,
						currentTaskId: daily.currentTaskId,
						planId: daily.saved?.id ?? null,
						revision: daily.saved?.revision ?? null,
						nextAction: daily.nextAction,
						more: "Read study_status kind=daily-plan for the arrangement and choices."
					};
				}
				delete data.responses;
				data.omittedResponses = responses.length - selected.length;
				delete data.assessments;
				context.data = data;
			}
			if (args.kind === void 0 || args.kind === "status") {
				const data = result.data ? z.record(z.string(), z.unknown()).parse(result.data) : void 0;
				if (data) result.data = Object.fromEntries([
					"phase",
					"profile",
					"interests",
					"interestFocus",
					"time",
					"openmaic",
					"unconfirmedSubjects",
					"recommendation",
					"weakPoints",
					"dueToday"
				].filter((key) => key in data).map((key) => [key, data[key]]));
			}
			const native = {
				status: source.status,
				cut: source.cut,
				inputs: source.inputs.slice(-1),
				admissions: source.admissions.slice(-3),
				omitted: source.omitted + Math.max(0, source.inputs.length - 1),
				omittedAdmissions: source.omittedAdmissions + Math.max(0, source.admissions.length - 3),
				reason: source.reason
			};
			const payload = {
				...result,
				native,
				backupIssues: backupIssues.slice(0, 20).map((issue) => ({
					path: issue.path.slice(0, 240),
					field: issue.field.slice(0, 240),
					rule: issue.rule.slice(0, 80),
					correction: issue.correction.slice(0, 500)
				})),
				omittedBackupIssues: Math.max(0, backupIssues.length - 20),
				...args.kind === void 0 || args.kind === "status" ? { learningContext: context } : {}
			};
			const renderedBytes = () => Buffer.byteLength(JSON.stringify([{
				type: "text",
				text: JSON.stringify(payload)
			}]));
			while (renderedBytes() > 32768 && native.inputs.length > 0) {
				native.inputs.shift();
				native.omitted += 1;
			}
			while (renderedBytes() > 32768 && native.admissions.length > 0) {
				native.admissions.shift();
				native.omittedAdmissions += 1;
			}
			if (renderedBytes() > 32768) {
				payload.data = {
					omitted: true,
					reason: "Requested records exceed the bounded tool result. Read their official files with native read.",
					paths
				};
				if (payload.learningContext) payload.learningContext.data = {
					omitted: true,
					reason: "Read the active block for full question and response content.",
					path: active ? `.study/blocks/${active.id}.json` : ".study/settings.json"
				};
			}
			while (renderedBytes() > 32768) if (payload.versions.length > 0) {
				payload.versions.pop();
				payload.omittedVersions += 1;
			} else if (payload.learningContext?.versions.length) {
				payload.learningContext.versions.pop();
				payload.learningContext.omittedVersions += 1;
			} else if (payload.issues?.length) {
				payload.issues.pop();
				payload.omittedIssues += 1;
			} else if (payload.learningContext?.issues?.length) {
				payload.learningContext.issues.pop();
				payload.learningContext.omittedIssues += 1;
			} else if (payload.backupIssues.length) {
				payload.backupIssues.pop();
				payload.omittedBackupIssues += 1;
			} else break;
			return z.json().parse(JSON.parse(JSON.stringify(payload)));
		}
	}));
}
//#endregion
//#region lib/types/native-capture.js
/** Receipt-time ownership is support metadata; the agent still authors all academic records. */
/** Host-owned receipt snapshots are released on Agent disposal and Host teardown. */
var StudentNativeCapture = class extends Service {
	owners = /* @__PURE__ */ new WeakMap();
	admissions = /* @__PURE__ */ new WeakMap();
	/** @param ctx - Host lifetime owning receipt metadata. */
	constructor(ctx) {
		super(ctx, "studentNativeCapture");
		ctx.on("agent/disposed", ({ agent }) => {
			this.owners.delete(agent);
			this.admissions.delete(agent);
		});
		ctx.effect(() => () => {
			this.owners = /* @__PURE__ */ new WeakMap();
			this.admissions = /* @__PURE__ */ new WeakMap();
		});
	}
	/** @param agent - Main Agent. @returns Current receipt owner, if available. */
	owner(agent) {
		return this.owners.get(agent);
	}
	/**
	* Cache a complete independent owner publication before later user receipt.
	* @param agent - Owning main native Agent.
	* @param read - Independently read files with observed versions.
	* @returns Frozen owner and question when complete; otherwise removes cached ownership.
	*/
	remember(agent, read) {
		this.owners.delete(agent);
		const workspace = read.status === "valid" ? read.workspace : void 0;
		const block = workspace?.blocks.find((block) => block.endedAt === void 0);
		const question = block?.questions.find((question) => question.id === block.currentQuestionId);
		if (!workspace?.settings.learnerId || !block?.learnerId || !question || agent.session.header.parentSession || agent.session.header.origin === "subagent") return void 0;
		const paths = [".study/settings.json", `.study/blocks/${block.id}.json`];
		const versions = read.files.filter((file) => paths.includes(file.path) && file.targetKey && file.version).map((file) => ({
			path: file.path,
			targetKey: file.targetKey,
			version: file.version
		}));
		const snapshot = {
			scope: {
				learnerId: block.learnerId,
				termId: block.termId,
				blockId: block.id,
				questionId: question.id
			},
			questionSnapshot: canonical(question),
			versions
		};
		if (versions.length !== 2 || snapshot.questionSnapshot.length > 65536) return void 0;
		this.owners.set(agent, snapshot);
		return snapshot;
	}
	async refresh(agent, signal) {
		if (!agent.session.header.cwd || !agent.ctx.get("fs") || !agent.ctx.get("sandboxPolicy")) {
			this.owners.delete(agent);
			return;
		}
		let read;
		try {
			read = await readWorkspace(applicationStudyFiles({
				agent,
				signal
			}), signal);
		} catch (error) {
			this.owners.delete(agent);
			if (signal.aborted) throw error;
			return;
		}
		signal.throwIfAborted();
		return this.remember(agent, read);
	}
	/**
	* Freeze the cached owner at inbox insertion and recheck it after downstream admission hooks.
	* @param context - Student preset lifetime and native Agent events.
	*/
	register(context) {
		context.on("agent/created", async ({ agent, signal }) => {
			await this.refresh(agent, signal ?? AbortSignal.timeout(3e4));
		});
		context.on("agent/inbox/discarded", ({ agent, message }) => {
			const splice = agent.session.snapshotEvents().at(-1);
			if (splice?.type !== "agent/inbox/spliced" || splice.data.inserted.length !== 1 || splice.data.inserted[0]?.id !== message.id) this.admissions.get(agent)?.delete(message.id);
		});
		context.on("agent/inbox/inserted", ({ agent, message }) => {
			if (message.source.kind !== "user") return;
			const splice = agent.session.snapshotEvents().at(-1);
			if (splice?.type !== "agent/inbox/spliced") return;
			let pending = this.admissions.get(agent);
			if (!pending) {
				pending = /* @__PURE__ */ new Map();
				this.admissions.set(agent, pending);
			}
			const previous = pending.get(message.id);
			const messageHash = nativeMessageHash(message);
			const continuous = previous && splice.data.removedCount === 1 && splice.data.inserted.length === 1 && previous.sourceSnapshot === canonical(message.source);
			const snapshot = continuous ? previous.snapshot : agent.status === "idle" ? this.owner(agent) : void 0;
			pending.delete(message.id);
			if (snapshot) {
				if (pending.size >= 20) pending.delete(pending.keys().next().value);
				pending.set(message.id, {
					snapshot,
					messageHash,
					sourceSnapshot: canonical(message.source),
					receiptSeq: continuous && previous.messageHash === messageHash ? previous.receiptSeq : splice.seq
				});
			}
		});
		context.on("agent/pre-step", async ({ agent, messages, turn, step, signal }, next) => {
			const users = messages.filter((message) => message.source.kind === "user");
			const original = users.length === 1 ? users[0] : void 0;
			const admitted = original ? this.admissions.get(agent)?.get(original.id) : void 0;
			for (const message of users) this.admissions.get(agent)?.delete(message.id);
			const decision = await next();
			if (decision.kind !== "enter") return decision;
			const current = await this.refresh(agent, signal);
			if (original && admitted && nativeMessageHash(original) === admitted.messageHash && decision.messages.filter((message) => nativeMessageHash(message) === admitted.messageHash).length === 1 && canonical(current) === canonical(admitted.snapshot)) {
				signal.throwIfAborted();
				appendPluginRecord(agent.session, "plugin:student/native-owner", {
					...admitted.snapshot,
					sessionId: agent.session.id,
					turn,
					step,
					receiptSeq: admitted.receiptSeq,
					messageHash: admitted.messageHash
				});
			}
			return decision;
		});
	}
};
/** @param context - Student preset registering capture before Agent creation. */
function registerNativeCapture(context) {
	(context.root.get("studentNativeCapture") ?? new StudentNativeCapture(context.root)).register(context);
}
//#endregion
//#region lib/types/openmaic/feedback-agent.js
/**
* Register the source read alongside the official teaching tools in the Student preset.
* @param ctx - Preset-scoped tool registry and protected Host connection.
*/
function registerOpenmaicFeedback(ctx) {
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "openmaic_feedback",
		description: "Read original authorized classroom answers and grading, or prepare its frozen question binding before playback. Returns bounded authoring facts and independent saved-file acceptance; the agent writes the formal files and runs the read-only CLI before advancing a checkpoint.",
		parameters: {
			action: {
				type: "string",
				enum: [
					"prepare",
					"read",
					"content",
					"review"
				],
				required: true,
				description: "review independently checks all actual scenes and returns quality plus original binding/questions in one call; content pages original scenes; prepare freezes the original generated classroom before playback; read rereads original submitted/reviewed records after return, continue or restart."
			},
			lessonId: {
				type: "string",
				required: true,
				description: "Original ID in .study/openmaic-lessons.json."
			},
			offset: {
				type: "integer",
				description: "Zero-based source-question/response page; defaults to 0. Each page returns at most twenty records."
			}
		},
		output: {
			schema: { type: "json" },
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		isConcurrencySafe: () => true,
		async execute(args, exec) {
			const { action, lessonId, offset = 0 } = z.object({
				action: z.enum([
					"prepare",
					"read",
					"content",
					"review"
				]),
				lessonId: z.string().min(1).max(80),
				offset: z.number().int().nonnegative().optional()
			}).parse(args);
			const { read, openmaic } = await readStudentWorkspace(exec, void 0, lessonId);
			const lessonRead = await readLessonFile(applicationStudyFiles(exec), exec.signal);
			const lesson = [...lessonRead.status === "valid" ? lessonRead.file.lessons : [], ...(read.archiveSources ?? []).flatMap((archive) => archive.lessons.status === "valid" ? archive.lessons.file.lessons.filter((lesson) => lesson.termId === archive.workspace.settings.termId) : [])].find((lesson) => lesson.id === lessonId);
			const workspace = read.workspace;
			const unavailable = openmaic.find((fact) => fact.lessonId === lessonId && fact.status === "unavailable");
			if (action === "read" && read.status === "changing" && unavailable) return {
				status: "unavailable",
				lessonId,
				failure: unavailable.failure ?? "incomplete-read",
				reason: unavailable.reason ?? "Original official source changed during verification.",
				complete: false,
				records: [],
				total: null,
				drafts: null,
				nextOffset: null
			};
			if (read.status !== "valid" || !workspace?.settings.learnerId || !lesson?.learnerId || !lesson.termId || lesson.learnerId !== workspace.settings.learnerId || !lesson.blockId || !lesson.classroomId || !lesson.learnerKey || lesson.status !== "ready") throw new Error("Confirm valid original learner, term, block and ready classroom files before reading its source.");
			const block = [workspace, ...(read.archiveSources ?? []).map((archive) => archive.workspace)].find((owner) => owner.settings.termId === lesson.termId && owner.settings.learnerId === workspace.settings.learnerId)?.blocks.find((block) => block.id === lesson.blockId && block.learnerId === workspace.settings.learnerId);
			if (!block || !exec.agent?.session.header.cwd) throw new Error("Original classroom block ownership is unresolved.");
			let result;
			if (action === "review") {
				if (!lessonRead.file || validateCourseWorkspace(lessonRead.file, workspace).length) throw new Error("Restore valid course and target references before review.");
				const files = applicationStudyFiles(exec);
				const input = await courseReviewInput(files, exec.agent.session.header.cwd, lesson, lessonRead.file, exec.signal);
				const approved = await ctx.studentOpenmaic.generation(exec.agent.session.header.cwd).reviewedPlan(input.owner);
				if (!await ctx.studentOpenmaic.reviewer.approvedPlan(input, approved)) throw new Error("This plan does not match the original approved submission. Preserve the old course and generate an explicitly requested replacement.");
				const owner = {
					learnerId: lesson.learnerId,
					termId: lesson.termId,
					blockId: lesson.blockId,
					base: lesson.base,
					classroomId: lesson.classroomId,
					learnerKey: lesson.learnerKey
				};
				const feedback = ctx.studentOpenmaic.feedback(exec.agent.session.header.cwd);
				const prepared = await feedback.prepare(owner, input.plan.target, exec.signal);
				input.content = await feedback.content(owner, exec.signal);
				input.questions = prepared.questions;
				if (!reviewQuestionsCurrent(input)) throw new Error("The current quiz differs from its original frozen capture. Preserve this version and create an explicitly requested replacement.");
				const model = courseReviewModel(ctx, exec);
				const review = await ctx.studentOpenmaic.reviewer.review(input, model.model, model.generate, exec.signal);
				const latest = await readLessonFile(files, exec.signal);
				if (latest.observation?.version !== lessonRead.observation?.version || latest.observation?.targetKey !== lessonRead.observation?.targetKey) throw new Error("The lesson changed during review. Read its current version.");
				await courseReviewInput(files, exec.agent.session.header.cwd, lesson, lessonRead.file, exec.signal);
				result = {
					status: "reviewed",
					lessonId,
					quality: review.quality,
					issues: review.issues,
					feedback: prepared.binding,
					questions: prepared.questions.map((question) => openmaicAcademicQuestion({
						binding: prepared.binding,
						questionId: openmaicEntityId("q", [
							prepared.binding.bindingId,
							question.sceneId,
							question.questionId
						]),
						question
					})),
					total: prepared.questions.length,
					nextOffset: null
				};
			} else if (action === "content") {
				const content = await ctx.studentOpenmaic.feedback(exec.agent.session.header.cwd).content({
					learnerId: lesson.learnerId,
					termId: lesson.termId,
					blockId: lesson.blockId,
					base: lesson.base,
					classroomId: lesson.classroomId,
					learnerKey: lesson.learnerKey
				}, exec.signal);
				result = {
					status: "content",
					lessonId,
					contentHash: content.contentHash,
					scenes: content.scenes.slice(offset, offset + 4),
					total: content.scenes.length,
					nextOffset: offset + 4 < content.scenes.length ? offset + 4 : null
				};
			} else if (action === "prepare") {
				if (lesson.questionPlan) {
					if (!lessonRead.file || validateCourseWorkspace(lessonRead.file, workspace).length) throw new Error("Restore valid original course targets before preparing feedback.");
					const plan = await courseReviewInput(applicationStudyFiles(exec), exec.agent.session.header.cwd, lesson, lessonRead.file, exec.signal);
					if (!await ctx.studentOpenmaic.reviewer.approvedPlan(plan, await ctx.studentOpenmaic.generation(exec.agent.session.header.cwd).reviewedPlan(plan.owner))) throw new Error("Prepare only the original approved question plan.");
				}
				const target = lesson.questionPlan?.target ?? block.questions.find((question) => question.id === block.currentQuestionId)?.capability;
				if (!target) throw new Error("Save the current capability, family and tested scope before preparing classroom feedback.");
				const prepared = await ctx.studentOpenmaic.feedback(exec.agent.session.header.cwd).prepare({
					learnerId: lesson.learnerId,
					termId: lesson.termId,
					blockId: lesson.blockId,
					base: lesson.base,
					classroomId: lesson.classroomId,
					learnerKey: lesson.learnerKey
				}, target, exec.signal);
				result = {
					status: "prepared",
					lessonId,
					feedback: prepared.binding,
					questions: prepared.questions.slice(offset, offset + 20).map((question) => openmaicAcademicQuestion({
						binding: prepared.binding,
						questionId: openmaicEntityId("q", [
							prepared.binding.bindingId,
							question.sceneId,
							question.questionId
						]),
						question
					})),
					total: prepared.questions.length,
					nextOffset: offset + 20 < prepared.questions.length ? offset + 20 : null
				};
			} else {
				const fact = openmaic.find((fact) => fact.lessonId === lessonId);
				result = {
					status: fact?.status ?? "unavailable",
					lessonId,
					reason: fact?.reason,
					failure: fact?.failure,
					complete: !!fact?.source,
					consumption: fact?.consumption,
					records: [...fact?.source?.observations.map((observation) => ({
						question: openmaicAcademicQuestion(observation),
						response: {
							id: observation.responseId,
							questionId: observation.questionId,
							rawResponse: JSON.stringify(observation.source.submittedAnswer),
							assistance: "unknown",
							answerDate: { kind: "unknown" },
							source: observation.source
						},
						assessment: {
							id: openmaicEntityId("a", [observation.responseId]),
							responseId: observation.responseId,
							result: observation.result,
							grading: observation.grading,
							...observation.official ? {
								official: observation.official,
								officialHistory: observation.officialHistory
							} : {},
							assistance: "unknown",
							assessedAt: Date.now(),
							feedback: observation.grading === "equivalent" ? "The submitted value is equivalent to the frozen criterion; the official result is preserved." : observation.grading === "conflict" ? "The official and frozen criterion conflict; review before accepting evidence." : observation.grading === "pending" ? "The original answer is preserved; missing grading or criterion needs review." : "Checked against the original frozen criterion.",
							answerEvidence: openmaicAcademicQuestion(observation).answerEvidence
						},
						sourceStatus: observation.sourceStatus,
						reason: observation.reason,
						answerExposure: observation.answerExposure
					})) ?? [], ...fact?.source?.pending.map((pendingOpenmaic) => ({ pendingOpenmaic })) ?? []].slice(offset, offset + 20),
					total: fact?.source ? fact.source.observations.length + fact.source.pending.length : null,
					drafts: fact?.source?.drafts ?? null,
					nextOffset: fact?.source && offset + 20 < fact.source.observations.length + fact.source.pending.length ? offset + 20 : null
				};
			}
			const bounded = z.record(z.string(), z.json()).parse(JSON.parse(JSON.stringify(result)));
			const rows = Array.isArray(bounded.records) ? bounded.records : Array.isArray(bounded.questions) ? bounded.questions : Array.isArray(bounded.scenes) ? bounded.scenes : void 0;
			const originalLength = rows?.length ?? 0;
			if (bounded.consumption && typeof bounded.consumption === "object" && !Array.isArray(bounded.consumption)) {
				for (const field of [
					"missingResponseIds",
					"missingPendingIds",
					"conflicts"
				]) if (Array.isArray(bounded.consumption[field])) {
					const ids = bounded.consumption[field];
					bounded.consumption[`${field}Count`] = ids.length;
					bounded.consumption[field] = ids.slice(0, 20);
				}
			}
			while (Buffer.byteLength(JSON.stringify(bounded)) > 32768 && rows?.length) rows.pop();
			if (rows && rows.length < originalLength) {
				bounded.nextOffset = offset + rows.length;
				bounded.omitted = originalLength - rows.length;
				if (!rows.length) {
					bounded.status = "unavailable";
					bounded.failure = "read-limit";
					bounded.complete = false;
					delete bounded.consumption;
					bounded.reason = "This source record exceeds the native result limit. The offset has not advanced; keep its checkpoint pending.";
				}
			}
			if (Buffer.byteLength(JSON.stringify(bounded)) > 32768) throw new Error("Source metadata exceeds the bounded native read result.");
			return z.json().parse(bounded);
		}
	})), "student: official feedback");
}
//#endregion
//#region lib/types/openmaic/agent.js
var agent_exports = /* @__PURE__ */ __exportAll({
	apply: () => apply$2,
	inject: () => inject$1,
	name: () => name$1
});
const name$1 = "student-openmaic-agent";
const inject$1 = [
	"llm",
	"studentOpenmaic",
	"tools",
	"skills",
	"systemPrompt"
];
/** Official render/widget/slide and four bundled skills retain their original implementations. */
function apply$2(ctx) {
	registerOpenmaicFeedback(ctx);
	const generate = defineTool({
		name: "openmaic_generate",
		description: "Start one official OpenMAIC classroom and return its structured job identity immediately. Continue with the same learner, term, block and jobId to poll after interruption; generating and failed jobs are not learning evidence.",
		parameters: {
			learnerId: {
				type: "string",
				required: true,
				description: "Stable Student learner identity from the validated profile."
			},
			termId: {
				type: "string",
				required: true,
				description: "Original learning term identity."
			},
			blockId: {
				type: "string",
				required: true,
				description: "Original active learning block identity. One generated classroom per block."
			},
			requirement: {
				type: "string",
				description: "Concrete goal, scope, gaps and teaching activity. Required for the initial submission."
			},
			jobId: {
				type: "string",
				description: "Original returned job identity when continuing. Never replace it after timeout."
			},
			language: {
				type: "string",
				enum: ["zh-CN", "en-US"],
				description: "Classroom language."
			},
			enableWebSearch: {
				type: "boolean",
				description: "Search factual sources for this lesson."
			},
			enableImageGeneration: {
				type: "boolean",
				description: "Generate slide images."
			},
			enableVideoGeneration: {
				type: "boolean",
				description: "Generate lesson video."
			},
			enableTTS: {
				type: "boolean",
				description: "Generate spoken narration."
			},
			agentMode: {
				type: "string",
				enum: ["default", "generate"],
				description: "Official classroom generation mode."
			}
		},
		output: {
			schema: { type: "json" },
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		isConcurrencySafe: () => true,
		async execute(args, exec) {
			const request = generationRequestSchema.parse(args);
			const workspace = exec.agent?.session.header.cwd;
			if (!workspace) throw new Error("OpenMAIC requires the current Student workspace.");
			const { read } = await readStudentWorkspace(exec);
			const settings = z.object({
				learnerId: z.string(),
				termId: z.string()
			}).safeParse(read.workspace?.settings);
			if (!settings.success || settings.data.learnerId !== request.learnerId || settings.data.termId !== request.termId || !read.workspace?.blocks.some((block) => block.id === request.blockId)) throw new Error("Confirm the original Student learner, term and learning block before generating or continuing a classroom.");
			if (request.requirement && !request.jobId) {
				const lessons = await readLessonFile(applicationStudyFiles(exec), exec.signal);
				const lesson = lessons.file?.lessons.find((item) => item.blockId === request.blockId && item.learnerId === request.learnerId && item.termId === request.termId);
				if (!lesson?.purpose || !lesson.teaching || lessons.status !== "valid" || !read.workspace || validateCourseWorkspace(lessons.file, read.workspace).length) throw new Error("Save and validate the unit section or explicitly chosen foundational lesson and full teaching plan before submission. Read references/unit-courses.md.");
				const course = lessons.file.courses?.find((item) => item.id === lesson.course?.id);
				if (lesson.course && (!course || sectionReadiness(course, lesson.course.sectionId) !== "ready")) throw new Error("Confirm the material and school position before generating this section.");
				if (request.requirement !== lesson.requirement) throw new Error("Use the saved teaching requirement without replacing the original request.");
				const input = await courseReviewInput(applicationStudyFiles(exec), workspace, lesson, lessons.file, exec.signal);
				request.requirement = reviewedCourseRequirement(input);
				const model = courseReviewModel(ctx, exec);
				const review = await ctx.studentOpenmaic.reviewer.review(input, model.model, model.generate, exec.signal);
				if (review.status !== "passed") return {
					status: "review-rejected",
					submitted: false,
					lessonId: lesson.id,
					reviewId: review.reviewId,
					issues: review.issues
				};
				request.reviewId = review.reviewId;
				const latest = await readLessonFile(applicationStudyFiles(exec), exec.signal);
				if (latest.observation?.version !== lessons.observation?.version || latest.observation?.targetKey !== lessons.observation?.targetKey) throw new Error("The lesson changed during review. Read the current version before submission.");
				await courseReviewInput(applicationStudyFiles(exec), workspace, lesson, lessons.file, exec.signal);
			}
			if ((request.requirement?.length ?? 0) > 8e3) throw new Error("Keep the saved requirement and teaching plan within 8000 characters in total before submitting.");
			return z.json().parse(await ctx.studentOpenmaic.generation(workspace).run(request, exec.signal));
		}
	});
	const tools = new Proxy(ctx.tools, { get(target, key, receiver) {
		if (key === "register") return (tool) => target.register(tool.name === "openmaic_generate" ? generate : tool);
		return Reflect.get(target, key, receiver);
	} });
	const systemPrompt = new Proxy(ctx.systemPrompt, { get(target, key, receiver) {
		if (key === "section") return (section) => target.section(section.name === "tool:dsh-openmaic" ? {
			...section,
			text: "Use openmaic_generate for a complete classroom. It returns the official job identity promptly; continue the same job, then let the agent save validated lesson metadata. New learning starts with a full classroom. Use inline OpenMAIC widgets, slides and cards for targeted explanation and later review; review begins with recall or an attempt. Read study references/unit-courses.md and save the teaching and question plans before generation; questions receive independent review. Once ready, use openmaic_feedback action=review and save its returned quality, binding and questions. Load the matching authoring skill first."
		} : section);
		return Reflect.get(target, key, receiver);
	} });
	apply$1(new Proxy(ctx, { get(target, key, receiver) {
		if (key === "tools") return tools;
		if (key === "systemPrompt") return systemPrompt;
		return Reflect.get(target, key, receiver);
	} }), { baseUrl: ctx.studentOpenmaic.connection.baseUrl });
}
//#endregion
//#region lib/types/agent.js
const name = "student-agent";
const inject = [
	"skills",
	"tools",
	"systemPrompt"
];
/** Register domain Skills and tools for the preset lifetime.
* @param context - preset-scoped host services.
*/
function apply(context) {
	context.effect(() => context.skills.registerProvider(() => createStudySkillProvider()), "student: skills");
	context.systemPrompt.section({
		name: "student-panel",
		order: 45,
		text: "For each Student learning request, load study and read study_status once. The latest consumed native.inputs[].intention contains the compact panel request, selected goal and original answer identity. Honor that selection; it is user intent, not verified file state or assessment. Never interpret a navigation/start/help message as an answer. Save original answers before grading. New learning requires a full openmaic_generate classroom; use references/unit-courses.md for material checks and course ownership."
	});
	registerNativeCapture(context);
	registerStudyTools(context);
	context.plugin(agent_exports);
}
//#endregion
export { apply, inject, name };
