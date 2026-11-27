/** Bounded consistent discovery and version reads shared by Node CLI and DSH application. */
import type { FsInfo, FsTargetKey, FsVersion, FsWriteIntent } from '@deepseek-ai/dsh-fs'
import { createHash } from 'node:crypto'
import { stateSchema } from '../schema.ts'
import { readLessonFile, type LessonFileRead } from './lessons.ts'
import { scopeSupports } from '../capabilities.ts'
import { studyDay } from '../learning/shared.ts'
import { blockSchema, termSettingsSchema, dailyPlanSchema } from './schema.ts'
import { deriveEvidence, evidenceDay } from '../learning/evidence.ts'
import { replayMistake } from '../learning/schedule.ts'
import { migrateStudyFile } from './legacy.ts'
import { validateStudyFiles, type FileIssue, type ParsedFile, type ValidationResult, type ValidatedWorkspace, type NativeInputObservation } from './validation.ts'
import type { NativeHistoryVerification } from '../native-history.ts'
import type { OpenmaicSourceVerification, OpenmaicInputObservation } from '../openmaic/feedback-schema.ts'
import type { OfficialFile } from './schema.ts'
import type { BackupRetentionQueue } from './backup-retention.ts'
import { StudyReadCache } from './cache.ts'
import { migrationOutputPaths, readBackups, backupVersions } from './recovery.ts'

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
  totalBytes?: number
  membership: { path: string; names: string[] }[]
  issues: FileIssue[]
  /** Missing or incompatible explicit history is excluded without blocking current learning. */
  archiveIssues?: FileIssue[]
  /** Exact original archive versions participate in source and query rereads. */
  archiveFiles?: ObservedFile[]
  /** Structurally compatible source dependencies; these never grant progress before authenticated replay. */
  archiveSources?: { workspace: ValidatedWorkspace; references: NonNullable<ValidatedWorkspace['settings']['evidenceReferences']>; lessons: LessonFileRead }[]
  /** Independently authorized original sources remain separate from agent-authored file validity. */
  sourceVerification?: { native: NativeHistoryVerification[]; openmaic: OpenmaicSourceVerification[] }
  /** Backup inspection failures remain independent from official-file validity. */
  backupIssues?: FileIssue[]
  workspace?: ValidatedWorkspace
  legacy?: unknown
}
const MAX_FILE_BYTES = 8_388_608
const MAX_TOTAL_BYTES = 33_554_432

/**
 * Read a stable set of official files, checking membership and actual versions on both sides.
 * @param fs - filesystem adapter in the caller's execution world.
 * @param signal - cancels discovery, bounded rereads and byte reads.
 * @param prior - supplied preserved versions; omitted reads use verified observed-version backups for cold frozen-content checks.
 * @param nativeSources - independently resolved consumed input observations, empty for the read-only CLI.
 * @param openmaicSources - independently authorized original official submissions and grading.
 * @param options - optional clock timestamp and additional plan day to read alongside today and recent plans.
 * @returns validated facts or an explicit incomplete, invalid or changing result.
 */
