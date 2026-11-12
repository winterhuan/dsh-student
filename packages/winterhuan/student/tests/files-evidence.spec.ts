import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { expect, it, onTestFinished } from 'vitest'
import { readWorkspace } from '../src/files/read.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { queryWorkspace, queryWorkspaceDashboard } from '../src/learning/queries.ts'
import { validateStudyFiles } from '../src/files/validation.ts'
import type { z } from 'zod'
import type { blockSchema } from '../src/files/schema.ts'
import { collectionsSchema, worksheetSchema } from '../src/files/schema.ts'
import { NOW, setup } from './fixtures.ts'

async function workspace() {
  const cwd = await mkdtemp(join(tmpdir(), 'student-v2-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  await mkdir(join(cwd, '.study/worksheets'), { recursive: true })
  const settings = { format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const block: z.input<typeof blockSchema> = { format: 2, kind: 'block', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW,
    context: { profile: setup.profile, scope: { grade: 2, term: 'first', objectiveIds: ['m2a-o-sub'] } }, currentQuestionId: 'q1',
    questions: [{ id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original practice' }, topic: 'Addition', prompt: '8 + 7?', answer: '15', explanation: 'Make ten', answerEvidence: '8 + 2 + 5 = 15', phase: 'try' }],
    responses: [{ id: 'r1', questionId: 'q1', rawResponse: '15', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: { kind: 'unknown' } }], hints: [],
    assessments: [{ id: 'a1', responseId: 'r1', result: 'correct', assistance: 'unknown', feedback: 'Correct', answerEvidence: '8 + 7 = 15', assessedAt: NOW }] }
  const save = async (path: string, value: unknown) => writeFile(join(cwd, path), `${JSON.stringify(value)}\n`)
  await save('.study/settings.json', settings)
  await save('.study/blocks/block-1.json', block)
  return { cwd, settings, block, save, files: nodeStudyFiles(cwd) }
}

it('reads saved original answers without turning unknown dates or assistance into independent evidence', async () => {
  const { files } = await workspace()
  const read = await readWorkspace(files, new AbortController().signal)
  expect(read.status).toBe('valid')
  const result = queryWorkspace(read, { kind: 'learning-context' }, NOW)
  expect(result).toMatchObject({ status: 'valid', data: { currentQuestion: { id: 'q1' }, responses: [{ rawResponse: '15', answerDate: { kind: 'unknown' } }], pendingFacts: [{ responseId: 'r1', fields: ['answerDate', 'assistance', 'source'] }], seeds: expect.any(Array) } })
  const summary = queryWorkspace(read, { kind: 'summary' }, NOW)
  expect(summary).toMatchObject({ data: { practisedGoals: 0, masteredGoals: 0, dueCompletion: { done: 0, total: 0 } } })
})

it('rejects a diagnostic teaching phase before displaying the question and accepts an unphased diagnostic', async () => {
  const { files, block, save } = await workspace()
  block.mode = 'diagnose'
  block.responses = []; block.assessments = []
  block.questions[0]!.phase = 'demo'
  await save('.study/blocks/block-1.json', block)
  const invalid = await readWorkspace(files, new AbortController().signal)
  expect(invalid).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ field: 'questions.0.phase', rule: 'diagnostic-phase' })]) })
  expect(queryWorkspace(invalid, { kind: 'learning-context' }, NOW)).not.toHaveProperty('data.currentQuestion')
  delete block.questions[0]!.phase
  await save('.study/blocks/block-1.json', block)
  expect(queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'learning-context' }, NOW)).toMatchObject({ status: 'valid', data: { currentQuestion: { id: 'q1' } } })
})

it('records intensity only for a diagnostic block while leaving diagnostic intensity optional', async () => {
  const { files, block, save } = await workspace()
  block.intensity = 'deep'
  await save('.study/blocks/block-1.json', block)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ field: 'intensity', rule: 'diagnostic-intensity' })]) })
  block.mode = 'diagnose'
  delete block.questions[0]!.phase
  await save('.study/blocks/block-1.json', block)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'valid', workspace: { blocks: [{ intensity: 'deep' }] } })
  delete block.intensity
  await save('.study/blocks/block-1.json', block)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'valid' })
})

