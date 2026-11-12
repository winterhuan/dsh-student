import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useDraftStorage } from "./drafts.js";
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
    return { baseline: JSON.stringify(current.interests ?? []), currentValues: {}, observation };
}
export const subjects = ['chinese', 'math', 'english'];
const read = (form, name) => String(form.get(name) ?? '').trim();
/** Labelled native field with browser validation. */
export function Field({ name, label, value = '', type = 'text', min, max, required = true }) {
    return _jsxs("label", { children: [label, _jsx("input", { name: name, defaultValue: value, type: type, min: min, max: max, required: required, maxLength: 2000 })] });
}
export function SaveForm({ revision, baseline, submit, children, t, disabled = false, button = 'save', entity = 'confirmation', draftScope, currentValues, resetValues, observation = `${revision}:${baseline}` }) {
    const storage = useDraftStorage(entity, draftScope);
    const form = useRef(null);
    const [base, setBase] = useState({ revision, baseline });
    const dirty = useRef(false);
    const edited = useRef(new Set());
    const confirmed = useRef();
    useEffect(() => {
        const retained = storage.read();
        if (!retained || !form.current)
            return;
        try {
            const entry = JSON.parse(retained);
            if (typeof entry.baseline !== 'string' || typeof entry.revision !== 'number' || !entry.values || typeof entry.values !== 'object')
                return;
            if (Array.isArray(entry.edited))
                for (const name of entry.edited)
                    if (typeof name === 'string')
                        edited.current.add(name);
            if (entry.confirmedFrom !== undefined && entry.confirmedFrom !== observation && !edited.current.size) {
                storage.clear();
                return;
            }
            if (entry.confirmedFrom === observation)
                confirmed.current = { from: observation, snapshot: { baseline: entry.baseline, currentValues: entry.values, observation: entry.observation } };
            for (const input of form.current.querySelectorAll('input,textarea,select')) {
                if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement))
                    continue;
                if (!confirmed.current && !edited.current.has(input.name))
                    continue;
                const value = entry.values[input.name];
                if (input instanceof HTMLInputElement && input.type === 'checkbox')
                    input.checked = value === true || value === 'on';
                else if (typeof value === 'string' || typeof value === 'number')
                    input.value = String(value);
            }
            setBase({ revision: entry.revision, baseline: entry.baseline });
            dirty.current = edited.current.size > 0 || !confirmed.current;
        }
        catch {
            storage.clear();
        }
    }, []);
    useEffect(() => {
        if (confirmed.current?.from === observation)
            return;
        if (confirmed.current) {
            confirmed.current = undefined;
            if (!dirty.current)
                storage.clear();
        }
        setBase(previous => !dirty.current || previous.baseline === baseline ? { revision, baseline } : previous);
        for (const input of form.current?.querySelectorAll('input,textarea,select') ?? []) {
            if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) || edited.current.has(input.name))
                continue;
            const value = currentValues?.[input.name];
            if (value === undefined)
                continue;
            if (input instanceof HTMLInputElement && input.type === 'checkbox')
                input.checked = value === true;
            else
                input.value = String(value);
        }
    }, [revision, baseline, observation]);
    function retain(event) {
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)
            edited.current.add(target.name);
        if (!form.current)
            return;
        dirty.current = true;
        const values = Object.fromEntries(new FormData(form.current));
        for (const input of form.current.querySelectorAll('input[type="checkbox"]'))
            if (input instanceof HTMLInputElement && edited.current.has(input.name))
                values[input.name] = input.checked ? 'on' : '';
        storage.write(JSON.stringify({ ...base, edited: [...edited.current], values, confirmedFrom: confirmed.current?.from, observation: confirmed.current?.snapshot.observation }));
        setSaved(false);
    }
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    function resolveDraft(keep) {
        if (!form.current)
            return;
        if (!keep) {
            for (const input of form.current.querySelectorAll('input,textarea,select')) {
                if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement))
                    continue;
                const value = currentValues?.[input.name];
                if (value === undefined)
                    continue;
                if (input instanceof HTMLInputElement && input.type === 'checkbox')
                    input.checked = value === true;
                else
                    input.value = String(value);
            }
            resetValues?.();
            dirty.current = false;
            edited.current.clear();
            storage.clear();
        }
        else {
            storage.write(JSON.stringify({ revision, baseline, edited: [...edited.current], values: Object.fromEntries(new FormData(form.current)) }));
        }
        setBase({ revision, baseline });
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
            const result = await submit(values, base.revision, JSON.stringify({ baseline: base.baseline, editedFields: [...edited.current] }));
            dirty.current = false;
            edited.current.clear();
            storage.clear();
            if (result && 'baseline' in result) {
                confirmed.current = { from: observation, snapshot: result };
                setBase({ revision, baseline: result.baseline });
                for (const input of form.current?.querySelectorAll('input,textarea,select') ?? []) {
                    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement))
                        continue;
                    const value = result.currentValues[input.name];
                    if (value === undefined)
                        continue;
                    if (input instanceof HTMLInputElement && input.type === 'checkbox')
                        input.checked = value === true;
                    else
                        input.value = String(value);
                }
                storage.write(JSON.stringify({ revision, baseline: result.baseline, edited: [], values: result.currentValues, confirmedFrom: observation, observation: result.observation }));
            }
            else
                setBase({ revision, baseline });
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
export function ParentSettings({ data, change, t, curriculum = null, subject = 'math', onSubject, draftScope, observation }) {
    const [progressError, setProgressError] = useState('');
    const study = data.study;
    const profile = study?.profile;
    const today = new Date(data.serverNow + 8 * 60 * 60 * 1000);
    const currentYear = today.getUTCFullYear() - (today.getUTCMonth() < 8 ? 1 : 0);
    const years = Array.from({ length: 7 }, (_, index) => `${currentYear + 1 - index}–${currentYear + 2 - index}`);
    return _jsxs("section", { children: [_jsx("p", { children: t('parentHelp') }), _jsxs(SaveForm, { observation: observation, draftScope: draftScope, entity: "profile", currentValues: profile ?? {}, revision: data.revision, baseline: JSON.stringify(profile ?? null), t: t, submit: (form, revision, original) => change({
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
                }, revision, original).then(result => savedSettingsForm(result, 'profile', original)), children: [_jsx(Field, { name: "nickname", label: t('nickname'), value: profile?.nickname ?? '' }), _jsx(Field, { name: "region", label: t('region'), value: profile?.region ?? '上海市' }), _jsx(Field, { name: "grade", label: t('grade'), value: profile?.grade ?? 2, type: "number", min: 1, max: 6 }), _jsxs("label", { children: [t('term'), _jsxs("select", { name: "term", "aria-label": t('term'), defaultValue: profile?.term ?? 'first', children: [_jsx("option", { value: "first", children: t('first') }), _jsx("option", { value: "second", children: t('second') })] })] }), _jsxs("label", { children: [t('schoolYear'), _jsxs("select", { name: "schoolYear", "aria-label": t('schoolYear'), defaultValue: profile?.schoolYear ?? '', required: true, children: [_jsx("option", { value: "", disabled: true, children: t('chooseSchoolYear') }), years.map(year => _jsx("option", { value: year, children: year }, year))] })] }), _jsx("p", { children: t('schoolYearHelp') }), _jsx(Field, { name: "schoolAlias", label: t('schoolAlias'), value: profile?.schoolAlias ?? '', required: false }), _jsx("p", { children: t('schoolAliasHelp') }), _jsxs("label", { children: [t('schoolSystem'), _jsxs("select", { name: "schoolSystem", "aria-label": t('schoolSystem'), defaultValue: profile?.schoolSystem ?? 'five-four', children: [_jsx("option", { value: "five-four", children: t('five-four') }), _jsx("option", { value: "six-three", children: t('six-three') })] })] })] }), profile && _jsxs(_Fragment, { children: [_jsx("h3", { children: t('curriculum') }), _jsx("p", { children: t('materialHelp') }), study.courses.map(course => _jsxs("p", { children: [t(course.subject), " \u00B7 ", study.materials.find(item => item.id === course.materialId)?.title, " \u00B7 ", course.unit] }, course.subject)), _jsxs(SaveForm, { observation: observation, draftScope: draftScope, entity: `course:${subject}`, currentValues: { subject, unitId: study.courses.find(item => item.subject === subject)?.progress?.unitId ?? '', unit: study.courses.find(item => item.subject === subject)?.unit ?? '' }, revision: data.revision, baseline: JSON.stringify({ scope: { region: profile.region, grade: profile.grade, term: profile.term, schoolYear: profile.schoolYear, schoolSystem: profile.schoolSystem }, course: study.courses.find(item => item.subject === subject) }), t: t, submit: async (form, revision, original) => {
                            const materialId = crypto.randomUUID();
                            const selected = read(form, 'subject');
                            const courseSubject = subjects.find(item => item === selected) ?? subject;
                            const unitId = read(form, 'unitId');
                            const unit = curriculum?.scope.current ? curriculum.units.find(item => item.id === unitId) : undefined;
                            const { region, grade, term, schoolYear, schoolSystem } = profile;
                            const existing = study.courses.find(item => item.subject === courseSubject)?.progress;
                            return change({ action: 'configure-course', material: { id: materialId, subject: courseSubject, scope: { region, grade, term, schoolYear, schoolSystem }, title: curriculum?.scope.current ? curriculum.title : t(courseSubject), publisher: t('mapMaterialPublisher'), edition: curriculum?.scope.current ? curriculum.id : t('mapMaterialEdition'), editionStatus: 'identified', kind: 'official-textbook', locator: curriculum?.scope.current ? `knowledge/curriculum/${curriculum.id}.json` : t('mapMaterialLocator'), evidence: t('mapMaterialEvidence') }, course: { subject: courseSubject, materialId, unit: unit?.name ?? read(form, 'unit'), parentConfirmation: t('materialConfirm') }, ...(unit ? { progress: { unitId: unit.id, posture: existing?.posture ?? 'keep-up', preview: existing?.preview ? 'on' : 'off', pace: existing?.pace ?? 'teaching', parentConfirmation: t('confirmSchoolProgress') } } : {}) }, revision, original).then(result => savedSettingsForm(result, 'course', original, courseSubject));
                        }, children: [_jsxs("label", { children: [t('subject'), _jsx("select", { name: "subject", "aria-label": t('subject'), value: subject, onChange: event => { const next = subjects.find(item => item === event.target.value); if (next)
                                            onSubject?.(next); }, children: subjects.map(item => _jsx("option", { value: item, children: t(item) }, item)) })] }), curriculum?.scope.current ? _jsxs("label", { children: [t('unit'), _jsxs("select", { name: "unitId", "aria-label": t('unit'), defaultValue: study.courses.find(item => item.subject === subject)?.progress?.unitId ?? '', required: true, children: [_jsx("option", { value: "", disabled: true, children: t('chooseUnit') }), curriculum.units.map(unit => _jsx("option", { value: unit.id, children: unit.name }, unit.id))] }, subject)] }) : _jsx(Field, { name: "unit", label: t('unit') })] }), curriculum?.scope.current && _jsxs(_Fragment, { children: [_jsx("h3", { children: t('schoolFrontier') }), _jsx("p", { children: t('schoolProgressHelp') }), onSubject && _jsx("nav", { className: "student-segments", "aria-label": t('schoolFrontier'), children: subjects.map(item => _jsx("button", { type: "button", "aria-pressed": subject === item, onClick: () => onSubject(item), children: t(item) }, item)) }), study.courses.some(course => course.subject === subject) ? _jsxs(SaveForm, { observation: observation, draftScope: draftScope, entity: `progress:${subject}`, currentValues: study.courses.find(course => course.subject === subject)?.progress ?? {}, revision: data.revision, baseline: JSON.stringify(study.courses.find(course => course.subject === subject)?.progress ?? null), t: t, button: false, submit: (form, revision, original) => {
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
                                }, children: [_jsxs("label", { children: [t('schoolFrontier'), _jsx("select", { name: "unitId", "aria-label": t('schoolFrontier'), defaultValue: study.courses.find(course => course.subject === subject)?.progress?.unitId ?? curriculum.units[0]?.id, required: true, children: curriculum.units.map(unit => _jsx("option", { value: unit.id, children: unit.name }, unit.id)) })] }), _jsxs("label", { children: [t('keepUp'), _jsxs("select", { name: "posture", "aria-label": t('keepUp'), defaultValue: study.courses.find(course => course.subject === subject)?.progress?.posture ?? 'keep-up', children: [_jsx("option", { value: "keep-up", children: t('keepUp') }), _jsx("option", { value: "catch-up", children: t('catchUp') })] })] }), _jsxs("label", { className: "student-check", children: [_jsx("input", { type: "checkbox", name: "preview", defaultChecked: study.courses.find(course => course.subject === subject)?.progress?.preview === true }), t('previewUnit')] }), progressError && _jsx("p", { role: "alert", children: progressError }), _jsxs("div", { className: "student-segments", children: [_jsx("button", { type: "submit", value: "stay", children: t('stillThisUnit') }), _jsx("button", { type: "submit", value: "next", children: t('nextSchoolUnit') }), _jsx("button", { type: "submit", value: "review", children: t('reviewWeek') })] })] }) : _jsx("p", { children: t('schoolProgressNeedsCourse') })] }), _jsx(InterestsForm, { tags: study.interests, revision: data.revision, change: change, t: t, draftScope: draftScope, observation: observation }), _jsx("h3", { children: t('openmaicTitle') }), _jsx("p", { className: "student-muted", children: t('openmaicBaseHelp') }), _jsxs("p", { children: [t('openmaicEffective'), ": ", data.interactiveLessons.baseUrl] }), _jsxs(SaveForm, { observation: observation, draftScope: draftScope, entity: "openmaic", currentValues: { baseUrl: study.openmaic?.savedBaseUrl ?? '' }, revision: data.revision, baseline: study.openmaic?.savedBaseUrl ?? '', t: t, submit: (form, revision, original) => change({ action: 'openmaic-settings', baseUrl: read(form, 'baseUrl'), parentConfirmation: t('openmaicConfirm') }, revision, original).then(result => savedSettingsForm(result, 'openmaic', original)), children: [_jsx(Field, { name: "baseUrl", label: t('openmaicBase'), value: study.openmaic?.savedBaseUrl ?? '', required: false }), _jsx("p", { className: "student-muted", children: t('openmaicAccessHint') })] }), data.study && _jsxs("div", { children: [_jsx("h3", { children: t('archiveTerm') }), _jsx("p", { className: "student-muted", children: t('archiveTermHelp') }), _jsx("button", { type: "button", disabled: !!study.active, onClick: () => {
                                    if (!window.confirm(t('archiveTermConfirm')))
                                        return;
                                    void change({ action: 'archive-term', parentConfirmation: t('archiveTermConfirmation') }, data.revision).catch(() => { });
                                }, children: t('archiveTerm') })] })] })] });
}
/** Parent theme tags. The saved list is edited here; an empty profile shows the example tags from status. */
function InterestsForm({ tags, revision, change, t, draftScope, observation }) {
    const storage = useDraftStorage('interests-values', draftScope);
    const [draft, setDraft] = useState(() => {
        try {
            const saved = JSON.parse(storage.read() ?? 'null');
            return Array.isArray(saved) && saved.every(item => typeof item === 'string') ? saved : tags;
        }
        catch {
            return tags;
        }
    });
    function updateTags(next) { setDraft(next); storage.write(JSON.stringify(next)); }
    return _jsxs(SaveForm, { observation: observation, draftScope: draftScope, entity: "interests", resetValues: () => { setDraft(tags); storage.clear(); }, revision: revision, baseline: JSON.stringify(tags), t: t, submit: async (_form, nextRevision, original) => {
            const next = [...new Set(draft.map(tag => tag.trim()).filter(tag => tag !== ''))];
            if (next.length < 3 || next.length > 8)
                throw new Error(t('interestCount'));
            if (next.some(tag => !INTEREST_TAG.test(tag)))
                throw new Error(t('interestShape'));
            const result = await change({ action: 'interests', tags: next, parentConfirmation: t('interestConfirm') }, nextRevision, original);
            storage.clear();
            const saved = savedSettingsForm(result, 'interests', original);
            if ('baseline' in saved)
                setDraft(JSON.parse(saved.baseline));
            return saved;
        }, children: [_jsx("h3", { children: t('interestsTitle') }), _jsx("p", { className: "student-muted", children: t('interestsHelp') }), draft.map((tag, index) => _jsxs("label", { children: [t('interestTag'), " ", index + 1, _jsx("input", { "aria-label": `${t('interestTag')} ${index + 1}`, value: tag, required: true, minLength: 2, maxLength: 16, onChange: event => updateTags(draft.map((item, itemIndex) => itemIndex === index ? event.target.value : item)) })] }, index)), _jsxs("div", { className: "student-segments", children: [draft.length < 8 && _jsx("button", { type: "button", onClick: () => updateTags([...draft, '']), children: t('addInterest') }), draft.length > 3 && _jsx("button", { type: "button", onClick: () => updateTags(draft.slice(0, -1)), children: t('removeInterest') })] })] });
}
/** Confirmation retains the unedited image transcription until a user explicitly saves it. */
export function MistakeConfirmation({ mistake, revision, change, t }) {
    return _jsxs("details", { children: [_jsx("summary", { children: mistake.topic }), _jsxs("p", { children: [t('learnerAnswer'), ": ", mistake.learnerAnswer] }), mistake.uncertainties && _jsxs("p", { children: [t('uncertainties'), ": ", mistake.uncertainties] }), _jsxs(SaveForm, { entity: `mistake:${mistake.id}`, revision: revision, baseline: JSON.stringify(mistake), t: t, button: "confirm", submit: (form, base) => {
                    const picked = read(form, 'errorType');
                    const errorType = errorTypesBySubject[mistake.subject].find(candidate => candidate === picked);
                    return change({ action: 'confirm-mistake', id: mistake.id, prompt: read(form, 'prompt'), learnerAnswer: read(form, 'learnerAnswer'), correction: read(form, 'correction'), explanation: read(form, 'explanation'), answerEvidence: read(form, 'answerEvidence'), ...(errorType !== undefined ? { errorType } : {}), userConfirmation: t('confirmMistake') }, base);
                }, children: [['prompt', 'learnerAnswer', 'correction', 'explanation', 'answerEvidence'].map(name => _jsxs("label", { children: [t(name), _jsx("textarea", { "aria-label": t(name), name: name, defaultValue: mistake[name], required: true, maxLength: 2000 })] }, name)), _jsxs("label", { children: [t('errorTypeLabel'), _jsxs("select", { name: "errorType", defaultValue: mistake.errorType ?? '', children: [_jsx("option", { value: "", children: t('errorTypeNone') }), errorTypesBySubject[mistake.subject].map(type => _jsx("option", { value: type, children: t(type) }, type))] })] })] })] });
}
//# sourceMappingURL=forms.js.map