/** Student-owned HTTPS phone transport, device grants and recoverable parsing queue. */
import { createHash, randomBytes, timingSafeEqual, X509Certificate } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:https';
import { isIP } from 'node:net';
import { networkInterfaces } from 'node:os';
import { Service } from '@deepseek-ai/cordis';
import { brandString } from '@deepseek-ai/dsh-brand';
import { credentialKey } from '@deepseek-ai/dsh-credentials';
import s from '@deepseek-ai/schemastery';
import { z } from 'zod';
import { applicationStudyFiles } from "../files/application.js";
import { textbookCommand, uploadSchema, textbookId, TextbookError } from "./schema.js";
import { TextbookStore } from "./store.js";
import { parseTextbookPage } from "./parser.js";
const scope = 'student-textbooks';
const base = '/student/textbooks/v1';
const digest = (secret) => createHash('sha256').update(secret).digest('hex');
const ownerSchema = z.object({ sessionId: z.string(), workspace: z.string() }).strict();
const deviceSchema = ownerSchema.extend({ id: textbookId, name: z.string().min(1).max(100), tokenHash: z.string().regex(/^[a-f0-9]{64}$/u), createdAt: z.number() }).strict();
export const textbookConfig = s.object({ host: s.string().default(''), port: s.number().step(1).min(1).max(65535).default(3082), certFile: s.string().default(''), keyFile: s.string().default(''), parseTimeoutMs: s.number().step(1).min(1000).max(3600000).default(600000), pollIntervalMs: s.number().step(1).min(1000).max(60000).default(15000) });
/** Shared Host service; the LAN listener exposes no general DSH API. */
export class StudentTextbooks extends Service {
    config;
    static inject = ['credentials', 'agents', 'attachments', 'llm', 'typert'];
    static Config = textbookConfig;
    shutdown = new AbortController();
    pairings = new Map();
    jobs = new Map();
    operations = new Map();
    server;
    certificate;
    constructor(ctx, config) {
        super(ctx, 'studentTextbooks');
        this.config = config;
    }
    async [Service.init]() {
        const { host, port, certFile, keyFile } = this.config;
        if (host) {
            const local = Object.values(networkInterfaces()).flat().some(item => item?.address === host);
            if (!isIP(host) || !local || host === '0.0.0.0' || host === '::' || !certFile || !keyFile)
                throw new Error('Student textbooks requires an explicit local interface and TLS certificate/key.');
            const [cert, key] = await Promise.all([readFile(certFile), readFile(keyFile)]);
            this.certificate = new X509Certificate(cert);
            this.server = createServer({ cert, key, minVersion: 'TLSv1.2' }, (request, response) => { void this.http(request, response); });
            this.server.requestTimeout = 60000;
            this.server.headersTimeout = 10000;
            const server = this.server;
            await this.ctx.effect(async () => {
                await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, () => { server.off('error', reject); resolve(); }); });
                return () => new Promise(resolve => { server.closeAllConnections(); server.close(() => resolve()); });
            });
        }
        this.ctx.effect(() => {
            const timer = setInterval(() => { void this.recover().catch(() => this.ctx.logger.warn('Student textbook recovery will retry.')); }, this.config.pollIntervalMs);
            return async () => { clearInterval(timer); this.shutdown.abort(); await Promise.allSettled(this.jobs.values()); };
        });
    }
    /** Resolve a previously authorized Session and reject moved workspaces. */
    async agent(owner) {
        const id = brandString(owner.sessionId);
        if (!this.ctx.agents.get(id))
            await this.ctx.typert.lookups.get('agent')?.resolve(id);
        const agent = this.ctx.agents.get(id);
        if (!agent || agent.session.header.cwd !== owner.workspace || agent.session.header.parentSession || agent.session.header.origin === 'subagent')
            throw new TextbookError('unauthorized', '原学习工作区不可用，请在 Mac 重新配对。');
        return agent;
    }
    owner(agent) {
        const workspace = agent.session.header.cwd;
        if (!workspace)
            throw new TextbookError('unavailable', '请先打开学习工作区。');
        return { workspace, sessionId: agent.id };
    }
    store(agent) { return new TextbookStore(this.owner(agent).workspace, applicationStudyFiles({ agent, signal: this.shutdown.signal })); }
    async serialize(workspace, action) {
        const previous = this.operations.get(workspace) ?? Promise.resolve();
        const next = previous.catch(() => undefined).then(action);
        this.operations.set(workspace, next);
        try {
            return await next;
        }
        finally {
            if (this.operations.get(workspace) === next)
                this.operations.delete(workspace);
        }
    }
    /** Apply a desktop or device command with the same filesystem ownership and validation. */
    async command(agent, input) {
        const command = textbookCommand.parse(input);
        const owner = this.owner(agent);
        const model = agent.model.current() ?? { provider: agent.options.provider ?? '', model: agent.options.model ?? '' };
        if (command.action === 'queue' && (!model.provider || !model.model))
            throw new TextbookError('unavailable', '请先在 Student 中选择视觉模型。');
        if (command.action === 'queue')
            await this.ctx.credentials.modifyRecord(credentialKey(scope, `workspace-${digest(owner.workspace)}`), async () => ({ kind: 'grant', payload: owner }));
        const reply = await this.serialize(owner.workspace, () => this.store(agent).command(command, model));
        if (command.action === 'queue')
            this.wake(owner);
        return { ...reply, workspaceId: digest(owner.workspace) };
    }
    /** Receive a photo without making a model request. */
    async upload(agent, input, bytes) {
        const request = uploadSchema.parse(input);
        return this.serialize(this.owner(agent).workspace, () => this.store(agent).upload(request, bytes));
    }
    /** Read only a file referenced by the selected page, never a caller-supplied path. */
    async file(agent, bookId, pageId, kind, index, candidate, revision) {
        const store = this.store(agent);
        const page = await store.page(textbookId.parse(bookId), textbookId.parse(pageId));
        if (kind !== 'original' && page.revision !== revision)
            throw new TextbookError('conflict', '页面配图已更新，请重新同步。');
        const content = candidate ? page.candidate : page.content;
        const path = kind === 'original' ? page.original : kind === 'asset' ? content?.assets[index]?.path : undefined;
        if (!path || !path.startsWith(`.study/textbooks/${bookId}/pages/${pageId}/`))
            throw new TextbookError('missing', '页面图片不存在。');
        return { bytes: await store.bytes(path), mediaType: kind === 'original' ? page.mediaType : 'image/png' };
    }
    /** Issue a short-lived pairing grant from an authorized desktop Session. */
    pair(agent) {
        if (!this.server || !this.certificate)
            throw new TextbookError('unavailable', '请先配置 Student 的局域网 HTTPS 入口。');
        const now = Date.now();
        for (const [key, value] of this.pairings)
            if (value.expiresAt <= now)
                this.pairings.delete(key);
        const code = randomBytes(24).toString('base64url');
        const expiresAt = now + 10 * 60000;
        this.pairings.set(digest(code), { ...this.owner(agent), expiresAt });
        const host = isIP(this.config.host) === 6 ? `[${this.config.host}]` : this.config.host;
        return { version: 1, url: `https://${host}:${this.config.port}${base}`, pin: createHash('sha256').update(this.certificate.raw).digest('hex'), code, expiresAt };
    }
    /** List or revoke devices belonging to the authorized workspace. */
    async devices(agent, revoke) {
        const owner = this.owner(agent);
        const devices = [];
        for (const entry of await this.ctx.credentials.listRecords())
            if (entry.key.startsWith(`${scope}/device-`)) {
                const record = await this.ctx.credentials.readRecord(entry.key);
                const value = record?.kind === 'grant' ? deviceSchema.parse(record.payload) : undefined;
                if (value?.workspace !== owner.workspace)
                    continue;
                if (value.id === revoke)
                    await this.ctx.credentials.deleteRecord(entry.key);
                else
                    devices.push({ id: value.id, name: value.name, createdAt: value.createdAt });
            }
        return devices;
    }
    wake(owner) {
        if (this.shutdown.signal.aborted || this.jobs.has(owner.workspace))
            return;
        const work = this.drain(owner).catch(() => this.ctx.logger.warn('Student textbook queue could not run; original files are retained.')).finally(() => this.jobs.delete(owner.workspace));
        this.jobs.set(owner.workspace, work);
    }
    async recover() {
        for (const entry of await this.ctx.credentials.listRecords())
            if (entry.key.startsWith(`${scope}/workspace-`)) {
                const record = await this.ctx.credentials.readRecord(entry.key);
                if (record?.kind === 'grant')
                    this.wake(ownerSchema.parse(record.payload));
            }
    }
    async drain(owner) {
        const store = this.store(await this.agent(owner));
        for (const book of await store.books())
            for (const original of await store.pages(book.id)) {
                if (this.shutdown.signal.aborted)
                    return;
                if (!original.job || original.excluded || !['queued', 'parsing'].includes(original.status))
                    continue;
                const page = await this.serialize(owner.workspace, async () => {
                    const current = await store.page(book.id, original.id);
                    if (!['queued', 'parsing'].includes(current.status) || !current.job || current.excluded)
                        return undefined;
                    return store.savePage({ ...current, status: 'parsing', error: undefined }, current.revision);
                });
                if (!page)
                    continue;
                try {
                    await parseTextbookPage(this.ctx, store, page, this.config.parseTimeoutMs, this.shutdown.signal);
                }
                catch (error) {
                    await this.serialize(owner.workspace, async () => {
                        const current = await store.page(book.id, page.id);
                        if (current.job?.id === page.job?.id && current.status === 'parsing')
                            await store.savePage({ ...current, status: this.shutdown.signal.aborted ? 'queued' : 'failed', error: error instanceof TextbookError ? error.message : '解析失败，请检查模型连接后重试。原图与已校对内容均已保留。' }, current.revision);
                    });
                }
            }
    }
    async body(request, limit) {
        if (Number(request.headers['content-length']) > limit)
            throw new TextbookError('invalid', '上传内容过大。');
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
            const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            size += bytes.length;
            if (size > limit)
                throw new TextbookError('invalid', '上传内容过大。');
            chunks.push(bytes);
        }
        return Buffer.concat(chunks);
    }
    async authenticate(request) {
        const match = /^Bearer ([a-zA-Z0-9_-]{1,80})\.([a-zA-Z0-9_-]{43})$/u.exec(request.headers.authorization ?? '');
        if (!match)
            throw new TextbookError('unauthorized', '请先与 Mac 配对。');
        const record = await this.ctx.credentials.readRecord(credentialKey(scope, `device-${match[1]}`));
        const device = record?.kind === 'grant' ? deviceSchema.parse(record.payload) : undefined;
        if (!device || !timingSafeEqual(Buffer.from(device.tokenHash, 'hex'), Buffer.from(digest(match[2]), 'hex')))
            throw new TextbookError('unauthorized', '设备凭证无效或已撤销。');
        return this.agent(device);
    }
    async http(request, response) {
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        const json = (status, body) => { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(body)); };
        try {
            if (request.headers.origin)
                throw new TextbookError('unauthorized', '此接口只允许已配对的应用访问。');
            const url = new URL(request.url ?? '/', 'https://student.invalid');
            if (url.pathname === `${base}/pair` && request.method === 'POST') {
                const input = z.object({ code: z.string().max(100), id: textbookId, name: z.string().min(1).max(100), token: z.string().regex(/^[a-zA-Z0-9_-]{43}$/u) }).strict().parse(JSON.parse((await this.body(request, 4096)).toString('utf8')));
                const pairing = this.pairings.get(digest(input.code));
                if (!pairing || pairing.expiresAt <= Date.now())
                    throw new TextbookError('unauthorized', '配对信息已失效，请在 Mac 重新生成。');
                const device = { id: input.id, name: input.name, tokenHash: digest(input.token), workspace: pairing.workspace, sessionId: pairing.sessionId, createdAt: pairing.device?.createdAt ?? Date.now() };
                if (pairing.device && (pairing.device.id !== device.id || pairing.device.tokenHash !== device.tokenHash))
                    throw new TextbookError('unauthorized', '配对信息已被使用。');
                pairing.device = device;
                await this.ctx.credentials.modifyRecord(credentialKey(scope, `device-${device.id}`), async (existing) => {
                    if (existing) {
                        const current = existing.kind === 'grant' ? deviceSchema.parse(existing.payload) : undefined;
                        if (current?.tokenHash !== device.tokenHash || current.workspace !== device.workspace)
                            throw new TextbookError('conflict', '设备标识已存在。');
                    }
                    return { kind: 'grant', payload: device };
                });
                json(200, { paired: true, workspaceId: digest(device.workspace) });
                return;
            }
            const agent = await this.authenticate(request);
            if (url.pathname === `${base}/command` && request.method === 'POST') {
                json(200, await this.command(agent, textbookCommand.parse(JSON.parse((await this.body(request, 1024 * 1024)).toString('utf8')))));
                return;
            }
            if (url.pathname === `${base}/upload` && request.method === 'POST') {
                json(200, { page: await this.upload(agent, Object.fromEntries(url.searchParams), await this.body(request, 20 * 1024 * 1024)) });
                return;
            }
            if (url.pathname === `${base}/file` && request.method === 'GET') {
                const result = await this.file(agent, url.searchParams.get('bookId') ?? '', url.searchParams.get('pageId') ?? '', url.searchParams.get('kind') ?? '', z.coerce.number().int().min(0).max(39).parse(url.searchParams.get('index') ?? 0), url.searchParams.get('candidate') === 'true', z.coerce.number().int().min(0).parse(url.searchParams.get('revision') ?? 0));
                response.writeHead(200, { 'content-type': result.mediaType, 'content-length': result.bytes.length });
                response.end(result.bytes);
                return;
            }
            json(404, { error: { code: 'missing', message: '接口不存在。' } });
        }
        catch (error) {
            if (response.headersSent) {
                response.destroy();
                return;
            }
            const problem = error instanceof TextbookError ? error : error instanceof z.ZodError || error instanceof SyntaxError ? new TextbookError('invalid', '请求格式不正确。') : new TextbookError('unavailable', '操作失败，已保存的数据仍然保留，请刷新后重试。');
            json(problem.code === 'unauthorized' ? 401 : problem.code === 'conflict' ? 409 : problem.code === 'missing' ? 404 : problem.code === 'invalid' ? 400 : 503, { error: { code: problem.code, message: problem.message } });
        }
    }
}
//# sourceMappingURL=service.js.map