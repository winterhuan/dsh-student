/** One read-derived evidence index for mastery, review, history and summary consumers. */
import type { StudyState } from '../schema.ts'
import type { ValidatedWorkspace } from '../files/validation.ts'
import type { AnswerDate, Assessment, LearnerResponse } from '../files/schema.ts'
import { studyDay } from './shared.ts'

/** Effective assessment of one original response; corrections retain its identity and answer date. */
export interface EffectiveEvidence {
  termId: string; ownerId: string; ownerKind: 'block' | 'worksheet'; responseId: string; questionId: string
  subject: StudyState['sessions'][number]['subject']; topic: string; objectiveId?: string; mistakeId?: string
  rawResponse: string; result: Assessment['result']; assistance: LearnerResponse['assistance']; answerDate: AnswerDate
  basisStatus?: 'legacy-pending'
  source: LearnerResponse['source']; sourceStatus: 'known' | 'unknown'; assessedAt?: number
}
/** Shared normalized response facts and separately preserved current help signals. */
export interface EvidenceIndex { entries: EffectiveEvidence[]; stuckSignals: { objectiveId: string; at: number }[] }
const EVIDENCE = Symbol('studentEvidence')
type EvidenceState = StudyState & { [EVIDENCE]?: EvidenceIndex }

/**
 * Derive effective facts once from validated block and worksheet owners.
 * @param workspace - current validated entity files.
 * @returns one fact per saved response, including unassessed facts and unknown dates, help or unverified native sources; confirmed paper days retain day precision.
 */
export function deriveEvidence(workspace: ValidatedWorkspace): EvidenceIndex {
  const entries: EffectiveEvidence[] = []
  const stuckSignals: EvidenceIndex['stuckSignals'] = []
  for (const file of [...workspace.blocks, ...workspace.worksheets]) {
    const questions = file.kind === 'block' ? file.questions : file.items
    for (const response of file.responses) {
      const question = questions.find(item => item.id === response.questionId)
      if (!question) continue
      const assessment = file.assessments.find(item => item.responseId === response.id)
      const declaredDate = response.answerDate ?? (file.kind === 'worksheet' ? file.answerDate : undefined) ?? { kind: 'unknown' }
      const source = response.source
      const matchedNative = source.kind === 'native' ? workspace.nativeSources?.find(item => item.sessionId === source.sessionId && item.messageId === source.messageId && item.inputVersion === source.inputVersion && item.rawResponse === response.rawResponse) : undefined
      const answerDate: AnswerDate = declaredDate.kind === 'instant' && declaredDate.basis === 'native-input'
        ? matchedNative && matchedNative.receiptAt === declaredDate.at ? declaredDate : { kind: 'unknown' }
        : declaredDate
      entries.push({ termId: file.termId, ownerId: file.id, ownerKind: file.kind, responseId: response.id, questionId: question.id,
        subject: file.subject, topic: question.topic, ...(typeof question.objectiveId === 'string' && !question.basisStatus ? { objectiveId: question.objectiveId } : {}),
        ...(question.basisStatus ? { basisStatus: question.basisStatus } : {}),
        ...(question.mistakeId ? { mistakeId: question.mistakeId } : {}), rawResponse: response.rawResponse,
        result: question.basisStatus ? 'unassessed' : assessment?.result ?? 'unassessed', assistance: response.assistance, source: response.source,
        sourceStatus: source.kind === 'unknown' || source.kind === 'native' && (!matchedNative || source.receiptAt !== undefined && source.receiptAt !== matchedNative.receiptAt) ? 'unknown' : 'known',
        answerDate,
        ...(assessment ? { assessedAt: assessment.assessedAt } : {}) })
    }
    if (file.kind === 'block') for (const signal of file.stuckSignals ?? []) {
      const goal = questions.find(item => item.id === signal.questionId)?.objectiveId
      if (typeof goal === 'string') stuckSignals.push({ objectiveId: goal, at: signal.at })
    }
  }
  return { entries, stuckSignals }
}

/**
 * Attach validated facts to a compatibility display projection without persisting another authority.
 * @param state - display projection used by current dashboard consumers.
 * @param index - normalized facts from the official files.
 * @returns the same display state.
 */
