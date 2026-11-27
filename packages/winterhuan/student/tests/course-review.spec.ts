import { createHash } from 'node:crypto'
import { expect, it, vi } from 'vitest'
import { CourseReviewer, type CourseReviewInput, type CourseReviewStore } from '../src/openmaic/review.ts'
import { courseQuestionPlanSchema } from '../src/courses.ts'
import { reviewQuestionsCurrent, courseReviewInput, reviewedCourseRequirement } from '../src/openmaic/review-input.ts'
import { canonical } from '../src/learning/shared.ts'
import type { InteractiveLesson } from '../src/openmaic.ts'
import { lessonSchema } from '../src/openmaic.ts'
import type { StudyFiles } from '../src/files/read.ts'

const source = '山指地面上高起的部分。游泳是在水中运动。河流中有水。'
const question = { id: 'q1', type: 'single' as const, question: '游泳是在什么地方运动？', options: [{ value: 'A', label: '水中' }, { value: 'B', label: '山上' }], answer: 'A', analysis: '游泳是在水中运动。', sourceQuote: '游泳是在水中运动。', completedAnswer: '游泳是在水中运动。' }
const stageNames = ['introduction', 'explanation', 'demonstration', 'guidedPractice', 'independentPractice', 'summary']
function input(): CourseReviewInput {
  return { owner: { workspace: '/original', learnerId: 'child', termId: 'term', blockId: 'block', lessonId: 'lesson' }, provenance: { purpose: 'foundation' }, subject: 'chinese', requirement: '认识山和水', source,
    teaching: { revision: 'v1', goal: '识字', scope: '山和水', materialLimitations: '自编基础材料，仅字形字义', introduction: '观察', explanation: '识字', demonstration: '示范', guidedPractice: '引导辨字', independentPractice: '独立识字', summary: '回顾', maxAssessmentQuestions: 3 },
    plan: courseQuestionPlanSchema.parse({ revision: 'v1', source: { path: 'materials/unit.md', sha256: createHash('sha256').update(source).digest('hex') }, target: { goalId: 'c.recognize', familyId: 'c.recognize-context', scope: { id: 'mountain-water', description: '山和水的字义', modality: 'written' } }, questions: [question] }),
  }
}
function generated(): CourseReviewInput {
  const value = input()
  const { sourceQuote: _quote, completedAnswer: _completed, ...snapshot } = question
  value.content = { contentHash: 'a'.repeat(64), scenes: stageNames.map(id => ({ id, stageId: 'stage', type: id === 'independentPractice' ? 'quiz' : 'slide', content: id === 'independentPractice' ? { type: 'quiz', questions: [snapshot] } : { text: id } })) }
  value.questions = [{ bindingId: 'binding', sceneId: 'independentPractice', questionId: 'q1', snapshot, snapshotHash: createHash('sha256').update(canonical(snapshot)).digest('hex'), revision: { kind: 'unavailable' } }]
  return value
}
function verdict(value = input()) {
  return { questions: (value.questions ?? value.plan.questions).map(q => ({ key: 'sceneId' in q ? JSON.stringify([q.sceneId, q.questionId]) : q.id, solvedAnswer: 'A', completedSentence: '游泳是在水中运动。', grammar: true, facts: true, uniqueAnswer: true, criterion: true, source: true, analysisCheck: { text: 'snapshot' in q ? String((q.snapshot as Record<string, unknown>).analysis) : q.analysis, correct: true, reason: '解析事实正确。' }, reason: '题意通顺，答案及解析与材料一致。' })), scope: true, teaching: true, contentCorrect: true, stages: Object.fromEntries(stageNames.map(id => [id, value.content ? id : null])), issues: [] }
}
function harness() {
  const records = new Map<string, unknown>()
  const store: CourseReviewStore = { async load(id) { return records.get(id) }, async save(id, value) { records.set(id, structuredClone(value)) } }
  return { records, store, reviewer: new CourseReviewer(store) }
}
const signal = () => new AbortController().signal
it('requires the returned receipt when saving reviewed question plans while retaining legacy reviews', async () => {
  const value = generated()
  const review = await harness().reviewer.review(value, 'route', async () => JSON.stringify(verdict(value)), signal())
  const lesson = { id: 'lesson', status: 'ready', title: 'Test', requirement: value.requirement, base: 'https://open.maic.chat', createdAt: '2026-11-27T00:00:00Z', updatedAt: '2026-11-27T00:00:00Z', questionPlan: value.plan, quality: review.quality }
  expect(lessonSchema.safeParse(lesson).success).toBe(true)
  const quality = { ...review.quality!, reviewId: undefined }
  for (const status of ['passed', 'rejected'] as const) expect(lessonSchema.safeParse({ ...lesson, quality: { ...quality, status } }).success).toBe(false)
  expect(lessonSchema.safeParse({ ...lesson, questionPlan: undefined, quality }).success).toBe(true)
})
it('authenticates a passing full review and invalidates edited material, owner, plan, actual content or quality without inference', async () => {
  const h = harness(), value = generated()
  const generate = vi.fn(async () => JSON.stringify(verdict(value)))
  const review = await h.reviewer.review(value, 'route', generate, signal())
  expect(review.status).toBe('passed')
  expect(await h.reviewer.accepts(value, review.quality!)).toBe(true)
  for (const changed of [{ ...value, source: source + 'changed' }, { ...value, owner: { ...value.owner, learnerId: 'other' } }, { ...value, plan: { ...value.plan, revision: 'v2' } }, { ...value, content: { ...value.content!, contentHash: 'b'.repeat(64) } }]) expect(await h.reviewer.accepts(changed, review.quality!)).toBe(false)
  expect(await h.reviewer.accepts(value, { ...review.quality!, notes: 'forged' })).toBe(false)
  expect(await h.reviewer.accepts(value, { ...review.quality!, reviewId: 'f'.repeat(64) })).toBe(false)
  expect(generate).toHaveBeenCalledTimes(1)
})
it('caches identical complete review across restart, coalesces calls and invalidates model changes', async () => {
  const h = harness(), value = input()
  const generate = vi.fn(async () => { await Promise.resolve(); return JSON.stringify(verdict(value)) })
  const results = await Promise.all([h.reviewer.review(value, 'route', generate, signal()), h.reviewer.review(value, 'route', generate, signal())])
  expect(results[0]).toEqual(results[1]); expect(generate).toHaveBeenCalledTimes(1)
  await new CourseReviewer(h.store).review(value, 'route', generate, signal())
  expect(generate).toHaveBeenCalledTimes(1)
  await h.reviewer.review(value, 'other-route', generate, signal())
  expect(generate).toHaveBeenCalledTimes(2)
})
it.each(['grammar', 'facts', 'uniqueAnswer', 'criterion', 'source'] as const)('fails closed on false or uncertain %s, even when the reviewer claims no overall issues', async check => {
  for (const answer of [false, null]) {
    const h = harness(), value = generated(), result = verdict(value)
    const raw = { ...result, questions: result.questions.map(q => ({ ...q, [check]: answer })) }
    const review = await h.reviewer.review(value, 'route', async () => JSON.stringify(raw), signal())
    expect(review.status).toBe('rejected')
    expect(await h.reviewer.accepts(value, review.quality!)).toBe(false)
  }
})
it('rejects changed approved wording, answers or analysis even when semantic review passes', async () => {
  for (const field of ['question', 'answer', 'analysis']) {
    const value = generated()
    value.questions![0]!.snapshot = { ...question, [field]: 'changed' }
    const review = await harness().reviewer.review(value, 'route', async () => JSON.stringify(verdict(value)), signal())
    expect(review.status).toBe('rejected')
    expect(review.issues.join()).toContain('改写')
  }
})
it('does not cache missing/duplicate question verdicts, malformed output, cancellation or oversized content', async () => {
  const h = harness(), value = input()
  for (const raw of ['not JSON', JSON.stringify({ ...verdict(), questions: [] }), JSON.stringify({ ...verdict(), questions: [verdict().questions[0], verdict().questions[0]] })]) await expect(h.reviewer.review(value, 'route', async () => raw, signal())).rejects.toThrow()
  const controller = new AbortController()
  await expect(h.reviewer.review(value, 'route', async () => { controller.abort(); return JSON.stringify(verdict()) }, controller.signal)).rejects.toThrow()
  await expect(h.reviewer.review({ ...value, source: 'a'.repeat(200000) }, 'route', async () => JSON.stringify(verdict()), signal())).rejects.toThrow('limit')
  expect(h.records.size).toBe(0)
})
it('rejects missing stage evidence and a frozen snapshot that differs from the current quiz', async () => {
  const value = generated(), raw = verdict(value)
  raw.stages.summary = null
  expect((await harness().reviewer.review(value, 'route', async () => JSON.stringify(raw), signal())).status).toBe('rejected')
  expect(reviewQuestionsCurrent(value)).toBe(true)
  value.content!.scenes.find(s => s.type === 'quiz')!.content = { questions: [{ ...question, analysis: '游泳需要在水边进行' }] }
  expect(reviewQuestionsCurrent(value)).toBe(false)
})
it('checks source bytes and exact quotations through the contained filesystem', async () => {
  const value = input()
  const lesson = { ...value.owner, id: 'lesson', subject: 'chinese', teaching: value.teaching, questionPlan: value.plan, requirement: value.requirement } as InteractiveLesson
  const files = { read: async () => Buffer.from(source) } as StudyFiles
  expect((await courseReviewInput(files, '/original', lesson, { format: 2, lessons: [] }, signal())).source).toBe(source)
  lesson.questionPlan!.questions[0]!.sourceQuote = 'invented source'
  await expect(courseReviewInput(files, '/original', lesson, { format: 2, lessons: [] }, signal())).rejects.toThrow('quote')
  lesson.questionPlan!.source.sha256 = 'f'.repeat(64)
  await expect(courseReviewInput(files, '/original', lesson, { format: 2, lessons: [] }, signal())).rejects.toThrow('changed')
})
it('requires valid distinct answer keys and limits plans to three questions', () => {
  const plan = input().plan
  expect(courseQuestionPlanSchema.safeParse({ ...plan, questions: [{ ...question, answer: 'C' }] }).success).toBe(false)
  expect(courseQuestionPlanSchema.safeParse({ ...plan, questions: [question, question] }).success).toBe(false)
  expect(courseQuestionPlanSchema.safeParse({ ...plan, questions: [1, 2, 3, 4].map(i => ({ ...question, id: `q${i}` })) }).success).toBe(false)
})

