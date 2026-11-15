/** Shared review replay from actual answer dates; receipt and grading dates are never scheduling input. */
import { DAY, studyDay } from './shared.ts'
import type { StudyState } from '../schema.ts'
import { evidenceOf, evidenceDay, evidenceAtCutoff, demonstrablyAfter, type EvidenceIndex, type EffectiveEvidence } from './evidence.ts'

/** Existing spaced-review intervals, in days for stages one through four. */
export const REVIEW_DAYS = [1, 7, 16, 35] as const
/** Midnight in the teaching timezone that starts the given calendar day. */
export function dayStart(day: string): number { return Date.parse(`${day}T00:00:00+08:00`) }
/** One mistake's earned stage and historical review opportunity within a calendar window. */
export interface MistakeReplay { stage: number; independentDays: string[]; dueAt?: number; opportunity: boolean; completed: boolean; consolidatedDay?: string }

/**
 * Replay a stable mistake identity, preserving earned stages and conservative same-day difficulty.
 * @param mistake - confirmed mistake declaration.
 * @param index - effective actual-answer facts.
 * @param now - historical/current cutoff.
 * @param windowStart - optional seven-day window start for review completion.
 * @returns earned stage, current due date and one review opportunity/completion per mistake.
 */
export function replayMistake(mistake: StudyState['mistakes'][number], index: EvidenceIndex, now: number, windowStart?: number): MistakeReplay {
  if (mistake.confirmedAt === undefined || mistake.confirmedAt > now) return { stage: 0, independentDays: [], opportunity: false, completed: false }
  let dueAt = dayStart(studyDay(mistake.confirmedAt + DAY))
  let stage = 0
  let wrongs = 0
  const independentDays: string[] = []
  let opportunity = false
  let completed = false
  let consolidatedDay: string | undefined
  const registerOpportunity = (at: number) => { if (windowStart !== undefined && dueAt <= at && dueAt <= now && Math.max(dueAt, windowStart) <= at) opportunity = true }
  const rows = evidenceAtCutoff(index, now).filter(item => item.mistakeId === mistake.id && item.subject === mistake.subject && item.objectiveId === mistake.objectiveId && demonstrablyAfter(item, mistake.confirmedAt!))
  const groups = new Map<string, EffectiveEvidence[]>()
  for (const row of rows) { const day = evidenceDay(row)!; groups.set(day, [...groups.get(day) ?? [], row]) }
  for (const [day, entries] of [...groups].sort(([left], [right]) => left.localeCompare(right))) {
    const ambiguous = entries.some(entry => entry.answerDate.kind !== 'instant')
    const sorted = ambiguous ? entries.slice().sort((a, b) => Number(!(a.result === 'correct' && a.assistance === 'independent')) - Number(!(b.result === 'correct' && b.assistance === 'independent')))
      : entries.slice().sort((a, b) => (a.answerDate.kind === 'instant' ? a.answerDate.at : 0) - (b.answerDate.kind === 'instant' ? b.answerDate.at : 0))
    for (const item of sorted) {
      const at = item.answerDate.kind === 'instant' ? item.answerDate.at : dayStart(day)
      registerOpportunity(at)
      if (item.result === 'unassessed' || item.result === 'stuck' || (item.result === 'correct' && item.assistance === 'unknown')) continue
      if (item.result === 'correct' && item.assistance === 'independent') {
        if (windowStart !== undefined && at >= windowStart && at >= dueAt) completed = true
        if (independentDays.includes(day)) continue
        independentDays.push(day)
        stage = Math.min(4, stage + 1)
        dueAt = dayStart(studyDay(dayStart(day) + REVIEW_DAYS[stage - 1]! * DAY))
        if (stage === 4 && consolidatedDay === undefined) consolidatedDay = day
      } else {
        wrongs += 1
        dueAt = dayStart(studyDay(dayStart(day) + (wrongs >= 2 ? 2 : 1) * DAY))
      }
    }
  }
  registerOpportunity(now)
  return { stage, independentDays, dueAt, opportunity, completed: opportunity && completed, ...(consolidatedDay ? { consolidatedDay } : {}) }
}

/**
 * Update display-only review fields through the shared replay owner.
 * @param state - parsed display projection; persisted stages are ignored.
 * @param now - optional explicit cutoff; omission replays every dated effective fact.
 * @returns the same state with derived review fields.
 */
export function scheduleMistakes(state: StudyState, now = 8_639_999_900_000_000): StudyState {
  const index = evidenceOf(state)
  for (const mistake of state.mistakes) {
    const replay = replayMistake(mistake, index, now)
    mistake.stage = replay.stage
    mistake.independentDays = replay.independentDays
    if (replay.dueAt !== undefined) mistake.dueAt = replay.dueAt
    else delete mistake.dueAt
  }
  return state
}
