import { useDraftFixture } from './draft-fixture.tsx'
import { createStudentManualActions } from '../src/client/manual-actions.ts'
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StudyDesk as RealStudyDesk } from '../src/client/desk.tsx'
import { studentClientFixture } from './student-client-fixture.tsx'
import type { ComponentProps } from 'react'
import { ParentSettings as RealParentSettings } from '../src/client/forms.tsx'
import { LessonsPanel } from '../src/client/lessons-view.tsx'
import { en } from '../src/client/locales.ts'
import { dashboard } from '../src/dashboard.ts'
import { updateStudy } from '../src/learning/update/index.ts'
import { NOW, setup, start } from './fixtures.ts'

const t = (key: keyof typeof en) => en[key]
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); window.sessionStorage.clear() })

let backend: ReturnType<typeof studentClientFixture>
function StudyDesk(props: Omit<ComponentProps<typeof RealStudyDesk>, 'useResource' | keyof import('../src/client/manual-actions.ts').StudentManualActions | keyof import('../src/client/drafts.tsx').DraftProps>) { return <RealStudyDesk {...props} useResource={backend.useResource} {...useDraftFixture()} {...createStudentManualActions(backend.remote)} /> }

const ready = {
  id: 'om-1', status: 'ready' as const, createdAt: '2026-10-28T06:00:00.000Z', updatedAt: '2026-10-28T06:05:00.000Z',
  title: '凑十', requirement: '用凑十讲 8+7', base: 'http://localhost:3000',
  classroomId: 'room-1', url: 'http://localhost:3000/classroom/room-1',
  summary: { fetchedAt: '2026-10-28T07:00:00.000Z', outline: '先凑十再加', scenes: [{ title: '摆一摆', summary: '8 和 2 凑成 10' }] },
}

