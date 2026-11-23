/** Learning content and legacy reference routing; learner responses never belong to this catalog. */
import { readFileSync } from 'node:fs'
import { z } from 'zod'

import { knowledgeIdSchema, knowledgeExtensionSchema, type CapabilityScope, type KnowledgeExtension, type QuestionFamily } from './capability-schema.ts'
export * from './capability-schema.ts'

const text = z.string().trim().min(1).max(4000)
const ids = z.array(knowledgeIdSchema).max(500)
const subject = z.enum(['chinese', 'math', 'english'])
const catalogSchema = knowledgeExtensionSchema.extend({
  formatVersion: z.literal(1), status: text, reconstructedOn: text, subjects: z.array(subject), gradeScope: z.array(z.number().int()), termScope: z.array(z.enum(['first', 'second'])),
}).strict()
const routeSchema = z.object({ goalId: knowledgeIdSchema, familyId: knowledgeIdSchema, evidenceGates: z.array(text), creditPolicy: text, evidenceUse: text }).strict()
const legacySchema = z.object({
  status: text, workspaceBanks: text,
  objectives: z.array(z.object({ oldObjectiveId: knowledgeIdSchema, oldTitle: text, subject, grade: z.number().int(), term: z.enum(['first', 'second']), unitIds: ids,
    classification: text, candidateGoalIds: ids, scopeStatus: text, inheritance: text }).strict()),
  exercises: z.array(z.object({ oldExerciseId: knowledgeIdSchema, oldObjectiveId: knowledgeIdSchema, subject, originalPrompt: text, originalRecordPolicy: text,
    routes: z.array(routeSchema), pendingReasons: z.array(text), automationStatus: text, routePolicy: text.optional() }).strict()),
  sourceFingerprints: z.array(z.object({ path: text, sha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict()),
}).strict()
/** Effective catalog records aliases of equivalent workspace mothers rather than exposing duplicate mothers. */
export interface EffectiveKnowledge extends KnowledgeExtension { familyAliases: Record<string, string> }
const moduleUrl = import.meta.url
function immutable<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { for (const child of Object.values(value)) immutable(child); Object.freeze(value) }
  return value
}
const read = (name: string): unknown => JSON.parse(readFileSync(new URL(`../knowledge/curriculum/capabilities/${name}.json`, moduleUrl), 'utf8'))
function signature(family: QuestionFamily): string {
  return JSON.stringify([family.subject, [...family.signature.capabilityIds].sort(), family.signature.coreMethod.trim(), family.signature.problemStructure.trim()])
}
function validateCatalog(catalog: KnowledgeExtension): void {
  const goals = new Map(catalog.goals.map(goal => [goal.id, goal]))
  const families = new Map(catalog.families.map(family => [family.id, family]))
  if (goals.size !== catalog.goals.length || families.size !== catalog.families.length) throw new Error('Knowledge IDs must be unique.')
  const mothers = new Set<string>()
  const signatures = new Set<string>()
  for (const family of catalog.families) {
    if (mothers.has(family.representative.id) || signatures.has(signature(family))) throw new Error(`Duplicate mother or question family: ${family.id}`)
    mothers.add(family.representative.id); signatures.add(signature(family))
    if (family.coreMethod !== family.signature.coreMethod || family.structure !== family.signature.problemStructure || JSON.stringify([...family.goalIds].sort()) !== JSON.stringify([...family.signature.capabilityIds].sort())) throw new Error(`Family signature disagrees with its method, structure or capabilities: ${family.id}`)
    for (const goalId of family.goalIds) {
      const goal = goals.get(goalId)
      if (!goal || goal.subject !== family.subject || !goal.familyIds.includes(family.id)) throw new Error(`Family references an incompatible capability: ${family.id} / ${goalId}`)
    }
  }
  const sourceIds = new Set(knowledgeSources().sources.map(source => source.id))
  for (const goal of catalog.goals) for (const id of goal.sourceIds) if (!sourceIds.has(id)) throw new Error(`Missing capability source: ${goal.id} / ${id}`)
  const active = new Set<string>(); const visited = new Set<string>()
  const visit = (id: string): void => {
    if (active.has(id)) throw new Error(`Capability prerequisites contain a cycle: ${id}`)
    if (visited.has(id)) return
    const goal = goals.get(id)
    if (!goal) throw new Error(`Missing prerequisite capability: ${id}`)
    active.add(id)
    for (const prerequisite of goal.prerequisites) visit(prerequisite)
    active.delete(id); visited.add(id)
  }
  for (const goal of catalog.goals) {
    for (const id of goal.familyIds) if (!families.get(id)?.goalIds.includes(goal.id)) throw new Error(`Capability references an incompatible family: ${goal.id} / ${id}`)
    visit(goal.id)
  }
}
/**
 * Resolve built-in and workspace content into one effective capability/family index.
 * @param extension - content in the existing workspace collection, without learner facts.
 * @returns deeply frozen borrowed content and canonical family aliases; incompatible duplicates throw.
 */
export function effectiveKnowledge(extension?: KnowledgeExtension): EffectiveKnowledge {
  if (!extension) return immutable({ goals: shipped.goals, families: shipped.families, familyAliases: {} })
  const parsed = knowledgeExtensionSchema.parse(extension)
  const goals = new Map(shipped.goals.map(goal => [goal.id, goal]))
  for (const goal of parsed.goals) {
    const previous = goals.get(goal.id)
    if (previous && JSON.stringify(previous) !== JSON.stringify(goal)) throw new Error(`Workspace capability conflicts with built-in content: ${goal.id}`)
    goals.set(goal.id, goal)
  }
  const families = [...shipped.families]; const familyAliases: Record<string, string> = {}
  for (const family of parsed.families) {
    const sameId = families.find(item => item.id === family.id)
    if (sameId && signature(sameId) !== signature(family)) throw new Error(`Workspace family conflicts with an existing identity: ${family.id}`)
    const sameType = families.find(item => signature(item) === signature(family))
    if (sameType) { if (sameType.id !== family.id) familyAliases[family.id] = sameType.id; continue }
    families.push(family)
  }
  const catalog = { goals: [...goals.values()].map(goal => ({ ...goal, familyIds: [...new Set(goal.familyIds.map(id => familyAliases[id] ?? id).concat(families.filter(family => family.goalIds.includes(goal.id)).map(family => family.id)))] })), families }
  validateCatalog(catalog)
  return immutable({ ...catalog, familyAliases })
}
/** Explicit old-ID routes never grant whole-goal mastery or guess unknown workspace content. */
export interface LegacyReference { kind: 'objective' | 'exercise'; oldId: string; status: 'pending' | 'review-required'; candidateGoalIds: string[]; routes: z.infer<typeof routeSchema>[]; pendingReasons: string[]; originalPrompt?: string }
/**
 * Resolve an old course or exercise identity, retaining uncertainty for unenumerated workspace banks.
 * @param kind - course objective or concrete source exercise.
 * @param oldId - exact preserved identity.
 * @returns deeply frozen borrowed candidate routes and evidence requirements, never mastery credit.
 */
export function resolveLegacyReference(kind: LegacyReference['kind'], oldId: string): LegacyReference {
  if (kind === 'objective') {
    const item = legacy.objectives.find(item => item.oldObjectiveId === oldId)
    return immutable({ kind, oldId, status: 'pending', candidateGoalIds: item?.candidateGoalIds ?? [], routes: [], pendingReasons: [item?.inheritance ?? 'Unknown legacy objective; inspect the preserved source before assigning a capability.'] })
  }
  const item = legacy.exercises.find(item => item.oldExerciseId === oldId)
  return immutable({ kind, oldId, status: item?.routes.length ? 'review-required' : 'pending', candidateGoalIds: [...new Set(item?.routes.map(route => route.goalId) ?? [])], routes: item?.routes ?? [],
    pendingReasons: item?.pendingReasons ?? ['Unknown workspace exercise; inspect its method, structure and tested scope.'], ...(item ? { originalPrompt: item.originalPrompt } : {}) })
}

/**
 * Check whether independently tested evidence covers a requested range.
 * @param tested - original demonstrated modality and range.
 * @param requested - current teaching range; missing range facts cannot establish compatibility.
 * @returns true for the same modality and a contained numeric/vocabulary range, or the exact unexpanded scope.
 */
export function scopeSupports(tested: CapabilityScope, requested: CapabilityScope): boolean {
  if (tested.modality !== requested.modality) return false
  if (requested.numberMax !== undefined && (tested.numberMax === undefined || tested.numberMax < requested.numberMax)) return false
  if (requested.vocabulary !== undefined && (tested.vocabulary === undefined || !requested.vocabulary.every(word => tested.vocabulary?.includes(word)))) return false
  if ((tested.numberMax !== undefined) !== (requested.numberMax !== undefined) || (tested.vocabulary !== undefined) !== (requested.vocabulary !== undefined)) return false
  return requested.numberMax !== undefined || requested.vocabulary !== undefined || tested.id === requested.id && tested.description === requested.description
}

const sourceCatalogSchema = z.object({ retrievedOn: text,
  sources: z.array(z.object({ id: knowledgeIdSchema, label: text, url: text.optional(), sha256: text.optional(), pdfPages: z.number().int().positive().optional(), retrievedOn: text.optional(), paths: z.array(text).optional(), status: text.optional() }).strict()),
  coverage: z.array(z.json()), quantitativeCoverageLedgers: z.array(z.json()), scopeCaveats: z.array(text),
}).strict()
const sources = immutable(sourceCatalogSchema.parse(read('sources')))
const legacy = immutable(legacySchema.parse(read('legacy-map')))
const shipped = immutable(catalogSchema.parse(read('catalog')))
validateCatalog(shipped)
/**
 * Read immutable packaged curriculum sources, capability decomposition and quantitative activity limits.
 * @returns deeply frozen borrowed source locators and coverage policies, never learner evidence.
 */
export function knowledgeSources(): z.infer<typeof sourceCatalogSchema> { return sources }