it('requires a matching selected book for a new cross-book question and accepts the historical profile by default', async () => {
  const { files, settings, block, save } = await workspace()
  block.context = { profile: { ...setup.profile, grade: 1 } }
  block.responses = []; block.assessments = []
  await save('.study/blocks/block-1.json', block)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ field: 'questions.0.objectiveId', rule: 'effective-curriculum' })]) })
  block.context.scope = { grade: 1, term: 'first', objectiveIds: ['m2a-o-sub'] }
  await save('.study/blocks/block-1.json', block)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ rule: 'effective-curriculum' })]) })
  block.context.scope = { grade: 2, term: 'first', objectiveIds: ['m2a-o-sub'] }
  await save('.study/blocks/block-1.json', block)
  expect(queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'learning-context' }, NOW)).toMatchObject({ status: 'valid', data: { target: { id: 'm2a-o-sub' } } })
  block.context = { profile: setup.profile }
  await save('.study/blocks/block-1.json', block)
  await save('.study/settings.json', { ...settings, profile: { ...settings.profile, grade: 1 } })
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'valid' })
})

it('requires a confirmed mistake binding for a review question while permitting early review practice', async () => {
  const { files, block, save } = await workspace()
  block.mode = 'review'
  block.responses = []; block.assessments = []
  await save('.study/blocks/block-1.json', block)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ field: 'questions.0.mistakeId', rule: 'review-mistake' })]) })
  block.questions[0]!.mistakeId = 'm1'
  const mistake = { id: 'm1', subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: NOW, userConfirmation: 'Confirmed' }
  await save('.study/blocks/block-1.json', block)
  await save('.study/collections.json', collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes: [mistake], rewards: [], teachingQueue: [] }))
  expect(queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'learning-context' }, NOW)).toMatchObject({ status: 'valid', data: { currentQuestion: { mistakeId: 'm1' } } })
})

it('varies a prepared mistake question but preserves workbook originals and used review content after source edits or deletion', async () => {
  const { files, block, save } = await workspace()
  const mistake = { id: 'm1', subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: NOW, userConfirmation: 'Confirmed' }
  const collection = collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes: [mistake], rewards: [], teachingQueue: [] })
  const sheet = worksheetSchema.parse({ format: 2, kind: 'worksheet', termId: 'term-1', id: 'review-1', subject: 'math', worksheetKind: 'review', origin: 'prepared', createdAt: NOW, context: block.context,
    items: [{ ...block.questions[0]!, mistakeId: 'm1', prompt: mistake.prompt }], responses: [], assessments: [], drafts: [] })
  await save('.study/collections.json', collection)
  await save('.study/worksheets/review-1.json', sheet)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ path: '.study/worksheets/review-1.json', field: 'questions.0.prompt', rule: 'review-variation' })]) })
  sheet.origin = 'workbook'
  await save('.study/worksheets/review-1.json', sheet)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'valid' })
  sheet.origin = 'prepared'; sheet.items[0]!.prompt = '28 - 7?'
  await save('.study/worksheets/review-1.json', sheet)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'valid' })
  sheet.drafts = [{ id: 'draft-1', questionId: 'q1', response: '21', result: 'correct', assistance: 'unknown', confidence: 'high', uncertainties: '', imagePaths: [], receivedAt: NOW }]
  await save('.study/worksheets/review-1.json', sheet)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'valid' })
  collection.mistakes[0]!.prompt = '28 - 7?'; collection.mistakes[0]!.objectiveId = 'm2a-o-add'
  await save('.study/collections.json', collection)
  const reclassified = await readWorkspace(files, new AbortController().signal)
  expect(reclassified).toMatchObject({ status: 'valid', workspace: { worksheets: [{ items: [{ objectiveId: 'm2a-o-sub', prompt: '28 - 7?' }] }] } })
  collection.mistakes = []
  await save('.study/collections.json', collection)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'valid', workspace: { worksheets: [{ drafts: [{ response: '21' }], items: [{ objectiveId: 'm2a-o-sub' }] }] } })
  sheet.items[0]!.prompt = '38 - 7?'
  await save('.study/worksheets/review-1.json', sheet)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ rule: 'frozen-content' })]) })
})

