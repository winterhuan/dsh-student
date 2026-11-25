import { z } from "zod";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
//#region lib/types/files/cache.js
/** Read-only adapters retain their own observations; application adapters share a disposable Host owner. */
var StudyReadCache = class {
	files = /* @__PURE__ */ new Map();
	backups = /* @__PURE__ */ new Map();
	queries = /* @__PURE__ */ new Map();
	legacy = /* @__PURE__ */ new Map();
	entities = /* @__PURE__ */ new Map();
	/** Release retained source bytes and every derived projection together. */
	clear() {
		this.files.clear();
		this.backups.clear();
		this.queries.clear();
		this.legacy.clear();
		this.entities.clear();
	}
};
//#endregion
//#region lib/types/capability-schema.js
/** Capability contracts shared by the browser and Host. Packaged content is loaded by the Host. */
/** Stable capability, family and source IDs admit dots; entity filenames retain their existing alphabet. */
const knowledgeIdSchema = z.string().regex(/^[a-zA-Z0-9_.-]{1,80}$/u);
const text$4 = z.string().trim().min(1).max(4e3);
const ids$1 = z.array(knowledgeIdSchema).max(500);
const subject$3 = z.enum([
	"chinese",
	"math",
	"english"
]);
/** The tested range is explicit; a broader range never inherits merely by goal name. */
const capabilityScopeSchema = z.object({
	id: knowledgeIdSchema,
	description: text$4,
	modality: z.enum([
		"written",
		"oral",
		"listening",
		"audiovisual",
		"performed"
	]),
	numberMax: z.number().int().positive().max(1e4).optional(),
	vocabulary: z.array(text$4.max(240)).max(2e3).optional()
}).strict();
/** Reviewed capability, mother and learning range; classification alone grants no answer evidence. */
const capabilityBindingSchema = z.object({
	goalId: knowledgeIdSchema,
	familyId: knowledgeIdSchema,
	scope: capabilityScopeSchema
}).strict();
/** Source-backed capability with criteria, prerequisites and independent course associations. */
const capabilityGoalSchema = z.object({
	id: knowledgeIdSchema,
	subject: subject$3,
	domain: knowledgeIdSchema,
	title: text$4,
	scope: text$4,
	criterion: text$4,
	prerequisites: ids$1,
	familyIds: ids$1,
	sourceIds: ids$1,
	curriculumAssociationIds: ids$1,
	titleEn: text$4.optional(),
	criterionEn: text$4.optional(),
	curriculumAssociationGap: text$4.optional(),
	coverageStatus: text$4.optional(),
	activation: text$4.optional(),
	evidenceRequirements: z.array(text$4).max(20).optional(),
	progressKind: text$4.optional(),
	prerequisitePolicy: text$4.optional(),
	requirementIds: ids$1.optional(),
	sourceLocators: z.array(z.object({
		sourceId: knowledgeIdSchema,
		pdfPages: z.array(z.number().int().positive()).max(120).optional(),
		section: text$4
	}).strict()).max(20).optional()
}).strict();
/** One method/structure family owns exactly one representative exercise. Stimuli are blueprints, not completed media evidence. */
const questionFamilySchema = z.object({
	id: knowledgeIdSchema,
	subject: subject$3,
	coreMethod: text$4,
	structure: text$4,
	goalIds: ids$1.min(1),
	variationAxes: z.array(text$4).min(1).max(20),
	boundary: text$4,
	representative: z.object({
		id: knowledgeIdSchema,
		prompt: text$4,
		rubric: text$4,
		stimulus: z.json().optional()
	}).strict(),
	signature: z.object({
		capabilityIds: ids$1.min(1),
		coreMethod: text$4,
		problemStructure: text$4
	}).strict()
}).strict();
/** Workspace content extensions stay in the existing collection; this is not a second question bank. */
const knowledgeExtensionSchema = z.object({
	goals: z.array(capabilityGoalSchema).max(1e3),
	families: z.array(questionFamilySchema).max(1e3)
}).strict();
//#endregion
//#region lib/types/interests.js
/** Example tags used when a profile has not saved its own list. */
const DEFAULT_INTEREST_TAGS = [
	"购物超市钱",
	"运动球类",
	"动物宠物",
	"故事角色动画",
	"积木拼搭手工",
	"美食做饭"
];
/** One saved tag: 2–16 Han characters, letters or digits, with no spaces. */
const INTEREST_TAG = /^[\p{Script=Han}A-Za-z0-9]{2,16}$/u;
/** Tags the tutor and the desk should use: the saved list, or the examples when none is saved. */
function interestTagsOf(saved) {
	return saved !== void 0 && saved.length >= 3 ? [...saved] : [...DEFAULT_INTEREST_TAGS];
}
/**
* The tag to wrap first today. The Shanghai calendar day rotates through the list so the same scene is not used every day.
* @param tags - the effective tag list.
* @param day - `YYYY-MM-DD` in the teaching timezone.
*/
function interestFocus(tags, day) {
	const list = tags.length > 0 ? tags : DEFAULT_INTEREST_TAGS;
	let hash = 0;
	for (const char of day) hash = hash * 33 + char.charCodeAt(0) >>> 0;
	return list[hash % list.length] ?? DEFAULT_INTEREST_TAGS[0];
}
//#endregion
//#region lib/types/vocabulary.js
/**
* Subject-scoped learning vocabularies shared by the host schemas and the workbench.
*
* Kept free of schema dependencies so client code can import the lists without pulling zod.
* @module @winterhuan/dsh-student/vocabulary
*/
/** Error causes offered for math mistakes. */
const mathErrorTypes = [
	"carry-borrow",
	"place-value",
	"operation-choice",
	"calculation",
	"unit-quantity",
	"reading-task",
	"pattern",
	"geometry-feature",
	"money-measure",
	"reasoning-incomplete"
];
/** Error causes offered for Chinese mistakes. */
const chineseErrorTypes = [
	"pinyin-tone",
	"character-form",
	"character-usage",
	"word-meaning",
	"reading-evidence",
	"order",
	"expression-incomplete",
	"punctuation",
	"listening"
];
/** Error causes offered for English mistakes. */
const englishErrorTypes = [
	"spelling",
	"word-meaning",
	"word-form",
	"sentence-pattern",
	"usage-context",
	"listening",
	"spoken-response",
	"writing-complete"
];
/** Error causes offered for one subject; the parent can change any classification. */
const errorTypesBySubject = {
	math: mathErrorTypes,
	chinese: chineseErrorTypes,
	english: englishErrorTypes
};
/** Daily-practice focuses offered for Chinese units. */
const chineseFocus = [
	"literacy",
	"pinyin",
	"reading",
	"writing",
	"review"
];
/** Daily-practice focuses offered for math units. */
const mathFocus = [
	"concepts",
	"calculation",
	"geometry",
	"measurement",
	"review"
];
/** Daily-practice focuses offered for English units. */
const englishFocus = [
	"words",
	"sentences",
	"story",
	"listen",
	"project",
	"review"
];
/** Daily-practice focuses offered for one subject's units. */
const focusBySubject = {
	chinese: chineseFocus,
	math: mathFocus,
	english: englishFocus
};
//#endregion
//#region lib/types/schema.js
const text$3 = z.string().trim().min(1).max(2e3);
const id$1 = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const time$1 = z.number().int().nonnegative();
const subject$2 = z.enum([
	"chinese",
	"math",
	"english"
]);
const stepText = z.string().trim().min(1).max(240);
/** Deduplicate enum source values while keeping the tuple type `z.enum` requires. */
function enumValues(values) {
	const [first, ...rest] = [...new Set(values)];
	if (first === void 0) throw new Error("枚举不能为空。");
	return [first, ...rest];
}
/** Model-suggested cause of one mistake; the parent can review and change it in the panel. */
const errorTypeSchema = z.enum(enumValues([
	...mathErrorTypes,
	...chineseErrorTypes,
	...englishErrorTypes
]));
/** How far one review question departs from the original mistake. */
const variantSchema = z.enum([
	"numeric",
	"context",
	"reasoning"
]);
/** How a unit is practised daily, per subject; drives the subject-routine view. */
const unitFocusSchema = z.enum(enumValues([
	...chineseFocus,
	...mathFocus,
	...englishFocus
]));
/** Which variation axes one objective supports. */
const variationAxisSchema = z.enum([
	"numbers",
	"context",
	"representation",
	"reverse",
	"explain"
]);
/** One printable sheet's role; absent keeps the legacy title heuristic. */
const sheetKindSchema = z.enum([
	"daily",
	"practice",
	"review"
]);
/** One exercise item's pedagogical role in diagnosis, Simon four-step teaching, or daily routines. */
const exerciseRoleSchema = z.enum([
	"diagnose",
	"demo",
	"try",
	"vary",
	"daily"
]);
/** Allowed methods for confirmed custom goals; shared by file validation and settings handlers. */
const customObjectiveMethods = {
	chinese: [
		"recognize",
		"read-evidence",
		"express"
	],
	math: [
		"represent",
		"reason",
		"verify"
	],
	english: [
		"context",
		"listen",
		"speak"
	]
};
const scope$1 = z.object({
	region: text$3,
	grade: z.number().int().min(1).max(6),
	term: z.enum(["first", "second"]),
	schoolYear: text$3,
	schoolSystem: z.enum(["five-four", "six-three"])
}).strict();
const profile = scope$1.extend({
	nickname: text$3,
	schoolAlias: z.string().trim().max(2e3),
	parentConfirmation: text$3.default("家长已确认学习档案")
}).strict();
const material = z.object({
	id: id$1,
	subject: subject$2,
	scope: scope$1,
	title: text$3,
	publisher: text$3,
	edition: text$3,
	editionStatus: z.enum(["unconfirmed", "identified"]),
	kind: z.enum([
		"official-textbook",
		"school-material",
		"reference",
		"generated"
	]),
	locator: text$3,
	evidence: text$3
}).strict();
const schoolProgress = z.object({
	unitId: id$1,
	confirmedAt: time$1,
	posture: z.enum(["keep-up", "catch-up"]),
	preview: z.boolean(),
	pace: z.enum(["teaching", "review"])
}).strict();
const courseInput = z.object({
	subject: subject$2,
	materialId: id$1,
	unit: text$3,
	parentConfirmation: text$3.default("家长已确认教材与当前单元")
}).strict();
const course = courseInput.extend({ progress: schoolProgress.optional() }).strict();
const mistake = z.object({
	id: id$1,
	subject: subject$2,
	topic: text$3,
	prompt: text$3,
	learnerAnswer: text$3,
	correction: text$3,
	explanation: text$3,
	answerEvidence: text$3,
	imagePath: text$3.optional(),
	uncertainties: z.string().max(2e3),
	materialId: id$1.optional(),
	objectiveId: knowledgeIdSchema.optional(),
	errorType: errorTypeSchema.optional()
}).strict();
const concept = z.object({
	id: id$1,
	subject: subject$2,
	name: text$3,
	definition: text$3,
	example: text$3,
	source: text$3,
	facts: z.array(stepText).min(2).max(8).optional(),
	misconceptions: z.array(text$3).max(3).optional()
}).strict();
const objective = z.object({
	id: id$1,
	subject: subject$2,
	title: text$3,
	goal: text$3,
	conceptIds: z.array(id$1).min(1).max(5),
	method: z.enum([
		"recognize",
		"read-evidence",
		"express",
		"represent",
		"reason",
		"verify",
		"context",
		"listen",
		"speak"
	]),
	errorTypes: z.array(errorTypeSchema).max(4).optional(),
	questionPoints: z.array(text$3).max(4).optional(),
	variationAxes: z.array(variationAxisSchema).max(4).optional()
}).strict();
const relation = z.object({
	id: id$1,
	fromId: id$1,
	toId: id$1,
	kind: z.enum([
		"prerequisite",
		"part-of",
		"contrast",
		"explains",
		"cause-effect"
	]),
	explanation: text$3,
	source: text$3
}).strict();
const label = z.string().trim().max(24);
const count = (max) => z.number().int().min(0).max(max);
const denomination = z.enum([
	"1分",
	"2分",
	"5分",
	"1角",
	"2角",
	"5角",
	"1元",
	"5元",
	"10元",
	"20元",
	"50元",
	"100元"
]);
const sketchPoint = z.object({
	x: z.number().int().min(0).max(480),
	y: z.number().int().min(0).max(259)
}).strict();
const sketchElement = z.discriminatedUnion("draw", [
	z.object({
		draw: z.literal("line"),
		from: sketchPoint,
		to: sketchPoint
	}).strict(),
	z.object({
		draw: z.literal("polyline"),
		points: z.array(sketchPoint).min(2).max(12),
		closed: z.enum(["yes", "no"]).optional()
	}).strict(),
	z.object({
		draw: z.literal("rect"),
		x: z.number().int().min(0).max(480),
		y: z.number().int().min(0).max(259),
		width: z.number().int().min(1).max(480),
		height: z.number().int().min(1).max(259)
	}).strict(),
	z.object({
		draw: z.literal("circle"),
		x: z.number().int().min(0).max(480),
		y: z.number().int().min(0).max(259),
		radius: z.number().int().min(2).max(80)
	}).strict(),
	z.object({
		draw: z.literal("text"),
		x: z.number().int().min(0).max(480),
		y: z.number().int().min(0).max(259),
		label,
		align: z.enum(["left", "center"]).optional()
	}).strict(),
	z.object({
		draw: z.literal("arrow"),
		from: sketchPoint,
		to: sketchPoint
	}).strict()
]);
/** Printable figures drawn by the SVG renderer; an empty label prints an answer box. */
const figureSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("bar-model"),
		bars: z.array(z.object({
			name: label,
			segments: z.array(z.object({
				label,
				units: z.number().int().min(1).max(20),
				style: z.enum(["solid", "dashed"]).optional()
			}).strict()).min(1).max(4),
			total: label.optional()
		}).strict()).min(1).max(3)
	}).strict(),
	z.object({
		kind: z.literal("money"),
		items: z.array(z.union([denomination, z.object({
			denomination,
			count: z.number().int().min(1).max(9)
		}).strict()])).min(1).max(16)
	}).strict(),
	z.object({
		kind: z.literal("place-value"),
		tens: count(9),
		ones: count(9),
		crossTens: count(9),
		crossOnes: count(19),
		regroup: z.enum(["yes", "no"])
	}).strict(),
	z.object({
		kind: z.literal("hundred-chart"),
		hidden: z.array(z.number().int().min(1).max(100)).max(20).optional(),
		window: z.object({ center: z.number().int().min(12).max(89) }).strict().optional()
	}).strict(),
	z.object({
		kind: z.literal("number-line"),
		from: z.number().int().min(-999).max(9999),
		to: z.number().int().min(-999).max(9999),
		step: z.number().int().min(1).max(100),
		marks: z.array(z.object({
			value: z.number().int(),
			label: label.optional()
		}).strict()).max(4).optional(),
		jumps: z.array(z.object({
			from: z.number().int(),
			to: z.number().int(),
			label: label.optional()
		}).strict()).max(3).optional()
	}).strict(),
	z.object({
		kind: z.literal("clock"),
		clocks: z.array(z.object({
			hour: z.number().int().min(1).max(12),
			minute: z.number().int().min(0).max(59)
		}).strict()).min(1).max(2)
	}).strict(),
	z.object({
		kind: z.literal("sticks"),
		bundles: count(9),
		singles: count(9),
		crossBundles: count(9).optional(),
		crossSingles: count(9).optional()
	}).strict(),
	z.object({
		kind: z.literal("vertical"),
		count: z.number().int().min(1).max(3)
	}).strict(),
	z.object({
		kind: z.literal("shapes"),
		rows: z.array(z.object({
			name: label,
			shape: z.enum([
				"circle",
				"square",
				"triangle"
			]),
			count: count(20),
			blank: count(20)
		}).strict()).min(1).max(3)
	}).strict(),
	z.object({
		kind: z.literal("overlap"),
		left: label,
		right: label,
		leftOnly: label,
		both: label,
		rightOnly: label,
		total: label.optional()
	}).strict(),
	z.object({
		kind: z.literal("split"),
		parts: z.array(z.object({
			top: label,
			left: label,
			right: label
		}).strict()).min(1).max(3)
	}).strict(),
	z.object({
		kind: z.literal("sequence"),
		items: z.array(z.object({
			shape: z.enum([
				"circle",
				"square",
				"triangle",
				"star"
			]),
			count: z.number().int().min(1).max(6)
		}).strict()).min(1).max(6),
		blank: count(6).optional()
	}).strict(),
	z.object({
		kind: z.literal("wall"),
		rows: z.array(z.array(label).min(1).max(5)).min(2).max(5)
	}).strict(),
	z.object({
		kind: z.literal("grid"),
		columns: z.array(label).min(1).max(8).optional(),
		rows: z.array(z.object({
			name: label.optional(),
			cells: z.array(label).min(1).max(8)
		}).strict()).min(1).max(8)
	}).strict(),
	z.object({
		kind: z.literal("dot-array"),
		rows: z.number().int().min(1).max(9),
		columns: z.number().int().min(1).max(9),
		total: label.optional()
	}).strict(),
	z.object({
		kind: z.literal("plane"),
		items: z.array(z.object({
			shape: z.enum([
				"circle",
				"triangle",
				"square",
				"rectangle",
				"quadrilateral",
				"curved"
			]),
			count: z.number().int().min(1).max(4)
		}).strict()).min(1).max(6),
		mark: z.enum(["yes", "no"])
	}).strict(),
	z.object({
		kind: z.literal("solid"),
		items: z.array(z.object({
			shape: z.enum([
				"cube",
				"cuboid",
				"cylinder",
				"sphere"
			]),
			count: z.number().int().min(1).max(4)
		}).strict()).min(1).max(6),
		mark: z.enum(["yes", "no"])
	}).strict(),
	z.object({
		kind: z.literal("counter"),
		hundreds: count(9),
		tens: count(9),
		ones: count(9)
	}).strict(),
	z.object({
		kind: z.literal("measure"),
		bars: z.array(z.object({
			name: label,
			length: z.number().int().min(1).max(15),
			style: z.enum(["straight", "curved"]).optional()
		}).strict()).min(1).max(3),
		ruler: z.enum(["yes", "no"])
	}).strict(),
	z.object({
		kind: z.literal("compass"),
		blank: z.enum(["yes", "no"])
	}).strict(),
	z.object({
		kind: z.literal("balance"),
		left: label,
		right: label,
		tilt: z.enum([
			"left",
			"right",
			"level"
		])
	}).strict(),
	z.object({
		kind: z.literal("writing"),
		style: z.enum(["tianzige", "fourline"]),
		count: z.number().int().min(1).max(8).optional(),
		example: label.optional()
	}).strict(),
	z.object({
		kind: z.literal("sketch"),
		height: z.number().int().min(40).max(260),
		elements: z.array(sketchElement).min(1).max(24)
	}).strict()
]).superRefine((value, context) => {
	const fail = (message) => context.addIssue({
		code: "custom",
		message
	});
	if (value.kind === "money") {
		if (value.items.reduce((sum, item) => sum + (typeof item === "string" ? 1 : item.count), 0) > 30) fail("钱币图最多展示 30 枚。");
	}
	if (value.kind === "hundred-chart") {
		if (value.window !== void 0 && value.hidden !== void 0) fail("百数表不能同时使用隐藏格和邻域窗口。");
		if (value.window !== void 0 && ((value.window.center - 1) % 10 < 1 || (value.window.center - 1) % 10 > 8)) fail("邻域窗口的中心数必须避开百数表左右边界。");
	}
	if (value.kind === "number-line") {
		if (value.from >= value.to) fail("数轴的起点必须小于终点。");
		if ((value.to - value.from) % value.step !== 0) fail("数轴的步长必须整除区间长度。");
		for (const mark of value.marks ?? []) if (mark.value < value.from || mark.value > value.to) fail("数轴标注必须落在区间内。");
		for (const jump of value.jumps ?? []) if (jump.from < value.from || jump.from > value.to || jump.to < value.from || jump.to > value.to) fail("数轴跳数必须落在区间内。");
	}
	if (value.kind === "sticks" && ((value.crossBundles ?? 0) > value.bundles || (value.crossSingles ?? 0) > value.singles)) fail("划去的小棒不能多于画出的小棒。");
	if (value.kind === "place-value") {
		if (value.regroup === "yes" && (value.crossTens > 0 || value.crossOnes > 0)) fail("退位点子图不划线：退位过程配计数器或竖式，划线数数用 regroup \"no\"。");
		if (value.regroup === "no" && (value.crossTens > value.tens || value.crossOnes > value.ones)) fail("划掉的点不能多于画出的点。");
	}
	if (value.kind === "wall") {
		for (const [index, row] of value.rows.entries()) if (row.length !== index + 1) fail("数墙第一行一格、每往下一行多一格。");
	}
	if (value.kind === "grid") {
		const width = value.rows[0]?.cells.length ?? 0;
		if (value.rows.some((row) => row.cells.length !== width)) fail("方格表每行的格子数要一致。");
		if (value.columns !== void 0 && value.columns.length !== width) fail("方格表的表头列数要和每行一致。");
	}
	if (value.kind === "clock") {
		for (const item of value.clocks) if (item.minute % 5 !== 0) fail("钟面的分钟只画到 5 分的刻度。");
	}
	if ((value.kind === "plane" || value.kind === "solid") && value.items.reduce((sum, item) => sum + item.count, 0) > 12) fail("一行图形最多 12 个。");
	if (value.kind === "sketch") {
		for (const element of value.elements) if ((element.draw === "line" || element.draw === "arrow" ? [element.from, element.to] : element.draw === "polyline" ? element.points : element.draw === "circle" ? [{
			x: element.x,
			y: element.y + element.radius
		}] : element.draw === "rect" ? [{
			x: element.x,
			y: element.y + element.height
		}] : [{
			x: element.x,
			y: element.y
		}]).some((point) => point.y > value.height)) fail("简笔画的笔画不能超出画布高度。");
	}
});
const figure = figureSchema;
/** One structured exercise item shared by the shipped exercise bank and the workspace collection. */
const exerciseItemSchema = z.object({
	id: id$1,
	subject: subject$2,
	objectiveId: knowledgeIdSchema,
	role: exerciseRoleSchema,
	variant: variantSchema,
	prompt: text$3,
	choices: z.array(text$3).min(2).max(4).optional(),
	figure: figure.optional(),
	steps: z.array(stepText).min(2).max(4),
	answer: text$3,
	explanation: text$3,
	answerEvidence: text$3,
	errorType: errorTypeSchema.optional()
}).strict();
const workspaceExerciseInput = z.object({
	id: id$1,
	subject: subject$2,
	objectiveId: knowledgeIdSchema,
	role: exerciseRoleSchema.default("try"),
	variant: variantSchema.default("numeric"),
	prompt: text$3,
	choices: z.array(text$3).min(2).max(4).optional(),
	figure: figure.optional(),
	steps: z.array(stepText).min(2).max(4),
	answer: text$3,
	explanation: text$3,
	answerEvidence: text$3,
	errorType: errorTypeSchema.optional()
}).strict();
/** One step of teaching the current task: show, guide, independent try, then a variation. */
const phaseSchema = z.enum([
	"demo",
	"guide",
	"try",
	"vary"
]);
const attemptResult = z.enum([
	"correct",
	"partial",
	"incorrect",
	"unassessed",
	"stuck"
]);
const assistance = z.enum([
	"independent",
	"hint",
	"worked-example",
	"unknown"
]);
const attemptBody = {
	id: id$1,
	sessionId: id$1,
	subject: subject$2,
	topic: text$3,
	prompt: text$3,
	response: text$3,
	feedback: text$3,
	answerEvidence: text$3,
	mistakeId: id$1.optional(),
	objectiveId: knowledgeIdSchema.optional(),
	variant: variantSchema.optional(),
	figure: figure.optional()
};
const attempt = z.object({
	...attemptBody,
	result: attemptResult,
	assistance
}).strict();
/** A record may omit assistance; the saved attempt always stores the resolved value. */
const recordAttempt = z.object({
	...attemptBody,
	result: attemptResult,
	assistance: assistance.optional()
}).strict();
const task = z.object({
	id: id$1,
	sessionId: id$1,
	subject: subject$2,
	topic: text$3,
	prompt: text$3,
	choices: z.array(text$3).min(2).max(4).optional(),
	steps: z.array(stepText).min(2).max(5).optional(),
	phase: phaseSchema.optional(),
	variant: variantSchema.optional(),
	mistakeId: id$1.optional(),
	objectiveId: knowledgeIdSchema.optional(),
	figure: figure.optional()
}).strict();
const answerSpace = z.enum([
	"none",
	"line",
	"lines",
	"box"
]);
const worksheetItem = z.object({
	id: id$1,
	objectiveId: knowledgeIdSchema.optional(),
	mistakeId: id$1.optional(),
	variant: variantSchema.optional(),
	prompt: text$3,
	figure: figure.optional(),
	space: answerSpace.optional(),
	answer: text$3,
	explanation: text$3,
	answerEvidence: text$3
}).strict();
const worksheet = z.object({
	id: id$1,
	subject: subject$2,
	kind: sheetKindSchema.optional(),
	objectiveId: knowledgeIdSchema.optional(),
	items: z.array(worksheetItem).min(1).max(8)
}).strict();
const result = z.enum([
	"correct",
	"partial",
	"incorrect",
	"unassessed"
]);
const paperResult = z.object({
	worksheetId: id$1,
	itemId: id$1,
	response: text$3,
	result,
	assistance,
	feedback: text$3,
	answerEvidence: text$3,
	userConfirmation: text$3.default("家长在面板批改")
}).strict();
const paperDraft = z.object({
	worksheetId: id$1,
	itemId: id$1,
	response: text$3,
	result,
	assistance,
	uncertainties: z.string().max(2e3),
	errorType: errorTypeSchema.optional(),
	confidence: z.enum(["high", "low"]).optional()
}).strict();
const gradeSheet = z.object({
	worksheetId: id$1,
	results: z.array(z.object({
		itemId: id$1,
		result: z.enum([
			"correct",
			"partial",
			"incorrect"
		]),
		response: text$3.optional(),
		assistance: assistance.optional(),
		errorType: errorTypeSchema.optional()
	}).strict()).min(1).max(8),
	userConfirmation: text$3.default("家长在面板批改")
}).strict();
const workbookOutcome = z.enum([
	"stuck",
	"hinted",
	"independent-wrong",
	"independent-correct"
]);
const workbookDraft = z.object({
	id: id$1,
	subject: subject$2,
	prompt: text$3,
	response: text$3.optional(),
	outcome: workbookOutcome,
	objectiveId: knowledgeIdSchema.optional(),
	uncertainties: z.string().max(2e3),
	imagePath: text$3.optional()
}).strict();
const teachingItem = z.object({
	id: id$1,
	subject: subject$2,
	prompt: text$3,
	objectiveId: knowledgeIdSchema.optional(),
	confirmedAt: time$1,
	sourceDraftId: id$1.optional()
}).strict();
const schoolProgressInput = z.object({
	unitId: id$1,
	posture: z.enum(["keep-up", "catch-up"]),
	preview: z.enum(["on", "off"]),
	pace: z.enum(["teaching", "review"]),
	parentConfirmation: text$3.default("家长确认学校进度")
}).strict();
/** Validated mutations; confirmation fields record user statements, not authenticated identities. */
const commandSchema = z.discriminatedUnion("action", [
	z.object({
		action: z.literal("setup"),
		profile
	}).strict(),
	z.object({
		action: z.literal("material"),
		material
	}).strict(),
	z.object({
		action: z.literal("course"),
		course: courseInput
	}).strict(),
	z.object({
		action: z.literal("start"),
		id: id$1,
		subject: subject$2,
		mode: z.enum([
			"foundation",
			"school",
			"review",
			"explore",
			"diagnose"
		]),
		intensity: z.enum([
			"light",
			"standard",
			"deep"
		]).optional(),
		scope: z.object({
			grade: z.number().int().min(1).max(6),
			term: z.enum(["first", "second"]),
			units: z.array(id$1).max(20).optional(),
			objectiveIds: z.array(knowledgeIdSchema).max(60).optional()
		}).strict().optional()
	}).strict(),
	z.object({
		action: z.literal("task"),
		task
	}).strict(),
	z.object({
		action: z.literal("answer"),
		taskId: id$1,
		response: text$3
	}).strict(),
	z.object({
		action: z.literal("hint"),
		taskId: id$1
	}).strict(),
	z.object({
		action: z.literal("configure-course"),
		material,
		course: courseInput,
		progress: schoolProgressInput.optional()
	}).strict(),
	z.object({
		action: z.literal("school-progress"),
		subject: subject$2,
		...schoolProgressInput.shape
	}).strict(),
	z.object({
		action: z.literal("record"),
		attempt: recordAttempt
	}).strict(),
	z.object({
		action: z.literal("stuck"),
		taskId: id$1
	}).strict(),
	z.object({
		action: z.literal("stop"),
		sessionId: id$1,
		reflection: z.string().max(2e3)
	}).strict(),
	z.object({
		action: z.literal("mistake"),
		mistake
	}).strict(),
	z.object({
		action: z.literal("confirm-mistake"),
		id: id$1,
		subject: subject$2.optional(),
		topic: text$3.optional(),
		objectiveId: z.union([id$1, z.literal("")]).optional(),
		prompt: text$3,
		learnerAnswer: text$3.optional(),
		correction: text$3,
		explanation: text$3,
		answerEvidence: text$3,
		errorType: errorTypeSchema.optional(),
		userConfirmation: text$3.default("家长已核对错题与订正")
	}).strict(),
	z.object({
		action: z.literal("delete-mistake"),
		id: id$1
	}).strict(),
	z.object({
		action: z.literal("save-exercise"),
		exercise: workspaceExerciseInput
	}).strict(),
	z.object({
		action: z.literal("delete-exercise"),
		id: id$1
	}).strict(),
	z.object({
		action: z.literal("concept"),
		concept
	}).strict(),
	z.object({
		action: z.literal("confirm-concept"),
		id: id$1,
		definition: text$3.optional(),
		example: text$3.optional(),
		source: text$3.optional(),
		userConfirmation: text$3.default("家长已核对概念")
	}).strict(),
	z.object({
		action: z.literal("objective"),
		objective
	}).strict(),
	z.object({
		action: z.literal("relation"),
		relation
	}).strict(),
	z.object({
		action: z.literal("link-mistake"),
		mistakeId: id$1,
		objectiveId: knowledgeIdSchema
	}).strict(),
	z.object({
		action: z.literal("classify-mistake"),
		mistakeId: id$1,
		errorType: z.union([errorTypeSchema, z.literal("")]).optional()
	}).strict(),
	z.object({
		action: z.literal("worksheet"),
		worksheet
	}).strict(),
	z.object({
		action: z.literal("paper-draft"),
		paperDraft
	}).strict(),
	z.object({
		action: z.literal("grade-sheet"),
		grade: gradeSheet
	}).strict(),
	z.object({
		action: z.literal("confirm-paper"),
		worksheetId: id$1,
		results: z.array(z.object({
			itemId: id$1,
			result: z.enum([
				"correct",
				"partial",
				"incorrect"
			]),
			response: text$3.optional(),
			assistance: assistance.optional(),
			errorType: errorTypeSchema.optional()
		}).strict()).min(1).max(8),
		userConfirmation: text$3.default("家长已核对转录结果")
	}).strict(),
	z.object({
		action: z.literal("discard-sheet"),
		worksheetId: id$1
	}).strict(),
	z.object({
		action: z.literal("workbook-draft"),
		draft: workbookDraft
	}).strict(),
	z.object({
		action: z.literal("confirm-workbook"),
		id: id$1,
		outcome: workbookOutcome.optional(),
		objectiveId: z.union([id$1, z.literal("")]).optional(),
		correction: text$3.optional(),
		explanation: text$3.optional(),
		answerEvidence: text$3.optional(),
		userConfirmation: text$3.default("家长已核对练习册题目")
	}).strict(),
	z.object({
		action: z.literal("dismiss-teaching"),
		id: id$1
	}).strict(),
	z.object({
		action: z.literal("archive-term"),
		parentConfirmation: text$3.default("家长确认归档本学期")
	}).strict(),
	z.object({
		action: z.literal("openmaic-settings"),
		baseUrl: z.string().trim().max(200),
		parentConfirmation: text$3.default("家长确认 OpenMAIC 地址")
	}).strict(),
	z.object({
		action: z.literal("interests"),
		tags: z.array(z.string().trim().regex(INTEREST_TAG)).min(3).max(8),
		parentConfirmation: text$3.default("家长确认兴趣标签")
	}).strict()
]);
/** One learner and term per workspace; previous materials and attempts are retained. */
const stateSchema = z.object({
	format: z.literal(1),
	revision: time$1,
	updatedAt: time$1,
	profile,
	/** Set by archive-term; a state file carrying it reads as absent so a new term can be set up. */
	archivedAt: time$1.optional(),
	materials: z.array(material).max(500),
	courses: z.array(course).max(3),
	sessions: z.array(z.object({
		id: id$1,
		subject: subject$2,
		mode: z.enum([
			"foundation",
			"school",
			"review",
			"explore",
			"diagnose"
		]),
		intensity: z.enum([
			"light",
			"standard",
			"deep"
		]).optional(),
		startedAt: time$1,
		endedAt: time$1.optional(),
		spentMs: time$1.optional(),
		materialId: id$1.optional(),
		unit: text$3.optional(),
		reflection: z.string().max(2e3).optional(),
		scope: z.object({
			grade: z.number().int().min(1).max(6),
			term: z.enum(["first", "second"]),
			units: z.array(id$1).max(20).optional(),
			objectiveIds: z.array(knowledgeIdSchema).max(60).optional()
		}).strict().optional()
	}).strict()).max(5e3),
	attempts: z.array(attempt.extend({
		feedback: z.string().max(2e3),
		at: time$1,
		materialId: id$1.optional(),
		rawResponse: text$3.optional(),
		questionId: id$1.optional(),
		responseId: id$1.optional()
	}).strict()).max(2e4),
	mistakes: z.array(mistake.extend({
		confirmedAt: time$1.optional(),
		userConfirmation: text$3.optional(),
		capability: capabilityBindingSchema.optional(),
		dueAt: time$1.optional(),
		source: z.object({
			worksheetId: id$1,
			itemId: id$1
		}).strict().optional(),
		independentDays: z.array(z.string()).default([]),
		stage: z.number().int().min(0).max(4).default(0)
	}).strict()).max(5e3),
	exercises: z.array(exerciseItemSchema.extend({ savedAt: time$1.optional() }).strict()).max(1e3).default([]),
	concepts: z.array(concept.extend({
		confirmedAt: time$1.optional(),
		userConfirmation: text$3.optional()
	}).strict()).max(1e3).default([]),
	objectives: z.array(objective).max(1e3).default([]),
	relations: z.array(relation).max(2e3).default([]),
	worksheets: z.array(worksheet.extend({
		createdAt: time$1,
		discardedAt: time$1.optional(),
		archivedAt: time$1.optional()
	}).strict()).max(500).default([]),
	paperResults: z.array(paperResult.extend({ receivedAt: time$1 }).strict()).max(4e3).default([]),
	paperDrafts: z.array(paperDraft.extend({ receivedAt: time$1 }).strict()).max(500).default([]),
	workbookDrafts: z.array(workbookDraft.extend({ receivedAt: time$1 }).strict()).max(500).default([]),
	workbookResults: z.array(workbookDraft.extend({
		receivedAt: time$1,
		confirmedAt: time$1,
		userConfirmation: text$3,
		correction: text$3.optional(),
		explanation: text$3.optional(),
		answerEvidence: text$3.optional()
	}).strict()).max(500).default([]),
	teachingQueue: z.array(teachingItem).max(500).default([]),
	/** Parent override for the OpenMAIC origin. Absent means the environment or the localhost default. */
	openmaic: z.object({
		baseUrl: z.string().trim().min(1).max(200),
		parentConfirmation: text$3
	}).strict().optional(),
	/** Parent theme tags. Absent profiles still read the example list; facts stay on the knowledge map. */
	interests: z.object({
		tags: z.array(z.string().trim().regex(INTEREST_TAG)).min(3).max(8),
		parentConfirmation: text$3
	}).strict().optional(),
	rewards: z.array(z.object({
		day: z.string(),
		reason: z.enum(["participation", "reflection"])
	}).strict()).max(1e3),
	task: task.extend({
		response: text$3.optional(),
		rawResponse: text$3.optional(),
		answeredAt: time$1.optional(),
		responseId: id$1.optional(),
		hintLevel: z.number().int().min(0).max(3),
		stuck: z.boolean().optional()
	}).strict().optional()
}).strict();
z.object({
	action: z.literal("archive-term"),
	parentConfirmation: z.string().trim().min(1).max(2e3).default("家长确认归档本学期")
}).strict();
//#endregion
//#region lib/types/capabilities.js
/** Learning content and legacy reference routing; learner responses never belong to this catalog. */
const text$2 = z.string().trim().min(1).max(4e3);
const ids = z.array(knowledgeIdSchema).max(500);
const subject$1 = z.enum([
	"chinese",
	"math",
	"english"
]);
const catalogSchema = knowledgeExtensionSchema.extend({
	formatVersion: z.literal(1),
	status: text$2,
	reconstructedOn: text$2,
	subjects: z.array(subject$1),
	gradeScope: z.array(z.number().int()),
	termScope: z.array(z.enum(["first", "second"]))
}).strict();
const routeSchema = z.object({
	goalId: knowledgeIdSchema,
	familyId: knowledgeIdSchema,
	evidenceGates: z.array(text$2),
	creditPolicy: text$2,
	evidenceUse: text$2
}).strict();
const legacySchema = z.object({
	status: text$2,
	workspaceBanks: text$2,
	objectives: z.array(z.object({
		oldObjectiveId: knowledgeIdSchema,
		oldTitle: text$2,
		subject: subject$1,
		grade: z.number().int(),
		term: z.enum(["first", "second"]),
		unitIds: ids,
		classification: text$2,
		candidateGoalIds: ids,
		scopeStatus: text$2,
		inheritance: text$2
	}).strict()),
	exercises: z.array(z.object({
		oldExerciseId: knowledgeIdSchema,
		oldObjectiveId: knowledgeIdSchema,
		subject: subject$1,
		originalPrompt: text$2,
		originalRecordPolicy: text$2,
		routes: z.array(routeSchema),
		pendingReasons: z.array(text$2),
		automationStatus: text$2,
		routePolicy: text$2.optional()
	}).strict()),
	sourceFingerprints: z.array(z.object({
		path: text$2,
		sha256: z.string().regex(/^[a-f0-9]{64}$/u)
	}).strict())
}).strict();
const moduleUrl$1 = import.meta.url;
function immutable(value) {
	if (value && typeof value === "object" && !Object.isFrozen(value)) {
		for (const child of Object.values(value)) immutable(child);
		Object.freeze(value);
	}
	return value;
}
const read = (name) => JSON.parse(readFileSync(new URL(`../knowledge/curriculum/capabilities/${name}.json`, moduleUrl$1), "utf8"));
function signature(family) {
	return JSON.stringify([
		family.subject,
		[...family.signature.capabilityIds].sort(),
		family.signature.coreMethod.trim(),
		family.signature.problemStructure.trim()
	]);
}
function validateCatalog(catalog) {
	const goals = new Map(catalog.goals.map((goal) => [goal.id, goal]));
	const families = new Map(catalog.families.map((family) => [family.id, family]));
	if (goals.size !== catalog.goals.length || families.size !== catalog.families.length) throw new Error("Knowledge IDs must be unique.");
	const mothers = /* @__PURE__ */ new Set();
	const signatures = /* @__PURE__ */ new Set();
	for (const family of catalog.families) {
		if (mothers.has(family.representative.id) || signatures.has(signature(family))) throw new Error(`Duplicate mother or question family: ${family.id}`);
		mothers.add(family.representative.id);
		signatures.add(signature(family));
		if (family.coreMethod !== family.signature.coreMethod || family.structure !== family.signature.problemStructure || JSON.stringify([...family.goalIds].sort()) !== JSON.stringify([...family.signature.capabilityIds].sort())) throw new Error(`Family signature disagrees with its method, structure or capabilities: ${family.id}`);
		for (const goalId of family.goalIds) {
			const goal = goals.get(goalId);
			if (!goal || goal.subject !== family.subject || !goal.familyIds.includes(family.id)) throw new Error(`Family references an incompatible capability: ${family.id} / ${goalId}`);
		}
	}
	const sourceIds = new Set(knowledgeSources().sources.map((source) => source.id));
	for (const goal of catalog.goals) for (const id of goal.sourceIds) if (!sourceIds.has(id)) throw new Error(`Missing capability source: ${goal.id} / ${id}`);
	const active = /* @__PURE__ */ new Set();
	const visited = /* @__PURE__ */ new Set();
	const visit = (id) => {
		if (active.has(id)) throw new Error(`Capability prerequisites contain a cycle: ${id}`);
		if (visited.has(id)) return;
		const goal = goals.get(id);
		if (!goal) throw new Error(`Missing prerequisite capability: ${id}`);
		active.add(id);
		for (const prerequisite of goal.prerequisites) visit(prerequisite);
		active.delete(id);
		visited.add(id);
	};
	for (const goal of catalog.goals) {
		for (const id of goal.familyIds) if (!families.get(id)?.goalIds.includes(goal.id)) throw new Error(`Capability references an incompatible family: ${goal.id} / ${id}`);
		visit(goal.id);
	}
}
/**
* Resolve built-in and workspace content into one effective capability/family index.
* @param extension - content in the existing workspace collection, without learner facts.
* @returns deeply frozen borrowed content and canonical family aliases; incompatible duplicates throw.
*/
function effectiveKnowledge(extension) {
	if (!extension) return immutable({
		goals: shipped.goals,
		families: shipped.families,
		familyAliases: {}
	});
	const parsed = knowledgeExtensionSchema.parse(extension);
	const goals = new Map(shipped.goals.map((goal) => [goal.id, goal]));
	for (const goal of parsed.goals) {
		const previous = goals.get(goal.id);
		if (previous && JSON.stringify(previous) !== JSON.stringify(goal)) throw new Error(`Workspace capability conflicts with built-in content: ${goal.id}`);
		goals.set(goal.id, goal);
	}
	const families = [...shipped.families];
	const familyAliases = {};
	for (const family of parsed.families) {
		const sameId = families.find((item) => item.id === family.id);
		if (sameId && signature(sameId) !== signature(family)) throw new Error(`Workspace family conflicts with an existing identity: ${family.id}`);
		const sameType = families.find((item) => signature(item) === signature(family));
		if (sameType) {
			if (sameType.id !== family.id) familyAliases[family.id] = sameType.id;
			continue;
		}
		families.push(family);
	}
	const catalog = {
		goals: [...goals.values()].map((goal) => ({
			...goal,
			familyIds: [...new Set(goal.familyIds.map((id) => familyAliases[id] ?? id).concat(families.filter((family) => family.goalIds.includes(goal.id)).map((family) => family.id)))]
		})),
		families
	};
	validateCatalog(catalog);
	return immutable({
		...catalog,
		familyAliases
	});
}
/**
* Resolve an old course or exercise identity, retaining uncertainty for unenumerated workspace banks.
* @param kind - course objective or concrete source exercise.
* @param oldId - exact preserved identity.
* @returns deeply frozen borrowed candidate routes and evidence requirements, never mastery credit.
*/
function resolveLegacyReference(kind, oldId) {
	if (kind === "objective") {
		const item = legacy.objectives.find((item) => item.oldObjectiveId === oldId);
		return immutable({
			kind,
			oldId,
			status: "pending",
			candidateGoalIds: item?.candidateGoalIds ?? [],
			routes: [],
			pendingReasons: [item?.inheritance ?? "Unknown legacy objective; inspect the preserved source before assigning a capability."]
		});
	}
	const item = legacy.exercises.find((item) => item.oldExerciseId === oldId);
	return immutable({
		kind,
		oldId,
		status: item?.routes.length ? "review-required" : "pending",
		candidateGoalIds: [...new Set(item?.routes.map((route) => route.goalId) ?? [])],
		routes: item?.routes ?? [],
		pendingReasons: item?.pendingReasons ?? ["Unknown workspace exercise; inspect its method, structure and tested scope."],
		...item ? { originalPrompt: item.originalPrompt } : {}
	});
}
/**
* Check whether independently tested evidence covers a requested range.
* @param tested - original demonstrated modality and range.
* @param requested - current teaching range; missing range facts cannot establish compatibility.
* @returns true for the same modality and a contained numeric/vocabulary range, or the exact unexpanded scope.
*/
function scopeSupports(tested, requested) {
	if (tested.modality !== requested.modality) return false;
	if (requested.numberMax !== void 0 && (tested.numberMax === void 0 || tested.numberMax < requested.numberMax)) return false;
	if (requested.vocabulary !== void 0 && (tested.vocabulary === void 0 || !requested.vocabulary.every((word) => tested.vocabulary?.includes(word)))) return false;
	if (tested.numberMax !== void 0 !== (requested.numberMax !== void 0) || tested.vocabulary !== void 0 !== (requested.vocabulary !== void 0)) return false;
	return requested.numberMax !== void 0 || requested.vocabulary !== void 0 || tested.id === requested.id && tested.description === requested.description;
}
const sources = immutable(z.object({
	retrievedOn: text$2,
	sources: z.array(z.object({
		id: knowledgeIdSchema,
		label: text$2,
		url: text$2.optional(),
		sha256: text$2.optional(),
		pdfPages: z.number().int().positive().optional(),
		retrievedOn: text$2.optional(),
		paths: z.array(text$2).optional(),
		status: text$2.optional()
	}).strict()),
	coverage: z.array(z.json()),
	quantitativeCoverageLedgers: z.array(z.json()),
	scopeCaveats: z.array(text$2)
}).strict().parse(read("sources")));
const legacy = immutable(legacySchema.parse(read("legacy-map")));
const shipped = immutable(catalogSchema.parse(read("catalog")));
validateCatalog(shipped);
/**
* Read immutable packaged curriculum sources, capability decomposition and quantitative activity limits.
* @returns deeply frozen borrowed source locators and coverage policies, never learner evidence.
*/
function knowledgeSources() {
	return sources;
}
//#endregion
//#region lib/types/openmaic/feedback-schema.js
/** Official source identities and frozen snapshots shared by files and authorized readers. */
const sourceId = z.string().min(1).max(500).refine((value) => value !== "." && value !== ".." && !/[\u0000-\u001f]/u.test(value), "Use one opaque source identifier.");
const stamp$1 = z.string().min(1).max(80).refine((value) => Number.isFinite(Date.parse(value)), "Preserve a valid source timestamp.");
const sourceJsonSchema = z.json();
/** Quiz answer representation is preserved without label or option substitution. */
const officialAnswerSchema = z.union([z.string().max(2e3), z.array(z.string().max(2e3)).max(100)]);
/** Original official browser grading, separate from Student effective grading. */
const officialResultSchema = z.object({
	questionId: sourceId,
	correct: z.boolean().nullable(),
	status: z.enum(["correct", "incorrect"]),
	earned: z.number().finite().nonnegative(),
	aiComment: z.string().max(2e3).optional()
}).catchall(sourceJsonSchema);
/** Current official grading record; a correction retains the original response identity. */
const officialReviewSchema = z.object({
	recordId: sourceId,
	seq: z.number().int().nonnegative(),
	createdAt: stamp$1,
	result: officialResultSchema.nullable()
}).strict();
/** An immutable submitted answer; reviewed records belong to its assessment. */
const openmaicResponseSourceSchema = z.object({
	kind: z.literal("openmaic"),
	bindingId: sourceId,
	attemptId: sourceId,
	sceneId: sourceId,
	questionId: sourceId,
	submission: z.object({
		id: sourceId,
		seq: z.number().int().nonnegative(),
		createdAt: stamp$1
	}).strict(),
	submittedAnswer: officialAnswerSchema
}).strict();
/** Original runtime payload and extension fields retained for unresolved source associations. */
const officialRuntimePayloadSchema = z.object({
	payloadVersion: z.literal(1),
	phase: z.enum([
		"draft",
		"submitted",
		"reviewed"
	]),
	answers: z.record(sourceId, officialAnswerSchema),
	results: z.array(officialResultSchema).max(200).optional()
}).catchall(z.json());
/** Complete source event; its ID identifies an event, never a Student answer. */
const officialRuntimeRecordSchema = z.object({
	id: sourceId,
	sessionId: sourceId,
	seq: z.number().int().nonnegative(),
	createdAt: stamp$1,
	sceneId: sourceId.optional(),
	payload: officialRuntimePayloadSchema
}).catchall(z.json());
/** Content freshness is a revision observation, never an answer date. */
const snapshotRevisionSchema = z.discriminatedUnion("kind", [z.object({
	kind: z.literal("manifest"),
	stageRev: z.number().int().nonnegative(),
	sceneRev: z.number().int().nonnegative()
}).strict(), z.object({ kind: z.literal("unavailable") }).strict()]);
/** Exact source question bytes remain frozen when today's content changes. */
const openmaicQuestionSchema = z.object({
	bindingId: sourceId,
	sceneId: sourceId,
	questionId: sourceId,
	snapshot: z.json(),
	snapshotHash: z.string().regex(/^[a-f0-9]{64}$/u),
	revision: snapshotRevisionSchema
}).strict();
/** Original explicit Student ownership returned by the protected source preparation. */
const feedbackBindingSchema = z.object({
	bindingId: sourceId,
	learnerId: knowledgeIdSchema,
	termId: knowledgeIdSchema,
	blockId: knowledgeIdSchema,
	goalId: knowledgeIdSchema,
	familyId: knowledgeIdSchema,
	scope: capabilityScopeSchema
}).strict();
/** Unassociated source facts stay within their original academic owner and never become response evidence. */
const pendingOpenmaicSchema = z.object({
	binding: feedbackBindingSchema,
	record: officialRuntimeRecordSchema,
	reason: z.enum([
		"missing-submission",
		"conflicting-submissions",
		"ambiguous-session",
		"unresolved-question"
	])
}).strict();
/** Agent advances this business checkpoint only after independent consumer acceptance. */
const feedbackCheckpointSchema = z.object({
	bindingId: sourceId,
	attempts: z.array(z.object({
		attemptId: sourceId,
		seq: z.number().int().min(-1)
	}).strict()).max(100)
}).strict().superRefine((checkpoint, ctx) => {
	if (new Set(checkpoint.attempts.map((attempt) => attempt.attemptId)).size !== checkpoint.attempts.length) ctx.addIssue({
		code: "custom",
		path: ["attempts"],
		message: "Keep one checkpoint head per original attempt."
	});
});
/** Parsed frozen official quiz question; passthrough retains source extension fields. */
const officialQuestionSchema = z.object({
	id: sourceId,
	type: z.enum([
		"single",
		"multiple",
		"short_answer"
	]),
	question: z.string().min(1).max(2e3),
	options: z.array(z.object({
		value: z.string().max(2e3),
		label: z.string().max(2e3)
	}).passthrough()).max(100).optional(),
	answer: officialAnswerSchema.optional(),
	analysis: z.string().max(2e3).optional(),
	commentPrompt: z.string().max(2e3).optional(),
	hasAnswer: z.boolean().optional(),
	points: z.number().finite().nonnegative().optional()
}).passthrough();
//#endregion
//#region lib/types/openmaic.js
/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
const DEFAULT_OPENMAIC_BASE = "https://open.maic.chat";
/** Lesson log written by the tutor shell. It is not learning evidence and is not inside state.json. */
const OPENMAIC_LESSONS_PATH = ".study/openmaic-lessons.json";
/** Cookie jar shared by generate, poll, retry and stage reads. Never copy it into chat or state. */
const OPENMAIC_COOKIE_PATH = ".study/openmaic-cookies.txt";
const LESSONS_SHOWN = 20;
const stamp = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u).refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19), "Use an actual UTC lifecycle time.");
const lessonId = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
/**
* Accept an http(s) origin or origin-plus-path. Credentials, queries and hashes are rejected
* so a saved address cannot smuggle a secret.
* @param value - parent input or environment value.
* @returns the normalized base, an empty string when the input is blank, or undefined when it is unsafe.
*/
function normalizeOpenmaicBase(value) {
	const trimmed = value.trim();
	if (trimmed === "") return "";
	let url;
	try {
		url = new URL(trimmed);
	} catch {
		return;
	}
	if (url.username !== "" || url.password !== "") return void 0;
	if (url.protocol !== "http:" && url.protocol !== "https:") return void 0;
	if (url.search !== "" || url.hash !== "") return void 0;
	if (url.hostname === "") return void 0;
	const path = url.pathname.replace(/\/+$/u, "");
	if (path.split("/").includes("..")) return void 0;
	return `${url.protocol}//${url.host}${path}`;
}
/**
* Parent setting wins, then OPENMAIC_BASE, then the default origin.
* An invalid saved or environment value is skipped rather than failing a status read.
* @param saved - the parent's saved base, when present.
* @param env - the OPENMAIC_BASE environment value, when present.
* @returns the first valid base or the default origin.
*/
function effectiveOpenmaicBase(saved, env) {
	const fromSaved = saved !== void 0 && saved !== "" ? normalizeOpenmaicBase(saved) : "";
	if (fromSaved) return fromSaved;
	const fromEnv = env !== void 0 && env !== "" ? normalizeOpenmaicBase(env) : "";
	if (fromEnv) return fromEnv;
	return DEFAULT_OPENMAIC_BASE;
}
/**
* Validate a lesson URL before opening it in the browser.
* @param value - the recorded lesson address.
* @returns an http(s) URL with no embedded credentials, or undefined when it is unsafe or invalid.
*/
function lessonHttpUrl(value) {
	let url;
	try {
		url = new URL(value);
	} catch {
		return;
	}
	if (url.username !== "" || url.password !== "") return void 0;
	if (url.protocol !== "http:" && url.protocol !== "https:") return void 0;
	return url.href;
}
const httpLessonUrl = z.string().trim().max(2e3).refine((value) => lessonHttpUrl(value) !== void 0, "课堂地址需要是 http 或 https URL");
const pollUrl = z.string().trim().max(500).refine((value) => value.startsWith("/") && !value.startsWith("//") || lessonHttpUrl(value) !== void 0, "轮询地址需要是相对路径或 http(s) URL");
/** Strict complete lesson row shared by the application and read-only CLI. */
const lessonSchema = z.object({
	id: lessonId,
	status: z.enum([
		"generating",
		"ready",
		"failed"
	]),
	createdAt: stamp,
	updatedAt: stamp,
	title: z.string().trim().min(1).max(120),
	requirement: z.string().trim().min(1).max(4e3),
	subject: z.enum([
		"chinese",
		"math",
		"english"
	]).optional(),
	objectiveId: knowledgeIdSchema.optional(),
	base: z.string().trim().min(1).max(200).refine((value) => normalizeOpenmaicBase(value) !== void 0 && normalizeOpenmaicBase(value) !== "", "OpenMAIC 地址无效"),
	learnerId: lessonId.optional(),
	termId: lessonId.optional(),
	blockId: lessonId.optional(),
	learnerKey: z.string().trim().min(1).max(200).optional(),
	jobId: z.string().trim().min(1).max(200).optional(),
	pollUrl: pollUrl.optional(),
	runId: z.string().trim().min(1).max(200).optional(),
	commandId: z.string().trim().min(1).max(200).optional(),
	retryable: z.boolean().optional(),
	classroomId: z.string().trim().min(1).max(200).regex(/^\S+$/u).optional(),
	url: httpLessonUrl.optional(),
	warning: z.string().trim().max(1e3).optional(),
	error: z.string().trim().max(1e3).optional(),
	feedback: feedbackBindingSchema.optional(),
	checkpoint: feedbackCheckpointSchema.optional(),
	summary: z.object({
		fetchedAt: stamp,
		outline: z.string().trim().min(1).max(2e3),
		scenes: z.array(z.object({
			title: z.string().trim().min(1).max(120),
			summary: z.string().trim().max(400).optional()
		}).strict()).max(12)
	}).strict().optional()
}).strict().superRefine((lesson, ctx) => {
	if (lesson.feedback && (lesson.feedback.learnerId !== lesson.learnerId || lesson.feedback.termId !== lesson.termId || lesson.feedback.blockId !== lesson.blockId || !lesson.classroomId || !lesson.learnerKey)) ctx.addIssue({
		code: "custom",
		path: ["feedback"],
		message: "Retain the original learner, term, block and classroom source binding."
	});
	if (lesson.checkpoint && lesson.checkpoint.bindingId !== lesson.feedback?.bindingId) ctx.addIssue({
		code: "custom",
		path: ["checkpoint"],
		message: "Checkpoint belongs to the original prepared feedback binding."
	});
	if (lesson.updatedAt < lesson.createdAt) ctx.addIssue({
		code: "custom",
		path: ["updatedAt"],
		message: "Use lifecycle times with update after creation."
	});
});
/** Complete independent OpenMAIC business file; validation checks all eighty possible rows before pagination. */
const lessonFileSchema = z.object({
	format: z.literal(1),
	lessons: z.array(lessonSchema).max(80)
}).strict().superRefine((file, ctx) => {
	const seen = /* @__PURE__ */ new Set();
	const partitions = /* @__PURE__ */ new Map();
	for (const [index, lesson] of file.lessons.entries()) {
		if (seen.has(lesson.id)) ctx.addIssue({
			code: "custom",
			path: [
				"lessons",
				index,
				"id"
			],
			message: "Lesson identities must be unique."
		});
		seen.add(lesson.id);
		if (lesson.feedback && lesson.classroomId && lesson.learnerKey) {
			const partition = JSON.stringify([
				lesson.base,
				lesson.classroomId,
				lesson.learnerKey
			]);
			const owner = JSON.stringify([
				lesson.learnerId,
				lesson.termId,
				lesson.blockId
			]);
			if (partitions.has(partition) && partitions.get(partition) !== owner) ctx.addIssue({
				code: "custom",
				path: [
					"lessons",
					index,
					"feedback"
				],
				message: "One classroom learner partition retains one original Student learner, term and block."
			});
			partitions.set(partition, owner);
		}
	}
});
/**
* Build the settings half of the projection before a file read.
* @param savedBase - the parent's saved base, when present.
* @param lessons - the lesson rows to display; defaults to an empty list.
* @param error - a read failure to display alongside the remaining workbench.
* @returns the lesson rows, resolved base and workspace file paths.
*/
function interactiveLessonsView(savedBase, lessons = [], error) {
	return {
		baseUrl: effectiveOpenmaicBase(savedBase, process.env.OPENMAIC_BASE),
		lessonsPath: OPENMAIC_LESSONS_PATH,
		cookiePath: OPENMAIC_COOKIE_PATH,
		lessons,
		...error !== void 0 ? { error } : {}
	};
}
/**
* Parse every tutor-written lesson row before display pagination. Invalid and duplicate rows are dropped.
* @param text - UTF-8 contents of `.study/openmaic-lessons.json`.
* @returns every independently valid row and an explicit whole-file failure when required.
*/
function parseInteractiveLessons(text) {
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		return {
			lessons: [],
			error: "互动课记录不是有效的 JSON"
		};
	}
	const complete = lessonFileSchema.safeParse(parsed);
	if (complete.success) return { lessons: complete.data.lessons.slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)) };
	const file = z.object({
		format: z.literal(1),
		lessons: z.array(z.unknown()).max(80)
	}).strict().safeParse(parsed);
	if (!file.success) return {
		lessons: [],
		error: "互动课记录格式无法读取"
	};
	const candidates = [];
	let dropped = 0;
	for (const item of file.data.lessons) {
		const lesson = lessonSchema.safeParse(item);
		if (lesson.success) candidates.push(lesson.data);
		else dropped += 1;
	}
	const lessons = candidates.filter((lesson) => candidates.filter((candidate) => candidate.id === lesson.id).length === 1);
	lessons.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
	return {
		lessons,
		error: dropped > 0 ? "有几条互动课记录无法读取，其余仍显示" : "互动课记录的身份或时间无法读取"
	};
}
/**
* Read the lesson log from the session workspace.
* A missing file is an empty list. A bad file sets `error` and does not fail the workspace request.
* The shared reader checks actual versions on both sides; the desk displays at most twenty valid rows.
* @param agent - the session workspace and its filesystem service.
* @param signal - cancels filesystem reads; cancellation rejects the request.
* @param savedBase - the parent's saved base, when present.
* @returns the lesson projection, with an error for an unreadable file.
*/
async function readInteractiveLessons(agent, signal, savedBase) {
	const empty = interactiveLessonsView(savedBase);
	try {
		const fs = agent.ctx?.get("fs");
		const cwd = agent.session?.header?.cwd;
		if (!fs || !cwd) return empty;
		signal.throwIfAborted();
		const root = await fs.resolve(cwd, { signal });
		const target = await fs.resolve(OPENMAIC_LESSONS_PATH, {
			cwd,
			signal
		});
		if (!fs.contains(root, target)) return {
			...empty,
			error: "互动课记录必须位于当前工作区内"
		};
		const read = await readLessonFile({
			async stat(_path, signal) {
				const info = await fs.stat(target, signal);
				return info ? {
					...info,
					targetKey: target.targetKey
				} : void 0;
			},
			async list() {
				return [];
			},
			async read(_path, signal, max) {
				return fs.readBytes(target, signal, max);
			}
		}, signal);
		if (read.status === "missing") return empty;
		return interactiveLessonsView(savedBase, (read.file?.lessons ?? read.validRows ?? []).slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, LESSONS_SHOWN), read.status === "valid" ? void 0 : "互动课记录格式、身份或时间无法读取");
	} catch (error) {
		if (signal.aborted) throw error;
		return {
			...empty,
			error: "互动课记录暂时无法读取"
		};
	}
}
//#endregion
//#region lib/types/files/lessons.js
/** Consistent complete reads for the independent OpenMAIC file. No classroom URL earns learner evidence. */
/**
* Validate every lesson row at one bounded actual file version.
* @param fs - caller's execution-world adapter.
* @param signal - cancels bounded version rereads.
* @returns the complete valid file or explicit failure; performs no repairs or cookie reads.
*/
async function readLessonFile(fs, signal) {
	for (let attempt = 0; attempt < 3; attempt += 1) {
		const before = await fs.stat(OPENMAIC_LESSONS_PATH, signal);
		if (!before) return {
			status: "missing",
			issues: []
		};
		try {
			if (before.type !== "file") throw new Error("Use a regular lesson JSON file.");
			const bytes = await fs.read(OPENMAIC_LESSONS_PATH, signal, 524288);
			const after = await fs.stat(OPENMAIC_LESSONS_PATH, signal);
			if (before.version !== after?.version || before.targetKey !== after.targetKey) continue;
			const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
			const parsed = lessonFileSchema.safeParse(raw);
			if (!parsed.success) return {
				status: typeof raw === "object" && raw !== null && "format" in raw && typeof raw.format === "number" && raw.format > 1 ? "future-format" : "invalid",
				observation: before,
				bytes,
				validRows: parseInteractiveLessons(new TextDecoder().decode(bytes)).lessons,
				issues: parsed.error.issues.slice(0, 100).map((issue) => ({
					path: OPENMAIC_LESSONS_PATH,
					field: issue.path.join("."),
					rule: "lesson-file",
					correction: issue.message
				}))
			};
			return {
				status: "valid",
				file: parsed.data,
				observation: before,
				bytes,
				issues: []
			};
		} catch (error) {
			if (signal.aborted) throw error;
			return {
				status: "invalid",
				observation: before,
				issues: [{
					path: OPENMAIC_LESSONS_PATH,
					field: "",
					rule: "lesson-file",
					correction: error instanceof Error ? error.message : "Preserve the original and repair the lesson file explicitly."
				}]
			};
		}
	}
	return {
		status: "changing",
		issues: [{
			path: OPENMAIC_LESSONS_PATH,
			field: "",
			rule: "changing-read",
			correction: "Finish the lesson write and read again."
		}]
	};
}
//#endregion
//#region lib/types/curriculum.js
const recordId = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const text$1 = z.string().trim().min(1).max(2e3);
const fact = z.string().trim().min(1).max(240);
const subjectSchema = z.enum([
	"chinese",
	"math",
	"english"
]);
const termSchema = z.enum(["first", "second"]);
const methodSchema = z.enum([
	"recognize",
	"read-evidence",
	"express",
	"represent",
	"reason",
	"verify",
	"context",
	"listen",
	"speak"
]);
const relationKindSchema = z.enum([
	"prerequisite",
	"part-of",
	"contrast",
	"explains",
	"cause-effect"
]);
/** Subject methods a shipped learning objective may use; mirrors the state schema. */
const curriculumMethods = {
	chinese: [
		"recognize",
		"read-evidence",
		"express"
	],
	math: [
		"represent",
		"reason",
		"verify"
	],
	english: [
		"context",
		"listen",
		"speak"
	]
};
const ideaSchema = z.object({
	id: recordId,
	name: text$1,
	definition: text$1,
	example: text$1
}).strict();
/** One subject's concepts. A concept is shared by the subject and is not divided by grade or unit. Its definition states only what is required to identify it, and admits one reading. */
const ideaCatalogSchema = z.object({
	subject: subjectSchema,
	ideas: z.array(ideaSchema).min(1).max(240)
}).strict();
/** One subject's shipped exercise bank, validated against shipped objectives and error types. */
const exerciseCatalogSchema = z.object({
	subject: subjectSchema,
	exercises: z.array(exerciseItemSchema).min(1).max(500)
}).strict();
/** One shipped knowledge map: units, knowledge points, objectives and relations for one subject, grade and term. */
const curriculumSchema = z.object({
	id: recordId,
	subject: subjectSchema,
	grade: z.number().int().min(1).max(2),
	term: termSchema,
	title: text$1,
	basis: text$1,
	units: z.array(z.object({
		id: recordId,
		name: text$1,
		summary: text$1,
		focus: unitFocusSchema.optional()
	}).strict()).min(1).max(20),
	concepts: z.array(z.object({
		id: recordId,
		name: text$1,
		unit: recordId,
		definition: text$1,
		example: text$1,
		source: text$1,
		ideaIds: z.array(recordId).max(6).optional(),
		facts: z.array(fact).min(2).max(8).optional(),
		misconceptions: z.array(text$1).max(3).optional(),
		examples: z.array(text$1).max(3).optional()
	}).strict()).min(1).max(80),
	objectives: z.array(z.object({
		id: recordId,
		title: text$1,
		goal: text$1,
		conceptIds: z.array(recordId).min(1).max(5),
		method: methodSchema,
		errorTypes: z.array(errorTypeSchema).max(4).optional(),
		questionPoints: z.array(text$1).max(4).optional(),
		variationAxes: z.array(variationAxisSchema).max(4).optional()
	}).strict()).min(1).max(60),
	relations: z.array(z.object({
		id: recordId,
		fromId: recordId,
		toId: recordId,
		kind: relationKindSchema,
		explanation: text$1,
		source: text$1
	}).strict()).max(120)
}).strict().superRefine((file, context) => {
	const fail = (path, message) => context.addIssue({
		code: "custom",
		path,
		message
	});
	for (const [label, items] of [
		["units", file.units],
		["concepts", file.concepts],
		["objectives", file.objectives],
		["relations", file.relations]
	]) {
		const seen = /* @__PURE__ */ new Set();
		for (const [index, item] of items.entries()) {
			if (seen.has(item.id)) fail([
				label,
				index,
				"id"
			], `重复的 ID：${item.id}`);
			seen.add(item.id);
		}
	}
	const units = new Set(file.units.map((unit) => unit.id));
	const concepts = new Set(file.concepts.map((concept) => concept.id));
	const ideas = new Set(subjectIdeas(file.subject).map((idea) => idea.id));
	for (const [index, concept] of file.concepts.entries()) {
		if (!units.has(concept.unit)) fail([
			"concepts",
			index,
			"unit"
		], `知识点的单元不存在：${concept.unit}`);
		if (concept.ideaIds !== void 0 && new Set(concept.ideaIds).size !== concept.ideaIds.length) fail([
			"concepts",
			index,
			"ideaIds"
		], "概念不能重复");
		for (const [position, ideaId] of (concept.ideaIds ?? []).entries()) if (!ideas.has(ideaId)) fail([
			"concepts",
			index,
			"ideaIds",
			position
		], `知识点引用的概念不存在：${ideaId}`);
	}
	for (const [index, unit] of file.units.entries()) {
		if (!file.concepts.some((concept) => concept.unit === unit.id)) fail(["units", index], `单元没有知识点：${unit.id}`);
		if (unit.focus !== void 0 && !focusBySubject[file.subject].includes(unit.focus)) fail([
			"units",
			index,
			"focus"
		], `单元的日常侧重与科目不符：${unit.focus}`);
	}
	for (const [index, objective] of file.objectives.entries()) {
		if (!curriculumMethods[file.subject].includes(objective.method)) fail([
			"objectives",
			index,
			"method"
		], `学习方法与科目不符：${objective.method}`);
		for (const [position, errorType] of (objective.errorTypes ?? []).entries()) if (!errorTypesBySubject[file.subject].includes(errorType)) fail([
			"objectives",
			index,
			"errorTypes",
			position
		], `错因分类与科目不符：${errorType}`);
		if (objective.errorTypes !== void 0 && new Set(objective.errorTypes).size !== objective.errorTypes.length) fail([
			"objectives",
			index,
			"errorTypes"
		], "错因分类不能重复");
		if (objective.variationAxes !== void 0 && new Set(objective.variationAxes).size !== objective.variationAxes.length) fail([
			"objectives",
			index,
			"variationAxes"
		], "变式维度不能重复");
		for (const [position, conceptId] of objective.conceptIds.entries()) if (!concepts.has(conceptId)) fail([
			"objectives",
			index,
			"conceptIds",
			position
		], `学习目标引用的知识点不存在：${conceptId}`);
	}
	for (const [index, relation] of file.relations.entries()) {
		if (!concepts.has(relation.fromId) || !concepts.has(relation.toId)) fail(["relations", index], `概念关系引用的知识点不存在：${relation.fromId} → ${relation.toId}`);
		if (relation.fromId === relation.toId) fail(["relations", index], "概念关系不能连接自身");
	}
	if (file.id !== `${file.subject}-grade${file.grade}-${file.term}`) fail(["id"], `文件 ID 与科目、年级、学期不符：${file.id}`);
});
const SUBJECTS = [
	"chinese",
	"math",
	"english"
];
const cache = /* @__PURE__ */ new Map();
const ideaCache = /* @__PURE__ */ new Map();
const exerciseCache = /* @__PURE__ */ new Map();
/** Read through a variable so bundler asset rewriting of `new URL(…, import.meta.url)` does not apply to data files. */
const moduleUrl = import.meta.url;
/**
* The concepts of one subject. The same concept is shared by every grade and unit of that subject.
* @param subject - requested subject.
* @returns the validated concept list.
*/
function subjectIdeas(subject) {
	const cached = ideaCache.get(subject);
	if (cached !== void 0) return cached;
	const url = new URL(`../knowledge/curriculum/ideas/${subject}.json`, moduleUrl);
	const file = ideaCatalogSchema.parse(JSON.parse(readFileSync(url, "utf8")));
	if (file.subject !== subject) throw new Error(`概念目录的科目不符：${file.subject}`);
	const seen = /* @__PURE__ */ new Set();
	for (const idea of file.ideas) {
		if (seen.has(idea.id)) throw new Error(`概念目录有重复 ID：${idea.id}`);
		seen.add(idea.id);
	}
	ideaCache.set(subject, file.ideas);
	return file.ideas;
}
function load(subject, grade, term) {
	if (grade < 1 || grade > 2) return void 0;
	const key = `${subject}-grade${grade}-${term}`;
	const cached = cache.get(key);
	if (cached !== void 0) return cached;
	const url = new URL(`../knowledge/curriculum/${key}.json`, moduleUrl);
	const file = curriculumSchema.parse(JSON.parse(readFileSync(url, "utf8")));
	cache.set(key, file);
	return file;
}
/**
* One subject's shipped knowledge map for the profile's grade and term.
* @param scope - learner grade and term.
* @param subject - requested subject.
* @returns the validated map, or undefined outside grades one and two.
*/
function curriculumFor(scope, subject) {
	return load(subject, scope.grade, scope.term);
}
/**
* Every shipped knowledge map for the profile's grade and term, in subject order.
* @param scope - learner grade and term.
* @returns validated maps; empty outside grades one and two.
*/
function curriculumFiles(scope) {
	return SUBJECTS.map((subject) => load(subject, scope.grade, scope.term)).filter((file) => file !== void 0);
}
/**
* All shipped learning objectives for one subject within an arbitrary scope, with unit names resolved.
* @param scope - grade and term to read; may differ from the learner profile.
* @param subject - requested subject.
* @returns resolved objectives; empty outside grades one and two.
*/
function builtinObjectivesIn(scope, subject) {
	const file = load(subject, scope.grade, scope.term);
	if (!file) return [];
	return file.objectives.map((objective) => ({
		...objective,
		subject: file.subject,
		unitName: file.units.find((unit) => unit.id === file.concepts.find((concept) => concept.id === objective.conceptIds[0])?.unit)?.name ?? "",
		unit: file.concepts.find((concept) => concept.id === objective.conceptIds[0])?.unit ?? ""
	}));
}
/**
* Resolve one shipped objective by ID within an arbitrary scope.
* @param scope - grade and term to read; may differ from the learner profile.
* @param subject - requested subject.
* @param objectiveId - objective to resolve.
* @returns the resolved objective, or undefined when it is not shipped for this scope.
*/
function builtinObjectiveIn(scope, subject, objectiveId) {
	return builtinObjectivesIn(scope, subject).find((objective) => objective.id === objectiveId);
}
/**
* All shipped learning objectives for the profile, in subject and map order.
* @param scope - learner grade and term.
* @returns resolved objectives; empty outside grades one and two.
*/
function builtinObjectives(scope) {
	return curriculumFiles(scope).flatMap((file) => builtinObjectivesIn(scope, file.subject));
}
const everyShippedObjective = /* @__PURE__ */ new Map();
/** Index every shipped objective across all twelve maps, in subject, grade and term order. */
function shippedObjectiveIndex() {
	if (everyShippedObjective.size === 0) {
		for (const subject of SUBJECTS) for (const grade of [1, 2]) for (const term of ["first", "second"]) for (const objective of builtinObjectivesIn({
			grade,
			term
		}, subject)) if (!everyShippedObjective.has(objective.id)) everyShippedObjective.set(objective.id, objective);
	}
	return everyShippedObjective;
}
/**
* Resolve one shipped objective by ID across every shipped map, current term or another.
* @param objectiveId - objective to resolve.
* @returns the resolved objective, or undefined when it is not shipped anywhere.
*/
function builtinObjectiveAnywhere(objectiveId) {
	return shippedObjectiveIndex().get(objectiveId);
}
/**
* Resolve one shipped objective by ID within the profile's grade and term.
* @param scope - learner grade and term.
* @param objectiveId - objective to resolve.
* @returns the resolved objective, or undefined when it is not shipped for this scope.
*/
function builtinObjective(scope, objectiveId) {
	return builtinObjectives(scope).find((objective) => objective.id === objectiveId);
}
/**
* Validated shipped exercise items for one subject across grades one and two.
* @param subject - requested subject.
* @returns the validated exercise list.
*/
function subjectExercises(subject) {
	const cached = exerciseCache.get(subject);
	if (cached !== void 0) return cached;
	const url = new URL(`../knowledge/curriculum/exercises/${subject}.json`, moduleUrl);
	const file = exerciseCatalogSchema.parse(JSON.parse(readFileSync(url, "utf8")));
	if (file.subject !== subject) throw new Error(`习题目录的科目不符：${file.subject}`);
	const index = shippedObjectiveIndex();
	const seen = /* @__PURE__ */ new Set();
	for (const item of file.exercises) {
		if (seen.has(item.id)) throw new Error(`习题目录有重复 ID：${item.id}`);
		seen.add(item.id);
		if (item.subject !== subject) throw new Error(`习题科目与目录不符：${item.id}`);
		const objective = index.get(item.objectiveId);
		if (!objective || objective.subject !== subject) throw new Error(`习题引用的学习目标不存在或科目不符：${item.objectiveId}`);
		if (item.errorType !== void 0 && !errorTypesBySubject[subject].includes(item.errorType)) throw new Error(`习题错因分类与科目不符：${item.errorType}`);
	}
	exerciseCache.set(subject, file.exercises);
	return file.exercises;
}
/**
* Shipped exercise items targeting one learning objective.
* @param objectiveId - objective to look up.
* @returns matching shipped exercises, or empty when none exist.
*/
function exercisesForObjective(objectiveId) {
	const objective = builtinObjectiveAnywhere(objectiveId);
	if (!objective) return [];
	return subjectExercises(objective.subject).filter((item) => item.objectiveId === objectiveId);
}
//#endregion
//#region lib/types/learning/shared.js
/** Time and size constants shared by schedule maths, status text and update handlers. */
const MINUTE = 6e4;
const DAY = 864e5;
const OFFSET = 480 * MINUTE;
/** Calendar day for the Shanghai teaching profile, independent of the host timezone. */
function studyDay(at) {
	return new Date(at + OFFSET).toISOString().slice(0, 10);
}
function requireValue(condition, message) {
	if (!condition) throw new Error(message);
}
/** Key order is not part of a record. Retries that only reorder fields match. */
function canonical(value) {
	if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
	if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(Reflect.get(value, key))}`).join(",")}}`;
	return JSON.stringify(value);
}
function sameScope(a, b) {
	return a.region === b.region && a.grade === b.grade && a.term === b.term && a.schoolYear === b.schoolYear && a.schoolSystem === b.schoolSystem;
}
function spent(session, now) {
	if (session.spentMs !== void 0) return session.spentMs;
	const end = session.endedAt ?? now;
	return Math.max(0, end - session.startedAt);
}
/** Case, width and surrounding space are not part of a choice or a copied question. */
function foldText(value) {
	return value.normalize("NFKC").replace(/\u3000/gu, " ").trim().replace(/\s+/gu, " ").toLowerCase();
}
function formatDuration(ms) {
	const total = Math.max(0, Math.round(ms / 1e3));
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	if (minutes === 0) return `${seconds}秒`;
	if (seconds === 0) return `${minutes}分钟`;
	return `${minutes}分${seconds}秒`;
}
function showValue(value) {
	if (value === void 0) return "（无）";
	return typeof value === "string" ? `「${value}」` : JSON.stringify(value);
}
/**
* Match a learner's choice to one published option.
* Letter forms use A for the first option. An ambiguous fold matches none.
* @param choices - options in display order.
* @param input - the learner's text after schema trimming.
* @returns the published option, or undefined when none fits.
*/
function matchChoice(choices, input) {
	const exact = choices.filter((choice) => foldText(choice) === foldText(input));
	if (exact.length === 1) return exact[0] ?? void 0;
	if (exact.length > 1) return exact.find((choice) => choice === input.trim());
	const letter = input.normalize("NFKC").replace(/[\s\u3000]+/gu, "").toLowerCase().match(/^(?:我选择|我选|选择|选的是|选|正确答案是|答案是|答案为|答案|theansweris|option|answer)?[:：]?[(（]?([a-d])[)）.、。:：]?$/u);
	if (!letter?.[1]) return void 0;
	const index = letter[1].charCodeAt(0) - 97;
	return index >= 0 && index < choices.length ? choices[index] : void 0;
}
function choiceMismatch(choices, input) {
	return `请选择题目给出的选项之一。可选：${choices.map((choice, index) => `${String.fromCharCode(65 + index)}. ${choice}`).join("；")}。也可以写 ${choices.map((_, index) => String.fromCharCode(65 + index)).join("、")}，或「A.」「选A」「选择A」「答案是A」。收到：「${input}」。`;
}
function sameSavedAnswer(task, incoming) {
	if (task.response === void 0) return false;
	if (incoming === task.response || incoming === task.rawResponse) return true;
	if (foldText(incoming) === foldText(task.response)) return true;
	if (task.rawResponse !== void 0 && foldText(incoming) === foldText(task.rawResponse)) return true;
	return task.choices !== void 0 && matchChoice(task.choices, incoming) === task.response;
}
function todaySpent(state, now) {
	const start = Date.parse(`${studyDay(now)}T00:00:00+08:00`);
	return state.sessions.reduce((sum, session) => {
		const end = session.endedAt ?? now;
		return sum + Math.max(0, Math.min(end, now) - Math.max(session.startedAt, start));
	}, 0);
}
function activeSession(state) {
	return state.sessions.find((session) => session.endedAt === void 0);
}
/** Parent-confirmed class frontier; the default suggestion range, not a hard gate. Absent progress leaves the whole map in scope. */
function schoolGate(state, subject) {
	const progress = state.courses.find((item) => item.subject === subject)?.progress;
	if (!progress) return void 0;
	const file = curriculumFor(state.profile, subject);
	const index = file?.units.findIndex((unit) => unit.id === progress.unitId) ?? -1;
	if (!file || index < 0) return void 0;
	const previewUnit = progress.preview && progress.pace === "teaching" ? file.units[index + 1]?.id : void 0;
	return {
		taught: new Set(file.units.slice(0, index + 1).map((unit) => unit.id)),
		current: progress.unitId,
		...previewUnit ? { previewUnit } : {},
		posture: progress.posture,
		pace: progress.pace
	};
}
/**
* Whether a map unit may be suggested, sampled, or asked about.
* An explicit session scope overrides the confirmed school frontier; absent both, the whole map is in scope.
* @param state - current durable learning state.
* @param subject - subject the unit belongs to.
* @param unit - map unit id, or '' for a custom goal.
* @param scope - optional session scope selecting a grade, term and units.
* @returns whether the unit is in scope.
*/
function taughtUnit(state, subject, unit, scope) {
	if (unit === "") return true;
	if (scope !== void 0) {
		if (scope.units !== void 0) return scope.units.includes(unit);
		return curriculumFor({
			grade: scope.grade,
			term: scope.term
		}, subject)?.units.some((item) => item.id === unit) ?? false;
	}
	const gate = schoolGate(state, subject);
	if (!gate) return true;
	return gate.taught.has(unit);
}
/**
* Whether a session scope selects an objective: by explicit ID, by unit, or by grade/term map.
* @param scope - session scope from the start command.
* @param subject - subject the objective belongs to.
* @param unit - map unit id, or '' for a custom goal.
* @param objectiveId - objective to test.
* @returns whether the objective is in scope.
*/
function scopeSelects(scope, subject, unit, objectiveId) {
	if (scope.objectiveIds !== void 0) return scope.objectiveIds.includes(objectiveId);
	if (unit === "") return false;
	if (scope.units !== void 0) return scope.units.includes(unit);
	return curriculumFor({
		grade: scope.grade,
		term: scope.term
	}, subject)?.units.some((item) => item.id === unit) ?? false;
}
//#endregion
//#region lib/types/files/schema.js
/** Strict official Student files. Entity identity is independent of file observation and business revision. */
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const text = z.string().min(1).max(2e3);
const time = z.number().int().nonnegative().max(864e13);
const subject = z.enum([
	"chinese",
	"math",
	"english"
]);
const learnerId = id.transform((value) => value);
const termId = id.transform((value) => value);
const blockId = id.transform((value) => value);
const worksheetId = id.transform((value) => value);
const responseId = id.transform((value) => value);
const base = {
	format: z.literal(2),
	termId,
	learnerId: learnerId.optional()
};
const scope = stateSchema.shape.sessions.element.shape.scope.unwrap();
/** Known assistance and unknown assistance remain separate from correctness. */
const assistanceSchema = z.enum([
	"independent",
	"hint",
	"worked-example",
	"unknown"
]);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).refine((value) => {
	const parsed = Date.parse(`${value}T00:00:00+08:00`);
	return Number.isFinite(parsed) && new Date(parsed + 288e5).toISOString().slice(0, 10) === value;
}, "Use an actual calendar date.");
/** Actual answer time; parent day precision never supplies a within-day order. */
const answerDateSchema = z.discriminatedUnion("kind", [
	z.object({ kind: z.literal("unknown") }).strict(),
	z.object({
		kind: z.literal("day"),
		day,
		parentConfirmation: text
	}).strict(),
	z.object({
		kind: z.literal("instant"),
		at: time,
		basis: z.enum(["native-input", "current-manual"]),
		sourceVersion: text
	}).strict()
]);
/** Native input version or preserved source; missing receipt matching is explicitly unknown. */
const responseSourceSchema = z.discriminatedUnion("kind", [
	openmaicResponseSourceSchema,
	z.object({ kind: z.literal("unknown") }).strict(),
	z.object({
		kind: z.literal("native"),
		sessionId: text,
		messageId: text,
		inputVersion: text,
		receiptAt: time.optional(),
		attachments: z.array(text).max(8).optional()
	}).strict(),
	z.object({
		kind: z.literal("paper"),
		imagePaths: z.array(text).max(8),
		parentConfirmation: text
	}).strict(),
	z.object({
		kind: z.literal("manual"),
		entry: z.enum(["current", "historical"]),
		parentConfirmation: text
	}).strict(),
	z.object({
		kind: z.literal("legacy"),
		sourcePath: text,
		row: text
	}).strict()
]);
const target = z.union([knowledgeIdSchema, z.object({
	kind: z.literal("pending"),
	reason: text
}).strict()]);
/** Published question source, including unresolved legacy material. */
const questionSourceSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("authored"),
		description: text
	}).strict(),
	z.object({
		kind: z.literal("exercise"),
		exerciseId: id,
		description: text
	}).strict(),
	z.object({
		kind: z.literal("mistake"),
		mistakeId: id,
		description: text
	}).strict(),
	z.object({
		kind: z.literal("legacy"),
		sourcePath: text,
		row: text
	}).strict()
]);
/** A persisted allowance counts entered mothers and presented instances, independently of answer evidence. */
const learningRoundSchema = z.object({
	id,
	kind: z.enum(["check", "review"]),
	startedAt: time,
	members: z.array(capabilityBindingSchema.extend({ mistakeId: id.optional() })).min(1).max(3),
	enteredFamilyIds: z.array(knowledgeIdSchema).max(3),
	familyEntries: z.array(z.object({
		familyId: knowledgeIdSchema,
		at: time
	}).strict()).max(3).optional(),
	presentedQuestionIds: z.array(id).max(200),
	endedAt: time.optional(),
	endReason: z.enum([
		"complete",
		"budget-exhausted",
		"stopped"
	]).optional(),
	moreReview: z.object({
		afterRoundId: id,
		request: text
	}).strict().optional()
}).strict();
/** References reuse original archived responses without copying or changing their dates. */
const archiveEvidenceReferenceSchema = z.object({
	learnerId,
	termId,
	ownerKind: z.enum(["block", "worksheet"]),
	ownerId: id,
	responseId,
	goalId: knowledgeIdSchema,
	scope: capabilityScopeSchema,
	review: z.object({
		mistakeId: id,
		stage: z.number().int().min(0).max(4),
		dueAt: time,
		independentDays: z.array(day).max(1e3)
	}).strict().optional()
}).strict();
/** Published question content reused by blocks and worksheets, including every supported figure. */
const questionSchema = z.object({
	id,
	objectiveId: target,
	capability: capabilityBindingSchema.optional(),
	mistakeId: id.optional(),
	source: questionSourceSchema,
	topic: text,
	prompt: text,
	answer: text,
	explanation: text,
	answerEvidence: text,
	openmaic: openmaicQuestionSchema.optional(),
	basisStatus: z.literal("legacy-pending").optional(),
	legacyRecord: z.json().optional(),
	choices: z.array(text).min(2).max(4).optional(),
	steps: z.array(text.max(240)).min(2).max(5).optional(),
	figure: figureSchema.optional(),
	phase: phaseSchema.optional(),
	variant: variantSchema.optional(),
	space: z.enum([
		"none",
		"line",
		"lines",
		"box"
	]).optional()
}).strict();
/** Original learner wording and its actual date; assessments cannot replace these fields. */
const responseSchema = z.object({
	id: responseId,
	questionId: id,
	rawResponse: text,
	response: text.optional(),
	legacyRecord: z.json().optional(),
	assistance: assistanceSchema,
	assistanceConfirmation: text.optional(),
	answerDateConfirmation: text.optional(),
	answerDate: answerDateSchema.optional(),
	source: responseSourceSchema
}).strict();
/** The current assessment of one response. A correction replaces this entry under the same response identity. */
const assessmentSchema = z.object({
	id,
	responseId,
	result: z.enum([
		"correct",
		"partial",
		"incorrect",
		"unassessed",
		"stuck"
	]),
	assistance: assistanceSchema,
	feedback: text,
	answerEvidence: text,
	assessedAt: time,
	correctedAt: time.optional(),
	criteria: z.array(z.enum([
		"basic",
		"method",
		"variation"
	])).min(1).max(3).optional(),
	criterionCorrection: z.object({
		sessionId: text,
		messageId: text,
		inputVersion: text,
		rawResponse: text
	}).strict().optional(),
	userConfirmation: text.optional(),
	errorType: errorTypeSchema.optional(),
	official: officialReviewSchema.optional(),
	officialHistory: z.array(officialReviewSchema).max(2e3).optional(),
	grading: z.enum([
		"aligned",
		"equivalent",
		"conflict",
		"pending"
	]).optional()
}).strict();
const pending = z.object({
	sourcePath: text,
	row: text,
	fields: z.array(text).min(1).max(20),
	reason: text
}).strict();
/** One term owns profile, material, course and compound school-progress settings. */
const termSettingsSchema = z.object({
	...base,
	kind: z.literal("term-settings"),
	revision: time,
	updatedAt: time,
	profile: stateSchema.shape.profile.extend({ parentConfirmation: text }),
	materials: stateSchema.shape.materials,
	courses: z.array(stateSchema.shape.courses.element.extend({ parentConfirmation: text })).max(3),
	learningScopes: z.array(z.object({
		subject,
		goalIds: z.array(knowledgeIdSchema).min(1).max(100).optional(),
		scope: capabilityScopeSchema,
		parentConfirmation: text
	}).strict()).max(30).optional(),
	interests: stateSchema.shape.interests,
	openmaic: stateSchema.shape.openmaic,
	archivedAt: time.optional(),
	evidenceReferences: z.array(archiveEvidenceReferenceSchema).max(2e4).optional(),
	migration: z.object({
		sourcePath: text,
		sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u),
		backupPath: text
	}).strict().optional()
}).strict();
/** One block owns its historical course context, questions, responses, hints and assessments. */
const blockSchema = z.object({
	...base,
	kind: z.literal("block"),
	id: blockId,
	subject,
	mode: stateSchema.shape.sessions.element.shape.mode,
	intensity: stateSchema.shape.sessions.element.shape.intensity,
	startedAt: time,
	endedAt: time.optional(),
	spentMs: time.optional(),
	reflection: z.string().max(2e3).optional(),
	context: z.object({
		profile: stateSchema.shape.profile.optional(),
		pendingProfile: text.optional(),
		scope: scope.optional(),
		material: stateSchema.shape.materials.element.optional()
	}).strict(),
	plan: z.object({
		day,
		taskId: id
	}).strict().optional(),
	currentQuestionId: id.optional(),
	questions: z.array(questionSchema).max(200),
	responses: z.array(responseSchema).max(500),
	currentResponseId: responseId.optional(),
	rounds: z.array(learningRoundSchema).max(100).optional(),
	answerReveals: z.array(z.object({
		questionId: id,
		at: time
	}).strict()).max(200).optional(),
	hints: z.array(z.object({
		questionId: id,
		responseId: responseId.optional(),
		level: z.number().int().min(1).max(3),
		at: time
	}).strict()).max(500),
	stuckSignals: z.array(z.object({
		questionId: id,
		at: time
	}).strict()).max(200).optional(),
	assessments: z.array(assessmentSchema).max(500),
	pendingLegacy: z.array(pending).max(500).optional(),
	pendingOpenmaic: z.array(pendingOpenmaicSchema).max(2e3).optional()
}).strict();
/** One worksheet owns frozen question targets, photo drafts and all confirmed workbook outcomes. */
const worksheetSchema = z.object({
	...base,
	kind: z.literal("worksheet"),
	id: worksheetId,
	subject,
	worksheetKind: sheetKindSchema.optional(),
	origin: z.enum(["prepared", "workbook"]),
	createdAt: time,
	discardedAt: time.optional(),
	archivedAt: time.optional(),
	context: z.object({
		profile: stateSchema.shape.profile.optional(),
		pendingProfile: text.optional(),
		scope: scope.optional()
	}).strict(),
	answerDate: answerDateSchema.optional(),
	items: z.array(questionSchema).min(1).max(8),
	responses: z.array(responseSchema).max(500),
	assessments: z.array(assessmentSchema).max(500),
	drafts: z.array(z.object({
		id,
		questionId: id,
		response: text,
		result: assessmentSchema.shape.result,
		assistance: assistanceSchema,
		confidence: z.enum(["high", "low"]),
		uncertainties: z.string().max(2e3),
		imagePaths: z.array(text).max(8),
		receivedAt: time
	}).strict()).max(500),
	pendingLegacy: z.array(pending).max(500).optional()
}).strict();
/** Bounded non-block collections with explicit ownership; rewards have one calendar day/reason identity. */
const collectionsSchema = z.object({
	...base,
	kind: z.literal("collections"),
	knowledge: knowledgeExtensionSchema.optional(),
	legacyHistory: z.array(z.object({
		sourcePath: text,
		row: text,
		record: z.json()
	}).strict()).max(2e4).optional(),
	legacyReferences: z.array(z.object({
		kind: z.enum(["objective", "exercise"]),
		oldId: knowledgeIdSchema,
		status: z.enum(["pending", "review-required"]),
		candidateGoalIds: z.array(knowledgeIdSchema).max(100),
		routes: z.array(z.object({
			goalId: knowledgeIdSchema,
			familyId: knowledgeIdSchema
		}).strict()).max(100),
		reason: text
	}).strict()).max(5e3).optional(),
	mistakes: z.array(stateSchema.shape.mistakes.element.omit({
		stage: true,
		independentDays: true,
		dueAt: true
	})).max(5e3),
	exercises: stateSchema.shape.exercises,
	concepts: stateSchema.shape.concepts,
	objectives: stateSchema.shape.objectives,
	relations: stateSchema.shape.relations,
	teachingQueue: stateSchema.shape.teachingQueue,
	rewards: z.array(stateSchema.shape.rewards.element.extend({ day })).max(1e3),
	pendingLegacy: z.array(pending).max(5e3).optional()
}).strict();
/** Arrangements reference original evidence; they never store answers or mastery. */
const planTaskReference = z.object({
	day,
	taskId: id
}).strict();
const planEvidenceReference = z.object({
	termId,
	ownerKind: z.enum(["block", "worksheet"]),
	ownerId: id,
	responseId
}).strict();
const dailyTaskSchema = z.object({
	id,
	subject,
	purpose: z.enum([
		"resume",
		"teaching",
		"diagnostic",
		"learning",
		"review"
	]),
	goalId: knowledgeIdSchema.optional(),
	scope: capabilityScopeSchema.optional(),
	familyIds: z.array(knowledgeIdSchema).max(2),
	reason: text,
	basis: z.array(planEvidenceReference).max(20),
	ending: z.enum([
		"short-check",
		"review-attempts",
		"original-activity"
	]),
	state: z.enum([
		"ready",
		"active",
		"paused",
		"completed",
		"deferred",
		"skipped",
		"carried-forward"
	]),
	activity: z.object({
		blockId,
		roundId: id.optional(),
		questionId: id.optional(),
		responseId: responseId.optional()
	}).strict().optional(),
	original: planTaskReference.optional(),
	carriedTo: planTaskReference.optional(),
	optional: z.boolean().optional(),
	outcomes: z.array(planEvidenceReference).max(200)
}).strict();
/** One learner's explicit choices for one Shanghai calendar day. */
const dailyPlanSchema = z.object({
	...base,
	kind: z.literal("daily-plan"),
	learnerId,
	id,
	day,
	timezone: z.literal("Asia/Shanghai"),
	revision: time,
	createdAt: time,
	updatedAt: time,
	policyVersion: z.literal(1),
	settingsVersion: text,
	subjects: z.array(subject).min(1).max(3),
	state: z.enum([
		"ready",
		"active",
		"paused",
		"completed",
		"stopped"
	]),
	completedAt: time.optional(),
	tasks: z.array(dailyTaskSchema).min(1).max(100),
	choices: z.array(z.object({
		id,
		at: time,
		revision: time,
		action: z.enum([
			"start",
			"continue",
			"pause",
			"stop",
			"defer",
			"skip",
			"adjust",
			"carry",
			"extra"
		]),
		reason: text,
		taskIds: z.array(id).max(100),
		replacedTaskIds: z.array(id).max(100)
	}).strict()).min(1).max(500)
}).strict();
/** Machine-readable file definitions shared by CLI, application reads and manual saves. */
const officialFileSchemas = {
	"term-settings": termSettingsSchema,
	block: blockSchema,
	worksheet: worksheetSchema,
	collections: collectionsSchema,
	"daily-plan": dailyPlanSchema
};
/**
* Locate an original archived entity using validated identities; response selection remains explicit.
* @param reference - same-learner earlier-term reference.
* @returns controlled workspace-relative original owner path, without copying evidence.
*/
function archiveEvidencePath(reference) {
	const valid = archiveEvidenceReferenceSchema.parse(reference);
	return `.study/archives/${valid.termId}/${valid.ownerKind === "block" ? "blocks" : "worksheets"}/${valid.ownerId}.json`;
}
//#endregion
//#region lib/types/openmaic/feedback-consumer.js
/** Independent file consumption checks original official tuples and grading before business progress advances. */
/**
* Return authoring content from an independently captured source, without writing a file.
* @param observation - Original authorized source tuple and immutable question snapshot.
* @returns A formal question ready for native agent authoring; unavailable content is explicitly pending.
*/
function openmaicAcademicQuestion(observation) {
	const source = officialQuestionSchema.safeParse(observation.question.snapshot);
	const question = source.success ? source.data : void 0;
	return questionSchema.parse({
		id: observation.questionId,
		objectiveId: observation.binding.goalId,
		capability: {
			goalId: observation.binding.goalId,
			familyId: observation.binding.familyId,
			scope: observation.binding.scope
		},
		source: {
			kind: "authored",
			description: "Original authorized OpenMAIC question snapshot."
		},
		topic: observation.binding.goalId,
		prompt: question?.question ?? "Historical question content is unavailable; preserve the original source answer for review.",
		answer: question?.answer !== void 0 ? JSON.stringify(question.answer) : "No frozen answer key; assessment remains pending.",
		explanation: question?.analysis || "Check the original capability criterion before evaluating this response.",
		answerEvidence: question?.commentPrompt || question?.analysis || "Use the original frozen answer criterion; source grading alone is insufficient.",
		...question?.options && question.options.length >= 2 && question.options.length <= 4 ? { choices: question.options.map((option) => option.label) } : {},
		openmaic: observation.question
	});
}
/**
* Match original source, learner/scope and frozen academic content independently of agent-written status flags.
* @param observation - Host reread original source.
* @param file - Validated original owner.
* @param response - Saved immutable answer.
* @param question - Saved frozen question.
* @param assessment - Saved current assessment when available.
* @returns Exact source/content/official-grading match; pending or conflicting effective grades remain separate.
*/
function matchOpenmaicResponse(observation, file, response, question, assessment) {
	return observation.sourceStatus === "known" && matchesStoredOpenmaic(observation, file, response, question, assessment);
}
function matchesStoredOpenmaic(observation, file, response, question, assessment) {
	const binding = observation.binding;
	const { mistakeId: _mistake, ...frozenQuestion } = question;
	if (file.learnerId !== binding.learnerId || file.termId !== binding.termId || file.kind !== "block" || file.id !== binding.blockId || response.id !== observation.responseId || question.id !== observation.questionId || response.questionId !== question.id || response.rawResponse !== JSON.stringify(observation.source.submittedAnswer) || canonical(response.source) !== canonical(observation.source) || canonical(frozenQuestion) !== canonical(openmaicAcademicQuestion(observation))) return false;
	if (canonical(assessment?.official) !== canonical(observation.official) || canonical(assessment?.officialHistory) !== canonical(observation.officialHistory)) return false;
	return true;
}
const correctionSchema = z.object({
	learnerId: z.string().min(1),
	termId: z.string().min(1),
	blockId: z.string().min(1),
	responseId: z.string().min(1),
	questionId: z.string().min(1),
	snapshotHash: z.string().regex(/^[a-f0-9]{64}$/u),
	submittedAnswer: z.union([z.string(), z.array(z.string())]),
	result: z.enum([
		"correct",
		"incorrect",
		"partial",
		"unassessed"
	]),
	criterion: z.string().min(1).max(2e3),
	parentConfirmation: z.string().min(1).max(2e3)
}).strict();
/**
* Resolve the effective grade separately from original-source authentication.
* @param observation - Fresh authorized original submission and frozen criterion.
* @param file - Original block owner.
* @param response - Immutable original answer.
* @param question - Immutable original question.
* @param assessment - Current saved assessment and optional parent-native reference.
* @param nativeSources - Independently consumed exact user input versions.
* @returns Authorized correction or the independently checked grade; unsupported declarations remain pending.
*/
function effectiveOpenmaicAssessment(observation, file, response, question, assessment, nativeSources = []) {
	if (!matchOpenmaicResponse(observation, file, response, question, assessment)) return {
		result: "unassessed",
		grading: "pending"
	};
	const correction = assessment?.criterionCorrection;
	if (correction && nativeSources.some((input) => input.sessionId === correction.sessionId && input.messageId === correction.messageId && input.inputVersion === correction.inputVersion && input.rawResponse === correction.rawResponse)) {
		const text = /^Student grading correction:\n([^\n]+)$/u.exec(correction.rawResponse)?.[1];
		try {
			const decision = text && correctionSchema.safeParse(JSON.parse(text));
			if (decision && decision.success && file.kind === "block" && decision.data.learnerId === file.learnerId && decision.data.termId === file.termId && decision.data.blockId === file.id && decision.data.responseId === response.id && decision.data.questionId === question.id && decision.data.snapshotHash === observation.question.snapshotHash && canonical(decision.data.submittedAnswer) === canonical(observation.source.submittedAnswer) && assessment.feedback === decision.data.criterion && assessment.result === decision.data.result && assessment.grading === (decision.data.result === "correct" ? "equivalent" : decision.data.result === "unassessed" ? "pending" : "aligned")) return {
				result: decision.data.result,
				grading: assessment.grading
			};
		} catch {}
	}
	return assessment?.result === observation.result && assessment.grading === observation.grading ? {
		result: observation.result,
		grading: observation.grading
	} : {
		result: "unassessed",
		grading: "pending"
	};
}
/**
* Inspect complete saved coverage; unresolved original facts may be acknowledged without granting evidence.
* @param workspace - Independently validated exact file read.
* @param source - Fresh original runtime observation, never an agent-created verified marker.
* @returns Candidate checkpoint and missing/conflicting response identities; performs no business write.
*/
function consumeOpenmaicFeedback(workspace, source) {
	const missingResponseIds = [], conflicts = [];
	for (const observation of source.observations) {
		const file = workspace.blocks.find((block) => block.id === observation.binding.blockId && block.termId === observation.binding.termId);
		const response = file?.responses.find((response) => response.id === observation.responseId);
		const question = file?.questions.find((question) => question.id === observation.questionId);
		const assessment = file?.assessments.find((assessment) => assessment.responseId === response?.id);
		const effective = file && response && question ? effectiveOpenmaicAssessment(observation, file, response, question, assessment, workspace.nativeSources) : void 0;
		if (!file || !response || !question || !assessment || !matchesStoredOpenmaic(observation, file, response, question, assessment) || assessment.result !== effective?.result || assessment.grading !== effective.grading) missingResponseIds.push(observation.responseId);
		if (!effective || effective.grading === "conflict" || effective.grading === "pending" || observation.sourceStatus === "unknown") conflicts.push(observation.responseId);
	}
	const missingPendingIds = source.pending.filter((pending) => !workspace.blocks.some((block) => block.learnerId === pending.binding.learnerId && block.termId === pending.binding.termId && block.id === pending.binding.blockId && block.pendingOpenmaic?.some((saved) => canonical(saved) === canonical(pending)))).map((pending) => canonical([
		pending.binding.bindingId,
		pending.record.sessionId,
		pending.record.id
	]));
	return {
		status: missingResponseIds.length || missingPendingIds.length || source.omitted ? "pending" : "accepted",
		checkpoint: source.checkpoint,
		missingResponseIds,
		missingPendingIds,
		conflicts
	};
}
//#endregion
//#region lib/types/files/answer-exposure.js
function before(answer, reveal) {
	if (!answer || !reveal || answer.kind === "unknown" || reveal.kind === "unknown") return false;
	return (answer.kind === "day" ? answer.day : studyDay(answer.at)) < (reveal.kind === "day" ? reveal.day : studyDay(reveal.at)) || answer.kind === "instant" && reveal.kind === "instant" && answer.at < reveal.at;
}
/**
* Check whether this frozen instance's answer could already have been revealed.
* @param file - original question and response owner.
* @param response - answer being assessed, retaining actual date precision.
* @returns true unless the answer is demonstrably before every explicit reveal and other worked example.
*/
function answerWasExposed(file, response) {
	const date = response.answerDate ?? (file.kind === "worksheet" ? file.answerDate : void 0);
	if (file.kind === "block" && file.answerReveals?.some((reveal) => reveal.questionId === response.questionId && !before(date, {
		kind: "instant",
		at: reveal.at,
		basis: "current-manual",
		sourceVersion: "answer-reveal"
	}))) return true;
	return file.responses.some((other) => other.id !== response.id && other.questionId === response.questionId && other.assistance === "worked-example" && !before(date, other.answerDate ?? (file.kind === "worksheet" ? file.answerDate : void 0)));
}
//#endregion
//#region lib/types/learning/evidence.js
const EVIDENCE = Symbol("studentEvidence");
/**
* Derive effective facts once from validated block and worksheet owners.
* @param workspace - current validated entity files.
* @returns one fact per saved response, including unassessed facts and unknown dates, help or native sources without a complete captured learner/term/block/question/response owner; confirmed paper days retain day precision.
*/
function deriveEvidence(workspace) {
	const entries = [];
	const stuckSignals = [];
	for (const file of [...workspace.blocks, ...workspace.worksheets]) {
		const questions = file.kind === "block" ? file.questions : file.items;
		for (const response of file.responses) {
			const question = questions.find((item) => item.id === response.questionId);
			if (!question) continue;
			const assessment = file.assessments.find((item) => item.responseId === response.id);
			const declaredDate = response.answerDate ?? (file.kind === "worksheet" ? file.answerDate : void 0) ?? { kind: "unknown" };
			const source = response.source;
			const matchedNative = source.kind === "native" ? workspace.nativeSources?.find((item) => item.sessionId === source.sessionId && item.messageId === source.messageId && item.inputVersion === source.inputVersion && item.rawResponse === response.rawResponse && file.kind === "block" && file.learnerId !== void 0 && item.learningScope?.learnerId === file.learnerId && item.learningScope.termId === file.termId && item.learningScope.blockId === file.id && item.learningScope.questionId === question.id && item.learningScope.responseId === response.id && (item.questionSnapshot === void 0 || item.questionSnapshot === canonical(question))) : void 0;
			const matchedOfficial = source.kind === "openmaic" ? workspace.openmaicSources?.find((item) => matchOpenmaicResponse(item, file, response, question, assessment)) : void 0;
			const officialGrade = matchedOfficial ? effectiveOpenmaicAssessment(matchedOfficial, file, response, question, assessment, workspace.nativeSources) : void 0;
			const answerDate = declaredDate.kind === "instant" && declaredDate.basis === "native-input" ? matchedNative && matchedNative.receiptAt === declaredDate.at ? declaredDate : { kind: "unknown" } : declaredDate;
			entries.push({
				termId: file.termId,
				ownerId: file.id,
				ownerKind: file.kind,
				responseId: response.id,
				questionId: question.id,
				subject: file.subject,
				topic: question.topic,
				...!question.basisStatus && (question.capability || typeof question.objectiveId === "string") ? { objectiveId: question.capability?.goalId ?? question.objectiveId } : {},
				...question.basisStatus ? { basisStatus: question.basisStatus } : {},
				...question.mistakeId ? { mistakeId: question.mistakeId } : {},
				rawResponse: response.rawResponse,
				...question.capability ? { capability: question.capability } : {},
				...assessment ? {
					feedback: assessment.feedback,
					criteria: assessment.criteria ?? [question.phase === "vary" ? "variation" : question.phase === "guide" ? "method" : "basic"],
					...assessment.errorType ? { errorType: assessment.errorType } : {}
				} : {},
				result: question.basisStatus ? "unassessed" : source.kind === "openmaic" ? officialGrade?.result ?? "unassessed" : assessment?.result ?? "unassessed",
				...assessment?.official ? { official: assessment.official } : {},
				...assessment?.officialHistory ? { officialHistory: assessment.officialHistory } : {},
				...source.kind === "openmaic" ? { grading: officialGrade?.grading ?? "pending" } : assessment?.grading ? { grading: assessment.grading } : {},
				assistance: source.kind === "openmaic" && (matchedOfficial?.answerExposure || !response.assistanceConfirmation) || response.assistance === "independent" && answerWasExposed(file, response) ? "unknown" : response.assistance,
				source: response.source,
				sourceStatus: source.kind === "unknown" || source.kind === "openmaic" && !matchedOfficial || source.kind === "native" && (!matchedNative || source.receiptAt !== void 0 && source.receiptAt !== matchedNative.receiptAt) ? "unknown" : "known",
				answerDate,
				...assessment ? { assessedAt: assessment.assessedAt } : {}
			});
		}
		if (file.kind === "block") for (const signal of file.stuckSignals ?? []) {
			const goal = questions.find((item) => item.id === signal.questionId)?.objectiveId;
			if (typeof goal === "string") stuckSignals.push({
				objectiveId: goal,
				at: signal.at
			});
		}
	}
	for (const archive of workspace.archivedEvidence ?? []) {
		const original = deriveEvidence(archive.workspace);
		for (const entry of original.entries) {
			const references = archive.references.filter((reference) => reference.goalId === entry.objectiveId && (reference.ownerKind === entry.ownerKind && reference.ownerId === entry.ownerId && reference.responseId === entry.responseId && entry.capability && scopeSupports(entry.capability.scope, reference.scope) || reference.review && reference.review.mistakeId === entry.mistakeId));
			if (references.length && !entries.some((existing) => existing.termId === entry.termId && existing.ownerKind === entry.ownerKind && existing.ownerId === entry.ownerId && existing.responseId === entry.responseId)) entries.push({
				...entry,
				referenceScopes: references.filter((reference) => entry.capability && scopeSupports(entry.capability.scope, reference.scope)).map((reference) => reference.scope)
			});
		}
	}
	return {
		entries,
		stuckSignals
	};
}
/**
* Attach validated facts to a compatibility display projection without persisting another authority.
* @param state - display projection used by current dashboard consumers.
* @param index - normalized facts from the official files.
* @returns the same display state.
*/
function attachEvidence(state, index) {
	Object.defineProperty(state, EVIDENCE, {
		value: index,
		configurable: true
	});
	return state;
}
/**
* Read the shared index. Legacy grading and receipt fields do not establish actual answer dates.
* @param state - current display state or handler result.
* @returns normalized facts for every domain projection.
*/
function evidenceOf(state) {
	const attached = state[EVIDENCE];
	if (attached) return attached;
	const entries = state.attempts.map((item) => ({
		termId: "legacy",
		ownerId: item.sessionId,
		ownerKind: "block",
		responseId: item.id,
		questionId: item.id,
		subject: item.subject,
		topic: item.topic,
		rawResponse: item.rawResponse ?? item.response,
		result: item.result,
		assistance: "unknown",
		answerDate: { kind: "unknown" },
		sourceStatus: "known",
		source: {
			kind: "legacy",
			sourcePath: ".study/state.json",
			row: `attempts:${item.sessionId}:${item.id}`
		},
		...item.objectiveId ? { objectiveId: item.objectiveId } : {},
		...item.mistakeId ? { mistakeId: item.mistakeId } : {}
	}));
	for (const item of state.paperResults) {
		const sheet = state.worksheets.find((sheet) => sheet.id === item.worksheetId);
		const question = sheet?.items.find((question) => question.id === item.itemId);
		if (!sheet || !question) continue;
		const goal = question.objectiveId ?? sheet.objectiveId;
		entries.push({
			termId: "legacy",
			ownerId: sheet.id,
			ownerKind: "worksheet",
			responseId: item.itemId,
			questionId: item.itemId,
			subject: sheet.subject,
			topic: question.prompt,
			rawResponse: item.response,
			result: item.result,
			assistance: "unknown",
			answerDate: { kind: "unknown" },
			sourceStatus: "known",
			source: {
				kind: "legacy",
				sourcePath: ".study/state.json",
				row: `paperResults:${sheet.id}:${item.itemId}`
			},
			...goal ? { objectiveId: goal } : {},
			...question.mistakeId ? { mistakeId: question.mistakeId } : {}
		});
	}
	return {
		entries,
		stuckSignals: []
	};
}
/**
* Read the actual calendar day without manufacturing a timestamp for paper work.
* @param evidence - normalized response.
* @returns the Shanghai day or undefined for an unknown date.
*/
function evidenceDay(evidence) {
	return evidence.answerDate.kind === "day" ? evidence.answerDate.day : evidence.answerDate.kind === "instant" ? studyDay(evidence.answerDate.at) : void 0;
}
/**
* Select only facts that were answered by the historical cutoff.
* Day precision selects a calendar day without establishing within-day order; exact facts use their actual instant.
* @param index - normalized evidence.
* @param now - historical or current cutoff.
* @returns dated effective responses without future facts or unknown dates.
*/
function evidenceAtCutoff(index, now) {
	const today = studyDay(now);
	return index.entries.filter((item) => item.sourceStatus === "known" && (item.answerDate.kind === "instant" ? item.answerDate.at <= now : item.answerDate.kind === "day" ? item.answerDate.day <= today : false));
}
/**
* Compare answer ordering without borrowing receipt or assessment times.
* @param later - possible later response.
* @param earlier - earlier response or a known signal instant.
* @returns true only when actual answer precision establishes a later answer.
*/
function demonstrablyAfter(later, earlier) {
	if (typeof earlier === "number") return later.answerDate.kind === "instant" ? later.answerDate.at >= earlier : later.answerDate.kind === "day" ? later.answerDate.day > studyDay(earlier) : false;
	const laterDay = evidenceDay(later);
	const earlierDay = evidenceDay(earlier);
	if (!laterDay || !earlierDay) return false;
	if (laterDay !== earlierDay) return laterDay > earlierDay;
	return later.answerDate.kind === "instant" && earlier.answerDate.kind === "instant" && later.answerDate.at > earlier.answerDate.at;
}
//#endregion
//#region lib/types/learning/schedule.js
/** Shared review replay from actual answer dates; receipt and grading dates are never scheduling input. */
/** Existing spaced-review intervals, in days for stages one through four. */
const REVIEW_DAYS = [
	1,
	7,
	16,
	35
];
/** Midnight in the teaching timezone that starts the given calendar day. */
function dayStart(day) {
	return Date.parse(`${day}T00:00:00+08:00`);
}
/**
* Replay a stable mistake identity, preserving earned stages and conservative same-day difficulty.
* @param mistake - confirmed mistake declaration.
* @param index - effective actual-answer facts.
* @param now - historical/current cutoff.
* @param windowStart - optional seven-day window start for review completion.
* @returns earned stage, current due date and one review opportunity/completion per mistake.
*/
function replayMistake(mistake, index, now, windowStart) {
	if (mistake.confirmedAt === void 0 || mistake.confirmedAt > now) return {
		stage: 0,
		independentDays: [],
		opportunity: false,
		completed: false
	};
	let dueAt = dayStart(studyDay(mistake.confirmedAt + DAY));
	let stage = 0;
	let wrongs = 0;
	const independentDays = [];
	let opportunity = false;
	let completed = false;
	let consolidatedDay;
	const registerOpportunity = (at) => {
		if (windowStart !== void 0 && dueAt <= at && dueAt <= now && Math.max(dueAt, windowStart) <= at) opportunity = true;
	};
	const rows = evidenceAtCutoff(index, now).filter((item) => item.mistakeId === mistake.id && item.subject === mistake.subject && item.objectiveId === mistake.objectiveId && demonstrablyAfter(item, mistake.confirmedAt));
	const groups = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const day = evidenceDay(row);
		groups.set(day, [...groups.get(day) ?? [], row]);
	}
	for (const [day, entries] of [...groups].sort(([left], [right]) => left.localeCompare(right))) {
		const sorted = entries.some((entry) => entry.answerDate.kind !== "instant") ? entries.slice().sort((a, b) => Number(!(a.result === "correct" && a.assistance === "independent")) - Number(!(b.result === "correct" && b.assistance === "independent"))) : entries.slice().sort((a, b) => (a.answerDate.kind === "instant" ? a.answerDate.at : 0) - (b.answerDate.kind === "instant" ? b.answerDate.at : 0));
		for (const item of sorted) {
			const at = item.answerDate.kind === "instant" ? item.answerDate.at : dayStart(day);
			registerOpportunity(at);
			if (item.result === "unassessed" || item.result === "stuck" || item.result === "correct" && item.assistance === "unknown") continue;
			if (item.result === "correct" && item.assistance === "independent") {
				if (windowStart !== void 0 && at >= windowStart && at >= dueAt) completed = true;
				if (independentDays.includes(day)) continue;
				independentDays.push(day);
				stage = Math.min(4, stage + 1);
				dueAt = dayStart(studyDay(dayStart(day) + REVIEW_DAYS[stage - 1] * DAY));
				if (stage === 4 && consolidatedDay === void 0) consolidatedDay = day;
			} else {
				wrongs += 1;
				dueAt = dayStart(studyDay(dayStart(day) + (wrongs >= 2 ? 2 : 1) * DAY));
			}
		}
	}
	registerOpportunity(now);
	return {
		stage,
		independentDays,
		dueAt,
		opportunity,
		completed: opportunity && completed,
		...consolidatedDay ? { consolidatedDay } : {}
	};
}
/**
* Update display-only review fields through the shared replay owner.
* @param state - parsed display projection; persisted stages are ignored.
* @param now - optional explicit cutoff; omission replays every dated effective fact.
* @returns the same state with derived review fields.
*/
function scheduleMistakes(state, now = 86399999e8) {
	const index = evidenceOf(state);
	for (const mistake of state.mistakes) {
		const replay = replayMistake(mistake, index, now);
		mistake.stage = replay.stage;
		mistake.independentDays = replay.independentDays;
		if (replay.dueAt !== void 0) mistake.dueAt = replay.dueAt;
		else delete mistake.dueAt;
	}
	return state;
}
//#endregion
//#region lib/types/files/legacy.js
/** Non-mutating callers clone legacy parsed values before compatibility parsing. Original bytes remain untouched. */
/**
* One-time fix for worksheets saved before the place-value rule split borrowing from crossing.
* A figure that mixed `regroup: 'yes'` with crossed dots had its crosses dropped; the subtraction
* the author intended stays answerable because the prompt and answer are unchanged.
*/
function migrateLegacyFigures(parsed) {
	if (typeof parsed !== "object" || parsed === null) return parsed;
	const worksheets = parsed.worksheets;
	if (!Array.isArray(worksheets)) return parsed;
	for (const worksheet of worksheets) {
		const items = worksheet.items;
		if (!Array.isArray(items)) continue;
		for (const item of items) {
			const figure = item.figure;
			if (figure?.kind === "place-value" && figure.regroup === "yes" && ((figure.crossTens ?? 0) > 0 || (figure.crossOnes ?? 0) > 0)) {
				figure.crossTens = 0;
				figure.crossOnes = 0;
			}
		}
	}
	return parsed;
}
/**
* Turn a saved hint flag into a hint level and strip retired time-limit fields before parsing.
* Missing workbook drafts, exercises and the teaching queue are filled by the state schema defaults.
*/
function migrateStudyFile(parsed) {
	const next = migrateLegacyFigures(parsed);
	if (typeof next !== "object" || next === null) return next;
	const root = next;
	delete root.breakUntil;
	if (typeof root.profile === "object" && root.profile !== null) delete root.profile.limits;
	if (Array.isArray(root.sessions)) {
		for (const session of root.sessions) if (typeof session === "object" && session !== null) delete session.deadline;
	}
	if (Array.isArray(root.attempts)) {
		for (const attempt of root.attempts) if (typeof attempt === "object" && attempt !== null) delete attempt.late;
	}
	const task = root.task;
	if (typeof task === "object" && task !== null) {
		const record = task;
		if (typeof record.hintLevel !== "number") record.hintLevel = record.hintRequested === true ? 1 : 0;
		delete record.hintRequested;
	}
	return next;
}
//#endregion
//#region lib/types/learning/scopes.js
/** Use existing school progress or the grade map without inventing a new parent confirmation. */
function automaticLearningScopes(workspace) {
	const { settings } = workspace;
	const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
	return [
		"chinese",
		"math",
		"english"
	].flatMap((subject) => {
		const course = settings.courses.find((item) => item.subject === subject);
		const map = curriculumFor(settings.profile, subject);
		const current = map?.units.findIndex((unit) => unit.id === course?.progress?.unitId) ?? -1;
		const objectives = builtinObjectivesIn(settings.profile, subject).filter((objective) => current < 0 || (course?.progress?.posture === "catch-up" ? map.units.findIndex((unit) => unit.id === objective.unit) <= current : objective.unit === course.progress.unitId));
		return knowledge.goals.filter((goal) => goal.subject === subject && writtenGoal(goal.id)).flatMap((goal) => {
			const objective = objectives.find((item) => goal.curriculumAssociationIds.includes(item.id));
			return objective ? [{
				subject,
				goalIds: [goal.id],
				scope: {
					id: `auto-${objective.id}-${goal.id}`,
					description: [
						objective.title,
						objective.goal,
						...objective.questionPoints ?? []
					].join("；").slice(0, 4e3),
					modality: "written"
				}
			}] : [];
		});
	});
}
/** Explicit family choices override inferred defaults only for their own subject. */
function effectiveLearningScopes(workspace) {
	const selected = workspace.settings.learningScopes ?? [];
	const previous = [...workspace.blocks, ...workspace.worksheets].flatMap((file) => (file.kind === "block" ? file.questions : file.items).flatMap((question) => question.capability ? [{
		subject: file.subject,
		goalIds: [question.capability.goalId],
		scope: question.capability.scope
	}] : []));
	const reviews = (workspace.collections?.mistakes ?? []).flatMap((mistake) => mistake.capability ? [{
		subject: mistake.subject,
		goalIds: [mistake.capability.goalId],
		scope: mistake.capability.scope
	}] : []);
	return [...selected, ...[
		...previous,
		...reviews,
		...automaticLearningScopes(workspace)
	].filter((item) => !selected.some((scope) => scope.subject === item.subject))];
}
function writtenGoal(id) {
	return !id.startsWith("e.speak") && !id.startsWith("e.listen") && ![
		"c.read-aloud",
		"c.recite",
		"c.retell",
		"c.describe",
		"c.interact",
		"c.listen",
		"e.sound",
		"e.view-listen",
		"e.perform"
	].includes(id);
}
//#endregion
//#region lib/types/files/plans.js
/** Check arrangement ownership and original references without creating learning evidence. */
function validateDailyPlans(workspace, prior, fail) {
	const { settings, blocks, plans = [] } = workspace;
	const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
	const scopes = effectiveLearningScopes(workspace);
	const owners = /* @__PURE__ */ new Map();
	const pending = (task) => [
		"ready",
		"active",
		"paused"
	].includes(task.state);
	for (const plan of plans) {
		const path = `.study/plans/${plan.day}.json`;
		const issue = (field, rule, correction) => fail(path, field, rule, correction);
		if (plan.id !== `day-${plan.day}` || plan.day !== studyDay(plan.createdAt) || plan.updatedAt < plan.createdAt || new Set(plan.subjects).size !== plan.subjects.length) issue("id", "plan-identity", "Use day-YYYY-MM-DD for this learner and term, with its original Shanghai creation day and distinct subjects.");
		if (plan.tasks.length !== new Set(plan.tasks.map((task) => task.id)).size || plan.choices.length !== new Set(plan.choices.map((choice) => choice.id)).size) issue("tasks", "plan-identity", "Retain distinct task and choice identities.");
		if (plan.tasks.filter((task) => task.state === "active").length > 1) issue("tasks", "plan-active", "Keep one active task; pause or defer the original before changing activities.");
		if (plan.choices.some((choice) => choice.at > plan.updatedAt || choice.revision > plan.revision || [...choice.taskIds, ...choice.replacedTaskIds].some((id) => !plan.tasks.some((task) => task.id === id)))) issue("choices", "plan-choice", "Keep explicit choices no later than the saved update and reference retained tasks inside this revision.");
		if (plan.state === "completed" && (!plan.completedAt || plan.tasks.some((task) => !task.optional && task.state !== "completed"))) issue("state", "plan-completion", "Complete only the original arrangement whose tasks reached their ending conditions; skipped and deferred work belongs to a stopped plan.");
		if (plan.completedAt !== void 0 && (plan.completedAt < plan.createdAt || plan.completedAt > plan.updatedAt)) issue("completedAt", "plan-time", "Keep the original completion time inside the plan history.");
		for (const [i, task] of plan.tasks.entries()) {
			const field = `tasks.${i}`;
			const goal = knowledge.goals.find((goal) => goal.id === task.goalId);
			if (!plan.subjects.includes(task.subject) || task.goalId && (!goal || goal.subject !== task.subject) || task.familyIds.some((id) => !knowledge.families.some((family) => family.id === (knowledge.familyAliases[id] ?? id) && family.goalIds.includes(task.goalId ?? "")))) issue(field, "plan-goal", "Use compatible goals and families of a participating subject.");
			if (task.purpose !== "resume" && (!task.goalId || !task.scope)) issue(field, "plan-scope", "Save a concrete capability and learning range for a new activity.");
			if (["ready", "active"].includes(task.state) && plan.createdAt >= settings.updatedAt && task.scope && !scopes.some((scope) => scope.subject === task.subject && (!scope.goalIds || scope.goalIds.includes(task.goalId)) && scopeSupports(scope.scope, task.scope))) issue(field, "plan-scope", "Defer this unstarted task or adjust its learning scope before starting it.");
			const block = task.activity ? blocks.find((block) => block.id === task.activity.blockId) : void 0;
			if (task.activity && (!block || block.subject !== task.subject || task.activity.questionId && !block.questions.some((question) => question.id === task.activity.questionId) || task.activity.responseId && !block.responses.some((response) => response.id === task.activity.responseId && (!task.activity.questionId || response.questionId === task.activity.questionId)) || task.activity.roundId && !block.rounds?.some((round) => round.id === task.activity.roundId))) issue(field, "plan-activity", "Restore the original activity, question, response and round before continuing; do not recreate them.");
			const previousBlocks = prior.flatMap((entry) => entry.file.kind === "block" && entry.file.id === block?.id ? [entry.file] : []);
			if (block && task.scope && plan.createdAt < settings.updatedAt && previousBlocks.length && block.questions.some((question) => !previousBlocks.some((old) => old.questions.some((saved) => saved.id === question.id)) && question.capability && !scopes.some((scope) => scope.subject === task.subject && (!scope.goalIds || scope.goalIds.includes(question.capability.goalId)) && scopeSupports(scope.scope, question.capability.scope)))) issue(field, "plan-scope", "Preserve the original questions and check the changed learning range before adding new questions.");
			if (block && task.goalId && task.scope && block.questions.length && !block.questions.some((question) => question.capability?.goalId === task.goalId && scopeSupports(task.scope, question.capability.scope))) issue(field, "plan-activity", "Bind a task only to its original capability and learning range.");
			for (const reference of [...task.basis, ...task.outcomes]) {
				const owner = reference.ownerKind === "block" ? workspace.blocks.find((block) => block.id === reference.ownerId) : workspace.worksheets.find((sheet) => sheet.id === reference.ownerId);
				if (reference.termId !== settings.termId || !owner || owner.subject !== task.subject || !owner.responses.some((response) => response.id === reference.responseId)) issue(field, "plan-evidence", "Reference an existing original response of this learner, term and subject; do not copy answers into a plan.");
			}
			if (task.outcomes.some((reference) => reference.ownerKind !== "block" || reference.ownerId !== block?.id)) issue(field, "plan-evidence", "Outcomes belong to the task’s original activity.");
			if (task.state === "completed") {
				const round = block?.rounds?.find((round) => round.id === task.activity?.roundId);
				const assessed = block?.responses.filter((response) => task.outcomes.some((reference) => reference.responseId === response.id) && block.assessments.some((assessment) => assessment.responseId === response.id && !["unassessed", "stuck"].includes(assessment.result))) ?? [];
				const reviewAttempted = task.familyIds.every((id) => assessed.some((response) => block?.questions.find((question) => question.id === response.questionId)?.capability?.familyId === id));
				if (!block || block.endedAt === void 0 && round?.endedAt === void 0 || task.ending === "review-attempts" && !reviewAttempted || task.ending === "short-check" && !assessed.length && round?.endReason !== "budget-exhausted") issue(field, "plan-completion", "Reach the saved ending condition using the original ended activity and assessed attempts; otherwise pause or stop with the unfinished work retained.");
			}
			if (task.original) {
				const original = plans.find((plan) => plan.day === task.original.day)?.tasks.find((item) => item.id === task.original.taskId);
				if (task.original.day >= plan.day || !original || original.original || !original.activity || original.activity.blockId !== task.activity?.blockId) issue(field, "plan-transfer", "Point directly to an earlier original task and its activity; transfer chains and cycles are invalid.");
			}
			if (task.state === "carried-forward" && !task.carriedTo || task.carriedTo && (task.state !== "carried-forward" || task.carriedTo.day <= plan.day)) issue(field, "plan-transfer", "Retain a forward transfer only on a carried task, pointing to the later owning plan.");
			if (task.activity && pending(task)) {
				const previous = owners.get(task.activity.blockId);
				if (previous) issue(field, "plan-ownership", `The original activity is already owned by ${previous}; finish its transfer before continuing.`);
				owners.set(task.activity.blockId, `${plan.day}/${task.id}`);
			}
		}
		for (const old of prior.flatMap((entry) => entry.path === path && entry.file.kind === "daily-plan" ? [entry.file] : [])) {
			if (old.learnerId !== plan.learnerId || old.termId !== plan.termId || old.id !== plan.id || old.createdAt !== plan.createdAt || old.completedAt !== void 0 && old.completedAt !== plan.completedAt || old.revision > plan.revision || old.revision === plan.revision && canonical(old) !== canonical(plan)) issue("", "plan-history", "Retain plan identity and completion, and increment revision for every explicit amendment.");
			if (old.state === "completed" && plan.state !== "completed" || old.tasks.some((task) => task.state === "completed" && plan.tasks.find((next) => next.id === task.id)?.state !== "completed")) issue("state", "plan-history", "Keep completed arrangements and tasks closed; attach explicitly requested extra work separately.");
			if (plan.tasks.some((task) => !old.tasks.some((previous) => previous.id === task.id) && !plan.choices.some((choice) => !old.choices.some((previous) => previous.id === choice.id) && [
				"start",
				"adjust",
				"extra",
				"carry"
			].includes(choice.action) && choice.taskIds.includes(task.id)))) issue("choices", "plan-choice", "Record the explicit choice that added each new task.");
			if (old.choices.some((choice) => !plan.choices.some((next) => canonical(next) === canonical(choice))) || old.tasks.some((task) => !plan.tasks.some((next) => next.id === task.id && next.subject === task.subject && next.goalId === task.goalId && next.purpose === task.purpose && next.ending === task.ending && next.optional === task.optional && canonical(next.familyIds) === canonical(task.familyIds) && canonical(next.scope) === canonical(task.scope) && (!task.activity || next.activity?.blockId === task.activity.blockId)))) issue("tasks", "plan-history", "Keep original choices, tasks and activity identities; defer replaced tasks instead of deleting them.");
		}
	}
	for (const block of blocks) if (block.plan && (block.endedAt === void 0 || plans.some((plan) => plan.day === block.plan.day)) && !plans.some((plan) => plan.day === block.plan.day && plan.tasks.some((task) => task.id === block.plan.taskId && task.activity?.blockId === block.id))) fail(`.study/plans/${block.plan.day}.json`, "activity", "plan-binding", "Restore and verify the original plan reference; the saved activity and answers remain intact.");
}
//#endregion
//#region lib/types/files/validation.js
/** Pure parsed-file and cross-entity validation, shared by every Student consumer. */
/**
* Validate parsed official files and available previously validated versions.
* @param input - discovered current files with exact workspace-relative paths.
* @param prior - preserved valid file versions for used-content comparison.
* @param nativeSources - matching consumed input versions resolved from native Session records.
* @param openmaicSources - independently authorized original official submissions and grading.
* @returns bounded issues and independently valid workspace entities.
*/
function validateStudyFiles(input, prior = [], nativeSources = [], openmaicSources = []) {
	const issues = [];
	const files = [];
	const paths = /* @__PURE__ */ new Set();
	const fail = (path, field, rule, correction) => {
		if (issues.length < 100) issues.push({
			path,
			field: field.slice(0, 240),
			rule,
			correction: correction.slice(0, 500)
		});
	};
	for (const entry of input) {
		if (paths.has(entry.path)) fail(entry.path, "", "duplicate-file", "Supply one current file per path.");
		paths.add(entry.path);
		const raw = z.object({
			kind: z.string(),
			format: z.number()
		}).passthrough().safeParse(entry.value);
		if (!raw.success) {
			fail(entry.path, "", "schema", "Save an official JSON object with format and kind.");
			continue;
		}
		const schema = Object.hasOwn(officialFileSchemas, raw.data.kind) ? officialFileSchemas[raw.data.kind] : void 0;
		if (!schema) {
			fail(entry.path, "kind", "file-kind", "Use term-settings, block, worksheet, collections or daily-plan.");
			continue;
		}
		const parsed = schema.safeParse(entry.value);
		if (!parsed.success) {
			for (const issue of parsed.error.issues) fail(entry.path, issue.path.join("."), raw.data.format > 2 ? "future-format" : "schema", issue.message);
			continue;
		}
		const file = parsed.data;
		const expected = file.kind === "term-settings" ? ".study/settings.json" : file.kind === "collections" ? ".study/collections.json" : file.kind === "daily-plan" ? `.study/plans/${file.day}.json` : `.study/${file.kind === "block" ? "blocks" : "worksheets"}/${file.id}.json`;
		if (entry.path !== expected) fail(entry.path, "id", "file-membership", `Place this ${file.kind} at ${expected}.`);
		files.push({
			path: entry.path,
			file
		});
	}
	const settings = files.find((entry) => entry.file.kind === "term-settings")?.file;
	if (!settings || settings.kind !== "term-settings") {
		fail(".study/settings.json", "", "missing-settings", "Create valid term settings before publishing other entities.");
		return {
			valid: false,
			issues,
			files
		};
	}
	const blocks = files.flatMap((entry) => entry.file.kind === "block" ? [entry.file] : []);
	const worksheets = files.flatMap((entry) => entry.file.kind === "worksheet" ? [entry.file] : []);
	if (blocks.length > 5e3) fail(".study/blocks", "", "collection-limit", "Keep at most 5,000 block files in this term.");
	if (worksheets.length > 500) fail(".study/worksheets", "", "collection-limit", "Keep at most 500 worksheet files in this term.");
	const collections = files.find((entry) => entry.file.kind === "collections")?.file;
	const workspace = {
		settings,
		plans: files.flatMap((entry) => entry.file.kind === "daily-plan" ? [entry.file] : []),
		blocks,
		worksheets,
		nativeSources,
		openmaicSources,
		...collections?.kind === "collections" ? { collections } : {}
	};
	const unique = (path, field, rows) => {
		const seen = /* @__PURE__ */ new Set();
		rows.forEach((row, index) => {
			if (seen.has(row.id)) fail(path, `${field}.${index}.id`, "duplicate-identity", "Keep one entry per stable identity; use a new identity for a new attempt.");
			seen.add(row.id);
		});
	};
	let knowledge = effectiveKnowledge();
	try {
		knowledge = effectiveKnowledge(workspace.collections?.knowledge);
	} catch (error) {
		fail(".study/collections.json", "knowledge", "knowledge-index", error instanceof Error ? error.message : "Repair the capability catalog.");
	}
	for (const [i, confirmation] of (settings.learningScopes ?? []).entries()) if (confirmation.goalIds && (new Set(confirmation.goalIds).size !== confirmation.goalIds.length || confirmation.goalIds.some((id) => !knowledge.goals.some((goal) => goal.id === id && goal.subject === confirmation.subject)))) fail(".study/settings.json", `learningScopes.${i}.goalIds`, "confirmed-goals", "Confirm distinct existing capabilities of this subject; omit goalIds to use the confirmed curriculum range.");
	const rounds = blocks.flatMap((block) => (block.rounds ?? []).map((round) => ({
		block,
		round
	}))).sort((a, b) => a.round.startedAt - b.round.startedAt || a.round.id.localeCompare(b.round.id));
	unique(".study/blocks", "rounds", rounds.map((item) => item.round));
	for (const [i, { block, round }] of rounds.entries()) {
		const path = `.study/blocks/${block.id}.json`;
		const field = `rounds.${block.rounds.indexOf(round)}`;
		const familyId = (id) => knowledge.familyAliases[id] ?? id;
		const memberIds = round.members.map((member) => familyId(member.familyId));
		if (new Set(memberIds).size !== memberIds.length || new Set(round.enteredFamilyIds.map(familyId)).size !== round.enteredFamilyIds.length || new Set(round.presentedQuestionIds).size !== round.presentedQuestionIds.length) fail(path, field, "round-identity", "Keep one membership, entry and presentation per stable identity.");
		if (round.kind === "check" && round.presentedQuestionIds.length > 3 || round.kind === "review" && (round.members.length > 2 || round.enteredFamilyIds.length > 2)) fail(path, field, "round-limit", "A check permits three new instances; a short review permits two entered mothers. Errors, skips and help retain their entries.");
		if (round.endedAt === void 0 !== (round.endReason === void 0) || round.startedAt < block.startedAt || round.endedAt !== void 0 && round.endedAt < round.startedAt) fail(path, field, "round-time", "Keep the round inside its owning activity and save an end time and reason together.");
		if (round.familyEntries && (new Set(round.familyEntries.map((entry) => familyId(entry.familyId))).size !== round.familyEntries.length || round.enteredFamilyIds.some((id) => !round.familyEntries.some((entry) => familyId(entry.familyId) === familyId(id))) || round.familyEntries.some((entry) => !round.enteredFamilyIds.map(familyId).includes(familyId(entry.familyId)) || entry.at < round.startedAt || round.endedAt !== void 0 && entry.at > round.endedAt))) fail(path, field, "round-entry-time", "Retain one actual entry time per entered family, within the original round.");
		if (round.enteredFamilyIds.some((id) => !memberIds.includes(familyId(id)))) fail(path, field, "round-member", "Enter only a saved member of this round.");
		for (const member of round.members) {
			const goal = knowledge.goals.find((goal) => goal.id === member.goalId);
			const family = knowledge.families.find((family) => family.id === familyId(member.familyId));
			if (!goal || goal.subject !== block.subject || !family?.goalIds.includes(member.goalId) || member.mistakeId && !workspace.collections?.mistakes.some((mistake) => mistake.id === member.mistakeId && mistake.subject === block.subject && mistake.objectiveId === member.goalId && mistake.confirmedAt !== void 0)) fail(path, field, "round-member", "Select a compatible capability and mother, with an existing confirmed mistake when specified.");
		}
		for (const id of round.presentedQuestionIds) {
			const question = block.questions.find((question) => question.id === id);
			const binding = question?.capability;
			if (!question || !binding || !round.members.some((member) => member.goalId === binding.goalId && familyId(member.familyId) === familyId(binding.familyId) && scopeSupports(member.scope, binding.scope) && scopeSupports(binding.scope, member.scope)) || !round.enteredFamilyIds.map(familyId).includes(familyId(binding.familyId)) || round.kind === "check" && (question.openmaic || question.phase === "demo")) fail(path, field, "round-presentation", "Present a saved instance of an entered member in its exact scope; a check counts new native instances, not demonstrations or imported questions.");
			if ((block.rounds ?? []).filter((other) => other.presentedQuestionIds.includes(id)).length > 1) fail(path, field, "round-instance", "A question instance belongs to one round; publish a new variant under a new identity.");
		}
		const previous = rounds.slice(0, i).findLast((item) => item.round.kind === round.kind);
		if (previous) {
			const old = previous.round;
			const explicitMore = round.kind === "review" && round.moreReview?.afterRoundId === old.id && old.endedAt !== void 0;
			const newLearning = old.endedAt !== void 0 && blocks.some((owner) => owner.mode !== "review" && owner.responses.some((response) => {
				const question = owner.questions.find((question) => question.id === response.questionId);
				const date = response.answerDate;
				return question?.capability && !old.members.some((member) => member.goalId === question.capability.goalId) && !owner.rounds?.some((item) => item.presentedQuestionIds.includes(question.id)) && date && (date.kind === "instant" ? date.at >= old.endedAt && date.at <= round.startedAt : date.kind === "day" && date.day > studyDay(old.endedAt) && date.day <= studyDay(round.startedAt));
			}));
			const nextDayReview = round.kind === "review" && old.endedAt !== void 0 && studyDay(round.startedAt) > studyDay(old.endedAt);
			if (!explicitMore && !nextDayReview && !(round.kind === "check" && newLearning)) fail(path, field, "round-restart", "Retain the prior allowance across activities and days. Start another check only after actual new-goal learning; an ended review may restart on a later learning day or after an explicit request for more review.");
		} else if (round.moreReview) fail(path, field, "round-restart", "An explicit more-review request references an earlier ended review round.");
	}
	const reviewDays = /* @__PURE__ */ new Map();
	for (const { block, round } of rounds.filter((item) => item.round.kind === "review" && !item.round.moreReview)) for (const id of round.enteredFamilyIds) {
		const day = studyDay(round.familyEntries?.find((entry) => entry.familyId === id)?.at ?? round.startedAt);
		const used = reviewDays.get(day) ?? /* @__PURE__ */ new Set();
		used.add(knowledge.familyAliases[id] ?? id);
		reviewDays.set(day, used);
		if (used.size > 2) fail(`.study/blocks/${block.id}.json`, "rounds", "daily-review-limit", "Keep automatic review to two entered families across subjects on this Shanghai date; preserve unfinished-round consumption.");
	}
	for (const block of blocks.filter((block) => block.endedAt === void 0)) {
		const current = block.questions.find((question) => question.id === block.currentQuestionId);
		if (!current?.capability || current.openmaic || current.phase === "demo" || block.responses.some((response) => response.questionId === current.id)) continue;
		const check = rounds.findLast((item) => item.round.kind === "check" && item.round.members.some((member) => member.goalId === current.capability.goalId));
		if (check && check.round.endedAt === void 0 && check.round.presentedQuestionIds.length < 3 && !(check.block.id === block.id && check.round.presentedQuestionIds.includes(current.id))) fail(`.study/blocks/${block.id}.json`, "currentQuestionId", "round-presentation", "Record this newly presented instance in its original check before answering; switching blocks retains that allowance.");
	}
	for (const old of prior) if (old.file.kind === "block" && old.file.termId === settings.termId && old.file.rounds?.length && !files.some((entry) => entry.path === old.path && entry.file.kind === "block")) fail(old.path, "rounds", "round-history", "Restore the original activity containing the saved round; removing its file cannot release an allowance.");
	validateDailyPlans(workspace, prior, fail);
	const officialSources = /* @__PURE__ */ new Set();
	const evidenceIds = /* @__PURE__ */ new Set();
	for (const [i, reference] of (settings.evidenceReferences ?? []).entries()) {
		const identity = JSON.stringify([
			reference.termId,
			reference.ownerKind,
			reference.ownerId,
			reference.responseId,
			reference.goalId,
			reference.scope.id
		]);
		if (!settings.learnerId || reference.learnerId !== settings.learnerId || reference.termId === settings.termId) fail(".study/settings.json", `evidenceReferences.${i}`, "archive-reference", "Reference an earlier term of the same stable learner; never copy a response into the current term.");
		if (evidenceIds.has(identity)) fail(".study/settings.json", `evidenceReferences.${i}`, "duplicate-reference", "Keep one reference per original response, capability and tested scope.");
		evidenceIds.add(identity);
		if (!knowledge.goals.some((goal) => goal.id === reference.goalId)) fail(".study/settings.json", `evidenceReferences.${i}.goalId`, "capability-reference", "Reference an existing capability; scope compatibility and original facts must be verified before reuse.");
	}
	for (const previous of prior) if (previous.file.kind === "term-settings" && previous.file.termId === settings.termId && previous.file.learnerId && previous.file.learnerId !== settings.learnerId) fail(".study/settings.json", "learnerId", "learner-identity", "Retain the stable learner identity for this term.");
	unique(".study/settings.json", "materials", settings.materials);
	if (new Set(settings.courses.map((course) => course.subject)).size !== settings.courses.length) fail(".study/settings.json", "courses", "duplicate-subject", "Keep one course per subject.");
	for (const course of settings.courses) {
		const material = settings.materials.find((item) => item.id === course.materialId);
		if (!material || material.subject !== course.subject || material.editionStatus !== "identified" || !["official-textbook", "school-material"].includes(material.kind)) fail(".study/settings.json", "courses", "course-material", "Reference an identified school material of the same subject.");
		if (course.progress && !curriculumFor(settings.profile, course.subject)?.units.some((unit) => unit.id === course.progress?.unitId)) fail(".study/settings.json", "courses.progress.unitId", "school-progress", "Confirm a unit in the current knowledge map.");
	}
	if (blocks.filter((block) => block.endedAt === void 0).length > 1) fail(".study/blocks", "", "active-block", "End the previous block before starting another; retain its pending responses.");
	for (const { path, file } of files) {
		if (file.learnerId !== void 0 && file.learnerId !== settings.learnerId) fail(path, "learnerId", "learner-identity", "Use the stable learner identity owning this term.");
		if (file.termId !== settings.termId) fail(path, "termId", "term-identity", "Use the current term identity or preserve this entity in its original archive.");
		if (file.kind === "collections") {
			for (const field of [
				"mistakes",
				"exercises",
				"concepts",
				"objectives",
				"relations",
				"teachingQueue"
			]) unique(path, field, file[field]);
			const legacyIds = /* @__PURE__ */ new Set();
			for (const [i, reference] of (file.legacyReferences ?? []).entries()) {
				const identity = `${reference.kind}:${reference.oldId}`;
				if (legacyIds.has(identity)) fail(path, `legacyReferences.${i}`, "duplicate-reference", "Keep one routing record per preserved old ID.");
				legacyIds.add(identity);
				if (reference.candidateGoalIds.some((id) => !knowledge.goals.some((goal) => goal.id === id)) || reference.routes.some((route) => !knowledge.families.some((family) => family.id === (knowledge.familyAliases[route.familyId] ?? route.familyId) && family.goalIds.includes(route.goalId)))) fail(path, `legacyReferences.${i}`, "legacy-reference", "Use existing compatible capability/family routes; unknown material remains pending.");
			}
			const rewards = /* @__PURE__ */ new Set();
			file.rewards.forEach((reward, index) => {
				const identity = JSON.stringify([reward.day, reward.reason]);
				if (rewards.has(identity)) fail(path, `rewards.${index}`, "duplicate-identity", "Keep one reward per calendar day and reason; participation and reflection allow at most two stars per day.");
				rewards.add(identity);
			});
			for (const objective of file.objectives) if (!customObjectiveMethods[objective.subject].some((method) => method === objective.method) || new Set(objective.conceptIds).size !== objective.conceptIds.length || !objective.conceptIds.every((id) => file.concepts.some((concept) => concept.id === id && concept.subject === objective.subject && concept.confirmedAt !== void 0 && concept.userConfirmation))) fail(path, "objectives", "confirmed-goal", "Reference distinct confirmed concepts of this subject and use an allowed learning method.");
			for (const relation of file.relations) {
				const from = file.concepts.find((concept) => concept.id === relation.fromId);
				const to = file.concepts.find((concept) => concept.id === relation.toId);
				if (!from || !to || from.id === to.id || from.subject !== to.subject || from.confirmedAt === void 0 || to.confirmedAt === void 0 || !from.userConfirmation || !to.userConfirmation) fail(path, "relations", "concept-reference", "Reference two distinct confirmed concepts of the same subject.");
			}
			for (const mistake of file.mistakes) {
				if (mistake.capability) {
					const binding = mistake.capability;
					const goal = knowledge.goals.find((goal) => goal.id === binding.goalId);
					const family = knowledge.families.find((family) => family.id === (knowledge.familyAliases[binding.familyId] ?? binding.familyId));
					if (mistake.objectiveId !== binding.goalId || goal?.subject !== mistake.subject || family?.subject !== mistake.subject || !family.goalIds.includes(binding.goalId)) fail(path, "mistakes.capability", "capability-family", "Classify the original mistake under a compatible capability, mother and reviewed learning range of the same subject.");
				}
				if (mistake.errorType && !errorTypesBySubject[mistake.subject].includes(mistake.errorType)) fail(path, "mistakes.errorType", "subject-cause", "Use a cause belonging to the mistake subject.");
				if (mistake.confirmedAt !== void 0 && (!mistake.userConfirmation || mistake.uncertainties !== "")) fail(path, "mistakes", "mistake-confirmation", "Retain a parent statement and resolve transcription uncertainty before confirmation.");
			}
			continue;
		}
		if (file.kind !== "block" && file.kind !== "worksheet") continue;
		if (file.kind === "block" && file.mode !== "diagnose" && file.intensity !== void 0) fail(path, "intensity", "diagnostic-intensity", "Record intensity only for a diagnostic block; omit it for other activities.");
		const questions = file.kind === "block" ? file.questions : file.items;
		unique(path, "questions", questions);
		unique(path, "responses", file.responses);
		unique(path, "assessments", file.assessments);
		if (new Set(file.assessments.map((item) => item.responseId)).size !== file.assessments.length) fail(path, "assessments", "one-assessment-per-response", "Correct the existing assessment instead of adding another for the same response.");
		if (file.kind === "block" && file.currentQuestionId && !questions.some((item) => item.id === file.currentQuestionId)) fail(path, "currentQuestionId", "question-reference", "Reference a saved question in this block.");
		if (file.kind === "block" && file.currentResponseId && !file.responses.some((response) => response.id === file.currentResponseId && response.questionId === file.currentQuestionId)) fail(path, "currentResponseId", "response-reference", "Select a saved response to the current question in this block.");
		if (!file.context.profile && !file.context.pendingProfile) fail(path, "context.profile", "historical-profile", "Save the historical profile, or explicitly retain a pending legacy profile source.");
		if (file.context.pendingProfile && !settings.migration) fail(path, "context.pendingProfile", "legacy-profile-source", "Pending historical profiles require a preserved migration source.");
		if (file.kind === "block" && file.mode === "school" && !file.context.pendingProfile && (!file.context.profile || !file.context.material || !sameScope(file.context.profile, file.context.material.scope))) fail(path, "context.material", "historical-course", "Save the confirmed compatible course context for this school block.");
		if (file.kind === "block" && file.mode === "school" && file.startedAt >= settings.updatedAt) {
			const course = settings.courses.find((course) => course.subject === file.subject);
			const material = settings.materials.find((material) => material.id === course?.materialId);
			if (!file.context.pendingProfile && (!file.context.profile || !material || !sameScope(settings.profile, material.scope) || !sameScope(settings.profile, file.context.profile) || file.context.material?.id !== material.id)) fail(path, "context.material", "future-course-confirmation", "Confirm a course compatible with the current profile before starting a future school block.");
		}
		if (file.kind === "block") {
			for (const [i, reveal] of (file.answerReveals ?? []).entries()) if (!questions.some((question) => question.id === reveal.questionId)) fail(path, `answerReveals.${i}`, "question-reference", "Record answer exposure against a saved frozen instance.");
			for (const [i, hint] of file.hints.entries()) {
				if (!questions.some((question) => question.id === hint.questionId)) fail(path, `hints.${i}.questionId`, "question-reference", "Reference a saved question in this block.");
				if (hint.responseId && !file.responses.some((response) => response.id === hint.responseId && response.questionId === hint.questionId)) fail(path, `hints.${i}.responseId`, "response-reference", "Associate the hint with a saved response to this question in this block.");
			}
			for (const [i, signal] of (file.stuckSignals ?? []).entries()) if (!questions.some((question) => question.id === signal.questionId)) fail(path, `stuckSignals.${i}.questionId`, "question-reference", "Reference a saved question in this block.");
		}
		for (const [i, question] of questions.entries()) {
			if (question.openmaic) {
				const source = question.openmaic;
				if (source.snapshotHash !== createHash("sha256").update(canonical(source.snapshot)).digest("hex") || source.snapshot !== null && (typeof source.snapshot !== "object" || Array.isArray(source.snapshot) || Reflect.get(source.snapshot, "id") !== source.questionId)) fail(path, `questions.${i}.openmaic`, "source-snapshot", "Preserve the exact original source question identity and snapshot hash.");
			}
			const frozen = prior.some((entry) => {
				if (entry.path !== path || entry.file.kind !== file.kind || entry.file.kind !== "block" && entry.file.kind !== "worksheet") return false;
				const old = (entry.file.kind === "block" ? entry.file.questions : entry.file.items).find((item) => item.id === question.id);
				return (entry.file.kind === "worksheet" || entry.file.responses.some((response) => response.questionId === question.id) || entry.file.rounds?.some((round) => round.presentedQuestionIds.includes(question.id))) && canonical(old) === canonical(question);
			});
			if (file.kind === "block" && file.mode === "diagnose" && question.phase !== void 0) fail(path, `questions.${i}.phase`, "diagnostic-phase", "Omit teaching phases from diagnostic questions.");
			if (file.kind === "block" && file.mode === "review" && !question.mistakeId && !question.capability && question.source.kind !== "legacy") fail(path, `questions.${i}.mistakeId`, "review-mistake", "Bind a review question to a confirmed mistake or an explicitly scoped learned capability of the same subject.");
			if (question.basisStatus && question.source.kind !== "legacy") fail(path, `questions.${i}.basisStatus`, "legacy-basis-source", "Unresolved answer bases belong only to preserved legacy questions.");
			if (typeof question.objectiveId !== "string") {
				if (question.source.kind !== "legacy") fail(path, `questions.${i}.objectiveId`, "pending-target", "Only preserved legacy questions may carry an unresolved target.");
				continue;
			}
			const builtin = builtinObjectiveAnywhere(question.objectiveId);
			const custom = workspace.collections?.objectives.find((item) => item.id === question.objectiveId);
			const capabilityGoal = knowledge.goals.find((goal) => goal.id === question.objectiveId);
			const goal = builtin ?? custom ?? capabilityGoal;
			if (capabilityGoal && !question.capability) fail(path, `questions.${i}.capability`, "tested-scope", "Save the question family and actual tested capability scope.");
			if (question.capability) {
				const binding = question.capability;
				const target = knowledge.goals.find((item) => item.id === binding.goalId);
				const familyId = knowledge.familyAliases[binding.familyId] ?? binding.familyId;
				const family = knowledge.families.find((item) => item.id === familyId);
				if (!target || target.subject !== file.subject || !family?.goalIds.includes(binding.goalId) || family.subject !== file.subject) fail(path, `questions.${i}.capability`, "capability-family", "Bind a family and capability of the same subject with a compatible core method and structure.");
				if (capabilityGoal && question.objectiveId !== binding.goalId) fail(path, `questions.${i}.capability.goalId`, "capability-target", "Use the same stable capability for the question target and tested scope.");
				if (!capabilityGoal && question.source.kind === "legacy" && !resolveLegacyReference("objective", question.objectiveId).candidateGoalIds.includes(binding.goalId)) fail(path, `questions.${i}.capability.goalId`, "legacy-capability-route", "Review the original question and route only its demonstrated capability; an unknown legacy goal needs explicit source review.");
				const oral = binding.goalId.startsWith("e.speak") || [
					"c.read-aloud",
					"c.recite",
					"c.retell",
					"c.describe",
					"c.interact"
				].includes(binding.goalId);
				if ((binding.goalId.startsWith("e.listen") || binding.goalId === "c.listen") && binding.scope.modality !== "listening" || oral && binding.scope.modality !== "oral" || binding.goalId === "e.sound" && !["listening", "oral"].includes(binding.scope.modality) || binding.goalId === "e.view-listen" && binding.scope.modality !== "audiovisual") fail(path, `questions.${i}.capability.scope.modality`, "evidence-modality", "Listening, speech and audiovisual capabilities require their own actual evidence, rather than written answers.");
			}
			if (!goal || goal.subject !== file.subject) fail(path, `questions.${i}.objectiveId`, "subject-target", "Reference a saved or shipped learning goal of this subject.");
			const effective = file.context.scope ?? file.context.profile;
			if (builtin && !frozen && question.source.kind !== "legacy" && (!effective || !builtinObjectiveIn(effective, file.subject, question.objectiveId))) fail(path, `questions.${i}.objectiveId`, "effective-curriculum", "Publish a goal in the historical profile book, or save an explicit scope selecting the goal’s book.");
			if (file.context.scope) {
				const scope = file.context.scope;
				const target = knowledge.goals.find((item) => item.id === question.capability?.goalId);
				const compatibleLegacy = target?.curriculumAssociationIds.filter((id) => resolveLegacyReference("objective", id).candidateGoalIds.includes(target.id)) ?? [];
				const targets = [question.objectiveId, ...capabilityGoal ? compatibleLegacy : target && compatibleLegacy.includes(question.objectiveId) ? [target.id] : []];
				if (!goal || !targets.some((id) => scopeSelects(scope, file.subject, builtinObjectiveAnywhere(id)?.unit ?? "", id))) fail(path, `questions.${i}.objectiveId`, "effective-scope", "Publish a question inside the explicitly selected scope.");
			}
			if (question.source.kind === "exercise") {
				const sourceId = question.source.exerciseId;
				const objectiveId = question.objectiveId;
				if (!knowledge.families.some((family) => family.representative.id === sourceId && family.goalIds.includes(question.capability?.goalId ?? objectiveId)) && ![...workspace.collections?.exercises ?? [], ...subjectExercises(file.subject)].some((item) => item.id === sourceId && item.objectiveId === question.objectiveId)) fail(path, `questions.${i}.source`, "exercise-source", "Reference a saved or shipped exercise for this goal.");
			}
			if (question.source.kind === "mistake" && question.source.mistakeId !== question.mistakeId) fail(path, `questions.${i}.source`, "mistake-source", "Use the same mistake identity for the source and frozen review binding.");
			if (question.mistakeId) {
				const mistake = workspace.collections?.mistakes.find((item) => item.id === question.mistakeId);
				if (!frozen && (!mistake || mistake.subject !== file.subject || mistake.objectiveId !== question.objectiveId || mistake.confirmedAt === void 0 || !mistake.userConfirmation)) fail(path, `questions.${i}.mistakeId`, "mistake-source", "Bind new review content to a confirmed mistake of the same subject and goal; preserve validated published worksheets and used block content for historical bindings.");
				if (!frozen && question.source.kind !== "legacy" && file.kind === "worksheet" && file.origin === "prepared" && mistake?.prompt === question.prompt) fail(path, `questions.${i}.prompt`, "review-variation", "Vary the prompt of a prepared mistake question; retain original prompts in workbook records.");
			}
		}
		if (file.kind === "block" && file.pendingOpenmaic) {
			const events = /* @__PURE__ */ new Set();
			for (const [i, pending] of file.pendingOpenmaic.entries()) {
				const { binding, record } = pending;
				const key = canonical([
					binding.bindingId,
					record.sessionId,
					record.id
				]);
				if (events.has(key)) fail(path, `pendingOpenmaic.${i}`, "duplicate-pending-event", "Preserve one original event per binding, runtime session and record ID.");
				events.add(key);
				if (binding.learnerId !== file.learnerId || binding.termId !== file.termId || binding.blockId !== file.id) fail(path, `pendingOpenmaic.${i}.binding`, "pending-event-owner", "Preserve the original learner, term and block binding.");
				for (const question of questions.filter((question) => question.openmaic?.bindingId === binding.bindingId)) if (question.capability && canonical(question.capability) !== canonical({
					goalId: binding.goalId,
					familyId: binding.familyId,
					scope: binding.scope
				})) fail(path, `pendingOpenmaic.${i}.binding`, "pending-event-target", "Retain the frozen question capability and scope for this binding.");
			}
		}
		for (const [i, response] of file.responses.entries()) {
			const question = questions.find((item) => item.id === response.questionId);
			if (!question) fail(path, `responses.${i}.questionId`, "question-reference", "Save the referenced question before its original answer.");
			if (response.source.kind === "openmaic") {
				const source = response.source;
				const tuple = canonical([
					source.bindingId,
					source.attemptId,
					source.sceneId,
					source.questionId
				]);
				if (!file.learnerId || file.kind !== "block" || !question?.openmaic || question.openmaic.bindingId !== source.bindingId || question.openmaic.sceneId !== source.sceneId || question.openmaic.questionId !== source.questionId || response.rawResponse !== JSON.stringify(source.submittedAnswer)) fail(path, `responses.${i}.source`, "official-source-tuple", "Retain the explicit learner and original question tuple with the exact submitted answer JSON.");
				if (officialSources.has(tuple)) fail(path, `responses.${i}.source`, "duplicate-source-response", "Keep one response per original binding, attempt, scene and question; correct its assessment separately.");
				officialSources.add(tuple);
			}
			if (response.assistance === "independent" && answerWasExposed(file, response)) fail(path, `responses.${i}.assistance`, "answer-revealed", "A repeated frozen instance after answer exposure is not independent; retain help or use a new constrained variant.");
			if (question?.phase === "demo" && response.assistance !== "worked-example") fail(path, `responses.${i}.assistance`, "demonstration", "A real response to a demonstration carries worked-example assistance.");
			if (response.answerDate?.kind === "instant" && response.answerDate.basis === "native-input" && (response.source.kind !== "native" || response.source.receiptAt !== response.answerDate.at || response.source.inputVersion !== response.answerDate.sourceVersion)) fail(path, `responses.${i}.answerDate`, "native-input-version", "Use the matching consumed native input version and receipt time, or retain an unknown date.");
			if (response.answerDate?.kind === "instant" && response.answerDate.basis === "current-manual" && (response.source.kind !== "manual" || response.source.entry !== "current")) fail(path, `responses.${i}.answerDate`, "current-manual-source", "Use a confirmed current manual response; historical and paper entry retain day precision or an unknown date.");
			if (file.kind === "worksheet" && file.answerDate?.kind === "instant") fail(path, "answerDate", "worksheet-date-precision", "Use a parent-confirmed calendar date for a worksheet-wide date.");
			if (file.kind === "block") {
				const hints = file.hints.filter((hint) => hint.questionId === response.questionId);
				const known = hints.some((hint) => hint.responseId === response.id || !hint.responseId && response.answerDate?.kind === "instant" && hint.at <= response.answerDate.at);
				const ambiguous = hints.some((hint) => !hint.responseId && (response.answerDate?.kind === "day" ? studyDay(hint.at) <= response.answerDate.day : response.answerDate?.kind !== "instant"));
				if (known && !["hint", "worked-example"].includes(response.assistance) || ambiguous && response.assistance === "independent") fail(path, `responses.${i}.assistance`, "known-help", "Preserve known help; associate a question hint with its actual response before claiming an independently answered attempt with uncertain order.");
			}
		}
		for (const [i, assessment] of file.assessments.entries()) {
			const response = file.responses.find((item) => item.id === assessment.responseId);
			if (!response) fail(path, `assessments.${i}.responseId`, "response-reference", "Save the original learner response before assessment.");
			if (assessment.official || assessment.officialHistory || assessment.grading) {
				const source = response?.source;
				const history = assessment.officialHistory;
				if (source?.kind !== "openmaic" || assessment.official && (assessment.official.seq <= source.submission.seq || assessment.official.result && assessment.official.result.questionId !== source.questionId) || history && (history.some((review, at) => review.seq <= (at ? history[at - 1].seq : source?.kind === "openmaic" ? source.submission.seq : -1) || review.result && source?.kind === "openmaic" && review.result.questionId !== source.questionId) || new Set(history.map((review) => review.recordId)).size !== history.length || canonical(history.at(-1)) !== canonical(assessment.official))) fail(path, `assessments.${i}.official`, "official-review", "Retain ordered original reviews of the same submitted question, ending at its current official result.");
			}
			if (response && assessment.assistance !== response.assistance) fail(path, `assessments.${i}.assistance`, "assistance-association", "Keep assessment assistance consistent with the saved response.");
			if (file.kind === "worksheet" && !assessment.userConfirmation) fail(path, `assessments.${i}.userConfirmation`, "parent-confirmation", "Record the parent statement confirming this paper result.");
		}
		if (file.kind === "worksheet") {
			if (file.archivedAt !== void 0 && (file.discardedAt !== void 0 || file.drafts.length > 0 || questions.some((question) => !file.responses.some((response) => response.questionId === question.id && file.assessments.some((assessment) => assessment.responseId === response.id && !["unassessed", "stuck"].includes(assessment.result)))))) fail(path, "archivedAt", "worksheet-archive", "Archive only fully assessed worksheets without pending drafts; retain original questions, responses and assessments.");
			unique(path, "drafts", file.drafts);
			for (const draft of file.drafts) if (!questions.some((question) => question.id === draft.questionId)) fail(path, "drafts.questionId", "question-reference", "Retain the published question used by transcription.");
		}
		for (const old of prior.filter((entry) => entry.path === path && entry.file.kind === file.kind)) {
			if (old.file.kind !== "block" && old.file.kind !== "worksheet") continue;
			if (old.file.termId !== file.termId || old.file.id !== file.id) {
				fail(path, "id", "identity-reuse", "Preserve term and entity identity at this path.");
				continue;
			}
			if (old.file.kind === "block" && file.kind === "block" && old.file.answerReveals?.some((reveal) => !file.answerReveals?.some((current) => canonical(current) === canonical(reveal)))) fail(path, "answerReveals", "answer-reveal-history", "Retain the original frozen-instance reveal facts.");
			if (old.file.kind === "block" && file.kind === "block") for (const priorRound of old.file.rounds ?? []) {
				const currentRound = file.rounds?.find((round) => round.id === priorRound.id);
				const { enteredFamilyIds, familyEntries, presentedQuestionIds, endedAt, endReason, ...identity } = priorRound;
				const { enteredFamilyIds: entered, familyEntries: entries, presentedQuestionIds: presented, endedAt: end, endReason: reason, ...currentIdentity } = currentRound ?? priorRound;
				if (familyEntries?.some((entry) => !entries?.some((current) => canonical(entry) === canonical(current)))) fail(path, "rounds", "round-history", "Retain original family entry times; a new day cannot release a saved allowance.");
				if (!currentRound || canonical(identity) !== canonical(currentIdentity) || enteredFamilyIds.some((id) => !entered.includes(id)) || presentedQuestionIds.some((id) => !presented.includes(id)) || endedAt !== void 0 && (endedAt !== end || endReason !== reason || canonical(enteredFamilyIds) !== canonical(entered) || canonical(presentedQuestionIds) !== canonical(presented))) fail(path, "rounds", "round-history", "Preserve round membership, entry, presentation and ending facts; corrections to answers never release an allowance.");
			}
			const oldQuestions = old.file.kind === "block" ? old.file.questions : old.file.items;
			if ((old.file.responses.length > 0 || old.file.kind === "worksheet" && old.file.items.length > 0) && canonical(old.file.context) !== canonical(file.context)) fail(path, "context", "historical-context", "Preserve the historical profile, material and selected scope of published worksheets and answered blocks.");
			for (const question of oldQuestions) if ((old.file.kind === "worksheet" || old.file.responses.some((response) => response.questionId === question.id) || old.file.rounds?.some((round) => round.presentedQuestionIds.includes(question.id))) && canonical(question) !== canonical(questions.find((item) => item.id === question.id))) fail(path, "questions", "frozen-content", "Retain published worksheet and used block question content and target; publish replacements under a new identity.");
			if (file.kind === "block" && old.file.kind === "block") {
				for (const pending of old.file.pendingOpenmaic ?? []) if (!file.pendingOpenmaic?.some((current) => canonical(current.binding) === canonical(pending.binding) && canonical(current.record) === canonical(pending.record))) fail(path, "pendingOpenmaic", "original-pending-event", "Preserve original pending events when resolving their association or assessment.");
			}
			for (const response of old.file.responses) {
				const current = file.responses.find((item) => item.id === response.id);
				const { assistance: oldHelp, assistanceConfirmation: _oldConfirmation, answerDate: oldDate, answerDateConfirmation: _oldDateConfirmation, ...original } = response;
				const { assistance: newHelp, assistanceConfirmation: newConfirmation, answerDate: newDate, answerDateConfirmation: dateConfirmation, ...comparable } = current ?? response;
				const greaterHelp = oldHelp === "independent" && ["hint", "worked-example"].includes(newHelp) || oldHelp === "hint" && newHelp === "worked-example";
				const helpChanged = newHelp !== oldHelp && !((oldHelp === "unknown" || greaterHelp) && newConfirmation);
				const dateChanged = canonical(oldDate) !== canonical(newDate) && !(oldDate?.kind !== "instant" && (newDate?.kind === "day" && newDate.parentConfirmation || newDate?.kind === "unknown" && dateConfirmation));
				if (!current || canonical(comparable) !== canonical(original) || helpChanged || dateChanged) fail(path, "responses", "original-response", "Preserve original response identity and wording; confirm unknown help or actual paper dates explicitly and correct assessment separately.");
			}
		}
	}
	const affected = (path) => issues.some((issue) => issue.path === path || path.startsWith(`${issue.path}/`));
	if (affected(".study/collections.json")) {
		for (const file of [...blocks, ...worksheets]) if ((file.kind === "block" ? file.questions : file.items).some((question) => typeof question.objectiveId === "string" && !builtinObjectiveAnywhere(question.objectiveId) && !knowledge.goals.some((goal) => goal.id === question.objectiveId))) fail(`.study/${file.kind === "block" ? "blocks" : "worksheets"}/${file.id}.json`, "objectiveId", "invalid-target-source", "Repair the referenced custom-goal collection before using this entity.");
	}
	const partial = affected(".study/settings.json") ? void 0 : {
		settings,
		plans: (workspace.plans ?? []).filter((plan) => !affected(`.study/plans/${plan.day}.json`)),
		nativeSources,
		openmaicSources,
		blocks: blocks.filter((block) => !affected(`.study/blocks/${block.id}.json`)),
		worksheets: worksheets.filter((sheet) => !affected(`.study/worksheets/${sheet.id}.json`)),
		...workspace.collections && !affected(".study/collections.json") ? { collections: workspace.collections } : {}
	};
	return {
		valid: issues.length === 0,
		issues,
		files,
		...partial ? { workspace: partial } : {}
	};
}
//#endregion
//#region lib/types/files/recovery.js
/** Read-only migration, archive and restore descriptions. Agents perform every publication and repair directly. */
/**
* Hash original bytes for backup/source verification and recoverable migration identity.
* @param bytes - exact observed source bytes, before compatibility transformation.
* @returns their SHA-256 digest.
*/
function sourceSha256(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}
function workbookMigrationId(id) {
	return `workbook-${id}`.length <= 80 ? `workbook-${id}` : `workbook-${sourceSha256(new TextEncoder().encode(id)).slice(0, 32)}`;
}
/**
* Locate stable entity outputs required by a preserved v1 source, allowing subsequent content corrections.
* @param source - parsed original v1 material whose bytes have been verified independently.
* @returns official paths required by the migrated term.
*/
function migrationOutputPaths(source) {
	const state = stateSchema.parse(migrateStudyFile(structuredClone(source)));
	return [
		".study/settings.json",
		".study/collections.json",
		...state.sessions.map((block) => `.study/blocks/${block.id}.json`),
		...state.worksheets.map((sheet) => `.study/worksheets/${sheet.id}.json`),
		...[...state.workbookResults, ...state.workbookDrafts].map((workbook) => `.study/worksheets/${workbookMigrationId(workbook.id)}.json`)
	];
}
/**
* Describe a v1 conversion only after verifying a distinct original-byte backup.
* @param read - freshly observed, non-mutating legacy read.
* @param backup - independently observed original-byte backup, never an overwritten existing original.
* @param existing - independently read existing v2 output for interrupted-operation recovery.
* @param learner - confirmed child identity, required unless an existing output already records it.
* @param recovery - complete classroom-log read and original-byte backups; future formats block all outputs.
* @returns stable entities, named unsupported facts and explicit partial/conflicting outputs; performs no writes.
*/
function describeMigration(read, backup, existing = [], learner, recovery) {
	const source = read.files.find((file) => file.path === ".study/state.json");
	const hash = source ? sourceSha256(source.bytes) : "";
	const plan = {
		status: "blocked",
		sourceSha256: hash,
		outputs: [],
		preservedSources: [],
		pending: [],
		issues: []
	};
	if (!source || read.status !== "legacy" || backup.path === source.path || backup.targetKey === source.targetKey || sourceSha256(backup.bytes) !== hash) {
		plan.issues.push({
			path: backup.path,
			field: "",
			rule: "original-byte-backup",
			correction: "Preserve a distinct original-byte backup and verify it against the currently observed v1 source."
		});
		return plan;
	}
	const parsed = stateSchema.safeParse(migrateStudyFile(structuredClone(read.legacy)));
	if (!parsed.success) {
		plan.issues.push({
			path: source.path,
			field: "",
			rule: "legacy-schema",
			correction: "Preserve the original bytes and explicitly repair or review unsupported legacy data."
		});
		return plan;
	}
	const state = parsed.data;
	const termId = termSettingsSchema.shape.termId.parse(`legacy-${hash.slice(0, 32)}`);
	plan.termId = termId;
	plan.sourceVersion = source.version;
	plan.backupPath = backup.path;
	const pending = (row, fields, reason) => {
		const fact = {
			sourcePath: source.path,
			row,
			fields,
			reason
		};
		plan.pending.push(fact);
		return fact;
	};
	const declarations = z.object({
		profile: z.object({ parentConfirmation: z.string().optional() }).passthrough(),
		courses: z.array(z.object({ parentConfirmation: z.string().optional() }).passthrough())
	}).passthrough().parse(read.legacy);
	if (!declarations.profile.parentConfirmation?.trim()) pending("profile", ["parentConfirmation"], "The original bytes contain no parent statement; compatibility defaults are not confirmation.");
	for (const [index, course] of declarations.courses.entries()) if (!course.parentConfirmation?.trim()) pending(`courses.${index}`, ["parentConfirmation"], "The original bytes contain no course confirmation statement.");
	if (plan.pending.length) {
		plan.issues.push({
			path: source.path,
			field: "parentConfirmation",
			rule: "legacy-confirmation",
			correction: "Keep the verified legacy bytes and obtain explicit statements for reviewed v2 settings before conversion."
		});
		return plan;
	}
	const knownLearner = existing.find((entry) => entry.file.kind === "term-settings" && entry.file.termId === termId)?.file.learnerId;
	if (!knownLearner && !learner || knownLearner && learner && knownLearner !== learner) {
		plan.issues.push({
			path: source.path,
			field: "learnerId",
			rule: "learner-identity",
			correction: "Provide the confirmed Student learner identity and retain it across terms; source bytes and accounts cannot identify a child."
		});
		return plan;
	}
	const learnerId = termSettingsSchema.shape.learnerId.unwrap().parse(knownLearner ?? learner);
	const preserved = migrationSources([source], recovery ? {
		...recovery,
		backups: [backup, ...recovery.backups]
	} : void 0);
	plan.preservedSources = preserved.preservedSources;
	plan.pending.push(...preserved.pending);
	plan.issues.push(...preserved.issues);
	if (plan.issues.length) return plan;
	const target = (objectiveId, subject) => {
		return (objectiveId ? builtinObjectiveAnywhere(objectiveId) ?? state.objectives.find((goal) => goal.id === objectiveId) : void 0)?.subject === subject ? objectiveId : {
			kind: "pending",
			reason: "Original capability target requires source review."
		};
	};
	const files = [];
	files.push({
		path: ".study/settings.json",
		file: termSettingsSchema.parse({
			format: 2,
			kind: "term-settings",
			termId,
			learnerId,
			revision: state.revision,
			updatedAt: state.updatedAt,
			profile: state.profile,
			materials: state.materials,
			courses: state.courses,
			...state.interests ? { interests: state.interests } : {},
			...state.openmaic ? { openmaic: state.openmaic } : {},
			...state.archivedAt !== void 0 ? { archivedAt: state.archivedAt } : {},
			migration: {
				sourcePath: source.path,
				sourceSha256: hash,
				backupPath: backup.path
			}
		})
	});
	for (const [i, block] of state.sessions.entries()) {
		const legacy = [pending(`sessions.${i}`, [
			"historicalProfile",
			"nativeSessionId",
			"resolvedIntent"
		], "The source has no historical profile snapshot, consumed native input identity or complete resolved intent.")];
		if (state.attempts.some((attempt) => attempt.sessionId === block.id)) legacy.push(pending(`attempts[sessionId=${block.id}]`, [
			"publishedQuestionSource",
			"originalResponseSource",
			"answerDate",
			"assistance"
		], "Flattened assessment text and classification are preserved declarations; grading time does not establish answer time."));
		if (state.task?.sessionId === block.id) legacy.push(pending("task", [
			"referenceAnswerSource",
			"nativeSource",
			"answerDate",
			...state.task.hintLevel > 0 ? [] : ["assistance"]
		], "The current slot retains text and help observations, but lacks a frozen pre-answer basis and consumed native input version."));
		const file = blockSchema.parse({
			format: 2,
			kind: "block",
			termId,
			id: block.id,
			subject: block.subject,
			mode: block.mode,
			...block.intensity ? { intensity: block.intensity } : {},
			startedAt: block.startedAt,
			...block.endedAt !== void 0 ? { endedAt: block.endedAt } : {},
			...block.spentMs !== void 0 ? { spentMs: block.spentMs } : {},
			...block.reflection !== void 0 ? { reflection: block.reflection } : {},
			context: {
				pendingProfile: "The legacy source did not retain the historical profile.",
				...block.scope ? { scope: block.scope } : {},
				...block.materialId && state.materials.find((material) => material.id === block.materialId) ? { material: state.materials.find((material) => material.id === block.materialId) } : {}
			},
			questions: state.attempts.filter((attempt) => attempt.sessionId === block.id).map((attempt) => ({
				id: `legacy-q-${sourceSha256(new TextEncoder().encode(attempt.id)).slice(0, 24)}`,
				objectiveId: target(attempt.objectiveId, block.subject),
				topic: attempt.topic,
				prompt: attempt.prompt,
				answer: "Original reference answer requires review.",
				explanation: "Original explanation requires review.",
				answerEvidence: attempt.answerEvidence,
				basisStatus: "legacy-pending",
				source: {
					kind: "legacy",
					sourcePath: source.path,
					row: `attempts.${state.attempts.indexOf(attempt)}`
				},
				legacyRecord: attempt
			})),
			responses: state.attempts.filter((attempt) => attempt.sessionId === block.id).map((attempt) => ({
				id: attempt.id,
				questionId: `legacy-q-${sourceSha256(new TextEncoder().encode(attempt.id)).slice(0, 24)}`,
				rawResponse: attempt.rawResponse ?? attempt.response,
				response: attempt.response,
				assistance: "unknown",
				answerDate: { kind: "unknown" },
				legacyRecord: attempt,
				source: {
					kind: "legacy",
					sourcePath: source.path,
					row: `attempts.${state.attempts.indexOf(attempt)}`
				}
			})),
			hints: [],
			assessments: state.attempts.filter((attempt) => attempt.sessionId === block.id).map((attempt) => ({
				id: `legacy-a-${sourceSha256(new TextEncoder().encode(attempt.id)).slice(0, 24)}`,
				responseId: attempt.id,
				result: attempt.result,
				assistance: "unknown",
				feedback: attempt.feedback || "Original feedback unavailable.",
				answerEvidence: attempt.answerEvidence,
				assessedAt: attempt.at
			})),
			pendingLegacy: legacy
		});
		const slot = state.task?.sessionId === block.id ? state.task : void 0;
		if (slot) {
			file.questions.push(blockSchema.shape.questions.element.parse({
				id: slot.id,
				objectiveId: target(slot.objectiveId, block.subject),
				topic: slot.topic,
				prompt: slot.prompt,
				...slot.choices ? { choices: slot.choices } : {},
				...slot.figure ? { figure: slot.figure } : {},
				...slot.steps ? { steps: slot.steps } : {},
				...slot.phase ? { phase: slot.phase } : {},
				answer: "Original live reference answer requires review.",
				explanation: "Original live explanation requires review.",
				answerEvidence: "Original live answer basis requires review.",
				basisStatus: "legacy-pending",
				legacyRecord: slot,
				source: {
					kind: "legacy",
					sourcePath: source.path,
					row: "task"
				}
			}));
			file.currentQuestionId = slot.id;
			const submitted = slot.responseId && state.attempts.some((attempt) => attempt.sessionId === block.id && attempt.responseId === slot.responseId);
			if (slot.response && !submitted) {
				const responseId = blockSchema.shape.responses.element.shape.id.parse(`legacy-slot-${sourceSha256(new TextEncoder().encode(slot.id)).slice(0, 24)}`);
				file.responses.push({
					id: responseId,
					questionId: slot.id,
					rawResponse: slot.rawResponse ?? slot.response,
					response: slot.response,
					assistance: slot.phase === "demo" ? "worked-example" : slot.hintLevel > 0 ? "hint" : "unknown",
					answerDate: { kind: "unknown" },
					legacyRecord: z.json().parse(JSON.parse(JSON.stringify(slot))),
					source: {
						kind: "legacy",
						sourcePath: source.path,
						row: "task"
					}
				});
				file.currentResponseId = responseId;
			}
		}
		files.push({
			path: `.study/blocks/${block.id}.json`,
			file
		});
	}
	for (const [i, sheet] of state.worksheets.entries()) {
		const legacy = [];
		const file = worksheetSchema.parse({
			format: 2,
			kind: "worksheet",
			termId,
			id: sheet.id,
			subject: sheet.subject,
			origin: "prepared",
			createdAt: sheet.createdAt,
			...sheet.kind ? { worksheetKind: sheet.kind } : {},
			...sheet.discardedAt !== void 0 ? { discardedAt: sheet.discardedAt } : {},
			context: { pendingProfile: "The legacy source did not retain the historical profile." },
			items: sheet.items.map((item, j) => {
				const goal = item.objectiveId ?? (item.mistakeId ? void 0 : sheet.objectiveId);
				if (!goal) legacy.push(pending(`worksheets.${i}.items.${j}`, ["objectiveId", "originalPublicationSource"], "A current mistake classification cannot recover the original worksheet target."));
				return {
					...item,
					objectiveId: target(goal, sheet.subject),
					legacyRecord: item,
					topic: item.prompt,
					source: {
						kind: "legacy",
						sourcePath: source.path,
						row: `worksheets.${i}.items.${j}`
					}
				};
			}),
			responses: [],
			assessments: [],
			drafts: [],
			pendingLegacy: legacy
		});
		for (const [j, draft] of state.paperDrafts.entries()) if (draft.worksheetId === sheet.id) file.drafts.push({
			id: `legacy-draft-${j}`,
			questionId: draft.itemId,
			response: draft.response,
			result: draft.result,
			assistance: draft.assistance === "independent" ? "unknown" : draft.assistance,
			confidence: draft.confidence ?? "low",
			uncertainties: draft.uncertainties,
			imagePaths: [],
			receivedAt: draft.receivedAt
		});
		for (const [j, result] of state.paperResults.entries()) if (result.worksheetId === sheet.id) {
			if (file.items.find((item) => item.id === result.itemId)) {
				const responseId = `legacy-paper-${j}`;
				file.responses.push({
					id: blockSchema.shape.responses.element.shape.id.parse(responseId),
					questionId: result.itemId,
					rawResponse: result.response,
					assistance: result.assistance === "independent" ? "unknown" : result.assistance,
					answerDate: { kind: "unknown" },
					legacyRecord: result,
					source: {
						kind: "legacy",
						sourcePath: source.path,
						row: `paperResults.${j}`
					}
				});
				file.assessments.push({
					id: `legacy-paper-a-${j}`,
					responseId: blockSchema.shape.responses.element.shape.id.parse(responseId),
					result: result.result,
					assistance: result.assistance === "independent" ? "unknown" : result.assistance,
					feedback: result.feedback || "Original feedback unavailable.",
					answerEvidence: result.answerEvidence,
					assessedAt: result.receivedAt,
					userConfirmation: result.userConfirmation
				});
			}
			legacy.push(pending(`paperResults.${j}`, [
				"originalResponseSource",
				"assistance",
				"answerDate",
				"originalContentSource"
			], "Legacy confirmations and receipt timestamps remain declarations until their original response, help and publication sources are reviewed."));
		}
		file.pendingLegacy = legacy;
		files.push({
			path: `.study/worksheets/${sheet.id}.json`,
			file
		});
	}
	for (const [i, workbook] of [...state.workbookResults, ...state.workbookDrafts].entries()) {
		const confirmed = i < state.workbookResults.length ? state.workbookResults[i] : void 0;
		const worksheetId = workbookMigrationId(workbook.id);
		const row = confirmed ? `workbookResults.${i}` : `workbookDrafts.${i - state.workbookResults.length}`;
		const legacy = [pending(row, [
			"answerDate",
			"nativeSource",
			...workbook.objectiveId ? [] : ["objectiveId"],
			...workbook.outcome === "hinted" ? [] : ["assistance"]
		], "Original workbook content and combined outcome declarations are retained; receipt/confirmation time is not answer time.")];
		const assistance = workbook.outcome === "hinted" && confirmed ? "hint" : "unknown";
		const file = worksheetSchema.parse({
			format: 2,
			kind: "worksheet",
			termId,
			id: worksheetId,
			subject: workbook.subject,
			origin: "workbook",
			createdAt: workbook.receivedAt,
			context: { pendingProfile: "The legacy source did not retain the historical profile." },
			items: [{
				id: "q1",
				objectiveId: target(workbook.objectiveId, workbook.subject),
				legacyRecord: workbook,
				topic: workbook.prompt,
				prompt: workbook.prompt,
				...!confirmed?.correction || !confirmed.explanation || !confirmed.answerEvidence ? { basisStatus: "legacy-pending" } : {},
				answer: confirmed?.correction ?? "Legacy reference answer requires confirmation.",
				explanation: confirmed?.explanation ?? "Legacy explanation requires confirmation.",
				answerEvidence: confirmed?.answerEvidence ?? "Legacy answer basis requires confirmation.",
				source: {
					kind: "legacy",
					sourcePath: source.path,
					row
				}
			}],
			responses: confirmed && workbook.response ? [{
				id: workbook.id,
				questionId: "q1",
				rawResponse: workbook.response,
				assistance,
				answerDate: { kind: "unknown" },
				source: {
					kind: "legacy",
					sourcePath: source.path,
					row
				}
			}] : [],
			assessments: confirmed && workbook.response ? [{
				id: `assessment-${sourceSha256(new TextEncoder().encode(workbook.id)).slice(0, 24)}`,
				responseId: workbook.id,
				result: workbook.outcome === "hinted" || workbook.outcome === "independent-correct" ? "correct" : workbook.outcome === "independent-wrong" ? "incorrect" : "stuck",
				assistance,
				feedback: confirmed.explanation ?? workbook.outcome,
				answerEvidence: confirmed.answerEvidence ?? "Legacy answer basis requires confirmation.",
				assessedAt: confirmed.confirmedAt,
				userConfirmation: confirmed.userConfirmation
			}] : [],
			drafts: !confirmed ? [{
				id: workbook.id,
				questionId: "q1",
				response: workbook.response ?? "Original response unavailable.",
				result: "unassessed",
				assistance: "unknown",
				confidence: "low",
				uncertainties: workbook.uncertainties,
				imagePaths: workbook.imagePath ? [workbook.imagePath] : [],
				receivedAt: workbook.receivedAt
			}] : [],
			pendingLegacy: legacy
		});
		files.push({
			path: `.study/worksheets/${worksheetId}.json`,
			file
		});
	}
	if (state.attempts.some((attempt) => !state.sessions.some((block) => block.id === attempt.sessionId))) pending("attempts[missing owning block]", [
		"owningBlock",
		"publishedQuestionSource",
		"answerDate",
		"assistance"
	], "No saved owning block establishes these flattened legacy associations.");
	const rewardIdentities = /* @__PURE__ */ new Set();
	const rewards = state.rewards.filter((reward, index) => {
		const identity = JSON.stringify([reward.day, reward.reason]);
		if (!collectionsSchema.shape.rewards.element.safeParse(reward).success || rewardIdentities.has(identity)) {
			pending(`rewards.${index}`, ["day", "reason"], "The preserved reward declaration has an invalid calendar day or repeats a daily reward identity.");
			return false;
		}
		rewardIdentities.add(identity);
		return true;
	});
	files.push({
		path: ".study/collections.json",
		file: collectionsSchema.parse({
			format: 2,
			kind: "collections",
			termId,
			legacyReferences: [...new Map([
				...state.objectives.map((item) => resolveLegacyReference("objective", item.id)),
				...state.exercises.map((item) => resolveLegacyReference("exercise", item.id)),
				...state.task?.objectiveId ? [resolveLegacyReference("objective", state.task.objectiveId)] : [],
				...[
					...state.attempts,
					...state.mistakes,
					...state.workbookResults,
					...state.workbookDrafts
				].flatMap((item) => item.objectiveId ? [resolveLegacyReference("objective", item.objectiveId)] : []),
				...state.worksheets.flatMap((sheet) => [sheet.objectiveId, ...sheet.items.map((item) => item.objectiveId)].flatMap((id) => id ? [resolveLegacyReference("objective", id)] : []))
			].map((reference) => [`${reference.kind}:${reference.oldId}`, reference])).values()].map((reference) => ({
				kind: reference.kind,
				oldId: reference.oldId,
				status: reference.status,
				candidateGoalIds: reference.candidateGoalIds,
				routes: reference.routes.map(({ goalId, familyId }) => ({
					goalId,
					familyId
				})),
				reason: reference.pendingReasons.join("; ") || "Original question, tested scope, actual date and help must be reviewed before evidence reuse."
			})),
			legacyHistory: state.attempts.filter((attempt) => !state.sessions.some((block) => block.id === attempt.sessionId)).map((attempt) => ({
				sourcePath: source.path,
				row: `attempts.${state.attempts.indexOf(attempt)}`,
				record: attempt
			})),
			mistakes: state.mistakes.map(({ stage: _stage, independentDays: _days, dueAt: _due, ...mistake }) => mistake),
			exercises: state.exercises,
			concepts: state.concepts,
			objectives: state.objectives,
			relations: state.relations,
			teachingQueue: state.teachingQueue,
			rewards,
			pendingLegacy: plan.pending.slice(0, 5e3)
		})
	});
	for (const { file } of files) file.learnerId = learnerId;
	const validation = validateStudyFiles(files.map(({ path, file }) => ({
		path,
		value: file
	})));
	plan.issues.push(...validation.issues);
	plan.outputs = files.map(({ path, file }) => {
		const prior = existing.find((entry) => entry.path === path);
		return {
			path,
			file,
			status: prior ? canonical(prior.file) === canonical(file) ? "already-valid" : "conflict" : "missing"
		};
	});
	plan.status = validation.valid && !plan.outputs.some((output) => output.status === "conflict") ? "ready" : "partial";
	return plan;
}
/** A validated observed-version backup, separate from business authority. */
const backupSchema = z.object({
	format: z.literal(1),
	kind: z.literal("observed-version"),
	sourcePath: z.string().max(240),
	targetKey: z.string().max(2e3),
	version: z.string().max(2e3),
	observedAt: z.number().int().nonnegative(),
	sha256: z.string().regex(/^[a-f0-9]{64}$/u),
	bytesBase64: z.string().max(11184812)
}).strict();
/**
* Inspect existing backup candidates without restoring or deleting original invalid files.
* @param fs - read-capable workspace adapter.
* @param signal - cancellation signal.
* @returns byte-verified backup records and bounded per-file failures.
*/
async function readBackups(fs, signal) {
	const backupCache = fs.cache?.backups ?? /* @__PURE__ */ new Map();
	const backups = [];
	const issues = [];
	let entries;
	try {
		entries = await fs.list(".study/backups", signal);
	} catch (error) {
		signal.throwIfAborted();
		return {
			backups,
			issues: [{
				path: ".study/backups",
				field: "",
				rule: "backup-list",
				correction: (error instanceof Error ? error.message : "Inspect the backup directory and retry.").slice(0, 500)
			}]
		};
	}
	signal.throwIfAborted();
	if (entries.length > 128) issues.push({
		path: ".study/backups",
		field: "",
		rule: "backup-count",
		correction: "Inspect and explicitly remove excess external backup files; the application retains at most 128."
	});
	let total = 0;
	for (const entry of entries.slice(0, 128)) {
		const path = `.study/backups/${entry.name}`;
		try {
			const observation = await fs.stat(path, signal);
			if (!observation || observation.type !== "file") throw new Error("A backup must be a regular file.");
			const cached = backupCache.get(observation.targetKey);
			const backup = cached?.version === observation.version ? cached.backup : backupSchema.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(await fs.read(path, signal, 12e6))));
			if ((await fs.stat(path, signal))?.version !== observation.version) throw new Error("The backup changed while reading; inspect it again.");
			if (sourceSha256(Buffer.from(backup.bytesBase64, "base64")) !== backup.sha256) throw new Error("Backup bytes do not match their recorded digest.");
			total += Buffer.byteLength(backup.bytesBase64, "base64");
			if (total > 33554432) throw new Error("Retained backup source bytes exceed the 32 MiB limit.");
			if (backupCache.size >= 128) backupCache.delete(backupCache.keys().next().value ?? "");
			while ([...backupCache.values()].reduce((sum, entry) => sum + entry.backup.bytesBase64.length, backup.bytesBase64.length) > 44739248 && backupCache.size > 0) backupCache.delete(backupCache.keys().next().value ?? "");
			backupCache.set(observation.targetKey, {
				version: observation.version,
				backup
			});
			backups.push({
				path,
				backup
			});
		} catch (error) {
			if (signal.aborted) throw error;
			if (issues.length < 100) issues.push({
				path,
				field: "",
				rule: "backup-verification",
				correction: (error instanceof Error ? error.message : "Preserve and inspect the invalid backup.").slice(0, 500)
			});
		}
	}
	signal.throwIfAborted();
	return {
		backups,
		issues
	};
}
/**
* Retain observed valid source bytes with three versions per entity, 128 files and 32 MiB total.
* @param fs - application adapter with guarded backup writes and deletion.
* @param read - current consistent validated read; invalid originals are never replaced.
* @param now - observation clock, distinct from answer time.
* @param signal - cancellation signal.
* @returns verified retained candidates and explicit backup failures.
*/
async function retainObservedBackups(fs, read, now, signal) {
	const identity = read.files.find((file) => file.path === ".study/settings.json")?.targetKey;
	return fs.backupRetention && identity ? fs.backupRetention.run(identity, (retentionSignal) => retainBackups(fs, read, now, retentionSignal), signal) : retainBackups(fs, read, now, signal);
}
async function retainBackups(fs, read, now, signal) {
	const existing = await readBackups(fs, signal);
	if (!fs.write || !fs.remove || read.status !== "valid") return existing;
	const backups = existing.backups.slice();
	if (existing.issues.length) return existing;
	for (const source of read.files.filter((file) => file.file)) {
		const hash = sourceSha256(source.bytes);
		if (backups.some((entry) => entry.backup.sourcePath === source.path && entry.backup.sha256 === hash)) continue;
		const backup = {
			format: 1,
			kind: "observed-version",
			sourcePath: source.path,
			targetKey: source.targetKey,
			version: source.version,
			observedAt: now,
			sha256: hash,
			bytesBase64: Buffer.from(source.bytes).toString("base64")
		};
		const path = `.study/backups/${sourceSha256(new TextEncoder().encode(source.targetKey)).slice(0, 24)}-${hash.slice(0, 24)}.json`;
		const size = (entry) => Buffer.byteLength(entry.backup.bytesBase64, "base64");
		while (backups.filter((entry) => entry.backup.sourcePath === source.path).length >= 3 || backups.length >= 128 || backups.reduce((sum, entry) => sum + size(entry), source.bytes.byteLength) > 33554432) {
			const oldest = backups.filter((entry) => backups.filter((candidate) => candidate.backup.sourcePath === source.path).length >= 3 ? entry.backup.sourcePath === source.path : true).sort((left, right) => left.backup.observedAt - right.backup.observedAt || left.path.localeCompare(right.path))[0];
			if (!oldest) break;
			try {
				const observed = await fs.stat(oldest.path, signal);
				if (observed) await fs.remove(oldest.path, observed.version, signal);
				signal.throwIfAborted();
			} catch (error) {
				signal.throwIfAborted();
				if (existing.issues.length < 100) existing.issues.push({
					path: oldest.path,
					field: "",
					rule: "backup-prune",
					correction: (error instanceof Error ? error.message : "Inspect the retained backup before retrying.").slice(0, 500)
				});
				return {
					backups,
					issues: existing.issues
				};
			}
			backups.splice(backups.indexOf(oldest), 1);
		}
		try {
			await fs.write(path, `${JSON.stringify(backup)}\n`, { kind: "createIfAbsent" }, signal);
			backups.push({
				path,
				backup
			});
		} catch (error) {
			if (signal.aborted) throw error;
			const observed = await readBackups(fs, signal);
			existing.issues.push(...observed.issues.slice(0, 100 - existing.issues.length));
			const committed = observed.backups.find((entry) => entry.path === path && entry.backup.sha256 === hash);
			if (committed) backups.push(committed);
			else if (existing.issues.length < 100) existing.issues.push({
				path,
				field: "",
				rule: "backup-write",
				correction: (error instanceof Error ? error.message : "Inspect whether this backup was saved before retrying.").slice(0, 500)
			});
		}
	}
	signal.throwIfAborted();
	return {
		backups,
		issues: existing.issues
	};
}
/**
* Decode byte-verified backup files for available preserved-version comparison.
* @param backups - explicitly retained observed-version candidates.
* @returns strict official source files; malformed backups supply no trusted comparison.
*/
function backupVersions(backups) {
	return backups.flatMap(({ backup }) => {
		try {
			const bytes = Buffer.from(backup.bytesBase64, "base64");
			if (sourceSha256(bytes) !== backup.sha256) return [];
			const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
			const kind = z.object({ kind: z.enum([
				"term-settings",
				"block",
				"worksheet",
				"collections",
				"daily-plan"
			]) }).passthrough().parse(raw).kind;
			return [{
				path: backup.sourcePath,
				file: officialFileSchemas[kind].parse(raw)
			}];
		} catch (_error) {
			return [];
		}
	});
}
/**
* Validate a chosen restore candidate against independently read current entities.
* @param read - current files, including invalid original bytes and retained verified observations.
* @param chosen - explicit user-selected verified backup.
* @returns destination, preserved-current descriptor and revalidation issues; performs no writes.
*/
function describeRestore(read, chosen) {
	const source = backupVersions([chosen])[0];
	const current = read.files.find((file) => file.path === chosen.backup.sourcePath);
	const prior = [...backupVersions([chosen, ...Array.from(read.cache?.backups.values() ?? [], ({ backup }) => ({
		path: backup.sourcePath,
		backup
	}))]), ...read.files.flatMap(({ path, targetKey }) => {
		const file = read.cache?.files.get(targetKey)?.file;
		return file ? [{
			path,
			file
		}] : [];
	})];
	const issues = source ? validateStudyFiles([...read.files.filter((file) => file.path !== source.path && file.file).map((file) => ({
		path: file.path,
		value: file.file
	})), {
		path: source.path,
		value: source.file
	}], prior, read.workspace?.nativeSources).issues : [{
		path: chosen.path,
		field: "",
		rule: "backup-verification",
		correction: "Choose a byte-verified strict official backup."
	}];
	if (read.status === "future-format") issues.unshift({
		path: chosen.backup.sourcePath,
		field: "format",
		rule: "future-format",
		correction: "Use a compatible plugin for this newer format; do not overwrite it with an older backup."
	});
	return {
		status: issues.length === 0 ? "available" : "blocked",
		destinationPath: chosen.backup.sourcePath,
		backupPath: chosen.path,
		sourceSha256: chosen.backup.sha256,
		...current ? { preserveCurrent: {
			path: current.path,
			version: current.version,
			sha256: sourceSha256(current.bytes)
		} } : {},
		issues
	};
}
/**
* Inspect a partial term archive without recreating an existing valid export or changing the active term.
* @param source - observed source term.
* @param archive - independently read exported term directory.
* @param active - current active term after the separate replacement step.
* @returns stable archive identity, missing outputs and explicit partial outcome.
*/
function describeArchive(source, archive, active) {
	const termId = source.workspace?.settings.termId;
	if (!termId || !["valid", "archived"].includes(source.status)) return void 0;
	const missingPaths = source.files.filter((file) => file.file && !archive.files.some((exported) => exported.path === file.path && exported.file && canonical(exported.file) === canonical(file.file))).map((file) => file.path);
	const conflict = archive.workspace !== void 0 && archive.workspace.settings.termId !== termId;
	const exported = ["valid", "archived"].includes(archive.status) && missingPaths.length === 0;
	const retained = active.workspace?.settings.termId === termId && active.status !== "archived";
	const activeKnown = [
		"valid",
		"archived",
		"missing"
	].includes(active.status);
	return {
		termId,
		archivePath: `.study/archives/${termId}`,
		status: conflict ? "conflict" : exported ? !activeKnown ? "export-valid-active-unknown" : retained ? "export-valid-active-retained" : "complete" : "export-needed",
		missingPaths,
		issues: [...archive.issues, ...active.issues]
	};
}
/**
* Describe stable learner identity and complete old-ID routing for an isolated format-2 term.
* @param read - current independently validated term; agents preserve bytes and publish the returned files.
* @param learner - explicitly known identity when joining this term to earlier terms of the same child.
* @param recovery - verified per-file originals, complete lesson-log read and optional fresh partial outputs.
* @returns repeatable same-identity outputs; unknown custom content stays pending and no learning fact is added.
*/
function describeKnowledgeMigration(read, learner, recovery) {
	const plan = {
		status: "blocked",
		outputs: [],
		preservedSources: [],
		pending: [],
		issues: []
	};
	if (!["valid", "archived"].includes(read.status) || !read.workspace) {
		plan.issues.push({
			path: ".study/settings.json",
			field: "",
			rule: "migration-read",
			correction: "Read and repair the complete isolated active or archived term before describing knowledge migration."
		});
		return plan;
	}
	const { settings, collections, blocks, worksheets } = read.workspace;
	if (settings.learnerId && learner && learner !== settings.learnerId) {
		plan.issues.push({
			path: ".study/settings.json",
			field: "learnerId",
			rule: "learner-identity",
			correction: "Retain the known stable child identity; account sharing cannot join different learners."
		});
		return plan;
	}
	if (!settings.learnerId && !learner) {
		plan.issues.push({
			path: ".study/settings.json",
			field: "learnerId",
			rule: "learner-identity",
			correction: "Provide the explicitly confirmed Student learner identity; a term, workspace or shared service account cannot establish child ownership."
		});
		return plan;
	}
	const learnerId = termSettingsSchema.shape.learnerId.unwrap().parse(settings.learnerId ?? learner);
	plan.learnerId = learnerId;
	plan.termId = settings.termId;
	const preserved = migrationSources(read.files, recovery);
	plan.preservedSources = preserved.preservedSources;
	plan.pending = preserved.pending;
	plan.issues = preserved.issues;
	if (plan.issues.length) return plan;
	const references = new Map((collections?.legacyReferences ?? []).map((reference) => [`${reference.kind}:${reference.oldId}`, reference]));
	const add = (kind, oldId) => {
		if (references.has(`${kind}:${oldId}`)) return;
		const reference = resolveLegacyReference(kind, oldId);
		references.set(`${kind}:${oldId}`, {
			kind,
			oldId,
			status: reference.status,
			candidateGoalIds: reference.candidateGoalIds,
			routes: reference.routes.map(({ goalId, familyId }) => ({
				goalId,
				familyId
			})),
			reason: reference.pendingReasons.join("; ") || "Review original subpart, tested scope, actual answer date and help before evidence reuse."
		});
	};
	for (const goal of collections?.objectives ?? []) add("objective", goal.id);
	for (const exercise of collections?.exercises ?? []) {
		add("exercise", exercise.id);
		add("objective", exercise.objectiveId);
	}
	for (const mistake of collections?.mistakes ?? []) if (mistake.objectiveId) add("objective", mistake.objectiveId);
	for (const file of [...blocks, ...worksheets]) for (const question of file.kind === "block" ? file.questions : file.items) {
		if (typeof question.objectiveId === "string" && !question.capability) add("objective", question.objectiveId);
		if (question.source.kind === "exercise" && !question.capability) add("exercise", question.source.exerciseId);
	}
	const entries = read.files.flatMap((file) => file.file ? [{
		path: file.path,
		file: file.file
	}] : []);
	const outputs = entries.map(({ path, file }) => ({
		path,
		file: file.kind === "collections" ? collectionsSchema.parse({
			...file,
			learnerId,
			legacyReferences: [...references.values()]
		}) : officialFileSchemas[file.kind].parse({
			...file,
			learnerId
		})
	}));
	if (!collections && references.size) outputs.push({
		path: ".study/collections.json",
		file: collectionsSchema.parse({
			format: 2,
			kind: "collections",
			termId: settings.termId,
			learnerId,
			mistakes: [],
			rewards: [],
			legacyReferences: [...references.values()]
		})
	});
	const validation = validateStudyFiles(outputs.map(({ path, file }) => ({
		path,
		value: file
	})), entries);
	plan.issues = validation.issues;
	const current = recovery?.current ?? read;
	plan.outputs = outputs.map(({ path, file }) => {
		const observed = current.files.find((entry) => entry.path === path)?.file;
		const original = entries.find((entry) => entry.path === path)?.file;
		return {
			path,
			file,
			status: canonical(observed) === canonical(file) ? "already-valid" : canonical(observed) === canonical(original) ? "write-needed" : "conflict"
		};
	});
	plan.outputs.sort((left, right) => Number(left.file.kind === "term-settings") - Number(right.file.kind === "term-settings"));
	if (plan.outputs.some((output) => output.status === "conflict") || current.files.some((file) => !outputs.some((output) => output.path === file.path))) plan.issues.push({
		path: ".study",
		field: "",
		rule: "migration-conflict",
		correction: "Preserve concurrent edits and reread the original backups and current outputs before merging by identity."
	});
	plan.status = !validation.valid || plan.issues.length ? "blocked" : plan.outputs.every((output) => output.status === "already-valid") ? "complete" : plan.outputs.some((output) => output.status === "already-valid") ? "partial" : "ready";
	return plan;
}
function migrationSources(sources, recovery) {
	const result = {
		preservedSources: [],
		pending: [],
		issues: []
	};
	if (!recovery) {
		result.issues.push({
			path: ".study",
			field: "",
			rule: "original-byte-backup",
			correction: "Independently read a distinct exact-byte backup of every original file and the complete classroom log before migration."
		});
		return result;
	}
	if (recovery.current?.status === "future-format" || !["valid", "missing"].includes(recovery.lessons.status)) {
		result.issues.push({
			path: recovery.current?.status === "future-format" ? ".study" : OPENMAIC_LESSONS_PATH,
			field: "format",
			rule: "migration-read",
			correction: "Preserve unsupported or incomplete files and use a compatible reader before any migration write."
		});
		return result;
	}
	const originals = [...sources];
	if (recovery.lessons.status === "valid") {
		const { bytes, observation, file } = recovery.lessons;
		if (!bytes || !observation || !file) {
			result.issues.push({
				path: OPENMAIC_LESSONS_PATH,
				field: "",
				rule: "migration-read",
				correction: "Read the complete original lesson file and its exact bytes."
			});
			return result;
		}
		originals.push({
			path: OPENMAIC_LESSONS_PATH,
			...observation,
			bytes
		});
		for (const [index, lesson] of file.lessons.entries()) {
			const fields = [
				"learnerId",
				"termId",
				"blockId"
			].filter((field) => !lesson[field]);
			if (fields.length) result.pending.push({
				sourcePath: OPENMAIC_LESSONS_PATH,
				row: `lessons.${index}`,
				fields,
				reason: "Preserve the original unbound lesson; a URL or shared account cannot establish learning ownership."
			});
		}
	}
	const backups = recovery.backups.map((backup) => ({
		backup,
		sha256: sourceSha256(backup.bytes)
	}));
	for (const source of originals) {
		const sha256 = sourceSha256(source.bytes);
		const backup = backups.find((entry) => entry.backup.path !== source.path && entry.backup.targetKey !== source.targetKey && entry.sha256 === sha256)?.backup;
		if (!backup) result.issues.push({
			path: source.path,
			field: "",
			rule: "original-byte-backup",
			correction: "Preserve and independently verify a distinct backup of these exact original bytes before migration."
		});
		else result.preservedSources.push({
			path: source.path,
			backupPath: backup.path,
			sha256
		});
	}
	return result;
}
//#endregion
//#region lib/types/files/read.js
const MAX_FILE_BYTES = 8388608;
const MAX_TOTAL_BYTES = 33554432;
/**
* Read a stable set of official files, checking membership and actual versions on both sides.
* @param fs - filesystem adapter in the caller's execution world.
* @param signal - cancels discovery, bounded rereads and byte reads.
* @param prior - supplied preserved versions; omitted reads use verified observed-version backups for cold frozen-content checks.
* @param nativeSources - independently resolved consumed input observations, empty for the read-only CLI.
* @param openmaicSources - independently authorized original official submissions and grading.
* @returns validated facts or an explicit incomplete, invalid or changing result.
*/
async function readWorkspace(fs, signal, prior, nativeSources = [], openmaicSources = [], options = {}) {
	const owner = fs.cache ??= new StudyReadCache();
	const backups = prior === void 0 ? await readBackups(fs, signal) : void 0;
	for (let attempt = 0; attempt < 3; attempt++) {
		const read = await readWorkspaceFiles(fs, signal, prior ?? backupVersions(backups.backups), nativeSources, openmaicSources, owner, MAX_TOTAL_BYTES, options);
		if (!read.workspace || read.status !== "valid") return {
			...read,
			cache: owner,
			...backups ? { backupIssues: backups.issues } : {}
		};
		const archiveIssues = [], archiveFiles = [], archiveSources = [];
		read.workspace.archivedEvidence = [];
		const requestedTerms = [...new Set((read.workspace.settings.evidenceReferences ?? []).map((reference) => reference.termId))];
		const terms = requestedTerms.slice(0, 128);
		if (requestedTerms.length > terms.length) archiveIssues.push({
			path: ".study/archives",
			field: "",
			rule: "archive-reference",
			correction: "Reference at most 128 original terms in one current read."
		});
		let total = read.totalBytes ?? read.files.reduce((sum, file) => sum + file.bytes.byteLength, 0);
		const archiveSettings = [];
		for (const term of terms) {
			const prefix = `.study/archives/${term}`;
			const path = (relative) => `${prefix}/${relative.slice(7)}`;
			archiveSettings.push({
				path: path(".study/settings.json"),
				observation: await fs.stat(path(".study/settings.json"), signal)
			});
			const archiveFs = {
				cache: owner,
				stat: (relative, signal) => fs.stat(path(relative), signal),
				list: (relative, signal) => relative === ".study/archives" ? Promise.resolve([]) : fs.list(path(relative), signal),
				read: (relative, signal, limit) => fs.read(path(relative), signal, limit)
			};
			const archive = await readWorkspaceFiles(archiveFs, signal, [], nativeSources, openmaicSources, owner, Math.max(0, MAX_TOTAL_BYTES - total));
			const archiveBytes = archive.totalBytes ?? archive.files.reduce((sum, file) => sum + file.bytes.byteLength, 0);
			const lessons = await readLessonFile({
				...archiveFs,
				read: (path, signal, limit) => archiveFs.read(path, signal, Math.max(0, Math.min(limit, MAX_TOTAL_BYTES - total - archiveBytes)))
			}, signal);
			if (lessons.bytes && lessons.observation) {
				total += lessons.bytes.byteLength;
				archiveFiles.push({
					path: path(".study/openmaic-lessons.json"),
					targetKey: lessons.observation.targetKey,
					version: lessons.observation.version,
					bytes: lessons.bytes
				});
			}
			archiveSettings.push({
				path: path(".study/openmaic-lessons.json"),
				observation: lessons.observation
			});
			const original = archive.workspace;
			const references = read.workspace.settings.evidenceReferences.filter((reference) => reference.termId === term);
			total += archiveBytes;
			archiveFiles.push(...archive.files.map((file) => ({
				...file,
				path: path(file.path)
			})));
			read.membership.push(...archive.membership.filter((directory) => directory.path !== ".study/archives").map((directory) => ({
				...directory,
				path: path(directory.path)
			})));
			if (total > MAX_TOTAL_BYTES || archive.status !== "archived" || !original || original.settings.termId !== term || !original.settings.learnerId || original.settings.learnerId !== read.workspace.settings.learnerId) {
				archiveIssues.push({
					path: prefix,
					field: "",
					rule: "archive-reference",
					correction: "Restore a valid archived term of this same confirmed learner; unavailable history grants no progress."
				});
				continue;
			}
			const structural = references.filter((reference) => {
				const entity = reference.ownerKind === "block" ? original.blocks.find((block) => block.id === reference.ownerId) : original.worksheets.find((sheet) => sheet.id === reference.ownerId);
				const response = entity?.responses.find((response) => response.id === reference.responseId);
				const question = (entity?.kind === "block" ? entity.questions : entity?.items)?.find((question) => question.id === response?.questionId);
				if (!question?.capability || entity?.learnerId !== reference.learnerId || question.capability.goalId !== reference.goalId || !scopeSupports(question.capability.scope, reference.scope)) {
					if (archiveIssues.length < 100) archiveIssues.push({
						path: `${prefix}/${reference.ownerKind === "block" ? "blocks" : "worksheets"}/${reference.ownerId}.json`,
						field: reference.responseId,
						rule: "archive-reference",
						correction: "Reference the original response, learner, capability and an explicitly compatible tested range."
					});
					return false;
				}
				return true;
			});
			if (structural.length) archiveSources.push({
				workspace: original,
				references: structural,
				lessons
			});
			const compatible = structural.filter((reference) => {
				if (reference.review) {
					const entity = reference.ownerKind === "block" ? original.blocks.find((block) => block.id === reference.ownerId) : original.worksheets.find((sheet) => sheet.id === reference.ownerId);
					const response = entity.responses.find((response) => response.id === reference.responseId);
					const question = (entity.kind === "block" ? entity.questions : entity.items).find((question) => question.id === response.questionId);
					const mistake = original.collections?.mistakes.find((mistake) => mistake.id === reference.review.mistakeId && (mistake.objectiveId === question.capability.goalId || mistake.objectiveId === question.objectiveId) && mistake.subject === entity.subject);
					const replay = mistake ? replayMistake({
						...mistake,
						objectiveId: question.capability.goalId
					}, deriveEvidence(original), original.settings.archivedAt) : void 0;
					if (!replay || replay.stage !== reference.review.stage || replay.dueAt !== reference.review.dueAt || JSON.stringify(replay.independentDays) !== JSON.stringify(reference.review.independentDays)) {
						archiveIssues.push({
							path: prefix,
							field: `${reference.responseId}.review`,
							rule: "archive-review",
							correction: "Retain the original independently replayed stage, due date and actual independent days."
						});
						return false;
					}
				}
				return true;
			});
			if (compatible.length) read.workspace.archivedEvidence.push({
				workspace: original,
				references: compatible
			});
		}
		const observations = [...read.files, ...archiveFiles];
		const after = await Promise.all(observations.map((file) => fs.stat(file.path, signal)));
		if (observations.some((file, index) => after[index]?.version !== file.version || after[index]?.targetKey !== file.targetKey)) continue;
		let changed = false;
		for (const settings of archiveSettings) {
			const after = await fs.stat(settings.path, signal);
			if (after?.version !== settings.observation?.version || after?.targetKey !== settings.observation?.targetKey) changed = true;
		}
		for (const directory of read.membership) if (JSON.stringify((await fs.list(directory.path, signal)).map((entry) => `${entry.type}:${entry.name}`).sort()) !== JSON.stringify(directory.names)) changed = true;
		if (changed) continue;
		return {
			...read,
			archiveIssues,
			archiveFiles,
			archiveSources,
			cache: owner,
			...backups ? { backupIssues: backups.issues } : {}
		};
	}
	return {
		status: "changing",
		files: [],
		membership: [],
		issues: [{
			path: ".study/archives",
			field: "",
			rule: "changing-read",
			correction: "Finish archive edits and read the original history again."
		}],
		cache: owner
	};
}
async function readWorkspaceFiles(fs, signal, prior, nativeSources, openmaicSources, owner, budget = MAX_TOTAL_BYTES, options = {}) {
	const cache = owner.files;
	for (let attempt = 0; attempt < 3; attempt += 1) {
		signal.throwIfAborted();
		const membership = [];
		const paths = [".study/settings.json", ".study/collections.json"];
		const discoveryIssues = [];
		for (const [path, limit] of [
			[".study/blocks", 5e3],
			[".study/worksheets", 500],
			[".study/archives", 128]
		]) {
			const entries = await fs.list(path, signal);
			if (entries.length > limit) return {
				status: "invalid",
				files: [],
				membership,
				issues: [{
					path,
					field: "",
					rule: "collection-limit",
					correction: `Keep at most ${limit} entity files in this directory.`
				}]
			};
			const names = entries.map((entry) => `${entry.type}:${entry.name}`).sort();
			membership.push({
				path,
				names
			});
			for (const entry of entries) {
				if (path === ".study/archives") {
					if (entry.type !== "directory" || !/^[a-zA-Z0-9_-]{1,80}$/u.test(entry.name)) discoveryIssues.push({
						path: `${path}/${entry.name}`,
						field: "",
						rule: "archive-membership",
						correction: "Keep each preserved term in a directory named after its stable term identity."
					});
					continue;
				}
				if (entry.type !== "file" || !/^[a-zA-Z0-9_-]{1,80}\.json$/u.test(entry.name)) discoveryIssues.push({
					path: `${path}/${entry.name}`,
					field: "",
					rule: "file-membership",
					correction: "Use one regular JSON file named after the stable entity identity."
				});
				else paths.push(`${path}/${entry.name}`);
			}
		}
		const planEntries = await fs.list(".study/plans", signal);
		membership.push({
			path: ".study/plans",
			names: planEntries.map((entry) => `${entry.type}:${entry.name}`).sort()
		});
		if (planEntries.length > 1e3) discoveryIssues.push({
			path: ".study/plans",
			field: "",
			rule: "collection-limit",
			correction: "Keep at most 1,000 daily plans in this term; archive the term before adding more. No records were removed."
		});
		const planPaths = planEntries.slice(0, 1e3).flatMap((entry) => {
			if (entry.type !== "file" || !/^\d{4}-\d{2}-\d{2}\.json$/u.test(entry.name)) {
				discoveryIssues.push({
					path: `.study/plans/${entry.name}`,
					field: "",
					rule: "file-membership",
					correction: "Use one regular YYYY-MM-DD.json file per learning day."
				});
				return [];
			}
			return [`.study/plans/${entry.name}`];
		});
		const planBefore = await Promise.all(planPaths.map((path) => fs.stat(path, signal)));
		const planBytes = planBefore.reduce((sum, info) => sum + (info?.size ?? 0), 0);
		for (const [i, info] of planBefore.entries()) if (!info || info.type !== "file" || info.size === void 0 || info.size > 1048576) discoveryIssues.push({
			path: planPaths[i],
			field: "",
			rule: "plan-size",
			correction: "Keep each daily plan within 1 MiB; preserve original records and archive or simplify the arrangement explicitly."
		});
		const before = await Promise.all(paths.map((path) => fs.stat(path, signal)));
		if (!before[0]) {
			const legacy = await fs.stat(".study/state.json", signal);
			if (!legacy) {
				if (paths.length > 2 || before[1]) return {
					status: "invalid",
					files: [],
					membership,
					issues: [{
						path: ".study/settings.json",
						field: "",
						rule: "missing-settings",
						correction: "Restore or create term settings for these entities."
					}]
				};
				return {
					status: "missing",
					files: [],
					membership,
					issues: discoveryIssues
				};
			}
			try {
				const bytes = await fs.read(".study/state.json", signal, MAX_FILE_BYTES);
				if ((await fs.stat(".study/state.json", signal))?.version !== legacy.version) continue;
				const value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
				if (typeof value === "object" && value !== null && "format" in value && typeof value.format === "number" && value.format > 1) return {
					status: "future-format",
					files: [{
						path: ".study/state.json",
						...legacy,
						bytes
					}],
					membership,
					issues: [{
						path: ".study/state.json",
						field: "format",
						rule: "future-format",
						correction: "Read this source with a compatible plugin; preserve its bytes."
					}]
				};
				stateSchema.parse(migrateStudyFile(structuredClone(value)));
				return {
					status: "legacy",
					files: [{
						path: ".study/state.json",
						...legacy,
						bytes
					}],
					membership,
					issues: [],
					legacy: value
				};
			} catch (error) {
				if (signal.aborted) throw error;
				return {
					status: "invalid",
					files: [],
					membership,
					issues: [{
						path: ".study/state.json",
						field: "",
						rule: "legacy-read",
						correction: error instanceof Error ? error.message : "Preserve the original and restore valid JSON explicitly."
					}]
				};
			}
		}
		const files = [];
		const input = [];
		const available = [...prior];
		if (planBytes > budget) discoveryIssues.push({
			path: ".study/plans",
			field: "",
			rule: "workspace-size",
			correction: "Daily plans exceed the 32 MiB term budget; preserve originals and archive the term before continuing."
		});
		let total = planBytes > budget ? 0 : planBytes;
		for (const [index, path] of paths.entries()) {
			const observed = before[index];
			if (!observed) continue;
			if (observed.type !== "file") {
				discoveryIssues.push({
					path,
					field: "",
					rule: "regular-file",
					correction: "Use a regular UTF-8 JSON file."
				});
				continue;
			}
			const cached = cache.get(observed.targetKey);
			if (cached?.file) available.push({
				path,
				file: cached.file
			});
			let bytes;
			try {
				bytes = cached?.version === observed.version ? cached.bytes : await fs.read(path, signal, MAX_FILE_BYTES);
			} catch (error) {
				if (signal.aborted) throw error;
				discoveryIssues.push({
					path,
					field: "",
					rule: "file-read",
					correction: error instanceof Error ? error.message : "Preserve the original and inspect this file."
				});
				continue;
			}
			total += bytes.byteLength;
			if (total > budget) return {
				status: "invalid",
				files,
				membership,
				issues: [{
					path: ".study",
					field: "",
					rule: "workspace-size",
					correction: "Keep the current files and selected original history within the 32 MiB read budget."
				}]
			};
			files.push({
				path,
				...observed,
				bytes
			});
			try {
				const value = cached?.version === observed.version ? cached.value : JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
				input.push({
					path,
					value
				});
			} catch (error) {
				discoveryIssues.push({
					path,
					field: "",
					rule: "json",
					correction: error instanceof Error ? error.message : "Save valid UTF-8 JSON."
				});
			}
		}
		const settingsValue = termSettingsSchema.safeParse(input.find((entry) => entry.path === ".study/settings.json")?.value);
		const parsedBlocks = input.flatMap((entry) => {
			const parsed = blockSchema.safeParse(entry.value);
			return parsed.success ? [parsed.data] : [];
		});
		const days = settingsValue.success ? deriveEvidence({
			settings: settingsValue.data,
			blocks: parsedBlocks,
			worksheets: [],
			nativeSources,
			openmaicSources
		}).entries.filter((entry) => entry.sourceStatus === "known" && entry.result !== "unassessed").flatMap((entry) => {
			const day = evidenceDay(entry);
			return day ? [day] : [];
		}) : [];
		const selectedDays = /* @__PURE__ */ new Set([
			studyDay(options.now ?? Date.now()),
			...[...new Set(days)].sort().reverse().slice(0, 3),
			...options.planDay ? [options.planDay] : []
		]);
		for (const block of parsedBlocks) if (block.plan && block.responses.some((response) => {
			const date = response.answerDate;
			return date?.kind === "instant" ? selectedDays.has(studyDay(date.at)) : date?.kind === "day" && selectedDays.has(date.day);
		})) selectedDays.add(block.plan.day);
		const resumed = parsedBlocks.filter((block) => block.endedAt === void 0 || block.rounds?.some((round) => round.endedAt === void 0)).sort((a, b) => b.startedAt - a.startedAt)[0];
		if (resumed?.plan) selectedDays.add(resumed.plan.day);
		const finished = parsedBlocks.filter((block) => block.plan && block.endedAt !== void 0 && studyDay(block.endedAt) === studyDay(options.now ?? Date.now())).sort((a, b) => b.endedAt - a.endedAt)[0];
		if (finished?.plan) selectedDays.add(finished.plan.day);
		const readPlan = async (path) => {
			const index = planPaths.indexOf(path), observed = planBefore[index];
			if (!observed || observed.type !== "file" || (observed.size ?? 0) > 1048576 || files.some((file) => file.path === path)) return;
			const cached = cache.get(observed.targetKey);
			if (cached?.file) available.push({
				path,
				file: cached.file
			});
			try {
				const bytes = cached?.version === observed.version ? cached.bytes : await fs.read(path, signal, 1048576);
				const value = cached?.version === observed.version ? cached.value : JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
				files.push({
					path,
					...observed,
					bytes
				});
				input.push({
					path,
					value
				});
			} catch (error) {
				if (signal.aborted) throw error;
				discoveryIssues.push({
					path,
					field: "",
					rule: "plan-read",
					correction: error instanceof Error ? error.message : "Restore the original daily plan; saved activity and answers are retained."
				});
			}
		};
		for (const day of selectedDays) await readPlan(`.study/plans/${day}.json`);
		const origins = input.flatMap((entry) => {
			const parsed = dailyPlanSchema.safeParse(entry.value);
			return parsed.success ? parsed.data.tasks.flatMap((task) => task.original ? [task.original.day] : []) : [];
		});
		for (const day of new Set(origins)) await readPlan(`.study/plans/${day}.json`);
		const validation = validateStudyFiles(input, available, nativeSources, openmaicSources);
		const migration = validation.workspace?.settings.migration;
		if (migration) {
			const backup = await fs.stat(migration.backupPath, signal);
			try {
				if (!backup || backup.type !== "file" || !migration.backupPath.startsWith(".study/") || migration.backupPath === ".study/settings.json" || migration.backupPath === migration.sourcePath) throw new Error("A distinct preserved original-byte migration backup is required.");
				const bytes = await fs.read(migration.backupPath, signal, MAX_FILE_BYTES);
				if ((await fs.stat(migration.backupPath, signal))?.version !== backup.version) continue;
				if (createHash("sha256").update(bytes).digest("hex") !== migration.sourceSha256) throw new Error("The preserved migration source bytes do not match their recorded digest.");
				const expected = migrationOutputPaths(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)));
				const present = new Set(validation.files.filter((file) => file.file).map((file) => file.path));
				const missing = expected.filter((path) => !present.has(path));
				if (missing.length) discoveryIssues.push({
					path: ".study/settings.json",
					field: "migration",
					rule: "migration-incomplete",
					correction: `Resume the verified migration under the same identities; missing outputs: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` and ${missing.length - 5} more` : ""}.`
				});
				const original = await fs.stat(migration.sourcePath, signal);
				if (original) {
					const originalBytes = await fs.read(migration.sourcePath, signal, MAX_FILE_BYTES);
					if ((await fs.stat(migration.sourcePath, signal))?.version !== original.version) continue;
					if (createHash("sha256").update(originalBytes).digest("hex") !== migration.sourceSha256) throw new Error("The original legacy source changed after the verified migration plan.");
				}
			} catch (error) {
				if (signal.aborted) throw error;
				discoveryIssues.push({
					path: ".study/settings.json",
					field: "migration",
					rule: "migration-source",
					correction: error instanceof Error ? error.message : "Inspect the preserved source before resuming migration."
				});
			}
		}
		const after = await Promise.all(paths.map((path) => fs.stat(path, signal)));
		if (before.some((entry, index) => entry?.version !== after[index]?.version || entry?.targetKey !== after[index]?.targetKey)) continue;
		const planAfter = await Promise.all(planPaths.map((path) => fs.stat(path, signal)));
		if (planBefore.some((entry, index) => entry?.version !== planAfter[index]?.version || entry?.targetKey !== planAfter[index]?.targetKey)) continue;
		let changed = false;
		for (const directory of membership) {
			const entries = await fs.list(directory.path, signal);
			if (JSON.stringify(entries.map((entry) => `${entry.type}:${entry.name}`).sort()) !== JSON.stringify(directory.names)) changed = true;
		}
		if (changed) continue;
		const issues = [...discoveryIssues, ...validation.issues].slice(0, 100);
		for (const observed of files) {
			const parsed = validation.files.find((entry) => entry.path === observed.path)?.file;
			if (parsed) observed.file = parsed;
		}
		if (issues.length > 0) return {
			status: issues.some((issue) => issue.rule === "future-format") ? "future-format" : "invalid",
			files,
			membership,
			issues,
			...validation.workspace && !discoveryIssues.some((issue) => issue.path === ".study/settings.json") ? { workspace: {
				...validation.workspace,
				blocks: validation.workspace.blocks.filter((block) => !discoveryIssues.some((issue) => issue.path === `.study/blocks/${block.id}.json`)),
				worksheets: validation.workspace.worksheets.filter((sheet) => !discoveryIssues.some((issue) => issue.path === `.study/worksheets/${sheet.id}.json`))
			} } : {}
		};
		for (const observed of files) {
			const value = input.find((entry) => entry.path === observed.path)?.value;
			if (cache.size >= 128) cache.delete(cache.keys().next().value ?? "");
			while ([...cache.values()].reduce((sum, entry) => sum + entry.bytes.byteLength, observed.bytes.byteLength) > MAX_TOTAL_BYTES && cache.size > 0) cache.delete(cache.keys().next().value ?? "");
			cache.set(observed.targetKey, {
				version: observed.version,
				bytes: observed.bytes,
				value,
				...observed.file ? { file: observed.file } : {}
			});
		}
		return {
			status: validation.workspace?.settings.archivedAt !== void 0 ? "archived" : "valid",
			totalBytes: total,
			files,
			membership,
			issues,
			...validation.workspace ? { workspace: validation.workspace } : {}
		};
	}
	return {
		status: "changing",
		files: [],
		membership: [],
		issues: [{
			path: ".study",
			field: "",
			rule: "changing-read",
			correction: "Files changed during three reads. Finish the related edits and query again."
		}]
	};
}
//#endregion
export { requireValue as $, capabilityScopeSchema as $t, archiveEvidencePath as A, officialQuestionSchema as At, questionSchema as B, knowledgeSources as Bt, evidenceDay as C, lessonFileSchema as Ct, matchOpenmaicResponse as D, feedbackBindingSchema as Dt, effectiveOpenmaicAssessment as E, readInteractiveLessons as Et, collectionsSchema as F, openmaicQuestionSchema as Ft, worksheetSchema as G, figureSchema as Gt, responseSchema as H, scopeSupports as Ht, dailyPlanSchema as I, openmaicResponseSourceSchema as It, canonical as J, DEFAULT_INTEREST_TAGS as Jt, DAY as K, stateSchema as Kt, dailyTaskSchema as L, pendingOpenmaicSchema as Lt, assessmentSchema as M, officialReviewSchema as Mt, assistanceSchema as N, officialRuntimePayloadSchema as Nt, openmaicAcademicQuestion as O, feedbackCheckpointSchema as Ot, blockSchema as P, officialRuntimeRecordSchema as Pt, matchChoice as Q, capabilityGoalSchema as Qt, learningRoundSchema as R, snapshotRevisionSchema as Rt, evidenceAtCutoff as S, interactiveLessonsView as St, consumeOpenmaicFeedback as T, normalizeOpenmaicBase as Tt, responseSourceSchema as U, commandSchema as Ut, questionSourceSchema as V, resolveLegacyReference as Vt, termSettingsSchema as W, customObjectiveMethods as Wt, foldText as X, interestTagsOf as Xt, choiceMismatch as Y, interestFocus as Yt, formatDuration as Z, capabilityBindingSchema as Zt, replayMistake as _, subjectIdeas as _t, describeKnowledgeMigration as a, spent as at, demonstrablyAfter as b, OPENMAIC_LESSONS_PATH as bt, migrationOutputPaths as c, todaySpent as ct, sourceSha256 as d, builtinObjectiveIn as dt, knowledgeExtensionSchema as en, sameSavedAnswer as et, validateStudyFiles as f, builtinObjectives as ft, dayStart as g, subjectExercises as gt, migrateStudyFile as h, exercisesForObjective as ht, describeArchive as i, showValue as it, archiveEvidenceReferenceSchema as j, officialResultSchema as jt, answerDateSchema as k, officialAnswerSchema as kt, readBackups as l, builtinObjective as lt, effectiveLearningScopes as m, curriculumFor as mt, backupSchema as n, questionFamilySchema as nn, schoolGate as nt, describeMigration as o, studyDay as ot, automaticLearningScopes as p, builtinObjectivesIn as pt, activeSession as q, errorTypesBySubject as qt, backupVersions as r, StudyReadCache as rn, scopeSelects as rt, describeRestore as s, taughtUnit as st, readWorkspace as t, knowledgeIdSchema as tn, sameScope as tt, retainObservedBackups as u, builtinObjectiveAnywhere as ut, scheduleMistakes as v, readLessonFile as vt, evidenceOf as w, lessonSchema as wt, deriveEvidence as x, effectiveOpenmaicBase as xt, attachEvidence as y, OPENMAIC_COOKIE_PATH as yt, officialFileSchemas as z, effectiveKnowledge as zt };
