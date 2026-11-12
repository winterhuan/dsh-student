import { _ as studyInsight, a as weeklySummary, c as readInteractiveLessons, d as itemObjectiveId, f as objectiveInfo, g as insightSummary, h as diagnosticFor, i as studyStatus, l as checkInHistory, m as sheetOpen, p as reviewPlan, r as studyStore, s as interactiveLessonsView, t as StudyConflict, u as curriculumView, v as commandSchema } from "./store-PcpFOtoN.js";
import { z } from "zod";
import { FsError } from "@deepseek-ai/dsh-fs";
import { SessionId } from "@deepseek-ai/dsh-session";
/** Actions the workbench panel may submit directly; tutor assessment and rewards stay with the model tools. */
const panelActions = new Set(Object.entries({
	setup: true,
	material: false,
	course: false,
	"configure-course": true,
	"school-progress": true,
	"archive-term": true,
	"openmaic-settings": true,
	interests: true,
	start: true,
	task: false,
	answer: true,
	hint: true,
	stuck: true,
	record: false,
	stop: true,
	mistake: false,
	"confirm-mistake": true,
	"delete-mistake": true,
	"save-exercise": true,
	"delete-exercise": true,
	concept: false,
	"confirm-concept": true,
	objective: false,
	relation: false,
	"link-mistake": true,
	"classify-mistake": true,
	worksheet: false,
	"paper-draft": false,
	"grade-sheet": true,
	"confirm-paper": true,
	"discard-sheet": true,
	"workbook-draft": false,
	"confirm-workbook": true,
	"dismiss-teaching": true
}).filter(([, allowed]) => allowed).map(([action]) => action));
//#endregion
//#region lib/types/dashboard.js
/**
* Bounded sidebar projection: status, the selected subject's knowledge map with mastery,
* weak points, the next step and one page of the mistake notebook.
* @param state - current durable learning state, or undefined before setup.
* @param now - host wall-clock time in milliseconds.
* @param options - selected subject, notebook offset and status filter, an optional grade and term to browse another knowledge map, and an optional check-in scope (grade, term, unit).
* @returns the dashboard payload served to the workbench.
*/
function dashboard(state, now, options = {}, interactiveLessons = interactiveLessonsView(state?.openmaic?.baseUrl)) {
	if (!state) return {
		serverNow: now,
		revision: 0,
		study: null,
		interactiveLessons
	};
	const subject = options.subject ?? "math";
	const mistakeOffset = options.mistakeOffset ?? 0;
	const mistakeStatus = options.mistakeStatus ?? "all";
	const status = studyStatus(state, now);
	const insight = studyInsight(state, now);
	const scope = options.mapGrade !== void 0 || options.mapTerm !== void 0 ? {
		grade: options.mapGrade ?? state.profile.grade,
		term: options.mapTerm ?? state.profile.term
	} : void 0;
	const inStatus = (item) => {
		if (item.confirmedAt === void 0) return false;
		if (mistakeStatus === "due") return item.dueAt !== void 0 && item.dueAt <= now;
		if (mistakeStatus === "reviewing") return item.stage < 4;
		if (mistakeStatus === "mastered") return item.stage >= 4;
		return true;
	};
	const confirmed = state.mistakes.filter((item) => item.subject === subject && inStatus(item)).reverse();
	const confirmedOffset = Math.min(mistakeOffset, Math.max(0, Math.ceil(confirmed.length / 20) - 1) * 20);
	const book = state.mistakes.filter((item) => item.subject === subject && item.confirmedAt !== void 0);
	const due = status.dueMistakes.filter((item) => item.subject === subject);
	const pending = state.mistakes.filter((item) => item.subject === subject && item.confirmedAt === void 0);
	return {
		serverNow: now,
		revision: state.revision,
		study: {
			...status,
			progress: status.progress.filter((item) => item.subject === subject).slice(-20),
			concepts: state.concepts.filter((item) => item.subject === subject).slice(-20).reverse(),
			objectives: state.objectives.filter((item) => item.subject === subject).slice(-20).reverse(),
			relations: state.relations.filter((item) => state.concepts.some((concept) => concept.id === item.fromId && concept.subject === subject)).slice(-20),
			worksheets: state.worksheets.filter((item) => item.subject === subject && item.discardedAt === void 0).slice(-20).reverse().map((sheet) => {
				const titles = [...new Set(sheet.items.map((item) => objectiveInfo(state, itemObjectiveId(state, sheet, item) ?? "")?.title).filter((title) => title !== void 0))];
				return {
					...sheet,
					objectiveTitle: titles.length <= 2 ? titles.join("、") : `${titles.slice(0, 2).join("、")}等 ${titles.length} 个目标`,
					open: sheetOpen(state, sheet),
					results: state.paperResults.filter((item) => item.worksheetId === sheet.id).map((item) => {
						const question = sheet.items.find((question) => question.id === item.itemId);
						const errorType = state.mistakes.find((mistake) => mistake.id === question?.mistakeId)?.errorType;
						return {
							itemId: item.itemId,
							result: item.result,
							response: item.response,
							assistance: item.assistance,
							...errorType !== void 0 ? { errorType } : {}
						};
					}),
					drafts: state.paperDrafts.filter((item) => item.worksheetId === sheet.id).map((item) => ({
						itemId: item.itemId,
						response: item.response,
						result: item.result,
						assistance: item.assistance,
						uncertainties: item.uncertainties,
						...item.errorType !== void 0 ? { errorType: item.errorType } : {},
						...item.confidence !== void 0 ? { confidence: item.confidence } : {}
					})),
					sources: sheet.items.map((item) => {
						const mistake = item.mistakeId ? state.mistakes.find((candidate) => candidate.id === item.mistakeId) : void 0;
						const fromHere = mistake?.source?.worksheetId === sheet.id && mistake.source.itemId === item.id;
						return {
							itemId: item.id,
							...item.mistakeId && !fromHere ? { mistakeId: item.mistakeId } : {},
							topic: fromHere ? "" : mistake?.topic ?? "",
							stage: mistake?.stage ?? 0
						};
					})
				};
			}),
			reviewPlan: (({ picks, objectiveFills, remaining, unlinkedDue, openSheets }) => ({
				picks: picks.length,
				fills: objectiveFills.length,
				remaining,
				unlinkedDue: unlinkedDue.length,
				openSheets: openSheets.length
			}))(reviewPlan(state, subject, now, 8, insight)),
			dueMistakes: due.slice(0, 20),
			dueCount: due.length,
			dueTotal: status.dueMistakes.length,
			dueSubjects: due.length ? [subject] : [],
			pendingMistakes: pending.slice(0, 20),
			pendingCount: pending.length,
			confirmedMistakes: confirmed.slice(confirmedOffset, confirmedOffset + 20),
			confirmedCount: confirmed.length,
			confirmedOffset,
			confirmedSubject: subject,
			mistakeBook: {
				due: book.filter((item) => item.dueAt !== void 0 && item.dueAt <= now).length,
				reviewing: book.filter((item) => item.stage < 4 && (item.dueAt === void 0 || item.dueAt > now)).length,
				mastered: book.filter((item) => item.stage >= 4).length,
				pending: pending.length
			},
			curriculum: (() => {
				const view = curriculumView(state, subject, insight, scope);
				return view === null ? null : lighten(view, options.tab);
			})(),
			diagnostic: insight.diagnostics.find((plan) => plan.subject === subject) ?? null,
			scopedDiagnostic: options.diagGrade !== void 0 || options.diagTerm !== void 0 ? diagnosticFor(state, subject, now, {
				grade: options.diagGrade ?? state.profile.grade,
				term: options.diagTerm ?? state.profile.term,
				...options.diagUnit !== void 0 && options.diagUnit !== "" ? { units: [options.diagUnit] } : {}
			}, insight) : null,
			scopedUnits: options.diagGrade !== void 0 || options.diagTerm !== void 0 ? curriculumView(state, subject, insight, {
				grade: options.diagGrade ?? state.profile.grade,
				term: options.diagTerm ?? state.profile.term
			})?.units.map((unit) => ({
				id: unit.id,
				name: unit.name
			})) ?? [] : [],
			checkIns: checkInHistory(state),
			...insightSummary(insight),
			...(() => {
				const step = insight.subjectSteps[subject];
				return {
					recommendation: step.recommendation,
					dueToday: step.dueToday,
					dueBacklog: step.dueBacklog,
					weakPoints: step.weakPoints.slice(0, 3).map((item) => ({
						id: item.id,
						subject: item.subject,
						title: item.title,
						level: item.level,
						priority: item.priority,
						reasons: item.reasons
					})),
					understandingReminders: insight.understandingReminders.filter((item) => item.subject === subject)
				};
			})(),
			weekly: weeklySummary(state, now, insight),
			diagnostics: insight.diagnostics,
			materials: state.materials.filter((item) => state.courses.some((course) => course.materialId === item.id)),
			exercises: state.exercises.filter((item) => item.subject === subject).slice(-20).reverse(),
			workbookDrafts: state.workbookDrafts.filter((item) => item.subject === subject).slice(-20).reverse(),
			workbookResults: state.workbookResults.filter((item) => item.subject === subject).slice(-20).reverse(),
			teachingQueue: state.teachingQueue.filter((item) => item.subject === subject).slice(-20).reverse(),
			recentAttempts: state.attempts.filter((item) => item.subject === subject).slice(-20).reverse()
		},
		interactiveLessons
	};
}
/** Drop the heavy map collections unless the map tab asked for them; objectives, units and summary stay for progress dots and goal lists. */
function lighten(view, tab) {
	if (tab === void 0 || tab === "map") return view;
	return {
		...view,
		concepts: [],
		relations: [],
		ideas: [],
		order: [],
		lite: true
	};
}
//#endregion
//#region lib/types/route.js
const mutation = z.object({
	revision: z.number().int().nonnegative(),
	change: commandSchema
}).strict();
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
async function body(request, limit) {
	if (!request.headers["content-type"]?.startsWith("application/json")) throw new Error("请求必须使用 JSON");
	const chunks = [];
	let size = 0;
	for await (const chunk of request) {
		const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += bytes.length;
		if (size > limit) throw new Error("提交内容过长");
		chunks.push(bytes);
	}
	return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
/** The UI can submit learner actions and the parent's marks on a printed sheet; tutor assessment and rewards stay with the model tools. */
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
		if (url.pathname !== "/student/workspace" || !["GET", "POST"].includes(request.method ?? "")) {
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
		const agent = await context.typert.lookups.get("agent")?.resolve(SessionId(rawId));
		if (!agent || agent.session.header.parentSession || agent.session.header.origin === "subagent") {
			send(response, 404, { error: "请在主会话中打开学习工作区" });
			return;
		}
		let change;
		let revision;
		if (request.method === "POST") {
			if (!request.headers["content-type"]?.startsWith("application/json")) {
				send(response, 415, { error: "请求必须使用 JSON" });
				return;
			}
			const input = mutation.parse(await body(request, 65536));
			if (!panelActions.has(input.change.action)) {
				send(response, 403, { error: "该操作需要学习助手核对" });
				return;
			}
			change = input.change;
			revision = input.revision;
		}
		const state = await studyStore({
			agent,
			signal: abort.signal
		}, change, revision);
		const interactiveLessons = await readInteractiveLessons(agent, abort.signal, state?.openmaic?.baseUrl);
		send(response, 200, {
			...dashboard(state, Date.now(), {
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
		send(response, error instanceof StudyConflict || error instanceof FsError && ["FS_STALE_VERSION", "FS_NOT_OBSERVED"].includes(error.code) ? 409 : error instanceof Error && error.message === "提交内容过长" ? 413 : 400, { error: error instanceof z.ZodError ? "请填写完整且有效的学习资料" : error instanceof Error ? error.message : "学习档案暂时无法读取" });
	} finally {
		response.off("close", onClose);
	}
}
/** Optional web integration leaves the same plugin usable in terminal sessions. */
function registerStudyRoute(context) {
	context.inject(["webServer", "typert"], (ctx) => {
		ctx.effect(() => ctx.webServer.register({
			kind: "prefix",
			path: "/student",
			handler: (request, response) => handleStudyRequest(ctx, request, response)
		}), "student: workspace API");
	});
}
//#endregion
//#region lib/types/index.js
/** Independent student plugin identity. */
const name = "student";
/** The workspace route mounts when its Host services become available. */
const inject = [];
/** Register the learning workspace API for the Host lifetime. */
function apply(context) {
	registerStudyRoute(context);
}
//#endregion
export { apply, inject, name };
