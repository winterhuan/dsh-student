// @vitest-environment jsdom
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { StudyDesk } from '../src/client/desk.tsx'
import { en } from '../src/client/locales.ts'
import { useDraftFixture } from './draft-fixture.tsx'
import { createStudentManualActions } from '../src/client/manual-actions.ts'
import { studentClientFixture } from './student-client-fixture.tsx'
import { updateStudy, NOW, setup, start } from './fixtures.ts'

const t = (key: keyof typeof en) => en[key]
afterEach(() => { cleanup(); window.localStorage.clear(); window.sessionStorage.clear(); vi.restoreAllMocks() })

function mount(context?: import('../src/types.ts').StudentJsonValue, options: { lessons?: import('../src/dashboard.ts').Dashboard['interactiveLessons']; openLesson?: import('react').ComponentProps<typeof StudyDesk>['openLesson'] } = {}) {
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: { id: 'current-question', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '8 + 7?' } }, NOW)
  const fixture = studentClientFixture(state, options.lessons, context)
  const ask = vi.fn().mockResolvedValue(undefined)
  function Desk() { return <StudyDesk {...useDraftFixture()} {...createStudentManualActions(fixture.remote)} useResource={fixture.useResource} sessionId="two-entries" visible running={false} ask={ask} t={t} openLesson={options.openLesson} /> }
  render(<Desk />)
  return { ask, fixture }
}

it('has only Learning and Parent main entries and preserves an answer draft through parent browsing', async () => {
  mount()
  const main = screen.getByRole('navigation', { name: en.title })
  expect(within(main).getAllByRole('button').map(button => button.textContent)).toEqual(['Learning', 'Parent'])
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '15 with ten first' } })
  fireEvent.click(within(main).getByRole('button', { name: 'Parent' }))
  fireEvent.click(screen.getByRole('button', { name: en.parentPractice }))
  expect(screen.getByText(en.uploadHomework)).toBeTruthy()
  fireEvent.click(within(main).getByRole('button', { name: 'Learning' }))
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('15 with ten first')
  expect(screen.queryByText(en.openmaicTitle)).toBeNull()
})

it('preserves reflection and exploration drafts through parent browsing', () => {
  mount()
  fireEvent.change(screen.getByLabelText(en.reflection), { target: { value: 'I made ten first' } })
  fireEvent.change(screen.getByLabelText(en.mode), { target: { value: 'explore' } })
  fireEvent.change(screen.getByLabelText(en.inquiryQuestion), { target: { value: 'Why does making ten help?' } })
  const main = screen.getByRole('navigation', { name: en.title })
  fireEvent.click(within(main).getByRole('button', { name: en.parentEntry }))
  fireEvent.click(within(main).getByRole('button', { name: en.learningEntry }))
  expect((screen.getByLabelText(en.reflection) as HTMLTextAreaElement).value).toBe('I made ten first')
  expect((screen.getByLabelText(en.inquiryQuestion) as HTMLTextAreaElement).value).toBe('Why does making ten help?')
})

it('keeps the question draft visible and waits for matching dashboard and learning-context versions', () => {
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: { id: 'current-question', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '8 + 7?' } }, NOW)
  const fixture = studentClientFixture(state, undefined, { learnerId: 'learner-one', termId: 'term-one', nextAction: { kind: 'answer', reason: 'unfinished-question', subject: 'math', title: 'Addition', blockId: start.id, questionId: 'current-question' } })
  let contextVersion = 'v2'
  const useResource: import('../src/client/workspace.ts').UseStudentResource = address => {
    const resource = fixture.useResource(address)
    return { ...resource, value: { ...resource.value, versions: [{ path: '.study/blocks/current.json', targetKey: 'current', version: address.includes('learning-context') ? contextVersion : 'v2' }] } }
  }
  function Desk() { return <StudyDesk {...useDraftFixture()} {...createStudentManualActions(fixture.remote)} useResource={useResource} sessionId="coherent" visible running={false} ask={vi.fn()} t={t} /> }
  const view = render(<Desk />)
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'Keep this thought' } })
  contextVersion = 'v1'
  view.rerender(<Desk />)
  expect((screen.getByRole('button', { name: en.continueLearning }) as HTMLButtonElement).disabled).toBe(true)
  contextVersion = 'v2'
  view.rerender(<Desk />)
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('Keep this thought')
  expect((screen.getByRole('button', { name: en.continueLearning }) as HTMLButtonElement).disabled).toBe(false)
})

