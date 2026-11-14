/** Bounded consistent discovery and version reads shared by Node CLI and DSH application. */
import type { FsInfo, FsTargetKey, FsVersion, FsWriteIntent } from '@deepseek-ai/dsh-fs'
import { createHash } from 'node:crypto'
import { stateSchema } from '../schema.ts'
import { migrateStudyFile } from './legacy.ts'
import { validateStudyFiles, type FileIssue, type ParsedFile, type ValidationResult, type ValidatedWorkspace, type NativeInputObservation } from './validation.ts'
import type { OfficialFile } from './schema.ts'
import type { BackupRetentionQueue } from './backup-retention.ts'
import { StudyReadCache } from './cache.ts'
import { migrationOutputPaths } from './recovery.ts'

/** Stable observation supplied by the execution-world filesystem. */
export interface FileObservation extends FsInfo { targetKey: FsTargetKey }
/** Narrow filesystem adapter. Read-only clients omit write and backup facilities. */
export interface StudyFiles {
  /** Cache ownership follows this adapter or its application Host. */
  cache?: StudyReadCache
  /** Application adapters share the Host's retention queue; read-only adapters omit it. */
  backupRetention?: BackupRetentionQueue
  stat(path: string, signal: AbortSignal): Promise<FileObservation | undefined>
  list(path: string, signal: AbortSignal): Promise<{ name: string; type: FsInfo['type'] }[]>
  read(path: string, signal: AbortSignal, limit: number): Promise<Uint8Array>
  write?(path: string, content: string, intent: FsWriteIntent, signal: AbortSignal): Promise<FsVersion>
  remove?(path: string, version: FsVersion, signal: AbortSignal): Promise<void>
}
/** One exact source observation, retaining original bytes for verification and recovery. */
export interface ObservedFile { path: string; targetKey: FsTargetKey; version: FsVersion; bytes: Uint8Array; file?: OfficialFile }
/** Validated read; invalid entities remain inspectable and never acquire a current workspace projection. */
export interface WorkspaceRead {
  /** Derived queries reuse the same adapter's validated source observations. */
  cache?: StudyReadCache
  status: 'valid' | 'missing' | 'invalid' | 'future-format' | 'changing' | 'legacy' | 'archived'
  files: ObservedFile[]
  membership: { path: string; names: string[] }[]
  issues: FileIssue[]
  workspace?: ValidatedWorkspace
  legacy?: unknown
}
const MAX_FILE_BYTES = 8_388_608
const MAX_TOTAL_BYTES = 33_554_432

/**
 * Read a stable set of official files, checking membership and actual versions on both sides.
 * @param fs - filesystem adapter in the caller's execution world.
 * @param signal - cancels discovery, bounded rereads and byte reads.
 * @param prior - preserved validated versions available for frozen-content checks.
 * @param nativeSources - independently resolved consumed input observations, empty for the read-only CLI.
 * @returns validated facts or an explicit incomplete, invalid or changing result.
 */
export async function readWorkspace(fs: StudyFiles, signal: AbortSignal, prior: readonly { path: string; file: OfficialFile }[] = [], nativeSources: readonly NativeInputObservation[] = []): Promise<WorkspaceRead> {
  const owner = fs.cache ??= new StudyReadCache()
  return { ...await readWorkspaceFiles(fs, signal, prior, nativeSources, owner), cache: owner }
}

