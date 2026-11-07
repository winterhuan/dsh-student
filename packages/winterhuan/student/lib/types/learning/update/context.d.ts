import { type AttemptInput } from '../shared.ts';
import { type Worksheet, type WorksheetItem } from '../view.ts';
import type { ErrorType, StudyState } from '../../schema.ts';
export declare function alignRecord<T extends {
    id: string;
    topic: string;
    prompt: string;
    response: string;
    mistakeId?: string | undefined;
    objectiveId?: string | undefined;
    variant?: AttemptInput['variant'];
    figure?: AttemptInput['figure'];
}>(task: NonNullable<StudyState['task']>, attempt: T): T;
export type Assistance = AttemptInput['assistance'];
/** Omitted assistance follows the current step: a demo is a worked example, a hint or a guide step is help, and everything else is independent. */
export declare function resolveAssistance(task: StudyState['task'] | undefined, assistance: Assistance | undefined): Assistance;
/** An independent correct answer finishes teaching for that objective. */
export declare function dropTaught(state: StudyState, objectiveId: string | undefined): void;
/**
 * Save one graded question. A changed grade replaces the earlier one and keeps its original day.
 * A wrong or partial answer to a new question becomes a confirmed mistake on that question's goal;
 * regrading it correct removes that mistake again unless other answers already cite it.
 * @returns whether anything changed.
 */
export declare function gradeItem(state: StudyState, worksheet: Worksheet, item: WorksheetItem, entry: StudyState['paperResults'][number], errorType?: ErrorType): boolean;
export declare function practiceMistakeId(state: StudyState, worksheetId: string, itemId: string): string;
/** Reject conflicting reuse of an existing record ID; an identical retry reports a no-op. */
export declare function duplicate<T>(items: readonly T[], matches: (item: T) => boolean, equal: (item: T) => boolean): boolean;
//# sourceMappingURL=context.d.ts.map