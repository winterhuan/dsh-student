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
  expect(context).toMatchObject({ data: { nextAction: { kind: 'supplement', supplement: { maxNewQuestions: 3, remaining: 3, missingCriteria: [{ familyId: 'math.count', criteria: ['method', 'variation'] }] } }, savedResponse: { assistance: 'unknown', answerDate: { kind: 'unknown' } }, goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', independentDays: [] })]) } })
  f.block.questions.push(...['q2', 'q3', 'q4'].map(id => ({ ...f.block.questions[0]!, id })))
  f.block.responses.push(...['q2', 'q3', 'q4'].map((id, i) => ({ ...f.block.responses[0]!, id: `extra-r${i}`, questionId: id })))
  f.block.assessments.push(...['extra-r0', 'extra-r1', 'extra-r2'].map((id, i) => ({ ...f.block.assessments[0]!, id: `extra-a${i}`, responseId: id })))
  await f.save('.study/blocks/current.json', { ...f.block, rounds: [{ id: 'check', kind: 'check', startedAt: NOW, members: [f.block.questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['q2', 'q3', 'q4'] }] })
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
  expect(queryWorkspace(await readWorkspace(f.files, new AbortController().signal), { kind: 'learning-context', subject: 'math' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'assess', reason: 'pending-assessment', subject: 'math', responseId: 'now-r' } } })
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
  const result = queryWorkspace(read, { kind: 'learning-context', subject: 'math' }, NOW)
  expect(result).toMatchObject({ data: { nextAction: { kind: 'teach', reason: 'current-gap', goalId: 'm.count', scope, subject: 'math' }, goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', level: 'weak', missingCriteria: [], independentDays: ['2026-11-23'] })]) } })
})

it('ends the two-mother review round before confirmed new learning even with remaining backlog', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', { ...f.settings, learningScopes: [{ subject: 'math', goalIds: ['m.compare'], scope, parentConfirmation: 'Confirmed next foundation target.' }] })
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

it('retains a check allowance across skipped instances, block changes, midnight and a fresh reader', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', f.settings)
  const questions = ['check-1', 'check-2', 'check-3', 'unpresented-4'].map(id => ({ ...f.block.questions[0]!, id }))
  const round = { id: 'check-round', kind: 'check', startedAt: NOW, members: [questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['check-1', 'check-2', 'check-3'] }
  await f.save('.study/blocks/current.json', { ...f.block, currentQuestionId: 'check-3', questions, rounds: [round] })
  const read = await readWorkspace(f.files, new AbortController().signal)
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { round: { id: round.id, limit: 3, remaining: 0 }, nextAction: { kind: 'answer', questionId: 'check-3', roundId: round.id } } })
  await f.save('.study/blocks/current.json', { ...f.block, endedAt: NOW + 1, currentQuestionId: 'check-3', questions, rounds: [{ ...round, endedAt: NOW + 1, endReason: 'budget-exhausted' }] })
  const restarted = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)
  const result = queryWorkspace(restarted, { kind: 'learning-context', subject: 'math' }, NOW + 86400000)
  expect(result).toMatchObject({ data: { round: { id: round.id, status: 'ended', remaining: 0 }, nextAction: { kind: 'hold', reason: 'check-budget-exhausted' }, legalActions: ['request-teaching', 'switch-block', 'rest'] } })
  expect(result.data).not.toMatchObject({ legalActions: expect.arrayContaining(['next-question']) })
})

it('rejects fourth check instances, removal of entered facts and replacement rounds without new learning', async () => {
  const f = await fixture()
  const questions = ['one', 'two', 'three', 'four'].map(id => ({ ...f.block.questions[0]!, id }))
  const round = { id: 'bounded-check', kind: 'check', startedAt: NOW, members: [questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['one', 'two', 'three'] }
  const block = { ...f.block, currentQuestionId: 'three', questions, rounds: [round] }
  await f.save('.study/blocks/current.json', block)
  expect((await readWorkspace(f.files, new AbortController().signal)).status).toBe('valid')
  await f.save('.study/blocks/current.json', { ...block, rounds: [{ ...round, presentedQuestionIds: ['one', 'two'] }] })
  expect((await readWorkspace(f.files, new AbortController().signal)).issues).toContainEqual(expect.objectContaining({ rule: 'round-history' }))
  await f.save('.study/blocks/current.json', { ...block, currentQuestionId: 'four', rounds: [{ ...round, presentedQuestionIds: ['one', 'two', 'three', 'four'] }] })
  expect((await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)).issues).toContainEqual(expect.objectContaining({ rule: 'round-limit' }))
  await f.save('.study/blocks/current.json', { ...block, endedAt: NOW + 1, rounds: [{ ...round, endedAt: NOW + 1, endReason: 'budget-exhausted' }] })
  await f.save('.study/blocks/replacement.json', { ...block, id: 'replacement', startedAt: NOW + 2, rounds: [{ ...round, id: 'replacement-check', startedAt: NOW + 2, presentedQuestionIds: ['three'] }] })
  expect((await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)).issues).toContainEqual(expect.objectContaining({ rule: 'round-restart' }))
})

it('ends a two-mother round on entry despite skipped and unknown answers, then learns within one confirmed foundation range', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', { ...f.settings, learningScopes: [{ subject: 'math', goalIds: ['m.count', 'm.zero', 'm.compose'], scope, parentConfirmation: 'Confirm written foundation work within twenty without a school book.' }] })
  const zero = { ...f.block.questions[0]!, id: 'zero', objectiveId: 'm.zero', capability: { goalId: 'm.zero', familyId: 'math.zero', scope } }
  const round = { id: 'review-round', kind: 'review', startedAt: NOW, members: [f.block.questions[0]!.capability, zero.capability], enteredFamilyIds: ['math.count', 'math.zero'], presentedQuestionIds: ['q1', 'zero'], endedAt: NOW + 1, endReason: 'budget-exhausted' }
  await f.save('.study/blocks/current.json', { ...f.block, mode: 'review', endedAt: NOW + 1, questions: [f.block.questions[0], zero], context: { profile: setup.profile }, rounds: [round] })
  const consume = async (at: number) => queryWorkspace(await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal), { kind: 'learning-context', subject: 'math' }, at)
  const expected = { data: { nextAction: { kind: 'learn', goalId: 'm.compose', scope }, round: { id: round.id, status: 'ended', remaining: 0 }, reviewRound: { remaining: 0, usedFamilyIds: ['math.count', 'math.zero'] } } }
  expect(await consume(NOW + 100)).toMatchObject(expected)
  expect(await consume(NOW + 86400000)).toMatchObject(expected)
  expect((await consume(NOW + 86400000)).data).not.toMatchObject({ nextAction: { blockId: 'current' } })
  await f.save('.study/settings.json', { ...f.settings, learningScopes: [{ subject: 'math', goalIds: ['m.count', 'm.zero'], scope, parentConfirmation: 'Only these two goals.' }] })
  expect(await consume(NOW + 86400000)).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'no-learnable-goal' }, legalActions: ['switch-block', 'rest', 'more-review'] } })
})

