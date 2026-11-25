import { useDraftFixture } from './draft-fixture.tsx'
import { createStudentManualActions } from '../src/client/manual-actions.ts'
// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ParentSettings as RealParentSettings } from '../src/client/forms.tsx'
import { StudyDesk as RealStudyDesk } from '../src/client/desk.tsx'
import { studentClientFixture } from './student-client-fixture.tsx'
import type { ComponentProps } from 'react'
import { dashboard } from '../src/dashboard.ts'
import { updateStudy } from './fixtures.ts'
import { en, zh } from '../src/client/locales.ts'
import { NOW, MINUTE, DAY, setup, material, course, start, attempt, mistake, confirm } from './fixtures.ts'

const t = (key: keyof typeof en) => en[key]
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); window.localStorage.clear(); window.sessionStorage.clear() })
const answerTask = { id: attempt.id, sessionId: attempt.sessionId, subject: attempt.subject, topic: attempt.topic, prompt: attempt.prompt }
const initial = () => updateStudy(updateStudy(updateStudy(undefined, setup, Date.now()), start, Date.now()), { action: 'task', task: answerTask }, Date.now())

let backend: ReturnType<typeof studentClientFixture>
function installResource(state = initial()) { backend = studentClientFixture(state); return backend }
function StudyDesk(props: Omit<ComponentProps<typeof RealStudyDesk>, 'useResource' | keyof import('../src/client/manual-actions.ts').StudentManualActions | keyof import('../src/client/drafts.tsx').DraftProps>) {
  return <RealStudyDesk {...props} useResource={backend.useResource} {...useDraftFixture()} {...createStudentManualActions(backend.remote)} ask={async (text, photo) => { await props.ask(text, photo); await backend.consume(text) }} />
}

async function openDesk(tab: 'Knowledge map' | 'Mistakes' | 'Parent setup') {
  fireEvent.click(await screen.findByRole('button', { name: tab === 'Knowledge map' ? en.parentProgress : tab === 'Parent setup' ? en.parentProfile : en.parentPractice, exact: false }))
}

function worksheetState() {
  let state = updateStudy(undefined, setup, NOW)
  state = updateStudy(state, { action: 'concept', concept: { id: 'ten', subject: 'math', name: '凑十', definition: '先组成十', example: '8+2=10', source: '课本' } }, NOW)
  state = updateStudy(state, { action: 'confirm-concept', id: 'ten', userConfirmation: '家长核对' }, NOW)
  state = updateStudy(state, { action: 'objective', objective: { id: 'add', subject: 'math', title: '凑十加法', goal: '解释步骤', conceptIds: ['ten'], method: 'represent' } }, NOW)
  state = updateStudy(state, { action: 'mistake', mistake }, NOW)
  state = updateStudy(state, confirm, NOW)
  state = updateStudy(state, { action: 'link-mistake', mistakeId: mistake.id, objectiveId: 'add' }, NOW)
  return updateStudy(state, { action: 'worksheet', worksheet: { id: 'sheet', subject: 'math', objectiveId: 'add', items: [{ id: 'q1', mistakeId: mistake.id, prompt: '请计算 9+6。', answer: '15', explanation: '先凑十。', answerEvidence: '9+1+5=15' }] } }, NOW)
}

