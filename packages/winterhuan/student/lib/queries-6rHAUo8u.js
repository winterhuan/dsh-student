import { z } from "zod";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
/** The archive command on its own, so the store can intercept it before applying the mutation. */
const archiveTermSchema = z.object({
	action: z.literal("archive-term"),
	parentConfirmation: z.string().trim().min(1).max(2e3).default("家长确认归档本学期")
}).strict();
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
//#region lib/types/learning/evidence.js
const indexes = /* @__PURE__ */ new WeakMap();
/**
* Derive effective facts once from validated block and worksheet owners.
* @param workspace - current validated entity files.
* @returns one fact per saved response, including unassessed and unknown facts.
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
			const matchedNative = source.kind === "native" ? workspace.nativeSources?.find((item) => item.sessionId === source.sessionId && item.messageId === source.messageId && item.inputVersion === source.inputVersion && item.rawResponse === response.rawResponse) : void 0;
			const answerDate = declaredDate.kind === "instant" && declaredDate.basis === "native-input" ? matchedNative && matchedNative.receiptAt === declaredDate.at ? declaredDate : { kind: "unknown" } : declaredDate;
			entries.push({
				termId: file.termId,
				ownerId: file.id,
				ownerKind: file.kind,
				responseId: response.id,
				questionId: question.id,
				subject: file.subject,
				topic: question.topic,
				...typeof question.objectiveId === "string" && !question.basisStatus ? { objectiveId: question.objectiveId } : {},
				...question.basisStatus ? { basisStatus: question.basisStatus } : {},
				...question.mistakeId ? { mistakeId: question.mistakeId } : {},
				rawResponse: response.rawResponse,
				result: question.basisStatus ? "unassessed" : assessment?.result ?? "unassessed",
				assistance: response.assistance,
				source: response.source,
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
	indexes.set(state, index);
	return state;
}
/**
* Read the shared index. Legacy grading and receipt fields do not establish actual answer dates.
* @param state - current display state or handler result.
* @returns normalized facts for every domain projection.
*/
function evidenceOf(state) {
	const attached = indexes.get(state);
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
	return index.entries.filter((item) => item.answerDate.kind === "instant" ? item.answerDate.at <= now : item.answerDate.kind === "day" ? item.answerDate.day <= today : false);
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
	const rows = evidenceAtCutoff(index, now).filter((item) => item.mistakeId === mistake.id && demonstrablyAfter(item, mistake.confirmedAt));
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
//#region lib/types/learning/mastery.js
/** Subject display order shared by check-in plans and history. */
const SUBJECT_ORDER = [
	"chinese",
	"math",
	"english"
];
const DIAGNOSIS_INTERVAL = 14 * DAY;
const RECHECK_AFTER = 35 * DAY;
/** Objectives probed per intensity. */
const checkInSizes = {
	light: 3,
	standard: 6,
	deep: 12
};
function lastEvidenceCutoff(item) {
	return item.lastAt ?? (item.lastDay ? dayStart(item.lastDay) + 864e5 - 1 : void 0);
}
function outcomeIndex(state, now) {
	const index = /* @__PURE__ */ new Map();
	for (const item of evidenceAtCutoff(evidenceOf(state), now)) {
		if (!item.objectiveId) continue;
		const day = evidenceDay(item);
		const outcome = {
			at: item.answerDate.kind === "instant" ? item.answerDate.at : dayStart(day) + DAY - 1,
			day,
			precision: item.answerDate.kind === "instant" ? "instant" : "day",
			result: item.result,
			assistance: item.assistance,
			evidence: item
		};
		index.set(item.objectiveId, [...index.get(item.objectiveId) ?? [], outcome]);
	}
	return index;
}
/**
* Whether this objective still needs a teaching block.
* One "不会" stays until a later independent correct. Correct only with help, and a teaching-queue item
* with no independent correct after it was confirmed, do the same.
*/
function teachingNeeded(outcomes, queue) {
	const stuckAt = outcomes.flatMap((item) => item.result === "stuck" ? [item.at] : []);
	const latestStuck = stuckAt.length > 0 ? Math.max(...stuckAt) : void 0;
	if (latestStuck !== void 0 && !outcomes.some((item) => (item.evidence ? outcomes.filter((entry) => entry.result === "stuck" && entry.evidence).every((entry) => demonstrablyAfter(item.evidence, entry.evidence)) : item.at > latestStuck) && item.result === "correct" && item.assistance === "independent")) return true;
	if (!outcomes.some((item) => item.result === "correct" && item.assistance === "independent") && outcomes.some((item) => item.result === "correct" && ["hint", "worked-example"].includes(item.assistance))) return true;
	return queue.some((item) => !outcomes.some((outcome) => (outcome.evidence ? demonstrablyAfter(outcome.evidence, item.confirmedAt) : outcome.at >= item.confirmedAt) && outcome.result === "correct" && outcome.assistance === "independent"));
}
/**
* One objective's mastery derived from its outcome evidence, its confirmed mistakes and the teaching queue.
* One rule serves the current-term insight and every cross-grade check-in plan; an objective never
* independently answered that was recently wrong counts as weak, and a recurring error cause raises priority.
*/
function masteryOf(state, base, outcomes, now) {
	const independentDays = new Set(outcomes.filter((item) => item.result === "correct" && item.assistance === "independent").map((item) => studyDay(item.at)));
	const lastAt = outcomes.reduce((latest, item) => latest === void 0 || item.at > latest ? item.at : latest, void 0);
	const helpedOrWrong = outcomes.filter((item) => item.at >= now - 12096e5 && (item.result === "incorrect" || item.result === "partial" || item.result === "correct" && ["hint", "worked-example"].includes(item.assistance))).length;
	const wrongRecent = outcomes.filter((item) => item.at >= now - 12096e5 && (item.result === "incorrect" || item.result === "partial")).length;
	const mistakes = state.mistakes.filter((item) => item.objectiveId === base.id && item.confirmedAt !== void 0 && item.confirmedAt <= now);
	const dueMistakes = mistakes.filter((item) => item.dueAt !== void 0 && item.dueAt <= now).length;
	const activeMistakes = mistakes.filter((item) => item.stage < 4).length;
	const causeCounts = /* @__PURE__ */ new Map();
	for (const mistake of mistakes) if (mistake.errorType !== void 0) causeCounts.set(mistake.errorType, (causeCounts.get(mistake.errorType) ?? 0) + 1);
	const errorTypes = [...causeCounts.entries()].map(([type, count]) => ({
		type,
		count
	})).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)).slice(0, 5);
	const recurringTypes = [...causeCounts.values()].filter((count) => count >= 2).length;
	const teaching = teachingNeeded(outcomes, [...state.teachingQueue.filter((item) => item.objectiveId === base.id && item.confirmedAt <= now), ...evidenceOf(state).stuckSignals.filter((item) => item.objectiveId === base.id && item.at <= now).map((item) => ({ confirmedAt: item.at }))]);
	const weak = teaching || activeMistakes >= 2 || helpedOrWrong >= 2 || independentDays.size === 0 && wrongRecent >= 1;
	const stalled = !weak && independentDays.size < 3 && lastAt !== void 0 && now - lastAt > 864e6;
	const level = dueMistakes > 0 ? "due" : weak ? "weak" : independentDays.size >= 3 && activeMistakes === 0 && helpedOrWrong === 0 ? "mastered" : stalled ? "stalled" : lastAt !== void 0 || mistakes.length > 0 ? "practising" : "untouched";
	const reasons = [];
	if (dueMistakes > 0) reasons.push({
		code: "due-mistakes",
		count: dueMistakes
	});
	if (teaching) reasons.push({
		code: "needs-teaching",
		count: 1
	});
	if (activeMistakes > 0) reasons.push({
		code: "open-mistakes",
		count: activeMistakes
	});
	if (helpedOrWrong > 0) reasons.push({
		code: "recent-help-or-error",
		count: helpedOrWrong
	});
	if (recurringTypes > 0) reasons.push({
		code: "recurring-error",
		count: recurringTypes
	});
	if (stalled && lastAt !== void 0) reasons.push({
		code: "not-practised-recently",
		count: Math.floor((now - lastAt) / DAY)
	});
	if (level === "untouched") reasons.push({
		code: "not-started",
		count: 0
	});
	const priority = level === "mastered" ? 0 : (teaching ? 64 : 0) + dueMistakes * 40 + Math.min(36, helpedOrWrong * 12) + Math.min(24, activeMistakes * 8) + Math.min(16, recurringTypes * 8) + (stalled ? 10 : 0) + (level === "untouched" ? 5 : 0);
	const dateOnlyLatest = lastAt !== void 0 && outcomes.some((item) => item.precision === "day" && item.day === studyDay(lastAt));
	return {
		...base,
		level,
		independentDays: independentDays.size,
		attempts: outcomes.length,
		helpedOrWrong,
		...lastAt !== void 0 ? dateOnlyLatest ? { lastDay: studyDay(lastAt) } : { lastAt } : {},
		activeMistakes,
		dueMistakes,
		masteredMistakes: mistakes.length - activeMistakes,
		errorTypes,
		priority,
		reasons
	};
}
/** New learning stays inside the current unit, or inside every taught unit when catching up, unless a session scope overrides. A review week adds none. */
function learnable(state, item, scope) {
	if (item.level !== "untouched") return false;
	if (scope !== void 0) return scopeSelects(scope, item.subject, item.unit, item.id);
	const gate = schoolGate(state, item.subject);
	if (!gate) return true;
	if (gate.pace === "review") return false;
	if (gate.posture === "catch-up") return gate.taught.has(item.unit);
	return item.unit === gate.current;
}
/**
* Derive mastery, weak points and the next step from saved evidence and the shipped knowledge maps.
* Confirmed mistakes, independent answers on different days and paper results are the only evidence;
* a helped or wrong answer counts against independence, and an unassessed answer is not an error.
* A check-in (diagnose block) is due per subject every fourteen days while untouched, stalled or long-mastered
* objectives remain to probe; its sample rotates across units. The confirmed school frontier is the default
* suggestion range, not a hard gate: a session scope (grade, term, units or objective IDs) can override it
* for cross-grade or custom diagnosis and learning. Without a scope, check-ins, weak points and new goals
* stay in the confirmed unit and earlier ones; preview, if enabled, offers only the next unit after the
* current unit has no new goal, and a review week adds no new goal.
* @param state - current durable learning state.
* @param now - host wall-clock time in milliseconds.
* @returns objective insights, the five weakest points, per-subject check-in plans, at most two due clears and one recommendation.
*/
function studyInsight(state, now) {
	const outcomes = outcomeIndex(state, now);
	const objectives = [];
	const seen = /* @__PURE__ */ new Set();
	const include = (base) => {
		if (seen.has(base.id)) return;
		seen.add(base.id);
		objectives.push(masteryOf(state, base, outcomes.get(base.id) ?? [], now));
	};
	for (const objective of builtinObjectives(state.profile)) include(objective);
	for (const objective of state.objectives) include({
		...objective,
		unit: "",
		unitName: ""
	});
	const diagnosticPlan = (subject, pool, scope) => {
		const lastAt = state.sessions.filter((item) => item.mode === "diagnose" && item.subject === subject).reduce((latest, item) => latest === void 0 || item.startedAt > latest ? item.startedAt : latest, void 0);
		const pick = (item, reason) => ({
			id: item.id,
			title: item.title,
			unit: item.unit,
			unitName: item.unitName,
			reason
		});
		const untouched = pool.filter((item) => item.level === "untouched");
		const stalled = pool.filter((item) => item.level === "stalled");
		const recheck = pool.filter((item) => item.level === "mastered" && lastEvidenceCutoff(item) !== void 0 && now - lastEvidenceCutoff(item) >= RECHECK_AFTER);
		const progress = pool.filter((item) => item.level === "practising");
		const rotated = [];
		const byUnit = /* @__PURE__ */ new Map();
		for (const item of untouched) byUnit.set(item.unit, [...byUnit.get(item.unit) ?? [], item]);
		for (let round = 0; round <= untouched.length && rotated.length < untouched.length; round += 1) for (const list of byUnit.values()) {
			const item = list[round];
			if (item) rotated.push(pick(item, "untouched"));
		}
		const candidates = [
			...rotated,
			...stalled.map((item) => pick(item, "stalled")),
			...recheck.map((item) => pick(item, "recheck"))
		];
		const samples = {
			light: candidates.slice(0, checkInSizes.light),
			standard: candidates.slice(0, checkInSizes.standard),
			deep: [...candidates, ...progress.map((item) => pick(item, "progress"))].slice(0, checkInSizes.deep)
		};
		const count = untouched.length + stalled.length + recheck.length;
		const recommendedIntensity = count <= checkInSizes.light ? "light" : count >= 10 && lastAt !== void 0 ? "deep" : "standard";
		return {
			subject,
			due: samples.standard.length > 0 && (lastAt === void 0 || now - lastAt >= DIAGNOSIS_INTERVAL),
			...lastAt !== void 0 ? {
				lastAt,
				nextAt: lastAt + DIAGNOSIS_INTERVAL
			} : {},
			untouched: untouched.length,
			stalled: stalled.length,
			recheck: recheck.length,
			coverage: {
				probed: pool.length - untouched.length,
				total: pool.length
			},
			recommendedIntensity,
			sample: samples.standard,
			samples,
			...scope !== void 0 ? { scope } : {}
		};
	};
	const diagnostics = SUBJECT_ORDER.map((subject) => diagnosticPlan(subject, objectives.filter((item) => item.subject === subject && taughtUnit(state, subject, item.unit))));
	const objectivesByConcept = /* @__PURE__ */ new Map();
	for (const item of objectives) for (const conceptId of item.conceptIds) objectivesByConcept.set(conceptId, [...objectivesByConcept.get(conceptId) ?? [], item]);
	const prerequisiteGap = (goal) => {
		const file = curriculumFor(state.profile, goal.subject);
		if (!file) return void 0;
		const seen = /* @__PURE__ */ new Set([goal.id]);
		const queue = [...goal.conceptIds];
		while (queue.length > 0) {
			const conceptId = queue.shift();
			if (conceptId === void 0) break;
			for (const relation of file.relations) {
				if (relation.kind !== "prerequisite" || relation.toId !== conceptId) continue;
				for (const candidate of objectivesByConcept.get(relation.fromId) ?? []) {
					if (seen.has(candidate.id)) continue;
					seen.add(candidate.id);
					if (candidate.level !== "mastered" && candidate.level !== "due" && taughtUnit(state, candidate.subject, candidate.unit)) return candidate;
					queue.push(...candidate.conceptIds);
				}
			}
		}
	};
	const gapRedirects = /* @__PURE__ */ new Map();
	for (const goal of objectives) {
		if (!goal.reasons.some((reason) => reason.code === "needs-teaching")) continue;
		const gap = prerequisiteGap(goal);
		if (gap === void 0 || gap.id === goal.id) continue;
		if (!gap.reasons.some((reason) => reason.code === "prerequisite-gap")) gap.reasons.push({
			code: "prerequisite-gap",
			count: 1
		});
		gap.priority += 30;
		if (!gapRedirects.has(goal.id)) gapRedirects.set(goal.id, {
			id: gap.id,
			title: gap.title
		});
	}
	const rankedWeak = objectives.filter((item) => (item.level === "due" || item.level === "weak" || item.level === "stalled") && taughtUnit(state, item.subject, item.unit)).sort((a, b) => b.priority - a.priority);
	const weakPoints = rankedWeak.slice(0, 5);
	const dueMistake = (item) => {
		if (item.confirmedAt === void 0 || item.dueAt === void 0 || item.dueAt > now) return false;
		if (!item.objectiveId) return true;
		const objective = objectives.find((candidate) => candidate.id === item.objectiveId);
		return taughtUnit(state, item.subject, objective?.unit ?? "");
	};
	const dueItems = state.mistakes.filter(dueMistake).sort((left, right) => (left.dueAt ?? 0) - (right.dueAt ?? 0) || left.id.localeCompare(right.id));
	const clearOf = (items) => items.slice(0, 2).map((item) => ({
		id: item.id,
		subject: item.subject,
		topic: item.topic,
		...item.objectiveId !== void 0 ? { objectiveId: item.objectiveId } : {}
	}));
	const stepFor = (subject) => {
		const match = (item) => subject === void 0 || item.subject === subject;
		const subjectDue = dueItems.filter(match);
		const dueSlice = clearOf(subjectDue);
		const ranked = rankedWeak.filter(match);
		const teachingGoal = objectives.filter((item) => match(item) && item.reasons.some((reason) => reason.code === "needs-teaching") && taughtUnit(state, item.subject, item.unit)).sort((a, b) => b.priority - a.priority)[0];
		const queued = state.teachingQueue.filter((item) => item.objectiveId === void 0 && match(item)).sort((a, b) => a.confirmedAt - b.confirmedAt)[0];
		const redirect = teachingGoal ? gapRedirects.get(teachingGoal.id) : void 0;
		const practiceWeak = (subject === void 0 ? ranked.slice(0, 5) : ranked).find((item) => {
			if (item.level === "weak" || item.level === "stalled") return true;
			if (item.reasons.some((reason) => reason.code === "needs-teaching" || reason.code === "not-practised-recently" || reason.code === "prerequisite-gap")) return true;
			const recent = item.reasons.find((reason) => reason.code === "recent-help-or-error");
			if (recent !== void 0 && recent.count >= 2) return true;
			const open = item.reasons.find((reason) => reason.code === "open-mistakes");
			return open !== void 0 && open.count >= 2;
		});
		const checkIn = diagnostics.filter((plan) => plan.due && match(plan)).sort((a, b) => b.sample.length - a.sample.length)[0];
		const untouched = objectives.find((item) => match(item) && learnable(state, item));
		const preview = objectives.find((item) => match(item) && item.level === "untouched" && schoolGate(state, item.subject)?.previewUnit === item.unit);
		const held = objectives.find((item) => match(item) && item.level === "untouched" && schoolGate(state, item.subject) !== void 0 && !learnable(state, item) && schoolGate(state, item.subject)?.previewUnit !== item.unit);
		const recommendation = teachingGoal && redirect ? {
			kind: "practice",
			subject: teachingGoal.subject,
			objectiveId: redirect.id,
			title: redirect.title,
			reason: {
				code: "prerequisite-gap",
				count: 1
			},
			redirectedFrom: {
				id: teachingGoal.id,
				title: teachingGoal.title
			}
		} : teachingGoal ? {
			kind: "practice",
			subject: teachingGoal.subject,
			objectiveId: teachingGoal.id,
			title: teachingGoal.title,
			reason: {
				code: "needs-teaching",
				count: 1
			}
		} : queued ? {
			kind: "practice",
			subject: queued.subject,
			title: queued.prompt.slice(0, 40),
			reason: {
				code: "needs-teaching",
				count: 1
			}
		} : practiceWeak ? {
			kind: "practice",
			subject: practiceWeak.subject,
			objectiveId: practiceWeak.id,
			title: practiceWeak.title,
			reason: practiceWeak.reasons.find((reason) => reason.code !== "due-mistakes") ?? practiceWeak.reasons[0] ?? {
				code: "recent-help-or-error",
				count: 0
			}
		} : checkIn ? {
			kind: "diagnose",
			subject: checkIn.subject,
			reason: {
				code: "diagnosis-due",
				count: checkIn.sample.length
			}
		} : untouched ? {
			kind: "learn",
			subject: untouched.subject,
			objectiveId: untouched.id,
			title: untouched.title,
			reason: {
				code: "not-started",
				count: 0
			}
		} : preview ? {
			kind: "preview",
			subject: preview.subject,
			objectiveId: preview.id,
			title: preview.title,
			reason: {
				code: "preview",
				count: 0
			}
		} : held ? {
			kind: "hold",
			subject: held.subject,
			reason: {
				code: "school-pace",
				count: 0
			}
		} : dueSlice[0] ? {
			kind: "review",
			subject: dueSlice[0].subject,
			...dueSlice[0].objectiveId !== void 0 ? { objectiveId: dueSlice[0].objectiveId } : {},
			title: dueSlice[0].topic.slice(0, 40),
			reason: {
				code: "due-mistakes",
				count: dueSlice.length
			}
		} : null;
		const unitId = recommendation === null ? void 0 : state.courses.find((item) => item.subject === recommendation.subject)?.progress?.unitId;
		const unitName = unitId !== void 0 && recommendation !== null ? curriculumFor(state.profile, recommendation.subject)?.units.find((unit) => unit.id === unitId)?.name : void 0;
		return {
			recommendation: recommendation !== null && unitName !== void 0 ? {
				...recommendation,
				unitName
			} : recommendation,
			dueToday: dueSlice,
			dueBacklog: subjectDue.length,
			weakPoints: ranked.slice(0, 5)
		};
	};
	const across = stepFor();
	const subjectSteps = {
		chinese: stepFor("chinese"),
		math: stepFor("math"),
		english: stepFor("english")
	};
	const recommendation = across.recommendation;
	const dueToday = across.dueToday;
	const dueBacklog = across.dueBacklog;
	const profileCounts = /* @__PURE__ */ new Map();
	for (const mistake of state.mistakes) {
		if (mistake.confirmedAt === void 0 || mistake.errorType === void 0) continue;
		const unit = mistake.objectiveId !== void 0 ? objectives.find((item) => item.id === mistake.objectiveId)?.unit ?? "" : "";
		if (!taughtUnit(state, mistake.subject, unit)) continue;
		const key = `${mistake.subject}:${mistake.errorType}`;
		const entry = profileCounts.get(key) ?? {
			subject: mistake.subject,
			type: mistake.errorType,
			count: 0,
			objectiveIds: /* @__PURE__ */ new Set()
		};
		entry.count += 1;
		if (mistake.objectiveId !== void 0) entry.objectiveIds.add(mistake.objectiveId);
		profileCounts.set(key, entry);
	}
	const errorProfile = [...profileCounts.values()].map((entry) => ({
		subject: entry.subject,
		type: entry.type,
		count: entry.count,
		objectiveIds: [...entry.objectiveIds]
	})).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)).slice(0, 5);
	const today = studyDay(now);
	const understandingReminders = [];
	const remind = (item, code) => {
		if (understandingReminders.length >= 3 || understandingReminders.some((reminder) => reminder.code === code && reminder.objectiveId === item.id)) return;
		understandingReminders.push({
			code,
			subject: item.subject,
			objectiveId: item.id,
			title: item.title
		});
	};
	for (const item of objectives) {
		const history = outcomes.get(item.id) ?? [];
		if (history.some((outcome) => outcome.result !== "stuck") && item.independentDays === 0 && history.every((outcome) => studyDay(outcome.at) === today)) remind(item, "first-explain");
	}
	for (const mistake of state.mistakes) {
		if (mistake.confirmedAt === void 0 || !mistake.independentDays.includes(today)) continue;
		const item = mistake.objectiveId !== void 0 ? objectives.find((candidate) => candidate.id === mistake.objectiveId) : void 0;
		if (item !== void 0) remind(item, "after-correction");
		else if (understandingReminders.length < 3) understandingReminders.push({
			code: "after-correction",
			subject: mistake.subject,
			title: mistake.topic
		});
	}
	if (recommendation !== null && (recommendation.kind === "preview" || recommendation.kind === "learn") && recommendation.objectiveId !== void 0) {
		const nextTarget = objectives.find((candidate) => candidate.id === recommendation.objectiveId);
		const practised = objectives.filter((candidate) => lastEvidenceCutoff(candidate) !== void 0).sort((a, b) => (lastEvidenceCutoff(b) ?? 0) - (lastEvidenceCutoff(a) ?? 0))[0];
		if (nextTarget !== void 0 && (recommendation.kind === "preview" || practised === void 0 || practised.unit !== nextTarget.unit)) remind(nextTarget, "before-next");
	}
	return {
		objectives,
		weakPoints,
		diagnostics,
		recommendation,
		dueToday,
		dueBacklog,
		subjectSteps,
		errorProfile,
		understandingReminders
	};
}
/**
* A check-in plan for an explicit scope: custom objectives, specific units, or a whole cross-grade map.
* The scope overrides the confirmed school frontier for this plan; the caller may pass a precomputed
* insight for the same state and time. Objectives outside the profile use the same mastery rule as the
* current-term insight.
* @param state - current durable learning state.
* @param subject - subject to plan for.
* @param now - host wall-clock time in milliseconds.
* @param scope - grade and term with optional unit or objective narrowing.
* @param insight - precomputed insight for the same state and time, when the caller already has one.
* @returns the plan for the scoped pool.
*/
function diagnosticFor(state, subject, now, scope, insight) {
	const current = insight ?? studyInsight(state, now);
	const profileScope = scope.grade === state.profile.grade && scope.term === state.profile.term;
	let pool;
	if (profileScope) pool = current.objectives.filter((item) => item.subject === subject && (scope.objectiveIds !== void 0 ? scope.objectiveIds.includes(item.id) : scope.units !== void 0 ? item.unit !== "" && scope.units.includes(item.unit) : item.unit !== "" && curriculumFor(scope, subject)?.units.some((unit) => unit.id === item.unit) === true));
	else {
		const map = builtinObjectivesIn(scope, subject);
		const scoped = scope.objectiveIds !== void 0 ? map.filter((item) => scope.objectiveIds?.includes(item.id)) : scope.units !== void 0 ? map.filter((item) => item.unit !== "" && scope.units?.includes(item.unit)) : map;
		const outcomes = outcomeIndex(state, now);
		pool = scoped.map((base) => current.objectives.find((item) => item.id === base.id) ?? masteryOf(state, base, outcomes.get(base.id) ?? [], now));
	}
	const lastAt = state.sessions.filter((item) => item.mode === "diagnose" && item.subject === subject).reduce((latest, item) => latest === void 0 || item.startedAt > latest ? item.startedAt : latest, void 0);
	const pick = (item, reason) => ({
		id: item.id,
		title: item.title,
		unit: item.unit,
		unitName: item.unitName,
		reason
	});
	const untouched = pool.filter((item) => item.level === "untouched");
	const stalled = pool.filter((item) => item.level === "stalled");
	const recheck = pool.filter((item) => item.level === "mastered" && lastEvidenceCutoff(item) !== void 0 && now - lastEvidenceCutoff(item) >= RECHECK_AFTER);
	const progress = pool.filter((item) => item.level === "practising");
	const rotated = [];
	const byUnit = /* @__PURE__ */ new Map();
	for (const item of untouched) byUnit.set(item.unit, [...byUnit.get(item.unit) ?? [], item]);
	for (let round = 0; round <= untouched.length && rotated.length < untouched.length; round += 1) for (const list of byUnit.values()) {
		const item = list[round];
		if (item) rotated.push(pick(item, "untouched"));
	}
	const candidates = [
		...rotated,
		...stalled.map((item) => pick(item, "stalled")),
		...recheck.map((item) => pick(item, "recheck"))
	];
	const samples = {
		light: candidates.slice(0, checkInSizes.light),
		standard: candidates.slice(0, checkInSizes.standard),
		deep: [...candidates, ...progress.map((item) => pick(item, "progress"))].slice(0, checkInSizes.deep)
	};
	const count = untouched.length + stalled.length + recheck.length;
	const recommendedIntensity = count <= checkInSizes.light ? "light" : count >= 10 && lastAt !== void 0 ? "deep" : "standard";
	return {
		subject,
		due: samples.standard.length > 0 && (lastAt === void 0 || now - lastAt >= DIAGNOSIS_INTERVAL),
		...lastAt !== void 0 ? {
			lastAt,
			nextAt: lastAt + DIAGNOSIS_INTERVAL
		} : {},
		untouched: untouched.length,
		stalled: stalled.length,
		recheck: recheck.length,
		coverage: {
			probed: pool.length - untouched.length,
			total: pool.length
		},
		recommendedIntensity,
		sample: samples.standard,
		samples,
		scope
	};
}
/**
* Compact projection of the insight for the workbench and the status tool.
* @param insight - full insight for the current state.
* @returns up to three weak points, per-subject check-in status with the sampled objective IDs, the error-cause
*   profile, the understanding reminders and the current recommendation.
*/
function insightSummary(insight) {
	return {
		weakPoints: insight.weakPoints.slice(0, 3).map((item) => ({
			id: item.id,
			subject: item.subject,
			title: item.title,
			level: item.level,
			priority: item.priority,
			reasons: item.reasons
		})),
		diagnostics: insight.diagnostics.map((plan) => ({
			subject: plan.subject,
			due: plan.due,
			...plan.lastAt !== void 0 ? { lastAt: plan.lastAt } : {},
			...plan.nextAt !== void 0 ? { nextAt: plan.nextAt } : {},
			sample: plan.sample.map((item) => item.id)
		})),
		recommendation: insight.recommendation,
		dueToday: insight.dueToday,
		dueBacklog: insight.dueBacklog,
		errorProfile: insight.errorProfile,
		understandingReminders: insight.understandingReminders
	};
}
//#endregion
//#region lib/types/learning/view.js
/**
* Resolve a learning objective, custom or shipped, across any shipped scope.
* @param state - current durable learning state.
* @param objectiveId - objective to resolve.
* @returns the objective, or undefined when unknown in any shipped map.
*/
function objectiveOf(state, objectiveId) {
	return state.objectives.find((item) => item.id === objectiveId) ?? builtinObjectiveAnywhere(objectiveId);
}
/**
* Title and subject of a learning objective, custom or shipped, for projections.
* @param state - current durable learning state.
* @param objectiveId - objective to resolve.
* @returns title and subject, or undefined when the objective is unknown in this profile.
*/
function objectiveInfo(state, objectiveId) {
	const objective = objectiveOf(state, objectiveId);
	return objective ? {
		title: objective.title,
		subject: objective.subject
	} : void 0;
}
/** Published question goals are frozen; legacy items can use only their saved sheet goal. */
function itemObjectiveId(_state, worksheet, item) {
	return item.objectiveId ?? worksheet.objectiveId;
}
/** A printed sheet still waiting for at least one graded question. Discarded sheets never wait. */
function sheetOpen(state, worksheet) {
	return worksheet.discardedAt === void 0 && worksheet.items.some((item) => !state.paperResults.some((result) => result.worksheetId === worksheet.id && result.itemId === item.id));
}
/** Combine workspace-saved exercises and shipped exercises for one objective, workspace first. */
function exercisesFor(state, objectiveId) {
	const saved = (state.exercises ?? []).filter((item) => item.objectiveId === objectiveId).map(({ savedAt: _savedAt, ...item }) => item);
	const shipped = exercisesForObjective(objectiveId);
	const seen = new Set(saved.map((item) => item.id));
	return [...saved, ...shipped.filter((item) => !seen.has(item.id))];
}
/** The first hint rung names a condition, character feature or drawing, by the objective's learning method. */
const methodCues = {
	recognize: "先让孩子看偏旁部首想意思，再放进词语或句子里辨析字音字形",
	"read-evidence": "先让孩子带着问题默读或朗读，在文中圈画和问题相关的原句",
	express: "先让孩子按“是谁—什么样—怎么做”口头说顺，再动笔写或借助关键词按顺序复述",
	represent: "先让孩子圈出已知条件和问题，再用小棒、计数器、线段图或点子图画出来建模",
	reason: "先让孩子说出已知什么、要求什么，再用自己的话讲出“先算什么、再算什么、为什么”",
	verify: "先让孩子用加减逆运算、估算比对或换一种算法再查一遍",
	context: "先让孩子看图或进入情境猜意思，说说人物在做什么",
	listen: "先让孩子听读结合字母读音规律（Phonics）留意关键词",
	speak: "先让孩子用句型词块（Chunks）替换关键词，分角色一问一答说出来"
};
/** Build the three-rung hint ladder from the objective's method, registered misconceptions and question points. */
function ladderFor(method, misconceptions, questionPoints) {
	return [
		methodCues[method],
		misconceptions[0] !== void 0 ? `让孩子自己核对一个常见错处：${misconceptions[0]}` : "让孩子说说这道题要用哪个方法",
		questionPoints.length > 0 ? `给出步骤提示：${questionPoints.slice(0, 2).join("；")}` : "和孩子一起把这道题的步骤说完整"
	];
}
/**
* Elements for one objective: its concepts' misconceptions and examples plus the objective's own error
* causes, question points, variation axes and structured exercises. Shipped objectives read the same-term
* knowledge map; custom objectives read the workspace's confirmed concepts and the objective record.
* @param state - current durable learning state.
* @param objectiveId - objective to describe.
* @returns the merged elements, or undefined for an unknown objective.
*/
function objectiveElements(state, objectiveId) {
	const builtin = builtinObjective(state.profile, objectiveId);
	if (builtin) {
		const concepts = curriculumFor(state.profile, builtin.subject)?.concepts.filter((concept) => builtin.conceptIds.includes(concept.id)) ?? [];
		const misconceptions = [...new Set(concepts.flatMap((concept) => concept.misconceptions ?? []))].slice(0, 6);
		const questionPoints = [...builtin.questionPoints ?? []];
		return {
			facts: [...new Set(concepts.flatMap((concept) => concept.facts ?? []))].slice(0, 24),
			misconceptions,
			examples: [...new Set(concepts.flatMap((concept) => concept.examples ?? []))].slice(0, 6),
			errorTypes: [...builtin.errorTypes ?? []],
			questionPoints,
			variationAxes: [...builtin.variationAxes ?? []],
			hintLadder: ladderFor(builtin.method, misconceptions, questionPoints),
			exercises: exercisesFor(state, objectiveId)
		};
	}
	const custom = state.objectives.find((item) => item.id === objectiveId);
	if (!custom) return void 0;
	const concepts = state.concepts.filter((concept) => custom.conceptIds.includes(concept.id));
	const misconceptions = [...new Set(concepts.flatMap((concept) => concept.misconceptions ?? []))].slice(0, 6);
	const questionPoints = [...custom.questionPoints ?? []];
	return {
		facts: [...new Set(concepts.flatMap((concept) => concept.facts ?? []))].slice(0, 24),
		misconceptions,
		examples: [...new Set(concepts.map((concept) => concept.example))].slice(0, 6),
		errorTypes: [...custom.errorTypes ?? []],
		questionPoints,
		variationAxes: [...custom.variationAxes ?? []],
		hintLadder: ladderFor(custom.method, misconceptions, questionPoints),
		exercises: exercisesFor(state, objectiveId)
	};
}
/** Pick the best matching reference exercise for a target variant and optional error cause. */
function pickReferenceExercise(items, variant, errorType) {
	if (items.length === 0) return void 0;
	return items.find((item) => item.variant === variant && errorType !== void 0 && item.errorType === errorType) ?? items.find((item) => item.variant === variant) ?? items.find((item) => errorType !== void 0 && item.errorType === errorType) ?? items[0];
}
/** Ladder level for one review question: numeric retests first, then context, then reasoning. */
function variantLevelFor(stage, recurringCause = false) {
	const level = stage >= 3 ? "reasoning" : stage >= 2 ? "context" : "numeric";
	return recurringCause && level === "numeric" ? "context" : level;
}
/** Whether the mistake's goal carries a recurring error cause: two or more active mistakes sharing it. */
function recurringCauseOn(state, mistake) {
	if (mistake.objectiveId === void 0 || mistake.errorType === void 0) return false;
	return state.mistakes.filter((other) => other.confirmedAt !== void 0 && other.objectiveId === mistake.objectiveId && other.stage < 4 && other.errorType === mistake.errorType).length >= 2;
}
/**
* Mistakes for the next printed review sheet of one subject: confirmed, goal-linked mistakes due today or
* tomorrow, lowest review stage first, at most two per error cause, one question each, none already printed on
* a sheet that is still ungraded, and none behind the parent-confirmed class frontier. Two of the sheet's slots
* stay for weak goals without a due mistake, returned as objective fills. Due mistakes without a goal are
* listed so they can be classified first.
* @param state - current durable learning state.
* @param subject - subject of the sheet.
* @param now - host time.
* @param size - most questions on one sheet.
* @param insight - precomputed insight for the same state and time, when the caller already has it.
* @returns picks, objective fills, error-cause coverage, and the open-sheet and unlinked summaries.
*/
function reviewPlan(state, subject, now, size = 8, insight) {
	const horizon = dayStart(studyDay(now + DAY)) + DAY;
	const open = state.worksheets.filter((sheet) => sheet.subject === subject && sheetOpen(state, sheet));
	const printed = new Set(open.flatMap((sheet) => sheet.items.flatMap((item) => item.mistakeId ? [item.mistakeId] : [])));
	const due = state.mistakes.filter((item) => item.subject === subject && item.confirmedAt !== void 0 && item.dueAt !== void 0 && item.dueAt < horizon);
	const current = insight ?? studyInsight(state, now);
	const unitOf = (objectiveId) => current.objectives.find((item) => item.id === objectiveId)?.unit ?? "";
	const candidates = due.filter((item) => item.objectiveId !== void 0 && taughtUnit(state, item.subject, unitOf(item.objectiveId)) && !printed.has(item.id)).sort((a, b) => a.stage - b.stage || (a.dueAt ?? 0) - (b.dueAt ?? 0));
	const picks = [];
	const perCause = /* @__PURE__ */ new Map();
	for (const item of candidates) {
		if (picks.length >= Math.max(1, size - 2)) break;
		if (item.errorType !== void 0 && (perCause.get(item.errorType) ?? 0) >= 2) continue;
		if (item.errorType !== void 0) perCause.set(item.errorType, (perCause.get(item.errorType) ?? 0) + 1);
		const elements = item.objectiveId !== void 0 ? objectiveElements(state, item.objectiveId) : void 0;
		const variantLevel = variantLevelFor(item.stage, recurringCauseOn(state, item));
		const referenceExercise = elements ? pickReferenceExercise(elements.exercises, variantLevel, item.errorType) : void 0;
		picks.push({
			kind: "mistake",
			id: item.id,
			objectiveId: item.objectiveId ?? "",
			objectiveTitle: objectiveInfo(state, item.objectiveId ?? "")?.title ?? "",
			topic: item.topic,
			prompt: item.prompt,
			learnerAnswer: item.learnerAnswer,
			correction: item.correction,
			explanation: item.explanation,
			stage: item.stage,
			dueToday: (item.dueAt ?? 0) <= now,
			variantLevel,
			...item.errorType !== void 0 ? { errorType: item.errorType } : {},
			...elements !== void 0 ? { elements } : {},
			...referenceExercise !== void 0 ? { referenceExercise } : {}
		});
	}
	const covered = /* @__PURE__ */ new Set([...picks.map((item) => item.objectiveId), ...open.flatMap((sheet) => sheet.items.map((item) => itemObjectiveId(state, sheet, item))).filter((value) => value !== void 0)]);
	const objectiveFills = current.weakPoints.filter((item) => taughtUnit(state, item.subject, item.unit) && !covered.has(item.id)).slice(0, Math.min(2, Math.max(0, size - picks.length))).map((item) => {
		const elements = objectiveElements(state, item.id);
		const referenceExercise = elements ? pickReferenceExercise(elements.exercises, "numeric") : void 0;
		return {
			kind: "objective",
			id: item.id,
			objectiveId: item.id,
			title: item.title,
			level: item.level,
			variantLevel: "numeric",
			...elements !== void 0 ? { elements } : {},
			...referenceExercise !== void 0 ? { referenceExercise } : {}
		};
	});
	const coverage = /* @__PURE__ */ new Map();
	for (const pick of picks) if (pick.errorType !== void 0) coverage.set(pick.errorType, (coverage.get(pick.errorType) ?? 0) + 1);
	return {
		subject,
		picks,
		objectiveFills,
		errorCoverage: [...coverage.entries()].map(([type, count]) => ({
			type,
			count
		})).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
		remaining: candidates.length - picks.length,
		unlinkedDue: due.filter((item) => item.objectiveId === void 0).map((item) => item.id),
		openSheets: open.map((sheet) => ({
			id: sheet.id,
			createdAt: sheet.createdAt,
			items: sheet.items.length,
			graded: state.paperResults.filter((result) => result.worksheetId === sheet.id).length
		}))
	};
}
/**
* Project one subject's shipped knowledge map with mastery overlaid.
* @param state - current durable learning state, providing grade and term.
* @param subject - subject to project.
* @param insight - insight computed for the same state and time.
* @param scope - grade and term to browse; defaults to the profile, the only scope that carries mastery.
* @returns the map view, or null outside grades one and two.
*/
function curriculumView(state, subject, insight, scope) {
	const target = scope ?? {
		grade: state.profile.grade,
		term: state.profile.term
	};
	const file = curriculumFor(target, subject);
	if (!file) return null;
	const current = target.grade === state.profile.grade && target.term === state.profile.term;
	const objectives = current ? insight.objectives.filter((item) => item.subject === subject && file.objectives.some((objective) => objective.id === item.id)) : file.objectives.map((objective) => {
		const unit = file.concepts.find((concept) => concept.id === objective.conceptIds[0])?.unit ?? "";
		return {
			...objective,
			subject,
			unit,
			unitName: file.units.find((item) => item.id === unit)?.name ?? "",
			level: "untouched",
			independentDays: 0,
			attempts: 0,
			helpedOrWrong: 0,
			activeMistakes: 0,
			dueMistakes: 0,
			masteredMistakes: 0,
			errorTypes: [],
			priority: 0,
			reasons: [{
				code: "not-started",
				count: 0
			}]
		};
	});
	const levelOf = (levels) => {
		if (levels.length === 0 || levels.every((level) => level === "untouched")) return "untouched";
		if (levels.every((level) => level === "mastered")) return "mastered";
		if (levels.includes("due")) return "due";
		if (levels.includes("weak")) return "weak";
		if (levels.includes("stalled")) return "stalled";
		return "practising";
	};
	const concepts = file.concepts.map((concept) => {
		const linked = objectives.filter((objective) => objective.conceptIds.includes(concept.id));
		const lastAt = linked.reduce((latest, item) => item.lastAt !== void 0 && (latest === void 0 || item.lastAt > latest) ? item.lastAt : latest, void 0);
		return {
			id: concept.id,
			name: concept.name,
			unit: concept.unit,
			definition: concept.definition,
			example: concept.example,
			source: concept.source,
			...concept.ideaIds !== void 0 ? { ideaIds: concept.ideaIds } : {},
			...concept.facts !== void 0 ? { facts: concept.facts } : {},
			level: levelOf(linked.map((item) => item.level)),
			objectiveIds: linked.map((item) => item.id),
			...lastAt !== void 0 ? { lastAt } : {},
			independentDays: Math.max(0, ...linked.map((item) => item.independentDays)),
			attempts: linked.reduce((sum, item) => sum + item.attempts, 0),
			activeMistakes: linked.reduce((sum, item) => sum + item.activeMistakes, 0),
			dueMistakes: linked.reduce((sum, item) => sum + item.dueMistakes, 0)
		};
	});
	const units = file.units.map((unit) => {
		const own = concepts.filter((concept) => concept.unit === unit.id);
		return {
			id: unit.id,
			name: unit.name,
			summary: unit.summary,
			...unit.focus !== void 0 ? { focus: unit.focus } : {},
			concepts: own.length,
			mastered: own.filter((item) => item.level === "mastered").length,
			learning: own.filter((item) => item.level === "practising" || item.level === "stalled").length,
			weak: own.filter((item) => item.level === "weak").length,
			due: own.filter((item) => item.level === "due").length,
			untouched: own.filter((item) => item.level === "untouched").length
		};
	});
	const summary = {
		concepts: concepts.length,
		objectives: objectives.length,
		mastered: concepts.filter((item) => item.level === "mastered").length,
		practising: concepts.filter((item) => item.level === "practising").length,
		weak: concepts.filter((item) => item.level === "weak").length,
		due: concepts.filter((item) => item.level === "due").length,
		stalled: concepts.filter((item) => item.level === "stalled").length,
		untouched: concepts.filter((item) => item.level === "untouched").length
	};
	const prerequisites = file.relations.filter((relation) => relation.kind === "prerequisite");
	const remaining = file.concepts.map((concept) => concept.id);
	const order = [];
	while (remaining.length > 0) {
		const ready = remaining.find((id) => !prerequisites.some((relation) => relation.toId === id && remaining.includes(relation.fromId))) ?? remaining[0];
		if (ready === void 0) break;
		order.push(ready);
		remaining.splice(remaining.indexOf(ready), 1);
	}
	return {
		id: file.id,
		title: file.title,
		basis: file.basis,
		units,
		ideas: subjectIdeas(file.subject),
		concepts,
		objectives,
		summary,
		scope: {
			grade: target.grade,
			term: target.term,
			current
		},
		order,
		lite: false,
		relations: file.relations.map((relation) => ({
			id: relation.id,
			fromId: relation.fromId,
			toId: relation.toId,
			kind: relation.kind,
			explanation: relation.explanation
		}))
	};
}
/**
* Recent check-in blocks per subject, newest first, with per-answer results and counts.
* @param state - current durable learning state.
* @param limitPerSubject - how many recent blocks to keep for each subject.
* @returns check-in records across the three subjects.
*/
function checkInHistory(state, limitPerSubject = 5) {
	return SUBJECT_ORDER.flatMap((subject) => state.sessions.filter((item) => item.mode === "diagnose" && item.subject === subject).slice(-limitPerSubject).reverse().map((session) => {
		const results = state.attempts.filter((item) => item.sessionId === session.id).map((item) => ({
			id: item.id,
			objectiveId: item.objectiveId ?? null,
			result: item.result,
			assistance: item.assistance,
			title: item.objectiveId ? objectiveInfo(state, item.objectiveId)?.title ?? item.topic : item.topic
		}));
		return {
			subject,
			sessionId: session.id,
			startedAt: session.startedAt,
			endedAt: session.endedAt ?? null,
			intensity: session.intensity ?? "standard",
			results,
			counts: {
				independent: results.filter((item) => item.result === "correct" && item.assistance === "independent").length,
				helped: results.filter((item) => item.result === "correct" && item.assistance !== "independent").length,
				wrong: results.filter((item) => item.result === "incorrect" || item.result === "partial").length,
				unassessed: results.filter((item) => item.result === "unassessed").length
			}
		};
	}));
}
//#endregion
//#region lib/types/learning/update/context.js
function alignRecord(task, attempt) {
	if (task.response === void 0) throw new Error(`请先用 answer 保存原始回答，再记录反馈。当前题目 id：${task.id}。`);
	const problems = [];
	if (attempt.id !== task.id) problems.push(`id 不一致。期望：${showValue(task.id)}。收到：${showValue(attempt.id)}。`);
	if (foldText(attempt.topic) !== foldText(task.topic)) problems.push(`topic 不一致。期望：${showValue(task.topic)}。收到：${showValue(attempt.topic)}。`);
	if (foldText(attempt.prompt) !== foldText(task.prompt)) problems.push(`prompt 不一致。期望：${showValue(task.prompt)}。收到：${showValue(attempt.prompt)}。`);
	if (!sameSavedAnswer(task, attempt.response)) {
		const expected = task.rawResponse !== void 0 && task.rawResponse !== task.response ? `${showValue(task.response)}（原始输入：${showValue(task.rawResponse)}）` : showValue(task.response);
		problems.push(`response 不一致。期望：${expected}。收到：${showValue(attempt.response)}。`);
	}
	for (const field of [
		"mistakeId",
		"objectiveId",
		"variant"
	]) if (attempt[field] !== void 0 && attempt[field] !== task[field]) problems.push(`${field} 不一致。期望：${showValue(task[field])}。收到：${showValue(attempt[field])}。`);
	if (attempt.figure !== void 0 && canonical(attempt.figure) !== canonical(task.figure ?? null)) problems.push(`figure 不一致。期望：${showValue(task.figure ?? null)}。收到：${showValue(attempt.figure)}。`);
	if (problems.length > 0) throw new Error(`反馈必须对应当前题目和已保存的原始回答。${problems.join("")}`);
	return {
		...attempt,
		id: task.id,
		topic: task.topic,
		prompt: task.prompt,
		response: task.response,
		...task.mistakeId !== void 0 ? { mistakeId: task.mistakeId } : {},
		...task.objectiveId !== void 0 ? { objectiveId: task.objectiveId } : {},
		...task.variant !== void 0 ? { variant: task.variant } : {},
		...task.figure !== void 0 ? { figure: task.figure } : {}
	};
}
/** Omitted assistance follows the current step: a demo is a worked example, a hint or a guide step is help, and everything else is independent. */
function resolveAssistance(task, assistance) {
	if (assistance !== void 0) return assistance;
	if (task?.phase === "demo") return "worked-example";
	if ((task?.hintLevel ?? 0) > 0 || task?.phase === "guide") return "hint";
	return "independent";
}
/** An independent correct answer finishes teaching for that objective. */
function dropTaught(state, objectiveId) {
	if (objectiveId === void 0) return;
	state.teachingQueue = state.teachingQueue.filter((item) => item.objectiveId !== objectiveId);
}
/**
* Save one graded question. A changed grade replaces the earlier one and keeps its original day.
* A wrong or partial answer to a new question becomes a confirmed mistake on that question's goal;
* regrading it correct removes that mistake again unless other answers already cite it.
* @returns whether anything changed.
*/
function gradeItem(state, worksheet, item, entry, errorType) {
	const linked = item.mistakeId ? state.mistakes.find((mistake) => mistake.id === item.mistakeId) : void 0;
	const wrong = entry.result === "incorrect" || entry.result === "partial";
	const causeChanged = linked && wrong && errorType !== void 0 && linked.errorType !== errorType;
	const index = state.paperResults.findIndex((result) => result.worksheetId === worksheet.id && result.itemId === item.id);
	const previous = state.paperResults[index];
	if (previous) {
		const { receivedAt: _before, ...stored } = previous;
		const { receivedAt: _now, ...next } = entry;
		if (canonical(stored) === canonical(next) && !causeChanged) return false;
		state.paperResults.splice(index, 1);
	}
	state.paperResults.push(previous ? {
		...entry,
		receivedAt: previous.receivedAt
	} : entry);
	const fromHere = linked?.source !== void 0 && linked.source.worksheetId === worksheet.id && linked.source.itemId === item.id;
	if (linked && wrong && errorType !== void 0) linked.errorType = errorType;
	if (linked && fromHere) {
		if (wrong) {
			linked.learnerAnswer = entry.response;
			linked.answerEvidence = entry.answerEvidence;
			return true;
		}
		if (!(state.attempts.some((attempt) => attempt.mistakeId === linked.id) || state.worksheets.some((sheet) => sheet.items.some((question) => question !== item && question.mistakeId === linked.id)))) {
			state.mistakes = state.mistakes.filter((mistake) => mistake !== linked);
			delete item.mistakeId;
		}
		return true;
	}
	if (!linked && wrong) {
		const objectiveId = itemObjectiveId(state, worksheet, item);
		const id = practiceMistakeId(state, worksheet.id, item.id);
		state.mistakes.push({
			id,
			subject: worksheet.subject,
			topic: item.prompt.slice(0, 60),
			prompt: item.prompt,
			learnerAnswer: entry.response,
			correction: item.answer,
			explanation: item.explanation,
			answerEvidence: entry.answerEvidence,
			uncertainties: "",
			...objectiveId ? { objectiveId } : {},
			...errorType ? { errorType } : {},
			confirmedAt: entry.receivedAt,
			userConfirmation: entry.userConfirmation,
			source: {
				worksheetId: worksheet.id,
				itemId: item.id
			},
			stage: 0,
			independentDays: []
		});
		item.mistakeId = id;
	}
	if (entry.result === "correct" && entry.assistance === "independent") dropTaught(state, itemObjectiveId(state, worksheet, item));
	return true;
}
function practiceMistakeId(state, worksheetId, itemId) {
	const base = `w-${worksheetId}-${itemId}`.slice(0, 80);
	if (!state.mistakes.some((item) => item.id === base)) return base;
	const extra = `-${state.mistakes.length}`;
	return `${base.slice(0, 80 - extra.length)}${extra}`;
}
/** Reject conflicting reuse of an existing record ID; an identical retry reports a no-op. */
function duplicate(items, matches, equal) {
	const existing = items.find(matches);
	if (existing === void 0) return false;
	requireValue(equal(existing), "该记录 ID 已用于另一条内容。完全相同的重试会直接成功；新的一条请换一个 ID。");
	return true;
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
//#region lib/types/learning/update/profile.js
/** Create the first learner profile for a workspace. */
function applySetup(command, now) {
	return stateSchema.parse({
		format: 1,
		revision: 1,
		updatedAt: now,
		profile: command.profile,
		interests: {
			tags: [...DEFAULT_INTEREST_TAGS],
			parentConfirmation: command.profile.parentConfirmation
		},
		materials: [],
		courses: [],
		sessions: [],
		attempts: [],
		mistakes: [],
		rewards: []
	});
}
/** Update the existing learner profile in place, preserving all learning evidence. */
function applyUpdateProfile(ctx) {
	const { command, previous, state } = ctx;
	if (canonical(state.profile) === canonical(command.profile)) return previous;
	state.profile = command.profile;
	return state;
}
/** Save a material, its course and optional confirmed school frontier under one revision. */
function applyConfigureCourse(ctx) {
	const { command, previous, now } = ctx;
	requireValue(command.material.id === command.course.materialId && command.material.subject === command.course.subject, "教材与学校进度必须引用同一份资料和科目。");
	const withCourse = rawApply(rawApply(previous, {
		action: "material",
		material: command.material
	}, now), {
		action: "course",
		course: command.course
	}, now);
	const withProgress = command.progress ? rawApply(withCourse, {
		action: "school-progress",
		subject: command.course.subject,
		...command.progress
	}, now) : withCourse;
	return stateSchema.parse({
		...withProgress,
		revision: previous.revision + 1
	});
}
/** Register one course material; an identical retry is a no-op. */
function applyMaterial(ctx) {
	const { command, previous, state } = ctx;
	if (duplicate(state.materials, (item) => item.id === command.material.id, (item) => canonical(item) === canonical(command.material))) return previous;
	state.materials.push(command.material);
	return state;
}
/** Confirm a material as the subject course, keeping confirmed school progress. */
function applyCourse(ctx) {
	const { command, state } = ctx;
	const material = state.materials.find((item) => item.id === command.course.materialId);
	requireValue(material && material.subject === command.course.subject && sameScope(state.profile, material.scope), "教材的科目、地区、年级、学期、学年和学制必须与档案一致。");
	requireValue(material.kind === "official-textbook" || material.kind === "school-material", "参考资料和 AI 自编练习不能标为校内同步教材。");
	requireValue(material.editionStatus === "identified", "该资料的版次尚未核实，请先核对实物或官方信息并登记已识别的版本。");
	const progress = state.courses.find((course) => course.subject === command.course.subject)?.progress;
	state.courses = state.courses.filter((course) => course.subject !== command.course.subject);
	state.courses.push(progress ? {
		...command.course,
		progress
	} : command.course);
	return state;
}
/** Record the parent-confirmed school frontier unit. */
function applySchoolProgress(ctx) {
	const { command, state, now } = ctx;
	const course = state.courses.find((item) => item.subject === command.subject);
	requireValue(course, "先确认该科教材，再标学校教到哪一单元。");
	requireValue(curriculumFor(state.profile, command.subject)?.units.some((unit) => unit.id === command.unitId), "这个单元不在当前年级学期的知识地图里。");
	course.progress = {
		unitId: command.unitId,
		confirmedAt: now,
		posture: command.posture,
		preview: command.preview === "on",
		pace: command.pace
	};
	return state;
}
/**
* Save or clear the parent OpenMAIC origin.
* An empty base removes the override. An active learning block does not block this; the address is not learning evidence.
*/
function applyOpenmaicSettings(ctx) {
	const { command, previous, state } = ctx;
	const normalized = normalizeOpenmaicBase(command.baseUrl);
	requireValue(normalized !== void 0, "OpenMAIC 地址需要是 http 或 https 原点，例如 http://localhost:3000。不要在地址里写账号或密码。");
	if ((state.openmaic?.baseUrl ?? "") === normalized) return previous;
	if (normalized === "") delete state.openmaic;
	else state.openmaic = {
		baseUrl: normalized,
		parentConfirmation: command.parentConfirmation
	};
	return state;
}
/**
* Save the parent's theme tags. Duplicates collapse; fewer than three distinct tags is rejected.
*/
function applyInterests(ctx) {
	const { command, previous, state } = ctx;
	const tags = [...new Set(command.tags)];
	requireValue(tags.length >= 3 && tags.length <= 8, "兴趣标签需要 3 到 8 个，去掉重复后仍要落在这个范围。");
	const current = state.interests?.tags ?? [];
	if (current.length === tags.length && current.every((tag, index) => tag === tags[index])) return previous;
	state.interests = {
		tags,
		parentConfirmation: command.parentConfirmation
	};
	return state;
}
/** Archive the finished term: keep the profile for reference, drop all evidence (exported beforehand by the store) and mark the file archived. */
function applyArchiveTerm(ctx) {
	const { command, state, active, now } = ctx;
	requireValue(!active, "先结束当前学习，再归档学期。");
	requireValue(command.parentConfirmation.trim().length > 0, "归档学期需要家长的确认。");
	return stateSchema.parse({
		format: 1,
		revision: 1,
		updatedAt: now,
		archivedAt: now,
		profile: state.profile,
		materials: [],
		courses: [],
		sessions: [],
		attempts: [],
		mistakes: [],
		rewards: []
	});
}
//#endregion
//#region lib/types/learning/update/session.js
/** Open the next question inside the active block; an unanswered question can be replaced when skipping or switching tasks. */
function applyTask(ctx) {
	const { command, previous, state, active } = ctx;
	requireValue(active && active.id === command.task.sessionId && active.subject === command.task.subject, "请在当前学习段内出题。");
	validateTaskScope(state, active, command.task.objectiveId);
	if (state.task?.id === command.task.id && state.task.sessionId === command.task.sessionId) {
		const { response: _response, rawResponse: _raw, answeredAt: _answeredAt, hintLevel: _hint, stuck: _stuck, ...stored } = state.task;
		requireValue(canonical(stored) === canonical(command.task), "这个学习段里的题目编号已用于另一道题。");
		return previous;
	}
	requireValue(!state.attempts.some((item) => item.id === command.task.id && item.sessionId === command.task.sessionId), "这个学习段里的题目编号已使用。下一段学习可以再用同一个编号。");
	requireValue(!state.task || state.task.sessionId !== active.id || state.task.response === void 0 || state.attempts.some((item) => item.id === state.task?.id && item.sessionId === state.task.sessionId), "请先完成当前已作答题目的反馈。");
	const mistake = state.mistakes.find((item) => item.id === command.task.mistakeId);
	requireValue(active.mode !== "review" || mistake, "复习题需要关联一条已确认的错题。");
	requireValue(active.mode !== "diagnose" || command.task.objectiveId !== void 0, "摸底题必须关联学习目标（objectiveId）。");
	requireValue(active.mode !== "diagnose" || command.task.phase === void 0, "摸底题不进入教学步骤。");
	if (command.task.mistakeId) requireValue(mistake && mistake.subject === active.subject && mistake.confirmedAt !== void 0 && mistake.uncertainties === "", "请先确认这道错题，再开始复习。");
	if (command.task.objectiveId) requireValue(objectiveOf(state, command.task.objectiveId)?.subject === active.subject, "学习目标不存在或科目不符。");
	if (mistake?.objectiveId) requireValue(command.task.objectiveId === mistake.objectiveId, "复习题必须对应错题的学习目标。");
	state.task = {
		...command.task,
		hintLevel: 0
	};
	return state;
}
/** Save the raw answer or raise the hint level of the current task. */
function applyAnswerOrHint(ctx) {
	const { command, previous, state, active, now } = ctx;
	const task = state.task;
	requireValue(task && task.id === command.taskId && active?.id === task.sessionId, "当前题目已结束，请刷新学习状态。");
	validateTaskScope(state, active, task.objectiveId);
	requireValue(!state.attempts.some((item) => item.id === task.id && item.sessionId === task.sessionId), "这道题已记录反馈。");
	if (command.action === "answer") {
		if (task.response !== void 0) {
			requireValue(sameSavedAnswer(task, command.response), "答案已提交，请等待反馈。");
			return previous;
		}
		const matched = task.choices ? matchChoice(task.choices, command.response) : command.response;
		if (task.choices) requireValue(matched, choiceMismatch(task.choices, command.response));
		task.response = matched ?? command.response;
		task.rawResponse = command.response;
		task.answeredAt = now;
	} else {
		if (task.hintLevel >= 3) return previous;
		requireValue(task.response === void 0, "答案已提交，请等待反馈。");
		task.hintLevel += 1;
	}
	return state;
}
function validateTaskScope(state, active, objectiveId) {
	if (!active.scope) return;
	requireValue(objectiveId, "范围内的题目必须关联学习目标。");
	const objective = objectiveOf(state, objectiveId);
	requireValue(objective?.subject === active.subject, "学习目标不存在或科目不符。");
	const unit = "unit" in objective && typeof objective.unit === "string" ? objective.unit : "";
	requireValue(scopeSelects(active.scope, active.subject, unit, objectiveId), "题目目标不在本段学习范围内。");
}
/** Record 不会 on the current task as a stuck attempt. */
function applyStuck(ctx) {
	const { command, previous, state, active, now } = ctx;
	const task = state.task;
	requireValue(task && task.id === command.taskId && active && active.id === task.sessionId, "当前题目已结束，请刷新学习状态。");
	if (state.attempts.some((item) => item.id === task.id && item.sessionId === task.sessionId)) return previous;
	task.stuck = true;
	const materialId = active.materialId;
	state.attempts.push({
		id: task.id,
		sessionId: task.sessionId,
		subject: task.subject,
		topic: task.topic,
		prompt: task.prompt,
		response: "不会",
		result: "stuck",
		assistance: "hint",
		feedback: "孩子表示不会，先教方法再独立做。",
		answerEvidence: "未作答，记为不会。",
		...task.mistakeId !== void 0 ? { mistakeId: task.mistakeId } : {},
		...task.objectiveId !== void 0 ? { objectiveId: task.objectiveId } : {},
		...task.variant !== void 0 ? { variant: task.variant } : {},
		...task.figure !== void 0 ? { figure: task.figure } : {},
		at: now,
		...materialId ? { materialId } : {}
	});
	return state;
}
/** Start one learning block, automatically closing any earlier open block and archiving a reused session id. */
function applyStart(ctx) {
	const { command, previous, state, active, now } = ctx;
	const existing = state.sessions.find((item) => item.id === command.id);
	if (existing && existing.endedAt === void 0) {
		requireValue(existing.subject === command.subject && existing.mode === command.mode, "这个学习段编号正在使用，请换一个新编号。");
		return previous;
	}
	requireValue(command.scope === void 0 || command.mode === "diagnose" || command.mode === "foundation" || command.mode === "school", "自定义范围只用于摸底或学习。");
	if (command.scope) {
		const file = curriculumFor({
			grade: command.scope.grade,
			term: command.scope.term
		}, command.subject);
		requireValue(file, "该年级学期的知识地图不存在。");
		if (command.scope.units) for (const unitId of command.scope.units) requireValue(file.units.some((unit) => unit.id === unitId), `单元不在该年级学期的知识地图里：${unitId}`);
		if (command.scope.objectiveIds) for (const objectiveId of command.scope.objectiveIds) requireValue(builtinObjectiveIn({
			grade: command.scope.grade,
			term: command.scope.term
		}, command.subject, objectiveId) || state.objectives.some((item) => item.id === objectiveId), `学习目标不存在：${objectiveId}`);
	}
	const course = state.courses.find((item) => item.subject === command.subject);
	requireValue(command.mode !== "school" || course, "该科教材与学校进度尚未确认；可先选择 foundation 通用基础练习。");
	if (active) {
		active.endedAt = now;
		active.spentMs = spent(active, now);
		const day = studyDay(active.startedAt);
		if (state.attempts.some((item) => item.sessionId === active.id) && !state.rewards.some((reward) => reward.day === day && reward.reason === "participation")) state.rewards.push({
			day,
			reason: "participation"
		});
	}
	if (existing) {
		const archived = `${existing.id}-past-${state.sessions.filter((item) => item.id.startsWith(`${existing.id}-past-`)).length}`;
		requireValue(archived.length <= 80, "这个学习段编号已经用过，请换一个更短的新编号。");
		for (const attempt of state.attempts) if (attempt.sessionId === existing.id) attempt.sessionId = archived;
		if (state.task?.sessionId === existing.id) state.task.sessionId = archived;
		existing.id = archived;
	}
	const id = command.id;
	state.sessions.push({
		id,
		subject: command.subject,
		mode: command.mode,
		startedAt: now,
		...command.mode === "diagnose" ? { intensity: command.intensity ?? "standard" } : {},
		...command.mode === "school" && course ? {
			materialId: course.materialId,
			unit: course.unit
		} : {},
		...command.scope !== void 0 ? { scope: command.scope } : {}
	});
	return state;
}
/** Record one assessed attempt against the saved task or sheet. */
function applyRecord(ctx) {
	const { command, previous, state, active, now } = ctx;
	const attempt = command.attempt;
	const openTask = state.task?.sessionId === attempt.sessionId && state.task.id === attempt.id ? state.task : void 0;
	const aligned = openTask ? alignRecord(openTask, attempt) : attempt;
	const assistance = resolveAssistance(openTask, aligned.assistance);
	const recorded = {
		...aligned,
		assistance
	};
	const existing = state.attempts.find((item) => item.id === recorded.id && item.sessionId === recorded.sessionId);
	if (existing) {
		const { at: _at, materialId: _material, rawResponse: _raw, ...stored } = existing;
		if (canonical(stored) === canonical(recorded)) return previous;
		throw new Error("该记录 ID 已用于另一条内容。完全相同的重试会直接成功；新的一条请换一个 ID。");
	}
	requireValue(openTask, "反馈必须对应已保存的题目，请先发布题目并保存原始回答。");
	requireValue(active && active.id === attempt.sessionId && active.subject === attempt.subject, "作答必须属于当前学习段和科目。");
	if (aligned.objectiveId && active.scope) {
		const objective = objectiveOf(state, aligned.objectiveId);
		requireValue(objective?.subject === aligned.subject, "学习目标不存在或科目不符。");
		const unit = objective !== void 0 && "unit" in objective && typeof objective.unit === "string" ? objective.unit : "";
		requireValue(scopeSelects(active.scope, aligned.subject, unit, aligned.objectiveId), "作答目标不在本段学习范围内。");
	}
	if (openTask && openTask.sessionId === active.id && openTask.phase === "guide") requireValue(openTask.hintLevel >= 1, "引导步要先请求提示。");
	if (openTask && openTask.sessionId === active.id && (openTask.phase === "demo" || openTask.phase === "guide")) requireValue(recorded.assistance !== "independent", "示范或引导不能记录为独立作答。");
	if (openTask && openTask.sessionId === active.id) requireValue(openTask.hintLevel === 0 || recorded.assistance !== "independent", "学生请求过提示，不能记录为独立作答。");
	const mistake = aligned.mistakeId ? state.mistakes.find((item) => item.id === aligned.mistakeId) : void 0;
	requireValue(!aligned.mistakeId || mistake, "错题不存在，请先查询错题记录。");
	if (aligned.objectiveId) requireValue(objectiveOf(state, aligned.objectiveId)?.subject === aligned.subject, "学习目标不存在或科目不符。");
	if (mistake?.objectiveId) requireValue(aligned.objectiveId === mistake.objectiveId, "作答必须对应错题的学习目标。");
	requireValue(active.mode !== "review" || mistake, "复习模式的作答需要关联一条已确认的错题。");
	requireValue(active.mode !== "diagnose" || aligned.objectiveId !== void 0, "摸底作答必须关联学习目标（objectiveId）。");
	if (mistake) requireValue(mistake.confirmedAt !== void 0 && mistake.uncertainties === "" && mistake.subject === aligned.subject, "先确认图片转录、答案依据与科目，再进行复习。");
	const materialId = mistake?.materialId ?? active.materialId;
	state.attempts.push({
		...recorded,
		at: now,
		...materialId ? { materialId } : {},
		...openTask?.rawResponse ? { rawResponse: openTask.rawResponse } : {}
	});
	if (recorded.result === "correct" && recorded.assistance === "independent") dropTaught(state, recorded.objectiveId);
	return state;
}
/** End a block and record elapsed time and rewards. */
function applyStop(ctx) {
	const { command, previous, state, now } = ctx;
	const session = state.sessions.find((item) => item.id === command.sessionId);
	requireValue(session, "学习段不存在。");
	if (session.endedAt !== void 0) return previous;
	session.endedAt = now;
	session.spentMs = spent(session, now);
	session.reflection = command.reflection.trim();
	const day = studyDay(session.startedAt);
	const hasWork = state.attempts.some((item) => item.sessionId === session.id);
	for (const reason of ["participation", "reflection"]) if (hasWork && (reason === "participation" || session.reflection) && !state.rewards.some((reward) => reward.day === day && reward.reason === reason)) state.rewards.push({
		day,
		reason
	});
	return state;
}
//#endregion
//#region lib/types/learning/update/mistakes.js
/** Save or update an unconfirmed mistake transcription. */
function applyMistake(ctx) {
	const { command, previous, state } = ctx;
	if (command.mistake.materialId) requireValue(state.materials.some((item) => item.id === command.mistake.materialId && item.subject === command.mistake.subject), "错题资料不存在或科目不符。");
	if (command.mistake.objectiveId) requireValue(objectiveOf(state, command.mistake.objectiveId)?.subject === command.mistake.subject, "错题学习目标不存在或科目不符。");
	if (command.mistake.errorType !== void 0) requireValue(errorTypesBySubject[command.mistake.subject].includes(command.mistake.errorType), "错因分类与科目不符。");
	const existing = state.mistakes.find((item) => item.id === command.mistake.id);
	if (existing) {
		const pending = existing.confirmedAt === void 0;
		const same = Object.entries(command.mistake).every(([key, value]) => canonical(Reflect.get(existing, key)) === canonical(value));
		requireValue(pending || same, "这条错题已确认。要改正请用 confirm-mistake，新题请换一个编号。");
		if (!pending) return previous;
		Object.assign(existing, command.mistake);
		return state;
	}
	state.mistakes.push({
		...command.mistake,
		stage: 0,
		independentDays: []
	});
	return state;
}
/** Confirm the final transcription of one mistake, or create/edit a confirmed mistake directly from the panel. */
function applyConfirmMistake(ctx) {
	const { command, previous, state, now } = ctx;
	let mistake = state.mistakes.find((item) => item.id === command.id);
	if (!mistake) {
		requireValue(command.subject !== void 0, "直接添加错题需要指定科目（subject）。");
		const objectiveId = command.objectiveId === "" ? void 0 : command.objectiveId;
		if (objectiveId !== void 0) requireValue(objectiveOf(state, objectiveId)?.subject === command.subject, "错题学习目标不存在或科目不符。");
		if (command.errorType !== void 0) requireValue(errorTypesBySubject[command.subject].includes(command.errorType), "错因分类与科目不符。");
		mistake = {
			id: command.id,
			subject: command.subject,
			topic: command.topic ?? command.prompt.slice(0, 60),
			prompt: command.prompt,
			learnerAnswer: command.learnerAnswer ?? "（未记录）",
			correction: command.correction,
			explanation: command.explanation,
			answerEvidence: command.answerEvidence,
			uncertainties: "",
			...objectiveId !== void 0 ? { objectiveId } : {},
			...command.errorType !== void 0 ? { errorType: command.errorType } : {},
			confirmedAt: now,
			userConfirmation: command.userConfirmation,
			stage: 0,
			independentDays: []
		};
		state.mistakes.push(mistake);
		return state;
	}
	requireValue((command.subject ?? mistake.subject) === mistake.subject, "错题科目不能更改。");
	const nextObjectiveId = command.objectiveId === void 0 ? mistake.objectiveId : command.objectiveId === "" ? void 0 : command.objectiveId;
	if (nextObjectiveId !== void 0) requireValue(objectiveOf(state, nextObjectiveId)?.subject === mistake.subject, "错题学习目标不存在或科目不符。");
	if (command.errorType !== void 0) requireValue(errorTypesBySubject[mistake.subject].includes(command.errorType), "错因分类与科目不符。");
	const nextTopic = command.topic ?? mistake.topic;
	if (mistake.confirmedAt !== void 0 && mistake.topic === nextTopic && mistake.objectiveId === nextObjectiveId && (command.learnerAnswer === void 0 || mistake.learnerAnswer === command.learnerAnswer) && mistake.prompt === command.prompt && mistake.correction === command.correction && mistake.explanation === command.explanation && mistake.answerEvidence === command.answerEvidence && (command.errorType === void 0 || mistake.errorType === command.errorType) && mistake.userConfirmation === command.userConfirmation) return previous;
	mistake.topic = nextTopic;
	mistake.prompt = command.prompt;
	if (command.learnerAnswer !== void 0) mistake.learnerAnswer = command.learnerAnswer;
	mistake.correction = command.correction;
	mistake.explanation = command.explanation;
	mistake.answerEvidence = command.answerEvidence;
	if (nextObjectiveId === void 0) delete mistake.objectiveId;
	else mistake.objectiveId = nextObjectiveId;
	if (command.errorType !== void 0) mistake.errorType = command.errorType;
	mistake.userConfirmation = command.userConfirmation;
	mistake.uncertainties = "";
	if (mistake.confirmedAt === void 0) mistake.confirmedAt = now;
	return state;
}
/** Delete one mistake from the notebook and detach any worksheet references to it. */
function applyDeleteMistake(ctx) {
	const { command, previous, state } = ctx;
	if (!state.mistakes.some((item) => item.id === command.id)) return previous;
	state.mistakes = state.mistakes.filter((item) => item.id !== command.id);
	for (const sheet of state.worksheets) for (const item of sheet.items) if (item.mistakeId === command.id) delete item.mistakeId;
	return state;
}
/** Save or update one workspace exercise item in the local exercise bank. */
function applySaveExercise(ctx) {
	const { command, previous, state, now } = ctx;
	const item = command.exercise;
	const objective = objectiveOf(state, item.objectiveId);
	requireValue(objective && objective.subject === item.subject, "习题学习目标不存在或科目不符。");
	if (item.errorType !== void 0) requireValue(errorTypesBySubject[item.subject].includes(item.errorType), "错因分类与科目不符。");
	const existing = state.exercises.find((entry) => entry.id === item.id);
	if (existing) {
		const { savedAt: _savedAt, ...stored } = existing;
		if (canonical(stored) === canonical(item)) return previous;
		state.exercises = state.exercises.map((entry) => entry.id === item.id ? {
			...item,
			savedAt: existing.savedAt ?? now
		} : entry);
		return state;
	}
	state.exercises.push({
		...item,
		savedAt: now
	});
	return state;
}
/** Delete one workspace exercise item from the local exercise bank. */
function applyDeleteExercise(ctx) {
	const { command, previous, state } = ctx;
	if (!state.exercises.some((item) => item.id === command.id)) return previous;
	state.exercises = state.exercises.filter((item) => item.id !== command.id);
	return state;
}
/** Propose one concept for parent review. */
function applyConcept(ctx) {
	const { command, previous, state } = ctx;
	if (duplicate(state.concepts, (item) => item.id === command.concept.id, (item) => Object.entries(command.concept).every(([key, value]) => Reflect.get(item, key) === value))) return previous;
	state.concepts.push(command.concept);
	return state;
}
/** Confirm a proposed concept with the parent statement. */
function applyConfirmConcept(ctx) {
	const { command, previous, state, now } = ctx;
	const concept = state.concepts.find((item) => item.id === command.id);
	requireValue(concept, "概念不存在。");
	if (concept.confirmedAt !== void 0) {
		requireValue(concept.userConfirmation === command.userConfirmation && (command.definition === void 0 || concept.definition === command.definition) && (command.example === void 0 || concept.example === command.example) && (command.source === void 0 || concept.source === command.source), "概念已确认且确认内容不同。");
		return previous;
	}
	if (command.definition !== void 0) concept.definition = command.definition;
	if (command.example !== void 0) concept.example = command.example;
	if (command.source !== void 0) concept.source = command.source;
	concept.confirmedAt = now;
	concept.userConfirmation = command.userConfirmation;
	return state;
}
/** Create one custom learning objective over confirmed concepts. */
function applyObjective(ctx) {
	const { command, previous, state } = ctx;
	if (duplicate(state.objectives, (item) => item.id === command.objective.id, (item) => canonical(item) === canonical(command.objective))) return previous;
	requireValue(customObjectiveMethods[command.objective.subject].some((method) => method === command.objective.method), "学习方法与科目不符。");
	requireValue(command.objective.conceptIds.every((id) => state.concepts.some((item) => item.id === id && item.subject === command.objective.subject && item.confirmedAt !== void 0)), "学习目标必须关联同科已确认概念。");
	requireValue(new Set(command.objective.conceptIds).size === command.objective.conceptIds.length, "学习目标不能重复关联概念。");
	state.objectives.push(command.objective);
	return state;
}
/** Create one relation between confirmed concepts. */
function applyRelation(ctx) {
	const { command, previous, state } = ctx;
	if (duplicate(state.relations, (item) => item.id === command.relation.id, (item) => canonical(item) === canonical(command.relation))) return previous;
	const from = state.concepts.find((item) => item.id === command.relation.fromId);
	const to = state.concepts.find((item) => item.id === command.relation.toId);
	requireValue(from && to && from.id !== to.id && from.subject === to.subject && from.confirmedAt !== void 0 && to.confirmedAt !== void 0, "概念关系必须连接同科两个已确认概念。");
	state.relations.push(command.relation);
	return state;
}
/** Link a confirmed mistake to a learning goal. */
function applyLinkMistake(ctx) {
	const { command, previous, state } = ctx;
	const mistake = state.mistakes.find((item) => item.id === command.mistakeId);
	const objective = objectiveOf(state, command.objectiveId);
	requireValue(mistake && objective && mistake.confirmedAt !== void 0 && mistake.subject === objective.subject, "错题与学习目标必须已确认且属于同一科目。");
	if (mistake.objectiveId === objective.id) return previous;
	mistake.objectiveId = objective.id;
	return state;
}
/** Set, change or clear a mistake error cause. */
function applyClassifyMistake(ctx) {
	const { command, previous, state } = ctx;
	const mistake = state.mistakes.find((item) => item.id === command.mistakeId);
	requireValue(mistake?.confirmedAt !== void 0, "先确认错题，再归类错因。");
	const next = command.errorType === void 0 ? mistake.errorType : command.errorType === "" ? void 0 : command.errorType;
	if (next !== void 0) requireValue(errorTypesBySubject[mistake.subject].includes(next), "错因分类与科目不符。");
	if (next === mistake.errorType) return previous;
	if (next === void 0) delete mistake.errorType;
	else mistake.errorType = next;
	return state;
}
//#endregion
//#region lib/types/learning/update/paper.js
/** Save one printable sheet and freeze its mistake citations. */
function applyWorksheet(ctx) {
	const { command, previous, state, now } = ctx;
	const sheet = {
		...command.worksheet,
		items: command.worksheet.items.map((item) => {
			const goalId = item.objectiveId ?? (item.mistakeId ? state.mistakes.find((mistake) => mistake.id === item.mistakeId)?.objectiveId : void 0) ?? command.worksheet.objectiveId;
			return {
				...item,
				...goalId !== void 0 ? { objectiveId: goalId } : {}
			};
		})
	};
	requireValue(new Set(sheet.items.map((item) => item.id)).size === sheet.items.length, "练习单题号不能重复。");
	if (sheet.objectiveId) requireValue(objectiveOf(state, sheet.objectiveId)?.subject === sheet.subject, "练习单学习目标不存在或科目不符。");
	const cited = sheet.items.flatMap((item) => item.mistakeId ? [item.mistakeId] : []);
	requireValue(new Set(cited).size === cited.length, "同一道错题在一张卷上只出一题。");
	const horizon = dayStart(studyDay(now + DAY)) + DAY;
	for (const item of sheet.items) {
		const mistake = item.mistakeId ? state.mistakes.find((candidate) => candidate.id === item.mistakeId) : void 0;
		requireValue(!item.mistakeId || mistake?.confirmedAt !== void 0 && mistake.objectiveId !== void 0 && mistake.subject === sheet.subject, "练习单引用的错题必须已确认、已归类到同科学习目标。");
		const goalId = itemObjectiveId(state, sheet, item);
		requireValue(goalId !== void 0 && objectiveOf(state, goalId)?.subject === sheet.subject, "每道题都要有同科学习目标：写在题上，或写在整张卷上。");
		if (!mistake) continue;
		requireValue(mistake.objectiveId === goalId, "巩固题的学习目标必须和它的错题一致。");
		requireValue(item.prompt !== mistake.prompt, "巩固题必须换题面，不能照抄原题。");
		requireValue(mistake.dueAt !== void 0 && mistake.dueAt < horizon, `错题 ${mistake.id} 明天之后才到复习日，先不放进巩固卷。`);
		const other = state.worksheets.find((candidate) => candidate.id !== sheet.id && sheetOpen(state, candidate) && candidate.items.some((question) => question.mistakeId === mistake.id));
		requireValue(!other, `错题 ${mistake.id} 已经在还没批改的练习单 ${other?.id ?? ""} 上，先批改或作废那张。`);
	}
	const existing = state.worksheets.find((item) => item.id === sheet.id);
	if (existing) {
		const { createdAt: _createdAt, discardedAt: _discardedAt, ...stored } = existing;
		if (canonical(stored) === canonical(sheet)) return previous;
		requireValue(existing.discardedAt === void 0, "这张练习单已作废，请换一个新编号。");
		requireValue(!state.paperResults.some((item) => item.worksheetId === existing.id), "这张练习单已有作答，请换一个新编号。");
		requireValue(!state.paperDrafts.some((item) => item.worksheetId === existing.id), "这张练习单已有照片转录，请换一个新编号。");
		state.worksheets = state.worksheets.map((item) => item === existing ? {
			...sheet,
			createdAt: existing.createdAt
		} : item);
		return state;
	}
	state.worksheets.push({
		...sheet,
		createdAt: now
	});
	return state;
}
/** Save one photo transcription draft for a sheet item. */
function applyPaperDraft(ctx) {
	const { command, previous, state, now } = ctx;
	const draft = command.paperDraft;
	const worksheet = state.worksheets.find((item) => item.id === draft.worksheetId);
	const item = worksheet?.items.find((item) => item.id === draft.itemId);
	requireValue(worksheet && item, "转录草稿必须对应已保存的练习单项。");
	requireValue(worksheet.discardedAt === void 0, "这张练习单已作废。");
	if (draft.errorType !== void 0) requireValue(errorTypesBySubject[worksheet.subject].includes(draft.errorType), "错因分类与科目不符。");
	const existing = state.paperDrafts.find((candidate) => candidate.worksheetId === draft.worksheetId && candidate.itemId === draft.itemId);
	const next = {
		worksheetId: draft.worksheetId,
		itemId: draft.itemId,
		response: draft.response,
		result: draft.result,
		assistance: draft.assistance,
		uncertainties: draft.uncertainties ?? existing?.uncertainties ?? "",
		...draft.errorType !== void 0 ? { errorType: draft.errorType } : existing?.errorType !== void 0 ? { errorType: existing.errorType } : {},
		...draft.confidence !== void 0 ? { confidence: draft.confidence } : existing?.confidence !== void 0 ? { confidence: existing.confidence } : {}
	};
	if (existing) {
		const { receivedAt: _existingAt, ...before } = existing;
		if (canonical(before) === canonical(next)) return previous;
		state.paperDrafts = state.paperDrafts.map((candidate) => candidate === existing ? {
			...next,
			receivedAt: existing.receivedAt
		} : candidate);
		return state;
	}
	state.paperDrafts.push({
		...next,
		receivedAt: now
	});
	return state;
}
/** Apply the parent per-item marks for one sheet. */
function applyGradeSheet(ctx) {
	const { command, previous, state, now } = ctx;
	const grade = command.grade;
	const worksheet = state.worksheets.find((item) => item.id === grade.worksheetId);
	requireValue(worksheet, "练习单不存在。");
	requireValue(worksheet.discardedAt === void 0, "这张练习单已作废。");
	requireValue(new Set(grade.results.map((entry) => entry.itemId)).size === grade.results.length, "同一道题只批改一次。");
	let changed = false;
	for (const entry of grade.results) {
		const item = worksheet.items.find((question) => question.id === entry.itemId);
		requireValue(item, `练习单 ${worksheet.id} 没有题号 ${entry.itemId}。`);
		if (entry.errorType !== void 0) requireValue(errorTypesBySubject[worksheet.subject].includes(entry.errorType), "错因分类与科目不符。");
		const before = state.paperResults.find((result) => result.worksheetId === worksheet.id && result.itemId === item.id);
		const draft = state.paperDrafts.find((candidate) => candidate.worksheetId === worksheet.id && candidate.itemId === item.id);
		const assistance = entry.assistance ?? before?.assistance ?? draft?.assistance ?? "independent";
		const response = entry.response ?? before?.response ?? draft?.response ?? "（家长在面板批改，未转录原答案）";
		changed = gradeItem(state, worksheet, item, {
			worksheetId: worksheet.id,
			itemId: item.id,
			response,
			result: entry.result,
			assistance,
			feedback: "家长批改",
			answerEvidence: item.answerEvidence,
			userConfirmation: grade.userConfirmation,
			receivedAt: now
		}, entry.result !== "correct" ? entry.errorType : void 0) || changed;
	}
	if (!changed) return previous;
	return state;
}
/** Confirm transcription drafts into paper results. */
function applyConfirmPaper(ctx) {
	const { command, previous, state, now } = ctx;
	const worksheet = state.worksheets.find((item) => item.id === command.worksheetId);
	requireValue(worksheet, "练习单不存在。");
	requireValue(worksheet.discardedAt === void 0, "这张练习单已作废。");
	requireValue(new Set(command.results.map((entry) => entry.itemId)).size === command.results.length, "同一道题只核对一次。");
	let changed = false;
	for (const entry of command.results) {
		const item = worksheet.items.find((question) => question.id === entry.itemId);
		requireValue(item, `练习单 ${worksheet.id} 没有题号 ${entry.itemId}。`);
		if (entry.errorType !== void 0) requireValue(errorTypesBySubject[worksheet.subject].includes(entry.errorType), "错因分类与科目不符。");
		const draft = state.paperDrafts.find((candidate) => candidate.worksheetId === worksheet.id && candidate.itemId === item.id);
		const before = state.paperResults.find((result) => result.worksheetId === worksheet.id && result.itemId === item.id);
		requireValue(draft !== void 0 || before !== void 0, "请先让学习助手转录这张卷，再逐题核对入库。");
		const assistance = entry.assistance ?? draft?.assistance ?? before?.assistance ?? "independent";
		const response = entry.response ?? draft?.response ?? before?.response ?? "（家长核对照片转录，未转录原答案）";
		const errorType = entry.result !== "correct" ? entry.errorType ?? draft?.errorType : void 0;
		changed = gradeItem(state, worksheet, item, {
			worksheetId: worksheet.id,
			itemId: item.id,
			response,
			result: entry.result,
			assistance,
			feedback: "家长核对照片转录",
			answerEvidence: item.answerEvidence,
			userConfirmation: command.userConfirmation,
			receivedAt: draft?.receivedAt ?? now
		}, errorType) || changed;
		if (draft !== void 0) {
			state.paperDrafts = state.paperDrafts.filter((candidate) => candidate !== draft);
			changed = true;
		}
	}
	if (!changed) return previous;
	return state;
}
/** Discard one sheet so its mistakes can print again. */
function applyDiscardSheet(ctx) {
	const { command, previous, state, now } = ctx;
	const worksheet = state.worksheets.find((item) => item.id === command.worksheetId);
	requireValue(worksheet, "练习单不存在。");
	if (worksheet.discardedAt !== void 0) return previous;
	worksheet.discardedAt = now;
	return state;
}
/** Save one workbook photo draft without a sheet. */
function applyWorkbookDraft(ctx) {
	const { command, previous, state, now } = ctx;
	const draft = command.draft;
	requireValue(!state.workbookResults.some((item) => item.id === draft.id), "这道练习册题已确认，请换一个新编号。");
	if (draft.objectiveId) requireValue(objectiveOf(state, draft.objectiveId)?.subject === draft.subject, "学习目标不存在或科目不符。");
	const next = {
		...draft,
		uncertainties: draft.uncertainties
	};
	const existing = state.workbookDrafts.find((item) => item.id === draft.id);
	if (existing) {
		const { receivedAt: _receivedAt, ...before } = existing;
		if (canonical(before) === canonical(next)) return previous;
		state.workbookDrafts = state.workbookDrafts.map((item) => item.id === draft.id ? {
			...next,
			receivedAt: existing.receivedAt
		} : item);
		return state;
	}
	state.workbookDrafts.push({
		...next,
		receivedAt: now
	});
	return state;
}
/** Retain the confirmed photo record and route difficulty to teaching or mistakes. Receipt time is not an answer date. */
function applyConfirmWorkbook(ctx) {
	const { command, previous, state, now } = ctx;
	const draft = state.workbookDrafts.find((item) => item.id === command.id);
	if (!draft) return previous;
	const outcome = command.outcome ?? draft.outcome;
	const objectiveId = command.objectiveId === "" ? void 0 : command.objectiveId ?? draft.objectiveId;
	if (objectiveId) requireValue(objectiveOf(state, objectiveId)?.subject === draft.subject, "学习目标不存在或科目不符。");
	const { objectiveId: _draftGoal, ...original } = draft;
	state.workbookResults.push({
		...original,
		outcome,
		...objectiveId !== void 0 ? { objectiveId } : {},
		confirmedAt: now,
		userConfirmation: command.userConfirmation,
		...command.correction !== void 0 ? { correction: command.correction } : {},
		...command.explanation !== void 0 ? { explanation: command.explanation } : {},
		...command.answerEvidence !== void 0 ? { answerEvidence: command.answerEvidence } : {}
	});
	state.workbookDrafts = state.workbookDrafts.filter((item) => item.id !== draft.id);
	if (outcome === "independent-correct") {
		dropTaught(state, objectiveId);
		return state;
	}
	if (outcome === "stuck" || outcome === "hinted") {
		const queueId = `tq-${draft.id}`.slice(0, 80);
		if (!state.teachingQueue.some((item) => item.id === queueId)) state.teachingQueue.push({
			id: queueId,
			subject: draft.subject,
			prompt: draft.prompt,
			confirmedAt: now,
			sourceDraftId: draft.id,
			...objectiveId !== void 0 ? { objectiveId } : {}
		});
		return state;
	}
	if (command.correction === void 0 || command.explanation === void 0 || command.answerEvidence === void 0) throw new Error("独立做错要写订正、说明和答案依据。");
	const mistakeId = `wb-${draft.id}`.slice(0, 80);
	if (!state.mistakes.some((item) => item.id === mistakeId)) state.mistakes.push({
		id: mistakeId,
		subject: draft.subject,
		topic: draft.prompt.slice(0, 60),
		prompt: draft.prompt,
		learnerAnswer: draft.response ?? "（未转录）",
		correction: command.correction,
		explanation: command.explanation,
		answerEvidence: command.answerEvidence,
		uncertainties: "",
		...draft.imagePath !== void 0 ? { imagePath: draft.imagePath } : {},
		...objectiveId !== void 0 ? { objectiveId } : {},
		confirmedAt: now,
		userConfirmation: command.userConfirmation,
		stage: 0,
		independentDays: []
	});
	return state;
}
/** Remove one item from the teaching queue. */
function applyDismissTeaching(ctx) {
	const { command, previous, state } = ctx;
	if (!state.teachingQueue.some((item) => item.id === command.id)) return previous;
	state.teachingQueue = state.teachingQueue.filter((item) => item.id !== command.id);
	return state;
}
//#endregion
//#region lib/types/learning/update/index.js
/** Notice text appended to a status result when the model sends a field the mode ignores. */
function updateNotices(input) {
	const parsed = commandSchema.safeParse(input);
	if (!parsed.success || parsed.data.action !== "start" || parsed.data.mode === "diagnose" || parsed.data.intensity === void 0) return [];
	return [`已忽略 intensity「${parsed.data.intensity}」。摸底强度只用于摸底检测，本次不记录强度。`];
}
/** Apply one validated command end to end: clone, dispatch, and re-derive review schedules for mutations. */
function rawApply(previous, command, now) {
	const inheritedEvidence = evidenceOf(previous);
	const state = attachEvidence(structuredClone(previous), inheritedEvidence);
	const base = {
		previous,
		state,
		now,
		active: activeSession(state)
	};
	let result;
	switch (command.action) {
		case "setup":
			result = applyUpdateProfile({
				...base,
				command
			});
			break;
		case "configure-course":
			result = applyConfigureCourse({
				...base,
				command
			});
			break;
		case "archive-term":
			result = applyArchiveTerm({
				...base,
				command
			});
			break;
		case "material":
			result = applyMaterial({
				...base,
				command
			});
			break;
		case "course":
			result = applyCourse({
				...base,
				command
			});
			break;
		case "school-progress":
			result = applySchoolProgress({
				...base,
				command
			});
			break;
		case "openmaic-settings":
			result = applyOpenmaicSettings({
				...base,
				command
			});
			break;
		case "interests":
			result = applyInterests({
				...base,
				command
			});
			break;
		case "task":
			result = applyTask({
				...base,
				command
			});
			break;
		case "answer":
		case "hint":
			result = applyAnswerOrHint({
				...base,
				command
			});
			break;
		case "stuck":
			result = applyStuck({
				...base,
				command
			});
			break;
		case "start":
			result = applyStart({
				...base,
				command
			});
			break;
		case "record":
			result = applyRecord({
				...base,
				command
			});
			break;
		case "stop":
			result = applyStop({
				...base,
				command
			});
			break;
		case "mistake":
			result = applyMistake({
				...base,
				command
			});
			break;
		case "confirm-mistake":
			result = applyConfirmMistake({
				...base,
				command
			});
			break;
		case "delete-mistake":
			result = applyDeleteMistake({
				...base,
				command
			});
			break;
		case "save-exercise":
			result = applySaveExercise({
				...base,
				command
			});
			break;
		case "delete-exercise":
			result = applyDeleteExercise({
				...base,
				command
			});
			break;
		case "concept":
			result = applyConcept({
				...base,
				command
			});
			break;
		case "confirm-concept":
			result = applyConfirmConcept({
				...base,
				command
			});
			break;
		case "objective":
			result = applyObjective({
				...base,
				command
			});
			break;
		case "relation":
			result = applyRelation({
				...base,
				command
			});
			break;
		case "link-mistake":
			result = applyLinkMistake({
				...base,
				command
			});
			break;
		case "classify-mistake":
			result = applyClassifyMistake({
				...base,
				command
			});
			break;
		case "worksheet":
			result = applyWorksheet({
				...base,
				command
			});
			break;
		case "paper-draft":
			result = applyPaperDraft({
				...base,
				command
			});
			break;
		case "grade-sheet":
			result = applyGradeSheet({
				...base,
				command
			});
			break;
		case "confirm-paper":
			result = applyConfirmPaper({
				...base,
				command
			});
			break;
		case "discard-sheet":
			result = applyDiscardSheet({
				...base,
				command
			});
			break;
		case "workbook-draft":
			result = applyWorkbookDraft({
				...base,
				command
			});
			break;
		case "confirm-workbook":
			result = applyConfirmWorkbook({
				...base,
				command
			});
			break;
		case "dismiss-teaching": result = applyDismissTeaching({
			...base,
			command
		});
	}
	if (result === previous) return previous;
	if (result !== state) return command.action === "archive-term" ? result : attachEvidence(result, inheritedEvidence);
	state.revision += 1;
	state.updatedAt = now;
	return scheduleMistakes(attachEvidence(stateSchema.parse(state), inheritedEvidence));
}
/** Apply one validated mutation without changing the input; setup creates the first state or updates the existing profile in place. */
function updateStudy(previous, input, now) {
	const command = commandSchema.parse(input);
	if (command.action === "setup" && previous === void 0) return applySetup(command, now);
	requireValue(previous, "请先用 /study 完成家长确认的学习档案。");
	requireValue(now >= previous.updatedAt, "系统时间早于上次记录，请核对设备时钟后重试。");
	return rawApply(previous, command, now);
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
//#region lib/types/files/application.js
/**
* Bind official-file reads and guarded manual writes to the calling execution world.
* @param exec - current registered agent and cancellation signal.
* @returns filesystem adapter that preserves DSH containment and write policy.
*/
function applicationStudyFiles(exec) {
	const agent = exec.agent;
	if (!agent?.session.header.cwd) throw new Error("Open a Student workspace before reading its files.");
	const availableFs = agent.ctx.get("fs");
	const policy = agent.ctx.get("sandboxPolicy");
	if (!availableFs || !policy) throw new Error("Student requires the DSH filesystem and sandbox policy services.");
	const fs = availableFs;
	const cwd = agent.session.header.cwd;
	async function target(path, signal) {
		const root = await fs.resolve(cwd, { signal });
		const resolved = await fs.resolve(path, {
			cwd,
			signal
		});
		if (!fs.contains(root, resolved)) throw new Error("学习档案必须位于当前工作区内。");
		return resolved;
	}
	return {
		async stat(path, signal) {
			const resolved = await target(path, signal);
			const info = await fs.stat(resolved, signal);
			return info ? {
				...info,
				targetKey: resolved.targetKey
			} : void 0;
		},
		async list(path, signal) {
			const resolved = await target(path, signal);
			if (!await fs.stat(resolved, signal)) return [];
			return (await fs.listDir(resolved, signal)).map((entry) => ({
				name: entry.name,
				type: entry.type
			}));
		},
		async read(path, signal, limit) {
			return fs.readBytes(await target(path, signal), signal, limit);
		},
		async write(path, content, intent, signal) {
			return (await fs.writeText(await target(path, signal), content, intent, signal, policy.resolve({ session: agent.session }))).version;
		},
		async remove(path, version, signal) {
			await fs.deleteFile(await target(path, signal), { version }, signal, policy.resolve({ session: agent.session }));
		}
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
//#region lib/types/files/projection.js
/** Compatibility display projection; normalized evidence remains attached to the official read. */
/**
* Project official entities into the existing dashboard's display fields.
* @param workspace - validated current official files.
* @param now - explicit query cutoff.
* @returns display state with the official normalized evidence used by every metric owner.
*/
function projectWorkspace(workspace, now) {
	const { settings, blocks, worksheets, collections } = workspace;
	const state = stateSchema.parse({
		format: 1,
		revision: settings.revision,
		updatedAt: settings.updatedAt,
		profile: settings.profile,
		materials: settings.materials,
		courses: settings.courses,
		interests: settings.interests,
		openmaic: settings.openmaic,
		...collections ? {
			exercises: collections.exercises,
			concepts: collections.concepts,
			objectives: collections.objectives,
			relations: collections.relations,
			teachingQueue: collections.teachingQueue
		} : {},
		sessions: blocks.map((block) => ({
			id: block.id,
			subject: block.subject,
			mode: block.mode,
			startedAt: block.startedAt,
			...block.intensity ? { intensity: block.intensity } : {},
			...block.endedAt !== void 0 ? { endedAt: block.endedAt } : {},
			...block.spentMs !== void 0 ? { spentMs: block.spentMs } : {},
			...block.reflection !== void 0 ? { reflection: block.reflection } : {},
			...block.context.scope ? { scope: block.context.scope } : {},
			...block.context.material ? { materialId: block.context.material.id } : {}
		})),
		attempts: blocks.flatMap((block) => block.responses.map((response) => {
			const question = block.questions.find((question) => question.id === response.questionId);
			const assessment = block.assessments.find((assessment) => assessment.responseId === response.id);
			return {
				id: response.id,
				questionId: question.id,
				responseId: response.id,
				sessionId: block.id,
				subject: block.subject,
				topic: question.topic,
				prompt: question.prompt,
				response: response.response ?? response.rawResponse,
				rawResponse: response.rawResponse,
				result: assessment?.result ?? "unassessed",
				assistance: response.assistance,
				feedback: assessment?.feedback ?? "Pending assessment",
				answerEvidence: assessment?.answerEvidence ?? question.answerEvidence,
				at: assessment?.assessedAt ?? block.startedAt,
				...typeof question.objectiveId === "string" ? { objectiveId: question.objectiveId } : {},
				...question.mistakeId ? { mistakeId: question.mistakeId } : {}
			};
		})),
		worksheets: worksheets.map((sheet) => ({
			id: sheet.id,
			subject: sheet.subject,
			createdAt: sheet.createdAt,
			...sheet.worksheetKind ? { kind: sheet.worksheetKind } : {},
			...sheet.discardedAt !== void 0 ? { discardedAt: sheet.discardedAt } : {},
			items: sheet.items.map((item) => ({
				id: item.id,
				prompt: item.prompt,
				answer: item.answer,
				explanation: item.explanation,
				answerEvidence: item.answerEvidence,
				...typeof item.objectiveId === "string" ? { objectiveId: item.objectiveId } : {},
				...item.mistakeId ? { mistakeId: item.mistakeId } : {},
				...item.figure ? { figure: item.figure } : {},
				...item.space ? { space: item.space } : {}
			}))
		})),
		paperResults: worksheets.flatMap((sheet) => sheet.assessments.map((assessment) => {
			const response = sheet.responses.find((response) => response.id === assessment.responseId);
			return {
				worksheetId: sheet.id,
				itemId: response.questionId,
				response: response.response ?? response.rawResponse,
				result: assessment.result === "stuck" ? "unassessed" : assessment.result,
				assistance: response.assistance,
				feedback: assessment.feedback,
				answerEvidence: assessment.answerEvidence,
				userConfirmation: assessment.userConfirmation,
				receivedAt: assessment.assessedAt
			};
		})),
		paperDrafts: worksheets.flatMap((sheet) => sheet.drafts.map((draft) => ({
			worksheetId: sheet.id,
			itemId: draft.questionId,
			response: draft.response,
			result: draft.result === "stuck" ? "unassessed" : draft.result,
			assistance: draft.assistance,
			uncertainties: draft.uncertainties,
			confidence: draft.confidence,
			receivedAt: draft.receivedAt
		}))),
		mistakes: collections?.mistakes ?? [],
		rewards: collections?.rewards ?? []
	});
	const active = blocks.find((block) => block.endedAt === void 0);
	const question = active?.questions.find((question) => question.id === active.currentQuestionId);
	if (active && question) {
		const candidates = active.responses.filter((response) => response.questionId === question.id);
		const response = active.currentResponseId ? candidates.find((response) => response.id === active.currentResponseId) : candidates.length === 1 ? candidates[0] : void 0;
		const actualDate = deriveEvidence(workspace).entries.find((entry) => entry.ownerId === active.id && entry.responseId === response?.id)?.answerDate;
		state.task = {
			id: question.id,
			sessionId: active.id,
			subject: active.subject,
			topic: question.topic,
			prompt: question.prompt,
			hintLevel: Math.max(0, ...active.hints.filter((hint) => hint.questionId === question.id).map((hint) => hint.level)),
			...question.figure ? { figure: question.figure } : {},
			...question.choices ? { choices: question.choices } : {},
			...question.steps ? { steps: question.steps } : {},
			...question.phase ? { phase: question.phase } : {},
			...typeof question.objectiveId === "string" ? { objectiveId: question.objectiveId } : {},
			...response ? {
				responseId: response.id,
				response: response.response ?? response.rawResponse,
				rawResponse: response.rawResponse,
				...actualDate?.kind === "instant" ? { answeredAt: actualDate.at } : {}
			} : {}
		};
	}
	attachEvidence(state, deriveEvidence(workspace));
	return scheduleMistakes(state, now);
}
//#endregion
//#region lib/types/learning/status.js
/**
* Elapsed clocks for the current block and today, computed from sessions only.
* Reading never closes a session.
*/
function timeStatus(state, now) {
	const active = activeSession(state);
	const todayMs = todaySpent(state, now);
	const phase = active ? "studying" : "ready";
	const blockElapsedMs = active ? Math.max(0, now - active.startedAt) : 0;
	return {
		phase,
		time: {
			timezone: "Asia/Shanghai",
			blockElapsed: active ? formatDuration(blockElapsedMs) : null,
			todayElapsed: formatDuration(todayMs)
		}
	};
}
/**
* Summarize elapsed time, course confirmation, rewards and evidence-derived progress.
* Reading does not close a session; stop records when the learner actually stopped.
*/
function studyStatus(state, now) {
	const time = timeStatus(state, now);
	const progress = /* @__PURE__ */ new Map();
	function includeEvidence(subject, topic, at, result, assistance, materialId, objectiveId) {
		const key = objectiveId ?? JSON.stringify([
			subject,
			topic,
			materialId
		]);
		const item = progress.get(key) ?? {
			subject,
			topic,
			...materialId ? { materialId } : {},
			...objectiveId ? { objectiveId } : {},
			attempts: 0,
			independentDays: []
		};
		item.attempts += 1;
		if (at !== void 0 && result === "correct" && assistance === "independent" && !item.independentDays.includes(studyDay(at))) item.independentDays.push(studyDay(at));
		progress.set(key, item);
	}
	for (const entry of evidenceOf(state).entries) {
		const day = evidenceDay(entry);
		const goal = entry.objectiveId ? objectiveInfo(state, entry.objectiveId) : void 0;
		includeEvidence(entry.subject, goal?.title ?? entry.topic, day === void 0 ? void 0 : dayStart(day), entry.result, entry.assistance, void 0, entry.objectiveId);
	}
	const interests = interestTagsOf(state.interests?.tags);
	return {
		task: state.task ?? null,
		feedback: state.task ? state.attempts.find((item) => item.sessionId === state.task.sessionId && (state.task.responseId ? item.responseId === state.task.responseId : item.questionId === void 0 && item.id === state.task.id)) ?? null : null,
		revision: state.revision,
		profile: state.profile,
		interests,
		interestFocus: interestFocus(interests, studyDay(now)),
		...time,
		active: activeSession(state) ?? null,
		openmaic: {
			baseUrl: effectiveOpenmaicBase(state.openmaic?.baseUrl, process.env.OPENMAIC_BASE),
			savedBaseUrl: state.openmaic?.baseUrl ?? "",
			lessonsPath: OPENMAIC_LESSONS_PATH,
			cookiePath: OPENMAIC_COOKIE_PATH
		},
		courses: state.courses,
		unconfirmedSubjects: [
			"chinese",
			"math",
			"english"
		].filter((subject) => !state.courses.some((course) => course.subject === subject)),
		stars: state.rewards.length,
		todayStars: state.rewards.filter((reward) => reward.day === studyDay(now)).length,
		dueMistakes: state.mistakes.filter((mistake) => mistake.dueAt !== void 0 && mistake.dueAt <= now).map((mistake) => ({
			id: mistake.id,
			subject: mistake.subject,
			topic: mistake.topic
		})),
		pendingMistakes: state.mistakes.filter((mistake) => mistake.confirmedAt === void 0).map((mistake) => mistake.id),
		progress: [...progress.values()].map((item) => ({
			...item,
			level: item.independentDays.length >= 3 ? "independent-on-three-days" : "practising"
		}))
	};
}
/**
* Summarise the last seven calendar days for the parent: minutes per day, goals practised and
* newly mastered, mistake flow, due-review completion and this week's top error causes.
* Purely derived from stored evidence; nothing is stored per week.
* @param state - current durable learning state.
* @param now - host wall-clock time in milliseconds.
* @param insight - precomputed insight for the same state and time, when the caller already has one.
*/
function weeklySummary(state, now, insight) {
	const days = Array.from({ length: 7 }, (_, index) => studyDay(now - (6 - index) * DAY));
	const daySet = new Set(days);
	const minutesByDay = summaryMinutes(state, now);
	const windowStart = dayStart(days[0]);
	const index = evidenceOf(state);
	const entries = evidenceAtCutoff(index, now);
	const practised = new Set(entries.filter((item) => daySet.has(evidenceDay(item))).flatMap((item) => item.objectiveId ? [item.objectiveId] : []));
	const checkpoints = [...new Set(entries.map((item) => item.answerDate.kind === "instant" ? item.answerDate.at : dayStart(evidenceDay(item)) + DAY - 1))].filter((at) => at <= now || studyDay(at) === studyDay(now)).sort((a, b) => a - b);
	const ever = /* @__PURE__ */ new Set();
	const troubled = /* @__PURE__ */ new Set();
	const first = /* @__PURE__ */ new Map();
	const recovered = /* @__PURE__ */ new Map();
	for (const at of checkpoints) {
		const currentEntries = entries.filter((item) => item.answerDate.kind === "instant" ? item.answerDate.at === at : dayStart(evidenceDay(item)) + DAY - 1 === at);
		const beforeAt = currentEntries.some((item) => item.answerDate.kind === "day") ? dayStart(studyDay(at)) : at - 1;
		const before = structuredClone(state);
		attachEvidence(before, {
			entries: index.entries.filter((item) => item.answerDate.kind === "instant" ? item.answerDate.at < at : item.answerDate.kind === "day" ? item.answerDate.day < studyDay(at) : false),
			stuckSignals: index.stuckSignals.filter((signal) => signal.at <= beforeAt)
		});
		scheduleMistakes(before, beforeAt);
		for (const goal of studyInsight(before, beforeAt).objectives) if (ever.has(goal.id) && (goal.level === "due" || goal.level === "weak")) troubled.add(goal.id);
		const historical = structuredClone(state);
		historical.mistakes = historical.mistakes.filter((item) => item.confirmedAt === void 0 || item.confirmedAt <= at);
		historical.teachingQueue = historical.teachingQueue.filter((item) => item.confirmedAt <= at);
		historical.sessions = historical.sessions.filter((item) => item.startedAt <= at);
		attachEvidence(historical, index);
		scheduleMistakes(historical, at);
		const historicalInsight = studyInsight(historical, at);
		const answered = new Set(currentEntries.filter((item) => item.result === "correct" && item.assistance === "independent").flatMap((item) => item.objectiveId ? [item.objectiveId] : []));
		for (const goal of historicalInsight.objectives) {
			if (ever.has(goal.id) && (goal.level === "due" || goal.level === "weak")) troubled.add(goal.id);
			if (goal.level !== "mastered" || !answered.has(goal.id)) continue;
			if (!ever.has(goal.id)) {
				first.set(goal.id, studyDay(at));
				ever.add(goal.id);
			} else if (troubled.has(goal.id)) {
				recovered.set(goal.id, studyDay(at));
				troubled.delete(goal.id);
			}
		}
	}
	const currentMastered = new Set(insight.objectives.filter((goal) => goal.level === "mastered").map((goal) => goal.id));
	const practisedGoals = practised.size;
	const masteredGoals = [...first].filter(([goal, day]) => currentMastered.has(goal) && daySet.has(day)).length;
	const recoveredGoals = [...recovered].filter(([goal, day]) => currentMastered.has(goal) && daySet.has(day)).length;
	const newMistakes = state.mistakes.filter((mistake) => mistake.confirmedAt !== void 0 && mistake.confirmedAt >= windowStart && mistake.confirmedAt <= now).length;
	const replay = state.mistakes.map((mistake) => replayMistake(mistake, index, now, windowStart));
	const consolidatedMistakes = replay.filter((item) => item.consolidatedDay !== void 0 && daySet.has(item.consolidatedDay)).length;
	const dueCompletion = {
		done: replay.filter((item) => item.completed).length,
		total: replay.filter((item) => item.opportunity).length
	};
	const causeCounts = /* @__PURE__ */ new Map();
	for (const mistake of state.mistakes) {
		if (mistake.confirmedAt === void 0 || mistake.confirmedAt < windowStart || mistake.confirmedAt > now || mistake.errorType === void 0) continue;
		causeCounts.set(mistake.errorType, (causeCounts.get(mistake.errorType) ?? 0) + 1);
	}
	const errorCauses = [...causeCounts.entries()].map(([type, count]) => ({
		type,
		count
	})).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)).slice(0, 3);
	return {
		minutesByDay,
		activeDays: minutesByDay.filter((item) => item.minutes > 0).length,
		practisedGoals,
		masteredGoals,
		recoveredGoals,
		newMistakes,
		consolidatedMistakes,
		dueCompletion,
		errorCauses,
		suggestion: insight.recommendation
	};
}
/**
* Cheap elapsed-minute projection for Shanghai today and the preceding six calendar days.
* @param state - block timing records; answers and grading times are unused.
* @param now - explicit current clock.
* @returns per-day minutes with midnight-crossing blocks split across their actual calendar days.
*/
function summaryMinutes(state, now) {
	return Array.from({ length: 7 }, (_, index) => {
		const day = studyDay(now - (6 - index) * DAY);
		const start = dayStart(day);
		const milliseconds = state.sessions.reduce((sum, block) => sum + Math.max(0, Math.min(block.endedAt ?? now, start + DAY, now) - Math.max(block.startedAt, start)), 0);
		return {
			day,
			minutes: Math.round(milliseconds / 6e4)
		};
	});
}
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
//#region lib/types/learning/queries.js
const workspaceQueryCache = /* @__PURE__ */ new Map();
function queryWorkspace(read, request, now) {
	const versions = read.files.map(({ path, targetKey, version }) => ({
		path,
		targetKey,
		version
	}));
	const relevantInvalid = request.kind === "files" ? false : request.kind === "settings" || request.kind === "materials" ? read.issues.some((issue) => issue.path === ".study/settings.json") : request.kind === "learning-context" ? read.issues.some((issue) => issue.path === ".study/settings.json" || issue.path.startsWith(".study/blocks")) : read.status !== "valid";
	if (!read.workspace || relevantInvalid || [
		"changing",
		"legacy",
		"archived",
		"missing"
	].includes(read.status)) return {
		status: read.status,
		issues: read.issues,
		versions
	};
	const workspace = read.workspace;
	if (request.kind === "files") return {
		status: read.status === "valid" ? "valid" : "partial",
		issues: read.issues,
		versions,
		data: workspace
	};
	if (request.kind === "settings") return {
		status: read.status === "valid" ? "valid" : "partial",
		issues: read.issues,
		versions,
		data: workspace.settings
	};
	const identity = read.files.find((file) => file.path === ".study/settings.json").targetKey;
	const signature = JSON.stringify([versions, workspace.nativeSources ?? []]);
	let cached = workspaceQueryCache.get(identity);
	if (!cached || cached.signature !== signature || now >= cached.refreshAfter || now < cached.at) {
		const state = projectWorkspace(workspace, now);
		cached = {
			signature,
			state,
			at: now,
			refreshAfter: nextRefreshAfter(state, now),
			queries: /* @__PURE__ */ new Map()
		};
		if (workspaceQueryCache.size >= 8) workspaceQueryCache.clear();
		workspaceQueryCache.set(identity, cached);
	}
	const { state, refreshAfter } = cached;
	const index = evidenceOf(state);
	if (request.kind === "learning-context") {
		const active = workspace.blocks.find((block) => block.endedAt === void 0);
		const currentQuestion = active?.questions.find((question) => question.id === active.currentQuestionId);
		const responses = (active?.responses.filter((response) => response.questionId === currentQuestion?.id) ?? []).slice(-20).map((response) => ({
			...response,
			answerDate: index.entries.find((item) => item.ownerId === active?.id && item.responseId === response.id)?.answerDate ?? { kind: "unknown" }
		}));
		const elements = currentQuestion && typeof currentQuestion.objectiveId === "string" ? objectiveElements(state, currentQuestion.objectiveId) : void 0;
		return {
			status: read.status === "valid" ? "valid" : "partial",
			issues: read.issues,
			versions,
			refreshAfter,
			data: {
				termId: workspace.settings.termId,
				activeBlock: active ? {
					id: active.id,
					subject: active.subject,
					mode: active.mode,
					context: active.context,
					currentQuestionId: active.currentQuestionId
				} : null,
				currentQuestion: currentQuestion ?? null,
				responses,
				assessments: active?.assessments.filter((assessment) => responses.some((response) => response.id === assessment.responseId)) ?? [],
				pendingFacts: index.entries.filter((item) => item.answerDate.kind === "unknown" || item.assistance === "unknown" || !item.objectiveId).map((item) => ({
					ownerId: item.ownerId,
					responseId: item.responseId,
					fields: [
						...item.answerDate.kind === "unknown" ? ["answerDate"] : [],
						...item.assistance === "unknown" ? ["assistance"] : [],
						...item.basisStatus ? ["answerBasis"] : !item.objectiveId ? ["objectiveId"] : []
					]
				})).slice(0, 20),
				seeds: currentQuestion && typeof currentQuestion.objectiveId === "string" ? subjectExercises(active.subject).filter((item) => item.objectiveId === currentQuestion.objectiveId).slice(0, 3) : [],
				elements: elements ? {
					...elements,
					exercises: elements.exercises.slice(0, 3)
				} : null,
				legalActions: currentQuestion ? responses.length ? ["request-assessment", "end-block"] : [
					"answer",
					"request-hint",
					"end-block"
				] : ["start-question"]
			}
		};
	}
	if (request.kind === "summary") {
		const summary = cached.summary ??= weeklySummary(state, now, studyInsight(state, now));
		const minutesByDay = summaryMinutes(state, now);
		return {
			status: "valid",
			versions,
			refreshAfter,
			data: {
				...summary,
				minutesByDay,
				activeDays: minutesByDay.filter((item) => item.minutes > 0).length
			}
		};
	}
	const key = canonical(request);
	let data = cached.queries.get(key);
	if (!data) {
		data = queryStudy(state, request.kind, request.offset ?? 0, request, now);
		if (cached.queries.size >= 8) cached.queries.clear();
		cached.queries.set(key, data);
	}
	return {
		status: read.status === "valid" ? "valid" : "partial",
		issues: read.issues,
		versions,
		refreshAfter,
		data: request.kind === "status" ? {
			...data,
			...timeStatus(state, now)
		} : data
	};
}
/**
* Bounded history and status queries. Only the requested collection is computed; offset pagination applies to every collection.
* @param state - current durable learning state, or undefined before setup.
* @param kind - record collection or projection to read.
* @param offset - zero-based collection offset.
* @param options - optional exact record ID, subject and unit filters, grade/term for browsing another knowledge map or a cross-grade check-in plan.
* @param now - explicit query clock; legacy tool callers default to the host clock.
* @returns the projection or one page of records.
*/
function queryStudy(state, kind, offset, options = {}, now = Date.now()) {
	if (!state) return {
		phase: "setup-required",
		path: ".study/state.json"
	};
	const { id, subject, unit } = options;
	if (kind === "status") {
		const summary = studyStatus(state, now);
		return {
			...summary,
			...insightSummary(studyInsight(state, now)),
			progress: summary.progress.slice(0, 20),
			progressCount: summary.progress.length,
			dueMistakes: summary.dueMistakes.slice(0, 20),
			dueMistakeCount: summary.dueMistakes.length,
			pendingMistakes: summary.pendingMistakes.slice(0, 20),
			pendingMistakeCount: summary.pendingMistakes.length,
			teachingQueue: state.teachingQueue.slice(0, 20),
			teachingQueueCount: state.teachingQueue.length,
			workbookDrafts: state.workbookDrafts.slice(0, 20),
			workbookDraftCount: state.workbookDrafts.length,
			workbookResults: state.workbookResults.slice(-20).reverse(),
			workbookResultCount: state.workbookResults.length,
			more: "The study skill owns what to do next; kind=progress, due, weak, exercises or curriculum with offset pages more records. interests and interestFocus wrap question context; facts stay on the knowledge map. dueToday lists at most two mistakes to clear and dueBacklog is the full overdue count. openmaic.baseUrl is the interactive-lesson service; write lesson records at openmaic.lessonsPath with the shell, not study_update."
		};
	}
	if (kind === "curriculum") {
		if (!subject) throw new Error("知识地图查询需要指定科目（subject）。");
		const scope = options.grade !== void 0 || options.term !== void 0 ? {
			grade: options.grade ?? state.profile.grade,
			term: options.term ?? state.profile.term
		} : void 0;
		return {
			revision: state.revision,
			curriculum: curriculumView(state, subject, studyInsight(state, now), scope)
		};
	}
	if (kind === "elements") {
		if (!subject) throw new Error("知识要素查询需要指定科目（subject）。");
		if (options.grade !== void 0 || options.term !== void 0) throw new Error("知识要素只支持当前学期的知识地图。");
		const file = curriculumFor(state.profile, subject);
		if (!file) throw new Error("当前档案没有该科知识地图。");
		const page = file.objectives.filter((objective) => {
			const unitId = file.concepts.find((concept) => concept.id === objective.conceptIds[0])?.unit ?? "";
			if (!taughtUnit(state, subject, unitId)) return false;
			if (unit !== void 0 && unitId !== unit) return false;
			return id === void 0 || objective.id === id;
		}).map((objective) => {
			const elements = objectiveElements(state, objective.id);
			const unitId = file.concepts.find((concept) => concept.id === objective.conceptIds[0])?.unit ?? "";
			return {
				id: objective.id,
				title: objective.title,
				goal: objective.goal,
				method: objective.method,
				unit: unitId,
				errorTypes: elements?.errorTypes ?? [],
				questionPoints: elements?.questionPoints ?? [],
				variationAxes: elements?.variationAxes ?? [],
				misconceptions: elements?.misconceptions ?? [],
				examples: elements?.examples ?? [],
				hintLadder: elements?.hintLadder ?? [
					"",
					"",
					""
				],
				exercises: elements?.exercises ?? [],
				knowledgePoints: file.concepts.filter((concept) => objective.conceptIds.includes(concept.id)).map((concept) => ({
					id: concept.id,
					name: concept.name,
					definition: concept.definition,
					example: concept.example,
					...(concept.ideaIds?.length ?? 0) > 0 ? { ideas: subjectIdeas(subject).filter((idea) => concept.ideaIds?.includes(idea.id)).map((idea) => ({
						id: idea.id,
						name: idea.name,
						definition: idea.definition,
						example: idea.example
					})) } : {},
					...concept.facts !== void 0 ? { facts: concept.facts } : {},
					...concept.misconceptions !== void 0 ? { misconceptions: concept.misconceptions } : {},
					...concept.examples !== void 0 ? { examples: concept.examples } : {}
				}))
			};
		});
		return {
			revision: state.revision,
			subject,
			objectives: page.slice(offset, offset + 20),
			nextOffset: offset + 20 < page.length ? offset + 20 : null,
			more: "Write questions and hints from these elements, reference exercises and the hint ladder; the full rules live in the study skill."
		};
	}
	if (kind === "exercises") {
		const subjects = subject ? [subject] : [
			"chinese",
			"math",
			"english"
		];
		const saved = state.exercises.filter((item) => !subject || item.subject === subject);
		const seen = new Set(saved.map((item) => item.id));
		const shipped = subjects.flatMap((sub) => subjectExercises(sub)).filter((item) => !seen.has(item.id));
		const filtered = [...saved.map((item) => ({
			...item,
			source: "workspace"
		})), ...shipped.map((item) => ({
			...item,
			source: "shipped"
		}))].filter((item) => {
			if (id !== void 0 && item.id !== id && item.objectiveId !== id) return false;
			if (unit !== void 0) {
				if (builtinObjectiveAnywhere(item.objectiveId)?.unit !== unit) return false;
			}
			return true;
		});
		return {
			revision: state.revision,
			total: filtered.length,
			items: filtered.slice(offset, offset + 20),
			nextOffset: offset + 20 < filtered.length ? offset + 20 : null
		};
	}
	if (kind === "review-sheet") {
		if (!subject) throw new Error("巩固卷查询需要指定科目（subject）。");
		return {
			revision: state.revision,
			...reviewPlan(state, subject, now),
			more: "Write one new question per pick and one per objectiveFill; variant distance and reuse limits are schema-enforced and explained in the study skill."
		};
	}
	if (kind === "diagnose") {
		const scope = options.grade !== void 0 || options.term !== void 0 ? {
			grade: options.grade ?? state.profile.grade,
			term: options.term ?? state.profile.term,
			...options.unit !== void 0 ? { units: [options.unit] } : {}
		} : void 0;
		if (scope && !subject) throw new Error("跨年级摸底计划需要指定科目（subject）。");
		const diagnostics = (scope && subject ? [diagnosticFor(state, subject, now, scope)] : studyInsight(state, now).diagnostics).filter((plan) => !subject || plan.subject === subject).map((plan) => ({
			...plan,
			sample: plan.sample.map((sample) => {
				const exercise = exercisesFor(state, sample.id).find((item) => item.role === "diagnose") ?? exercisesFor(state, sample.id)[0];
				return {
					...sample,
					...exercise !== void 0 ? { exercise } : {}
				};
			})
		}));
		return {
			revision: state.revision,
			diagnostics,
			history: checkInHistory(state).filter((item) => !subject || item.subject === subject),
			more: "Ask one short task per sampled objective and record each answer; the study skill describes the flow and intensities, and grade/term narrows the scope."
		};
	}
	if (kind === "weak") {
		const insight = studyInsight(state, now);
		return {
			revision: state.revision,
			...insightSummary(insight),
			weakPoints: insight.weakPoints.map((item) => ({
				id: item.id,
				subject: item.subject,
				title: item.title,
				goal: item.goal,
				level: item.level,
				priority: item.priority,
				reasons: item.reasons
			})),
			practised: insight.objectives.filter((item) => item.attempts > 0 || item.activeMistakes > 0).map((item) => ({
				id: item.id,
				subject: item.subject,
				title: item.title,
				level: item.level,
				independentDays: item.independentDays,
				attempts: item.attempts,
				helpedOrWrong: item.helpedOrWrong,
				activeMistakes: item.activeMistakes,
				dueMistakes: item.dueMistakes
			})),
			more: "Use kind=curriculum with a subject for the map behind these weak points."
		};
	}
	const collections = {
		due: () => state.mistakes.filter((item) => item.dueAt !== void 0 && item.dueAt <= now),
		pending: () => state.mistakes.filter((item) => item.confirmedAt === void 0),
		progress: () => studyStatus(state, now).progress,
		concepts: () => state.concepts,
		objectives: () => state.objectives,
		relations: () => state.relations,
		worksheets: () => state.worksheets.map((sheet) => ({
			...sheet,
			drafts: state.paperDrafts.filter((draft) => draft.worksheetId === sheet.id)
		})),
		"paper-results": () => state.paperResults,
		materials: () => state.materials,
		mistakes: () => state.mistakes,
		sessions: () => state.sessions,
		attempts: () => state.attempts
	};
	const chosen = Object.hasOwn(collections, kind) ? collections[kind] : void 0;
	if (chosen === void 0) throw new Error(`未知的查询类型：${kind}。可用的类型见 study_status 工具说明。`);
	const selected = chosen().filter((item) => {
		if (id && (!("id" in item) || item.id !== id)) return false;
		if (!subject) return true;
		if ("subject" in item) return item.subject === subject;
		if ("fromId" in item) return state.concepts.some((concept) => concept.id === item.fromId && concept.subject === subject);
		if ("worksheetId" in item) return state.worksheets.some((sheet) => sheet.id === item.worksheetId && sheet.subject === subject);
		return true;
	});
	return {
		revision: state.revision,
		total: selected.length,
		items: selected.slice(offset, offset + 20),
		nextOffset: offset + 20 < selected.length ? offset + 20 : null
	};
}
/**
* Compute the next relevant evidence, diagnosis, due-date or Shanghai-day refresh.
* @param state - current normalized display state.
* @param now - explicit query clock.
* @returns the earliest future projection threshold in milliseconds.
*/
function nextRefreshAfter(state, now) {
	const thresholds = [Date.parse(`${studyDay(now)}T00:00:00+08:00`) + 864e5];
	for (const entry of evidenceOf(state).entries) {
		if (entry.answerDate.kind === "unknown") continue;
		const at = entry.answerDate.kind === "instant" ? entry.answerDate.at : Date.parse(`${entry.answerDate.day}T00:00:00+08:00`) + 864e5;
		thresholds.push(at + 864e6 + 1, at + 12096e5 + 1, at + 3024e6);
	}
	for (const mistake of state.mistakes) if (mistake.dueAt !== void 0) thresholds.push(mistake.dueAt);
	for (const block of state.sessions) if (block.mode === "diagnose") thresholds.push(block.startedAt + 12096e5);
	return Math.min(...thresholds.filter((at) => at > now));
}
const dashboardCache = /* @__PURE__ */ new WeakMap();
/**
* Reuse expensive map/mastery projections until an actual file version or time threshold changes.
* @param state - version-cached current state, or undefined before setup.
* @param now - explicit query clock.
* @param options - selected page and scope.
* @param lessons - independently read external-classroom projection.
* @returns current elapsed fields, summary minutes and cached business projections with refreshAfter.
*/
function queryDashboard(state, now, options = {}, lessons) {
	if (!state) return {
		...dashboard(state, now, options, lessons),
		refreshAfter: Date.parse(`${studyDay(now)}T00:00:00+08:00`) + 864e5
	};
	const key = canonical(options);
	const entries = dashboardCache.get(state) ?? /* @__PURE__ */ new Map();
	let cached = entries.get(key);
	if (!cached || now >= cached.refreshAfter || now < cached.value.serverNow) {
		cached = {
			refreshAfter: nextRefreshAfter(state, now),
			value: dashboard(state, now, options, lessons)
		};
		if (entries.size >= 8) entries.clear();
		entries.set(key, cached);
		dashboardCache.set(state, entries);
	}
	const value = cached.value;
	return {
		...value,
		serverNow: now,
		refreshAfter: cached.refreshAfter,
		interactiveLessons: lessons ?? value.interactiveLessons,
		study: value.study ? {
			...value.study,
			...timeStatus(state, now),
			weekly: {
				...value.study.weekly,
				minutesByDay: summaryMinutes(state, now),
				activeDays: summaryMinutes(state, now).filter((item) => item.minutes > 0).length
			}
		} : null
	};
}
//#endregion
export { updateNotices as A, evidenceAtCutoff as B, questionSchema as C, termSettingsSchema as D, responseSourceSchema as E, readLessonFile as F, commandSchema as G, evidenceOf as H, scheduleMistakes as I, stateSchema as K, attachEvidence as L, lessonFileSchema as M, lessonSchema as N, worksheetSchema as O, readInteractiveLessons as P, demonstrablyAfter as R, officialFileSchemas as S, responseSchema as T, canonical as U, evidenceDay as V, archiveTermSchema as W, answerDateSchema as _, projectWorkspace as a, blockSchema as b, backupSchema as c, describeMigration as d, describeRestore as f, validateStudyFiles as g, sourceSha256 as h, queryWorkspace as i, updateStudy as j, migrateStudyFile as k, backupVersions as l, retainObservedBackups as m, queryDashboard as n, readWorkspace as o, readBackups as p, queryStudy as r, applicationStudyFiles as s, nextRefreshAfter as t, describeArchive as u, assessmentSchema as v, questionSourceSchema as w, collectionsSchema as x, assistanceSchema as y, deriveEvidence as z };
