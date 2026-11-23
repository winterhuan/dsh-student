import { useEffect, useState } from 'react'
import type { Command } from '../schema.ts'
import type { CheckInIntensity, LearningNextAction, LearningRoundView } from '../learning/mastery.ts'
import type { Translate } from './locales.ts'
import { formDraftKey, type DraftProps } from './drafts.tsx'
import { FigureView } from './figure-view.tsx'
import { classroomUrl } from './lessons-view.tsx'
import { MasteryDots } from './mastery-dots.tsx'
import { feynmanPrompt, hintPromptFor, stuckPrompt } from './prompts.ts'
import { assistKeys, day, focusKeys, intensityHelpKeys, intensityKeys, reminderKeys, type Activity, type Mode, type ScopeChoice, type Subject } from './display.ts'
import type { Dashboard } from '../dashboard.ts'
import css from './desk.module.css'

type Study = NonNullable<Dashboard['study']>
type Curriculum = NonNullable<Study['curriculum']>
type Goal = { id: string; title: string }
type Act = (command: Command, withTutor?: boolean, prompt?: string) => Promise<void>

/** The learner's page: one recommended next step, the current question, and a folded set of other ways to practise. */
export function TodayView({ nextAction, round, legalActions, onAction, learnerId, termId, classroomBindingId, onContinue, study, subject, activity, setActivity, goal, curriculum, selectedObjectiveId, chooseGoal, intensityLabel, openParent, openCheckins, scope, setScope, scopeUnits, start, startDiagnosis, chosenIntensity, disabled, pending, running, act, tutor, t, prompts, lessons, onOpenClassroom, draftScope, useStore, actions }: DraftProps & {
  learnerId: string | undefined
  termId: string | undefined
  classroomBindingId: string | undefined
  nextAction: LearningNextAction | null
  round: LearningRoundView | null
  legalActions: string[]
  onAction: (action: string) => void
  onContinue: () => void
  draftScope?: string
  study: Study
  subject: Subject
  activity: Activity
  setActivity: (activity: Activity) => void
  goal: Goal | undefined
  curriculum: Curriculum | null
  selectedObjectiveId: string
  chooseGoal: (goal: { id: string; subject: Subject }) => void
  intensityLabel: string
  openParent: () => void
  openCheckins: () => void
  scope: ScopeChoice
  setScope: (scope: ScopeChoice) => void
  scopeUnits: { id: string; name: string }[]
  start: (subject: Subject, mode: Mode, inquiry?: string) => Promise<void>
  startDiagnosis: (subject: Subject, intensity: CheckInIntensity) => Promise<void>
  chosenIntensity: CheckInIntensity
  disabled: boolean
  pending: boolean
  running: boolean
  act: Act
  tutor: (text: string, currentBlock?: boolean) => Promise<void>
  t: Translate
  prompts: { daily: string; dictation: string }
  lessons: Dashboard['interactiveLessons']['lessons']
  onOpenClassroom: (lessonId: string) => void
}) {
  const active = study.active?.subject === subject ? study.active : undefined
  const reflectionKey = formDraftKey(`reflection:${active?.id ?? 'none'}`, draftScope)
  const reflection = useStore(state => state.drafts[reflectionKey]) ?? ''
  const ownSession = !!active
  const task = ownSession && study.task?.sessionId === active.id ? study.task : undefined
  const progress = curriculum?.scope.current ? study.courses.find(item => item.subject === subject)?.progress : undefined
  const frontierIndex = progress ? curriculum?.units.findIndex(unit => unit.id === progress.unitId) ?? -1 : -1
  const schoolUnit = frontierIndex >= 0 ? curriculum?.units[frontierIndex] : undefined
  const homeUnit = curriculum?.scope.current ? [...curriculum.units].reverse().find(unit => curriculum.concepts.some(concept => concept.unit === unit.id && concept.level !== 'untouched')) : undefined
  const objectiveMeta = curriculum?.scope.current ? curriculum.objectives.find(item => item.id === task?.objectiveId) : undefined
  const explain = study.understandingReminders[0]
  const matchesCurrent = (item: typeof lessons[number]) => !!active && !!learnerId && !!termId && item.learnerId === learnerId && item.termId === termId && item.blockId === active.id && (item.subject === undefined || item.subject === (nextAction?.subject ?? active.subject))
  const generating = lessons.find(item => item.status === 'generating' && matchesCurrent(item))
  const ready = lessons.find(item => item.status === 'ready' && matchesCurrent(item) && classroomUrl(item.url)
    && nextAction?.goalId !== undefined && item.feedback?.goalId === nextAction.goalId
    && nextAction.scope !== undefined && JSON.stringify(item.feedback.scope) === JSON.stringify(nextAction.scope)
    && (nextAction.kind === 'answer' && nextAction.blockId === active?.id && nextAction.questionId === task?.id && classroomBindingId !== undefined && item.feedback.bindingId === classroomBindingId
      || nextAction.kind === 'learn' && !task))
  const readyUrl = classroomUrl(ready?.url)
  const shownReady = ready ?? (!nextAction ? lessons.find(item => item.status === 'ready' && matchesCurrent(item) && classroomUrl(item.url)) : undefined)
  const chosen = nextAction
  const nextTitle = chosen?.title ?? goalTitle(study, task?.objectiveId) ?? task?.topic ?? t('todayPlan')
  const chosenReason = chosen ? continuationReasons[chosen.reason] : undefined
  const primaryAction = chosen?.kind === 'hold' ? legalActions.includes('resume-round') ? 'resume-round' : legalActions.includes('request-teaching') ? 'request-teaching' : legalActions.includes('sync-feedback') ? 'sync-feedback' : legalActions.includes('verify-source') ? 'verify-source' : undefined : undefined
  const needsParent = chosen?.reason === 'confirmed-scope-required'
  const primaryLabelKey = needsParent ? 'confirmLearningScope' : primaryAction === 'resume-round' ? 'resumeRound' : primaryAction === 'request-teaching' ? 'requestTeaching' : primaryAction === 'sync-feedback' || primaryAction === 'verify-source' ? 'retryFeedbackSync' : 'continueLearning'
  const playable = !!readyUrl && !lessons.some(item => item.status === 'generating' && matchesCurrent(item))
  return <>
    <section className="student-plan"><h3>{nextTitle}</h3>
      <p className="student-muted">{t(chosenReason ?? 'continueWaiting')}</p>
      <button type="button" className="student-primary" disabled={disabled || running || pending || !chosen || chosen.kind === 'hold' && !needsParent && !primaryAction} onClick={needsParent ? openParent : primaryAction ? () => onAction(primaryAction) : playable ? () => onOpenClassroom(ready!.id) : onContinue}>{t(playable ? 'goToClass' : primaryLabelKey)}</button>
    </section>
    {round && <section className="student-status"><p role="status"><span>{t(round.status === 'paused' ? 'roundPaused' : round.status === 'ended' ? 'roundEnded' : 'roundActive')}</span> · <span>{t(round.kind === 'check' ? 'roundCheckRemaining' : 'roundReviewRemaining').replace('{count}', String(round.remaining))}</span></p></section>}
    {chosen?.source?.kind === 'openmaic' && <p role="status">{t(sourceNotice(chosen.source.verification))}</p>}
    {(generating || shownReady) && <section>
      {generating && <p role="status">{t('openmaicGenerating')} · {generating.title}</p>}
      {shownReady && <p className="student-muted">{shownReady.title}</p>}
    </section>}
    <section className="student-status"><div className={css.statusHeading}><p>{study.profile.nickname}{active ? ` · ${t(active.subject)} · ${t(active.mode)}` : ''}</p><p>{t('todayStars')}: {study.todayStars}</p></div>
      <details open={!ownSession}><summary>{t('studyDetails')}</summary>
      <p>{t('due')}: {study.dueCount} · {t('weakPoints')}: {study.weakPoints.length}</p>
      {schoolUnit && <p>{t('schoolFrontier')}: {schoolUnit.name} · {t(progress?.posture === 'catch-up' ? 'catchUp' : 'keepUp')}{progress?.pace === 'review' ? ` · ${t('reviewWeek')}` : ''} · {t('homeProgress')}: {homeUnit?.name ?? t('homeNotStarted')}</p>}
      <p className="student-muted">{t(subject === 'chinese' ? 'chineseMethod' : subject === 'math' ? 'mathMethod' : 'englishMethod')}</p>
      </details>
    </section>
    {ownSession && <>
      <section className="student-focus">{task ? <Task useStore={useStore} actions={actions} draftScope={draftScope} key={`${task.sessionId}:${task.id}`} study={study} goalTitle={goalTitle(study, task.objectiveId)} goalText={objectiveMeta?.goal} days={objectiveMeta?.independentDays} disabled={disabled || running || pending || chosen?.kind === 'hold'} t={t} act={act} tutor={tutor} /> : <p>{t('waiting')}</p>}
        <p className="student-muted">{t('chatHelp')}</p>
        {running && <p role="status">{t('tutorWorking')}</p>}
      </section>
      <form onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void act({ action: 'stop', sessionId: active.id, reflection: String(form.get('reflection') ?? '') }) }}>
        <div className="student-segments">
          <button disabled={disabled} type="submit">{t('stop')}</button>
          {(explain || task?.objectiveId) && <button type="button" disabled={disabled || running || pending} onClick={() => { void tutor(feynmanPrompt(explain?.title ?? goalTitle(study, task?.objectiveId)), true).catch(() => {}) }}>{t('feynmanTeach')}</button>}
        </div>
        <details className="student-fold">
          <summary>{t('reflectionOptional')}</summary>
          {(explain || task?.objectiveId) && <p>{t('explainPrompt')}{explain ? ` · ${explain.title}` : ''}</p>}
          <label>{t('reflection')}<textarea aria-label={t('reflection')} name="reflection" value={reflection} onChange={event => actions.setDraft(reflectionKey, event.target.value)} maxLength={2000} placeholder={t('explainPrompt')} /></label>
        </details>
      </form>
    </>}
    {chosen && legalActions.includes('more-review') && <button type="button" disabled={disabled || running || pending} onClick={() => onAction('more-review')}>{t('moreReview')}</button>}
    {chosen && !ownSession && legalActions.includes('rest') && <button type="button" disabled={disabled || running || pending} onClick={() => onAction('rest')}>{t('stop')}</button>}
    {<Alternate useStore={useStore} actions={actions} draftScope={draftScope} study={study} subject={subject} activity={activity} setActivity={setActivity} disabled={disabled || running || pending} t={t} goal={goal} intensityLabel={intensityLabel} openCheckins={openCheckins} scope={scope} setScope={setScope} scopeUnits={scopeUnits} start={start} />}
    {!ownSession && <details className="student-fold"><summary>{t('morePractice')}</summary>
    {!ownSession && (() => {
      const unit = progress && curriculum ? curriculum.units.find(item => item.id === progress.unitId) : undefined
      const causes = study.errorProfile.filter(item => item.subject === subject).slice(0, 3)
      if (unit?.focus === undefined && causes.length === 0) return null
      return <section><h3>{t('routineTitle')} · {t(subject)}</h3>
        <p className="student-muted">{t('routineHelp')}</p>
        {unit?.focus !== undefined && <p>{unit.name}：{t(focusKeys[unit.focus])}</p>}
        {causes.length > 0 && <p className="student-muted">{t('topCauses')}：{causes.map(item => `${t(item.type)} ×${item.count}`).join('、')}</p>}
        <div className="student-segments">
          <button type="button" disabled={disabled || running || pending} onClick={() => { void tutor(prompts.daily).catch(() => {}) }}>{t('printDailySheet')}</button>
          <button type="button" disabled={disabled || running || pending} onClick={() => { void tutor(prompts.dictation).catch(() => {}) }}>{t('dictation')}</button>
        </div>
      </section>
    })()}
    {!ownSession && study.understandingReminders.length > 0 && <section><h3>{t('remindersTitle')}</h3><p className="student-muted">{t('remindersHint')}</p>
      {study.understandingReminders.map(item => <div key={`${item.code}-${item.objectiveId ?? item.title}`}>
        <p>{t(reminderKeys[item.code])} · {item.title}</p>
        <button type="button" disabled={disabled || running || pending} onClick={() => { void tutor(feynmanPrompt(item.title)).catch(() => {}) }}>{t('feynmanTeach')}</button>
      </div>)}
    </section>}
    {!ownSession && study.diagnostic && <section><h3>{t('diagnosisTitle')} · {t(subject)}</h3>
      <p>{study.diagnostic.lastAt !== undefined ? `${t('diagnosisLast')}: ${day(study.diagnostic.lastAt)} · ${t('nextCheck')}: ${day(study.diagnostic.nextAt)}` : t('diagnosisNever')} · {t('coverage')}: {study.diagnostic.coverage.probed} / {study.diagnostic.coverage.total}</p>
      <p className="student-muted">{t(study.diagnostic.due ? 'diagnosisDue' : 'diagnosisNotDue')}{study.diagnostic.samples[chosenIntensity].length > 0 ? ` · ${t('diagnosisSample')}: ${study.diagnostic.samples[chosenIntensity].map(item => item.title).join(' · ')}` : ''}</p>
      <p className="student-muted">{t('intensity')}: {t(intensityKeys[chosenIntensity])} · {t(intensityHelpKeys[chosenIntensity])} <button type="button" onClick={openCheckins}>{t('chooseIntensity')}</button></p>
      {study.diagnostic.samples[chosenIntensity].length > 0 && <button type="button" disabled={disabled || running || pending} onClick={() => { void startDiagnosis(subject, chosenIntensity) }}>{t(study.diagnostic.due ? 'startDiagnosis' : 'repeatDiagnosis')}</button>}
      {(() => { const last = study.checkIns.find(item => item.subject === subject); return last && last.results.length > 0 ? <details open={!study.diagnostic.due}><summary>{t('diagnosisResults')} · {day(last.startedAt)} · {t(intensityKeys[last.intensity])}</summary>
        <p className="student-muted">{t('assistIndependent')} {last.counts.independent} · {t('assistHint')} {last.counts.helped} · {t('wrong')} {last.counts.wrong}</p>
        {last.results.map(item => <div key={item.id}><p>{item.title} · {t(item.result)} · {t(assistKeys[item.assistance])}</p>
          {item.objectiveId !== null && (item.result !== 'correct' || item.assistance !== 'independent') && <button type="button" disabled={disabled || running || pending} aria-pressed={selectedObjectiveId === item.objectiveId} onClick={() => chooseGoal({ id: item.objectiveId ?? '', subject })}>{t('chooseGoal')} · {item.title}</button>}
        </div>)}
      </details> : null })()}
    </section>}
    </details>}
  </>
}

