import type { ToolExecution } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-sandbox-policy'
import { readBackups, backupVersions, retainObservedBackups } from './files/recovery.ts'
import { applicationStudyFiles } from './files/application.ts'
import { readWorkspace, type WorkspaceRead } from './files/read.ts'
import { projectWorkspace } from './files/projection.ts'
import { nextRefreshAfter } from './learning/queries.ts'
import { archiveTermSchema, stateSchema, type StudyState } from './schema.ts'
import { scheduleMistakes } from './learning/schedule.ts'
import { updateStudy } from './learning/update/index.ts'

const MAX_BYTES = 8_388_608

import { migrateStudyFile } from './files/legacy.ts'
export { migrateStudyFile } from './files/legacy.ts'

const stateCache = new Map<string, { version: string; state: StudyState }>()
const entityCache = new Map<string, { signature: string; state: StudyState; at: number; refreshAfter: number }>()

/**
 * Read validated v2 entities or read/update legacy .study/state.json in the calling Session's filesystem.
 * Reads preserve absence; legacy writes require the observed version and current sandbox policy.
 * A competing writer causes an error, never an automatic replay of learning evidence.
 * Archiving validates the revision and command before writing; archive creation and state
 * replacement remain separate writes, so a later filesystem failure can leave an archive.
 * Parsed states are cached per observed file version, so unchanged reads skip re-reading
 * and re-validating the file; any write or external change drops the cache entry.
 * @param exec - calling agent and cancellation signal.
 * @param command - optional legacy learning update; omission reads the current state.
 * @param expectedRevision - revision observed by a submitting panel, checked before writing.
 * @returns the current or updated state, or undefined before setup or after a saved archive is read.
 * @throws StudyDataUnavailable for invalid v2 files; v2 mutation commands require the separate manual-save owner.
 */
export async function studyStore(exec: Pick<ToolExecution, 'agent' | 'signal'>, command?: unknown, expectedRevision?: number): Promise<StudyState | undefined> {
  const agent = exec.agent
  if (!agent?.session.header.cwd) throw new Error('请先在 DSH 中打开学习工作区。')
  exec.signal.throwIfAborted()
  const fs = agent.ctx.get('fs')
  const policy = agent.ctx.get('sandboxPolicy')
  if (!fs || !policy) throw new Error('学生插件需要 DSH 文件系统和沙箱策略服务。')
  const cwd = agent.session.header.cwd
  const files = applicationStudyFiles(exec)
  if (await files.stat('.study/settings.json', exec.signal)) {
    const backups = await readBackups(files, exec.signal)
    const read = await readWorkspace(files, exec.signal, backupVersions(backups.backups))
    if (read.status === 'valid') await retainObservedBackups(files, read, Date.now(), exec.signal)
    if (read.status === 'archived') return undefined
    if (read.status !== 'valid' || !read.workspace) throw new StudyDataUnavailable(read)
    if (command !== undefined) throw new Error('正式实体文件请通过原生聊天编辑，或使用带字段基线的手动保存接口。')
    const identity = read.files.find(file => file.path === '.study/settings.json')!.targetKey
    const signature = JSON.stringify(read.files.map(file => [file.targetKey, file.version]))
    const cached = entityCache.get(identity)
    const now = Date.now()
    if (cached?.signature === signature && now >= cached.at && now < cached.refreshAfter) return cached.state
    const state = projectWorkspace(read.workspace, now)
    if (entityCache.size >= 8) entityCache.clear()
    entityCache.set(identity, { signature, state, at: now, refreshAfter: nextRefreshAfter(state, now) })
    return state
  }
  const root = await fs.resolve(cwd, { signal: exec.signal })
  const target = await fs.resolve('.study/state.json', { cwd, signal: exec.signal })
  if (!fs.contains(root, target)) throw new Error('学习档案必须位于当前工作区内。')
  const before = await fs.stat(target, exec.signal)
  let state: StudyState | undefined
  if (before) {
    if (before.type !== 'file') throw new Error('.study/state.json 必须是普通文件。')
    const cached = stateCache.get(target.targetKey)
    if (cached && cached.version === before.version) {
      state = cached.state
    } else {
      const bytes = await fs.readBytes(target, exec.signal, MAX_BYTES)
      const after = await fs.stat(target, exec.signal)
      if (after?.version !== before.version) throw new Error('学习档案已更新，请查询最新状态后重试。')
      const parsed = stateSchema.parse(migrateStudyFile(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))))
      state = parsed.archivedAt !== undefined ? undefined : scheduleMistakes(parsed)
      if (state !== undefined) {
        if (stateCache.size >= 8) stateCache.clear()
        stateCache.set(target.targetKey, { version: after?.version ?? before.version, state })
      }
    }
  }
  if (command === undefined) return state
  const archive = archiveTermSchema.safeParse(command)
  if (archive.success && !state) throw new Error('请先建立学习档案，再归档学期。')
  if (expectedRevision !== undefined && expectedRevision !== (state?.revision ?? 0)) throw new StudyConflict()
  const next = updateStudy(state, command, Date.now())
  if (next === state) return state
  if (archive.success && state) {
    const name = `.study/archive-${state.profile.schoolYear.replace(/[^a-zA-Z0-9_-]/gu, '-')}-${state.profile.term}.json`
    const archiveTarget = await fs.resolve(name, { cwd, signal: exec.signal })
    if (!fs.contains(root, archiveTarget)) throw new Error('归档文件必须位于当前工作区内。')
    if (await fs.stat(archiveTarget, exec.signal)) throw new Error(`归档文件已存在：${name}。请先移走旧归档再归档本学期。`)
    await fs.writeText(archiveTarget, `${JSON.stringify(state, null, 2)}\n`, { kind: 'createIfAbsent' }, exec.signal, policy.resolve({ session: agent.session }))
  }
  // Derived review fields are replayed on read; keep them out of the file.
  const stored = { ...next, mistakes: next.mistakes.map(({ stage: _stage, independentDays: _days, dueAt: _due, ...mistake }) => mistake) }
  const content = `${JSON.stringify(stored, null, 2)}\n`
  if (Buffer.byteLength(content) > MAX_BYTES) throw new Error('本学期学习档案已达到 8 MiB 限制，请备份并使用新工作区。')
  await fs.writeText(target, content, before ? { kind: 'replaceIfVersion', version: before.version } : { kind: 'createIfAbsent' }, exec.signal, policy.resolve({ session: agent.session }))
  stateCache.delete(target.targetKey)
  return next
}

export { queryStudy } from './learning/queries.ts'

/** A stale sidebar must reload before it can change learning evidence. */
export class StudyConflict extends Error { constructor() { super('学习档案已更新，请刷新后核对再保存。') } }

/** Invalid current official files keep prior displays stale until an explicit repair is validated. */
export class StudyDataUnavailable extends Error {
  constructor(readonly read: WorkspaceRead) { super(read.issues[0]?.correction ?? 'Current Student files are unavailable.') }
}
