import type { ErrorType, StudyState } from '../schema.ts'
import { builtinObjectives, builtinObjectivesIn, builtinObjectiveAnywhere, curriculumFor, type CurriculumMethod, type CurriculumScope, type CurriculumSubject } from '../curriculum.ts'
import { evidenceOf, evidenceDay, evidenceAtCutoff, demonstrablyAfter } from './evidence.ts'
import { dayStart, replayMistake } from './schedule.ts'
import { DAY, schoolGate, scopeSelects, studyDay, taughtUnit, type ObjectiveBase, type Outcome } from './shared.ts'
import { effectiveKnowledge, scopeSupports, type CapabilityScope } from '../capabilities.ts'
import type { ValidatedWorkspace } from '../files/validation.ts'
import type { Assessment } from '../files/schema.ts'
import type { EffectiveEvidence } from './evidence.ts'

/** Subject display order shared by check-in plans and history. */
export const SUBJECT_ORDER = ['chinese', 'math', 'english'] as const
const DIAGNOSIS_INTERVAL = 14 * DAY
const RECHECK_AFTER = 35 * DAY

/** A goal's evidence within one explicitly selected tested range. */
export interface CapabilityProgress {
  id: string; subject: CurriculumSubject; title: string; scope: CapabilityScope | null
  level: 'untouched' | 'practising' | 'weak' | 'due' | 'mastered'; independentDays: string[]
  firstMasteredDay?: string; recoveredDay?: string; baseline: boolean
  missingFamilyIds: string[]; missingCriteria: { familyId: string; criteria: NonNullable<Assessment['criteria']> }[]
  feedback: { termId: string; ownerId: string; responseId: string; familyId: string; result: EffectiveEvidence['result']; feedback: string; errorType?: ErrorType; sourceStatus: EffectiveEvidence['sourceStatus']; assistance: EffectiveEvidence['assistance']; answerDate: EffectiveEvidence['answerDate'] }[]
}
/** One continuation selected from validated files for the native tutor and workbench. */
export interface LearningNextAction {
  kind: 'answer' | 'assess' | 'supplement' | 'teach' | 'review' | 'learn' | 'hold'
  reason: 'unfinished-question' | 'pending-assessment' | 'missing-evidence' | 'current-gap' | 'prerequisite-gap' | 'due-review' | 'new-goal' | 'confirmed-scope-required'
  subject: CurriculumSubject; title: string; goalId?: string; familyId?: string; scope?: CapabilityScope
  blockId?: string; questionId?: string; responseId?: string; requirement?: string
  supplement?: { missingFamilyIds: string[]; missingCriteria: CapabilityProgress['missingCriteria']; maxNewQuestions: number; remaining: number }
  review?: { mistakeIds: string[]; familyIds: string[]; remaining: number }
}
/** The short-review round is reconstructed from completed formal blocks and actual answer days. */
export interface LearningContinuation { nextAction: LearningNextAction | null; goalProgress: CapabilityProgress[]; reviewRound: { limit: 2; usedFamilyIds: string[]; remaining: number; backlog: number } }

/**
 * Continue one current activity, bounded evidence check or review round without a workflow file.
 * @param workspace - independently validated current and explicitly referenced original term files.
 * @param state - shared evidence and review projection.
 * @param now - actual query cutoff.
 * @param subject - optional browsing subject; unfinished activity retains priority.
 * @returns one permitted action, scoped progress and the current two-mother review allowance.
 */
