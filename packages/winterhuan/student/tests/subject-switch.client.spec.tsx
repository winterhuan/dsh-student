// @vitest-environment jsdom
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, onTestFinished, vi } from 'vitest'
import { StudyDesk } from '../src/client/desk.tsx'
import { en } from '../src/client/locales.ts'
import { createStudentManualActions } from '../src/client/manual-actions.ts'
import { useDraftFixture } from './draft-fixture.tsx'
import { readWorkspace } from '../src/files/read.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { queryWorkspace, queryWorkspaceDashboard } from '../src/learning/queries.ts'
import type { StudentQueryRequest, StudentQueryResult } from '../src/types.ts'
import { setup, NOW } from './fixtures.ts'

afterEach(() => { cleanup(); window.localStorage.clear(); window.sessionStorage.clear() })

it('switches an unfinished English question to the selected subject and restores its original draft', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-subject-switch-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  const settings = { format: 2, kind: 'term-settings', learnerId: 'child-1', termId: 'term-one', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [], learningScopes: [{ subject: 'math', goalIds: ['m.count'], scope: { id: 'within20', description: 'Within twenty', modality: 'written', numberMax: 20 }, parentConfirmation: 'Confirmed math range' }] }
  const block = { format: 2, kind: 'block', learnerId: 'child-1', termId: 'term-one', id: 'english-block', subject: 'english', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, currentQuestionId: 'english-question', questions: [{ id: 'english-question', objectiveId: 'e2a-o4', source: { kind: 'authored', description: 'Original exercise' }, topic: 'English sports', prompt: 'play ____', answer: 'table tennis', explanation: 'Name the sport', answerEvidence: 'play table tennis' }], responses: [], hints: [], assessments: [] }
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(settings))
  const blockPath = join(cwd, '.study/blocks/english-block.json')
  await writeFile(blockPath, JSON.stringify(block))
  const originalBytes = await readFile(blockPath)
  const read = await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal)
  expect(read.issues).toEqual([])
  expect(read.status).toBe('valid')
  const ask = vi.fn().mockResolvedValue(undefined)
  const remote = { inspectSubmission: vi.fn(), manualContext: vi.fn(), saveManual: vi.fn() }
  let pendingSubject: string | undefined
  const useResource = (address: string) => {
    const request: StudentQueryRequest = JSON.parse(new URL(address).searchParams.get('query')!)
    const result = request.kind === 'dashboard' ? queryWorkspaceDashboard(read, NOW, request.options) : queryWorkspace(read, request, NOW)
    const value: StudentQueryResult = { ...result, data: JSON.parse(JSON.stringify(result.data)), token: address, readAt: NOW, refreshAfter: NOW + 3000, native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] }
    return request.kind === 'learning-context' && request.subject === pendingSubject ? { status: 'loading' as const, value: undefined, failure: undefined } : { status: 'live' as const, value, failure: undefined }
  }
  function Desk() { return <StudyDesk {...useDraftFixture()} {...createStudentManualActions(remote)} useResource={useResource} sessionId="subject-switch" visible running={false} ask={ask} t={key => en[key]} /> }
  const view = render(<Desk />)
  await screen.findByText('play ____')
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'Original English draft' } })
  for (const subject of ['chinese', 'math'] as const) {
    pendingSubject = subject
    fireEvent.click(screen.getByRole('button', { name: en[subject] }))
    expect(screen.queryByText('play ____')).toBeNull()
    expect(screen.queryByLabelText(en.answer)).toBeNull()
    pendingSubject = undefined
    view.rerender(<Desk />)
    await waitFor(() => expect(screen.getByRole('button', { name: en[subject] }).getAttribute('aria-pressed')).toBe('true'))
    expect(screen.queryByText('English sports')).toBeNull()
    expect(screen.queryByText('play ____')).toBeNull()
    expect(screen.queryByLabelText(en.reflection)).toBeNull()
    expect(queryWorkspace(read, { kind: 'learning-context', subject }, NOW)).toMatchObject({ data: { nextAction: { subject, reason: subject === 'math' ? 'new-goal' : 'confirmed-scope-required' }, round: null } })
  }
  fireEvent.click(screen.getByRole('button', { name: en.english }))
  await screen.findByText('play ____')
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('Original English draft')
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'answer', subject: 'english', blockId: block.id, questionId: block.currentQuestionId } } })
  expect(await readFile(blockPath)).toEqual(originalBytes)
  expect(ask).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: en.math }))
  fireEvent.click(screen.getByRole('button', { name: en.continueLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  const intent = JSON.parse(String(ask.mock.calls[0]![0]).split('Student intention:\n')[1]!.split('\n')[0]!)
  expect(intent).toMatchObject({ selection: { subject: 'math', goalId: 'm.count' }, nextAction: { subject: 'math', reason: 'new-goal' }, previousActivity: { blockId: block.id, questionId: block.currentQuestionId } })
  expect(intent.blockId).toBeUndefined()
  expect(intent.operation).toBeUndefined()
  expect(await readFile(blockPath)).toEqual(originalBytes)
})
