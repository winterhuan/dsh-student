/** Offline upgrade operation: stage, validate, compare original bytes, then replace the complete directory. */
import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { nodeStudyFiles } from './node.ts'
import { readWorkspace } from './read.ts'
import { readLessonFile } from './lessons.ts'
import { dailyPlanSchema } from './schema.ts'
import { emptyRetiredBlock, pruneRetiredPlan } from './cleanup.ts'
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
async function fingerprint(directory: string): Promise<string> {
  const items: [string, string][] = []
  async function visit(path: string) {
    for (const entry of (await readdir(join(directory, path), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = join(path, entry.name)
      if (entry.isSymbolicLink()) throw new Error('Resolve symbolic links before offline cleanup.')
      if (entry.isDirectory()) await visit(child)
      else if (entry.isFile()) items.push([child, digest(await readFile(join(directory, child)))])
      else throw new Error('Cleanup requires ordinary files and directories.')
    }
  }
  await visit('')
  return digest(Buffer.from(JSON.stringify(items)))
}
/**
 * Delete explicitly selected ended empty blocks; preserve complete backup and all real evidence.
 * @param cwd - Offline workspace with its owning service stopped.
 * @param ids - Confirmed abandoned block identities, never inferred from an empty lesson index.
 * @returns Exact deleted and modified paths and the retained rollback directory.
 */
export async function cleanupEmptyActivities(cwd: string, ids: readonly string[]): Promise<{ deleted: string[]; modified: string[]; backup?: string }> {
  if (ids.some(id => !/^[a-zA-Z0-9_-]{1,80}$/u.test(id))) throw new Error('Use explicit valid block IDs.')
  const signal = new AbortController().signal
  const fs = nodeStudyFiles(cwd)
  const before = await fingerprint(join(cwd, '.study'))
  const original = await readWorkspace(fs, signal)
  const lessons = await readLessonFile(fs, signal)
  if (original.status !== 'valid' || !original.workspace || !['valid', 'missing'].includes(lessons.status)) throw new Error('Restore valid records before cleanup.')
  const prior = new Set<string>(original.workspace.settings.retiredEmptyBlocks?.map(item => item.id) ?? [])
  const selected = [...new Set(ids)].filter(id => !prior.has(id))
  if (!selected.length) return { deleted: [], modified: [] }
  for (const id of selected) {
    const block = original.workspace.blocks.find(item => item.id === id)
    if (!block || !emptyRetiredBlock(block)) throw new Error(`Block ${id} is not an ended empty activity.`)
    if (lessons.file?.lessons.some(lesson => lesson.blockId === id || lesson.activity?.blockId === id)) throw new Error(`Block ${id} retains classroom or recovery ownership.`)
  }
  const stage = await mkdtemp(join(cwd, '.student-cleanup-'))
  const backup = join(cwd, `.study-before-cleanup-${randomUUID()}`)
  const deleted: string[] = [], modified: string[] = []
  let moved = false
  try {
    await cp(join(cwd, '.study'), join(stage, '.study'), { recursive: true, errorOnExist: true, force: false })
    const settings = structuredClone(original.workspace.settings)
    settings.retiredEmptyBlocks ??= []
    await mkdir(join(stage, '.study/cleanup'), { recursive: true })
    for (const id of selected) {
      const path = `.study/blocks/${id}.json`
      const bytes = await readFile(join(stage, path)), sha256 = digest(bytes), backupPath = `.study/cleanup/${sha256}.json`
      await writeFile(join(stage, backupPath), bytes, { flag: 'wx', mode: 0o600 })
      settings.retiredEmptyBlocks.push({ id: id as typeof settings.retiredEmptyBlocks[number]['id'], backupPath, sha256, reason: 'Explicit upgrade cleanup of an ended activity without questions, responses, help or rounds.' })
      await rm(join(stage, path)); deleted.push(path)
    }
    settings.revision += 1; settings.updatedAt = Date.now()
    await writeFile(join(stage, '.study/settings.json'), JSON.stringify(settings, null, 2)); modified.push('.study/settings.json')
    const planDirectory = join(stage, '.study/plans')
    const planNames = await readdir(planDirectory).catch((error: unknown) => { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return []; throw error })
    for (const name of planNames.filter(name => /^\d{4}-\d{2}-\d{2}\.json$/u.test(name))) {
      const path = `.study/plans/${name}`
      const plan = dailyPlanSchema.parse(JSON.parse(await readFile(join(stage, path), 'utf8')))
      const next = pruneRetiredPlan(plan, new Set(selected))
      if (next === plan) continue
      next.revision += 1; next.updatedAt = Date.now()
      await writeFile(join(stage, path), JSON.stringify(next, null, 2)); modified.push(path)
    }
    const checked = await readWorkspace(nodeStudyFiles(stage), signal)
    if (checked.status !== 'valid') throw new Error(`Cleanup validation failed: ${JSON.stringify(checked.issues)}`)
    if (await fingerprint(join(cwd, '.study')) !== before) throw new Error('Learning records changed during cleanup. Read the new answers before retrying.')
    await rename(join(cwd, '.study'), backup); moved = true
    if (await fingerprint(backup) !== before) { await rename(backup, join(cwd, '.study')); moved = false; throw new Error('Concurrent changes preserved; cleanup was canceled.') }
    await rename(join(stage, '.study'), join(cwd, '.study')); moved = false
    return { deleted, modified, backup }
  } catch (error) {
    if (moved) await rename(backup, join(cwd, '.study'))
    throw error
  } finally { await rm(stage, { recursive: true, force: true }) }
}
