import { expect, it } from 'vitest'
import { unitCourseSchema, sectionReadiness } from '../src/courses.ts'
import { lessonFileSchema } from '../src/openmaic.ts'
const scope = { id: 'count-20', description: 'Count within twenty', modality: 'written', numberMax: 20 }
const section = { id: 'first', title: 'Counting', goalIds: ['m.count'], scope, kind: 'lesson', materialRevision: 'material-1', prerequisiteIds: [] }
function directory() {
  return unitCourseSchema.parse({ id: 'unit', learnerId: 'child', termId: 'term', subject: 'math', unit: 'Counting unit', revision: 1, currentMaterialRevision: 'material-1', materials: [{ revision: 'material-1', edition: 'Parent supplied book', sourcePath: 'materials/unit.md', sourceRevision: 'sha256-original', directory: ['Counting', 'Comparing'], position: 'entering', confirmation: { quote: 'We just started this unit.', at: 1 } }], sections: [section, { ...section, id: 'second', title: 'Comparing', prerequisiteIds: ['first'] }, { ...section, id: 'synthesis', kind: 'synthesis', prerequisiteIds: ['first', 'second'] }] })
}
it('gates a unit on actual materials and school position; synthesis needs completion or explicit test preparation', () => {
  const course = directory()
  expect(sectionReadiness(course, 'first')).toBe('ready')
  expect(sectionReadiness(course, 'second')).toBe('school-position')
  expect(sectionReadiness(course, 'synthesis')).toBe('synthesis-confirmation')
  course.sections[2]!.testPreparation = { quote: 'Prepare for the unit test', at: 2 }
  expect(sectionReadiness(course, 'synthesis')).toBe('ready')
  course.materials = []
  expect(sectionReadiness(course, 'first')).toBe('materials')
})
it('rejects broken stable material identities, cyclic prerequisites and unconfirmed current school sections', () => {
  const course = directory()
  expect(unitCourseSchema.safeParse({ ...course, materials: [course.materials[0], course.materials[0]] }).success).toBe(false)
  expect(unitCourseSchema.safeParse({ ...course, sections: [{ ...section, prerequisiteIds: ['first'] }] }).success).toBe(false)
  expect(unitCourseSchema.safeParse({ ...course, materials: [{ ...course.materials[0], position: 'studying' }] }).success).toBe(false)
})
it('retains legacy logs but requires the versioned directory and original ownership for new full courses', () => {
  expect(lessonFileSchema.parse({ format: 1, lessons: [] })).toEqual({ format: 1, lessons: [] })
  expect(lessonFileSchema.safeParse({ format: 1, lessons: [], courses: [directory()] }).success).toBe(false)
  expect(lessonFileSchema.safeParse({ format: 2, lessons: [], courses: [directory()] }).success).toBe(true)
  const course = directory(); course.sections[0]!.lessonId = 'missing'
  expect(lessonFileSchema.safeParse({ format: 2, lessons: [], courses: [course] }).success).toBe(false)
})
