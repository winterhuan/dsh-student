import { builtinObjective, builtinObjectiveAnywhere, curriculumFor, exercisesForObjective, subjectIdeas } from "../curriculum.js";
import { DAY, studyDay, taughtUnit } from "./shared.js";
import { dayStart } from "./schedule.js";
import { SUBJECT_ORDER, studyInsight } from "./mastery.js";
/**
 * Resolve a learning objective, custom or shipped, across any shipped scope.
 * @param state - current durable learning state.
 * @param objectiveId - objective to resolve.
 * @returns the objective, or undefined when unknown in any shipped map.
 */
export function objectiveOf(state, objectiveId) {
    return state.objectives.find(item => item.id === objectiveId) ?? builtinObjectiveAnywhere(objectiveId);
}
/**
 * Title and subject of a learning objective, custom or shipped, for projections.
 * @param state - current durable learning state.
 * @param objectiveId - objective to resolve.
 * @returns title and subject, or undefined when the objective is unknown in this profile.
 */
export function objectiveInfo(state, objectiveId) {
    const objective = objectiveOf(state, objectiveId);
    return objective ? { title: objective.title, subject: objective.subject } : undefined;
}
/** The goal a worksheet question tests: its own, then its source mistake's, then the sheet's. */
export function itemObjectiveId(state, worksheet, item) {
    return item.objectiveId ?? (item.mistakeId ? state.mistakes.find(mistake => mistake.id === item.mistakeId)?.objectiveId : undefined) ?? worksheet.objectiveId;
}
export function questionObjectiveId(state, worksheet, itemId) {
    const item = worksheet.items.find(question => question.id === itemId);
    return item ? itemObjectiveId(state, worksheet, item) : undefined;
}
/** A printed sheet still waiting for at least one graded question. Discarded sheets never wait. */
export function sheetOpen(state, worksheet) {
    return worksheet.discardedAt === undefined && worksheet.items.some(item => !state.paperResults.some(result => result.worksheetId === worksheet.id && result.itemId === item.id));
}
/** Combine workspace-saved exercises and shipped exercises for one objective, workspace first. */
export function exercisesFor(state, objectiveId) {
    const saved = (state.exercises ?? []).filter(item => item.objectiveId === objectiveId).map(({ savedAt: _savedAt, ...item }) => item);
    const shipped = exercisesForObjective(objectiveId);
    const seen = new Set(saved.map(item => item.id));
    return [...saved, ...shipped.filter(item => !seen.has(item.id))];
}
/** The first hint rung names a condition, character feature or drawing, by the objective's learning method. */
const methodCues = {
    recognize: '先让孩子看偏旁部首想意思，再放进词语或句子里辨析字音字形',
    'read-evidence': '先让孩子带着问题默读或朗读，在文中圈画和问题相关的原句',
    express: '先让孩子按“是谁—什么样—怎么做”口头说顺，再动笔写或借助关键词按顺序复述',
    represent: '先让孩子圈出已知条件和问题，再用小棒、计数器、线段图或点子图画出来建模',
    reason: '先让孩子说出已知什么、要求什么，再用自己的话讲出“先算什么、再算什么、为什么”',
    verify: '先让孩子用加减逆运算、估算比对或换一种算法再查一遍',
    context: '先让孩子看图或进入情境猜意思，说说人物在做什么',
    listen: '先让孩子听读结合字母读音规律（Phonics）留意关键词',
    speak: '先让孩子用句型词块（Chunks）替换关键词，分角色一问一答说出来',
};
/** Build the three-rung hint ladder from the objective's method, registered misconceptions and question points. */
function ladderFor(method, misconceptions, questionPoints) {
    return [
        methodCues[method],
        misconceptions[0] !== undefined ? `让孩子自己核对一个常见错处：${misconceptions[0]}` : '让孩子说说这道题要用哪个方法',
        questionPoints.length > 0 ? `给出步骤提示：${questionPoints.slice(0, 2).join('；')}` : '和孩子一起把这道题的步骤说完整',
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
export function objectiveElements(state, objectiveId) {
    const builtin = builtinObjective(state.profile, objectiveId);
    if (builtin) {
        const concepts = curriculumFor(state.profile, builtin.subject)?.concepts.filter(concept => builtin.conceptIds.includes(concept.id)) ?? [];
        const misconceptions = [...new Set(concepts.flatMap(concept => concept.misconceptions ?? []))].slice(0, 6);
        const questionPoints = [...(builtin.questionPoints ?? [])];
        return {
            facts: [...new Set(concepts.flatMap(concept => concept.facts ?? []))].slice(0, 24),
            misconceptions,
            examples: [...new Set(concepts.flatMap(concept => concept.examples ?? []))].slice(0, 6),
            errorTypes: [...(builtin.errorTypes ?? [])],
            questionPoints,
            variationAxes: [...(builtin.variationAxes ?? [])],
            hintLadder: ladderFor(builtin.method, misconceptions, questionPoints),
            exercises: exercisesFor(state, objectiveId),
        };
    }
    const custom = state.objectives.find(item => item.id === objectiveId);
    if (!custom)
        return undefined;
    const concepts = state.concepts.filter(concept => custom.conceptIds.includes(concept.id));
    const misconceptions = [...new Set(concepts.flatMap(concept => concept.misconceptions ?? []))].slice(0, 6);
    const questionPoints = [...(custom.questionPoints ?? [])];
    return {
        facts: [...new Set(concepts.flatMap(concept => concept.facts ?? []))].slice(0, 24),
        misconceptions,
        examples: [...new Set(concepts.map(concept => concept.example))].slice(0, 6),
        errorTypes: [...(custom.errorTypes ?? [])],
        questionPoints,
        variationAxes: [...(custom.variationAxes ?? [])],
        hintLadder: ladderFor(custom.method, misconceptions, questionPoints),
        exercises: exercisesFor(state, objectiveId),
    };
}
/** Pick the best matching reference exercise for a target variant and optional error cause. */
function pickReferenceExercise(items, variant, errorType) {
    if (items.length === 0)
        return undefined;
    return items.find(item => item.variant === variant && errorType !== undefined && item.errorType === errorType)
        ?? items.find(item => item.variant === variant)
        ?? items.find(item => errorType !== undefined && item.errorType === errorType)
        ?? items[0];
}
/** Ladder level for one review question: numeric retests first, then context, then reasoning. */
function variantLevelFor(stage, recurringCause = false) {
    const level = stage >= 3 ? 'reasoning' : stage >= 2 ? 'context' : 'numeric';
    return recurringCause && level === 'numeric' ? 'context' : level;
}
/** Whether the mistake's goal carries a recurring error cause: two or more active mistakes sharing it. */
function recurringCauseOn(state, mistake) {
    if (mistake.objectiveId === undefined || mistake.errorType === undefined)
        return false;
    return state.mistakes.filter(other => other.confirmedAt !== undefined && other.objectiveId === mistake.objectiveId && other.stage < 4 && other.errorType === mistake.errorType).length >= 2;
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
export function reviewPlan(state, subject, now, size = 8, insight) {
    const horizon = dayStart(studyDay(now + DAY)) + DAY;
    const open = state.worksheets.filter(sheet => sheet.subject === subject && sheetOpen(state, sheet));
    const printed = new Set(open.flatMap(sheet => sheet.items.flatMap(item => item.mistakeId ? [item.mistakeId] : [])));
    const due = state.mistakes.filter(item => item.subject === subject && item.confirmedAt !== undefined && item.dueAt !== undefined && item.dueAt < horizon);
    const current = insight ?? studyInsight(state, now);
    const unitOf = (objectiveId) => current.objectives.find(item => item.id === objectiveId)?.unit ?? '';
    const candidates = due.filter(item => item.objectiveId !== undefined && taughtUnit(state, item.subject, unitOf(item.objectiveId)) && !printed.has(item.id))
        .sort((a, b) => a.stage - b.stage || (a.dueAt ?? 0) - (b.dueAt ?? 0));
    const picks = [];
    const perCause = new Map();
    for (const item of candidates) {
        if (picks.length >= Math.max(1, size - 2))
            break;
        if (item.errorType !== undefined && (perCause.get(item.errorType) ?? 0) >= 2)
            continue;
        if (item.errorType !== undefined)
            perCause.set(item.errorType, (perCause.get(item.errorType) ?? 0) + 1);
        const elements = item.objectiveId !== undefined ? objectiveElements(state, item.objectiveId) : undefined;
        const variantLevel = variantLevelFor(item.stage, recurringCauseOn(state, item));
        const referenceExercise = elements ? pickReferenceExercise(elements.exercises, variantLevel, item.errorType) : undefined;
        picks.push({
            kind: 'mistake', id: item.id, objectiveId: item.objectiveId ?? '', objectiveTitle: objectiveInfo(state, item.objectiveId ?? '')?.title ?? '',
            topic: item.topic, prompt: item.prompt, learnerAnswer: item.learnerAnswer, correction: item.correction, explanation: item.explanation,
            stage: item.stage, dueToday: (item.dueAt ?? 0) <= now, variantLevel,
            ...(item.errorType !== undefined ? { errorType: item.errorType } : {}),
            ...(elements !== undefined ? { elements } : {}),
            ...(referenceExercise !== undefined ? { referenceExercise } : {}),
        });
    }
    const covered = new Set([
        ...picks.map(item => item.objectiveId),
        ...open.flatMap(sheet => sheet.items.map(item => itemObjectiveId(state, sheet, item))).filter((value) => value !== undefined),
    ]);
    const objectiveFills = current.weakPoints
        .filter(item => taughtUnit(state, item.subject, item.unit) && !covered.has(item.id))
        .slice(0, Math.min(2, Math.max(0, size - picks.length)))
        .map((item) => {
        const elements = objectiveElements(state, item.id);
        const referenceExercise = elements ? pickReferenceExercise(elements.exercises, 'numeric') : undefined;
        return {
            kind: 'objective', id: item.id, objectiveId: item.id, title: item.title, level: item.level, variantLevel: 'numeric',
            ...(elements !== undefined ? { elements } : {}),
            ...(referenceExercise !== undefined ? { referenceExercise } : {}),
        };
    });
    const coverage = new Map();
    for (const pick of picks)
        if (pick.errorType !== undefined)
            coverage.set(pick.errorType, (coverage.get(pick.errorType) ?? 0) + 1);
    return {
        subject, picks, objectiveFills,
        errorCoverage: [...coverage.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
        remaining: candidates.length - picks.length,
        unlinkedDue: due.filter(item => item.objectiveId === undefined).map(item => item.id),
        openSheets: open.map(sheet => ({ id: sheet.id, createdAt: sheet.createdAt, items: sheet.items.length, graded: state.paperResults.filter(result => result.worksheetId === sheet.id).length })),
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
export function curriculumView(state, subject, insight, scope) {
    const target = scope ?? { grade: state.profile.grade, term: state.profile.term };
    const file = curriculumFor(target, subject);
    if (!file)
        return null;
    const current = target.grade === state.profile.grade && target.term === state.profile.term;
    const objectives = current
        ? insight.objectives.filter(item => item.subject === subject && file.objectives.some(objective => objective.id === item.id))
        : file.objectives.map(objective => {
            const unit = file.concepts.find(concept => concept.id === objective.conceptIds[0])?.unit ?? '';
            return { ...objective, subject, unit, unitName: file.units.find(item => item.id === unit)?.name ?? '', level: 'untouched', independentDays: 0, attempts: 0, helpedOrWrong: 0, activeMistakes: 0, dueMistakes: 0, masteredMistakes: 0, errorTypes: [], priority: 0, reasons: [{ code: 'not-started', count: 0 }] };
        });
    const levelOf = (levels) => {
        if (levels.length === 0 || levels.every(level => level === 'untouched'))
            return 'untouched';
        if (levels.every(level => level === 'mastered'))
            return 'mastered';
        if (levels.includes('due'))
            return 'due';
        if (levels.includes('weak'))
            return 'weak';
        if (levels.includes('stalled'))
            return 'stalled';
        return 'practising';
    };
    const concepts = file.concepts.map(concept => {
        const linked = objectives.filter(objective => objective.conceptIds.includes(concept.id));
        const lastAt = linked.reduce((latest, item) => item.lastAt !== undefined && (latest === undefined || item.lastAt > latest) ? item.lastAt : latest, undefined);
        return { id: concept.id, name: concept.name, unit: concept.unit, definition: concept.definition, example: concept.example, source: concept.source, ...(concept.ideaIds !== undefined ? { ideaIds: concept.ideaIds } : {}), ...(concept.facts !== undefined ? { facts: concept.facts } : {}),
            level: levelOf(linked.map(item => item.level)), objectiveIds: linked.map(item => item.id), ...(lastAt !== undefined ? { lastAt } : {}),
            independentDays: Math.max(0, ...linked.map(item => item.independentDays)),
            attempts: linked.reduce((sum, item) => sum + item.attempts, 0),
            activeMistakes: linked.reduce((sum, item) => sum + item.activeMistakes, 0),
            dueMistakes: linked.reduce((sum, item) => sum + item.dueMistakes, 0) };
    });
    const units = file.units.map(unit => {
        const own = concepts.filter(concept => concept.unit === unit.id);
        return { id: unit.id, name: unit.name, summary: unit.summary, ...(unit.focus !== undefined ? { focus: unit.focus } : {}), concepts: own.length,
            mastered: own.filter(item => item.level === 'mastered').length,
            learning: own.filter(item => item.level === 'practising' || item.level === 'stalled').length,
            weak: own.filter(item => item.level === 'weak').length,
            due: own.filter(item => item.level === 'due').length,
            untouched: own.filter(item => item.level === 'untouched').length };
    });
    const summary = { concepts: concepts.length, objectives: objectives.length,
        mastered: concepts.filter(item => item.level === 'mastered').length,
        practising: concepts.filter(item => item.level === 'practising').length,
        weak: concepts.filter(item => item.level === 'weak').length,
        due: concepts.filter(item => item.level === 'due').length,
        stalled: concepts.filter(item => item.level === 'stalled').length,
        untouched: concepts.filter(item => item.level === 'untouched').length };
    const prerequisites = file.relations.filter(relation => relation.kind === 'prerequisite');
    const remaining = file.concepts.map(concept => concept.id);
    const order = [];
    while (remaining.length > 0) {
        const ready = remaining.find(id => !prerequisites.some(relation => relation.toId === id && remaining.includes(relation.fromId))) ?? remaining[0];
        if (ready === undefined)
            break;
        order.push(ready);
        remaining.splice(remaining.indexOf(ready), 1);
    }
    return { id: file.id, title: file.title, basis: file.basis, units, ideas: subjectIdeas(file.subject), concepts, objectives, summary, scope: { grade: target.grade, term: target.term, current }, order, lite: false,
        relations: file.relations.map(relation => ({ id: relation.id, fromId: relation.fromId, toId: relation.toId, kind: relation.kind, explanation: relation.explanation })) };
}
/**
 * Recent check-in blocks per subject, newest first, with per-answer results and counts.
 * @param state - current durable learning state.
 * @param limitPerSubject - how many recent blocks to keep for each subject.
 * @returns check-in records across the three subjects.
 */
export function checkInHistory(state, limitPerSubject = 5) {
    return SUBJECT_ORDER.flatMap(subject => state.sessions.filter(item => item.mode === 'diagnose' && item.subject === subject).slice(-limitPerSubject).reverse().map(session => {
        const results = state.attempts.filter(item => item.sessionId === session.id).map(item => ({
            id: item.id, objectiveId: item.objectiveId ?? null, result: item.result, assistance: item.assistance,
            title: item.objectiveId ? objectiveInfo(state, item.objectiveId)?.title ?? item.topic : item.topic,
        }));
        return { subject, sessionId: session.id, startedAt: session.startedAt, endedAt: session.endedAt ?? null, intensity: session.intensity ?? 'standard', results,
            counts: {
                independent: results.filter(item => item.result === 'correct' && item.assistance === 'independent').length,
                helped: results.filter(item => item.result === 'correct' && item.assistance !== 'independent').length,
                wrong: results.filter(item => item.result === 'incorrect' || item.result === 'partial').length,
                unassessed: results.filter(item => item.result === 'unassessed').length,
            } };
    }));
}
//# sourceMappingURL=view.js.map