it('continues the original block after browsing another subject without starting a new block', async () => {
  const { ask } = mount()
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue learning' }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const message = String(ask.mock.calls[0]![0])
  const intention = JSON.parse(message.split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intention.blockId).toBe(start.id)
  expect(intention.questionId).toBe('current-question')
  expect(intention.selection.subject).toBe('math')
  expect(intention.operation).toBeUndefined()
  expect(message).toContain('nextAction')
  expect(message).not.toContain('curl')
})

it('preserves learner identity and the shared next action when the child submits a native answer', async () => {
  const { ask } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction: { kind: 'answer', reason: 'unfinished-question', subject: 'math', title: 'Make ten', goalId: 'goal-one', blockId: start.id, questionId: 'current-question' } })
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '15' } })
  fireEvent.click(screen.getByRole('button', { name: en.submit }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const text = String(ask.mock.calls[0]![0])
  const intent = JSON.parse(text.split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intent).toMatchObject({ learnerId: 'learner-one', termId: 'term-one', blockId: start.id, questionId: 'current-question', nextAction: { goalId: 'goal-one' }, operation: { action: 'answer', response: '15' } })
  expect(text).toContain('独立 study_status')
  expect(text).not.toContain('curl')
})

it('shows original answers, original grade history and effective grades in the Parent entry', () => {
  mount({ learnerId: 'learner-one', termId: 'term-one', officialFeedback: [{ responseId: 'official-one', prompt: '8 + 7?', rawResponse: '"15"', result: 'correct', sourceStatus: 'known', grading: 'equivalent', feedback: 'Two equivalent options', assistance: 'unknown', answerDate: { kind: 'unknown' }, official: { seq: 5, result: { status: 'correct', earned: 10, aiComment: 'Correct after review' } }, officialHistory: [{ seq: 4, result: { status: 'incorrect', earned: 0, aiComment: 'Original mark' } }] }] })
  fireEvent.click(screen.getByRole('button', { name: en.parentEntry }))
  expect(screen.getByText('"15"')).toBeTruthy()
  expect(screen.getByText('Original mark')).toBeTruthy()
  expect(screen.getByText('Two equivalent options')).toBeTruthy()
  expect(screen.getByText('Correct after review')).toBeTruthy()
  expect(screen.getByText(en.answerDateUnknown)).toBeTruthy()
})

const classroom = { id: 'original-class', title: 'Make ten', requirement: 'Use the confirmed goal', status: 'ready' as const, createdAt: '2026-10-28T06:00:00.000Z', updatedAt: '2026-10-28T06:05:00.000Z', base: 'https://example.test', classroomId: 'room-one', url: 'https://example.test/classroom/room-one' }
const lessonList = (lesson: typeof classroom) => ({ lessons: [lesson] })
const currentScope = { id: 'within20', description: 'Addition within20', modality: 'written' as const, numberMax: 20 }
const currentAction = { kind: 'answer', reason: 'unfinished-question', subject: 'math', title: 'Make ten', goalId: 'm.add', blockId: start.id, questionId: 'current-question', scope: currentScope }
const currentContext = { termId: 'term-one', learnerId: 'learner-one', nextAction: currentAction, currentQuestion: { id: 'current-question', openmaic: { bindingId: 'binding-one' } } }
const currentClassroom = { ...classroom, blockId: start.id, learnerId: 'learner-one', termId: 'term-one', subject: 'math', objectiveId: 'm.add', feedback: { bindingId: 'binding-one', blockId: start.id, learnerId: 'learner-one', termId: 'term-one', goalId: 'm.add', familyId: 'math.add-column', scope: currentScope } }

it.each(['ready', 'generating'] as const)('keeps an unowned %s classroom out of the current learning status', status => {
  mount({ learnerId: 'learner-one', termId: 'term-one' }, { lessons: lessonList({ ...classroom, title: 'Unowned old classroom', status } as typeof classroom) })
  expect(screen.queryByText('Unowned old classroom')).toBeNull()
  expect(screen.queryByText(/Unowned old classroom/)).toBeNull()
})