it('reuses dashboard curriculum across independent reads until files or the Shanghai day change', async () => {
  const { files, settings, save } = await workspace()
  const read = () => readWorkspace(files, new AbortController().signal)
  const first = queryWorkspaceDashboard(await read(), NOW, { tab: 'map', subject: 'math' })
  const repeated = queryWorkspaceDashboard(await read(), NOW + 1000, { tab: 'map', subject: 'math' })
  expect(repeated.data?.study?.curriculum).toBe(first.data?.study?.curriculum)
  expect(repeated.data?.serverNow).toBe(NOW + 1000)
  expect(queryWorkspaceDashboard(await read(), NOW + 86_400_000, { tab: 'map', subject: 'math' }).data?.study?.curriculum).not.toBe(first.data?.study?.curriculum)
  await save('.study/settings.json', { ...settings, profile: { ...settings.profile, nickname: 'Updated name' } })
  const updated = queryWorkspaceDashboard(await read(), NOW + 1000, { tab: 'map', subject: 'math' })
  expect(updated.data?.study?.profile.nickname).toBe('Updated name')
  expect(updated.data?.study?.curriculum).not.toBe(first.data?.study?.curriculum)
})

it('keeps the selected goal and current response while distinguishing pending and saved assessment actions', async () => {
  const { files, block, save } = await workspace()
  block.currentResponseId = 'r1'
  block.assessments = []
  await save('.study/blocks/block-1.json', block)
  const pending = queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'learning-context' }, NOW)
  expect(pending).toMatchObject({ data: { savedResponse: { id: 'r1', rawResponse: '15' }, pendingAssessment: true, target: { id: 'm2a-o-sub', method: 'verify' }, legalActions: ['request-assessment', 'end-block', 'switch-block'] } })
  block.assessments = [{ id: 'a1', responseId: 'r1', result: 'correct', assistance: 'unknown', feedback: 'Correct', answerEvidence: '8 + 7 = 15', assessedAt: NOW }]
  await save('.study/blocks/block-1.json', block)
  expect(queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'learning-context' }, NOW)).toMatchObject({ data: { pendingAssessment: false, legalActions: ['next-question', 'end-block', 'switch-block'] } })
})

it('retains an explicitly selected original response outside the recent response window', async () => {
  const { files, block, save } = await workspace()
  const original = block.responses[0]!
  block.responses = Array.from({ length: 21 }, (_, index) => ({ ...original, id: `r-${index}`, rawResponse: `Original ${index}` }))
  block.currentResponseId = 'r-0'
  block.assessments = []
  await save('.study/blocks/block-1.json', block)
  const result = queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'learning-context' }, NOW)
  expect(result).toMatchObject({ data: { savedResponse: { id: 'r-0', rawResponse: 'Original 0' }, responses: expect.arrayContaining([expect.objectContaining({ id: 'r-0' })]), pendingAssessment: true } })
})

it('loads curriculum and seed questions through the built package export in plain Node', async () => {
  const { cwd } = await workspace()
  const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '--eval', `
    import { nodeStudyFiles, readWorkspace, queryWorkspace } from '@winterhuan/dsh-student/files'
    const read = await readWorkspace(nodeStudyFiles(process.argv[1]), new AbortController().signal)
    const result = queryWorkspace(read, { kind: 'learning-context' }, ${NOW})
    console.log(JSON.stringify(result))
  `, cwd], { cwd: fileURLToPath(new URL('..', import.meta.url)), env: { ...process.env, NODE_OPTIONS: '' } })
  expect(JSON.parse(stdout)).toMatchObject({ status: 'valid', data: { seeds: expect.arrayContaining([expect.objectContaining({ id: 'ex-m2a-sub-1', objectiveId: 'm2a-o-sub' })]), elements: { errorTypes: ['carry-borrow', 'calculation'] } } })
})

const SUMMARY_NOW = Date.parse('2026-11-12T20:00:00+08:00')

