var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
/** Authorized playback opening preserves original Student lesson and learner ownership. */
import { createHash } from 'node:crypto';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { z } from 'zod';
import { courseReviewInput, reviewQuestionsCurrent } from "./review-input.js";
import { OpenmaicError } from "./connection.js";
import { validateCourseWorkspace } from "../files/course-validation.js";
import { readStudentWorkspace } from "../transport.js";
import { applicationStudyFiles } from "../files/application.js";
import { readWorkspace } from "../files/read.js";
import { readLessonFile } from "../files/lessons.js";
/** Browser opening is a Client action, not a model-visible secret exchange. */
let StudentOpenmaicPlayback = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _mini_decorators;
    let _progress_decorators;
    let _open_decorators;
    return class StudentOpenmaicPlayback extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _mini_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            _progress_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            _open_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            __esDecorate(this, null, _mini_decorators, { kind: "method", name: "mini", static: false, private: false, access: { has: obj => "mini" in obj, get: obj => obj.mini }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _progress_decorators, { kind: "method", name: "progress", static: false, private: false, access: { has: obj => "progress" in obj, get: obj => obj.progress }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _open_decorators, { kind: "method", name: "open", static: false, private: false, access: { has: obj => "open" in obj, get: obj => obj.open }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['typert', 'agents', 'studentOpenmaic', 'remoteAccess'];
        constructor(ctx) {
            super(ctx, 'studentOpenmaicPlayback');
            __runInitializers(this, _instanceExtraInitializers);
        }
        /** Read a versioned teaching card without model inference or learning writes.
         * @param sessionId - Authorized main session.
         * @param miniId - Saved mini-lesson identity; never an arbitrary path.
         * @param signal - Cancels bounded content reads.
         * @returns Verified original HTML for sandboxed display.
         */
        async mini(sessionId, miniId, signal) {
            const agent = this.ctx.agents.get(sessionId);
            if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === 'subagent')
                throw new Error('Open the original main Student session.');
            const files = applicationStudyFiles({ agent, signal });
            const read = await readWorkspace(files, signal);
            const lessons = await readLessonFile(files, signal);
            const mini = lessons.file?.miniLessons?.find(item => item.id === miniId);
            if (read.status !== 'valid' || !read.workspace || lessons.status !== 'valid' || !mini || validateCourseWorkspace(lessons.file, read.workspace).length)
                throw new Error('Restore valid original mini-lesson ownership.');
            const bytes = await files.read(mini.contentPath, signal, 262144);
            if (createHash('sha256').update(bytes).digest('hex') !== mini.contentHash)
                throw new Error('The saved mini-lesson content has changed. Review and save a new content revision.');
            const latest = await readLessonFile(files, signal);
            if (latest.observation?.version !== lessons.observation?.version || latest.observation?.targetKey !== lessons.observation?.targetKey)
                throw new Error('The mini-lesson changed during reading.');
            return { id: mini.id, html: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
        }
        /** Poll an existing authorized job without inference or academic writes.
         * @param sessionId - Authorized main session.
         * @param lessonId - Saved lesson identity.
         * @param signal - Cancels transport polling.
         * @returns Real transport result or a safe recovery reason and check time.
         */
        async progress(sessionId, lessonId, signal) {
            const agent = this.ctx.agents.get(sessionId);
            if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === 'subagent' || !agent.session.header.cwd)
                throw new Error('Open the original main Student session.');
            const fs = applicationStudyFiles({ agent, signal });
            const read = await readWorkspace(fs, signal);
            const lessons = await readLessonFile(fs, signal);
            const lesson = lessons.file?.lessons.find(item => item.id === lessonId);
            if (read.status !== 'valid' || !read.workspace || lessons.status !== 'valid' || !lesson?.learnerId || !lesson.termId || !lesson.blockId || lesson.learnerId !== read.workspace.settings.learnerId || lesson.termId !== read.workspace.settings.termId || !read.workspace.blocks.some(block => block.id === lesson.blockId))
                throw new Error('Restore the original lesson ownership before checking its job.');
            try {
                return { checkedAt: Date.now(), result: await this.ctx.studentOpenmaic.generation(agent.session.header.cwd).poll({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, ...(lesson.jobId ? { jobId: lesson.jobId } : {}) }, signal) };
            }
            catch (error) {
                if (signal.aborted)
                    throw error;
                return { checkedAt: Date.now(), failure: error instanceof OpenmaicError ? error.code : 'service-unavailable' };
            }
        }
        /**
         * Open one independently read lesson after checking original learner, term and block.
         * @param sessionId - Registered main Student conversation identity.
         * @param lessonId - Original agent-authored lesson-log entry.
         * @param signal - Cancellation for independent reads and browser opening.
         * @returns Safe playback, unresolved ownership or recovery outcome.
         */
        async open(sessionId, lessonId, signal) {
            const agent = this.ctx.agents.get(sessionId);
            if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === 'subagent')
                return { status: 'unavailable', reason: 'Open the original Student conversation to continue this classroom.' };
            const { read } = await readStudentWorkspace({ agent, signal }, this.ctx);
            if (!read.workspace)
                return { status: 'unavailable', reason: 'Restore valid Student files before opening this classroom.' };
            const settings = z.object({ learnerId: z.string(), termId: z.string() }).safeParse(read.workspace.settings);
            const files = applicationStudyFiles({ agent, signal });
            const lessons = await readLessonFile(files, signal);
            const lesson = lessons.file?.lessons.find(item => item.id === lessonId);
            if (!settings.success || !lesson || !lesson.learnerId || !lesson.termId || !lesson.blockId || !lesson.learnerKey)
                return { status: 'ownership-unresolved', reason: 'A parent must confirm the original learner and lesson ownership.' };
            const identity = await this.ctx.studentOpenmaic.connection.identity(signal);
            if (lesson.learnerId !== settings.data.learnerId || lesson.termId !== settings.data.termId || lesson.learnerKey !== identity.learnerKey || lesson.base !== identity.baseUrl || !read.workspace.blocks.some(block => block.id === lesson.blockId))
                return { status: 'ownership-unresolved', reason: 'The classroom belongs to a different learner, term, block or service.' };
            if (lessons.file && validateCourseWorkspace(lessons.file, read.workspace).length)
                return { status: 'ownership-unresolved', reason: 'Restore the original course and activity references.' };
            const approvedReview = await this.ctx.studentOpenmaic.generation(agent.session.header.cwd).reviewedPlan({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId });
            const requiresReview = !!lesson.purpose || !!approvedReview;
            if (requiresReview && lesson.quality?.status !== 'passed')
                return { status: 'unavailable', reason: 'Review the generated content, scope, answer criteria and question allowance before playback.' };
            if (lesson.status !== 'ready' || !lesson.classroomId)
                return { status: 'unavailable', reason: 'Continue the existing generation job before opening its classroom.' };
            if (!lesson.feedback)
                return { status: 'ownership-unresolved', reason: 'Prepare and save this classroom’s original question binding before opening it.' };
            const target = { goalId: lesson.feedback.goalId, familyId: lesson.feedback.familyId, scope: lesson.feedback.scope };
            let prepared;
            try {
                prepared = await this.ctx.studentOpenmaic.feedback(agent.session.header.cwd).prepare({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, classroomId: lesson.classroomId, base: lesson.base, learnerKey: lesson.learnerKey }, target, signal);
            }
            catch (error) {
                if (signal.aborted)
                    throw error;
                return { status: 'ownership-unresolved', reason: 'Restore the original classroom source and prepare its question binding before opening it.' };
            }
            if (requiresReview) {
                const content = await this.ctx.studentOpenmaic.feedback(agent.session.header.cwd).content({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, classroomId: lesson.classroomId, base: lesson.base, learnerKey: lesson.learnerKey }, signal);
                const quality = lesson.quality;
                const input = await courseReviewInput(files, agent.session.header.cwd, lesson, lessons.file, signal);
                if (!await this.ctx.studentOpenmaic.reviewer.approvedPlan(input, approvedReview))
                    return { status: 'unavailable', reason: 'The saved plan differs from the approved original submission.' };
                input.content = content;
                input.questions = prepared.questions;
                if (!quality || !reviewQuestionsCurrent(input) || !await this.ctx.studentOpenmaic.reviewer.accepts(input, quality))
                    return { status: 'unavailable', reason: 'This exact material, question plan and classroom need an independent content review before playback.' };
                const reviewKeys = quality?.questions.map(question => JSON.stringify([question.sceneId, question.questionId])) ?? [];
                if (!quality || content.contentHash !== quality.contentHash || Object.values(quality.stages).some(sceneId => !content.scenes.some(scene => scene.id === sceneId)) || prepared.questions.length > (lesson.teaching?.maxAssessmentQuestions ?? 3) || reviewKeys.length !== prepared.questions.length || new Set(reviewKeys).size !== reviewKeys.length || prepared.questions.some(question => !reviewKeys.includes(JSON.stringify([question.sceneId, question.questionId]))))
                    return { status: 'unavailable', reason: 'The classroom content, teaching stages or question allowance differs from its reviewed source.' };
            }
            const block = read.workspace.blocks.find(block => block.id === lesson.blockId);
            if (prepared.binding.bindingId !== lesson.feedback.bindingId || !prepared.questions.every(question => block?.questions.some(saved => saved.openmaic?.bindingId === question.bindingId && saved.openmaic.sceneId === question.sceneId && saved.openmaic.questionId === question.questionId && saved.openmaic.snapshotHash === question.snapshotHash)))
                return { status: 'ownership-unresolved', reason: 'Save every prepared original question in its learning block before opening this classroom.' };
            const latest = await readWorkspace(files, signal);
            const finalLessons = await readLessonFile(files, signal);
            if (latest.status !== 'valid' || JSON.stringify(latest.files.map(file => [file.path, file.targetKey, file.version])) !== JSON.stringify(read.files.map(file => [file.path, file.targetKey, file.version])) || finalLessons.observation?.version !== lessons.observation?.version || finalLessons.observation?.targetKey !== lessons.observation?.targetKey)
                return { status: 'ownership-unresolved', reason: 'Learning files changed during preparation; continue the original classroom after reading them again.' };
            return this.ctx.studentOpenmaic.browser.open(lesson.classroomId, signal);
        }
    };
})();
export { StudentOpenmaicPlayback };
//# sourceMappingURL=playback.js.map