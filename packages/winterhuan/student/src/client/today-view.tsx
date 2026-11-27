import { useState } from 'react'
import type { Command } from '../schema.ts'
import type { LearningNextAction } from '../learning/mastery.ts'
import type { Translate } from './locales.ts'
import { formDraftKey, type DraftProps } from './drafts.tsx'
import { FigureView } from './figure-view.tsx'
import { classroomUrl } from './lessons-view.tsx'
import { feynmanPrompt, hintPromptFor, stuckPrompt } from './prompts.ts'
import type { Dashboard } from '../dashboard.ts'
import css from './desk.module.css'

type Study = NonNullable<Dashboard['study']>
type Act = (command: Command, withTutor?: boolean, prompt?: string) => Promise<void>

/** The active activity keeps one question, its original answer and the next permitted action. */
export function TodayView({ nextAction, legalActions, onAction, learnerId, termId, classroomBindingId, onContinue, study, openParent, disabled, pending, running, act, tutor, t, lessons, generationProgress = {}, onQuery, onRevise, onOpenClassroom, onHome, onPause, onStop, draftScope, legacyDraftScope, useStore, actions }: DraftProps & {
  learnerId: string | undefined; termId: string | undefined; classroomBindingId: string | undefined
  nextAction: LearningNextAction | null; legalActions: string[]; onAction: (action: string) => void; onContinue: () => void
  draftScope?: string; legacyDraftScope?: string | undefined; study: Study; openParent: () => void; disabled: boolean; pending: boolean; running: boolean
  act: Act; tutor: (text: string, currentBlock?: boolean) => Promise<void>; t: Translate
  generationProgress?: Record<string, import('../openmaic/playback.ts').LessonGenerationStatus>
  onRevise: (lessonId: string) => void
  onQuery: (lessonId: string) => void
  lessons: Dashboard['interactiveLessons']['lessons']; onOpenClassroom: (lessonId: string) => void
  onHome: () => void; onPause: () => void; onStop: () => void
}) {
  const active = study.active
  const task = study.task?.sessionId === active?.id ? study.task : undefined
  const matches = (item: typeof lessons[number]) => !!active && !!learnerId && !!termId && item.learnerId === learnerId && item.termId === termId && item.blockId === active.id
  const course = lessons.find(item => item.purpose && matches(item))
  const generating = lessons.find(item => ['generating', 'unknown'].includes(item.status) && matches(item))
  const progress = course ? generationProgress[course.id] : undefined
  const waitingCourse = course && (course.status !== 'ready' || (course.quality?.status !== 'passed' || !course.quality.reviewId) || !course.feedback)
  const rejected = course?.quality?.status === 'rejected'
  const queryCourse = generating && progress?.result?.status !== 'ready'
  const ready = lessons.find(item => item.status === 'ready' && (!item.purpose || (item.quality?.status === 'passed' && !!item.quality.reviewId)) && matches(item) && classroomUrl(item.url) && item.feedback?.goalId === nextAction?.goalId && JSON.stringify(item.feedback?.scope) === JSON.stringify(nextAction?.scope) && (nextAction?.kind === 'answer' && nextAction.questionId === task?.id && item.feedback?.bindingId === classroomBindingId || nextAction?.kind === 'learn' && !task))
  const primaryAction = nextAction?.kind === 'hold' ? legalActions.includes('resume-round') ? 'resume-round' : legalActions.includes('request-teaching') ? 'request-teaching' : legalActions.includes('sync-feedback') ? 'sync-feedback' : legalActions.includes('verify-source') ? 'verify-source' : undefined : undefined
  const needsParent = nextAction?.reason === 'confirmed-scope-required'
  const awaitingAnswer = !waitingCourse && task && task.response === undefined && nextAction?.kind === 'answer' && nextAction.questionId === task.id && !ready
  const waitingForAssessment = nextAction?.kind === 'assess' && (running || pending)
  const blocked = disabled || running || pending
  return <>
    <div className={css.statusHeading}><p>{study.profile.nickname} · {t('learningNow')}{active ? ` · ${t(active.subject)}` : ''}</p><button type="button" onClick={onHome}>{t('backHome')}</button></div>
    <section className="student-plan"><h3>{waitingCourse ? course.title : nextAction?.title ?? task?.topic ?? t('learningGoal')}</h3>
      {nextAction && <p className="student-muted">{t(continuationReasons[nextAction.reason])}</p>}
      {!awaitingAnswer && !waitingForAssessment && <button type="button" className="student-primary" disabled={(queryCourse ? disabled : blocked) || !nextAction || nextAction.kind === 'hold' && !needsParent && !primaryAction && !waitingCourse} onClick={rejected ? () => onRevise(course.id) : queryCourse ? () => onQuery(generating.id) : waitingCourse ? onContinue : needsParent ? openParent : primaryAction ? () => onAction(primaryAction) : ready ? () => onOpenClassroom(ready.id) : onContinue}>{t(rejected ? 'courseRevise' : waitingCourse ? progress?.result?.status === 'ready' || course.status === 'ready' ? 'courseCheck' : course.status === 'planned' ? 'courseStart' : course.status === 'failed' ? 'courseRecover' : 'openmaicQuery' : ready ? 'goToClass' : needsParent ? 'confirmLearningScope' : primaryAction === 'resume-round' ? 'resumeRound' : primaryAction === 'request-teaching' ? 'requestTeaching' : primaryAction === 'sync-feedback' || primaryAction === 'verify-source' ? 'retryFeedbackSync' : 'continueLearning')}</button>}
    </section>
    {nextAction?.source?.kind === 'openmaic' && <p role="status">{t(sourceNotice(nextAction.source.verification))}</p>}
    {course && !generating && waitingCourse && <p role="status">{t(rejected ? 'courseRejected' : course.status === 'planned' ? 'courseDraft' : course.status === 'failed' ? 'openmaicFailed' : 'courseReview')} · {course.title}</p>}
    {generating && <p role="status">{t(progress?.result?.status === 'ready' ? generating.purpose && (generating.quality?.status !== 'passed' || !generating.quality.reviewId) ? 'courseReview' : 'openmaicReady' : generating.status === 'unknown' ? 'openmaicUnknown' : 'openmaicGenerating')} · {generating.title}</p>}
    {rejected && <><p role="alert">{t('courseRejectedHelp')}</p><details><summary>{t('courseReviewDetails')}</summary><p>{course.quality?.notes}</p></details></>}
    {progress && <p role="status">{t('courseCheckedAt')}: {new Date(progress.checkedAt).toLocaleTimeString()}{progress.failure ? ` · ${t('courseProgressError')}` : ''}</p>}
    {task && !waitingCourse && <section className="student-focus"><Task useStore={useStore} actions={actions} draftScope={draftScope} legacyDraftScope={legacyDraftScope} key={`${task.sessionId}:${task.id}`} study={study} goalTitle={nextAction?.title ?? goalTitle(study, task.objectiveId)} goalText={undefined} disabled={blocked || nextAction?.kind === 'hold'} t={t} act={act} tutor={tutor} /></section>}
    {(running || pending) && <p role="status">{t('tutorWorking')}</p>}
    <p className="student-muted">{t('chatHelp')}</p>
    <div className={css.practiceActions}><button type="button" disabled={disabled} onClick={onPause}>{t('pauseLearning')}</button><button type="button" disabled={disabled} onClick={onStop}>{t('finishToday')}</button><button type="button" onClick={onHome}>{t('changeContent')}</button></div>
  </>
}

