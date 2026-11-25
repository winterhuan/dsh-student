import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { readWorkspace } from '../src/files/read.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { queryWorkspace } from '../src/learning/queries.ts'
import { dailyPlanSchema, blockSchema, termSettingsSchema } from '../src/files/schema.ts'
import type { DailyLearning } from '../src/learning/daily.ts'
import { setup } from './fixtures.ts'

const NOW = Date.parse('2026-11-25T12:00:00+08:00'), DAY = 86400000
const scope = { id: 'within20', description: 'Within twenty', modality: 'written' as const, numberMax: 20 }
async function fixture() {
  const cwd = await mkdtemp(join(tmpdir(), 'student-daily-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const save = async (path: string, value: unknown) => { await mkdir(join(cwd, path, '..'), { recursive: true }); await writeFile(join(cwd, path), JSON.stringify(value)) }
  const settings = termSettingsSchema.parse({ format: 2, kind: 'term-settings', learnerId: 'child', termId: 'term', revision: 1, updatedAt: NOW - DAY, profile: setup.profile, materials: [], courses: [], learningScopes: [{ subject: 'math', goalIds: ['m.count', 'm.zero'], scope, parentConfirmation: 'Confirm counting within twenty.' }] })
  const block = blockSchema.parse({ format: 2, kind: 'block', learnerId: 'child', termId: 'term', id: 'counting', subject: 'math', mode: 'foundation', startedAt: NOW - 1000, context: { profile: setup.profile }, currentQuestionId: 'q', questions: [{ id: 'q', objectiveId: 'm.count', capability: { goalId: 'm.count', familyId: 'math.count', scope }, source: { kind: 'authored', description: 'Checked counting' }, topic: 'Counting', prompt: 'How many: ● ● ●?', answer: '3', explanation: 'Count each object once.', answerEvidence: 'Three objects' }], responses: [], assessments: [], hints: [] })
  await save('.study/settings.json', settings)
  const fs = nodeStudyFiles(cwd)
  const read = (now = NOW) => readWorkspace(fs, new AbortController().signal, undefined, [], [], { now })
  const daily = async (now = NOW) => { const result = queryWorkspace(await read(now), { kind: 'daily-plan' }, now); expect(result.issues).toEqual([]); return result.data as DailyLearning }
  function answer(result: 'correct' | 'incorrect', day = '2026-11-25') {
    block.responses = [{ id: 'r' as typeof block.responses[number]['id'], questionId: 'q', rawResponse: result === 'correct' ? '3' : '4', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual answer day' }, source: { kind: 'manual', entry: 'current', parentConfirmation: 'Child answered' } }]
    block.assessments = [{ id: 'a', responseId: block.responses[0]!.id, result, assistance: 'independent', feedback: result === 'correct' ? 'Counted each object once and checked a variation.' : 'Counted one object twice.', criteria: ['basic', 'method', 'variation'], answerEvidence: 'Three objects', assessedAt: NOW }]
  }
  return { cwd, settings, block, save, fs, read, daily, answer }
}

it('uses the existing profile for unconfigured subjects without writing confirmations or claiming weakness', async () => {
  const f = await fixture()
  const before = await f.read(), first = await f.daily(), second = await f.daily()
  expect(first.preview).toMatchObject({ id: 'day-2026-11-25', subjects: ['math'], tasks: [{ purpose: 'diagnostic', goalId: 'm.count', state: 'ready' }] })
  expect(first.missingSubjects).toEqual([])
  expect(first.suggestions.map(item => item.task.subject)).toEqual(expect.arrayContaining(['chinese', 'math', 'english']))
  expect(second.preview?.tasks.map(task => task.id)).toEqual(first.preview?.tasks.map(task => task.id))
  expect((await f.read()).files.map(file => file.version)).toEqual(before.files.map(file => file.version))
})

it('starts a grade-based plan without requiring new learning-scope confirmations', async () => {
  const f = await fixture()
  delete f.settings.learningScopes
  await f.save('.study/settings.json', f.settings)
  const before = (await f.read()).files.map(file => file.version)
  const daily = await f.daily()
  expect(daily.missingSubjects).toEqual([])
  expect(daily.recommended[0]?.task.purpose).toBe('diagnostic')
  expect((await f.read()).files.map(file => file.version)).toEqual(before)
  const plan = dailyPlanSchema.parse(daily.preview)
  await f.save(`.study/plans/${plan.day}.json`, plan)
  expect((await f.read()).issues).toEqual([])
  expect((await f.read()).workspace?.settings.learningScopes).toBeUndefined()
})

it('retains the explicit start time when preparing the plan takes longer than the click', async () => {
  const f = await fixture()
  const plan = dailyPlanSchema.parse((await f.daily()).preview)
  plan.createdAt = NOW + 60_000; plan.updatedAt = plan.createdAt
  await f.save(`.study/plans/${plan.day}.json`, plan)
  expect((await f.read()).issues).toEqual([])
  expect((await f.daily()).saved?.choices[0]?.at).toBe(NOW)
})

it('retains ended weak goals and distinguishes progression from long-term mastery', async () => {
  const f = await fixture()
  f.answer('incorrect'); f.block.endedAt = NOW
  await f.save('.study/blocks/counting.json', f.block)
  expect((await f.daily()).recommended[0]).toMatchObject({ task: { purpose: 'teaching', goalId: 'm.count' }, nextAction: { reason: 'current-gap' } })
  // A separate learner with the same scope and a verified successful check can progress.
  const other = await fixture(); other.answer('correct'); other.block.endedAt = NOW
  await other.save('.study/blocks/counting.json', other.block)
  expect((await other.daily()).recommended[0]).toMatchObject({ task: { goalId: 'm.zero', purpose: 'diagnostic' } })
  expect(queryWorkspace(await other.read(), { kind: 'capability-progress', subject: 'math' }, NOW).data).toContainEqual(expect.objectContaining({ id: 'm.count', level: 'practising', independentDays: ['2026-11-25'] }))
})

it('restores the same plan, question and response across fresh readers and midnight without writing a new plan', async () => {
  const f = await fixture()
  const plan = dailyPlanSchema.parse((await f.daily()).preview)
  plan.state = 'active'; plan.tasks[0]!.state = 'active'; plan.tasks[0]!.activity = { blockId: f.block.id, questionId: 'q' }
  f.block.plan = { day: plan.day, taskId: plan.tasks[0]!.id }
  await f.save('.study/plans/2026-11-25.json', plan); await f.save('.study/blocks/counting.json', f.block)
  const next = queryWorkspace(await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal, [], [], [], { now: NOW + DAY }), { kind: 'daily-plan' }, NOW + DAY).data as DailyLearning
  expect(next).toMatchObject({ phase: 'learning', saved: { day: '2026-11-25', tasks: [{ activity: { blockId: 'counting', questionId: 'q' } }] } })
  expect((await f.read(NOW + DAY)).files.filter(file => file.file?.kind === 'daily-plan')).toHaveLength(1)
})

it('preserves closed plans and original completion when extra learning is explicitly appended', async () => {
  const f = await fixture(); f.answer('correct'); f.block.endedAt = NOW
  const plan = dailyPlanSchema.parse((await f.daily()).preview)
  plan.state = 'completed'; plan.completedAt = NOW; plan.tasks[0]!.state = 'completed'; plan.tasks[0]!.activity = { blockId: f.block.id, questionId: 'q' }
  plan.tasks[0]!.outcomes = [{ termId: f.settings.termId, ownerKind: 'block', ownerId: f.block.id, responseId: f.block.responses[0]!.id }]
  await f.save('.study/blocks/counting.json', f.block); await f.save('.study/plans/2026-11-25.json', plan)
  const first = await f.daily(); expect(first.phase).toBe('summary')
  const extra = first.suggestions.find(item => item.task.goalId === 'm.zero')!.task
  plan.revision++; plan.tasks.push({ ...extra, optional: true }); plan.choices.push({ id: 'extra', action: 'extra', at: NOW, revision: plan.revision, reason: 'Child chose a little more.', taskIds: [extra.id], replacedTaskIds: [] })
  await f.save('.study/plans/2026-11-25.json', plan)
  expect((await f.daily()).saved).toMatchObject({ state: 'completed', completedAt: NOW, tasks: [expect.objectContaining({ state: 'completed' }), expect.objectContaining({ optional: true })] })
  const optionalBlock = blockSchema.parse({ ...f.block, id: 'optional-zero', endedAt: undefined, plan: { day: plan.day, taskId: extra.id }, currentQuestionId: 'zero', questions: [{ ...f.block.questions[0]!, id: 'zero', objectiveId: 'm.zero', capability: { goalId: 'm.zero', familyId: extra.familyIds[0], scope: extra.scope } }], responses: [], assessments: [], hints: [] })
  plan.revision++; plan.tasks[1]!.state = 'paused'; plan.tasks[1]!.activity = { blockId: optionalBlock.id, questionId: 'zero' }
  plan.choices.push({ id: 'pause-extra', action: 'pause', at: NOW, revision: plan.revision, reason: 'Child paused the optional activity', taskIds: [extra.id], replacedTaskIds: [] })
  await f.save('.study/blocks/optional-zero.json', optionalBlock); await f.save('.study/plans/2026-11-25.json', plan)
  expect(await f.daily()).toMatchObject({ phase: 'summary', saved: { state: 'completed', completedAt: NOW, tasks: [expect.objectContaining({ state: 'completed' }), expect.objectContaining({ state: 'paused' })] } })
})

it('rejects fabricated completion and missing activity references while preserving original answers', async () => {
  const f = await fixture(); f.answer('incorrect'); await f.save('.study/blocks/counting.json', f.block)
  const plan = dailyPlanSchema.parse((await f.daily()).preview)
  plan.state = 'completed'; plan.completedAt = NOW; plan.tasks[0]!.state = 'completed'; plan.tasks[0]!.activity = { blockId: 'missing' as typeof f.block.id }
  await f.save('.study/plans/2026-11-25.json', plan)
  const read = await f.read()
  expect(read.status).toBe('invalid'); expect(read.issues).toContainEqual(expect.objectContaining({ rule: 'plan-activity' }))
  expect(read.workspace?.blocks[0]?.responses[0]?.rawResponse).toBe('4')
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ status: 'partial', data: { nextAction: null, legalActions: [], savedResponse: { rawResponse: '4' } } })
})

it('keeps a saved plan without a prepared activity recoverable and rejects revision rollback', async () => {
  const f = await fixture(), plan = dailyPlanSchema.parse((await f.daily()).preview)
  await f.save('.study/plans/2026-11-25.json', plan)
  expect((await f.daily()).tasks[0]?.preparationIncomplete).toBe(true)
  plan.state = 'stopped'; await f.save('.study/plans/2026-11-25.json', plan)
  expect((await f.read()).issues).toContainEqual(expect.objectContaining({ rule: 'plan-history' }))
})

it('exposes narrowed scopes without replacing active questions or expanding recommendations', async () => {
  const f = await fixture(), plan = dailyPlanSchema.parse((await f.daily()).preview)
  plan.state = 'active'; plan.tasks[0]!.state = 'active'; plan.tasks[0]!.activity = { blockId: f.block.id, questionId: 'q' }
  await f.save('.study/plans/2026-11-25.json', plan); await f.save('.study/blocks/counting.json', f.block)
  f.settings.updatedAt = NOW + 1; f.settings.learningScopes![0]!.goalIds = ['m.zero']
  await f.save('.study/settings.json', f.settings)
  const daily = await f.daily(NOW + 2)
  expect(daily.tasks[0]?.invalidScope).toBe(true)
  expect(daily.saved?.tasks[0]?.activity?.questionId).toBe('q')
})

it('limits plan metadata and individual file sizes without deleting learning evidence', async () => {
  const f = await fixture(); await f.save('.study/blocks/counting.json', f.block)
  await f.save('.study/plans/2026-11-25.json', { padding: 'x'.repeat(1_048_576) })
  expect((await f.read()).issues).toContainEqual(expect.objectContaining({ rule: 'plan-size' }))
  expect((await f.read()).workspace?.blocks[0]?.id).toBe('counting')
})

it('validates completed native arrangements structurally without granting unauthenticated mastery', async () => {
  const f = await fixture(), plan = dailyPlanSchema.parse((await f.daily()).preview)
  f.answer('correct'); f.block.endedAt = NOW
  f.block.responses[0]!.source = { kind: 'native', sessionId: 'native-session', messageId: 'original', inputVersion: 'one' }
  plan.state = 'completed'; plan.completedAt = NOW; plan.tasks[0]!.state = 'completed'
  plan.tasks[0]!.activity = { blockId: f.block.id, questionId: 'q' }
  plan.tasks[0]!.outcomes = [{ termId: f.settings.termId, ownerKind: 'block', ownerId: f.block.id, responseId: f.block.responses[0]!.id }]
  await f.save('.study/blocks/counting.json', f.block); await f.save('.study/plans/2026-11-25.json', plan)
  expect((await f.read()).status).toBe('valid')
  expect((await f.daily()).summary).toMatchObject([{ independent: 0, pending: 1 }])
  plan.revision++; plan.state = 'active'; plan.tasks[0]!.state = 'active'
  await f.save('.study/plans/2026-11-25.json', plan)
  expect((await f.read()).issues).toContainEqual(expect.objectContaining({ rule: 'plan-history' }))
})

it('rejects new unconfirmed activities and out-of-scope additions while retaining the original answers', async () => {
  const f = await fixture(), plan = dailyPlanSchema.parse((await f.daily()).preview)
  plan.state = 'active'; plan.tasks[0]!.state = 'active'; plan.tasks[0]!.scope = { ...scope, numberMax: 100 }
  await f.save('.study/plans/2026-11-25.json', plan)
  expect((await f.read()).issues).toContainEqual(expect.objectContaining({ rule: 'plan-scope' }))
  plan.tasks[0]!.scope = scope; plan.tasks[0]!.activity = { blockId: f.block.id, questionId: 'q' }
  f.answer('correct'); await f.save('.study/blocks/counting.json', f.block); await f.save('.study/plans/2026-11-25.json', plan)
  expect((await f.read()).status).toBe('valid')
  f.settings.updatedAt = NOW + 1; f.settings.learningScopes![0]!.goalIds = ['m.zero']
  await f.save('.study/settings.json', f.settings)
  expect((await f.read()).status).toBe('valid')
  f.block.questions.push({ ...f.block.questions[0]!, id: 'out-of-scope' }); await f.save('.study/blocks/counting.json', f.block)
  const invalid = await f.read()
  expect(invalid.issues).toContainEqual(expect.objectContaining({ rule: 'plan-scope' }))
  expect(invalid.workspace?.blocks[0]?.responses).toHaveLength(1)
})

it('reports actual answer days across midnight while retaining the original plan', async () => {
  const f = await fixture(), plan = dailyPlanSchema.parse((await f.daily()).preview)
  plan.state = 'active'; plan.tasks[0]!.state = 'active'; plan.tasks[0]!.activity = { blockId: f.block.id, questionId: 'q' }
  f.block.plan = { day: plan.day, taskId: plan.tasks[0]!.id }; f.answer('correct', '2026-11-26')
  await f.save('.study/plans/2026-11-25.json', plan); await f.save('.study/blocks/counting.json', f.block)
  const next = await f.daily(NOW + DAY)
  expect(next.saved?.day).toBe('2026-11-25')
  expect(next.summary).toMatchObject([{ subject: 'math', attempted: 1, independent: 1 }])
})

it('shows the original arrangement summary when an activity finishes after midnight', async () => {
  const f = await fixture(), plan = dailyPlanSchema.parse((await f.daily()).preview)
  f.answer('correct', '2026-11-26'); f.block.endedAt = NOW + DAY
  f.block.assessments[0]!.assessedAt = NOW + DAY
  f.block.plan = { day: plan.day, taskId: plan.tasks[0]!.id }
  plan.state = 'completed'; plan.completedAt = NOW + DAY; plan.updatedAt = NOW + DAY
  plan.tasks[0]!.state = 'completed'; plan.tasks[0]!.activity = { blockId: f.block.id, questionId: 'q' }
  plan.tasks[0]!.outcomes = [{ termId: f.settings.termId, ownerKind: 'block', ownerId: f.block.id, responseId: f.block.responses[0]!.id }]
  await f.save(`.study/plans/${plan.day}.json`, plan); await f.save('.study/blocks/counting.json', f.block)
  const closed = await f.daily(NOW + DAY)
  expect(closed).toMatchObject({ phase: 'summary', saved: { day: '2026-11-25', state: 'completed' }, summary: [{ subject: 'math', attempted: 1 }] })
  // A late factual update cannot keep yesterday's closure as today's entry state.
  plan.revision++; plan.updatedAt = NOW + 2 * DAY
  await f.save(`.study/plans/${plan.day}.json`, plan)
  expect(await f.daily(NOW + 2 * DAY)).toMatchObject({ phase: 'home', saved: null })
})

it('carries an activity directly across several days with one current owner', async () => {
  const f = await fixture(), original = dailyPlanSchema.parse((await f.daily()).preview)
  const task = original.tasks[0]!
  original.state = 'active'; task.state = 'active'; task.activity = { blockId: f.block.id, questionId: 'q' }
  f.block.plan = { day: original.day, taskId: task.id }
  await f.save('.study/blocks/counting.json', f.block); await f.save(`.study/plans/${original.day}.json`, original)
  expect((await f.read()).status).toBe('valid')
  const carried = structuredClone(original)
  carried.id = 'day-2026-11-27'; carried.day = '2026-11-27'; carried.createdAt = NOW + 2 * DAY; carried.updatedAt = carried.createdAt
  carried.choices = [{ id: 'carry', at: carried.createdAt, revision: 1, action: 'carry', reason: 'Continue after two days', taskIds: [task.id], replacedTaskIds: [] }]
  carried.tasks[0]!.original = { day: original.day, taskId: task.id }
  original.state = 'stopped'; original.revision++; original.updatedAt = carried.createdAt; task.state = 'carried-forward'; task.carriedTo = { day: carried.day, taskId: task.id }
  f.block.plan = { day: carried.day, taskId: task.id }
  await f.save(`.study/plans/${original.day}.json`, original); await f.save(`.study/plans/${carried.day}.json`, carried); await f.save('.study/blocks/counting.json', f.block)
  const read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal, [], [], [], { now: NOW + 3 * DAY })
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'daily-plan' }, NOW + 3 * DAY).data).toMatchObject({ saved: { day: carried.day, tasks: [{ original: { day: original.day, taskId: task.id }, activity: { blockId: f.block.id, questionId: 'q' } }] } })
  original.tasks[0]!.original = { day: '2026-11-24', taskId: task.id }
  await f.save(`.study/plans/${original.day}.json`, original)
  expect((await f.read(NOW + 3 * DAY)).issues).toContainEqual(expect.objectContaining({ rule: 'plan-transfer' }))
})

