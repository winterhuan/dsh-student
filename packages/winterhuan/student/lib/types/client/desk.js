import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { StudySubmissionError } from "./bridge.js";
import { TYPERT_REMOTE } from '@winterhuan/dsh-student/remote';
import { WorksheetCorrections } from "./worksheet-corrections.js";
import { ParentSettings } from "./forms.js";
import { useStudy } from "./workspace.js";
import { intensityKeys, levelKeys, subjects } from "./display.js";
import { IdeasView } from "./ideas-view.js";
import { MapView } from "./map-view.js";
import { PracticeView } from "./practice-view.js";
import { LessonsPanel, lessonsForSubject, openClassroom } from "./lessons-view.js";
import { continuePrompt, dailySheetPrompt, diagnosePrompt, dictationPrompt, dueClearPrompt, explorePrompt, goalPrompt, interestPracticePrompt, openmaicGeneratePrompt, openmaicRetryPrompt, openmaicReviewPrompt, organizePrompt, nativeIntentPrompt, previewPrompt, reviewPrompt, teachPrompt, teachQueuePrompt } from "./prompts.js";
import { TodayView } from "./today-view.js";
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
export function StudyDesk({ sessionId, visible, ask, running, t, useResource, remote }) {
    const [subject, setSubject] = useState(storedSubject);
    const [mistakeOffset, setMistakeOffset] = useState(0);
    const [mistakeStatus, setMistakeStatus] = useState('all');
    const [mapGrade, setMapGrade] = useState();
    const [mapTerm, setMapTerm] = useState();
    const [selectedConceptId, setSelectedConceptId] = useState('');
    const [intensities, setIntensities] = useState({});
    const [scopeChoice, setScopeChoice] = useState({});
    const [view, setView] = useState('student');
    const [parentTab, setParentTab] = useState('map');
    const [knowledgeView, setKnowledgeView] = useState('map');
    const scopeOf = (target) => scopeChoice[target] ?? {};
    const activeScope = scopeOf(subject);
    const showMap = view === 'parent' && parentTab === 'map' && knowledgeView === 'map';
    const tab = view === 'student' ? 'today' : parentTab === 'map' ? 'map' : parentTab === 'mistakes' ? 'mistakes' : 'parent';
    const showBook = view === 'parent' && (parentTab === 'map');
    const workspace = useStudy(sessionId, visible, t('networkError'), { tab, offset: mistakeOffset, subject, status: mistakeStatus, ...(showBook && mapGrade !== undefined ? { mapGrade } : {}), ...(showBook && mapTerm !== undefined ? { mapTerm } : {}), ...(activeScope.grade !== undefined ? { diagGrade: activeScope.grade } : {}), ...(activeScope.term !== undefined ? { diagTerm: activeScope.term } : {}), ...(activeScope.unit ? { diagUnit: activeScope.unit } : {}) }, useResource);
    const { data } = workspace;
    const [activity, setActivity] = useState({ subject: storedSubject(), mode: 'foundation' });
    const [selectedObjectiveId, setSelectedObjectiveId] = useState('');
    const [epoch, setEpoch] = useState(0);
    const [localNow, setLocalNow] = useState(Date.now());
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
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
            window.sessionStorage.setItem(`student:submissions:${sessionId}`, JSON.stringify(submissions.map(({ inspection: _inspection, ...item }) => item)));
        }
        catch { /* Mounted submission notices remain available when browser storage is blocked. */ }
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
        return { termId: workspace.termId, blockId: ownerId, questionId: task?.id, responseId: task?.responseId ?? responseIds.current.get(key) };
    }
    async function tutor(text = continuePrompt, photo, command, currentBlock = false) {
        const ids = identity(command);
        if (command?.action === 'answer' && submissions.some(item => item.response?.responseId === ids.responseId && item.admission === 'unknown' && !item.inspection)) {
            setSendError(t('messageUnknown'));
            throw new Error(t('messageUnknown'));
        }
        setSending(true);
        setSendError('');
        const active = data?.study?.active;
        const retainBlock = active && (currentBlock || command?.action === 'answer' || command?.action === 'hint' || command?.action === 'stuck' || command?.action === 'stop');
        const selection = retainBlock ? { subject: active.subject, goalId: data?.study?.task?.objectiveId, scope: active.scope } : { subject: command?.action === 'start' ? command.subject : subject, goalId: selectedObjectiveId || undefined, scope: command?.action === 'start' ? command.scope : scopeCommand(subject).scope };
        const intent = { nativeSessionId: sessionId, ...ids, selection, ...(command ? { operation: command } : {}), request: text.trim() === '' ? continuePrompt : text };
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
    async function change(command, _revision, _baseline) {
        await tutor(continuePrompt, undefined, command);
        if (!data)
            throw new Error(t('networkError'));
        return data;
    }
    async function manual(command, _revision, original) {
        if (!data || !workspace.termId || workspace.stale)
            throw new Error(t('manualInvalid'));
        const retained = original ? JSON.parse(original) : undefined;
        const beforeText = retained && typeof retained.baseline === 'string' ? retained.baseline : original;
        const editedNames = retained && Array.isArray(retained.editedFields) ? retained.editedFields : undefined;
        let intent;
        let baseline;
        if (command.action === 'setup') {
            const before = beforeText ? JSON.parse(beforeText) : data.study?.profile;
            const fields = Object.keys(command.profile).filter(field => field !== 'parentConfirmation' && (editedNames ? editedNames.includes(field) : command.profile[field] !== before?.[field]));
            intent = { kind: 'settings', command, editedProfileFields: fields };
            baseline = Object.fromEntries(fields.map(field => [`profile:${field}`, before?.[field] ?? null]));
        }
        else if (command.action === 'configure-course') {
            intent = { kind: 'settings', command };
            const before = beforeText ? JSON.parse(beforeText) : { course: data.study?.courses.find(item => item.subject === command.course.subject) };
            baseline = { [`material:${command.material.id}`]: null, [`course:${command.course.subject}`]: before.course ?? null };
        }
        else if (command.action === 'school-progress' || command.action === 'interests' || command.action === 'openmaic-settings') {
            intent = { kind: 'settings', command };
            if (command.action === 'school-progress' && beforeText)
                baseline = { [`progress:${command.subject}`]: JSON.parse(beforeText) };
            if (command.action === 'interests' && beforeText)
                baseline = { interests: JSON.parse(beforeText) };
            if (command.action === 'openmaic-settings')
                baseline = beforeText ? undefined : { openmaic: null };
        }
        else
            return change(command);
        const controller = new AbortController();
        const context = await remote.manualContext(sessionId, intent, controller.signal);
        if (!context.ok)
            throw new Error(context.error.message);
        if (!context.value.termId || context.value.termId !== workspace.termId)
            throw new Error(t('manualOldTerm'));
        if (command.action === 'openmaic-settings') {
            const current = context.value.baseline.openmaic;
            const currentBase = current && typeof current === 'object' && 'baseUrl' in current ? current.baseUrl : '';
            if (beforeText !== undefined && currentBase !== beforeText)
                throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(current)}`);
            baseline = context.value.baseline;
        }
        if (command.action === 'interests' && context.value.baseline.interests === null)
            baseline = { interests: null };
        const result = await remote.saveManual(sessionId, { termId: context.value.termId, expectedVersions: context.value.versions, baseline: baseline ?? context.value.baseline, intent }, controller.signal);
        if (!result.ok)
            throw new Error(result.error.message);
        if (result.value.status === 'conflict')
            throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(result.value.current)}`);
        if (result.value.status === 'old-term')
            throw new Error(t('manualOldTerm'));
        if (result.value.status !== 'saved' && result.value.status !== 'unchanged')
            throw new Error(result.value.reason ?? t('manualInvalid'));
        return Object.assign({}, data, { manual: result.value });
    }
    async function saveWorksheet(intent, baseline) {
        if (!workspace.termId || workspace.stale)
            throw new Error(t('manualInvalid'));
        const controller = new AbortController();
        const context = await remote.manualContext(sessionId, intent, controller.signal);
        if (!context.ok)
            throw new Error(context.error.message);
        if (context.value.termId !== workspace.termId)
            throw new Error(t('manualOldTerm'));
        const result = await remote.saveManual(sessionId, { termId: context.value.termId, expectedVersions: context.value.versions, baseline, intent }, controller.signal);
        if (!result.ok)
            throw new Error(result.error.message);
        if (result.value.status === 'conflict')
            throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(result.value.current)}`);
        if (result.value.status === 'old-term')
            throw new Error(t('manualOldTerm'));
        if (result.value.status !== 'saved' && result.value.status !== 'unchanged')
            throw new Error(result.value.reason ?? t('manualInvalid'));
        return result.value;
    }
    async function act(command, _withTutor = false, prompt = continuePrompt) {
        try {
            await tutor(prompt, undefined, command);
        }
        catch { /* The request or tutor notice retains the failed action and its data. */ }
    }
    function selectSubject(item) { setSubject(item); storeSubject(item); }
    const now = Math.max(localNow + workspace.offset.current, data?.serverNow ?? 0);
    const study = data?.study;
    const subjectLoading = !!study && study.confirmedSubject !== subject;
    const disabled = sending || workspace.stale;
    const active = study?.active;
    useEffect(() => {
        if (active) {
            selectSubject(active.subject);
            setActivity({ subject: active.subject, mode: active.mode });
        }
    }, [active?.id]);
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
        setView('student');
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
        setView('student');
        return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: 'diagnose', intensity, ...(scoped ? scopeCommand(target) : {}) }, true, diagnosePrompt(intensity, ids, t));
    }
    function start(target, mode, inquiry) {
        if (mode === 'diagnose')
            return startDiagnosis(target, chosenIntensity(target));
        const next = resolveMode(target, mode);
        const prompt = next === 'review' ? reviewPrompt : next === 'explore' ? explorePrompt(inquiry) : selectedObjectiveId ? goalPrompt(selectedObjectiveId) : continuePrompt;
        return act({ action: 'start', id: crypto.randomUUID(), subject: target, mode: next, ...((next === 'foundation' || next === 'school') ? scopeCommand(target) : {}) }, true, prompt);
    }
    function lessonRequest() {
        const recommendation = study?.recommendation;
        const objectiveId = selectedObjectiveId || recommendation?.objectiveId || undefined;
        const subjectKey = selectedObjectiveId ? subject : recommendation?.objectiveId ? recommendation.subject : subject;
        const progress = study?.courses.find(item => item.subject === subjectKey)?.progress;
        const unitName = recommendation?.objectiveId ? recommendation.unitName : (progress ? curriculum?.units.find(unit => unit.id === progress.unitId)?.name : undefined);
        return {
            objectiveId,
            unitName,
            subjectLabel: t(subjectKey),
            tags: study?.interests ?? [],
            focus: study?.interestFocus ?? '',
        };
    }
    function startInterest() {
        const recommendation = study?.recommendation;
        if (selectedObjectiveId) {
            void start(subject, 'foundation');
            return;
        }
        if (!recommendation || recommendation.kind === 'hold' || !study)
            return;
        const mode = resolveMode(recommendation.subject, 'foundation');
        const request = lessonRequest();
        selectSubject(recommendation.subject);
        setActivity({ subject: recommendation.subject, mode });
        setSelectedObjectiveId(recommendation.objectiveId ?? '');
        setMistakeOffset(0);
        const teaching = recommendation.reason.code === 'needs-teaching' || recommendation.reason.code === 'prerequisite-gap';
        const scene = interestPracticePrompt(request.objectiveId, request.tags, request.focus, request.unitName);
        const prompt = teaching && recommendation.objectiveId ? `${teachPrompt(recommendation.objectiveId)}${scene}` : scene;
        void act({ action: 'start', id: crypto.randomUUID(), subject: recommendation.subject, mode }, true, prompt);
    }
    function startDue() {
        const items = study?.dueToday ?? [];
        const first = items[0];
        if (!study || !first)
            return;
        selectSubject(first.subject);
        setActivity({ subject: first.subject, mode: 'review' });
        setSelectedObjectiveId('');
        setMistakeOffset(0);
        void act({ action: 'start', id: crypto.randomUUID(), subject: first.subject, mode: 'review' }, true, dueClearPrompt(items.map(item => item.id)));
    }
    function startRecommended() {
        const recommendation = study?.recommendation;
        if (!recommendation || recommendation.kind === 'hold' || !study)
            return;
        if (recommendation.kind === 'diagnose') {
            void startDiagnosis(recommendation.subject, chosenIntensity(recommendation.subject));
            return;
        }
        const mode = recommendation.kind === 'review' ? 'review' : resolveMode(recommendation.subject, 'foundation');
        selectSubject(recommendation.subject);
        setActivity({ subject: recommendation.subject, mode });
        setSelectedObjectiveId(mode === 'review' ? '' : recommendation.objectiveId ?? '');
        setMistakeOffset(0);
        const teaching = recommendation.reason.code === 'needs-teaching';
        const prompt = recommendation.kind === 'review' ? reviewPrompt : teaching && recommendation.objectiveId ? teachPrompt(recommendation.objectiveId) : teaching ? teachQueuePrompt(recommendation.title ?? '') : recommendation.kind === 'preview' && recommendation.objectiveId ? previewPrompt(recommendation.objectiveId) : recommendation.objectiveId ? goalPrompt(recommendation.objectiveId) : continuePrompt;
        void act({ action: 'start', id: crypto.randomUUID(), subject: recommendation.subject, mode }, true, prompt);
    }
    const nativeT = key => ['saved', 'gradesSaved', 'confirmPaperDone', 'teachQueued', 'workbookSaved'].includes(key) ? t('intentAdmitted') : t(key);
    const parentSettings = view === 'parent' && parentTab === 'parent';
    const draftScope = `student:draft:${sessionId}:${workspace.termId ?? 'setup'}`;
    const context = workspace.context;
    const pendingFacts = context && typeof context === 'object' && 'pendingFacts' in context && Array.isArray(context.pendingFacts) ? context.pendingFacts : [];
    const pendingLabels = { answerDate: 'answerDateUnknown', assistance: 'assistanceUnknown', source: 'answerSourceUnknown', answerBasis: 'answerBasisUnknown', objectiveId: 'answerGoalUnknown' };
    return _jsxs("main", { className: "student-desk", "aria-label": t('title'), children: [_jsxs("header", { className: "student-top", children: [_jsxs("nav", { className: "student-views", "aria-label": t('title'), children: [_jsx("button", { type: "button", "aria-pressed": view === 'student', onClick: () => setView('student'), children: t('today') }), _jsx("button", { type: "button", "aria-pressed": view === 'parent', onClick: () => setView('parent'), children: t('parentView') })] }), view === 'parent' && _jsxs("nav", { className: "student-tabs", "aria-label": t('parentView'), children: [_jsx("button", { type: "button", "aria-pressed": parentTab === 'map', onClick: () => setParentTab('map'), children: t('parentProgress') }), _jsxs("button", { type: "button", "aria-label": t('mistakes'), "aria-pressed": parentTab === 'mistakes', onClick: () => setParentTab('mistakes'), children: [t('parentPractice'), study && study.dueTotal > 0 ? ` · ${study.dueTotal}` : ''] }), _jsx("button", { type: "button", "aria-pressed": parentTab === 'parent', onClick: () => setParentTab('parent'), children: t('parentProfile') })] }), _jsxs("div", { className: "student-toolbar", children: [study && !parentSettings && _jsx("nav", { className: "student-subjects", "aria-label": t('subject'), children: subjects.map(item => _jsx("button", { type: "button", "aria-pressed": subject === item, onClick: () => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }); setSelectedObjectiveId(''); setMistakeOffset(0); setMistakeStatus('all'); }, children: t(item) }, item)) }), _jsx("button", { type: "button", className: "student-quiet", disabled: sending, onClick: () => { setEpoch(value => value + 1); }, children: t('reload') })] })] }), workspace.error && _jsx("p", { role: "alert", children: t('staleData') }), sendError && _jsx("p", { role: "alert", children: sendError }), study && pendingFacts.length > 0 && _jsxs("section", { "aria-label": t('pendingFacts'), children: [_jsx("h3", { children: t('pendingFacts') }), pendingFacts.map(item => {
                        if (!item || typeof item !== 'object' || !('responseId' in item) || typeof item.responseId !== 'string' || !('fields' in item) || !Array.isArray(item.fields))
                            return null;
                        const labels = item.fields.flatMap(field => typeof field === 'string' && field in pendingLabels ? [t(pendingLabels[field])] : []);
                        return _jsxs("p", { children: [item.responseId, " \u00B7 ", labels.join(' · ')] }, JSON.stringify([item.ownerId, item.responseId]));
                    })] }), submissions.length > 0 && _jsxs("details", { className: "student-fold", children: [_jsx("summary", { children: t('submissionStatus') }), submissions.map(item => _jsxs("div", { children: [_jsx("p", { children: t(item.admission === 'accepted' ? 'messageAdmitted' : 'messageUnknown') }), item.response && _jsxs("p", { children: [t(item.inspection?.answer === 'saved' ? 'answerSaved' : 'answerPending'), " \u00B7 ", t(item.inspection?.assessment === 'valid' ? 'assessmentSaved' : 'assessmentPending')] }), _jsx("button", { type: "button", disabled: sending, onClick: () => { const controller = new AbortController(); void remote.inspectSubmission(sessionId, { requestId: item.requestId, ...(item.response ? { response: item.response } : {}) }, controller.signal).then(reply => { if (!reply.ok)
                                    throw new Error(reply.error.message); const result = reply.value; setSubmissions(previous => previous.map(current => current.requestId === item.requestId ? { ...current, admission: result.admission, inspection: result } : current)); }).catch(reason => setSendError(reason instanceof Error ? reason.message : t('networkError'))); }, children: t('inspectSubmission') })] }, item.requestId))] }), !data ? !workspace.error && _jsx("progress", { "aria-label": t('busy') }) : !study && view !== 'parent' ? _jsxs("section", { children: [_jsx("p", { children: t('setupFirst') }), _jsx("button", { disabled: sending, onClick: () => { void tutor(t('setupIntent')).catch(() => { }); }, children: t('setupConversation') })] }) : subjectLoading && !parentSettings ? _jsx("progress", { "aria-label": t('busy') }) : _jsxs(_Fragment, { children: [study && view === 'student' && _jsx(TodayView, { draftScope: draftScope, study: study, subject: subject, activity: activity, setActivity: setActivity, goal: goals.find(item => item.id === selectedObjectiveId), clearGoal: () => setSelectedObjectiveId(''), curriculum: curriculum, selectedObjectiveId: selectedObjectiveId, chooseGoal: chooseGoal, intensityLabel: `${t(intensityKeys[chosenIntensity(subject)])} · ${planOf(subject)?.samples[chosenIntensity(subject)].length ?? 0}`, openParent: () => { setView('parent'); setParentTab('parent'); }, openCheckins: () => { setView('parent'); setParentTab('map'); }, scope: activeScope, setScope: next => setScopeChoice(previous => ({ ...previous, [subject]: next })), scopeUnits: study.scopedUnits ?? [], start: start, startRecommended: startRecommended, startDiagnosis: startDiagnosis, chosenIntensity: chosenIntensity(subject), disabled: disabled, running: running, act: act, tutor: (text, currentBlock) => tutor(text, undefined, undefined, currentBlock), t: t, prompts: { daily: dailySheetPrompt(subject), dictation: dictationPrompt(subject) }, lessons: lessonsForSubject(data.interactiveLessons?.lessons ?? [], subject), onInterestPractice: startInterest, onOpenLesson: () => { const request = lessonRequest(); void tutor(openmaicGeneratePrompt(request.subjectLabel, request.objectiveId, request.tags, request.focus, request.unitName)).catch(() => { }); }, onClearDue: startDue, onOpenClassroom: openClassroom }), study && view === 'student' && data.interactiveLessons && _jsx(LessonsPanel, { lessons: lessonsForSubject(data.interactiveLessons.lessons, subject), ...(data.interactiveLessons.error !== undefined ? { error: data.interactiveLessons.error } : {}), disabled: disabled, running: running, t: t, onRetry: runId => { void tutor(openmaicRetryPrompt(runId)).catch(() => { }); }, onReview: classroomId => { void tutor(openmaicReviewPrompt(classroomId)).catch(() => { }); } }), study && view === 'parent' && parentTab === 'map' && _jsxs("nav", { className: "student-segments", "aria-label": t('parentProgress'), children: [_jsx("button", { type: "button", "aria-pressed": knowledgeView === 'map', onClick: () => setKnowledgeView('map'), children: t('map') }), _jsx("button", { type: "button", "aria-pressed": knowledgeView === 'ideas', onClick: () => setKnowledgeView('ideas'), children: t('ideas') })] }), study && showMap && _jsx(MapView, { study: study, curriculum: curriculum, subject: subject, selectedConceptId: selectedConceptId, setSelectedConceptId: setSelectedConceptId, selectedObjectiveId: selectedObjectiveId, clearGoal: () => setSelectedObjectiveId(''), chooseGoal: chooseGoal, active: !!active, scopeGrade: scopeGrade, scopeTerm: scopeTerm, setMapGrade: setMapGrade, setMapTerm: setMapTerm, clearBrowse: () => { setMapGrade(undefined); setMapTerm(undefined); }, intensities: intensities, setIntensity: (target, level) => setIntensities(previous => ({ ...previous, [target]: level })), scopeOf: scopeOf, setScope: (target, next) => setScopeChoice(previous => ({ ...previous, [target]: next })), selectSubject: selectSubject, startDiagnosis: startDiagnosis, disabled: disabled, running: running, organize: () => { void tutor(organizePrompt(subject)).catch(() => { }); }, change: command => change(command).then(() => undefined), t: t }), study && view === 'parent' && parentTab === 'map' && knowledgeView === 'ideas' && _jsx(IdeasView, { study: study, curriculum: curriculum, t: t, onOpenConcept: id => { setSelectedConceptId(id); setKnowledgeView('map'); } }), study && view === 'parent' && parentTab === 'mistakes' && _jsx(PracticeView, { study: study, now: now, subject: subject, goals: goals, mistakeStatus: mistakeStatus, setMistakeStatus: setMistakeStatus, setMistakeOffset: setMistakeOffset, revision: data.revision, disabled: disabled, running: running, change: change, ask: tutor, onReview: item => { selectSubject(item); setActivity({ subject: item, mode: 'review' }); setSelectedObjectiveId(''); setView('student'); }, epoch: epoch, t: nativeT }), study && view === 'parent' && parentTab === 'mistakes' && workspace.termId && _jsx(WorksheetCorrections, { sessionId: sessionId, termId: workspace.termId, draftScope: draftScope, useResource: useResource, save: saveWorksheet, disabled: disabled, t: t }, draftScope), parentSettings && _jsxs("section", { children: [_jsx("button", { type: "button", disabled: disabled, onClick: () => { void tutor(t('setupIntent')).catch(() => { }); }, children: t('profileConversation') }), _jsx("button", { type: "button", disabled: disabled, onClick: () => { void tutor(t('courseConversation')).catch(() => { }); }, children: t('courseConversation') }), _jsx("button", { type: "button", disabled: disabled, onClick: () => { void tutor(t('archiveConversation')).catch(() => { }); }, children: t('archiveConversation') })] }), parentSettings && study && _jsxs("details", { className: "student-fold", children: [_jsx("summary", { children: t('manualForms') }), _jsx("p", { children: t('manualSummary') }), _jsx(ParentSettings, { draftScope: draftScope, observation: workspace.value?.versions.find(file => file.path === '.study/settings.json')?.version, data: data, change: manual, t: t, curriculum: curriculum, subject: subject, onSubject: item => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }); } }, draftScope + subject)] }), study && parentSettings && _jsx(Growth, { study: study, curriculum: curriculum, subject: subject, goals: goals, t: t })] })] });
}
function Growth({ study, curriculum, subject, goals, t }) {
    const weekly = study.weekly;
    return _jsxs(_Fragment, { children: [weekly && _jsxs("section", { children: [_jsx("h3", { children: t('weeklyTitle') }), _jsxs("p", { children: [t('weeklyTime'), ": ", weekly.minutesByDay.reduce((sum, item) => sum + item.minutes, 0), " ", t('minuteUnit'), " \u00B7 ", t('weeklyActiveDays'), " ", weekly.activeDays, "/7"] }), _jsxs("p", { children: [t('weeklyMastered'), " ", weekly.masteredGoals, " \u00B7 ", t('weeklyPractised'), " ", weekly.practisedGoals, " \u00B7 ", t('weeklyMistakesNew'), " ", weekly.newMistakes, " \u00B7 ", t('weeklyConsolidated'), " ", weekly.consolidatedMistakes] }), _jsxs("p", { children: [t('weeklyDueDone'), " ", weekly.dueCompletion.done, "/", weekly.dueCompletion.total, weekly.errorCauses.length > 0 ? ` · ${t('weeklyCauses')}: ${weekly.errorCauses.map(cause => `${t(cause.type)} ×${cause.count}`).join('、')}` : ''] })] }), _jsxs("section", { children: [_jsxs("h3", { children: [t('stars'), ": ", study.stars] }), _jsx("p", { children: t('starsHelp') })] }), curriculum && curriculum.scope.current && _jsxs("section", { children: [_jsxs("h3", { children: [t('masteryOverview'), " \u00B7 ", t(subject)] }), _jsxs("p", { children: [t('levelMastered'), ": ", curriculum.summary.mastered, " \u00B7 ", t('levelPractising'), ": ", curriculum.summary.practising + curriculum.summary.stalled, " \u00B7 ", t('levelWeak'), ": ", curriculum.summary.weak + curriculum.summary.due, " \u00B7 ", t('levelUntouched'), ": ", curriculum.summary.untouched] }), curriculum.objectives.filter(item => item.attempts > 0 || item.activeMistakes > 0).map(item => _jsxs("p", { children: [item.title, " \u00B7 ", t(levelKeys[item.level]), " \u00B7 ", t('independent'), ": ", item.independentDays] }, item.id))] }), _jsxs("section", { children: [_jsx("h3", { children: t('evidence') }), study.progress.length === 0 && _jsx("p", { children: t('empty') }), study.progress.map(item => _jsxs("p", { children: [goals.find(goal => goal.id === item.objectiveId)?.title ?? item.topic, " \u00B7 ", t(item.level === 'independent-on-three-days' ? 'independent' : 'practising')] }, JSON.stringify([item.subject, item.topic, item.materialId, item.objectiveId]))), study.recentAttempts.map(item => _jsxs("details", { children: [_jsxs("summary", { children: [item.topic, " \u00B7 ", t(item.result)] }), _jsx("p", { children: item.prompt }), _jsx("p", { children: item.response }), _jsx("p", { children: item.feedback }), _jsx("p", { children: item.answerEvidence })] }, item.id))] }), _jsx("p", { children: t('bounded') })] });
}
//# sourceMappingURL=desk.js.map