export const continuationReasons = { 'unfinished-question': 'continueCurrentQuestion', 'pending-assessment': 'continuePendingAnswer', 'missing-evidence': 'continueMissingEvidence', 'current-gap': 'continueCurrentGap', 'prerequisite-gap': 'continuePrerequisiteGap', 'due-review': 'continueDueReview', 'new-goal': 'continueConfirmedGoal', 'confirmed-scope-required': 'continueScopeRequired', 'check-budget-exhausted': 'continueCheckEnded', 'round-paused': 'continueRoundPaused', 'no-learnable-goal': 'continueNoGoal', 'source-unavailable': 'continueSourceUnavailable', 'source-pending': 'continueSourcePending' } as const satisfies Record<LearningNextAction['reason'], Parameters<Translate>[0]>

function sourceNotice(source: Extract<NonNullable<LearningNextAction['source']>, { kind: 'openmaic' }>['verification']): Parameters<Translate>[0] {
  if (source.status === 'ownership-unresolved') return 'feedbackOwnerUnknown'
  if (source.failure === 'login-required' || source.failure === 'login-challenge' || source.failure === 'permission-denied') return 'feedbackAuthorizationRequired'
  if (source.failure === 'identity-changed') return 'classroomIdentityMismatch'
  if (source.failure === 'operation-timeout' || source.failure === 'operation-canceled') return 'feedbackReadInterrupted'
  if (source.failure === 'response-too-large' || source.failure === 'read-limit' || source.failure === 'incomplete-read' || source.failure === 'unsupported-version') return 'feedbackReadIncomplete'
  return source.status === 'unavailable' ? 'feedbackSourceUnavailable' : 'feedbackSavePending'
}

function goalTitle(study: Study, objectiveId: string | undefined): string | undefined {
  if (!objectiveId) return undefined
  return study.curriculum?.objectives.find(item => item.id === objectiveId)?.title ?? study.objectives.find(item => item.id === objectiveId)?.title
}

