// @vitest-environment jsdom
import { expect, it, onTestFinished } from 'vitest'
import { SlotTestRuntime } from '@deepseek-ai/dsh-client-test-runtime'
import { apply as applyResources, inject as resourcesInject } from '@deepseek-ai/dsh-client-resources/client'
import { RemoteStream, RemoteStreamCarrierError, type RemoteStreamOptions } from '@deepseek-ai/dsh-api-gateway/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteStreamHandle } from '@deepseek-ai/dsh-typert-protocol'
import type { StudentQueryResult, StudentWatchFrame } from '../src/types.ts'
import { createStudentResourceOwner, studentResourceAddress } from '../src/client/resource.ts'
import { waitFor } from '@testing-library/react'
import type { ConnectionGeneration } from '@deepseek-ai/dsh-client-connection/client'

function snapshot(token: string, status: StudentQueryResult['status'] = 'valid'): StudentQueryResult {
  return { status, token, readAt: 100, refreshAfter: 1000, versions: [], data: status === 'valid' ? { nickname: token } : null, native: { status: 'available', inputs: [], admissions: [], omitted: 0, omittedAdmissions: 0 }, backupIssues: [] }
}
it('retains visibly stale data after a current invalid read and drops late frames after release', async () => {
  const runtime = await SlotTestRuntime.create()
  onTestFinished(() => runtime.dispose())
  await runtime.mount({ inject: resourcesInject, apply: applyResources })
  const generation = createSnapshotStore({ id: 1, host: { home: '/' } })
  let next = Promise.withResolvers<StudentWatchFrame>()
  const ended = Promise.withResolvers<void>()
  const remote = {
    $stream<T>(options: RemoteStreamOptions<T>) { return new RemoteStream({ generation }, options) },
    student: { watch(_id: SessionId, _request: object, signal?: AbortSignal): RemoteStreamHandle<StudentWatchFrame, never> {
      const source = (async function* () {
        try {
          yield { kind: 'snapshot' as const, value: snapshot('one') }
          while (!signal?.aborted) {
            const current = next
            const abort = Promise.withResolvers<undefined>()
            const listener = () => abort.resolve(undefined)
            signal?.addEventListener('abort', listener, { once: true })
            const frame = await Promise.race([current.promise, abort.promise])
            signal?.removeEventListener('abort', listener)
            if (!frame) return
            next = Promise.withResolvers<StudentWatchFrame>()
            yield frame
          }
        } finally { ended.resolve() }
      })()
      return { [Symbol.asyncIterator]: () => source, dispose() {}, end() {}, send() {} }
    } },
  }
  const owner = createStudentResourceOwner(remote)
  onTestFinished(() => owner.dispose())
  const release = runtime.ctx.resources.register(owner.provider)
  onTestFinished(release)
  const source = runtime.ctx.resources.source(studentResourceAddress(SessionId('s'), { kind: 'settings' }))
  const unsubscribe = source.subscribe(() => {})
  onTestFinished(unsubscribe)
  await waitFor(() => expect(source.getSnapshot()).toMatchObject({ status: 'live', value: { token: 'one' } }))
  next.resolve({ kind: 'snapshot', value: snapshot('invalid', 'invalid') })
  await waitFor(() => expect(source.getSnapshot()).toMatchObject({ status: 'failed', value: { token: 'one' } }))
  next.resolve({ kind: 'snapshot', value: snapshot('two') })
  await waitFor(() => expect(source.getSnapshot()).toMatchObject({ status: 'live', value: { token: 'two' } }))
  unsubscribe()
  await owner.dispose()
  await ended.promise
  next.resolve({ kind: 'snapshot', value: snapshot('late') })
  expect(source.getSnapshot()).toMatchObject({ status: 'loading', value: undefined })
})
it('marks a lost carrier stale and opens a fresh baseline after the native generation reconnects', async () => {
  const runtime = await SlotTestRuntime.create()
  onTestFinished(() => runtime.dispose())
  await runtime.mount({ inject: resourcesInject, apply: applyResources })
  const generation = createSnapshotStore<ConnectionGeneration | undefined>({ id: 1, host: { home: '/' } })
  const lose = Promise.withResolvers<void>()
  let opens = 0
  let closed = 0
  const remote = {
    $stream<T>(options: RemoteStreamOptions<T>) { return new RemoteStream({ generation }, options) },
    student: { watch(_id: SessionId, _request: object, signal?: AbortSignal): RemoteStreamHandle<StudentWatchFrame, never> {
      const current = ++opens
      const source = (async function* () {
        try {
          yield { kind: 'snapshot' as const, value: snapshot(`generation-${current}`) }
          if (current === 1) {
            const abort = () => lose.resolve()
            signal?.addEventListener('abort', abort, { once: true })
            try { if (!signal?.aborted) await lose.promise } finally { signal?.removeEventListener('abort', abort) }
            if (signal?.aborted) return
            generation.set(undefined); throw new RemoteStreamCarrierError('Carrier lost')
          }
          await new Promise<void>(resolve => { if (signal?.aborted) resolve(); else signal?.addEventListener('abort', () => resolve(), { once: true }) })
        } finally { closed++ }
      })()
      return { [Symbol.asyncIterator]: () => source, dispose() {}, end() {}, send() {} }
    } },
  }
  const owner = createStudentResourceOwner(remote)
  onTestFinished(() => owner.dispose())
  const release = runtime.ctx.resources.register(owner.provider)
  onTestFinished(release)
  const source = runtime.ctx.resources.source(studentResourceAddress(SessionId('s'), { kind: 'settings' }))
  const unsubscribe = source.subscribe(() => {})
  onTestFinished(unsubscribe)
  await waitFor(() => expect(source.getSnapshot()).toMatchObject({ status: 'live', value: { token: 'generation-1' } }))
  lose.resolve()
  await waitFor(() => expect(source.getSnapshot()).toMatchObject({ status: 'failed', value: { token: 'generation-1' }, failure: { code: 'student/unavailable' } }))
  expect(closed).toBe(1)
  generation.set({ id: 2, host: { home: '/' } })
  await waitFor(() => expect(source.getSnapshot()).toMatchObject({ status: 'live', value: { token: 'generation-2' } }))
  unsubscribe()
  await owner.dispose()
  expect(closed).toBe(2)
})
