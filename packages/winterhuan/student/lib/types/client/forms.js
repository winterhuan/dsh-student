import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { readFormDraft, formDraftKey } from "./drafts.js";
import { INTEREST_TAG } from "../interests.js";
import { errorTypesBySubject } from "../vocabulary.js";
function savedSettingsForm(result, entity, original, subject) {
    if (!result.manual)
        return result;
    const current = result.manual.current;
    const observation = result.manual.versions.find(file => file.path === '.study/settings.json').version;
    const retained = JSON.parse(original).baseline;
    const values = (value) => value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter((entry) => ['string', 'number', 'boolean'].includes(typeof entry[1]))) : {};
    if (entity === 'profile') {
        const profile = JSON.parse(retained) ?? {};
        for (const [key, value] of Object.entries(current))
            if (key.startsWith('profile:'))
                profile[key.slice(8)] = value;
        return { baseline: JSON.stringify(profile), currentValues: values(profile), observation };
    }
    if (entity === 'course') {
        const baseline = JSON.parse(retained);
        const course = current[`course:${subject}`];
        baseline.course = course;
        const fields = values(course);
        if (course && typeof course === 'object' && 'progress' in course && course.progress && typeof course.progress === 'object' && 'unitId' in course.progress && typeof course.progress.unitId === 'string')
            fields.unitId = course.progress.unitId;
        if (subject)
            fields.subject = subject;
        return { baseline: JSON.stringify(baseline), currentValues: fields, observation };
    }
    if (entity === 'progress') {
        const progress = current[`progress:${subject}`];
        return { baseline: JSON.stringify(progress), currentValues: values(progress), observation };
    }
    if (entity === 'openmaic') {
        const config = current.openmaic;
        const baseUrl = config && typeof config === 'object' && 'baseUrl' in config && typeof config.baseUrl === 'string' ? config.baseUrl : '';
        return { baseline: baseUrl, currentValues: { baseUrl }, observation };
    }
    return { baseline: JSON.stringify(current.interests ?? []), currentValues: { tags: JSON.stringify(current.interests ?? []) }, observation };
}
export const subjects = ['chinese', 'math', 'english'];
const read = (form, name) => String(form.get(name) ?? '').trim();
function useDraftValue({ useStore, draftKey, observation }, name) {
    const raw = useStore(state => state.drafts[draftKey]);
    const entry = readFormDraft(raw);
    return name && entry && (entry.confirmedFrom === observation || entry.edited.includes(name)) ? entry.values[name] : undefined;
}
/** Native controls read their declared draft before rendering and retain their DOM identity. */
export function DraftInput({ useStore, draftKey, observation, ...props }) {
    const retained = useDraftValue({ useStore, draftKey, observation }, props.name);
    const { defaultValue, defaultChecked, value, checked, onChange, ...rest } = props;
    return _jsx("input", { ...rest, ...(props.type === 'checkbox' ? { checked: retained === undefined ? checked ?? defaultChecked ?? false : retained === true || retained === 'on' } : { value: retained === undefined ? value ?? defaultValue ?? '' : String(retained) }), onChange: onChange ?? (() => { }) });
}
export function DraftSelect({ useStore, draftKey, observation, ...props }) {
    const retained = useDraftValue({ useStore, draftKey, observation }, props.name);
    const { defaultValue, value, onChange, ...rest } = props;
    return _jsx("select", { ...rest, value: retained === undefined ? value ?? defaultValue ?? '' : String(retained), onChange: onChange ?? (() => { }) });
}
export function DraftTextarea({ useStore, draftKey, observation, ...props }) {
    const retained = useDraftValue({ useStore, draftKey, observation }, props.name);
    const { defaultValue, value, onChange, ...rest } = props;
    return _jsx("textarea", { ...rest, value: retained === undefined ? value ?? defaultValue ?? '' : String(retained), onChange: onChange ?? (() => { }) });
}
/** Labelled native field with browser validation. */
export function Field({ name, label, value = '', type = 'text', min, max, required = true, ...draft }) {
    return _jsxs("label", { children: [label, _jsx(DraftInput, { ...draft, name: name, value: value, type: type, min: min, max: max, required: required, maxLength: 2000 })] });
}
export function SaveForm({ revision, baseline, submit, children, t, disabled = false, button = 'save', entity = 'confirmation', draftScope, currentValues, resetValues, observation = `${revision}:${baseline}`, useStore, actions }) {
    const key = formDraftKey(entity, draftScope);
    const retained = readFormDraft(useStore(state => state.drafts[key]));
    const edited = retained?.edited ?? [];
    const confirmed = retained?.confirmedFrom === observation;
    const base = retained && (confirmed || edited.length > 0 && retained.baseline !== baseline) ? { revision: retained.revision, baseline: retained.baseline } : { revision, baseline };
    const form = useRef(null);
    function retain(event) {
        const target = event.target;
        const names = new Set(edited);
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
            if (!target.name) {
                setSaved(false);
                return;
            }
            names.add(target.name);
        }
        if (!form.current)
            return;
        const values = { ...retained?.values, ...Object.fromEntries([...new FormData(form.current)].flatMap(([name, value]) => typeof value === 'string' ? [[name, value]] : [])) };
        for (const input of form.current.querySelectorAll('input[type="checkbox"]'))
            if (input instanceof HTMLInputElement && names.has(input.name))
                values[input.name] = input.checked ? 'on' : '';
        actions.setDraft(key, JSON.stringify({ ...base, edited: [...names], values, ...(confirmed ? { confirmedFrom: retained.confirmedFrom, observation: retained.observation } : {}) }));
        setSaved(false);
    }
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    function resolveDraft(keep) {
        if (!form.current)
            return;
        if (keep)
            actions.setDraft(key, JSON.stringify({ revision, baseline, edited, values: retained?.values ?? {} }));
        else {
            resetValues?.();
            actions.clearDraft(key);
        }
        setError('');
        setSaved(false);
    }
    async function save(event) {
        event.preventDefault();
        if (busy)
            return;
        const values = new FormData(event.currentTarget);
        const submitter = event.nativeEvent.submitter;
        if (submitter instanceof HTMLButtonElement)
            values.set('move', submitter.value);
        setBusy(true);
        setSaved(false);
        setError('');
        try {
            const result = await submit(values, base.revision, JSON.stringify({ baseline: base.baseline, editedFields: edited }));
            if (result && 'baseline' in result)
                actions.setDraft(key, JSON.stringify({ revision, baseline: result.baseline, edited: [], values: result.currentValues, confirmedFrom: observation, observation: result.observation }));
            else
                actions.clearDraft(key);
            setSaved(true);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setBusy(false);
        }
    }
    return _jsxs("form", { ref: form, onSubmit: event => { void save(event); }, onChange: retain, children: [_jsxs("fieldset", { disabled: disabled || busy, children: [children, button && _jsx("button", { type: "submit", children: busy ? t('busy') : t(button) })] }), error && _jsxs(_Fragment, { children: [_jsx("p", { role: "alert", children: error }), _jsxs("div", { className: "student-segments", children: [(currentValues || resetValues) && _jsx("button", { type: "button", disabled: disabled || busy, onClick: () => resolveDraft(false), children: t('useCurrentValues') }), _jsx("button", { type: "button", disabled: disabled || busy, onClick: () => resolveDraft(true), children: t('keepDraft') })] })] }), saved && _jsx("p", { role: "status", children: t('saved') })] });
}
/** Parent-confirmed setup or in-place profile update, plus an atomic textbook/course update. */
export function ParentSettings({ data, change, t, curriculum = null, subject = 'math', onSubject, draftScope, observation, useStore, actions }) {
    const [progressError, setProgressError] = useState('');
    const draft = { useStore, actions };
    const field = (entity, baseline) => ({ useStore, draftKey: formDraftKey(entity, draftScope), observation: observation ?? `${data.revision}:${baseline}` });
    const study = data.study;
    const profile = study?.profile;
    const profileBaseline = JSON.stringify(profile ?? null);
    const courseBaseline = JSON.stringify({ scope: profile ? { region: profile.region, grade: profile.grade, term: profile.term, schoolYear: profile.schoolYear, schoolSystem: profile.schoolSystem } : undefined, course: study?.courses.find(item => item.subject === subject) });
    const progressBaseline = JSON.stringify(study?.courses.find(course => course.subject === subject)?.progress ?? null);
    const today = new Date(data.serverNow + 8 * 60 * 60 * 1000);
    const currentYear = today.getUTCFullYear() - (today.getUTCMonth() < 8 ? 1 : 0);
    const years = Array.from({ length: 7 }, (_, index) => `${currentYear + 1 - index}–${currentYear + 2 - index}`);
    return _jsxs("section", { children: [_jsx("p", { children: t('parentHelp') }), _jsxs(SaveForm, { ...draft, observation: observation, draftScope: draftScope, entity: "profile", currentValues: profile ?? {}, revision: data.revision, baseline: profileBaseline, t: t, submit: (form, revision, original) => change({
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
                }, revision, original).then(result => savedSettingsForm(result, 'profile', original)), children: [_jsx(Field, { ...field('profile', profileBaseline), name: "nickname", label: t('nickname'), value: profile?.nickname ?? '' }), _jsx(Field, { ...field('profile', profileBaseline), name: "region", label: t('region'), value: profile?.region ?? '上海市' }), _jsx(Field, { ...field('profile', profileBaseline), name: "grade", label: t('grade'), value: profile?.grade ?? 2, type: "number", min: 1, max: 6 }), _jsxs("label", { children: [t('term'), _jsxs(DraftSelect, { ...field('profile', profileBaseline), name: "term", "aria-label": t('term'), defaultValue: profile?.term ?? 'first', children: [_jsx("option", { value: "first", children: t('first') }), _jsx("option", { value: "second", children: t('second') })] })] }), _jsxs("label", { children: [t('schoolYear'), _jsxs(DraftSelect, { ...field('profile', profileBaseline), name: "schoolYear", "aria-label": t('schoolYear'), defaultValue: profile?.schoolYear ?? '', required: true, children: [_jsx("option", { value: "", disabled: true, children: t('chooseSchoolYear') }), years.map(year => _jsx("option", { value: year, children: year }, year))] })] }), _jsx("p", { children: t('schoolYearHelp') }), _jsx(Field, { ...field('profile', profileBaseline), name: "schoolAlias", label: t('schoolAlias'), value: profile?.schoolAlias ?? '', required: false }), _jsx("p", { children: t('schoolAliasHelp') }), _jsxs("label", { children: [t('schoolSystem'), _jsxs(DraftSelect, { ...field('profile', profileBaseline), name: "schoolSystem", "aria-label": t('schoolSystem'), defaultValue: profile?.schoolSystem ?? 'five-four', children: [_jsx("option", { value: "five-four", children: t('five-four') }), _jsx("option", { value: "six-three", children: t('six-three') })] })] })] }), profile && _jsxs(_Fragment, { children: [_jsx("h3", { children: t('curriculum') }), _jsx("p", { children: t('materialHelp') }), study.courses.map(course => _jsxs("p", { children: [t(course.subject), " \u00B7 ", study.materials.find(item => item.id === course.materialId)?.title, " \u00B7 ", course.unit] }, course.subject)), _jsxs(SaveForm, { ...draft, observation: observation, draftScope: draftScope, entity: `course:${subject}`, currentValues: { subject, unitId: study.courses.find(item => item.subject === subject)?.progress?.unitId ?? '', unit: study.courses.find(item => item.subject === subject)?.unit ?? '' }, revision: data.revision, baseline: courseBaseline, t: t, submit: async (form, revision, original) => {
                            const materialId = crypto.randomUUID();
                            const selected = read(form, 'subject');
                            const courseSubject = subjects.find(item => item === selected) ?? subject;
                            const unitId = read(form, 'unitId');
                            const unit = curriculum?.scope.current ? curriculum.units.find(item => item.id === unitId) : undefined;
                            const { region, grade, term, schoolYear, schoolSystem } = profile;
                            const existing = study.courses.find(item => item.subject === courseSubject)?.progress;
                            return change({ action: 'configure-course', material: { id: materialId, subject: courseSubject, scope: { region, grade, term, schoolYear, schoolSystem }, title: curriculum?.scope.current ? curriculum.title : t(courseSubject), publisher: t('mapMaterialPublisher'), edition: curriculum?.scope.current ? curriculum.id : t('mapMaterialEdition'), editionStatus: 'identified', kind: 'official-textbook', locator: curriculum?.scope.current ? `knowledge/curriculum/${curriculum.id}.json` : t('mapMaterialLocator'), evidence: t('mapMaterialEvidence') }, course: { subject: courseSubject, materialId, unit: unit?.name ?? read(form, 'unit'), parentConfirmation: t('materialConfirm') }, ...(unit ? { progress: { unitId: unit.id, posture: existing?.posture ?? 'keep-up', preview: existing?.preview ? 'on' : 'off', pace: existing?.pace ?? 'teaching', parentConfirmation: t('confirmSchoolProgress') } } : {}) }, revision, original).then(result => savedSettingsForm(result, 'course', original, courseSubject));
                        }, children: [_jsxs("label", { children: [t('subject'), _jsx(DraftSelect, { ...field(`course:${subject}`, courseBaseline), name: "subject", "aria-label": t('subject'), value: subject, onChange: event => { const next = subjects.find(item => item === event.target.value); if (next)
                                            onSubject?.(next); }, children: subjects.map(item => _jsx("option", { value: item, children: t(item) }, item)) })] }), curriculum?.scope.current ? _jsxs("label", { children: [t('unit'), _createElement(DraftSelect, { ...field(`course:${subject}`, courseBaseline), name: "unitId", "aria-label": t('unit'), key: subject, defaultValue: study.courses.find(item => item.subject === subject)?.progress?.unitId ?? '', required: true },
                                        _jsx("option", { value: "", disabled: true, children: t('chooseUnit') }),
                                        curriculum.units.map(unit => _jsx("option", { value: unit.id, children: unit.name }, unit.id)))] }) : _jsx(Field, { ...field(`course:${subject}`, courseBaseline), name: "unit", label: t('unit') })] }), curriculum?.scope.current && _jsxs(_Fragment, { children: [_jsx("h3", { children: t('schoolFrontier') }), _jsx("p", { children: t('schoolProgressHelp') }), onSubject && _jsx("nav", { className: "student-segments", "aria-label": t('schoolFrontier'), children: subjects.map(item => _jsx("button", { type: "button", "aria-pressed": subject === item, onClick: () => onSubject(item), children: t(item) }, item)) }), study.courses.some(course => course.subject === subject) ? _jsxs(SaveForm, { ...draft, observation: observation, draftScope: draftScope, entity: `progress:${subject}`, currentValues: study.courses.find(course => course.subject === subject)?.progress ?? {}, revision: data.revision, baseline: progressBaseline, t: t, button: false, submit: (form, revision, original) => {
                                    const move = form.get('move') ?? 'stay';
                                    const units = curriculum.units;
                                    const selected = String(form.get('unitId') ?? '');
                                    const index = units.findIndex(unit => unit.id === selected);
                                    const next = units[index + 1];
                                    if (index < 0)
                                        throw new Error(t('chooseUnit'));
                                    if (move === 'next' && !next)
                                        throw new Error(t('noNextUnit'));
                                    setProgressError('');
                                    return change({ action: 'school-progress', subject, unitId: move === 'next' && next ? next.id : selected, posture: form.get('posture') === 'catch-up' ? 'catch-up' : 'keep-up', preview: form.get('preview') === 'on' ? 'on' : 'off', pace: move === 'review' ? 'review' : 'teaching', parentConfirmation: t('confirmSchoolProgress') }, revision, original).then(result => savedSettingsForm(result, 'progress', original, subject));
                                }, children: [_jsxs("label", { children: [t('schoolFrontier'), _jsx(DraftSelect, { ...field(`progress:${subject}`, progressBaseline), name: "unitId", "aria-label": t('schoolFrontier'), defaultValue: study.courses.find(course => course.subject === subject)?.progress?.unitId ?? curriculum.units[0]?.id, required: true, children: curriculum.units.map(unit => _jsx("option", { value: unit.id, children: unit.name }, unit.id)) })] }), _jsxs("label", { children: [t('keepUp'), _jsxs(DraftSelect, { ...field(`progress:${subject}`, progressBaseline), name: "posture", "aria-label": t('keepUp'), defaultValue: study.courses.find(course => course.subject === subject)?.progress?.posture ?? 'keep-up', children: [_jsx("option", { value: "keep-up", children: t('keepUp') }), _jsx("option", { value: "catch-up", children: t('catchUp') })] })] }), _jsxs("label", { className: "student-check", children: [_jsx(DraftInput, { ...field(`progress:${subject}`, progressBaseline), type: "checkbox", name: "preview", defaultChecked: study.courses.find(course => course.subject === subject)?.progress?.preview === true }), t('previewUnit')] }), progressError && _jsx("p", { role: "alert", children: progressError }), _jsxs("div", { className: "student-segments", children: [_jsx("button", { type: "submit", value: "stay", children: t('stillThisUnit') }), _jsx("button", { type: "submit", value: "next", children: t('nextSchoolUnit') }), _jsx("button", { type: "submit", value: "review", children: t('reviewWeek') })] })] }) : _jsx("p", { children: t('schoolProgressNeedsCourse') })] }), _jsx(InterestsForm, { ...draft, tags: study.interests, revision: data.revision, change: change, t: t, draftScope: draftScope, observation: observation }), _jsx("h3", { children: t('openmaicTitle') }), _jsx("p", { className: "student-muted", children: t('openmaicBaseHelp') }), _jsxs("p", { children: [t('openmaicEffective'), ": ", data.interactiveLessons.baseUrl] }), _jsxs(SaveForm, { ...draft, observation: observation, draftScope: draftScope, entity: "openmaic", currentValues: { baseUrl: study.openmaic?.savedBaseUrl ?? '' }, revision: data.revision, baseline: study.openmaic?.savedBaseUrl ?? '', t: t, submit: (form, revision, original) => change({ action: 'openmaic-settings', baseUrl: read(form, 'baseUrl'), parentConfirmation: t('openmaicConfirm') }, revision, original).then(result => savedSettingsForm(result, 'openmaic', original)), children: [_jsx(Field, { ...field('openmaic', study.openmaic?.savedBaseUrl ?? ''), name: "baseUrl", label: t('openmaicBase'), value: study.openmaic?.savedBaseUrl ?? '', required: false }), _jsx("p", { className: "student-muted", children: t('openmaicAccessHint') })] }), data.study && _jsxs("div", { children: [_jsx("h3", { children: t('archiveTerm') }), _jsx("p", { className: "student-muted", children: t('archiveTermHelp') }), _jsx("button", { type: "button", disabled: !!study.active, onClick: () => {
                                    if (!window.confirm(t('archiveTermConfirm')))
                                        return;
                                    void change({ action: 'archive-term', parentConfirmation: t('archiveTermConfirmation') }, data.revision).catch(() => { });
                                }, children: t('archiveTerm') })] })] })] });
}
/** Parent theme tags. The saved list is edited here; an empty profile shows the example tags from status. */
function InterestsForm({ tags, revision, change, t, draftScope, observation, useStore, actions }) {
    const draft = { useStore, actions };
    const key = formDraftKey('interests', draftScope);
    const retained = readFormDraft(useStore(state => state.drafts[key]));
    const baseline = JSON.stringify(tags);
    const observed = observation ?? `${revision}:${baseline}`;
    const stored = retained && (retained.edited.length > 0 || retained.confirmedFrom === observed) ? retained.values.tags : undefined;
    let tagsDraft = tags;
    try {
        const saved = typeof stored === 'string' ? JSON.parse(stored) : undefined;
        if (Array.isArray(saved) && saved.every(item => typeof item === 'string'))
            tagsDraft = saved;
    }
    catch { /* A malformed browser draft supplies no edited tags. */ }
    function updateTags(next) {
        actions.setDraft(key, JSON.stringify({ ...(retained ?? { revision, baseline }), edited: ['tags'], values: { tags: JSON.stringify(next) } }));
    }
    return _jsxs(SaveForm, { ...draft, observation: observation, draftScope: draftScope, entity: "interests", currentValues: { tags: baseline }, revision: revision, baseline: JSON.stringify(tags), t: t, submit: async (_form, nextRevision, original) => {
            const next = [...new Set(tagsDraft.map(tag => tag.trim()).filter(tag => tag !== ''))];
            if (next.length < 3 || next.length > 8)
                throw new Error(t('interestCount'));
            if (next.some(tag => !INTEREST_TAG.test(tag)))
                throw new Error(t('interestShape'));
            const result = await change({ action: 'interests', tags: next, parentConfirmation: t('interestConfirm') }, nextRevision, original);
            return savedSettingsForm(result, 'interests', original);
        }, children: [_jsx("h3", { children: t('interestsTitle') }), _jsx("p", { className: "student-muted", children: t('interestsHelp') }), tagsDraft.map((tag, index) => _jsxs("label", { children: [t('interestTag'), " ", index + 1, _jsx("input", { "aria-label": `${t('interestTag')} ${index + 1}`, value: tag, required: true, minLength: 2, maxLength: 16, onChange: event => updateTags(tagsDraft.map((item, itemIndex) => itemIndex === index ? event.target.value : item)) })] }, index)), _jsxs("div", { className: "student-segments", children: [tagsDraft.length < 8 && _jsx("button", { type: "button", onClick: () => updateTags([...tagsDraft, '']), children: t('addInterest') }), tagsDraft.length > 3 && _jsx("button", { type: "button", onClick: () => updateTags(tagsDraft.slice(0, -1)), children: t('removeInterest') })] })] });
}
/** Confirmation retains the unedited image transcription until a user explicitly saves it. */
export function MistakeConfirmation({ mistake, revision, change, t, useStore, actions }) {
    const field = { useStore, draftKey: formDraftKey(`mistake:${mistake.id}`), observation: `${revision}:${JSON.stringify(mistake)}` };
    return _jsxs("details", { children: [_jsx("summary", { children: mistake.topic }), _jsxs("p", { children: [t('learnerAnswer'), ": ", mistake.learnerAnswer] }), mistake.uncertainties && _jsxs("p", { children: [t('uncertainties'), ": ", mistake.uncertainties] }), _jsxs(SaveForm, { useStore: useStore, actions: actions, entity: `mistake:${mistake.id}`, revision: revision, baseline: JSON.stringify(mistake), t: t, button: "confirm", submit: (form, base) => {
                    const picked = read(form, 'errorType');
                    const errorType = errorTypesBySubject[mistake.subject].find(candidate => candidate === picked);
                    return change({ action: 'confirm-mistake', id: mistake.id, prompt: read(form, 'prompt'), learnerAnswer: read(form, 'learnerAnswer'), correction: read(form, 'correction'), explanation: read(form, 'explanation'), answerEvidence: read(form, 'answerEvidence'), ...(errorType !== undefined ? { errorType } : {}), userConfirmation: t('confirmMistake') }, base);
                }, children: [['prompt', 'learnerAnswer', 'correction', 'explanation', 'answerEvidence'].map(name => _jsxs("label", { children: [t(name), _jsx(DraftTextarea, { ...field, "aria-label": t(name), name: name, defaultValue: mistake[name], required: true, maxLength: 2000 })] }, name)), _jsxs("label", { children: [t('errorTypeLabel'), _jsxs(DraftSelect, { ...field, name: "errorType", defaultValue: mistake.errorType ?? '', children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[mistake.subject].map(type => _jsx("option", { value: type, children: t(type) }, type))] })] })] })] });
}
//# sourceMappingURL=forms.js.map