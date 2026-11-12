import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { z } from 'zod';
import { answerDateSchema, assessmentSchema, assistanceSchema, responseSchema, worksheetSchema } from "../files/schema.js";
import { errorTypesBySubject } from "../vocabulary.js";
import { SaveForm } from "./forms.js";
import { studentResourceAddress } from "./resource.js";
/** Optional corrections edit confirmed records; the original response and frozen question stay visible. */
export function WorksheetCorrections({ sessionId, termId, draftScope, useResource, save, t, disabled }) {
    const resource = useResource(studentResourceAddress(sessionId, { kind: 'files' }));
    const value = resource.value?.data;
    const candidates = value && typeof value === 'object' && 'worksheets' in value && Array.isArray(value.worksheets) ? value.worksheets : [];
    const sheets = candidates.flatMap(candidate => { const parsed = worksheetSchema.safeParse(candidate); return parsed.success && parsed.data.termId === termId && parsed.data.discardedAt === undefined ? [parsed.data] : []; }).slice(-20);
    return _jsxs("details", { className: "student-fold", children: [_jsx("summary", { children: t('manualWorksheet') }), _jsx("p", { children: t('manualWorksheetHelp') }), resource.status === 'failed' && _jsx("p", { role: "alert", children: t('staleData') }), sheets.map(sheet => _jsxs("section", { children: [_jsxs(SaveForm, { observation: resource.value?.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`)?.version, entity: `worksheet:${sheet.id}:date`, draftScope, t, disabled: disabled || resource.status !== 'live', currentValues: { answerDay: sheet.answerDate?.kind === 'day' ? sheet.answerDate.day : '' }, revision: 0, baseline: JSON.stringify(sheet.answerDate ?? null), submit: async (form, _revision, retained) => {
                            const original = JSON.parse(retained);
                            const day = String(form.get('answerDay') ?? '');
                            const result = await save({ kind: 'worksheet-assessments', worksheetId: sheet.id, assessments: [], answerDate: day ? { kind: 'day', day, parentConfirmation: t('gradeConfirmation') } : { kind: 'unknown' } }, { answerDate: JSON.parse(original.baseline) });
                            if (result) {
                                const date = answerDateSchema.parse(result.current.answerDate);
                                return { baseline: JSON.stringify(date), currentValues: { answerDay: date.kind === 'day' ? date.day : '' }, observation: result.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`).version };
                            }
                        }, children: [_jsxs("label", { children: [t('worksheetAnswerDay'), " \u00B7 ", sheet.id, _jsx("input", { name: "answerDay", type: "date", "aria-label": t('worksheetAnswerDay'), defaultValue: sheet.answerDate?.kind === 'day' ? sheet.answerDate.day : '' })] }), _jsx("p", { children: t('worksheetAnswerDayHelp') })] }), sheet.responses.map(response => _jsx(Correction, { sheet, response, draftScope, save, t, observation: resource.value?.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`)?.version, disabled: disabled || resource.status !== 'live' }, response.id))] }, sheet.id))] });
}
function Correction({ sheet, response, draftScope, save, t, disabled, observation }) {
    const assessment = sheet.assessments.find(item => item.responseId === response.id);
    const question = sheet.items.find(item => item.id === response.questionId);
    const answerDate = response.answerDate ?? sheet.answerDate;
    return _jsxs("section", { children: [_jsx("p", { children: question.prompt }), _jsxs("p", { children: [t('learnerAnswer'), ": ", response.rawResponse] }), _jsxs("p", { children: [t('answerEvidence'), ": ", question.answerEvidence] }), _jsxs(SaveForm, { entity: `worksheet:${sheet.id}:${response.id}`, draftScope, t, disabled, observation, currentValues: { result: assessment?.result ?? 'unassessed', feedback: assessment?.feedback ?? question.explanation, answerEvidence: assessment?.answerEvidence ?? question.answerEvidence, assistance: response.assistance, answerDay: answerDate?.kind === 'day' ? answerDate.day : '', errorType: assessment?.errorType ?? '' }, revision: 0, baseline: JSON.stringify({ response, assessment: assessment ?? null }), submit: async (form, _revision, retained) => {
                    const entry = JSON.parse(retained);
                    const original = JSON.parse(entry.baseline);
                    const before = responseSchema.parse(original.response);
                    const oldAssessment = original.assessment === null ? undefined : assessmentSchema.parse(original.assessment);
                    const edited = entry.editedFields;
                    const helpChanged = edited.includes('assistance');
                    const dateChanged = edited.includes('answerDay');
                    const assessmentChanged = ['result', 'feedback', 'answerEvidence', 'errorType'].some(field => edited.includes(field)) || helpChanged && !!assessment;
                    const assistance = helpChanged ? assistanceSchema.parse(form.get('assistance')) : response.assistance;
                    const confirmation = t('gradeConfirmation');
                    const baseline = {};
                    const assessments = [];
                    if (assessmentChanged) {
                        const current = assessment ?? { id: `assessment-${response.id}`.slice(0, 80), responseId: response.id, result: 'unassessed', assistance, feedback: question.explanation, answerEvidence: question.answerEvidence, assessedAt: Date.now() };
                        const parsed = assessmentSchema.parse({ ...current, assistance, userConfirmation: confirmation,
                            ...(edited.includes('result') ? { result: form.get('result') } : {}),
                            ...(edited.includes('feedback') ? { feedback: form.get('feedback') } : {}),
                            ...(edited.includes('answerEvidence') ? { answerEvidence: form.get('answerEvidence') } : {}),
                        });
                        if (edited.includes('errorType')) {
                            const cause = errorTypesBySubject[sheet.subject].find(type => type === form.get('errorType'));
                            if (cause)
                                parsed.errorType = cause;
                            else
                                delete parsed.errorType;
                        }
                        assessments.push(parsed);
                        baseline[`assessment:${response.id}`] = z.json().parse(JSON.parse(JSON.stringify(oldAssessment ?? null)));
                    }
                    const responseUpdates = [];
                    if (helpChanged || dateChanged) {
                        const day = String(form.get('answerDay') ?? '');
                        responseUpdates.push({ responseId: response.id, userConfirmation: confirmation, ...(helpChanged ? { assistance } : {}), ...(dateChanged ? { answerDate: day ? { kind: 'day', day, parentConfirmation: confirmation } : { kind: 'unknown' } } : {}) });
                        baseline[`response:${response.id}`] = { ...(helpChanged ? { assistance: before.assistance } : {}), ...(dateChanged ? { answerDate: before.answerDate ?? null } : {}) };
                    }
                    const result = await save({ kind: 'worksheet-assessments', worksheetId: sheet.id, assessments, ...(responseUpdates.length ? { responseUpdates } : {}) }, baseline);
                    if (result) {
                        const updated = result.current[`response:${response.id}`];
                        const nextResponse = responseSchema.parse({ ...before, ...(updated && typeof updated === 'object' ? updated : {}) });
                        const savedAssessment = result.current[`assessment:${response.id}`];
                        const nextAssessment = savedAssessment ? assessmentSchema.parse(savedAssessment) : oldAssessment;
                        const date = nextResponse.answerDate ?? sheet.answerDate;
                        return { baseline: JSON.stringify({ response: nextResponse, assessment: nextAssessment ?? null }), currentValues: { result: nextAssessment?.result ?? 'unassessed', feedback: nextAssessment?.feedback ?? question.explanation, answerEvidence: nextAssessment?.answerEvidence ?? question.answerEvidence, assistance: nextResponse.assistance, answerDay: date?.kind === 'day' ? date.day : '', errorType: nextAssessment?.errorType ?? '' }, observation: result.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`).version };
                    }
                }, children: [_jsxs("label", { children: [t('draftChoice'), _jsx("select", { name: "result", defaultValue: assessment?.result ?? 'unassessed', children: ['correct', 'partial', 'incorrect', 'unassessed', 'stuck'].map(value => _jsx("option", { value: value, children: t(value === 'correct' ? 'markCorrect' : value === 'partial' ? 'markPartial' : value === 'incorrect' ? 'markWrong' : value === 'stuck' ? 'workbookStuck' : 'notGraded') }, value)) })] }), _jsxs("label", { children: [t('feedback'), _jsx("textarea", { name: "feedback", defaultValue: assessment?.feedback ?? question.explanation, required: true, maxLength: 2000 })] }), _jsxs("label", { children: [t('answerEvidence'), _jsx("textarea", { name: "answerEvidence", defaultValue: assessment?.answerEvidence ?? question.answerEvidence, required: true, maxLength: 2000 })] }), _jsxs("label", { children: [t('assistanceLabel'), _jsx("select", { name: "assistance", defaultValue: response.assistance, children: ['independent', 'hint', 'worked-example', 'unknown'].map(value => _jsx("option", { value: value, children: t(value === 'independent' ? 'independent' : value === 'hint' ? 'assistHint' : value === 'worked-example' ? 'workedExampleHelp' : 'assistanceUnknown') }, value)) })] }), _jsxs("label", { children: [t('actualAnswerDay'), _jsx("input", { type: "date", name: "answerDay", defaultValue: answerDate?.kind === 'day' ? answerDate.day : '' })] }), _jsx("p", { className: "student-muted", children: t('answerDayHelp') }), _jsxs("label", { children: [t('errorTypeLabel'), _jsxs("select", { name: "errorType", defaultValue: assessment?.errorType ?? '', children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[sheet.subject].map(value => _jsx("option", { value: value, children: t(value) }, value))] })] })] })] });
}
//# sourceMappingURL=worksheet-corrections.js.map