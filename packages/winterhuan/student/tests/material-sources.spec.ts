import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { queryStudy } from '../src/learning/queries.ts'
import { stateSchema } from '../src/schema.ts'
import { NOW, setup, material, updateStudy } from './fixtures.ts'

it('discovers usable bundled pages even when the only registered book is a knowledge-map placeholder', () => {
  const state = stateSchema.parse({ ...updateStudy(undefined, setup, NOW), materials: [{ ...material, id: 'map', subject: 'chinese', title: '语文二年级上册知识地图', publisher: '随包知识地图', locator: 'knowledge/curriculum/chinese-grade2-first.json', evidence: '只确认学校单元' }] })
  const original = structuredClone(state)
  const result = queryStudy(state, 'materials', 0, { subject: 'chinese' }, NOW)
  expect(result).toMatchObject({ items: [{ id: 'map' }], availableSources: [{ subject: 'chinese', knowledgeMap: { id: 'chinese-grade2-first' }, defaultTextbook: { index: 'textbooks/chinese-grade2-first/index.md', schoolMatchQuestion: expect.stringContaining('学校用的也是人教版') } }] })
  const index = readFileSync(new URL('../knowledge/skills/study/textbooks/chinese-grade2-first/index.md', import.meta.url), 'utf8')
  expect(index).toContain('14 八角楼上')
  expect(readFileSync(new URL('../knowledge/skills/study/textbooks/chinese-grade2-first/pages/pdf-072.jpg', import.meta.url)).length).toBeGreaterThan(1000)
  expect(state).toEqual(original)
})

it('does not advertise nonexistent default books for English or another term, but keeps knowledge maps discoverable', () => {
  const state = updateStudy(undefined, setup, NOW)
  expect(queryStudy(state, 'materials', 0, { subject: 'english' }, NOW)).toMatchObject({ availableSources: [{ subject: 'english', knowledgeMap: { id: 'english-grade2-first' }, defaultTextbook: null }] })
  state.profile.term = 'second'
  expect(queryStudy(state, 'materials', 0, { subject: 'chinese' }, NOW)).toMatchObject({ availableSources: [{ knowledgeMap: { id: 'chinese-grade2-second' }, defaultTextbook: null }] })
  state.profile.grade = 3
  expect(queryStudy(state, 'materials', 0, { subject: 'math' }, NOW)).toMatchObject({ availableSources: [{ knowledgeMap: null, defaultTextbook: null }] })
})

it('preserves supplied materials, exact-ID pagination and the school selection alongside default candidates', () => {
  const state = stateSchema.parse({ ...updateStudy(undefined, setup, NOW), materials: [material], courses: [{ subject: 'math', materialId: material.id, unit: '家长指定单元', parentConfirmation: '按学校教材学习' }] })
  const original = structuredClone(state)
  expect(queryStudy(state, 'materials', 0, { subject: 'math', id: material.id }, NOW)).toMatchObject({ total: 1, items: [material], availableSources: [{ defaultTextbook: { index: 'textbooks/math-grade2-first/index.md' } }] })
  expect(queryStudy(state, 'materials', 20, { subject: 'math' }, NOW)).toMatchObject({ total: 1, items: [], nextOffset: null })
  expect(state).toEqual(original)
})
