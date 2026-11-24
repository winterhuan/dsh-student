import { useEffect, useRef, useState } from 'react'
import type { Dashboard, MistakeStatus } from '../dashboard.ts'
import type { Command } from '../schema.ts'
import type { CapabilityProgress, CheckInIntensity } from '../learning/mastery.ts'
import { StudySubmissionError, type AskTutor, type StudyPhoto, type StudentSessionActions } from './bridge.ts'
import type { StudentManualActions } from './manual-actions.ts'
import type { DraftProps } from './drafts.tsx'
import type { TermId, BlockId, ResponseId } from '../files/schema.ts'
import type { StudentSessionId, StudentSubmissionInspection, StudentSubmissionRequest } from '../types.ts'
import type { UseStudentResource } from './workspace.ts'
import { TYPERT_REMOTE } from '@winterhuan/dsh-student/remote'
import { WorksheetCorrections } from './worksheet-corrections.tsx'
import type { ManualSaveRequest } from '../files/manual.ts'
import type { StudentJsonValue } from '../types.ts'
import { ParentSettings } from './forms.tsx'
import type { Translate } from './locales.ts'
import { useStudy } from './workspace.ts'
import { assistKeys, day, intensityKeys, levelKeys, subjects, type Activity, type Mode, type ScopeChoice, type Subject } from './display.ts'
import { IdeasView } from './ideas-view.tsx'
import { MapView } from './map-view.tsx'
import { PracticeView } from './practice-view.tsx'
import { LessonsPanel, lessonsForSubject } from './lessons-view.tsx'
import { continuePrompt, loadLearningPrompt, dailySheetPrompt, diagnosePrompt, dictationPrompt, explorePrompt, goalPrompt, openmaicQueryPrompt, openmaicRetryPrompt, openmaicReviewPrompt, organizePrompt, nativeIntentPrompt, pendingRecordPrompt, pendingRecordsPrompt, reviewPrompt } from './prompts.ts'
import { TodayView } from './today-view.tsx'
import css from './desk.module.css'

type Study = NonNullable<Dashboard['study']>
type Goal = { id: string; title: string }
const subjectPreference = 'student-desk:subject'

function storedSubject(): Subject {
  try { const value = window.localStorage.getItem(subjectPreference); return value === 'chinese' || value === 'english' ? value : 'math' } catch { return 'math' }
}
function storeSubject(value: Subject) {
  try { window.localStorage.setItem(subjectPreference, value) } catch { /* The preference is a convenience; blocked storage falls back to the default subject. */ }
}

