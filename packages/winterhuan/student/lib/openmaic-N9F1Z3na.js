import { z } from "zod";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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
const text$2 = z.string().trim().min(1).max(2e3);
const id$1 = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const time$1 = z.number().int().nonnegative();
const subject$1 = z.enum([
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
	region: text$2,
	grade: z.number().int().min(1).max(6),
	term: z.enum(["first", "second"]),
	schoolYear: text$2,
	schoolSystem: z.enum(["five-four", "six-three"])
}).strict();
const profile = scope$1.extend({
	nickname: text$2,
	schoolAlias: z.string().trim().max(2e3),
	parentConfirmation: text$2.default("家长已确认学习档案")
}).strict();
const material = z.object({
	id: id$1,
	subject: subject$1,
	scope: scope$1,
	title: text$2,
	publisher: text$2,
	edition: text$2,
	editionStatus: z.enum(["unconfirmed", "identified"]),
	kind: z.enum([
		"official-textbook",
		"school-material",
		"reference",
		"generated"
	]),
	locator: text$2,
	evidence: text$2
}).strict();
const schoolProgress = z.object({
	unitId: id$1,
	confirmedAt: time$1,
	posture: z.enum(["keep-up", "catch-up"]),
	preview: z.boolean(),
	pace: z.enum(["teaching", "review"])
}).strict();
const courseInput = z.object({
	subject: subject$1,
	materialId: id$1,
	unit: text$2,
	parentConfirmation: text$2.default("家长已确认教材与当前单元")
}).strict();
const course = courseInput.extend({ progress: schoolProgress.optional() }).strict();
const mistake = z.object({
	id: id$1,
	subject: subject$1,
	topic: text$2,
	prompt: text$2,
	learnerAnswer: text$2,
	correction: text$2,
	explanation: text$2,
	answerEvidence: text$2,
	imagePath: text$2.optional(),
	uncertainties: z.string().max(2e3),
	materialId: id$1.optional(),
	objectiveId: id$1.optional(),
	errorType: errorTypeSchema.optional()
}).strict();
const concept = z.object({
	id: id$1,
	subject: subject$1,
	name: text$2,
	definition: text$2,
	example: text$2,
	source: text$2,
	facts: z.array(stepText).min(2).max(8).optional(),
	misconceptions: z.array(text$2).max(3).optional()
}).strict();
const objective = z.object({
	id: id$1,
	subject: subject$1,
	title: text$2,
	goal: text$2,
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
	questionPoints: z.array(text$2).max(4).optional(),
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
	explanation: text$2,
	source: text$2
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
	subject: subject$1,
	objectiveId: id$1,
	role: exerciseRoleSchema,
	variant: variantSchema,
	prompt: text$2,
	choices: z.array(text$2).min(2).max(4).optional(),
	figure: figure.optional(),
	steps: z.array(stepText).min(2).max(4),
	answer: text$2,
	explanation: text$2,
	answerEvidence: text$2,
	errorType: errorTypeSchema.optional()
}).strict();
const workspaceExerciseInput = z.object({
	id: id$1,
	subject: subject$1,
	objectiveId: id$1,
	role: exerciseRoleSchema.default("try"),
	variant: variantSchema.default("numeric"),
	prompt: text$2,
	choices: z.array(text$2).min(2).max(4).optional(),
	figure: figure.optional(),
	steps: z.array(stepText).min(2).max(4),
	answer: text$2,
	explanation: text$2,
	answerEvidence: text$2,
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
	subject: subject$1,
	topic: text$2,
	prompt: text$2,
	response: text$2,
	feedback: text$2,
	answerEvidence: text$2,
	mistakeId: id$1.optional(),
	objectiveId: id$1.optional(),
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
	subject: subject$1,
	topic: text$2,
	prompt: text$2,
	choices: z.array(text$2).min(2).max(4).optional(),
	steps: z.array(stepText).min(2).max(5).optional(),
	phase: phaseSchema.optional(),
	variant: variantSchema.optional(),
	mistakeId: id$1.optional(),
	objectiveId: id$1.optional(),
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
	objectiveId: id$1.optional(),
	mistakeId: id$1.optional(),
	variant: variantSchema.optional(),
	prompt: text$2,
	figure: figure.optional(),
	space: answerSpace.optional(),
	answer: text$2,
	explanation: text$2,
	answerEvidence: text$2
}).strict();
const worksheet = z.object({
	id: id$1,
	subject: subject$1,
	kind: sheetKindSchema.optional(),
	objectiveId: id$1.optional(),
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
	response: text$2,
	result,
	assistance,
	feedback: text$2,
	answerEvidence: text$2,
	userConfirmation: text$2.default("家长在面板批改")
}).strict();
const paperDraft = z.object({
	worksheetId: id$1,
	itemId: id$1,
	response: text$2,
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
		response: text$2.optional(),
		assistance: assistance.optional(),
		errorType: errorTypeSchema.optional()
	}).strict()).min(1).max(8),
	userConfirmation: text$2.default("家长在面板批改")
}).strict();
const workbookOutcome = z.enum([
	"stuck",
	"hinted",
	"independent-wrong",
	"independent-correct"
]);
const workbookDraft = z.object({
	id: id$1,
	subject: subject$1,
	prompt: text$2,
	response: text$2.optional(),
	outcome: workbookOutcome,
	objectiveId: id$1.optional(),
	uncertainties: z.string().max(2e3),
	imagePath: text$2.optional()
}).strict();
const teachingItem = z.object({
	id: id$1,
	subject: subject$1,
	prompt: text$2,
	objectiveId: id$1.optional(),
	confirmedAt: time$1,
	sourceDraftId: id$1.optional()
}).strict();
const schoolProgressInput = z.object({
	unitId: id$1,
	posture: z.enum(["keep-up", "catch-up"]),
	preview: z.enum(["on", "off"]),
	pace: z.enum(["teaching", "review"]),
	parentConfirmation: text$2.default("家长确认学校进度")
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
		subject: subject$1,
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
			objectiveIds: z.array(id$1).max(60).optional()
		}).strict().optional()
	}).strict(),
	z.object({
		action: z.literal("task"),
		task
	}).strict(),
	z.object({
		action: z.literal("answer"),
		taskId: id$1,
		response: text$2
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
		subject: subject$1,
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
		subject: subject$1.optional(),
		topic: text$2.optional(),
		objectiveId: z.union([id$1, z.literal("")]).optional(),
		prompt: text$2,
		learnerAnswer: text$2.optional(),
		correction: text$2,
		explanation: text$2,
		answerEvidence: text$2,
		errorType: errorTypeSchema.optional(),
		userConfirmation: text$2.default("家长已核对错题与订正")
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
		definition: text$2.optional(),
		example: text$2.optional(),
		source: text$2.optional(),
		userConfirmation: text$2.default("家长已核对概念")
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
		objectiveId: id$1
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
			response: text$2.optional(),
			assistance: assistance.optional(),
			errorType: errorTypeSchema.optional()
		}).strict()).min(1).max(8),
		userConfirmation: text$2.default("家长已核对转录结果")
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
		correction: text$2.optional(),
		explanation: text$2.optional(),
		answerEvidence: text$2.optional(),
		userConfirmation: text$2.default("家长已核对练习册题目")
	}).strict(),
	z.object({
		action: z.literal("dismiss-teaching"),
		id: id$1
	}).strict(),
	z.object({
		action: z.literal("archive-term"),
		parentConfirmation: text$2.default("家长确认归档本学期")
	}).strict(),
	z.object({
		action: z.literal("openmaic-settings"),
		baseUrl: z.string().trim().max(200),
		parentConfirmation: text$2.default("家长确认 OpenMAIC 地址")
	}).strict(),
	z.object({
		action: z.literal("interests"),
		tags: z.array(z.string().trim().regex(INTEREST_TAG)).min(3).max(8),
		parentConfirmation: text$2.default("家长确认兴趣标签")
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
		subject: subject$1,
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
		unit: text$2.optional(),
		reflection: z.string().max(2e3).optional(),
		scope: z.object({
			grade: z.number().int().min(1).max(6),
			term: z.enum(["first", "second"]),
			units: z.array(id$1).max(20).optional(),
			objectiveIds: z.array(id$1).max(60).optional()
		}).strict().optional()
	}).strict()).max(5e3),
	attempts: z.array(attempt.extend({
		at: time$1,
		materialId: id$1.optional(),
		rawResponse: text$2.optional(),
		questionId: id$1.optional(),
		responseId: id$1.optional()
	}).strict()).max(2e4),
	mistakes: z.array(mistake.extend({
		confirmedAt: time$1.optional(),
		userConfirmation: text$2.optional(),
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
		userConfirmation: text$2.optional()
	}).strict()).max(1e3).default([]),
	objectives: z.array(objective).max(1e3).default([]),
	relations: z.array(relation).max(2e3).default([]),
	worksheets: z.array(worksheet.extend({
		createdAt: time$1,
		discardedAt: time$1.optional()
	}).strict()).max(500).default([]),
	paperResults: z.array(paperResult.extend({ receivedAt: time$1 }).strict()).max(4e3).default([]),
	paperDrafts: z.array(paperDraft.extend({ receivedAt: time$1 }).strict()).max(500).default([]),
	workbookDrafts: z.array(workbookDraft.extend({ receivedAt: time$1 }).strict()).max(500).default([]),
	workbookResults: z.array(workbookDraft.extend({
		receivedAt: time$1,
		confirmedAt: time$1,
		userConfirmation: text$2,
		correction: text$2.optional(),
		explanation: text$2.optional(),
		answerEvidence: text$2.optional()
	}).strict()).max(500).default([]),
	teachingQueue: z.array(teachingItem).max(500).default([]),
	/** Parent override for the OpenMAIC origin. Absent means the environment or the localhost default. */
	openmaic: z.object({
		baseUrl: z.string().trim().min(1).max(200),
		parentConfirmation: text$2
	}).strict().optional(),
	/** Parent theme tags. Absent profiles still read the example list; facts stay on the knowledge map. */
	interests: z.object({
		tags: z.array(z.string().trim().regex(INTEREST_TAG)).min(3).max(8),
		parentConfirmation: text$2
	}).strict().optional(),
	rewards: z.array(z.object({
		day: z.string(),
		reason: z.enum(["participation", "reflection"])
	}).strict()).max(1e3),
	task: task.extend({
		response: text$2.optional(),
		rawResponse: text$2.optional(),
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
const cache$1 = /* @__PURE__ */ new Map();
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
	const cached = cache$1.get(key);
	if (cached !== void 0) return cached;
	const url = new URL(`../knowledge/curriculum/${key}.json`, moduleUrl);
	const file = curriculumSchema.parse(JSON.parse(readFileSync(url, "utf8")));
	cache$1.set(key, file);
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
const termId = id.transform((value) => value);
const blockId = id.transform((value) => value);
const worksheetId = id.transform((value) => value);
const responseId = id.transform((value) => value);
const base = {
	format: z.literal(2),
	termId
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
const target = z.union([id, z.object({
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
/** Published question content reused by blocks and worksheets, including every supported figure. */
const questionSchema = z.object({
	id,
	objectiveId: target,
	mistakeId: id.optional(),
	source: questionSourceSchema,
	topic: text,
	prompt: text,
	answer: text,
	explanation: text,
	answerEvidence: text,
	basisStatus: z.literal("legacy-pending").optional(),
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
	assistance: assistanceSchema,
	assistanceConfirmation: text.optional(),
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
	userConfirmation: text.optional(),
	errorType: errorTypeSchema.optional()
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
	interests: stateSchema.shape.interests,
	openmaic: stateSchema.shape.openmaic,
	archivedAt: time.optional(),
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
	currentQuestionId: id.optional(),
	questions: z.array(questionSchema).max(200),
	responses: z.array(responseSchema).max(500),
	currentResponseId: responseId.optional(),
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
	pendingLegacy: z.array(pending).max(500).optional()
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
/** Bounded non-block collections; mistakes, teaching and curriculum extensions retain explicit ownership. */
const collectionsSchema = z.object({
	...base,
	kind: z.literal("collections"),
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
	rewards: stateSchema.shape.rewards,
	pendingLegacy: z.array(pending).max(5e3).optional()
}).strict();
/** Machine-readable file definitions shared by CLI, application reads and manual saves. */
const officialFileSchemas = {
	"term-settings": termSettingsSchema,
	block: blockSchema,
	worksheet: worksheetSchema,
	collections: collectionsSchema
};
//#endregion
//#region lib/types/files/validation.js
/** Pure parsed-file and cross-entity validation, shared by every Student consumer. */
/**
* Validate parsed official files and available previously validated versions.
* @param input - discovered current files with exact workspace-relative paths.
* @param prior - preserved valid file versions for used-content comparison.
* @param nativeSources - matching consumed input versions resolved from native Session records.
* @returns bounded issues and independently valid workspace entities.
*/
function validateStudyFiles(input, prior = [], nativeSources = []) {
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
			fail(entry.path, "kind", "file-kind", "Use term-settings, block, worksheet or collections.");
			continue;
		}
		const parsed = schema.safeParse(entry.value);
		if (!parsed.success) {
			for (const issue of parsed.error.issues) fail(entry.path, issue.path.join("."), raw.data.format > 2 ? "future-format" : "schema", issue.message);
			continue;
		}
		const file = parsed.data;
		const expected = file.kind === "term-settings" ? ".study/settings.json" : file.kind === "collections" ? ".study/collections.json" : `.study/${file.kind === "block" ? "blocks" : "worksheets"}/${file.id}.json`;
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
		blocks,
		worksheets,
		nativeSources,
		...collections?.kind === "collections" ? { collections } : {}
	};
	const unique = (path, field, rows) => {
		const seen = /* @__PURE__ */ new Set();
		rows.forEach((row, index) => {
			if (seen.has(row.id)) fail(path, `${field}.${index}.id`, "duplicate-identity", "Keep one entry per stable identity; use a new identity for a new attempt.");
			seen.add(row.id);
		});
	};
	unique(".study/settings.json", "materials", settings.materials);
	if (new Set(settings.courses.map((course) => course.subject)).size !== settings.courses.length) fail(".study/settings.json", "courses", "duplicate-subject", "Keep one course per subject.");
	for (const course of settings.courses) {
		const material = settings.materials.find((item) => item.id === course.materialId);
		if (!material || material.subject !== course.subject || material.editionStatus !== "identified" || !["official-textbook", "school-material"].includes(material.kind)) fail(".study/settings.json", "courses", "course-material", "Reference an identified school material of the same subject.");
		if (course.progress && !curriculumFor(settings.profile, course.subject)?.units.some((unit) => unit.id === course.progress?.unitId)) fail(".study/settings.json", "courses.progress.unitId", "school-progress", "Confirm a unit in the current knowledge map.");
	}
	if (blocks.filter((block) => block.endedAt === void 0).length > 1) fail(".study/blocks", "", "active-block", "End the previous block before starting another; retain its pending responses.");
	for (const { path, file } of files) {
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
			for (const objective of file.objectives) if (!customObjectiveMethods[objective.subject].some((method) => method === objective.method) || new Set(objective.conceptIds).size !== objective.conceptIds.length || !objective.conceptIds.every((id) => file.concepts.some((concept) => concept.id === id && concept.subject === objective.subject && concept.confirmedAt !== void 0 && concept.userConfirmation))) fail(path, "objectives", "confirmed-goal", "Reference distinct confirmed concepts of this subject and use an allowed learning method.");
			for (const relation of file.relations) {
				const from = file.concepts.find((concept) => concept.id === relation.fromId);
				const to = file.concepts.find((concept) => concept.id === relation.toId);
				if (!from || !to || from.id === to.id || from.subject !== to.subject || from.confirmedAt === void 0 || to.confirmedAt === void 0 || !from.userConfirmation || !to.userConfirmation) fail(path, "relations", "concept-reference", "Reference two distinct confirmed concepts of the same subject.");
			}
			for (const mistake of file.mistakes) {
				if (mistake.errorType && !errorTypesBySubject[mistake.subject].includes(mistake.errorType)) fail(path, "mistakes.errorType", "subject-cause", "Use a cause belonging to the mistake subject.");
				if (mistake.confirmedAt !== void 0 && (!mistake.userConfirmation || mistake.uncertainties !== "")) fail(path, "mistakes", "mistake-confirmation", "Retain a parent statement and resolve transcription uncertainty before confirmation.");
			}
			continue;
		}
		if (file.kind !== "block" && file.kind !== "worksheet") continue;
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
		for (const [i, question] of questions.entries()) {
			if (question.basisStatus && question.source.kind !== "legacy") fail(path, `questions.${i}.basisStatus`, "legacy-basis-source", "Unresolved answer bases belong only to preserved legacy questions.");
			if (typeof question.objectiveId !== "string") {
				if (question.source.kind !== "legacy") fail(path, `questions.${i}.objectiveId`, "pending-target", "Only preserved legacy questions may carry an unresolved target.");
				continue;
			}
			const builtin = builtinObjectiveAnywhere(question.objectiveId);
			const custom = workspace.collections?.objectives.find((item) => item.id === question.objectiveId);
			const goal = builtin ?? custom;
			if (!goal || goal.subject !== file.subject) fail(path, `questions.${i}.objectiveId`, "subject-target", "Reference a saved or shipped learning goal of this subject.");
			if (file.context.scope && (!goal || !scopeSelects(file.context.scope, file.subject, builtin?.unit ?? "", question.objectiveId))) fail(path, `questions.${i}.objectiveId`, "effective-scope", "Publish a question inside the explicitly selected scope.");
			if (question.source.kind === "exercise") {
				const sourceId = question.source.exerciseId;
				if (![...workspace.collections?.exercises ?? [], ...subjectExercises(file.subject)].some((item) => item.id === sourceId && item.objectiveId === question.objectiveId)) fail(path, `questions.${i}.source`, "exercise-source", "Reference a saved or shipped exercise for this goal.");
			}
		}
		for (const [i, response] of file.responses.entries()) {
			const question = questions.find((item) => item.id === response.questionId);
			if (!question) fail(path, `responses.${i}.questionId`, "question-reference", "Save the referenced question before its original answer.");
			if (question?.phase === "demo" && response.assistance !== "worked-example") fail(path, `responses.${i}.assistance`, "demonstration", "A real response to a demonstration carries worked-example assistance.");
			if (response.answerDate?.kind === "instant" && response.answerDate.basis === "native-input" && (response.source.kind !== "native" || response.source.receiptAt !== response.answerDate.at || response.source.inputVersion !== response.answerDate.sourceVersion)) fail(path, `responses.${i}.answerDate`, "native-input-version", "Use the matching consumed native input version and receipt time, or retain an unknown date.");
			if (response.answerDate?.kind === "instant" && response.answerDate.basis === "current-manual" && (response.source.kind !== "manual" || response.source.entry !== "current")) fail(path, `responses.${i}.answerDate`, "current-manual-source", "Use a confirmed current manual response; historical and paper entry retain day precision or an unknown date.");
			if (file.kind === "worksheet" && file.answerDate?.kind === "instant") fail(path, "answerDate", "worksheet-date-precision", "Use a parent-confirmed calendar date for a worksheet-wide date.");
			if (file.kind === "block" && file.hints.some((hint) => hint.questionId === response.questionId && (hint.responseId === response.id || response.answerDate?.kind === "instant" && hint.at <= response.answerDate.at)) && !["hint", "worked-example"].includes(response.assistance)) fail(path, `responses.${i}.assistance`, "known-help", "Preserve the help used for this response.");
		}
		for (const [i, assessment] of file.assessments.entries()) {
			const response = file.responses.find((item) => item.id === assessment.responseId);
			if (!response) fail(path, `assessments.${i}.responseId`, "response-reference", "Save the original learner response before assessment.");
			if (response && assessment.assistance !== response.assistance) fail(path, `assessments.${i}.assistance`, "assistance-association", "Keep assessment assistance consistent with the saved response.");
			if (file.kind === "worksheet" && !assessment.userConfirmation) fail(path, `assessments.${i}.userConfirmation`, "parent-confirmation", "Record the parent statement confirming this paper result.");
		}
		if (file.kind === "worksheet") {
			unique(path, "drafts", file.drafts);
			for (const draft of file.drafts) if (!questions.some((question) => question.id === draft.questionId)) fail(path, "drafts.questionId", "question-reference", "Retain the published question used by transcription.");
		}
		for (const old of prior.filter((entry) => entry.path === path && entry.file.kind === file.kind)) {
			if (old.file.kind !== "block" && old.file.kind !== "worksheet") continue;
			if (old.file.termId !== file.termId || old.file.id !== file.id) {
				fail(path, "id", "identity-reuse", "Preserve term and entity identity at this path.");
				continue;
			}
			const oldQuestions = old.file.kind === "block" ? old.file.questions : old.file.items;
			if ((old.file.responses.length > 0 || old.file.kind === "worksheet" && old.file.drafts.length > 0) && canonical(old.file.context) !== canonical(file.context)) fail(path, "context", "historical-context", "Preserve the historical profile, material and selected scope used by these responses.");
			for (const question of oldQuestions) if ((old.file.responses.some((response) => response.questionId === question.id) || old.file.kind === "worksheet" && old.file.drafts.some((draft) => draft.questionId === question.id)) && canonical(question) !== canonical(questions.find((item) => item.id === question.id))) fail(path, "questions", "frozen-content", "Retain used question content and target; publish replacements under a new identity.");
			for (const response of old.file.responses) {
				const current = file.responses.find((item) => item.id === response.id);
				const { assistance: oldHelp, assistanceConfirmation: _oldConfirmation, answerDate: oldDate, ...original } = response;
				const { assistance: newHelp, assistanceConfirmation: newConfirmation, answerDate: newDate, ...comparable } = current ?? response;
				const helpChanged = newHelp !== oldHelp && !(oldHelp === "unknown" && newConfirmation);
				const dateChanged = canonical(oldDate) !== canonical(newDate) && !(oldDate?.kind !== "instant" && newDate?.kind === "day" && newDate.parentConfirmation);
				if (!current || canonical(comparable) !== canonical(original) || helpChanged || dateChanged) fail(path, "responses", "original-response", "Preserve original response identity and wording; confirm unknown help or actual paper dates explicitly and correct assessment separately.");
			}
		}
	}
	const affected = (path) => issues.some((issue) => issue.path === path || path.startsWith(`${issue.path}/`));
	if (affected(".study/collections.json")) {
		for (const file of [...blocks, ...worksheets]) if ((file.kind === "block" ? file.questions : file.items).some((question) => typeof question.objectiveId === "string" && !builtinObjectiveAnywhere(question.objectiveId))) fail(`.study/${file.kind === "block" ? "blocks" : "worksheets"}/${file.id}.json`, "objectiveId", "invalid-target-source", "Repair the referenced custom-goal collection before using this entity.");
	}
	const partial = affected(".study/settings.json") ? void 0 : {
		settings,
		nativeSources,
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
//#region lib/types/files/read.js
const MAX_FILE_BYTES = 8388608;
const MAX_TOTAL_BYTES = 33554432;
const cache = /* @__PURE__ */ new Map();
/**
* Read a stable set of official files, checking membership and actual versions on both sides.
* @param fs - filesystem adapter in the caller's execution world.
* @param signal - cancels discovery, bounded rereads and byte reads.
* @param prior - preserved validated versions available for frozen-content checks.
* @param nativeSources - independently resolved consumed input observations, empty for the read-only CLI.
* @returns validated facts or an explicit incomplete, invalid or changing result.
*/
async function readWorkspace(fs, signal, prior = [], nativeSources = []) {
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
		let total = 0;
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
			if (total > MAX_TOTAL_BYTES) return {
				status: "invalid",
				files,
				membership,
				issues: [{
					path: ".study",
					field: "",
					rule: "workspace-size",
					correction: "Archive older records; current official files are limited to 32 MiB."
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
		const validation = validateStudyFiles(input, available, nativeSources);
		const migration = validation.workspace?.settings.migration;
		if (migration) {
			const backup = await fs.stat(migration.backupPath, signal);
			try {
				if (!backup || backup.type !== "file" || !migration.backupPath.startsWith(".study/") || migration.backupPath === ".study/settings.json" || migration.backupPath === migration.sourcePath) throw new Error("A distinct preserved original-byte migration backup is required.");
				const bytes = await fs.read(migration.backupPath, signal, MAX_FILE_BYTES);
				if ((await fs.stat(migration.backupPath, signal))?.version !== backup.version) continue;
				if (createHash("sha256").update(bytes).digest("hex") !== migration.sourceSha256) throw new Error("The preserved migration source bytes do not match their recorded digest.");
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
/**
* Describe a v1 conversion only after verifying a distinct original-byte backup.
* @param read - freshly observed, non-mutating legacy read.
* @param backup - independently observed original-byte backup, never an overwritten existing original.
* @param existing - independently read existing v2 output for interrupted-operation recovery.
* @returns stable entities, named unsupported facts and explicit partial/conflicting outputs; performs no writes.
*/
function describeMigration(read, backup, existing = []) {
	const source = read.files.find((file) => file.path === ".study/state.json");
	const hash = source ? sourceSha256(source.bytes) : "";
	const plan = {
		status: "blocked",
		sourceSha256: hash,
		outputs: [],
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
	const files = [];
	files.push({
		path: ".study/settings.json",
		file: termSettingsSchema.parse({
			format: 2,
			kind: "term-settings",
			termId,
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
		files.push({
			path: `.study/blocks/${block.id}.json`,
			file: blockSchema.parse({
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
				questions: [],
				responses: [],
				hints: [],
				assessments: [],
				pendingLegacy: legacy
			})
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
					objectiveId: goal ?? {
						kind: "pending",
						reason: "Original worksheet target requires source review."
					},
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
		for (const [j, result] of state.paperResults.entries()) if (result.worksheetId === sheet.id) legacy.push(pending(`paperResults.${j}`, [
			"originalResponseSource",
			"assistance",
			"answerDate",
			"originalContentSource"
		], "Legacy confirmations and receipt timestamps remain declarations until their original response, help and publication sources are reviewed."));
		file.pendingLegacy = legacy;
		files.push({
			path: `.study/worksheets/${sheet.id}.json`,
			file
		});
	}
	for (const [i, workbook] of [...state.workbookResults, ...state.workbookDrafts].entries()) {
		const confirmed = i < state.workbookResults.length ? state.workbookResults[i] : void 0;
		const worksheetId = `workbook-${workbook.id}`.length <= 80 ? `workbook-${workbook.id}` : `workbook-${sourceSha256(new TextEncoder().encode(workbook.id)).slice(0, 32)}`;
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
				objectiveId: workbook.objectiveId ?? {
					kind: "pending",
					reason: "Workbook target requires confirmation."
				},
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
	files.push({
		path: ".study/collections.json",
		file: collectionsSchema.parse({
			format: 2,
			kind: "collections",
			termId,
			mistakes: state.mistakes.map(({ stage: _stage, independentDays: _days, dueAt: _due, ...mistake }) => mistake),
			exercises: state.exercises,
			concepts: state.concepts,
			objectives: state.objectives,
			relations: state.relations,
			teachingQueue: state.teachingQueue,
			rewards: state.rewards,
			pendingLegacy: plan.pending.slice(0, 5e3)
		})
	});
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
const backupCache = /* @__PURE__ */ new Map();
/**
* Inspect existing backup candidates without restoring or deleting original invalid files.
* @param fs - read-capable workspace adapter.
* @param signal - cancellation signal.
* @returns byte-verified backup records and bounded per-file failures.
*/
async function readBackups(fs, signal) {
	const backups = [];
	const issues = [];
	const entries = await fs.list(".study/backups", signal);
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
			issues.push({
				path,
				field: "",
				rule: "backup-verification",
				correction: error instanceof Error ? error.message : "Preserve and inspect the invalid backup."
			});
		}
	}
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
			const observed = await fs.stat(oldest.path, signal);
			if (observed) await fs.remove(oldest.path, observed.version, signal);
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
			if (!(await readBackups(fs, signal)).backups.some((entry) => entry.path === path && entry.backup.sha256 === hash)) existing.issues.push({
				path,
				field: "",
				rule: "backup-write",
				correction: error instanceof Error ? error.message : "Inspect whether this backup was saved before retrying."
			});
		}
	}
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
				"collections"
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
* @param read - current files, including invalid original bytes.
* @param chosen - explicit user-selected verified backup.
* @returns destination, preserved-current descriptor and revalidation issues; performs no writes.
*/
function describeRestore(read, chosen) {
	const source = backupVersions([chosen])[0];
	const current = read.files.find((file) => file.path === chosen.backup.sourcePath);
	const issues = source ? validateStudyFiles([...read.files.filter((file) => file.path !== source.path && file.file).map((file) => ({
		path: file.path,
		value: file.file
	})), {
		path: source.path,
		value: source.file
	}]).issues : [{
		path: chosen.path,
		field: "",
		rule: "backup-verification",
		correction: "Choose a byte-verified strict official backup."
	}];
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
//#region lib/types/openmaic.js
/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
const DEFAULT_OPENMAIC_BASE = "http://localhost:3000";
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
* Parent setting wins, then OPENMAIC_BASE, then the localhost default.
* An invalid saved or environment value is skipped rather than failing a status read.
*/
function effectiveOpenmaicBase(saved, env) {
	const fromSaved = saved !== void 0 && saved !== "" ? normalizeOpenmaicBase(saved) : "";
	if (fromSaved) return fromSaved;
	const fromEnv = env !== void 0 && env !== "" ? normalizeOpenmaicBase(env) : "";
	if (fromEnv) return fromEnv;
	return DEFAULT_OPENMAIC_BASE;
}
/** An http(s) URL with no embedded credentials, or undefined when the browser must not open it. */
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
	objectiveId: lessonId.optional(),
	base: z.string().trim().min(1).max(200).refine((value) => normalizeOpenmaicBase(value) !== void 0 && normalizeOpenmaicBase(value) !== "", "OpenMAIC 地址无效"),
	jobId: z.string().trim().min(1).max(200).optional(),
	pollUrl: pollUrl.optional(),
	runId: z.string().trim().min(1).max(200).optional(),
	commandId: z.string().trim().min(1).max(200).optional(),
	retryable: z.boolean().optional(),
	classroomId: z.string().trim().min(1).max(200).regex(/^\S+$/u).optional(),
	url: httpLessonUrl.optional(),
	warning: z.string().trim().max(1e3).optional(),
	error: z.string().trim().max(1e3).optional(),
	summary: z.object({
		fetchedAt: stamp,
		outline: z.string().trim().min(1).max(2e3),
		scenes: z.array(z.object({
			title: z.string().trim().min(1).max(120),
			summary: z.string().trim().max(400).optional()
		}).strict()).max(12)
	}).strict().optional()
}).strict().superRefine((lesson, ctx) => {
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
	}
});
/** Build the settings half of the projection before a file read. */
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
export { builtinObjectivesIn as $, termSettingsSchema as A, sameSavedAnswer as B, blockSchema as C, questionSourceSchema as D, questionSchema as E, choiceMismatch as F, spent as G, schoolGate as H, foldText as I, todaySpent as J, studyDay as K, formatDuration as L, DAY as M, activeSession as N, responseSchema as O, canonical as P, builtinObjectives as Q, matchChoice as R, assistanceSchema as S, officialFileSchemas as T, scopeSelects as U, sameScope as V, showValue as W, builtinObjectiveAnywhere as X, builtinObjective as Y, builtinObjectiveIn as Z, sourceSha256 as _, lessonFileSchema as a, commandSchema as at, answerDateSchema as b, readInteractiveLessons as c, stateSchema as ct, backupVersions as d, interestFocus as dt, curriculumFor as et, describeArchive as f, interestTagsOf as ft, retainObservedBackups as g, readBackups as h, interactiveLessonsView as i, migrateStudyFile as it, worksheetSchema as j, responseSourceSchema as k, readLessonFile as l, errorTypesBySubject as lt, describeRestore as m, OPENMAIC_LESSONS_PATH as n, subjectExercises as nt, lessonSchema as o, customObjectiveMethods as ot, describeMigration as p, taughtUnit as q, effectiveOpenmaicBase as r, subjectIdeas as rt, normalizeOpenmaicBase as s, figureSchema as st, OPENMAIC_COOKIE_PATH as t, exercisesForObjective as tt, backupSchema as u, DEFAULT_INTEREST_TAGS as ut, readWorkspace as v, collectionsSchema as w, assessmentSchema as x, validateStudyFiles as y, requireValue as z };