describe('interactive lesson desk', () => {
  it('opens an http classroom URL, copies it, and asks the tutor to retry or review', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const onRetry = vi.fn()
    const onReview = vi.fn()
    render(<LessonsPanel lessons={[
      ready,
      { ...ready, id: 'om-bad', title: '坏链接', url: 'javascript:alert(1)', classroomId: undefined, summary: undefined },
      { ...ready, id: 'om-fail', status: 'failed', title: '失败的课', url: undefined, classroomId: undefined, summary: undefined, retryable: true, runId: 'run-9', error: '生成中断' },
    ]} disabled={false} running={false} t={t} onGenerate={vi.fn()} onQuery={vi.fn()} onRetry={onRetry} onReview={onReview} />)
    expect(screen.getByText('http://localhost:3000/classroom/room-1')).toBeTruthy()
    expect(screen.queryByText('javascript:alert(1)')).toBeNull()
    expect(screen.getByText('先凑十再加')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: en.openmaicOpen }))
    expect(open).toHaveBeenCalledWith('http://localhost:3000/classroom/room-1', '_blank', 'noopener,noreferrer')
    fireEvent.click(screen.getByRole('button', { name: en.openmaicCopy }))
    expect(writeText).toHaveBeenCalledWith(ready.url)
    fireEvent.click(screen.getByRole('button', { name: en.openmaicRetry }))
    expect(onRetry).toHaveBeenCalledWith('run-9')
    fireEvent.click(screen.getByRole('button', { name: en.openmaicReview }))
    expect(onReview).toHaveBeenCalledWith('room-1')
  })

  it('continues a projected new goal with its component teaching requirement', async () => {
    const ask = vi.fn().mockResolvedValue(undefined)
    const nextAction = { kind: 'learn', reason: 'new-goal', subject: 'math', title: 'Make ten', goalId: 'm.add', requirement: 'Use an interactive number line within20' }
    backend = studentClientFixture(updateStudy(undefined, setup, Date.now()), undefined, { termId: 'term-one', learnerId: 'learner-one', nextAction })
    render(<StudyDesk sessionId="om" visible running={false} ask={ask} t={t} />)
    expect(screen.queryByRole('button', { name: en.openLesson })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
    await waitFor(() => expect(ask).toHaveBeenCalledOnce())
    expect(String(ask.mock.calls[0]?.[0])).toContain(nextAction.requirement)
    expect(String(ask.mock.calls[0]?.[0])).toContain('m.add')
  })

  it('saves an OpenMAIC address from parent setup', async () => {
    const change = vi.fn(async (command: unknown) => dashboard(updateStudy(updateStudy(undefined, setup, NOW), command, NOW + 1), NOW))
    render(<ParentSettings data={dashboard(updateStudy(undefined, setup, NOW), NOW)} change={change} t={t} />)
    const input = screen.getByLabelText(en.openmaicBase)
    fireEvent.change(input, { target: { value: 'http://127.0.0.1:3000/' } })
    const form = input.closest('form')
    if (!form) throw new Error('missing form')
    fireEvent.click(within(form).getByRole('button', { name: 'Save' }))
    await screen.findAllByText('Saved')
    expect(change).toHaveBeenCalledWith({ action: 'openmaic-settings', baseUrl: 'http://127.0.0.1:3000/', parentConfirmation: en.openmaicConfirm }, 1, expect.any(String))
  })

  it('queries the original generating job without creating another classroom', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const state = updateStudy(updateStudy(undefined, setup, NOW), start, NOW)
    const generating = { ...ready, id: 'om-gen', learnerId: 'learner-one', termId: 'term-one', blockId: start.id, status: 'generating' as const, title: '正在生成', runId: 'run-1', pollUrl: '/api/generate-classroom/run-1', url: undefined, classroomId: undefined, summary: undefined }
    backend = studentClientFixture(state, { lessons: [generating] }, { learnerId: 'learner-one', termId: 'term-one', nextAction: { kind: 'teach', reason: 'current-gap', subject: 'math', title: 'Make ten', blockId: start.id } })
    const ask = vi.fn().mockResolvedValue(undefined)
    const pollLesson = vi.fn().mockResolvedValue({ checkedAt: NOW, result: { status: 'generating' } })
    render(<StudyDesk sessionId="ready-lesson" visible running={false} ask={ask} pollLesson={pollLesson} t={t} />)
    expect(screen.getByText(/Generating · 正在生成/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: en.goToClass })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
    expect(open).not.toHaveBeenCalled()
    await waitFor(() => expect(pollLesson).toHaveBeenCalledWith('om-gen', expect.any(AbortSignal)))
    expect(ask).not.toHaveBeenCalled()
  })

  it.each(['planned', 'generating'] as const)('uses the original full lesson for %s without showing an unrelated question', async status => {
    const state = updateStudy(updateStudy(undefined, setup, NOW), start, NOW)
    const lesson = { ...ready, id: 'full-lesson', learnerId: 'learner-one', termId: 'term-one', blockId: start.id, purpose: 'full' as const, status, url: undefined, classroomId: undefined, summary: undefined }
    backend = studentClientFixture(state, { lessons: [lesson] }, { learnerId: 'learner-one', termId: 'term-one', nextAction: { kind: 'learn', reason: 'new-goal', subject: 'math', title: 'Make ten', blockId: start.id } })
    const ask = vi.fn().mockResolvedValue(undefined)
    const pollLesson = vi.fn().mockResolvedValue({ checkedAt: NOW, result: { status: 'generating' } })
    render(<StudyDesk sessionId="full-lesson-test" visible running={status === 'generating'} ask={ask} pollLesson={pollLesson} t={t} />)
    fireEvent.click(screen.getByRole('button', { name: status === 'planned' ? en.courseStart : en.openmaicQuery }))
    if (status === 'planned') {
      await waitFor(() => expect(ask).toHaveBeenCalledOnce())
      expect(String(ask.mock.calls[0]?.[0])).toContain('full-lesson')
      expect(pollLesson).not.toHaveBeenCalled()
    } else {
      await waitFor(() => expect(pollLesson).toHaveBeenCalledWith('full-lesson', expect.any(AbortSignal)))
      expect(ask).not.toHaveBeenCalled()
    }
  })

  it('saves interest tags from parent setup', async () => {
    const change = vi.fn(async (command: unknown) => dashboard(updateStudy(updateStudy(undefined, setup, NOW), command, NOW + 1), NOW))
    render(<ParentSettings data={dashboard(updateStudy(undefined, setup, NOW), NOW)} change={change} t={t} />)
    const input = screen.getByLabelText('Tag 6')
    fireEvent.change(input, { target: { value: '天文观测' } })
    const form = input.closest('form')
    if (!form) throw new Error('missing form')
    fireEvent.click(within(form).getByRole('button', { name: 'Save' }))
    await screen.findAllByText('Saved')
    expect(change).toHaveBeenCalledWith({ action: 'interests', tags: ['购物超市钱', '运动球类', '动物宠物', '故事角色动画', '积木拼搭手工', '天文观测'], parentConfirmation: en.interestConfirm }, 1, expect.any(String))
  })

  it('rechecks a failed lesson before retrying from the workbench', async () => {
    const ask = vi.fn().mockResolvedValue(undefined)
    const state = updateStudy(undefined, setup, Date.now())
    const { interactiveLessons } = dashboard(state, Date.now())
    backend = studentClientFixture(state, { ...interactiveLessons, lessons: [{
      ...ready, id: 'om-paused', status: 'failed', url: undefined, classroomId: undefined,
      summary: undefined, runId: 'run-paused', pollUrl: '/api/generate-classroom/run-paused', retryable: true,
    }] })
    render(<StudyDesk sessionId="retry-lesson" visible running={false} ask={ask} t={t} />)
    fireEvent.click(screen.getByRole('button', { name: en.lessonHistory }))
    fireEvent.click(await screen.findByRole('button', { name: en.openmaicRetry }))
    await waitFor(() => expect(ask).toHaveBeenCalledOnce())
    expect(ask.mock.calls[0]).toMatchSnapshot()
  })

  it('can check an older failed record without a retryable run while the model is busy and blocks stale workspace queries', () => {
    const onQuery = vi.fn()
    const lesson = {
      ...ready, id: 'om-old-timeout', status: 'failed' as const,
      pollUrl: '/api/generate-classroom/old-job', url: undefined, classroomId: undefined, summary: undefined,
    }
    const props = { lessons: [lesson], disabled: false, running: false, t, onQuery, onRetry: vi.fn(), onReview: vi.fn() }
    const view = render(<LessonsPanel {...props} />)
    expect(screen.queryByRole('button', { name: en.openmaicRetry })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.openmaicQuery }))
    expect(onQuery).toHaveBeenCalledWith('om-old-timeout')
    view.rerender(<LessonsPanel {...props} running />)
    fireEvent.click(screen.getByRole('button', { name: en.openmaicQuery }))
    expect(onQuery).toHaveBeenCalledTimes(2)
    view.rerender(<LessonsPanel {...props} disabled />)
    fireEvent.click(screen.getByRole('button', { name: en.openmaicQuery }))
    expect(onQuery).toHaveBeenCalledTimes(2)
    view.rerender(<LessonsPanel {...props} lessons={[ready]} />)
    expect(screen.queryByRole('button', { name: en.openmaicQuery })).toBeNull()
  })
})

