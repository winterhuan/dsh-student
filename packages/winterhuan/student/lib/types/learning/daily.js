import { createHash } from 'node:crypto';
import { effectiveKnowledge, scopeSupports } from "../capabilities.js";
import { learningContinuation, SUBJECT_ORDER } from "./mastery.js";
import { evidenceOf, evidenceDay } from "./evidence.js";
import { canonical, studyDay } from "./shared.js";
/** Recommend from actual answers; opening this projection never writes or starts teaching. */
export function dailyLearning(read, state, now, selectedSubject, requestedDay) {
    const workspace = read.workspace;
    const { settings, blocks, plans = [] } = workspace;
    const day = requestedDay ?? studyDay(now);
    const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
    const entries = evidenceOf(state).entries;
    const confirmed = SUBJECT_ORDER.filter(subject => settings.learningScopes?.some(scope => scope.subject === subject));
    const continuation = (subject, main = false) => learningContinuation(workspace, state, now, subject, read.sourceVerification, main ? 'main' : undefined);
    const all = continuation();
    const active = blocks.find(block => block.endedAt === undefined);
    const originalDay = active?.plan?.day;
    const today = plans.find(plan => plan.day === day);
    const original = plans.find(plan => plan.day === originalDay);
    const finished = blocks.filter(block => block.plan && block.endedAt !== undefined && studyDay(block.endedAt) === day).sort((a, b) => b.endedAt - a.endedAt)[0];
    const closed = plans.find(plan => plan.day === finished?.plan?.day && ['completed', 'stopped', 'paused'].includes(plan.state));
    const saved = (!requestedDay && original && original.tasks.some(task => task.activity?.blockId === active?.id && task.state !== 'carried-forward') ? original : today ?? (!requestedDay ? closed : undefined)) ?? null;
    const current = saved?.tasks.find(task => task.state === 'active') ?? saved?.tasks.find(task => task.state === 'paused') ?? saved?.tasks.find(task => task.state === 'ready' && (saved.state !== 'completed' || task.optional));
    const actualDays = [...new Set(entries.filter(entry => entry.sourceStatus === 'known' && entry.result !== 'unassessed').flatMap(entry => { const day = evidenceDay(entry); return day ? [day] : []; }))].filter(date => date <= day).sort().reverse().slice(0, 3);
    const lastMain = (subject) => actualDays.find(date => entries.some(entry => entry.subject === subject && evidenceDay(entry) === date && entry.sourceStatus === 'known' && entry.result !== 'unassessed' && plans.some(plan => plan.tasks.some(task => task.subject === subject && task.purpose !== 'review' && task.activity?.blockId === entry.ownerId)))) ?? '';
    const subjectOrder = [...confirmed].sort((a, b) => lastMain(a).localeCompare(lastMain(b)) || (settings.learningScopes?.findIndex(scope => scope.subject === a) ?? 0) - (settings.learningScopes?.findIndex(scope => scope.subject === b) ?? 0));
    const suggestion = (next) => {
        const owner = blocks.find(block => block.id === next.blockId);
        const binding = owner?.questions.find(question => question.id === next.questionId)?.capability;
        const goalId = next.goalId ?? binding?.goalId;
        const scope = next.scope ?? binding?.scope;
        const purpose = next.blockId ? 'resume' : next.kind === 'teach' ? 'teaching' : next.kind === 'review' ? 'review' : next.kind === 'learn' && !all.goalProgress.some(item => item.id === goalId && item.feedback.some(row => row.sourceStatus === 'known')) ? 'diagnostic' : 'learning';
        const familyIds = next.review?.familyIds.filter(id => knowledge.families.some(family => family.id === id)) ?? (next.familyId ? [next.familyId] : []);
        const basis = entries.filter(entry => entry.subject === next.subject && entry.termId === settings.termId && entry.sourceStatus === 'known' && (next.blockId ? entry.ownerId === next.blockId : entry.capability?.goalId === goalId)).slice(-20).map(entry => ({ termId: settings.termId, ownerKind: entry.ownerKind, ownerId: entry.ownerId, responseId: entry.responseId }));
        const id = `task-${createHash('sha256').update(canonical([day, purpose, next.subject, goalId, scope, next.blockId, familyIds])).digest('hex').slice(0, 20)}`;
        const task = { id, subject: next.subject, purpose, ...(goalId ? { goalId } : {}), ...(scope ? { scope } : {}), familyIds, reason: next.reason, basis, ending: next.blockId ? 'original-activity' : next.kind === 'review' ? 'review-attempts' : 'short-check', state: 'ready', outcomes: [], ...(next.blockId ? { activity: { blockId: next.blockId, ...(next.roundId ? { roundId: next.roundId } : {}), ...(next.questionId ? { questionId: next.questionId } : {}), ...(next.responseId ? { responseId: next.responseId } : {}) } } : {}) };
        const prior = plans.find(plan => plan.day < day && plan.tasks.some(task => task.activity?.blockId === next.blockId && !task.original));
        const priorTask = prior?.tasks.find(task => task.activity?.blockId === next.blockId && !task.original);
        if (prior && priorTask)
            task.original = { day: prior.day, taskId: priorTask.id };
        const { requirement: _requirement, ...nextAction } = next;
        return { task, nextAction };
    };
    const executable = (action) => !!action && (action.kind !== 'hold' || !!action.blockId);
    const mains = subjectOrder.flatMap(subject => { const next = continuation(subject, true).nextAction; return executable(next) ? [suggestion(next)] : []; });
    const priority = (item) => item.nextAction.blockId ? 0 : item.nextAction.kind === 'teach' ? 1 : 2;
    mains.sort((a, b) => priority(a) - priority(b));
    const main = active && executable(all.nextAction) ? suggestion(all.nextAction) : mains[0];
    let reviewRemaining = all.reviewRound.remaining;
    const reviews = [];
    for (const subject of subjectOrder) {
        const next = continuation(subject).nextAction;
        if (!reviewRemaining || next?.kind !== 'review' || next.blockId || !next.goalId || !next.scope)
            continue;
        const candidate = suggestion(next);
        candidate.task.familyIds = candidate.task.familyIds.slice(0, reviewRemaining);
        // Each task owns one goal/range; another family's original binding gets its own recommendation.
        candidate.task.familyIds = candidate.task.familyIds.filter(id => knowledge.families.find(family => family.id === id)?.goalIds.includes(candidate.task.goalId));
        if (!candidate.task.familyIds.length || main?.task.goalId === candidate.task.goalId && canonical(main?.task.scope) === canonical(candidate.task.scope))
            continue;
        candidate.nextAction = { ...candidate.nextAction, review: { mistakeIds: next.review.mistakeIds.filter(id => entries.some(entry => entry.mistakeId === id && entry.capability && entry.capability.goalId === candidate.task.goalId && candidate.task.familyIds.includes(entry.capability.familyId) && scopeSupports(candidate.task.scope, entry.capability.scope))), familyIds: candidate.task.familyIds, remaining: candidate.task.familyIds.length } };
        reviews.push(candidate);
        reviewRemaining -= candidate.task.familyIds.length;
    }
    const suggestions = [...(main ? [main] : []), ...mains, ...reviews].filter((item, index, list) => list.findIndex(other => other.task.id === item.task.id) === index);
    const recommended = selectedSubject ? suggestions.filter(item => item.task.subject === selectedSubject) : [...(main ? [main] : []), ...reviews];
    const settingsVersion = String(read.files.find(file => file.path === '.study/settings.json')?.version ?? settings.revision);
    const preview = settings.learnerId && recommended.length && day === studyDay(now) ? { format: 2, kind: 'daily-plan', learnerId: settings.learnerId, termId: settings.termId, id: `day-${day}`, day, timezone: 'Asia/Shanghai', revision: 1, createdAt: now, updatedAt: now, policyVersion: 1, settingsVersion, subjects: [...new Set(recommended.map(item => item.task.subject))], state: 'ready', tasks: recommended.map(item => item.task), choices: [{ id: `start-${day}`, at: now, revision: 1, action: 'start', reason: 'Explicitly start the displayed recommendations.', taskIds: recommended.map(item => item.task.id), replacedTaskIds: [] }] } : null;
    const outcomes = (rows) => ({ attempted: rows.length, independent: rows.filter(entry => entry.sourceStatus === 'known' && entry.result === 'correct' && entry.assistance === 'independent').length, helped: rows.filter(entry => entry.sourceStatus === 'known' && ['hint', 'worked-example'].includes(entry.assistance)).length, pending: rows.filter(entry => entry.sourceStatus !== 'known' || entry.result === 'unassessed' || entry.assistance === 'unknown' || entry.answerDate.kind === 'unknown').length, consolidate: rows.filter(entry => entry.sourceStatus === 'known' && (['incorrect', 'partial', 'stuck'].includes(entry.result) || ['hint', 'worked-example'].includes(entry.assistance))).length });
    const tasks = (saved?.tasks ?? []).map(task => ({ task, title: knowledge.goals.find(goal => goal.id === task.goalId)?.title ?? blocks.find(block => block.id === task.activity?.blockId)?.questions.find(question => question.id === task.activity?.questionId)?.topic ?? task.reason, ...outcomes(entries.filter(entry => entry.termId === settings.termId && entry.ownerKind === 'block' && entry.ownerId === task.activity?.blockId)), invalidScope: !!task.scope && !settings.learningScopes?.some(scope => scope.subject === task.subject && (!scope.goalIds || scope.goalIds.includes(task.goalId)) && scopeSupports(scope.scope, task.scope)), preparationIncomplete: ['active', 'ready'].includes(task.state) && !task.activity }));
    const summary = SUBJECT_ORDER.map(subject => ({ subject, ...outcomes(entries.filter(entry => entry.subject === subject && evidenceDay(entry) === day)) })).filter(item => item.attempted > 0);
    const currentAction = saved?.state === 'completed' && !current?.optional ? null : current?.activity ? continuation(current.subject).nextAction : current ? suggestions.find(item => item.task.subject === current.subject && item.task.goalId === current.goalId)?.nextAction ?? null : all.nextAction;
    const optionalActive = saved?.tasks.some(task => task.optional && task.state === 'active');
    const phase = saved && ['completed', 'stopped', 'paused'].includes(saved.state) && !optionalActive ? 'summary' : active || saved?.state === 'active' || optionalActive ? 'learning' : 'home';
    const scopeSuggestions = SUBJECT_ORDER.flatMap(subject => {
        const candidates = knowledge.goals.filter(goal => goal.subject === subject && !goal.id.startsWith('e.listen') && !goal.id.startsWith('e.speak') && !['e.sound', 'e.view-listen', 'c.read-aloud', 'c.recite', 'c.retell', 'c.describe', 'c.interact', 'c.listen'].includes(goal.id)).slice(0, 3);
        return candidates.length ? [{ subject, goalIds: candidates.map(goal => goal.id), scope: { id: `${subject}-foundations`, description: subject === 'math' ? '20 以内按物点数、理解零与数的分合' : subject === 'chinese' ? '书面辨认拼音、声调与拼读音节' : '借助图片认读常见英语词语、短句与短故事', modality: 'written', ...(subject === 'math' ? { numberMax: 20 } : {}) }, titles: candidates.map(goal => goal.title) }] : [];
    });
    const completionPending = !!saved?.tasks.some(task => task.state === 'completed' && task.outcomes.some(reference => !entries.some(entry => entry.termId === reference.termId && entry.ownerKind === reference.ownerKind && entry.ownerId === reference.ownerId && entry.responseId === reference.responseId && entry.sourceStatus === 'known' && entry.result !== 'unassessed')));
    return { completionPending, day, phase, saved, preview, suggestions, recommended, tasks, summary, currentTaskId: current?.id ?? null, confirmedScopes: settings.learningScopes ?? [], missingSubjects: SUBJECT_ORDER.filter(subject => !confirmed.includes(subject)), scopeSuggestions, nextAction: currentAction };
}
//# sourceMappingURL=daily.js.map