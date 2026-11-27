/** Cross-file course references are checked by both the CLI and the application. */
import { effectiveKnowledge } from "../capabilities.js";
/**
 * Check directories and activities without deriving mastery from course status.
 * @param file - Structurally valid lesson file.
 * @param workspace - Independently validated academic records.
 * @returns Broken ownership and activity references.
 */
export function validateCourseWorkspace(file, workspace) {
    const issues = [];
    const reject = (field, correction) => issues.push({ path: '.study/openmaic-lessons.json', field, rule: 'course-reference', correction });
    for (const course of file.courses ?? [])
        if (course.learnerId !== workspace.settings.learnerId || course.termId !== workspace.settings.termId)
            reject('courses', 'Retain the current learner and term for this course directory.');
    for (const mini of file.miniLessons ?? [])
        if (mini.learnerId !== workspace.settings.learnerId || mini.termId !== workspace.settings.termId)
            reject('miniLessons', 'Retain the current learner and term for this mini-lesson.');
    for (const lesson of file.lessons.filter(item => item.purpose)) {
        if (lesson.questionPlan) {
            const target = lesson.questionPlan.target;
            const knowledge = effectiveKnowledge(workspace.collections?.knowledge);
            const family = knowledge.families.find(f => f.id === (knowledge.familyAliases[target.familyId] ?? target.familyId));
            if (!knowledge.goals.some(g => g.id === target.goalId && g.subject === lesson.subject) || !family || family.subject !== lesson.subject || !family.goalIds.includes(target.goalId))
                reject(`lessons.${lesson.id}.questionPlan.target`, 'Use a compatible goal and family of the same subject.');
        }
        const block = workspace.blocks.find(item => item.id === lesson.blockId);
        if (!block || block.learnerId !== lesson.learnerId || block.termId !== lesson.termId || block.subject !== lesson.subject)
            reject(`lessons.${lesson.id}`, 'Retain the original generation block and subject.');
        if (lesson.activity && !workspace.blocks.some(item => item.id === lesson.activity?.blockId && item.learnerId === lesson.learnerId && item.termId === lesson.termId && item.subject === lesson.subject))
            reject(`lessons.${lesson.id}.activity`, 'The learning activity must exist under the same academic owner.');
        if (lesson.activity?.state === 'ended' && !workspace.blocks.find(item => item.id === lesson.activity?.blockId)?.endedAt)
            reject(`lessons.${lesson.id}.activity`, 'End the actual activity before showing the lesson as ended.');
    }
    return issues;
}
//# sourceMappingURL=course-validation.js.map