it('keeps the current local question ahead of a ready classroom for the same goal', async () => {
  const nextAction = { kind: 'answer', reason: 'unfinished-question', subject: 'math', title: 'Local missing evidence', goalId: 'm.add', blockId: start.id, questionId: 'current-question', scope: { id: 'within20', description: 'Addition within20', modality: 'written', numberMax: 20 } }
  const openLesson = vi.fn()
  const { ask } = mount({ termId: 'term-one', nextAction }, { lessons: lessonList({ ...classroom, blockId: start.id, objectiveId: 'm.add' } as typeof classroom), openLesson })
  expect(screen.queryByRole('button', { name: en.goToClass })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(openLesson).not.toHaveBeenCalled()
  expect(String(ask.mock.calls[0]![0])).toContain('current-question')
})

it('opens the chosen saved classroom through protected playback rather than a direct URL', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null)
  const openLesson = vi.fn().mockResolvedValue({ status: 'opened', browser: 'dedicated-chrome', classroomUrl: classroom.url })
  const { ask } = mount(currentContext, { lessons: lessonList(currentClassroom), openLesson })
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  ask.mockClear()
  fireEvent.click(screen.getByRole('button', { name: en.goToClass }))
  await waitFor(() => expect(openLesson).toHaveBeenCalledWith(classroom.id))
  expect(open).not.toHaveBeenCalled()
  expect(ask).not.toHaveBeenCalled()
})

it.each([
  { objectiveId: 'm.sub', feedback: { ...currentClassroom.feedback, goalId: 'm.sub' } },
  { feedback: { ...currentClassroom.feedback, scope: { ...currentScope, numberMax: 100 } } },
  { feedback: { ...currentClassroom.feedback, bindingId: 'old-binding' } },
  { blockId: 'old-block' },
  { learnerId: 'another-learner' },
  { termId: 'another-term' },
])('keeps Continue on the current action when a ready classroom has an incompatible binding: %j', overrides => {
  mount(currentContext, { lessons: lessonList({ ...currentClassroom, ...overrides }) })
  expect(screen.queryByRole('button', { name: en.goToClass })).toBeNull()
  expect(screen.getByRole('button', { name: en.continueLearning })).toBeTruthy()
})

it('opens a newly ready classroom for the current canonical goal and scope before further questions', async () => {
  const openLesson = vi.fn().mockResolvedValue({ status: 'opened', browser: 'dedicated-chrome', classroomUrl: classroom.url })
  const { ask, fixture } = mount({ ...currentContext, currentQuestion: null, nextAction: { ...currentAction, kind: 'learn', reason: 'new-goal' } }, { lessons: { lessons: [currentClassroom, { ...classroom, id: 'unrelated-job', status: 'generating', blockId: 'another-block' }] }, openLesson })
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  ask.mockClear()
  fixture.replace(updateStudy(updateStudy(undefined, setup, NOW), start, NOW))
  fireEvent.click(await screen.findByRole('button', { name: en.goToClass }))
  await waitFor(() => expect(openLesson).toHaveBeenCalledWith(currentClassroom.id))
  expect(ask).not.toHaveBeenCalled()
})

it('retains protected playback login failures and queues original ownership preparation', async () => {
  const openLesson = vi.fn().mockResolvedValueOnce({ status: 'login-required', browser: 'dedicated-chrome', classroomUrl: classroom.url }).mockResolvedValueOnce({ status: 'ownership-unresolved', reason: 'Frozen questions need saving' })
  const { ask } = mount(currentContext, { lessons: lessonList(currentClassroom), openLesson })
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  ask.mockClear()
  fireEvent.click(screen.getByRole('button', { name: en.goToClass }))
  await screen.findByText(en.classroomLoginRequired)
  fireEvent.click(screen.getByRole('button', { name: en.goToClass }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(String(ask.mock.calls[0]![0])).toContain(classroom.id)
  expect(String(ask.mock.calls[0]![0])).toContain('prepare')
})

it('queues one bounded original-classroom synchronization and retains learner and block identity', async () => {
  const { ask, fixture } = mount({ learnerId: 'learner-one', termId: 'term-one' }, { lessons: lessonList({ ...classroom, blockId: start.id, learnerId: 'learner-one', termId: 'term-one' } as typeof classroom) })
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const message = String(ask.mock.calls[0]![0])
  const intent = JSON.parse(message.split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intent).toMatchObject({ learnerId: 'learner-one', termId: 'term-one', blockId: start.id, selection: { subject: 'math' } })
  expect(message).toContain('独立消费接受后才推进 checkpoint')
  expect(message).toContain('不创建新课堂')
  fireEvent.click(screen.getByRole('button', { name: en.parentEntry }))
  fixture.replace(fixture.read())
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
})

it('shows the shared next-action reason and continues missing evidence before an old ready classroom', async () => {
  const { ask } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction: { kind: 'supplement', reason: 'missing-evidence', subject: 'math', title: 'Explain making ten', requirement: 'Only missing method evidence, at most 1 question' } }, { lessons: lessonList({ ...classroom, blockId: start.id } as typeof classroom) })
  expect(screen.getByText(en.continueMissingEvidence)).toBeTruthy()
  expect(screen.queryByRole('button', { name: en.goToClass })).toBeNull()
  expect(screen.queryByText(en.learningOptions)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(String(ask.mock.calls[0]![0])).toContain('Only missing method evidence, at most 1 question')
})

it('keeps the shared next goal and scope when Continue is used after subject browsing without an active block', async () => {
  const nextAction = { kind: 'learn', reason: 'new-goal', subject: 'math', title: 'Addition', goalId: 'm.add', scope: { id: 'within20', description: 'Addition within20', numberMax: 20, modality: 'written' } }
  const { ask, fixture } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction })
  fixture.replace(updateStudy(undefined, setup, NOW))
  await screen.findByText(nextAction.title)
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intention = JSON.parse(String(ask.mock.calls[0]![0]).split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intention.selection).toEqual({ subject: nextAction.subject, goalId: nextAction.goalId, scope: nextAction.scope })
})