/** Workbench actions share the same persisted state as the native tutoring tools. */
export function StudyDesk({ sessionId, visible, ask, running, pending = false, syncFeedback, cancel, t, useResource, saveSettings, saveWorksheet: saveWorksheetRecord, inspectSubmission, openLesson, useStore, actions }: DraftProps & StudentManualActions & Partial<StudentSessionActions> & { sessionId: StudentSessionId; useResource: UseStudentResource; visible: boolean; ask: AskTutor; running: boolean; pending?: boolean; t: Translate; openLesson?: (lessonId: string) => Promise<import('../openmaic/playback.ts').OpenmaicPlaybackResult> }) {
  const [subject, setSubject] = useState<Subject>(storedSubject)
  const [mistakeOffset, setMistakeOffset] = useState(0)
  const [mistakeStatus, setMistakeStatus] = useState<MistakeStatus>('all')
  const [mapGrade, setMapGrade] = useState<number>()
  const [mapTerm, setMapTerm] = useState<'first' | 'second'>()
  const [selectedConceptId, setSelectedConceptId] = useState('')
  const [intensities, setIntensities] = useState<Partial<Record<Subject, CheckInIntensity>>>({})
  const [scopeChoice, setScopeChoice] = useState<Partial<Record<Subject, ScopeChoice>>>({})
  const [tab, setTab] = useState<'today' | 'map' | 'mistakes' | 'parent' | 'lessons'>('today')
  const [knowledgeView, setKnowledgeView] = useState<'map' | 'ideas'>('map')
  const scopeOf = (target: Subject): ScopeChoice => scopeChoice[target] ?? {}
  const activeScope = scopeOf(subject)
  const showMap = tab === 'map' && knowledgeView === 'map'
  const showBook = tab === 'map'
  const workspace = useStudy(sessionId, visible, t('networkError'), { tab: tab === 'lessons' ? 'parent' : tab, offset: mistakeOffset, subject, status: mistakeStatus, ...(showBook && mapGrade !== undefined ? { mapGrade } : {}), ...(showBook && mapTerm !== undefined ? { mapTerm } : {}), ...(activeScope.grade !== undefined ? { diagGrade: activeScope.grade } : {}), ...(activeScope.term !== undefined ? { diagTerm: activeScope.term } : {}), ...(activeScope.unit ? { diagUnit: activeScope.unit } : {}) }, useResource)
  const { data } = workspace
  const readOnly = workspace.value?.status === 'legacy'
  const [activity, setActivity] = useState<Activity>({ subject: storedSubject(), mode: 'foundation' })
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('')
  const [localNow, setLocalNow] = useState(Date.now())
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [syncStatus, setSyncStatus] = useState<'queued' | 'coalesced' | 'paused' | 'unavailable'>()
  const paused = useRef(false)
  useEffect(() => {
    if (!visible) return
    const timer = window.setInterval(() => setLocalNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [visible, workspace.offset])
  const responseIds = useRef(new Map<string, string>())
  const [submissions, setSubmissions] = useState<(StudentSubmissionRequest & { admission: 'accepted' | 'unknown'; questionId?: string; inspection?: StudentSubmissionInspection })[]>(() => {
    try {
      const entries = JSON.parse(window.sessionStorage.getItem(`student:submissions:${sessionId}`) ?? '[]')
      if (!Array.isArray(entries)) return []
      return entries.slice(-12).flatMap(entry => {
        try {
          if (entry.admission !== 'accepted' && entry.admission !== 'unknown') return []
          const input = TYPERT_REMOTE.methods['student/inspectSubmission'].input({ strict: true }).create().parse({ sessionId, request: { requestId: entry.requestId, ...(entry.response ? { response: entry.response } : {}) } })
          return [{ ...input.request, admission: entry.admission, ...(typeof entry.questionId === 'string' ? { questionId: entry.questionId } : {}) }]
        } catch { return [] }
      })
    } catch { return [] }
  })
  useEffect(() => {
    try { window.sessionStorage.setItem(`student:submissions:${sessionId}`, JSON.stringify(submissions.map(({ inspection: _inspection, ...item }) => item))) } catch { /* Mounted submission notices remain available when browser storage is blocked. */ }
  }, [sessionId, submissions])
  function identity(command?: Command) {
    const task = data?.study?.task
    const ownerId = task?.sessionId ?? data?.study?.active?.id
    const key = JSON.stringify([workspace.termId, ownerId, task?.id])
    const retained = submissions.find(item => item.questionId === task?.id && item.response?.owner.id === ownerId && item.response?.termId === workspace.termId && item.admission === 'unknown')
    if (retained?.response) responseIds.current.set(key, retained.response.responseId)
    if (command?.action === 'answer' && !responseIds.current.has(key)) responseIds.current.set(key, crypto.randomUUID())
    return { learnerId: workspace.learnerId, termId: workspace.termId, blockId: ownerId, questionId: task?.id, responseId: task?.responseId ?? responseIds.current.get(key) }
  }
  async function tutor(text = continuePrompt, photo?: StudyPhoto, command?: Command, currentBlock = false, continuation = false, continuationAction?: string) {
    if (readOnly) throw new Error(t('legacyFilesHelp'))
    const previous = identity(command)
    const next = continuation ? workspace.nextAction : null
    if (continuation && (!workspace.contextReady || !next)) return
    const ids = next ? { learnerId: workspace.learnerId, termId: workspace.termId, blockId: next.blockId, questionId: next.questionId, responseId: next.responseId } : previous
    if (command?.action === 'answer' && submissions.some(item => item.response?.responseId === ids.responseId && item.admission === 'unknown' && !item.inspection)) { setSendError(t('messageUnknown')); throw new Error(t('messageUnknown')) }
    setSending(true); setSendError('')
    const active = data?.study?.active
    const retainBlock = active && (currentBlock || command?.action === 'answer' || command?.action === 'hint' || command?.action === 'stuck' || command?.action === 'stop')
    const selection = next ? { subject: next.subject, goalId: next.goalId, scope: next.scope } : retainBlock ? { subject: active.subject, goalId: data?.study?.task?.objectiveId, scope: active.scope } : { subject: command?.action === 'start' ? command.subject : subject, goalId: selectedObjectiveId || undefined, scope: command?.action === 'start' ? command.scope : scopeCommand(subject).scope }
    const intent = { nativeSessionId: sessionId, ...ids, selection, nextAction: workspace.nextAction, round: workspace.round, legalActions: workspace.legalActions, ...(continuation ? { previousActivity: { blockId: previous.blockId, questionId: previous.questionId, responseId: previous.responseId }, continuationAction } : {}), ...(command ? { operation: command } : {}), request: text.trim() === '' ? continuePrompt : text }
    const retain = (requestId: string, admission: 'accepted' | 'unknown') => setSubmissions(previous => [...previous, { requestId, admission, ...(ids.questionId ? { questionId: ids.questionId } : {}), ...(command?.action === 'answer' && ids.termId && ids.blockId && ids.responseId ? { response: { termId: ids.termId as TermId, owner: { kind: 'block' as const, id: ids.blockId as BlockId }, responseId: ids.responseId as ResponseId } } : {}) }].slice(-12))
    try { const result = await ask(nativeIntentPrompt(intent, intent.request), photo); if (result) retain(result.requestId, result.admission) }
    catch (reason) { if (reason instanceof StudySubmissionError) retain(reason.requestId, 'unknown'); setSendError(reason instanceof Error ? reason.message : t('sendError')); throw reason }
    finally { setSending(false) }
  }
  async function openSavedLesson(lessonId: string) {
    if (!openLesson) { await tutor(openmaicQueryPrompt(lessonId), undefined, undefined, true); return }
    setSending(true); setSendError('')
    try {
      const result = await openLesson(lessonId)
      if (result.status === 'ownership-unresolved') { setSending(false); await tutor(openmaicQueryPrompt(lessonId), undefined, undefined, true) }
      else if (result.status !== 'opened') setSendError(t(result.status === 'login-required' ? 'classroomLoginRequired' : result.status === 'identity-mismatch' ? 'classroomIdentityMismatch' : 'classroomUnavailable'))
    } catch (_error) { setSendError(t('classroomUnavailable')) }
    finally { setSending(false) }
  }
  async function change(command: Command, _revision?: number, _baseline?: string): Promise<Dashboard> {
    await tutor(continuePrompt, undefined, command)
    if (!data) throw new Error(t('networkError'))
    return data
  }
  async function manual(command: Command, _revision?: number, original?: string) {
    if (!data || !workspace.termId || workspace.stale) throw new Error(t('manualInvalid'))
    return saveSettings(sessionId, command, data, workspace.termId, original, t)
  }
  async function saveWorksheet(intent: ManualSaveRequest['intent'], baseline: Record<string, StudentJsonValue>) {
    if (!workspace.termId || workspace.stale) throw new Error(t('manualInvalid'))
    return saveWorksheetRecord(sessionId, intent, baseline, workspace.termId, t)
  }
  async function act(command: Command, _withTutor = false, prompt = continuePrompt) {
    try {
      if (command.action === 'stop') {
        paused.current = true
        if (currentLesson && syncFeedback) await requestSync(currentLesson.id, 'pause')
        await cancel?.()
      }
      await tutor(prompt, undefined, command)
    } catch (reason) { setSendError(reason instanceof Error ? reason.message : t('sendError')) }
  }
  function selectSubject(item: Subject) { setSubject(item); storeSubject(item) }
  const now = Math.max(localNow + workspace.offset.current, data?.serverNow ?? 0)
  const study = data?.study
  const nativePending = pending || !!workspace.value?.native.admissions.some(item => item.status === 'pending' || item.status === 'claimed')
  const disabled = sending || workspace.stale || readOnly
  const active = study?.active
  const followedActive = useRef<{ sessionId: StudentSessionId; blockId: string }>()
  useEffect(() => {
    if (active && (followedActive.current?.sessionId !== sessionId || followedActive.current.blockId !== active.id)) {
      followedActive.current = { sessionId, blockId: active.id }
      selectSubject(active.subject); setActivity({ subject: active.subject, mode: active.mode })
    }
  }, [active?.id, sessionId])
  const ownerBlockId = active?.subject === subject ? active.id : workspace.round?.blockId
  const currentLesson = workspace.learnerId && workspace.termId ? data?.interactiveLessons.lessons.find(item => item.blockId === ownerBlockId && item.learnerId === workspace.learnerId && item.termId === workspace.termId && item.status !== 'failed') : undefined
  async function requestSync(lessonId: string, trigger: Parameters<StudentSessionActions['syncFeedback']>[1]) {
    if (!syncFeedback) return
    try { const result = await syncFeedback(lessonId, trigger); setSyncStatus(result.status) }
    catch (reason) { setSyncStatus('unavailable'); setSendError(reason instanceof Error ? reason.message : t('classroomUnavailable')); throw reason }
  }
  const returnState = useRef({ currentLesson, syncFeedback, round: workspace.round, contextReady: workspace.contextReady, requestSync })
  returnState.current = { currentLesson, syncFeedback, round: workspace.round, contextReady: workspace.contextReady, requestSync }
  const resumed = useRef<string>()
  useEffect(() => {
    if (!visible || tab !== 'today') { resumed.current = undefined; return }
    if (!workspace.contextReady || !currentLesson || currentLesson.status !== 'ready' || paused.current || workspace.round?.status === 'paused') return
    const owner = JSON.stringify([sessionId, currentLesson.id])
    if (resumed.current === owner) return
    resumed.current = owner
    void requestSync(currentLesson.id, 'resume').catch(() => {})
  }, [visible, tab, currentLesson?.id, sessionId, workspace.contextReady])
  useEffect(() => {
    if (!visible || tab !== 'today') return
    const returned = () => {
      const current = returnState.current
      if (!current.contextReady || document.visibilityState === 'hidden' || paused.current || current.round?.status === 'paused' || current.currentLesson?.status !== 'ready') return
      void current.requestSync(current.currentLesson.id, 'return').catch(() => {})
    }
    window.addEventListener('focus', returned)
    document.addEventListener('visibilitychange', returned)
    return () => { window.removeEventListener('focus', returned); document.removeEventListener('visibilitychange', returned) }
  }, [visible, tab, sessionId])
  async function continueLearning(continuationAction?: string) {
    const next = workspace.nextAction
    if (!workspace.contextReady || !next || running || nativePending || sending) return
    paused.current = false
    const sourceLesson = next.source?.kind === 'openmaic' ? next.source.verification.lessonId : undefined
    if ((!continuationAction || continuationAction === 'sync-feedback') && syncFeedback && (sourceLesson || currentLesson?.status === 'ready' && next.blockId === currentLesson.blockId)) {
      await requestSync(sourceLesson ?? currentLesson!.id, 'continue')
      return
    }
    const request = continuationAction ? `请按共享 legalActions 执行 ${continuationAction}，保留当前 round 与原作答。${continuePrompt}` : currentLesson?.status === 'generating' && next.blockId === currentLesson.blockId ? openmaicQueryPrompt(currentLesson.id) : continuePrompt
    await tutor(request, undefined, undefined, true, true, continuationAction)
  }
  const curriculum = study?.curriculum ?? null
  const scopeGrade = curriculum?.scope.grade ?? mapGrade ?? study?.profile.grade ?? 1
  const scopeTerm = curriculum?.scope.term ?? mapTerm ?? study?.profile.term ?? 'first'
  const goals: Goal[] = [...(curriculum && curriculum.scope.current ? curriculum.objectives : []).map(item => ({ id: item.id, title: item.title })), ...(study?.objectives ?? []).map(item => ({ id: item.id, title: item.title }))]
  const planOf = (target: Subject) => study?.diagnostics.find(plan => plan.subject === target)
  const chosenIntensity = (target: Subject): CheckInIntensity => intensities[target] ?? planOf(target)?.recommendedIntensity ?? 'standard'
  function resolveMode(target: Subject, mode: Mode): Mode {
    if (mode === 'review' || mode === 'explore' || mode === 'diagnose') return mode
    return study?.courses.some(item => item.subject === target) ? 'school' : 'foundation'
  }
  function chooseGoal(goal: { id: string; subject: Subject }) {
    selectSubject(goal.subject); setActivity({ subject: goal.subject, mode: 'foundation' }); setSelectedObjectiveId(goal.id); setMistakeOffset(0); setTab('today')
  }
  function scopeCommand(target: Subject): { scope: { grade: number; term: 'first' | 'second'; units?: string[] } } | Record<string, never> {
    const scope = scopeOf(target)
    if (scope.grade === undefined && scope.term === undefined) return {}
    return { scope: { grade: scope.grade ?? study?.profile.grade ?? 2, term: scope.term ?? study?.profile.term ?? 'first', ...(scope.unit ? { units: [scope.unit] } : {}) } }
  }
  function startDiagnosis(target: Subject, intensity: CheckInIntensity) {
    if (!study) return Promise.resolve()
    const scope = scopeOf(target)
    const scoped = scope.grade !== undefined || scope.term !== undefined
    const plan = scoped ? study.scopedDiagnostic : planOf(target)
    const ids = plan?.samples[intensity].map(item => item.id) ?? []
    selectSubject(target); setActivity({ subject: target, mode: 'diagnose' }); setSelectedObjectiveId(''); setMistakeOffset(0); setTab('today')
    return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: 'diagnose', intensity, ...(scoped ? scopeCommand(target) : {}) }, true, diagnosePrompt(intensity, ids, t))
  }
  function start(target: Subject, mode: Mode, inquiry?: string) {
    if (mode === 'diagnose') return startDiagnosis(target, chosenIntensity(target))
    const next = resolveMode(target, mode)
    const prompt = next === 'review' ? reviewPrompt : next === 'explore' ? explorePrompt(inquiry) : selectedObjectiveId ? goalPrompt(selectedObjectiveId) : continuePrompt
    return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: next, ...((next === 'foundation' || next === 'school') ? scopeCommand(target) : {}) }, true, prompt)
  }
  const nativeT: Translate = key => ['saved', 'gradesSaved', 'confirmPaperDone', 'teachQueued', 'workbookSaved'].includes(key) ? t('intentAdmitted') : t(key)
  const parentSettings = tab === 'parent'
  const parentVisible = tab !== 'today'
  const draft = { useStore, actions }
  const draftScope = `student:draft:${sessionId}:${workspace.termId ?? 'setup'}`
  const context = workspace.context
  const pendingFacts = context && typeof context === 'object' && 'pendingFacts' in context && Array.isArray(context.pendingFacts) ? context.pendingFacts : []
  const pendingCount = context && typeof context === 'object' && 'pendingFactCount' in context && typeof context.pendingFactCount === 'number' ? context.pendingFactCount : pendingFacts.length
  const pendingLabels = { answerDate: 'answerDateUnknown', assistance: 'assistanceUnknown', source: 'answerSourceUnknown', answerBasis: 'answerBasisUnknown', objectiveId: 'answerGoalUnknown' } as const
  return <main className={`student-desk ${css.desk}`} aria-label={t('title')}>
    <header className="student-top">
      <nav className={`student-tabs ${css.navigation}`} aria-label={t('title')}>
        <button type="button" aria-pressed={tab === 'today'} onClick={() => setTab('today')}>{t('learningEntry')}</button>
        <button type="button" aria-pressed={parentVisible} onClick={() => setTab('parent')}>{t('parentEntry')}</button>
      </nav>
      {parentVisible && <nav className="student-segments" aria-label={t('parentEntry')}>
        <button type="button" aria-pressed={tab === 'parent'} onClick={() => setTab('parent')}>{t('parentProfile')}</button>
        <button type="button" aria-pressed={tab === 'map'} onClick={() => setTab('map')}>{t('parentProgress')}</button>
        <button type="button" aria-pressed={tab === 'mistakes'} onClick={() => setTab('mistakes')}>{t('parentPractice')}</button>
        <button type="button" aria-pressed={tab === 'lessons'} onClick={() => setTab('lessons')}>{t('lessonHistory')}</button>
      </nav>}
      <div className="student-toolbar">
        {study && !parentSettings && <nav className="student-subjects" aria-label={t('subject')}>{subjects.map(item => <button key={item} type="button" aria-pressed={subject === item} onClick={() => { selectSubject(item); setMistakeOffset(0); setMistakeStatus('all') }}>{t(item)}</button>)}</nav>}
        <span className="student-muted">{t(workspace.loadNeeded ? 'readyToContinue' : workspace.stale ? 'updatePaused' : 'liveUpdates')}</span>
      </div>
    </header>
    {readOnly && data && <p role="status">{t('legacyFilesHelp')}</p>}
    {workspace.error && !workspace.loadNeeded && <p role="alert">{t('staleData')}</p>}
    {study && !workspace.contextReady && !workspace.stale && <p role="status">{t(workspace.contextState.readStatus === 'partial' ? 'partialLearningRecords' : 'continueWaiting')}</p>}
    {sendError && <p role="alert">{sendError}</p>}
    {syncStatus && <p role="status">{t(syncStatus === 'queued' ? 'feedbackSyncQueued' : syncStatus === 'coalesced' ? 'feedbackSyncCoalesced' : syncStatus === 'paused' ? 'feedbackSyncPaused' : 'feedbackSyncUnavailable')}</p>}
    {submissions.length > 0 && <details className="student-fold"><summary>{t('submissionStatus')}</summary>{submissions.map(item => <div key={item.requestId}>
      <p>{t(item.admission === 'accepted' ? 'messageAdmitted' : 'messageUnknown')}</p>
      {item.response && <p>{t(item.inspection?.answer === 'saved' ? 'answerSaved' : 'answerPending')} · {t(item.inspection?.assessment === 'valid' ? 'assessmentSaved' : 'assessmentPending')}</p>}
      <button type="button" disabled={sending} onClick={() => { void inspectSubmission(sessionId, { requestId: item.requestId, ...(item.response ? { response: item.response } : {}) }).then(result => { setSubmissions(previous => previous.map(current => current.requestId === item.requestId ? { ...current, admission: result.admission, inspection: result } : current)) }).catch(reason => setSendError(reason instanceof Error ? reason.message : t('networkError'))) }}>{t('inspectSubmission')}</button>
    </div>)}</details>}
    {!data ? workspace.loadNeeded ? <section><p>{t('continueSavedLearning')}</p><button type="button" disabled={sending || running} onClick={() => { void tutor(loadLearningPrompt).catch(() => {}) }}>{t('continueLearning')}</button></section> : workspace.value?.status === 'missing' ? <section><p>{t('setupFirst')}</p><button disabled={sending} onClick={() => { void tutor(t('setupIntent')).catch(() => {}) }}>{t('setupConversation')}</button></section> : workspace.value ? <section><p>{t(workspace.value.status === 'legacy' ? 'legacyFilesHelp' : 'unavailableFilesHelp')}</p></section> : !workspace.error && <div className={css.empty} aria-busy="true" aria-label={t('busy')}><span className={css.spinner} /></div> : !study && tab === 'today' ? <section><p>{t('setupFirst')}</p><button disabled={sending} onClick={() => { void tutor(t('setupIntent')).catch(() => {}) }}>{t('setupConversation')}</button></section> : <>
      {study && tab === 'today' && <TodayView {...draft} draftScope={draftScope} nextAction={workspace.nextAction} learnerId={workspace.learnerId} termId={workspace.termId} classroomBindingId={workspace.classroomBindingId} onContinue={() => { void continueLearning().catch(() => {}) }} round={workspace.round} legalActions={workspace.legalActions} onAction={action => { void continueLearning(action).catch(() => {}) }} study={study} subject={subject} activity={activity} setActivity={setActivity} goal={goals.find(item => item.id === selectedObjectiveId)} curriculum={curriculum} selectedObjectiveId={selectedObjectiveId} chooseGoal={chooseGoal} intensityLabel={`${t(intensityKeys[chosenIntensity(subject)])} · ${planOf(subject)?.samples[chosenIntensity(subject)].length ?? 0}`} openParent={() => setTab('parent')} openCheckins={() => setTab('map')} scope={activeScope} setScope={next => setScopeChoice(previous => ({ ...previous, [subject]: next }))} scopeUnits={study.scopedUnits ?? []} start={start} startDiagnosis={startDiagnosis} chosenIntensity={chosenIntensity(subject)} disabled={disabled || !workspace.contextReady} pending={nativePending} running={running} act={act} tutor={(text, currentBlock) => tutor(text, undefined, undefined, currentBlock)} t={t} prompts={{ daily: dailySheetPrompt(subject), dictation: dictationPrompt(subject) }} lessons={lessonsForSubject(data.interactiveLessons?.lessons ?? [], subject)} onOpenClassroom={lessonId => { void openSavedLesson(lessonId).catch(() => {}) }} />}
      {study && tab === 'lessons' && data.interactiveLessons && <LessonsPanel lessons={lessonsForSubject(data.interactiveLessons.lessons, subject)} {...(data.interactiveLessons.error !== undefined ? { error: data.interactiveLessons.error } : {})} disabled={disabled} running={running} t={t} onOpen={lessonId => { void openSavedLesson(lessonId).catch(() => {}) }} onQuery={lessonId => { void tutor(openmaicQueryPrompt(lessonId)).catch(() => {}) }} onRetry={runId => { void tutor(openmaicRetryPrompt(runId)).catch(() => {}) }} onReview={classroomId => { void tutor(openmaicReviewPrompt(classroomId)).catch(() => {}) }} />}
      {study && tab === 'map' && <nav className="student-segments" aria-label={t('parentProgress')}><button type="button" aria-pressed={knowledgeView === 'map'} onClick={() => setKnowledgeView('map')}>{t('map')}</button><button type="button" aria-pressed={knowledgeView === 'ideas'} onClick={() => setKnowledgeView('ideas')}>{t('ideas')}</button></nav>}
      {study && showMap && <MapView study={study} curriculum={curriculum} subject={subject} selectedConceptId={selectedConceptId} setSelectedConceptId={setSelectedConceptId} selectedObjectiveId={selectedObjectiveId} clearGoal={() => setSelectedObjectiveId('')} chooseGoal={chooseGoal} active={!!active} scopeGrade={scopeGrade} scopeTerm={scopeTerm} setMapGrade={setMapGrade} setMapTerm={setMapTerm} clearBrowse={() => { setMapGrade(undefined); setMapTerm(undefined) }} intensities={intensities} setIntensity={(target, level) => setIntensities(previous => ({ ...previous, [target]: level }))} scopeOf={scopeOf} setScope={(target, next) => setScopeChoice(previous => ({ ...previous, [target]: next }))} selectSubject={selectSubject} startDiagnosis={startDiagnosis} disabled={disabled} running={running} organize={() => { void tutor(organizePrompt(subject)).catch(() => {}) }} change={command => change(command).then(() => undefined)} t={t} />}
      {study && tab === 'map' && knowledgeView === 'ideas' && <IdeasView study={study} curriculum={curriculum} t={t} onOpenConcept={id => { setSelectedConceptId(id); setKnowledgeView('map') }} />}
      {study && tab === 'mistakes' && <PracticeView {...draft} study={study} now={now} subject={subject} goals={goals} mistakeStatus={mistakeStatus} setMistakeStatus={setMistakeStatus} setMistakeOffset={setMistakeOffset} revision={data.revision} disabled={disabled} running={running} change={change} ask={tutor} onReview={item => { selectSubject(item); setActivity({ subject: item, mode: 'review' }); setSelectedObjectiveId(''); setTab('today') }} t={nativeT} />}
      {study && tab === 'mistakes' && workspace.termId && <WorksheetCorrections {...draft} key={draftScope} sessionId={sessionId} termId={workspace.termId} draftScope={draftScope} useResource={useResource} save={saveWorksheet} disabled={disabled} t={t} />}
      {parentSettings && <section>{study && <><h3>{study.profile.nickname} · {t('grade')}: {study.profile.grade} · {t(study.profile.term)}</h3><p className="student-muted">{study.profile.region} · {study.profile.schoolYear}</p></>}<div className={css.practiceActions}><button type="button" disabled={disabled} onClick={() => { void tutor(t('setupIntent')).catch(() => {}) }}>{t('profileConversation')}</button><button type="button" disabled={disabled} onClick={() => { void tutor(t('courseConversation')).catch(() => {}) }}>{t('courseConversation')}</button><button type="button" disabled={disabled} onClick={() => { void tutor(t('archiveConversation')).catch(() => {}) }}>{t('archiveConversation')}</button></div></section>}
      {parentSettings && study && <details className="student-fold"><summary>{t('manualForms')}</summary><p>{t('manualSummary')}</p><fieldset disabled={readOnly}><ParentSettings {...draft} key={draftScope + subject} draftScope={draftScope} observation={workspace.value?.versions.find(file => file.path === '.study/settings.json')?.version} data={data} change={manual} t={t} curriculum={curriculum} subject={subject} onSubject={item => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }) }} /></fieldset></details>}
      {study && parentSettings && <LearningRecords goals={workspace.goalProgress} context={workspace.context} t={t} onReadMore={() => { void tutor('请加载 study，分页读取当前学生及明确引用的历史学期原作答、冻结题面、原官方批改和有效评价。原回答不覆盖，按来源展示差异和未知事实；只读取，不制造新作答或改变当前学习段。').catch(() => {}) }} />}
      {study && parentSettings && <Growth study={study} curriculum={curriculum} subject={subject} goals={goals} t={t} />}
      {study && parentSettings && pendingFacts.length > 0 && <details className="student-fold"><summary>{t('pendingFacts')}</summary><p>{t('pendingFactsHelp')}</p>
        <button type="button" disabled={disabled || running} onClick={() => { void tutor(pendingRecordsPrompt).catch(() => {}) }}>{t('organizeSavedResponses')}</button>
        <details><summary>{t('pendingFactsDetails')} · {pendingCount}</summary>{pendingFacts.map(item => {
          if (!item || typeof item !== 'object' || !('responseId' in item) || typeof item.responseId !== 'string' || !('fields' in item) || !Array.isArray(item.fields)) return null
          const responseId = item.responseId
          const labels = item.fields.flatMap(field => typeof field === 'string' && field in pendingLabels ? [t(pendingLabels[field as keyof typeof pendingLabels])] : [])
          const kind = item.ownerKind === 'block' || item.ownerKind === 'worksheet' ? item.ownerKind : undefined
          const ownerId = typeof item.ownerId === 'string' ? item.ownerId : undefined
          const recordSubject = item.subject === 'math' || item.subject === 'chinese' || item.subject === 'english' ? item.subject : undefined
          return <section key={JSON.stringify([kind, ownerId, responseId])}>
            <p>{recordSubject && `${t(recordSubject)} · `}{typeof item.topic === 'string' ? item.topic : t('learnerAnswer')}</p><p>{labels.join(' · ')}</p>
            {kind && ownerId && <button type="button" disabled={disabled || running} onClick={() => { void tutor(pendingRecordPrompt(kind, ownerId, responseId)).catch(() => {}) }}>{t('verifySavedResponse')}</button>}
          </section>
        })}{pendingCount > pendingFacts.length && <p>{t('pendingFactsMore')}</p>}</details></details>}
    </>}
  </main>
}

