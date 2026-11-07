import { z } from 'zod';
/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
export const DEFAULT_OPENMAIC_BASE = 'http://localhost:3000';
/** Lesson log written by the tutor shell. It is not learning evidence and is not inside state.json. */
export const OPENMAIC_LESSONS_PATH = '.study/openmaic-lessons.json';
/** Cookie jar shared by generate, poll, retry and stage reads. Never copy it into chat or state. */
export const OPENMAIC_COOKIE_PATH = '.study/openmaic-cookies.txt';
const LESSONS_MAX_BYTES = 524_288;
const LESSONS_SHOWN = 20;
const stamp = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u);
const lessonId = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
/**
 * Accept an http(s) origin or origin-plus-path. Credentials, queries and hashes are rejected
 * so a saved address cannot smuggle a secret.
 * @param value - parent input or environment value.
 * @returns the normalized base, an empty string when the input is blank, or undefined when it is unsafe.
 */
export function normalizeOpenmaicBase(value) {
    const trimmed = value.trim();
    if (trimmed === '')
        return '';
    let url;
    try {
        url = new URL(trimmed);
    }
    catch {
        return undefined;
    }
    if (url.username !== '' || url.password !== '')
        return undefined;
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
        return undefined;
    if (url.search !== '' || url.hash !== '')
        return undefined;
    if (url.hostname === '')
        return undefined;
    const path = url.pathname.replace(/\/+$/u, '');
    if (path.split('/').includes('..'))
        return undefined;
    return `${url.protocol}//${url.host}${path}`;
}
/**
 * Parent setting wins, then OPENMAIC_BASE, then the localhost default.
 * An invalid saved or environment value is skipped rather than failing a status read.
 */
export function effectiveOpenmaicBase(saved, env) {
    const fromSaved = saved !== undefined && saved !== '' ? normalizeOpenmaicBase(saved) : '';
    if (fromSaved)
        return fromSaved;
    const fromEnv = env !== undefined && env !== '' ? normalizeOpenmaicBase(env) : '';
    if (fromEnv)
        return fromEnv;
    return DEFAULT_OPENMAIC_BASE;
}
/** An http(s) URL with no embedded credentials, or undefined when the browser must not open it. */
export function lessonHttpUrl(value) {
    let url;
    try {
        url = new URL(value);
    }
    catch {
        return undefined;
    }
    if (url.username !== '' || url.password !== '')
        return undefined;
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
        return undefined;
    return url.href;
}
const httpLessonUrl = z.string().trim().max(2000).refine(value => lessonHttpUrl(value) !== undefined, '课堂地址需要是 http 或 https URL');
const pollUrl = z.string().trim().max(500).refine(value => value.startsWith('/') && !value.startsWith('//') || lessonHttpUrl(value) !== undefined, '轮询地址需要是相对路径或 http(s) URL');
const lessonSchema = z.object({
    id: lessonId,
    status: z.enum(['generating', 'ready', 'failed']),
    createdAt: stamp,
    updatedAt: stamp,
    title: z.string().trim().min(1).max(120),
    requirement: z.string().trim().min(1).max(4000),
    subject: z.enum(['chinese', 'math', 'english']).optional(),
    objectiveId: lessonId.optional(),
    base: z.string().trim().min(1).max(200).refine(value => normalizeOpenmaicBase(value) !== undefined && normalizeOpenmaicBase(value) !== '', 'OpenMAIC 地址无效'),
    jobId: z.string().trim().min(1).max(200).optional(),
    pollUrl: pollUrl.optional(),
    runId: z.string().trim().min(1).max(200).optional(),
    commandId: z.string().trim().min(1).max(200).optional(),
    retryable: z.boolean().optional(),
    classroomId: z.string().trim().min(1).max(200).regex(/^\S+$/u).optional(),
    url: httpLessonUrl.optional(),
    warning: z.string().trim().max(1000).optional(),
    error: z.string().trim().max(1000).optional(),
    summary: z.object({
        fetchedAt: stamp,
        outline: z.string().trim().min(1).max(2000),
        scenes: z.array(z.object({
            title: z.string().trim().min(1).max(120),
            summary: z.string().trim().max(400).optional(),
        }).strict()).max(12),
    }).strict().optional(),
}).strict();
/** Build the settings half of the projection before a file read. */
export function interactiveLessonsView(savedBase, lessons = [], error) {
    return {
        baseUrl: effectiveOpenmaicBase(savedBase, process.env.OPENMAIC_BASE),
        lessonsPath: OPENMAIC_LESSONS_PATH,
        cookiePath: OPENMAIC_COOKIE_PATH,
        lessons,
        ...(error !== undefined ? { error } : {}),
    };
}
/**
 * Parse the tutor-written lesson log. Invalid rows are dropped so one bad write does not hide the rest.
 * @param text - UTF-8 contents of `.study/openmaic-lessons.json`.
 */
export function parseInteractiveLessons(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch {
        return { lessons: [], error: '互动课记录不是有效的 JSON' };
    }
    const file = z.object({ format: z.literal(1), lessons: z.array(z.unknown()).max(80) }).strict().safeParse(parsed);
    if (!file.success)
        return { lessons: [], error: '互动课记录格式无法读取' };
    const lessons = [];
    let dropped = 0;
    for (const item of file.data.lessons) {
        const lesson = lessonSchema.safeParse(item);
        if (lesson.success)
            lessons.push(lesson.data);
        else
            dropped += 1;
    }
    lessons.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    const shown = lessons.slice(0, LESSONS_SHOWN);
    return dropped > 0 ? { lessons: shown, error: '有几条互动课记录无法读取，其余仍显示' } : { lessons: shown };
}
/**
 * Read the lesson log from the session workspace.
 * A missing file is an empty list. A bad file sets `error` and does not fail the workspace request.
 * The file is not cached: the tutor rewrites it without bumping the study revision, and the desk poll must see that write.
 */
export async function readInteractiveLessons(agent, signal, savedBase) {
    const empty = interactiveLessonsView(savedBase);
    try {
        const fs = agent.ctx?.get('fs');
        const cwd = agent.session?.header?.cwd;
        if (!fs || !cwd)
            return empty;
        signal.throwIfAborted();
        const root = await fs.resolve(cwd, { signal });
        const target = await fs.resolve(OPENMAIC_LESSONS_PATH, { cwd, signal });
        if (!fs.contains(root, target))
            return { ...empty, error: '互动课记录必须位于当前工作区内' };
        const stat = await fs.stat(target, signal);
        if (!stat)
            return empty;
        if (stat.type !== 'file')
            return { ...empty, error: '互动课记录必须是普通文件' };
        const bytes = await fs.readBytes(target, signal, LESSONS_MAX_BYTES);
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        const parsed = parseInteractiveLessons(text);
        return parsed.error !== undefined ? interactiveLessonsView(savedBase, parsed.lessons, parsed.error) : interactiveLessonsView(savedBase, parsed.lessons);
    }
    catch (error) {
        if (signal.aborted)
            throw error;
        return { ...empty, error: '互动课记录暂时无法读取' };
    }
}
//# sourceMappingURL=openmaic.js.map