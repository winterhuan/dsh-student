import { z } from "zod";
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
const text$1 = z.string().trim().min(1).max(2e3);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const time = z.number().int().nonnegative();
const subject = z.enum([
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
const scope = z.object({
	region: text$1,
	grade: z.number().int().min(1).max(6),
	term: z.enum(["first", "second"]),
	schoolYear: text$1,
	schoolSystem: z.enum(["five-four", "six-three"])
}).strict();
const profile = scope.extend({
	nickname: text$1,
	schoolAlias: z.string().trim().max(2e3),
	parentConfirmation: text$1.default("家长已确认学习档案")
}).strict();
const material = z.object({
	id,
	subject,
	scope,
	title: text$1,
	publisher: text$1,
	edition: text$1,
	editionStatus: z.enum(["unconfirmed", "identified"]),
	kind: z.enum([
		"official-textbook",
		"school-material",
		"reference",
		"generated"
	]),
	locator: text$1,
	evidence: text$1
}).strict();
const schoolProgress = z.object({
	unitId: id,
	confirmedAt: time,
	posture: z.enum(["keep-up", "catch-up"]),
	preview: z.boolean(),
	pace: z.enum(["teaching", "review"])
}).strict();
const courseInput = z.object({
	subject,
	materialId: id,
	unit: text$1,
	parentConfirmation: text$1.default("家长已确认教材与当前单元")
}).strict();
const course = courseInput.extend({ progress: schoolProgress.optional() }).strict();
const mistake = z.object({
	id,
	subject,
	topic: text$1,
	prompt: text$1,
	learnerAnswer: text$1,
	correction: text$1,
	explanation: text$1,
	answerEvidence: text$1,
	imagePath: text$1.optional(),
	uncertainties: z.string().max(2e3),
	materialId: id.optional(),
	objectiveId: id.optional(),
	errorType: errorTypeSchema.optional()
}).strict();
const concept = z.object({
	id,
	subject,
	name: text$1,
	definition: text$1,
	example: text$1,
	source: text$1,
	facts: z.array(stepText).min(2).max(8).optional(),
	misconceptions: z.array(text$1).max(3).optional()
}).strict();
const objective = z.object({
	id,
	subject,
	title: text$1,
	goal: text$1,
	conceptIds: z.array(id).min(1).max(5),
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
	questionPoints: z.array(text$1).max(4).optional(),
	variationAxes: z.array(variationAxisSchema).max(4).optional()
}).strict();
const relation = z.object({
	id,
	fromId: id,
	toId: id,
	kind: z.enum([
		"prerequisite",
		"part-of",
		"contrast",
		"explains",
		"cause-effect"
	]),
	explanation: text$1,
	source: text$1
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
const figure = z.discriminatedUnion("kind", [
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
/** One structured exercise item shared by the shipped exercise bank and the workspace collection. */
const exerciseItemSchema = z.object({
	id,
	subject,
	objectiveId: id,
	role: exerciseRoleSchema,
	variant: variantSchema,
	prompt: text$1,
	choices: z.array(text$1).min(2).max(4).optional(),
	figure: figure.optional(),
	steps: z.array(stepText).min(2).max(4),
	answer: text$1,
	explanation: text$1,
	answerEvidence: text$1,
	errorType: errorTypeSchema.optional()
}).strict();
const workspaceExerciseInput = z.object({
	id,
	subject,
	objectiveId: id,
	role: exerciseRoleSchema.default("try"),
	variant: variantSchema.default("numeric"),
	prompt: text$1,
	choices: z.array(text$1).min(2).max(4).optional(),
	figure: figure.optional(),
	steps: z.array(stepText).min(2).max(4),
	answer: text$1,
	explanation: text$1,
	answerEvidence: text$1,
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
	"worked-example"
]);
const attemptBody = {
	id,
	sessionId: id,
	subject,
	topic: text$1,
	prompt: text$1,
	response: text$1,
	feedback: text$1,
	answerEvidence: text$1,
	mistakeId: id.optional(),
	objectiveId: id.optional(),
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
	id,
	sessionId: id,
	subject,
	topic: text$1,
	prompt: text$1,
	choices: z.array(text$1).min(2).max(4).optional(),
	steps: z.array(stepText).min(2).max(5).optional(),
	phase: phaseSchema.optional(),
	variant: variantSchema.optional(),
	mistakeId: id.optional(),
	objectiveId: id.optional(),
	figure: figure.optional()
}).strict();
const answerSpace = z.enum([
	"none",
	"line",
	"lines",
	"box"
]);
const worksheetItem = z.object({
	id,
	objectiveId: id.optional(),
	mistakeId: id.optional(),
	variant: variantSchema.optional(),
	prompt: text$1,
	figure: figure.optional(),
	space: answerSpace.optional(),
	answer: text$1,
	explanation: text$1,
	answerEvidence: text$1
}).strict();
const worksheet = z.object({
	id,
	subject,
	kind: sheetKindSchema.optional(),
	objectiveId: id.optional(),
	items: z.array(worksheetItem).min(1).max(8)
}).strict();
const result = z.enum([
	"correct",
	"partial",
	"incorrect",
	"unassessed"
]);
const paperResult = z.object({
	worksheetId: id,
	itemId: id,
	response: text$1,
	result,
	assistance,
	feedback: text$1,
	answerEvidence: text$1,
	userConfirmation: text$1.default("家长在面板批改")
}).strict();
const paperDraft = z.object({
	worksheetId: id,
	itemId: id,
	response: text$1,
	result,
	assistance,
	uncertainties: z.string().max(2e3),
	errorType: errorTypeSchema.optional(),
	confidence: z.enum(["high", "low"]).optional()
}).strict();
const gradeSheet = z.object({
	worksheetId: id,
	results: z.array(z.object({
		itemId: id,
		result: z.enum([
			"correct",
			"partial",
			"incorrect"
		]),
		response: text$1.optional(),
		assistance: assistance.optional(),
		errorType: errorTypeSchema.optional()
	}).strict()).min(1).max(8),
	userConfirmation: text$1.default("家长在面板批改")
}).strict();
const workbookOutcome = z.enum([
	"stuck",
	"hinted",
	"independent-wrong",
	"independent-correct"
]);
const workbookDraft = z.object({
	id,
	subject,
	prompt: text$1,
	response: text$1.optional(),
	outcome: workbookOutcome,
	objectiveId: id.optional(),
	uncertainties: z.string().max(2e3),
	imagePath: text$1.optional()
}).strict();
const teachingItem = z.object({
	id,
	subject,
	prompt: text$1,
	objectiveId: id.optional(),
	confirmedAt: time,
	sourceDraftId: id.optional()
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
		id,
		subject,
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
			units: z.array(id).max(20).optional(),
			objectiveIds: z.array(id).max(60).optional()
		}).strict().optional()
	}).strict(),
	z.object({
		action: z.literal("task"),
		task
	}).strict(),
	z.object({
		action: z.literal("answer"),
		taskId: id,
		response: text$1
	}).strict(),
	z.object({
		action: z.literal("hint"),
		taskId: id
	}).strict(),
	z.object({
		action: z.literal("configure-course"),
		material,
		course: courseInput
	}).strict(),
	z.object({
		action: z.literal("school-progress"),
		subject,
		unitId: id,
		posture: z.enum(["keep-up", "catch-up"]),
		preview: z.enum(["on", "off"]),
		pace: z.enum(["teaching", "review"]),
		parentConfirmation: text$1.default("家长确认学校进度")
	}).strict(),
	z.object({
		action: z.literal("record"),
		attempt: recordAttempt
	}).strict(),
	z.object({
		action: z.literal("stuck"),
		taskId: id
	}).strict(),
	z.object({
		action: z.literal("stop"),
		sessionId: id,
		reflection: z.string().max(2e3)
	}).strict(),
	z.object({
		action: z.literal("mistake"),
		mistake
	}).strict(),
	z.object({
		action: z.literal("confirm-mistake"),
		id,
		subject: subject.optional(),
		topic: text$1.optional(),
		objectiveId: z.union([id, z.literal("")]).optional(),
		prompt: text$1,
		learnerAnswer: text$1.optional(),
		correction: text$1,
		explanation: text$1,
		answerEvidence: text$1,
		errorType: errorTypeSchema.optional(),
		userConfirmation: text$1.default("家长已核对错题与订正")
	}).strict(),
	z.object({
		action: z.literal("delete-mistake"),
		id
	}).strict(),
	z.object({
		action: z.literal("save-exercise"),
		exercise: workspaceExerciseInput
	}).strict(),
	z.object({
		action: z.literal("delete-exercise"),
		id
	}).strict(),
	z.object({
		action: z.literal("concept"),
		concept
	}).strict(),
	z.object({
		action: z.literal("confirm-concept"),
		id,
		definition: text$1.optional(),
		example: text$1.optional(),
		source: text$1.optional(),
		userConfirmation: text$1.default("家长已核对概念")
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
		mistakeId: id,
		objectiveId: id
	}).strict(),
	z.object({
		action: z.literal("classify-mistake"),
		mistakeId: id,
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
		worksheetId: id,
		results: z.array(z.object({
			itemId: id,
			result: z.enum([
				"correct",
				"partial",
				"incorrect"
			]),
			response: text$1.optional(),
			assistance: assistance.optional(),
			errorType: errorTypeSchema.optional()
		}).strict()).min(1).max(8),
		userConfirmation: text$1.default("家长已核对转录结果")
	}).strict(),
	z.object({
		action: z.literal("discard-sheet"),
		worksheetId: id
	}).strict(),
	z.object({
		action: z.literal("workbook-draft"),
		draft: workbookDraft
	}).strict(),
	z.object({
		action: z.literal("confirm-workbook"),
		id,
		outcome: workbookOutcome.optional(),
		objectiveId: z.union([id, z.literal("")]).optional(),
		correction: text$1.optional(),
		explanation: text$1.optional(),
		answerEvidence: text$1.optional(),
		userConfirmation: text$1.default("家长已核对练习册题目")
	}).strict(),
	z.object({
		action: z.literal("dismiss-teaching"),
		id
	}).strict(),
	z.object({
		action: z.literal("archive-term"),
		parentConfirmation: text$1.default("家长确认归档本学期")
	}).strict(),
	z.object({
		action: z.literal("openmaic-settings"),
		baseUrl: z.string().trim().max(200),
		parentConfirmation: text$1.default("家长确认 OpenMAIC 地址")
	}).strict(),
	z.object({
		action: z.literal("interests"),
		tags: z.array(z.string().trim().regex(INTEREST_TAG)).min(3).max(8),
		parentConfirmation: text$1.default("家长确认兴趣标签")
	}).strict()
]);
/** One learner and term per workspace; previous materials and attempts are retained. */
const stateSchema = z.object({
	format: z.literal(1),
	revision: time,
	updatedAt: time,
	profile,
	/** Set by archive-term; a state file carrying it reads as absent so a new term can be set up. */
	archivedAt: time.optional(),
	materials: z.array(material).max(500),
	courses: z.array(course).max(3),
	sessions: z.array(z.object({
		id,
		subject,
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
		startedAt: time,
		endedAt: time.optional(),
		spentMs: time.optional(),
		materialId: id.optional(),
		unit: text$1.optional(),
		reflection: z.string().max(2e3).optional(),
		scope: z.object({
			grade: z.number().int().min(1).max(6),
			term: z.enum(["first", "second"]),
			units: z.array(id).max(20).optional(),
			objectiveIds: z.array(id).max(60).optional()
		}).strict().optional()
	}).strict()).max(5e3),
	attempts: z.array(attempt.extend({
		at: time,
		materialId: id.optional(),
		rawResponse: text$1.optional()
	}).strict()).max(2e4),
	mistakes: z.array(mistake.extend({
		confirmedAt: time.optional(),
		userConfirmation: text$1.optional(),
		dueAt: time.optional(),
		source: z.object({
			worksheetId: id,
			itemId: id
		}).strict().optional(),
		independentDays: z.array(z.string()).default([]),
		stage: z.number().int().min(0).max(4).default(0)
	}).strict()).max(5e3),
	exercises: z.array(exerciseItemSchema.extend({ savedAt: time.optional() }).strict()).max(1e3).default([]),
	concepts: z.array(concept.extend({
		confirmedAt: time.optional(),
		userConfirmation: text$1.optional()
	}).strict()).max(1e3).default([]),
	objectives: z.array(objective).max(1e3).default([]),
	relations: z.array(relation).max(2e3).default([]),
	worksheets: z.array(worksheet.extend({
		createdAt: time,
		discardedAt: time.optional()
	}).strict()).max(500).default([]),
	paperResults: z.array(paperResult.extend({ receivedAt: time }).strict()).max(4e3).default([]),
	paperDrafts: z.array(paperDraft.extend({ receivedAt: time }).strict()).max(500).default([]),
	workbookDrafts: z.array(workbookDraft.extend({ receivedAt: time }).strict()).max(500).default([]),
	teachingQueue: z.array(teachingItem).max(500).default([]),
	/** Parent override for the OpenMAIC origin. Absent means the environment or the localhost default. */
	openmaic: z.object({
		baseUrl: z.string().trim().min(1).max(200),
		parentConfirmation: text$1
	}).strict().optional(),
	/** Parent theme tags. Absent profiles still read the example list; facts stay on the knowledge map. */
	interests: z.object({
		tags: z.array(z.string().trim().regex(INTEREST_TAG)).min(3).max(8),
		parentConfirmation: text$1
	}).strict().optional(),
	rewards: z.array(z.object({
		day: z.string(),
		reason: z.enum(["participation", "reflection"])
	}).strict()).max(1e3),
	task: task.extend({
		response: text$1.optional(),
		rawResponse: text$1.optional(),
		answeredAt: time.optional(),
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
const text = z.string().trim().min(1).max(2e3);
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
	name: text,
	definition: text,
	example: text
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
	title: text,
	basis: text,
	units: z.array(z.object({
		id: recordId,
		name: text,
		summary: text,
		focus: unitFocusSchema.optional()
	}).strict()).min(1).max(20),
	concepts: z.array(z.object({
		id: recordId,
		name: text,
		unit: recordId,
		definition: text,
		example: text,
		source: text,
		ideaIds: z.array(recordId).max(6).optional(),
		facts: z.array(fact).min(2).max(8).optional(),
		misconceptions: z.array(text).max(3).optional(),
		examples: z.array(text).max(3).optional()
	}).strict()).min(1).max(80),
	objectives: z.array(z.object({
		id: recordId,
		title: text,
		goal: text,
		conceptIds: z.array(recordId).min(1).max(5),
		method: methodSchema,
		errorTypes: z.array(errorTypeSchema).max(4).optional(),
		questionPoints: z.array(text).max(4).optional(),
		variationAxes: z.array(variationAxisSchema).max(4).optional()
	}).strict()).min(1).max(60),
	relations: z.array(z.object({
		id: recordId,
		fromId: recordId,
		toId: recordId,
		kind: relationKindSchema,
		explanation: text,
		source: text
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
	return state.sessions.filter((session) => studyDay(session.startedAt) === studyDay(now)).reduce((sum, session) => sum + spent(session, now), 0);
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
//#region lib/types/learning/schedule.js
/** Spaced-repetition intervals in days for stages 1..4 (1d / 7d / 16d / 35d forgetting curve). */
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
* Replay every confirmed mistake's review evidence: answers that cite it and paper results on items that cite it.
* A mistake is due from the calendar day after confirmation or after the last wrong answer, not at a clock time.
* Wrong, partial or helped answers keep the stage and only make it due again the next day. An independent correct
* answer on any day, earlier than the due day included, advances it at most once per day; the next due day counts
* from that answer along the 1 / 7 / 16 / 35-day curve.
* Stage 4 (a 35-day interval) is consolidated.
*/
function scheduleMistakes(state) {
	const evidence = /* @__PURE__ */ new Map();
	const add = (mistakeId, at, result, assistance) => {
		if (!mistakeId) return;
		evidence.set(mistakeId, [...evidence.get(mistakeId) ?? [], {
			at,
			result,
			assistance
		}]);
	};
	for (const attempt of state.attempts) add(attempt.mistakeId, attempt.at, attempt.result, attempt.assistance);
	const sheets = new Map(state.worksheets.map((sheet) => [sheet.id, sheet]));
	for (const result of state.paperResults) add(sheets.get(result.worksheetId)?.items.find((item) => item.id === result.itemId)?.mistakeId, result.receivedAt, result.result, result.assistance);
	for (const mistake of state.mistakes) {
		if (mistake.confirmedAt === void 0) continue;
		const confirmedAt = mistake.confirmedAt;
		let stage = 0;
		let days = [];
		let wrongs = 0;
		let due = studyDay(confirmedAt + DAY);
		for (const item of (evidence.get(mistake.id) ?? []).filter((entry) => entry.at >= confirmedAt).sort((a, b) => a.at - b.at)) {
			if (item.result === "unassessed" || item.result === "stuck") continue;
			const day = studyDay(item.at);
			if (item.result !== "correct" || item.assistance !== "independent") {
				wrongs += 1;
				due = studyDay(item.at + (wrongs >= 2 ? 2 : 1) * DAY);
				continue;
			}
			if (days.includes(day)) continue;
			days = [...days, day];
			stage = Math.min(4, stage + 1);
			due = studyDay(item.at + (REVIEW_DAYS[stage - 1] ?? 1) * DAY);
		}
		mistake.stage = stage;
		mistake.independentDays = days;
		mistake.dueAt = dayStart(due);
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
function outcomeIndex(state) {
	const index = /* @__PURE__ */ new Map();
	const add = (objectiveId, outcome) => {
		if (objectiveId === void 0) return;
		index.set(objectiveId, [...index.get(objectiveId) ?? [], outcome]);
	};
	const mistakeObjective = new Map(state.mistakes.map((mistake) => [mistake.id, mistake.objectiveId]));
	const worksheetObjective = /* @__PURE__ */ new Map();
	for (const sheet of state.worksheets) for (const item of sheet.items) {
		const goal = item.objectiveId ?? (item.mistakeId !== void 0 ? mistakeObjective.get(item.mistakeId) : void 0) ?? sheet.objectiveId;
		if (goal !== void 0) worksheetObjective.set(`${sheet.id}:${item.id}`, goal);
	}
	for (const attempt of state.attempts) add(attempt.objectiveId, {
		at: attempt.at,
		result: attempt.result,
		assistance: attempt.assistance
	});
	for (const result of state.paperResults) add(worksheetObjective.get(`${result.worksheetId}:${result.itemId}`), {
		at: result.receivedAt,
		result: result.result,
		assistance: result.assistance
	});
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
	if (latestStuck !== void 0 && !outcomes.some((item) => item.at > latestStuck && item.result === "correct" && item.assistance === "independent")) return true;
	if (!outcomes.some((item) => item.result === "correct" && item.assistance === "independent") && outcomes.some((item) => item.result === "correct" && item.assistance !== "independent")) return true;
	return queue.some((item) => !outcomes.some((outcome) => outcome.at >= item.confirmedAt && outcome.result === "correct" && outcome.assistance === "independent"));
}
/**
* One objective's mastery derived from its outcome evidence, its confirmed mistakes and the teaching queue.
* One rule serves the current-term insight and every cross-grade check-in plan; an objective never
* independently answered that was recently wrong counts as weak, and a recurring error cause raises priority.
*/
function masteryOf(state, base, outcomes, now) {
	const independentDays = new Set(outcomes.filter((item) => item.result === "correct" && item.assistance === "independent").map((item) => studyDay(item.at)));
	const lastAt = outcomes.reduce((latest, item) => latest === void 0 || item.at > latest ? item.at : latest, void 0);
	const helpedOrWrong = outcomes.filter((item) => item.at >= now - 12096e5 && (item.result === "incorrect" || item.result === "partial" || item.result === "correct" && item.assistance !== "independent")).length;
	const wrongRecent = outcomes.filter((item) => item.at >= now - 12096e5 && (item.result === "incorrect" || item.result === "partial")).length;
	const mistakes = state.mistakes.filter((item) => item.objectiveId === base.id && item.confirmedAt !== void 0);
	const dueMistakes = mistakes.filter((item) => item.dueAt !== void 0 && item.dueAt <= now).length;
	const activeMistakes = mistakes.filter((item) => item.stage < 4).length;
	const causeCounts = /* @__PURE__ */ new Map();
	for (const mistake of mistakes) if (mistake.errorType !== void 0) causeCounts.set(mistake.errorType, (causeCounts.get(mistake.errorType) ?? 0) + 1);
	const errorTypes = [...causeCounts.entries()].map(([type, count]) => ({
		type,
		count
	})).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)).slice(0, 5);
	const recurringTypes = [...causeCounts.values()].filter((count) => count >= 2).length;
	const teaching = teachingNeeded(outcomes, state.teachingQueue.filter((item) => item.objectiveId === base.id));
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
	return {
		...base,
		level,
		independentDays: independentDays.size,
		attempts: outcomes.length,
		helpedOrWrong,
		...lastAt !== void 0 ? { lastAt } : {},
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
	const outcomes = outcomeIndex(state);
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
		const recheck = pool.filter((item) => item.level === "mastered" && item.lastAt !== void 0 && now - item.lastAt >= RECHECK_AFTER);
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
		const practised = objectives.filter((candidate) => candidate.lastAt !== void 0).sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0))[0];
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
		const outcomes = outcomeIndex(state);
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
	const recheck = pool.filter((item) => item.level === "mastered" && item.lastAt !== void 0 && now - item.lastAt >= RECHECK_AFTER);
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
/** The goal a worksheet question tests: its own, then its source mistake's, then the sheet's. */
function itemObjectiveId(state, worksheet, item) {
	return item.objectiveId ?? (item.mistakeId ? state.mistakes.find((mistake) => mistake.id === item.mistakeId)?.objectiveId : void 0) ?? worksheet.objectiveId;
}
function questionObjectiveId(state, worksheet, itemId) {
	const item = worksheet.items.find((question) => question.id === itemId);
	return item ? itemObjectiveId(state, worksheet, item) : void 0;
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
	const demoNote = task.phase === "demo" && task.response === void 0;
	if (!demoNote && task.response === void 0) throw new Error(`请先用 answer 保存原始回答，再记录反馈。当前题目 id：${task.id}。`);
	const problems = [];
	if (attempt.id !== task.id) problems.push(`id 不一致。期望：${showValue(task.id)}。收到：${showValue(attempt.id)}。`);
	if (foldText(attempt.topic) !== foldText(task.topic)) problems.push(`topic 不一致。期望：${showValue(task.topic)}。收到：${showValue(attempt.topic)}。`);
	if (foldText(attempt.prompt) !== foldText(task.prompt)) problems.push(`prompt 不一致。期望：${showValue(task.prompt)}。收到：${showValue(attempt.prompt)}。`);
	if (!demoNote && !sameSavedAnswer(task, attempt.response)) {
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
		response: demoNote ? attempt.response : task.response ?? attempt.response,
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
	const index = state.paperResults.findIndex((result) => result.worksheetId === worksheet.id && result.itemId === item.id);
	const previous = state.paperResults[index];
	if (previous) {
		const { receivedAt: _before, ...stored } = previous;
		const { receivedAt: _now, ...next } = entry;
		if (canonical(stored) === canonical(next)) return false;
		state.paperResults.splice(index, 1);
	}
	state.paperResults.push(previous ? {
		...entry,
		receivedAt: previous.receivedAt
	} : entry);
	const linked = item.mistakeId ? state.mistakes.find((mistake) => mistake.id === item.mistakeId) : void 0;
	const fromHere = linked?.source !== void 0 && linked.source.worksheetId === worksheet.id && linked.source.itemId === item.id;
	const wrong = entry.result === "incorrect" || entry.result === "partial";
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
//#region lib/types/openmaic.js
/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
const DEFAULT_OPENMAIC_BASE = "http://localhost:3000";
/** Lesson log written by the tutor shell. It is not learning evidence and is not inside state.json. */
const OPENMAIC_LESSONS_PATH = ".study/openmaic-lessons.json";
/** Cookie jar shared by generate, poll, retry and stage reads. Never copy it into chat or state. */
const OPENMAIC_COOKIE_PATH = ".study/openmaic-cookies.txt";
const LESSONS_MAX_BYTES = 524288;
const LESSONS_SHOWN = 20;
const stamp = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u);
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
}).strict();
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
* Parse the tutor-written lesson log. Invalid rows are dropped so one bad write does not hide the rest.
* @param text - UTF-8 contents of `.study/openmaic-lessons.json`.
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
	const file = z.object({
		format: z.literal(1),
		lessons: z.array(z.unknown()).max(80)
	}).strict().safeParse(parsed);
	if (!file.success) return {
		lessons: [],
		error: "互动课记录格式无法读取"
	};
	const lessons = [];
	let dropped = 0;
	for (const item of file.data.lessons) {
		const lesson = lessonSchema.safeParse(item);
		if (lesson.success) lessons.push(lesson.data);
		else dropped += 1;
	}
	lessons.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
	const shown = lessons.slice(0, LESSONS_SHOWN);
	return dropped > 0 ? {
		lessons: shown,
		error: "有几条互动课记录无法读取，其余仍显示"
	} : { lessons: shown };
}
/**
* Read the lesson log from the session workspace.
* A missing file is an empty list. A bad file sets `error` and does not fail the workspace request.
* The file is not cached: the tutor rewrites it without bumping the study revision, and the desk poll must see that write.
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
		const stat = await fs.stat(target, signal);
		if (!stat) return empty;
		if (stat.type !== "file") return {
			...empty,
			error: "互动课记录必须是普通文件"
		};
		const bytes = await fs.readBytes(target, signal, LESSONS_MAX_BYTES);
		const parsed = parseInteractiveLessons(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
		return parsed.error !== void 0 ? interactiveLessonsView(savedBase, parsed.lessons, parsed.error) : interactiveLessonsView(savedBase, parsed.lessons);
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
/** Save a material and its course atomically under one revision. */
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
	return stateSchema.parse({
		...withCourse,
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
	if (state.task?.id === command.task.id && state.task.sessionId === command.task.sessionId) {
		const { response: _response, rawResponse: _raw, answeredAt: _answeredAt, hintLevel: _hint, stuck: _stuck, ...stored } = state.task;
		requireValue(canonical(stored) === canonical(command.task), "这个学习段里的题目编号已用于另一道题。");
		return previous;
	}
	requireValue(!state.attempts.some((item) => item.id === command.task.id && item.sessionId === command.task.sessionId), "这个学习段里的题目编号已使用。下一段学习可以再用同一个编号。");
	requireValue(!state.task || state.task.sessionId !== active.id || state.task.response === void 0 || state.attempts.some((item) => item.id === state.task?.id), "请先完成当前已作答题目的反馈。");
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
	requireValue(!state.attempts.some((item) => item.id === task.id), "这道题已记录反馈。");
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
/** Learning methods each subject allows for custom objectives; mirrors the shipped maps. */
const subjectMethods = {
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
	requireValue(subjectMethods[command.objective.subject].some((method) => method === command.objective.method), "学习方法与科目不符。");
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
	const sheet = command.worksheet;
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
		const assistance = entry.assistance ?? "independent";
		const response = entry.response ?? before?.response ?? "（家长在面板批改，未转录原答案）";
		if (before && before.result === entry.result && before.assistance === assistance && before.response === response) continue;
		gradeItem(state, worksheet, item, {
			worksheetId: worksheet.id,
			itemId: item.id,
			response,
			result: entry.result,
			assistance,
			feedback: "家长批改",
			answerEvidence: item.answerEvidence,
			userConfirmation: grade.userConfirmation,
			receivedAt: now
		}, entry.result !== "correct" ? entry.errorType : void 0);
		changed = true;
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
		if (!(before !== void 0 && before.result === entry.result && before.assistance === assistance && before.response === response)) {
			gradeItem(state, worksheet, item, {
				worksheetId: worksheet.id,
				itemId: item.id,
				response,
				result: entry.result,
				assistance,
				feedback: "家长核对照片转录",
				answerEvidence: item.answerEvidence,
				userConfirmation: command.userConfirmation,
				receivedAt: draft?.receivedAt ?? now
			}, errorType);
			changed = true;
		}
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
/** Route a confirmed workbook draft to teaching, mistakes or nothing. */
function applyConfirmWorkbook(ctx) {
	const { command, previous, state, now } = ctx;
	const draft = state.workbookDrafts.find((item) => item.id === command.id);
	if (!draft) return previous;
	const outcome = command.outcome ?? draft.outcome;
	const objectiveId = command.objectiveId === "" ? void 0 : command.objectiveId ?? draft.objectiveId;
	if (objectiveId) requireValue(objectiveOf(state, objectiveId)?.subject === draft.subject, "学习目标不存在或科目不符。");
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
	const state = structuredClone(previous);
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
	if (result !== state) return result;
	state.revision += 1;
	state.updatedAt = now;
	return scheduleMistakes(stateSchema.parse(state));
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
		if (result === "correct" && assistance === "independent" && !item.independentDays.includes(studyDay(at))) item.independentDays.push(studyDay(at));
		progress.set(key, item);
	}
	for (const attempt of state.attempts) includeEvidence(attempt.subject, attempt.topic, attempt.at, attempt.result, attempt.assistance, attempt.materialId, attempt.objectiveId);
	for (const result of state.paperResults) {
		const worksheet = state.worksheets.find((item) => item.id === result.worksheetId);
		const objectiveId = worksheet ? questionObjectiveId(state, worksheet, result.itemId) : void 0;
		const objective = objectiveId ? objectiveInfo(state, objectiveId) : void 0;
		if (worksheet && objective && objectiveId) includeEvidence(worksheet.subject, objective.title, result.receivedAt, result.result, result.assistance, void 0, objectiveId);
	}
	const interests = interestTagsOf(state.interests?.tags);
	return {
		task: state.task ?? null,
		feedback: state.task ? state.attempts.find((item) => item.id === state.task?.id) ?? null : null,
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
	const minutesByDay = days.map((day) => ({
		day,
		minutes: Math.round(state.sessions.filter((session) => studyDay(session.startedAt) === day).reduce((sum, session) => sum + (session.spentMs ?? Math.max(0, (session.endedAt ?? now) - session.startedAt)), 0) / 6e4)
	}));
	const windowStart = now - 7 * DAY;
	const outcomesByGoal = /* @__PURE__ */ new Map();
	const add = (key, outcome) => {
		if (key !== void 0) outcomesByGoal.set(key, [...outcomesByGoal.get(key) ?? [], outcome]);
	};
	for (const attempt of state.attempts) add(attempt.objectiveId, {
		at: attempt.at,
		result: attempt.result,
		assistance: attempt.assistance
	});
	for (const result of state.paperResults) {
		const sheet = state.worksheets.find((item) => item.id === result.worksheetId);
		const item = sheet?.items.find((candidate) => candidate.id === result.itemId);
		add(item?.objectiveId ?? (item?.mistakeId !== void 0 ? state.mistakes.find((mistake) => mistake.id === item.mistakeId)?.objectiveId : void 0) ?? sheet?.objectiveId, {
			at: result.receivedAt,
			result: result.result,
			assistance: result.assistance
		});
	}
	let practisedGoals = 0;
	let masteredGoals = 0;
	for (const goal of insight.objectives) {
		const history = outcomesByGoal.get(goal.id) ?? [];
		if (!history.some((item) => item.at >= windowStart)) continue;
		practisedGoals += 1;
		const independentDays = new Set(history.filter((item) => item.at >= windowStart && item.result === "correct" && item.assistance === "independent").map((item) => studyDay(item.at)));
		if (goal.independentDays >= 3 && independentDays.size > 0) masteredGoals += 1;
	}
	const newMistakes = state.mistakes.filter((mistake) => mistake.confirmedAt !== void 0 && mistake.confirmedAt >= windowStart).length;
	const consolidatedMistakes = state.mistakes.filter((mistake) => mistake.stage >= 4 && mistake.independentDays.at(-1) !== void 0 && daySet.has(mistake.independentDays.at(-1) ?? "")).length;
	const dueInWindow = state.mistakes.filter((mistake) => mistake.confirmedAt !== void 0 && mistake.dueAt !== void 0 && mistake.dueAt >= windowStart && mistake.dueAt <= now);
	const dueCompletion = {
		done: dueInWindow.filter((mistake) => state.attempts.some((attempt) => attempt.mistakeId === mistake.id && attempt.at >= (mistake.dueAt ?? 0)) || state.paperResults.some((result) => result.receivedAt >= (mistake.dueAt ?? 0) && state.worksheets.some((sheet) => sheet.id === result.worksheetId && sheet.items.some((item) => item.id === result.itemId && item.mistakeId === mistake.id)))).length,
		total: dueInWindow.length
	};
	const causeCounts = /* @__PURE__ */ new Map();
	for (const mistake of state.mistakes) {
		if (mistake.confirmedAt === void 0 || mistake.confirmedAt < windowStart || mistake.errorType === void 0) continue;
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
		newMistakes,
		consolidatedMistakes,
		dueCompletion,
		errorCauses,
		suggestion: insight.recommendation
	};
}
//#endregion
//#region lib/types/store.js
const MAX_BYTES = 8388608;
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
/**
* Read or update .study/state.json in the calling Session's filesystem.
* Reads preserve absence; writes require the observed version and current sandbox policy.
* A competing writer causes an error, never an automatic replay of learning evidence.
* Parsed states are cached per observed file version, so unchanged reads skip re-reading
* and re-validating the file; any write or external change drops the cache entry.
*/
const stateCache = /* @__PURE__ */ new Map();
async function studyStore(exec, command, expectedRevision) {
	const agent = exec.agent;
	if (!agent?.session.header.cwd) throw new Error("请先在 DSH 中打开学习工作区。");
	exec.signal.throwIfAborted();
	const fs = agent.ctx.get("fs");
	const policy = agent.ctx.get("sandboxPolicy");
	if (!fs || !policy) throw new Error("学生插件需要 DSH 文件系统和沙箱策略服务。");
	const cwd = agent.session.header.cwd;
	const root = await fs.resolve(cwd, { signal: exec.signal });
	const target = await fs.resolve(".study/state.json", {
		cwd,
		signal: exec.signal
	});
	if (!fs.contains(root, target)) throw new Error("学习档案必须位于当前工作区内。");
	const before = await fs.stat(target, exec.signal);
	let state;
	if (before) {
		if (before.type !== "file") throw new Error(".study/state.json 必须是普通文件。");
		const cached = stateCache.get(target);
		if (cached && cached.version === before.version) state = cached.state;
		else {
			const bytes = await fs.readBytes(target, exec.signal, MAX_BYTES);
			const after = await fs.stat(target, exec.signal);
			if (after?.version !== before.version) throw new Error("学习档案已更新，请查询最新状态后重试。");
			const parsed = stateSchema.parse(migrateStudyFile(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes))));
			state = parsed.archivedAt !== void 0 ? void 0 : scheduleMistakes(parsed);
			if (state !== void 0) {
				if (stateCache.size >= 8) stateCache.clear();
				stateCache.set(target, {
					version: after?.version ?? before.version,
					state
				});
			}
		}
	}
	if (command === void 0) return state;
	if (archiveTermSchema.safeParse(command).success) {
		if (!state) throw new Error("请先建立学习档案，再归档学期。");
		const name = `.study/archive-${state.profile.schoolYear.replace(/[^a-zA-Z0-9_-]/gu, "-")}-${state.profile.term}.json`;
		const archiveTarget = await fs.resolve(name, {
			cwd,
			signal: exec.signal
		});
		if (!fs.contains(root, archiveTarget)) throw new Error("归档文件必须位于当前工作区内。");
		if (await fs.stat(archiveTarget, exec.signal)) throw new Error(`归档文件已存在：${name}。请先移走旧归档再归档本学期。`);
		await fs.writeText(archiveTarget, `${JSON.stringify(state, null, 2)}\n`, { kind: "createIfAbsent" }, exec.signal, policy.resolve({ session: agent.session }));
	}
	if (expectedRevision !== void 0 && expectedRevision !== (state?.revision ?? 0)) throw new StudyConflict();
	const next = updateStudy(state, command, Date.now());
	if (next === state) return state;
	const stored = {
		...next,
		mistakes: next.mistakes.map(({ stage: _stage, independentDays: _days, dueAt: _due, ...mistake }) => mistake)
	};
	const content = `${JSON.stringify(stored, null, 2)}\n`;
	if (Buffer.byteLength(content) > MAX_BYTES) throw new Error("本学期学习档案已达到 8 MiB 限制，请备份并使用新工作区。");
	await fs.writeText(target, content, before ? {
		kind: "replaceIfVersion",
		version: before.version
	} : { kind: "createIfAbsent" }, exec.signal, policy.resolve({ session: agent.session }));
	stateCache.delete(target);
	return next;
}
/**
* Bounded history and status queries. Offset pagination applies to every collection.
* @param state - current durable learning state, or undefined before setup.
* @param kind - record collection or projection to read.
* @param offset - zero-based collection offset.
* @param options - optional exact record ID, subject and unit filters, grade/term for browsing another knowledge map or a cross-grade check-in plan.
* @returns the projection or one page of records.
*/
function queryStudy(state, kind, offset, options = {}) {
	if (!state) return {
		phase: "setup-required",
		path: ".study/state.json"
	};
	const { id, subject, unit } = options;
	const now = Date.now();
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
		due: state.mistakes.filter((item) => item.dueAt !== void 0 && item.dueAt <= now),
		pending: state.mistakes.filter((item) => item.confirmedAt === void 0),
		progress: studyStatus(state, now).progress,
		concepts: state.concepts,
		objectives: state.objectives,
		relations: state.relations,
		worksheets: state.worksheets.map((sheet) => ({
			...sheet,
			drafts: state.paperDrafts.filter((draft) => draft.worksheetId === sheet.id)
		})),
		"paper-results": state.paperResults,
		materials: state.materials,
		mistakes: state.mistakes,
		sessions: state.sessions,
		attempts: state.attempts
	};
	const chosen = Object.hasOwn(collections, kind) ? collections[kind] : void 0;
	if (chosen === void 0) throw new Error(`未知的查询类型：${kind}。可用的类型见 study_status 工具说明。`);
	const selected = chosen.filter((item) => {
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
/** A stale sidebar must reload before it can change learning evidence. */
var StudyConflict = class extends Error {
	constructor() {
		super("学习档案已更新，请刷新后核对再保存。");
	}
};
//#endregion
export { insightSummary as _, timeStatus as a, interactiveLessonsView as c, curriculumView as d, itemObjectiveId as f, diagnosticFor as g, sheetOpen as h, studyStatus as i, readInteractiveLessons as l, reviewPlan as m, queryStudy as n, weeklySummary as o, objectiveInfo as p, studyStore as r, updateNotices as s, StudyConflict as t, checkInHistory as u, studyInsight as v, commandSchema as y };
