import { useRef, useState, type FormEvent, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { readFormDraft, formDraftKey, type DraftProps, type FormDraft } from './drafts.tsx'
import { INTEREST_TAG } from '../interests.ts'
import type { Command, StudyState } from '../schema.ts'
import { errorTypesBySubject } from '../vocabulary.ts'
import type { Dashboard } from '../dashboard.ts'
import type { Translate } from './locales.ts'
import type { StudentManualReply } from '../types.ts'

export type ChangeStudy = (command: Command, revision?: number, baseline?: string) => Promise<Dashboard & { manual?: StudentManualReply }>
/** Confirmed edited values and their original-owner observation for immediate edits and remounts. */
export interface SavedFormSnapshot { baseline: string; currentValues: Record<string, string | number | boolean | undefined>; observation: string }

function savedSettingsForm(result: Awaited<ReturnType<ChangeStudy>>, entity: 'profile' | 'course' | 'progress' | 'openmaic' | 'interests', original: string, subject?: string): Dashboard | SavedFormSnapshot {
  if (!result.manual) return result
  const current = result.manual.current
  const observation = result.manual.versions.find(file => file.path === '.study/settings.json')!.version
  const retained = JSON.parse(original).baseline
  const values = (value: unknown): SavedFormSnapshot['currentValues'] => value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string | number | boolean] => ['string', 'number', 'boolean'].includes(typeof entry[1]))) : {}
  if (entity === 'profile') {
    const profile = JSON.parse(retained) ?? {}
    for (const [key, value] of Object.entries(current)) if (key.startsWith('profile:')) profile[key.slice(8)] = value
    return { baseline: JSON.stringify(profile), currentValues: values(profile), observation }
  }
  if (entity === 'course') {
    const baseline = JSON.parse(retained)
    const course = current[`course:${subject}`]
    baseline.course = course
    const fields = values(course)
    if (course && typeof course === 'object' && 'progress' in course && course.progress && typeof course.progress === 'object' && 'unitId' in course.progress && typeof course.progress.unitId === 'string') fields.unitId = course.progress.unitId
    if (subject) fields.subject = subject
    return { baseline: JSON.stringify(baseline), currentValues: fields, observation }
  }
  if (entity === 'progress') { const progress = current[`progress:${subject}`]; return { baseline: JSON.stringify(progress), currentValues: values(progress), observation } }
  if (entity === 'openmaic') { const config = current.openmaic; const baseUrl = config && typeof config === 'object' && 'baseUrl' in config && typeof config.baseUrl === 'string' ? config.baseUrl : ''; return { baseline: baseUrl, currentValues: { baseUrl }, observation } }
  return { baseline: JSON.stringify(current.interests ?? []), currentValues: { tags: JSON.stringify(current.interests ?? []) }, observation }
}
export const subjects = ['chinese', 'math', 'english'] as const
const read = (form: FormData, name: string) => String(form.get(name) ?? '').trim()

type DraftControlProps = Pick<DraftProps, 'useStore'> & { draftKey: string; observation: string }
function useDraftValue({ useStore, draftKey, observation }: DraftControlProps, name: string | undefined) {
  const raw = useStore(state => state.drafts[draftKey])
  const entry = readFormDraft(raw)
  return name && entry && (entry.confirmedFrom === observation || entry.edited.includes(name)) ? entry.values[name] : undefined
}

/** Native controls read their declared draft before rendering and retain their DOM identity. */
export function DraftInput({ useStore, draftKey, observation, ...props }: DraftControlProps & InputHTMLAttributes<HTMLInputElement>) {
  const retained = useDraftValue({ useStore, draftKey, observation }, props.name)
  const { defaultValue, defaultChecked, value, checked, onChange, ...rest } = props
  return <input {...rest} {...(props.type === 'checkbox' ? { checked: retained === undefined ? checked ?? defaultChecked ?? false : retained === true || retained === 'on' } : { value: retained === undefined ? value ?? defaultValue ?? '' : String(retained) })} onChange={onChange ?? (() => {})} />
}
export function DraftSelect({ useStore, draftKey, observation, ...props }: DraftControlProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const retained = useDraftValue({ useStore, draftKey, observation }, props.name)
  const { defaultValue, value, onChange, ...rest } = props
  return <select {...rest} value={retained === undefined ? value ?? defaultValue ?? '' : String(retained)} onChange={onChange ?? (() => {})} />
}
export function DraftTextarea({ useStore, draftKey, observation, ...props }: DraftControlProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const retained = useDraftValue({ useStore, draftKey, observation }, props.name)
  const { defaultValue, value, onChange, ...rest } = props
  return <textarea {...rest} value={retained === undefined ? value ?? defaultValue ?? '' : String(retained)} onChange={onChange ?? (() => {})} />
}

