import { Children, cloneElement, isValidElement } from 'react'
import { useDraftFixture } from './draft-fixture.tsx'
import { createStudentManualActions } from '../src/client/manual-actions.ts'
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { StudyDesk as RealStudyDesk } from '../src/client/desk.tsx'
import { WorksheetCorrections as RealWorksheetCorrections } from '../src/client/worksheet-corrections.tsx'
import { SaveForm as RealSaveForm, DraftInput } from '../src/client/forms.tsx'
import { dashboard } from '../src/dashboard.ts'
import { updateStudy } from './fixtures.ts'
import { NOW, setup, start, attempt } from './fixtures.ts'
import { en } from '../src/client/locales.ts'
import type { StudentQueryResult } from '../src/types.ts'

const t = (key: keyof typeof en) => en[key]
afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.localStorage.clear(); window.sessionStorage.clear() })

it('uses the confirmed save baseline when immediately reopening before the live resource refresh', async () => {
  const submit = vi.fn().mockResolvedValue({ baseline: JSON.stringify({ nickname: 'First save', region: 'Saved region' }), currentValues: { nickname: 'First save', region: 'Saved region' }, observation: 'saved-v2' })
  const form = (observation = 'old-v1', region = 'Original region') => <SaveForm revision={1} observation={observation} baseline={JSON.stringify({ nickname: 'Original', region })} currentValues={{ nickname: 'Original', region }} entity="profile" draftScope="immediate-reopen" t={t} submit={submit}><label>Nickname<input name="nickname" defaultValue="Original" /></label><label>Region<input name="region" defaultValue={region} /></label></SaveForm>
  const mounted = render(form())
  fireEvent.change(screen.getByLabelText('Nickname'), { target: { value: 'First save' } })
  fireEvent.click(screen.getByRole('button', { name: en.save }))
  await screen.findByRole('status')
  mounted.unmount()
  const reopened = render(form())
  expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('First save')
  fireEvent.change(screen.getByLabelText('Nickname'), { target: { value: 'Second save' } })
  reopened.unmount()
  const edited = render(form())
  expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('Second save')
  expect((screen.getByLabelText('Region') as HTMLInputElement).value).toBe('Saved region')
  edited.rerender(form('saved-v3', 'Newest region'))
  expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('Second save')
  expect((screen.getByLabelText('Region') as HTMLInputElement).value).toBe('Newest region')
  fireEvent.click(screen.getByRole('button', { name: en.save }))
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(2))
  expect(JSON.parse(submit.mock.calls[1]![2]).baseline).toBe(JSON.stringify({ nickname: 'First save', region: 'Saved region' }))
})

it('lets a parent resolve a changed baseline while retaining or adopting current values', async () => {
  const submit = vi.fn().mockRejectedValueOnce(new Error('Current name changed')).mockResolvedValue(undefined)
  const form = (name: string) => <SaveForm revision={2} baseline={JSON.stringify({ nickname: name })} currentValues={{ nickname: name }} entity="profile" draftScope="conflict" t={t} submit={submit}>
    <label>Nickname<input name="nickname" defaultValue={name} /></label>
  </SaveForm>
  const { rerender } = render(form('Original name'))
  fireEvent.change(screen.getByLabelText('Nickname'), { target: { value: 'My draft' } })
  rerender(form('Current name'))
  fireEvent.click(screen.getByRole('button', { name: en.save }))
  await screen.findByRole('alert')
  fireEvent.click(screen.getByRole('button', { name: en.keepDraft }))
  expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('My draft')
  fireEvent.click(screen.getByRole('button', { name: en.save }))
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(2))
  expect(JSON.parse(submit.mock.calls[1]![2])).toEqual({ baseline: JSON.stringify({ nickname: 'Current name' }), editedFields: ['nickname'] })
  submit.mockRejectedValueOnce(new Error('Changed again'))
  fireEvent.change(screen.getByLabelText('Nickname'), { target: { value: 'Another draft' } })
  rerender(form('Newest name'))
  fireEvent.click(screen.getByRole('button', { name: en.save }))
  await screen.findByRole('alert')
  fireEvent.click(screen.getByRole('button', { name: en.useCurrentValues }))
  expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('Newest name')
  expect(window.sessionStorage.getItem('conflict:profile')).toBeNull()
})