it('preserves pre-reveal credit but rejects independent repeats of the same frozen instance after an answer reveal', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', f.settings)
  const response = { id: 'before', questionId: 'q1', rawResponse: '15', assistance: 'independent', answerDate: { kind: 'day', day: '2026-11-21', parentConfirmation: 'Actual answer day' }, source: { kind: 'manual', entry: 'historical', parentConfirmation: 'Original answer' } }
  const assessment = { id: 'before-a', responseId: response.id, result: 'correct', assistance: 'independent', feedback: 'Correct before seeing any answer.', criteria: ['basic', 'method', 'variation'], answerEvidence: '8 + 7 = 15', assessedAt: NOW }
  const block = { ...f.block, responses: [response], assessments: [assessment], answerReveals: [{ questionId: 'q1', at: NOW - 86400000 }] }
  await f.save('.study/blocks/current.json', block)
  let read = await readWorkspace(f.files, new AbortController().signal)
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', independentDays: ['2026-11-21'] })]) } })
  await f.save('.study/blocks/current.json', { ...block, responses: [...block.responses, { ...response, id: 'after', answerDate: { ...response.answerDate, day: '2026-11-23' } }] })
  read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)
  expect(read.issues).toContainEqual(expect.objectContaining({ rule: 'answer-revealed' }))
  await f.save('.study/blocks/current.json', { ...block, responses: [...block.responses, { ...response, id: 'after', assistance: 'worked-example', answerDate: { ...response.answerDate, day: '2026-11-23' } }], assessments: [...block.assessments, { ...assessment, id: 'after-a', responseId: 'after', assistance: 'worked-example' }] })
  read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { goalProgress: expect.arrayContaining([expect.objectContaining({ id: 'm.count', independentDays: ['2026-11-21'] })]) } })
  await f.save('.study/blocks/current.json', { ...block, answerReveals: [] })
  expect((await readWorkspace(f.files, new AbortController().signal)).issues).toContainEqual(expect.objectContaining({ rule: 'answer-reveal-history' }))
})

