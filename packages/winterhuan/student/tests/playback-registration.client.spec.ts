// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { apply as applyRemote, inject as remoteInject } from '@deepseek-ai/dsh-api-gateway/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { expect, it, onTestFinished, vi } from 'vitest'
import { apply, inject } from '../src/client/sidebar.tsx'
import { en } from '../src/client/locales.ts'
import type { OpenmaicPlaybackResult } from '../src/openmaic/playback.ts'
import type { StudentSessionId } from '../src/types.ts'

it('keeps playback in the current Session sidebar without a global workbench entry', async () => {
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  const value: OpenmaicPlaybackResult = { status: 'unavailable', reason: 'offline test' }
  const call = vi.fn(async () => ({ ok: true, value }))
  const unexpected = () => { throw new Error('Unexpected playback transport operation') }
  ctx.provide('typert', { remotes: { register: () => () => {} }, contexts: { getClient: () => undefined } })
  ctx.provide('connection', {
    interactions: 'none', isLoopback: true,
    generation: createSnapshotStore(undefined), state: createSnapshotStore(undefined),
    rpc: { call, open: unexpected }, start: unexpected, openWebSocket: unexpected,
  })
  await ctx.plugin({ inject: remoteInject, apply: applyRemote })
  await ctx.plugin(SlotRegistry)
  ctx.slots.register({ name: 'root', children: {
    main: { kind: 'keyed', scope: 'root' },
    'sidebar.panellist': { kind: 'list', scope: 'root' },
    'shell.overlay': { kind: 'list', scope: 'root' },
    'sidebar.right.pane.tab': { kind: 'keyed', scope: 'session' },
    'conversation.chat.turnTail': { kind: 'list', scope: 'session' },
  } }, () => null)
  ctx.provide('locale', { register: () => () => {}, bind: () => (key: keyof typeof en) => en[key] })
  ctx.provide('resources', { register: () => () => {} })
  ctx.provide('sessions', { list: createSnapshotStore({ byId: {} }) })
  ctx.provide('uiSession', { adapter: { current: createSnapshotStore({ key: undefined }) } })
  ctx.provide('sidebarRightTabs', { register: () => () => {} })
  ctx.provide('conversation', {})
  await ctx.plugin({ inject, apply })

  expect(ctx.slots.entries('main').some(entry => entry.options.key === 'student')).toBe(false)
  expect(ctx.slots.entries('sidebar.panellist').some(entry => entry.options.id === 'student')).toBe(false)
  const entry = ctx.slots.entries('sidebar.right.pane.tab').find(entry => entry.options.key === '@winterhuan/dsh-student')
  expect(entry?.inject).toBeTypeOf('function')
  const factory = entry!.inject as () => { openLesson: (sessionId: StudentSessionId, lessonId: string) => Promise<OpenmaicPlaybackResult> }
  const sessionId = 'playback-session' as StudentSessionId
  const open = factory().openLesson(sessionId, 'playback-lesson')
  await expect(open).resolves.toEqual(value)
  expect(call).toHaveBeenCalledExactlyOnceWith('/api', 'studentOpenmaicPlayback/open', { args: { sessionId: 'playback-session', lessonId: 'playback-lesson' } }, expect.any(AbortSignal))
})
