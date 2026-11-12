import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useDraftStorage } from './drafts.tsx'
import { INTEREST_TAG } from '../interests.ts'
import type { Command, StudyState } from '../schema.ts'
import { errorTypesBySubject } from '../vocabulary.ts'
import type { Dashboard } from '../dashboard.ts'
import type { Translate } from './locales.ts'

export type ChangeStudy = (command: Command, revision?: number, baseline?: string) => Promise<Dashboard>
export const subjects = ['chinese', 'math', 'english'] as const
const read = (form: FormData, name: string) => String(form.get(name) ?? '').trim()

/** Labelled native field with browser validation. */
export function Field({ name, label, value = '', type = 'text', min, max, required = true }: { name: string; label: string; value?: string | number; type?: string; min?: number; max?: number; required?: boolean }) {
  return <label>{label}<input name={name} defaultValue={value} type={type} min={min} max={max} required={required} maxLength={2000} /></label>
}

export function SaveForm({ revision, baseline, submit, children, t, disabled = false, button = 'save', entity = 'confirmation', draftScope, currentValues, resetValues }: {
  revision: number; baseline: string; submit: (data: FormData, revision: number, baseline: string) => Promise<unknown>; children: ReactNode; t: Translate; disabled?: boolean; button?: 'save' | 'confirm' | false; entity?: string; draftScope?: string | undefined; currentValues?: Record<string, string | number | boolean | undefined>; resetValues?: () => void
}) {
  const storage = useDraftStorage(entity, draftScope)
  const form = useRef<HTMLFormElement>(null)
  const [base, setBase] = useState({ revision, baseline })
  const dirty = useRef(false)
  const edited = useRef(new Set<string>())
  useEffect(() => {
    const retained = storage.read()
    if (!retained || !form.current) return
    try {
      const entry = JSON.parse(retained)
      if (typeof entry.baseline !== 'string' || typeof entry.revision !== 'number' || !entry.values || typeof entry.values !== 'object') return
      if (Array.isArray(entry.edited)) for (const name of entry.edited) if (typeof name === 'string') edited.current.add(name)
      for (const input of form.current.querySelectorAll('input,textarea,select')) {
        if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement)) continue
        if (!edited.current.has(input.name)) continue
        const value = entry.values[input.name]
        if (input instanceof HTMLInputElement && input.type === 'checkbox') input.checked = value === true || value === 'on'
        else if (typeof value === 'string') input.value = value
      }
      setBase({ revision: entry.revision, baseline: entry.baseline }); dirty.current = true
    } catch { storage.clear() }
  }, [])
  useEffect(() => {
    setBase(previous => !dirty.current || previous.baseline === baseline ? { revision, baseline } : previous)
    for (const input of form.current?.querySelectorAll('input,textarea,select') ?? []) {
      if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) || edited.current.has(input.name)) continue
      const value = currentValues?.[input.name]
      if (value === undefined) continue
      if (input instanceof HTMLInputElement && input.type === 'checkbox') input.checked = value === true
      else input.value = String(value)
    }
  }, [revision, baseline])
  function retain(event: FormEvent<HTMLFormElement>) {
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) edited.current.add(target.name)
    if (!form.current) return
    dirty.current = true
    const values = Object.fromEntries(new FormData(form.current))
    for (const input of form.current.querySelectorAll('input[type="checkbox"]')) if (input instanceof HTMLInputElement && edited.current.has(input.name)) values[input.name] = input.checked ? 'on' : ''
    storage.write(JSON.stringify({ ...base, edited: [...edited.current], values }))
    setSaved(false)
  }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  function resolveDraft(keep: boolean) {
    if (!form.current) return
    if (!keep) {
      for (const input of form.current.querySelectorAll('input,textarea,select')) {
        if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement)) continue
        const value = currentValues?.[input.name]
        if (value === undefined) continue
        if (input instanceof HTMLInputElement && input.type === 'checkbox') input.checked = value === true
        else input.value = String(value)
      }
      resetValues?.(); dirty.current = false; edited.current.clear(); storage.clear()
    } else {
      storage.write(JSON.stringify({ revision, baseline, edited: [...edited.current], values: Object.fromEntries(new FormData(form.current)) }))
    }
    setBase({ revision, baseline }); setError(''); setSaved(false)
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const values = new FormData(event.currentTarget)
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    if (submitter instanceof HTMLButtonElement) values.set('move', submitter.value)
    setBusy(true); setSaved(false); setError('')
    try { await submit(values, base.revision, JSON.stringify({ baseline: base.baseline, editedFields: [...edited.current] })); setBase({ revision, baseline }); dirty.current = false; edited.current.clear(); storage.clear(); setSaved(true) }
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
export function ParentSettings({ data, change, t, curriculum = null, subject = 'math', onSubject, draftScope }: {
  data: Dashboard
  change: ChangeStudy
  t: Translate
  curriculum?: NonNullable<Dashboard['study']>['curriculum']
  subject?: typeof subjects[number]
  onSubject?: (subject: typeof subjects[number]) => void
  draftScope?: string | undefined
}) {
  const [progressError, setProgressError] = useState('')
  const study = data.study
  const profile = study?.profile
  const today = new Date(data.serverNow + 8 * 60 * 60 * 1000)
  const currentYear = today.getUTCFullYear() - (today.getUTCMonth() < 8 ? 1 : 0)
  const years = Array.from({ length: 7 }, (_, index) => `${currentYear + 1 - index}–${currentYear + 2 - index}`)
  return <section>
    <p>{t('parentHelp')}</p>
    <SaveForm draftScope={draftScope} entity="profile" currentValues={profile ?? {}} revision={data.revision} baseline={JSON.stringify(profile ?? null)} t={t} submit={(form, revision, original) => change({
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
    }, revision, original)}>
      <Field name="nickname" label={t('nickname')} value={profile?.nickname ?? ''} />
      <Field name="region" label={t('region')} value={profile?.region ?? '上海市'} />
      <Field name="grade" label={t('grade')} value={profile?.grade ?? 2} type="number" min={1} max={6} />
      <label>{t('term')}<select name="term" aria-label={t('term')} defaultValue={profile?.term ?? 'first'}><option value="first">{t('first')}</option><option value="second">{t('second')}</option></select></label>
      <label>{t('schoolYear')}<select name="schoolYear" aria-label={t('schoolYear')} defaultValue={profile?.schoolYear ?? ''} required>
        <option value="" disabled>{t('chooseSchoolYear')}</option>
        {years.map(year => <option key={year} value={year}>{year}</option>)}
      </select></label>
      <p>{t('schoolYearHelp')}</p>
      <Field name="schoolAlias" label={t('schoolAlias')} value={profile?.schoolAlias ?? ''} required={false} />
      <p>{t('schoolAliasHelp')}</p>
      <label>{t('schoolSystem')}<select name="schoolSystem" aria-label={t('schoolSystem')} defaultValue={profile?.schoolSystem ?? 'five-four'}><option value="five-four">{t('five-four')}</option><option value="six-three">{t('six-three')}</option></select></label>
    </SaveForm>
    {profile && <>
      <h3>{t('curriculum')}</h3><p>{t('materialHelp')}</p>
      {study.courses.map(course => <p key={course.subject}>{t(course.subject)} · {study.materials.find(item => item.id === course.materialId)?.title} · {course.unit}</p>)}
      <SaveForm draftScope={draftScope} entity={`course:${subject}`} currentValues={{ subject, unitId: study.courses.find(item => item.subject === subject)?.progress?.unitId ?? '', unit: study.courses.find(item => item.subject === subject)?.unit ?? '' }} revision={data.revision} baseline={JSON.stringify({ scope: { region: profile.region, grade: profile.grade, term: profile.term, schoolYear: profile.schoolYear, schoolSystem: profile.schoolSystem }, course: study.courses.find(item => item.subject === subject) })} t={t} submit={async (form, revision, original) => {
        const materialId = crypto.randomUUID()
        const selected = read(form, 'subject')
        const courseSubject = subjects.find(item => item === selected) ?? subject
        const unitId = read(form, 'unitId')
        const unit = curriculum?.scope.current ? curriculum.units.find(item => item.id === unitId) : undefined
        const { region, grade, term, schoolYear, schoolSystem } = profile
        const existing = study.courses.find(item => item.subject === courseSubject)?.progress
        return change({ action: 'configure-course', material: { id: materialId, subject: courseSubject, scope: { region, grade, term, schoolYear, schoolSystem }, title: curriculum?.scope.current ? curriculum.title : t(courseSubject), publisher: t('mapMaterialPublisher'), edition: curriculum?.scope.current ? curriculum.id : t('mapMaterialEdition'), editionStatus: 'identified', kind: 'official-textbook', locator: curriculum?.scope.current ? `knowledge/curriculum/${curriculum.id}.json` : t('mapMaterialLocator'), evidence: t('mapMaterialEvidence') }, course: { subject: courseSubject, materialId, unit: unit?.name ?? read(form, 'unit'), parentConfirmation: t('materialConfirm') }, ...(unit ? { progress: { unitId: unit.id, posture: existing?.posture ?? 'keep-up', preview: existing?.preview ? 'on' : 'off', pace: existing?.pace ?? 'teaching', parentConfirmation: t('confirmSchoolProgress') } } : {}) }, revision, original)
      }}>
        <label>{t('subject')}<select name="subject" aria-label={t('subject')} value={subject} onChange={event => { const next = subjects.find(item => item === event.target.value); if (next) onSubject?.(next) }}>{subjects.map(item => <option key={item} value={item}>{t(item)}</option>)}</select></label>
        {curriculum?.scope.current ? <label>{t('unit')}<select name="unitId" aria-label={t('unit')} key={subject} defaultValue={study.courses.find(item => item.subject === subject)?.progress?.unitId ?? ''} required>
          <option value="" disabled>{t('chooseUnit')}</option>
          {curriculum.units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </select></label> : <Field name="unit" label={t('unit')} />}
      </SaveForm>
      {curriculum?.scope.current && <>
        <h3>{t('schoolFrontier')}</h3>
        <p>{t('schoolProgressHelp')}</p>
        {onSubject && <nav className="student-segments" aria-label={t('schoolFrontier')}>{subjects.map(item => <button key={item} type="button" aria-pressed={subject === item} onClick={() => onSubject(item)}>{t(item)}</button>)}</nav>}
        {study.courses.some(course => course.subject === subject) ? <SaveForm draftScope={draftScope} entity={`progress:${subject}`} currentValues={study.courses.find(course => course.subject === subject)?.progress ?? {}} revision={data.revision} baseline={JSON.stringify(study.courses.find(course => course.subject === subject)?.progress ?? null)} t={t} button={false} submit={(form, revision, original) => {
          const move = form.get('move') ?? 'stay'
          const units = curriculum.units
          const selected = String(form.get('unitId') ?? '')
          const index = units.findIndex(unit => unit.id === selected)
          const next = units[index + 1]
          if (index < 0) throw new Error(t('chooseUnit'))
          if (move === 'next' && !next) throw new Error(t('noNextUnit'))
          setProgressError('')
          return change({ action: 'school-progress', subject, unitId: move === 'next' && next ? next.id : selected, posture: form.get('posture') === 'catch-up' ? 'catch-up' : 'keep-up', preview: form.get('preview') === 'on' ? 'on' : 'off', pace: move === 'review' ? 'review' : 'teaching', parentConfirmation: t('confirmSchoolProgress') }, revision, original)
        }}>
          <label>{t('schoolFrontier')}<select name="unitId" aria-label={t('schoolFrontier')} defaultValue={study.courses.find(course => course.subject === subject)?.progress?.unitId ?? curriculum.units[0]?.id} required>{curriculum.units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
          <label>{t('keepUp')}<select name="posture" aria-label={t('keepUp')} defaultValue={study.courses.find(course => course.subject === subject)?.progress?.posture ?? 'keep-up'}><option value="keep-up">{t('keepUp')}</option><option value="catch-up">{t('catchUp')}</option></select></label>
          <label className="student-check"><input type="checkbox" name="preview" defaultChecked={study.courses.find(course => course.subject === subject)?.progress?.preview === true} />{t('previewUnit')}</label>
          {progressError && <p role="alert">{progressError}</p>}
          <div className="student-segments">
            <button type="submit" value="stay">{t('stillThisUnit')}</button>
            <button type="submit" value="next">{t('nextSchoolUnit')}</button>
            <button type="submit" value="review">{t('reviewWeek')}</button>
          </div>
        </SaveForm> : <p>{t('schoolProgressNeedsCourse')}</p>}
      </>}
      <InterestsForm tags={study.interests} revision={data.revision} change={change} t={t} draftScope={draftScope} />
      <h3>{t('openmaicTitle')}</h3>
      <p className="student-muted">{t('openmaicBaseHelp')}</p>
      <p>{t('openmaicEffective')}: {data.interactiveLessons.baseUrl}</p>
      <SaveForm draftScope={draftScope} entity="openmaic" currentValues={{ baseUrl: study.openmaic?.savedBaseUrl ?? '' }} revision={data.revision} baseline={study.openmaic?.savedBaseUrl ?? ''} t={t} submit={(form, revision, original) => change({ action: 'openmaic-settings', baseUrl: read(form, 'baseUrl'), parentConfirmation: t('openmaicConfirm') }, revision, original)}>
        <Field name="baseUrl" label={t('openmaicBase')} value={study.openmaic?.savedBaseUrl ?? ''} required={false} />
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
function InterestsForm({ tags, revision, change, t, draftScope }: { tags: string[]; revision: number; change: ChangeStudy; t: Translate; draftScope?: string | undefined }) {
  const storage = useDraftStorage('interests-values', draftScope)
  const [draft, setDraft] = useState<string[]>(() => {
    try { const saved = JSON.parse(storage.read() ?? 'null'); return Array.isArray(saved) && saved.every(item => typeof item === 'string') ? saved : tags } catch { return tags }
  })
  function updateTags(next: string[]) { setDraft(next); storage.write(JSON.stringify(next)) }
  return <SaveForm draftScope={draftScope} entity="interests" resetValues={() => { setDraft(tags); storage.clear() }} revision={revision} baseline={JSON.stringify(tags)} t={t} submit={async (_form, nextRevision, original) => {
    const next = [...new Set(draft.map(tag => tag.trim()).filter(tag => tag !== ''))]
    if (next.length < 3 || next.length > 8) throw new Error(t('interestCount'))
    if (next.some(tag => !INTEREST_TAG.test(tag))) throw new Error(t('interestShape'))
    const result = await change({ action: 'interests', tags: next, parentConfirmation: t('interestConfirm') }, nextRevision, original); storage.clear(); return result
  }}>
    <h3>{t('interestsTitle')}</h3>
    <p className="student-muted">{t('interestsHelp')}</p>
    {draft.map((tag, index) => <label key={index}>{t('interestTag')} {index + 1}<input aria-label={`${t('interestTag')} ${index + 1}`} value={tag} required minLength={2} maxLength={16} onChange={event => updateTags(draft.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>)}
    <div className="student-segments">
      {draft.length < 8 && <button type="button" onClick={() => updateTags([...draft, ''])}>{t('addInterest')}</button>}
      {draft.length > 3 && <button type="button" onClick={() => updateTags(draft.slice(0, -1))}>{t('removeInterest')}</button>}
    </div>
  </SaveForm>
}

/** Confirmation retains the unedited image transcription until a user explicitly saves it. */
export function MistakeConfirmation({ mistake, revision, change, t }: { mistake: StudyState['mistakes'][number]; revision: number; change: ChangeStudy; t: Translate }) {
  return <details><summary>{mistake.topic}</summary>
    <p>{t('learnerAnswer')}: {mistake.learnerAnswer}</p>
    {mistake.uncertainties && <p>{t('uncertainties')}: {mistake.uncertainties}</p>}
    <SaveForm entity={`mistake:${mistake.id}`} revision={revision} baseline={JSON.stringify(mistake)} t={t} button="confirm" submit={(form, base) => {
      const picked = read(form, 'errorType')
      const errorType = errorTypesBySubject[mistake.subject].find(candidate => candidate === picked)
      return change({ action: 'confirm-mistake', id: mistake.id, prompt: read(form, 'prompt'), learnerAnswer: read(form, 'learnerAnswer'), correction: read(form, 'correction'), explanation: read(form, 'explanation'), answerEvidence: read(form, 'answerEvidence'), ...(errorType !== undefined ? { errorType } : {}), userConfirmation: t('confirmMistake') }, base)
    }}>
      {(['prompt', 'learnerAnswer', 'correction', 'explanation', 'answerEvidence'] as const).map(name => <label key={name}>{t(name)}<textarea aria-label={t(name)} name={name} defaultValue={mistake[name]} required maxLength={2000} /></label>)}
      <label>{t('errorTypeLabel')}<select name="errorType" defaultValue={mistake.errorType ?? ''}>
        <option value="">{t('errorTypeNone')}</option>
        {errorTypesBySubject[mistake.subject].map(type => <option key={type} value={type}>{t(type)}</option>)}
      </select></label>
    </SaveForm>
  </details>
}
