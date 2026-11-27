import { validateCourseWorkspace } from './files/course-validation.ts'
import type { ValidatedWorkspace } from './files/validation.ts'
import { z } from 'zod'
import { unitCourseSchema, miniLessonSchema, teachingPlanSchema, courseReviewSchema, courseQuestionPlanSchema, sectionReadiness, type UnitCourse } from './courses.ts'
import { knowledgeIdSchema } from './capabilities.ts'
import { feedbackBindingSchema, feedbackCheckpointSchema } from './openmaic/feedback-schema.ts'
import type { FileSystem } from '@deepseek-ai/dsh-fs'
import { readLessonFile } from './files/lessons.ts'

/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
export const DEFAULT_OPENMAIC_BASE = 'https://open.maic.chat'
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
 * Parent setting wins, then OPENMAIC_BASE, then the default origin.
 * An invalid saved or environment value is skipped rather than failing a status read.
 * @param saved - the parent's saved base, when present.
 * @param env - the OPENMAIC_BASE environment value, when present.
 * @returns the first valid base or the default origin.
 */
export function effectiveOpenmaicBase(saved: string | undefined, env: string | undefined): string {
  const fromSaved = saved !== undefined && saved !== '' ? normalizeOpenmaicBase(saved) : ''
  if (fromSaved) return fromSaved
  const fromEnv = env !== undefined && env !== '' ? normalizeOpenmaicBase(env) : ''
  if (fromEnv) return fromEnv
  return DEFAULT_OPENMAIC_BASE
}

/**
 * Validate a lesson URL before opening it in the browser.
 * @param value - the recorded lesson address.
 * @returns an http(s) URL with no embedded credentials, or undefined when it is unsafe or invalid.
 */
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
  status: z.enum(['planned', 'unknown', 'generating', 'ready', 'failed']),
  purpose: z.enum(['full', 'foundation', 'synthesis']).optional(),
  course: z.object({ id: lessonId, sectionId: lessonId, revision: z.number().int().positive(), materialRevision: lessonId }).strict().optional(),
  teaching: teachingPlanSchema.optional(),
  quality: courseReviewSchema.optional(),
  questionPlan: courseQuestionPlanSchema.optional(),
  foundationConfirmation: z.string().trim().min(1).max(2000).optional(),
  replacesLessonId: lessonId.optional(),
  sourceLessonIds: z.array(lessonId).max(80).optional(),
  activity: z.object({ state: z.enum(['not-started', 'learning', 'paused', 'ended']), blockId: lessonId, position: z.string().max(500).optional() }).strict().optional(),
  createdAt: stamp,
  updatedAt: stamp,
  title: z.string().trim().min(1).max(120),
  requirement: z.string().trim().min(1).max(4000),
  subject: z.enum(['chinese', 'math', 'english']).optional(),
  objectiveId: knowledgeIdSchema.optional(),
  base: z.string().trim().min(1).max(200).refine(value => normalizeOpenmaicBase(value) !== undefined && normalizeOpenmaicBase(value) !== '', 'OpenMAIC 地址无效'),
  learnerId: lessonId.optional(),
  termId: lessonId.optional(),
  blockId: lessonId.optional(),
  learnerKey: z.string().trim().min(1).max(200).optional(),
  jobId: z.string().trim().min(1).max(200).optional(),
  pollUrl: pollUrl.optional(),
  runId: z.string().trim().min(1).max(200).optional(),
  commandId: z.string().trim().min(1).max(200).optional(),
  retryable: z.boolean().optional(),
  classroomId: z.string().trim().min(1).max(200).regex(/^\S+$/u).optional(),
  url: httpLessonUrl.optional(),
  warning: z.string().trim().max(1000).optional(),
  error: z.string().trim().max(1000).optional(),
  feedback: feedbackBindingSchema.optional(),
  checkpoint: feedbackCheckpointSchema.optional(),
  summary: z.object({
    fetchedAt: stamp,
    outline: z.string().trim().min(1).max(2000),
    scenes: z.array(z.object({
      title: z.string().trim().min(1).max(120),
      summary: z.string().trim().max(400).optional(),
    }).strict()).max(12),
  }).strict().optional(),
}).strict().superRefine((lesson, ctx) => {
  if (lesson.questionPlan && lesson.quality && !lesson.quality.reviewId) ctx.addIssue({ code: 'custom', path: ['quality', 'reviewId'], message: 'Save the complete independent review result, including reviewId, for an approved question plan.' })
  if (lesson.purpose && (!lesson.teaching || !lesson.learnerId || !lesson.termId || !lesson.blockId)) ctx.addIssue({ code: 'custom', path: ['teaching'], message: 'Full courses require a teaching plan and original ownership before submission.' })
  if (lesson.purpose === 'foundation' && !lesson.foundationConfirmation) ctx.addIssue({ code: 'custom', path: ['foundationConfirmation'], message: 'Record the explicit choice of a foundational lesson with material limitations.' })
  if ((lesson.purpose === 'full' || lesson.purpose === 'synthesis') && !lesson.course) ctx.addIssue({ code: 'custom', path: ['course'], message: 'Link the original unit section and material revision.' })
  if (lesson.quality?.status === 'passed' && lesson.quality.questions.filter(question => question.purpose === 'assessment').length > (lesson.teaching?.maxAssessmentQuestions ?? 3)) ctx.addIssue({ code: 'custom', path: ['quality'], message: 'The classroom exceeds the assessment question allowance.' })
  if (lesson.feedback && (lesson.feedback.learnerId !== lesson.learnerId || lesson.feedback.termId !== lesson.termId || lesson.feedback.blockId !== lesson.blockId || !lesson.classroomId || !lesson.learnerKey)) ctx.addIssue({ code: 'custom', path: ['feedback'], message: 'Retain the original learner, term, block and classroom source binding.' })
  if (lesson.checkpoint && lesson.checkpoint.bindingId !== lesson.feedback?.bindingId) ctx.addIssue({ code: 'custom', path: ['checkpoint'], message: 'Checkpoint belongs to the original prepared feedback binding.' })
  if (lesson.updatedAt < lesson.createdAt) ctx.addIssue({ code: 'custom', path: ['updatedAt'], message: 'Use lifecycle times with update after creation.' })
})