const continuationReasons = { 'unfinished-question': 'continueCurrentQuestion', 'pending-assessment': 'continuePendingAnswer', 'missing-evidence': 'continueMissingEvidence', 'current-gap': 'continueCurrentGap', 'prerequisite-gap': 'continuePrerequisiteGap', 'due-review': 'continueDueReview', 'new-goal': 'continueConfirmedGoal', 'confirmed-scope-required': 'continueScopeRequired', 'check-budget-exhausted': 'continueCheckEnded', 'round-paused': 'continueRoundPaused', 'no-learnable-goal': 'continueNoGoal', 'source-unavailable': 'continueSourceUnavailable', 'source-pending': 'continueSourcePending' } as const satisfies Record<LearningNextAction['reason'], Parameters<Translate>[0]>

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

function Alternate({ study, subject, activity, setActivity, disabled, start, goal, intensityLabel, openCheckins, scope, setScope, scopeUnits, t, draftScope, useStore, actions }: DraftProps & {
  draftScope?: string | undefined
  study: Study
  subject: Subject
  activity: Activity
  setActivity: (activity: Activity) => void
  disabled: boolean
  start: (subject: Subject, mode: Mode, inquiry?: string) => Promise<void>
  goal: Goal | undefined
  intensityLabel: string
  openCheckins: () => void
  scope: ScopeChoice
  setScope: (scope: ScopeChoice) => void
  scopeUnits: { id: string; name: string }[]
  t: Translate
}) {
  const { mode } = activity
  const confirmed = study.courses.some(item => item.subject === subject)
  const due = study.dueSubjects.includes(subject)
  const uiMode = mode === 'review' || mode === 'explore' || mode === 'diagnose' ? mode : 'sync'
  const alternate = uiMode !== 'sync' || goal !== undefined
  const [open, setOpen] = useState(alternate)
  const inquiryKey = formDraftKey(`inquiry:${subject}`, draftScope)
  const inquiry = useStore(state => state.drafts[inquiryKey]) ?? ''
  useEffect(() => { if (alternate) setOpen(true) }, [alternate])
  const scoped = scope.grade !== undefined || scope.term !== undefined
  return <details className="student-fold" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>{t('otherWays')}</summary>
    {goal && <p>{t('learningGoal')}: {goal.title}</p>}
    <form onSubmit={event => { event.preventDefault(); void start(subject, mode, uiMode === 'explore' ? inquiry.trim() : undefined) }}><fieldset disabled={disabled}>
      <label>{t('mode')}<select aria-label={t('mode')} value={uiMode} onChange={event => {
        const value = event.target.value
        const next: Mode = value === 'review' || value === 'explore' || value === 'diagnose' ? value : confirmed ? 'school' : 'foundation'
        setActivity({ subject, mode: next })
      }}>
        <option value="sync">{t('sync')}</option>
        <option value="review" disabled={!due}>{t('review')}</option>
        <option value="diagnose">{t('diagnose')}</option>
        <option value="explore">{t('explore')}</option>
      </select></label>
      <p>{t(uiMode === 'sync' ? 'syncHelp' : uiMode === 'review' ? 'reviewHelp' : uiMode === 'diagnose' ? 'diagnoseHelp' : 'exploreHelp')}</p>
      {uiMode === 'explore' && <label>{t('inquiryQuestion')}<textarea aria-label={t('inquiryQuestion')} value={inquiry} onChange={event => actions.setDraft(inquiryKey, event.target.value)} maxLength={2000} placeholder={t('inquiryPlaceholder')} /></label>}
      {(uiMode === 'sync' || uiMode === 'diagnose') && <p>
        <label>{t('scopeLabel')}<select aria-label={t('scopeLabel')} value={scoped ? `${scope.grade ?? study.profile.grade}-${scope.term ?? study.profile.term}` : 'current'} onChange={event => {
          const value = event.target.value
          if (value === 'current') { setScope({}); return }
          const [grade, term] = value.split('-') as [string, 'first' | 'second']
          setScope({ grade: Number(grade), term })
        }}>
          <option value="current">{t('scopeCurrent')}</option>
          {([[1, 'first'], [1, 'second'], [2, 'first'], [2, 'second']] as const).filter(([grade, term]) => !(grade === study.profile.grade && term === study.profile.term)).map(([grade, term]) => <option key={`${grade}-${term}`} value={`${grade}-${term}`}>{t(grade === 1 ? 'gradeOne' : 'gradeTwo')} · {t(term)}</option>)}
        </select></label>
        {scoped && <label>{t('scopeUnit')}<select aria-label={t('scopeUnit')} value={scope.unit ?? ''} onChange={event => { const { unit: _unit, ...book } = scope; setScope({ ...book, ...(event.target.value ? { unit: event.target.value } : {}) }) }}>
          <option value="">{t('scopeWholeMap')}</option>
          {scopeUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </select></label>}
      </p>}
      {uiMode === 'diagnose' && <p>{t('intensity')}: {intensityLabel} <button type="button" onClick={openCheckins}>{t('chooseIntensity')}</button></p>}
      {!confirmed && uiMode === 'sync' && <p>{t('unconfirmed')}</p>}
      <button type="submit" className="student-primary" disabled={uiMode === 'review' && !due}>{t(study.active ? 'switchLearning' : 'start')}</button>
    </fieldset></form>
  </details>
}

const phaseOrder = ['demo', 'guide', 'try', 'vary'] as const
const phaseKeys = { demo: 'phaseDemo', guide: 'phaseGuide', try: 'phaseTry', vary: 'phaseVary' } as const

function SimonSteps({ phase, t }: { phase: typeof phaseOrder[number]; t: Translate }) {
  const current = phaseOrder.indexOf(phase)
  return <ol className="student-simon" aria-label={t('simonSteps')}>
    {phaseOrder.map((step, index) => <li key={step} className={index < current ? 'student-simon-done' : index === current ? 'student-simon-current' : undefined} aria-current={index === current ? 'step' : undefined}>{t(phaseKeys[step])}</li>)}
  </ol>
}

function Task({ study, goalTitle: title, goalText, days, disabled, t, act, tutor, draftScope, useStore, actions }: DraftProps & { draftScope?: string | undefined; study: Study; goalTitle: string | undefined; goalText: string | undefined; days: number | undefined; disabled: boolean; t: Translate; act: Act; tutor: (text: string, currentBlock?: boolean) => Promise<void> }) {
  const task = study.task
  if (!task) return null
  const hintLabel = task.hintLevel > 0 ? t('hintMore') : t('hint')
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const key = formDraftKey(`answer:${task.sessionId}:${task.id}`, draftScope)
  const answer = useStore(state => state.drafts[key]) ?? ''
  return <><h3>{task.topic}</h3>
    <MasteryDots days={days} t={t} />
    {days === 3 && study.feedback?.id === task.id && <p className="student-result">{t('goalMastered')}</p>}
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
