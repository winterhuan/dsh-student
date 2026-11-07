import { n as queryStudy, r as studyStore, s as updateNotices, y as commandSchema } from "./store-CH4u_IXC.js";
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
/** Project the shared validated input into DSH's schema DSL; numeric/string bounds stay in Zod. */
function toolSchema(input) {
	if (typeof input === "boolean") throw new Error("Study inputs require explicit value schemas.");
	const variants = input.oneOf ?? input.anyOf;
	if (variants) {
		const [first, second, ...rest] = variants.map(toolSchema);
		if (!first || !second) throw new Error("Study actions require at least two branches.");
		return { oneOf: [
			first,
			second,
			...rest
		] };
	}
	if (input.type === "object") {
		const properties = {};
		for (const [key, value] of Object.entries(input.properties ?? {})) properties[key] = {
			...toolSchema(value),
			...input.required?.includes(key) ? { required: true } : {}
		};
		return {
			type: "object",
			additionalProperties: false,
			properties
		};
	}
	if (input.type === "array") {
		if (!input.items || Array.isArray(input.items)) throw new Error("Study arrays require one item schema.");
		return {
			type: "array",
			items: toolSchema(input.items)
		};
	}
	if (input.type === "string") return {
		type: "string",
		...typeof input.const === "string" ? { const: input.const } : {},
		...input.enum ? { enum: z.array(z.string()).parse(input.enum) } : {}
	};
	if (input.type === "integer" || input.type === "number") return { type: "integer" };
	throw new Error(`Unsupported study input schema type: ${String(input.type)}`);
}
/** Register bounded lookup and validated mutations with DSH's normal logged tool runtime. */
function registerStudyTools(context) {
	context.tools.register(defineTool({
		name: "study_status",
		description: "Read this workspace's learner profile, learning records and derived suggestions. Call it before each learning step. The study skill owns how to teach, write questions and grade; load it before tutoring.",
		parameters: {
			kind: {
				type: "string",
				enum: [
					"status",
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
				description: "status (default) returns elapsed time, interests, interestFocus, top weak points, one recommendation, dueToday (at most two) and openmaic.baseUrl plus the lesson-log path; collections page 20 records with offset. curriculum needs subject (grade and term browse another map); elements needs subject and returns question-writing elements, exercises and the hint ladder; exercises pages shipped and workspace exercises (optional subject, unit or id/objectiveId); diagnose returns check-in plans (grade, term or unit narrow the scope); review-sheet needs subject; weak lists weak points."
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
			return z.json().parse(queryStudy(await studyStore(exec), args.kind ?? "status", offset, {
				...args.id !== void 0 ? { id: args.id } : {},
				...args.subject !== void 0 ? { subject: args.subject } : {},
				...args.unit !== void 0 ? { unit: args.unit } : {},
				...args.grade !== void 0 ? { grade: args.grade } : {},
				...args.term !== void 0 ? { term: args.term } : {}
			}));
		}
	}));
	context.tools.register(defineTool({
		name: "study_update",
		description: "Save one learning change in this workspace. One action per call; confirmation text must quote the user when provided. Identical retries succeed; reusing an id for different content fails; a conflicting field is rejected with the expected value. Do not edit .study/state.json directly.",
		parameters: { change: {
			...toolSchema(z.toJSONSchema(commandSchema)),
			required: true,
			description: "One action. Numeric bounds are schema-enforced. setup creates or updates the learner profile; courses, school progress, interests and openmaic-settings are parent-configured; interests saves theme tags only, and openmaic-settings saves only the base URL, not lesson rows. task, answer, hint, stuck and record run inside an active block; paper actions grade printed sheets; save-exercise and delete-exercise manage the workspace exercise bank. The study skill owns each action's rules."
		} },
		output: {
			schema: { type: "json" },
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		isConcurrencySafe: () => false,
		async execute(args, exec) {
			const status = z.json().parse(queryStudy(await studyStore(exec, args.change), "status", 0));
			const notices = updateNotices(args.change);
			if (notices.length === 0 || typeof status !== "object" || status === null) return status;
			const prior = "notices" in status && Array.isArray(status.notices) ? status.notices.filter((item) => typeof item === "string") : [];
			return {
				...status,
				notices: [...prior, ...notices]
			};
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