function Growth({ study, curriculum, subject, goals, t }: { study: Study; curriculum: Study['curriculum'] | null; subject: Subject; goals: Goal[]; t: Translate }) {
  const weekly = study.weekly
  return <>
    {weekly && <section><h3>{t('weeklyTitle')}</h3>
      <p>{t('weeklyTime')}: {weekly.minutesByDay.reduce((sum, item) => sum + item.minutes, 0)} {t('minuteUnit')} · {t('weeklyActiveDays')} {weekly.activeDays}/7</p>
      <p>{t('weeklyMastered')} {weekly.masteredGoals} · {t('weeklyPractised')} {weekly.practisedGoals} · {t('weeklyMistakesNew')} {weekly.newMistakes} · {t('weeklyConsolidated')} {weekly.consolidatedMistakes}</p>
      <p>{t('weeklyDueDone')} {weekly.dueCompletion.done}/{weekly.dueCompletion.total}{weekly.errorCauses.length > 0 ? ` · ${t('weeklyCauses')}: ${weekly.errorCauses.map(cause => `${t(cause.type)} ×${cause.count}`).join('、')}` : ''}</p>
    </section>}
    <section><h3>{t('stars')}: {study.stars}</h3><p>{t('starsHelp')}</p></section>
    {curriculum && curriculum.scope.current && <section><h3>{t('masteryOverview')} · {t(subject)}</h3>
      <p>{t('levelMastered')}: {curriculum.summary.mastered} · {t('levelPractising')}: {curriculum.summary.practising + curriculum.summary.stalled} · {t('levelWeak')}: {curriculum.summary.weak + curriculum.summary.due} · {t('levelUntouched')}: {curriculum.summary.untouched}</p>
      {curriculum.objectives.filter(item => item.attempts > 0 || item.activeMistakes > 0).map(item => <p key={item.id}>{item.title} · {t(levelKeys[item.level])} · {t('independent')}: {item.independentDays}</p>)}
    </section>}
    <section><h3>{t('evidence')}</h3>{study.progress.length === 0 && <p>{t('empty')}</p>}
      {study.progress.map(item => <p key={JSON.stringify([item.subject, item.topic, item.materialId, item.objectiveId])}>{goals.find(goal => goal.id === item.objectiveId)?.title ?? item.topic} · {t(item.level === 'independent-on-three-days' ? 'independent' : 'practising')}</p>)}
      {study.recentAttempts.map(item => <details key={item.id}><summary>{item.topic} · {t(item.result)}</summary><p>{item.prompt}</p><p>{item.response}</p><p>{item.result === 'unassessed' ? t('assessmentPending') : item.feedback}</p><p>{item.answerEvidence}</p></details>)}
    </section><p>{t('bounded')}</p>
  </>
}

