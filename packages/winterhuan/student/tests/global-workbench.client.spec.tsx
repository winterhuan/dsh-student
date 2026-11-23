// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { useSyncExternalStore, type ComponentProps } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { SessionListState, SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceSnapshot } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'
import { Workbench, createWorkbenchStore } from '../src/client/workbench.tsx'
import { en } from '../src/client/locales.ts'
import { StudyDesk } from '../src/client/desk.tsx'
import { useDraftFixture } from './draft-fixture.tsx'
import type { StudentQueryResult } from '../src/types.ts'
import { dashboard } from '../src/dashboard.ts'
import { updateStudy, setup, start, NOW } from './fixtures.ts'

function openParent() {
  if (!screen.queryByRole('navigation', { name: en.parentEntry })) fireEvent.click(screen.getByRole('button', { name: en.parentEntry }))
}

afterEach(() => { cleanup(); window.localStorage.clear() })
const id = (value: string) => value as SessionId
const workspaceId = (value: string) => value as WorkspaceId

function fixture() {
  const store = createWorkbenchStore().create()
  const catalog: SessionListState = { ids: [], byId: {}, phase: 'ready', projectionsBySession: {} }
  function add(value: string, preset = 'student', parentId?: SessionId) {
    const sessionId = id(value)
    catalog.ids.push(sessionId)
    catalog.byId[sessionId] = { id: sessionId, displayTitle: value, cwd: '/learner', running: false, retainedBy: {}, blank: false, updatedAt: 0, projectionValues: { agentPreset: preset }, ...(parentId ? { parentId } : {}) }
  }
  for (const value of ['first', 'second', 'archived']) add(value)
  add('standard', 'standard'); add('child', 'student', id('first'))
  const workspaces: WorkspaceSnapshot = {
    items: [{ workspaceId: workspaceId('learner'), path: '/learner', title: 'Learner', sessionIds: [...catalog.ids], createdAt: '', updatedAt: '' }, { workspaceId: workspaceId('other'), path: '/other', title: 'Other learner', sessionIds: [], createdAt: '', updatedAt: '' }],
    archivedSessionIds: [id('archived')], pinnedSessionIds: [], state: 'idle', phase: 'ready', error: null,
  }
  const references: Array<{ sessionId: SessionId; release: ReturnType<typeof vi.fn>; settle: () => void }> = []
  const retainSession = vi.fn((sessionId: SessionId) => {
    let settle!: () => void
    const ready = new Promise<SessionReference['binding']>(resolve => { settle = () => resolve({} as SessionReference['binding']) })
    const reference = { sessionId, ready, release: vi.fn(), settle }
    references.push(reference)
    return reference as SessionReference
  })
  const createSession = vi.fn(async () => id('new'))
  const openSession = vi.fn()
  const reportCreate = vi.fn()
  const renderSlot = vi.fn((_name: string, _owner: { chatVisible: boolean; pane: 'study' | 'chat'; showTutor: () => void; selectPane: (pane: 'study' | 'chat') => void }) => <p>Learning and native chat</p>)
  const props = {
    useSessions: (selector: (state: SessionListState) => unknown) => selector(catalog),
    useWorkspaces: (selector: (state: WorkspaceSnapshot) => unknown) => selector(workspaces),
    useStore: (selector: (state: ReturnType<typeof store.store.getSnapshot>) => unknown) => selector(useSyncExternalStore(store.store.subscribe, store.store.getSnapshot)),
    actions: store.actions, retainSession, createSession, openSession, reportCreate, renderSlot,
    SessionProvider: ({ session, children }: { session: SessionReference; children: React.ReactNode }) => <div data-testid="session-area" data-session={session.sessionId}>{children}</div>,
    t: (key: keyof typeof en) => en[key],
  } as ComponentProps<typeof Workbench>
  return { store, catalog, workspaces, references, props, retainSession, createSession, openSession, reportCreate, renderSlot }
}

