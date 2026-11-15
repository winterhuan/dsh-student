import { useState, useSyncExternalStore } from 'react'
import { createStudentDraftStore, type DraftProps } from '../src/client/drafts.tsx'

/** Tests bind the declared store directly; production binding belongs to the slot renderer. */
export function useDraftFixture(): DraftProps {
  const [store] = useState(() => createStudentDraftStore().create())
  return { actions: store.actions, useStore: selector => selector(useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)) }
}
