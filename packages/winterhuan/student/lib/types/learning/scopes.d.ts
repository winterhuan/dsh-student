import type { TermSettings } from '../files/schema.ts';
import type { ValidatedWorkspace } from '../files/validation.ts';
type LearningScope = Omit<NonNullable<TermSettings['learningScopes']>[number], 'parentConfirmation'>;
/** Use existing school progress or the grade map without inventing a new parent confirmation. */
export declare function automaticLearningScopes(workspace: Pick<ValidatedWorkspace, 'settings' | 'collections'>): LearningScope[];
/** Explicit family choices override inferred defaults only for their own subject. */
export declare function effectiveLearningScopes(workspace: ValidatedWorkspace): LearningScope[];
export {};
//# sourceMappingURL=scopes.d.ts.map