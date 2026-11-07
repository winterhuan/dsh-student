import type { UpdateContext } from './index.ts';
import type { StudyState } from '../../schema.ts';
/** Save or update an unconfirmed mistake transcription. */
export declare function applyMistake(ctx: UpdateContext<'mistake'>): StudyState;
/** Confirm the final transcription of one mistake, or create/edit a confirmed mistake directly from the panel. */
export declare function applyConfirmMistake(ctx: UpdateContext<'confirm-mistake'>): StudyState;
/** Delete one mistake from the notebook and detach any worksheet references to it. */
export declare function applyDeleteMistake(ctx: UpdateContext<'delete-mistake'>): StudyState;
/** Save or update one workspace exercise item in the local exercise bank. */
export declare function applySaveExercise(ctx: UpdateContext<'save-exercise'>): StudyState;
/** Delete one workspace exercise item from the local exercise bank. */
export declare function applyDeleteExercise(ctx: UpdateContext<'delete-exercise'>): StudyState;
/** Propose one concept for parent review. */
export declare function applyConcept(ctx: UpdateContext<'concept'>): StudyState;
/** Confirm a proposed concept with the parent statement. */
export declare function applyConfirmConcept(ctx: UpdateContext<'confirm-concept'>): StudyState;
/** Create one custom learning objective over confirmed concepts. */
export declare function applyObjective(ctx: UpdateContext<'objective'>): StudyState;
/** Create one relation between confirmed concepts. */
export declare function applyRelation(ctx: UpdateContext<'relation'>): StudyState;
/** Link a confirmed mistake to a learning goal. */
export declare function applyLinkMistake(ctx: UpdateContext<'link-mistake'>): StudyState;
/** Set, change or clear a mistake error cause. */
export declare function applyClassifyMistake(ctx: UpdateContext<'classify-mistake'>): StudyState;
//# sourceMappingURL=mistakes.d.ts.map