it('continues the projected prerequisite goal and capability scope while preserving the old question owner', async () => {
  const nextAction = { kind: 'learn', reason: 'prerequisite-gap', subject: 'math', title: 'Compose ten', goalId: 'm.compose', scope: currentScope, requirement: 'Use the prerequisite gap in the current round' }
  const { ask } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction })
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intention = JSON.parse(String(ask.mock.calls[0]![0]).split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intention.selection).toEqual({ subject: 'math', goalId: 'm.compose', scope: currentScope })
  expect(intention.nextAction.requirement).toBe(nextAction.requirement)
  expect(intention.blockId).toBe(start.id)
  expect(intention.questionId).toBe('current-question')
})

it('shows only the saved scope and actual independent days in Parent goal progress', () => {
  mount({ goalProgress: [{ id: 'm.add', title: 'Calculate sums', subject: 'math', level: 'practising', scope: { id: 'within20', description: 'Written sums within20', numberMax: 20, modality: 'written' }, independentDays: ['2026-11-19', '2026-11-20'], baseline: true, missingFamilyIds: [], missingCriteria: [], feedback: [] }] })
  fireEvent.click(screen.getByRole('button', { name: en.parentEntry }))
  expect(screen.getByText('Written sums within20')).toBeTruthy()
  expect(screen.getByText(/2026-11-19 · 2026-11-20/)).toBeTruthy()
  expect(screen.getByText(en.referencedEvidence)).toBeTruthy()
  expect(screen.queryByText(en.firstMasteredOn)).toBeNull()
})

it('starts the browsed subject only when the learner explicitly switches using Other ways', async () => {
  const { ask } = mount()
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'Saved before switching' } })
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('Saved before switching')
  fireEvent.click(screen.getByText(en.otherWays))
  fireEvent.click(screen.getByRole('button', { name: en.switchLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intention = JSON.parse(String(ask.mock.calls[0]![0]).split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intention.operation).toMatchObject({ action: 'start', subject: 'chinese' })
  expect(intention.blockId).toBe(start.id)
  expect(intention.questionId).toBe('current-question')
})

it('offers Continue for an unregistered new Session and waits for an independent live read', async () => {
  const state = updateStudy(updateStudy(undefined, setup, NOW), start, NOW)
  const fixture = studentClientFixture(state)
  const ask = vi.fn().mockResolvedValue(undefined)
  let recover: () => void
  function Desk() {
    const [available, setAvailable] = useState(false)
    recover = () => setAvailable(true)
    const useResource: import('../src/client/workspace.ts').UseStudentResource = address => {
      const live = fixture.useResource(address)
      return available ? live : { status: 'failed', value: undefined, failure: { code: 'student/main-session-required', message: 'Open the Student workspace in a registered main Session.', details: {} } }
    }
    return <StudyDesk {...useDraftFixture()} {...createStudentManualActions(fixture.remote)} useResource={useResource} sessionId="new-student" visible running={false} ask={ask} t={t} />
  }
  render(<Desk />)
  expect(screen.queryByText(en.staleData)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const text = String(ask.mock.calls[0]![0])
  const intent = JSON.parse(text.split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intent.operation).toBeUndefined()
  expect(text).toContain('只读 study_status kind=status')
  expect(screen.queryByText(setup.profile.nickname)).toBeNull()
  act(() => recover!())
  await screen.findByText(new RegExp(setup.profile.nickname))
  expect(screen.queryByText(en.staleData)).toBeNull()
})