export async function readWorkspace(fs: StudyFiles, signal: AbortSignal, prior?: readonly { path: string; file: OfficialFile }[], nativeSources: readonly NativeInputObservation[] = [], openmaicSources: readonly OpenmaicInputObservation[] = [], options: { now?: number; planDay?: string } = {}): Promise<WorkspaceRead> {
  const owner = fs.cache ??= new StudyReadCache()
  const backups = prior === undefined ? await readBackups(fs, signal) : undefined
  for (let attempt = 0; attempt < 3; attempt++) {
    const read = await readWorkspaceFiles(fs, signal, prior ?? backupVersions(backups!.backups), nativeSources, openmaicSources, owner, MAX_TOTAL_BYTES, options)
    if (!read.workspace || read.status !== 'valid') return { ...read, cache: owner, ...(backups ? { backupIssues: backups.issues } : {}) }
    const archiveIssues: FileIssue[] = [], archiveFiles: ObservedFile[] = [], archiveSources: NonNullable<WorkspaceRead['archiveSources']> = []
    read.workspace.archivedEvidence = []
    const requestedTerms = [...new Set((read.workspace.settings.evidenceReferences ?? []).map(reference => reference.termId))]
    const terms = requestedTerms.slice(0, 128)
    if (requestedTerms.length > terms.length) archiveIssues.push({ path: '.study/archives', field: '', rule: 'archive-reference', correction: 'Reference at most 128 original terms in one current read.' })
    let total = read.totalBytes ?? read.files.reduce((sum, file) => sum + file.bytes.byteLength, 0)
    const archiveSettings: { path: string; observation: FileObservation | undefined }[] = []
    for (const term of terms) {
      const prefix = `.study/archives/${term}`
      const path = (relative: string) => `${prefix}/${relative.slice('.study/'.length)}`
      archiveSettings.push({ path: path('.study/settings.json'), observation: await fs.stat(path('.study/settings.json'), signal) })
      const archiveFs: StudyFiles = { cache: owner, stat: (relative, signal) => fs.stat(path(relative), signal), list: (relative, signal) => relative === '.study/archives' ? Promise.resolve([]) : fs.list(path(relative), signal), read: (relative, signal, limit) => fs.read(path(relative), signal, limit) }
      const archive = await readWorkspaceFiles(archiveFs, signal, [], nativeSources, openmaicSources, owner, Math.max(0, MAX_TOTAL_BYTES - total))
      const archiveBytes = archive.totalBytes ?? archive.files.reduce((sum, file) => sum + file.bytes.byteLength, 0)
      const lessons = await readLessonFile({ ...archiveFs, read: (path, signal, limit) => archiveFs.read(path, signal, Math.max(0, Math.min(limit, MAX_TOTAL_BYTES - total - archiveBytes))) }, signal)
      if (lessons.bytes && lessons.observation) {
        total += lessons.bytes.byteLength
        archiveFiles.push({ path: path('.study/openmaic-lessons.json'), targetKey: lessons.observation.targetKey, version: lessons.observation.version, bytes: lessons.bytes })
      }
      archiveSettings.push({ path: path('.study/openmaic-lessons.json'), observation: lessons.observation })
      const original = archive.workspace
      const references = read.workspace.settings.evidenceReferences!.filter(reference => reference.termId === term)
      total += archiveBytes
      archiveFiles.push(...archive.files.map(file => ({ ...file, path: path(file.path) })))
      read.membership.push(...archive.membership.filter(directory => directory.path !== '.study/archives').map(directory => ({ ...directory, path: path(directory.path) })))
      if (total > MAX_TOTAL_BYTES || archive.status !== 'archived' || !original || original.settings.termId !== term || !original.settings.learnerId || original.settings.learnerId !== read.workspace.settings.learnerId) {
        archiveIssues.push({ path: prefix, field: '', rule: 'archive-reference', correction: 'Restore a valid archived term of this same confirmed learner; unavailable history grants no progress.' }); continue
      }
      const structural = references.filter(reference => {
        const entity = reference.ownerKind === 'block' ? original.blocks.find(block => block.id === reference.ownerId) : original.worksheets.find(sheet => sheet.id === reference.ownerId)
        const response = entity?.responses.find(response => response.id === reference.responseId)
        const question = (entity?.kind === 'block' ? entity.questions : entity?.items)?.find(question => question.id === response?.questionId)
        if (!question?.capability || entity?.learnerId !== reference.learnerId || question.capability.goalId !== reference.goalId || !scopeSupports(question.capability.scope, reference.scope)) {
          if (archiveIssues.length < 100) archiveIssues.push({ path: `${prefix}/${reference.ownerKind === 'block' ? 'blocks' : 'worksheets'}/${reference.ownerId}.json`, field: reference.responseId, rule: 'archive-reference', correction: 'Reference the original response, learner, capability and an explicitly compatible tested range.' })
          return false
        }
        return true
      })
      if (structural.length) archiveSources.push({ workspace: original, references: structural, lessons })
      const compatible = structural.filter(reference => {
        if (reference.review) {
          const entity = reference.ownerKind === 'block' ? original.blocks.find(block => block.id === reference.ownerId)! : original.worksheets.find(sheet => sheet.id === reference.ownerId)!
          const response = entity.responses.find(response => response.id === reference.responseId)!
          const question = (entity.kind === 'block' ? entity.questions : entity.items).find(question => question.id === response.questionId)!
          const mistake = original.collections?.mistakes.find(mistake => mistake.id === reference.review!.mistakeId && (mistake.objectiveId === question.capability!.goalId || mistake.objectiveId === question.objectiveId) && mistake.subject === entity!.subject)
          const replay = mistake ? replayMistake({ ...mistake, objectiveId: question.capability!.goalId }, deriveEvidence(original), original.settings.archivedAt!) : undefined
          if (!replay || replay.stage !== reference.review.stage || replay.dueAt !== reference.review.dueAt || JSON.stringify(replay.independentDays) !== JSON.stringify(reference.review.independentDays)) {
            archiveIssues.push({ path: prefix, field: `${reference.responseId}.review`, rule: 'archive-review', correction: 'Retain the original independently replayed stage, due date and actual independent days.' })
            return false
          }
        }
        return true
      })
      if (compatible.length) read.workspace.archivedEvidence.push({ workspace: original, references: compatible })
    }
    const observations = [...read.files, ...archiveFiles]
    const after = await Promise.all(observations.map(file => fs.stat(file.path, signal)))
    if (observations.some((file, index) => after[index]?.version !== file.version || after[index]?.targetKey !== file.targetKey)) continue
    let changed = false
    for (const settings of archiveSettings) { const after = await fs.stat(settings.path, signal); if (after?.version !== settings.observation?.version || after?.targetKey !== settings.observation?.targetKey) changed = true }
    for (const directory of read.membership) if (JSON.stringify((await fs.list(directory.path, signal)).map(entry => `${entry.type}:${entry.name}`).sort()) !== JSON.stringify(directory.names)) changed = true
    if (changed) continue
    return { ...read, archiveIssues, archiveFiles, archiveSources, cache: owner, ...(backups ? { backupIssues: backups.issues } : {}) }
  }
  return { status: 'changing', files: [], membership: [], issues: [{ path: '.study/archives', field: '', rule: 'changing-read', correction: 'Finish archive edits and read the original history again.' }], cache: owner }
}

