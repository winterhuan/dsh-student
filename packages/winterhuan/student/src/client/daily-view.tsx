import type { DailyLearning, DailySuggestion } from '../learning/daily.ts'
import type { Translate } from './locales.ts'
import type { Subject } from './display.ts'
import { continuationReasons } from './today-view.tsx'
import css from './desk.module.css'

/** Home is the only learner surface for browsing subjects or choosing new content. */
export function DailyHome({ daily, subject, disabled, extra, onStart, onResume, onSummary, onScope, t }: { daily: DailyLearning; subject: Subject | 'all'; disabled: boolean; extra: boolean; onStart: (suggestion?: DailySuggestion) => void; onResume: () => void; onSummary: () => void; onScope: (subject: Subject) => void; t: Translate }) {
  const unfinished = daily.tasks.find(item => ['active', 'paused', 'ready'].includes(item.task.state))
  const resumedBlock = unfinished?.task.activity?.blockId ?? (daily.phase === 'learning' ? daily.nextAction?.blockId : undefined)
  const suggestions = (subject === 'all' ? daily.recommended : daily.suggestions.filter(item => item.task.subject === subject)).filter(item => !resumedBlock || item.task.activity?.blockId !== resumedBlock)
  return <>
    <section><h3>{t(extra ? 'learnMore' : 'dailyRecommendations')}</h3><p className="student-muted">{t('dailyRecommendationsHelp')}</p>
      {!unfinished && daily.phase === 'learning' && <button type="button" className="student-primary" disabled={disabled} onClick={onResume}>{t('resumeLearning')}</button>}
      {daily.tasks.some(item => item.preparationIncomplete) && <p role="status">{t('dailyPreparationIncomplete')}</p>}
      {unfinished && <div><p>{t('unfinishedLearning')} · {t(unfinished.task.subject)} · {unfinished.title}</p><button type="button" className="student-primary" disabled={disabled} onClick={onResume}>{t('resumeLearning')}</button></div>}
      {daily.saved && ['completed', 'stopped', 'paused'].includes(daily.saved.state) && <button type="button" onClick={onSummary}>{t('todayGains')}</button>}
    </section>
    {suggestions.length > 0 ? <section className={css.dailyCards}>{suggestions.map((item, index) => <article key={item.task.id} className={css.dailyCard}>
      <p className="student-muted">{t(item.task.subject)} · {t(item.task.purpose === 'review' ? 'review' : item.task.purpose === 'teaching' ? 'requestTeaching' : item.task.purpose === 'diagnostic' ? 'exploreKnowledge' : 'learningGoal')}</p>
      <h3>{item.nextAction.title}</h3><p>{t(continuationReasons[item.nextAction.reason])}</p>
      {item.task.scope && <p className="student-muted">{item.task.scope.description}</p>}
      <p className="student-muted">{t(item.task.ending === 'review-attempts' ? 'reviewEnding' : 'learningEnding')}</p>
      <button type="button" className={index === 0 && !unfinished && daily.phase !== 'learning' ? 'student-primary' : undefined} disabled={disabled} onClick={() => onStart(subject === 'all' && index === 0 && !extra ? undefined : item)}>{t(extra ? 'learnThis' : item.task.purpose === 'resume' ? 'resumeLearning' : 'startToday')}</button>
    </article>)}</section> : !unfinished && daily.phase !== 'learning' && <section><p>{t('noDailySuggestion')}</p></section>}
    {daily.missingSubjects.filter(item => subject === 'all' || subject === item).length > 0 && <details className="student-fold" open={suggestions.length === 0}><summary>{t('confirmLearningScope')}</summary><p>{t('scopeConfirmationHelp')}</p>
      {daily.missingSubjects.filter(item => subject === 'all' || subject === item).map(item => <button key={item} type="button" disabled={disabled} onClick={() => onScope(item)}>{t('confirmSubjectScope').replace('{subject}', t(item))}</button>)}
    </details>}
  </>
}

/** Summaries report actual responses and unfinished work, without adding recommendations. */
export function DailySummary({ daily, disabled, onContinue, onExtra, onHome, t }: { daily: DailyLearning; disabled: boolean; onContinue: () => void; onExtra: () => void; onHome: () => void; t: Translate }) {
  const unfinished = daily.tasks.filter(item => ['active', 'paused', 'ready', 'deferred'].includes(item.task.state))
  return <>
    <section><h3>{t('todayGains')}</h3><p>{daily.day} · {t(daily.completionPending ? 'dailyCompletionPending' : daily.saved?.state === 'completed' ? 'dailyCompleted' : 'dailyStopped')}</p><p className="student-muted">{t('dailyCompletionHelp')}</p></section>
    {daily.summary.length ? daily.summary.map(item => <section key={item.subject}><h3>{t(item.subject)}</h3><p>{t('actualAttempts').replace('{count}', String(item.attempted))}</p>
      <p>{t('assistIndependent')} {item.independent} · {t('assistHint')} {item.helped}</p>
      {item.consolidate > 0 && <p>{t('needsConsolidation').replace('{count}', String(item.consolidate))}</p>}
    </section>) : <section><p>{t('noActualLearning')}</p></section>}
    {daily.tasks.some(item => item.pending > 0) && <section><h3>{t('dailyCompletionPending')}</h3>{daily.tasks.filter(item => item.pending > 0).map(item => <p key={item.task.id}>{t(item.task.subject)} · {item.title} · {t('pendingLearningResults').replace('{count}', String(item.pending))}</p>)}</section>}
    {unfinished.length > 0 && <section><h3>{t('unfinishedLearning')}</h3>{unfinished.map(item => <p key={item.task.id}>{t(item.task.subject)} · {item.title}</p>)}<button type="button" className="student-primary" disabled={disabled} onClick={onContinue}>{t('resumeLearning')}</button></section>}
    <div className={css.practiceActions}><button type="button" disabled={disabled} onClick={onExtra}>{t('learnMore')}</button><button type="button" onClick={onHome}>{t('backHome')}</button></div>
  </>
}