export function learningContinuation(workspace: ValidatedWorkspace, state: StudyState, now: number, subject?: CurriculumSubject): LearningContinuation {
  const knowledge = effectiveKnowledge(workspace.collections?.knowledge)
  const index = evidenceOf(state)
  const active = workspace.blocks.find(block => block.endedAt === undefined)
  const current = active?.questions.find(question => question.id === active.currentQuestionId)
  const ordered = workspace.blocks.slice().sort((a, b) => b.startedAt - a.startedAt || a.id.localeCompare(b.id))
  const questionBindings = ordered.flatMap(block => block.questions.flatMap(question => question.capability ? [{ block, binding: question.capability }] : []))
  const scopeFor = (goalId: string) => current?.capability?.goalId === goalId ? current.capability.scope : questionBindings.find(item => item.binding.goalId === goalId)?.binding.scope ?? workspace.archivedEvidence?.flatMap(archive => archive.references).find(reference => reference.goalId === goalId)?.scope
  const canonicalFamily = (id: string) => knowledge.familyAliases[id] ?? id
  const accepted = (entry: EffectiveEvidence) => entry.sourceStatus === 'known' && entry.result === 'correct'
  const independent = (entry: EffectiveEvidence) => accepted(entry) && entry.assistance === 'independent' && evidenceDay(entry) !== undefined
  const progress: CapabilityProgress[] = knowledge.goals.map(goal => {
    const scope = scopeFor(goal.id) ?? null
    const relevant = scope ? index.entries.filter(entry => entry.capability?.goalId === goal.id && scopeSupports(entry.capability.scope, scope) && (!entry.referenceScopes || entry.referenceScopes.some(reference => scopeSupports(reference, scope))) && (entry.answerDate.kind === 'unknown' || (entry.answerDate.kind === 'instant' ? entry.answerDate.at <= now : entry.answerDate.day <= studyDay(now)))) : []
    const dated = evidenceAtCutoff({ entries: relevant, stuckSignals: [] }, now)
    const familyIds = [...new Set(questionBindings.filter(item => item.binding.goalId === goal.id && scope && scopeSupports(item.binding.scope, scope)).map(item => canonicalFamily(item.binding.familyId))) ]
    const required = familyIds.length ? familyIds : [goal.familyIds[0]!]
    const missingAt = (entries: EffectiveEvidence[]) => required.map(familyId => ({ familyId, criteria: (['basic', 'method', 'variation'] as const).filter(criterion => !entries.some(entry => accepted(entry) && canonicalFamily(entry.capability!.familyId) === familyId && entry.criteria?.includes(criterion))) })).filter(item => item.criteria.length)
    const missingCriteria = missingAt(relevant)
    const days = [...new Set(dated.filter(independent).map(entry => evidenceDay(entry)!))].sort()
    const mistakes = state.mistakes.filter(mistake => mistake.subject === goal.subject && mistake.objectiveId === goal.id && mistake.confirmedAt !== undefined && mistake.confirmedAt <= now && (!scope || !index.entries.some(entry => entry.mistakeId === mistake.id && entry.capability) || index.entries.some(entry => entry.mistakeId === mistake.id && entry.capability && scopeSupports(entry.capability.scope, scope))))
    const difficultiesAt = (entries: EffectiveEvidence[], at: number) => entries.some(entry => {
      const day = evidenceDay(entry)
      const instant = entry.answerDate.kind === 'instant' ? entry.answerDate.at : day ? dayStart(day) + DAY - 1 : undefined
      return entry.sourceStatus === 'known' && instant !== undefined && instant >= at - 14 * DAY && (['incorrect', 'partial', 'stuck'].includes(entry.result) || entry.result === 'correct' && ['hint', 'worked-example'].includes(entry.assistance))
    })
    let firstMasteredDay: string | undefined
    for (const day of days) {
      const cut = dated.filter(entry => evidenceDay(entry)! <= day)
      const at = dayStart(day) + DAY - 1
      const open = mistakes.some(mistake => mistake.confirmedAt! <= at && (replayMistake(mistake, index, at).stage < 4 || (replayMistake(mistake, index, at).dueAt ?? Infinity) <= at))
      if (new Set(cut.filter(independent).map(evidenceDay)).size >= 3 && !missingAt(cut).length && !difficultiesAt(cut, at) && !open) { firstMasteredDay = day; break }
    }
    const weak = difficultiesAt(dated, now) || relevant.some(entry => entry.sourceStatus === 'known' && entry.answerDate.kind === 'unknown' && ['incorrect', 'partial', 'stuck'].includes(entry.result)) || mistakes.some(mistake => mistake.stage < 4)
    const due = mistakes.some(mistake => mistake.dueAt !== undefined && mistake.dueAt <= now) || !weak && days.length > 0 && days.length < 3 && days.at(-1)! < studyDay(now)
    const level = due ? 'due' : weak ? 'weak' : days.length >= 3 && !missingCriteria.length ? 'mastered' : relevant.length ? 'practising' : 'untouched'
    const baseline = firstMasteredDay !== undefined && dated.filter(entry => evidenceDay(entry)! <= firstMasteredDay!).every(entry => entry.termId !== workspace.settings.termId)
    const troubleDays = dated.filter(entry => firstMasteredDay && evidenceDay(entry)! > firstMasteredDay && ['incorrect', 'partial', 'stuck'].includes(entry.result)).map(entry => evidenceDay(entry)!).sort()
    const recovered = level === 'mastered' && troubleDays.length > 0 && days.at(-1)! > troubleDays.at(-1)!
    return { id: goal.id, subject: goal.subject, title: goal.title, scope, level, independentDays: days, baseline,
      ...(firstMasteredDay ? { firstMasteredDay } : {}), ...(recovered ? { recoveredDay: days.at(-1)! } : {}), missingFamilyIds: missingCriteria.map(item => item.familyId), missingCriteria,
      feedback: relevant.slice(-20).map(entry => ({ termId: entry.termId, ownerId: entry.ownerId, responseId: entry.responseId, familyId: canonicalFamily(entry.capability!.familyId), result: entry.result, feedback: entry.feedback ?? '', ...(entry.errorType ? { errorType: entry.errorType } : {}), sourceStatus: entry.sourceStatus, assistance: entry.assistance, answerDate: entry.answerDate })) }
  })
  const familyForMistake = (id: string) => {
    const entry = index.entries.find(entry => entry.mistakeId === id && entry.capability)
    return entry?.capability ? canonicalFamily(entry.capability.familyId) : `mistake:${id}`
  }
  const due = state.mistakes.filter(mistake => mistake.confirmedAt !== undefined && mistake.dueAt !== undefined && mistake.dueAt <= now && (!subject || mistake.subject === subject))
    .sort((a, b) => {
      const currentGoal = knowledge.goals.find(goal => goal.id === current?.capability?.goalId)
      return Number(!currentGoal?.prerequisites.includes(a.objectiveId ?? '')) - Number(!currentGoal?.prerequisites.includes(b.objectiveId ?? '')) || a.dueAt! - b.dueAt! || familyForMistake(a.id).localeCompare(familyForMistake(b.id)) || a.id.localeCompare(b.id)
    })
  const lastNew = ordered.find(block => block.mode !== 'review' && block.endedAt !== undefined)
  const reviewed = ordered.filter(block => block.mode === 'review' && block.endedAt !== undefined && (!lastNew || block.endedAt! > lastNew.endedAt!))
  const used = [...new Set(reviewed.flatMap(block => index.entries.filter(entry => entry.termId === workspace.settings.termId && entry.ownerId === block.id && entry.result !== 'unassessed' && entry.sourceStatus === 'known' && evidenceDay(entry) === studyDay(now)).map(entry => entry.capability ? canonicalFamily(entry.capability.familyId) : familyForMistake(entry.mistakeId ?? entry.questionId))))]
  const goalReviews = progress.filter(item => item.level === 'due' && item.scope && (!subject || item.subject === subject) && !due.some(mistake => mistake.objectiveId === item.id))
  const dueFamilies = [...new Set([...due.map(mistake => familyForMistake(mistake.id)), ...goalReviews.map(item => questionBindings.find(binding => binding.binding.goalId === item.id)?.binding.familyId ?? knowledge.goals.find(goal => goal.id === item.id)!.familyIds[0]!)])]
  const reviewRound = { limit: 2 as const, usedFamilyIds: used, remaining: Math.max(0, 2 - used.length), backlog: dueFamilies.length }
  const finish = (nextAction: LearningNextAction | null): LearningContinuation => ({ nextAction, goalProgress: progress.filter(item => item.scope !== null || item.feedback.length > 0), reviewRound })
  const actionFor = (goalId: string, kind: LearningNextAction['kind'], reason: LearningNextAction['reason'], scope?: CapabilityScope): LearningNextAction => {
    const goal = knowledge.goals.find(goal => goal.id === goalId)!
    const item = progress.find(item => item.id === goalId)!
    const familyId = item.missingFamilyIds[0] ?? questionBindings.find(item => item.binding.goalId === goalId)?.binding.familyId ?? goal.familyIds[0]!
    const family = knowledge.families.find(family => family.id === canonicalFamily(familyId))!
    const selectedScope = scope ?? item.scope ?? undefined
    const feedback = progress.filter(item => item.subject === goal.subject).flatMap(item => item.feedback).sort((a, b) => {
      const day = (date: EffectiveEvidence['answerDate']) => date.kind === 'day' ? date.day : date.kind === 'instant' ? studyDay(date.at) : ''
      return day(a.answerDate).localeCompare(day(b.answerDate))
    })
    const boundedScope = selectedScope ? { ...selectedScope, description: selectedScope.description.slice(0, 200), ...(selectedScope.vocabulary ? { vocabulary: selectedScope.vocabulary.slice(0, 8), omittedVocabulary: Math.max(0, selectedScope.vocabulary.length - 8), useOnlyListedVocabulary: true } : {}) } : null
    const requirement = JSON.stringify({ goalId, title: goal.title.slice(0, 200), criterion: goal.criterion.slice(0, 600), scope: boundedScope, familyId: family.id, method: family.coreMethod.slice(0, 200), structure: family.structure.slice(0, 200), variationAxes: family.variationAxes.slice(0, 4).map(axis => axis.slice(0, 100)), rubric: family.representative.rubric.slice(0, 400), action: kind,
      missingCriteria: item.missingCriteria.slice(0, 3), omittedCriteria: Math.max(0, item.missingCriteria.length - 3), feedback: feedback.slice(-3).map(row => ({ ...row, feedback: row.feedback.slice(0, 200), answerDate: row.answerDate.kind === 'day' ? { kind: 'day', day: row.answerDate.day } : row.answerDate.kind === 'instant' ? { kind: 'instant', at: row.answerDate.at } : { kind: 'unknown' } })), omittedFeedback: Math.max(0, feedback.length - 3), reviewFindings: state.mistakes.filter(mistake => mistake.subject === goal.subject).slice(0, 4).map(mistake => ({ topic: mistake.topic.slice(0, 100), errorType: mistake.errorType ?? null, stage: mistake.stage, dueAt: mistake.dueAt ?? null })),
      teaching: 'Use the appropriate official direct component, short content or full classroom. Ask one question at a time; address the saved error before a constrained variant. Preserve unknown facts; clicks and scores create no evidence. Reuse accepted responses; add at most three targeted native questions for missing criteria.' })
    return { kind, reason, subject: goal.subject, title: goal.title, goalId, familyId: family.id, ...(selectedScope ? { scope: selectedScope } : {}), ...(active ? { blockId: active.id } : {}), requirement }
  }
  if (active && current) {
    const originals = active.responses.filter(response => response.questionId === current.id)
    const selected = originals.find(response => response.id === active.currentResponseId) ?? originals.at(-1)
    const base = current.capability ? actionFor(current.capability.goalId, 'answer', 'unfinished-question') : { kind: 'answer' as const, reason: 'unfinished-question' as const, subject: active.subject, title: current.topic }
    if (!selected) return finish({ ...base, blockId: active.id, questionId: current.id })
    const effective = index.entries.find(entry => entry.termId === active.termId && entry.ownerId === active.id && entry.responseId === selected.id)
    if (!active.assessments.some(assessment => assessment.responseId === selected.id)) return finish({ ...base, kind: 'assess', reason: 'pending-assessment', blockId: active.id, questionId: current.id, responseId: selected.id })
    if (current.capability) {
      const item = progress.find(item => item.id === current.capability!.goalId)!
      if (effective?.sourceStatus === 'known' && (['incorrect', 'partial', 'stuck'].includes(effective.result) || ['hint', 'worked-example'].includes(effective.assistance))) return finish(actionFor(item.id, 'teach', 'current-gap'))
      const goal = knowledge.goals.find(goal => goal.id === item.id)!
      const prerequisite = goal.prerequisites.find(id => {
        const rows = index.entries.filter(entry => entry.capability?.goalId === id && scopeSupports(entry.capability.scope, current.capability!.scope))
        return rows.some(entry => entry.sourceStatus === 'known' && ['incorrect', 'partial', 'stuck'].includes(entry.result)) && !rows.some(entry => independent(entry) && rows.filter(row => ['incorrect', 'partial', 'stuck'].includes(row.result)).every(row => demonstrablyAfter(entry, row)))
      })
      if (prerequisite) return finish(actionFor(prerequisite, 'teach', 'prerequisite-gap', current.capability.scope))
      if (item.missingCriteria.length || effective?.result === 'unassessed' || effective?.sourceStatus === 'unknown' || effective?.assistance === 'unknown' || effective?.answerDate.kind === 'unknown') {
        const nativeQuestions = active.questions.filter(question => question.capability?.goalId === item.id && !question.openmaic && question.phase !== 'demo').length
        const remaining = Math.max(0, 3 - nativeQuestions)
        if (remaining) return finish({ ...actionFor(item.id, 'supplement', 'missing-evidence'), supplement: { missingFamilyIds: item.missingFamilyIds, missingCriteria: item.missingCriteria, maxNewQuestions: 3, remaining } })
      }
    }
    const next = active.questions.find(question => !active.responses.some(response => response.questionId === question.id))
    if (next) return finish({ ...(next.capability ? actionFor(next.capability.goalId, 'answer', 'unfinished-question') : base), blockId: active.id, questionId: next.id })
    if (current.capability) {
      const item = progress.find(item => item.id === current.capability!.goalId)!
      if (item.level === 'weak' && item.scope) return finish(actionFor(item.id, 'teach', 'current-gap'))
    }
  }
  const remainingDue = due.filter(mistake => !used.includes(familyForMistake(mistake.id)))
  if (reviewRound.remaining && remainingDue.length) {
    const selectedFamilies = [...new Set(remainingDue.map(mistake => familyForMistake(mistake.id)))].slice(0, reviewRound.remaining)
    const selected = remainingDue.filter(mistake => selectedFamilies.includes(familyForMistake(mistake.id)))
    const first = selected[0]!
    const scope = index.entries.find(entry => entry.mistakeId === first.id && entry.capability)?.capability?.scope
    const base = first.objectiveId && knowledge.goals.some(goal => goal.id === first.objectiveId) ? actionFor(first.objectiveId, 'review', 'due-review', scope) : { kind: 'review' as const, reason: 'due-review' as const, subject: first.subject, title: first.topic }
    return finish({ ...base, review: { mistakeIds: selected.map(mistake => mistake.id), familyIds: selectedFamilies, remaining: reviewRound.remaining } })
  }
  const goalReview = goalReviews.find(item => !used.includes(questionBindings.find(binding => binding.binding.goalId === item.id)?.binding.familyId ?? knowledge.goals.find(goal => goal.id === item.id)!.familyIds[0]!))
  if (reviewRound.remaining && goalReview) {
    const action = actionFor(goalReview.id, 'review', 'due-review')
    return finish({ ...action, review: { mistakeIds: [], familyIds: [action.familyId!], remaining: reviewRound.remaining } })
  }
  const selectedSubject = active?.subject ?? subject
  const newGoal = progress.find(item => (!selectedSubject || item.subject === selectedSubject) && item.level === 'untouched' && item.scope && questionBindings.some(binding => binding.binding.goalId === item.id && binding.block.context.scope?.objectiveIds?.includes(item.id)))
  if (newGoal) return finish(actionFor(newGoal.id, 'learn', 'new-goal'))
  const schoolGoal = knowledge.goals.find(goal => (!selectedSubject || goal.subject === selectedSubject) && progress.find(item => item.id === goal.id)?.level === 'untouched' && workspace.settings.courses.some(course => course.subject === goal.subject && course.progress?.pace !== 'review' && goal.curriculumAssociationIds.some(id => { const old = builtinObjectiveAnywhere(id); return old && taughtUnit(state, goal.subject, old.unit) })))
  if (schoolGoal) {
    const scope = scopeFor(schoolGoal.id)
    if (scope) return finish(actionFor(schoolGoal.id, 'learn', 'new-goal', scope))
  }
  return finish({ kind: 'hold', reason: 'confirmed-scope-required', subject: selectedSubject ?? 'math', title: 'Confirm the next learning range or choose another allowed activity.' })
}

