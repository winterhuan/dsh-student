import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, it, onTestFinished } from 'vitest'
import { apply } from './openmaic-client-observer.mjs'

it('serializes graph inspections and awaits publication before its observer is disposed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'student-client-observer-'))
  let release!: () => void
  const blocked = new Promise<void>(resolve => { release = resolve })
  let entered!: () => void
  const reading = new Promise<void>(resolve => { entered = resolve })
  let changed!: () => void
  let dispose!: () => Promise<void>
  let calls = 0
  let detached = false
  const bundle = 'window.__ModuleLoader__.load({id:"@openmaic/dsh-openmaic",factory:function(){}});'
  await mkdir(join(root, 'lib'))
  await writeFile(join(root, 'lib/client.js'), bundle)
  await writeFile(join(root, 'source.json'), JSON.stringify({ originalClientSha256: createHash('sha256').update(bundle).digest('hex') }))
  const result = join(root, 'result.json')
  onTestFinished(async () => { release(); await dispose?.(); await rm(root, { recursive: true, force: true }) })
  apply({ effect(register: () => () => Promise<void>) { dispose = register() }, clientModules: {
    graph() { return { entries: [{ id: '@openmaic/dsh-openmaic', url: '/client.js' }] } },
    clientPath() { return join(root, 'lib/client.js') },
    async fetchBundle() { calls++; entered(); await blocked; return new Response(bundle) },
    onGraphChanged(callback: () => void) { changed = callback; return () => { detached = true } },
  } }, { result })
  await reading
  changed(); changed()
  await Promise.resolve()
  expect(calls).toBe(1)
  let disposed = false
  const disposing = Promise.resolve(dispose()).then(() => { disposed = true })
  await Promise.resolve()
  expect(detached).toBe(true)
  expect(disposed).toBe(false)
  release()
  await disposing
  expect(JSON.parse(await readFile(result, 'utf8'))).toMatchObject({ factoryId: '@openmaic/dsh-openmaic', servedStatus: 200 })
  const final = await readFile(result, 'utf8')
  changed()
  await Promise.resolve()
  expect(await readFile(result, 'utf8')).toBe(final)
})

it('retains an actual carrier assertion failure when later graph changes would succeed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'student-client-observer-failure-'))
  let changed!: () => Promise<void> | undefined
  let dispose!: () => Promise<void>
  let status = 403
  const result = join(root, 'result.json')
  onTestFinished(async () => { await dispose?.(); await rm(root, { recursive: true, force: true }) })
  apply({ effect(register: () => () => Promise<void>) { dispose = register() }, clientModules: {
    graph() { return { entries: [{ id: '@openmaic/dsh-openmaic', url: '/client.js' }] } },
    async fetchBundle() { return new Response('', { status }) },
    onGraphChanged(callback: () => Promise<void> | undefined) { changed = callback; return () => {} },
  } }, { result })
  await changed()
  const failure = JSON.parse(await readFile(result, 'utf8'))
  expect(failure.error).toContain('403')
  expect(failure.stack).toContain('AssertionError')
  status = 200
  await changed()
  expect(JSON.parse(await readFile(result, 'utf8'))).toEqual(failure)
})
