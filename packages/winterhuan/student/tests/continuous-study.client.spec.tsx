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

function mount(context?: import('../src/types.ts').StudentJsonValue, options: { lessons?: import('../src/dashboard.ts').Dashboard['interactiveLessons']; openLesson?: import('react').ComponentProps<typeof StudyDesk>['openLesson']; syncFeedback?: import('react').ComponentProps<typeof StudyDesk>['syncFeedback']; cancel?: () => Promise<void>; running?: boolean; pending?: boolean } = {}) {
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: { id: 'current-question', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '8 + 7?' } }, NOW)
  const fixture = studentClientFixture(state, options.lessons, context ?? { termId: 'term-one', learnerId: 'learner-one', nextAction: { kind: 'answer', reason: 'unfinished-question', subject: 'math', title: 'Addition', blockId: start.id, questionId: 'current-question' } })
  const ask = vi.fn().mockResolvedValue(undefined)
  const syncFeedback = options.syncFeedback ?? vi.fn().mockResolvedValue({ status: 'queued', lessonId: 'original-class' })
  function Desk() { return <StudyDesk {...useDraftFixture()} {...createStudentManualActions(fixture.remote)} useResource={fixture.useResource} sessionId="two-entries" visible running={options.running ?? false} pending={options.pending} cancel={options.cancel} ask={ask} t={t} openLesson={options.openLesson} syncFeedback={syncFeedback} /> }
  const view = render(<Desk />)
  return { ask, fixture, syncFeedback, rerender: () => view.rerender(<Desk />) }
}

it('opens each functional destination directly and preserves the original answer draft', async () => {
  const { ask } = mount()
  const main = screen.getByRole('navigation', { name: en.title })
  expect(within(main).getAllByRole('button').map(button => button.textContent)).toEqual([en.learningEntry, en.parentProgress, en.parentPractice, en.lessonHistory, en.parentProfile])
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '15 with ten first' } })
  for (const name of [en.parentProgress, en.parentPractice, en.lessonHistory, en.parentProfile]) {
    fireEvent.click(within(main).getByRole('button', { name }))
    expect(within(main).getAllByRole('button', { pressed: true })).toHaveLength(1)
    expect(within(main).getByRole('button', { name, pressed: true })).toBeTruthy()
    fireEvent.click(within(main).getByRole('button', { name: en.learningEntry }))
    expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('15 with ten first')
  }
  expect(ask).not.toHaveBeenCalled()
  expect(screen.queryByText(en.openmaicTitle)).toBeNull()
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
  expect(screen.getByRole('button', { name: en.submit }).closest('fieldset')!.disabled).toBe(true)
  contextVersion = 'v2'
  view.rerender(<Desk />)
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('Keep this thought')
  expect(screen.getByRole('button', { name: en.submit }).closest('fieldset')!.disabled).toBe(false)
})

it('continues the original block after browsing another subject without starting a new block', async () => {
  const { ask } = mount()
  fireEvent.click(screen.getByRole('button', { name: en.parentProfile }))
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  fireEvent.click(screen.getByRole('button', { name: en.learningEntry }))
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '15' } })
  fireEvent.click(screen.getByRole('button', { name: en.submit }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const message = String(ask.mock.calls[0]![0])
  const intention = JSON.parse(message.split('Student panel v2\n')[1]!.split('\n')[0]!)
  expect(intention.blockId).toBe(start.id)
  expect(intention.questionId).toBe('current-question')
  expect(intention.selection.subject).toBe('math')
  expect(intention.operation).toMatchObject({ action: 'answer', response: '15' })
  expect(message).toContain('nextAction')
  expect(message).not.toContain('curl')
})

it('preserves learner identity and the shared next action when the child submits a native answer', async () => {
  const { ask } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction: { kind: 'answer', reason: 'unfinished-question', subject: 'math', title: 'Make ten', goalId: 'goal-one', blockId: start.id, questionId: 'current-question' } })
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '15' } })
  fireEvent.click(screen.getByRole('button', { name: en.submit }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const text = String(ask.mock.calls[0]![0])
  const intent = JSON.parse(text.split('Student panel v2\n')[1]!.split('\n')[0]!)
  expect(intent).toMatchObject({ learnerId: 'learner-one', termId: 'term-one', blockId: start.id, questionId: 'current-question', operation: { action: 'answer', response: '15' } })
  expect(text).not.toContain('observedVersions')
  expect(text).not.toContain('curl')
})