/** Why an objective needs attention; codes are localized by the workbench and read by the model. */
export interface InsightReason {
  code: 'due-mistakes' | 'open-mistakes' | 'recent-help-or-error' | 'recurring-error' | 'not-practised-recently' | 'not-started' | 'diagnosis-due' | 'preview' | 'school-pace' | 'needs-teaching' | 'prerequisite-gap'
  count: number
}

/** One objective's mastery derived from saved attempts, paper results and linked mistakes. */
export interface ObjectiveInsight {
  id: string
  subject: CurriculumSubject
  title: string
  goal: string
  method: CurriculumMethod
  unit: string
  unitName: string
  conceptIds: string[]
  level: 'due' | 'weak' | 'stalled' | 'mastered' | 'practising' | 'untouched'
  independentDays: number
  attempts: number
  helpedOrWrong: number
  lastAt?: number
  /** Actual day when the latest evidence has day precision rather than an exact instant. */
  lastDay?: string
  activeMistakes: number
  dueMistakes: number
  masteredMistakes: number
  errorTypes: { type: ErrorType; count: number }[]
  priority: number
  reasons: InsightReason[]
}

/** How much one check-in block probes: three quick choice questions, six mixed, or twelve with reasoning and progress re-checks. */
export type CheckInIntensity = 'light' | 'standard' | 'deep'
/** Objectives probed per intensity. */
export const checkInSizes: Record<CheckInIntensity, number> = { light: 3, standard: 6, deep: 12 }