it('does not let an unrecorded fourth instance or a new block bypass the existing check', async () => {
  const f = await fixture()
  const questions = ['one', 'two', 'three', 'four'].map(id => ({ ...f.block.questions[0]!, id }))
  const round = { id: 'existing-check', kind: 'check', startedAt: NOW, members: [questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['one', 'two', 'three'] }
  await f.save('.study/blocks/current.json', { ...f.block, questions, currentQuestionId: 'four', rounds: [round] })
  const consume = async () => queryWorkspace(await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal), { kind: 'learning-context' }, NOW + 100)
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'check-budget-exhausted', roundId: round.id } } })
  await f.save('.study/blocks/current.json', { ...f.block, endedAt: NOW + 1, questions, currentQuestionId: 'three', rounds: [{ ...round, endedAt: NOW + 1, endReason: 'budget-exhausted' }] })
  await f.save('.study/blocks/new-block.json', { ...f.block, id: 'new-block', startedAt: NOW + 2 })
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'check-budget-exhausted', roundId: round.id } } })
})

it('requires a current check instance to consume its persisted allowance before answering', async () => {
  const f = await fixture()
  const questions = ['one', 'two'].map(id => ({ ...f.block.questions[0]!, id }))
  const round = { id: 'open-check', kind: 'check', startedAt: NOW, members: [questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['one'] }
  await f.save('.study/blocks/current.json', { ...f.block, questions, currentQuestionId: 'two', rounds: [round] })
  const read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)
  expect(read.issues).toContainEqual(expect.objectContaining({ rule: 'round-presentation' }))
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW).data).toBeUndefined()
  await f.save('.study/blocks/current.json', { ...f.block, questions, currentQuestionId: 'two', rounds: [{ ...round, presentedQuestionIds: ['one', 'two'] }] })
  expect(queryWorkspace(await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal), { kind: 'learning-context' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'answer', questionId: 'two' }, round: { remaining: 1 } } })
})

it('retains observed round ownership when an entire block is removed', async () => {
  const f = await fixture()
  const round = { id: 'saved-review', kind: 'review', startedAt: NOW, members: [f.block.questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['q1'], endedAt: NOW + 1, endReason: 'complete' }
  await f.save('.study/blocks/current.json', { ...f.block, mode: 'review', endedAt: NOW + 1, rounds: [round] })
  const saved = await readWorkspace(f.files, new AbortController().signal)
  expect(saved.status).toBe('valid')
  const prior = saved.files.flatMap(file => file.file ? [{ path: file.path, file: file.file }] : [])
  await rm(join(f.cwd, '.study/blocks/current.json'))
  const read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal, prior)
  expect(read.issues).toContainEqual(expect.objectContaining({ rule: 'round-history' }))
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW).data).toBeUndefined()
})

