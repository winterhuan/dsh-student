import { useState } from 'react'
import { sectionReadiness, type UnitCourse } from '../courses.ts'
import type { LessonGenerationStatus } from '../openmaic/playback.ts'
import type { Dashboard } from '../dashboard.ts'
import type { Translate } from './locales.ts'

type Lesson = Dashboard['interactiveLessons']['lessons'][number]
const statusKey = { planned: 'courseDraft', unknown: 'openmaicUnknown', generating: 'openmaicGenerating', ready: 'openmaicReady', failed: 'openmaicFailed' } as const

/** http(s) URL without credentials, or undefined when the desk must not offer it. */
export function classroomUrl(value: string | undefined): string | undefined {
  if (value === undefined || value === '') return undefined
  let parsed: URL
  try { parsed = new URL(value) } catch { return undefined }
  if (parsed.username !== '' || parsed.password !== '' || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) return undefined
  return parsed.href
}

export function openClassroom(url: string) {
  // Standalone callers retain external playback; Student supplies protected lesson opening.
  const href = classroomUrl(url)
  if (href === undefined) return
  window.open(href, '_blank', 'noopener,noreferrer')
}

/** Lessons for the open subject. A row with no subject stays visible; a row for another subject does not. */
export function lessonsForSubject<T extends { subject?: 'chinese' | 'math' | 'english' | undefined }>(lessons: readonly T[], subject: 'chinese' | 'math' | 'english'): T[] {
  return lessons.filter(lesson => lesson.subject === undefined || lesson.subject === subject)
}

