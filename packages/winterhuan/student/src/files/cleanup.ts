/** Explicit cleanup retires only confirmed empty activities and repairs their plan references. */
import type { LearningBlock, DailyPlan, TermSettings } from './schema.ts'
/**
 * Decide whether an ended block contains no learning or pending question evidence.
 * @param block - Complete original record before deletion.
 * @returns Whether this empty activity can be selected for explicit retirement.
 */
export function emptyRetiredBlock(block: LearningBlock): boolean {
  return block.endedAt !== undefined && block.questions.length === 0 && block.responses.length === 0 && block.assessments.length === 0 && block.hints.length === 0 && !block.stuckSignals?.length && !block.rounds?.length
}
/**
 * Remove only tasks owned by explicitly retired empty blocks and their local choice references.
 * @param plan - Original plan; the caller retains an exact backup and verifies versions.
 * @param removed - Stable retired block identities.
 * @returns Repaired tasks and choices; no learning outcome is created.
 */
export function pruneRetiredPlan(plan: DailyPlan, removed: ReadonlySet<string>): DailyPlan {
  const ids = new Set(plan.tasks.filter(task => task.activity && removed.has(task.activity.blockId)).map(task => task.id))
  if (!ids.size) return plan
  if (plan.tasks.some(task => ids.has(task.id) && (task.basis.length || task.outcomes.length || task.state === 'completed'))) throw new Error('An activity with evidence or completion cannot be retired.')
  return { ...plan, state: plan.tasks.every(task => ids.has(task.id)) ? 'stopped' : plan.state, tasks: plan.tasks.filter(task => !ids.has(task.id)), choices: plan.choices.map(choice => ({ ...choice, taskIds: choice.taskIds.filter(id => !ids.has(id)), replacedTaskIds: choice.replacedTaskIds.filter(id => !ids.has(id)) })) }
}
/**
 * Identify explicit retired blocks; independent reading verifies every preserved empty source.
 * @param settings - Current formal settings.
 * @returns IDs used solely for cleanup reference reconciliation.
 */
export function retiredBlockIds(settings: TermSettings): Set<string> { return new Set(settings.retiredEmptyBlocks?.map(item => item.id) ?? []) }
