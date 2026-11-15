import { defineStore } from '@deepseek-ai/dsh-client-store'
import type { PropsStore } from '@deepseek-ai/dsh-client-ui-slots'

/**
 * Declare persisted interaction drafts; official files remain the business authority.
 * @returns the registration handle seeded before its first render.
 */
export function createStudentDraftStore() {
  return defineStore({
    init: (): { drafts: Record<string, string> } => {
      const drafts: Record<string, string> = {}
      try {
        for (let index = 0; index < window.sessionStorage.length; index++) {
          const key = window.sessionStorage.key(index)
          if (key?.startsWith('student:draft:')) drafts[key] = window.sessionStorage.getItem(key) ?? ''
        }
      } catch { /* Browser storage is optional; the declared store retains mounted drafts. */ }
      return { drafts }
    },
    persist: 'student:drafts',
    actions: {
      setDraft: (state, key: string, value: string) => { state.drafts[key] = value },
      clearDraft: (state, key: string) => { delete state.drafts[key] },
    },
  })
}

export type DraftProps = PropsStore<ReturnType<typeof createStudentDraftStore>>

/** One browser form's original baseline, edited fields and confirmed observation. */
export interface FormDraft {
  revision: number
  baseline: string
  values: Record<string, string | number | boolean | undefined>
  edited: string[]
  confirmedFrom?: string | undefined
  observation?: string | undefined
}

/**
 * Parse optional browser drafts before their first render; malformed values supply no baseline.
 * @param value - persisted browser interaction text.
 * @returns valid retained fields, or no retained baseline.
 */
export function readFormDraft(value: string | undefined): FormDraft | undefined {
  if (!value) return undefined
  try {
    const entry = JSON.parse(value)
    if (typeof entry.baseline !== 'string' || typeof entry.revision !== 'number' || !entry.values || typeof entry.values !== 'object' || Array.isArray(entry.values)) return undefined
    if (!Object.values(entry.values).every(value => ['string', 'number', 'boolean'].includes(typeof value))) return undefined
    return { baseline: entry.baseline, revision: entry.revision, values: entry.values, edited: Array.isArray(entry.edited) ? entry.edited.filter((name: unknown) => typeof name === 'string') : [],
      ...(typeof entry.confirmedFrom === 'string' ? { confirmedFrom: entry.confirmedFrom } : {}), ...(typeof entry.observation === 'string' ? { observation: entry.observation } : {}) }
  } catch { return undefined }
}

/**
 * Name a form within its Session and term namespace.
 * @param entity - edited entity or answer identity.
 * @param namespace - Session and term prefix; standalone confirmations use their own prefix.
 * @returns the declared-store draft key.
 */
export function formDraftKey(entity: string, namespace = 'student:standalone'): string { return `${namespace}:${entity}` }
