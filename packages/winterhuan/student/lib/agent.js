import { a as queryWorkspace } from "./queries-DiF4-X5v.js";
import { t as readStudentWorkspace } from "./transport-Bq3tBhRM.js";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { z } from "zod";
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
	const versions = [...result.versions.filter((file) => paths.includes(file.path)), ...result.versions.filter((file) => !paths.includes(file.path))];
	return {
		...result,
		versions: versions.slice(0, 20),
		omittedVersions: Math.max(0, versions.length - 20),
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
				description: "status (default) returns validated status and learning context; learning-context returns current block/question, saved responses, pending assessment, selected scope, target facts/method and at most three seeds; files pages official file identities and paths; settings returns term setup; summary returns seven Shanghai calendar days; collections page 20 records with offset. curriculum needs subject (grade and term browse another map); elements needs subject and returns question-writing elements, exercises and the hint ladder; exercises pages shipped and workspace exercises (optional subject, unit or id/objectiveId); diagnose returns check-in plans (grade, term or unit narrow the scope); review-sheet needs subject; weak lists weak points."
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
			const { read, native: source, backupIssues } = await readStudentWorkspace(exec);
			const now = Date.now();
			const active = read.workspace?.blocks.find((block) => block.endedAt === void 0);
			const paths = [
				".study/settings.json",
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
			const context = boundedRead(queryWorkspace(read, { kind: "learning-context" }, now), paths);
			if (context.data) {
				const data = z.record(z.string(), z.unknown()).parse(context.data);
				const responses = z.array(z.record(z.string(), z.unknown())).parse(data.responses);
				const saved = z.record(z.string(), z.unknown()).nullable().parse(data.savedResponse);
				const selected = responses.filter((response) => response.id === saved?.id);
				data.responses = selected;
				data.omittedResponses = responses.length - selected.length;
				data.assessments = data.savedAssessment ? [data.savedAssessment] : [];
				context.data = data;
			}
			if (args.kind === "learning-context") result.data = context.data;
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
				inputs: source.inputs.slice(),
				admissions: source.admissions.slice(),
				omitted: source.omitted,
				omittedAdmissions: source.omittedAdmissions,
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
//#region lib/types/agent.js
const name = "student-agent";
const inject = ["skills", "tools"];
/** Register domain Skills and tools for the preset lifetime.
* @param context - preset-scoped host services.
*/
function apply(context) {
	context.effect(() => context.skills.registerProvider(() => createStudySkillProvider()), "student: skills");
	registerStudyTools(context);
}
//#endregion
export { apply, inject, name };