async function readWorkspaceFiles(fs: StudyFiles, signal: AbortSignal, prior: readonly { path: string; file: OfficialFile }[], nativeSources: readonly NativeInputObservation[], openmaicSources: readonly OpenmaicInputObservation[], owner: StudyReadCache, budget = MAX_TOTAL_BYTES, options: { now?: number; planDay?: string } = {}): Promise<WorkspaceRead> {
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
    const planEntries = await fs.list('.study/plans', signal)
    membership.push({ path: '.study/plans', names: planEntries.map(entry => `${entry.type}:${entry.name}`).sort() })
    if (planEntries.length > 1000) discoveryIssues.push({ path: '.study/plans', field: '', rule: 'collection-limit', correction: 'Keep at most 1,000 daily plans in this term; archive the term before adding more. No records were removed.' })
    const planPaths = planEntries.slice(0, 1000).flatMap(entry => {
      if (entry.type !== 'file' || !/^\d{4}-\d{2}-\d{2}\.json$/u.test(entry.name)) { discoveryIssues.push({ path: `.study/plans/${entry.name}`, field: '', rule: 'file-membership', correction: 'Use one regular YYYY-MM-DD.json file per learning day.' }); return [] }
      return [`.study/plans/${entry.name}`]
    })
    const planBefore = await Promise.all(planPaths.map(path => fs.stat(path, signal)))
    const planBytes = planBefore.reduce((sum, info) => sum + (info?.size ?? 0), 0)
    for (const [i, info] of planBefore.entries()) if (!info || info.type !== 'file' || info.size === undefined || info.size > 1_048_576) discoveryIssues.push({ path: planPaths[i]!, field: '', rule: 'plan-size', correction: 'Keep each daily plan within 1 MiB; preserve original records and archive or simplify the arrangement explicitly.' })
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
    if (planBytes > budget) discoveryIssues.push({ path: '.study/plans', field: '', rule: 'workspace-size', correction: 'Daily plans exceed the 32 MiB term budget; preserve originals and archive the term before continuing.' })
    let total = planBytes > budget ? 0 : planBytes
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
      if (total > budget) return { status: 'invalid', files, membership, issues: [{ path: '.study', field: '', rule: 'workspace-size', correction: 'Keep the current files and selected original history within the 32 MiB read budget.' }] }
      files.push({ path, ...observed, bytes })
      try {
        const value: unknown = cached?.version === observed.version ? cached.value : JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
        input.push({ path, value })
      } catch (error) { discoveryIssues.push({ path, field: '', rule: 'json', correction: error instanceof Error ? error.message : 'Save valid UTF-8 JSON.' }) }
    }
    const settingsValue = termSettingsSchema.safeParse(input.find(entry => entry.path === '.study/settings.json')?.value)
    const parsedBlocks = input.flatMap(entry => { const parsed = blockSchema.safeParse(entry.value); return parsed.success ? [parsed.data] : [] })
    const days = settingsValue.success ? deriveEvidence({ settings: settingsValue.data, blocks: parsedBlocks, worksheets: [], nativeSources, openmaicSources }).entries.filter(entry => entry.sourceStatus === 'known' && entry.result !== 'unassessed').flatMap(entry => { const day = evidenceDay(entry); return day ? [day] : [] }) : []
    const selectedDays = new Set([studyDay(options.now ?? Date.now()), ...[...new Set(days)].sort().reverse().slice(0, 3), ...(options.planDay ? [options.planDay] : [])])
    for (const block of parsedBlocks) if (block.plan && block.responses.some(response => { const date = response.answerDate; return date?.kind === 'instant' ? selectedDays.has(studyDay(date.at)) : date?.kind === 'day' && selectedDays.has(date.day) })) selectedDays.add(block.plan.day)
    const resumed = parsedBlocks.filter(block => block.endedAt === undefined || block.rounds?.some(round => round.endedAt === undefined)).sort((a, b) => b.startedAt - a.startedAt)[0]
    if (resumed?.plan) selectedDays.add(resumed.plan.day)
    const finished = parsedBlocks.filter(block => block.plan && block.endedAt !== undefined && studyDay(block.endedAt) === studyDay(options.now ?? Date.now())).sort((a, b) => b.endedAt! - a.endedAt!)[0]
    if (finished?.plan) selectedDays.add(finished.plan.day)
    // Read direct origins once; a chain is invalid and never followed recursively.
    const readPlan = async (path: string) => {
      const index = planPaths.indexOf(path), observed = planBefore[index]
      if (!observed || observed.type !== 'file' || (observed.size ?? 0) > 1_048_576 || files.some(file => file.path === path)) return
      const cached = cache.get(observed.targetKey)
      if (cached?.file) available.push({ path, file: cached.file })
      try {
        const bytes = cached?.version === observed.version ? cached.bytes : await fs.read(path, signal, 1_048_576)
        const value: unknown = cached?.version === observed.version ? cached.value : JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
        files.push({ path, ...observed, bytes }); input.push({ path, value })
      } catch (error) { if (signal.aborted) throw error; discoveryIssues.push({ path, field: '', rule: 'plan-read', correction: error instanceof Error ? error.message : 'Restore the original daily plan; saved activity and answers are retained.' }) }
    }
    for (const day of selectedDays) await readPlan(`.study/plans/${day}.json`)
    const origins = input.flatMap(entry => { const parsed = dailyPlanSchema.safeParse(entry.value); return parsed.success ? parsed.data.tasks.flatMap(task => task.original ? [task.original.day] : []) : [] })
    for (const day of new Set(origins)) await readPlan(`.study/plans/${day}.json`)
    const validation: ValidationResult = validateStudyFiles(input, available, nativeSources, openmaicSources)
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
    const planAfter = await Promise.all(planPaths.map(path => fs.stat(path, signal)))
    if (planBefore.some((entry, index) => entry?.version !== planAfter[index]?.version || entry?.targetKey !== planAfter[index]?.targetKey)) continue
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
    return { status: validation.workspace?.settings.archivedAt !== undefined ? 'archived' : 'valid', totalBytes: total, files, membership, issues, ...(validation.workspace ? { workspace: validation.workspace } : {}) }
  }
  return { status: 'changing', files: [], membership: [], issues: [{ path: '.study', field: '', rule: 'changing-read', correction: 'Files changed during three reads. Finish the related edits and query again.' }] }
}