it('shows original answers, original grade history and effective grades in Learning profile', () => {
  mount({ learnerId: 'learner-one', termId: 'term-one', officialFeedback: [{ responseId: 'official-one', prompt: '8 + 7?', rawResponse: '"15"', result: 'correct', sourceStatus: 'known', grading: 'equivalent', feedback: 'Two equivalent options', assistance: 'unknown', answerDate: { kind: 'unknown' }, official: { seq: 5, result: { status: 'correct', earned: 10, aiComment: 'Correct after review' } }, officialHistory: [{ seq: 4, result: { status: 'incorrect', earned: 0, aiComment: 'Original mark' } }] }] })
  fireEvent.click(screen.getByRole('button', { name: en.parentProfile }))
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
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: '15' } })
  fireEvent.click(screen.getByRole('button', { name: en.submit }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(openLesson).not.toHaveBeenCalled()
  expect(String(ask.mock.calls[0]![0])).toContain('current-question')
})

it('opens the chosen saved classroom through protected playback rather than a direct URL', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null)
  const openLesson = vi.fn().mockResolvedValue({ status: 'opened', browser: 'dedicated-chrome', classroomUrl: classroom.url })
  const { ask } = mount(currentContext, { lessons: lessonList(currentClassroom), openLesson })
  await waitFor(() => expect(screen.getByRole('button', { name: en.goToClass })).toBeTruthy())
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
  expect(screen.getByRole('button', { name: en.submit })).toBeTruthy()
})

it('opens a newly ready classroom for the current canonical goal and scope before further questions', async () => {
  const openLesson = vi.fn().mockResolvedValue({ status: 'opened', browser: 'dedicated-chrome', classroomUrl: classroom.url })
  const { ask, fixture } = mount({ ...currentContext, currentQuestion: null, nextAction: { ...currentAction, kind: 'learn', reason: 'new-goal' } }, { lessons: { lessons: [currentClassroom, { ...classroom, id: 'unrelated-job', status: 'generating', blockId: 'another-block' }] }, openLesson })
  fixture.replace(updateStudy(updateStudy(undefined, setup, NOW), start, NOW))
  fireEvent.click(await screen.findByRole('button', { name: en.goToClass }))
  await waitFor(() => expect(openLesson).toHaveBeenCalledWith(currentClassroom.id))
  expect(ask).not.toHaveBeenCalled()
})

it('retains protected playback login failures and queues original ownership preparation', async () => {
  const openLesson = vi.fn().mockResolvedValueOnce({ status: 'login-required', browser: 'dedicated-chrome', classroomUrl: classroom.url }).mockResolvedValueOnce({ status: 'ownership-unresolved', reason: 'Frozen questions need saving' })
  const { ask } = mount(currentContext, { lessons: lessonList(currentClassroom), openLesson })
  await waitFor(() => expect(screen.getByRole('button', { name: en.goToClass })).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: en.goToClass }))
  await screen.findByText(en.classroomLoginRequired)
  fireEvent.click(screen.getByRole('button', { name: en.goToClass }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(String(ask.mock.calls[0]![0])).toContain(classroom.id)
  expect(String(ask.mock.calls[0]![0])).toContain('prepare')
})