it('leaves a completed three-instance check for confirmed new learning once its missing criteria are met', async () => {
  const f = await fixture()
  await f.save('.study/settings.json', { ...f.settings, learningScopes: [{ subject: 'math', goalIds: ['m.zero'], scope, parentConfirmation: 'Confirm the next foundation target.' }] })
  const questions = ['one', 'two', 'three'].map(id => ({ ...f.block.questions[0]!, id }))
  const responses = questions.map(question => ({ id: `r-${question.id}`, questionId: question.id, rawResponse: '15', assistance: 'independent', answerDate: { kind: 'day', day: '2026-11-23', parentConfirmation: 'Actual day' }, source: { kind: 'manual', entry: 'current', parentConfirmation: 'Actual child answer' } }))
  const assessments = responses.map(response => ({ id: `a-${response.id}`, responseId: response.id, result: 'correct', assistance: 'independent', feedback: 'The missing criteria are now demonstrated.', answerEvidence: '8 + 2 + 5 = 15', criteria: ['basic', 'method', 'variation'], assessedAt: NOW }))
  const round = { id: 'complete-check', kind: 'check', startedAt: NOW, members: [questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: questions.map(question => question.id), endedAt: NOW + 1, endReason: 'complete' }
  await f.save('.study/blocks/current.json', { ...f.block, questions, responses, assessments, currentQuestionId: 'three', endedAt: NOW + 1, rounds: [round] })
  const read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW + 2)).toMatchObject({ data: { round: { id: round.id, remaining: 0, status: 'ended' }, nextAction: { kind: 'learn', goalId: 'm.zero' } } })
})

it('starts fresh confirmed foundation or school learning without pre-creating questions and respects school posture', async () => {
  const f = await fixture()
  await rm(join(f.cwd, '.study/blocks/current.json'))
  const learningScopes = [{ subject: 'math', goalIds: ['m.sub'], scope, parentConfirmation: 'Confirm subtraction within twenty.' }]
  await f.save('.study/settings.json', { ...f.settings, learningScopes })
  const consume = async () => queryWorkspace(await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal), { kind: 'learning-context' }, NOW)
  expect(await consume()).toMatchObject({ data: { activeQuestions: [], nextAction: { kind: 'learn', goalId: 'm.sub', scope } } })
  const material = { id: 'book', subject: 'math', scope: { region: '上海市', grade: 2, term: 'first', schoolYear: '2026–2027', schoolSystem: 'five-four' }, title: 'Parent book', publisher: 'Publisher', edition: 'Confirmed edition', editionStatus: 'identified', kind: 'official-textbook', locator: 'Current page', evidence: 'Parent checked current book' }
  const course = { subject: 'math', materialId: 'book', unit: 'Current unit', parentConfirmation: 'Confirmed course', progress: { unitId: 'm2a-u-shop', confirmedAt: NOW, posture: 'keep-up', preview: false, pace: 'teaching' } }
  const save = async (progress: object | undefined) => f.save('.study/settings.json', { ...f.settings, materials: [material], courses: [{ ...course, progress }], learningScopes })
  await save(course.progress)
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'no-learnable-goal' } } })
  await save({ ...course.progress, posture: 'catch-up' })
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'learn', goalId: 'm.sub', scope } } })
  await save({ ...course.progress, unitId: 'm2a-u-sub' })
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'learn', goalId: 'm.sub' } } })
  await save({ ...course.progress, pace: 'review' })
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'no-learnable-goal' } } })
  await save(undefined)
  expect(await consume()).toMatchObject({ data: { nextAction: { kind: 'hold' } } })
})

it('requires explicit more-review intent and retains selected members when the browsing subject changes', async () => {
  const f = await fixture()
  const member = f.block.questions[0]!.capability
  const round = { id: 'first-review', kind: 'review', startedAt: NOW, members: [member], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['q1'], endedAt: NOW + 1, endReason: 'complete' }
  await f.save('.study/blocks/current.json', { ...f.block, mode: 'review', endedAt: NOW + 1, rounds: [round] })
  const next = { ...f.block, id: 'more', mode: 'review', startedAt: NOW + 2, currentQuestionId: undefined, rounds: [{ id: 'more-review', kind: 'review', startedAt: NOW + 2, members: [member], enteredFamilyIds: [], presentedQuestionIds: [] }] }
  await f.save('.study/blocks/more.json', next)
  expect((await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)).issues).toContainEqual(expect.objectContaining({ rule: 'round-restart' }))
  await f.save('.study/blocks/more.json', { ...next, rounds: next.rounds.map(round => ({ ...round, moreReview: { afterRoundId: 'first-review', request: 'I want another short review.' } })) })
  const read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'learning-context', subject: 'math' }, NOW + 86400000)).toMatchObject({ data: { nextAction: { kind: 'review', subject: 'math', blockId: 'more', roundId: 'more-review', review: { familyIds: ['math.count'], remaining: 2 } } } })
})

