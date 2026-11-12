import { useEffect, useRef, useState } from 'react'
import type { Dashboard, MistakeStatus } from '../dashboard.ts'
import type { Command } from '../schema.ts'
import type { CheckInIntensity } from '../learning/mastery.ts'
import { StudySubmissionError, type AskTutor, type StudyPhoto } from './bridge.ts'
import type { Context } from '@deepseek-ai/cordis'
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
import { intensityKeys, levelKeys, subjects, type Activity, type Mode, type ScopeChoice, type Subject } from './display.ts'
import { IdeasView } from './ideas-view.tsx'
import { MapView } from './map-view.tsx'
import { PracticeView } from './practice-view.tsx'
import { LessonsPanel, lessonsForSubject, openClassroom } from './lessons-view.tsx'
import { continuePrompt, dailySheetPrompt, diagnosePrompt, dictationPrompt, dueClearPrompt, explorePrompt, goalPrompt, interestPracticePrompt, openmaicGeneratePrompt, openmaicRetryPrompt, openmaicReviewPrompt, organizePrompt, nativeIntentPrompt, previewPrompt, reviewPrompt, teachPrompt, teachQueuePrompt } from './prompts.ts'
import { TodayView } from './today-view.tsx'

type Study = NonNullable<Dashboard['study']>
type Goal = { id: string; title: string }
type View = 'student' | 'parent'
type ParentTab = 'map' | 'mistakes' | 'parent'
const subjectPreference = 'student-desk:subject'

function storedSubject(): Subject {
  try { const value = window.localStorage.getItem(subjectPreference); return value === 'chinese' || value === 'english' ? value : 'math' } catch { return 'math' }
}
function storeSubject(value: Subject) {
  try { window.localStorage.setItem(subjectPreference, value) } catch { /* The preference is a convenience; blocked storage falls back to the default subject. */ }
}