it('keeps browsing a saved classroom free of model calls and preserves answer focus', async () => {
  const { ask, fixture, syncFeedback } = mount({ learnerId: 'learner-one', termId: 'term-one' }, { lessons: lessonList({ ...classroom, blockId: start.id, learnerId: 'learner-one', termId: 'term-one' } as typeof classroom) })
  const answer = screen.getByLabelText(en.answer)
  answer.focus()
  fireEvent.change(answer, { target: { value: 'Keep this draft' } })
  expect(syncFeedback).not.toHaveBeenCalled()
  expect(ask).not.toHaveBeenCalled()
  expect(document.activeElement).toBe(answer)
  expect((answer as HTMLInputElement).value).toBe('Keep this draft')
  fireEvent.click(screen.getByRole('button', { name: en.parentProfile }))
  fixture.replace(fixture.read())
  expect(syncFeedback).not.toHaveBeenCalled()
  expect(ask).not.toHaveBeenCalled()
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

it('uses the shared next goal and scope after returning from subject browsing without an active block', async () => {
  const nextAction = { kind: 'learn', reason: 'new-goal', subject: 'math', title: 'Addition', goalId: 'm.add', scope: { id: 'within20', description: 'Addition within20', numberMax: 20, modality: 'written' } }
  const { ask, fixture } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction })
  fixture.replace(updateStudy(undefined, setup, NOW))
  await screen.findByText(nextAction.title)
  fireEvent.click(screen.getByRole('button', { name: en.chinese }))
  fireEvent.click(screen.getByRole('button', { name: en.math }))
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intention = JSON.parse(String(ask.mock.calls[0]![0]).split('Student panel v2\n')[1]!.split('\n')[0]!)
  expect(intention.selection).toEqual({ subject: nextAction.subject, goalId: nextAction.goalId, scope: nextAction.scope })
})

it('keeps a missing next action from restarting the legacy dashboard recommendation', async () => {
  const { ask, fixture } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction: null })
  fixture.replace(updateStudy(undefined, setup, NOW))
  await waitFor(() => expect(screen.queryByLabelText(en.answer)).toBeNull())
  expect(screen.queryByRole('button', { name: en.startNow })).toBeNull()
  expect(screen.queryByRole('button', { name: en.openLesson })).toBeNull()
  expect(screen.queryByRole('button', { name: en.interestPractice })).toBeNull()
  const continueButton = screen.getByRole('button', { name: en.continueLearning }) as HTMLButtonElement
  expect(continueButton.disabled).toBe(true)
  fireEvent.click(continueButton)
  expect(ask).not.toHaveBeenCalled()
})

it('continues the projected prerequisite goal and capability scope while preserving the old question owner', async () => {
  const nextAction = { kind: 'learn', reason: 'prerequisite-gap', subject: 'math', title: 'Compose ten', goalId: 'm.compose', scope: currentScope, requirement: 'Use the prerequisite gap in the current round' }
  const { ask } = mount({ learnerId: 'learner-one', termId: 'term-one', nextAction })
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intention = JSON.parse(String(ask.mock.calls[0]![0]).split('Student panel v2\n')[1]!.split('\n')[0]!)
  expect(intention.selection).toEqual({ subject: 'math', goalId: 'm.compose', scope: currentScope })
  expect(intention.nextAction.requirement).toBe(nextAction.requirement)
  expect(intention.blockId).toBeUndefined()
  expect(intention.questionId).toBeUndefined()
  expect(intention.previousActivity).toMatchObject({ blockId: start.id, questionId: 'current-question' })
})

it('shows only the saved scope and actual independent days in Learning profile goal progress', () => {
  mount({ goalProgress: [{ id: 'm.add', title: 'Calculate sums', subject: 'math', level: 'practising', scope: { id: 'within20', description: 'Written sums within20', numberMax: 20, modality: 'written' }, independentDays: ['2026-11-19', '2026-11-20'], baseline: true, missingFamilyIds: [], missingCriteria: [], feedback: [] }] })
  fireEvent.click(screen.getByRole('button', { name: en.parentProfile }))
  expect(screen.getByText('Written sums within20')).toBeTruthy()
  expect(screen.getByText(/2026-11-19 · 2026-11-20/)).toBeTruthy()
  expect(screen.getByText(en.referencedEvidence)).toBeTruthy()
  expect(screen.queryByText(en.firstMasteredOn)).toBeNull()
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
  const intent = JSON.parse(text.split('Student panel v2\n')[1]!.split('\n')[0]!)
  expect(intent.operation).toBeUndefined()
  expect(text).toContain('只读 study_status kind=status')
  expect(screen.queryByText(setup.profile.nickname)).toBeNull()
  act(() => recover!())
  await screen.findByText(new RegExp(setup.profile.nickname))
  expect(screen.queryByText(en.staleData)).toBeNull()
})

const pausedRound = { id: 'round-one', blockId: start.id, kind: 'check', status: 'paused', limit: 3, remaining: 1, startedAt: NOW, members: [{ goalId: 'm.add', familyId: 'math.add-column', scope: currentScope }], enteredFamilyIds: ['math.add-column'], presentedQuestionIds: ['earlier-one', 'current-question'] }

