import { $ as scopeSelects, $t as StudyReadCache, Ft as effectiveKnowledge, Gt as interestFocus, H as DAY, Ht as stateSchema, It as knowledgeSources, Kt as interestTagsOf, Q as schoolGate, Rt as scopeSupports, S as evidenceOf, U as activeSession, W as canonical, _ as attachEvidence, _t as effectiveOpenmaicBase, at as builtinObjective, b as evidenceAtCutoff, ct as builtinObjectives, dt as exercisesForObjective, ft as subjectExercises, g as scheduleMistakes, gt as OPENMAIC_LESSONS_PATH, h as replayMistake, ht as OPENMAIC_COOKIE_PATH, it as todaySpent, lt as builtinObjectivesIn, m as dayStart, nt as studyDay, ot as builtinObjectiveAnywhere, p as migrateStudyFile, pt as subjectIdeas, q as formatDuration, rt as taughtUnit, ut as curriculumFor, v as demonstrablyAfter, vt as interactiveLessonsView, x as evidenceDay, y as deriveEvidence } from "./read-BbJWwvjD.js";
import { z } from "zod";
import { createHash } from "node:crypto";
//#region lib/types/learning/mastery.js
/** Subject display order shared by check-in plans and history. */
const SUBJECT_ORDER = [
	"chinese",
	"math",
	"english"
];
const DIAGNOSIS_INTERVAL = 14 * DAY;
const RECHECK_AFTER = 35 * DAY;
/**
* Continue one current activity, bounded evidence check or review round without a workflow file.
* @param workspace - independently validated current and explicitly referenced original term files.
* @param state - shared evidence and review projection.
* @param now - actual query cutoff.
* @param subject - optional selected subject; unfinished activity within that subject retains priority.
* @param sourceVerification - independently read source availability and consumption for the current owner.
* @returns one permitted action, scoped progress and the current two-mother review allowance.
*/
function learningContinuation(workspace, state, now, subject, sourceVerification) {
	const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
	const index = evidenceOf(state);
	const active = workspace.blocks.find((block) => block.endedAt === void 0 && (!subject || block.subject === subject));
	const current = active?.questions.find((question) => question.id === active.currentQuestionId);
	const ordered = workspace.blocks.slice().sort((a, b) => b.startedAt - a.startedAt || a.id.localeCompare(b.id));
	const subjectBlocks = ordered.filter((block) => !subject || block.subject === subject);
	const questionBindings = ordered.flatMap((block) => block.questions.flatMap((question) => question.capability ? [{
		block,
		binding: question.capability
	}] : []));
	const scopeFor = (goalId) => current?.capability?.goalId === goalId ? current.capability.scope : questionBindings.find((item) => item.binding.goalId === goalId)?.binding.scope ?? workspace.archivedEvidence?.flatMap((archive) => archive.references).find((reference) => reference.goalId === goalId)?.scope;
	const canonicalFamily = (id) => knowledge.familyAliases[id] ?? id;
	const accepted = (entry) => entry.sourceStatus === "known" && entry.result === "correct";
	const independent = (entry) => accepted(entry) && entry.assistance === "independent" && evidenceDay(entry) !== void 0;
	const progress = knowledge.goals.map((goal) => {
		const scope = scopeFor(goal.id) ?? null;
		const relevant = scope ? index.entries.filter((entry) => entry.capability?.goalId === goal.id && scopeSupports(entry.capability.scope, scope) && (!entry.referenceScopes || entry.referenceScopes.some((reference) => scopeSupports(reference, scope))) && (entry.answerDate.kind === "unknown" || (entry.answerDate.kind === "instant" ? entry.answerDate.at <= now : entry.answerDate.day <= studyDay(now)))) : [];
		const dated = evidenceAtCutoff({
			entries: relevant,
			stuckSignals: []
		}, now);
		const familyIds = [...new Set(questionBindings.filter((item) => item.binding.goalId === goal.id && scope && scopeSupports(item.binding.scope, scope)).map((item) => canonicalFamily(item.binding.familyId)))];
		const required = familyIds.length ? familyIds : [goal.familyIds[0]];
		const missingAt = (entries) => required.map((familyId) => ({
			familyId,
			criteria: [
				"basic",
				"method",
				"variation"
			].filter((criterion) => !entries.some((entry) => accepted(entry) && canonicalFamily(entry.capability.familyId) === familyId && entry.criteria?.includes(criterion)))
		})).filter((item) => item.criteria.length);
		const missingCriteria = missingAt(relevant);
		const days = [...new Set(dated.filter(independent).map((entry) => evidenceDay(entry)))].sort();
		const mistakes = state.mistakes.filter((mistake) => mistake.subject === goal.subject && mistake.objectiveId === goal.id && mistake.confirmedAt !== void 0 && mistake.confirmedAt <= now && (!scope || !index.entries.some((entry) => entry.mistakeId === mistake.id && entry.capability) || index.entries.some((entry) => entry.mistakeId === mistake.id && entry.capability && scopeSupports(entry.capability.scope, scope))));
		const difficultiesAt = (entries, at) => entries.some((entry) => {
			const day = evidenceDay(entry);
			const instant = entry.answerDate.kind === "instant" ? entry.answerDate.at : day ? dayStart(day) + DAY - 1 : void 0;
			return entry.sourceStatus === "known" && instant !== void 0 && instant >= at - 12096e5 && ([
				"incorrect",
				"partial",
				"stuck"
			].includes(entry.result) || entry.result === "correct" && ["hint", "worked-example"].includes(entry.assistance));
		});
		let firstMasteredDay;
		for (const day of days) {
			const cut = dated.filter((entry) => evidenceDay(entry) <= day);
			const at = dayStart(day) + DAY - 1;
			const open = mistakes.some((mistake) => mistake.confirmedAt <= at && (replayMistake(mistake, index, at).stage < 4 || (replayMistake(mistake, index, at).dueAt ?? Infinity) <= at));
			if (new Set(cut.filter(independent).map(evidenceDay)).size >= 3 && !missingAt(cut).length && !difficultiesAt(cut, at) && !open) {
				firstMasteredDay = day;
				break;
			}
		}
		const weak = difficultiesAt(dated, now) || relevant.some((entry) => entry.sourceStatus === "known" && entry.answerDate.kind === "unknown" && [
			"incorrect",
			"partial",
			"stuck"
		].includes(entry.result)) || mistakes.some((mistake) => mistake.stage < 4);
		const level = mistakes.some((mistake) => mistake.dueAt !== void 0 && mistake.dueAt <= now) || !weak && days.length > 0 && days.length < 3 && days.at(-1) < studyDay(now) ? "due" : weak ? "weak" : days.length >= 3 && !missingCriteria.length ? "mastered" : relevant.length ? "practising" : "untouched";
		const baseline = firstMasteredDay !== void 0 && dated.filter((entry) => evidenceDay(entry) <= firstMasteredDay).every((entry) => entry.termId !== workspace.settings.termId);
		const troubleDays = dated.filter((entry) => firstMasteredDay && evidenceDay(entry) > firstMasteredDay && [
			"incorrect",
			"partial",
			"stuck"
		].includes(entry.result)).map((entry) => evidenceDay(entry)).sort();
		const recovered = level === "mastered" && troubleDays.length > 0 && days.at(-1) > troubleDays.at(-1);
		return {
			id: goal.id,
			subject: goal.subject,
			title: goal.title,
			scope,
			level,
			independentDays: days,
			baseline,
			...firstMasteredDay ? { firstMasteredDay } : {},
			...recovered ? { recoveredDay: days.at(-1) } : {},
			missingFamilyIds: missingCriteria.map((item) => item.familyId),
			missingCriteria,
			feedback: relevant.slice(-20).map((entry) => ({
				termId: entry.termId,
				ownerId: entry.ownerId,
				responseId: entry.responseId,
				familyId: canonicalFamily(entry.capability.familyId),
				result: entry.result,
				feedback: entry.feedback ?? "",
				...entry.errorType ? { errorType: entry.errorType } : {},
				sourceStatus: entry.sourceStatus,
				assistance: entry.assistance,
				answerDate: entry.answerDate
			}))
		};
	});
	const familyForMistake = (id) => {
		const entry = index.entries.find((entry) => entry.mistakeId === id && entry.capability);
		const binding = state.mistakes.find((mistake) => mistake.id === id)?.capability ?? entry?.capability;
		return binding ? canonicalFamily(binding.familyId) : `mistake:${id}`;
	};
	const due = state.mistakes.filter((mistake) => mistake.confirmedAt !== void 0 && mistake.dueAt !== void 0 && mistake.dueAt <= now && (!subject || mistake.subject === subject)).sort((a, b) => {
		const currentGoal = knowledge.goals.find((goal) => goal.id === current?.capability?.goalId);
		return Number(!currentGoal?.prerequisites.includes(a.objectiveId ?? "")) - Number(!currentGoal?.prerequisites.includes(b.objectiveId ?? "")) || a.dueAt - b.dueAt || familyForMistake(a.id).localeCompare(familyForMistake(b.id)) || a.id.localeCompare(b.id);
	});
	const rounds = subjectBlocks.flatMap((block) => (block.rounds ?? []).map((round) => ({
		...round,
		blockId: block.id,
		status: round.endedAt !== void 0 ? "ended" : block.endedAt !== void 0 ? "paused" : "active",
		limit: round.kind === "check" ? 3 : 2,
		remaining: Math.max(0, round.kind === "check" ? 3 - round.presentedQuestionIds.length : 2 - round.enteredFamilyIds.length)
	}))).sort((a, b) => b.startedAt - a.startedAt || a.id.localeCompare(b.id));
	const latestReview = rounds.find((round) => round.kind === "review");
	const lastLearning = subjectBlocks.find((block) => block.mode !== "review" && block.responses.some((response) => response.source.kind === "manual" && response.source.entry === "current" || response.source.kind === "native"));
	const legacyReview = subjectBlocks.filter((block) => !block.rounds?.length && block.mode === "review" && (!lastLearning || block.startedAt > lastLearning.startedAt));
	const used = latestReview?.enteredFamilyIds ?? [...new Set(legacyReview.flatMap((block) => block.questions.filter((question) => question.id === block.currentQuestionId || block.responses.some((response) => response.questionId === question.id)).map((question) => question.capability ? canonicalFamily(question.capability.familyId) : familyForMistake(question.mistakeId ?? question.id))))];
	const goalReviews = progress.filter((item) => item.level === "due" && item.scope && (!subject || item.subject === subject) && !due.some((mistake) => mistake.objectiveId === item.id));
	const dueFamilies = [.../* @__PURE__ */ new Set([...due.map((mistake) => familyForMistake(mistake.id)), ...goalReviews.map((item) => questionBindings.find((binding) => binding.binding.goalId === item.id)?.binding.familyId ?? knowledge.goals.find((goal) => goal.id === item.id).familyIds[0])])];
	const reviewRound = {
		limit: 2,
		usedFamilyIds: used,
		remaining: latestReview?.endedAt !== void 0 ? 0 : Math.max(0, 2 - used.length),
		backlog: dueFamilies.length
	};
	const finish = (nextAction) => {
		const round = rounds.find((round) => nextAction?.roundId === round.id) ?? rounds[0] ?? null;
		const legalActions = nextAction?.reason === "source-unavailable" || nextAction?.reason === "source-pending" ? [
			nextAction.source?.kind === "native" ? "verify-source" : "sync-feedback",
			"switch-block",
			"rest"
		] : nextAction?.kind === "answer" ? [
			"answer",
			"request-hint",
			"end-block",
			"switch-block"
		] : nextAction?.kind === "assess" ? [
			"request-assessment",
			"end-block",
			"switch-block"
		] : nextAction?.reason === "check-budget-exhausted" ? [
			"request-teaching",
			"switch-block",
			"rest"
		] : nextAction?.reason === "round-paused" ? [
			"resume-round",
			"switch-block",
			"rest"
		] : nextAction?.kind === "teach" ? [
			"request-teaching",
			"end-block",
			"switch-block",
			"rest"
		] : nextAction?.kind === "hold" ? [
			"switch-block",
			"rest",
			"more-review"
		] : nextAction?.kind === "learn" ? [
			"start-block",
			"rest",
			"more-review"
		] : [
			"next-question",
			"end-block",
			"switch-block"
		];
		return {
			nextAction,
			goalProgress: progress.filter((item) => item.scope !== null || item.feedback.length > 0),
			round,
			legalActions,
			reviewRound
		};
	};
	const actionFor = (goalId, kind, reason, scope, selectedFamilyId) => {
		const goal = knowledge.goals.find((goal) => goal.id === goalId);
		const item = progress.find((item) => item.id === goalId);
		const familyId = selectedFamilyId ?? item.missingFamilyIds[0] ?? questionBindings.find((item) => item.binding.goalId === goalId)?.binding.familyId ?? goal.familyIds[0];
		const family = knowledge.families.find((family) => family.id === canonicalFamily(familyId));
		const selectedScope = scope ?? item.scope ?? void 0;
		const feedback = progress.filter((item) => item.subject === goal.subject).flatMap((item) => item.feedback).sort((a, b) => {
			const day = (date) => date.kind === "day" ? date.day : date.kind === "instant" ? studyDay(date.at) : "";
			return day(a.answerDate).localeCompare(day(b.answerDate));
		});
		const boundedScope = selectedScope ? {
			...selectedScope,
			description: selectedScope.description.slice(0, 200),
			...selectedScope.vocabulary ? {
				vocabulary: selectedScope.vocabulary.slice(0, 8),
				omittedVocabulary: Math.max(0, selectedScope.vocabulary.length - 8),
				useOnlyListedVocabulary: true
			} : {}
		} : null;
		const requirement = JSON.stringify({
			goalId,
			title: goal.title.slice(0, 200),
			criterion: goal.criterion.slice(0, 600),
			scope: boundedScope,
			familyId: family.id,
			method: family.coreMethod.slice(0, 200),
			structure: family.structure.slice(0, 200),
			variationAxes: family.variationAxes.slice(0, 4).map((axis) => axis.slice(0, 100)),
			rubric: family.representative.rubric.slice(0, 400),
			action: kind,
			missingCriteria: item.missingCriteria.slice(0, 3),
			omittedCriteria: Math.max(0, item.missingCriteria.length - 3),
			feedback: feedback.slice(-3).map((row) => ({
				...row,
				feedback: row.feedback.slice(0, 200),
				answerDate: row.answerDate.kind === "day" ? {
					kind: "day",
					day: row.answerDate.day
				} : row.answerDate.kind === "instant" ? {
					kind: "instant",
					at: row.answerDate.at
				} : { kind: "unknown" }
			})),
			omittedFeedback: Math.max(0, feedback.length - 3),
			reviewFindings: state.mistakes.filter((mistake) => mistake.subject === goal.subject).slice(0, 4).map((mistake) => ({
				topic: mistake.topic.slice(0, 100),
				errorType: mistake.errorType ?? null,
				stage: mistake.stage,
				dueAt: mistake.dueAt ?? null
			})),
			teaching: "Use the appropriate official direct component, short content or full classroom. Ask one question at a time; address the saved error before a constrained variant. Preserve unknown facts; clicks and scores create no evidence. Reuse accepted responses; add at most three targeted native questions for missing criteria."
		});
		const ownerRound = rounds.find((round) => round.blockId === active?.id && round.presentedQuestionIds.includes(current?.id ?? ""));
		return {
			kind,
			reason,
			subject: goal.subject,
			title: goal.title,
			goalId,
			familyId: family.id,
			...selectedScope ? { scope: selectedScope } : {},
			...active && kind !== "learn" && kind !== "review" ? {
				blockId: active.id,
				...ownerRound ? { roundId: ownerRound.id } : {}
			} : {},
			requirement
		};
	};
	const owner = active ?? subjectBlocks.find((block) => block.id === rounds[0]?.blockId);
	const pendingSource = sourceVerification?.openmaic.find((source) => source.learnerId === workspace.settings.learnerId && source.termId === workspace.settings.termId && source.blockId === owner?.id && (source.status !== "available" || source.consumption === "pending" || source.omitted > 0));
	if (owner && pendingSource) return finish({
		kind: "hold",
		reason: pendingSource.status === "available" ? "source-pending" : "source-unavailable",
		subject: owner.subject,
		title: "Read and save the original activity feedback before continuing.",
		blockId: owner.id,
		source: {
			kind: "openmaic",
			verification: pendingSource
		}
	});
	const nativeSource = sourceVerification?.native.find((source) => source.status !== "available" && owner?.responses.some((response) => response.questionId === owner.currentQuestionId && response.source.kind === "native" && response.source.sessionId === source.sessionId));
	if (owner && nativeSource) return finish({
		kind: "hold",
		reason: "source-unavailable",
		subject: owner.subject,
		title: "Verify the original answer source before continuing.",
		blockId: owner.id,
		source: {
			kind: "native",
			verification: nativeSource
		}
	});
	if (active && current && !rounds.some((round) => round.blockId === active.id && round.endedAt !== void 0 && round.presentedQuestionIds.includes(current.id))) {
		const originals = active.responses.filter((response) => response.questionId === current.id);
		const selected = originals.find((response) => response.id === active.currentResponseId) ?? originals.at(-1);
		const base = current.capability ? actionFor(current.capability.goalId, "answer", "unfinished-question") : {
			kind: "answer",
			reason: "unfinished-question",
			subject: active.subject,
			title: current.topic
		};
		const currentRound = rounds.find((round) => round.blockId === active.id && round.presentedQuestionIds.includes(current.id));
		const previousCheck = rounds.find((round) => round.kind === "check" && round.members.some((member) => member.goalId === current.capability?.goalId));
		if (!selected && previousCheck && !currentRound && (previousCheck.remaining === 0 || previousCheck.endedAt !== void 0)) return finish({
			...base,
			kind: "hold",
			reason: "check-budget-exhausted",
			blockId: previousCheck.blockId,
			roundId: previousCheck.id
		});
		if (!selected && currentRound?.endedAt === void 0) return finish({
			...base,
			blockId: active.id,
			questionId: current.id,
			...currentRound ? { roundId: currentRound.id } : {}
		});
		const effective = index.entries.find((entry) => entry.termId === active.termId && entry.ownerId === active.id && entry.responseId === selected?.id);
		if (!selected) return finish({
			...base,
			blockId: active.id,
			questionId: current.id
		});
		if (!active.assessments.some((assessment) => assessment.responseId === selected?.id)) return finish({
			...base,
			kind: "assess",
			reason: "pending-assessment",
			blockId: active.id,
			questionId: current.id,
			responseId: selected.id
		});
		if (current.capability) {
			const item = progress.find((item) => item.id === current.capability.goalId);
			if (effective?.sourceStatus === "known" && ([
				"incorrect",
				"partial",
				"stuck"
			].includes(effective.result) || ["hint", "worked-example"].includes(effective.assistance))) return finish(actionFor(item.id, "teach", "current-gap"));
			const prerequisite = knowledge.goals.find((goal) => goal.id === item.id).prerequisites.find((id) => {
				const rows = index.entries.filter((entry) => entry.capability?.goalId === id && scopeSupports(entry.capability.scope, current.capability.scope));
				return rows.some((entry) => entry.sourceStatus === "known" && [
					"incorrect",
					"partial",
					"stuck"
				].includes(entry.result)) && !rows.some((entry) => independent(entry) && rows.filter((row) => [
					"incorrect",
					"partial",
					"stuck"
				].includes(row.result)).every((row) => demonstrablyAfter(entry, row)));
			});
			if (prerequisite) return finish(actionFor(prerequisite, "teach", "prerequisite-gap", current.capability.scope));
			if (active.mode !== "review" && (item.missingCriteria.length || effective?.result === "unassessed" || effective?.sourceStatus === "unknown" || effective?.assistance === "unknown" || effective?.answerDate.kind === "unknown")) {
				const check = rounds.find((round) => round.kind === "check" && round.members.some((member) => member.goalId === item.id && scopeSupports(member.scope, current.capability.scope)));
				const remaining = check?.endedAt !== void 0 ? 0 : check?.remaining ?? 3;
				if (remaining) return finish({
					...actionFor(item.id, "supplement", "missing-evidence"),
					...check ? {
						roundId: check.id,
						blockId: check.blockId
					} : {},
					supplement: {
						missingFamilyIds: item.missingFamilyIds,
						missingCriteria: item.missingCriteria,
						maxNewQuestions: 3,
						remaining
					}
				});
				return finish({
					...actionFor(item.id, "hold", "check-budget-exhausted"),
					...check ? { roundId: check.id } : {}
				});
			}
		}
		const next = active.questions.find((question) => !active.responses.some((response) => response.questionId === question.id) && !rounds.some((round) => round.blockId === active.id && (round.endedAt !== void 0 || round.remaining === 0 && !round.presentedQuestionIds.includes(question.id)) && round.members.some((member) => member.goalId === question.capability?.goalId)));
		if (next) return finish({
			...next.capability ? actionFor(next.capability.goalId, "answer", "unfinished-question") : base,
			blockId: active.id,
			questionId: next.id
		});
		if (current.capability) {
			const item = progress.find((item) => item.id === current.capability.goalId);
			if (item.level === "weak" && item.scope) return finish(actionFor(item.id, "teach", "current-gap"));
		}
	}
	const latestRound = rounds[0];
	if (latestRound?.kind === "check" && (latestRound.remaining === 0 || latestRound.endedAt !== void 0) && (latestRound.endReason !== "complete" || latestRound.members.some((member) => progress.find((item) => item.id === member.goalId)?.missingCriteria.length))) {
		const member = latestRound.members[0];
		return finish({
			...actionFor(member.goalId, "hold", "check-budget-exhausted", member.scope),
			roundId: latestRound.id,
			blockId: latestRound.blockId
		});
	}
	if (latestRound?.status === "paused") return finish({
		kind: "hold",
		reason: "round-paused",
		subject: workspace.blocks.find((block) => block.id === latestRound.blockId).subject,
		title: "Resume the saved round or rest.",
		roundId: latestRound.id,
		blockId: latestRound.blockId
	});
	if (latestReview?.status === "active" && latestReview.remaining) {
		const member = latestReview.members.find((member) => !latestReview.enteredFamilyIds.includes(member.familyId));
		if (member) return finish({
			...actionFor(member.goalId, "review", "due-review", member.scope, member.familyId),
			blockId: latestReview.blockId,
			roundId: latestReview.id,
			review: {
				mistakeIds: member.mistakeId ? [member.mistakeId] : [],
				familyIds: [member.familyId],
				remaining: latestReview.remaining
			}
		});
	}
	const remainingDue = due.filter((mistake) => !used.includes(familyForMistake(mistake.id)));
	if (reviewRound.remaining && remainingDue.length) {
		const selectedFamilies = [...new Set(remainingDue.map((mistake) => familyForMistake(mistake.id)))].slice(0, reviewRound.remaining);
		const selected = remainingDue.filter((mistake) => selectedFamilies.includes(familyForMistake(mistake.id)));
		const first = selected[0];
		const binding = first.capability ?? index.entries.find((entry) => entry.mistakeId === first.id && entry.capability)?.capability;
		return finish({
			...first.objectiveId && knowledge.goals.some((goal) => goal.id === first.objectiveId) ? actionFor(first.objectiveId, "review", "due-review", binding?.scope, binding?.familyId) : {
				kind: "review",
				reason: "due-review",
				subject: first.subject,
				title: first.topic
			},
			review: {
				mistakeIds: selected.map((mistake) => mistake.id),
				familyIds: selectedFamilies,
				remaining: reviewRound.remaining
			}
		});
	}
	const goalReview = goalReviews.find((item) => !used.includes(questionBindings.find((binding) => binding.binding.goalId === item.id)?.binding.familyId ?? knowledge.goals.find((goal) => goal.id === item.id).familyIds[0]));
	if (reviewRound.remaining && goalReview) {
		const action = actionFor(goalReview.id, "review", "due-review");
		return finish({
			...action,
			review: {
				mistakeIds: [],
				familyIds: [action.familyId],
				remaining: reviewRound.remaining
			}
		});
	}
	const selectedSubject = active?.subject ?? subject;
	const confirmations = (workspace.settings.learningScopes ?? []).filter((item) => !selectedSubject || item.subject === selectedSubject);
	const enteredGoals = new Set(rounds.flatMap((round) => round.members.filter((member) => round.enteredFamilyIds.includes(member.familyId)).map((member) => member.goalId)));
	for (const confirmation of confirmations) {
		const course = workspace.settings.courses.find((course) => course.subject === confirmation.subject);
		const gate = schoolGate(state, confirmation.subject);
		if (course && (!gate || gate.pace === "review")) continue;
		const candidate = knowledge.goals.find((goal) => {
			if (goal.subject !== confirmation.subject || enteredGoals.has(goal.id) || progress.find((item) => item.id === goal.id)?.level !== "untouched") return false;
			if (confirmation.goalIds && !confirmation.goalIds.includes(goal.id)) return false;
			const associations = builtinObjectives(state.profile).filter((old) => old.subject === goal.subject).filter((old) => goal.curriculumAssociationIds.includes(old.id));
			if (course ? !associations.some((old) => gate.posture === "catch-up" ? gate.taught.has(old.unit) : old.unit === gate.current) : !confirmation.goalIds && !associations.length) return false;
			const modality = confirmation.scope.modality;
			const oral = goal.id.startsWith("e.speak") || [
				"c.read-aloud",
				"c.recite",
				"c.retell",
				"c.describe",
				"c.interact"
			].includes(goal.id);
			const listening = goal.id.startsWith("e.listen") || goal.id === "c.listen";
			return oral ? modality === "oral" : listening ? modality === "listening" : goal.id === "e.sound" ? ["oral", "listening"].includes(modality) : goal.id === "e.view-listen" ? modality === "audiovisual" : modality === "written" || modality === "performed";
		});
		if (candidate) return finish(actionFor(candidate.id, "learn", "new-goal", confirmation.scope));
	}
	return finish({
		kind: "hold",
		reason: confirmations.length ? "no-learnable-goal" : "confirmed-scope-required",
		subject: selectedSubject ?? "math",
		title: confirmations.length ? "No new goal is available in the confirmed range. Rest or explicitly request more review." : "Confirm the next learning range or choose another allowed activity."
	});
}
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
		includeEvidence(entry.subject, goal?.title ?? entry.topic, day === void 0 || entry.sourceStatus !== "known" ? void 0 : dayStart(day), entry.result, entry.assistance, void 0, entry.objectiveId);
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
		for (const goal of studyInsight(before, beforeAt).objectives) if (goal.level === "mastered") ever.add(goal.id);
		else if (ever.has(goal.id) && (goal.level === "due" || goal.level === "weak")) troubled.add(goal.id);
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
			worksheets: state.worksheets.filter((item) => item.subject === subject && item.discardedAt === void 0 && item.archivedAt === void 0).slice(-20).reverse().map((sheet) => {
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
	const index = deriveEvidence(workspace);
	const knowledge = effectiveKnowledge(collections?.knowledge);
	const declarations = [...(collections?.mistakes ?? []).map((mistake) => ({
		mistake,
		termId: settings.termId
	})), ...(workspace.archivedEvidence ?? []).flatMap((archive) => (archive.workspace.collections?.mistakes ?? []).filter((mistake) => archive.references.some((reference) => reference.review?.mistakeId === mistake.id)).map((mistake) => ({
		mistake,
		termId: archive.workspace.settings.termId
	})))].sort((a, b) => (a.mistake.confirmedAt ?? Infinity) - (b.mistake.confirmedAt ?? Infinity) || a.termId.localeCompare(b.termId) || a.mistake.id.localeCompare(b.mistake.id));
	const mistakes = [];
	const mothers = /* @__PURE__ */ new Map();
	const keyFor = (mistake, termId) => {
		const entry = index.entries.find((entry) => entry.termId === termId && entry.mistakeId === mistake.id && entry.capability);
		const original = [workspace, ...(workspace.archivedEvidence ?? []).map((archive) => archive.workspace)].find((owner) => owner.settings.termId === termId);
		const file = entry ? [...original?.blocks ?? [], ...original?.worksheets ?? []].find((file) => file.id === entry.ownerId && file.kind === entry.ownerKind) : void 0;
		const question = (file?.kind === "block" ? file.questions : file?.items)?.find((question) => question.id === entry?.questionId);
		const binding = mistake.capability ?? entry?.capability;
		const goal = mistake.capability?.goalId ?? (entry?.capability && (mistake.objectiveId === question?.objectiveId || mistake.objectiveId === entry.capability.goalId) ? entry.capability.goalId : mistake.objectiveId);
		const scope = binding?.scope;
		const range = scope ? [
			scope.modality,
			scope.numberMax ?? null,
			scope.vocabulary?.slice().sort() ?? null,
			scope.numberMax === void 0 && scope.vocabulary === void 0 ? [scope.id, scope.description] : null
		] : void 0;
		return {
			goal,
			binding,
			key: binding && goal === binding.goalId ? JSON.stringify([
				mistake.subject,
				goal,
				knowledge.familyAliases[binding.familyId] ?? binding.familyId,
				range
			]) : JSON.stringify([termId, mistake.id])
		};
	};
	for (const { mistake, termId } of declarations) {
		const { key, goal, binding } = keyFor(mistake, termId);
		const inheritedReview = workspace.archivedEvidence?.some((archive) => archive.workspace.settings.termId === termId && archive.references.some((reference) => reference.review?.mistakeId === mistake.id));
		let id = mothers.get(key);
		if (!id) {
			id = collections?.mistakes.find((current) => keyFor(current, settings.termId).key === key)?.id ?? mistake.id;
			if (mistakes.some((existing) => existing.id === id)) id = `archive-${createHash("sha256").update(key).digest("hex").slice(0, 32)}`;
			mothers.set(key, id);
			mistakes.push({
				...mistake,
				id,
				...goal ? { objectiveId: goal } : {}
			});
		}
		for (const entry of index.entries) if (entry.termId === termId && entry.mistakeId === mistake.id) {
			if (!inheritedReview && binding && (!entry.capability || entry.capability.goalId !== binding.goalId || (knowledge.familyAliases[entry.capability.familyId] ?? entry.capability.familyId) !== (knowledge.familyAliases[binding.familyId] ?? binding.familyId) || !scopeSupports(binding.scope, entry.capability.scope) || !scopeSupports(entry.capability.scope, binding.scope))) delete entry.mistakeId;
			else entry.mistakeId = id;
		}
	}
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
				feedback: assessment?.feedback ?? "",
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
			...sheet.archivedAt !== void 0 ? { archivedAt: sheet.archivedAt } : {},
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
		mistakes,
		rewards: collections?.rewards ?? []
	});
	const active = blocks.find((block) => block.endedAt === void 0);
	const question = active?.questions.find((question) => question.id === active.currentQuestionId);
	if (active && question) {
		const candidates = active.responses.filter((response) => response.questionId === question.id);
		const response = active.currentResponseId ? candidates.find((response) => response.id === active.currentResponseId) : candidates.length === 1 ? candidates[0] : void 0;
		const actualDate = index.entries.find((entry) => entry.termId === active.termId && entry.ownerId === active.id && entry.responseId === response?.id)?.answerDate;
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
	attachEvidence(state, index);
	return scheduleMistakes(state, now);
}
//#endregion
//#region lib/types/learning/queries.js
function workspaceProjection(read, now) {
	const workspaceQueryCache = (read.cache ??= new StudyReadCache()).queries;
	const workspace = read.workspace;
	const identity = read.files.find((file) => file.path === ".study/settings.json").targetKey;
	const signature = JSON.stringify([
		[...read.files, ...read.archiveFiles ?? []].map(({ path, targetKey, version }) => ({
			path,
			targetKey,
			version
		})),
		workspace.nativeSources ?? [],
		workspace.openmaicSources ?? [],
		read.archiveIssues ?? [],
		read.sourceVerification ?? null
	]);
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
	return cached;
}
/**
* Read a dashboard using the same version- and time-bound projection as other workspace queries.
* @param read - independently validated current files.
* @param now - caller clock.
* @param options - selected dashboard page and scope.
* @param lessons - separately read classroom status.
* @returns current data for valid files or a labelled legacy display; failures retain their file issues.
*/
function queryWorkspaceDashboard(read, now, options = {}, lessons) {
	const facts = {
		status: read.status,
		versions: read.files.map(({ path, targetKey, version }) => ({
			path,
			targetKey,
			version
		})),
		issues: read.issues
	};
	if (read.status === "legacy") return {
		...facts,
		data: queryDashboard(stateSchema.parse(migrateStudyFile(structuredClone(read.legacy))), now, options, lessons)
	};
	return read.status === "valid" && read.workspace ? {
		...facts,
		data: queryDashboard(workspaceProjection(read, now).state, now, options, lessons)
	} : facts;
}
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
	if ([
		"capabilities",
		"families",
		"knowledge-sources",
		"legacy-references"
	].includes(request.kind)) {
		const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
		const selected = (request.kind === "capabilities" ? knowledge.goals : request.kind === "families" ? knowledge.families : request.kind === "legacy-references" ? workspace.collections?.legacyReferences ?? [] : []).filter((item) => (!request.subject || "subject" in item && item.subject === request.subject) && (!request.id || ("id" in item ? item.id : item.oldId) === request.id));
		const offset = Math.max(0, request.offset ?? 0);
		return {
			status: read.status === "valid" ? "valid" : "partial",
			versions,
			issues: read.issues,
			data: request.kind === "knowledge-sources" ? knowledgeSources() : {
				learnerId: workspace.settings.learnerId ?? null,
				items: selected.slice(offset, offset + 20),
				total: selected.length,
				offset,
				...request.kind === "families" ? { aliases: knowledge.familyAliases } : {}
			}
		};
	}
	const cached = workspaceProjection(read, now);
	const { state, refreshAfter } = cached;
	const index = evidenceOf(state);
	if (request.kind === "learning-context") {
		const active = workspace.blocks.find((block) => block.endedAt === void 0);
		const currentQuestion = active?.questions.find((question) => question.id === active.currentQuestionId);
		const originals = active?.responses.filter((response) => response.questionId === currentQuestion?.id) ?? [];
		const selected = originals.find((response) => response.id === active?.currentResponseId) ?? originals.at(-1);
		const recent = originals.slice(-20);
		if (selected && !recent.some((response) => response.id === selected.id)) recent[0] = selected;
		const responses = recent.map((response) => {
			const effective = index.entries.find((item) => item.ownerId === active?.id && item.responseId === response.id);
			return {
				...response,
				answerDate: effective?.answerDate ?? { kind: "unknown" },
				assistance: effective?.assistance ?? "unknown",
				sourceStatus: effective?.sourceStatus ?? "unknown",
				effectiveResult: effective?.result ?? "unassessed"
			};
		});
		const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
		const capability = currentQuestion?.capability ? knowledge.goals.find((goal) => goal.id === currentQuestion.capability?.goalId) : void 0;
		const target = capability ? {
			...capability,
			goal: capability.criterion,
			method: currentQuestion.capability.scope.modality
		} : currentQuestion && typeof currentQuestion.objectiveId === "string" ? builtinObjectiveAnywhere(currentQuestion.objectiveId) ?? workspace.collections?.objectives.find((goal) => goal.id === currentQuestion.objectiveId) : void 0;
		const selectedProfile = active?.context.profile ? {
			...active.context.profile,
			...active.context.scope
		} : state.profile;
		const scopedState = {
			...state,
			profile: selectedProfile
		};
		const elements = currentQuestion && typeof currentQuestion.objectiveId === "string" ? objectiveElements(scopedState, currentQuestion.objectiveId) : void 0;
		const savedResponse = responses.find((response) => response.id === active?.currentResponseId) ?? responses.at(-1) ?? null;
		const declaredAssessment = savedResponse ? active?.assessments.find((assessment) => assessment.responseId === savedResponse.id) ?? null : null;
		const effectiveAssessment = savedResponse ? index.entries.find((item) => item.ownerId === active?.id && item.responseId === savedResponse.id) : void 0;
		const savedAssessment = declaredAssessment && savedResponse?.source.kind === "openmaic" ? {
			...declaredAssessment,
			declaredResult: declaredAssessment.result,
			result: effectiveAssessment?.result ?? "unassessed",
			assistance: effectiveAssessment?.assistance ?? "unknown"
		} : declaredAssessment;
		const discardedSheets = new Set(workspace.worksheets.filter((sheet) => sheet.discardedAt !== void 0).map((sheet) => sheet.id));
		const pendingFacts = index.entries.filter((item) => (item.ownerKind !== "worksheet" || !discardedSheets.has(item.ownerId)) && (item.answerDate.kind === "unknown" || item.assistance === "unknown" || item.sourceStatus === "unknown" || !item.objectiveId));
		return {
			status: read.status === "valid" ? "valid" : "partial",
			issues: read.issues,
			versions,
			refreshAfter,
			data: {
				termId: workspace.settings.termId,
				learnerId: workspace.settings.learnerId ?? null,
				activeBlock: active ? {
					id: active.id,
					subject: active.subject,
					mode: active.mode,
					context: active.context,
					currentQuestionId: active.currentQuestionId
				} : null,
				currentQuestion: currentQuestion ?? null,
				activeQuestions: active?.questions ?? [],
				responses,
				...learningContinuation(workspace, state, now, request.subject, read.sourceVerification),
				...read.status !== "valid" ? {
					nextAction: null,
					legalActions: []
				} : {},
				archiveIssues: read.archiveIssues ?? [],
				assessments: active?.assessments.filter((assessment) => responses.some((response) => response.id === assessment.responseId)) ?? [],
				savedResponse,
				savedAssessment,
				pendingAssessment: savedResponse !== null && savedAssessment === null,
				target: target ? {
					id: target.id,
					title: target.title,
					goal: target.goal,
					method: target.method,
					source: currentQuestion?.source,
					facts: elements?.facts ?? []
				} : null,
				pendingFactCount: pendingFacts.length,
				pendingFacts: pendingFacts.slice(0, 20).map((item) => ({
					ownerId: item.ownerId,
					ownerKind: item.ownerKind,
					responseId: item.responseId,
					subject: item.subject,
					topic: item.topic,
					fields: [
						...item.answerDate.kind === "unknown" ? ["answerDate"] : [],
						...item.assistance === "unknown" ? ["assistance"] : [],
						...item.sourceStatus === "unknown" ? ["source"] : [],
						...item.basisStatus ? ["answerBasis"] : !item.objectiveId ? ["objectiveId"] : []
					]
				})),
				sourceVerification: read.sourceVerification ?? {
					native: [],
					openmaic: []
				},
				officialFeedback: index.entries.filter((item) => item.source.kind === "openmaic").slice(-20).map((item) => {
					const question = [workspace, ...(workspace.archivedEvidence ?? []).map((archive) => archive.workspace)].find((owner) => owner.settings.termId === item.termId)?.blocks.find((block) => block.id === item.ownerId)?.questions.find((question) => question.id === item.questionId);
					return {
						termId: item.termId,
						ownerId: item.ownerId,
						responseId: item.responseId,
						questionId: item.questionId,
						objectiveId: item.objectiveId ?? null,
						rawResponse: item.rawResponse,
						prompt: question?.prompt ?? null,
						feedback: item.feedback ?? "",
						result: item.result,
						grading: item.grading ?? "pending",
						official: item.official ?? null,
						officialHistory: item.officialHistory ?? [],
						sourceStatus: item.sourceStatus,
						assistance: item.assistance,
						answerDate: item.answerDate
					};
				}),
				capability: capability ?? null,
				sourceExercise: currentQuestion?.capability ? knowledge.families.find((family) => family.id === (knowledge.familyAliases[currentQuestion.capability.familyId] ?? currentQuestion.capability.familyId))?.representative ?? null : null,
				seeds: currentQuestion && typeof currentQuestion.objectiveId === "string" ? subjectExercises(active.subject).filter((item) => item.objectiveId === currentQuestion.objectiveId).slice(0, 3) : [],
				elements: elements ? {
					...elements,
					exercises: elements.exercises.slice(0, 3)
				} : null
			}
		};
	}
	if (request.kind === "summary") {
		const summary = cached.summary ??= (() => {
			const legacy = weeklySummary(state, now, studyInsight(state, now));
			const progress = learningContinuation(workspace, state, now).goalProgress;
			const firstDay = studyDay(now - 5184e5);
			return {
				...legacy,
				masteredGoals: legacy.masteredGoals + progress.filter((item) => item.level === "mastered" && !item.baseline && item.firstMasteredDay && item.firstMasteredDay >= firstDay).length,
				recoveredGoals: legacy.recoveredGoals + progress.filter((item) => item.level === "mastered" && item.recoveredDay && item.recoveredDay >= firstDay).length
			};
		})();
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
			more: "The study skill owns what to do next; kind=progress, due, weak, exercises or curriculum with offset pages more records. Preserve unfinished work and explicitly selected goals before recommendations. interests and interestFocus wrap question context; facts stay on the knowledge map. dueToday lists at most two optional reviews. openmaic.baseUrl is the interactive-lesson service; author its independent lesson log and validate it with the packaged CLI."
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
		worksheets: () => state.worksheets.filter((sheet) => id || sheet.archivedAt === void 0).map((sheet) => ({
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
const DASHBOARD_CACHE = Symbol("studentDashboardCache");
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
	const owner = state;
	const entries = owner[DASHBOARD_CACHE] ?? /* @__PURE__ */ new Map();
	let cached = entries.get(key);
	if (!cached || now >= cached.refreshAfter || now < cached.value.serverNow) {
		cached = {
			refreshAfter: nextRefreshAfter(state, now),
			value: dashboard(state, now, options, lessons)
		};
		if (entries.size >= 8) entries.clear();
		entries.set(key, cached);
		Object.defineProperty(owner, DASHBOARD_CACHE, {
			value: entries,
			configurable: true
		});
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
/**
* Serialize a shared query projection for both CLI and typed Remote consumers.
* @param result - shared query facts and projection.
* @returns JSON-compatible data without absent optional fields.
*/
function queryJsonData(result) {
	return result.data === void 0 ? null : z.json().parse(JSON.parse(JSON.stringify(result.data)));
}
//#endregion
export { queryWorkspace as a, itemObjectiveId as c, queryStudy as i, objectiveOf as l, queryDashboard as n, queryWorkspaceDashboard as o, queryJsonData as r, projectWorkspace as s, nextRefreshAfter as t, sheetOpen as u };