it('sends the complete original answer to native chat without a business pre-save', async () => {
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: { id: 'q1', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '8 + 7?' } }, NOW)
  const body = dashboard(state, NOW)
  const fetch = vi.fn(async () => new Response(JSON.stringify(body)))
  vi.stubGlobal('fetch', fetch)
  const ask = vi.fn().mockResolvedValue({ requestId: 'native-1', admission: 'accepted' })
  const useResource = (address: string) => ({ status: 'live' as const, failure: undefined, value: { status: 'valid', token: 'one', readAt: NOW, refreshAfter: NOW + 1000, versions: [], native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [], data: new URL(address).searchParams.get('query')?.includes('learning-context') ? { termId: 'term-one', pendingFacts: [] } : body } as StudentQueryResult })
  const remote = { inspectSubmission: vi.fn(), manualContext: vi.fn(), saveManual: vi.fn() }
  render(<StudyDesk useResource={useResource} {...createStudentManualActions(remote)} sessionId="native-session" visible running={false} ask={ask} t={t} />)
  fireEvent.change(await screen.findByLabelText(en.answer), { target: { value: attempt.response } })
  fireEvent.click(screen.getByRole('button', { name: en.submit }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const message = String(ask.mock.calls[0]![0])
  expect(message).toContain('term-one')
  expect(message).toContain(start.id)
  expect(message).toContain('q1')
  expect(message).toContain(attempt.response)
  expect(message).toContain('responseId')
  expect(fetch.mock.calls.every(call => call.length === 1)).toBe(true)
  expect(screen.queryByText(`${en.answer}: ${attempt.response}`)).toBeNull()
})

it('keeps the unfinished question primary while browsing another subject', async () => {
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: { id: 'q1', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '8 + 7?' } }, NOW)
  const useResource = (address: string) => ({ status: 'live' as const, failure: undefined, value: { status: 'valid', token: 'one', readAt: NOW, refreshAfter: NOW + 1000, versions: [], native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [], data: new URL(address).searchParams.get('query')?.includes('learning-context') ? { termId: 'term-one', pendingFacts: [] } : dashboard(state, NOW, { subject: new URL(address).searchParams.get('query')?.includes('chinese') ? 'chinese' : 'math' }) } as StudentQueryResult })
  const remote = { inspectSubmission: vi.fn(), manualContext: vi.fn(), saveManual: vi.fn() }
  render(<StudyDesk useResource={useResource} {...createStudentManualActions(remote)} sessionId="native-session" visible running={false} ask={vi.fn()} t={t} />)
  await screen.findByText('8 + 7?')
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  expect(screen.getByText('8 + 7?')).toBeTruthy()
  expect(screen.queryByRole('button', { name: en.startNow })).toBeNull()
})

it.each(['answer', 'hint', 'continue', 'stop'] as const)('keeps the active question subject and scope in a %s intention after browsing', async action => {
  const scope = { grade: 2, term: 'first' as const, units: ['m2a-u-sub'], objectiveIds: ['m2a-o-sub'] }
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), { ...start, scope }, NOW), { action: 'task', task: { id: 'q1', sessionId: start.id, subject: 'math', objectiveId: 'm2a-o-sub', topic: 'Subtraction', prompt: '18 - 7?' } }, NOW)
  const useResource = (address: string) => ({ status: 'live' as const, failure: undefined, value: { status: 'valid', token: 'one', readAt: NOW, refreshAfter: NOW + 1000, versions: [], native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [], data: new URL(address).searchParams.get('query')?.includes('learning-context') ? { termId: 'term-one', pendingFacts: [] } : dashboard(state, NOW, { subject: new URL(address).searchParams.get('query')?.includes('chinese') ? 'chinese' : 'math' }) } as StudentQueryResult })
  state.task!.hintLevel = 1
  const ask = vi.fn().mockResolvedValue({ requestId: 'native-1', admission: 'accepted' })
  render(<StudyDesk useResource={useResource} {...createStudentManualActions({ inspectSubmission: vi.fn(), manualContext: vi.fn(), saveManual: vi.fn() })} sessionId="browse-native" visible running={false} ask={ask} t={t} />)
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  fireEvent.click(screen.getByText(en.otherWays))
  fireEvent.change(screen.getByLabelText(en.scopeLabel), { target: { value: '1-second' } })
  if (action === 'answer') {
    fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '11' } })
    fireEvent.click(screen.getByRole('button', { name: en.submit }))
  } else fireEvent.click(screen.getByRole('button', { name: action === 'hint' ? en.hintMore : action === 'continue' ? en.retryHint : en.stop }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intent = JSON.parse(String(ask.mock.calls[0]![0]).split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intent).toMatchObject({ blockId: start.id, questionId: 'q1', selection: { subject: 'math', goalId: 'm2a-o-sub', scope } })
  if (action === 'continue') expect(intent).not.toHaveProperty('operation')
  else expect(intent.operation).toMatchObject({ action, ...(action === 'answer' ? { response: '11' } : {}) })
})

