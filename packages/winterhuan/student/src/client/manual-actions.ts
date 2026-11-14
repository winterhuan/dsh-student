import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@winterhuan/dsh-student/remote'
import type { Context } from '@deepseek-ai/cordis'
import type { Dashboard } from '../dashboard.ts'
import type { Command } from '../schema.ts'
import type { ManualSaveRequest } from '../files/manual.ts'
import type { StudentJsonValue, StudentManualReply, StudentSessionId, StudentSubmissionRequest } from '../types.ts'
import type { Translate } from './locales.ts'

/**
 * Bind Gateway operations in the registration world and expose plain feature callbacks.
 * @param remote - mounted Student manual-save and submission-inspection operations.
 * @returns callbacks preserving original draft baselines and separate file outcomes.
 */
export function createStudentManualActions(remote: Pick<Context['remote']['student'], 'manualContext' | 'saveManual' | 'inspectSubmission'>) {
  async function saveSettings(sessionId: StudentSessionId, command: Command, data: Dashboard, termId: string, original: string | undefined, t: Translate): Promise<Dashboard & { manual?: StudentManualReply }> {
    const retained = original ? JSON.parse(original) : undefined
    const beforeText = retained && typeof retained.baseline === 'string' ? retained.baseline : original
    const editedNames: string[] | undefined = retained && Array.isArray(retained.editedFields) ? retained.editedFields : undefined
    let intent: ManualSaveRequest['intent']
    let baseline: Record<string, StudentJsonValue> | undefined
    if (command.action === 'setup') {
      const before = beforeText ? JSON.parse(beforeText) : data.study?.profile
      const fields = (Object.keys(command.profile) as (keyof typeof command.profile)[]).filter(field => field !== 'parentConfirmation' && (editedNames ? editedNames.includes(field) : command.profile[field] !== before?.[field]))
      intent = { kind: 'settings', command, editedProfileFields: fields }
      baseline = Object.fromEntries(fields.map(field => [`profile:${field}`, before?.[field] ?? null]))
    } else if (command.action === 'configure-course') {
      intent = { kind: 'settings', command }
      const before = beforeText ? JSON.parse(beforeText) : { course: data.study?.courses.find(item => item.subject === command.course.subject) }
      baseline = { [`material:${command.material.id}`]: null, [`course:${command.course.subject}`]: before.course ?? null }
    } else if (command.action === 'school-progress' || command.action === 'interests' || command.action === 'openmaic-settings') {
      intent = { kind: 'settings', command }
      if (command.action === 'school-progress' && beforeText) baseline = { [`progress:${command.subject}`]: JSON.parse(beforeText) }
      if (command.action === 'interests' && beforeText) baseline = { interests: JSON.parse(beforeText!) }
      if (command.action === 'openmaic-settings') baseline = beforeText ? undefined : { openmaic: null }
    } else throw new Error(t('manualInvalid'))
    const controller = new AbortController()
    const context = await remote.manualContext(sessionId, intent, controller.signal)
    if (!context.ok) throw new Error(context.error.message)
    if (!context.value.termId || context.value.termId !== termId) throw new Error(t('manualOldTerm'))
    if (command.action === 'openmaic-settings') {
      const current = context.value.baseline.openmaic
      const currentBase = current && typeof current === 'object' && 'baseUrl' in current ? current.baseUrl : ''
      if (beforeText !== undefined && currentBase !== beforeText) throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(current)}`)
      baseline = context.value.baseline
    }
    if (command.action === 'interests' && context.value.baseline.interests === null) baseline = { interests: null }
    const result = await remote.saveManual(sessionId, { termId: context.value.termId, expectedVersions: context.value.versions, baseline: baseline ?? context.value.baseline, intent }, controller.signal)
    if (!result.ok) throw new Error(result.error.message)
    if (result.value.status === 'conflict') throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(result.value.current)}`)
    if (result.value.status === 'old-term') throw new Error(t('manualOldTerm'))
    if (result.value.status !== 'saved' && result.value.status !== 'unchanged') throw new Error(result.value.reason ?? t('manualInvalid'))
    return Object.assign({}, data, { manual: result.value })
  }
  async function saveWorksheet(sessionId: StudentSessionId, intent: ManualSaveRequest['intent'], baseline: Record<string, StudentJsonValue>, termId: string, t: Translate) {
    const controller = new AbortController()
    const context = await remote.manualContext(sessionId, intent, controller.signal)
    if (!context.ok) throw new Error(context.error.message)
    if (context.value.termId !== termId) throw new Error(t('manualOldTerm'))
    const result = await remote.saveManual(sessionId, { termId: context.value.termId, expectedVersions: context.value.versions, baseline, intent }, controller.signal)
    if (!result.ok) throw new Error(result.error.message)
    if (result.value.status === 'conflict') throw new Error(`${t('manualConflict')} · ${t('currentValues')}: ${JSON.stringify(result.value.current)}`)
    if (result.value.status === 'old-term') throw new Error(t('manualOldTerm'))
    if (result.value.status !== 'saved' && result.value.status !== 'unchanged') throw new Error(result.value.reason ?? t('manualInvalid'))
    return result.value
  }

  async function inspectSubmission(sessionId: StudentSessionId, request: StudentSubmissionRequest) {
    const reply = await remote.inspectSubmission(sessionId, request, new AbortController().signal)
    if (!reply.ok) throw new Error(reply.error.message)
    return reply.value
  }
  return { saveSettings, saveWorksheet, inspectSubmission }
}

export type StudentManualActions = ReturnType<typeof createStudentManualActions>