const phaseOrder = ['demo', 'guide', 'try', 'vary'] as const
const phaseKeys = { demo: 'phaseDemo', guide: 'phaseGuide', try: 'phaseTry', vary: 'phaseVary' } as const

function SimonSteps({ phase, t }: { phase: typeof phaseOrder[number]; t: Translate }) {
  const current = phaseOrder.indexOf(phase)
  return <ol className="student-simon" aria-label={t('simonSteps')}>
    {phaseOrder.map((step, index) => <li key={step} className={index < current ? 'student-simon-done' : index === current ? 'student-simon-current' : undefined} aria-current={index === current ? 'step' : undefined}>{t(phaseKeys[step])}</li>)}
  </ol>
}

function Task({ study, goalTitle: title, goalText, disabled, t, act, tutor, draftScope, legacyDraftScope, useStore, actions }: DraftProps & { draftScope?: string | undefined; legacyDraftScope?: string | undefined; study: Study; goalTitle: string | undefined; goalText: string | undefined; disabled: boolean; t: Translate; act: Act; tutor: (text: string, currentBlock?: boolean) => Promise<void> }) {
  const task = study.task
  if (!task) return null
  const hintLabel = task.hintLevel > 0 ? t('hintMore') : t('hint')
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const key = formDraftKey(`answer:${task.sessionId}:${task.id}`, draftScope)
  const answer = useStore(state => state.drafts[key] ?? (legacyDraftScope ? state.drafts[formDraftKey(`answer:${task.sessionId}:${task.id}`, legacyDraftScope)] : undefined)) ?? ''
  return <><h3>{task.topic}</h3>
    <div className={`${css.taskLayout} ${task.figure ? css.withFigure : ''}`}>
    <div className={css.taskPrompt}><p className="student-question">{task.prompt}</p>
      {task.figure && <FigureView figure={task.figure} t={t} />}
    </div><div className={css.answerArea}>
    {task.response !== undefined && <p>{t('answer')}: {task.response}</p>}
    {study.feedback ? <><p className="student-result">{t(study.feedback.result)}</p><p>{study.feedback.result === 'unassessed' ? t('assessmentPending') : study.feedback.feedback}</p>
      {study.feedback.result === 'correct' && <button type="button" disabled={disabled} onClick={() => { void tutor(feynmanPrompt(title), true).catch(() => {}) }}>{t('feynmanTeach')}</button>}
    </> : task.response !== undefined ? <p role="status">{t('submitted')}</p> : task.choices ? <fieldset disabled={disabled}>
      <p>{t('chooseAnswer')}</p>
      <div className="student-choices">{task.choices.map(choice => <button key={choice} type="button" onClick={() => { void act({ action: 'answer', taskId: task.id, response: choice }, true) }}>{choice}</button>)}</div>
      <button type="button" onClick={() => { void act({ action: 'hint', taskId: task.id }, true, hintPromptFor(task)) }}>{hintLabel}</button>
      <button type="button" onClick={() => { void act({ action: 'stuck', taskId: task.id }, true, stuckPrompt) }}>{t('wont')}</button>
    </fieldset> : <form onSubmit={event => { event.preventDefault(); void act({ action: 'answer', taskId: task.id, response: String(new FormData(event.currentTarget).get('answer') ?? '') }, true) }}>
      <fieldset disabled={disabled}><label>{t('answer')}<input name="answer" aria-label={t('answer')} value={answer} onChange={event => { actions.setDraft(key, event.target.value) }} required maxLength={2000} /></label><button className="student-primary" type="submit">{t('submit')}</button>
        <button type="button" onClick={() => { void act({ action: 'hint', taskId: task.id }, true, hintPromptFor(task)) }}>{hintLabel}</button>
        <button type="button" onClick={() => { void act({ action: 'stuck', taskId: task.id }, true, stuckPrompt) }}>{t('wont')}</button>
      </fieldset>
    </form>}
    {task.hintLevel > 0 && <p>{t('hinted')} · {t('hintLevel')} {task.hintLevel}</p>}
    </div></div>
    {(title || goalText || task.phase || task.steps?.length) && <details className={css.taskDetails} open={task.phase === 'demo' || task.phase === 'guide' || !!task.steps?.length}><summary>{t('taskDetails')}</summary>
      {title && <p className="student-muted">{t('learningGoal')}: {title}</p>}
      {goalText && <p>{t('objectiveGoal')}: {goalText}</p>}
      {task.phase && <SimonSteps phase={task.phase} t={t} />}
      {task.steps && task.steps.length > 0 && <ul className="student-steps" aria-label={t('microSteps')}>
        {task.steps.map((step, index) => <li key={`${index}-${step}`}><label className="student-check"><input type="checkbox" checked={!!checked[index]} onChange={event => setChecked(previous => ({ ...previous, [index]: event.target.checked }))} />{step}</label></li>)}
      </ul>}
    </details>}
  </>
}
