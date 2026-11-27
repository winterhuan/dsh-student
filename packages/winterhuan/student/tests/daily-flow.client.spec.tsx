// @vitest-environment jsdom
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, onTestFinished, vi } from 'vitest'
import { StudyDesk } from '../src/client/desk.tsx'
import { en } from '../src/client/locales.ts'
import { createStudentManualActions } from '../src/client/manual-actions.ts'
import { useDraftFixture } from './draft-fixture.tsx'
import { createStudentDraftStore } from '../src/client/drafts.tsx'
import { readWorkspace } from '../src/files/read.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { queryWorkspace, queryWorkspaceDashboard } from '../src/learning/queries.ts'
import { blockSchema, dailyPlanSchema, termSettingsSchema } from '../src/files/schema.ts'
import type { DailyLearning } from '../src/learning/daily.ts'
import type { StudentQueryRequest, StudentQueryResult } from '../src/types.ts'
import { setup } from './fixtures.ts'
afterEach(() => { cleanup(); window.localStorage.clear(); window.sessionStorage.clear() })

it('migrates session drafts into the shared store and retains the new draft after a reload', () => {
  const key = 'student:draft:child:term:answer:q'
  const old = JSON.stringify({ drafts: { [key]: 'original answer' } })
  window.localStorage.setItem('student:drafts.session-one', old)
  window.localStorage.setItem('student:drafts.corrupt-session', '{')
  const store = createStudentDraftStore().create()
  expect(store.getSnapshot().drafts[key]).toBe('original answer')
  store.actions.setDraft(key, 'continued answer')
  expect(createStudentDraftStore().create().getSnapshot().drafts[key]).toBe('continued answer')
  expect(window.localStorage.getItem('student:drafts.session-one')).toBe(old)
})