describe('learning workbench', () => {
  it('puts answer controls before optional question goals and opens marking directly', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const state = updateStudy(updateStudy(worksheetState(), start, NOW), { action: 'task', task: { ...answerTask, objectiveId: 'add', phase: 'try' } }, NOW)
    installResource(state)
    render(<StudyDesk sessionId="focused-question" visible running={false} ask={vi.fn()} t={t} />)
    const answer = await screen.findByRole('textbox', { name: en.answer })
    const details = screen.getByText(en.taskDetails).closest('details')!
    expect(details.open).toBe(false)
    expect(answer.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByText(en.studyDetails)).toBeNull()
    expect(screen.getByRole('main').innerHTML).toMatchSnapshot()
    fireEvent.click(screen.getByRole('button', { name: en.parentPractice }))
    expect(await screen.findByRole('heading', { name: `${en.worksheets} · 1` })).toBeTruthy()
    expect(screen.getByText(en.uploadHomework).closest('details')!.open).toBe(false)
  })
  it('resets microsteps when another block reuses the same question number', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const question = { ...answerTask, steps: ['圈条件', '验算'] }
    let state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: question }, NOW)
    const backend = installResource(state)
    const props = { sessionId: 'steps', running: false, ask: vi.fn(), t }
    const view = render(<StudyDesk {...props} visible />)
    fireEvent.click(await screen.findByLabelText('圈条件'))
    expect((screen.getByLabelText('圈条件') as HTMLInputElement).checked).toBe(true)
    state = updateStudy(state, { ...start, id: 'block-2' }, NOW)
    state = updateStudy(state, { action: 'task', task: { ...question, sessionId: 'block-2', prompt: '新学习段的问题' } }, NOW)
    backend.replace(state)
    view.rerender(<StudyDesk {...props} visible={false} />)
    view.rerender(<StudyDesk {...props} visible />)
    await screen.findByText('新学习段的问题')
    expect((screen.getByLabelText('圈条件') as HTMLInputElement).checked).toBe(false)
  })
  it('refreshes displayed counts without a write and retains the current draft', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: answerTask }, NOW)
    state.mistakes.push({ ...mistake, uncertainties: '', confirmedAt: NOW, dueAt: NOW + MINUTE, stage: 0, independentDays: [] })
    const backend = installResource(state)
    const props = { sessionId: 'clock', running: false, ask: vi.fn(), t }
    const view = render(<StudyDesk {...props} visible />)
    fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '未保存答案' } })
    clock.mockReturnValue(NOW + MINUTE)
    view.rerender(<StudyDesk {...props} visible={false} />)
    view.rerender(<StudyDesk {...props} visible />)
    expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('未保存答案')
    expect(dashboard(state, NOW + MINUTE).study?.dueToday).toHaveLength(1)
    expect(backend.requests).toEqual([])
  })
  it('retains the original answer draft when native admission fails without claiming a business save', async () => {
    const backend = installResource()
    const ask = vi.fn().mockRejectedValue(new Error('Tutor unavailable'))
    render(<StudyDesk sessionId="one" visible running={false} ask={ask} t={t} />)
    fireEvent.change(screen.getByLabelText('My answer'), { target: { value: attempt.response } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }))
    await screen.findByText('Tutor unavailable')
    expect(backend.read().task?.response).toBeUndefined()
    expect((screen.getByLabelText('My answer') as HTMLInputElement).value).toBe(attempt.response)
    expect(backend.requests).toEqual([])
  })

  it('records a hint and permits stopping even while the tutor is running', async () => {
    const backend = installResource()
    const ask = vi.fn().mockResolvedValue(undefined)
    const view = render(<StudyDesk sessionId="one" visible running={false} ask={ask} t={t} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Give me a hint' }))
    await waitFor(() => expect(backend.read().task?.hintLevel).toBe(1))
    expect(String(ask.mock.calls[0]?.[0])).not.toContain('不会做时先教')
    fireEvent.click(screen.getByRole('button', { name: 'Another hint' }))
    await waitFor(() => expect(backend.read().task?.hintLevel).toBe(2))
    expect(String(ask.mock.calls[1]?.[0])).toContain('不会做时先教')
    view.rerender(<StudyDesk sessionId="one" visible running ask={ask} t={t} />)
    fireEvent.click(screen.getByRole('button', { name: en.finishToday }))
    await waitFor(() => expect(backend.read().sessions[0]?.endedAt).toBeDefined())
    expect(backend.read().rewards).toEqual([])
  })

  it('records 不会 from the task and sends a hinted-correct grade', async () => {
  const backend = installResource()
  const ask = vi.fn().mockResolvedValue(undefined)
  const view = render(<StudyDesk sessionId="stuck" visible running={false} ask={ask} t={t} />)
  fireEvent.click(await screen.findByRole('button', { name: en.wont }))
  await waitFor(() => expect(backend.read().attempts[0]).toMatchObject({ result: 'stuck', response: '不会' }))
  expect(String(ask.mock.calls[0]?.[0])).toContain('不会做时先教')
  view.unmount()
  const sheet = updateStudy(worksheetState(), { action: 'worksheet', worksheet: { id: 'pair', subject: 'math', objectiveId: 'add', items: [
    { id: 'a', prompt: '请计算 9+6。', answer: '15', explanation: '先凑十。', answerEvidence: '9+1+5=15' },
  ] } }, NOW)
  const graded = installResource(sheet)
  render(<StudyDesk sessionId="hinted-grade" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  const details = screen.getAllByText('凑十加法 · 1 questions · Not checked yet 1')[0]!.closest('details')!
  fireEvent.click(details.querySelector('summary')!)
  const panel = within(details)
  fireEvent.click(panel.getByRole('radio', { name: en.markCorrect }))
  fireEvent.click(panel.getByRole('checkbox', { name: en.hintedCorrect }))
  fireEvent.click(panel.getByRole('button', { name: 'Save marks · 1' }))
  await screen.findByText(en.intentAdmitted)
  expect(graded.read().paperResults[0]).toMatchObject({ itemId: 'a', result: 'correct', assistance: 'hint' })
})

  it('releases visible resource addresses when the tab is hidden', () => {
    installResource()
    const view = render(<StudyDesk sessionId="one" visible running={false} ask={vi.fn()} t={t} />)
    backend.addresses.mockClear()
    view.rerender(<StudyDesk sessionId="one" visible={false} running={false} ask={vi.fn()} t={t} />)
    expect(backend.addresses).toHaveBeenCalledWith('')
  })

})

