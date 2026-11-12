/** One read-derived evidence index for mastery, review, history and summary consumers. */
import type { StudyState } from '../schema.ts';
import type { ValidatedWorkspace } from '../files/validation.ts';
import type { AnswerDate, Assessment, LearnerResponse } from '../files/schema.ts';
/** Effective assessment of one original response; corrections retain its identity and answer date. */
export interface EffectiveEvidence {
    termId: string;
    ownerId: string;
    ownerKind: 'block' | 'worksheet';
    responseId: string;
    questionId: string;
    subject: StudyState['sessions'][number]['subject'];
    topic: string;
    objectiveId?: string;
    mistakeId?: string;
    rawResponse: string;
    result: Assessment['result'];
    assistance: LearnerResponse['assistance'];
    answerDate: AnswerDate;
    basisStatus?: 'legacy-pending';
    source: LearnerResponse['source'];
    assessedAt?: number;
}
/** Shared normalized response facts and separately preserved current help signals. */
export interface EvidenceIndex {
    entries: EffectiveEvidence[];
    stuckSignals: {
        objectiveId: string;
        at: number;
    }[];
}
/**
 * Derive effective facts once from validated block and worksheet owners.
 * @param workspace - current validated entity files.
 * @returns one fact per saved response, including unassessed and unknown facts.
 */
export declare function deriveEvidence(workspace: ValidatedWorkspace): EvidenceIndex;
/**
 * Attach validated facts to a compatibility display projection without persisting another authority.
 * @param state - display projection used by current dashboard consumers.
 * @param index - normalized facts from the official files.
 * @returns the same display state.
 */
export declare function attachEvidence(state: StudyState, index: EvidenceIndex): StudyState;
/**
 * Read the shared index. Legacy grading and receipt fields do not establish actual answer dates.
 * @param state - current display state or handler result.
 * @returns normalized facts for every domain projection.
 */
export declare function evidenceOf(state: StudyState): EvidenceIndex;
/**
 * Read the actual calendar day without manufacturing a timestamp for paper work.
 * @param evidence - normalized response.
 * @returns the Shanghai day or undefined for an unknown date.
 */
export declare function evidenceDay(evidence: EffectiveEvidence): string | undefined;
/**
 * Select only facts that were answered by the historical cutoff.
 * Day precision selects a calendar day without establishing within-day order; exact facts use their actual instant.
 * @param index - normalized evidence.
 * @param now - historical or current cutoff.
 * @returns dated effective responses without future facts or unknown dates.
 */
export declare function evidenceAtCutoff(index: EvidenceIndex, now: number): EffectiveEvidence[];
/**
 * Compare answer ordering without borrowing receipt or assessment times.
 * @param later - possible later response.
 * @param earlier - earlier response or a known signal instant.
 * @returns true only when actual answer precision establishes a later answer.
 */
export declare function demonstrablyAfter(later: EffectiveEvidence, earlier: EffectiveEvidence | number): boolean;
//# sourceMappingURL=evidence.d.ts.map