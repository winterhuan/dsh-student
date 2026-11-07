import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { MistakeConfirmation } from "./forms.js";
import { mistakePhotoPrompt, paperPhotoPrompt, practiceSheetPrompt, reviewSheetPrompt, workbookPhotoPrompt } from "./prompts.js";
import { errorTypesBySubject } from "../vocabulary.js";
import { WorksheetPrint } from "./worksheet-view.js";
const markKeys = { correct: 'markCorrect', partial: 'markPartial', incorrect: 'markWrong' };
/** Parent practice page: the mistake notebook, printed sheets, and due review. */
export function PracticeView({ study, now, subject, goals, mistakeStatus, setMistakeStatus, setMistakeOffset, revision, disabled, running, change, ask, onReview, epoch, t }) {
    return _jsxs(_Fragment, { children: [_jsx(PhotoIntake, { ask: ask, disabled: disabled || running, t: t }), _jsx(WorkbookIntake, { study: study, goals: goals, revision: revision, disabled: disabled || running, change: change, ask: ask, t: t }), _jsx(MistakeEditor, { subject: subject, goals: goals, revision: revision, change: change, t: t }), _jsxs("section", { children: [_jsxs("h3", { children: [t('notebook'), " \u00B7 ", t(subject), " \u00B7 ", study.confirmedCount] }), _jsx("nav", { className: "student-segments", "aria-label": t('mistakeStatus'), children: ['all', 'due', 'reviewing', 'mastered'].map(name => _jsxs("button", { type: "button", "aria-pressed": mistakeStatus === name, onClick: () => { setMistakeStatus(name); setMistakeOffset(0); }, children: [t(name === 'all' ? 'all' : name === 'due' ? 'bookDue' : name === 'reviewing' ? 'bookReviewing' : 'bookMastered'), name === 'all' ? '' : ` · ${study.mistakeBook[name]}`] }, name)) }), study.confirmedMistakes.length === 0 && _jsx("p", { children: t('empty') }), study.confirmedMistakes.map(item => _jsxs("details", { children: [_jsxs("summary", { children: [item.topic, item.stage >= 4 ? ` · ${t('bookMastered')}` : item.dueAt !== undefined && item.dueAt <= now ? ` · ${t('dueNow')}` : ''] }), _jsxs("p", { children: [t('prompt'), ": ", item.prompt] }), _jsxs("p", { children: [t('learnerAnswer'), ": ", item.learnerAnswer] }), _jsxs("p", { children: [t('correction'), ": ", item.correction] }), _jsxs("p", { children: [t('explanation'), ": ", item.explanation] }), _jsxs("p", { children: [t('answerEvidence'), ": ", item.answerEvidence] }), _jsxs("p", { children: [t('errorTypeLabel'), ": ", item.errorType !== undefined ? t(item.errorType) : t('errorTypeNone')] }), _jsxs("p", { children: [t('reviewStage'), ": ", item.stage + 1, " / 5", item.dueAt !== undefined ? ` · ${t('nextReview')}: ${item.dueAt <= now ? t('dueNow') : new Date(item.dueAt).toLocaleString()}` : ''] }), study.worksheets.filter(sheet => sheet.sources.some(source => source.mistakeId === item.id)).map(sheet => _jsxs("p", { className: "student-muted", children: [t('relatedWorksheets'), ": ", sheet.objectiveTitle, " \u00B7 ", t('graded'), " ", sheet.results.length, "/", sheet.items.length] }, sheet.id)), _jsx(MistakeObjective, { mistake: item, objectives: goals, change: change, t: t }), _jsx(MistakeEditor, { subject: subject, goals: goals, revision: revision, change: change, t: t, existing: item }), _jsxs("div", { className: "student-segments", children: [_jsx("button", { type: "button", onClick: () => {
                                            if (!window.confirm(t('deleteMistakeConfirm')))
                                                return;
                                            void change({ action: 'delete-mistake', id: item.id }, revision).catch(() => { });
                                        }, children: t('deleteMistake') }), item.objectiveId && _jsx("button", { type: "button", onClick: () => {
                                            const objectiveId = item.objectiveId;
                                            void change({
                                                action: 'save-exercise',
                                                exercise: {
                                                    id: `ws-${item.id}`.slice(0, 80),
                                                    subject: item.subject,
                                                    objectiveId,
                                                    role: 'vary',
                                                    variant: 'numeric',
                                                    prompt: item.prompt,
                                                    steps: ['先回忆错因', '独立做一遍', '对照订正'],
                                                    answer: item.correction,
                                                    explanation: item.explanation,
                                                    answerEvidence: item.answerEvidence,
                                                    ...(item.errorType !== undefined ? { errorType: item.errorType } : {}),
                                                },
                                            }, revision).catch(() => { });
                                        }, children: t('saveToExerciseBank') })] })] }, item.id)), study.confirmedCount > 20 && _jsxs("div", { className: "student-pages", children: [_jsx("button", { type: "button", disabled: study.confirmedOffset === 0, onClick: () => setMistakeOffset(study.confirmedOffset - 20), children: t('previousPage') }), _jsxs("span", { children: [t('page'), " ", Math.floor(study.confirmedOffset / 20) + 1, " / ", Math.ceil(study.confirmedCount / 20)] }), _jsx("button", { type: "button", disabled: study.confirmedOffset + 20 >= study.confirmedCount, onClick: () => setMistakeOffset(study.confirmedOffset + 20), children: t('nextPage') })] })] }), _jsxs("section", { children: [_jsxs("h3", { children: [t('workspaceExercises'), " \u00B7 ", (study.exercises ?? []).length] }), (study.exercises ?? []).length === 0 && _jsx("p", { children: t('empty') }), (study.exercises ?? []).map(item => _jsxs("details", { children: [_jsx("summary", { children: item.prompt.slice(0, 40) }), _jsxs("p", { children: [t('learningGoal'), ": ", goals.find(goal => goal.id === item.objectiveId)?.title ?? item.objectiveId] }), _jsxs("p", { children: [t('answer'), ": ", item.answer] }), _jsxs("p", { children: [t('explanation'), ": ", item.explanation] }), _jsx("button", { type: "button", onClick: () => { void change({ action: 'delete-exercise', id: item.id }, revision).catch(() => { }); }, children: t('deleteExercise') })] }, item.id))] }), _jsxs("section", { children: [_jsx("h3", { children: t('worksheets') }), _jsx("p", { className: "student-muted", children: t('reviewSheetHelp') }), _jsxs("p", { children: [t('reviewReady'), ": ", study.reviewPlan.picks, study.reviewPlan.remaining > 0 ? ` · ${t('reviewLater')}: ${study.reviewPlan.remaining}` : '', study.reviewPlan.unlinkedDue > 0 ? ` · ${t('reviewUnlinked')}: ${study.reviewPlan.unlinkedDue}` : '', study.reviewPlan.openSheets > 0 ? ` · ${t('reviewOpenSheets')}: ${study.reviewPlan.openSheets}` : ''] }), _jsx("button", { type: "button", disabled: disabled || running || goals.length === 0, onClick: () => { void ask(practiceSheetPrompt(subject)).catch(() => { }); }, children: t('createWorksheet') }), _jsx("button", { type: "button", disabled: disabled || running || study.reviewPlan.picks === 0, onClick: () => { void ask(reviewSheetPrompt(subject)).catch(() => { }); }, children: t('printConsolidation') }), study.worksheets.length === 0 && _jsx("p", { children: t('empty') }), study.worksheets.map(sheet => _jsx(WorksheetActions, { worksheet: sheet, revision: revision, change: change, ask: ask, disabled: disabled || running, t: t }, sheet.id))] }), _jsxs("section", { children: [_jsxs("h3", { children: [t('due'), " \u00B7 ", study.dueCount] }), study.dueMistakes.length === 0 && _jsx("p", { children: t('empty') }), study.dueMistakes.map(item => _jsxs("p", { children: [t(item.subject), " \u00B7 ", item.topic] }, item.id)), study.dueSubjects.map(item => _jsxs("button", { disabled: disabled || running, onClick: () => onReview(item), children: [t('review'), " \u00B7 ", t(item)] }, item))] }), _jsxs("section", { children: [_jsxs("h3", { children: [t('pending'), " \u00B7 ", study.pendingCount] }), study.pendingMistakes.length === 0 && _jsx("p", { children: t('empty') }), study.pendingMistakes.map(item => _jsx(MistakeConfirmation, { mistake: item, revision: revision, change: change, t: t }, `${epoch}-${item.id}`))] }), _jsx("p", { children: t('mistakeBounded') })] });
}
function MistakeEditor({ subject, goals, revision, change, t, existing }) {
    const [error, setError] = useState('');
    return _jsxs("details", { children: [_jsx("summary", { children: existing ? t('editMistake') : t('addMistake') }), _jsxs("form", { onSubmit: event => {
                    event.preventDefault();
                    setError('');
                    const form = new FormData(event.currentTarget);
                    const objectiveId = String(form.get('objectiveId') ?? '');
                    const picked = String(form.get('errorType') ?? '');
                    const errorType = errorTypesBySubject[subject].find(candidate => candidate === picked);
                    void change({
                        action: 'confirm-mistake',
                        id: existing?.id ?? crypto.randomUUID(),
                        subject,
                        topic: String(form.get('topic') ?? '').trim() || undefined,
                        prompt: String(form.get('prompt') ?? ''),
                        learnerAnswer: String(form.get('learnerAnswer') ?? '') || undefined,
                        correction: String(form.get('correction') ?? ''),
                        explanation: String(form.get('explanation') ?? ''),
                        answerEvidence: String(form.get('answerEvidence') ?? ''),
                        objectiveId: objectiveId === '' ? '' : objectiveId,
                        ...(errorType !== undefined ? { errorType } : {}),
                        userConfirmation: t('confirmMistake'),
                    }, revision).catch(reason => setError(reason instanceof Error ? reason.message : t('networkError')));
                }, children: [_jsxs("label", { children: [t('topic'), _jsx("input", { name: "topic", defaultValue: existing?.topic ?? '', maxLength: 2000 })] }), ['prompt', 'learnerAnswer', 'correction', 'explanation', 'answerEvidence'].map(name => _jsxs("label", { children: [t(name), _jsx("textarea", { name: name, defaultValue: existing?.[name] ?? '', required: name !== 'learnerAnswer', maxLength: 2000 })] }, name)), _jsxs("label", { children: [t('learningGoal'), _jsxs("select", { name: "objectiveId", defaultValue: existing?.objectiveId ?? '', children: [_jsx("option", { value: "", children: t('unclassified') }), goals.map(item => _jsx("option", { value: item.id, children: item.title }, item.id))] })] }), _jsxs("label", { children: [t('errorTypeLabel'), _jsxs("select", { name: "errorType", defaultValue: existing?.errorType ?? '', children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[subject].map(type => _jsx("option", { value: type, children: t(type) }, type))] })] }), _jsx("button", { type: "submit", children: existing ? t('save') : t('addMistake') }), error && _jsx("p", { role: "alert", children: error })] })] });
}
function MistakeObjective({ mistake, objectives, change, t }) {
    const [error, setError] = useState('');
    return _jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: event => {
                    event.preventDefault();
                    setError('');
                    const objectiveId = String(new FormData(event.currentTarget).get('objectiveId') ?? '');
                    void change({ action: 'link-mistake', mistakeId: mistake.id, objectiveId }).catch(reason => setError(reason instanceof Error ? reason.message : t('networkError')));
                }, children: [_jsxs("label", { children: [t('learningGoal'), _jsxs("select", { name: "objectiveId", defaultValue: mistake.objectiveId ?? '', required: true, children: [_jsx("option", { value: "", disabled: true, children: t('unclassified') }), objectives.map(item => _jsx("option", { value: item.id, children: item.title }, item.id))] })] }), _jsx("button", { type: "submit", disabled: objectives.length === 0, children: t('linkGoal') })] }), _jsxs("form", { onSubmit: event => {
                    event.preventDefault();
                    setError('');
                    const picked = String(new FormData(event.currentTarget).get('errorType') ?? '');
                    const errorType = errorTypesBySubject[mistake.subject].find(candidate => candidate === picked) ?? '';
                    void change({ action: 'classify-mistake', mistakeId: mistake.id, errorType }).catch(reason => setError(reason instanceof Error ? reason.message : t('networkError')));
                }, children: [_jsxs("label", { children: [t('errorTypeLabel'), _jsxs("select", { name: "errorType", defaultValue: mistake.errorType ?? '', children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[mistake.subject].map(type => _jsx("option", { value: type, children: t(type) }, type))] })] }), _jsx("button", { type: "submit", children: t('saveErrorType') })] }), error && _jsx("p", { role: "alert", children: error })] });
}
function WorksheetActions({ worksheet, revision, change, ask, disabled, t }) {
    const [previewing, setPreviewing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [marks, setMarks] = useState(() => Object.fromEntries(worksheet.results.flatMap(item => item.result === 'unassessed' ? [] : [[item.itemId, item.result]])));
    const [answers, setAnswers] = useState({});
    const [causes, setCauses] = useState({});
    const [helped, setHelped] = useState(() => Object.fromEntries(worksheet.results.flatMap(item => item.result === 'correct' && item.assistance === 'hint' ? [[item.itemId, true]] : [])));
    const [paper, setPaper] = useState(() => Object.fromEntries(worksheet.drafts.map(draft => [draft.itemId, { ...(draft.result === 'correct' || draft.result === 'partial' || draft.result === 'incorrect' ? { result: draft.result } : {}), response: draft.response, errorType: draft.errorType ?? '' }])));
    const [saving, setSaving] = useState(false);
    const changed = worksheet.items.filter(item => {
        const before = worksheet.results.find(result => result.itemId === item.id);
        const mark = marks[item.id];
        if (mark === undefined)
            return false;
        const assistance = mark === 'correct' ? helped[item.id] ? 'hint' : 'independent' : undefined;
        return mark !== before?.result || (answers[item.id]?.trim() ?? '') !== '' || (mark === 'correct' && before !== undefined && assistance !== before.assistance);
    });
    function markAllRight() {
        setMarks(previous => {
            const next = { ...previous };
            for (const item of worksheet.items) {
                const saved = worksheet.results.find(result => result.itemId === item.id);
                if (saved && saved.result !== 'unassessed')
                    continue;
                if (next[item.id] !== undefined)
                    continue;
                next[item.id] = 'correct';
            }
            return next;
        });
    }
    async function grade() {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await change({ action: 'grade-sheet', grade: { worksheetId: worksheet.id, userConfirmation: t('gradeConfirmation'), results: changed.map(item => {
                        const response = answers[item.id]?.trim();
                        const mark = marks[item.id] ?? 'correct';
                        const cause = causes[item.id];
                        return { itemId: item.id, result: mark, ...(response ? { response } : {}), ...(mark === 'correct' ? { assistance: helped[item.id] ? 'hint' : 'independent' } : {}), ...(mark !== 'correct' && cause ? { errorType: cause } : {}) };
                    }) } }, revision);
            setAnswers({});
            setMessage(t('gradesSaved'));
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setSaving(false);
        }
    }
    const highConfidence = worksheet.drafts.filter(draft => draft.confidence === 'high');
    async function confirmBatch(drafts) {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await change({ action: 'confirm-paper', worksheetId: worksheet.id, userConfirmation: t('confirmPaper'), results: drafts.map(draft => ({
                    itemId: draft.itemId, result: draft.result === 'unassessed' ? 'correct' : draft.result, response: draft.response, assistance: draft.assistance,
                    ...(draft.errorType !== undefined ? { errorType: draft.errorType } : {}),
                })) }, revision);
            setMessage(t('confirmPaperDone'));
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setSaving(false);
        }
    }
    const paperEntries = worksheet.drafts.flatMap(draft => {
        const value = paper[draft.itemId];
        return value?.result !== undefined ? [{ itemId: draft.itemId, result: value.result, response: value.response, ...(value.errorType !== '' ? { errorType: value.errorType } : {}) }] : [];
    });
    const patchPaper = (itemId, patch) => {
        setPaper(previous => {
            const prev = previous[itemId];
            return { ...previous, [itemId]: { ...(prev?.result !== undefined ? { result: prev.result } : {}), response: prev?.response ?? '', errorType: prev?.errorType ?? '', ...patch } };
        });
    };
    async function confirmPaper() {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await change({ action: 'confirm-paper', worksheetId: worksheet.id, userConfirmation: t('confirmPaper'), results: paperEntries }, revision);
            setMessage(t('confirmPaperDone'));
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setSaving(false);
        }
    }
    async function discard() {
        if (!window.confirm(t('discardConfirm')))
            return;
        setError('');
        try {
            await change({ action: 'discard-sheet', worksheetId: worksheet.id }, revision);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
    }
    return _jsxs("details", { children: [_jsxs("summary", { children: [worksheet.objectiveTitle, " \u00B7 ", worksheet.items.length, " ", t('questions'), " \u00B7 ", worksheet.open ? `${t('notGraded')} ${worksheet.items.length - worksheet.results.length}` : `${t('graded')} ${worksheet.results.length}/${worksheet.items.length}`] }), _jsxs("p", { className: "student-muted", children: [t('createdAt'), ": ", new Date(worksheet.createdAt).toLocaleDateString(), " \u00B7 ", t('gradeHelp')] }), _jsx("button", { type: "button", disabled: disabled, onClick: () => { setPreviewing(true); setMessage(''); }, children: t('previewPrintSheet') }), previewing && _jsx(WorksheetPrint, { worksheet: worksheet, onClose: () => setPreviewing(false), t: t }), _jsx("button", { type: "button", disabled: disabled || saving, onClick: markAllRight, children: t('markAllCorrect') }), worksheet.items.map((item, index) => {
                const source = worksheet.sources.find(candidate => candidate.itemId === item.id);
                const result = worksheet.results.find(candidate => candidate.itemId === item.id);
                return _jsxs("fieldset", { className: "student-grade", disabled: disabled || saving, children: [_jsxs("p", { children: [index + 1, ". ", item.prompt] }), _jsxs("p", { className: "student-muted", children: [t('referenceAnswer'), ": ", item.answer, " \u00B7 ", source?.mistakeId ? `${t('sourceMistake')}: ${source.topic}` : t('practiceItem'), result ? ` · ${t(result.result)}: ${result.response}` : ''] }), _jsx("div", { className: "student-segments", role: "radiogroup", "aria-label": `${index + 1}`, children: ['correct', 'partial', 'incorrect'].map(mark => _jsx("button", { type: "button", role: "radio", "aria-checked": marks[item.id] === mark, onClick: () => setMarks(previous => ({ ...previous, [item.id]: mark })), children: t(markKeys[mark]) }, mark)) }), marks[item.id] === 'correct' && _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: helped[item.id] === true, onChange: event => { const checked = event.target.checked; setHelped(previous => ({ ...previous, [item.id]: checked })); } }), " ", t('hintedCorrect')] }), marks[item.id] !== undefined && marks[item.id] !== 'correct' && _jsxs("label", { children: [t('childAnswer'), _jsx("input", { value: answers[item.id] ?? '', maxLength: 2000, onChange: event => { const value = event.target.value; setAnswers(previous => ({ ...previous, [item.id]: value })); } })] }), marks[item.id] !== undefined && marks[item.id] !== 'correct' && _jsxs("label", { children: [t('errorTypeLabel'), _jsxs("select", { value: causes[item.id] ?? '', onChange: event => { const type = errorTypesBySubject[worksheet.subject].find(candidate => candidate === event.target.value); setCauses(previous => ({ ...previous, [item.id]: type ?? '' })); }, children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[worksheet.subject].map(type => _jsx("option", { value: type, children: t(type) }, type))] })] })] }, item.id);
            }), worksheet.drafts.length > 0 && _jsxs("fieldset", { className: "student-grade", disabled: disabled || saving, children: [_jsx("legend", { children: t('draftsTitle') }), _jsx("p", { className: "student-muted", children: t('draftsHelp') }), highConfidence.length > 0 && _jsxs("button", { type: "button", disabled: disabled || saving, onClick: () => { void confirmBatch(highConfidence); }, children: [t('confirmHighConfidence'), " \u00B7 ", highConfidence.length] }), worksheet.drafts.map(draft => {
                        const index = worksheet.items.findIndex(item => item.id === draft.itemId);
                        const value = paper[draft.itemId];
                        return _jsxs("div", { children: [_jsx("p", { children: index >= 0 ? `${index + 1}. ${worksheet.items[index]?.prompt ?? ''}` : draft.itemId }), _jsxs("label", { children: [t('learnerAnswer'), _jsx("input", { value: value?.response ?? draft.response, maxLength: 2000, onChange: event => { patchPaper(draft.itemId, { response: event.target.value }); } })] }), draft.uncertainties !== '' && _jsxs("p", { className: "student-muted", children: [t('uncertainties'), ": ", draft.uncertainties] }), _jsx("div", { className: "student-segments", role: "radiogroup", "aria-label": t('draftChoice'), children: ['correct', 'partial', 'incorrect'].map(mark => _jsx("button", { type: "button", role: "radio", "aria-checked": value?.result === mark, onClick: () => { patchPaper(draft.itemId, { result: mark }); }, children: t(markKeys[mark]) }, mark)) }), (value?.result === 'partial' || value?.result === 'incorrect') && _jsxs("label", { children: [t('errorTypeLabel'), _jsxs("select", { value: value.errorType, onChange: event => { const type = errorTypesBySubject[worksheet.subject].find(candidate => candidate === event.target.value); patchPaper(draft.itemId, { errorType: type ?? '' }); }, children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[worksheet.subject].map(type => _jsx("option", { value: type, children: t(type) }, type))] })] })] }, draft.itemId);
                    }), _jsxs("button", { type: "button", className: "student-primary", disabled: disabled || saving || paperEntries.length === 0, onClick: () => { void confirmPaper(); }, children: [t('confirmPaper'), paperEntries.length > 0 ? ` · ${paperEntries.length}` : ''] })] }), _jsx(PhotoIntake, { ask: ask, disabled: disabled || saving, t: t, variant: "paper", prompt: paperPhotoPrompt(worksheet.id) }), _jsxs("button", { type: "button", className: "student-primary", disabled: disabled || saving || changed.length === 0, onClick: () => { void grade(); }, children: [t('saveGrades'), changed.length > 0 ? ` · ${changed.length}` : ''] }), _jsx("button", { type: "button", className: "student-quiet", disabled: disabled || saving, onClick: () => { void discard(); }, children: t('discardSheet') }), message && _jsx("p", { role: "status", children: message }), error && _jsx("p", { role: "alert", children: error })] });
}
const workbookOutcomeKeys = { stuck: 'workbookStuck', hinted: 'workbookHinted', 'independent-wrong': 'workbookWrong', 'independent-correct': 'workbookRight' };
function WorkbookIntake({ study, goals, revision, disabled, change, ask, t }) {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [outcomes, setOutcomes] = useState({});
    const [goalsChosen, setGoalsChosen] = useState({});
    const [corrections, setCorrections] = useState({});
    const [explanations, setExplanations] = useState({});
    const [evidence, setEvidence] = useState({});
    async function confirmDraft(draft) {
        const outcome = outcomes[draft.id] ?? draft.outcome;
        const objectiveId = goalsChosen[draft.id] ?? draft.objectiveId ?? '';
        const correction = corrections[draft.id]?.trim() ?? '';
        const explanation = explanations[draft.id]?.trim() ?? '';
        const answerEvidence = evidence[draft.id]?.trim() ?? '';
        if (outcome === 'independent-wrong' && (correction === '' || explanation === '' || answerEvidence === '')) {
            setError(t('workbookNeedCorrection'));
            return;
        }
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await change({
                action: 'confirm-workbook', id: draft.id, outcome, userConfirmation: t('confirmWorkbook'),
                ...(objectiveId !== (draft.objectiveId ?? '') ? { objectiveId } : {}),
                ...(outcome === 'independent-wrong' ? { correction, explanation, answerEvidence } : {}),
            }, revision);
            setMessage(outcome === 'stuck' || outcome === 'hinted' ? t('teachQueued') : t('workbookSaved'));
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setSaving(false);
        }
    }
    async function dismiss(id) {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await change({ action: 'dismiss-teaching', id }, revision);
            setMessage(t('workbookSaved'));
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setSaving(false);
        }
    }
    return _jsxs("section", { children: [_jsx(PhotoIntake, { ask: ask, disabled: disabled || saving, t: t, variant: "workbook", prompt: workbookPhotoPrompt }), study.workbookDrafts.length > 0 && _jsxs("fieldset", { className: "student-grade", disabled: disabled || saving, children: [_jsx("legend", { children: t('workbookDrafts') }), study.workbookDrafts.map(draft => {
                        const outcome = outcomes[draft.id] ?? draft.outcome;
                        const objectiveId = goalsChosen[draft.id] ?? draft.objectiveId ?? '';
                        const known = goals.some(goal => goal.id === draft.objectiveId);
                        return _jsxs("div", { children: [_jsx("p", { children: draft.prompt }), draft.response && _jsxs("p", { className: "student-muted", children: [t('learnerAnswer'), ": ", draft.response] }), draft.uncertainties !== '' && _jsxs("p", { className: "student-muted", children: [t('uncertainties'), ": ", draft.uncertainties] }), _jsxs("label", { children: [t('learningGoal'), _jsxs("select", { "aria-label": t('learningGoal'), value: objectiveId, onChange: event => { const value = event.target.value; setGoalsChosen(previous => ({ ...previous, [draft.id]: value })); }, children: [_jsx("option", { value: "", children: t('workbookNoGoal') }), draft.objectiveId && !known && _jsx("option", { value: draft.objectiveId, children: draft.objectiveId }), goals.map(goal => _jsx("option", { value: goal.id, children: goal.title }, goal.id))] })] }), _jsx("div", { className: "student-segments", role: "radiogroup", "aria-label": draft.prompt, children: ['stuck', 'hinted', 'independent-wrong', 'independent-correct'].map(name => _jsx("button", { type: "button", role: "radio", "aria-checked": outcome === name, onClick: () => setOutcomes(previous => ({ ...previous, [draft.id]: name })), children: t(workbookOutcomeKeys[name]) }, name)) }), outcome === 'independent-wrong' && _jsxs(_Fragment, { children: [_jsxs("label", { children: [t('correction'), _jsx("input", { value: corrections[draft.id] ?? '', maxLength: 2000, onChange: event => { const value = event.target.value; setCorrections(previous => ({ ...previous, [draft.id]: value })); } })] }), _jsxs("label", { children: [t('explanation'), _jsx("input", { value: explanations[draft.id] ?? '', maxLength: 2000, onChange: event => { const value = event.target.value; setExplanations(previous => ({ ...previous, [draft.id]: value })); } })] }), _jsxs("label", { children: [t('answerEvidence'), _jsx("input", { value: evidence[draft.id] ?? '', maxLength: 2000, onChange: event => { const value = event.target.value; setEvidence(previous => ({ ...previous, [draft.id]: value })); } })] })] }), _jsx("button", { type: "button", className: "student-primary", disabled: disabled || saving, onClick: () => { void confirmDraft(draft); }, children: t('confirmWorkbook') })] }, draft.id);
                    })] }), study.teachingQueue.length > 0 && _jsxs("fieldset", { className: "student-grade", disabled: disabled || saving, children: [_jsx("legend", { children: t('teachingQueue') }), study.teachingQueue.map(item => _jsxs("div", { children: [_jsx("p", { children: item.prompt }), _jsx("button", { type: "button", className: "student-quiet", disabled: disabled || saving, onClick: () => { void dismiss(item.id); }, children: t('dismissTeaching') })] }, item.id))] }), message && _jsx("p", { role: "status", children: message }), error && _jsx("p", { role: "alert", children: error })] });
}
function PhotoIntake({ ask, disabled, t, variant = 'mistake', prompt = mistakePhotoPrompt }) {
    const [photo, setPhoto] = useState();
    const [error, setError] = useState('');
    const [reading, setReading] = useState(false);
    async function select(file) {
        setPhoto(undefined);
        setError('');
        if (!file)
            return;
        const mediaType = file.type;
        if (file.size > 8_388_608 || !['image/png', 'image/jpeg', 'image/webp'].includes(mediaType)) {
            setError(t('photoError'));
            return;
        }
        setReading(true);
        try {
            const preview = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error(t('photoError'))); reader.onerror = () => reject(new Error(t('photoError'))); reader.readAsDataURL(file); });
            if (mediaType === 'image/png' || mediaType === 'image/jpeg' || mediaType === 'image/webp')
                setPhoto({ mediaType, data: preview.slice(preview.indexOf(',') + 1), preview, name: file.name });
        }
        catch {
            setError(t('photoError'));
        }
        finally {
            setReading(false);
        }
    }
    async function submit(event) {
        event.preventDefault();
        if (!photo)
            return;
        try {
            await ask(prompt, photo);
            setPhoto(undefined);
        }
        catch { /* Tutor submission notice is owned by the workbench. */ }
    }
    return _jsxs("section", { children: [_jsx("h3", { children: t(variant === 'mistake' ? 'photo' : variant === 'paper' ? 'paperPhoto' : 'workbookPhoto') }), _jsx("p", { children: t(variant === 'mistake' ? 'photoHelp' : variant === 'paper' ? 'paperPhotoHelp' : 'workbookPhotoHelp') }), _jsxs("form", { onSubmit: event => { void submit(event); }, children: [_jsxs("label", { children: [t('photo'), _jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp", disabled: disabled || reading, onChange: event => { const file = event.target.files?.[0]; event.target.value = ''; void select(file); } })] }), photo && _jsx("img", { src: photo.preview, alt: t('preview') }), _jsx("button", { type: "submit", disabled: !photo || disabled || reading, children: t('sendPhoto') }), error && _jsx("p", { role: "alert", children: error })] })] });
}
//# sourceMappingURL=practice-view.js.map