/** One objective selected for a check-in and why. */
export interface DiagnosticSample { id: string; title: string; unit: string; unitName: string; reason: 'untouched' | 'stalled' | 'recheck' | 'progress' }

/** One subject's recurring check-in plan: whether a check-in is due, coverage so far and the objectives to probe per intensity. */
export interface DiagnosticPlan {
  subject: CurriculumSubject
  due: boolean
  lastAt?: number
  nextAt?: number
  untouched: number
  stalled: number
  recheck: number
  coverage: { probed: number; total: number }
  recommendedIntensity: CheckInIntensity
  sample: DiagnosticSample[]
  samples: Record<CheckInIntensity, DiagnosticSample[]>
  scope?: CurriculumScope & { units?: string[] | undefined; objectiveIds?: string[] | undefined }
}

/** One recorded check-in block with its answers and counts. */
export interface CheckInRecord {
  subject: CurriculumSubject
  sessionId: string
  startedAt: number
  endedAt: number | null
  intensity: CheckInIntensity
  counts: { independent: number; helped: number; wrong: number; unassessed: number }
  results: { id: string; objectiveId: string | null; title: string; result: StudyState['attempts'][number]['result']; assistance: StudyState['attempts'][number]['assistance'] }[]
}

/** One non-scored "explain it back" nudge derived from today's evidence; never part of mastery. */
export interface UnderstandingReminder {
  code: 'first-explain' | 'after-correction' | 'before-next'
  subject: CurriculumSubject
  objectiveId?: string
  title: string
}

/** Cross-subject insight: every objective's mastery, the weakest points, check-in plans, the error-cause profile and the next recommended step. */
export interface StudyInsight {
  objectives: ObjectiveInsight[]
  weakPoints: ObjectiveInsight[]
  diagnostics: DiagnosticPlan[]
  recommendation: {
    kind: 'review' | 'practice' | 'diagnose' | 'learn' | 'preview' | 'hold'
    subject: CurriculumSubject
    objectiveId?: string
    title?: string
    reason: InsightReason
    /** Confirmed school unit name for this subject, when the parent has saved one. */
    unitName?: string
    /** When practice redirects to an unmet prerequisite, the goal that raised the need. */
    redirectedFrom?: { id: string; title: string }
  } | null
  /** At most two due mistakes to clear today. A longer overdue list stays in `dueBacklog`. */
  dueToday: DueClear[]
  /** Confirmed due mistakes inside the suggestion range, including `dueToday`. */
  dueBacklog: number
  /** The same next step, due list and weak points, limited to one subject for the desk. */
  subjectSteps: Record<CurriculumSubject, SubjectStep>
  errorProfile: { subject: CurriculumSubject; type: ErrorType; count: number; objectiveIds: string[] }[]
  understandingReminders: UnderstandingReminder[]
}

/** One subject's desk step: recommendation, the two due clears, and the weak points inside that subject. */
export interface SubjectStep {
  recommendation: StudyInsight['recommendation']
  dueToday: DueClear[]
  dueBacklog: number
  weakPoints: ObjectiveInsight[]
}

/** One due mistake the Today page asks the learner to clear. */
export interface DueClear {
  id: string
  subject: CurriculumSubject
  topic: string
  objectiveId?: string
}


function lastEvidenceCutoff(item: ObjectiveInsight): number | undefined { return item.lastAt ?? (item.lastDay ? dayStart(item.lastDay) + DAY - 1 : undefined) }

function outcomeIndex(state: StudyState, now: number): Map<string, Outcome[]> {
  const index = new Map<string, Outcome[]>()
  for (const item of evidenceAtCutoff(evidenceOf(state), now)) {
    if (!item.objectiveId) continue
    const day = evidenceDay(item)!
    const outcome: Outcome = { at: item.answerDate.kind === 'instant' ? item.answerDate.at : dayStart(day) + DAY - 1, day, precision: item.answerDate.kind === 'instant' ? 'instant' : 'day', result: item.result, assistance: item.assistance, evidence: item }
    index.set(item.objectiveId, [...index.get(item.objectiveId) ?? [], outcome])
  }
  return index
}

/**
 * Whether this objective still needs a teaching block.
 * One "不会" stays until a later independent correct. Correct only with help, and a teaching-queue item
 * with no independent correct after it was confirmed, do the same.
 */