/** Complete independent OpenMAIC business file; validation checks all eighty possible rows before pagination. */
export const lessonFileSchema = z.object({ format: z.union([z.literal(1), z.literal(2)]), lessons: z.array(lessonSchema).max(80), courses: z.array(unitCourseSchema).max(40).optional(), miniLessons: z.array(miniLessonSchema).max(80).optional() }).strict().superRefine((file, ctx) => {
  if (file.format === 1 && (file.courses || file.miniLessons || file.lessons.some(lesson => lesson.purpose))) ctx.addIssue({ code: 'custom', path: ['format'], message: 'Use format 2 for unit courses and retained teaching plans.' })
  const courses = file.courses ?? []
  if (new Set(courses.map(course => course.id)).size !== courses.length) ctx.addIssue({ code: 'custom', path: ['courses'], message: 'Course identities must be unique.' })
  for (const course of courses) for (const section of course.sections) {
    if (!section.lessonId) continue
    const lesson = file.lessons.find(item => item.id === section.lessonId)
    if (!lesson || lesson.course?.id !== course.id || lesson.course.sectionId !== section.id) ctx.addIssue({ code: 'custom', path: ['courses'], message: 'Every section classroom must retain its reciprocal course reference.' })
  }
  for (const lesson of file.lessons) {
    if (lesson.course) {
      const course = courses.find(item => item.id === lesson.course?.id)
      const section = course?.sections.find(item => item.id === lesson.course?.sectionId)
      if (!course || !section || course.learnerId !== lesson.learnerId || course.termId !== lesson.termId || course.subject !== lesson.subject || lesson.course.revision > course.revision || !course.materials.some(item => item.revision === lesson.course?.materialRevision)) ctx.addIssue({ code: 'custom', path: ['lessons'], message: 'Retain original learner, term, subject, section and material ownership.' })
      if (course && section && lesson.status === 'planned' && sectionReadiness(course, section.id) !== 'ready') ctx.addIssue({ code: 'custom', path: ['lessons'], message: 'Confirm materials and school position before planning generation.' })
    }
    for (const ref of [...(lesson.sourceLessonIds ?? []), ...(lesson.replacesLessonId ? [lesson.replacesLessonId] : [])]) if (ref === lesson.id || !file.lessons.some(item => item.id === ref && item.learnerId === lesson.learnerId && item.termId === lesson.termId && item.subject === lesson.subject)) ctx.addIssue({ code: 'custom', path: ['lessons'], message: 'Preserve original same-learner source and replacement references.' })
  }
  if (new Set((file.miniLessons ?? []).map(mini => mini.id)).size !== (file.miniLessons ?? []).length) ctx.addIssue({ code: 'custom', path: ['miniLessons'], message: 'Mini-lesson identities must be unique.' })
  for (const mini of file.miniLessons ?? []) if (mini.sourceLessonId && !file.lessons.some(item => item.id === mini.sourceLessonId && item.learnerId === mini.learnerId && item.termId === mini.termId && item.subject === mini.subject)) ctx.addIssue({ code: 'custom', path: ['miniLessons'], message: 'Preserve original mini-lesson source ownership.' })
  const seen = new Set<string>()
  const partitions = new Map<string, string>()
  for (const [index, lesson] of file.lessons.entries()) {
    if (seen.has(lesson.id)) ctx.addIssue({ code: 'custom', path: ['lessons', index, 'id'], message: 'Lesson identities must be unique.' })
    seen.add(lesson.id)
    if (lesson.feedback && lesson.classroomId && lesson.learnerKey) { const partition = JSON.stringify([lesson.base, lesson.classroomId, lesson.learnerKey]); const owner = JSON.stringify([lesson.learnerId, lesson.termId, lesson.blockId]); if (partitions.has(partition) && partitions.get(partition) !== owner) ctx.addIssue({ code: 'custom', path: ['lessons', index, 'feedback'], message: 'One classroom learner partition retains one original Student learner, term and block.' }); partitions.set(partition, owner) }
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
  courses?: UnitCourse[]
  miniLessons?: z.infer<typeof miniLessonSchema>[]
  /** Set when the file exists but some or all of it cannot be shown. The rest of the desk still loads. */
  error?: string
}

/**
 * Build the settings half of the projection before a file read.
 * @param savedBase - the parent's saved base, when present.
 * @param lessons - the lesson rows to display; defaults to an empty list.
 * @param error - a read failure to display alongside the remaining workbench.
 * @returns the lesson rows, resolved base and workspace file paths.
 */
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
 * @param agent - the session workspace and its filesystem service.
 * @param signal - cancels filesystem reads; cancellation rejects the request.
 * @param savedBase - the parent's saved base, when present.
 * @param workspace - Independently validated academic records for course ownership.
 * @returns the lesson projection, with an error for an unreadable file.
 */
export async function readInteractiveLessons(agent: { ctx?: { get(name: string): unknown }; session?: { header?: { cwd?: string } } }, signal: AbortSignal, savedBase: string | undefined, workspace?: ValidatedWorkspace): Promise<InteractiveLessons> {
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
    if (read.file?.lessons.some(lesson => lesson.purpose) || read.file?.courses?.length || read.file?.miniLessons?.length) {
      if (!workspace || validateCourseWorkspace(read.file!, workspace).length) return { ...empty, error: '课程归属或学习活动引用无效，请修复正式文件后重试' }
    }
    const lessons = (read.file?.lessons ?? read.validRows ?? []).slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, LESSONS_SHOWN)
    return { ...interactiveLessonsView(savedBase, lessons, read.status === 'valid' ? undefined : '互动课记录格式、身份或时间无法读取'), ...(read.status === 'valid' ? { courses: read.file?.courses ?? [], miniLessons: read.file?.miniLessons ?? [] } : {}) }
  } catch (error) {
    if (signal.aborted) throw error
    return { ...empty, error: '互动课记录暂时无法读取' }
  }
}
