/** Compatibility display projection; normalized evidence remains attached to the official read. */
import { stateSchema, type StudyState } from '../schema.ts'
import type { ValidatedWorkspace } from './validation.ts'
import { attachEvidence, deriveEvidence } from '../learning/evidence.ts'
import { scheduleMistakes } from '../learning/schedule.ts'
import { effectiveKnowledge, scopeSupports } from '../capabilities.ts'
import { createHash } from 'node:crypto'

/**
 * Project official entities into the existing dashboard's display fields.
 * @param workspace - validated current official files.
 * @param now - explicit query cutoff.
 * @returns display state with the official normalized evidence used by every metric owner.
 */
export function projectWorkspace(workspace: ValidatedWorkspace, now: number): StudyState {
  const { settings, blocks, worksheets, collections } = workspace
  const index = deriveEvidence(workspace)
  const knowledge = effectiveKnowledge(collections?.knowledge)
  const declarations = [
    ...(collections?.mistakes ?? []).map(mistake => ({ mistake, termId: settings.termId })),
    ...(workspace.archivedEvidence ?? []).flatMap(archive => (archive.workspace.collections?.mistakes ?? []).filter(mistake => archive.references.some(reference => reference.review?.mistakeId === mistake.id)).map(mistake => ({ mistake, termId: archive.workspace.settings.termId }))),
  ].sort((a, b) => (a.mistake.confirmedAt ?? Infinity) - (b.mistake.confirmedAt ?? Infinity) || a.termId.localeCompare(b.termId) || a.mistake.id.localeCompare(b.mistake.id))
  const mistakes: NonNullable<typeof collections>['mistakes'] = []
  const mothers = new Map<string, string>()
  const keyFor = (mistake: NonNullable<typeof collections>['mistakes'][number], termId: string) => {
    const entry = index.entries.find(entry => entry.termId === termId && entry.mistakeId === mistake.id && entry.capability)
    const original = [workspace, ...(workspace.archivedEvidence ?? []).map(archive => archive.workspace)].find(owner => owner.settings.termId === termId)
    const file = entry ? [...original?.blocks ?? [], ...original?.worksheets ?? []].find(file => file.id === entry.ownerId && file.kind === entry.ownerKind) : undefined
    const question = (file?.kind === 'block' ? file.questions : file?.items)?.find(question => question.id === entry?.questionId)
    const binding = mistake.capability ?? entry?.capability
    const goal = mistake.capability?.goalId ?? (entry?.capability && (mistake.objectiveId === question?.objectiveId || mistake.objectiveId === entry.capability.goalId) ? entry.capability.goalId : mistake.objectiveId)
    const scope = binding?.scope
    const range = scope ? [scope.modality, scope.numberMax ?? null, scope.vocabulary?.slice().sort() ?? null, scope.numberMax === undefined && scope.vocabulary === undefined ? [scope.id, scope.description] : null] : undefined
    return { goal, binding, key: binding && goal === binding.goalId ? JSON.stringify([mistake.subject, goal, knowledge.familyAliases[binding.familyId] ?? binding.familyId, range]) : JSON.stringify([termId, mistake.id]) }
  }
  for (const { mistake, termId } of declarations) {
    const { key, goal, binding } = keyFor(mistake, termId)
    const inheritedReview = workspace.archivedEvidence?.some(archive => archive.workspace.settings.termId === termId && archive.references.some(reference => reference.review?.mistakeId === mistake.id))
    let id = mothers.get(key)
    if (!id) {
      id = collections?.mistakes.find(current => keyFor(current, settings.termId).key === key)?.id ?? mistake.id
      if (mistakes.some(existing => existing.id === id)) id = `archive-${createHash('sha256').update(key).digest('hex').slice(0, 32)}`
      mothers.set(key, id); mistakes.push({ ...mistake, id, ...(goal ? { objectiveId: goal } : {}) })
    }
    for (const entry of index.entries) if (entry.termId === termId && entry.mistakeId === mistake.id) {
      if (!inheritedReview && binding && (!entry.capability || entry.capability.goalId !== binding.goalId || (knowledge.familyAliases[entry.capability.familyId] ?? entry.capability.familyId) !== (knowledge.familyAliases[binding.familyId] ?? binding.familyId) || !scopeSupports(binding.scope, entry.capability.scope) || !scopeSupports(entry.capability.scope, binding.scope))) delete entry.mistakeId
      else entry.mistakeId = id
    }
  }
  const state = stateSchema.parse({ format: 1, revision: settings.revision, updatedAt: settings.updatedAt,
    profile: settings.profile, materials: settings.materials, courses: settings.courses, interests: settings.interests, openmaic: settings.openmaic,
    ...(collections ? { exercises: collections.exercises, concepts: collections.concepts, objectives: collections.objectives, relations: collections.relations, teachingQueue: collections.teachingQueue } : {}),
    sessions: blocks.map(block => ({ id: block.id, subject: block.subject, mode: block.mode, startedAt: block.startedAt,
      ...(block.intensity ? { intensity: block.intensity } : {}), ...(block.endedAt !== undefined ? { endedAt: block.endedAt } : {}),
      ...(block.spentMs !== undefined ? { spentMs: block.spentMs } : {}), ...(block.reflection !== undefined ? { reflection: block.reflection } : {}),
      ...(block.context.scope ? { scope: block.context.scope } : {}), ...(block.context.material ? { materialId: block.context.material.id } : {}) })),
    attempts: blocks.flatMap(block => block.responses.map(response => {
      const question = block.questions.find(question => question.id === response.questionId)!
      const assessment = block.assessments.find(assessment => assessment.responseId === response.id)
      return { id: response.id, questionId: question.id, responseId: response.id, sessionId: block.id, subject: block.subject, topic: question.topic, prompt: question.prompt, response: response.response ?? response.rawResponse,
        rawResponse: response.rawResponse, result: assessment?.result ?? 'unassessed', assistance: response.assistance, feedback: assessment?.feedback ?? '', answerEvidence: assessment?.answerEvidence ?? question.answerEvidence,
        at: assessment?.assessedAt ?? block.startedAt, ...(typeof question.objectiveId === 'string' ? { objectiveId: question.objectiveId } : {}), ...(question.mistakeId ? { mistakeId: question.mistakeId } : {}) }
    })),
    worksheets: worksheets.map(sheet => ({ id: sheet.id, subject: sheet.subject, createdAt: sheet.createdAt,
      ...(sheet.worksheetKind ? { kind: sheet.worksheetKind } : {}), ...(sheet.discardedAt !== undefined ? { discardedAt: sheet.discardedAt } : {}), ...(sheet.archivedAt !== undefined ? { archivedAt: sheet.archivedAt } : {}),
      items: sheet.items.map(item => ({ id: item.id, prompt: item.prompt, answer: item.answer, explanation: item.explanation, answerEvidence: item.answerEvidence,
        ...(typeof item.objectiveId === 'string' ? { objectiveId: item.objectiveId } : {}), ...(item.mistakeId ? { mistakeId: item.mistakeId } : {}), ...(item.figure ? { figure: item.figure } : {}), ...(item.space ? { space: item.space } : {}) })) })),
    paperResults: worksheets.flatMap(sheet => sheet.assessments.map(assessment => {
      const response = sheet.responses.find(response => response.id === assessment.responseId)!
      return { worksheetId: sheet.id, itemId: response.questionId, response: response.response ?? response.rawResponse, result: assessment.result === 'stuck' ? 'unassessed' : assessment.result, assistance: response.assistance,
        feedback: assessment.feedback, answerEvidence: assessment.answerEvidence, userConfirmation: assessment.userConfirmation!, receivedAt: assessment.assessedAt }
    })),
    paperDrafts: worksheets.flatMap(sheet => sheet.drafts.map(draft => ({ worksheetId: sheet.id, itemId: draft.questionId, response: draft.response, result: draft.result === 'stuck' ? 'unassessed' : draft.result,
      assistance: draft.assistance, uncertainties: draft.uncertainties, confidence: draft.confidence, receivedAt: draft.receivedAt }))),
    mistakes, rewards: collections?.rewards ?? [],
  })
  const active = blocks.find(block => block.endedAt === undefined)
  const question = active?.questions.find(question => question.id === active.currentQuestionId)
  if (active && question) {
    const candidates = active.responses.filter(response => response.questionId === question.id)
    const response = active.currentResponseId ? candidates.find(response => response.id === active.currentResponseId) : candidates.length === 1 ? candidates[0] : undefined
    const actualDate = index.entries.find(entry => entry.termId === active.termId && entry.ownerId === active.id && entry.responseId === response?.id)?.answerDate
    state.task = { id: question.id, sessionId: active.id, subject: active.subject, topic: question.topic, prompt: question.prompt,
      hintLevel: Math.max(0, ...active.hints.filter(hint => hint.questionId === question.id).map(hint => hint.level)),
      ...(question.figure ? { figure: question.figure } : {}), ...(question.choices ? { choices: question.choices } : {}), ...(question.steps ? { steps: question.steps } : {}), ...(question.phase ? { phase: question.phase } : {}),
      ...(typeof question.objectiveId === 'string' ? { objectiveId: question.objectiveId } : {}),
      ...(response ? { responseId: response.id, response: response.response ?? response.rawResponse, rawResponse: response.rawResponse, ...(actualDate?.kind === 'instant' ? { answeredAt: actualDate.at } : {}) } : {}) }
  }
  attachEvidence(state, index)
  return scheduleMistakes(state, now)
}
