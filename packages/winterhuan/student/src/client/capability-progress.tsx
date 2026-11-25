import type { CapabilityProgress } from '../learning/mastery.ts'
import type { Translate } from './locales.ts'
import type { Subject } from './display.ts'
import { levelKeys } from './display.ts'

/** Capability state always names its tested range and actual independent dates. */
export function CapabilityProgressView({ goals, subject, t }: { goals: CapabilityProgress[]; subject?: Subject; t: Translate }) {
  const selected = goals.filter(goal => (!subject || goal.subject === subject) && (goal.scope || goal.feedback.length))
  return <section><h3>{t('capabilityProgressTitle')}</h3>{selected.length ? selected.map(goal => <details key={`${goal.id}:${goal.scope?.id}`}><summary>{t(goal.subject)} · {goal.title} · {t(levelKeys[goal.level])}</summary>
    {goal.scope && <p>{goal.scope.description}</p>}
    <p>{t('independentDates')}: {goal.independentDays.length ? goal.independentDays.join(' · ') : t('empty')}</p>
    {goal.feedback.slice(-3).map(row => <p key={`${row.termId}:${row.ownerId}:${row.responseId}`}>{t(row.result)} · {row.feedback}</p>)}
  </details>) : <p>{t('empty')}</p>}</section>
}