it('distinguishes first mastery from repeating a goal mastered before the Shanghai seven-day window', async () => {
  const { files, block, save } = await workspace()
  block.responses = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-11-12'].map((day, index) => ({ id: `r${index}`, questionId: 'q1', rawResponse: '15', assistance: 'independent', source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Actual answer date confirmed' }, answerDate: { kind: 'day', day, parentConfirmation: 'Actual date confirmed' } }))
  block.assessments = block.responses.map(response => ({ id: `a-${response.id}`, responseId: response.id, result: 'correct', assistance: 'independent', feedback: 'Correct', answerEvidence: 'Verified', assessedAt: NOW }))
  await save('.study/blocks/block-1.json', block)
  const read = await readWorkspace(files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'summary' }, SUMMARY_NOW)).toMatchObject({ data: { practisedGoals: 1, masteredGoals: 0, recoveredGoals: 0 } })
  block.responses = block.responses.slice(1).map((response, index) => ({ ...response, answerDate: { kind: 'day', day: `2026-11-${10 + index}`, parentConfirmation: 'Actual date confirmed' } }))
  block.assessments = block.assessments.slice(1)
  const fresh = await workspace()
  await fresh.save('.study/blocks/block-1.json', block)
  expect(queryWorkspace(await readWorkspace(fresh.files, new AbortController().signal), { kind: 'summary' }, SUMMARY_NOW)).toMatchObject({ data: { masteredGoals: 1 } })
})

it('does not label a repeat as first mastery when old unordered difficulty aged out before the new answer', async () => {
  const { files, block, save } = await workspace()
  block.responses = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-03', '2026-10-25'].map((day, index) => ({ id: `r${index}`, questionId: 'q1', rawResponse: index === 3 ? '14' : '15', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual day confirmed' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Confirmed' } }))
  block.assessments = block.responses.map((response, index) => ({ id: `a${index}`, responseId: response.id, result: index === 3 ? 'incorrect' : 'correct', assistance: 'independent', feedback: 'Checked', answerEvidence: 'Verified', assessedAt: NOW }))
  await save('.study/blocks/block-1.json', block)
  expect(queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'summary' }, Date.parse('2026-10-25T20:00:00+08:00'))).toMatchObject({ data: { masteredGoals: 0, recoveredGoals: 0, practisedGoals: 1 } })
})

it('rejects an orphan assessment and selected-scope bypass through the actual file reader', async () => {
  const { files, block, save } = await workspace()
  block.assessments[0]!.responseId = 'absent'
  block.questions[0]!.objectiveId = 'm2a-o-shop'
  await save('.study/blocks/block-1.json', block)
  const read = await readWorkspace(files, new AbortController().signal)
  expect(read).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ rule: 'response-reference' }), expect.objectContaining({ rule: 'effective-scope' })]) })
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).not.toHaveProperty('data')
})

it('does not infer independent work from a date that cannot place an unbound hint after the answer', async () => {
  const { files, block, save } = await workspace()
  block.hints = [{ questionId: 'q1', level: 1, at: NOW }]
  block.responses[0]!.assistance = 'independent'; block.assessments[0]!.assistance = 'independent'
  for (const answerDate of [{ kind: 'day' as const, day: '2026-10-05', parentConfirmation: 'Actual day confirmed' }, { kind: 'unknown' as const }]) {
    block.responses[0]!.answerDate = answerDate
    await save('.study/blocks/block-1.json', block)
    expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ rule: 'known-help' })]) })
  }
  block.hints[0]!.responseId = 'other-response'
  block.responses.push({ ...block.responses[0]!, id: 'other-response', assistance: 'hint' })
  await save('.study/blocks/block-1.json', block)
  expect((await readWorkspace(files, new AbortController().signal)).status).toBe('valid')
})

it('rejects a new question bound to another goal mistake but preserves an observed historical binding after reclassification', async () => {
  const { files, block, save } = await workspace()
  block.questions[0]!.mistakeId = 'm1'
  block.questions[0]!.source = { kind: 'mistake', mistakeId: 'm1', description: 'Original subtraction mistake' }
  block.responses[0]!.assistance = 'independent'; block.assessments[0]!.assistance = 'independent'
  block.responses[0]!.answerDate = { kind: 'day', day: '2026-10-05', parentConfirmation: 'Actual date confirmed' }
  const mistake = { id: 'm1', subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: Date.parse('2026-10-01T09:00:00+08:00'), userConfirmation: 'Confirmed' }
  const collection = (objectiveId: string) => collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes: [{ ...mistake, objectiveId }], rewards: [], teachingQueue: [] })
  await save('.study/blocks/block-1.json', block)
  await save('.study/collections.json', collection('m2a-o-add'))
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ rule: 'mistake-source' })]) })
  await save('.study/collections.json', collection('m2a-o-sub'))
  const original = await readWorkspace(files, new AbortController().signal)
  expect(queryWorkspace(original, { kind: 'mistakes' }, SUMMARY_NOW)).toMatchObject({ data: { items: [expect.objectContaining({ stage: 1 })] } })
  await save('.study/collections.json', collection('m2a-o-add'))
  const reclassified = await readWorkspace(files, new AbortController().signal)
  expect(reclassified.status).toBe('valid')
  expect(queryWorkspace(reclassified, { kind: 'learning-context' }, SUMMARY_NOW)).toMatchObject({ data: { target: { id: 'm2a-o-sub' } } })
  expect(queryWorkspace(reclassified, { kind: 'mistakes' }, SUMMARY_NOW)).toMatchObject({ data: { items: [expect.objectContaining({ stage: 0, independentDays: [] })] } })
})