it('resumes the original projected round without displaying internal allowances', async () => {
  const { ask, syncFeedback } = mount({ ...currentContext, round: pausedRound, legalActions: ['resume-round', 'switch-block', 'rest'], nextAction: { ...currentAction, kind: 'hold', reason: 'round-paused', roundId: pausedRound.id } }, { lessons: lessonList(currentClassroom) })
  expect(syncFeedback).not.toHaveBeenCalled()
  expect(screen.queryByText(en.roundCheckRemaining.replace('{count}', '1'))).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.resumeRound }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intent = JSON.parse(String(ask.mock.calls[0]![0]).split('Student panel v2\n')[1]!.split('\n')[0]!)
  expect(intent).toMatchObject({ blockId: start.id, continuationAction: 'resume-round' })
  expect(syncFeedback).not.toHaveBeenCalled()
})

it('offers teaching at the check limit without allowing Continue to create another check', async () => {
  const { ask } = mount({ ...currentContext, round: { ...pausedRound, status: 'ended', remaining: 0, endReason: 'budget-exhausted' }, legalActions: ['request-teaching', 'switch-block', 'rest'], nextAction: { ...currentAction, kind: 'hold', reason: 'check-budget-exhausted', roundId: pausedRound.id } })
  expect(screen.queryByRole('button', { name: en.continueLearning })).toBeNull()
  expect(screen.queryByRole('button', { name: en.moreReview })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.requestTeaching }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(String(ask.mock.calls[0]![0])).toContain('request-teaching')
})

it('keeps source waiting and the answer draft visible while a deliberate retry only queues system feedback', async () => {
  const syncFeedback = vi.fn().mockResolvedValue({ status: 'coalesced', lessonId: classroom.id })
  const { ask } = mount({ ...currentContext, legalActions: ['sync-feedback', 'switch-block', 'rest'], nextAction: { ...currentAction, kind: 'hold', reason: 'source-pending', source: { kind: 'openmaic', verification: { lessonId: classroom.id, status: 'available', omitted: 0, consumption: 'pending' } } } }, { lessons: lessonList(currentClassroom), syncFeedback })
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'Keep source pending draft' } })
  fireEvent.click(screen.getByRole('button', { name: en.retryFeedbackSync }))
  await waitFor(() => expect(syncFeedback).toHaveBeenCalledWith(classroom.id, 'continue'))
  expect(ask).not.toHaveBeenCalled()
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('Keep source pending draft')
  expect(screen.getByText(en.feedbackSyncCoalesced)).toBeTruthy()
})

it('withdraws pending feedback before native cancellation and never restarts it on idle or focus', async () => {
  const order: string[] = []
  const syncFeedback = vi.fn(async (_lesson, trigger) => { order.push(trigger); return { status: trigger === 'pause' ? 'paused' as const : 'queued' as const, lessonId: classroom.id } })
  const options = { lessons: lessonList(currentClassroom), running: true, syncFeedback, cancel: vi.fn(async () => { order.push('cancel') }) }
  const { ask, rerender } = mount(currentContext, options)
  expect(syncFeedback).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: en.finishToday }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(order).toEqual(['pause', 'cancel'])
  options.running = false; rerender(); fireEvent.focus(window)
  expect(syncFeedback).toHaveBeenCalledOnce()
})

it('does not invoke the model on window focus or visibility changes', async () => {
  const { syncFeedback, ask } = mount(currentContext, { lessons: lessonList(currentClassroom), running: true, pending: true })
  expect(syncFeedback).not.toHaveBeenCalled()
  fireEvent.focus(window)
  expect(syncFeedback).not.toHaveBeenCalled()
  fireEvent.focus(window)
  fireEvent(document, new Event('visibilitychange'))
  expect(syncFeedback).not.toHaveBeenCalled()
  expect(ask).not.toHaveBeenCalled()
})


it('keeps Continue disabled while the native session still has an accepted submission', () => {
  const { ask } = mount(currentContext, { pending: true })
  const button = screen.getByRole('button', { name: en.submit }) as HTMLButtonElement
  expect(button.matches(':disabled')).toBe(true)
  fireEvent.click(button)
  expect(ask).not.toHaveBeenCalled()
})


