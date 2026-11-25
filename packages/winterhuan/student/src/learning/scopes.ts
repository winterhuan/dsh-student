import { builtinObjectivesIn, curriculumFor } from '../curriculum.ts'
import { effectiveKnowledge } from '../capabilities.ts'
import type { TermSettings } from '../files/schema.ts'
import type { ValidatedWorkspace } from '../files/validation.ts'

type LearningScope = Omit<NonNullable<TermSettings['learningScopes']>[number], 'parentConfirmation'>

/** Use existing school progress or the grade map without inventing a new parent confirmation. */
export function automaticLearningScopes(workspace: Pick<ValidatedWorkspace, 'settings' | 'collections'>): LearningScope[] {
  const { settings } = workspace
  const knowledge = effectiveKnowledge(workspace.collections?.knowledge)
  return (['chinese', 'math', 'english'] as const).flatMap(subject => {
    const course = settings.courses.find(item => item.subject === subject)
    const map = curriculumFor(settings.profile, subject)
    const current = map?.units.findIndex(unit => unit.id === course?.progress?.unitId) ?? -1
    const objectives = builtinObjectivesIn(settings.profile, subject).filter(objective => current < 0 || (course?.progress?.posture === 'catch-up' ? map!.units.findIndex(unit => unit.id === objective.unit) <= current : objective.unit === course!.progress!.unitId))
    return knowledge.goals.filter(goal => goal.subject === subject && writtenGoal(goal.id)).flatMap(goal => {
      const objective = objectives.find(item => goal.curriculumAssociationIds.includes(item.id))
      return objective ? [{ subject, goalIds: [goal.id], scope: { id: `auto-${objective.id}-${goal.id}`, description: [objective.title, objective.goal, ...(objective.questionPoints ?? [])].join('；').slice(0, 4000), modality: 'written' as const } }] : []
    })
  })
}

/** Explicit family choices override inferred defaults only for their own subject. */
export function effectiveLearningScopes(workspace: ValidatedWorkspace): LearningScope[] {
  const selected = workspace.settings.learningScopes ?? []
  const previous = [...workspace.blocks, ...workspace.worksheets].flatMap(file => (file.kind === 'block' ? file.questions : file.items).flatMap(question => question.capability ? [{ subject: file.subject, goalIds: [question.capability.goalId], scope: question.capability.scope }] : []))
  const reviews = (workspace.collections?.mistakes ?? []).flatMap(mistake => mistake.capability ? [{ subject: mistake.subject, goalIds: [mistake.capability.goalId], scope: mistake.capability.scope }] : [])
  return [...selected, ...[...previous, ...reviews, ...automaticLearningScopes(workspace)].filter(item => !selected.some(scope => scope.subject === item.subject))]
}

function writtenGoal(id: string): boolean {
  return !id.startsWith('e.speak') && !id.startsWith('e.listen') && !['c.read-aloud', 'c.recite', 'c.retell', 'c.describe', 'c.interact', 'c.listen', 'e.sound', 'e.view-listen', 'e.perform'].includes(id)
}