it('filters unrelated and archived conversations and releases the selected reference on switch and close', async () => {
  const f = fixture()
  const view = render(<Workbench {...f.props} />)
  fireEvent.click(screen.getByText('Learning conversation · first'))
  expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Learner', 'Other learner', 'first', 'second'])
  await act(async () => f.references[0]!.settle())
  expect(screen.getByTestId('session-area').getAttribute('data-session')).toBe('first')
  fireEvent.click(screen.getByRole('button', { name: en.openConversation }))
  expect(f.openSession).toHaveBeenCalledWith('first')
  fireEvent.change(screen.getByLabelText(en.learningConversation), { target: { value: 'second' } })
  expect(f.references[0]!.release).toHaveBeenCalledOnce()
  expect(screen.queryByTestId('session-area')).toBeNull()
  await act(async () => f.references[1]!.settle())
  expect(screen.getByTestId('session-area').getAttribute('data-session')).toBe('second')
  fireEvent.click(screen.getByRole('button', { name: en.hideTutor }))
  expect(f.renderSlot).toHaveBeenLastCalledWith('student.workbench.session', expect.objectContaining({ chatVisible: false, pane: 'study' }))
  view.unmount()
  expect(f.references[1]!.release).toHaveBeenCalledOnce()
})

it('ignores the open result of a conversation that was replaced while pending', async () => {
  const f = fixture()
  render(<Workbench {...f.props} />)
  fireEvent.click(screen.getByText('Learning conversation · first'))
  fireEvent.change(screen.getByLabelText(en.learningConversation), { target: { value: 'second' } })
  await act(async () => f.references[0]!.settle())
  expect(screen.queryByTestId('session-area')).toBeNull()
  await act(async () => f.references[1]!.settle())
  expect(screen.getByTestId('session-area').getAttribute('data-session')).toBe('second')
})

it('opens native tutoring from a quick action and switches panes without replacing the selected conversation', async () => {
  const f = fixture()
  render(<Workbench {...f.props} />)
  await act(async () => f.references[0]!.settle())
  fireEvent.click(screen.getByRole('button', { name: en.hideTutor }))
  const owner = f.renderSlot.mock.calls.at(-1)![1]
  await act(async () => owner.showTutor())
  expect(f.renderSlot).toHaveBeenLastCalledWith('student.workbench.session', expect.objectContaining({ chatVisible: true, pane: 'chat' }))
  await act(async () => owner.selectPane('study'))
  expect(f.renderSlot).toHaveBeenLastCalledWith('student.workbench.session', expect.objectContaining({ chatVisible: true, pane: 'study' }))
  expect(f.retainSession).toHaveBeenCalledOnce()
  expect(f.references[0]!.release).not.toHaveBeenCalled()
})

it('creates a Student conversation in the explicitly selected workspace and keeps failures retryable', async () => {
  const f = fixture()
  render(<Workbench {...f.props} />)
  fireEvent.change(screen.getByLabelText(en.learnerWorkspace), { target: { value: 'other' } })
  f.createSession.mockRejectedValueOnce(new Error('unavailable'))
  fireEvent.click(screen.getByRole('button', { name: en.newLearningConversation }))
  await waitFor(() => expect(f.reportCreate).toHaveBeenLastCalledWith(false))
  expect(f.createSession).toHaveBeenCalledWith('other')
  expect(f.store.store.getSnapshot().sessionId).toBe('')
  fireEvent.click(screen.getByRole('button', { name: en.newLearningConversation }))
  await waitFor(() => expect(f.store.store.getSnapshot().sessionId).toBe('new'))
  expect(f.reportCreate).toHaveBeenLastCalledWith(true)
})

it('shows the first-use workspace instruction without creating a default conversation', () => {
  const f = fixture()
  const props = { ...f.props, useWorkspaces: (selector: (state: WorkspaceSnapshot) => unknown) => selector({ ...f.workspaces, items: [] }) } as ComponentProps<typeof Workbench>
  render(<Workbench {...props} />)
  expect(screen.getByText(en.noLearnerWorkspace)).toBeTruthy()
  expect((screen.getByRole('button', { name: en.newLearningConversation }) as HTMLButtonElement).disabled).toBe(true)
  expect(f.createSession).not.toHaveBeenCalled()
})

it('keeps macOS titlebar clearance scoped to the workbench header', async () => {
  const css = await readFile(resolve(import.meta.dirname, '../src/client/workbench.module.css'), 'utf8')
  expect(css).toContain(":global([data-platform='darwin']) .header { padding-top: calc(28px + var(--dsh-frame-top-clearance, 0px)); }")
})