export function attachEvidence(state: StudyState, index: EvidenceIndex): StudyState { Object.defineProperty(state, EVIDENCE, { value: index, configurable: true }); return state }

/**
 * Read the shared index. Legacy grading and receipt fields do not establish actual answer dates.
 * @param state - current display state or handler result.
 * @returns normalized facts for every domain projection.
 */
export function evidenceOf(state: StudyState): EvidenceIndex {
  const attached = (state as EvidenceState)[EVIDENCE]
  if (attached) return attached
  const entries: EffectiveEvidence[] = state.attempts.map(item => ({ termId: 'legacy', ownerId: item.sessionId, ownerKind: 'block', responseId: item.id, questionId: item.id,
    subject: item.subject, topic: item.topic, rawResponse: item.rawResponse ?? item.response, result: item.result, assistance: 'unknown',
    answerDate: { kind: 'unknown' }, sourceStatus: 'known', source: { kind: 'legacy', sourcePath: '.study/state.json', row: `attempts:${item.sessionId}:${item.id}` },
    ...(item.objectiveId ? { objectiveId: item.objectiveId } : {}), ...(item.mistakeId ? { mistakeId: item.mistakeId } : {}) }))
  for (const item of state.paperResults) {
    const sheet = state.worksheets.find(sheet => sheet.id === item.worksheetId)
    const question = sheet?.items.find(question => question.id === item.itemId)
    if (!sheet || !question) continue
    const goal = question.objectiveId ?? sheet.objectiveId
    entries.push({ termId: 'legacy', ownerId: sheet.id, ownerKind: 'worksheet', responseId: item.itemId, questionId: item.itemId,
      subject: sheet.subject, topic: question.prompt, rawResponse: item.response, result: item.result, assistance: 'unknown',
      answerDate: { kind: 'unknown' }, sourceStatus: 'known', source: { kind: 'legacy', sourcePath: '.study/state.json', row: `paperResults:${sheet.id}:${item.itemId}` },
      ...(goal ? { objectiveId: goal } : {}), ...(question.mistakeId ? { mistakeId: question.mistakeId } : {}) })
  }
  return { entries, stuckSignals: [] }
}

/**
 * Read the actual calendar day without manufacturing a timestamp for paper work.
 * @param evidence - normalized response.
 * @returns the Shanghai day or undefined for an unknown date.
 */
export function evidenceDay(evidence: EffectiveEvidence): string | undefined { return evidence.answerDate.kind === 'day' ? evidence.answerDate.day : evidence.answerDate.kind === 'instant' ? studyDay(evidence.answerDate.at) : undefined }

/**
 * Select only facts that were answered by the historical cutoff.
 * Day precision selects a calendar day without establishing within-day order; exact facts use their actual instant.
 * @param index - normalized evidence.
 * @param now - historical or current cutoff.
 * @returns dated effective responses without future facts or unknown dates.
 */
export function evidenceAtCutoff(index: EvidenceIndex, now: number): EffectiveEvidence[] {
  const today = studyDay(now)
  return index.entries.filter(item => item.answerDate.kind === 'instant' ? item.answerDate.at <= now : item.answerDate.kind === 'day' ? item.answerDate.day <= today : false)
}

/**
 * Compare answer ordering without borrowing receipt or assessment times.
 * @param later - possible later response.
 * @param earlier - earlier response or a known signal instant.
 * @returns true only when actual answer precision establishes a later answer.
 */
export function demonstrablyAfter(later: EffectiveEvidence, earlier: EffectiveEvidence | number): boolean {
  if (typeof earlier === 'number') return later.answerDate.kind === 'instant' ? later.answerDate.at >= earlier : later.answerDate.kind === 'day' ? later.answerDate.day > studyDay(earlier) : false
  const laterDay = evidenceDay(later)
  const earlierDay = evidenceDay(earlier)
  if (!laterDay || !earlierDay) return false
  if (laterDay !== earlierDay) return laterDay > earlierDay
  return later.answerDate.kind === 'instant' && earlier.answerDate.kind === 'instant' && later.answerDate.at > earlier.answerDate.at
}
