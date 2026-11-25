import { defineStore } from '@deepseek-ai/dsh-client-store';
/**
 * Declare persisted interaction drafts; official files remain the business authority.
 * @returns the registration handle seeded before its first render.
 */
export function createStudentDraftStore() {
    return defineStore({
        init: () => {
            const drafts = {};
            try {
                // One-time migration from the former per-Session store; keep the original keys and bytes.
                for (let index = 0; index < window.localStorage.length; index++) {
                    const storageKey = window.localStorage.key(index);
                    if (!storageKey?.startsWith('student:drafts.'))
                        continue;
                    try {
                        const previous = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}');
                        for (const [key, value] of Object.entries(previous.drafts ?? {}))
                            if (key.startsWith('student:draft:') && typeof value === 'string')
                                drafts[key] = value;
                    }
                    catch { /* A corrupt old Session cannot hide other drafts. */ }
                }
                for (let index = 0; index < window.sessionStorage.length; index++) {
                    const key = window.sessionStorage.key(index);
                    if (key?.startsWith('student:draft:'))
                        drafts[key] = window.sessionStorage.getItem(key) ?? '';
                }
            }
            catch { /* Browser storage is optional; the declared store retains mounted drafts. */ }
            return { drafts };
        },
        persist: 'student:drafts',
        actions: {
            setDraft: (state, key, value) => { state.drafts[key] = value; },
            clearDraft: (state, key) => { delete state.drafts[key]; },
        },
    });
}
/**
 * Parse optional browser drafts before their first render; malformed values supply no baseline.
 * @param value - persisted browser interaction text.
 * @returns valid retained fields, or no retained baseline.
 */
export function readFormDraft(value) {
    if (!value)
        return undefined;
    try {
        const entry = JSON.parse(value);
        if (typeof entry.baseline !== 'string' || typeof entry.revision !== 'number' || !entry.values || typeof entry.values !== 'object' || Array.isArray(entry.values))
            return undefined;
        if (!Object.values(entry.values).every(value => ['string', 'number', 'boolean'].includes(typeof value)))
            return undefined;
        return { baseline: entry.baseline, revision: entry.revision, values: entry.values, edited: Array.isArray(entry.edited) ? entry.edited.filter((name) => typeof name === 'string') : [],
            ...(typeof entry.confirmedFrom === 'string' ? { confirmedFrom: entry.confirmedFrom } : {}), ...(typeof entry.observation === 'string' ? { observation: entry.observation } : {}) };
    }
    catch {
        return undefined;
    }
}
/**
 * Name a form within its Session and term namespace.
 * @param entity - edited entity or answer identity.
 * @param namespace - Session and term prefix; standalone confirmations use their own prefix.
 * @returns the declared-store draft key.
 */
export function formDraftKey(entity, namespace = 'student:standalone') { return `${namespace}:${entity}`; }
//# sourceMappingURL=drafts.js.map