it('keeps question content and original response immutable against a preserved observed version', async () => {
  const { files, block, save } = await workspace()
  const first = await readWorkspace(files, new AbortController().signal)
  block.questions[0]!.prompt = '9 + 7?'
  await save('.study/blocks/block-1.json', block)
  expect(await readWorkspace(files, new AbortController().signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ rule: 'frozen-content' })]) })
  const replacement = structuredClone(block)
  replacement.questions[0]!.prompt = '8 + 7?'
  replacement.responses[0]!.rawResponse = '16'
  const validation = validateStudyFiles([{ path: '.study/settings.json', value: first.workspace!.settings }, { path: '.study/blocks/block-1.json', value: replacement }], first.files.flatMap(item => item.file ? [{ path: item.path, file: item.file }] : []))
  expect(validation.issues).toContainEqual(expect.objectContaining({ rule: 'original-response' }))
})

it('invalidates direct edits at an unchanged revision and bounds changing membership reads', async () => {
  const { files, settings, save } = await workspace()
  const first = await readWorkspace(files, new AbortController().signal)
  await save('.study/settings.json', { ...settings, profile: { ...settings.profile, nickname: 'Changed directly' } })
  const second = await readWorkspace(files, new AbortController().signal)
  expect(second.workspace!.settings.profile.nickname).toBe('Changed directly')
  expect(second.workspace!.settings.revision).toBe(first.workspace!.settings.revision)
  let listings = 0
  const changing = { ...files, async list(path: string, signal: AbortSignal) { const entries = await files.list(path, signal); if (path === '.study/blocks') { listings += 1; if (listings % 2 === 0) return [...entries, { name: 'new.json', type: 'file' as const }] } return entries } }
  expect(await readWorkspace(changing, new AbortController().signal)).toMatchObject({ status: 'changing', issues: [expect.objectContaining({ rule: 'changing-read' })] })
  expect(listings).toBe(6)
})

it('reuses version-stable summary projections while elapsed minutes and time thresholds refresh', async () => {
  const { files } = await workspace()
  const first = queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'summary' }, NOW + 60_000)
  const second = queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'summary' }, NOW + 120_000)
  const firstData = first.data as { suggestion: unknown; minutesByDay: { minutes: number }[] }
  const secondData = second.data as typeof firstData
  expect(secondData.suggestion).toBe(firstData.suggestion)
  expect(firstData.minutesByDay.at(-1)!.minutes).toBe(1)
  expect(secondData.minutesByDay.at(-1)!.minutes).toBe(2)
  const expired = queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'summary' }, first.refreshAfter!)
  expect((expired.data as typeof firstData).suggestion).not.toBe(firstData.suggestion)
})

