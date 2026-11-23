import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { readWorkspace } from '../src/files/read.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { queryWorkspace } from '../src/learning/queries.ts'
import { setup } from './fixtures.ts'
import { collectionsSchema } from '../src/files/schema.ts'

const NOW = Date.parse('2026-11-23T12:00:00+08:00')
const scope = { id: 'within20', description: 'Within twenty', modality: 'written', numberMax: 20 }
async function fixture() {
  const cwd = await mkdtemp(join(tmpdir(), 'student-continuation-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  const save = async (path: string, value: unknown) => { await mkdir(join(cwd, path, '..'), { recursive: true }); await writeFile(join(cwd, path), JSON.stringify(value)) }
  const settings = { format: 2, kind: 'term-settings', learnerId: 'child-1', termId: 'new-term', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const question = { id: 'q1', objectiveId: 'm.count', capability: { goalId: 'm.count', familyId: 'math.count', scope }, source: { kind: 'authored', description: 'Checked problem' }, topic: 'Addition', prompt: '8 + 7?', answer: '15', explanation: 'Make ten', answerEvidence: '8 + 2 + 5 = 15' }
  const block = { format: 2, kind: 'block', learnerId: 'child-1', termId: 'new-term', id: 'current', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile, scope: { grade: 2, term: 'first', objectiveIds: ['m.count'] } }, currentQuestionId: 'q1', questions: [question], responses: [] as object[], hints: [], assessments: [] as object[] }
  const original = { ...block, termId: 'old-term', id: 'original', startedAt: NOW - 40 * 86400000, endedAt: NOW - 20 * 86400000, responses: ['2026-10-01','2026-10-08','2026-10-24'].map((day, i) => ({ id: `r${i}`, questionId: 'q1', rawResponse: '15', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Original actual day confirmed' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Original fact checked' } })), assessments: [0,1,2].map(i => ({ id: `a${i}`, responseId: `r${i}`, result: 'correct', assistance: 'independent', feedback: 'Original correct', criteria: ['basic', 'method', 'variation'], answerEvidence: '8 + 7 = 15', assessedAt: NOW - 20 * 86400000 })) }
  const references = [0,1,2].map(i => ({ learnerId: 'child-1', termId: 'old-term', ownerKind: 'block', ownerId: 'original', responseId: `r${i}`, goalId: 'm.count', scope }))
  await save('.study/settings.json', { ...settings, evidenceReferences: references })
  await save('.study/blocks/current.json', block)
  await save('.study/archives/old-term/settings.json', { ...settings, termId: 'old-term', archivedAt: NOW - 20 * 86400000 })
  await save('.study/archives/old-term/blocks/original.json', original)
  return { cwd, settings, block, original, references, save, files: nodeStudyFiles(cwd) }
}

it('reads explicitly referenced original same-child archives without copying responses and reports unavailable originals', async () => {
  const f = await fixture()
  const first = await readWorkspace(f.files, new AbortController().signal)
  expect(first.status).toBe('valid')
  expect(first.workspace?.archivedEvidence).toHaveLength(1)
  expect(first.workspace?.blocks[0]?.responses).toHaveLength(0)
  expect(first.workspace?.archivedEvidence?.[0]?.workspace.blocks[0]?.responses).toHaveLength(3)
  await f.save('.study/settings.json', { ...f.settings, evidenceReferences: [{ ...f.references[0], ownerId: 'missing' }] })
  const missing = await readWorkspace(f.files, new AbortController().signal)
  expect(missing.status).toBe('valid')
  expect(missing.workspace?.archivedEvidence).toHaveLength(0)
  expect(missing).toMatchObject({ archiveIssues: [expect.objectContaining({ rule: 'archive-reference' })] })
})

it('keeps expanded ranges and missing or cross-child archives from granting higher mastery', async () => {
  const f = await fixture()
  f.block.questions[0]!.capability.scope = { ...scope, id: 'within100', numberMax: 100 }
  await f.save('.study/blocks/current.json', f.block)
  let read = await readWorkspace(f.files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', independentDays: [], baseline: false, level: 'untouched' })]) } })
  await f.save('.study/archives/old-term/settings.json', { ...f.settings, learnerId: 'another-child', termId: 'old-term', archivedAt: NOW })
  read = await readWorkspace(f.files, new AbortController().signal)
  expect(read.archiveIssues).toContainEqual(expect.objectContaining({ rule: 'archive-reference' }))
  expect(read.workspace?.archivedEvidence).toEqual([])
  await rm(join(f.cwd, '.study/archives/old-term'), { recursive: true })
  read = await readWorkspace(f.files, new AbortController().signal)
  expect(read.archiveIssues).toContainEqual(expect.objectContaining({ rule: 'archive-reference' }))
})

it('replays the original review stage and due day across terms and rejects fabricated inherited stages', async () => {
  const f = await fixture()
  const confirmedAt = Date.parse('2026-09-30T09:00:00+08:00')
  const mistake = { id: 'm1', subject: 'math', objectiveId: 'm.count', topic: 'Count', prompt: 'Count objects', learnerAnswer: '6', correction: '7', explanation: 'Count each once', answerEvidence: 'Seven objects', uncertainties: '', confirmedAt, userConfirmation: 'Original confirmed error' }
  await f.save('.study/archives/old-term/collections.json', collectionsSchema.parse({ format: 2, learnerId: 'child-1', kind: 'collections', termId: 'old-term', mistakes: [mistake], rewards: [], teachingQueue: [] }))
  f.original.questions[0]!.mistakeId = 'm1'
  await f.save('.study/archives/old-term/blocks/original.json', f.original)
  const review = { mistakeId: 'm1', stage: 3, dueAt: Date.parse('2026-11-09T00:00:00+08:00'), independentDays: ['2026-10-01', '2026-10-08', '2026-10-24'] }
  await f.save('.study/settings.json', { ...f.settings, evidenceReferences: [{ ...f.references[2], review }] })
  const read = await readWorkspace(f.files, new AbortController().signal)
  expect(read.archiveIssues).toEqual([])
  expect(queryWorkspace(read, { kind: 'mistakes' }, NOW)).toMatchObject({ data: { items: [expect.objectContaining({ id: 'm1', stage: 3, dueAt: review.dueAt, independentDays: review.independentDays })] } })
  await f.save('.study/settings.json', { ...f.settings, evidenceReferences: [{ ...f.references[2], review: { ...review, stage: 4 } }] })
  const fake = await readWorkspace(f.files, new AbortController().signal)
  expect(fake.archiveIssues).toContainEqual(expect.objectContaining({ rule: 'archive-review' }))
  expect(queryWorkspace(fake, { kind: 'mistakes' }, NOW)).toMatchObject({ data: { items: [] } })
})

it('offers only missing criteria with a three-question ceiling and leaves original unknown facts untouched', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', f.settings)
  f.block.responses = [{ id: 'now-r', questionId: 'q1', rawResponse: '15', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Answer only confirmed' } }]
  f.block.assessments = [{ id: 'now-a', responseId: 'now-r', result: 'correct', assistance: 'unknown', feedback: 'Sum correct; method still missing', answerEvidence: '15', criteria: ['basic'], assessedAt: NOW }]
  await f.save('.study/blocks/current.json', f.block)
  const context = queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'learning-context' }, NOW)
  expect(context).toMatchObject({ data: { nextAction: { kind: 'supplement', supplement: { maxNewQuestions: 3, remaining: 2, missingCriteria: [{ familyId: 'math.count', criteria: ['method', 'variation'] }] } }, savedResponse: { assistance: 'unknown', answerDate: { kind: 'unknown' } }, goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', independentDays: [] })]) } })
  f.block.questions.push({ ...f.block.questions[0]!, id: 'q2' }, { ...f.block.questions[0]!, id: 'q3' })
  f.block.responses.push(...['q2', 'q3'].map((id, i) => ({ ...f.block.responses[0]!, id: `extra-r${i}`, questionId: id })))
  f.block.assessments.push(...['extra-r0', 'extra-r1'].map((id, i) => ({ ...f.block.assessments[0]!, id: `extra-a${i}`, responseId: id })))
  await f.save('.study/blocks/current.json', f.block)
  expect(queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'learning-context' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'hold' }, savedResponse: { assistance: 'unknown', answerDate: { kind: 'unknown' } } } })
})

it('keeps one cross-term mother through equivalent scope labels and advances only on an actual answer day', async () => {
  const f = await fixture()
  const confirmedAt = Date.parse('2026-09-30T09:00:00+08:00')
  const mistake = { id: 'old-mother', subject: 'math', objectiveId: 'm.count', topic: 'Count', prompt: 'Count objects', learnerAnswer: '6', correction: '7', explanation: 'Count each once', answerEvidence: 'Seven objects', uncertainties: '', confirmedAt, userConfirmation: 'Original confirmed error' }
  f.original.questions = f.original.questions.map(question => ({ ...question, mistakeId: mistake.id }))
  await f.save('.study/archives/old-term/blocks/original.json', f.original)
  await f.save('.study/archives/old-term/collections.json', collectionsSchema.parse({ format: 2, learnerId: 'child-1', kind: 'collections', termId: 'old-term', mistakes: [mistake], rewards: [], teachingQueue: [] }))
  const review = { mistakeId: mistake.id, stage: 3, dueAt: Date.parse('2026-11-09T00:00:00+08:00'), independentDays: ['2026-10-01', '2026-10-08', '2026-10-24'] }
  await f.save('.study/settings.json', { ...f.settings, evidenceReferences: [{ ...f.references[2], review }] })
  const currentMistake = { ...mistake, id: 'current-mother', confirmedAt: NOW - 1000 }
  await f.save('.study/collections.json', collectionsSchema.parse({ format: 2, learnerId: 'child-1', kind: 'collections', termId: 'new-term', mistakes: [currentMistake], rewards: [], teachingQueue: [] }))
  f.block.questions = f.block.questions.map(question => ({ ...question, mistakeId: currentMistake.id, capability: { ...question.capability, scope: { ...scope, id: 'same-range-new-label', description: 'The same twenty objects' } } }))
  f.block.responses = [{ id: 'now-r', questionId: 'q1', rawResponse: '15', assistance: 'independent', answerDate: { kind: 'unknown' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Answer confirmed, day unknown' } }]
  f.block.assessments = [{ id: 'now-a', responseId: 'now-r', result: 'correct', assistance: 'independent', feedback: 'Original answer checked today', criteria: ['basic', 'method', 'variation'], answerEvidence: '15', assessedAt: NOW }]
  await f.save('.study/blocks/current.json', f.block)
  const consume = async () => queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'mistakes' }, NOW)
  expect(await consume()).toMatchObject({ data: { items: [expect.objectContaining({ id: currentMistake.id, confirmedAt, stage: 3, dueAt: review.dueAt, independentDays: review.independentDays })] } })
  f.block.responses = [{ ...f.block.responses[0], answerDate: { kind: 'day', day: '2026-11-23', parentConfirmation: 'Actual answer day now confirmed' } }]
  await f.save('.study/blocks/current.json', f.block)
  expect(await consume()).toMatchObject({ data: { items: [expect.objectContaining({ id: currentMistake.id, stage: 4, dueAt: Date.parse('2026-12-28T00:00:00+08:00'), independentDays: [...review.independentDays, '2026-11-23'] })] } })
  const read = await readWorkspace(f.files, new AbortController().signal)
  expect(read.workspace?.collections?.rewards).toEqual([])
  expect(queryWorkspace(read, { kind: 'mistakes' }, NOW)).toMatchObject({ data: { items: [expect.objectContaining({ id: currentMistake.id, stage: 4 })] } })
})

it('gives assessment and current-error teaching priority over backlog and carries feedback into the official requirement', async () => {
  const f = await fixture()
  f.block.responses = [{ id: 'now-r', questionId: 'q1', rawResponse: '16', assistance: 'independent', answerDate: { kind: 'day', day: '2026-11-23', parentConfirmation: 'Actual day' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Actual answer' } }]
  await f.save('.study/blocks/current.json', f.block)
  expect(queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'learning-context', subject: 'english' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'assess', reason: 'pending-assessment', subject: 'math', responseId: 'now-r' } } })
  f.block.assessments = [{ id: 'now-a', responseId: 'now-r', result: 'incorrect', assistance: 'independent', feedback: 'Counted one object twice', errorType: 'calculation', answerEvidence: 'Seven objects', assessedAt: NOW }]
  await f.save('.study/blocks/current.json', f.block)
  const next = (queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'learning-context' }, NOW).data as { nextAction: { requirement: string } }).nextAction
  expect(JSON.parse(next.requirement)).toMatchObject({ action: 'teach', feedback: expect.arrayContaining([expect.objectContaining({ result: 'incorrect', feedback: 'Counted one object twice', errorType: 'calculation' })]) })
})

