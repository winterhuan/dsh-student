import { z } from 'zod'
import type { FileSystem } from '@deepseek-ai/dsh-fs'
import { readLessonFile } from './files/lessons.ts'

/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
export const DEFAULT_OPENMAIC_BASE = 'http://localhost:3000'
/** Lesson log written by the tutor shell. It is not learning evidence and is not inside state.json. */
export const OPENMAIC_LESSONS_PATH = '.study/openmaic-lessons.json'
/** Cookie jar shared by generate, poll, retry and stage reads. Never copy it into chat or state. */
export const OPENMAIC_COOKIE_PATH = '.study/openmaic-cookies.txt'
const LESSONS_SHOWN = 20

const stamp = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u).refine(value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19), 'Use an actual UTC lifecycle time.')
const lessonId = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u)

/**
 * Accept an http(s) origin or origin-plus-path. Credentials, queries and hashes are rejected
 * so a saved address cannot smuggle a secret.
 * @param value - parent input or environment value.
 * @returns the normalized base, an empty string when the input is blank, or undefined when it is unsafe.
 */
export function normalizeOpenmaicBase(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return ''
  let url: URL
  try { url = new URL(trimmed) } catch { return undefined }
  if (url.username !== '' || url.password !== '') return undefined
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
  if (url.search !== '' || url.hash !== '') return undefined
  if (url.hostname === '') return undefined
  const path = url.pathname.replace(/\/+$/u, '')
  if (path.split('/').includes('..')) return undefined
  return `${url.protocol}//${url.host}${path}`
}

/**
 * Parent setting wins, then OPENMAIC_BASE, then the localhost default.
 * An invalid saved or environment value is skipped rather than failing a status read.
 */
export function effectiveOpenmaicBase(saved: string | undefined, env: string | undefined): string {
  const fromSaved = saved !== undefined && saved !== '' ? normalizeOpenmaicBase(saved) : ''
  if (fromSaved) return fromSaved
  const fromEnv = env !== undefined && env !== '' ? normalizeOpenmaicBase(env) : ''
  if (fromEnv) return fromEnv
  return DEFAULT_OPENMAIC_BASE
}

/** An http(s) URL with no embedded credentials, or undefined when the browser must not open it. */
export function lessonHttpUrl(value: string): string | undefined {
  let url: URL
  try { url = new URL(value) } catch { return undefined }
  if (url.username !== '' || url.password !== '') return undefined
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
  return url.href
}

const httpLessonUrl = z.string().trim().max(2000).refine(value => lessonHttpUrl(value) !== undefined, '课堂地址需要是 http 或 https URL')
const pollUrl = z.string().trim().max(500).refine(value => value.startsWith('/') && !value.startsWith('//') || lessonHttpUrl(value) !== undefined, '轮询地址需要是相对路径或 http(s) URL')

/** Strict complete lesson row shared by the application and read-only CLI. */
export const lessonSchema = z.object({
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
}).strict().superRefine((lesson, ctx) => {
  if (lesson.updatedAt < lesson.createdAt) ctx.addIssue({ code: 'custom', path: ['updatedAt'], message: 'Use lifecycle times with update after creation.' })
})

/** Complete independent OpenMAIC business file; validation checks all eighty possible rows before pagination. */
export const lessonFileSchema = z.object({ format: z.literal(1), lessons: z.array(lessonSchema).max(80) }).strict().superRefine((file, ctx) => {
  const seen = new Set<string>()
  for (const [index, lesson] of file.lessons.entries()) {
    if (seen.has(lesson.id)) ctx.addIssue({ code: 'custom', path: ['lessons', index, 'id'], message: 'Lesson identities must be unique.' })
    seen.add(lesson.id)
  }
})
/** Validated complete lesson log; distinct from its twenty-row display projection. */
export type LessonFile = z.infer<typeof lessonFileSchema>

/** One interactive lesson row stored in the workspace log. */
export type InteractiveLesson = z.infer<typeof lessonSchema>

