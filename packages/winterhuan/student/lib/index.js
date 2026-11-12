import { G as commandSchema, P as readInteractiveLessons, n as queryDashboard } from "./queries-6rHAUo8u.js";
import { n as studyStore, t as StudyConflict } from "./store-S8OaZETN.js";
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