it.each(['legacy', 'archived', 'partial'] as const)('shows record guidance instead of an endless spinner for %s records', status => {
  const value: StudentQueryResult = { status, token: 'read', readAt: 100, refreshAfter: 1000, versions: [], data: null, native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] }
  const ask = vi.fn()
  function Desk() { return <StudyDesk {...useDraftFixture()} sessionId={id('first')} visible running={false} t={key => en[key]} ask={ask} useResource={() => ({ status: 'live', value, failure: undefined })} saveSettings={vi.fn()} saveWorksheet={vi.fn()} inspectSubmission={vi.fn()} /> }
  render(<Desk />)
  expect(screen.getByText(en[status === 'legacy' ? 'legacyFilesHelp' : 'unavailableFilesHelp'])).toBeTruthy()
  expect(screen.queryByRole('progressbar')).toBeNull()
  expect(ask).not.toHaveBeenCalled()
})

it('offers native-chat setup for a workspace without learning records', async () => {
  const value: StudentQueryResult = { status: 'missing', token: 'read', readAt: 100, refreshAfter: 1000, versions: [], data: null, native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] }
  const ask = vi.fn().mockResolvedValue(undefined)
  function Desk() { return <StudyDesk {...useDraftFixture()} sessionId={id('first')} visible running={false} t={key => en[key]} ask={ask} useResource={() => ({ status: 'live', value, failure: undefined })} saveSettings={vi.fn()} saveWorksheet={vi.fn()} inspectSubmission={vi.fn()} /> }
  render(<Desk />)
  expect(screen.queryByRole('progressbar')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.setupConversation }))
  await waitFor(() => expect(ask).toHaveBeenCalledWith(expect.stringContaining(en.setupIntent), undefined))
})

it('displays a legacy learning profile with browsing controls and guards saves until migration', () => {
  const value: StudentQueryResult = { status: 'legacy', token: 'read', readAt: NOW, refreshAfter: NOW + 3000, versions: [], data: JSON.parse(JSON.stringify(dashboard(updateStudy(undefined, setup, NOW), NOW))), native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] }
  const ask = vi.fn()
  function Desk() { return <StudyDesk {...useDraftFixture()} sessionId={id('first')} visible running={false} t={key => en[key]} ask={ask} useResource={() => ({ status: 'live', value, failure: undefined })} saveSettings={vi.fn()} saveWorksheet={vi.fn()} inspectSubmission={vi.fn()} /> }
  render(<Desk />)
  expect(screen.getByText(en.legacyFilesHelp)).toBeTruthy()
  expect(screen.getByText(setup.profile.nickname, { exact: false })).toBeTruthy()
  expect((screen.getByRole('button', { name: en.startNow }) as HTMLButtonElement).disabled).toBe(true)
  openParent()
  fireEvent.click(screen.getByRole('button', { name: en.parentPractice, exact: false }))
  expect(screen.getByRole('button', { name: en.addMistake }).matches(':disabled')).toBe(true)
  openParent()
  fireEvent.click(screen.getByRole('button', { name: en.parentProfile }))
  expect((screen.getByRole('button', { name: en.profileConversation }) as HTMLButtonElement).disabled).toBe(true)
  expect(ask).not.toHaveBeenCalled()
})

it('keeps the browsed subject when an unchanged active legacy block reloads', () => {
  const state = updateStudy(updateStudy(undefined, setup, NOW), { ...start, subject: 'english' }, NOW)
  const value: StudentQueryResult = { status: 'legacy', token: 'read', readAt: NOW, refreshAfter: NOW + 3000, versions: [], data: JSON.parse(JSON.stringify(dashboard(state, NOW, { subject: 'english' }))), native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] }
  let current: StudentQueryResult | undefined = value
  function Desk() { return <StudyDesk {...useDraftFixture()} sessionId={id('first')} visible running={false} t={key => en[key]} ask={vi.fn()} useResource={() => ({ status: 'live', value: current, failure: undefined })} saveSettings={vi.fn()} saveWorksheet={vi.fn()} inspectSubmission={vi.fn()} /> }
  const rendered = render(<Desk />)
  openParent()
  fireEvent.click(screen.getByRole('button', { name: en.parentProgress }))
  fireEvent.click(screen.getByRole('button', { name: en.math }))
  current = undefined
  rendered.rerender(<Desk />)
  current = { ...value, data: JSON.parse(JSON.stringify(dashboard(state, NOW, { subject: 'math' }))) }
  rendered.rerender(<Desk />)
  expect(screen.getByRole('button', { name: en.math }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('button', { name: en.english }).getAttribute('aria-pressed')).toBe('false')
})