/** Lesson log projection served with the workbench payload. */
export interface InteractiveLessons {
  baseUrl: string
  lessonsPath: typeof OPENMAIC_LESSONS_PATH
  cookiePath: typeof OPENMAIC_COOKIE_PATH
  lessons: InteractiveLesson[]
  /** Set when the file exists but some or all of it cannot be shown. The rest of the desk still loads. */
  error?: string
}

/** Build the settings half of the projection before a file read. */
export function interactiveLessonsView(savedBase: string | undefined, lessons: InteractiveLesson[] = [], error?: string): InteractiveLessons {
  return {
    baseUrl: effectiveOpenmaicBase(savedBase, process.env.OPENMAIC_BASE),
    lessonsPath: OPENMAIC_LESSONS_PATH,
    cookiePath: OPENMAIC_COOKIE_PATH,
    lessons,
    ...(error !== undefined ? { error } : {}),
  }
}

/**
 * Parse every tutor-written lesson row before display pagination. Invalid and duplicate rows are dropped.
 * @param text - UTF-8 contents of `.study/openmaic-lessons.json`.
 * @returns every independently valid row and an explicit whole-file failure when required.
 */
export function parseInteractiveLessons(text: string): { lessons: InteractiveLesson[]; error?: string } {
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch { return { lessons: [], error: '互动课记录不是有效的 JSON' } }
  const complete = lessonFileSchema.safeParse(parsed)
  if (complete.success) return { lessons: complete.data.lessons.slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)) }
  const file = z.object({ format: z.literal(1), lessons: z.array(z.unknown()).max(80) }).strict().safeParse(parsed)
  if (!file.success) return { lessons: [], error: '互动课记录格式无法读取' }
  const candidates: InteractiveLesson[] = []
  let dropped = 0
  for (const item of file.data.lessons) {
    const lesson = lessonSchema.safeParse(item)
    if (lesson.success) candidates.push(lesson.data)
    else dropped += 1
  }
  const lessons = candidates.filter(lesson => candidates.filter(candidate => candidate.id === lesson.id).length === 1)
  lessons.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  return { lessons, error: dropped > 0 ? '有几条互动课记录无法读取，其余仍显示' : '互动课记录的身份或时间无法读取' }
}

type LessonFs = Pick<FileSystem, 'resolve' | 'contains' | 'stat' | 'readBytes'>

/**
 * Read the lesson log from the session workspace.
 * A missing file is an empty list. A bad file sets `error` and does not fail the workspace request.
 * The shared reader checks actual versions on both sides; the desk displays at most twenty valid rows.
 */
export async function readInteractiveLessons(agent: { ctx?: { get(name: string): unknown }; session?: { header?: { cwd?: string } } }, signal: AbortSignal, savedBase: string | undefined): Promise<InteractiveLessons> {
  const empty = interactiveLessonsView(savedBase)
  try {
    const fs = agent.ctx?.get('fs') as LessonFs | undefined
    const cwd = agent.session?.header?.cwd
    if (!fs || !cwd) return empty
    signal.throwIfAborted()
    const root = await fs.resolve(cwd, { signal })
    const target = await fs.resolve(OPENMAIC_LESSONS_PATH, { cwd, signal })
    if (!fs.contains(root, target)) return { ...empty, error: '互动课记录必须位于当前工作区内' }
    const read = await readLessonFile({
      async stat(_path, signal) { const info = await fs.stat(target, signal); return info ? { ...info, targetKey: target.targetKey } : undefined },
      async list() { return [] },
      async read(_path, signal, max) { return fs.readBytes(target, signal, max) },
    }, signal)
    if (read.status === 'missing') return empty
    const lessons = (read.file?.lessons ?? read.validRows ?? []).slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, LESSONS_SHOWN)
    return interactiveLessonsView(savedBase, lessons, read.status === 'valid' ? undefined : '互动课记录格式、身份或时间无法读取')
  } catch (error) {
    if (signal.aborted) throw error
    return { ...empty, error: '互动课记录暂时无法读取' }
  }
}
