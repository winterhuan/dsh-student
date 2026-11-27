import { z } from 'zod';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { readStudentWorkspace } from "../transport.js";
import { applicationStudyFiles } from "../files/application.js";
import { readLessonFile } from "../files/lessons.js";
import { openmaicAcademicQuestion } from "./feedback-consumer.js";
import { openmaicEntityId } from "./feedback.js";
import { courseReviewInput, reviewQuestionsCurrent } from "./review-input.js";
import { courseReviewModel } from "./review.js";
import { validateCourseWorkspace } from "../files/course-validation.js";
/**
 * Register the source read alongside the official teaching tools in the Student preset.
 * @param ctx - Preset-scoped tool registry and protected Host connection.
 */
export function registerOpenmaicFeedback(ctx) {
    ctx.effect(() => ctx.tools.register(defineTool({
        name: 'openmaic_feedback',
        description: 'Read original authorized classroom answers and grading, or prepare its frozen question binding before playback. Returns bounded authoring facts and independent saved-file acceptance; the agent writes the formal files and runs the read-only CLI before advancing a checkpoint.',
        parameters: {
            action: { type: 'string', enum: ['prepare', 'read', 'content', 'review'], required: true, description: 'review independently checks all actual scenes and returns quality plus original binding/questions in one call; content pages original scenes; prepare freezes the original generated classroom before playback; read rereads original submitted/reviewed records after return, continue or restart.' },
            lessonId: { type: 'string', required: true, description: 'Original ID in .study/openmaic-lessons.json.' },
            offset: { type: 'integer', description: 'Zero-based source-question/response page; defaults to 0. Each page returns at most twenty records.' },
        },
        output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
            const { action, lessonId, offset = 0 } = z.object({ action: z.enum(['prepare', 'read', 'content', 'review']), lessonId: z.string().min(1).max(80), offset: z.number().int().nonnegative().optional() }).parse(args);
            const { read, openmaic } = await readStudentWorkspace(exec, undefined, lessonId);
            const lessonRead = await readLessonFile(applicationStudyFiles(exec), exec.signal);
            const lesson = [...(lessonRead.status === 'valid' ? lessonRead.file.lessons : []), ...(read.archiveSources ?? []).flatMap(archive => archive.lessons.status === 'valid' ? archive.lessons.file.lessons.filter(lesson => lesson.termId === archive.workspace.settings.termId) : [])].find(lesson => lesson.id === lessonId);
            const workspace = read.workspace;
            const unavailable = openmaic.find(fact => fact.lessonId === lessonId && fact.status === 'unavailable');
            if (action === 'read' && read.status === 'changing' && unavailable)
                return { status: 'unavailable', lessonId, failure: unavailable.failure ?? 'incomplete-read', reason: unavailable.reason ?? 'Original official source changed during verification.', complete: false, records: [], total: null, drafts: null, nextOffset: null };
            if (read.status !== 'valid' || !workspace?.settings.learnerId || !lesson?.learnerId || !lesson.termId || lesson.learnerId !== workspace.settings.learnerId || !lesson.blockId || !lesson.classroomId || !lesson.learnerKey || lesson.status !== 'ready')
                throw new Error('Confirm valid original learner, term, block and ready classroom files before reading its source.');
            const original = [workspace, ...(read.archiveSources ?? []).map(archive => archive.workspace)].find(owner => owner.settings.termId === lesson.termId && owner.settings.learnerId === workspace.settings.learnerId);
            const block = original?.blocks.find(block => block.id === lesson.blockId && block.learnerId === workspace.settings.learnerId);
            if (!block || !exec.agent?.session.header.cwd)
                throw new Error('Original classroom block ownership is unresolved.');
            let result;
            if (action === 'review') {
                if (!lessonRead.file || validateCourseWorkspace(lessonRead.file, workspace).length)
                    throw new Error('Restore valid course and target references before review.');
                const files = applicationStudyFiles(exec);
                const input = await courseReviewInput(files, exec.agent.session.header.cwd, lesson, lessonRead.file, exec.signal);
                const approved = await ctx.studentOpenmaic.generation(exec.agent.session.header.cwd).reviewedPlan(input.owner);
                if (!await ctx.studentOpenmaic.reviewer.approvedPlan(input, approved))
                    throw new Error('This plan does not match the original approved submission. Preserve the old course and generate an explicitly requested replacement.');
                const owner = { learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, base: lesson.base, classroomId: lesson.classroomId, learnerKey: lesson.learnerKey };
                const feedback = ctx.studentOpenmaic.feedback(exec.agent.session.header.cwd);
                const prepared = await feedback.prepare(owner, input.plan.target, exec.signal);
                input.content = await feedback.content(owner, exec.signal);
                input.questions = prepared.questions;
                if (!reviewQuestionsCurrent(input))
                    throw new Error('The current quiz differs from its original frozen capture. Preserve this version and create an explicitly requested replacement.');
                const model = courseReviewModel(ctx, exec);
                const review = await ctx.studentOpenmaic.reviewer.review(input, model.model, model.generate, exec.signal);
                const latest = await readLessonFile(files, exec.signal);
                if (latest.observation?.version !== lessonRead.observation?.version || latest.observation?.targetKey !== lessonRead.observation?.targetKey)
                    throw new Error('The lesson changed during review. Read its current version.');
                await courseReviewInput(files, exec.agent.session.header.cwd, lesson, lessonRead.file, exec.signal);
                result = { status: 'reviewed', lessonId, quality: review.quality, issues: review.issues, feedback: prepared.binding, questions: prepared.questions.map(question => openmaicAcademicQuestion({ binding: prepared.binding, questionId: openmaicEntityId('q', [prepared.binding.bindingId, question.sceneId, question.questionId]), question })), total: prepared.questions.length, nextOffset: null };
            }
            else if (action === 'content') {
                const content = await ctx.studentOpenmaic.feedback(exec.agent.session.header.cwd).content({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, base: lesson.base, classroomId: lesson.classroomId, learnerKey: lesson.learnerKey }, exec.signal);
                result = { status: 'content', lessonId, contentHash: content.contentHash, scenes: content.scenes.slice(offset, offset + 4), total: content.scenes.length, nextOffset: offset + 4 < content.scenes.length ? offset + 4 : null };
            }
            else if (action === 'prepare') {
                if (lesson.questionPlan) {
                    if (!lessonRead.file || validateCourseWorkspace(lessonRead.file, workspace).length)
                        throw new Error('Restore valid original course targets before preparing feedback.');
                    const plan = await courseReviewInput(applicationStudyFiles(exec), exec.agent.session.header.cwd, lesson, lessonRead.file, exec.signal);
                    if (!await ctx.studentOpenmaic.reviewer.approvedPlan(plan, await ctx.studentOpenmaic.generation(exec.agent.session.header.cwd).reviewedPlan(plan.owner)))
                        throw new Error('Prepare only the original approved question plan.');
                }
                const target = lesson.questionPlan?.target ?? block.questions.find(question => question.id === block.currentQuestionId)?.capability;
                if (!target)
                    throw new Error('Save the current capability, family and tested scope before preparing classroom feedback.');
                const prepared = await ctx.studentOpenmaic.feedback(exec.agent.session.header.cwd).prepare({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, base: lesson.base, classroomId: lesson.classroomId, learnerKey: lesson.learnerKey }, target, exec.signal);
                result = { status: 'prepared', lessonId, feedback: prepared.binding, questions: prepared.questions.slice(offset, offset + 20).map(question => openmaicAcademicQuestion({ binding: prepared.binding, questionId: openmaicEntityId('q', [prepared.binding.bindingId, question.sceneId, question.questionId]), question })), total: prepared.questions.length, nextOffset: offset + 20 < prepared.questions.length ? offset + 20 : null };
            }
            else {
                const fact = openmaic.find(fact => fact.lessonId === lessonId);
                result = { status: fact?.status ?? 'unavailable', lessonId, reason: fact?.reason, failure: fact?.failure, complete: !!fact?.source, consumption: fact?.consumption,
                    records: [...fact?.source?.observations.map(observation => ({ question: openmaicAcademicQuestion(observation), response: { id: observation.responseId, questionId: observation.questionId, rawResponse: JSON.stringify(observation.source.submittedAnswer), assistance: 'unknown', answerDate: { kind: 'unknown' }, source: observation.source }, assessment: { id: openmaicEntityId('a', [observation.responseId]), responseId: observation.responseId, result: observation.result, grading: observation.grading, ...(observation.official ? { official: observation.official, officialHistory: observation.officialHistory } : {}), assistance: 'unknown', assessedAt: Date.now(), feedback: observation.grading === 'equivalent' ? 'The submitted value is equivalent to the frozen criterion; the official result is preserved.' : observation.grading === 'conflict' ? 'The official and frozen criterion conflict; review before accepting evidence.' : observation.grading === 'pending' ? 'The original answer is preserved; missing grading or criterion needs review.' : 'Checked against the original frozen criterion.', answerEvidence: openmaicAcademicQuestion(observation).answerEvidence }, sourceStatus: observation.sourceStatus, reason: observation.reason, answerExposure: observation.answerExposure })) ?? [], ...fact?.source?.pending.map(pendingOpenmaic => ({ pendingOpenmaic })) ?? []].slice(offset, offset + 20),
                    total: fact?.source ? fact.source.observations.length + fact.source.pending.length : null, drafts: fact?.source?.drafts ?? null, nextOffset: fact?.source && offset + 20 < fact.source.observations.length + fact.source.pending.length ? offset + 20 : null };
            }
            const bounded = z.record(z.string(), z.json()).parse(JSON.parse(JSON.stringify(result)));
            const rows = Array.isArray(bounded.records) ? bounded.records : Array.isArray(bounded.questions) ? bounded.questions : Array.isArray(bounded.scenes) ? bounded.scenes : undefined;
            const originalLength = rows?.length ?? 0;
            if (bounded.consumption && typeof bounded.consumption === 'object' && !Array.isArray(bounded.consumption)) {
                for (const field of ['missingResponseIds', 'missingPendingIds', 'conflicts'])
                    if (Array.isArray(bounded.consumption[field])) {
                        const ids = bounded.consumption[field];
                        bounded.consumption[`${field}Count`] = ids.length;
                        bounded.consumption[field] = ids.slice(0, 20);
                    }
            }
            while (Buffer.byteLength(JSON.stringify(bounded)) > 32768 && rows?.length)
                rows.pop();
            if (rows && rows.length < originalLength) {
                bounded.nextOffset = offset + rows.length;
                bounded.omitted = originalLength - rows.length;
                if (!rows.length) {
                    bounded.status = 'unavailable';
                    bounded.failure = 'read-limit';
                    bounded.complete = false;
                    delete bounded.consumption;
                    bounded.reason = 'This source record exceeds the native result limit. The offset has not advanced; keep its checkpoint pending.';
                }
            }
            if (Buffer.byteLength(JSON.stringify(bounded)) > 32768)
                throw new Error('Source metadata exceeds the bounded native read result.');
            return z.json().parse(bounded);
        },
    })), 'student: official feedback');
}
//# sourceMappingURL=feedback-agent.js.map