/** Labelled native field with browser validation. */
export function Field({ name, label, value = '', type = 'text', min, max, required = true, ...draft }: DraftControlProps & { name: string; label: string; value?: string | number; type?: string; min?: number; max?: number; required?: boolean }) {
  return <label>{label}<DraftInput {...draft} name={name} value={value} type={type} min={min} max={max} required={required} maxLength={2000} /></label>
}

export function SaveForm({ revision, baseline, submit, children, t, disabled = false, button = 'save', entity = 'confirmation', draftScope, currentValues, resetValues, observation = `${revision}:${baseline}`, useStore, actions }: DraftProps & {
  revision: number; baseline: string; submit: (data: FormData, revision: number, baseline: string) => Promise<Dashboard | SavedFormSnapshot | void>; children: ReactNode; t: Translate; disabled?: boolean; button?: 'save' | 'confirm' | false; entity?: string; draftScope?: string | undefined; currentValues?: Record<string, string | number | boolean | undefined>; resetValues?: () => void; observation?: string | undefined
}) {
  const key = formDraftKey(entity, draftScope)
  const retained = readFormDraft(useStore(state => state.drafts[key]))
  const edited = retained?.edited ?? []
  const confirmed = retained?.confirmedFrom === observation
  const base = retained && (confirmed || edited.length > 0 && retained.baseline !== baseline) ? { revision: retained.revision, baseline: retained.baseline } : { revision, baseline }
  const form = useRef<HTMLFormElement>(null)
  function retain(event: FormEvent<HTMLFormElement>) {
    const target = event.target
    const names = new Set(edited)
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      if (!target.name) { setSaved(false); return }
      names.add(target.name)
    }
    if (!form.current) return
    const values: FormDraft['values'] = { ...retained?.values, ...Object.fromEntries([...new FormData(form.current)].flatMap(([name, value]) => typeof value === 'string' ? [[name, value]] : [])) }
    for (const input of form.current.querySelectorAll('input[type="checkbox"]')) if (input instanceof HTMLInputElement && names.has(input.name)) values[input.name] = input.checked ? 'on' : ''
    actions.setDraft(key, JSON.stringify({ ...base, edited: [...names], values, ...(confirmed ? { confirmedFrom: retained.confirmedFrom, observation: retained.observation } : {}) }))
    setSaved(false)
  }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  function resolveDraft(keep: boolean) {
    if (!form.current) return
    if (keep) actions.setDraft(key, JSON.stringify({ revision, baseline, edited, values: retained?.values ?? {} }))
    else { resetValues?.(); actions.clearDraft(key) }
    setError(''); setSaved(false)
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const values = new FormData(event.currentTarget)
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    if (submitter instanceof HTMLButtonElement) values.set('move', submitter.value)
    setBusy(true); setSaved(false); setError('')
    try {
      const result = await submit(values, base.revision, JSON.stringify({ baseline: base.baseline, editedFields: edited }))
      if (result && 'baseline' in result) actions.setDraft(key, JSON.stringify({ revision, baseline: result.baseline, edited: [], values: result.currentValues, confirmedFrom: observation, observation: result.observation }))
      else actions.clearDraft(key)
      setSaved(true)
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('networkError')) }
    finally { setBusy(false) }
  }
  return <form ref={form} onSubmit={event => { void save(event) }} onChange={retain}>
    <fieldset disabled={disabled || busy}>{children}{button && <button type="submit">{busy ? t('busy') : t(button)}</button>}</fieldset>
    {error && <><p role="alert">{error}</p><div className="student-segments">
      {(currentValues || resetValues) && <button type="button" disabled={disabled || busy} onClick={() => resolveDraft(false)}>{t('useCurrentValues')}</button>}
      <button type="button" disabled={disabled || busy} onClick={() => resolveDraft(true)}>{t('keepDraft')}</button>
    </div></>}{saved && <p role="status">{t('saved')}</p>}
  </form>
}

