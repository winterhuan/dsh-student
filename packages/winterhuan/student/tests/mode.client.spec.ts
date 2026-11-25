// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { Context } from '@deepseek-ai/cordis'
import { registerModeTab } from '../src/client/mode.ts'
afterEach(() => vi.useRealTimers())
it('opens Student once per mounted Session and respects manual closure and other presets', () => {
  vi.useFakeTimers()
  const current = createSnapshotStore({ key: 'one' })
  const mounted = createSnapshotStore<string | undefined>(undefined)
  const list = createSnapshotStore({ byId: { one: { projectionValues: { agentPreset: 'student' } }, two: { projectionValues: { agentPreset: 'student' } }, other: { projectionValues: { agentPreset: 'general' } } } })
  const openTab = vi.fn(), release = vi.fn(), register = vi.fn(() => release)
  const dispose = registerModeTab({ uiSession: { adapter: { current } }, sessions: { list }, sidebarRight: { mounted, openTab }, sidebarRightTabs: { register } } as unknown as Context, { id: 'student', kind: 'student', title: 'Student' })
  expect(openTab).not.toHaveBeenCalled()
  mounted.set('one'); vi.runAllTimers()
  expect(openTab).toHaveBeenCalledExactlyOnceWith('student')
  list.set({ ...list.getSnapshot() }); vi.runAllTimers()
  expect(openTab).toHaveBeenCalledOnce()
  current.set({ key: 'other' }); mounted.set('other'); vi.runAllTimers()
  expect(register.mock.calls.at(-1)![0].guide).toEqual([])
  current.set({ key: 'two' }); mounted.set('two'); vi.runAllTimers()
  expect(openTab).toHaveBeenCalledTimes(2)
  current.set({ key: 'one' }); mounted.set('one'); vi.runAllTimers()
  expect(openTab).toHaveBeenCalledTimes(2)
  dispose(); expect(release).toHaveBeenCalled()
})