/** Workbench actions share the same persisted state as the native tutoring tools. */
export function StudyDesk({ sessionId, visible, ask, running, t, useResource, remote }: { sessionId: StudentSessionId; useResource: UseStudentResource; remote: Pick<Context['remote']['student'], 'manualContext' | 'saveManual' | 'inspectSubmission'>; visible: boolean; ask: AskTutor; running: boolean; t: Translate }) {
  const [subject, setSubject] = useState<Subject>(storedSubject)
  const [mistakeOffset, setMistakeOffset] = useState(0)
  const [mistakeStatus, setMistakeStatus] = useState<MistakeStatus>('all')
  const [mapGrade, setMapGrade] = useState<number>()
  const [mapTerm, setMapTerm] = useState<'first' | 'second'>()
  const [selectedConceptId, setSelectedConceptId] = useState('')
  const [intensities, setIntensities] = useState<Partial<Record<Subject, CheckInIntensity>>>({})
  const [scopeChoice, setScopeChoice] = useState<Partial<Record<Subject, ScopeChoice>>>({})
  const [view, setView] = useState<View>('student')
  const [parentTab, setParentTab] = useState<ParentTab>('map')
  const [knowledgeView, setKnowledgeView] = useState<'map' | 'ideas'>('map')
  const scopeOf = (target: Subject): ScopeChoice => scopeChoice[target] ?? {}
  const activeScope = scopeOf(subject)
  const showMap = view === 'parent' && parentTab === 'map' && knowledgeView === 'map'
  const tab = view === 'student' ? 'today' : parentTab === 'map' ? 'map' : parentTab === 'mistakes' ? 'mistakes' : 'parent'
  const showBook = view === 'parent' && (parentTab === 'map')
  const workspace = useStudy(sessionId, visible, t('networkError'), { tab, offset: mistakeOffset, subject, status: mistakeStatus, ...(showBook && mapGrade !== undefined ? { mapGrade } : {}), ...(showBook && mapTerm !== undefined ? { mapTerm } : {}), ...(activeScope.grade !== undefined ? { diagGrade: activeScope.grade } : {}), ...(activeScope.term !== undefined ? { diagTerm: activeScope.term } : {}), ...(activeScope.unit ? { diagUnit: activeScope.unit } : {}) }, useResource)
  const { data } = workspace
  const [activity, setActivity] = useState<Activity>({ subject: storedSubject(), mode: 'foundation' })
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('')
  const [epoch, setEpoch] = useState(0)
  const [localNow, setLocalNow] = useState(Date.now())
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
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
    return { termId: workspace.termId, blockId: ownerId, questionId: task?.id, responseId: task?.responseId ?? responseIds.current.get(key) }
  }
  async function tutor(text = continuePrompt, photo?: StudyPhoto, command?: Command) {
    const ids = identity(command)
    if (command?.action === 'answer' && submissions.some(item => item.response?.responseId === ids.responseId && item.admission === 'unknown' && !item.inspection)) { setSendError(t('messageUnknown')); throw new Error(t('messageUnknown')) }
    setSending(true); setSendError('')
    const intent = { nativeSessionId: sessionId, ...ids, selection: { subject: command?.action === 'start' ? command.subject : subject, goalId: selectedObjectiveId || undefined, scope: command?.action === 'start' && command.scope ? command.scope : scopeCommand(subject) }, ...(command ? { operation: command } : {}), request: text.trim() === '' ? continuePrompt : text }
    const retain = (requestId: string, admission: 'accepted' | 'unknown') => setSubmissions(previous => [...previous, { requestId, admission, ...(ids.questionId ? { questionId: ids.questionId } : {}), ...(command?.action === 'answer' && ids.termId && ids.blockId && ids.responseId ? { response: { termId: ids.termId as TermId, owner: { kind: 'block' as const, id: ids.blockId as BlockId }, responseId: ids.responseId as ResponseId } } : {}) }].slice(-12))
    try { const result = await ask(nativeIntentPrompt(intent, intent.request), photo); if (result) retain(result.requestId, result.admission) }
    catch (reason) { if (reason instanceof StudySubmissionError) retain(reason.requestId, 'unknown'); setSendError(reason instanceof Error ? reason.message : t('sendError')); throw reason }
    finally { setSending(false) }
  }
  async function change(command: Command, _revision?: number, _baseline?: string): Promise<Dashboard> {
    await tutor(continuePrompt, undefined, command)
    if (!data) throw new Error(t('networkError'))
    return data
  }
  async function manual(command: Command, _revision?: number, original?: string): Promise<Dashboard> {
    if (!data || !workspace.termId || workspace.stale) throw new Error(t('manualInvalid'))
    const retained = original ? JSON.parse(original) : undefined
    const beforeText = retained && typeof retained.baseline === 'string' ? retained.baseline : original
    const editedNames: string[] | undefined = retained && Array.isArray(retained.editedFields) ? retained.editedFields : undefined
    let intent: ManualSaveRequest['intent']
    let baseline: Record<string, StudentJsonValue> | undefined
    if (command.action === 'setup') {
      const before = beforeText ? JSON.parse(beforeText) : data.study?.profile
      const fields = (Object.keys(command.profile) as (keyof typeof command.profile)[]).filter(field => field !== 'parentConfirmation' && (editedNames ? editedNames.includes(field) : command.profile[field] !== before?.[field]))
      intent = { kind: 'settings', command, editedProfileFields: fields }
      baseline = Object.fromEntries(fields.map(field => [`profile:${field}`, before?.[field] ?? null]))
    } else if (command.action === 'configure-course') {
      intent = { kind: 'settings', command }
      const before = beforeText ? JSON.parse(beforeText) : { course: data.study?.courses.find(item => item.subject === command.course.subject) }
      baseline = { [`material:${command.material.id}`]: null, [`course:${command.course.subject}`]: before.course ?? null }
    } else if (command.action === 'school-progress' || command.action === 'interests' || command.action === 'openmaic-settings') {
      intent = { kind: 'settings', command }
      if (command.action === 'school-progress' && beforeText) baseline = { [`progress:${command.subject}`]: JSON.parse(beforeText) }
      if (command.action === 'interests' && beforeText) baseline = { interests: JSON.parse(beforeText!) }
      if (command.action === 'openmaic-settings') baseline = beforeText ? undefined : { openmaic: null }
    } else return change(command)
    const controller = new AbortController()
    const context = await remote.manualContext(sessionId, intent, controller.signal)
    if (!context.ok) throw new Error(context.error.message)
    if (!context.value.termId || context.value.termId !== workspace.termId) throw new Error(t('manualOldTerm'))
    if (command.action === 'openmaic-settings') {
      const current = context.value.baseline.openmaic
      const currentBase = current && typeof current === 'object' && 'baseUrl' in current ? current.baseUrl : ''
      if (beforeText !== undefined && currentBase !== beforeText) throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(current)}`)
      baseline = context.value.baseline
    }
    if (command.action === 'interests' && context.value.baseline.interests === null) baseline = { interests: null }
    const result = await remote.saveManual(sessionId, { termId: context.value.termId, expectedVersions: context.value.versions, baseline: baseline ?? context.value.baseline, intent }, controller.signal)
    if (!result.ok) throw new Error(result.error.message)
    if (result.value.status === 'conflict') throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(result.value.current)}`)
    if (result.value.status === 'old-term') throw new Error(t('manualOldTerm'))
    if (result.value.status !== 'saved' && result.value.status !== 'unchanged') throw new Error(result.value.reason ?? t('manualInvalid'))
    return data
  }
  async function saveWorksheet(intent: ManualSaveRequest['intent'], baseline: Record<string, StudentJsonValue>) {
    if (!workspace.termId || workspace.stale) throw new Error(t('manualInvalid'))
    const controller = new AbortController()
    const context = await remote.manualContext(sessionId, intent, controller.signal)
    if (!context.ok) throw new Error(context.error.message)
    if (context.value.termId !== workspace.termId) throw new Error(t('manualOldTerm'))
    const result = await remote.saveManual(sessionId, { termId: context.value.termId, expectedVersions: context.value.versions, baseline, intent }, controller.signal)
    if (!result.ok) throw new Error(result.error.message)
    if (result.value.status === 'conflict') throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(result.value.current)}`)
    if (result.value.status === 'old-term') throw new Error(t('manualOldTerm'))
    if (result.value.status !== 'saved' && result.value.status !== 'unchanged') throw new Error(result.value.reason ?? t('manualInvalid'))
  }
  async function act(command: Command, _withTutor = false, prompt = continuePrompt) {
    try { await tutor(prompt, undefined, command) } catch { /* The request or tutor notice retains the failed action and its data. */ }
  }
  function selectSubject(item: Subject) { setSubject(item); storeSubject(item) }
  const now = Math.max(localNow + workspace.offset.current, data?.serverNow ?? 0)
  const study = data?.study
  const subjectLoading = !!study && study.confirmedSubject !== subject
  const disabled = sending || workspace.stale
  const active = study?.active
  useEffect(() => {
    if (active) { selectSubject(active.subject); setActivity({ subject: active.subject, mode: active.mode }) }
  }, [active?.id])
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
    selectSubject(goal.subject); setActivity({ subject: goal.subject, mode: 'foundation' }); setSelectedObjectiveId(goal.id); setMistakeOffset(0); setView('student')
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
    selectSubject(target); setActivity({ subject: target, mode: 'diagnose' }); setSelectedObjectiveId(''); setMistakeOffset(0); setView('student')
    return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: 'diagnose', intensity, ...(scoped ? scopeCommand(target) : {}) }, true, diagnosePrompt(intensity, ids, t))
  }
  function start(target: Subject, mode: Mode, inquiry?: string) {
    if (mode === 'diagnose') return startDiagnosis(target, chosenIntensity(target))
    const next = resolveMode(target, mode)
    const prompt = next === 'review' ? reviewPrompt : next === 'explore' ? explorePrompt(inquiry) : selectedObjectiveId ? goalPrompt(selectedObjectiveId) : continuePrompt
    return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: next, ...((next === 'foundation' || next === 'school') ? scopeCommand(target) : {}) }, true, prompt)
  }
  function lessonRequest() {
    const recommendation = study?.recommendation
    const objectiveId = selectedObjectiveId || recommendation?.objectiveId || undefined
    const subjectKey = selectedObjectiveId ? subject : recommendation?.objectiveId ? recommendation.subject : subject
    const progress = study?.courses.find(item => item.subject === subjectKey)?.progress
    const unitName = recommendation?.objectiveId ? recommendation.unitName : (progress ? curriculum?.units.find(unit => unit.id === progress.unitId)?.name : undefined)
    return {
      objectiveId,
      unitName,
      subjectLabel: t(subjectKey),
      tags: study?.interests ?? [],
      focus: study?.interestFocus ?? '',
    }
  }
  function startInterest() {
    const recommendation = study?.recommendation
    if (selectedObjectiveId) { void start(subject, 'foundation'); return }
    if (!recommendation || recommendation.kind === 'hold' || !study) return
    const mode: Mode = resolveMode(recommendation.subject, 'foundation')
    const request = lessonRequest()
    selectSubject(recommendation.subject); setActivity({ subject: recommendation.subject, mode }); setSelectedObjectiveId(recommendation.objectiveId ?? ''); setMistakeOffset(0)
    const teaching = recommendation.reason.code === 'needs-teaching' || recommendation.reason.code === 'prerequisite-gap'
    const scene = interestPracticePrompt(request.objectiveId, request.tags, request.focus, request.unitName)
    const prompt = teaching && recommendation.objectiveId ? `${teachPrompt(recommendation.objectiveId)}${scene}` : scene
    void act({ action: 'start', id: crypto.randomUUID(), subject: recommendation.subject, mode }, true, prompt)
  }
  function startDue() {
    const items = study?.dueToday ?? []
    const first = items[0]
    if (!study || !first) return
    selectSubject(first.subject); setActivity({ subject: first.subject, mode: 'review' }); setSelectedObjectiveId(''); setMistakeOffset(0)
    void act({ action: 'start', id: crypto.randomUUID(), subject: first.subject, mode: 'review' }, true, dueClearPrompt(items.map(item => item.id)))
  }
  function startRecommended() {
    const recommendation = study?.recommendation
    if (!recommendation || recommendation.kind === 'hold' || !study) return
    if (recommendation.kind === 'diagnose') { void startDiagnosis(recommendation.subject, chosenIntensity(recommendation.subject)); return }
    const mode: Mode = recommendation.kind === 'review' ? 'review' : resolveMode(recommendation.subject, 'foundation')
    selectSubject(recommendation.subject); setActivity({ subject: recommendation.subject, mode }); setSelectedObjectiveId(mode === 'review' ? '' : recommendation.objectiveId ?? ''); setMistakeOffset(0)
    const teaching = recommendation.reason.code === 'needs-teaching'
    const prompt = recommendation.kind === 'review' ? reviewPrompt : teaching && recommendation.objectiveId ? teachPrompt(recommendation.objectiveId) : teaching ? teachQueuePrompt(recommendation.title ?? '') : recommendation.kind === 'preview' && recommendation.objectiveId ? previewPrompt(recommendation.objectiveId) : recommendation.objectiveId ? goalPrompt(recommendation.objectiveId) : continuePrompt
    void act({ action: 'start', id: crypto.randomUUID(), subject: recommendation.subject, mode }, true, prompt)
  }
  const nativeT: Translate = key => ['saved', 'gradesSaved', 'confirmPaperDone', 'teachQueued', 'workbookSaved'].includes(key) ? t('intentAdmitted') : t(key)
  const parentSettings = view === 'parent' && parentTab === 'parent'
  const draftScope = `student:draft:${sessionId}:${workspace.termId ?? 'setup'}`
  return <main className="student-desk" aria-label={t('title')}>
    <header className="student-top">
      <nav className="student-views" aria-label={t('title')}>
        <button type="button" aria-pressed={view === 'student'} onClick={() => setView('student')}>{t('today')}</button>
        <button type="button" aria-pressed={view === 'parent'} onClick={() => setView('parent')}>{t('parentView')}</button>
      </nav>
      {view === 'parent' && <nav className="student-tabs" aria-label={t('parentView')}>
        <button type="button" aria-pressed={parentTab === 'map'} onClick={() => setParentTab('map')}>{t('parentProgress')}</button>
        <button type="button" aria-label={t('mistakes')} aria-pressed={parentTab === 'mistakes'} onClick={() => setParentTab('mistakes')}>{t('parentPractice')}{study && study.dueTotal > 0 ? ` · ${study.dueTotal}` : ''}</button>
        <button type="button" aria-pressed={parentTab === 'parent'} onClick={() => setParentTab('parent')}>{t('parentProfile')}</button>
      </nav>}
      <div className="student-toolbar">
        {study && !parentSettings && <nav className="student-subjects" aria-label={t('subject')}>{subjects.map(item => <button key={item} type="button" aria-pressed={subject === item} onClick={() => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }); setSelectedObjectiveId(''); setMistakeOffset(0); setMistakeStatus('all') }}>{t(item)}</button>)}</nav>}
        <button type="button" className="student-quiet" disabled={sending} onClick={() => { setEpoch(value => value + 1) }}>{t('reload')}</button>
      </div>
    </header>
    {workspace.error && <p role="alert">{t('staleData')}</p>}
    {sendError && <p role="alert">{sendError}</p>}
    {submissions.length > 0 && <details className="student-fold"><summary>{t('submissionStatus')}</summary>{submissions.map(item => <div key={item.requestId}>
      <p>{t(item.admission === 'accepted' ? 'messageAdmitted' : 'messageUnknown')}</p>
      {item.response && <p>{t(item.inspection?.answer === 'saved' ? 'answerSaved' : 'answerPending')} · {t(item.inspection?.assessment === 'valid' ? 'assessmentSaved' : 'assessmentPending')}</p>}
      <button type="button" disabled={sending} onClick={() => { const controller = new AbortController(); void remote.inspectSubmission(sessionId, { requestId: item.requestId, ...(item.response ? { response: item.response } : {}) }, controller.signal).then(reply => { if (!reply.ok) throw new Error(reply.error.message); const result = reply.value; setSubmissions(previous => previous.map(current => current.requestId === item.requestId ? { ...current, admission: result.admission, inspection: result } : current)) }).catch(reason => setSendError(reason instanceof Error ? reason.message : t('networkError'))) }}>{t('inspectSubmission')}</button>
    </div>)}</details>}
    {!data ? !workspace.error && <progress aria-label={t('busy')} /> : !study && view !== 'parent' ? <section><p>{t('setupFirst')}</p><button disabled={sending} onClick={() => { void tutor(t('setupIntent')).catch(() => {}) }}>{t('setupConversation')}</button></section> : subjectLoading && !parentSettings ? <progress aria-label={t('busy')} /> : <>
      {study && view === 'student' && <TodayView draftScope={draftScope} study={study} subject={subject} activity={activity} setActivity={setActivity} goal={goals.find(item => item.id === selectedObjectiveId)} clearGoal={() => setSelectedObjectiveId('')} curriculum={curriculum} selectedObjectiveId={selectedObjectiveId} chooseGoal={chooseGoal} intensityLabel={`${t(intensityKeys[chosenIntensity(subject)])} · ${planOf(subject)?.samples[chosenIntensity(subject)].length ?? 0}`} openParent={() => { setView('parent'); setParentTab('parent') }} openCheckins={() => { setView('parent'); setParentTab('map') }} scope={activeScope} setScope={next => setScopeChoice(previous => ({ ...previous, [subject]: next }))} scopeUnits={study.scopedUnits ?? []} start={start} startRecommended={startRecommended} startDiagnosis={startDiagnosis} chosenIntensity={chosenIntensity(subject)} disabled={disabled} running={running} act={act} tutor={tutor} t={t} prompts={{ daily: dailySheetPrompt(subject), dictation: dictationPrompt(subject) }} lessons={lessonsForSubject(data.interactiveLessons?.lessons ?? [], subject)} onInterestPractice={startInterest} onOpenLesson={() => { const request = lessonRequest(); void tutor(openmaicGeneratePrompt(request.subjectLabel, request.objectiveId, request.tags, request.focus, request.unitName)).catch(() => {}) }} onClearDue={startDue} onOpenClassroom={openClassroom} />}
      {study && view === 'student' && data.interactiveLessons && <LessonsPanel lessons={lessonsForSubject(data.interactiveLessons.lessons, subject)} {...(data.interactiveLessons.error !== undefined ? { error: data.interactiveLessons.error } : {})} disabled={disabled} running={running} t={t} onRetry={runId => { void tutor(openmaicRetryPrompt(runId)).catch(() => {}) }} onReview={classroomId => { void tutor(openmaicReviewPrompt(classroomId)).catch(() => {}) }} />}
      {study && view === 'parent' && parentTab === 'map' && <nav className="student-segments" aria-label={t('parentProgress')}><button type="button" aria-pressed={knowledgeView === 'map'} onClick={() => setKnowledgeView('map')}>{t('map')}</button><button type="button" aria-pressed={knowledgeView === 'ideas'} onClick={() => setKnowledgeView('ideas')}>{t('ideas')}</button></nav>}
      {study && showMap && <MapView study={study} curriculum={curriculum} subject={subject} selectedConceptId={selectedConceptId} setSelectedConceptId={setSelectedConceptId} selectedObjectiveId={selectedObjectiveId} clearGoal={() => setSelectedObjectiveId('')} chooseGoal={chooseGoal} active={!!active} scopeGrade={scopeGrade} scopeTerm={scopeTerm} setMapGrade={setMapGrade} setMapTerm={setMapTerm} clearBrowse={() => { setMapGrade(undefined); setMapTerm(undefined) }} intensities={intensities} setIntensity={(target, level) => setIntensities(previous => ({ ...previous, [target]: level }))} scopeOf={scopeOf} setScope={(target, next) => setScopeChoice(previous => ({ ...previous, [target]: next }))} selectSubject={selectSubject} startDiagnosis={startDiagnosis} disabled={disabled} running={running} organize={() => { void tutor(organizePrompt(subject)).catch(() => {}) }} change={command => change(command).then(() => undefined)} t={t} />}
      {study && view === 'parent' && parentTab === 'map' && knowledgeView === 'ideas' && <IdeasView study={study} curriculum={curriculum} t={t} onOpenConcept={id => { setSelectedConceptId(id); setKnowledgeView('map') }} />}
      {study && view === 'parent' && parentTab === 'mistakes' && <PracticeView study={study} now={now} subject={subject} goals={goals} mistakeStatus={mistakeStatus} setMistakeStatus={setMistakeStatus} setMistakeOffset={setMistakeOffset} revision={data.revision} disabled={disabled} running={running} change={change} ask={tutor} onReview={item => { selectSubject(item); setActivity({ subject: item, mode: 'review' }); setSelectedObjectiveId(''); setView('student') }} epoch={epoch} t={nativeT} />}
      {study && view === 'parent' && parentTab === 'mistakes' && workspace.termId && <WorksheetCorrections key={draftScope} sessionId={sessionId} termId={workspace.termId} draftScope={draftScope} useResource={useResource} save={saveWorksheet} disabled={disabled} t={t} />}
      {parentSettings && <section><button type="button" disabled={disabled} onClick={() => { void tutor(t('setupIntent')).catch(() => {}) }}>{t('profileConversation')}</button><button type="button" disabled={disabled} onClick={() => { void tutor(t('courseConversation')).catch(() => {}) }}>{t('courseConversation')}</button><button type="button" disabled={disabled} onClick={() => { void tutor(t('archiveConversation')).catch(() => {}) }}>{t('archiveConversation')}</button></section>}
      {parentSettings && study && <details className="student-fold"><summary>{t('manualForms')}</summary><p>{t('manualSummary')}</p><ParentSettings key={draftScope + subject} draftScope={draftScope} data={data} change={manual} t={t} curriculum={curriculum} subject={subject} onSubject={item => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }) }} /></details>}
      {study && parentSettings && <Growth study={study} curriculum={curriculum} subject={subject} goals={goals} t={t} />}
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
      {study.recentAttempts.map(item => <details key={item.id}><summary>{item.topic} · {t(item.result)}</summary><p>{item.prompt}</p><p>{item.response}</p><p>{item.feedback}</p><p>{item.answerEvidence}</p></details>)}
    </section><p>{t('bounded')}</p>
  </>
}