function teachingNeeded(outcomes: Outcome[], queue: { confirmedAt: number }[]): boolean {
  const stuckAt = outcomes.flatMap(item => item.result === 'stuck' ? [item.at] : [])
  const latestStuck = stuckAt.length > 0 ? Math.max(...stuckAt) : undefined
  if (latestStuck !== undefined && !outcomes.some(item => (item.evidence ? outcomes.filter(entry => entry.result === 'stuck' && entry.evidence).every(entry => demonstrablyAfter(item.evidence!, entry.evidence!)) : item.at > latestStuck) && item.result === 'correct' && item.assistance === 'independent')) return true
  const independentCorrect = outcomes.some(item => item.result === 'correct' && item.assistance === 'independent')
  if (!independentCorrect && outcomes.some(item => item.result === 'correct' && ['hint', 'worked-example'].includes(item.assistance))) return true
  return queue.some(item => !outcomes.some(outcome => (outcome.evidence ? demonstrablyAfter(outcome.evidence, item.confirmedAt) : outcome.at >= item.confirmedAt) && outcome.result === 'correct' && outcome.assistance === 'independent'))
}

/**
 * One objective's mastery derived from its outcome evidence, its confirmed mistakes and the teaching queue.
 * One rule serves the current-term insight and every cross-grade check-in plan; an objective never
 * independently answered that was recently wrong counts as weak, and a recurring error cause raises priority.
 */
function masteryOf(state: StudyState, base: ObjectiveBase, outcomes: Outcome[], now: number): ObjectiveInsight {
  const independentDays = new Set(outcomes.filter(item => item.result === 'correct' && item.assistance === 'independent').map(item => studyDay(item.at)))
  const lastAt = outcomes.reduce<number | undefined>((latest, item) => latest === undefined || item.at > latest ? item.at : latest, undefined)
  const helpedOrWrong = outcomes.filter(item => item.at >= now - 14 * DAY && (item.result === 'incorrect' || item.result === 'partial' || (item.result === 'correct' && ['hint', 'worked-example'].includes(item.assistance)))).length
  const wrongRecent = outcomes.filter(item => item.at >= now - 14 * DAY && (item.result === 'incorrect' || item.result === 'partial')).length
  const mistakes = state.mistakes.filter(item => item.objectiveId === base.id && item.confirmedAt !== undefined && item.confirmedAt <= now)
  const dueMistakes = mistakes.filter(item => item.dueAt !== undefined && item.dueAt <= now).length
  const activeMistakes = mistakes.filter(item => item.stage < 4).length
  const causeCounts = new Map<ErrorType, number>()
  for (const mistake of mistakes) if (mistake.errorType !== undefined) causeCounts.set(mistake.errorType, (causeCounts.get(mistake.errorType) ?? 0) + 1)
  const errorTypes = [...causeCounts.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)).slice(0, 5)
  const recurringTypes = [...causeCounts.values()].filter(count => count >= 2).length
  const queue = [...state.teachingQueue.filter(item => item.objectiveId === base.id && item.confirmedAt <= now), ...evidenceOf(state).stuckSignals.filter(item => item.objectiveId === base.id && item.at <= now).map(item => ({ confirmedAt: item.at }))]
  const teaching = teachingNeeded(outcomes, queue)
  const weak = teaching || activeMistakes >= 2 || helpedOrWrong >= 2 || (independentDays.size === 0 && wrongRecent >= 1)
  const stalled = !weak && independentDays.size < 3 && lastAt !== undefined && now - lastAt > 10 * DAY
  const level = dueMistakes > 0 ? 'due' : weak ? 'weak'
    : independentDays.size >= 3 && activeMistakes === 0 && helpedOrWrong === 0 ? 'mastered' : stalled ? 'stalled'
      : lastAt !== undefined || mistakes.length > 0 ? 'practising' : 'untouched'
  const reasons: InsightReason[] = []
  if (dueMistakes > 0) reasons.push({ code: 'due-mistakes', count: dueMistakes })
  if (teaching) reasons.push({ code: 'needs-teaching', count: 1 })
  if (activeMistakes > 0) reasons.push({ code: 'open-mistakes', count: activeMistakes })
  if (helpedOrWrong > 0) reasons.push({ code: 'recent-help-or-error', count: helpedOrWrong })
  if (recurringTypes > 0) reasons.push({ code: 'recurring-error', count: recurringTypes })
  if (stalled && lastAt !== undefined) reasons.push({ code: 'not-practised-recently', count: Math.floor((now - lastAt) / DAY) })
  if (level === 'untouched') reasons.push({ code: 'not-started', count: 0 })
  const priority = level === 'mastered' ? 0
    : (teaching ? 64 : 0) + dueMistakes * 40 + Math.min(36, helpedOrWrong * 12) + Math.min(24, activeMistakes * 8) + Math.min(16, recurringTypes * 8) + (stalled ? 10 : 0) + (level === 'untouched' ? 5 : 0)
  const dateOnlyLatest = lastAt !== undefined && outcomes.some(item => item.precision === 'day' && item.day === studyDay(lastAt))
  return { ...base, level, independentDays: independentDays.size, attempts: outcomes.length, helpedOrWrong,
    ...(lastAt !== undefined ? dateOnlyLatest ? { lastDay: studyDay(lastAt) } : { lastAt } : {}), activeMistakes, dueMistakes, masteredMistakes: mistakes.length - activeMistakes, errorTypes, priority, reasons }
}

/** New learning stays inside the current unit, or inside every taught unit when catching up, unless a session scope overrides. A review week adds none. */
function learnable(state: StudyState, item: ObjectiveInsight, scope?: CurriculumScope & { units?: string[] | undefined; objectiveIds?: string[] | undefined }): boolean {
  if (item.level !== 'untouched') return false
  if (scope !== undefined) return scopeSelects(scope, item.subject, item.unit, item.id)
  const gate = schoolGate(state, item.subject)
  if (!gate) return true
  if (gate.pace === 'review') return false
  if (gate.posture === 'catch-up') return gate.taught.has(item.unit)
  return item.unit === gate.current
}


/**
 * Derive mastery, weak points and the next step from saved evidence and the shipped knowledge maps.
 * Confirmed mistakes, independent answers on different days and paper results are the only evidence;
 * a helped or wrong answer counts against independence, and an unassessed answer is not an error.
 * A check-in (diagnose block) is due per subject every fourteen days while untouched, stalled or long-mastered
 * objectives remain to probe; its sample rotates across units. The confirmed school frontier is the default
 * suggestion range, not a hard gate: a session scope (grade, term, units or objective IDs) can override it
 * for cross-grade or custom diagnosis and learning. Without a scope, check-ins, weak points and new goals
 * stay in the confirmed unit and earlier ones; preview, if enabled, offers only the next unit after the
 * current unit has no new goal, and a review week adds no new goal.
 * @param state - current durable learning state.
 * @param now - host wall-clock time in milliseconds.
 * @returns objective insights, the five weakest points, per-subject check-in plans, at most two due clears and one recommendation.
 */