it('retains a parent nickname draft across navigation and saves only its original edited-field baseline', async () => {
  const state = updateStudy(undefined, setup, NOW)
  const body = dashboard(state, NOW)
  const result = (data: unknown) => ({ status: 'valid', token: 'one', readAt: NOW, refreshAfter: NOW + 1000, versions: [], native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [], data })
  const useResource = (address: string) => ({ status: 'live' as const, failure: undefined, value: result(new URL(address).searchParams.get('query')?.includes('learning-context') ? { termId: 'term-one', pendingFacts: [] } : body) as StudentQueryResult })
  const manualContext = vi.fn().mockResolvedValue({ ok: true, value: { termId: 'term-one', versions: [{ path: '.study/settings.json', version: 'v2' }], baseline: { 'profile:nickname': setup.profile.nickname }, readStatus: 'valid', issues: [] } })
  const saveManual = vi.fn().mockResolvedValue({ ok: true, value: { status: 'conflict', current: { 'profile:nickname': 'Current name' }, versions: [], readStatus: 'valid', issues: [] } })
  const ask = vi.fn()
  render(<StudyDesk {...{ useResource, ask }} {...createStudentManualActions({ manualContext, saveManual, inspectSubmission: vi.fn() })} sessionId="parent-native" visible running={false} t={t} />)
  fireEvent.click(screen.getByRole('button', { name: en.parentView }))
  fireEvent.click(screen.getByRole('button', { name: en.parentProfile }))
  fireEvent.click(screen.getByText(en.manualForms))
  fireEvent.change(screen.getByLabelText(en.nickname), { target: { value: 'My draft name' } })
  fireEvent.click(screen.getByRole('button', { name: en.today }))
  fireEvent.click(screen.getByRole('button', { name: en.parentView }))
  fireEvent.click(screen.getByText(en.manualForms))
  expect((screen.getByLabelText(en.nickname) as HTMLInputElement).value).toBe('My draft name')
  fireEvent.submit(screen.getByLabelText(en.nickname).closest('form')!)
  await screen.findByRole('alert')
  expect(screen.getByRole('alert').textContent).toContain('Current name')
  expect((screen.getByLabelText(en.nickname) as HTMLInputElement).value).toBe('My draft name')
  expect(saveManual.mock.calls[0]?.[1]).toMatchObject({ termId: 'term-one', expectedVersions: [{ path: '.study/settings.json', version: 'v2' }], baseline: { 'profile:nickname': setup.profile.nickname }, intent: { kind: 'settings', editedProfileFields: ['nickname'] } })
  expect(ask).not.toHaveBeenCalled()
})