it('continues a known same-range goal gap after the selected variation is answered instead of requesting a new range', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', f.settings)
  f.block.questions.push({ ...f.block.questions[0]!, id: 'q2', prompt: '9 + 5?', answer: '14' })
  f.block.currentQuestionId = 'q2'
  f.block.responses = [
    { id: 'old-error', questionId: 'q1', rawResponse: '16', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Original answer confirmed, date and help unknown.' } },
    { id: 'variant', questionId: 'q2', rawResponse: '14', assistance: 'independent', answerDate: { kind: 'day', day: '2026-11-23', parentConfirmation: 'Actual answer day.' }, source: { kind: 'manual', entry: 'current', parentConfirmation: 'Actual variant answer.' } },
  ]
  f.block.assessments = [
    { id: 'old-a', responseId: 'old-error', result: 'incorrect', assistance: 'unknown', feedback: 'Original counted sum differs by one.', criteria: ['basic'], answerEvidence: '8+7=15', assessedAt: NOW },
    { id: 'variant-a', responseId: 'variant', result: 'correct', assistance: 'independent', feedback: 'Checks the sum, method and constrained variation.', criteria: ['basic', 'method', 'variation'], answerEvidence: '9+1+4=14', assessedAt: NOW },
  ]
  await f.save('.study/blocks/current.json', f.block)
  const read = await readWorkspace(f.files, new AbortController().signal)
  const result = queryWorkspace(read, { kind: 'learning-context', subject: 'english' }, NOW)
  expect(result).toMatchObject({ data: { nextAction: { kind: 'teach', reason: 'current-gap', goalId: 'm.count', scope, subject: 'math' }, goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', level: 'weak', missingCriteria: [], independentDays: ['2026-11-23'] })]) } })
})

it('ends the two-mother review round before confirmed new learning even with remaining backlog', async () => {
  const f = await fixture()
  const newQuestion = { ...f.block.questions[0]!, id: 'new-q', objectiveId: 'm.zero', capability: { goalId: 'm.zero', familyId: 'math.zero', scope } }
  f.block.questions.push(newQuestion)
  f.block.context.scope.objectiveIds.push('m.zero')
  f.block.endedAt = NOW - 10000
  await f.save('.study/blocks/current.json', f.block)
  const mistakes = ['m.zero', 'm.compose', 'm.place'].map((goal, i) => ({ id: `mistake${i}`, subject: 'math', objectiveId: goal, topic: goal, prompt: 'Original problem', learnerAnswer: 'wrong', correction: 'correct', explanation: 'Check the criterion', answerEvidence: 'Original criterion', uncertainties: '', confirmedAt: NOW - 10 * 86400000, userConfirmation: 'Parent confirmed' }))
  await f.save('.study/collections.json', collectionsSchema.parse({ format: 2, kind: 'collections', learnerId: 'child-1', termId: 'new-term', mistakes, rewards: [], teachingQueue: [] }))
  const consume = async () => queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'learning-context', subject: 'math' }, NOW)
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'review', review: { remaining: 2 } }, reviewRound: { limit: 2, remaining: 2 } } })
  for (const [i, familyId] of ['math.zero', 'math.compose'].entries()) {
    const question = { ...newQuestion, id: `review-q${i}`, objectiveId: mistakes[i]!.objectiveId, mistakeId: mistakes[i]!.id, capability: { goalId: mistakes[i]!.objectiveId, familyId, scope } }
    const review = { ...f.block, context: { ...f.block.context, scope: { ...f.block.context.scope, objectiveIds: [question.objectiveId] } }, id: `review${i}`, mode: 'review', startedAt: NOW - 9000 + i * 2000, endedAt: NOW - 8000 + i * 2000, currentQuestionId: question.id, questions: [question], responses: [{ id: `review-r${i}`, questionId: question.id, rawResponse: 'wrong', assistance: 'independent', answerDate: { kind: 'day', day: '2026-11-23', parentConfirmation: 'Actual day' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Original answer' } }], assessments: [{ id: `review-a${i}`, responseId: `review-r${i}`, result: 'incorrect', assistance: 'independent', feedback: 'Review found a place-value gap', answerEvidence: 'Original criterion', assessedAt: NOW - 8000 + i * 2000 }] }
    await f.save(`.study/blocks/review${i}.json`, review)
  }
  // A new confirmed goal remains available while review errors stay in their original mothers.
  const secondNew = { ...newQuestion, id: 'new-compare', objectiveId: 'm.compare', capability: { goalId: 'm.compare', familyId: 'math.compare', scope } }
  f.block.questions.push(secondNew); f.block.context.scope.objectiveIds.push('m.compare')
  await f.save('.study/blocks/current.json', f.block)
  const after = await consume()
  expect(after).toMatchObject({ data: { nextAction: { kind: 'learn', goalId: 'm.compare', reason: 'new-goal' }, reviewRound: { remaining: 0, usedFamilyIds: ['math.compose', 'math.zero'] } } })
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'learn', goalId: 'm.compare' }, reviewRound: { remaining: 0 } } })
})

