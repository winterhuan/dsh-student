import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { formDraftKey } from "./drafts.js";
import { FigureView } from "./figure-view.js";
import { classroomUrl } from "./lessons-view.js";
import { feynmanPrompt, hintPromptFor, stuckPrompt } from "./prompts.js";
import css from './desk.module.css';
/** The active activity keeps one question, its original answer and the next permitted action. */
export function TodayView({ nextAction, legalActions, onAction, learnerId, termId, classroomBindingId, onContinue, study, openParent, disabled, pending, running, act, tutor, t, lessons, onOpenClassroom, onHome, onPause, onStop, draftScope, legacyDraftScope, useStore, actions }) {
    const active = study.active;
    const task = study.task?.sessionId === active?.id ? study.task : undefined;
    const matches = (item) => !!active && !!learnerId && !!termId && item.learnerId === learnerId && item.termId === termId && item.blockId === active.id;
    const generating = lessons.find(item => item.status === 'generating' && matches(item));
    const ready = lessons.find(item => item.status === 'ready' && matches(item) && classroomUrl(item.url) && item.feedback?.goalId === nextAction?.goalId && JSON.stringify(item.feedback?.scope) === JSON.stringify(nextAction?.scope) && (nextAction?.kind === 'answer' && nextAction.questionId === task?.id && item.feedback?.bindingId === classroomBindingId || nextAction?.kind === 'learn' && !task));
    const primaryAction = nextAction?.kind === 'hold' ? legalActions.includes('resume-round') ? 'resume-round' : legalActions.includes('request-teaching') ? 'request-teaching' : legalActions.includes('sync-feedback') ? 'sync-feedback' : legalActions.includes('verify-source') ? 'verify-source' : undefined : undefined;
    const needsParent = nextAction?.reason === 'confirmed-scope-required';
    const awaitingAnswer = task && task.response === undefined && nextAction?.kind === 'answer' && nextAction.questionId === task.id && !ready;
    const waitingForAssessment = nextAction?.kind === 'assess' && (running || pending);
    const blocked = disabled || running || pending;
    return _jsxs(_Fragment, { children: [_jsxs("div", { className: css.statusHeading, children: [_jsxs("p", { children: [study.profile.nickname, " \u00B7 ", t('learningNow'), active ? ` · ${t(active.subject)}` : ''] }), _jsx("button", { type: "button", onClick: onHome, children: t('backHome') })] }), _jsxs("section", { className: "student-plan", children: [_jsx("h3", { children: nextAction?.title ?? task?.topic ?? t('learningGoal') }), nextAction && _jsx("p", { className: "student-muted", children: t(continuationReasons[nextAction.reason]) }), !awaitingAnswer && !waitingForAssessment && _jsx("button", { type: "button", className: "student-primary", disabled: blocked || !nextAction || nextAction.kind === 'hold' && !needsParent && !primaryAction, onClick: needsParent ? openParent : primaryAction ? () => onAction(primaryAction) : ready ? () => onOpenClassroom(ready.id) : onContinue, children: t(ready ? 'goToClass' : needsParent ? 'confirmLearningScope' : primaryAction === 'resume-round' ? 'resumeRound' : primaryAction === 'request-teaching' ? 'requestTeaching' : primaryAction === 'sync-feedback' || primaryAction === 'verify-source' ? 'retryFeedbackSync' : 'continueLearning') })] }), nextAction?.source?.kind === 'openmaic' && _jsx("p", { role: "status", children: t(sourceNotice(nextAction.source.verification)) }), generating && _jsxs("p", { role: "status", children: [t('openmaicGenerating'), " \u00B7 ", generating.title] }), task && _jsx("section", { className: "student-focus", children: _jsx(Task, { useStore: useStore, actions: actions, draftScope: draftScope, legacyDraftScope: legacyDraftScope, study: study, goalTitle: nextAction?.title ?? goalTitle(study, task.objectiveId), goalText: undefined, disabled: blocked || nextAction?.kind === 'hold', t: t, act: act, tutor: tutor }, `${task.sessionId}:${task.id}`) }), (running || pending) && _jsx("p", { role: "status", children: t('tutorWorking') }), _jsx("p", { className: "student-muted", children: t('chatHelp') }), _jsxs("div", { className: css.practiceActions, children: [_jsx("button", { type: "button", disabled: disabled, onClick: onPause, children: t('pauseLearning') }), _jsx("button", { type: "button", disabled: disabled, onClick: onStop, children: t('finishToday') }), _jsx("button", { type: "button", onClick: onHome, children: t('changeContent') })] })] });
}
export const continuationReasons = { 'unfinished-question': 'continueCurrentQuestion', 'pending-assessment': 'continuePendingAnswer', 'missing-evidence': 'continueMissingEvidence', 'current-gap': 'continueCurrentGap', 'prerequisite-gap': 'continuePrerequisiteGap', 'due-review': 'continueDueReview', 'new-goal': 'continueConfirmedGoal', 'confirmed-scope-required': 'continueScopeRequired', 'check-budget-exhausted': 'continueCheckEnded', 'round-paused': 'continueRoundPaused', 'no-learnable-goal': 'continueNoGoal', 'source-unavailable': 'continueSourceUnavailable', 'source-pending': 'continueSourcePending' };
function sourceNotice(source) {
    if (source.status === 'ownership-unresolved')
        return 'feedbackOwnerUnknown';
    if (source.failure === 'login-required' || source.failure === 'login-challenge' || source.failure === 'permission-denied')
        return 'feedbackAuthorizationRequired';
    if (source.failure === 'identity-changed')
        return 'classroomIdentityMismatch';
    if (source.failure === 'operation-timeout' || source.failure === 'operation-canceled')
        return 'feedbackReadInterrupted';
    if (source.failure === 'response-too-large' || source.failure === 'read-limit' || source.failure === 'incomplete-read' || source.failure === 'unsupported-version')
        return 'feedbackReadIncomplete';
    return source.status === 'unavailable' ? 'feedbackSourceUnavailable' : 'feedbackSavePending';
}
function goalTitle(study, objectiveId) {
    if (!objectiveId)
        return undefined;
    return study.curriculum?.objectives.find(item => item.id === objectiveId)?.title ?? study.objectives.find(item => item.id === objectiveId)?.title;
}
const phaseOrder = ['demo', 'guide', 'try', 'vary'];
const phaseKeys = { demo: 'phaseDemo', guide: 'phaseGuide', try: 'phaseTry', vary: 'phaseVary' };
function SimonSteps({ phase, t }) {
    const current = phaseOrder.indexOf(phase);
    return _jsx("ol", { className: "student-simon", "aria-label": t('simonSteps'), children: phaseOrder.map((step, index) => _jsx("li", { className: index < current ? 'student-simon-done' : index === current ? 'student-simon-current' : undefined, "aria-current": index === current ? 'step' : undefined, children: t(phaseKeys[step]) }, step)) });
}
function Task({ study, goalTitle: title, goalText, disabled, t, act, tutor, draftScope, legacyDraftScope, useStore, actions }) {
    const task = study.task;
    if (!task)
        return null;
    const hintLabel = task.hintLevel > 0 ? t('hintMore') : t('hint');
    const [checked, setChecked] = useState({});
    const key = formDraftKey(`answer:${task.sessionId}:${task.id}`, draftScope);
    const answer = useStore(state => state.drafts[key] ?? (legacyDraftScope ? state.drafts[formDraftKey(`answer:${task.sessionId}:${task.id}`, legacyDraftScope)] : undefined)) ?? '';
    return _jsxs(_Fragment, { children: [_jsx("h3", { children: task.topic }), _jsxs("div", { className: `${css.taskLayout} ${task.figure ? css.withFigure : ''}`, children: [_jsxs("div", { className: css.taskPrompt, children: [_jsx("p", { className: "student-question", children: task.prompt }), task.figure && _jsx(FigureView, { figure: task.figure, t: t })] }), _jsxs("div", { className: css.answerArea, children: [task.response !== undefined && _jsxs("p", { children: [t('answer'), ": ", task.response] }), study.feedback ? _jsxs(_Fragment, { children: [_jsx("p", { className: "student-result", children: t(study.feedback.result) }), _jsx("p", { children: study.feedback.result === 'unassessed' ? t('assessmentPending') : study.feedback.feedback }), study.feedback.result === 'correct' && _jsx("button", { type: "button", disabled: disabled, onClick: () => { void tutor(feynmanPrompt(title), true).catch(() => { }); }, children: t('feynmanTeach') })] }) : task.response !== undefined ? _jsx("p", { role: "status", children: t('submitted') }) : task.choices ? _jsxs("fieldset", { disabled: disabled, children: [_jsx("p", { children: t('chooseAnswer') }), _jsx("div", { className: "student-choices", children: task.choices.map(choice => _jsx("button", { type: "button", onClick: () => { void act({ action: 'answer', taskId: task.id, response: choice }, true); }, children: choice }, choice)) }), _jsx("button", { type: "button", onClick: () => { void act({ action: 'hint', taskId: task.id }, true, hintPromptFor(task)); }, children: hintLabel }), _jsx("button", { type: "button", onClick: () => { void act({ action: 'stuck', taskId: task.id }, true, stuckPrompt); }, children: t('wont') })] }) : _jsx("form", { onSubmit: event => { event.preventDefault(); void act({ action: 'answer', taskId: task.id, response: String(new FormData(event.currentTarget).get('answer') ?? '') }, true); }, children: _jsxs("fieldset", { disabled: disabled, children: [_jsxs("label", { children: [t('answer'), _jsx("input", { name: "answer", "aria-label": t('answer'), value: answer, onChange: event => { actions.setDraft(key, event.target.value); }, required: true, maxLength: 2000 })] }), _jsx("button", { className: "student-primary", type: "submit", children: t('submit') }), _jsx("button", { type: "button", onClick: () => { void act({ action: 'hint', taskId: task.id }, true, hintPromptFor(task)); }, children: hintLabel }), _jsx("button", { type: "button", onClick: () => { void act({ action: 'stuck', taskId: task.id }, true, stuckPrompt); }, children: t('wont') })] }) }), task.hintLevel > 0 && _jsxs("p", { children: [t('hinted'), " \u00B7 ", t('hintLevel'), " ", task.hintLevel] })] })] }), (title || goalText || task.phase || task.steps?.length) && _jsxs("details", { className: css.taskDetails, open: task.phase === 'demo' || task.phase === 'guide' || !!task.steps?.length, children: [_jsx("summary", { children: t('taskDetails') }), title && _jsxs("p", { className: "student-muted", children: [t('learningGoal'), ": ", title] }), goalText && _jsxs("p", { children: [t('objectiveGoal'), ": ", goalText] }), task.phase && _jsx(SimonSteps, { phase: task.phase, t: t }), task.steps && task.steps.length > 0 && _jsx("ul", { className: "student-steps", "aria-label": t('microSteps'), children: task.steps.map((step, index) => _jsx("li", { children: _jsxs("label", { className: "student-check", children: [_jsx("input", { type: "checkbox", checked: !!checked[index], onChange: event => setChecked(previous => ({ ...previous, [index]: event.target.checked })) }), step] }) }, `${index}-${step}`)) })] })] });
}
//# sourceMappingURL=today-view.js.map