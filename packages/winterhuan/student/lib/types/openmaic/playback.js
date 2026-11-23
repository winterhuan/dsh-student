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
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { z } from 'zod';
import { readStudentWorkspace } from "../transport.js";
import { applicationStudyFiles } from "../files/application.js";
import { readWorkspace } from "../files/read.js";
import { readLessonFile } from "../files/lessons.js";
/** Browser opening is a Client action, not a model-visible secret exchange. */
let StudentOpenmaicPlayback = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _open_decorators;
    return class StudentOpenmaicPlayback extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _open_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            __esDecorate(this, null, _open_decorators, { kind: "method", name: "open", static: false, private: false, access: { has: obj => "open" in obj, get: obj => obj.open }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['typert', 'agents', 'studentOpenmaic', 'remoteAccess'];
        constructor(ctx) {
            super(ctx, 'studentOpenmaicPlayback');
            __runInitializers(this, _instanceExtraInitializers);
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