it('keeps three actual days distinct, reports first mastery once and retains prior mastery when moving terms', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', f.settings)
  f.block.responses = ['2026-11-19', '2026-11-19', '2026-11-20'].map((day, i) => ({ id: `r${i}`, questionId: 'q1', rawResponse: '15', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual answer day' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Verified response' } }))
  f.block.assessments = [0,1,2].map(i => ({ id: `a${i}`, responseId: `r${i}`, result: 'correct', assistance: 'independent', criteria: ['basic', 'method', 'variation'], feedback: 'Checked all criteria', answerEvidence: 'Original method and variant', assessedAt: NOW }))
  await f.save('.study/blocks/current.json', f.block)
  let read = await readWorkspace(f.files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', independentDays: ['2026-11-19', '2026-11-20'], level: 'due' })]) } })
  expect(queryWorkspace(read, { kind: 'summary' }, NOW)).toMatchObject({ data: { masteredGoals: 0 } })
  f.block.responses.push({ ...f.block.responses[0]!, id: 'r3', answerDate: { kind: 'day', day: '2026-11-21', parentConfirmation: 'Third actual day' } })
  f.block.assessments.push({ ...f.block.assessments[0]!, id: 'a3', responseId: 'r3' })
  await f.save('.study/blocks/current.json', f.block)
  read = await readWorkspace(f.files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'summary' }, NOW)).toMatchObject({ data: { masteredGoals: 1, recoveredGoals: 0 } })
  expect(queryWorkspace(read, { kind: 'summary' }, NOW)).toMatchObject({ data: { masteredGoals: 1, recoveredGoals: 0 } })
  const archived = { ...f.block, termId: 'old-term', id: 'original', endedAt: NOW - 1 }
  await f.save('.study/archives/old-term/blocks/original.json', archived)
  await f.save('.study/archives/old-term/settings.json', { ...f.settings, termId: 'old-term', archivedAt: NOW - 1 })
  f.block.responses = []; f.block.assessments = []
  await f.save('.study/blocks/current.json', { ...f.block, id: 'replacement' })
  await rm(join(f.cwd, '.study/blocks/current.json'))
  await f.save('.study/blocks/replacement.json', { ...f.block, id: 'replacement' })
  await f.save('.study/settings.json', { ...f.settings, evidenceReferences: archived.responses.map(response => ({ ...f.references[0], responseId: response.id })) })
  read = await readWorkspace(f.files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'summary' }, NOW)).toMatchObject({ data: { masteredGoals: 0, recoveredGoals: 0 } })
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', baseline: true, firstMasteredDay: '2026-11-21' })]) } })
})

