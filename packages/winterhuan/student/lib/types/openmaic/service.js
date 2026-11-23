/** Host OpenMAIC connection reuses DSH's protected credential provider. */
import { createHash } from 'node:crypto';
import { Service } from '@deepseek-ai/cordis';
import { credentialKey, credentialRef } from '@deepseek-ai/dsh-credentials';
import z from '@deepseek-ai/schemastery';
import { OpenmaicConnection } from "./connection.js";
import { homedir } from 'node:os';
import { join } from 'node:path';
import { OpenmaicBrowser } from "./browser.js";
import { OpenmaicFeedback } from "./feedback.js";
import { OpenmaicGeneration } from "./generation.js";
/** Host defaults for the official service, credential references and private browser root. */
export const openmaicConfig = z.object({
    requestTimeoutMs: z.number().step(1).min(1).max(2_147_483_647).default(30000),
    operationTimeoutMs: z.number().step(1).min(1).max(2_147_483_647).default(120000),
    browserProfileRoot: z.string().default(''),
    baseUrl: z.string().default('https://open.maic.chat'),
    accountBaseUrl: z.string().default('https://maic.chat/api'),
    accountRef: z.string().default('OPEN_MAIC_USER'),
    passwordRef: z.string().default('OPEN_MAIC_PASSWORD'),
    accessCodeRef: z.string().default('OPEN_MAIC_ACCESS_CODE'),
    tokenRef: z.string().default('OPENMAIC_AUTH_TOKEN'),
    accountId: z.string().default(''),
});
/** Installed once at Host scope, shared by every Student agent. */
export class StudentOpenmaic extends Service {
    static inject = ['credentials'];
    static Config = openmaicConfig;
    /** Verified account transport shared across Student conversations. */
    connection;
    /** Dedicated Chrome profile and process owned by this service. */
    browser;
    feedbackReaders = new Map();
    generations = new Map();
    constructor(ctx, config) {
        super(ctx, 'studentOpenmaic');
        for (const ref of [config.accountRef, config.passwordRef, config.accessCodeRef, config.tokenRef])
            if (ref)
                credentialRef(ref);
        const authKey = credentialKey('student-openmaic', `account-${createHash('sha256').update(JSON.stringify([config.baseUrl, config.accountBaseUrl, config.accountRef, config.accountId])).digest('hex')}`);
        this.connection = new OpenmaicConnection(config, {
            async resolve(ref) { return ref ? (await ctx.credentials.resolve(credentialRef(ref)))?.value : undefined; },
            async load() { const record = await ctx.credentials.readRecord(authKey); return record?.kind === 'grant' ? record.payload : undefined; },
            async save(payload) { await ctx.credentials.modifyRecord(authKey, async () => ({ kind: 'grant', payload })); },
        });
        this.browser = new OpenmaicBrowser(this.connection, {
            profileRoot: config.browserProfileRoot || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'student-openmaic-browser'),
            async credentials() { const account = await ctx.credentials.resolve(credentialRef(config.accountRef)); const password = await ctx.credentials.resolve(credentialRef(config.passwordRef)); return account && password ? { account: account.value, password: password.value } : undefined; },
        });
        ctx.effect(() => () => this.browser.dispose(), 'student-openmaic: browser');
    }
    /**
     * Read original authorized feedback with protected capture ownership shared across children.
     * @param workspace - Authorized original workspace used to verify its generation job.
     * @returns Read-only source transport; academic writes remain native agent operations.
     */
    feedback(workspace) {
        let reader = this.feedbackReaders.get(workspace);
        if (!reader) {
            const key = (partition) => credentialKey('student-openmaic', `capture-${partition}`);
            reader = new OpenmaicFeedback(this.connection, {
                load: async (partition) => { const record = await this.ctx.credentials.readRecord(key(partition)); return record?.kind === 'grant' ? record.payload : undefined; },
                claim: async (partition, payload) => {
                    const record = await this.ctx.credentials.modifyRecord(key(partition), async (current) => current ?? { kind: 'grant', payload });
                    return record?.kind === 'grant' ? record.payload : undefined;
                },
            }, (owner, stage, signal) => this.generation(workspace).verify(owner, stage, signal));
            this.feedbackReaders.set(workspace, reader);
        }
        return reader;
    }
    /**
     * Recover jobs within their original workspace, learner, term and learning block.
     * @param workspace - Original Student workspace path from the authorized agent.
     * @returns Workspace-scoped official job transport.
     */
    generation(workspace) {
        let generation = this.generations.get(workspace);
        if (!generation) {
            const key = (owner) => credentialKey('student-openmaic', `job-${createHash('sha256').update(JSON.stringify([workspace, owner.learnerId, owner.termId, owner.blockId])).digest('hex')}`);
            generation = new OpenmaicGeneration(this.connection, {
                load: async (owner) => { const record = await this.ctx.credentials.readRecord(key(owner)); return record?.kind === 'grant' ? record.payload : undefined; },
                save: async (owner, payload) => { await this.ctx.credentials.modifyRecord(key(owner), async () => ({ kind: 'grant', payload })); },
            });
            this.generations.set(workspace, generation);
        }
        return generation;
    }
}
//# sourceMappingURL=service.js.map