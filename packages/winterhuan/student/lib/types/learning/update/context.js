import { canonical, foldText, requireValue, sameSavedAnswer, showValue } from "../shared.js";
import { itemObjectiveId } from "../view.js";
export function alignRecord(task, attempt) {
    const demoNote = task.phase === 'demo' && task.response === undefined;
    if (!demoNote && task.response === undefined)
        throw new Error(`请先用 answer 保存原始回答，再记录反馈。当前题目 id：${task.id}。`);
    const problems = [];
    if (attempt.id !== task.id)
        problems.push(`id 不一致。期望：${showValue(task.id)}。收到：${showValue(attempt.id)}。`);
    if (foldText(attempt.topic) !== foldText(task.topic))
        problems.push(`topic 不一致。期望：${showValue(task.topic)}。收到：${showValue(attempt.topic)}。`);
    if (foldText(attempt.prompt) !== foldText(task.prompt))
        problems.push(`prompt 不一致。期望：${showValue(task.prompt)}。收到：${showValue(attempt.prompt)}。`);
    if (!demoNote && !sameSavedAnswer(task, attempt.response)) {
        const expected = task.rawResponse !== undefined && task.rawResponse !== task.response ? `${showValue(task.response)}（原始输入：${showValue(task.rawResponse)}）` : showValue(task.response);
        problems.push(`response 不一致。期望：${expected}。收到：${showValue(attempt.response)}。`);
    }
    for (const field of ['mistakeId', 'objectiveId', 'variant']) {
        if (attempt[field] !== undefined && attempt[field] !== task[field])
            problems.push(`${field} 不一致。期望：${showValue(task[field])}。收到：${showValue(attempt[field])}。`);
    }
    if (attempt.figure !== undefined && canonical(attempt.figure) !== canonical(task.figure ?? null))
        problems.push(`figure 不一致。期望：${showValue(task.figure ?? null)}。收到：${showValue(attempt.figure)}。`);
    if (problems.length > 0)
        throw new Error(`反馈必须对应当前题目和已保存的原始回答。${problems.join('')}`);
    return {
        ...attempt,
        id: task.id,
        topic: task.topic,
        prompt: task.prompt,
        response: demoNote ? attempt.response : task.response ?? attempt.response,
        ...(task.mistakeId !== undefined ? { mistakeId: task.mistakeId } : {}),
        ...(task.objectiveId !== undefined ? { objectiveId: task.objectiveId } : {}),
        ...(task.variant !== undefined ? { variant: task.variant } : {}),
        ...(task.figure !== undefined ? { figure: task.figure } : {}),
    };
}
/** Omitted assistance follows the current step: a demo is a worked example, a hint or a guide step is help, and everything else is independent. */
export function resolveAssistance(task, assistance) {
    if (assistance !== undefined)
        return assistance;
    if (task?.phase === 'demo')
        return 'worked-example';
    if ((task?.hintLevel ?? 0) > 0 || task?.phase === 'guide')
        return 'hint';
    return 'independent';
}
/** An independent correct answer finishes teaching for that objective. */
export function dropTaught(state, objectiveId) {
    if (objectiveId === undefined)
        return;
    state.teachingQueue = state.teachingQueue.filter(item => item.objectiveId !== objectiveId);
}
/**
 * Save one graded question. A changed grade replaces the earlier one and keeps its original day.
 * A wrong or partial answer to a new question becomes a confirmed mistake on that question's goal;
 * regrading it correct removes that mistake again unless other answers already cite it.
 * @returns whether anything changed.
 */
export function gradeItem(state, worksheet, item, entry, errorType) {
    const index = state.paperResults.findIndex(result => result.worksheetId === worksheet.id && result.itemId === item.id);
    const previous = state.paperResults[index];
    if (previous) {
        const { receivedAt: _before, ...stored } = previous;
        const { receivedAt: _now, ...next } = entry;
        if (canonical(stored) === canonical(next))
            return false;
        state.paperResults.splice(index, 1);
    }
    state.paperResults.push(previous ? { ...entry, receivedAt: previous.receivedAt } : entry);
    const linked = item.mistakeId ? state.mistakes.find(mistake => mistake.id === item.mistakeId) : undefined;
    const fromHere = linked?.source !== undefined && linked.source.worksheetId === worksheet.id && linked.source.itemId === item.id;
    const wrong = entry.result === 'incorrect' || entry.result === 'partial';
    if (linked && wrong && errorType !== undefined)
        linked.errorType = errorType;
    if (linked && fromHere) {
        if (wrong) {
            linked.learnerAnswer = entry.response;
            linked.answerEvidence = entry.answerEvidence;
            return true;
        }
        const citedElsewhere = state.attempts.some(attempt => attempt.mistakeId === linked.id)
            || state.worksheets.some(sheet => sheet.items.some(question => question !== item && question.mistakeId === linked.id));
        if (!citedElsewhere) {
            state.mistakes = state.mistakes.filter(mistake => mistake !== linked);
            delete item.mistakeId;
        }
        return true;
    }
    if (!linked && wrong) {
        const objectiveId = itemObjectiveId(state, worksheet, item);
        const id = practiceMistakeId(state, worksheet.id, item.id);
        state.mistakes.push({
            id, subject: worksheet.subject, topic: item.prompt.slice(0, 60), prompt: item.prompt, learnerAnswer: entry.response,
            correction: item.answer, explanation: item.explanation, answerEvidence: entry.answerEvidence, uncertainties: '',
            ...(objectiveId ? { objectiveId } : {}), ...(errorType ? { errorType } : {}), confirmedAt: entry.receivedAt, userConfirmation: entry.userConfirmation,
            source: { worksheetId: worksheet.id, itemId: item.id }, stage: 0, independentDays: [],
        });
        item.mistakeId = id;
    }
    if (entry.result === 'correct' && entry.assistance === 'independent')
        dropTaught(state, itemObjectiveId(state, worksheet, item));
    return true;
}
export function practiceMistakeId(state, worksheetId, itemId) {
    const base = `w-${worksheetId}-${itemId}`.slice(0, 80);
    if (!state.mistakes.some(item => item.id === base))
        return base;
    const extra = `-${state.mistakes.length}`;
    return `${base.slice(0, 80 - extra.length)}${extra}`;
}
/** Reject conflicting reuse of an existing record ID; an identical retry reports a no-op. */
export function duplicate(items, matches, equal) {
    const existing = items.find(matches);
    if (existing === undefined)
        return false;
    requireValue(equal(existing), '该记录 ID 已用于另一条内容。完全相同的重试会直接成功；新的一条请换一个 ID。');
    return true;
}
//# sourceMappingURL=context.js.map