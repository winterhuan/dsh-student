/** Node filesystem adapter for the packaged read-only validator. */
import { stat, realpath, readdir, readFile } from 'node:fs/promises'
import { resolve, relative, isAbsolute } from 'node:path'
import type { FsTargetKey, FsVersion } from '@deepseek-ai/dsh-fs'
import type { StudyFiles } from './read.ts'

/**
 * Create a read-only adapter contained in one local workspace.
 * @param cwd - workspace root; symlink aliases resolve to their actual stable identity.
 * @returns adapter with no business-write or repair capability.
 */
export function nodeStudyFiles(cwd: string): StudyFiles {
  const root = resolve(cwd)
  const actualRoot = realpath(root)
  async function target(path: string) {
    const full = resolve(root, path)
    let actual: string
    try { actual = await realpath(full) } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
      // Resolve the nearest existing ancestor so absent descendants cannot escape via a parent link.
      const parent = resolve(full, '..')
      if (parent === full) throw error
      const relativeParent = relative(root, parent)
      actual = resolve(await target(relativeParent), full.slice(parent.length + 1))
    }
    const child = relative(await actualRoot, actual)
    if (child.startsWith('..') || isAbsolute(child)) throw new Error('Study files must remain inside the current workspace.')
    return actual
  }
  return {
    async stat(path, signal) {
      signal.throwIfAborted()
      const full = await target(path)
      try {
        const info = await stat(full, { bigint: true })
        return { targetKey: full as FsTargetKey, version: `${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}` as FsVersion, type: info.isFile() ? 'file' : info.isDirectory() ? 'directory' : 'other', size: Number(info.size) }
      } catch (error) { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return undefined; throw error }
    },
    async list(path, signal) {
      signal.throwIfAborted()
      try { return (await readdir(await target(path), { withFileTypes: true })).map(entry => ({ name: entry.name, type: entry.isFile() ? 'file' as const : entry.isDirectory() ? 'directory' as const : 'other' as const })) }
      catch (error) { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return []; throw error }
    },
    async read(path, signal, limit) {
      const full = await target(path)
      const info = await stat(full)
      if (!info.isFile() || info.size > limit) throw new Error(`${path} must be a regular file of at most ${limit} bytes.`)
      const bytes = await readFile(full, { signal })
      if (bytes.length > limit) throw new Error(`${path} exceeds its read limit.`)
      return bytes
    },
  }
}