it('continues a verified compatible baseline and invalidates it when the original grade changes', async () => {
  const f = await fixture()
  const read = await readWorkspace(f.files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: {
    goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', level: 'mastered', independentDays: ['2026-10-01', '2026-10-08', '2026-10-24'], firstMasteredDay: '2026-10-24', baseline: true })]),
    nextAction: { kind: 'answer', reason: 'unfinished-question', blockId: 'current', questionId: 'q1' },
  } })
  f.original.assessments[2]!.result = 'incorrect'
  await f.save('.study/archives/old-term/blocks/original.json', f.original)
  expect(queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'learning-context' }, NOW)).toMatchObject({ data: {
    goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', level: 'due', independentDays: ['2026-10-01', '2026-10-08'], baseline: false })]),
  } })
})

it('does not borrow future method or variation evidence at an earlier query cutoff', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', f.settings)
  f.block.responses = ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-24'].map((day, i) => ({ id: `r${i}`, questionId: 'q1', rawResponse: '15', assistance: 'independent', answerDate: { kind: 'day', day, parentConfirmation: 'Actual answer day' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Original answer' } }))
  f.block.assessments = [0, 1, 2, 3].map(i => ({ id: `a${i}`, responseId: `r${i}`, result: 'correct', assistance: 'independent', feedback: 'Checked criterion', criteria: i === 3 ? ['method', 'variation'] : ['basic'], answerEvidence: 'Original solution', assessedAt: NOW }))
  await f.save('.study/blocks/current.json', f.block)
  const read = await readWorkspace(f.files, new AbortController().signal)
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', level: 'practising', independentDays: ['2026-11-19', '2026-11-20', '2026-11-21'], missingCriteria: [{ familyId: 'math.count', criteria: ['method', 'variation'] }] })]) } })
})