it('starts only on explicit choice, shows a factual paused summary and restores the same draft in another conversation', async () => {
  const now = Date.parse('2026-11-25T12:00:00+08:00')
  const cwd = await mkdtemp(join(tmpdir(), 'student-daily-flow-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const save = async (path: string, value: unknown) => { await mkdir(join(cwd, path, '..'), { recursive: true }); await writeFile(join(cwd, path), JSON.stringify(value)) }
  const scope = { id: 'counting', description: 'Within twenty', modality: 'written', numberMax: 20 }
  const settings = termSettingsSchema.parse({ format: 2, kind: 'term-settings', learnerId: 'child', termId: 'term', revision: 1, updatedAt: now - 1, profile: setup.profile, materials: [], courses: [], learningScopes: [{ subject: 'math', goalIds: ['m.count'], scope, parentConfirmation: 'Confirmed' }] })
  await save('.study/settings.json', settings)
  const fs = nodeStudyFiles(cwd)
  let read = await readWorkspace(fs, new AbortController().signal, undefined, [], [], { now })
  const plan = dailyPlanSchema.parse((queryWorkspace(read, { kind: 'daily-plan' }, now).data as DailyLearning).preview)
  const block = blockSchema.parse({ format: 2, kind: 'block', learnerId: 'child', termId: 'term', id: 'count', subject: 'math', mode: 'foundation', startedAt: now, context: { profile: setup.profile }, currentQuestionId: 'q', questions: [{ id: 'q', objectiveId: 'm.count', capability: { goalId: 'm.count', familyId: 'math.count', scope }, source: { kind: 'authored', description: 'Original' }, topic: 'Counting', prompt: 'How many: ● ● ●?', answer: '3', explanation: 'Count once', answerEvidence: 'Three objects' }], responses: [], assessments: [], hints: [], plan: { day: plan.day, taskId: plan.tasks[0]!.id } })
  const useResource = (address: string) => {
    const request: StudentQueryRequest = JSON.parse(new URL(address).searchParams.get('query')!)
    const result = request.kind === 'dashboard' ? queryWorkspaceDashboard(read, now, request.options) : queryWorkspace(read, request, now)
    return { status: 'live' as const, failure: undefined, value: { ...result, data: JSON.parse(JSON.stringify(result.data)), token: address, readAt: now, refreshAfter: now + 1000, native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] } as StudentQueryResult }
  }
  const ask = vi.fn().mockResolvedValue(undefined)
  const remote = createStudentManualActions({ inspectSubmission: vi.fn(), manualContext: vi.fn(), saveManual: vi.fn() })
  function Desk({ id }: { id: string }) { return <StudyDesk key={id} {...useDraftFixture()} {...remote} {...{ useResource, ask }} sessionId={id} visible running={false} t={key => en[key]} /> }
  const view = render(<Desk id="first" />)
  expect(screen.getByRole('navigation', { name: en.subject })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: en.english }))
  expect(screen.getByRole('button', { name: en.courseStart })).toBeTruthy()
  expect(screen.queryByText(en.confirmLearningScope)).toBeNull()
  expect(ask).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: en.math }))
  fireEvent.click(screen.getByRole('button', { name: en.courseStart }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(String(ask.mock.calls[0]![0])).toContain('"action":"start"')
  // Native writes are accepted only after the independent file streams agree.
  expect(screen.queryByText(block.questions[0]!.prompt)).toBeNull()
  plan.state = 'active'; plan.tasks[0]!.state = 'active'; plan.tasks[0]!.activity = { blockId: block.id, questionId: 'q' }
  await save(`.study/plans/${plan.day}.json`, plan); await save('.study/blocks/count.json', block)
  read = await readWorkspace(fs, new AbortController().signal, undefined, [], [], { now }); expect(read.status).toBe('valid')
  view.rerender(<Desk id="first" />)
  expect(screen.queryByRole('navigation', { name: en.subject })).toBeNull()
  expect(screen.queryByRole('button', { name: en.continueLearning })).toBeNull()
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'My original draft' } })
  fireEvent.click(screen.getByRole('button', { name: en.pauseLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledTimes(2))
  plan.state = 'paused'; plan.tasks[0]!.state = 'paused'; plan.revision++
  plan.choices.push({ id: 'pause', at: now, revision: plan.revision, action: 'pause', reason: 'Child paused', taskIds: [plan.tasks[0]!.id], replacedTaskIds: [] })
  await save(`.study/plans/${plan.day}.json`, plan)
  read = await readWorkspace(fs, new AbortController().signal, undefined, [], [], { now }); view.rerender(<Desk id="first" />)
  expect(screen.getByRole('heading', { name: en.todayGains })).toBeTruthy()
  expect(screen.getByText(en.noActualLearning)).toBeTruthy()
  expect(screen.queryByText(en.dailyRecommendations)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.backHome }))
  expect(screen.getByRole('navigation', { name: en.subject })).toBeTruthy()
  expect(screen.getAllByRole('button', { name: en.resumeLearning })).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: en.todayGains }))
  expect(ask).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByRole('button', { name: en.backHome }))
  fireEvent.click(screen.getByRole('button', { name: en.resumeLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledTimes(3))
  plan.state = 'active'; plan.tasks[0]!.state = 'active'; plan.revision++
  plan.choices.push({ id: 'resume', at: now, revision: plan.revision, action: 'continue', reason: 'Child continued', taskIds: [plan.tasks[0]!.id], replacedTaskIds: [] })
  await save(`.study/plans/${plan.day}.json`, plan)
  read = await readWorkspace(fs, new AbortController().signal, undefined, [], [], { now }); view.rerender(<Desk id="another-conversation" />)
  expect(screen.getByText(block.questions[0]!.prompt)).toBeTruthy()
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('My original draft')
  const finished = blockSchema.parse({ ...block, endedAt: now, responses: [{ id: 'answer', questionId: 'q', rawResponse: '3', assistance: 'independent', answerDate: { kind: 'day', day: plan.day, parentConfirmation: 'Today' }, source: { kind: 'manual', entry: 'current', parentConfirmation: 'Child answered' } }], assessments: [{ id: 'assessment', responseId: 'answer', result: 'correct', assistance: 'independent', criteria: ['basic'], feedback: 'Counted three', answerEvidence: 'Three circles', assessedAt: now }] })
  plan.state = 'completed'; plan.completedAt = now; plan.revision++; plan.tasks[0]!.state = 'completed'
  plan.tasks[0]!.outcomes = [{ termId: settings.termId, ownerKind: 'block', ownerId: block.id, responseId: finished.responses[0]!.id }]
  await save('.study/blocks/count.json', finished); await save(`.study/plans/${plan.day}.json`, plan)
  read = await readWorkspace(fs, new AbortController().signal, undefined, [], [], { now }); view.rerender(<Desk id="another-conversation" />)
  expect(read.status).toBe('valid')
  fireEvent.click(screen.getByRole('button', { name: en.backHome }))
  expect(screen.queryByRole('button', { name: en.courseStart })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.todayGains }))
  expect(screen.getByRole('heading', { name: en.todayGains })).toBeTruthy()
  expect(ask).toHaveBeenCalledTimes(3)
  fireEvent.click(screen.getByRole('button', { name: en.learnMore }))
  fireEvent.click(screen.getByRole('button', { name: en.learnThis }))
  await waitFor(() => expect(ask).toHaveBeenCalledTimes(4))
  expect(String(ask.mock.calls[3]![0])).toContain('"action":"extra"')
})