/** Recent OpenMAIC lessons: open or copy the URL, and ask the tutor to generate, retry or review. */
export function LessonsPanel({ lessons, error, disabled, running, t, onGenerate, onOpen, onQuery, onRetry, onReview, courses = [], miniLessons = [], progress = {}, onCourse, onPrepare }: {
  courses?: UnitCourse[]
  miniLessons?: NonNullable<Dashboard['interactiveLessons']['miniLessons']>
  progress?: Record<string, LessonGenerationStatus>
  onCourse?: (action: string, courseId?: string, sectionId?: string) => void
  onPrepare?: (lessonId: string) => void
  lessons: Lesson[]
  error?: string
  disabled: boolean
  running: boolean
  t: Translate
  onOpen?: (lessonId: string) => void
  onGenerate?: () => void
  onQuery: (lessonId: string) => void
  onRetry: (runId: string) => void
  onReview: (classroomId: string) => void
}) {
  const [copiedId, setCopiedId] = useState('')
  const busy = disabled || running
  return <section aria-label={t('openmaicTitle')}>
    <h3>{t('openmaicTitle')}</h3>
    <p className="student-muted">{t('openmaicHelp')}</p>
    {error && <p role="alert">{error}</p>}
    {onCourse && <section aria-label={t('courseDirectory')}>
      <h4>{t('courseDirectory')}</h4>
      {courses.length === 0 && <p>{t('courseMaterials')}</p>}
      {courses.map(course => <details key={course.id} open><summary>{course.unit}</summary><ol>
        {course.sections.map(section => { const readiness = sectionReadiness(course, section.id); const lesson = lessons.find(item => item.id === section.lessonId); return <li key={section.id}>
          <strong>{section.title}</strong><p>{lesson ? t(lesson.quality?.status === 'rejected' ? 'courseRejected' : lesson.purpose && (lesson.quality?.status !== 'passed' || !lesson.quality.reviewId) && (progress[lesson.id]?.result?.status ?? lesson.status) === 'ready' ? 'courseReview' : statusKey[progress[lesson.id]?.result?.status ?? lesson.status]) : t('courseDraft')}</p>
          <p>{t(lesson?.activity?.state === 'ended' ? 'courseEnded' : lesson?.activity?.state === 'paused' ? 'coursePaused' : lesson?.activity?.state === 'learning' ? 'courseLearning' : 'courseNotStarted')}</p>
          {readiness !== 'ready' && <p>{t(readiness === 'materials' ? 'courseMaterials' : readiness === 'school-position' ? 'courseSchool' : 'courseSynthesis')}</p>}
          <button type="button" disabled={busy} onClick={() => lesson?.quality?.status === 'rejected' ? onCourse('revise', course.id, lesson.id) : lesson ? ['generating', 'unknown'].includes(lesson.status) && progress[lesson.id]?.result?.status !== 'ready' ? onQuery(lesson.id) : lesson.status === 'ready' && (!lesson.purpose || (lesson.quality?.status === 'passed' && !!lesson.quality.reviewId)) ? onOpen?.(lesson.id) : onPrepare?.(lesson.id) : onCourse(readiness === 'ready' ? 'start' : 'setup', course.id, section.id)}>{t(lesson?.quality?.status === 'rejected' ? 'courseRevise' : lesson && ['generating', 'unknown'].includes(lesson.status) ? 'openmaicQuery' : lesson?.status === 'ready' ? (lesson.quality?.status === 'passed' && !!lesson.quality.reviewId) || !lesson.purpose ? 'openmaicOpen' : 'courseCheck' : readiness === 'ready' ? 'courseStart' : 'courseSetup')}</button>
        </li> })}
      </ol><button type="button" disabled={busy} onClick={() => onCourse('synthesis', course.id)}>{t('courseSynthesisStart')}</button></details>)}
      <button type="button" disabled={busy} onClick={() => onCourse('setup')}>{t('courseSetup')}</button>
      <p className="student-muted">{t('courseFoundationHelp')}</p>
      <button type="button" disabled={busy} onClick={() => onCourse('foundation')}>{t('courseFoundation')}</button>
      {miniLessons.length > 0 && <><h4>{t('courseMini')}</h4>{miniLessons.map(mini => <button key={mini.id} type="button" disabled={busy} onClick={() => onCourse('mini', undefined, mini.id)}>{t('courseMiniOpen')} · {mini.id}</button>)}</>}
    </section>}
    {onGenerate && <button type="button" disabled={busy} onClick={onGenerate}>{t('openmaicGenerate')}</button>}
    {lessons.length === 0 ? <p>{t('openmaicEmpty')}</p> : lessons.map((lesson, index) => <details key={lesson.id} open={index === 0}>
      <summary>{lesson.title} · {t(lesson.quality?.status === 'rejected' ? 'courseRejected' : lesson.purpose && (lesson.quality?.status !== 'passed' || !lesson.quality.reviewId) && (progress[lesson.id]?.result?.status ?? lesson.status) === 'ready' ? 'courseReview' : statusKey[progress[lesson.id]?.result?.status ?? lesson.status])}</summary>
      {progress[lesson.id] && <p role="status">{t('courseCheckedAt')}: {new Date(progress[lesson.id]!.checkedAt).toLocaleTimeString()}{progress[lesson.id]?.failure ? ` · ${t('courseProgressError')}` : ''}</p>}
      {lesson.quality?.status === 'rejected' && <><p role="alert">{t('courseRejectedHelp')}</p><details><summary>{t('courseReviewDetails')}</summary><p>{lesson.quality.notes}</p></details>{onCourse && <button type="button" disabled={busy} onClick={() => onCourse('revise', lesson.course?.id, lesson.id)}>{t('courseRevise')}</button>}</>}
      {lesson.purpose && <p>{t((lesson.quality?.status === 'passed' && !!lesson.quality.reviewId) ? 'courseVerified' : 'courseReview')}</p>}
      <details><summary>{t('openmaicOutline')}</summary><p className="student-muted">{lesson.requirement}</p></details>
      {lesson.warning && <p>{t('openmaicWarning')}: {lesson.warning}</p>}
      {lesson.error && <p role="alert">{lesson.error}</p>}
      {classroomUrl(lesson.url) && (!lesson.purpose || (lesson.quality?.status === 'passed' && !!lesson.quality.reviewId)) && <>
        <p>{t('coursePosition')}</p>
        <p className="student-url">{classroomUrl(lesson.url)}</p>
        <div className="student-segments">
          <button type="button" disabled={busy} onClick={() => onOpen ? onOpen(lesson.id) : openClassroom(lesson.url ?? '')}>{t('openmaicOpen')}</button>
          <button type="button" onClick={() => {
            const url = classroomUrl(lesson.url)
            if (url === undefined) return
            void navigator.clipboard?.writeText(url).then(() => setCopiedId(lesson.id)).catch(() => setCopiedId(''))
          }}>{copiedId === lesson.id ? t('openmaicCopied') : t('openmaicCopy')}</button>
        </div>
      </>}
      {lesson.status !== 'planned' && lesson.status !== 'ready' && <button type="button" disabled={disabled} onClick={() => onQuery(lesson.id)}>{t('openmaicQuery')}</button>}
      {(progress[lesson.id]?.result?.status === 'ready' || lesson.status === 'ready' && lesson.purpose && !lesson.quality) && onPrepare && <button type="button" disabled={busy} onClick={() => onPrepare(lesson.id)}>{t('courseCheck')}</button>}
      {onCourse && (['unknown', 'generating', 'failed'].includes(lesson.status) || lesson.quality?.status === 'rejected') && <button type="button" disabled={busy} onClick={() => onCourse('temporary', lesson.course?.id, lesson.id)}>{t('courseTemporary')}</button>}
      {lesson.status === 'failed' && lesson.retryable === true && lesson.runId && <button type="button" disabled={busy} onClick={() => onRetry(lesson.runId ?? '')}>{t('openmaicRetry')}</button>}
      {lesson.status === 'ready' && lesson.classroomId && <button type="button" disabled={busy} onClick={() => onReview(lesson.classroomId ?? '')}>{t('openmaicReview')}</button>}
      {lesson.summary && <div>
        <p>{t('openmaicOutline')}</p>
        <p>{lesson.summary.outline}</p>
        {lesson.summary.scenes.map((scene, sceneIndex) => <p key={`${scene.title}-${sceneIndex}`} className="student-muted">{scene.title}{scene.summary ? ` · ${scene.summary}` : ''}</p>)}
      </div>}
    </details>)}
  </section>
}
