import type { PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
/**
 * Declare persisted interaction drafts; official files remain the business authority.
 * @returns the registration handle seeded before its first render.
 */
export declare function createStudentDraftStore(): import("@deepseek-ai/dsh-client-store").EngineStoreHandle<{
    drafts: Record<string, string>;
}, {
    setDraft: (state: {
        drafts: Record<string, string>;
    }, key: string, value: string) => void;
    clearDraft: (state: {
        drafts: Record<string, string>;
    }, key: string) => void;
}>;
export type DraftProps = PropsStore<ReturnType<typeof createStudentDraftStore>>;
/** One browser form's original baseline, edited fields and confirmed observation. */
export interface FormDraft {
    revision: number;
    baseline: string;
    values: Record<string, string | number | boolean | undefined>;
    edited: string[];
    confirmedFrom?: string | undefined;
    observation?: string | undefined;
}
/**
 * Parse optional browser drafts before their first render; malformed values supply no baseline.
 * @param value - persisted browser interaction text.
 * @returns valid retained fields, or no retained baseline.
 */
export declare function readFormDraft(value: string | undefined): FormDraft | undefined;
/**
 * Name a form within its Session and term namespace.
 * @param entity - edited entity or answer identity.
 * @param namespace - Session and term prefix; standalone confirmations use their own prefix.
 * @returns the declared-store draft key.
 */
export declare function formDraftKey(entity: string, namespace?: string): string;
//# sourceMappingURL=drafts.d.ts.map