function LearningRecords({ context, goals, t, onReadMore }: { context: StudentJsonValue | undefined; goals: CapabilityProgress[]; t: Translate; onReadMore: () => void }) {
  const value = context && typeof context === 'object' && !Array.isArray(context) ? context : undefined
  const feedback = value && Array.isArray(value.officialFeedback) ? value.officialFeedback : []
  const issues = value && Array.isArray(value.archiveIssues) ? value.archiveIssues : []
  return <>
    {goals.length > 0 && <section><h3>{t('learningGoal')}</h3>{goals.map(goal => <div key={goal.id}><p>{goal.title} · {t(levelKeys[goal.level])}</p>
      {goal.scope && <p className="student-muted">{goal.scope.description}</p>}
      {goal.independentDays.length > 0 && <p>{t('independentDates')}: {goal.independentDays.join(' · ')}</p>}
      {goal.firstMasteredDay && <p>{t('firstMasteredOn')}: {goal.firstMasteredDay}</p>}
      {goal.recoveredDay && <p>{t('recoveredOn')}: {goal.recoveredDay}</p>}
      {goal.baseline && <p className="student-muted">{t('referencedEvidence')}</p>}
    </div>)}</section>}
    {feedback.length > 0 && <section><h3>{t('originalClassroomAnswers')}</h3><p className="student-muted">{t('officialFeedbackHelp')}</p>{feedback.map((record, index) => {
      if (!record || typeof record !== 'object' || Array.isArray(record)) return null
      const effective = record.result === 'correct' || record.result === 'partial' || record.result === 'incorrect' || record.result === 'stuck' ? record.result : 'unassessed'
      const history = Array.isArray(record.officialHistory) ? record.officialHistory : []
      const official = record.official && typeof record.official === 'object' && !Array.isArray(record.official) ? record.official : undefined
      return <details key={typeof record.responseId === 'string' ? record.responseId : index}><summary>{typeof record.prompt === 'string' ? record.prompt : t('learnerAnswer')} · {t(effective)}</summary>
        <p>{t('learnerAnswer')}</p><pre>{typeof record.rawResponse === 'string' ? record.rawResponse : ''}</pre>
        <p>{t('effectiveAssessment')}: {t(effective)}</p><p>{typeof record.feedback === 'string' ? record.feedback : ''}</p>
        <p>{t(record.sourceStatus === 'known' ? 'verifiedAnswerSource' : 'answerSourceUnknown')}</p>{(record.grading === 'conflict' || record.grading === 'pending') && <p>{t('assessmentPending')}</p>}
        <p>{t(record.assistance === 'independent' || record.assistance === 'hint' || record.assistance === 'worked-example' ? assistKeys[record.assistance] : 'assistanceUnknown')}</p><p>{record.answerDate && typeof record.answerDate === 'object' && !Array.isArray(record.answerDate) && record.answerDate.kind === 'day' && typeof record.answerDate.day === 'string' ? record.answerDate.day : record.answerDate && typeof record.answerDate === 'object' && !Array.isArray(record.answerDate) && record.answerDate.kind === 'instant' && typeof record.answerDate.at === 'number' ? day(record.answerDate.at) : t('answerDateUnknown')}</p>
        <h4>{t('officialAssessment')}</h4>{[...history, ...(official && !history.some(item => item && typeof item === 'object' && !Array.isArray(item) && item.seq === official.seq) ? [official] : [])].map((grade, gradeIndex) => {
          if (!grade || typeof grade !== 'object' || Array.isArray(grade)) return null
          const result = grade.result && typeof grade.result === 'object' && !Array.isArray(grade.result) ? grade.result : undefined
          return <div key={typeof grade.seq === 'number' ? grade.seq : gradeIndex}><p>{t(result?.status === 'correct' ? 'correct' : result?.status === 'incorrect' ? 'incorrect' : 'unassessed')}{typeof result?.earned === 'number' ? ` · ${result.earned}` : ''}</p><p>{typeof result?.aiComment === 'string' ? result.aiComment : ''}</p></div>
        })}
      </details>
    })}<button type="button" onClick={onReadMore}>{t('readAnswerHistory')}</button></section>}
    {issues.length > 0 && <section role="status"><h3>{t('archiveEvidencePending')}</h3><p>{t('archiveEvidenceHelp')}</p><button type="button" onClick={onReadMore}>{t('readAnswerHistory')}</button></section>}
  </>
}
