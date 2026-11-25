import type { OfficialFile } from './schema.ts';
import type { ValidatedWorkspace } from './validation.ts';
/** Check arrangement ownership and original references without creating learning evidence. */
export declare function validateDailyPlans(workspace: ValidatedWorkspace, prior: readonly {
    path: string;
    file: OfficialFile;
}[], fail: (path: string, field: string, rule: string, correction: string) => void): void;
//# sourceMappingURL=plans.d.ts.map