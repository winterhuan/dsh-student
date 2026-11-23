/** The acceptance observer publishes one complete result and drains owned work at disposal. */
import assert from 'node:assert/strict'
import { readFile, writeFile, rename } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'
import { pathToFileURL } from 'node:url'

export const inject = ['clientModules']
export function apply(ctx, config) {
  let pending, completion = Promise.resolve(), dirty = false, disposed = false, failed = false
  async function inspect() {
    try {
      const graph = ctx.clientModules.graph()
      const row = graph.entries.find(row => row.id === '@openmaic/dsh-openmaic')
      if (!row) return
      const response = await ctx.clientModules.fetchBundle(new Request(new URL(row.url, 'http://fixture/'), { signal: AbortSignal.timeout(30000) }))
      assert.equal(response.status, 200)
      const served = await response.text()
      const path = ctx.clientModules.clientPath(row.id)
      const original = await readFile(path, 'utf8')
      assert.ok(served.includes(original), 'The carrier must serve the complete original browser bundle')
      let registered
      runInNewContext(served, { window: { __ModuleLoader__: { load(value) { registered = value } } } })
      assert.equal(registered.id, row.id)
      assert.equal(typeof registered.factory, 'function')
      const source = JSON.parse(await readFile(new URL('../source.json', pathToFileURL(path)), 'utf8'))
      const hash = createHash('sha256').update(original).digest('hex')
      assert.equal(hash, source.originalClientSha256)
      return { row, clientSha256: hash, source, servedStatus: response.status, factoryId: registered.id, graph }
    } catch (error) { failed = true; return { error: String(error), stack: error.stack } }
  }
  function schedule() {
    if (disposed || failed) return
    dirty = true
    if (!pending) {
      pending = (async () => {
        while (dirty && !disposed && !failed) {
          dirty = false
          const result = await inspect()
          if (result) {
            await writeFile(`${config.result}.tmp`, JSON.stringify(result, null, 2))
            await rename(`${config.result}.tmp`, config.result)
          }
        }
      })().finally(() => { pending = undefined })
      completion = pending
      pending.catch(() => { /* Disposal owns publication failures that cannot be saved in the result file. */ })
    }
    return pending
  }
  ctx.effect(() => {
    const detach = ctx.clientModules.onGraphChanged(schedule)
    void schedule()
    return async () => { disposed = true; detach(); await completion }
  })
}
