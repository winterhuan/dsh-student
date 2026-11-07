import { curriculumFor } from "../curriculum.js";
/** Time and size constants shared by schedule maths, status text and update handlers. */
export const MINUTE = 60_000;
export const DAY = 86_400_000;
export const OFFSET = 8 * 60 * MINUTE;
/** Calendar day for the Shanghai teaching profile, independent of the host timezone. */
export function studyDay(at) { return new Date(at + OFFSET).toISOString().slice(0, 10); }
export function requireValue(condition, message) {
    if (!condition)
        throw new Error(message);
}
/** Key order is not part of a record. Retries that only reorder fields match. */
export function canonical(value) {
    if (Array.isArray(value))
        return `[${value.map(canonical).join(',')}]`;
    if (value !== null && typeof value === 'object')
        return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(Reflect.get(value, key))}`).join(',')}}`;
    return JSON.stringify(value);
}
export function sameScope(a, b) {
    return a.region === b.region && a.grade === b.grade && a.term === b.term && a.schoolYear === b.schoolYear && a.schoolSystem === b.schoolSystem;
}
export function spent(session, now) {
    if (session.spentMs !== undefined)
        return session.spentMs;
    const end = session.endedAt ?? now;
    return Math.max(0, end - session.startedAt);
}
/** Case, width and surrounding space are not part of a choice or a copied question. */
export function foldText(value) {
    return value.normalize('NFKC').replace(/\u3000/gu, ' ').trim().replace(/\s+/gu, ' ').toLowerCase();
}
export function formatDuration(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    if (minutes === 0)
        return `${seconds}秒`;
    if (seconds === 0)
        return `${minutes}分钟`;
    return `${minutes}分${seconds}秒`;
}
/** Clock time in the Shanghai teaching zone, independent of the host timezone. */
export function beijingClock(at) {
    const shifted = new Date(at + OFFSET);
    return `${String(shifted.getUTCHours()).padStart(2, '0')}:${String(shifted.getUTCMinutes()).padStart(2, '0')}`;
}
export function showValue(value) {
    if (value === undefined)
        return '（无）';
    return typeof value === 'string' ? `「${value}」` : JSON.stringify(value);
}
/**
 * Match a learner's choice to one published option.
 * Letter forms use A for the first option. An ambiguous fold matches none.
 * @param choices - options in display order.
 * @param input - the learner's text after schema trimming.
 * @returns the published option, or undefined when none fits.
 */
export function matchChoice(choices, input) {
    const exact = choices.filter(choice => foldText(choice) === foldText(input));
    if (exact.length === 1)
        return exact[0] ?? undefined;
    if (exact.length > 1)
        return exact.find(choice => choice === input.trim());
    const compact = input.normalize('NFKC').replace(/[\s\u3000]+/gu, '').toLowerCase();
    const letter = compact.match(/^(?:我选择|我选|选择|选的是|选|正确答案是|答案是|答案为|答案|theansweris|option|answer)?[:：]?[(（]?([a-d])[)）.、。:：]?$/u);
    if (!letter?.[1])
        return undefined;
    const index = letter[1].charCodeAt(0) - 97;
    return index >= 0 && index < choices.length ? choices[index] : undefined;
}
export function choiceMismatch(choices, input) {
    const listed = choices.map((choice, index) => `${String.fromCharCode(65 + index)}. ${choice}`).join('；');
    const letters = choices.map((_, index) => String.fromCharCode(65 + index)).join('、');
    return `请选择题目给出的选项之一。可选：${listed}。也可以写 ${letters}，或「A.」「选A」「选择A」「答案是A」。收到：「${input}」。`;
}
export function sameSavedAnswer(task, incoming) {
    if (task.response === undefined)
        return false;
    if (incoming === task.response || incoming === task.rawResponse)
        return true;
    if (foldText(incoming) === foldText(task.response))
        return true;
    if (task.rawResponse !== undefined && foldText(incoming) === foldText(task.rawResponse))
        return true;
    return task.choices !== undefined && matchChoice(task.choices, incoming) === task.response;
}
export function todaySpent(state, now) {
    return state.sessions.filter(session => studyDay(session.startedAt) === studyDay(now)).reduce((sum, session) => sum + spent(session, now), 0);
}
export function activeSession(state) { return state.sessions.find(session => session.endedAt === undefined); }
/** Parent-confirmed class frontier; the default suggestion range, not a hard gate. Absent progress leaves the whole map in scope. */
export function schoolGate(state, subject) {
    const progress = state.courses.find(item => item.subject === subject)?.progress;
    if (!progress)
        return undefined;
    const file = curriculumFor(state.profile, subject);
    const index = file?.units.findIndex(unit => unit.id === progress.unitId) ?? -1;
    if (!file || index < 0)
        return undefined;
    const previewUnit = progress.preview && progress.pace === 'teaching' ? file.units[index + 1]?.id : undefined;
    return {
        taught: new Set(file.units.slice(0, index + 1).map(unit => unit.id)),
        current: progress.unitId,
        ...(previewUnit ? { previewUnit } : {}),
        posture: progress.posture,
        pace: progress.pace,
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
export function taughtUnit(state, subject, unit, scope) {
    if (unit === '')
        return true;
    if (scope !== undefined) {
        if (scope.units !== undefined)
            return scope.units.includes(unit);
        const file = curriculumFor({ grade: scope.grade, term: scope.term }, subject);
        return file?.units.some(item => item.id === unit) ?? false;
    }
    const gate = schoolGate(state, subject);
    if (!gate)
        return true;
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
export function scopeSelects(scope, subject, unit, objectiveId) {
    if (scope.objectiveIds !== undefined)
        return scope.objectiveIds.includes(objectiveId);
    if (unit === '')
        return false;
    if (scope.units !== undefined)
        return scope.units.includes(unit);
    const file = curriculumFor({ grade: scope.grade, term: scope.term }, subject);
    return file?.units.some(item => item.id === unit) ?? false;
}
//# sourceMappingURL=shared.js.map