export function studyInsight(state: StudyState, now: number): StudyInsight {
  const outcomes = outcomeIndex(state, now)
  const objectives: ObjectiveInsight[] = []
  const seen = new Set<string>()
  const include = (base: ObjectiveBase) => {
    if (seen.has(base.id)) return
    seen.add(base.id)
    objectives.push(masteryOf(state, base, outcomes.get(base.id) ?? [], now))
  }
  for (const objective of builtinObjectives(state.profile)) include(objective)
  for (const objective of state.objectives) include({ ...objective, unit: '', unitName: '' })
  const diagnosticPlan = (subject: CurriculumSubject, pool: ObjectiveInsight[], scope?: CurriculumScope & { units?: string[] | undefined; objectiveIds?: string[] | undefined }): DiagnosticPlan => {
    const lastAt = state.sessions.filter(item => item.mode === 'diagnose' && item.subject === subject).reduce<number | undefined>((latest, item) => latest === undefined || item.startedAt > latest ? item.startedAt : latest, undefined)
    const pick = (item: ObjectiveInsight, reason: DiagnosticSample['reason']): DiagnosticSample => ({ id: item.id, title: item.title, unit: item.unit, unitName: item.unitName, reason })
    const untouched = pool.filter(item => item.level === 'untouched')
    const stalled = pool.filter(item => item.level === 'stalled')
    const recheck = pool.filter(item => item.level === 'mastered' && lastEvidenceCutoff(item) !== undefined && now - lastEvidenceCutoff(item)! >= RECHECK_AFTER)
    const progress = pool.filter(item => item.level === 'practising')
    const rotated: DiagnosticSample[] = []
    const byUnit = new Map<string, ObjectiveInsight[]>()
    for (const item of untouched) byUnit.set(item.unit, [...(byUnit.get(item.unit) ?? []), item])
    for (let round = 0; round <= untouched.length && rotated.length < untouched.length; round += 1) {
      for (const list of byUnit.values()) {
        const item = list[round]
        if (item) rotated.push(pick(item, 'untouched'))
      }
    }
    const candidates = [...rotated, ...stalled.map(item => pick(item, 'stalled')), ...recheck.map(item => pick(item, 'recheck'))]
    const samples: Record<CheckInIntensity, DiagnosticSample[]> = {
      light: candidates.slice(0, checkInSizes.light),
      standard: candidates.slice(0, checkInSizes.standard),
      deep: [...candidates, ...progress.map(item => pick(item, 'progress'))].slice(0, checkInSizes.deep),
    }
    const count = untouched.length + stalled.length + recheck.length
    const recommendedIntensity: CheckInIntensity = count <= checkInSizes.light ? 'light' : count >= 10 && lastAt !== undefined ? 'deep' : 'standard'
    const due = samples.standard.length > 0 && (lastAt === undefined || now - lastAt >= DIAGNOSIS_INTERVAL)
    return { subject, due, ...(lastAt !== undefined ? { lastAt, nextAt: lastAt + DIAGNOSIS_INTERVAL } : {}), untouched: untouched.length, stalled: stalled.length, recheck: recheck.length,
      coverage: { probed: pool.length - untouched.length, total: pool.length }, recommendedIntensity, sample: samples.standard, samples, ...(scope !== undefined ? { scope } : {}) }
  }
  const diagnostics: DiagnosticPlan[] = SUBJECT_ORDER.map(subject => diagnosticPlan(subject, objectives.filter(item => item.subject === subject && taughtUnit(state, subject, item.unit))))
  // Teaching follows prerequisite edges: a goal that needs teaching may rest on an earlier unmet goal,
  // and practice then redirects there first, nearest prerequisite ahead.
  const objectivesByConcept = new Map<string, ObjectiveInsight[]>()
  for (const item of objectives) for (const conceptId of item.conceptIds) objectivesByConcept.set(conceptId, [...(objectivesByConcept.get(conceptId) ?? []), item])
  const prerequisiteGap = (goal: ObjectiveInsight): ObjectiveInsight | undefined => {
    const file = curriculumFor(state.profile, goal.subject)
    if (!file) return undefined
    const seen = new Set<string>([goal.id])
    const queue = [...goal.conceptIds]
    while (queue.length > 0) {
      const conceptId = queue.shift()
      if (conceptId === undefined) break
      for (const relation of file.relations) {
        if (relation.kind !== 'prerequisite' || relation.toId !== conceptId) continue
        for (const candidate of objectivesByConcept.get(relation.fromId) ?? []) {
          if (seen.has(candidate.id)) continue
          seen.add(candidate.id)
          if (candidate.level !== 'mastered' && candidate.level !== 'due' && taughtUnit(state, candidate.subject, candidate.unit)) return candidate
          queue.push(...candidate.conceptIds)
        }
      }
    }
    return undefined
  }
  const gapRedirects = new Map<string, { id: string; title: string }>()
  for (const goal of objectives) {
    if (!goal.reasons.some(reason => reason.code === 'needs-teaching')) continue
    const gap = prerequisiteGap(goal)
    if (gap === undefined || gap.id === goal.id) continue
    if (!gap.reasons.some(reason => reason.code === 'prerequisite-gap')) gap.reasons.push({ code: 'prerequisite-gap', count: 1 })
    gap.priority += 30
    if (!gapRedirects.has(goal.id)) gapRedirects.set(goal.id, { id: gap.id, title: gap.title })
  }
  const rankedWeak = objectives.filter(item => (item.level === 'due' || item.level === 'weak' || item.level === 'stalled') && taughtUnit(state, item.subject, item.unit))
    .sort((a, b) => b.priority - a.priority)
  const weakPoints = rankedWeak.slice(0, 5)
  const dueMistake = (item: StudyState['mistakes'][number]) => {
    if (item.confirmedAt === undefined || item.dueAt === undefined || item.dueAt > now) return false
    if (!item.objectiveId) return true
    const objective = objectives.find(candidate => candidate.id === item.objectiveId)
    return taughtUnit(state, item.subject, objective?.unit ?? '')
  }
  const dueItems = state.mistakes.filter(dueMistake).sort((left, right) => (left.dueAt ?? 0) - (right.dueAt ?? 0) || left.id.localeCompare(right.id))
  const clearOf = (items: StudyState['mistakes']): DueClear[] => items.slice(0, 2).map(item => ({
    id: item.id, subject: item.subject, topic: item.topic, ...(item.objectiveId !== undefined ? { objectiveId: item.objectiveId } : {}),
  }))
  // The desk asks for one subject at a time. The same cascade runs inside that subject so a math goal does not stay on the Chinese tab.
  const stepFor = (subject?: CurriculumSubject) => {
    const match = (item: { subject: CurriculumSubject }) => subject === undefined || item.subject === subject
    const subjectDue = dueItems.filter(match)
    const dueSlice = clearOf(subjectDue)
    const ranked = rankedWeak.filter(match)
    const teachingGoal = objectives.filter(item => match(item) && item.reasons.some(reason => reason.code === 'needs-teaching') && taughtUnit(state, item.subject, item.unit))
      .sort((a, b) => b.priority - a.priority)[0]
    const queued = state.teachingQueue.filter(item => item.objectiveId === undefined && match(item)).sort((a, b) => a.confirmedAt - b.confirmedAt)[0]
    const redirect = teachingGoal ? gapRedirects.get(teachingGoal.id) : undefined
    // A single due mistake does not take the main path. Practice still wins when the goal needs teaching,
    // has repeated recent errors, has two open mistakes, or has gone stale.
    const practiceWeak = (subject === undefined ? ranked.slice(0, 5) : ranked).find(item => {
      if (item.level === 'weak' || item.level === 'stalled') return true
      if (item.reasons.some(reason => reason.code === 'needs-teaching' || reason.code === 'not-practised-recently' || reason.code === 'prerequisite-gap')) return true
      const recent = item.reasons.find(reason => reason.code === 'recent-help-or-error')
      if (recent !== undefined && recent.count >= 2) return true
      const open = item.reasons.find(reason => reason.code === 'open-mistakes')
      return open !== undefined && open.count >= 2
    })
    const checkIn = diagnostics.filter(plan => plan.due && match(plan)).sort((a, b) => b.sample.length - a.sample.length)[0]
    const untouched = objectives.find(item => match(item) && learnable(state, item))
    const preview = objectives.find(item => match(item) && item.level === 'untouched' && schoolGate(state, item.subject)?.previewUnit === item.unit)
    const held = objectives.find(item => match(item) && item.level === 'untouched' && schoolGate(state, item.subject) !== undefined && !learnable(state, item) && schoolGate(state, item.subject)?.previewUnit !== item.unit)
    const recommendation: StudyInsight['recommendation'] = teachingGoal && redirect
      ? { kind: 'practice', subject: teachingGoal.subject, objectiveId: redirect.id, title: redirect.title, reason: { code: 'prerequisite-gap', count: 1 }, redirectedFrom: { id: teachingGoal.id, title: teachingGoal.title } }
      : teachingGoal
        ? { kind: 'practice', subject: teachingGoal.subject, objectiveId: teachingGoal.id, title: teachingGoal.title, reason: { code: 'needs-teaching', count: 1 } }
        : queued
          ? { kind: 'practice', subject: queued.subject, title: queued.prompt.slice(0, 40), reason: { code: 'needs-teaching', count: 1 } }
          : practiceWeak
            ? { kind: 'practice', subject: practiceWeak.subject, objectiveId: practiceWeak.id, title: practiceWeak.title, reason: practiceWeak.reasons.find(reason => reason.code !== 'due-mistakes') ?? practiceWeak.reasons[0] ?? { code: 'recent-help-or-error', count: 0 } }
            : checkIn
              ? { kind: 'diagnose', subject: checkIn.subject, reason: { code: 'diagnosis-due', count: checkIn.sample.length } }
              : untouched
                ? { kind: 'learn', subject: untouched.subject, objectiveId: untouched.id, title: untouched.title, reason: { code: 'not-started', count: 0 } }
                : preview
                  ? { kind: 'preview', subject: preview.subject, objectiveId: preview.id, title: preview.title, reason: { code: 'preview', count: 0 } }
                  : held
                    ? { kind: 'hold', subject: held.subject, reason: { code: 'school-pace', count: 0 } }
                    : dueSlice[0]
                      ? { kind: 'review', subject: dueSlice[0].subject, ...(dueSlice[0].objectiveId !== undefined ? { objectiveId: dueSlice[0].objectiveId } : {}), title: dueSlice[0].topic.slice(0, 40), reason: { code: 'due-mistakes', count: dueSlice.length } }
                      : null
    const unitId = recommendation === null ? undefined : state.courses.find(item => item.subject === recommendation.subject)?.progress?.unitId
    const unitName = unitId !== undefined && recommendation !== null ? curriculumFor(state.profile, recommendation.subject)?.units.find(unit => unit.id === unitId)?.name : undefined
    return {
      recommendation: recommendation !== null && unitName !== undefined ? { ...recommendation, unitName } : recommendation,
      dueToday: dueSlice,
      dueBacklog: subjectDue.length,
      weakPoints: ranked.slice(0, 5),
    }
  }
  const across = stepFor()
  const subjectSteps = {
    chinese: stepFor('chinese'),
    math: stepFor('math'),
    english: stepFor('english'),
  }
  const recommendation = across.recommendation
  const dueToday = across.dueToday
  const dueBacklog = across.dueBacklog
  const profileCounts = new Map<string, { subject: CurriculumSubject; type: ErrorType; count: number; objectiveIds: Set<string> }>()
  for (const mistake of state.mistakes) {
    if (mistake.confirmedAt === undefined || mistake.errorType === undefined) continue
    const unit = mistake.objectiveId !== undefined ? objectives.find(item => item.id === mistake.objectiveId)?.unit ?? '' : ''
    if (!taughtUnit(state, mistake.subject, unit)) continue
    const key = `${mistake.subject}:${mistake.errorType}`
    const entry = profileCounts.get(key) ?? { subject: mistake.subject, type: mistake.errorType, count: 0, objectiveIds: new Set<string>() }
    entry.count += 1
    if (mistake.objectiveId !== undefined) entry.objectiveIds.add(mistake.objectiveId)
    profileCounts.set(key, entry)
  }
  const errorProfile = [...profileCounts.values()].map(entry => ({ subject: entry.subject, type: entry.type, count: entry.count, objectiveIds: [...entry.objectiveIds] }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)).slice(0, 5)
  const today = studyDay(now)
  const understandingReminders: UnderstandingReminder[] = []
  const remind = (item: ObjectiveInsight, code: UnderstandingReminder['code']): void => {
    if (understandingReminders.length >= 3 || understandingReminders.some(reminder => reminder.code === code && reminder.objectiveId === item.id)) return
    understandingReminders.push({ code, subject: item.subject, objectiveId: item.id, title: item.title })
  }
  for (const item of objectives) {
    const history = outcomes.get(item.id) ?? []
    if (history.some(outcome => outcome.result !== 'stuck') && item.independentDays === 0 && history.every(outcome => studyDay(outcome.at) === today)) remind(item, 'first-explain')
  }
  for (const mistake of state.mistakes) {
    if (mistake.confirmedAt === undefined || !mistake.independentDays.includes(today)) continue
    const item = mistake.objectiveId !== undefined ? objectives.find(candidate => candidate.id === mistake.objectiveId) : undefined
    if (item !== undefined) remind(item, 'after-correction')
    else if (understandingReminders.length < 3) understandingReminders.push({ code: 'after-correction', subject: mistake.subject, title: mistake.topic })
  }
  if (recommendation !== null && (recommendation.kind === 'preview' || recommendation.kind === 'learn') && recommendation.objectiveId !== undefined) {
    const nextTarget = objectives.find(candidate => candidate.id === recommendation.objectiveId)
    const practised = objectives.filter(candidate => lastEvidenceCutoff(candidate) !== undefined).sort((a, b) => (lastEvidenceCutoff(b) ?? 0) - (lastEvidenceCutoff(a) ?? 0))[0]
    if (nextTarget !== undefined && (recommendation.kind === 'preview' || practised === undefined || practised.unit !== nextTarget.unit)) remind(nextTarget, 'before-next')
  }
  return { objectives, weakPoints, diagnostics, recommendation, dueToday, dueBacklog, subjectSteps, errorProfile, understandingReminders }
}