it('ties pre-review to the exact original plan, without trusting a post-review receipt', async () => {
  const h = harness(), plan = input()
  const approved = await h.reviewer.review(plan, 'route', async () => JSON.stringify(verdict(plan)), signal())
  expect(await h.reviewer.approvedPlan(plan, approved.reviewId)).toBe(true)
  expect(await h.reviewer.approvedPlan({ ...plan, requirement: 'changed' }, approved.reviewId)).toBe(false)
  expect(await h.reviewer.approvedPlan(plan, undefined)).toBe(false)
  const actual = generated()
  const reviewed = await h.reviewer.review(actual, 'route', async () => JSON.stringify(verdict(actual)), signal())
  expect(await h.reviewer.approvedPlan(actual, reviewed.reviewId)).toBe(false)
})

it('does not accept a correct-looking verdict when independent solving disagrees with the key', async () => {
  const value = input(), raw = verdict(value)
  raw.questions[0]!.solvedAnswer = 'B'
  const reviewed = await harness().reviewer.review(value, 'route', async () => JSON.stringify(raw), signal())
  expect(reviewed.status).toBe('rejected')
  expect(reviewed.issues).toContain('独立解题结果与原题标准答案不一致。')
})
it('requires an independent check of the exact explanation even if the sentence and selected key pass', async () => {
  const value = input(), raw = verdict(value)
  raw.questions[0]!.analysisCheck.correct = false
  raw.questions[0]!.analysisCheck.reason = '原解析错误地将动作地点解释成水边。'
  expect((await harness().reviewer.review(value, 'route', async () => JSON.stringify(raw), signal())).status).toBe('rejected')
  raw.questions[0]!.analysisCheck.text = 'a different explanation'
  await expect(harness().reviewer.review(value, 'route', async () => JSON.stringify(raw), signal())).rejects.toThrow('exact original explanation')
})

it('preserves answer values across the official scalar/single-element-array representation', async () => {
  const value = generated()
  value.questions![0]!.snapshot = { ...question, answer: ['A'] }
  const review = await harness().reviewer.review(value, 'route', async () => JSON.stringify(verdict(value)), signal())
  expect(review.status).toBe('passed')
})

it('sends one approved assessment list and scoped teaching material instead of internal mastery requirements', () => {
  const value = input()
  value.requirement = 'internal-global-rubric-with-other-modalities'
  const outbound = reviewedCourseRequirement(value)
  expect(outbound).not.toContain(value.requirement)
  expect(outbound).toContain(value.source)
  expect(outbound).toContain(question.question)
  expect(outbound).toContain('共 1 题')
  expect(outbound).not.toContain('completedAnswer')
  expect(() => reviewedCourseRequirement({ ...value, source: 'a'.repeat(8000) })).toThrow('8000')
})
