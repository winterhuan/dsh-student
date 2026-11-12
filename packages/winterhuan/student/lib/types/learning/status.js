import { DAY, activeSession, formatDuration, studyDay, todaySpent } from "./shared.js";
import { interestFocus, interestTagsOf } from "../interests.js";
import { effectiveOpenmaicBase, OPENMAIC_COOKIE_PATH, OPENMAIC_LESSONS_PATH } from "../openmaic.js";
import { studyInsight } from "./mastery.js";
import { evidenceOf, evidenceDay, evidenceAtCutoff, attachEvidence } from "./evidence.js";
import { dayStart, replayMistake, scheduleMistakes } from "./schedule.js";
import { objectiveInfo } from "./view.js";
/**
 * Elapsed clocks for the current block and today, computed from sessions only.
 * Reading never closes a session.
 */
export function timeStatus(state, now) {
    const active = activeSession(state);
    const todayMs = todaySpent(state, now);
    const phase = active ? 'studying' : 'ready';
    const blockElapsedMs = active ? Math.max(0, now - active.startedAt) : 0;
    return {
        phase,
        time: {
            timezone: 'Asia/Shanghai',
            blockElapsed: active ? formatDuration(blockElapsedMs) : null,
            todayElapsed: formatDuration(todayMs),
        },
    };
}
/**
 * Summarize elapsed time, course confirmation, rewards and evidence-derived progress.
 * Reading does not close a session; stop records when the learner actually stopped.
 */
