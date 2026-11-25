import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { StudySubmissionError } from "./bridge.js";
import { TYPERT_REMOTE } from '@winterhuan/dsh-student/remote';
import { WorksheetCorrections } from "./worksheet-corrections.js";
import { ParentSettings } from "./forms.js";
import { useStudy } from "./workspace.js";
import { assistKeys, day, intensityKeys, levelKeys, subjects } from "./display.js";
import { IdeasView } from "./ideas-view.js";
import { MapView } from "./map-view.js";
import { PracticeView } from "./practice-view.js";
import { LessonsPanel, lessonsForSubject } from "./lessons-view.js";
import { continuePrompt, loadLearningPrompt, dailySheetPrompt, diagnosePrompt, dictationPrompt, explorePrompt, goalPrompt, openmaicQueryPrompt, openmaicRetryPrompt, openmaicReviewPrompt, organizePrompt, nativeIntentPrompt, pendingRecordPrompt, pendingRecordsPrompt, reviewPrompt } from "./prompts.js";
import { TodayView } from "./today-view.js";
import css from './desk.module.css';
const subjectPreference = 'student-desk:subject';
function storedSubject() {
    try {
        const value = window.localStorage.getItem(subjectPreference);
        return value === 'chinese' || value === 'english' ? value : 'math';
    }
    catch {
        return 'math';
    }
}
function storeSubject(value) {
    try {
        window.localStorage.setItem(subjectPreference, value);
    }
    catch { /* The preference is a convenience; blocked storage falls back to the default subject. */ }
}
/** Workbench actions share the same persisted state as the native tutoring tools. */
export function StudyDesk({ sessionId, visible, ask, running, pending = false, syncFeedback, cancel, t, useResource, saveSettings, saveWorksheet: saveWorksheetRecord, openLesson, useStore, actions }) {
    const [subject, setSubject] = useState(storedSubject);
    const [mistakeOffset, setMistakeOffset] = useState(0);
    const [mistakeStatus, setMistakeStatus] = useState('all');
    const [mapGrade, setMapGrade] = useState();
    const [mapTerm, setMapTerm] = useState();
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [intensities, setIntensities] = useState({});
    const [scopeChoice, setScopeChoice] = useState({});
    const [tab, setTab] = useState('today');
    const [knowledgeView, setKnowledgeView] = useState('map');
    const scopeOf = (target) => scopeChoice[target] ?? {};
    const activeScope = scopeOf(subject);
    const showMap = tab === 'map' && knowledgeView === 'map';
    const showBook = tab === 'map';
    const workspace = useStudy(sessionId, visible, t('networkError'), { tab: tab === 'lessons' ? 'parent' : tab, offset: mistakeOffset, subject, status: mistakeStatus, ...(showBook && mapGrade !== undefined ? { mapGrade } : {}), ...(showBook && mapTerm !== undefined ? { mapTerm } : {}), ...(activeScope.grade !== undefined ? { diagGrade: activeScope.grade } : {}), ...(activeScope.term !== undefined ? { diagTerm: activeScope.term } : {}), ...(activeScope.unit ? { diagUnit: activeScope.unit } : {}) }, useResource);
    const { data } = workspace;
    const readOnly = workspace.value?.status === 'legacy';
    const [activity, setActivity] = useState({ subject: storedSubject(), mode: 'foundation' });
    const [selectedObjectiveId, setSelectedObjectiveId] = useState('');
    const [localNow, setLocalNow] = useState(Date.now());
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [syncStatus, setSyncStatus] = useState();
    const paused = useRef(false);
    useEffect(() => {
        if (!visible)
            return;
        const timer = window.setInterval(() => setLocalNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [visible, workspace.offset]);
    const responseIds = useRef(new Map());
    const [submissions, setSubmissions] = useState(() => {
        try {
            const entries = JSON.parse(window.sessionStorage.getItem(`student:submissions:${sessionId}`) ?? '[]');
            if (!Array.isArray(entries))
                return [];
            return entries.slice(-12).flatMap(entry => {
                try {
                    if (entry.admission !== 'accepted' && entry.admission !== 'unknown')
                        return [];
                    const input = TYPERT_REMOTE.methods['student/inspectSubmission'].input({ strict: true }).create().parse({ sessionId, request: { requestId: entry.requestId, ...(entry.response ? { response: entry.response } : {}) } });
                    return [{ ...input.request, admission: entry.admission, ...(typeof entry.questionId === 'string' ? { questionId: entry.questionId } : {}) }];
                }
                catch {
                    return [];
                }
            });
        }
        catch {
            return [];
        }
    });
    useEffect(() => {
        try {
            window.sessionStorage.setItem(`student:submissions:${sessionId}`, JSON.stringify(submissions));
        }
        catch { /* Submission identities remain available while mounted when browser storage is blocked. */ }
    }, [sessionId, submissions]);
    function identity(command) {
        const task = data?.study?.task;
        const ownerId = task?.sessionId ?? data?.study?.active?.id;
        const key = JSON.stringify([workspace.termId, ownerId, task?.id]);
        const retained = submissions.find(item => item.questionId === task?.id && item.response?.owner.id === ownerId && item.response?.termId === workspace.termId && item.admission === 'unknown');
        if (retained?.response)
            responseIds.current.set(key, retained.response.responseId);
        if (command?.action === 'answer' && !responseIds.current.has(key))
            responseIds.current.set(key, crypto.randomUUID());
        return { learnerId: workspace.learnerId, termId: workspace.termId, blockId: ownerId, questionId: task?.id, responseId: task?.responseId ?? responseIds.current.get(key) };
    }
    async function tutor(text = continuePrompt, photo, command, currentBlock = false, continuation = false, continuationAction) {
        if (readOnly)
            throw new Error(t('legacyFilesHelp'));
        const previous = identity(command);
        const next = continuation ? workspace.nextAction : null;
        if (continuation && (!workspace.contextReady || !next))
            return;
        const ids = next ? { learnerId: workspace.learnerId, termId: workspace.termId, blockId: next.blockId, questionId: next.questionId, responseId: next.responseId } : previous;
        if (command?.action === 'answer' && submissions.some(item => item.response?.responseId === ids.responseId && item.admission === 'unknown')) {
            setSendError(t('messageUnknown'));
            throw new Error(t('messageUnknown'));
        }
        setSending(true);
        setSendError('');
        const active = data?.study?.active;
        const retainBlock = active && (currentBlock || command?.action === 'answer' || command?.action === 'hint' || command?.action === 'stuck' || command?.action === 'stop');
        const selection = next ? { subject: next.subject, goalId: next.goalId, scope: next.scope } : retainBlock ? { subject: active.subject, goalId: data?.study?.task?.objectiveId, scope: active.scope } : { subject: command?.action === 'start' ? command.subject : subject, goalId: selectedObjectiveId || undefined, scope: command?.action === 'start' ? command.scope : scopeCommand(subject).scope };
        const intent = { nativeSessionId: sessionId, ...ids, selection, nextAction: workspace.nextAction, round: workspace.round, legalActions: workspace.legalActions, ...(continuation ? { previousActivity: { blockId: previous.blockId, questionId: previous.questionId, responseId: previous.responseId }, continuationAction } : {}), ...(command ? { operation: command } : {}), request: text.trim() === '' ? continuePrompt : text };
        const retain = (requestId, admission) => setSubmissions(previous => [...previous, { requestId, admission, ...(ids.questionId ? { questionId: ids.questionId } : {}), ...(command?.action === 'answer' && ids.termId && ids.blockId && ids.responseId ? { response: { termId: ids.termId, owner: { kind: 'block', id: ids.blockId }, responseId: ids.responseId } } : {}) }].slice(-12));
        try {
            const result = await ask(nativeIntentPrompt(intent, intent.request), photo);
            if (result)
                retain(result.requestId, result.admission);
        }
        catch (reason) {
            if (reason instanceof StudySubmissionError)
                retain(reason.requestId, 'unknown');
            setSendError(reason instanceof Error ? reason.message : t('sendError'));
            throw reason;
        }
        finally {
            setSending(false);
        }
    }
    async function openSavedLesson(lessonId) {
        if (!openLesson) {
            await tutor(openmaicQueryPrompt(lessonId), undefined, undefined, true);
            return;
        }
        setSending(true);
        setSendError('');
        try {
            const result = await openLesson(lessonId);
            if (result.status === 'ownership-unresolved') {
                setSending(false);
                await tutor(openmaicQueryPrompt(lessonId), undefined, undefined, true);
            }
            else if (result.status !== 'opened')
                setSendError(t(result.status === 'login-required' ? 'classroomLoginRequired' : result.status === 'identity-mismatch' ? 'classroomIdentityMismatch' : 'classroomUnavailable'));
        }
        catch (_error) {
            setSendError(t('classroomUnavailable'));
        }
        finally {
            setSending(false);
        }
    }
    async function change(command, _revision, _baseline) {
        await tutor(continuePrompt, undefined, command);
        if (!data)
            throw new Error(t('networkError'));
        return data;
    }
    async function manual(command, _revision, original) {
        if (!data || !workspace.termId || workspace.stale)
            throw new Error(t('manualInvalid'));
        return saveSettings(sessionId, command, data, workspace.termId, original, t);
    }
    async function saveWorksheet(intent, baseline) {
        if (!workspace.termId || workspace.stale)
            throw new Error(t('manualInvalid'));
        return saveWorksheetRecord(sessionId, intent, baseline, workspace.termId, t);
    }
    async function act(command, _withTutor = false, prompt = continuePrompt) {
        try {
            if (command.action === 'stop') {
                paused.current = true;
                if (currentLesson && syncFeedback)
                    await requestSync(currentLesson.id, 'pause');
                await cancel?.();
            }
            await tutor(prompt, undefined, command);
        }
        catch (reason) {
            setSendError(reason instanceof Error ? reason.message : t('sendError'));
        }
    }
    function selectSubject(item) { setSubject(item); storeSubject(item); }
    const now = Math.max(localNow + workspace.offset.current, data?.serverNow ?? 0);
    const study = data?.study;
    const nativePending = pending || !!workspace.value?.native.admissions.some(item => item.status === 'pending' || item.status === 'claimed');
    const disabled = sending || workspace.stale || readOnly;
    const active = study?.active;
    const followedActive = useRef();
    useEffect(() => {
        if (active && (followedActive.current?.sessionId !== sessionId || followedActive.current.blockId !== active.id)) {
            followedActive.current = { sessionId, blockId: active.id };
            selectSubject(active.subject);
            setActivity({ subject: active.subject, mode: active.mode });
        }
    }, [active?.id, sessionId]);
    const ownerBlockId = active?.subject === subject ? active.id : workspace.round?.blockId;
    const currentLesson = workspace.learnerId && workspace.termId ? data?.interactiveLessons.lessons.find(item => item.blockId === ownerBlockId && item.learnerId === workspace.learnerId && item.termId === workspace.termId && item.status !== 'failed') : undefined;
    async function requestSync(lessonId, trigger) {
        if (!syncFeedback)
            return;
        try {
            const result = await syncFeedback(lessonId, trigger);
            setSyncStatus(result.status);
        }
        catch (reason) {
            setSyncStatus('unavailable');
            setSendError(reason instanceof Error ? reason.message : t('classroomUnavailable'));
            throw reason;
        }
    }
    const returnState = useRef({ currentLesson, syncFeedback, round: workspace.round, contextReady: workspace.contextReady, requestSync });
    returnState.current = { currentLesson, syncFeedback, round: workspace.round, contextReady: workspace.contextReady, requestSync };
    const resumed = useRef();
    useEffect(() => {
        if (!visible || tab !== 'today') {
            resumed.current = undefined;
            return;
        }
        if (!workspace.contextReady || !currentLesson || currentLesson.status !== 'ready' || paused.current || workspace.round?.status === 'paused')
            return;
        const owner = JSON.stringify([sessionId, currentLesson.id]);
        if (resumed.current === owner)
            return;
        resumed.current = owner;
        void requestSync(currentLesson.id, 'resume').catch(() => { });
    }, [visible, tab, currentLesson?.id, sessionId, workspace.contextReady]);
    useEffect(() => {
        if (!visible || tab !== 'today')
            return;
        const returned = () => {
            const current = returnState.current;
            if (!current.contextReady || document.visibilityState === 'hidden' || paused.current || current.round?.status === 'paused' || current.currentLesson?.status !== 'ready')
                return;
            void current.requestSync(current.currentLesson.id, 'return').catch(() => { });
        };
        window.addEventListener('focus', returned);
        document.addEventListener('visibilitychange', returned);
        return () => { window.removeEventListener('focus', returned); document.removeEventListener('visibilitychange', returned); };
    }, [visible, tab, sessionId]);
    async function continueLearning(continuationAction) {
        const next = workspace.nextAction;
        if (!workspace.contextReady || !next || running || nativePending || sending)
            return;
        paused.current = false;
        const sourceLesson = next.source?.kind === 'openmaic' ? next.source.verification.lessonId : undefined;
        if ((!continuationAction || continuationAction === 'sync-feedback') && syncFeedback && (sourceLesson || currentLesson?.status === 'ready' && next.blockId === currentLesson.blockId)) {
            await requestSync(sourceLesson ?? currentLesson.id, 'continue');
            return;
        }
        const request = continuationAction ? `请按共享 legalActions 执行 ${continuationAction}，保留当前 round 与原作答。${continuePrompt}` : currentLesson?.status === 'generating' && next.blockId === currentLesson.blockId ? openmaicQueryPrompt(currentLesson.id) : continuePrompt;
        await tutor(request, undefined, undefined, true, true, continuationAction);
    }
    const curriculum = study?.curriculum ?? null;
    const scopeGrade = curriculum?.scope.grade ?? mapGrade ?? study?.profile.grade ?? 1;
    const scopeTerm = curriculum?.scope.term ?? mapTerm ?? study?.profile.term ?? 'first';
    const goals = [...(curriculum && curriculum.scope.current ? curriculum.objectives : []).map(item => ({ id: item.id, title: item.title })), ...(study?.objectives ?? []).map(item => ({ id: item.id, title: item.title }))];
    const planOf = (target) => study?.diagnostics.find(plan => plan.subject === target);
    const chosenIntensity = (target) => intensities[target] ?? planOf(target)?.recommendedIntensity ?? 'standard';
    function resolveMode(target, mode) {
        if (mode === 'review' || mode === 'explore' || mode === 'diagnose')
            return mode;
        return study?.courses.some(item => item.subject === target) ? 'school' : 'foundation';
    }
    function chooseGoal(goal) {
        selectSubject(goal.subject);
        setActivity({ subject: goal.subject, mode: 'foundation' });
        setSelectedObjectiveId(goal.id);
        setMistakeOffset(0);
        setTab('today');
    }
    function scopeCommand(target) {
        const scope = scopeOf(target);
        if (scope.grade === undefined && scope.term === undefined)
            return {};
        return { scope: { grade: scope.grade ?? study?.profile.grade ?? 2, term: scope.term ?? study?.profile.term ?? 'first', ...(scope.unit ? { units: [scope.unit] } : {}) } };
    }
    function startDiagnosis(target, intensity) {
        if (!study)
            return Promise.resolve();
        const scope = scopeOf(target);
        const scoped = scope.grade !== undefined || scope.term !== undefined;
        const plan = scoped ? study.scopedDiagnostic : planOf(target);
        const ids = plan?.samples[intensity].map(item => item.id) ?? [];
        selectSubject(target);
        setActivity({ subject: target, mode: 'diagnose' });
        setSelectedObjectiveId('');
        setMistakeOffset(0);
        setTab('today');
        return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: 'diagnose', intensity, ...(scoped ? scopeCommand(target) : {}) }, true, diagnosePrompt(intensity, ids, t));
    }
    function start(target, mode, inquiry) {
        if (mode === 'diagnose')
            return startDiagnosis(target, chosenIntensity(target));
        const next = resolveMode(target, mode);
        const prompt = next === 'review' ? reviewPrompt : next === 'explore' ? explorePrompt(inquiry) : selectedObjectiveId ? goalPrompt(selectedObjectiveId) : continuePrompt;
        return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: next, ...((next === 'foundation' || next === 'school') ? scopeCommand(target) : {}) }, true, prompt);
    }
    const nativeT = key => ['saved', 'gradesSaved', 'confirmPaperDone', 'teachQueued', 'workbookSaved'].includes(key) ? t('intentAdmitted') : t(key);
    const parentSettings = tab === 'parent';
    const parentVisible = tab !== 'today';
    const draft = { useStore, actions };
    const draftScope = `student:draft:${sessionId}:${workspace.termId ?? 'setup'}`;
    const context = workspace.context;
    const pendingFacts = context && typeof context === 'object' && 'pendingFacts' in context && Array.isArray(context.pendingFacts) ? context.pendingFacts : [];
    const pendingCount = context && typeof context === 'object' && 'pendingFactCount' in context && typeof context.pendingFactCount === 'number' ? context.pendingFactCount : pendingFacts.length;
    const pendingLabels = { answerDate: 'answerDateUnknown', assistance: 'assistanceUnknown', source: 'answerSourceUnknown', answerBasis: 'answerBasisUnknown', objectiveId: 'answerGoalUnknown' };
    return _jsxs("main", { className: `student-desk ${css.desk}`, "aria-label": t('title'), children: [_jsxs("header", { className: "student-top", children: [_jsxs("nav", { className: `student-tabs ${css.navigation}`, "aria-label": t('title'), children: [_jsx("button", { type: "button", "aria-pressed": tab === 'today', onClick: () => setTab('today'), children: t('learningEntry') }), _jsx("button", { type: "button", "aria-pressed": parentVisible, onClick: () => setTab('parent'), children: t('parentEntry') })] }), parentVisible && _jsxs("nav", { className: "student-segments", "aria-label": t('parentEntry'), children: [_jsx("button", { type: "button", "aria-pressed": tab === 'parent', onClick: () => setTab('parent'), children: t('parentProfile') }), _jsx("button", { type: "button", "aria-pressed": tab === 'map', onClick: () => setTab('map'), children: t('parentProgress') }), _jsx("button", { type: "button", "aria-pressed": tab === 'mistakes', onClick: () => setTab('mistakes'), children: t('parentPractice') }), _jsx("button", { type: "button", "aria-pressed": tab === 'lessons', onClick: () => setTab('lessons'), children: t('lessonHistory') })] }), _jsxs("div", { className: "student-toolbar", children: [study && _jsx("nav", { className: "student-subjects", "aria-label": t('subject'), children: subjects.map(item => _jsx("button", { type: "button", "aria-pressed": subject === item, onClick: () => { selectSubject(item); setMistakeOffset(0); setMistakeStatus('all'); }, children: t(item) }, item)) }), _jsx("span", { className: "student-muted", children: t(workspace.loadNeeded ? 'readyToContinue' : workspace.stale ? 'updatePaused' : 'liveUpdates') })] })] }), readOnly && data && _jsx("p", { role: "status", children: t('legacyFilesHelp') }), workspace.error && !workspace.loadNeeded && _jsx("p", { role: "alert", children: t(workspace.invalidRecords ? 'recordsNeedCheck' : 'staleData') }), study && !workspace.contextReady && !workspace.stale && _jsx("p", { role: "status", children: t(workspace.contextState.readStatus === 'partial' ? 'partialLearningRecords' : 'continueWaiting') }), sendError && _jsx("p", { role: "alert", children: sendError }), syncStatus && _jsx("p", { role: "status", children: t(syncStatus === 'queued' ? 'feedbackSyncQueued' : syncStatus === 'coalesced' ? 'feedbackSyncCoalesced' : syncStatus === 'paused' ? 'feedbackSyncPaused' : 'feedbackSyncUnavailable') }), !data ? workspace.loadNeeded ? _jsxs("section", { children: [_jsx("p", { children: t('continueSavedLearning') }), _jsx("button", { type: "button", disabled: sending || running, onClick: () => { void tutor(loadLearningPrompt).catch(() => { }); }, children: t('continueLearning') })] }) : workspace.value?.status === 'missing' ? _jsxs("section", { children: [_jsx("p", { children: t('setupFirst') }), _jsx("button", { disabled: sending, onClick: () => { void tutor(t('setupIntent')).catch(() => { }); }, children: t('setupConversation') })] }) : workspace.value ? _jsx("section", { children: _jsx("p", { children: t(workspace.value.status === 'legacy' ? 'legacyFilesHelp' : 'unavailableFilesHelp') }) }) : !workspace.error && _jsx("div", { className: css.empty, "aria-busy": "true", "aria-label": t('busy'), children: _jsx("span", { className: css.spinner }) }) : !study && tab === 'today' ? _jsxs("section", { children: [_jsx("p", { children: t('setupFirst') }), _jsx("button", { disabled: sending, onClick: () => { void tutor(t('setupIntent')).catch(() => { }); }, children: t('setupConversation') })] }) : _jsxs(_Fragment, { children: [study && tab === 'today' && _jsx(TodayView, { ...draft, draftScope: draftScope, nextAction: workspace.nextAction, learnerId: workspace.learnerId, termId: workspace.termId, classroomBindingId: workspace.classroomBindingId, onContinue: () => { void continueLearning().catch(() => { }); }, round: workspace.round, legalActions: workspace.legalActions, onAction: action => { void continueLearning(action).catch(() => { }); }, study: study, subject: subject, activity: activity, setActivity: setActivity, goal: goals.find(item => item.id === selectedObjectiveId), curriculum: curriculum, selectedObjectiveId: selectedObjectiveId, chooseGoal: chooseGoal, intensityLabel: `${t(intensityKeys[chosenIntensity(subject)])} · ${planOf(subject)?.samples[chosenIntensity(subject)].length ?? 0}`, openParent: () => setTab('parent'), openCheckins: () => setTab('map'), scope: activeScope, setScope: next => setScopeChoice(previous => ({ ...previous, [subject]: next })), scopeUnits: study.scopedUnits ?? [], start: start, startDiagnosis: startDiagnosis, chosenIntensity: chosenIntensity(subject), disabled: disabled || !workspace.contextReady, pending: nativePending, running: running, act: act, tutor: (text, currentBlock) => tutor(text, undefined, undefined, currentBlock), t: t, prompts: { daily: dailySheetPrompt(subject), dictation: dictationPrompt(subject) }, lessons: lessonsForSubject(data.interactiveLessons?.lessons ?? [], subject), onOpenClassroom: lessonId => { void openSavedLesson(lessonId).catch(() => { }); } }), study && tab === 'lessons' && data.interactiveLessons && _jsx(LessonsPanel, { lessons: lessonsForSubject(data.interactiveLessons.lessons, subject), ...(data.interactiveLessons.error !== undefined ? { error: data.interactiveLessons.error } : {}), disabled: disabled, running: running, t: t, onOpen: lessonId => { void openSavedLesson(lessonId).catch(() => { }); }, onQuery: lessonId => { void tutor(openmaicQueryPrompt(lessonId)).catch(() => { }); }, onRetry: runId => { void tutor(openmaicRetryPrompt(runId)).catch(() => { }); }, onReview: classroomId => { void tutor(openmaicReviewPrompt(classroomId)).catch(() => { }); } }), study && tab === 'map' && _jsxs("nav", { className: "student-segments", "aria-label": t('parentProgress'), children: [_jsx("button", { type: "button", "aria-pressed": knowledgeView === 'map', onClick: () => setKnowledgeView('map'), children: t('map') }), _jsx("button", { type: "button", "aria-pressed": knowledgeView === 'ideas', onClick: () => setKnowledgeView('ideas'), children: t('ideas') })] }), study && showMap && _jsx(MapView, { study: study, curriculum: curriculum, subject: subject, selectedConceptId: selectedConceptId, setSelectedConceptId: setSelectedConceptId, selectedObjectiveId: selectedObjectiveId, clearGoal: () => setSelectedObjectiveId(''), chooseGoal: chooseGoal, active: !!active, scopeGrade: scopeGrade, scopeTerm: scopeTerm, setMapGrade: setMapGrade, setMapTerm: setMapTerm, clearBrowse: () => { setMapGrade(undefined); setMapTerm(undefined); }, intensities: intensities, setIntensity: (target, level) => setIntensities(previous => ({ ...previous, [target]: level })), scopeOf: scopeOf, setScope: (target, next) => setScopeChoice(previous => ({ ...previous, [target]: next })), selectSubject: selectSubject, startDiagnosis: startDiagnosis, disabled: disabled, running: running, organize: () => { void tutor(organizePrompt(subject)).catch(() => { }); }, change: command => change(command).then(() => undefined), t: t }), study && tab === 'map' && knowledgeView === 'ideas' && _jsx(IdeasView, { study: study, curriculum: curriculum, t: t, onOpenConcept: id => { setSelectedConceptId(id); setKnowledgeView('map'); } }), study && tab === 'mistakes' && _jsx(PracticeView, { ...draft, study: study, now: now, subject: subject, goals: goals, mistakeStatus: mistakeStatus, setMistakeStatus: setMistakeStatus, setMistakeOffset: setMistakeOffset, revision: data.revision, disabled: disabled, running: running, change: change, ask: tutor, onReview: item => { selectSubject(item); setActivity({ subject: item, mode: 'review' }); setSelectedObjectiveId(''); setTab('today'); }, t: nativeT }), study && tab === 'mistakes' && workspace.termId && _createElement(WorksheetCorrections, { ...draft, key: draftScope, sessionId: sessionId, termId: workspace.termId, subject: subject, draftScope: draftScope, useResource: useResource, save: saveWorksheet, disabled: disabled, t: t }), parentSettings && _jsxs("section", { children: [study && _jsxs(_Fragment, { children: [_jsxs("h3", { children: [study.profile.nickname, " \u00B7 ", t('grade'), ": ", study.profile.grade, " \u00B7 ", t(study.profile.term)] }), _jsxs("p", { className: "student-muted", children: [study.profile.region, " \u00B7 ", study.profile.schoolYear] })] }), _jsxs("div", { className: css.practiceActions, children: [_jsx("button", { type: "button", disabled: disabled, onClick: () => { void tutor(t('setupIntent')).catch(() => { }); }, children: t('profileConversation') }), _jsx("button", { type: "button", disabled: disabled, onClick: () => { void tutor(t('courseConversation')).catch(() => { }); }, children: t('courseConversation') })] })] }), study && parentSettings && _jsx(Growth, { study: study, curriculum: curriculum, subject: subject, goals: goals, t: t }), study && parentSettings && _jsxs("details", { className: "student-fold", children: [_jsx("summary", { children: t('learningRecords') }), _jsx(LearningRecords, { goals: workspace.goalProgress, context: workspace.context, t: t, onReadMore: () => { void tutor('请加载 study，分页读取当前学生及明确引用的历史学期原作答、冻结题面、原官方批改和有效评价。原回答不覆盖，按来源展示差异和未知事实；只读取，不制造新作答或改变当前学习段。').catch(() => { }); } })] }), parentSettings && study && _jsxs("details", { className: "student-fold", children: [_jsx("summary", { children: t('manualForms') }), _jsx("p", { children: t('manualSummary') }), _jsx("fieldset", { disabled: readOnly, children: _createElement(ParentSettings, { ...draft, key: draftScope + subject, draftScope: draftScope, observation: workspace.value?.versions.find(file => file.path === '.study/settings.json')?.version, data: data, change: manual, t: t, curriculum: curriculum, subject: subject, onSubject: item => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }); }, onArchive: () => { void tutor(t('archiveConversation')).catch(() => { }); } }) })] }), study && parentSettings && pendingFacts.length > 0 && _jsxs("details", { className: "student-fold", children: [_jsx("summary", { children: t('pendingFacts') }), _jsx("p", { children: t('pendingFactsHelp') }), _jsx("button", { type: "button", disabled: disabled || running, onClick: () => { void tutor(pendingRecordsPrompt).catch(() => { }); }, children: t('organizeSavedResponses') }), _jsxs("details", { children: [_jsxs("summary", { children: [t('pendingFactsDetails'), " \u00B7 ", pendingCount] }), pendingFacts.map(item => {
                                        if (!item || typeof item !== 'object' || !('responseId' in item) || typeof item.responseId !== 'string' || !('fields' in item) || !Array.isArray(item.fields))
                                            return null;
                                        const responseId = item.responseId;
                                        const labels = item.fields.flatMap(field => typeof field === 'string' && field in pendingLabels ? [t(pendingLabels[field])] : []);
                                        const kind = item.ownerKind === 'block' || item.ownerKind === 'worksheet' ? item.ownerKind : undefined;
                                        const ownerId = typeof item.ownerId === 'string' ? item.ownerId : undefined;
                                        const recordSubject = item.subject === 'math' || item.subject === 'chinese' || item.subject === 'english' ? item.subject : undefined;
                                        return _jsxs("section", { children: [_jsxs("p", { children: [recordSubject && `${t(recordSubject)} · `, typeof item.topic === 'string' ? item.topic : t('learnerAnswer')] }), _jsx("p", { children: labels.join(' · ') }), kind && ownerId && _jsx("button", { type: "button", disabled: disabled || running, onClick: () => { void tutor(pendingRecordPrompt(kind, ownerId, responseId)).catch(() => { }); }, children: t('verifySavedResponse') })] }, JSON.stringify([kind, ownerId, responseId]));
                                    }), pendingCount > pendingFacts.length && _jsx("p", { children: t('pendingFactsMore') })] })] })] })] });
}
function Growth({ study, curriculum, subject, goals, t }) {
    const weekly = study.weekly;
    return _jsxs(_Fragment, { children: [weekly && _jsxs("section", { children: [_jsx("h3", { children: t('weeklyTitle') }), _jsxs("p", { children: [t('weeklyTime'), ": ", weekly.minutesByDay.reduce((sum, item) => sum + item.minutes, 0), " ", t('minuteUnit'), " \u00B7 ", t('weeklyActiveDays'), " ", weekly.activeDays, "/7"] }), _jsxs("p", { children: [t('weeklyMastered'), " ", weekly.masteredGoals, " \u00B7 ", t('weeklyPractised'), " ", weekly.practisedGoals, " \u00B7 ", t('weeklyMistakesNew'), " ", weekly.newMistakes, " \u00B7 ", t('weeklyConsolidated'), " ", weekly.consolidatedMistakes] }), _jsxs("p", { children: [t('weeklyDueDone'), " ", weekly.dueCompletion.done, "/", weekly.dueCompletion.total, weekly.errorCauses.length > 0 ? ` · ${t('weeklyCauses')}: ${weekly.errorCauses.map(cause => `${t(cause.type)} ×${cause.count}`).join('、')}` : ''] })] }), _jsxs("p", { className: "student-muted", children: [t('stars'), ": ", study.stars, " \u00B7 ", t('starsHelp')] }), curriculum && curriculum.scope.current && _jsxs("section", { children: [_jsxs("h3", { children: [t('masteryOverview'), " \u00B7 ", t(subject)] }), _jsxs("p", { children: [t('levelMastered'), ": ", curriculum.summary.mastered, " \u00B7 ", t('levelPractising'), ": ", curriculum.summary.practising + curriculum.summary.stalled, " \u00B7 ", t('levelWeak'), ": ", curriculum.summary.weak + curriculum.summary.due, " \u00B7 ", t('levelUntouched'), ": ", curriculum.summary.untouched] }), _jsxs("details", { children: [_jsx("summary", { children: t('masteryDetails') }), curriculum.objectives.filter(item => item.attempts > 0 || item.activeMistakes > 0).map(item => _jsxs("p", { children: [item.title, " \u00B7 ", t(levelKeys[item.level]), " \u00B7 ", t('independent'), ": ", item.independentDays] }, item.id))] })] }), _jsxs("details", { className: "student-fold", children: [_jsxs("summary", { children: [t('evidence'), " \u00B7 ", t(subject)] }), study.progress.length === 0 && _jsx("p", { children: t('empty') }), study.progress.map(item => _jsxs("p", { children: [goals.find(goal => goal.id === item.objectiveId)?.title ?? item.topic, " \u00B7 ", t(item.level === 'independent-on-three-days' ? 'independent' : 'practising')] }, JSON.stringify([item.subject, item.topic, item.materialId, item.objectiveId]))), study.recentAttempts.map(item => _jsxs("details", { children: [_jsxs("summary", { children: [item.topic, " \u00B7 ", t(item.result)] }), _jsx("p", { children: item.prompt }), _jsx("p", { children: item.response }), _jsx("p", { children: item.result === 'unassessed' ? t('assessmentPending') : item.feedback }), _jsx("p", { children: item.answerEvidence })] }, item.id)), _jsx("p", { className: "student-muted", children: t('bounded') })] })] });
}
function LearningRecords({ context, goals, t, onReadMore }) {
    const value = context && typeof context === 'object' && !Array.isArray(context) ? context : undefined;
    const feedback = value && Array.isArray(value.officialFeedback) ? value.officialFeedback : [];
    const issues = value && Array.isArray(value.archiveIssues) ? value.archiveIssues : [];
    return _jsxs(_Fragment, { children: [goals.length === 0 && feedback.length === 0 && issues.length === 0 && _jsx("p", { children: t('empty') }), goals.length > 0 && _jsxs("section", { children: [_jsx("h3", { children: t('learningGoal') }), goals.map(goal => _jsxs("div", { children: [_jsxs("p", { children: [goal.title, " \u00B7 ", t(levelKeys[goal.level])] }), goal.scope && _jsx("p", { className: "student-muted", children: goal.scope.description }), goal.independentDays.length > 0 && _jsxs("p", { children: [t('independentDates'), ": ", goal.independentDays.join(' · ')] }), goal.firstMasteredDay && _jsxs("p", { children: [t('firstMasteredOn'), ": ", goal.firstMasteredDay] }), goal.recoveredDay && _jsxs("p", { children: [t('recoveredOn'), ": ", goal.recoveredDay] }), goal.baseline && _jsx("p", { className: "student-muted", children: t('referencedEvidence') })] }, goal.id))] }), feedback.length > 0 && _jsxs("section", { children: [_jsx("h3", { children: t('originalClassroomAnswers') }), _jsx("p", { className: "student-muted", children: t('officialFeedbackHelp') }), feedback.map((record, index) => {
                        if (!record || typeof record !== 'object' || Array.isArray(record))
                            return null;
                        const effective = record.result === 'correct' || record.result === 'partial' || record.result === 'incorrect' || record.result === 'stuck' ? record.result : 'unassessed';
                        const history = Array.isArray(record.officialHistory) ? record.officialHistory : [];
                        const official = record.official && typeof record.official === 'object' && !Array.isArray(record.official) ? record.official : undefined;
                        return _jsxs("details", { children: [_jsxs("summary", { children: [typeof record.prompt === 'string' ? record.prompt : t('learnerAnswer'), " \u00B7 ", t(effective)] }), _jsx("p", { children: t('learnerAnswer') }), _jsx("pre", { children: typeof record.rawResponse === 'string' ? record.rawResponse : '' }), _jsxs("p", { children: [t('effectiveAssessment'), ": ", t(effective)] }), _jsx("p", { children: typeof record.feedback === 'string' ? record.feedback : '' }), _jsx("p", { children: t(record.sourceStatus === 'known' ? 'verifiedAnswerSource' : 'answerSourceUnknown') }), (record.grading === 'conflict' || record.grading === 'pending') && _jsx("p", { children: t('assessmentPending') }), _jsx("p", { children: t(record.assistance === 'independent' || record.assistance === 'hint' || record.assistance === 'worked-example' ? assistKeys[record.assistance] : 'assistanceUnknown') }), _jsx("p", { children: record.answerDate && typeof record.answerDate === 'object' && !Array.isArray(record.answerDate) && record.answerDate.kind === 'day' && typeof record.answerDate.day === 'string' ? record.answerDate.day : record.answerDate && typeof record.answerDate === 'object' && !Array.isArray(record.answerDate) && record.answerDate.kind === 'instant' && typeof record.answerDate.at === 'number' ? day(record.answerDate.at) : t('answerDateUnknown') }), _jsx("h4", { children: t('officialAssessment') }), [...history, ...(official && !history.some(item => item && typeof item === 'object' && !Array.isArray(item) && item.seq === official.seq) ? [official] : [])].map((grade, gradeIndex) => {
                                    if (!grade || typeof grade !== 'object' || Array.isArray(grade))
                                        return null;
                                    const result = grade.result && typeof grade.result === 'object' && !Array.isArray(grade.result) ? grade.result : undefined;
                                    return _jsxs("div", { children: [_jsxs("p", { children: [t(result?.status === 'correct' ? 'correct' : result?.status === 'incorrect' ? 'incorrect' : 'unassessed'), typeof result?.earned === 'number' ? ` · ${result.earned}` : ''] }), _jsx("p", { children: typeof result?.aiComment === 'string' ? result.aiComment : '' })] }, typeof grade.seq === 'number' ? grade.seq : gradeIndex);
                                })] }, typeof record.responseId === 'string' ? record.responseId : index);
                    }), _jsx("button", { type: "button", onClick: onReadMore, children: t('readAnswerHistory') })] }), issues.length > 0 && _jsxs("section", { role: "status", children: [_jsx("h3", { children: t('archiveEvidencePending') }), _jsx("p", { children: t('archiveEvidenceHelp') }), _jsx("button", { type: "button", onClick: onReadMore, children: t('readAnswerHistory') })] })] });
}
//# sourceMappingURL=desk.js.map