/**
 * A check-in plan for an explicit scope: custom objectives, specific units, or a whole cross-grade map.
 * The scope overrides the confirmed school frontier for this plan; the caller may pass a precomputed
 * insight for the same state and time. Objectives outside the profile use the same mastery rule as the
 * current-term insight.
 * @param state - current durable learning state.
 * @param subject - subject to plan for.
 * @param now - host wall-clock time in milliseconds.
 * @param scope - grade and term with optional unit or objective narrowing.
 * @param insight - precomputed insight for the same state and time, when the caller already has one.
 * @returns the plan for the scoped pool.
 */
export function diagnosticFor(state: StudyState, subject: CurriculumSubject, now: number, scope: CurriculumScope & { units?: string[] | undefined; objectiveIds?: string[] | undefined }, insight?: StudyInsight): DiagnosticPlan {
  const current = insight ?? studyInsight(state, now)
  const profileScope = scope.grade === state.profile.grade && scope.term === state.profile.term
  let pool: ObjectiveInsight[]
  if (profileScope) {
    pool = current.objectives.filter(item => item.subject === subject && (
      scope.objectiveIds !== undefined ? scope.objectiveIds.includes(item.id)
        : scope.units !== undefined ? item.unit !== '' && scope.units.includes(item.unit)
          : item.unit !== '' && curriculumFor(scope, subject)?.units.some(unit => unit.id === item.unit) === true
    ))
  } else {
    const map = builtinObjectivesIn(scope, subject)
    const scoped = scope.objectiveIds !== undefined ? map.filter(item => scope.objectiveIds?.includes(item.id))
      : scope.units !== undefined ? map.filter(item => item.unit !== '' && scope.units?.includes(item.unit))
        : map
    const outcomes = outcomeIndex(state, now)
    pool = scoped.map(base => current.objectives.find(item => item.id === base.id) ?? masteryOf(state, base, outcomes.get(base.id) ?? [], now))
  }
  const lastAt = state.sessions.filter(item => item.mode === 'diagnose' && item.subject === subject).reduce<number | undefined>((latest, item) => latest === undefined || item.startedAt > latest ? item.startedAt : latest, undefined)
  const pick = (item: ObjectiveInsight, reason: DiagnosticSample['reason']): DiagnosticSample => ({ id: item.id, title: item.title, unit: item.unit, unitName: item.unitName, reason })
  const untouched = pool.filter(item => item.level === 'untouched')
  const stalled = pool.filter(item => item.level === 'stalled')
  const recheck = pool.filter(item => item.level === 'mastered' && lastEvidenceCutoff(item) !== undefined && now - lastEvidenceCutoff(item)! >= RECHECK_AFTER)
  const progress = pool.filter(item => item.level === 'practising')
  const rotated: DiagnosticSample[] = []
  const byUnit = new Map<string, ObjectiveInsight[]>()
  for (const item of untouched) byUnit.set(item.unit, [...(byUnit.get(item.unit) ?? []), item])
  for (let round = 0; round <= untouched.length && rotated.length < untouched.length; round += 1) {
    for (const list of byUnit.values()) {
      const item = list[round]
      if (item) rotated.push(pick(item, 'untouched'))
    }
  }
  const candidates = [...rotated, ...stalled.map(item => pick(item, 'stalled')), ...recheck.map(item => pick(item, 'recheck'))]
  const samples: Record<CheckInIntensity, DiagnosticSample[]> = {
    light: candidates.slice(0, checkInSizes.light),
    standard: candidates.slice(0, checkInSizes.standard),
    deep: [...candidates, ...progress.map(item => pick(item, 'progress'))].slice(0, checkInSizes.deep),
  }
  const count = untouched.length + stalled.length + recheck.length
  const recommendedIntensity: CheckInIntensity = count <= checkInSizes.light ? 'light' : count >= 10 && lastAt !== undefined ? 'deep' : 'standard'
  const due = samples.standard.length > 0 && (lastAt === undefined || now - lastAt >= DIAGNOSIS_INTERVAL)
  return { subject, due, ...(lastAt !== undefined ? { lastAt, nextAt: lastAt + DIAGNOSIS_INTERVAL } : {}), untouched: untouched.length, stalled: stalled.length, recheck: recheck.length,
    coverage: { probed: pool.length - untouched.length, total: pool.length }, recommendedIntensity, sample: samples.standard, samples, scope }
}

/**
 * Compact projection of the insight for the workbench and the status tool.
 * @param insight - full insight for the current state.
 * @returns up to three weak points, per-subject check-in status with the sampled objective IDs, the error-cause
 *   profile, the understanding reminders and the current recommendation.
 */
export function insightSummary(insight: StudyInsight) {
  return {
    weakPoints: insight.weakPoints.slice(0, 3).map(item => ({ id: item.id, subject: item.subject, title: item.title, level: item.level, priority: item.priority, reasons: item.reasons })),
    diagnostics: insight.diagnostics.map(plan => ({ subject: plan.subject, due: plan.due, ...(plan.lastAt !== undefined ? { lastAt: plan.lastAt } : {}), ...(plan.nextAt !== undefined ? { nextAt: plan.nextAt } : {}), sample: plan.sample.map(item => item.id) })),
    recommendation: insight.recommendation,
    dueToday: insight.dueToday,
    dueBacklog: insight.dueBacklog,
    errorProfile: insight.errorProfile,
    understandingReminders: insight.understandingReminders,
  }
}