export function studyStatus(state, now) {
    const time = timeStatus(state, now);
    const progress = new Map();
    function includeEvidence(subject, topic, at, result, assistance, materialId, objectiveId) {
        const key = objectiveId ?? JSON.stringify([subject, topic, materialId]);
        const item = progress.get(key) ?? { subject, topic, ...(materialId ? { materialId } : {}), ...(objectiveId ? { objectiveId } : {}), attempts: 0, independentDays: [] };
        item.attempts += 1;
        // Distinct independent days stay. A later hint does not erase them; map mastery still withholds mastered while recent help is inside 14 days.
        if (at !== undefined && result === 'correct' && assistance === 'independent' && !item.independentDays.includes(studyDay(at)))
            item.independentDays.push(studyDay(at));
        progress.set(key, item);
    }
    for (const entry of evidenceOf(state).entries) {
        const day = evidenceDay(entry);
        const goal = entry.objectiveId ? objectiveInfo(state, entry.objectiveId) : undefined;
        includeEvidence(entry.subject, goal?.title ?? entry.topic, day === undefined ? undefined : dayStart(day), entry.result, entry.assistance, undefined, entry.objectiveId);
    }
    const interests = interestTagsOf(state.interests?.tags);
    return {
        task: state.task ?? null, feedback: state.task ? state.attempts.find(item => item.sessionId === state.task.sessionId && (state.task.responseId ? item.responseId === state.task.responseId : item.questionId === undefined && item.id === state.task.id)) ?? null : null,
        revision: state.revision, profile: state.profile, interests, interestFocus: interestFocus(interests, studyDay(now)), ...time, active: activeSession(state) ?? null,
        openmaic: {
            baseUrl: effectiveOpenmaicBase(state.openmaic?.baseUrl, process.env.OPENMAIC_BASE),
            savedBaseUrl: state.openmaic?.baseUrl ?? '',
            lessonsPath: OPENMAIC_LESSONS_PATH,
            cookiePath: OPENMAIC_COOKIE_PATH,
        },
        courses: state.courses, unconfirmedSubjects: ['chinese', 'math', 'english'].filter(subject => !state.courses.some(course => course.subject === subject)),
        stars: state.rewards.length, todayStars: state.rewards.filter(reward => reward.day === studyDay(now)).length,
        dueMistakes: state.mistakes.filter(mistake => mistake.dueAt !== undefined && mistake.dueAt <= now).map(mistake => ({ id: mistake.id, subject: mistake.subject, topic: mistake.topic })),
        pendingMistakes: state.mistakes.filter(mistake => mistake.confirmedAt === undefined).map(mistake => mistake.id),
        progress: [...progress.values()].map(item => ({ ...item, level: item.independentDays.length >= 3 ? 'independent-on-three-days' : 'practising' })),
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
export function weeklySummary(state, now, insight) {
    const days = Array.from({ length: 7 }, (_, index) => studyDay(now - (6 - index) * DAY));
    const daySet = new Set(days);
    const minutesByDay = summaryMinutes(state, now);
    const windowStart = dayStart(days[0]);
    const index = evidenceOf(state);
    const entries = evidenceAtCutoff(index, now);
    const practised = new Set(entries.filter(item => daySet.has(evidenceDay(item))).flatMap(item => item.objectiveId ? [item.objectiveId] : []));
    const checkpoints = [...new Set(entries.map(item => item.answerDate.kind === 'instant' ? item.answerDate.at : dayStart(evidenceDay(item)) + DAY - 1))].filter(at => at <= now || studyDay(at) === studyDay(now)).sort((a, b) => a - b);
    const ever = new Set();
    const troubled = new Set();
    const first = new Map();
    const recovered = new Map();
    for (const at of checkpoints) {
        const currentEntries = entries.filter(item => item.answerDate.kind === 'instant' ? item.answerDate.at === at : dayStart(evidenceDay(item)) + DAY - 1 === at);
        const beforeAt = currentEntries.some(item => item.answerDate.kind === 'day') ? dayStart(studyDay(at)) : at - 1;
        const before = structuredClone(state);
        attachEvidence(before, { entries: index.entries.filter(item => item.answerDate.kind === 'instant' ? item.answerDate.at < at : item.answerDate.kind === 'day' ? item.answerDate.day < studyDay(at) : false), stuckSignals: index.stuckSignals.filter(signal => signal.at <= beforeAt) });
        scheduleMistakes(before, beforeAt);
        for (const goal of studyInsight(before, beforeAt).objectives)
            if (ever.has(goal.id) && (goal.level === 'due' || goal.level === 'weak'))
                troubled.add(goal.id);
        const historical = structuredClone(state);
        historical.mistakes = historical.mistakes.filter(item => item.confirmedAt === undefined || item.confirmedAt <= at);
        historical.teachingQueue = historical.teachingQueue.filter(item => item.confirmedAt <= at);
        historical.sessions = historical.sessions.filter(item => item.startedAt <= at);
        attachEvidence(historical, index);
        scheduleMistakes(historical, at);
        const historicalInsight = studyInsight(historical, at);
        const answered = new Set(currentEntries.filter(item => item.result === 'correct' && item.assistance === 'independent').flatMap(item => item.objectiveId ? [item.objectiveId] : []));
        for (const goal of historicalInsight.objectives) {
            if (ever.has(goal.id) && (goal.level === 'due' || goal.level === 'weak'))
                troubled.add(goal.id);
            if (goal.level !== 'mastered' || !answered.has(goal.id))
                continue;
            if (!ever.has(goal.id)) {
                first.set(goal.id, studyDay(at));
                ever.add(goal.id);
            }
            else if (troubled.has(goal.id)) {
                recovered.set(goal.id, studyDay(at));
                troubled.delete(goal.id);
            }
        }
    }
    const currentMastered = new Set(insight.objectives.filter(goal => goal.level === 'mastered').map(goal => goal.id));
    const practisedGoals = practised.size;
    const masteredGoals = [...first].filter(([goal, day]) => currentMastered.has(goal) && daySet.has(day)).length;
    const recoveredGoals = [...recovered].filter(([goal, day]) => currentMastered.has(goal) && daySet.has(day)).length;
    const newMistakes = state.mistakes.filter(mistake => mistake.confirmedAt !== undefined && mistake.confirmedAt >= windowStart && mistake.confirmedAt <= now).length;
    const replay = state.mistakes.map(mistake => replayMistake(mistake, index, now, windowStart));
    const consolidatedMistakes = replay.filter(item => item.consolidatedDay !== undefined && daySet.has(item.consolidatedDay)).length;
    const dueCompletion = { done: replay.filter(item => item.completed).length, total: replay.filter(item => item.opportunity).length };
    const causeCounts = new Map();
    for (const mistake of state.mistakes) {
        if (mistake.confirmedAt === undefined || mistake.confirmedAt < windowStart || mistake.confirmedAt > now || mistake.errorType === undefined)
            continue;
        causeCounts.set(mistake.errorType, (causeCounts.get(mistake.errorType) ?? 0) + 1);
    }
    const errorCauses = [...causeCounts.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)).slice(0, 3);
    return { minutesByDay, activeDays: minutesByDay.filter(item => item.minutes > 0).length, practisedGoals, masteredGoals, recoveredGoals, newMistakes, consolidatedMistakes, dueCompletion, errorCauses, suggestion: insight.recommendation };
}
/**
 * Cheap elapsed-minute projection for Shanghai today and the preceding six calendar days.
 * @param state - block timing records; answers and grading times are unused.
 * @param now - explicit current clock.
 * @returns per-day minutes with midnight-crossing blocks split across their actual calendar days.
 */
export function summaryMinutes(state, now) {
    return Array.from({ length: 7 }, (_, index) => {
        const day = studyDay(now - (6 - index) * DAY);
        const start = dayStart(day);
        const milliseconds = state.sessions.reduce((sum, block) => sum + Math.max(0, Math.min(block.endedAt ?? now, start + DAY, now) - Math.max(block.startedAt, start)), 0);
        return { day, minutes: Math.round(milliseconds / 60_000) };
    });
}
//# sourceMappingURL=status.js.map