it('retains a worksheet correction draft and separates its original assessment, assistance and answer-day baselines', async () => {
  const state = updateStudy(undefined, setup, NOW)
  const body = dashboard(state, NOW)
  const response = { id: 'paper-response', questionId: 'paper-question', rawResponse: '24', assistance: 'independent', answerDate: { kind: 'unknown' }, source: { kind: 'paper', imagePaths: [], parentConfirmation: 'Parent confirmed original answer' } }
  const assessment = { id: 'paper-assessment', responseId: response.id, result: 'incorrect', assistance: 'independent', feedback: 'Original feedback', answerEvidence: '24 + 28 = 52', assessedAt: NOW, userConfirmation: 'Parent confirmed original assessment' }
  const sheet = { format: 2, kind: 'worksheet', termId: 'term-one', id: 'paper-sheet', subject: 'math', origin: 'prepared', createdAt: NOW, context: {}, items: [{ id: response.questionId, objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original question' }, topic: 'Subtraction', prompt: '52 - 28 = ?', answer: '24', explanation: 'Subtract after regrouping', answerEvidence: '24 + 28 = 52' }], responses: [response], assessments: [assessment], drafts: [] }
  const useResource = (address: string) => ({ status: 'live' as const, failure: undefined, value: { status: 'valid', token: 'one', readAt: NOW, refreshAfter: NOW + 1000, versions: [], native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [], data: new URL(address).searchParams.get('query')?.includes('learning-context') ? { termId: 'term-one', pendingFacts: [] } : new URL(address).searchParams.get('query')?.includes('files') ? { worksheets: [sheet] } : body } as StudentQueryResult })
  const manualContext = vi.fn().mockResolvedValue({ ok: true, value: { termId: 'term-one', versions: [{ path: '.study/worksheets/paper-sheet.json', version: 'paper-v2' }], baseline: {}, readStatus: 'valid', issues: [] } })
  const saveManual = vi.fn().mockResolvedValue({ ok: true, value: { status: 'conflict', current: { 'assessment:paper-response': { ...assessment, feedback: 'Current feedback' } }, versions: [], readStatus: 'valid', issues: [] } })
  const ask = vi.fn()
  render(<StudyDesk {...{ useResource, ask }} {...createStudentManualActions({ manualContext, saveManual, inspectSubmission: vi.fn() })} sessionId="paper-native" visible running={false} t={t} />)
  fireEvent.click(screen.getByRole('button', { name: en.parentView }))
  fireEvent.click(screen.getByRole('button', { name: en.mistakes }))
  fireEvent.click(screen.getByText('Optional: correct saved worksheet records'))
  fireEvent.change(screen.getByLabelText(en.feedback), { target: { value: 'My retained feedback' } })
  fireEvent.change(screen.getByLabelText('Help used'), { target: { value: 'hint' } })
  fireEvent.change(screen.getByLabelText('Actual answer day'), { target: { value: '2026-11-10' } })
  fireEvent.click(screen.getByRole('button', { name: en.today }))
  fireEvent.click(screen.getByRole('button', { name: en.parentView }))
  fireEvent.click(screen.getByText('Optional: correct saved worksheet records'))
  expect((screen.getByLabelText(en.feedback) as HTMLTextAreaElement).value).toBe('My retained feedback')
  fireEvent.submit(screen.getByLabelText(en.feedback).closest('form')!)
  expect((await screen.findByRole('alert')).textContent).toContain('Current feedback')
  expect(saveManual.mock.calls[0]?.[1]).toMatchObject({ termId: 'term-one', expectedVersions: [{ path: '.study/worksheets/paper-sheet.json', version: 'paper-v2' }], baseline: { 'assessment:paper-response': assessment, 'response:paper-response': { assistance: 'independent', answerDate: { kind: 'unknown' } } }, intent: { kind: 'worksheet-assessments', worksheetId: 'paper-sheet', assessments: [{ responseId: response.id, feedback: 'My retained feedback', assistance: 'hint', result: 'incorrect' }], responseUpdates: [{ responseId: response.id, assistance: 'hint', answerDate: { kind: 'day', day: '2026-11-10' } }] } })
  expect((screen.getByLabelText(en.feedback) as HTMLTextAreaElement).value).toBe('My retained feedback')
  expect(ask).not.toHaveBeenCalled()
})

it('shows the inherited worksheet day and saves an explicit unknown override without changing the original answer', async () => {
  const response = { id: 'r1', questionId: 'q1', rawResponse: '24', assistance: 'unknown', source: { kind: 'paper', imagePaths: [], parentConfirmation: 'Confirmed answer' } }
  const sheet = { format: 2, kind: 'worksheet', termId: 'term-one', id: 'sheet-one', subject: 'math', origin: 'prepared', createdAt: NOW, context: {}, answerDate: { kind: 'day', day: '2026-11-10', parentConfirmation: 'Confirmed day' }, items: [{ id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original' }, topic: 'Subtraction', prompt: '52 - 28?', answer: '24', explanation: 'Subtract', answerEvidence: '24 + 28 = 52' }], responses: [response], assessments: [], drafts: [] }
  const useResource = () => ({ status: 'live' as const, failure: undefined, value: { versions: [], data: { worksheets: [sheet] } } as StudentQueryResult })
  const save = vi.fn().mockResolvedValue(undefined)
  render(<WorksheetCorrections sessionId="native-paper" termId="term-one" draftScope="inherited-day" {...{ useResource, save, t }} disabled={false} />)
  fireEvent.click(screen.getByText(en.manualWorksheet))
  expect((screen.getByLabelText(en.actualAnswerDay) as HTMLInputElement).value).toBe('2026-11-10')
  fireEvent.change(screen.getByLabelText(en.actualAnswerDay), { target: { value: '' } })
  fireEvent.submit(screen.getByLabelText(en.actualAnswerDay).closest('form')!)
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0]![0]).toMatchObject({ kind: 'worksheet-assessments', worksheetId: 'sheet-one', assessments: [], responseUpdates: [{ responseId: 'r1', answerDate: { kind: 'unknown' } }] })
  expect(save.mock.calls[0]![1]).toEqual({ 'response:r1': { answerDate: null } })
  expect(screen.getByText(`${en.learnerAnswer}: 24`)).toBeTruthy()
})

it('shows unresolved help, source and effective answer date beside the learning path', () => {
  const body = dashboard(updateStudy(undefined, setup, NOW), NOW)
  const useResource = (address: string) => ({ status: 'live' as const, failure: undefined, value: { status: 'valid', token: 'one', readAt: NOW, refreshAfter: NOW + 1000, versions: [], native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [], data: new URL(address).searchParams.get('query')?.includes('learning-context') ? { termId: 'term-one', pendingFacts: [{ ownerId: 'earlier-block', responseId: 'earlier-response', fields: ['answerDate', 'assistance', 'source'] }] } : body } as StudentQueryResult })
  render(<StudyDesk {...{ useResource }} {...createStudentManualActions({ inspectSubmission: vi.fn(), manualContext: vi.fn(), saveManual: vi.fn() })} sessionId="current-native" visible running={false} ask={vi.fn()} t={t} />)
  expect(screen.getByText(en.answerDateUnknown, { exact: false })).toBeTruthy()
  expect(screen.getByText(en.assistanceUnknown, { exact: false })).toBeTruthy()
  expect(screen.getByText('Answer source awaiting verification', { exact: false })).toBeTruthy()
  expect(screen.getByText('earlier-response', { exact: false })).toBeTruthy()
})

it('saves a worksheet-wide answer day while retaining per-response overrides', async () => {
  const sheet = { format: 2, kind: 'worksheet', termId: 'term-one', id: 'sheet-one', subject: 'math', origin: 'prepared', createdAt: NOW, context: {}, answerDate: { kind: 'unknown' }, items: [{ id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original' }, topic: 'Subtraction', prompt: '52 - 28?', answer: '24', explanation: 'Subtract', answerEvidence: '24 + 28 = 52' }], responses: [{ id: 'r1', questionId: 'q1', rawResponse: '24', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: { kind: 'paper', imagePaths: [], parentConfirmation: 'Confirmed answer' } }], assessments: [], drafts: [] }
  const useResource = () => ({ status: 'live' as const, failure: undefined, value: { versions: [], data: { worksheets: [sheet] } } as StudentQueryResult })
  const save = vi.fn().mockResolvedValue(undefined)
  render(<WorksheetCorrections sessionId="native-paper" termId="term-one" draftScope="whole-sheet-day" {...{ useResource, save, t }} disabled={false} />)
  fireEvent.click(screen.getByText(en.manualWorksheet))
  fireEvent.change(screen.getByLabelText('Worksheet answer day'), { target: { value: '2026-11-11' } })
  fireEvent.submit(screen.getByLabelText('Worksheet answer day').closest('form')!)
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0]![0]).toMatchObject({ kind: 'worksheet-assessments', worksheetId: 'sheet-one', assessments: [], answerDate: { kind: 'day', day: '2026-11-11' } })
  expect(save.mock.calls[0]![1]).toEqual({ answerDate: { kind: 'unknown' } })
  expect((screen.getByLabelText(en.actualAnswerDay) as HTMLInputElement).value).toBe('')
})

function StudyDesk(props: Omit<import('react').ComponentProps<typeof RealStudyDesk>, keyof import('../src/client/drafts.tsx').DraftProps>) { return <RealStudyDesk {...props} {...useDraftFixture()} /> }

function WorksheetCorrections(props: Omit<import('react').ComponentProps<typeof RealWorksheetCorrections>, keyof import('../src/client/drafts.tsx').DraftProps>) { return <RealWorksheetCorrections {...props} {...useDraftFixture()} /> }

function SaveForm(props: Omit<import('react').ComponentProps<typeof RealSaveForm>, keyof import('../src/client/drafts.tsx').DraftProps>) {
  const draft = useDraftFixture()
  const identity = { useStore: draft.useStore, draftKey: `${props.draftScope ?? 'student:standalone'}:${props.entity ?? 'confirmation'}`, observation: props.observation ?? `${props.revision}:${props.baseline}` }
  const controls = (node: import('react').ReactNode): import('react').ReactNode => {
    if (!isValidElement<{ children?: import('react').ReactNode }>(node)) return node
    if (node.type === 'input') return <DraftInput {...identity} {...node.props} />
    if (node.props.children) return cloneElement(node, {}, Children.map(node.props.children, controls))
    return node
  }
  return <RealSaveForm {...props} {...draft}>{Children.map(props.children, controls)}</RealSaveForm>
}
