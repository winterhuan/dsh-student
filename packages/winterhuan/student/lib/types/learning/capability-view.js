import { effectiveKnowledge } from "../capabilities.js";
import { capabilityProgress } from "./mastery.js";
import { studyDay } from "./shared.js";
/** Overlay every official view from the same capability/range evidence used for continuation. */
export function applyCapabilityView(page, workspace, state, now) {
    const study = page.study;
    if (!study)
        return page;
    const progress = capabilityProgress(workspace, state, now);
    study.capabilityProgress = progress.filter(item => item.scope || item.feedback.length);
    const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
    const level = (items) => !items.length ? 'untouched' : items.every(item => item.level === 'mastered') ? 'mastered' : items.some(item => item.level === 'weak') ? 'weak' : items.some(item => item.level === 'due') ? 'due' : items.some(item => item.level !== 'untouched') ? 'practising' : 'untouched';
    const map = study.curriculum;
    if (map) {
        for (const objective of map.objectives) {
            const associated = knowledge.goals.filter(goal => goal.curriculumAssociationIds.includes(objective.id));
            const rows = progress.filter(item => associated.some(goal => goal.id === item.id));
            objective.capabilityIds = associated.map(goal => goal.id);
            objective.capabilityTitles = associated.map(goal => goal.title);
            objective.association = !associated.length ? 'missing' : rows.every(item => item.level === 'mastered') || rows.length === 1 ? 'complete' : 'partial';
            objective.level = map.scope.current ? level(rows) : 'untouched';
            objective.independentDays = rows.length === 1 ? rows[0].independentDays.length : 0;
            objective.attempts = new Set(rows.flatMap(item => item.feedback.map(row => `${row.termId}/${row.ownerId}/${row.responseId}`))).size;
            objective.reasons = rows.some(item => item.level === 'weak') ? [{ code: 'recent-help-or-error', count: rows.filter(item => item.level === 'weak').length }] : rows.some(item => item.level === 'due') ? [{ code: 'not-practised-recently', count: rows.filter(item => item.level === 'due').length }] : [];
        }
        for (const concept of map.concepts) {
            const objectives = map.objectives.filter(objective => concept.objectiveIds.includes(objective.id));
            concept.association = !objectives.length || objectives.every(item => item.association === 'missing') ? 'missing' : objectives.every(item => item.association === 'complete') ? 'complete' : 'partial';
            concept.level = level(objectives.map(item => ({ level: item.level === 'stalled' ? 'practising' : item.level })));
            concept.independentDays = objectives.length === 1 ? objectives[0].independentDays : 0;
        }
        for (const unit of map.units) {
            const rows = map.concepts.filter(concept => concept.unit === unit.id);
            unit.mastered = rows.filter(item => item.level === 'mastered').length;
            unit.weak = rows.filter(item => item.level === 'weak').length;
            unit.due = rows.filter(item => item.level === 'due').length;
            unit.learning = rows.filter(item => item.level === 'practising').length;
            unit.untouched = rows.filter(item => item.level === 'untouched').length;
        }
        for (const key of ['mastered', 'practising', 'weak', 'due', 'untouched'])
            map.summary[key] = map.concepts.filter(item => item.level === key).length;
        map.summary.stalled = 0;
    }
    study.weakPoints = progress.filter(item => item.subject === study.confirmedSubject && ['weak', 'due'].includes(item.level)).slice(0, 3).map(item => ({ id: item.id, subject: item.subject, title: item.title, level: item.level, priority: 1, reasons: [{ code: item.level === 'due' ? 'not-practised-recently' : 'recent-help-or-error', count: 1 }] }));
    const firstDay = studyDay(now - 6 * 86400000);
    study.weekly.masteredGoals = progress.filter(item => item.level === 'mastered' && !item.baseline && item.firstMasteredDay && item.firstMasteredDay >= firstDay).length;
    study.weekly.recoveredGoals = progress.filter(item => item.level === 'mastered' && item.recoveredDay && item.recoveredDay >= firstDay).length;
    study.weekly.practisedGoals = progress.filter(item => item.feedback.some(row => row.sourceStatus === 'known' && row.answerDate.kind !== 'unknown' && (row.answerDate.kind === 'day' ? row.answerDate.day : studyDay(row.answerDate.at)) >= firstDay)).length;
    return page;
}
//# sourceMappingURL=capability-view.js.map