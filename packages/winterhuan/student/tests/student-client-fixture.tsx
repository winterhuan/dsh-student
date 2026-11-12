import { useSyncExternalStore } from 'react'
import { vi } from 'vitest'
import { dashboard, type Dashboard } from '../src/dashboard.ts'
import { updateStudy } from './fixtures.ts'
import type { StudentQueryResult, StudentQueryRequest } from '../src/types.ts'

/** Native conversation substitute for UI intent tests; business regressions separately use real files and tools. */
export function studentClientFixture(initial: ReturnType<typeof updateStudy>, lessons?: Dashboard['interactiveLessons']) {
  let state = initial
  let generation = 0
  const listeners = new Set<() => void>()
  const snapshots = new Map<string, { status: 'live'; failure: undefined; value: StudentQueryResult }>()
  const requests: { revision: number; change: unknown }[] = []
  const addresses = vi.fn<(address: string) => void>()
  const publish = () => { generation++; snapshots.clear(); for (const listener of listeners) listener() }
  const useResource = (address: string) => useSyncExternalStore(callback => { listeners.add(callback); return () => { listeners.delete(callback) } }, () => {
    const key = `${address}:${generation}:${vi.isMockFunction(Date.now) ? Date.now() : 0}`
    let value = snapshots.get(key)
    if (!value) {
      addresses(address)
      const request: StudentQueryRequest = address ? JSON.parse(new URL(address).searchParams.get('query')!) : { kind: 'dashboard' }
      const data = request.kind === 'learning-context' ? { termId: 'term-one', pendingFacts: [] } : dashboard(state, Date.now(), request.kind === 'dashboard' ? request.options : undefined)
      if (lessons && 'interactiveLessons' in data) data.interactiveLessons = lessons
      value = { status: 'live', failure: undefined, value: { status: 'valid', token: String(generation), readAt: Date.now(), refreshAfter: Date.now() + 3000, versions: [], native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [], data } }
      snapshots.set(key, value)
    }
    return value
  })
  return {
    useResource, addresses, requests,
    remote: { inspectSubmission: vi.fn(), manualContext: vi.fn(async () => ({ ok: true, value: { termId: 'term-one', versions: [{ path: '.study/settings.json', version: 'settings-one' }], baseline: {}, issues: [], readStatus: 'valid' } })), saveManual: vi.fn(async (_session, request) => { state = updateStudy(state, request.intent.command, Date.now()); publish(); const current = Object.fromEntries(Object.keys(request.baseline).map(key => [key, key.startsWith('profile:') ? state.profile[key.slice(8) as keyof typeof state.profile] : key.startsWith('course:') ? state.courses.find(course => course.subject === key.slice(7)) : key.startsWith('progress:') ? state.courses.find(course => course.subject === key.slice(9))?.progress ?? null : key === 'interests' ? state.interests ?? null : key === 'openmaic' ? state.openmaic ?? null : null])); return { ok: true, value: { status: 'saved', current, termId: 'term-one', versions: [{ path: '.study/settings.json', version: `settings-${state.revision}` }], issues: [], readStatus: 'valid' } } }) },
    read: () => state,
    replace(next: typeof state) { state = next; publish() },
    async consume(text: string) {
      const content = text.split('Student intention:\n')[1]?.split('\n')[0]
      if (!content) return
      const intention = JSON.parse(content)
      if (intention.operation) { requests.push({ revision: state.revision, change: intention.operation }); state = updateStudy(state, intention.operation, Date.now()); publish() }
    },
  }
}
