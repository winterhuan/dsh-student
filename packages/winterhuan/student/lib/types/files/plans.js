import { effectiveLearningScopes } from "../learning/scopes.js";
import { effectiveKnowledge, scopeSupports } from "../capabilities.js";
import { canonical, studyDay } from "../learning/shared.js";
/** Check arrangement ownership and original references without creating learning evidence. */
export function validateDailyPlans(workspace, prior, fail) {
    const { settings, blocks, plans = [] } = workspace;
    const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
    const scopes = effectiveLearningScopes(workspace);
    const owners = new Map();
    const pending = (task) => ['ready', 'active', 'paused'].includes(task.state);
    for (const plan of plans) {
        const path = `.study/plans/${plan.day}.json`;
        const issue = (field, rule, correction) => fail(path, field, rule, correction);
        if (plan.id !== `day-${plan.day}` || plan.day !== studyDay(plan.createdAt) || plan.updatedAt < plan.createdAt || new Set(plan.subjects).size !== plan.subjects.length)
            issue('id', 'plan-identity', 'Use day-YYYY-MM-DD for this learner and term, with its original Shanghai creation day and distinct subjects.');
        if (plan.tasks.length !== new Set(plan.tasks.map(task => task.id)).size || plan.choices.length !== new Set(plan.choices.map(choice => choice.id)).size)
            issue('tasks', 'plan-identity', 'Retain distinct task and choice identities.');
        if (plan.tasks.filter(task => task.state === 'active').length > 1)
            issue('tasks', 'plan-active', 'Keep one active task; pause or defer the original before changing activities.');
        // The initiating choice may precede file creation while the native tutor prepares the activity.
        if (plan.choices.some(choice => choice.at > plan.updatedAt || choice.revision > plan.revision || [...choice.taskIds, ...choice.replacedTaskIds].some(id => !plan.tasks.some(task => task.id === id))))
            issue('choices', 'plan-choice', 'Keep explicit choices no later than the saved update and reference retained tasks inside this revision.');
        if (plan.state === 'completed' && (!plan.completedAt || plan.tasks.some(task => !task.optional && task.state !== 'completed')))
            issue('state', 'plan-completion', 'Complete only the original arrangement whose tasks reached their ending conditions; skipped and deferred work belongs to a stopped plan.');
        if (plan.completedAt !== undefined && (plan.completedAt < plan.createdAt || plan.completedAt > plan.updatedAt))
            issue('completedAt', 'plan-time', 'Keep the original completion time inside the plan history.');
        for (const [i, task] of plan.tasks.entries()) {
            const field = `tasks.${i}`;
            const goal = knowledge.goals.find(goal => goal.id === task.goalId);
            if (!plan.subjects.includes(task.subject) || task.goalId && (!goal || goal.subject !== task.subject) || task.familyIds.some(id => !knowledge.families.some(family => family.id === (knowledge.familyAliases[id] ?? id) && family.goalIds.includes(task.goalId ?? ''))))
                issue(field, 'plan-goal', 'Use compatible goals and families of a participating subject.');
            if (task.purpose !== 'resume' && (!task.goalId || !task.scope))
                issue(field, 'plan-scope', 'Save a concrete capability and learning range for a new activity.');
            // Changed settings may invalidate an unstarted task; the query offers an explicit amendment.
            if (['ready', 'active'].includes(task.state) && plan.createdAt >= settings.updatedAt && task.scope && !scopes.some(scope => scope.subject === task.subject && (!scope.goalIds || scope.goalIds.includes(task.goalId)) && scopeSupports(scope.scope, task.scope)))
                issue(field, 'plan-scope', 'Defer this unstarted task or adjust its learning scope before starting it.');
            const block = task.activity ? blocks.find(block => block.id === task.activity.blockId) : undefined;
            if (task.activity && (!block || block.subject !== task.subject || task.activity.questionId && !block.questions.some(question => question.id === task.activity.questionId) || task.activity.responseId && !block.responses.some(response => response.id === task.activity.responseId && (!task.activity.questionId || response.questionId === task.activity.questionId)) || task.activity.roundId && !block.rounds?.some(round => round.id === task.activity.roundId)))
                issue(field, 'plan-activity', 'Restore the original activity, question, response and round before continuing; do not recreate them.');
            const previousBlocks = prior.flatMap(entry => entry.file.kind === 'block' && entry.file.id === block?.id ? [entry.file] : []);
            if (block && task.scope && plan.createdAt < settings.updatedAt && previousBlocks.length && block.questions.some(question => !previousBlocks.some(old => old.questions.some(saved => saved.id === question.id)) && question.capability && !scopes.some(scope => scope.subject === task.subject && (!scope.goalIds || scope.goalIds.includes(question.capability.goalId)) && scopeSupports(scope.scope, question.capability.scope))))
                issue(field, 'plan-scope', 'Preserve the original questions and check the changed learning range before adding new questions.');
            if (block && task.goalId && task.scope && block.questions.length && !block.questions.some(question => question.capability?.goalId === task.goalId && scopeSupports(task.scope, question.capability.scope)))
                issue(field, 'plan-activity', 'Bind a task only to its original capability and learning range.');
            for (const reference of [...task.basis, ...task.outcomes]) {
                const owner = reference.ownerKind === 'block' ? workspace.blocks.find(block => block.id === reference.ownerId) : workspace.worksheets.find(sheet => sheet.id === reference.ownerId);
                if (reference.termId !== settings.termId || !owner || owner.subject !== task.subject || !owner.responses.some(response => response.id === reference.responseId))
                    issue(field, 'plan-evidence', 'Reference an existing original response of this learner, term and subject; do not copy answers into a plan.');
            }
            if (task.outcomes.some(reference => reference.ownerKind !== 'block' || reference.ownerId !== block?.id))
                issue(field, 'plan-evidence', 'Outcomes belong to the task’s original activity.');
            if (task.state === 'completed') {
                const round = block?.rounds?.find(round => round.id === task.activity?.roundId);
                // CLI validates saved structure. Only the application can authenticate native sources and grant progress.
                const assessed = block?.responses.filter(response => task.outcomes.some(reference => reference.responseId === response.id) && block.assessments.some(assessment => assessment.responseId === response.id && !['unassessed', 'stuck'].includes(assessment.result))) ?? [];
                const reviewAttempted = task.familyIds.every(id => assessed.some(response => block?.questions.find(question => question.id === response.questionId)?.capability?.familyId === id));
                if (!block || block.endedAt === undefined && round?.endedAt === undefined || task.ending === 'review-attempts' && !reviewAttempted || task.ending === 'short-check' && !assessed.length && round?.endReason !== 'budget-exhausted')
                    issue(field, 'plan-completion', 'Reach the saved ending condition using the original ended activity and assessed attempts; otherwise pause or stop with the unfinished work retained.');
            }
            if (task.original) {
                const original = plans.find(plan => plan.day === task.original.day)?.tasks.find(item => item.id === task.original.taskId);
                if (task.original.day >= plan.day || !original || original.original || !original.activity || original.activity.blockId !== task.activity?.blockId)
                    issue(field, 'plan-transfer', 'Point directly to an earlier original task and its activity; transfer chains and cycles are invalid.');
            }
            if (task.state === 'carried-forward' && !task.carriedTo || task.carriedTo && (task.state !== 'carried-forward' || task.carriedTo.day <= plan.day))
                issue(field, 'plan-transfer', 'Retain a forward transfer only on a carried task, pointing to the later owning plan.');
            if (task.activity && pending(task)) {
                const previous = owners.get(task.activity.blockId);
                if (previous)
                    issue(field, 'plan-ownership', `The original activity is already owned by ${previous}; finish its transfer before continuing.`);
                owners.set(task.activity.blockId, `${plan.day}/${task.id}`);
            }
        }
        for (const old of prior.flatMap(entry => entry.path === path && entry.file.kind === 'daily-plan' ? [entry.file] : [])) {
            if (old.learnerId !== plan.learnerId || old.termId !== plan.termId || old.id !== plan.id || old.createdAt !== plan.createdAt || old.completedAt !== undefined && old.completedAt !== plan.completedAt || old.revision > plan.revision || old.revision === plan.revision && canonical(old) !== canonical(plan))
                issue('', 'plan-history', 'Retain plan identity and completion, and increment revision for every explicit amendment.');
            if (old.state === 'completed' && plan.state !== 'completed' || old.tasks.some(task => task.state === 'completed' && plan.tasks.find(next => next.id === task.id)?.state !== 'completed'))
                issue('state', 'plan-history', 'Keep completed arrangements and tasks closed; attach explicitly requested extra work separately.');
            if (plan.tasks.some(task => !old.tasks.some(previous => previous.id === task.id) && !plan.choices.some(choice => !old.choices.some(previous => previous.id === choice.id) && (['start', 'adjust', 'extra', 'carry'].includes(choice.action) || ['continue', 'pause', 'stop'].includes(choice.action) && task.purpose === 'resume' && blocks.some(block => block.id === task.activity?.blockId && block.startedAt <= choice.at)) && choice.taskIds.includes(task.id))))
                issue('choices', 'plan-choice', 'Record the explicit choice that added each new task.');
            if (old.choices.some(choice => !plan.choices.some(next => canonical(next) === canonical(choice))) || old.tasks.some(task => !plan.tasks.some(next => next.id === task.id && next.subject === task.subject && next.goalId === task.goalId && next.purpose === task.purpose && next.ending === task.ending && next.optional === task.optional && canonical(next.familyIds) === canonical(task.familyIds) && canonical(next.scope) === canonical(task.scope) && (!task.activity || next.activity?.blockId === task.activity.blockId))))
                issue('tasks', 'plan-history', 'Keep original choices, tasks and activity identities; defer replaced tasks instead of deleting them.');
        }
    }
    for (const block of blocks)
        if (block.plan && (block.endedAt === undefined || plans.some(plan => plan.day === block.plan.day)) && !plans.some(plan => plan.day === block.plan.day && plan.tasks.some(task => task.id === block.plan.taskId && task.activity?.blockId === block.id)))
            fail(`.study/plans/${block.plan.day}.json`, 'activity', 'plan-binding', 'Restore and verify the original plan reference; the saved activity and answers remain intact.');
}
//# sourceMappingURL=plans.js.map