import { z } from 'zod'
import type { StudentJsonValue, StudentSessionId, StudentManualReply } from '../types.ts'
import { answerDateSchema, assessmentSchema, assistanceSchema, responseSchema, worksheetSchema, type WorksheetFile } from '../files/schema.ts'
import type { ManualSaveRequest } from '../files/manual.ts'
import { errorTypesBySubject } from '../vocabulary.ts'
import { SaveForm } from './forms.tsx'
import { studentResourceAddress } from './resource.ts'
import type { UseStudentResource } from './workspace.ts'
import type { Translate } from './locales.ts'

type ManualSave = (intent: ManualSaveRequest['intent'], baseline: Record<string, StudentJsonValue>) => Promise<StudentManualReply | void>

/** Optional corrections edit confirmed records; the original response and frozen question stay visible. */
export function WorksheetCorrections({ sessionId, termId, draftScope, useResource, save, t, disabled }: {
  sessionId: StudentSessionId; termId: string; draftScope: string; useResource: UseStudentResource; save: ManualSave; t: Translate; disabled: boolean
}) {
  const resource = useResource(studentResourceAddress(sessionId, { kind: 'files' }))
  const value = resource.value?.data
  const candidates = value && typeof value === 'object' && 'worksheets' in value && Array.isArray(value.worksheets) ? value.worksheets : []
  const sheets = candidates.flatMap(candidate => { const parsed = worksheetSchema.safeParse(candidate); return parsed.success && parsed.data.termId === termId && parsed.data.discardedAt === undefined ? [parsed.data] : [] }).slice(-20)
  return <details className="student-fold"><summary>{t('manualWorksheet')}</summary>
    <p>{t('manualWorksheetHelp')}</p>
    {resource.status === 'failed' && <p role="alert">{t('staleData')}</p>}
    {sheets.map(sheet => <section key={sheet.id}>
      <SaveForm observation={resource.value?.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`)?.version} entity={`worksheet:${sheet.id}:date`} {...{ draftScope, t }} disabled={disabled || resource.status !== 'live'} currentValues={{ answerDay: sheet.answerDate?.kind === 'day' ? sheet.answerDate.day : '' }} revision={0} baseline={JSON.stringify(sheet.answerDate ?? null)} submit={async (form, _revision, retained) => {
        const original = JSON.parse(retained)
        const day = String(form.get('answerDay') ?? '')
        const result = await save({ kind: 'worksheet-assessments', worksheetId: sheet.id, assessments: [], answerDate: day ? { kind: 'day', day, parentConfirmation: t('gradeConfirmation') } : { kind: 'unknown' } }, { answerDate: JSON.parse(original.baseline) })
        if (result) { const date = answerDateSchema.parse(result.current.answerDate); return { baseline: JSON.stringify(date), currentValues: { answerDay: date.kind === 'day' ? date.day : '' }, observation: result.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`)!.version } }
      }}>
        <label>{t('worksheetAnswerDay')} · {sheet.id}<input name="answerDay" type="date" aria-label={t('worksheetAnswerDay')} defaultValue={sheet.answerDate?.kind === 'day' ? sheet.answerDate.day : ''} /></label>
        <p>{t('worksheetAnswerDayHelp')}</p>
      </SaveForm>
      {sheet.responses.map(response => <Correction key={response.id} {...{ sheet, response, draftScope, save, t }} observation={resource.value?.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`)?.version} disabled={disabled || resource.status !== 'live'} />)}
    </section>)}
  </details>
}

function Correction({ sheet, response, draftScope, save, t, disabled, observation }: {
  sheet: WorksheetFile; response: WorksheetFile['responses'][number]; draftScope: string; save: ManualSave; t: Translate; disabled: boolean; observation?: string | undefined
}) {
  const assessment = sheet.assessments.find(item => item.responseId === response.id)
  const question = sheet.items.find(item => item.id === response.questionId)!
  const answerDate = response.answerDate ?? sheet.answerDate
  return <section>
    <p>{question.prompt}</p><p>{t('learnerAnswer')}: {response.rawResponse}</p>
    <p>{t('answerEvidence')}: {question.answerEvidence}</p>
    <SaveForm entity={`worksheet:${sheet.id}:${response.id}`} {...{ draftScope, t, disabled, observation }} currentValues={{ result: assessment?.result ?? 'unassessed', feedback: assessment?.feedback ?? question.explanation, answerEvidence: assessment?.answerEvidence ?? question.answerEvidence, assistance: response.assistance, answerDay: answerDate?.kind === 'day' ? answerDate.day : '', errorType: assessment?.errorType ?? '' }} revision={0} baseline={JSON.stringify({ response, assessment: assessment ?? null })} submit={async (form, _revision, retained) => {
      const entry = JSON.parse(retained)
      const original = JSON.parse(entry.baseline)
      const before = responseSchema.parse(original.response)
      const oldAssessment = original.assessment === null ? undefined : assessmentSchema.parse(original.assessment)
      const edited: string[] = entry.editedFields
      const helpChanged = edited.includes('assistance')
      const dateChanged = edited.includes('answerDay')
      const assessmentChanged = ['result', 'feedback', 'answerEvidence', 'errorType'].some(field => edited.includes(field)) || helpChanged && !!assessment
      const assistance = helpChanged ? assistanceSchema.parse(form.get('assistance')) : response.assistance
      const confirmation = t('gradeConfirmation')
      const baseline: Record<string, StudentJsonValue> = {}
      const assessments: WorksheetFile['assessments'] = []
      if (assessmentChanged) {
        const current = assessment ?? { id: `assessment-${response.id}`.slice(0, 80), responseId: response.id, result: 'unassessed' as const, assistance, feedback: question.explanation, answerEvidence: question.answerEvidence, assessedAt: Date.now() }
        const parsed = assessmentSchema.parse({ ...current, assistance, userConfirmation: confirmation,
          ...(edited.includes('result') ? { result: form.get('result') } : {}),
          ...(edited.includes('feedback') ? { feedback: form.get('feedback') } : {}),
          ...(edited.includes('answerEvidence') ? { answerEvidence: form.get('answerEvidence') } : {}),
        })
        if (edited.includes('errorType')) {
          const cause = errorTypesBySubject[sheet.subject].find(type => type === form.get('errorType'))
          if (cause) parsed.errorType = cause
          else delete parsed.errorType
        }
        assessments.push(parsed)
        baseline[`assessment:${response.id}`] = z.json().parse(JSON.parse(JSON.stringify(oldAssessment ?? null)))
      }
      const responseUpdates: NonNullable<Extract<ManualSaveRequest['intent'], { kind: 'worksheet-assessments' }>['responseUpdates']> = []
      if (helpChanged || dateChanged) {
        const day = String(form.get('answerDay') ?? '')
        responseUpdates.push({ responseId: response.id, userConfirmation: confirmation, ...(helpChanged ? { assistance } : {}), ...(dateChanged ? { answerDate: day ? { kind: 'day', day, parentConfirmation: confirmation } : { kind: 'unknown' } } : {}) })
        baseline[`response:${response.id}`] = { ...(helpChanged ? { assistance: before.assistance } : {}), ...(dateChanged ? { answerDate: before.answerDate ?? null } : {}) }
      }
      const result = await save({ kind: 'worksheet-assessments', worksheetId: sheet.id, assessments, ...(responseUpdates.length ? { responseUpdates } : {}) }, baseline)
      if (result) {
        const updated = result.current[`response:${response.id}`]
        const nextResponse = responseSchema.parse({ ...before, ...(updated && typeof updated === 'object' ? updated : {}) })
        const savedAssessment = result.current[`assessment:${response.id}`]
        const nextAssessment = savedAssessment ? assessmentSchema.parse(savedAssessment) : oldAssessment
        const date = nextResponse.answerDate ?? sheet.answerDate
        return { baseline: JSON.stringify({ response: nextResponse, assessment: nextAssessment ?? null }), currentValues: { result: nextAssessment?.result ?? 'unassessed', feedback: nextAssessment?.feedback ?? question.explanation, answerEvidence: nextAssessment?.answerEvidence ?? question.answerEvidence, assistance: nextResponse.assistance, answerDay: date?.kind === 'day' ? date.day : '', errorType: nextAssessment?.errorType ?? '' }, observation: result.versions.find(file => file.path === `.study/worksheets/${sheet.id}.json`)!.version }
      }
    }}>
      <label>{t('draftChoice')}<select name="result" defaultValue={assessment?.result ?? 'unassessed'}>{(['correct', 'partial', 'incorrect', 'unassessed', 'stuck'] as const).map(value => <option key={value} value={value}>{t(value === 'correct' ? 'markCorrect' : value === 'partial' ? 'markPartial' : value === 'incorrect' ? 'markWrong' : value === 'stuck' ? 'workbookStuck' : 'notGraded')}</option>)}</select></label>
      <label>{t('feedback')}<textarea name="feedback" defaultValue={assessment?.feedback ?? question.explanation} required maxLength={2000} /></label>
      <label>{t('answerEvidence')}<textarea name="answerEvidence" defaultValue={assessment?.answerEvidence ?? question.answerEvidence} required maxLength={2000} /></label>
      <label>{t('assistanceLabel')}<select name="assistance" defaultValue={response.assistance}>{(['independent', 'hint', 'worked-example', 'unknown'] as const).map(value => <option key={value} value={value}>{t(value === 'independent' ? 'independent' : value === 'hint' ? 'assistHint' : value === 'worked-example' ? 'workedExampleHelp' : 'assistanceUnknown')}</option>)}</select></label>
      <label>{t('actualAnswerDay')}<input type="date" name="answerDay" defaultValue={answerDate?.kind === 'day' ? answerDate.day : ''} /></label>
      <p className="student-muted">{t('answerDayHelp')}</p>
      <label>{t('errorTypeLabel')}<select name="errorType" defaultValue={assessment?.errorType ?? ''}><option value="">{t('errorTypeNone')}</option>{errorTypesBySubject[sheet.subject].map(value => <option key={value} value={value}>{t(value)}</option>)}</select></label>
    </SaveForm>
  </section>
}
