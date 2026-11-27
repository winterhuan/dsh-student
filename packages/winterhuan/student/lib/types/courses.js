/** Unit organization and reusable teaching content never grant learning evidence. */
import { z } from 'zod';
import { feedbackBindingSchema } from "./openmaic/feedback-schema.js";
import { capabilityScopeSchema, knowledgeIdSchema } from "./capability-schema.js";
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const text = z.string().trim().min(1).max(2000);
const path = z.string().min(1).max(500).refine(value => !value.startsWith('/') && !value.includes('\\') && !value.split('/').includes('..') && !value.includes(':'), 'Use a workspace-relative material path.');
const confirmation = z.object({ quote: text, at: z.number().int().nonnegative() }).strict();
/** A retained source revision, including the confirmed within-unit school position. */
export const courseMaterialSchema = z.object({ revision: id, edition: text, sourcePath: path, sourceRevision: text, directory: z.array(text).min(1).max(80), position: z.enum(['entering', 'studying', 'finished']), currentSectionId: id.optional(), confirmation }).strict();
/** Stable sections are ordered by their array position; classroom versions retain their own original ownership. */
export const unitCourseSchema = z.object({
    id, learnerId: id, termId: id, subject: z.enum(['chinese', 'math', 'english']), unit: text, revision: z.number().int().positive(),
    materials: z.array(courseMaterialSchema).max(20), currentMaterialRevision: id.optional(),
    sections: z.array(z.object({ id, title: text, goalIds: z.array(knowledgeIdSchema).min(1).max(8), scope: capabilityScopeSchema, kind: z.enum(['lesson', 'synthesis']), materialRevision: id.optional(), lessonId: id.optional(), prerequisiteIds: z.array(id).max(40), testPreparation: confirmation.optional(), advanceConfirmation: confirmation.optional() }).strict()).max(80),
}).strict().superRefine((course, ctx) => {
    for (const [field, values] of [['materials', course.materials.map(item => item.revision)], ['sections', course.sections.map(item => item.id)]])
        if (new Set(values).size !== values.length)
            ctx.addIssue({ code: 'custom', path: [field], message: 'Use unique stable identities.' });
    if (course.currentMaterialRevision && !course.materials.some(material => material.revision === course.currentMaterialRevision))
        ctx.addIssue({ code: 'custom', path: ['currentMaterialRevision'], message: 'Retain the referenced material revision.' });
    for (const material of course.materials)
        if (material.position === 'studying' && !course.sections.some(section => section.id === material.currentSectionId))
            ctx.addIssue({ code: 'custom', path: ['materials'], message: 'Confirm the section currently studied at school.' });
    for (const [index, section] of course.sections.entries()) {
        if (section.materialRevision && !course.materials.some(material => material.revision === section.materialRevision))
            ctx.addIssue({ code: 'custom', path: ['sections', index, 'materialRevision'], message: 'Retain the section material revision.' });
        if (section.prerequisiteIds.some(value => !course.sections.slice(0, index).some(item => item.id === value)))
            ctx.addIssue({ code: 'custom', path: ['sections', index, 'prerequisiteIds'], message: 'Prerequisites must refer to earlier sections.' });
    }
});
/** Required full-classroom pedagogy, checked before submission and against content before playback. */
export const teachingPlanSchema = z.object({
    revision: id, goal: text, scope: text, materialLimitations: text,
    introduction: text, explanation: text, demonstration: text, guidedPractice: text, independentPractice: text, summary: text,
    maxAssessmentQuestions: z.number().int().min(1).max(3),
}).strict();
/** Authored assessment plan grounded in a retained local source, independently checked before generation. */
export const courseQuestionPlanSchema = z.object({
    revision: id,
    source: z.object({ path, sha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict(),
    target: feedbackBindingSchema.pick({ goalId: true, familyId: true, scope: true }),
    questions: z.array(z.object({
        id, type: z.enum(['single', 'multiple', 'short_answer']), question: text,
        options: z.array(z.object({ value: text, label: text }).strict()).max(8),
        answer: z.union([text, z.array(text).min(1).max(8)]), analysis: text,
        sourceQuote: text, completedAnswer: text,
    }).strict()).min(1).max(3),
}).strict().superRefine((plan, ctx) => {
    if (new Set(plan.questions.map(q => q.id)).size !== plan.questions.length)
        ctx.addIssue({ code: 'custom', message: 'Use distinct assessment question IDs.' });
    for (const [index, q] of plan.questions.entries()) {
        const answer = typeof q.answer === 'string' ? [q.answer] : q.answer;
        if (new Set(q.options.map(o => o.value)).size !== q.options.length || new Set(q.options.map(o => o.label)).size !== q.options.length || new Set(answer).size !== answer.length || q.type !== 'short_answer' && (q.options.length < 2 || answer.some(a => !q.options.some(o => o.value === a))) || q.type === 'single' && answer.length !== 1)
            ctx.addIssue({ code: 'custom', path: ['questions', index], message: 'Use distinct options and an explicit valid answer key.' });
    }
});
/** Content review names the frozen scenes and classifies every original quiz question. */
export const courseReviewSchema = z.object({
    reviewId: z.string().regex(/^[a-f0-9]{64}$/u).optional(),
    status: z.enum(['passed', 'rejected']), checkedAt: z.number().int().nonnegative(), contentHash: z.string().regex(/^[a-f0-9]{64}$/u),
    stages: z.object({ introduction: text, explanation: text, demonstration: text, guidedPractice: text, independentPractice: text, summary: text }).strict(),
    questions: z.array(z.object({ sceneId: text, questionId: text, purpose: z.enum(['example', 'guided', 'assessment']), rationale: text }).strict()).max(200),
    scopeChecked: z.literal(true), criterionChecked: z.literal(true), notes: text,
}).strict();
/** Content can be reused by a later activity without replacing original generation ownership. */
export const miniLessonSchema = z.object({ id, learnerId: id, termId: id, subject: z.enum(['chinese', 'math', 'english']), revision: id, goalIds: z.array(knowledgeIdSchema).min(1).max(8), scope: capabilityScopeSchema, purpose: z.enum(['review', 'explanation', 'temporary']), sourceLessonId: id.optional(), contentPath: path, contentHash: z.string().regex(/^[a-f0-9]{64}$/u), createdAt: z.number().int().nonnegative() }).strict();
/**
 * Explain why the directory cannot yet launch a particular section.
 * @param course - Independently validated directory.
 * @param sectionId - Explicitly selected section.
 * @returns Missing source/progress facts; no implicit preview authorization.
 */
export function sectionReadiness(course, sectionId) {
    const section = course.sections.find(item => item.id === sectionId);
    const material = course.materials.find(item => item.revision === section?.materialRevision);
    if (!section || !material)
        return 'materials';
    if (section.kind === 'synthesis')
        return material.position === 'finished' || section.testPreparation ? 'ready' : 'synthesis-confirmation';
    const index = course.sections.indexOf(section);
    const frontier = material.position === 'finished' ? course.sections.length : material.position === 'entering' ? 0 : course.sections.findIndex(item => item.id === material.currentSectionId);
    return index <= frontier || section.advanceConfirmation ? 'ready' : 'school-position';
}
//# sourceMappingURL=courses.js.map