it('keeps native dates pending without an independently matched consumed input and rejects manual-source bypass', async () => {
  const { files, block, save } = await workspace()
  block.responses[0]!.source = { kind: 'native', sessionId: 'session-1', messageId: 'message-1', inputVersion: 'version-2', receiptAt: SUMMARY_NOW }
  block.responses[0]!.answerDate = { kind: 'instant', at: SUMMARY_NOW, basis: 'native-input', sourceVersion: 'version-2' }
  block.responses[0]!.assistance = 'independent'; block.assessments[0]!.assistance = 'independent'
  await save('.study/blocks/block-1.json', block)
  const unmatched = await readWorkspace(files, new AbortController().signal)
  expect(queryWorkspace(unmatched, { kind: 'summary' }, SUMMARY_NOW)).toMatchObject({ data: { practisedGoals: 0 } })
  expect(queryWorkspace(unmatched, { kind: 'learning-context' }, SUMMARY_NOW)).toMatchObject({ data: { pendingFacts: [{ responseId: 'r1', fields: ['answerDate', 'source'] }] } })
  const matched = await readWorkspace(files, new AbortController().signal, [], [{ sessionId: 'session-1', messageId: 'message-1', inputVersion: 'version-2', rawResponse: '15', receiptAt: SUMMARY_NOW }])
  expect(queryWorkspace(matched, { kind: 'summary' }, SUMMARY_NOW)).toMatchObject({ data: { practisedGoals: 1 } })
  expect(queryWorkspace(matched, { kind: 'learning-context' }, SUMMARY_NOW)).toMatchObject({ data: { pendingFacts: [] } })
  block.responses[0]!.answerDate = { kind: 'instant', at: SUMMARY_NOW, basis: 'current-manual', sourceVersion: 'version-2' }
  const validation = validateStudyFiles([{ path: '.study/settings.json', value: matched.workspace!.settings }, { path: '.study/blocks/block-1.json', value: block }])
  expect(validation.issues).toContainEqual(expect.objectContaining({ rule: 'current-manual-source' }))
})

it('reports an unknown response source while preserving a parent-confirmed paper day without native matching', async () => {
  for (const source of [{ kind: 'unknown' as const }, { kind: 'paper' as const, imagePaths: ['attachments/paper.png'], parentConfirmation: 'Parent confirms the original paper answer' }]) {
    const { files, block, save } = await workspace()
    block.responses[0]!.source = source
    block.responses[0]!.answerDate = { kind: 'day', day: '2026-10-05', parentConfirmation: 'Parent confirms the actual day' }
    block.responses[0]!.assistance = 'independent'; block.assessments[0]!.assistance = 'independent'
    await save('.study/blocks/block-1.json', block)
    const read = await readWorkspace(files, new AbortController().signal)
    const context = queryWorkspace(read, { kind: 'learning-context' }, SUMMARY_NOW)
    expect(context).toMatchObject({ data: { savedResponse: { answerDate: { kind: 'day', day: '2026-10-05' } }, pendingFacts: source.kind === 'unknown' ? [{ responseId: 'r1', fields: ['source'] }] : [] } })
    if (source.kind === 'paper') expect(queryWorkspace(read, { kind: 'summary' }, NOW)).toMatchObject({ data: { practisedGoals: 1 } })
  }
})

it('keeps unrelated valid block facts readable when a worksheet is corrupt', async () => {
  const { files, save } = await workspace()
  await save('.study/worksheets/broken.json', { format: 2, kind: 'worksheet', id: 'broken' })
  const read = await readWorkspace(files, new AbortController().signal)
  expect(read.status).toBe('invalid')
  expect(queryWorkspace(read, { kind: 'learning-context' }, SUMMARY_NOW)).toMatchObject({ status: 'partial', data: { currentQuestion: { id: 'q1' } } })
  expect(queryWorkspace(read, { kind: 'summary' }, SUMMARY_NOW)).not.toHaveProperty('data')
})

it('keeps term settings and materials available as partial reads without presenting an incomplete summary', async () => {
  const { files, save } = await workspace()
  await save('.study/worksheets/broken.json', { format: 2, kind: 'worksheet', id: 'broken' })
  const read = await readWorkspace(files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'settings' }, SUMMARY_NOW)).toMatchObject({ status: 'partial', data: { termId: 'term-1', profile: setup.profile, materials: [], courses: [] }, issues: expect.arrayContaining([expect.objectContaining({ path: '.study/worksheets/broken.json' })]) })
  expect(queryWorkspace(read, { kind: 'materials' }, SUMMARY_NOW)).toMatchObject({ status: 'partial', data: { items: [], total: 0 } })
  expect(queryWorkspace(read, { kind: 'summary' }, SUMMARY_NOW)).not.toHaveProperty('data')
})