it('allows editing and explicitly confirming an image transcription including the original answer', async () => {
  const state = updateStudy(updateStudy(undefined, setup, Date.now()), { action: 'mistake', mistake: { id: 'image-1', subject: 'math', topic: 'Blurry addition', prompt: '8 + ?', learnerAnswer: '14', correction: '15', explanation: 'Make ten', answerEvidence: '8+2+5=15', uncertainties: 'Check second digit' } }, Date.now())
  const backend = installResource(state)
  render(<StudyDesk sessionId="one" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  const pending = screen.getByText('Blurry addition').closest('details')!
  fireEvent.click(within(pending).getByText('Blurry addition'))
  fireEvent.change(within(pending).getByLabelText('Question'), { target: { value: '8 + 7?' } })
  fireEvent.change(within(pending).getByLabelText('Original answer'), { target: { value: '13' } })
  fireEvent.click(within(pending).getByRole('button', { name: 'Confirm and schedule review' }))
  await waitFor(() => expect(screen.queryByRole('heading', { name: /^Awaiting confirmation/ })).toBeNull())
  expect(screen.getByRole('heading', { name: 'Confirmed mistakes · Math · 1' })).toBeTruthy()
  fireEvent.click(screen.getByText('Blurry addition'))
  expect(screen.getByText('Question: 8 + 7?')).toBeTruthy()
  expect(screen.getByText('Original answer: 13')).toBeTruthy()
  expect(backend.read().mistakes[0]).toMatchObject({ prompt: '8 + 7?', learnerAnswer: '13', uncertainties: '' })
})

it('keeps separate subject notebooks with their own counts and pages', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const state = updateStudy(undefined, setup, NOW)
  state.mistakes = Array.from({ length: 21 }, (_, index) => ({ ...mistake, id: `error-${index}`, topic: `Topic ${index}`, confirmedAt: NOW, dueAt: NOW + DAY, userConfirmation: 'Parent checked', uncertainties: '', stage: 0, independentDays: [] }))
  state.mistakes.push(...Array.from({ length: 2 }, (_, index) => ({ ...mistake, id: `chinese-${index}`, subject: 'chinese' as const, topic: `Chinese topic ${index}`, confirmedAt: NOW, dueAt: NOW + DAY, userConfirmation: 'Parent checked', uncertainties: '', stage: 0, independentDays: [] })))
  state.mistakes.push({ ...mistake, id: 'english-0', subject: 'english', topic: 'English topic', confirmedAt: NOW, dueAt: NOW + DAY, userConfirmation: 'Parent checked', uncertainties: '', stage: 0, independentDays: [] })
  state.mistakes.push({ ...mistake, id: 'pending', stage: 0, independentDays: [] })
  const backend = installResource(state)
  render(<StudyDesk sessionId="notebook" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  expect(screen.getByRole('heading', { name: 'Confirmed mistakes · Math · 21' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Chinese' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'English' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Due · 0' })).toBeTruthy()
  const entry = screen.getByText('Topic 20').closest('details')!
  fireEvent.click(within(entry).getByText('Topic 20'))
  expect(within(entry).getByText(`Corrected answer: ${mistake.correction}`)).toBeTruthy()
  expect(within(entry).getByText(`Answer evidence: ${mistake.answerEvidence}`)).toBeTruthy()
  expect(within(entry).getByText(/Next review:/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  await screen.findByText('Topic 0')
  expect(screen.queryByText('Topic 20')).toBeNull()
  expect(screen.getByText('Page 2 / 2')).toBeTruthy()
  expect(backend.addresses).toHaveBeenCalledWith(expect.stringContaining('%22mistakeOffset%22%3A20'))
  fireEvent.click(screen.getByRole('button', { name: 'Chinese' }))
  await screen.findByText('Chinese topic 1')
  expect(screen.getByRole('heading', { name: 'Confirmed mistakes · Chinese · 2' })).toBeTruthy()
  expect(screen.queryByText('Topic 0')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'English' }))
  await screen.findByText('English topic')
  expect(screen.queryByText('Chinese topic 1')).toBeNull()
  expect(backend.addresses).toHaveBeenCalledWith(expect.stringContaining('%22subject%22%3A%22english%22'))
})

it('confirms a concept before showing it as a learning goal source', async () => {
  let state = updateStudy(undefined, setup, NOW)
  state = updateStudy(state, { action: 'concept', concept: { id: 'ten', subject: 'math', name: '凑十', definition: '先组成十', example: '8+2=10', source: '课本' } }, NOW)
  const backend = installResource(state)
  render(<StudyDesk sessionId="concept" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Knowledge map')
  fireEvent.click(await screen.findByText('凑十 · Awaiting parent review'))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm concept' }))
  await waitFor(() => expect(backend.read().concepts[0]?.confirmedAt).toBeDefined())
  expect(backend.read().concepts[0]?.userConfirmation).toBe(en.confirmConcept)
})

it('previews the sheet as HTML and prints through the browser dialog', async () => {
  const print = vi.fn()
  vi.stubGlobal('print', print)
  const backend = installResource(worksheetState())
  render(<StudyDesk sessionId="paper" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  fireEvent.click(screen.getByText('凑十加法 · 1 questions · Not checked yet 1'))
  const preview = screen.getByRole('button', { name: en.previewPrintSheet })
  preview.focus()
  fireEvent.click(preview)
  const dialog = await screen.findByRole('dialog', { name: 'Math review sheet' })
  expect(within(dialog).getByText('1. 请计算 9+6。')).toBeTruthy()
  expect(within(dialog).getAllByText((_, element) => element?.textContent === en.sheetNameDate)).toHaveLength(1)
  expect(backend.addresses.mock.calls.some(([url]) => String(url).startsWith('/student/print?'))).toBe(false)
  fireEvent.click(within(dialog).getByRole('button', { name: en.printSheet }))
  expect(print).toHaveBeenCalledTimes(1)
  expect(fireEvent.keyDown(dialog, { key: 'Escape' })).toBe(false)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(document.activeElement).toBe(preview)
})

it('confirms high-confidence transcriptions in one batch and leaves the rest for review', async () => {
  const sheet = updateStudy(worksheetState(), { action: 'worksheet', worksheet: { id: 'pair', subject: 'math', objectiveId: 'add', items: [
    { id: 'a', prompt: '请计算 3+4。', answer: '7', explanation: '加法', answerEvidence: '3+4=7' },
    { id: 'b', prompt: '请计算 8+5。', answer: '13', explanation: '凑十', answerEvidence: '8+2+5=13' },
  ] } }, NOW)
  let state = sheet
  state = updateStudy(state, { action: 'paper-draft', paperDraft: { worksheetId: 'pair', itemId: 'a', response: '7', result: 'correct', assistance: 'independent', uncertainties: '', confidence: 'high' } }, NOW)
  state = updateStudy(state, { action: 'paper-draft', paperDraft: { worksheetId: 'pair', itemId: 'b', response: '1?', result: 'incorrect', assistance: 'independent', uncertainties: '字迹不清', confidence: 'low' } }, NOW)
  const backend = installResource(state)
  render(<StudyDesk sessionId="batch" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  const details = screen.getAllByText('凑十加法 · 2 questions · Not checked yet 2')[0]!.closest('details')!
  fireEvent.click(details.querySelector('summary')!)
  fireEvent.click(within(details).getByRole('button', { name: `${en.confirmHighConfidence} · 1` }))
  await screen.findByText(en.intentAdmitted)
  expect(backend.read().paperResults).toHaveLength(1)
  expect(backend.read().paperResults[0]).toMatchObject({ itemId: 'a', result: 'correct' })
  expect(backend.read().paperDrafts).toHaveLength(1)
})

it('batches only clearly transcribed correct responses and preserves their assistance', async () => {
  const entries = [
    { id: 'right', result: 'correct', assistance: 'hint', uncertainties: '' },
    { id: 'unknown-help', result: 'correct', assistance: 'unknown', uncertainties: '' },
    { id: 'unknown', result: 'unassessed', assistance: 'independent', uncertainties: '' },
    { id: 'wrong', result: 'incorrect', assistance: 'independent', uncertainties: '' },
    { id: 'partial', result: 'partial', assistance: 'independent', uncertainties: '' },
    { id: 'unclear', result: 'correct', assistance: 'independent', uncertainties: '数字不清' },
  ] as const
  let state = updateStudy(undefined, setup, NOW)
  state = updateStudy(state, { action: 'worksheet', worksheet: { id: 'safe', subject: 'math', objectiveId: 'm2a-o-sub', items: entries.map(entry => ({ id: entry.id, prompt: `题目 ${entry.id}`, answer: '15', explanation: '加法', answerEvidence: '8+7=15' })) } }, NOW)
  for (const entry of entries) state = updateStudy(state, { action: 'paper-draft', paperDraft: { worksheetId: 'safe', itemId: entry.id, response: '15', result: entry.result, assistance: entry.assistance, uncertainties: entry.uncertainties, confidence: 'high' } }, NOW)
  const backend = installResource(state)
  render(<StudyDesk sessionId="safe-batch" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  fireEvent.click(screen.getByText(/6 questions/).closest('summary')!)
  const batch = await screen.findByRole('button', { name: `${en.confirmHighConfidence} · 1` })
  fireEvent.click(batch)
  await screen.findByText(en.intentAdmitted)
  expect(backend.read().paperResults).toEqual([expect.objectContaining({ itemId: 'right', result: 'correct', assistance: 'hint' })])
  expect(backend.read().paperDrafts.map(item => item.itemId)).toEqual(['unknown-help', 'unknown', 'wrong', 'partial', 'unclear'])
  expect(screen.queryByRole('button', { name: /Confirm high-confidence transcriptions/ })).toBeNull()
})

it('keeps a correct unknown-assistance transcription individually editable and confirmable', async () => {
  let state = updateStudy(undefined, setup, NOW)
  state = updateStudy(state, { action: 'worksheet', worksheet: { id: 'unknown-help-sheet', subject: 'math', objectiveId: 'm2a-o-sub', items: [{ id: 'q1', prompt: '18 - 7?', answer: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18' }] } }, NOW)
  state = updateStudy(state, { action: 'paper-draft', paperDraft: { worksheetId: 'unknown-help-sheet', itemId: 'q1', response: '1l', result: 'correct', assistance: 'unknown', uncertainties: '', confidence: 'high' } }, NOW)
  const backend = installResource(state)
  render(<StudyDesk sessionId="unknown-help" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  fireEvent.click(screen.getByText(/1 questions/).closest('summary')!)
  expect(screen.queryByRole('button', { name: /Confirm high-confidence transcriptions/ })).toBeNull()
  fireEvent.change(screen.getByDisplayValue('1l'), { target: { value: '11' } })
  fireEvent.click(screen.getByRole('button', { name: `${en.confirmPaper} · 1` }))
  await waitFor(() => expect(backend.read().paperResults).toHaveLength(1))
  expect(backend.read().paperResults[0]).toMatchObject({ itemId: 'q1', response: '11', result: 'correct', assistance: 'unknown' })
})

it('saves a worksheet cause-only edit and retains known help when correcting its mark', async () => {
  let state = worksheetState()
  state = updateStudy(state, { action: 'grade-sheet', grade: { worksheetId: 'sheet', results: [{ itemId: 'q1', result: 'incorrect', response: '14', assistance: 'worked-example', errorType: 'carry-borrow' }], userConfirmation: '家长核对。' } }, NOW)
  const backend = installResource(state)
  render(<StudyDesk sessionId="cause-edit" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  const summary = screen.getByText('凑十加法 · 1 questions · Checked 1/1')
  fireEvent.click(summary)
  const panel = within(summary.closest('details')!)
  fireEvent.change(panel.getByLabelText(en.errorTypeLabel), { target: { value: 'calculation' } })
  fireEvent.click(panel.getByRole('button', { name: 'Save marks · 1' }))
  await waitFor(() => expect(backend.read().mistakes[0]?.errorType).toBe('calculation'))
  fireEvent.click(panel.getByRole('radio', { name: en.markCorrect }))
  fireEvent.click(panel.getByRole('button', { name: 'Save marks · 1' }))
  await waitFor(() => expect(backend.read().paperResults[0]?.result).toBe('correct'))
  expect(backend.read().paperResults[0]?.assistance).toBe('worked-example')
})

it('requires an explicit school year and saves an empty optional course note', async () => {
  const change = vi.fn(async (command: unknown) => dashboard(updateStudy(undefined, command, NOW), NOW))
  render(<ParentSettings data={dashboard(undefined, NOW)} change={change} t={t} />)
  const year = screen.getByRole('combobox', { name: 'School year' }) as HTMLSelectElement
  expect(year.value).toBe('')
  expect(year.validity.valueMissing).toBe(true)
  expect([...year.options].map(option => option.value)).toContain('2026–2027')
  fireEvent.change(year, { target: { value: '2026–2027' } })
  fireEvent.change(screen.getByLabelText('Nickname'), { target: { value: '小禾' } })
  expect((screen.getByLabelText('Course note (optional)') as HTMLInputElement).required).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await screen.findByText('Saved')
  expect(change).toHaveBeenCalledWith(expect.objectContaining({ action: 'setup', profile: expect.objectContaining({ schoolYear: '2026–2027', schoolAlias: '', parentConfirmation: en.profileConfirm }) }), 0, expect.any(String))
})

it('saves consecutive parent forms at current revisions while preserving an unrelated draft', async () => {
  let state = updateStudy(undefined, setup, NOW)
  const change = vi.fn(async (command, revision) => {
    if (revision !== state.revision) throw new Error('学习档案已更新')
    state = updateStudy(state, command, NOW)
    return dashboard(state, NOW)
  })
  const view = render(<ParentSettings data={dashboard(state, NOW)} change={change} t={t} />)
  fireEvent.change(screen.getByLabelText(en.openmaicBase), { target: { value: 'https://classroom.example' } })
  fireEvent.change(screen.getByLabelText(en.nickname), { target: { value: '小苗' } })
  fireEvent.submit(screen.getByLabelText(en.nickname).closest('form')!)
  await screen.findByText(en.saved)
  view.rerender(<ParentSettings data={dashboard(state, NOW)} change={change} t={t} />)
  expect((screen.getByLabelText(en.openmaicBase) as HTMLInputElement).value).toBe('https://classroom.example')
  fireEvent.submit(screen.getByLabelText(en.openmaicBase).closest('form')!)
  await waitFor(() => expect(state.openmaic?.baseUrl).toBe('https://classroom.example'))
  expect(change.mock.calls.map(call => call[1])).toEqual([1, 2])
})

it('keeps a parent draft and its conflict when the edited record changes', async () => {
  let state = updateStudy(undefined, setup, NOW)
  const change = vi.fn(async (command, revision) => {
    if (revision !== state.revision) throw new Error('学习档案已更新')
    state = updateStudy(state, command, NOW)
    return dashboard(state, NOW)
  })
  const view = render(<ParentSettings data={dashboard(state, NOW)} change={change} t={t} />)
  fireEvent.change(screen.getByLabelText(en.nickname), { target: { value: '未保存昵称' } })
  state = updateStudy(state, { ...setup, profile: { ...setup.profile, nickname: '另一处保存的昵称' } }, NOW)
  view.rerender(<ParentSettings data={dashboard(state, NOW)} change={change} t={t} />)
  expect((screen.getByLabelText(en.nickname) as HTMLInputElement).value).toBe('未保存昵称')
  fireEvent.submit(screen.getByLabelText(en.nickname).closest('form')!)
  await screen.findByRole('alert')
  expect(state.profile.nickname).toBe('另一处保存的昵称')
  expect((screen.getByLabelText(en.nickname) as HTMLInputElement).value).toBe('未保存昵称')
})

it('saves the selected course and school frontier with one parent request', async () => {
  let state = updateStudy(undefined, setup, NOW)
  const data = dashboard(state, NOW)
  const change = vi.fn(async command => { state = updateStudy(state, command, NOW); return dashboard(state, NOW) })
  render(<ParentSettings data={data} curriculum={data.study!.curriculum} change={change} t={t} />)
  fireEvent.change(screen.getByLabelText(en.unit), { target: { value: 'm2a-u-mul' } })
  fireEvent.submit(screen.getByLabelText(en.unit).closest('form')!)
  await screen.findByText(en.saved)
  expect(change).toHaveBeenCalledTimes(1)
  expect(state.revision).toBe(2)
  expect(state.courses[0]?.progress).toMatchObject({ unitId: 'm2a-u-mul' })
})

it('offers the preceding school year before September without silently selecting it', () => {
  const beforeSeptember = Date.parse('2026-08-31T23:00:00+08:00')
  render(<ParentSettings data={dashboard(undefined, beforeSeptember)} change={vi.fn()} t={t} />)
  const year = screen.getByRole('combobox', { name: 'School year' }) as HTMLSelectElement
  expect(year.value).toBe('')
  expect([...year.options].map(option => option.value)).toEqual(['', '2026–2027', '2025–2026', '2024–2025', '2023–2024', '2022–2023', '2021–2022', '2020–2021'])
})

it('shows the saved answer with feedback and offers the next question', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  let state = initial()
  state = updateStudy(state, { action: 'answer', taskId: attempt.id, response: attempt.response }, NOW)
  state = updateStudy(state, { action: 'record', attempt }, NOW)
  installResource(state)
  render(<StudyDesk sessionId="feedback" visible running={false} ask={vi.fn()} t={t} />)
  await screen.findByText(`My answer: ${attempt.response}`)
  expect(screen.getByText(attempt.feedback)).toBeTruthy()
  expect(screen.getByRole('button', { name: en.continueLearning })).toBeTruthy()
  expect(screen.queryByText(/Due for review: 0 · Weak points: 0/)).toBeNull()
})

it('shows the open block subject without elapsed time', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const serverNow = NOW + 5000
  const state = updateStudy(updateStudy(undefined, setup, serverNow), start, serverNow)
  installResource(state)
  render(<StudyDesk sessionId="clock" visible running={false} ask={vi.fn()} t={t} />)
  await screen.findByText(new RegExp(`${en.learningNow} · Math`))
  expect(screen.queryByText(/This block:/)).toBeNull()
  expect(screen.queryByText(/Due for review: 0 · Weak points: 0/)).toBeNull()
})

it('keeps math goals and lessons off the Chinese today page', async () => {
  window.localStorage.clear(); window.sessionStorage.clear()
  let state = updateStudy(undefined, setup, NOW - 3 * DAY)
  state = updateStudy(state, { action: 'mistake', mistake: { ...mistake, id: 'math-due', objectiveId: 'm2a-o-tables', topic: '口诀错题' } }, NOW - 2 * DAY)
  state = updateStudy(state, { ...confirm, id: 'math-due' }, NOW - 2 * DAY + MINUTE)
  state = updateStudy(state, { ...start, id: 'check', mode: 'diagnose' }, NOW)
  state = updateStudy(state, { action: 'task', task: { id: 'p1', sessionId: 'check', subject: 'math', topic: '摸底', prompt: '第 1 题', objectiveId: 'm2a-o-tables' } }, NOW + MINUTE)
  state = updateStudy(state, { action: 'answer', taskId: 'p1', response: '答' }, NOW + MINUTE)
  state = updateStudy(state, { action: 'record', attempt: { ...attempt, id: 'p1', sessionId: 'check', topic: '摸底', prompt: '第 1 题', response: '答', result: 'incorrect', objectiveId: 'm2a-o-tables' } }, NOW + MINUTE)
  state = updateStudy(state, { action: 'stop', sessionId: 'check', reflection: '' }, NOW + 2 * MINUTE)
  const lessons = [
    { id: 'om-math', status: 'ready' as const, createdAt: '2026-10-28T06:00:00.000Z', updatedAt: '2026-10-28T06:05:00.000Z', title: '数学乘法课', requirement: '练乘法', subject: 'math' as const, objectiveId: 'm2a-o-tables', base: 'http://localhost:3000', classroomId: 'room-math', url: 'http://localhost:3000/classroom/math' },
    { id: 'om-zh', status: 'ready' as const, createdAt: '2026-10-28T06:00:00.000Z', updatedAt: '2026-10-28T06:06:00.000Z', title: '语文识字课', requirement: '认生字', subject: 'chinese' as const, base: 'http://localhost:3000', classroomId: 'room-zh', url: 'http://localhost:3000/classroom/zh' },
  ]
  backend = studentClientFixture(state, { ...dashboard(state, NOW).interactiveLessons, lessons })
  const ask = vi.fn().mockResolvedValue(undefined)
  render(<StudyDesk sessionId="subjects" visible running={false} ask={ask} t={t} />)
  expect(screen.queryByText(/数学乘法课/)).toBeNull()
  expect(screen.queryByText('语文识字课')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.lessonHistory }))
  expect(screen.getByText(/数学乘法课/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  await screen.findByText(/语文识字课/)
  expect(screen.queryByText(/数学乘法课/)).toBeNull()
  expect(ask).not.toHaveBeenCalled()
})

it('keeps the knowledge map and mistake book in the four Parent sections', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  let state = updateStudy(undefined, setup, NOW - DAY)
  state = updateStudy(state, { action: 'mistake', mistake }, NOW - DAY)
  state = updateStudy(state, confirm, NOW - DAY)
  const backend = installResource(state)
  const ask = vi.fn().mockResolvedValue(undefined)
  render(<StudyDesk sessionId="main" visible running={false} ask={ask} t={t} />)
  expect(screen.queryByRole('button', { name: en.startNow })).toBeNull()
  expect(screen.queryByRole('heading', { name: 'Knowledge map · Math' })).toBeNull()
  await openDesk('Knowledge map')
  await screen.findByRole('heading', { name: '数学二年级上册知识地图' })
  expect(screen.getByRole('heading', { name: 'Units and knowledge points' })).toBeTruthy()
  expect(screen.getByRole('button', { name: '两位数不退位减法' })).toBeTruthy()
  fireEvent.click(screen.getByText(/表内乘法 · Mastered/))
  fireEvent.click(screen.getAllByRole('button', { name: '乘法的意义' })[0]!)
  expect(screen.getByText('Definition: 求几个相同加数的和，可以用乘法，比连加更简便。')).toBeTruthy()
  expect(screen.getAllByRole('button', { name: '2、4、8的乘法口诀' }).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('button', { name: /Practise this goal/ }).length).toBeGreaterThan(0)
  fireEvent.click(screen.getByText('100 以内数的加减法（二） · Mastered 0/3'))
  expect(screen.getAllByRole('img', { name: 'Mastered 0 · Practising 0 · Not practised lately 0 · Needs work 0 · Review due 0 · Not started 3' }).length).toBeGreaterThan(0)
  expect(screen.getByRole('button', { name: en.parentPractice })).toBeTruthy()
  expect(screen.getByRole('button', { name: en.lessonHistory })).toBeTruthy()
  expect(ask).not.toHaveBeenCalled()
})

it('filters the mistake book by review status', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const state = updateStudy(undefined, setup, NOW)
  state.mistakes = [
    { ...mistake, id: 'due-1', topic: 'Due topic', confirmedAt: NOW - DAY, dueAt: NOW - 1, userConfirmation: 'Parent checked', uncertainties: '', stage: 0, independentDays: [] },
    { ...mistake, id: 'done-1', topic: 'Consolidated topic', confirmedAt: NOW - DAY, dueAt: NOW + 30 * DAY, userConfirmation: 'Parent checked', uncertainties: '', stage: 4, independentDays: ['2026-10-01'] },
  ]
  const backend = installResource(state)
  render(<StudyDesk sessionId="filter" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  expect(screen.getByRole('heading', { name: 'Confirmed mistakes · Math · 2' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Consolidated · 1' }))
  await screen.findByRole('heading', { name: 'Confirmed mistakes · Math · 1' })
  expect(screen.getByText('Consolidated topic · Consolidated')).toBeTruthy()
  expect(screen.queryByText('Due topic · Due now')).toBeNull()
  expect(backend.addresses).toHaveBeenCalledWith(expect.stringContaining('%22mistakeStatus%22%3A%22mastered%22'))
  fireEvent.click(screen.getByRole('button', { name: 'Due · 1' }))
  await screen.findByText('Due topic · Due now')
  expect(screen.queryByText('Consolidated topic · Consolidated')).toBeNull()
})

it('lets the learner tap a choice as the answer', async () => {
  const choiceTask = { ...answerTask, choices: ['15', '14', '16'] }
  const backend = installResource(updateStudy(updateStudy(updateStudy(undefined, setup, Date.now()), start, Date.now()), { action: 'task', task: choiceTask }, Date.now()))
  const ask = vi.fn().mockResolvedValue(undefined)
  render(<StudyDesk sessionId="choice" visible running={false} ask={ask} t={t} />)
  await screen.findByText('Tap an answer')
  expect(screen.queryByLabelText('My answer')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '15' }))
  await waitFor(() => expect(backend.read().task?.response).toBe('15'))
  expect(ask).toHaveBeenCalledOnce()
  await screen.findByText('My answer: 15')
})

it('browses another grade and term on the knowledge map without goal buttons', async () => {
  const backend = installResource(updateStudy(undefined, setup, NOW))
  render(<StudyDesk sessionId="browse" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Knowledge map')
  await screen.findByRole('heading', { name: '数学二年级上册知识地图' })
  expect(screen.queryByText('身体尺')).toBeNull()
  fireEvent.click(screen.getByText(/100 以内数的加减法（二） · Mastered/))
  fireEvent.click(screen.getByRole('button', { name: '两位数不退位减法' }))
  expect(screen.getAllByRole('button', { name: /Practise this goal/ }).length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Concepts' }))
  expect(screen.getByRole('heading', { name: 'Concepts' })).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Compare' })).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Cross-grade ideas' })).toBeTruthy()
  expect(screen.getAllByText('我的学校').length).toBeGreaterThan(0)
  expect(screen.getAllByText('我的房间').length).toBeGreaterThan(0)
  expect(screen.getByText(en.ideasHelp)).toBeTruthy()
  expect(screen.getByText('身体尺')).toBeTruthy()
  expect(screen.getByText('千以内的数')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Knowledge map' }))
  fireEvent.change(screen.getByRole('combobox', { name: 'Grade' }), { target: { value: '1' } })
  await screen.findByRole('heading', { name: '数学一年级上册知识地图' })
  fireEvent.click(screen.getByRole('button', { name: 'Concepts' }))
  expect(screen.getByText('身体尺')).toBeTruthy()
  expect(screen.getByText('千以内的数')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Knowledge map' }))
  expect(screen.getByText(/Browsing another grade or term/)).toBeTruthy()
  const browseSummary = screen.getAllByText(/· Mastered \d+\/\d+/)[0]!
  const browseUnit = browseSummary.closest('details')!
  fireEvent.click(browseSummary)
  fireEvent.click(within(browseUnit).getAllByRole('button')[0]!)
  expect(screen.queryByRole('button', { name: /Practise this goal/ })).toBeNull()
  expect(backend.addresses).toHaveBeenCalledWith(expect.stringContaining('%22mapGrade%22%3A1'))
  fireEvent.change(screen.getByRole('combobox', { name: 'Term' }), { target: { value: 'second' } })
  await screen.findByRole('heading', { name: '数学一年级下册知识地图' })
  fireEvent.click(screen.getByRole('button', { name: 'Back to current term' }))
  await screen.findByRole('heading', { name: '数学二年级上册知识地图' })
})

it('filters the knowledge map to needs-work points and hides untouched ones', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  let state = updateStudy(undefined, setup, NOW - 2 * DAY)
  state = updateStudy(state, { action: 'mistake', mistake: { ...mistake, objectiveId: 'm2a-o-tables' } }, NOW - 2 * DAY)
  state = updateStudy(state, { ...confirm, id: 'error-1' }, NOW - 2 * DAY)
  installResource(state)
  render(<StudyDesk sessionId="map-filter" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Knowledge map')
  expect(screen.getByRole('button', { name: '两位数不退位减法' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Needs work or due' }))
  expect(screen.queryByRole('button', { name: '两位数不退位减法' })).toBeNull()
  expect(screen.getAllByRole('button', { name: /乘法口诀|用口诀算乘法/ }).length).toBeGreaterThan(0)
})

it('asks for a mixed unit practice sheet', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  installResource(worksheetState())
  const ask = vi.fn().mockResolvedValue(undefined)
  render(<StudyDesk sessionId="paper" visible running={false} ask={ask} t={t} />)
  await openDesk('Mistakes')
  fireEvent.click(screen.getByRole('button', { name: 'Print a practice sheet' }))
  await waitFor(() => expect(ask).toHaveBeenCalled())
  const prompt = String(ask.mock.calls[0]?.[0])
  expect(prompt).toContain('questions.md')
  expect(prompt).toContain('6 到 8')
  expect(prompt).not.toContain('不超过 5')
})

it('links worksheets to their source mistakes and shows review stages', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  installResource(worksheetState())
  render(<StudyDesk sessionId="links" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  fireEvent.click(screen.getByText('凑十加法 · 1 questions · Not checked yet 1'))
  expect(screen.getByText('1. 请计算 9+6。')).toBeTruthy()
  expect(screen.getByText('Answer key: 15 · Source mistake: 加法')).toBeTruthy()
  fireEvent.click(screen.getByText('加法'))
  expect(screen.getByText(/Review stage: 1 \/ 5/)).toBeTruthy()
  expect(screen.getByText('Related worksheets: 凑十加法 · Checked 0/1')).toBeTruthy()
})

it('lets the parent mark a printed sheet per question and discard it', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW + DAY)
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
  const backend = installResource(worksheetState())
  const ask = vi.fn().mockResolvedValue(undefined)
  render(<StudyDesk sessionId="grade" visible running={false} ask={ask} t={t} />)
  await openDesk('Mistakes')
  expect(screen.getByText(/Ready for review: 0 · Sheets not yet checked: 1/)).toBeTruthy()
  fireEvent.click(screen.getByText('凑十加法 · 1 questions · Not checked yet 1'))
  const save = screen.getByRole('button', { name: 'Save marks' }) as HTMLButtonElement
  expect(save.disabled).toBe(true)
  fireEvent.click(screen.getByRole('radio', { name: 'Wrong' }))
  fireEvent.change(screen.getByLabelText('What the child wrote (optional)'), { target: { value: '14' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save marks · 1' }))
  await screen.findByText(en.intentAdmitted)
  expect(backend.read().paperResults[0]).toMatchObject({ itemId: 'q1', result: 'incorrect', response: '14', feedback: '家长批改' })
  expect(backend.read().mistakes[0]).toMatchObject({ stage: 0 })
  await screen.findByText(/Ready for review: 1/)
  fireEvent.click(screen.getByRole('button', { name: 'Print a review sheet' }))
  await waitFor(() => expect(ask).toHaveBeenCalledWith(expect.stringContaining('kind=review-sheet subject=math'), undefined))
  fireEvent.click(screen.getByRole('button', { name: 'Discard this sheet' }))
  await waitFor(() => expect(backend.read().worksheets[0]?.discardedAt).toBeDefined())
  await waitFor(() => expect(screen.queryByText(/凑十加法 · 1 questions/)).toBeNull())
})

it('scopes check-ins to the selected subject and starts a light check-in', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const backend = installResource(updateStudy(undefined, setup, NOW - DAY))
  const ask = vi.fn().mockResolvedValue(undefined)
  render(<StudyDesk sessionId="tab" visible running={false} ask={ask} t={t} />)
  await openDesk('Knowledge map')
  for (const name of ['Chinese', 'English', 'Math']) {
    fireEvent.click(screen.getByRole('button', { name, exact: true }))
    await screen.findByRole('heading', { name: `${name} · A check-in is suggested` })
    for (const other of ['Chinese', 'Math', 'English'].filter(item => item !== name)) {
      expect(screen.queryByRole('heading', { name: `${other} · A check-in is suggested` })).toBeNull()
    }
    expect(screen.getAllByRole('button', { name: 'Standard · 6 · Recommended' })).toHaveLength(1)
  }
  fireEvent.click(screen.getByRole('button', { name: 'Light · 3' }))
  expect(screen.getByText('3 choice questions, a few minutes')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Start check-in · Math' }))
  await waitFor(() => expect(ask).toHaveBeenCalledWith(expect.stringContaining(en.intensityLight), undefined))
  expect(backend.read().sessions[0]).toMatchObject({ subject: 'math', mode: 'diagnose', intensity: 'light' })
  expect(ask.mock.calls[0]?.[0]).toContain('m2a-o-meaning')
})

it('confirms a transcribed draft in the panel and records the chosen error cause', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  let state = worksheetState()
  state = updateStudy(state, { action: 'paper-draft', paperDraft: { worksheetId: 'sheet', itemId: 'q1', response: '14', result: 'incorrect', assistance: 'independent', uncertainties: '答数有点糊' } }, NOW)
  const backend = installResource(state)
  render(<StudyDesk sessionId="drafts" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  fireEvent.click(screen.getByText('凑十加法 · 1 questions · Not checked yet 1'))
  const drafts = screen.getByRole('group', { name: en.draftsTitle })
  expect(within(drafts).getByText(`${en.uncertainties}: 答数有点糊`)).toBeTruthy()
  expect(within(drafts).getByRole('radio', { name: en.markWrong }).getAttribute('aria-checked')).toBe('true')
  fireEvent.change(within(drafts).getByLabelText(en.errorTypeLabel), { target: { value: 'carry-borrow' } })
  fireEvent.click(within(drafts).getByRole('button', { name: `${en.confirmPaper} · 1` }))
  await screen.findByText(en.intentAdmitted)
  expect(backend.read().paperDrafts).toEqual([])
  expect(backend.read().paperResults[0]).toMatchObject({ itemId: 'q1', result: 'incorrect', response: '14', feedback: '家长核对照片转录' })
  expect(backend.read().mistakes[0]).toMatchObject({ id: mistake.id, errorType: 'carry-borrow' })
})

it('classifies a mistake in the notebook without adding a competing learner routine card', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  let state = updateStudy(undefined, setup, NOW)
  state = updateStudy(state, { action: 'mistake', mistake: { ...mistake, objectiveId: 'm2a-o-sub' } }, NOW)
  state = updateStudy(state, confirm, NOW)
  const backend = installResource(state)
  const ask = vi.fn().mockResolvedValue(undefined)
  render(<StudyDesk sessionId="routine" visible running={false} ask={ask} t={t} />)
  await openDesk('Mistakes')
  const entry = screen.getByText(mistake.topic).closest('details')!
  fireEvent.click(within(entry).getByText(mistake.topic))
  fireEvent.change(within(entry).getAllByLabelText(en.errorTypeLabel)[0]!, { target: { value: 'carry-borrow' } })
  fireEvent.click(within(entry).getByRole('button', { name: en.saveErrorType }))
  await waitFor(() => expect(backend.read().mistakes[0]?.errorType).toBe('carry-borrow'))
  fireEvent.click(screen.getByRole('button', { name: en.learningEntry }))
  expect(screen.queryByRole('heading', { name: `${en.routineTitle} · Math` })).toBeNull()
})

it('draws a saved task figure beside the question', async () => {
  const task = { ...answerTask, figure: { kind: 'clock' as const, clocks: [{ hour: 3, minute: 0 }] } }
  installResource(updateStudy(updateStudy(updateStudy(undefined, setup, Date.now()), start, Date.now()), { action: 'task', task }, Date.now()))
  render(<StudyDesk sessionId="figure" visible running={false} ask={vi.fn()} t={t} />)
  expect(await screen.findByRole('img', { name: en.figureClock })).toBeTruthy()
  expect(screen.getByText(task.prompt)).toBeTruthy()
})

it('marks unmarked questions right and keeps a question the parent already marked wrong', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const state = updateStudy(worksheetState(), { action: 'worksheet', worksheet: { id: 'pair', subject: 'math', objectiveId: 'add', items: [
    { id: 'a', prompt: '请计算 9+6。', answer: '15', explanation: '先凑十。', answerEvidence: '9+1+5=15' },
    { id: 'b', prompt: '请计算 8+3。', answer: '11', explanation: '先凑十。', answerEvidence: '8+2+1=11' },
  ] } }, NOW)
  const backend = installResource(state)
  render(<StudyDesk sessionId="marks" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  const sheet = screen.getByText('凑十加法 · 2 questions · Not checked yet 2').closest('details')!
  fireEvent.click(sheet.querySelector('summary')!)
  const view = within(sheet)
  const first = view.getByRole('radiogroup', { name: '1' })
  const second = view.getByRole('radiogroup', { name: '2' })
  fireEvent.click(within(first).getByRole('radio', { name: en.markWrong }))
  fireEvent.click(view.getByRole('button', { name: en.markAllCorrect }))
  expect(within(first).getByRole('radio', { name: en.markWrong }).getAttribute('aria-checked')).toBe('true')
  expect(within(second).getByRole('radio', { name: en.markCorrect }).getAttribute('aria-checked')).toBe('true')
  fireEvent.click(view.getByRole('button', { name: 'Save marks · 2' }))
  await screen.findByText(en.intentAdmitted)
  expect(backend.read().paperResults).toEqual(expect.arrayContaining([
    expect.objectContaining({ itemId: 'a', result: 'incorrect' }),
    expect.objectContaining({ itemId: 'b', result: 'correct' }),
  ]))
})

function ParentSettings(props: Omit<import('react').ComponentProps<typeof RealParentSettings>, keyof import('../src/client/drafts.tsx').DraftProps>) { return <RealParentSettings {...props} {...useDraftFixture()} /> }

it('renders pending assessment feedback from the selected Chinese dictionary', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const state = initial()
  state.task!.response = attempt.response
  state.attempts = [{ ...attempt, result: 'unassessed', feedback: 'Pending assessment', at: NOW }]
  installResource(state)
  render(<StudyDesk sessionId="pending-copy" visible running={false} ask={vi.fn()} t={key => zh[key]} />)
  await screen.findByText(zh.assessmentPending)
  expect(screen.queryByText('Pending assessment')).toBeNull()
})

it('puts the weekly summary before folded records and settings on the parent page', async () => {
  installResource(worksheetState())
  render(<StudyDesk sessionId="parent-order" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Parent setup')
  const weekly = screen.getByRole('heading', { name: en.weeklyTitle })
  for (const name of [en.learningRecords, en.manualForms, `${en.evidence} · ${en.math}`]) {
    const fold = screen.getByText(name).closest('details')!
    expect(fold.open).toBe(false)
    expect(weekly.compareDocumentPosition(fold) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  }
  expect(screen.getByText(en.archiveConversation).closest('details')?.querySelector('summary')?.textContent).toBe(en.archiveTerm)
  fireEvent.click(screen.getByRole('button', { name: en.english, exact: true }))
  await screen.findByRole('heading', { name: `${en.masteryOverview} · ${en.english}` })
})

it('keeps practice actions visible and folds review guidance and mistake management', async () => {
  installResource(worksheetState())
  render(<StudyDesk sessionId="practice-order" visible running={false} ask={vi.fn()} t={t} />)
  await openDesk('Mistakes')
  expect(screen.getByRole('button', { name: en.createWorksheet })).toBeTruthy()
  expect(screen.getByText(en.reviewPlanDetails).closest('details')!.open).toBe(false)
  expect(screen.getByText(en.manageMistake).closest('details')!.open).toBe(false)
  expect(screen.getByText(en.addMistake, { selector: 'summary' }).closest('details')!.parentElement!.closest('details')!.querySelector('summary')!.textContent).toBe(en.uploadHomework)
  expect(screen.queryByRole('heading', { name: /^Due for review/ })).toBeNull()
  expect(screen.queryByRole('heading', { name: /^Awaiting confirmation/ })).toBeNull()
})
