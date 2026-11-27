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
import { canonical } from "./learning/shared.js";
import { panelIntentSchema, panelDisplay } from "./panel-intent.js";
/** Student Remote methods retain native Session authorization and shared official-file ownership. */
import { createHash } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import z from '@deepseek-ai/schemastery';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { z as jsonSchema } from 'zod';
import { Remote, RemoteError, TypertRemoteService, principalOf } from '@deepseek-ai/dsh-typert-protocol';
import { queryWorkspace, queryWorkspaceDashboard, queryJsonData } from "./learning/queries.js";
import { readInteractiveLessons } from "./openmaic.js";
import { readStudentWorkspace } from "./transport.js";
import { applicationStudyFiles } from "./files/application.js";
import { manualFields, saveManual } from "./files/manual.js";
import { readLessonFile } from "./files/lessons.js";
import { readWorkspace } from "./files/read.js";
/** Host owner for the generated student Remote namespace. */
let StudentRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _submitIntent_decorators;
    let _query_decorators;
    let _watch_decorators;
    let _manualContext_decorators;
    let _saveManual_decorators;
    let _inspectSubmission_decorators;
    let _syncFeedback_decorators;
    return class StudentRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _submitIntent_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            _query_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            _watch_decorators = [Remote({ mode: 'stream', resources: { session: sessionId => sessionId } })];
            _manualContext_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            _saveManual_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            _inspectSubmission_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            _syncFeedback_decorators = [Remote({ resources: { session: sessionId => sessionId } })];
            __esDecorate(this, null, _submitIntent_decorators, { kind: "method", name: "submitIntent", static: false, private: false, access: { has: obj => "submitIntent" in obj, get: obj => obj.submitIntent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _query_decorators, { kind: "method", name: "query", static: false, private: false, access: { has: obj => "query" in obj, get: obj => obj.query }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _watch_decorators, { kind: "method", name: "watch", static: false, private: false, access: { has: obj => "watch" in obj, get: obj => obj.watch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _manualContext_decorators, { kind: "method", name: "manualContext", static: false, private: false, access: { has: obj => "manualContext" in obj, get: obj => obj.manualContext }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _saveManual_decorators, { kind: "method", name: "saveManual", static: false, private: false, access: { has: obj => "saveManual" in obj, get: obj => obj.saveManual }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _inspectSubmission_decorators, { kind: "method", name: "inspectSubmission", static: false, private: false, access: { has: obj => "inspectSubmission" in obj, get: obj => obj.inspectSubmission }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _syncFeedback_decorators, { kind: "method", name: "syncFeedback", static: false, private: false, access: { has: obj => "syncFeedback" in obj, get: obj => obj.syncFeedback }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        config = __runInitializers(this, _instanceExtraInitializers);
        panelIntents = new WeakMap();
        feedbackIntents = new WeakMap();
        static inject = ['typert', 'sessionQuery', 'agents', 'remoteAccess'];
        static Config = z.object({ refreshIntervalMs: z.number().step(1).min(1).max(2_147_483_647).default(3000), maxWireBytes: z.number().step(1).min(1024).default(1_048_576) });
        /**
         * @param ctx - Host services containing authorized native Agent lookups.
         * @param config - validated refresh interval and complete wire-response limit.
         */
        constructor(ctx, config) {
            super(ctx, 'student');
            this.config = config;
        }
        /**
         * Admit a compact panel intent as an ordinary native user message.
         * @param sessionId - Authorized main Session.
         * @param request - Stable request identity and bounded panel intent.
         * @param signal - Cancellation before admission.
         * @returns Admission only; the agent authors and validates business files.
         */
        async submitIntent(sessionId, request, signal) {
            signal.throwIfAborted();
            const intent = panelIntentSchema.parse(request.intent);
            if (intent.nativeSessionId !== sessionId || !/^[a-zA-Z0-9_-]{1,160}$/u.test(request.requestId) || Buffer.byteLength(JSON.stringify(intent)) > 16_384)
                throw new Error('Invalid Student panel request.');
            const photo = request.photo === undefined ? undefined : jsonSchema.object({ mediaType: jsonSchema.enum(['image/png', 'image/jpeg', 'image/webp']), data: jsonSchema.string().min(1).max(20_971_520), name: jsonSchema.string().min(1).max(200) }).strict().parse(request.photo);
            if (!this.ctx.agents.get(sessionId))
                await this.ctx.typert.lookups.get('agent')?.resolve(sessionId);
            const agent = await this.mainAgent(sessionId, signal);
            const hash = createHash('sha256').update(canonical({ intent, photo: photo ?? null })).digest('hex');
            const admitted = () => {
                const prior = agent.session.snapshotEvents().flatMap(event => event.type === 'agent/inbox/spliced' ? event.data.inserted : []).find(message => message.source.kind === 'user' && 'rpcId' in message.source && message.source.rpcId === request.requestId);
                if (!prior)
                    return false;
                if (!('studentIntent' in prior.source) || prior.source.studentRequestHash !== hash)
                    throw new Error('Student request identity already belongs to a different input.');
                return true;
            };
            if (admitted())
                return { accepted: true };
            let requests = this.panelIntents.get(agent);
            if (!requests) {
                requests = new Map();
                this.panelIntents.set(agent, requests);
            }
            const existing = requests.get(request.requestId);
            if (existing) {
                if (existing.hash !== hash)
                    throw new Error('Student request identity already belongs to a different input.');
                return existing.pending;
            }
            const principal = principalOf(this.ctx.invocation);
            const pending = (async () => {
                if (photo) {
                    if (!this.ctx.get('attachments'))
                        throw new Error('Native image admission is unavailable in this session.');
                    const current = agent.model.current();
                    if (current) {
                        const model = await this.ctx.llm.resolveModelInfo(current.provider, current.model);
                        if (model.inputModalities && !model.inputModalities.includes('image'))
                            throw new Error('The current model cannot read images.');
                    }
                }
                const content = photo ? await this.ctx.attachments.admitPromptContent([{ type: 'text', text: panelDisplay(intent) }, { type: 'image', ...photo }]) : [{ type: 'text', text: panelDisplay(intent) }];
                signal.throwIfAborted();
                if (this.ctx.agents.get(sessionId) !== agent)
                    throw new Error('The original session was closed during admission.');
                if (!admitted())
                    agent.followup(createUserMessage({ source: { kind: 'user', rpcId: request.requestId, studentRequestHash: hash, studentIntent: intent, ...(principal ? { principal } : {}) }, content }));
                return { accepted: true };
            })();
            requests.set(request.requestId, { hash, pending });
            try {
                return await pending;
            }
            finally {
                requests.delete(request.requestId);
            }
        }
        /**
         * Read a shared validated Student projection without activating an absent Agent.
         * @param sessionId - native Session identity resolved through the registered main Agent lookup.
         * @param request - shared projection selector; it never names a learning block as a Session.
         * @param signal - complete source and filesystem read cancellation.
         * @returns current projection, actual file versions, cut and explicit partial or unavailable status.
         */
        async query(sessionId, request, signal) {
            const agent = await this.mainAgent(sessionId, signal);
            this.wire(request);
            const { read, native, backupIssues } = await readStudentWorkspace({ agent, signal }, this.ctx, undefined, request.kind === 'daily-plan' && request.id && /^\d{4}-\d{2}-\d{2}$/u.test(request.id) ? request.id : undefined);
            const now = Date.now();
            let query;
            if (request.kind === 'dashboard') {
                const page = queryWorkspaceDashboard(read, now, request.options);
                query = page.data ? { ...page, data: { ...page.data, interactiveLessons: await readInteractiveLessons(agent, signal, page.data.study?.openmaic.savedBaseUrl, read.workspace) } } : page;
            }
            else
                query = queryWorkspace(read, request, now);
            const { observations: _observations, ...view } = native;
            const { data: _data, ...facts } = query;
            const result = { ...facts, data: queryJsonData(query), readAt: now, refreshAfter: query.refreshAfter ?? now + this.config.refreshIntervalMs, token: createHash('sha256').update(JSON.stringify([query, view, backupIssues])).digest('hex'), native: view, backupIssues };
            signal.throwIfAborted();
            return this.wire(result);
        }
        /**
         * Follow current files and time thresholds; unchanged version/cut/projection tokens produce no frame.
         * @param sessionId - native Session identity; every read requires a registered main Agent.
         * @param request - shared bounded projection selector.
         * @param signal - cancellation stops reads and the owned refresh timer.
         * @returns an initial snapshot and later changes or recoverable read-failure frames.
         */
        async *watch(sessionId, request, signal) {
            let token;
            while (!signal.aborted) {
                let delay = this.config.refreshIntervalMs;
                try {
                    const value = await this.query(sessionId, request, signal);
                    if (value.token !== token) {
                        yield this.wire({ kind: 'snapshot', value });
                        token = value.token;
                    }
                    delay = Math.max(1, Math.min(delay, value.refreshAfter - Date.now()));
                }
                catch (error) {
                    if (signal.aborted)
                        return;
                    token = undefined;
                    yield this.wire({ kind: 'failure', ...(error instanceof RemoteError && error.code === 'student/main-session-required' ? { reason: 'main-session-required' } : {}), message: (error instanceof Error ? error.message : 'Student data could not be read.').slice(0, 200) });
                }
                try {
                    await setTimeout(delay, undefined, { signal });
                }
                catch (error) {
                    if (signal.aborted)
                        return;
                    throw error;
                }
            }
        }
        /**
         * Capture the shared owner's edited-field values from one actual read.
         * @param sessionId - registered main native Session identity.
         * @param intent - typed manual operation; setup must identify editedProfileFields.
         * @param signal - cancellation for source and official-file reads.
         * @returns exact current term identity, observed versions, draft baseline and read issues.
         */
        async manualContext(sessionId, intent, signal) {
            const agent = await this.mainAgent(sessionId, signal);
            this.wire(intent);
            const { read } = await readStudentWorkspace({ agent, signal }, this.ctx);
            return this.wire({ ...this.readFacts(read), baseline: manualFields(read, intent) });
        }
        /**
         * Save an explicit manual draft through the shared guarded filesystem owner.
         * @param sessionId - registered main native Session identity.
         * @param request - actual observed term, file versions, edited fields and retained baseline.
         * @param signal - cancellation passed through the application save.
         * @returns thin save outcome, current edited values and versions for subsequent draft saves.
         */
        async saveManual(sessionId, request, signal) {
            const agent = await this.mainAgent(sessionId, signal);
            this.wire(request);
            const result = await saveManual(applicationStudyFiles({ agent, signal }), request, Date.now(), signal);
            signal.throwIfAborted();
            return this.wire({ ...this.readFacts(result.read), status: result.status, current: result.current, ...(result.reason === undefined ? {} : { reason: result.reason }) });
        }
        /**
         * Inspect an uncertain submission before deliberate recovery; this method never submits input.
         * @param sessionId - registered main native Session identity.
         * @param request - original native request and optional term/owner/response identity.
         * @param signal - cancellation for the independent Session and file reads.
         * @returns admission, saved-answer and valid-assessment facts separately; omitted admission remains unknown.
         */
        async inspectSubmission(sessionId, request, signal) {
            const agent = await this.mainAgent(sessionId, signal);
            this.wire(request);
            const { read, native } = await readStudentWorkspace({ agent, signal }, this.ctx);
            const nativeStates = native.admissions.filter(row => row.requestId === request.requestId).map(row => row.status);
            const result = { requestId: request.requestId, admission: nativeStates.length ? 'accepted' : 'unknown', nativeStates, nativeSourceStatus: native.status, ...(native.cut ? { cut: native.cut } : {}), answer: 'not-requested', assessment: 'not-requested', ...this.readFacts(read) };
            if (request.response) {
                const { owner, responseId, termId } = request.response;
                const path = `.study/${owner.kind === 'block' ? 'blocks' : 'worksheets'}/${owner.id}.json`;
                if (!read.workspace || read.workspace.settings.termId !== termId || read.issues.some(issue => issue.path === path || issue.path === '.study/settings.json')) {
                    result.answer = 'unavailable';
                    result.assessment = 'unavailable';
                }
                else {
                    const entity = owner.kind === 'block' ? read.workspace.blocks.find(row => row.id === owner.id) : read.workspace.worksheets.find(row => row.id === owner.id);
                    result.answer = entity?.responses.some(row => row.id === responseId) ? 'saved' : 'missing';
                    result.assessment = result.answer === 'saved' && entity?.assessments.some(row => row.responseId === responseId) ? 'valid' : 'pending';
                }
            }
            return this.wire(result);
        }
        /**
         * Queue one authorized feedback intent behind existing native input, or withdraw its pending system message.
         * @param sessionId - Registered main Student Session; Remote authorization is required.
         * @param request - Explicit return, continue or resume trigger; pause removes only this lesson's queued system intent before caller-owned native cancellation.
         * @param signal - Cancellation before admission; admitted work belongs to the native queue.
         * @returns Queue state only. Failure, cancellation and completion allow a later explicit retry; no automatic wake loop or academic write occurs.
         */
        async syncFeedback(sessionId, request, signal) {
            const agent = await this.mainAgent(sessionId, signal);
            const { lessonId, trigger } = jsonSchema.object({ lessonId: jsonSchema.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u), trigger: jsonSchema.enum(['return', 'continue', 'resume', 'pause']) }).strict().parse(request);
            const queued = () => [...agent.inbox.nextTurn, ...agent.inbox.nextStep].find(message => message.source.kind === 'student-sync' && message.source.lessonId === lessonId && message.source.sessionId === sessionId);
            let intents = this.feedbackIntents.get(agent);
            if (!intents) {
                intents = new Map();
                this.feedbackIntents.set(agent, intents);
            }
            if (trigger === 'pause') {
                for (const message of [...agent.inbox.nextTurn, ...agent.inbox.nextStep])
                    if (message.source.kind === 'student-sync' && message.source.lessonId === lessonId && message.source.sessionId === sessionId)
                        agent.inbox.remove(message.id);
                intents.delete(lessonId);
                return { lessonId, status: 'paused' };
            }
            const existing = queued()?.id ?? intents.get(lessonId)?.messageId;
            if (existing || intents.has(lessonId))
                return { lessonId, status: 'coalesced', ...(existing ? { messageId: existing } : {}) };
            const intent = {};
            intents.set(lessonId, intent);
            try {
                const files = applicationStudyFiles({ agent, signal });
                const read = await readWorkspace(files, signal);
                const lessons = await readLessonFile(files, signal);
                signal.throwIfAborted();
                if (intents.get(lessonId) !== intent)
                    return { lessonId, status: 'paused' };
                const lesson = lessons.file?.lessons.find(lesson => lesson.id === lessonId);
                const owners = read.workspace ? [read.workspace, ...(read.workspace.archivedEvidence ?? []).map(archive => archive.workspace)] : [];
                if (read.status !== 'valid' || lessons.status !== 'valid' || lesson?.status !== 'ready' || !lesson.feedback || !lesson.classroomId || !lesson.learnerKey || !owners.some(owner => owner.settings.learnerId === lesson.learnerId && owner.settings.termId === lesson.termId && owner.blocks.some(block => block.learnerId === lesson.learnerId && block.id === lesson.blockId)) || !agent.ctx.tools.get('study_status', agent))
                    return { lessonId, status: 'unavailable' };
                const message = createUserMessage({ source: { kind: 'student-sync', sessionId, lessonId, learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, trigger }, content: [{ type: 'text', text: `Student feedback synchronization: ${JSON.stringify({ lessonId, learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, trigger })}. Load study and read this lesson with openmaic_feedback. Preserve original facts with native file tools, run the packaged read-only CLI, and advance its checkpoint only after independent consumption accepts the complete saved batch. ${trigger === 'continue' ? 'After accepted synchronization, the explicit Continue request may follow the shared study_status nextAction and legalActions.' : 'This return or resume requests synchronization only; retain the current activity.'} This system intent supplies no child answer, help confirmation or actual answer date.` }] });
                agent.followup(message);
                intent.messageId = message.id;
                const settled = () => { if (intents.get(lessonId) === intent)
                    intents.delete(lessonId); };
                void agent.whenIdle().then(settled, settled);
                return { lessonId, status: 'queued', messageId: message.id };
            }
            finally {
                if (!intent.messageId && intents.get(lessonId) === intent)
                    intents.delete(lessonId);
            }
        }
        wire(value) {
            if (Buffer.byteLength(JSON.stringify(value)) > this.config.maxWireBytes)
                throw new RemoteError('gateway/bad-request', 'Student JSON exceeds the configured limit; request fewer fields or a smaller projection.', {});
            return value;
        }
        readFacts(read) {
            return { readStatus: read.status, ...(read.workspace ? { termId: read.workspace.settings.termId } : {}), versions: read.files.map(({ path, targetKey, version }) => ({ path, targetKey, version })), issues: read.issues, ...(read.backupIssues ? { backupIssues: read.backupIssues } : {}) };
        }
        async mainAgent(sessionId, signal) {
            signal.throwIfAborted();
            const agent = this.ctx.agents.get(sessionId);
            if (!agent || agent.session.id !== sessionId || agent.session.header.parentSession || agent.session.header.origin === 'subagent')
                throw new RemoteError('student/main-session-required', 'Open the Student workspace in a registered main Session.', {});
            return agent;
        }
    };
})();
export { StudentRemote };
export default StudentRemote;
//# sourceMappingURL=remote-service.js.map