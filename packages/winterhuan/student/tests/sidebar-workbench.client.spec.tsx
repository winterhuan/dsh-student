// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { en } from '../src/client/locales.ts'
import { StudyDesk } from '../src/client/desk.tsx'
import { useDraftFixture } from './draft-fixture.tsx'
import type { StudentQueryResult } from '../src/types.ts'
import { dashboard } from '../src/dashboard.ts'
import { updateStudy, setup, start, NOW } from './fixtures.ts'

afterEach(() => { cleanup(); window.localStorage.clear(); window.sessionStorage.clear() })
const id = (value: string) => value as SessionId

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
  expect((screen.getByRole('button', { name: en.continueLearning }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: en.parentPractice, exact: false }))
  expect(screen.getByRole('button', { name: en.addMistake }).matches(':disabled')).toBe(true)
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
  fireEvent.click(screen.getByRole('button', { name: en.parentProgress }))
  fireEvent.click(screen.getByRole('button', { name: en.math }))
  current = undefined
  rendered.rerender(<Desk />)
  current = { ...value, data: JSON.parse(JSON.stringify(dashboard(state, NOW, { subject: 'math' }))) }
  rendered.rerender(<Desk />)
  expect(screen.getByRole('button', { name: en.math }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('button', { name: en.english }).getAttribute('aria-pressed')).toBe('false')
})
