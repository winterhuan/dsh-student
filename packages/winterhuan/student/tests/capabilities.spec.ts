import { expect, it } from 'vitest'
import { effectiveKnowledge, resolveLegacyReference } from '../src/capabilities.ts'

it('reads source-backed capabilities and one mother per family independently of legacy course maps', () => {
  const knowledge = effectiveKnowledge()
  const counting = knowledge.goals.find(goal => goal.id === 'm.count')!
  expect(counting).toMatchObject({ subject: 'math', domain: 'number', familyIds: ['math.count'], sourceIds: ['moe-math-2022'] })
  expect(counting.scope).toContain('10000')
  expect(knowledge.families.find(family => family.id === 'math.count')).toMatchObject({ representative: { id: 'math.count.mother', prompt: '桌上有7枚棋子，数出总数，再取5枚' } })
  const reference = resolveLegacyReference('objective', 'c1a-o1')
  expect(reference).toMatchObject({ status: 'pending', candidateGoalIds: ['c.character', 'c.radical', 'c.recall', 'c.write-character'] })
  expect(resolveLegacyReference('exercise', 'ex-c1a-o0-1')).toMatchObject({ status: 'review-required', routes: [{ goalId: 'c.recall', familyId: 'chinese.recall-select' }] })
  expect(resolveLegacyReference('exercise', 'not-in-original-catalog')).toMatchObject({ status: 'pending', routes: [] })
})

it('collapses number and context variants into the existing mother and rejects identity or prerequisite conflicts', () => {
  const counting = effectiveKnowledge().families.find(family => family.id === 'math.count')!
  const variant = { ...counting, id: 'workspace-count', representative: { ...counting.representative, id: 'workspace-mother', prompt: '数出9辆玩具车，再取出3辆' } }
  const index = effectiveKnowledge({ goals: [], families: [variant] })
  expect(index.familyAliases).toEqual({ 'workspace-count': 'math.count' })
  expect(index.families.filter(family => family.id === 'math.count')).toHaveLength(1)
  expect(index.families.some(family => family.id === 'workspace-count')).toBe(false)
  expect(() => effectiveKnowledge({ goals: [], families: [{ ...variant, id: 'math.count', coreMethod: 'different', signature: { ...variant.signature, coreMethod: 'different' } }] })).toThrow('conflicts')
  const goal = effectiveKnowledge().goals.find(goal => goal.id === 'm.count')!
  expect(() => effectiveKnowledge({ goals: [{ ...goal, id: 'workspace-goal', prerequisites: ['workspace-goal'], familyIds: [] }], families: [] })).toThrow('cycle')
})

it('validates learner, family and tested scope through the shared official-file reader', async () => {
  const { validateStudyFiles } = await import('../src/files/validation.ts')
  const { setup, NOW } = await import('./fixtures.ts')
  const settings = { format: 2, kind: 'term-settings', termId: 'term-1', learnerId: 'learner-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const block = { format: 2, kind: 'block', termId: 'term-1', learnerId: 'learner-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile },
    questions: [{ id: 'q1', objectiveId: 'm.count', capability: { goalId: 'm.count', familyId: 'math.count', scope: { id: 'count10', description: '10以内点数', modality: 'performed', numberMax: 10 } }, source: { kind: 'authored', description: 'Generated counting task' }, topic: '点数', prompt: '数出7枚棋子', answer: '7', explanation: '逐一对应', answerEvidence: '无遗漏无重复' }], responses: [], hints: [], assessments: [] }
  const files = [{ path: '.study/settings.json', value: settings }, { path: '.study/blocks/block-1.json', value: block }]
  expect(validateStudyFiles(files).valid).toBe(true)
  const wrongFamily = structuredClone(block)
  wrongFamily.questions[0]!.capability.familyId = 'math.zero'
  expect(validateStudyFiles([{ ...files[0]! }, { ...files[1]!, value: wrongFamily }]).issues).toContainEqual(expect.objectContaining({ rule: 'capability-family' }))
  expect(validateStudyFiles([{ ...files[0]! }, { ...files[1]!, value: { ...block, learnerId: 'other-child' } }]).issues).toContainEqual(expect.objectContaining({ rule: 'learner-identity' }))
})