it('retains original blocks when plan count or total metadata exceeds its limit', async () => {
  const f = await fixture(); f.answer('correct'); await f.save('.study/blocks/counting.json', f.block)
  const originalList = f.fs.list.bind(f.fs), originalStat = f.fs.stat.bind(f.fs)
  f.fs.list = async (path, signal) => path === '.study/plans' ? Array.from({ length: 1001 }, (_, i) => ({ name: `${String(1000 + i)}-01-01.json`, type: 'file' as const })) : originalList(path, signal)
  f.fs.stat = async (path, signal) => path.startsWith('.study/plans/') ? { type: 'file', size: 1_048_576, version: 'plan-v1' as never, targetKey: path as never } : originalStat(path, signal)
  const read = await f.read()
  expect(read.issues).toContainEqual(expect.objectContaining({ rule: 'collection-limit' }))
  expect(read.issues).toContainEqual(expect.objectContaining({ rule: 'workspace-size', path: '.study/plans' }))
  expect(read.workspace?.blocks[0]?.responses[0]?.rawResponse).toBe('3')
})

it('reuses confirmed books and school progress without per-subject unlocking', async () => {
  const f = await fixture()
  const subjects = ['chinese', 'math', 'english'] as const
  const units = { chinese: 'c2a-u4', math: 'm2a-u-shop', english: 'e2a-u4' }
  const materials = subjects.map(subject => ({ id: `book-${subject}`, subject, scope: { region: setup.profile.region, grade: setup.profile.grade, term: setup.profile.term, schoolYear: setup.profile.schoolYear, schoolSystem: setup.profile.schoolSystem }, title: 'Existing book', publisher: 'Publisher', edition: 'Confirmed edition', editionStatus: 'identified', kind: 'official-textbook', locator: 'Current page', evidence: 'Parent checked this book' }))
  const courses = subjects.map(subject => ({ subject, materialId: `book-${subject}`, unit: units[subject], parentConfirmation: 'Already confirmed school unit', progress: { unitId: units[subject], confirmedAt: NOW - DAY, posture: 'keep-up', preview: false, pace: 'teaching' } }))
  await f.save('.study/settings.json', { ...f.settings, learningScopes: undefined, materials, courses })
  const before = await f.read(), daily = await f.daily()
  expect(daily.missingSubjects).toEqual([])
  expect(daily.suggestions.map(item => [item.task.subject, item.task.goalId])).toEqual([['chinese', 'c.character'], ['math', 'm.money'], ['english', 'e.word-form']])
  expect(daily.scopeSuggestions.find(item => item.subject === 'math')?.scope.id).toContain('m2a-o-shop')
  await f.save(`.study/plans/${daily.preview!.day}.json`, daily.preview)
  const after = await f.read()
  expect(after.issues).toEqual([])
  expect(after.workspace!.settings).toEqual(before.workspace!.settings)
})

it('continues evidence in its original range when no extra family range was configured', async () => {
  const f = await fixture()
  delete f.settings.learningScopes
  await f.save('.study/settings.json', f.settings)
  f.answer('incorrect'); f.block.endedAt = NOW
  await f.save('.study/blocks/counting.json', f.block)
  const daily = await f.daily()
  expect(daily.recommended[0]).toMatchObject({ task: { purpose: 'teaching', goalId: 'm.count', scope }, nextAction: { reason: 'current-gap' } })
})