it('opens gains from an unplanned activity and binds pause to that original activity without fabricating a start', async () => {
  const now = Date.parse('2026-11-26T12:00:00+08:00')
  const cwd = await mkdtemp(join(tmpdir(), 'student-existing-flow-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const save = async (path: string, value: unknown) => { await mkdir(join(cwd, path, '..'), { recursive: true }); await writeFile(join(cwd, path), JSON.stringify(value)) }
  const settings = termSettingsSchema.parse({ format: 2, kind: 'term-settings', learnerId: 'child', termId: 'term', revision: 1, updatedAt: now - 1, profile: setup.profile, materials: [], courses: [] })
  const block = blockSchema.parse({ format: 2, kind: 'block', learnerId: 'child', termId: 'term', id: 'old', subject: 'math', mode: 'foundation', startedAt: now - 86400000, context: { profile: setup.profile }, currentQuestionId: 'old-question', questions: [{ id: 'old-question', objectiveId: 'm.count', capability: { goalId: 'm.count', familyId: 'math.count', scope: { id: 'counting', description: 'Within twenty', modality: 'written', numberMax: 20 } }, source: { kind: 'authored', description: 'Original' }, topic: 'Counting', prompt: 'How many: ● ● ●?', answer: '3', explanation: 'Count once', answerEvidence: 'Three objects' }], responses: [], assessments: [], hints: [] })
  await save('.study/settings.json', settings); await save('.study/blocks/old.json', block)
  const fs = nodeStudyFiles(cwd)
  let read = await readWorkspace(fs, new AbortController().signal, undefined, [], [], { now })
  const useResource = (address: string) => {
    const request: StudentQueryRequest = JSON.parse(new URL(address).searchParams.get('query')!)
    const result = request.kind === 'dashboard' ? queryWorkspaceDashboard(read, now, request.options) : queryWorkspace(read, request, now)
    return { status: 'live' as const, failure: undefined, value: { ...result, data: JSON.parse(JSON.stringify(result.data)), token: address, readAt: now, refreshAfter: now + 1000, native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] } as StudentQueryResult }
  }
  const ask = vi.fn().mockResolvedValue(undefined)
  const remote = createStudentManualActions({ inspectSubmission: vi.fn(), manualContext: vi.fn(), saveManual: vi.fn() })
  function Desk({ id }: { id: string }) { return <StudyDesk key={id} {...useDraftFixture()} {...remote} {...{ useResource, ask }} sessionId={id} visible running={false} t={key => en[key]} /> }
  const view = render(<Desk id="original" />)
  fireEvent.change(screen.getByLabelText(en.answer), { target: { value: 'Retained old draft' } })
  fireEvent.click(screen.getByRole('button', { name: en.backHome }))
  fireEvent.click(screen.getByRole('button', { name: en.todayGains }))
  expect(screen.getByRole('heading', { name: en.todayGains })).toBeTruthy()
  expect(screen.getByText(en.noActualLearning)).toBeTruthy()
  expect(screen.getByRole('button', { name: en.resumeLearning })).toBeTruthy()
  expect(screen.queryByText(en.dailyRecommendations)).toBeNull()
  expect(ask).not.toHaveBeenCalled()
  // Reload still follows the unchanged active activity and preserves its draft.
  view.rerender(<Desk id="reloaded" />)
  expect((screen.getByLabelText(en.answer) as HTMLInputElement).value).toBe('Retained old draft')
  fireEvent.click(screen.getByRole('button', { name: en.pauseLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledOnce())
  expect(String(ask.mock.calls[0]![0])).toContain('"action":"pause"')
  expect(String(ask.mock.calls[0]![0])).toContain('"blockId":"old"')
  expect(screen.queryByRole('heading', { name: en.todayGains })).toBeNull()
  expect(read.issues).toEqual([])
  const daily = queryWorkspace(read, { kind: 'daily-plan' }, now).data as DailyLearning
  const task = daily.tasks[0]!.task
  const plan = dailyPlanSchema.parse({ ...daily.preview, state: 'paused', subjects: ['math'], tasks: [{ ...task, state: 'paused' }], choices: [{ id: 'pause', action: 'pause', at: now, revision: 1, reason: 'Child paused', taskIds: [task.id], replacedTaskIds: [] }] })
  block.plan = { day: plan.day, taskId: task.id }
  await save(`.study/plans/${plan.day}.json`, plan); await save('.study/blocks/old.json', block)
  read = await readWorkspace(fs, new AbortController().signal, undefined, [], [], { now })
  expect(read.status).toBe('valid')
  view.rerender(<Desk id="paused-reloaded" />)
  expect(screen.getByRole('heading', { name: en.todayGains })).toBeTruthy()
  expect(screen.getByText(en.noActualLearning)).toBeTruthy()
  expect(screen.queryByText(en.dailyRecommendations)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: en.resumeLearning }))
  await waitFor(() => expect(ask).toHaveBeenCalledTimes(2))
  expect(String(ask.mock.calls[1]![0])).toContain('"action":"continue"')
})
