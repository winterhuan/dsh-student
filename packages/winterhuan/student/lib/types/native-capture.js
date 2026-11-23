/** Receipt-time ownership is support metadata; the agent still authors all academic records. */
import { Service } from '@deepseek-ai/cordis';
import { appendPluginRecord } from '@deepseek-ai/dsh-session';
import { applicationStudyFiles } from "./files/application.js";
import { readWorkspace } from "./files/read.js";
import { canonical } from "./learning/shared.js";
import { nativeMessageHash } from "./native-source.js";
/** Host-owned receipt snapshots are released on Agent disposal and Host teardown. */
export class StudentNativeCapture extends Service {
    owners = new WeakMap();
    admissions = new WeakMap();
    /** @param ctx - Host lifetime owning receipt metadata. */
    constructor(ctx) {
        super(ctx, 'studentNativeCapture');
        ctx.on('agent/disposed', ({ agent }) => { this.owners.delete(agent); this.admissions.delete(agent); });
        ctx.effect(() => () => { this.owners = new WeakMap(); this.admissions = new WeakMap(); });
    }
    /** @param agent - Main Agent. @returns Current receipt owner, if available. */
    owner(agent) { return this.owners.get(agent); }
    /**
     * Cache a complete independent owner publication before later user receipt.
     * @param agent - Owning main native Agent.
     * @param read - Independently read files with observed versions.
     * @returns Frozen owner and question when complete; otherwise removes cached ownership.
     */
    remember(agent, read) {
        this.owners.delete(agent);
        const workspace = read.status === 'valid' ? read.workspace : undefined;
        const block = workspace?.blocks.find(block => block.endedAt === undefined);
        const question = block?.questions.find(question => question.id === block.currentQuestionId);
        if (!workspace?.settings.learnerId || !block?.learnerId || !question || agent.session.header.parentSession || agent.session.header.origin === 'subagent')
            return undefined;
        const paths = ['.study/settings.json', `.study/blocks/${block.id}.json`];
        const versions = read.files.filter(file => paths.includes(file.path) && file.targetKey && file.version).map(file => ({ path: file.path, targetKey: file.targetKey, version: file.version }));
        const snapshot = { scope: { learnerId: block.learnerId, termId: block.termId, blockId: block.id, questionId: question.id }, questionSnapshot: canonical(question), versions };
        if (versions.length !== 2 || snapshot.questionSnapshot.length > 65_536)
            return undefined;
        this.owners.set(agent, snapshot);
        return snapshot;
    }
    async refresh(agent, signal) {
        if (!agent.session.header.cwd || !agent.ctx.get('fs') || !agent.ctx.get('sandboxPolicy')) {
            this.owners.delete(agent);
            return undefined;
        }
        let read;
        try {
            read = await readWorkspace(applicationStudyFiles({ agent, signal }), signal);
        }
        catch (error) {
            this.owners.delete(agent);
            if (signal.aborted)
                throw error;
            return undefined;
        }
        signal.throwIfAborted();
        return this.remember(agent, read);
    }
    /**
     * Freeze the cached owner at inbox insertion and recheck it after downstream admission hooks.
     * @param context - Student preset lifetime and native Agent events.
     */
    register(context) {
        context.on('agent/created', async ({ agent, signal }) => { await this.refresh(agent, signal ?? AbortSignal.timeout(30_000)); return undefined; });
        context.on('agent/inbox/discarded', ({ agent, message }) => {
            const splice = agent.session.snapshotEvents().at(-1);
            if (splice?.type !== 'agent/inbox/spliced' || splice.data.inserted.length !== 1 || splice.data.inserted[0]?.id !== message.id)
                this.admissions.get(agent)?.delete(message.id);
        });
        context.on('agent/inbox/inserted', ({ agent, message }) => {
            if (message.source.kind !== 'user')
                return;
            const splice = agent.session.snapshotEvents().at(-1);
            if (splice?.type !== 'agent/inbox/spliced')
                return;
            let pending = this.admissions.get(agent);
            if (!pending) {
                pending = new Map();
                this.admissions.set(agent, pending);
            }
            const previous = pending.get(message.id);
            const messageHash = nativeMessageHash(message);
            const continuous = previous && splice.data.removedCount === 1 && splice.data.inserted.length === 1 && previous.sourceSnapshot === canonical(message.source);
            const snapshot = continuous ? previous.snapshot : agent.status === 'idle' ? this.owner(agent) : undefined;
            pending.delete(message.id);
            if (snapshot) {
                if (pending.size >= 20)
                    pending.delete(pending.keys().next().value);
                pending.set(message.id, { snapshot, messageHash, sourceSnapshot: canonical(message.source), receiptSeq: continuous && previous.messageHash === messageHash ? previous.receiptSeq : splice.seq });
            }
        });
        context.on('agent/pre-step', async ({ agent, messages, turn, step, signal }, next) => {
            const users = messages.filter(message => message.source.kind === 'user');
            const original = users.length === 1 ? users[0] : undefined;
            const admitted = original ? this.admissions.get(agent)?.get(original.id) : undefined;
            for (const message of users)
                this.admissions.get(agent)?.delete(message.id);
            const decision = await next();
            if (decision.kind !== 'enter')
                return decision;
            const current = await this.refresh(agent, signal);
            if (original && admitted && nativeMessageHash(original) === admitted.messageHash && decision.messages.filter(message => nativeMessageHash(message) === admitted.messageHash).length === 1 && canonical(current) === canonical(admitted.snapshot)) {
                signal.throwIfAborted();
                appendPluginRecord(agent.session, 'plugin:student/native-owner', { ...admitted.snapshot, sessionId: agent.session.id, turn, step, receiptSeq: admitted.receiptSeq, messageHash: admitted.messageHash });
            }
            return decision;
        });
    }
}
/** @param context - Student preset registering capture before Agent creation. */
export function registerNativeCapture(context) {
    const capture = context.root.get('studentNativeCapture') ?? new StudentNativeCapture(context.root);
    capture.register(context);
}
//# sourceMappingURL=native-capture.js.map