it('counts review opportunities by mistake identity and retains completion after later difficulty reschedules it', async () => {
  const { files, block, save } = await workspace()
  const mistakes = ['m1', 'm2'].map(id => ({ id, subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: Date.parse('2026-11-01T09:00:00+08:00'), userConfirmation: 'Parent confirmed' }))
  await save('.study/collections.json', collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes, rewards: [], teachingQueue: [] }))
  block.questions[0]!.mistakeId = 'm1'
  block.responses = ['2026-11-06', '2026-11-06', '2026-11-10', '2026-11-12'].map((day, index) => ({ id: `r${index}`, questionId: 'q1', rawResponse: index === 1 || index === 3 ? '10' : '11', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual paper day confirmed' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Confirmed' } }))
  block.assessments = block.responses.map((response, index) => ({ id: `a${index}`, responseId: response.id, result: index === 1 || index === 3 ? 'incorrect' : 'correct', assistance: 'independent', feedback: 'Checked', answerEvidence: 'Verified', assessedAt: SUMMARY_NOW }))
  await save('.study/blocks/block-1.json', block)
  const read = await readWorkspace(files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'summary' }, SUMMARY_NOW)).toMatchObject({ data: { dueCompletion: { done: 1, total: 2 } } })
  expect(queryWorkspace(read, { kind: 'mistakes' }, SUMMARY_NOW)).toMatchObject({ data: { items: [expect.objectContaining({ id: 'm1', stage: 2, independentDays: ['2026-11-06', '2026-11-10'], dueAt: Date.parse('2026-11-14T00:00:00+08:00') }), expect.objectContaining({ id: 'm2', stage: 0 })] } })
})

it('reports mastery recovered by a new due-review answer separately from first mastery', async () => {
  const { files, block, save } = await workspace()
  await save('.study/collections.json', collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes: [{ id: 'm1', subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: Date.parse('2026-09-30T09:00:00+08:00'), userConfirmation: 'Parent confirmed' }], rewards: [], teachingQueue: [] }))
  block.questions[0]!.mistakeId = 'm1'
  block.responses = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-08', '2026-11-12'].map((day, index) => ({ id: `r${index}`, questionId: 'q1', rawResponse: '11', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual day confirmed' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Confirmed' } }))
  block.assessments = block.responses.map((response, index) => ({ id: `a${index}`, responseId: response.id, result: 'correct', assistance: 'independent', feedback: 'Checked', answerEvidence: 'Verified', assessedAt: SUMMARY_NOW }))
  await save('.study/blocks/block-1.json', block)
  expect(queryWorkspace(await readWorkspace(files, new AbortController().signal), { kind: 'summary' }, SUMMARY_NOW)).toMatchObject({ data: { masteredGoals: 0, recoveredGoals: 1, dueCompletion: { done: 1, total: 1 } } })
})

it('cancels a future review opportunity when independent practice advances it before it is due', async () => {
  const { files, block, save } = await workspace()
  await save('.study/collections.json', collectionsSchema.parse({ format: 2, kind: 'collections', termId: 'term-1', mistakes: [{ id: 'm1', subject: 'math', topic: 'Subtraction', prompt: '18 - 7?', learnerAnswer: '10', correction: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', uncertainties: '', objectiveId: 'm2a-o-sub', confirmedAt: Date.parse('2026-11-02T09:00:00+08:00'), userConfirmation: 'Parent confirmed' }], rewards: [], teachingQueue: [] }))
  block.questions[0]!.mistakeId = 'm1'
  block.responses = ['2026-11-03', '2026-11-05', '2026-11-10'].map((day, index) => ({ id: `r${index}`, questionId: 'q1', rawResponse: '11', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual day confirmed' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Confirmed' } }))
  block.assessments = block.responses.map((response, index) => ({ id: `a${index}`, responseId: response.id, result: 'correct', assistance: 'independent', feedback: 'Checked', answerEvidence: 'Verified', assessedAt: SUMMARY_NOW }))
  await save('.study/blocks/block-1.json', block)
  const read = await readWorkspace(files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'summary' }, SUMMARY_NOW)).toMatchObject({ data: { dueCompletion: { done: 0, total: 0 } } })
  expect(queryWorkspace(read, { kind: 'mistakes' }, SUMMARY_NOW)).toMatchObject({ data: { items: [expect.objectContaining({ id: 'm1', stage: 3, dueAt: Date.parse('2026-11-26T00:00:00+08:00') })] } })
})
