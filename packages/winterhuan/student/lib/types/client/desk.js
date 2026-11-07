import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ParentSettings } from "./forms.js";
import { useStudy } from "./workspace.js";
import { intensityKeys, levelKeys, subjects } from "./display.js";
import { IdeasView } from "./ideas-view.js";
import { MapView } from "./map-view.js";
import { PracticeView } from "./practice-view.js";
import { LessonsPanel, lessonsForSubject, openClassroom } from "./lessons-view.js";
import { continuePrompt, dailySheetPrompt, diagnosePrompt, dictationPrompt, dueClearPrompt, explorePrompt, goalPrompt, interestPracticePrompt, openmaicGeneratePrompt, openmaicRetryPrompt, openmaicReviewPrompt, organizePrompt, previewPrompt, reviewPrompt, teachPrompt, teachQueuePrompt } from "./prompts.js";
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
export function StudyDesk({ sessionId, visible, ask, running, t }) {
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
    const scopeOf = (target) => scopeChoice[target] ?? {};
    const activeScope = scopeOf(subject);
    const showMap = view === 'parent' && parentTab === 'map';
    const tab = view === 'student' ? 'today' : parentTab === 'map' || parentTab === 'ideas' ? 'map' : parentTab === 'mistakes' ? 'mistakes' : 'parent';
    const showBook = view === 'parent' && (parentTab === 'map' || parentTab === 'ideas');
    const workspace = useStudy(sessionId, visible, t('networkError'), { tab, offset: mistakeOffset, subject, status: mistakeStatus, ...(showBook && mapGrade !== undefined ? { mapGrade } : {}), ...(showBook && mapTerm !== undefined ? { mapTerm } : {}), ...(activeScope.grade !== undefined ? { diagGrade: activeScope.grade } : {}), ...(activeScope.term !== undefined ? { diagTerm: activeScope.term } : {}), ...(activeScope.unit ? { diagUnit: activeScope.unit } : {}) });
    const { data, busy, change } = workspace;
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
    async function tutor(text = continuePrompt, photo) {
        setSending(true);
        setSendError('');
        try {
            await ask(text.trim() === '' ? continuePrompt : text, photo);
        }
        catch (reason) {
            setSendError(reason instanceof Error ? reason.message : t('sendError'));
            throw reason;
        }
        finally {
            setSending(false);
        }
    }
    async function act(command, withTutor = false, prompt = continuePrompt) {
        try {
            await change(command);
            if (withTutor)
                await tutor(prompt);
        }
        catch { /* The request or tutor notice retains the failed action and its data. */ }
    }
    function selectSubject(item) { setSubject(item); storeSubject(item); }
    const now = Math.max(localNow + workspace.offset.current, data?.serverNow ?? 0);
    const study = data?.study;
    const subjectLoading = !!study && study.confirmedSubject !== subject;
    const disabled = busy || sending;
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
        const objectiveId = recommendation?.objectiveId || selectedObjectiveId || undefined;
        const subjectKey = recommendation?.objectiveId ? recommendation.subject : subject;
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
    const parentSettings = view === 'parent' && parentTab === 'parent';
    return _jsxs("main", { className: "student-desk", "aria-label": t('title'), children: [_jsxs("header", { className: "student-top", children: [_jsxs("nav", { className: "student-views", "aria-label": t('title'), children: [_jsx("button", { type: "button", "aria-pressed": view === 'student', onClick: () => setView('student'), children: t('today') }), _jsx("button", { type: "button", "aria-pressed": view === 'parent', onClick: () => setView('parent'), children: t('parentView') })] }), view === 'parent' && _jsxs("nav", { className: "student-tabs", "aria-label": t('parentView'), children: [_jsx("button", { type: "button", "aria-pressed": parentTab === 'map', onClick: () => setParentTab('map'), children: t('map') }), _jsx("button", { type: "button", "aria-pressed": parentTab === 'ideas', onClick: () => setParentTab('ideas'), children: t('ideas') }), _jsxs("button", { type: "button", "aria-label": t('mistakes'), "aria-pressed": parentTab === 'mistakes', onClick: () => setParentTab('mistakes'), children: [t('mistakes'), study && study.dueTotal > 0 ? ` · ${study.dueTotal}` : ''] }), _jsx("button", { type: "button", "aria-pressed": parentTab === 'parent', onClick: () => setParentTab('parent'), children: t('parent') })] }), _jsxs("div", { className: "student-toolbar", children: [study && !parentSettings && _jsx("nav", { className: "student-subjects", "aria-label": t('subject'), children: subjects.map(item => _jsx("button", { type: "button", "aria-pressed": subject === item, onClick: () => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }); setSelectedObjectiveId(''); setMistakeOffset(0); setMistakeStatus('all'); }, children: t(item) }, item)) }), _jsx("button", { type: "button", className: "student-quiet", disabled: disabled, onClick: () => { void workspace.reload().then(() => setEpoch(value => value + 1)); }, children: t('reload') })] })] }), workspace.error && _jsx("p", { role: "alert", children: workspace.error }), sendError && _jsx("p", { role: "alert", children: sendError }), !data ? !workspace.error && _jsx("progress", { "aria-label": t('busy') }) : !study && view !== 'parent' ? _jsxs("section", { children: [_jsx("p", { children: t('setupFirst') }), _jsx("button", { onClick: () => { setView('parent'); setParentTab('parent'); }, children: t('parent') })] }) : subjectLoading && !parentSettings ? _jsx("progress", { "aria-label": t('busy') }) : _jsxs(_Fragment, { children: [study && view === 'student' && _jsx(TodayView, { study: study, subject: subject, activity: activity, setActivity: setActivity, goal: goals.find(item => item.id === selectedObjectiveId), clearGoal: () => setSelectedObjectiveId(''), curriculum: curriculum, selectedObjectiveId: selectedObjectiveId, chooseGoal: chooseGoal, intensityLabel: `${t(intensityKeys[chosenIntensity(subject)])} · ${planOf(subject)?.samples[chosenIntensity(subject)].length ?? 0}`, openParent: () => { setView('parent'); setParentTab('parent'); }, openCheckins: () => { setView('parent'); setParentTab('map'); }, scope: activeScope, setScope: next => setScopeChoice(previous => ({ ...previous, [subject]: next })), scopeUnits: study.scopedUnits ?? [], start: start, startRecommended: startRecommended, startDiagnosis: startDiagnosis, chosenIntensity: chosenIntensity(subject), disabled: disabled, running: running, act: act, tutor: tutor, t: t, prompts: { daily: dailySheetPrompt(subject), dictation: dictationPrompt(subject) }, lessons: lessonsForSubject(data.interactiveLessons?.lessons ?? [], subject), onInterestPractice: startInterest, onOpenLesson: () => { const request = lessonRequest(); void tutor(openmaicGeneratePrompt(request.subjectLabel, request.objectiveId, request.tags, request.focus, request.unitName)).catch(() => { }); }, onClearDue: startDue, onOpenClassroom: openClassroom }), study && view === 'student' && data.interactiveLessons && _jsx(LessonsPanel, { lessons: lessonsForSubject(data.interactiveLessons.lessons, subject), ...(data.interactiveLessons.error !== undefined ? { error: data.interactiveLessons.error } : {}), disabled: disabled, running: running, t: t, onRetry: runId => { void tutor(openmaicRetryPrompt(runId)).catch(() => { }); }, onReview: classroomId => { void tutor(openmaicReviewPrompt(classroomId)).catch(() => { }); } }), study && showMap && _jsx(MapView, { study: study, curriculum: curriculum, subject: subject, selectedConceptId: selectedConceptId, setSelectedConceptId: setSelectedConceptId, selectedObjectiveId: selectedObjectiveId, clearGoal: () => setSelectedObjectiveId(''), chooseGoal: chooseGoal, active: !!active, scopeGrade: scopeGrade, scopeTerm: scopeTerm, setMapGrade: setMapGrade, setMapTerm: setMapTerm, clearBrowse: () => { setMapGrade(undefined); setMapTerm(undefined); }, intensities: intensities, setIntensity: (target, level) => setIntensities(previous => ({ ...previous, [target]: level })), scopeOf: scopeOf, setScope: (target, next) => setScopeChoice(previous => ({ ...previous, [target]: next })), selectSubject: selectSubject, startDiagnosis: startDiagnosis, disabled: disabled, running: running, organize: () => { void tutor(organizePrompt(subject)).catch(() => { }); }, change: command => change(command).then(() => undefined), t: t }), study && view === 'parent' && parentTab === 'ideas' && _jsx(IdeasView, { study: study, curriculum: curriculum, t: t, onOpenConcept: id => { setSelectedConceptId(id); setParentTab('map'); } }), study && view === 'parent' && parentTab === 'mistakes' && _jsx(PracticeView, { study: study, now: now, subject: subject, goals: goals, mistakeStatus: mistakeStatus, setMistakeStatus: setMistakeStatus, setMistakeOffset: setMistakeOffset, revision: data.revision, disabled: disabled, running: running, change: change, ask: tutor, onReview: item => { selectSubject(item); setActivity({ subject: item, mode: 'review' }); setSelectedObjectiveId(''); setView('student'); }, epoch: epoch, t: t }), parentSettings && _jsx(ParentSettings, { data: data, change: change, t: t, curriculum: curriculum, subject: subject, onSubject: item => { selectSubject(item); setActivity({ subject: item, mode: 'foundation' }); } }, epoch), study && parentSettings && _jsx(Growth, { study: study, curriculum: curriculum, subject: subject, goals: goals, t: t })] })] });
}
function Growth({ study, curriculum, subject, goals, t }) {
    const weekly = study.weekly;
    return _jsxs(_Fragment, { children: [weekly && _jsxs("section", { children: [_jsx("h3", { children: t('weeklyTitle') }), _jsxs("p", { children: [t('weeklyTime'), ": ", weekly.minutesByDay.reduce((sum, item) => sum + item.minutes, 0), " ", t('minuteUnit'), " \u00B7 ", t('weeklyActiveDays'), " ", weekly.activeDays, "/7"] }), _jsxs("p", { children: [t('weeklyMastered'), " ", weekly.masteredGoals, " \u00B7 ", t('weeklyPractised'), " ", weekly.practisedGoals, " \u00B7 ", t('weeklyMistakesNew'), " ", weekly.newMistakes, " \u00B7 ", t('weeklyConsolidated'), " ", weekly.consolidatedMistakes] }), _jsxs("p", { children: [t('weeklyDueDone'), " ", weekly.dueCompletion.done, "/", weekly.dueCompletion.total, weekly.errorCauses.length > 0 ? ` · ${t('weeklyCauses')}: ${weekly.errorCauses.map(cause => `${t(cause.type)} ×${cause.count}`).join('、')}` : ''] })] }), _jsxs("section", { children: [_jsxs("h3", { children: [t('stars'), ": ", study.stars] }), _jsx("p", { children: t('starsHelp') })] }), curriculum && curriculum.scope.current && _jsxs("section", { children: [_jsxs("h3", { children: [t('masteryOverview'), " \u00B7 ", t(subject)] }), _jsxs("p", { children: [t('levelMastered'), ": ", curriculum.summary.mastered, " \u00B7 ", t('levelPractising'), ": ", curriculum.summary.practising + curriculum.summary.stalled, " \u00B7 ", t('levelWeak'), ": ", curriculum.summary.weak + curriculum.summary.due, " \u00B7 ", t('levelUntouched'), ": ", curriculum.summary.untouched] }), curriculum.objectives.filter(item => item.attempts > 0 || item.activeMistakes > 0).map(item => _jsxs("p", { children: [item.title, " \u00B7 ", t(levelKeys[item.level]), " \u00B7 ", t('independent'), ": ", item.independentDays] }, item.id))] }), _jsxs("section", { children: [_jsx("h3", { children: t('evidence') }), study.progress.length === 0 && _jsx("p", { children: t('empty') }), study.progress.map(item => _jsxs("p", { children: [goals.find(goal => goal.id === item.objectiveId)?.title ?? item.topic, " \u00B7 ", t(item.level === 'independent-on-three-days' ? 'independent' : 'practising')] }, JSON.stringify([item.subject, item.topic, item.materialId, item.objectiveId]))), study.recentAttempts.map(item => _jsxs("details", { children: [_jsxs("summary", { children: [item.topic, " \u00B7 ", t(item.result)] }), _jsx("p", { children: item.prompt }), _jsx("p", { children: item.response }), _jsx("p", { children: item.feedback }), _jsx("p", { children: item.answerEvidence })] }, item.id))] }), _jsx("p", { children: t('bounded') })] });
}
//# sourceMappingURL=desk.js.map