it('holds the current owner for incomplete source reads or incomplete consumption without confusing unknown historical facts', async () => {
  const f = await fixture()
  const read = await readWorkspace(f.files, new AbortController().signal)
  const source = { lessonId: 'lesson', learnerId: 'child-1', termId: 'new-term', blockId: 'current', status: 'unavailable', omitted: 0, failure: 'incomplete-read', reason: 'The original read is incomplete.' }
  Object.assign(read, { sourceVerification: { native: [], openmaic: [source] } })
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'source-unavailable', blockId: 'current', source: { kind: 'openmaic', verification: { failure: 'incomplete-read' } } }, legalActions: ['sync-feedback', 'switch-block', 'rest'] } })
  Object.assign(read, { sourceVerification: { native: [], openmaic: [{ ...source, status: 'available', failure: undefined, consumption: 'pending', pendingCount: 1 }] } })
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'source-pending', blockId: 'current' } } })
  Object.assign(read, { sourceVerification: { native: [], openmaic: [{ ...source, status: 'available', failure: undefined, consumption: 'accepted', pendingCount: 1, conflictCount: 1 }] } })
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'answer', questionId: 'q1' } } })
  Object.assign(read, { sourceVerification: { native: [], openmaic: [{ ...source, blockId: 'another-block' }] } })
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { nextAction: { kind: 'answer', questionId: 'q1' } } })
})

it('retains the paused round owner while its original native answer source is unavailable', async () => {
  const f = await fixture()
  const round = { id: 'paused-check', kind: 'check', startedAt: NOW, members: [f.block.questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['q1'] }
  const response = { id: 'native-r', questionId: 'q1', rawResponse: '15', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: { kind: 'native', sessionId: 'original-session', messageId: 'original-message', inputVersion: 'original-version', receiptAt: NOW } }
  await f.save('.study/blocks/current.json', { ...f.block, endedAt: NOW + 1, rounds: [round], responses: [response] })
  const read = await readWorkspace(nodeStudyFiles(f.cwd), new AbortController().signal)
  expect(read.status).toBe('valid')
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW + 2)).toMatchObject({ data: { nextAction: { reason: 'round-paused', blockId: 'current', roundId: round.id }, legalActions: ['resume-round', 'switch-block', 'rest'] } })
  Object.assign(read, { sourceVerification: { openmaic: [], native: [{ sessionId: 'original-session', status: 'unavailable', reason: 'The original Session cannot be read.' }] } })
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW + 2)).toMatchObject({ data: { nextAction: { kind: 'hold', reason: 'source-unavailable', blockId: 'current', source: { kind: 'native', verification: { sessionId: 'original-session' } } }, legalActions: ['verify-source', 'switch-block', 'rest'] } })
})


it.each(['chinese', 'english'] as const)('keeps Math ownership and round limits out of the selected %s continuation', async subject => {
  const f = await fixture()
  const round = { id: 'math-check', kind: 'check', startedAt: NOW, members: [f.block.questions[0]!.capability], enteredFamilyIds: ['math.count'], presentedQuestionIds: ['q1'] }
  await f.save('.study/blocks/current.json', { ...f.block, endedAt: NOW + 1, rounds: [round] })
  const read = await readWorkspace(f.files, new AbortController().signal)
  read.sourceVerification = { native: [], openmaic: [{ lessonId: 'math-classroom', learnerId: 'child-1', termId: 'new-term', blockId: f.block.id, status: 'available', consumption: 'pending', omitted: 0 }] }
  const versions = read.files.map(file => file.version)
  expect(queryWorkspace(read, { kind: 'learning-context' }, NOW + 2)).toMatchObject({ data: { nextAction: { subject: 'math', reason: 'source-pending', blockId: f.block.id }, round: { id: round.id, status: 'paused', remaining: 2 } } })
  expect(queryWorkspace(read, { kind: 'learning-context', subject }, NOW + 2)).toMatchObject({ data: { nextAction: { subject, reason: 'confirmed-scope-required' }, round: null, reviewRound: { remaining: 2, usedFamilyIds: [] } } })
  expect(read.files.map(file => file.version)).toEqual(versions)
})