it('can pause while a user input is pending and leaves cancellation to the native session', async () => {
  const cancel = vi.fn().mockResolvedValue(undefined)
  const { ask, syncFeedback } = mount(currentContext, { lessons: lessonList(currentClassroom), pending: true, cancel })
  fireEvent.click(screen.getByRole('button', { name: en.finishToday }))
  await waitFor(() => expect(cancel).toHaveBeenCalledOnce())
  expect(syncFeedback).toHaveBeenCalledWith(classroom.id, 'pause')
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
})

it.each([
  ['login-required', en.feedbackAuthorizationRequired],
  ['operation-timeout', en.feedbackReadInterrupted],
  ['read-limit', en.feedbackReadIncomplete],
])('shows a precise recovery notice for %s while retaining the question', (failure, notice) => {
  mount({ ...currentContext, legalActions: ['sync-feedback', 'switch-block', 'rest'], nextAction: { ...currentAction, kind: 'hold', reason: 'source-unavailable', source: { kind: 'openmaic', verification: { lessonId: classroom.id, status: 'unavailable', omitted: 0, failure } } } })
  expect(screen.getByText(notice)).toBeTruthy()
  expect(screen.getByText('8 + 7?')).toBeTruthy()
  expect(screen.getByRole('button', { name: en.submit }).matches(':disabled')).toBe(true)
  expect(screen.getByRole('button', { name: en.finishToday }).matches(':disabled')).toBe(false)
})

it.each(['learning-context', 'dashboard'])('blocks advancement for a partial %s while retaining the same draft and visible question', query => {
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: { id: 'current-question', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '8 + 7?' } }, NOW)
  const fixture = studentClientFixture(state, undefined, currentContext)
  let partial = false
  const useResource: import('../src/client/workspace.ts').UseStudentResource = address => {
    const result = fixture.useResource(address)
    return partial && address.includes(query) ? { ...result, value: { ...result.value, status: 'partial', data: null } } : result
  }
  function Desk() { return <StudyDesk {...useDraftFixture()} {...createStudentManualActions(fixture.remote)} useResource={useResource} sessionId="partial" visible running={false} ask={vi.fn()} t={t} /> }
  const view = render(<Desk />)
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'Keep me through partial read' } })
  partial = true; view.rerender(<Desk />)
  expect(screen.getByText(query === 'learning-context' ? en.partialLearningRecords : en.continueWaiting)).toBeTruthy()
  expect(screen.getByText('8 + 7?')).toBeTruthy()
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('Keep me through partial read')
  expect(screen.getByRole('button', { name: en.submit }).matches(':disabled')).toBe(true)
})


it('keeps the last coherent question and draft while a newer dashboard arrives before its context', () => {
  const state = updateStudy(updateStudy(updateStudy(undefined, setup, NOW), start, NOW), { action: 'task', task: { id: 'current-question', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '8 + 7?' } }, NOW)
  const nextState = updateStudy(state, { action: 'task', task: { id: 'new-question', sessionId: start.id, subject: 'math', topic: 'Addition', prompt: '9 + 9?' } }, NOW + 1)
  const original = studentClientFixture(state, undefined, currentContext)
  const newer = studentClientFixture(nextState, undefined, { ...currentContext, nextAction: { ...currentAction, questionId: 'new-question' } })
  let changed = false
  const useResource: import('../src/client/workspace.ts').UseStudentResource = address => {
    const before = original.useResource(address), after = newer.useResource(address)
    const isContext = address.includes('learning-context')
    const value = changed && !isContext ? after : before
    return { ...value, value: { ...value.value, versions: [{ path: '.study/blocks/current.json', targetKey: 'current', version: changed && !isContext ? 'v2' : 'v1' }] } }
  }
  function Desk() { return <StudyDesk {...useDraftFixture()} {...createStudentManualActions(original.remote)} useResource={useResource} sessionId="pending-version" visible running={false} ask={vi.fn()} t={t} /> }
  const view = render(<Desk />)
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'My first thought' } })
  changed = true; view.rerender(<Desk />)
  expect(screen.getByText('8 + 7?')).toBeTruthy()
  expect(screen.queryByText('9 + 9?')).toBeNull()
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('My first thought')
  expect(screen.getByRole('button', { name: en.submit }).matches(':disabled')).toBe(true)
})