async function readWorkspaceFiles(fs: StudyFiles, signal: AbortSignal, prior: readonly { path: string; file: OfficialFile }[], nativeSources: readonly NativeInputObservation[], owner: StudyReadCache): Promise<WorkspaceRead> {
  const cache = owner.files
  for (let attempt = 0; attempt < 3; attempt += 1) {
    signal.throwIfAborted()
    const membership: WorkspaceRead['membership'] = []
    const paths = ['.study/settings.json', '.study/collections.json']
    const discoveryIssues: FileIssue[] = []
    for (const [path, limit] of [['.study/blocks', 5000], ['.study/worksheets', 500], ['.study/archives', 128]] as const) {
      const entries = await fs.list(path, signal)
      if (entries.length > limit) return { status: 'invalid', files: [], membership, issues: [{ path, field: '', rule: 'collection-limit', correction: `Keep at most ${limit} entity files in this directory.` }] }
      const names = entries.map(entry => `${entry.type}:${entry.name}`).sort()
      membership.push({ path, names })
      for (const entry of entries) {
        if (path === '.study/archives') {
          if (entry.type !== 'directory' || !/^[a-zA-Z0-9_-]{1,80}$/u.test(entry.name)) discoveryIssues.push({ path: `${path}/${entry.name}`, field: '', rule: 'archive-membership', correction: 'Keep each preserved term in a directory named after its stable term identity.' })
          continue
        }
        if (entry.type !== 'file' || !/^[a-zA-Z0-9_-]{1,80}\.json$/u.test(entry.name)) discoveryIssues.push({ path: `${path}/${entry.name}`, field: '', rule: 'file-membership', correction: 'Use one regular JSON file named after the stable entity identity.' })
        else paths.push(`${path}/${entry.name}`)
      }
    }
    const before = await Promise.all(paths.map(path => fs.stat(path, signal)))
    if (!before[0]) {
      const legacy = await fs.stat('.study/state.json', signal)
      if (!legacy) {
        if (paths.length > 2 || before[1]) return { status: 'invalid', files: [], membership, issues: [{ path: '.study/settings.json', field: '', rule: 'missing-settings', correction: 'Restore or create term settings for these entities.' }] }
        return { status: 'missing', files: [], membership, issues: discoveryIssues }
      }
      try {
        const bytes = await fs.read('.study/state.json', signal, MAX_FILE_BYTES)
        if ((await fs.stat('.study/state.json', signal))?.version !== legacy.version) continue
        const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
        if (typeof value === 'object' && value !== null && 'format' in value && typeof value.format === 'number' && value.format > 1) return { status: 'future-format', files: [{ path: '.study/state.json', ...legacy, bytes }], membership, issues: [{ path: '.study/state.json', field: 'format', rule: 'future-format', correction: 'Read this source with a compatible plugin; preserve its bytes.' }] }
        stateSchema.parse(migrateStudyFile(structuredClone(value)))
        return { status: 'legacy', files: [{ path: '.study/state.json', ...legacy, bytes }], membership, issues: [], legacy: value }
      } catch (error) {
        if (signal.aborted) throw error
        return { status: 'invalid', files: [], membership, issues: [{ path: '.study/state.json', field: '', rule: 'legacy-read', correction: error instanceof Error ? error.message : 'Preserve the original and restore valid JSON explicitly.' }] }
      }
    }
    const files: ObservedFile[] = []
    const input: ParsedFile[] = []
    const available = [...prior]
    let total = 0
    for (const [index, path] of paths.entries()) {
      const observed = before[index]
      if (!observed) continue
      if (observed.type !== 'file') { discoveryIssues.push({ path, field: '', rule: 'regular-file', correction: 'Use a regular UTF-8 JSON file.' }); continue }
      const cached = cache.get(observed.targetKey)
      if (cached?.file) available.push({ path, file: cached.file })
      let bytes: Uint8Array
      try { bytes = cached?.version === observed.version ? cached.bytes : await fs.read(path, signal, MAX_FILE_BYTES) }
      catch (error) { if (signal.aborted) throw error; discoveryIssues.push({ path, field: '', rule: 'file-read', correction: error instanceof Error ? error.message : 'Preserve the original and inspect this file.' }); continue }
      total += bytes.byteLength
      if (total > MAX_TOTAL_BYTES) return { status: 'invalid', files, membership, issues: [{ path: '.study', field: '', rule: 'workspace-size', correction: 'Archive older records; current official files are limited to 32 MiB.' }] }
      files.push({ path, ...observed, bytes })
      try {
        const value: unknown = cached?.version === observed.version ? cached.value : JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
        input.push({ path, value })
      } catch (error) { discoveryIssues.push({ path, field: '', rule: 'json', correction: error instanceof Error ? error.message : 'Save valid UTF-8 JSON.' }) }
    }
    const validation: ValidationResult = validateStudyFiles(input, available, nativeSources)
    const migration = validation.workspace?.settings.migration
    if (migration) {
      const backup = await fs.stat(migration.backupPath, signal)
      try {
        if (!backup || backup.type !== 'file' || !migration.backupPath.startsWith('.study/') || migration.backupPath === '.study/settings.json' || migration.backupPath === migration.sourcePath) throw new Error('A distinct preserved original-byte migration backup is required.')
        const bytes = await fs.read(migration.backupPath, signal, MAX_FILE_BYTES)
        if ((await fs.stat(migration.backupPath, signal))?.version !== backup.version) continue
        if (createHash('sha256').update(bytes).digest('hex') !== migration.sourceSha256) throw new Error('The preserved migration source bytes do not match their recorded digest.')
        const expected = migrationOutputPaths(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)))
        const present = new Set(validation.files.filter(file => file.file).map(file => file.path))
        const missing = expected.filter(path => !present.has(path))
        if (missing.length) discoveryIssues.push({ path: '.study/settings.json', field: 'migration', rule: 'migration-incomplete', correction: `Resume the verified migration under the same identities; missing outputs: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` and ${missing.length - 5} more` : ''}.` })
        const original = await fs.stat(migration.sourcePath, signal)
        if (original) {
          const originalBytes = await fs.read(migration.sourcePath, signal, MAX_FILE_BYTES)
          if ((await fs.stat(migration.sourcePath, signal))?.version !== original.version) continue
          if (createHash('sha256').update(originalBytes).digest('hex') !== migration.sourceSha256) throw new Error('The original legacy source changed after the verified migration plan.')
        }
      } catch (error) { if (signal.aborted) throw error; discoveryIssues.push({ path: '.study/settings.json', field: 'migration', rule: 'migration-source', correction: error instanceof Error ? error.message : 'Inspect the preserved source before resuming migration.' }) }
    }
    // Source verification also awaits filesystem reads; the official cut must cover those awaits.
    const after = await Promise.all(paths.map(path => fs.stat(path, signal)))
    if (before.some((entry, index) => entry?.version !== after[index]?.version || entry?.targetKey !== after[index]?.targetKey)) continue
    let changed = false
    for (const directory of membership) {
      const entries = await fs.list(directory.path, signal)
      if (JSON.stringify(entries.map(entry => `${entry.type}:${entry.name}`).sort()) !== JSON.stringify(directory.names)) changed = true
    }
    if (changed) continue
    const issues = [...discoveryIssues, ...validation.issues].slice(0, 100)
    for (const observed of files) {
      const parsed = validation.files.find(entry => entry.path === observed.path)?.file
      if (parsed) observed.file = parsed
    }
    if (issues.length > 0) return { status: issues.some(issue => issue.rule === 'future-format') ? 'future-format' : 'invalid', files, membership, issues, ...(validation.workspace && !discoveryIssues.some(issue => issue.path === '.study/settings.json') ? { workspace: { ...validation.workspace,
      blocks: validation.workspace.blocks.filter(block => !discoveryIssues.some(issue => issue.path === `.study/blocks/${block.id}.json`)),
      worksheets: validation.workspace.worksheets.filter(sheet => !discoveryIssues.some(issue => issue.path === `.study/worksheets/${sheet.id}.json`)),
    } } : {}) }
    for (const observed of files) {
      const value = input.find(entry => entry.path === observed.path)?.value
      if (cache.size >= 128) cache.delete(cache.keys().next().value ?? '')
      while ([...cache.values()].reduce((sum, entry) => sum + entry.bytes.byteLength, observed.bytes.byteLength) > MAX_TOTAL_BYTES && cache.size > 0) cache.delete(cache.keys().next().value ?? '')
      cache.set(observed.targetKey, { version: observed.version, bytes: observed.bytes, value, ...(observed.file ? { file: observed.file } : {}) })
    }
    return { status: validation.workspace?.settings.archivedAt !== undefined ? 'archived' : 'valid', files, membership, issues, ...(validation.workspace ? { workspace: validation.workspace } : {}) }
  }
  return { status: 'changing', files: [], membership: [], issues: [{ path: '.study', field: '', rule: 'changing-read', correction: 'Files changed during three reads. Finish the related edits and query again.' }] }
}
