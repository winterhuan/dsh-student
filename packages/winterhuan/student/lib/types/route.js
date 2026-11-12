import { FsError } from '@deepseek-ai/dsh-fs';
import { SessionId } from '@deepseek-ai/dsh-session';
import { z } from 'zod';
import { studyStore } from "./store.js";
import { queryDashboard as dashboard } from "./learning/queries.js";
import { readInteractiveLessons } from "./openmaic.js";
/** Browser requests must address the local DSH host and originate from the same authority. */
export function trustedStudyRequest(request) {
    try {
        const host = request.headers.host;
        if (!host || request.headers['sec-fetch-site'] === 'cross-site')
            return false;
        const url = new URL(`http://${host}`);
        if (url.host !== host || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
            return false;
        const origin = request.headers.origin;
        return origin === undefined || (typeof origin === 'string' && new URL(origin).host === url.host);
    }
    catch {
        return false;
    }
}
function send(response, status, value) {
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    response.end(JSON.stringify(value));
}
/** Read-only local browser projection retains same-authority and registered main-Session checks. */
export async function handleStudyRequest(context, request, response) {
    const abort = new AbortController();
    const onClose = () => { if (!response.writableEnded)
        abort.abort(); };
    response.on('close', onClose);
    try {
        if (!trustedStudyRequest(request)) {
            send(response, 403, { error: '请求来源不受信任' });
            return;
        }
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (url.pathname !== '/student/workspace' || request.method !== 'GET') {
            send(response, 404, { error: '学习接口不存在' });
            return;
        }
        const rawId = url.searchParams.get('sessionId');
        if (!rawId || rawId.length > 200) {
            send(response, 400, { error: '请先打开学习会话' });
            return;
        }
        if (url.searchParams.has('revision'))
            z.coerce.number().int().nonnegative().parse(url.searchParams.get('revision'));
        const mistakeOffset = z.coerce.number().int().min(0).max(5000).parse(url.searchParams.get('mistakeOffset') ?? '0');
        const subject = z.enum(['chinese', 'math', 'english']).parse(url.searchParams.get('subject') ?? 'math');
        const mistakeStatus = z.enum(['all', 'due', 'reviewing', 'mastered']).parse(url.searchParams.get('mistakeStatus') ?? 'all');
        const mapGrade = url.searchParams.has('mapGrade') ? z.coerce.number().int().min(1).max(2).parse(url.searchParams.get('mapGrade')) : undefined;
        const mapTerm = url.searchParams.has('mapTerm') ? z.enum(['first', 'second']).parse(url.searchParams.get('mapTerm')) : undefined;
        const diagGrade = url.searchParams.has('diagGrade') ? z.coerce.number().int().min(1).max(2).parse(url.searchParams.get('diagGrade')) : undefined;
        const diagTerm = url.searchParams.has('diagTerm') ? z.enum(['first', 'second']).parse(url.searchParams.get('diagTerm')) : undefined;
        const diagUnit = url.searchParams.has('diagUnit') ? z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u).parse(url.searchParams.get('diagUnit')) : undefined;
        const tab = url.searchParams.has('tab') ? z.enum(['today', 'map', 'mistakes', 'parent']).parse(url.searchParams.get('tab')) : undefined;
        const agent = context.agents.get(SessionId(rawId));
        if (!agent || agent.session.id !== rawId || agent.session.header.parentSession || agent.session.header.origin === 'subagent') {
            send(response, 404, { error: '请在主会话中打开学习工作区' });
            return;
        }
        const state = await studyStore({ agent, signal: abort.signal });
        // The browser never calls OpenMAIC. A cross-origin fetch to :3000 would drop the anonymous cookie.
        // The tutor shell writes the lesson log; this response only reads it, including on an unchanged poll,
        // because that write does not bump the study revision.
        const interactiveLessons = await readInteractiveLessons(agent, abort.signal, state?.openmaic?.baseUrl);
        // Revision alone does not establish validity across due times, calendar days or evidence thresholds.
        send(response, 200, { ...dashboard(state, Date.now(), { subject, mistakeOffset, mistakeStatus, ...(tab !== undefined ? { tab } : {}), ...(mapGrade !== undefined ? { mapGrade } : {}), ...(mapTerm !== undefined ? { mapTerm } : {}), ...(diagGrade !== undefined ? { diagGrade } : {}), ...(diagTerm !== undefined ? { diagTerm } : {}), ...(diagUnit !== undefined ? { diagUnit } : {}) }), interactiveLessons });
    }
    catch (error) {
        const conflict = error instanceof FsError && ['FS_STALE_VERSION', 'FS_NOT_OBSERVED'].includes(error.code);
        send(response, conflict ? 409 : 400, { error: error instanceof z.ZodError ? '请填写完整且有效的学习资料' : error instanceof Error ? error.message : '学习档案暂时无法读取' });
    }
    finally {
        response.off('close', onClose);
    }
}
/** Optional web integration leaves the same plugin usable in terminal sessions. */
export function registerStudyRoute(context) {
    context.inject(['webServer', 'agents'], ctx => {
        ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: '/student', handler: (request, response) => handleStudyRequest(ctx, request, response) }), 'student: workspace API');
    });
}
//# sourceMappingURL=route.js.map