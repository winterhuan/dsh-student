import { a as projectWorkspace, c as sheetOpen, d as attachEvidence, g as evidenceOf, l as dayStart, o as itemObjectiveId, s as objectiveOf, u as scheduleMistakes } from "./queries-BZMV7lLe.js";
import { B as sameSavedAnswer, F as choiceMismatch, G as spent, I as foldText, K as studyDay, M as DAY, N as activeSession, P as canonical, R as matchChoice, U as scopeSelects, V as sameScope, W as showValue, Z as builtinObjectiveIn, at as commandSchema, ct as stateSchema, d as backupVersions, et as curriculumFor, g as retainObservedBackups, h as readBackups, lt as errorTypesBySubject, ot as customObjectiveMethods, s as normalizeOpenmaicBase, ut as DEFAULT_INTEREST_TAGS, v as readWorkspace, y as validateStudyFiles, z as requireValue } from "./openmaic-N9F1Z3na.js";
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
	const file = curriculumFor(state.profile, command.subject);
	requireValue(file?.units.some((unit) => unit.id === command.unitId), "这个单元不在当前年级学期的知识地图里。");
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
	if (aligned.objectiveId) {
		const objective = objectiveOf(state, aligned.objectiveId);
		requireValue(objective?.subject === aligned.subject, "学习目标不存在或科目不符。");
	}
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
	const targetSubject = command.subject ?? mistake.subject;
	requireValue(targetSubject === mistake.subject, "错题科目不能更改。");
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
//#region lib/types/files/manual.js
/**
* Capture exactly the fields a typed manual intent edits.
* @param read - current valid relevant owner.
* @param intent - intended settings save or worksheet corrections.
* @returns edited field values suitable for the draft baseline and conflict display.
*/
function manualFields(read, intent) {
	const workspace = read.workspace;
	if (!workspace) return {};
	if (intent.kind === "worksheet-assessments") {
		const sheet = workspace.worksheets.find((sheet) => sheet.id === intent.worksheetId);
		return Object.fromEntries([
			...intent.assessments.map((assessment) => [`assessment:${assessment.responseId}`, sheet?.assessments.find((current) => current.responseId === assessment.responseId) ?? null]),
			...intent.answerDate ? [["answerDate", sheet?.answerDate ?? null]] : [],
			...(intent.responseUpdates ?? []).map((update) => {
				const response = sheet?.responses.find((response) => response.id === update.responseId);
				return [`response:${update.responseId}`, {
					...update.assistance ? { assistance: response?.assistance ?? null } : {},
					...update.answerDate ? { answerDate: response?.answerDate ?? null } : {}
				}];
			})
		]);
	}
	const settings = workspace.settings;
	const command = intent.command;
	switch (command.action) {
		case "setup": return Object.fromEntries(intent.editedProfileFields.map((field) => [`profile:${field}`, settings.profile[field]]));
		case "interests": return { interests: settings.interests ?? null };
		case "openmaic-settings": return { openmaic: settings.openmaic ?? null };
		case "configure-course": return {
			[`material:${command.material.id}`]: settings.materials.find((material) => material.id === command.material.id) ?? null,
			[`course:${command.course.subject}`]: settings.courses.find((course) => course.subject === command.course.subject) ?? null
		};
		case "school-progress": return { [`progress:${command.subject}`]: settings.courses.find((course) => course.subject === command.subject)?.progress ?? null };
	}
}
/**
* Save a manual draft after checking edited-field baselines, term and every related actual file version.
* Unrelated version changes may rebase; a relevant change returns current values and preserves the caller's draft.
* @param fs - DSH-backed adapter with guarded write capability.
* @param request - typed intent with original edited fields and observed versions.
* @param now - current application clock.
* @param signal - cancellation signal.
* @returns saved, unchanged or explicit conflict/invalid/unknown result with independently reread files.
*/
async function saveManual(fs, request, now, signal) {
	const backups = await readBackups(fs, signal);
	const read = await readWorkspace(fs, signal, backupVersions(backups.backups));
	const current = manualFields(read, request.intent);
	const path = request.intent.kind === "settings" ? ".study/settings.json" : `.study/worksheets/${request.intent.worksheetId}.json`;
	if (!read.workspace || read.issues.some((issue) => issue.path === path || path.startsWith(`${issue.path}/`) || issue.path === ".study/settings.json") || !fs.write) return {
		status: "invalid",
		current,
		read
	};
	if (read.workspace.settings.termId !== request.termId) return {
		status: "old-term",
		current,
		read
	};
	if (!request.expectedVersions.some((entry) => entry.path === path) || canonical(current) !== canonical(request.baseline)) return {
		status: "conflict",
		current,
		read
	};
	const observed = read.files.find((file) => file.path === path);
	if (!observed?.file) return {
		status: "invalid",
		current,
		read
	};
	await retainObservedBackups(fs, read, now, signal);
	let next = structuredClone(observed.file);
	if (request.intent.kind === "settings") {
		const previous = projectWorkspace(read.workspace, now);
		let command = request.intent.command;
		if (command.action === "setup") {
			const draft = command.profile;
			command = {
				...command,
				profile: {
					...previous.profile,
					...Object.fromEntries(request.intent.editedProfileFields.map((field) => [field, draft[field]]))
				}
			};
		}
		let updated;
		try {
			updated = updateStudy(previous, command, now);
		} catch (error) {
			return {
				status: "invalid",
				current,
				read,
				reason: error instanceof Error ? error.message : "Correct the invalid settings command."
			};
		}
		if (updated === previous) return {
			status: "unchanged",
			current,
			read
		};
		const settings = {
			...read.workspace.settings,
			revision: read.workspace.settings.revision + 1,
			updatedAt: now,
			profile: updated.profile,
			materials: updated.materials,
			courses: updated.courses,
			...updated.interests ? { interests: updated.interests } : {},
			...updated.openmaic ? { openmaic: updated.openmaic } : {}
		};
		if (!updated.openmaic) delete settings.openmaic;
		next = settings;
	} else {
		if (next.kind !== "worksheet") return {
			status: "invalid",
			current,
			read
		};
		if (request.intent.answerDate) next.answerDate = request.intent.answerDate;
		for (const update of request.intent.responseUpdates ?? []) {
			const response = next.responses.find((response) => response.id === update.responseId);
			if (!response || !update.userConfirmation.trim()) return {
				status: "invalid",
				current,
				read
			};
			if (update.assistance) {
				response.assistance = update.assistance;
				response.assistanceConfirmation = update.userConfirmation;
			}
			if (update.answerDate) response.answerDate = update.answerDate;
		}
		for (const assessment of request.intent.assessments) {
			const existing = next.assessments.findIndex((item) => item.responseId === assessment.responseId);
			if (existing < 0) next.assessments.push(assessment);
			else {
				const previous = next.assessments[existing];
				const comparison = {
					...assessment,
					assessedAt: previous.assessedAt
				};
				if (previous.correctedAt !== void 0) comparison.correctedAt = previous.correctedAt;
				else delete comparison.correctedAt;
				if (canonical(comparison) !== canonical(previous)) next.assessments[existing] = {
					...assessment,
					assessedAt: previous.assessedAt,
					correctedAt: now
				};
			}
		}
		if (canonical(next) === canonical(observed.file)) return {
			status: "unchanged",
			current,
			read
		};
	}
	const validation = validateStudyFiles(read.files.flatMap((file) => file.file ? [{
		path: file.path,
		value: file.path === path ? next : file.file
	}] : []), read.files.flatMap((file) => file.file ? [{
		path: file.path,
		file: file.file
	}] : []));
	if (validation.issues.some((issue) => issue.path === path || issue.path === ".study/settings.json")) return {
		status: "invalid",
		current,
		read: {
			...read,
			issues: [...read.issues, ...validation.issues]
		}
	};
	for (const file of read.files.filter((file) => file.path === path || request.expectedVersions.some((expected) => expected.path === file.path))) if ((await fs.stat(file.path, signal))?.version !== file.version) return {
		status: "conflict",
		current,
		read
	};
	try {
		await fs.write(path, `${JSON.stringify(next, null, 2)}\n`, {
			kind: "replaceIfVersion",
			version: observed.version
		}, signal);
	} catch (error) {
		if (signal.aborted) throw error;
		const latest = await readWorkspace(fs, signal);
		return {
			status: error instanceof Error && "code" in error && ["FS_STALE_VERSION", "FS_NOT_OBSERVED"].includes(String(error.code)) ? "conflict" : "unknown",
			current: manualFields(latest, request.intent),
			read: latest,
			reason: error instanceof Error ? error.message : "The file write outcome is unknown."
		};
	}
	const latest = await readWorkspace(fs, signal);
	if (latest.status === "valid") await retainObservedBackups(fs, latest, now, signal);
	return {
		status: latest.files.some((file) => file.path === path && file.file && canonical(file.file) === canonical(next)) ? "saved" : "unknown",
		current: manualFields(latest, request.intent),
		read: latest
	};
}
//#endregion
export { saveManual as n, manualFields as t };