/** Parent-confirmed setup or in-place profile update, plus an atomic textbook/course update. */
export function ParentSettings({ data, change, t, curriculum = null, subject = 'math', onSubject, draftScope, observation, useStore, actions }: DraftProps & {
  data: Dashboard
  change: ChangeStudy
  t: Translate
  curriculum?: NonNullable<Dashboard['study']>['curriculum']
  subject?: typeof subjects[number]
  onSubject?: (subject: typeof subjects[number]) => void
  draftScope?: string | undefined
  observation?: string | undefined
}) {
  const [progressError, setProgressError] = useState('')
  const draft = { useStore, actions }
  const field = (entity: string, baseline: string) => ({ useStore, draftKey: formDraftKey(entity, draftScope), observation: observation ?? `${data.revision}:${baseline}` })
  const study = data.study
  const profile = study?.profile
  const profileBaseline = JSON.stringify(profile ?? null)
  const courseBaseline = JSON.stringify({ scope: profile ? { region: profile.region, grade: profile.grade, term: profile.term, schoolYear: profile.schoolYear, schoolSystem: profile.schoolSystem } : undefined, course: study?.courses.find(item => item.subject === subject) })
  const progressBaseline = JSON.stringify(study?.courses.find(course => course.subject === subject)?.progress ?? null)
  const today = new Date(data.serverNow + 8 * 60 * 60 * 1000)
  const currentYear = today.getUTCFullYear() - (today.getUTCMonth() < 8 ? 1 : 0)
  const years = Array.from({ length: 7 }, (_, index) => `${currentYear + 1 - index}–${currentYear + 2 - index}`)
  return <section>
    <p>{t('parentHelp')}</p>
    <SaveForm {...draft} observation={observation} draftScope={draftScope} entity="profile" currentValues={profile ?? {}} revision={data.revision} baseline={profileBaseline} t={t} submit={(form, revision, original) => change({
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
    }, revision, original).then(result => savedSettingsForm(result, 'profile', original))}>
      <Field {...field('profile', profileBaseline)} name="nickname" label={t('nickname')} value={profile?.nickname ?? ''} />
      <Field {...field('profile', profileBaseline)} name="region" label={t('region')} value={profile?.region ?? '上海市'} />
      <Field {...field('profile', profileBaseline)} name="grade" label={t('grade')} value={profile?.grade ?? 2} type="number" min={1} max={6} />
      <label>{t('term')}<DraftSelect {...field('profile', profileBaseline)} name="term" aria-label={t('term')} defaultValue={profile?.term ?? 'first'}><option value="first">{t('first')}</option><option value="second">{t('second')}</option></DraftSelect></label>
      <label>{t('schoolYear')}<DraftSelect {...field('profile', profileBaseline)} name="schoolYear" aria-label={t('schoolYear')} defaultValue={profile?.schoolYear ?? ''} required>
        <option value="" disabled>{t('chooseSchoolYear')}</option>
        {years.map(year => <option key={year} value={year}>{year}</option>)}
      </DraftSelect></label>
      <p>{t('schoolYearHelp')}</p>
      <Field {...field('profile', profileBaseline)} name="schoolAlias" label={t('schoolAlias')} value={profile?.schoolAlias ?? ''} required={false} />
      <p>{t('schoolAliasHelp')}</p>
      <label>{t('schoolSystem')}<DraftSelect {...field('profile', profileBaseline)} name="schoolSystem" aria-label={t('schoolSystem')} defaultValue={profile?.schoolSystem ?? 'five-four'}><option value="five-four">{t('five-four')}</option><option value="six-three">{t('six-three')}</option></DraftSelect></label>
    </SaveForm>
    {profile && <>
      <h3>{t('curriculum')}</h3><p>{t('materialHelp')}</p>
      {study.courses.map(course => <p key={course.subject}>{t(course.subject)} · {study.materials.find(item => item.id === course.materialId)?.title} · {course.unit}</p>)}
      <SaveForm {...draft} observation={observation} draftScope={draftScope} entity={`course:${subject}`} currentValues={{ subject, unitId: study.courses.find(item => item.subject === subject)?.progress?.unitId ?? '', unit: study.courses.find(item => item.subject === subject)?.unit ?? '' }} revision={data.revision} baseline={courseBaseline} t={t} submit={async (form, revision, original) => {
        const materialId = crypto.randomUUID()
        const selected = read(form, 'subject')
        const courseSubject = subjects.find(item => item === selected) ?? subject
        const unitId = read(form, 'unitId')
        const unit = curriculum?.scope.current ? curriculum.units.find(item => item.id === unitId) : undefined
        const { region, grade, term, schoolYear, schoolSystem } = profile
        const existing = study.courses.find(item => item.subject === courseSubject)?.progress
        return change({ action: 'configure-course', material: { id: materialId, subject: courseSubject, scope: { region, grade, term, schoolYear, schoolSystem }, title: curriculum?.scope.current ? curriculum.title : t(courseSubject), publisher: t('mapMaterialPublisher'), edition: curriculum?.scope.current ? curriculum.id : t('mapMaterialEdition'), editionStatus: 'identified', kind: 'official-textbook', locator: curriculum?.scope.current ? `knowledge/curriculum/${curriculum.id}.json` : t('mapMaterialLocator'), evidence: t('mapMaterialEvidence') }, course: { subject: courseSubject, materialId, unit: unit?.name ?? read(form, 'unit'), parentConfirmation: t('materialConfirm') }, ...(unit ? { progress: { unitId: unit.id, posture: existing?.posture ?? 'keep-up', preview: existing?.preview ? 'on' : 'off', pace: existing?.pace ?? 'teaching', parentConfirmation: t('confirmSchoolProgress') } } : {}) }, revision, original).then(result => savedSettingsForm(result, 'course', original, courseSubject))
      }}>
        <label>{t('subject')}<DraftSelect {...field(`course:${subject}`, courseBaseline)} name="subject" aria-label={t('subject')} value={subject} onChange={event => { const next = subjects.find(item => item === event.target.value); if (next) onSubject?.(next) }}>{subjects.map(item => <option key={item} value={item}>{t(item)}</option>)}</DraftSelect></label>
        {curriculum?.scope.current ? <label>{t('unit')}<DraftSelect {...field(`course:${subject}`, courseBaseline)} name="unitId" aria-label={t('unit')} key={subject} defaultValue={study.courses.find(item => item.subject === subject)?.progress?.unitId ?? ''} required>
          <option value="" disabled>{t('chooseUnit')}</option>
          {curriculum.units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </DraftSelect></label> : <Field {...field(`course:${subject}`, courseBaseline)} name="unit" label={t('unit')} />}
      </SaveForm>
      {curriculum?.scope.current && <>
        <h3>{t('schoolFrontier')}</h3>
        <p>{t('schoolProgressHelp')}</p>
        {onSubject && <nav className="student-segments" aria-label={t('schoolFrontier')}>{subjects.map(item => <button key={item} type="button" aria-pressed={subject === item} onClick={() => onSubject(item)}>{t(item)}</button>)}</nav>}
        {study.courses.some(course => course.subject === subject) ? <SaveForm {...draft} observation={observation} draftScope={draftScope} entity={`progress:${subject}`} currentValues={study.courses.find(course => course.subject === subject)?.progress ?? {}} revision={data.revision} baseline={progressBaseline} t={t} button={false} submit={(form, revision, original) => {
          const move = form.get('move') ?? 'stay'
          const units = curriculum.units
          const selected = String(form.get('unitId') ?? '')
          const index = units.findIndex(unit => unit.id === selected)
          const next = units[index + 1]
          if (index < 0) throw new Error(t('chooseUnit'))
          if (move === 'next' && !next) throw new Error(t('noNextUnit'))
          setProgressError('')
          return change({ action: 'school-progress', subject, unitId: move === 'next' && next ? next.id : selected, posture: form.get('posture') === 'catch-up' ? 'catch-up' : 'keep-up', preview: form.get('preview') === 'on' ? 'on' : 'off', pace: move === 'review' ? 'review' : 'teaching', parentConfirmation: t('confirmSchoolProgress') }, revision, original).then(result => savedSettingsForm(result, 'progress', original, subject))
        }}>
          <label>{t('schoolFrontier')}<DraftSelect {...field(`progress:${subject}`, progressBaseline)} name="unitId" aria-label={t('schoolFrontier')} defaultValue={study.courses.find(course => course.subject === subject)?.progress?.unitId ?? curriculum.units[0]?.id} required>{curriculum.units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</DraftSelect></label>
          <label>{t('keepUp')}<DraftSelect {...field(`progress:${subject}`, progressBaseline)} name="posture" aria-label={t('keepUp')} defaultValue={study.courses.find(course => course.subject === subject)?.progress?.posture ?? 'keep-up'}><option value="keep-up">{t('keepUp')}</option><option value="catch-up">{t('catchUp')}</option></DraftSelect></label>
          <label className="student-check"><DraftInput {...field(`progress:${subject}`, progressBaseline)} type="checkbox" name="preview" defaultChecked={study.courses.find(course => course.subject === subject)?.progress?.preview === true} />{t('previewUnit')}</label>
          {progressError && <p role="alert">{progressError}</p>}
          <div className="student-segments">
            <button type="submit" value="stay">{t('stillThisUnit')}</button>
            <button type="submit" value="next">{t('nextSchoolUnit')}</button>
            <button type="submit" value="review">{t('reviewWeek')}</button>
          </div>
        </SaveForm> : <p>{t('schoolProgressNeedsCourse')}</p>}
      </>}
      <InterestsForm {...draft} tags={study.interests} revision={data.revision} change={change} t={t} draftScope={draftScope} observation={observation} />
      <h3>{t('openmaicTitle')}</h3>
      <p className="student-muted">{t('openmaicBaseHelp')}</p>
      <p>{t('openmaicEffective')}: {data.interactiveLessons.baseUrl}</p>
      <SaveForm {...draft} observation={observation} draftScope={draftScope} entity="openmaic" currentValues={{ baseUrl: study.openmaic?.savedBaseUrl ?? '' }} revision={data.revision} baseline={study.openmaic?.savedBaseUrl ?? ''} t={t} submit={(form, revision, original) => change({ action: 'openmaic-settings', baseUrl: read(form, 'baseUrl'), parentConfirmation: t('openmaicConfirm') }, revision, original).then(result => savedSettingsForm(result, 'openmaic', original))}>
        <Field {...field('openmaic', study.openmaic?.savedBaseUrl ?? '')} name="baseUrl" label={t('openmaicBase')} value={study.openmaic?.savedBaseUrl ?? ''} required={false} />
        <p className="student-muted">{t('openmaicAccessHint')}</p>
      </SaveForm>
      {data.study && <div>
        <h3>{t('archiveTerm')}</h3>
        <p className="student-muted">{t('archiveTermHelp')}</p>
        <button type="button" disabled={!!study.active} onClick={() => {
          if (!window.confirm(t('archiveTermConfirm'))) return
          void change({ action: 'archive-term', parentConfirmation: t('archiveTermConfirmation') }, data.revision).catch(() => {})
        }}>{t('archiveTerm')}</button>
      </div>}
    </>}
  </section>
}

/** Parent theme tags. The saved list is edited here; an empty profile shows the example tags from status. */
function InterestsForm({ tags, revision, change, t, draftScope, observation, useStore, actions }: DraftProps & { tags: string[]; revision: number; change: ChangeStudy; t: Translate; draftScope?: string | undefined; observation?: string | undefined }) {
  const draft = { useStore, actions }
  const key = formDraftKey('interests', draftScope)
  const retained = readFormDraft(useStore(state => state.drafts[key]))
  const baseline = JSON.stringify(tags)
  const observed = observation ?? `${revision}:${baseline}`
  const stored = retained && (retained.edited.length > 0 || retained.confirmedFrom === observed) ? retained.values.tags : undefined
  let tagsDraft = tags
  try { const saved = typeof stored === 'string' ? JSON.parse(stored) : undefined; if (Array.isArray(saved) && saved.every(item => typeof item === 'string')) tagsDraft = saved } catch { /* A malformed browser draft supplies no edited tags. */ }
  function updateTags(next: string[]) {
    actions.setDraft(key, JSON.stringify({ ...(retained ?? { revision, baseline }), edited: ['tags'], values: { tags: JSON.stringify(next) } }))
  }
  return <SaveForm {...draft} observation={observation} draftScope={draftScope} entity="interests" currentValues={{ tags: baseline }} revision={revision} baseline={JSON.stringify(tags)} t={t} submit={async (_form, nextRevision, original) => {
    const next = [...new Set(tagsDraft.map(tag => tag.trim()).filter(tag => tag !== ''))]
    if (next.length < 3 || next.length > 8) throw new Error(t('interestCount'))
    if (next.some(tag => !INTEREST_TAG.test(tag))) throw new Error(t('interestShape'))
    const result = await change({ action: 'interests', tags: next, parentConfirmation: t('interestConfirm') }, nextRevision, original); return savedSettingsForm(result, 'interests', original)
  }}>
    <h3>{t('interestsTitle')}</h3>
    <p className="student-muted">{t('interestsHelp')}</p>
    {tagsDraft.map((tag, index) => <label key={index}>{t('interestTag')} {index + 1}<input aria-label={`${t('interestTag')} ${index + 1}`} value={tag} required minLength={2} maxLength={16} onChange={event => updateTags(tagsDraft.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>)}
    <div className="student-segments">
      {tagsDraft.length < 8 && <button type="button" onClick={() => updateTags([...tagsDraft, ''])}>{t('addInterest')}</button>}
      {tagsDraft.length > 3 && <button type="button" onClick={() => updateTags(tagsDraft.slice(0, -1))}>{t('removeInterest')}</button>}
    </div>
  </SaveForm>
}

/** Confirmation retains the unedited image transcription until a user explicitly saves it. */
export function MistakeConfirmation({ mistake, revision, change, t, useStore, actions }: DraftProps & { mistake: StudyState['mistakes'][number]; revision: number; change: ChangeStudy; t: Translate }) {
  const field = { useStore, draftKey: formDraftKey(`mistake:${mistake.id}`), observation: `${revision}:${JSON.stringify(mistake)}` }
  return <details><summary>{mistake.topic}</summary>
    <p>{t('learnerAnswer')}: {mistake.learnerAnswer}</p>
    {mistake.uncertainties && <p>{t('uncertainties')}: {mistake.uncertainties}</p>}
    <SaveForm useStore={useStore} actions={actions} entity={`mistake:${mistake.id}`} revision={revision} baseline={JSON.stringify(mistake)} t={t} button="confirm" submit={(form, base) => {
      const picked = read(form, 'errorType')
      const errorType = errorTypesBySubject[mistake.subject].find(candidate => candidate === picked)
      return change({ action: 'confirm-mistake', id: mistake.id, prompt: read(form, 'prompt'), learnerAnswer: read(form, 'learnerAnswer'), correction: read(form, 'correction'), explanation: read(form, 'explanation'), answerEvidence: read(form, 'answerEvidence'), ...(errorType !== undefined ? { errorType } : {}), userConfirmation: t('confirmMistake') }, base)
    }}>
      {(['prompt', 'learnerAnswer', 'correction', 'explanation', 'answerEvidence'] as const).map(name => <label key={name}>{t(name)}<DraftTextarea {...field} aria-label={t(name)} name={name} defaultValue={mistake[name]} required maxLength={2000} /></label>)}
      <label>{t('errorTypeLabel')}<DraftSelect {...field} name="errorType" defaultValue={mistake.errorType ?? ''}>
        <option value="">{t('errorTypeNone')}</option>
        {errorTypesBySubject[mistake.subject].map(type => <option key={type} value={type}>{t(type)}</option>)}
      </DraftSelect></label>
    </SaveForm>
  </details>
}
