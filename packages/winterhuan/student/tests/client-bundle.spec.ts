import { mkdtemp, rm } from 'node:fs/promises'
import { isBuiltin } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'tsdown'
import { expect, it } from 'vitest'
import studentBuild from '../tsdown.config.ts'

it('builds the Student Client without Node modules unavailable in the browser loader', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'student-client-bundle-'))
  try {
    const [client] = studentBuild({ env: { DSH_BUILD_FACE: 'client' } })
    // Build current source through the production Client config, independently of earlier tsc outputs.
    const bundles = await build({ ...client, config: false, workspace: false,
      cwd: fileURLToPath(new URL('..', import.meta.url)), entry: { client: 'src/client/index.ts' },
      outDir, write: false, report: false, logLevel: 'silent' })
    try {
      const chunks = bundles.flatMap(bundle => bundle.chunks).filter(chunk => chunk.type === 'chunk')
      expect(chunks.some(chunk => chunk.fileName === 'client.js')).toBe(true)
      expect(chunks.flatMap(chunk => [...chunk.imports, ...chunk.dynamicImports]).filter(isBuiltin)).toEqual([])
    } finally {
      await Promise.all(bundles.map(bundle => bundle[Symbol.asyncDispose]()))
    }
  } finally {
    await rm(outDir, { recursive: true, force: true })
  }
})