it('keeps canonical and mapped legacy questions inside the explicitly confirmed activity goals', async () => {
  const { validateStudyFiles } = await import('../src/files/validation.ts')
  const { setup, NOW } = await import('./fixtures.ts')
  const settings = { format: 2, kind: 'term-settings', termId: 'term-1', learnerId: 'learner-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const question = { id: 'q1', objectiveId: 'm.sub', capability: { goalId: 'm.sub', familyId: 'math.sub-column', scope: { id: 'within100', description: 'Written subtraction within100', modality: 'written', numberMax: 100 } }, source: { kind: 'authored', description: 'Column subtraction' }, topic: 'Subtraction', prompt: '62 - 38?', answer: '24', explanation: 'Regroup one ten', answerEvidence: '24 + 38 = 62' }
  const validate = (objectiveIds: string[], objectiveId = 'm.sub') => validateStudyFiles([{ path: '.study/settings.json', value: settings }, { path: '.study/blocks/block-1.json', value: {
    format: 2, kind: 'block', termId: 'term-1', learnerId: 'learner-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW,
    context: { profile: setup.profile, scope: { grade: 2, term: 'first', objectiveIds } }, questions: [{ ...question, objectiveId }], responses: [], hints: [], assessments: [],
  } }])
  expect(validate(['m.add']).issues).toContainEqual(expect.objectContaining({ rule: 'effective-scope' }))
  expect(validate(['m.sub']).valid).toBe(true)
  expect(validate(['m2a-o-sub']).valid).toBe(true)
  expect(validate(['m.sub'], 'm2a-o-sub').valid).toBe(true)
  expect(validate(['m.add'], 'm2a-o-sub').issues).toContainEqual(expect.objectContaining({ rule: 'effective-scope' }))
  expect(validate(['unknown-goal']).issues).toContainEqual(expect.objectContaining({ rule: 'effective-scope' }))
})

it('reuses only compatible tested scopes and derives archive paths from stable entity identities', async () => {
  const { scopeSupports } = await import('../src/capabilities.ts')
  const { archiveEvidencePath, archiveEvidenceReferenceSchema } = await import('../src/files/schema.ts')
  const count20 = { id: 'count20', description: '20以内点数', modality: 'performed' as const, numberMax: 20 }
  expect(scopeSupports(count20, { ...count20, id: 'count10', numberMax: 10 })).toBe(true)
  expect(scopeSupports(count20, { ...count20, id: 'count100', numberMax: 100 })).toBe(false)
  expect(scopeSupports(count20, { ...count20, modality: 'written' })).toBe(false)
  const words = { id: 'words', description: 'school words', modality: 'listening' as const, vocabulary: ['red', 'blue'] }
  expect(scopeSupports(words, { ...words, vocabulary: ['green'] })).toBe(false)
  const reference = archiveEvidenceReferenceSchema.parse({ learnerId: 'child1', termId: 'term1', ownerKind: 'block', ownerId: 'block1', responseId: 'answer1', goalId: 'm.count', scope: count20 })
  expect(archiveEvidencePath(reference)).toBe('.study/archives/term1/blocks/block1.json')
})

it('offers capabilities and mothers through the independent workspace query with a current frozen capability target', async () => {
  const { validateStudyFiles } = await import('../src/files/validation.ts')
  const { queryWorkspace } = await import('../src/learning/queries.ts')
  const { setup, NOW } = await import('./fixtures.ts')
  const settings = { format: 2, kind: 'term-settings', termId: 'term1', learnerId: 'child1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const validation = validateStudyFiles([{ path: '.study/settings.json', value: settings }])
  const read = { status: 'valid' as const, files: [{ path: '.study/settings.json', targetKey: 'settings', version: '1', bytes: new Uint8Array(), file: validation.workspace!.settings }], membership: [], issues: [], workspace: validation.workspace! }
  expect(queryWorkspace(read, { kind: 'capabilities', id: 'm.count' }, NOW)).toMatchObject({ data: { items: [{ id: 'm.count', criterion: expect.any(String) }] } })
  expect(queryWorkspace(read, { kind: 'families', id: 'math.count' }, NOW)).toMatchObject({ data: { items: [{ id: 'math.count', representative: { id: 'math.count.mother' } }] } })
})

it('plans repeatable format-2 knowledge migration without copying or changing original answers', async () => {
  const { describeKnowledgeMigration } = await import('../src/files/recovery.ts')
  const { validateStudyFiles } = await import('../src/files/validation.ts')
  const { setup, NOW } = await import('./fixtures.ts')
  const settings = { format: 2, kind: 'term-settings', termId: 'old-term', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const collection = { format: 2, kind: 'collections', termId: 'old-term', mistakes: [], rewards: [], exercises: [], concepts: [], objectives: [], relations: [], teachingQueue: [] }
  const files = [{ path: '.study/settings.json', value: settings }, { path: '.study/collections.json', value: collection }]
  const validated = validateStudyFiles(files)
  const read = { status: 'valid' as const, files: validated.files.map(({ path, file }) => ({ path, targetKey: path, version: '1', bytes: new TextEncoder().encode(JSON.stringify(file)), file })), membership: [], issues: [], workspace: validated.workspace! }
  expect(describeKnowledgeMigration(read)).toMatchObject({ status: 'blocked', outputs: [], issues: [{ rule: 'learner-identity' }] })
  const { termSettingsSchema } = await import('../src/files/schema.ts')
  const learnerId = termSettingsSchema.shape.learnerId.unwrap().parse('verified-child')
  const recovery = { backups: read.files.map(file => ({ ...file, path: `${file.path}.original`, targetKey: `${file.targetKey}.original` })), lessons: { status: 'missing' as const, issues: [] } }
  const plan = describeKnowledgeMigration(read, learnerId, recovery)
  expect(plan).toMatchObject({ status: 'ready', learnerId: 'verified-child', outputs: [{ path: '.study/collections.json', status: 'write-needed' }, { path: '.study/settings.json', status: 'write-needed' }] })
  const completed = validateStudyFiles(plan.outputs.map(output => ({ path: output.path, value: output.file })))
  const reread = { ...read, files: completed.files.map(({ path, file }) => ({ path, targetKey: path, version: '2', bytes: new TextEncoder().encode(JSON.stringify(file)), file })), workspace: completed.workspace! }
  expect(describeKnowledgeMigration(read, learnerId, { ...recovery, current: reread }).outputs.every(output => output.status === 'already-valid')).toBe(true)
  expect(read.workspace.settings.learnerId).toBeUndefined()
  const archived = { ...read, status: 'archived' as const, workspace: { ...read.workspace, settings: { ...read.workspace.settings, archivedAt: NOW } }, files: read.files.map(file => file.file.kind === 'term-settings' ? { ...file, file: { ...file.file, archivedAt: NOW } } : file) }
  expect(describeKnowledgeMigration(archived, learnerId, recovery)).toMatchObject({ status: 'ready', learnerId: 'verified-child', outputs: expect.arrayContaining([expect.objectContaining({ path: '.study/settings.json', file: expect.objectContaining({ archivedAt: NOW }) })]) })
})

it('keeps a different core method as a separate family serving an existing capability', () => {
  const original = effectiveKnowledge().families.find(family => family.id === 'math.count')!
  const newMethod = { ...original, id: 'workspace-group-count', coreMethod: '先分组再点数', structure: '分组计数', representative: { id: 'workspace-group-count.mother', prompt: '将12枚棋子分成三组再点数', rubric: '每组点数再合计12' }, signature: { capabilityIds: ['m.count'], coreMethod: '先分组再点数', problemStructure: '分组计数' } }
  const index = effectiveKnowledge({ goals: [], families: [newMethod] })
  expect(index.families.filter(family => family.goalIds.includes('m.count')).map(family => family.id)).toEqual(['math.count', 'workspace-group-count'])
  expect(index.goals.find(goal => goal.id === 'm.count')!.familyIds).toContain('workspace-group-count')
})
