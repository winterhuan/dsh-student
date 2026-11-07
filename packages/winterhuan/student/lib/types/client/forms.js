import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { INTEREST_TAG } from "../interests.js";
import { errorTypesBySubject } from "../vocabulary.js";
export const subjects = ['chinese', 'math', 'english'];
const read = (form, name) => String(form.get(name) ?? '').trim();
/** Labelled native field with browser validation, preserving unsaved text across polling. */
export function Field({ name, label, value = '', type = 'text', min, max, required = true }) {
    return _jsxs("label", { children: [label, _jsx("input", { name: name, defaultValue: value, type: type, min: min, max: max, required: required, maxLength: 2000 })] });
}
function SaveForm({ revision, submit, children, t, disabled = false, button = 'save' }) {
    const [base, setBase] = useState(revision);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    async function save(event) {
        event.preventDefault();
        if (busy)
            return;
        const values = new FormData(event.currentTarget);
        setBusy(true);
        setSaved(false);
        setError('');
        try {
            const result = await submit(values, base);
            setBase(result.revision);
            setSaved(true);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setBusy(false);
        }
    }
    return _jsxs("form", { onSubmit: event => { void save(event); }, onChange: () => setSaved(false), children: [_jsxs("fieldset", { disabled: disabled || busy, children: [children, _jsx("button", { type: "submit", children: busy ? t('busy') : t(button) })] }), error && _jsx("p", { role: "alert", children: error }), saved && _jsx("p", { role: "status", children: t('saved') })] });
}
/** Parent-confirmed setup or in-place profile update, plus an atomic textbook/course update. */
export function ParentSettings({ data, change, t, curriculum = null, subject = 'math', onSubject }) {
    const [progressError, setProgressError] = useState('');
    const study = data.study;
    const profile = study?.profile;
    const today = new Date(data.serverNow + 8 * 60 * 60 * 1000);
    const currentYear = today.getUTCFullYear() - (today.getUTCMonth() < 8 ? 1 : 0);
    const years = Array.from({ length: 7 }, (_, index) => `${currentYear + 1 - index}–${currentYear + 2 - index}`);
    return _jsxs("section", { children: [_jsx("p", { children: t('parentHelp') }), _jsxs(SaveForm, { revision: data.revision, t: t, submit: (form, revision) => change({
                    action: 'setup',
                    profile: {
                        nickname: read(form, 'nickname'),
                        region: read(form, 'region'),
                        grade: Number(form.get('grade')),
                        term: form.get('term') === 'second' ? 'second' : 'first',
                        schoolYear: read(form, 'schoolYear'),
                        schoolAlias: read(form, 'schoolAlias'),
                        schoolSystem: form.get('schoolSystem') === 'six-three' ? 'six-three' : 'five-four',
                        parentConfirmation: t('profileConfirm'),
                    },
                }, revision), children: [_jsx(Field, { name: "nickname", label: t('nickname'), value: profile?.nickname ?? '' }), _jsx(Field, { name: "region", label: t('region'), value: profile?.region ?? '上海市' }), _jsx(Field, { name: "grade", label: t('grade'), value: profile?.grade ?? 2, type: "number", min: 1, max: 6 }), _jsxs("label", { children: [t('term'), _jsxs("select", { name: "term", "aria-label": t('term'), defaultValue: profile?.term ?? 'first', children: [_jsx("option", { value: "first", children: t('first') }), _jsx("option", { value: "second", children: t('second') })] })] }), _jsxs("label", { children: [t('schoolYear'), _jsxs("select", { name: "schoolYear", "aria-label": t('schoolYear'), defaultValue: profile?.schoolYear ?? '', required: true, children: [_jsx("option", { value: "", disabled: true, children: t('chooseSchoolYear') }), years.map(year => _jsx("option", { value: year, children: year }, year))] })] }), _jsx("p", { children: t('schoolYearHelp') }), _jsx(Field, { name: "schoolAlias", label: t('schoolAlias'), value: profile?.schoolAlias ?? '', required: false }), _jsx("p", { children: t('schoolAliasHelp') }), _jsxs("label", { children: [t('schoolSystem'), _jsxs("select", { name: "schoolSystem", "aria-label": t('schoolSystem'), defaultValue: profile?.schoolSystem ?? 'five-four', children: [_jsx("option", { value: "five-four", children: t('five-four') }), _jsx("option", { value: "six-three", children: t('six-three') })] })] })] }, profile ? `profile-${profile.nickname}-${profile.grade}-${profile.term}-${profile.schoolYear}` : 'setup'), profile && _jsxs(_Fragment, { children: [_jsx("h3", { children: t('curriculum') }), _jsx("p", { children: t('materialHelp') }), study.courses.map(course => _jsxs("p", { children: [t(course.subject), " \u00B7 ", study.materials.find(item => item.id === course.materialId)?.title, " \u00B7 ", course.unit] }, course.subject)), _jsxs(SaveForm, { revision: data.revision, t: t, submit: async (form, revision) => {
                            const materialId = crypto.randomUUID();
                            const selected = read(form, 'subject');
                            const courseSubject = subjects.find(item => item === selected) ?? subject;
                            const unitId = read(form, 'unitId');
                            const unit = curriculum?.scope.current ? curriculum.units.find(item => item.id === unitId) : undefined;
                            const { region, grade, term, schoolYear, schoolSystem } = profile;
                            const saved = await change({ action: 'configure-course', material: { id: materialId, subject: courseSubject, scope: { region, grade, term, schoolYear, schoolSystem }, title: curriculum?.scope.current ? curriculum.title : t(courseSubject), publisher: t('mapMaterialPublisher'), edition: curriculum?.scope.current ? curriculum.id : t('mapMaterialEdition'), editionStatus: 'identified', kind: 'official-textbook', locator: curriculum?.scope.current ? `knowledge/curriculum/${curriculum.id}.json` : t('mapMaterialLocator'), evidence: t('mapMaterialEvidence') }, course: { subject: courseSubject, materialId, unit: unit?.name ?? read(form, 'unit'), parentConfirmation: t('materialConfirm') } }, revision);
                            if (!unit)
                                return saved;
                            const existing = saved.study?.courses.find(item => item.subject === courseSubject)?.progress;
                            return change({ action: 'school-progress', subject: courseSubject, unitId: unit.id, posture: existing?.posture ?? 'keep-up', preview: existing?.preview ? 'on' : 'off', pace: existing?.pace ?? 'teaching', parentConfirmation: t('confirmSchoolProgress') }, saved.revision);
                        }, children: [_jsxs("label", { children: [t('subject'), _jsx("select", { name: "subject", "aria-label": t('subject'), value: subject, onChange: event => { const next = subjects.find(item => item === event.target.value); if (next)
                                            onSubject?.(next); }, children: subjects.map(item => _jsx("option", { value: item, children: t(item) }, item)) })] }), curriculum?.scope.current ? _jsxs("label", { children: [t('unit'), _jsxs("select", { name: "unitId", "aria-label": t('unit'), defaultValue: study.courses.find(item => item.subject === subject)?.progress?.unitId ?? '', required: true, children: [_jsx("option", { value: "", disabled: true, children: t('chooseUnit') }), curriculum.units.map(unit => _jsx("option", { value: unit.id, children: unit.name }, unit.id))] }, subject)] }) : _jsx(Field, { name: "unit", label: t('unit') })] }), curriculum?.scope.current && _jsxs(_Fragment, { children: [_jsx("h3", { children: t('schoolFrontier') }), _jsx("p", { children: t('schoolProgressHelp') }), onSubject && _jsx("nav", { className: "student-segments", "aria-label": t('schoolFrontier'), children: subjects.map(item => _jsx("button", { type: "button", "aria-pressed": subject === item, onClick: () => onSubject(item), children: t(item) }, item)) }), study.courses.some(course => course.subject === subject) ? _jsxs("form", { onSubmit: event => {
                                    event.preventDefault();
                                    const form = new FormData(event.currentTarget);
                                    const submitter = event.nativeEvent.submitter;
                                    const move = submitter instanceof HTMLButtonElement ? submitter.value : 'stay';
                                    const units = curriculum.units;
                                    const selected = String(form.get('unitId') ?? '');
                                    const index = units.findIndex(unit => unit.id === selected);
                                    const next = units[index + 1];
                                    if (index < 0)
                                        return;
                                    if (move === 'next' && !next) {
                                        setProgressError(t('noNextUnit'));
                                        return;
                                    }
                                    setProgressError('');
                                    void change({ action: 'school-progress', subject, unitId: move === 'next' && next ? next.id : selected, posture: form.get('posture') === 'catch-up' ? 'catch-up' : 'keep-up', preview: form.get('preview') === 'on' ? 'on' : 'off', pace: move === 'review' ? 'review' : 'teaching', parentConfirmation: t('confirmSchoolProgress') }, data.revision);
                                }, children: [_jsxs("label", { children: [t('schoolFrontier'), _jsx("select", { name: "unitId", "aria-label": t('schoolFrontier'), defaultValue: study.courses.find(course => course.subject === subject)?.progress?.unitId ?? curriculum.units[0]?.id, required: true, children: curriculum.units.map(unit => _jsx("option", { value: unit.id, children: unit.name }, unit.id)) })] }), _jsxs("label", { children: [t('keepUp'), _jsxs("select", { name: "posture", "aria-label": t('keepUp'), defaultValue: study.courses.find(course => course.subject === subject)?.progress?.posture ?? 'keep-up', children: [_jsx("option", { value: "keep-up", children: t('keepUp') }), _jsx("option", { value: "catch-up", children: t('catchUp') })] })] }), _jsxs("label", { className: "student-check", children: [_jsx("input", { type: "checkbox", name: "preview", defaultChecked: study.courses.find(course => course.subject === subject)?.progress?.preview === true }), t('previewUnit')] }), progressError && _jsx("p", { role: "alert", children: progressError }), _jsxs("div", { className: "student-segments", children: [_jsx("button", { type: "submit", value: "stay", children: t('stillThisUnit') }), _jsx("button", { type: "submit", value: "next", children: t('nextSchoolUnit') }), _jsx("button", { type: "submit", value: "review", children: t('reviewWeek') })] })] }, `${subject}:${study.courses.find(course => course.subject === subject)?.progress?.unitId ?? ''}`) : _jsx("p", { children: t('schoolProgressNeedsCourse') })] }), _jsx(InterestsForm, { tags: study.interests, revision: data.revision, change: change, t: t }), _jsx("h3", { children: t('openmaicTitle') }), _jsx("p", { className: "student-muted", children: t('openmaicBaseHelp') }), _jsxs("p", { children: [t('openmaicEffective'), ": ", data.interactiveLessons.baseUrl] }), _jsxs(SaveForm, { revision: data.revision, t: t, submit: (form, revision) => change({ action: 'openmaic-settings', baseUrl: read(form, 'baseUrl'), parentConfirmation: t('openmaicConfirm') }, revision), children: [_jsx(Field, { name: "baseUrl", label: t('openmaicBase'), value: study.openmaic?.savedBaseUrl ?? '', required: false }), _jsx("p", { className: "student-muted", children: t('openmaicAccessHint') })] }), data.study && _jsxs("div", { children: [_jsx("h3", { children: t('archiveTerm') }), _jsx("p", { className: "student-muted", children: t('archiveTermHelp') }), _jsx("button", { type: "button", disabled: !!study.active, onClick: () => {
                                    if (!window.confirm(t('archiveTermConfirm')))
                                        return;
                                    void change({ action: 'archive-term', parentConfirmation: t('archiveTermConfirmation') }, data.revision).catch(() => { });
                                }, children: t('archiveTerm') })] })] })] });
}
/** Parent theme tags. The saved list is edited here; an empty profile shows the example tags from status. */
function InterestsForm({ tags, revision, change, t }) {
    const [draft, setDraft] = useState(tags);
    return _jsxs(SaveForm, { revision: revision, t: t, submit: (_form, nextRevision) => {
            const next = [...new Set(draft.map(tag => tag.trim()).filter(tag => tag !== ''))];
            if (next.length < 3 || next.length > 8)
                throw new Error(t('interestCount'));
            if (next.some(tag => !INTEREST_TAG.test(tag)))
                throw new Error(t('interestShape'));
            return change({ action: 'interests', tags: next, parentConfirmation: t('interestConfirm') }, nextRevision);
        }, children: [_jsx("h3", { children: t('interestsTitle') }), _jsx("p", { className: "student-muted", children: t('interestsHelp') }), draft.map((tag, index) => _jsxs("label", { children: [t('interestTag'), " ", index + 1, _jsx("input", { "aria-label": `${t('interestTag')} ${index + 1}`, value: tag, required: true, minLength: 2, maxLength: 16, onChange: event => setDraft(draft.map((item, itemIndex) => itemIndex === index ? event.target.value : item)) })] }, index)), _jsxs("div", { className: "student-segments", children: [draft.length < 8 && _jsx("button", { type: "button", onClick: () => setDraft([...draft, '']), children: t('addInterest') }), draft.length > 3 && _jsx("button", { type: "button", onClick: () => setDraft(draft.slice(0, -1)), children: t('removeInterest') })] })] });
}
/** Confirmation retains the unedited image transcription until a user explicitly saves it. */
export function MistakeConfirmation({ mistake, revision, change, t }) {
    return _jsxs("details", { children: [_jsx("summary", { children: mistake.topic }), _jsxs("p", { children: [t('learnerAnswer'), ": ", mistake.learnerAnswer] }), mistake.uncertainties && _jsxs("p", { children: [t('uncertainties'), ": ", mistake.uncertainties] }), _jsxs(SaveForm, { revision: revision, t: t, button: "confirm", submit: (form, base) => {
                    const picked = read(form, 'errorType');
                    const errorType = errorTypesBySubject[mistake.subject].find(candidate => candidate === picked);
                    return change({ action: 'confirm-mistake', id: mistake.id, prompt: read(form, 'prompt'), learnerAnswer: read(form, 'learnerAnswer'), correction: read(form, 'correction'), explanation: read(form, 'explanation'), answerEvidence: read(form, 'answerEvidence'), ...(errorType !== undefined ? { errorType } : {}), userConfirmation: t('confirmMistake') }, base);
                }, children: [['prompt', 'learnerAnswer', 'correction', 'explanation', 'answerEvidence'].map(name => _jsxs("label", { children: [t(name), _jsx("textarea", { "aria-label": t(name), name: name, defaultValue: mistake[name], required: true, maxLength: 2000 })] }, name)), _jsxs("label", { children: [t('errorTypeLabel'), _jsxs("select", { name: "errorType", defaultValue: mistake.errorType ?? '', children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[mistake.subject].map(type => _jsx("option", { value: type, children: t(type) }, type))] })] })] })] });
}
//# sourceMappingURL=forms.js.map