function ParentSettings(props: Omit<import('react').ComponentProps<typeof RealParentSettings>, keyof import('../src/client/drafts.tsx').DraftProps>) { return <RealParentSettings {...props} {...useDraftFixture()} /> }


it('reopens a retained mini lesson in an isolated frame without asking the model', async () => {
  const ask = vi.fn(), readMini = vi.fn().mockResolvedValue({ id: 'mini-1', html: '<h2>Make ten</h2>' })
  backend = studentClientFixture(updateStudy(undefined, setup, NOW), { lessons: [], miniLessons: [{ id: 'mini-1', learnerId: 'learner-one', termId: 'term-one', subject: 'math', revision: 'v1', goalIds: ['m.add'], scope: { id: 'within20', description: 'Within20', modality: 'written', numberMax: 20 }, purpose: 'review', contentPath: 'mini.html', contentHash: 'a'.repeat(64), createdAt: NOW }] })
  render(<StudyDesk sessionId="mini" visible running={false} ask={ask} readMini={readMini} t={t} />)
  fireEvent.click(screen.getByRole('button', { name: en.lessonHistory }))
  fireEvent.click(screen.getByRole('button', { name: `${en.courseMiniOpen} · mini-1` }))
  const frame = await screen.findByTitle(en.courseMini)
  expect(frame.getAttribute('sandbox')).toBe('allow-scripts')
  expect(frame.getAttribute('srcdoc')).toContain('Make ten')
  expect(readMini).toHaveBeenCalledExactlyOnceWith('mini-1')
  expect(ask).not.toHaveBeenCalled()
})

it('shows rejected content and offers an explicit revision without opening or silently replacing it', () => {
  const onCourse = vi.fn(), onOpen = vi.fn(), onPrepare = vi.fn()
  const lesson = { ...ready, purpose: 'full' as const, quality: { status: 'rejected' as const, checkedAt: NOW, contentHash: 'a'.repeat(64), stages: { introduction: 's1', explanation: 's1', demonstration: 's1', guidedPractice: 's1', independentPractice: 's1', summary: 's1' }, questions: [], scopeChecked: true as const, criterionChecked: true as const, notes: 'The answer produces an ungrammatical sentence.' } }
  render(<LessonsPanel lessons={[lesson]} disabled={false} running={false} t={t} onCourse={onCourse} onOpen={onOpen} onPrepare={onPrepare} onQuery={vi.fn()} onRetry={vi.fn()} onReview={vi.fn()} />)
  expect(screen.getByRole('alert').textContent).toContain(en.courseRejectedHelp)
  expect(screen.getByText(lesson.quality.notes).closest('details')?.open).toBe(false)
  expect(screen.queryByRole('button', { name: en.openmaicOpen })).toBeNull()
  expect(screen.queryByRole('button', { name: en.courseCheck })).toBeNull()
  expect(onCourse).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: en.courseRevise }))
  expect(onCourse).toHaveBeenCalledWith('revise', undefined, lesson.id)
  expect(onOpen).not.toHaveBeenCalled()
})