it.each([{ familyId: 'math.sub-basic', numberMax: 100 }, { familyId: 'math.sub-column', numberMax: 1000 }])('keeps an original frozen mother stage for incompatible review target $familyId/$numberMax', async ({ familyId, numberMax }) => {
  const f = await fixture()
  await f.save('.study/settings.json', f.settings)
  const confirmedAt = NOW - 2 * 86400000
  const mother = { id: 'original-subtraction', subject: 'math', objectiveId: 'm.sub', topic: 'Column subtraction', prompt: '62 − 28 using columns?', learnerAnswer: '44', correction: '34', explanation: 'Borrow one ten', answerEvidence: '62 − 28 = 34', uncertainties: '', confirmedAt, userConfirmation: 'Original column error confirmed' }
  await f.save('.study/collections.json', collectionsSchema.parse({ format: 2, learnerId: 'child-1', kind: 'collections', termId: 'new-term', mistakes: [mother], rewards: [], teachingQueue: [] }))
  const columnScope = { ...scope, id: 'column100', numberMax: 100 }
  const original = { ...f.block.questions[0]!, id: 'column-original', objectiveId: 'm.sub', mistakeId: mother.id, capability: { goalId: 'm.sub', familyId: 'math.sub-column', scope: columnScope }, topic: mother.topic, prompt: mother.prompt, answer: mother.correction, explanation: mother.explanation, answerEvidence: mother.answerEvidence }
  const response = { id: 'original-wrong', questionId: original.id, rawResponse: '44', assistance: 'independent', answerDate: { kind: 'day', day: '2026-11-20', parentConfirmation: 'Original day' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Original answer' } }
  const targetScope = { ...columnScope, id: `target-${numberMax}`, numberMax }
  const next = { ...original, id: 'new-variant', prompt: '51 − 20?', answer: '31', answerEvidence: '51 − 20 = 31', capability: { goalId: 'm.sub', familyId, scope: targetScope } }
  const current = { ...f.block, context: { profile: setup.profile, scope: { grade: 2, term: 'first', objectiveIds: ['m.sub'] } }, currentQuestionId: next.id, currentResponseId: 'new-correct', questions: [original, next], responses: [response, { ...response, id: 'new-correct', questionId: next.id, rawResponse: '31', answerDate: { kind: 'day', day: '2026-11-23', parentConfirmation: 'Actual new day' } }], assessments: [{ id: 'old-grade', responseId: response.id, result: 'incorrect', assistance: 'independent', feedback: 'Original column error', answerEvidence: original.answerEvidence, assessedAt: confirmedAt }, { id: 'new-grade', responseId: 'new-correct', result: 'correct', assistance: 'independent', feedback: 'New answer correct in its own target', answerEvidence: next.answerEvidence, assessedAt: NOW }] }
  await f.save('.study/blocks/current.json', current)
  const read = await readWorkspace(f.files, new AbortController().signal)
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'mistakes' }, NOW)).toMatchObject({ data: { items: [expect.objectContaining({ id: mother.id, stage: 0, independentDays: [], dueAt: Date.parse('2026-11-22T00:00:00+08:00') })] } })
})
