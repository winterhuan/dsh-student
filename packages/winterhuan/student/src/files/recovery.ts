/** Read-only migration, archive and restore descriptions. Agents perform every publication and repair directly. */
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { stateSchema } from '../schema.ts'
import { migrateStudyFile } from './legacy.ts'
import { canonical } from '../learning/shared.ts'
import { officialFileSchemas, termSettingsSchema, blockSchema, worksheetSchema, collectionsSchema, type OfficialFile, type TermId, type WorksheetFile } from './schema.ts'
import { validateStudyFiles, type FileIssue } from './validation.ts'
import type { ObservedFile, WorkspaceRead, StudyFiles } from './read.ts'

/**
 * Hash original bytes for backup/source verification and recoverable migration identity.
 * @param bytes - exact observed source bytes, before compatibility transformation.
 * @returns their SHA-256 digest.
 */
export function sourceSha256(bytes: Uint8Array): string { return createHash('sha256').update(bytes).digest('hex') }

function workbookMigrationId(id: string): string { return `workbook-${id}`.length <= 80 ? `workbook-${id}` : `workbook-${sourceSha256(new TextEncoder().encode(id)).slice(0, 32)}` }

/**
 * Locate stable entity outputs required by a preserved v1 source, allowing subsequent content corrections.
 * @param source - parsed original v1 material whose bytes have been verified independently.
 * @returns official paths required by the migrated term.
 */
export function migrationOutputPaths(source: unknown): string[] {
  const state = stateSchema.parse(migrateStudyFile(structuredClone(source)))
  return ['.study/settings.json', '.study/collections.json', ...state.sessions.map(block => `.study/blocks/${block.id}.json`),
    ...state.worksheets.map(sheet => `.study/worksheets/${sheet.id}.json`), ...[...state.workbookResults, ...state.workbookDrafts].map(workbook => `.study/worksheets/${workbookMigrationId(workbook.id)}.json`)]
}
/** One proposed migration file; existing valid output is resumed under its original identity. */
export interface MigrationOutput { path: string; file: OfficialFile; status: 'missing' | 'already-valid' | 'conflict' }
/** Unsupported legacy facts remain located in the preserved source material. */
export interface PendingLegacyFact { sourcePath: string; row: string; fields: string[]; reason: string }
/** Migration description identifies exact source/backup bytes and every independent output. */
export interface MigrationPlan { status: 'ready' | 'partial' | 'blocked'; termId?: TermId; sourceSha256: string; sourceVersion?: string; backupPath?: string; outputs: MigrationOutput[]; pending: PendingLegacyFact[]; issues: FileIssue[] }

/**
 * Describe a v1 conversion only after verifying a distinct original-byte backup.
 * @param read - freshly observed, non-mutating legacy read.
 * @param backup - independently observed original-byte backup, never an overwritten existing original.
 * @param existing - independently read existing v2 output for interrupted-operation recovery.
 * @returns stable entities, named unsupported facts and explicit partial/conflicting outputs; performs no writes.
 */
export function describeMigration(read: WorkspaceRead, backup: ObservedFile, existing: readonly { path: string; file: OfficialFile }[] = []): MigrationPlan {
  const source = read.files.find(file => file.path === '.study/state.json')
  const hash = source ? sourceSha256(source.bytes) : ''
  const plan: MigrationPlan = { status: 'blocked', sourceSha256: hash, outputs: [], pending: [], issues: [] }
  if (!source || read.status !== 'legacy' || backup.path === source.path || backup.targetKey === source.targetKey || sourceSha256(backup.bytes) !== hash) {
    plan.issues.push({ path: backup.path, field: '', rule: 'original-byte-backup', correction: 'Preserve a distinct original-byte backup and verify it against the currently observed v1 source.' })
    return plan
  }
  const parsed = stateSchema.safeParse(migrateStudyFile(structuredClone(read.legacy)))
  if (!parsed.success) { plan.issues.push({ path: source.path, field: '', rule: 'legacy-schema', correction: 'Preserve the original bytes and explicitly repair or review unsupported legacy data.' }); return plan }
  const state = parsed.data
  const termId = termSettingsSchema.shape.termId.parse(`legacy-${hash.slice(0, 32)}`)
  plan.termId = termId; plan.sourceVersion = source.version; plan.backupPath = backup.path
  const pending = (row: string, fields: string[], reason: string) => { const fact = { sourcePath: source.path, row, fields, reason }; plan.pending.push(fact); return fact }
  const declarations = z.object({ profile: z.object({ parentConfirmation: z.string().optional() }).passthrough(), courses: z.array(z.object({ parentConfirmation: z.string().optional() }).passthrough()) }).passthrough().parse(read.legacy)
  if (!declarations.profile.parentConfirmation?.trim()) pending('profile', ['parentConfirmation'], 'The original bytes contain no parent statement; compatibility defaults are not confirmation.')
  for (const [index, course] of declarations.courses.entries()) if (!course.parentConfirmation?.trim()) pending(`courses.${index}`, ['parentConfirmation'], 'The original bytes contain no course confirmation statement.')
  if (plan.pending.length) {
    plan.issues.push({ path: source.path, field: 'parentConfirmation', rule: 'legacy-confirmation', correction: 'Keep the verified legacy bytes and obtain explicit statements for reviewed v2 settings before conversion.' })
    return plan
  }
  const files: { path: string; file: OfficialFile }[] = []
  files.push({ path: '.study/settings.json', file: termSettingsSchema.parse({ format: 2, kind: 'term-settings', termId, revision: state.revision, updatedAt: state.updatedAt,
    profile: state.profile, materials: state.materials, courses: state.courses, ...(state.interests ? { interests: state.interests } : {}), ...(state.openmaic ? { openmaic: state.openmaic } : {}),
    ...(state.archivedAt !== undefined ? { archivedAt: state.archivedAt } : {}), migration: { sourcePath: source.path, sourceSha256: hash, backupPath: backup.path } }) })
  for (const [i, block] of state.sessions.entries()) {
    const legacy = [pending(`sessions.${i}`, ['historicalProfile', 'nativeSessionId', 'resolvedIntent'], 'The source has no historical profile snapshot, consumed native input identity or complete resolved intent.')]
    if (state.attempts.some(attempt => attempt.sessionId === block.id)) legacy.push(pending(`attempts[sessionId=${block.id}]`, ['publishedQuestionSource', 'originalResponseSource', 'answerDate', 'assistance'], 'Flattened assessment text and classification are preserved declarations; grading time does not establish answer time.'))
    if (state.task?.sessionId === block.id) legacy.push(pending('task', ['referenceAnswerSource', 'nativeSource', 'answerDate', ...(state.task.hintLevel > 0 ? [] : ['assistance'])], 'The current slot retains text and help observations, but lacks a frozen pre-answer basis and consumed native input version.'))
    files.push({ path: `.study/blocks/${block.id}.json`, file: blockSchema.parse({ format: 2, kind: 'block', termId, id: block.id, subject: block.subject, mode: block.mode,
      ...(block.intensity ? { intensity: block.intensity } : {}), startedAt: block.startedAt, ...(block.endedAt !== undefined ? { endedAt: block.endedAt } : {}), ...(block.spentMs !== undefined ? { spentMs: block.spentMs } : {}), ...(block.reflection !== undefined ? { reflection: block.reflection } : {}),
      context: { pendingProfile: 'The legacy source did not retain the historical profile.', ...(block.scope ? { scope: block.scope } : {}), ...(block.materialId && state.materials.find(material => material.id === block.materialId) ? { material: state.materials.find(material => material.id === block.materialId) } : {}) },
      questions: [], responses: [], hints: [], assessments: [], pendingLegacy: legacy }) })
  }
  for (const [i, sheet] of state.worksheets.entries()) {
    const legacy: PendingLegacyFact[] = []
    const file: WorksheetFile = worksheetSchema.parse({ format: 2, kind: 'worksheet', termId, id: sheet.id, subject: sheet.subject, origin: 'prepared', createdAt: sheet.createdAt,
      ...(sheet.kind ? { worksheetKind: sheet.kind } : {}), ...(sheet.discardedAt !== undefined ? { discardedAt: sheet.discardedAt } : {}), context: { pendingProfile: 'The legacy source did not retain the historical profile.' },
      items: sheet.items.map((item, j) => {
        const goal = item.objectiveId ?? (item.mistakeId ? undefined : sheet.objectiveId)
        if (!goal) legacy.push(pending(`worksheets.${i}.items.${j}`, ['objectiveId', 'originalPublicationSource'], 'A current mistake classification cannot recover the original worksheet target.'))
        return { ...item, objectiveId: goal ?? { kind: 'pending', reason: 'Original worksheet target requires source review.' }, topic: item.prompt,
          source: { kind: 'legacy', sourcePath: source.path, row: `worksheets.${i}.items.${j}` } }
      }), responses: [], assessments: [], drafts: [], pendingLegacy: legacy })
    for (const [j, draft] of state.paperDrafts.entries()) if (draft.worksheetId === sheet.id) file.drafts.push({ id: `legacy-draft-${j}`, questionId: draft.itemId, response: draft.response,
      result: draft.result, assistance: draft.assistance === 'independent' ? 'unknown' : draft.assistance, confidence: draft.confidence ?? 'low', uncertainties: draft.uncertainties, imagePaths: [], receivedAt: draft.receivedAt })
    for (const [j, result] of state.paperResults.entries()) if (result.worksheetId === sheet.id) {
      legacy.push(pending(`paperResults.${j}`, ['originalResponseSource', 'assistance', 'answerDate', 'originalContentSource'], 'Legacy confirmations and receipt timestamps remain declarations until their original response, help and publication sources are reviewed.'))
    }
    file.pendingLegacy = legacy
    files.push({ path: `.study/worksheets/${sheet.id}.json`, file })
  }
  for (const [i, workbook] of [...state.workbookResults, ...state.workbookDrafts].entries()) {
    const confirmed = i < state.workbookResults.length ? state.workbookResults[i] : undefined
    const worksheetId = workbookMigrationId(workbook.id)
    const row = confirmed ? `workbookResults.${i}` : `workbookDrafts.${i - state.workbookResults.length}`
    const legacy = [pending(row, ['answerDate', 'nativeSource', ...(workbook.objectiveId ? [] : ['objectiveId']), ...(workbook.outcome === 'hinted' ? [] : ['assistance'])], 'Original workbook content and combined outcome declarations are retained; receipt/confirmation time is not answer time.')]
    const assistance = workbook.outcome === 'hinted' && confirmed ? 'hint' : 'unknown'
    const file = worksheetSchema.parse({ format: 2, kind: 'worksheet', termId, id: worksheetId, subject: workbook.subject, origin: 'workbook', createdAt: workbook.receivedAt,
      context: { pendingProfile: 'The legacy source did not retain the historical profile.' }, items: [{ id: 'q1', objectiveId: workbook.objectiveId ?? { kind: 'pending', reason: 'Workbook target requires confirmation.' }, topic: workbook.prompt, prompt: workbook.prompt,
        ...(!confirmed?.correction || !confirmed.explanation || !confirmed.answerEvidence ? { basisStatus: 'legacy-pending' } : {}),
        answer: confirmed?.correction ?? 'Legacy reference answer requires confirmation.', explanation: confirmed?.explanation ?? 'Legacy explanation requires confirmation.', answerEvidence: confirmed?.answerEvidence ?? 'Legacy answer basis requires confirmation.', source: { kind: 'legacy', sourcePath: source.path, row } }],
      responses: confirmed && workbook.response ? [{ id: workbook.id, questionId: 'q1', rawResponse: workbook.response, assistance, answerDate: { kind: 'unknown' }, source: { kind: 'legacy', sourcePath: source.path, row } }] : [],
      assessments: confirmed && workbook.response ? [{ id: `assessment-${sourceSha256(new TextEncoder().encode(workbook.id)).slice(0, 24)}`, responseId: workbook.id,
        result: workbook.outcome === 'hinted' || workbook.outcome === 'independent-correct' ? 'correct' : workbook.outcome === 'independent-wrong' ? 'incorrect' : 'stuck', assistance,
        feedback: confirmed.explanation ?? workbook.outcome, answerEvidence: confirmed.answerEvidence ?? 'Legacy answer basis requires confirmation.', assessedAt: confirmed.confirmedAt, userConfirmation: confirmed.userConfirmation }] : [],
      drafts: !confirmed ? [{ id: workbook.id, questionId: 'q1', response: workbook.response ?? 'Original response unavailable.', result: 'unassessed', assistance: 'unknown', confidence: 'low', uncertainties: workbook.uncertainties, imagePaths: workbook.imagePath ? [workbook.imagePath] : [], receivedAt: workbook.receivedAt }] : [], pendingLegacy: legacy })
    files.push({ path: `.study/worksheets/${worksheetId}.json`, file })
  }
  if (state.attempts.some(attempt => !state.sessions.some(block => block.id === attempt.sessionId))) pending('attempts[missing owning block]', ['owningBlock', 'publishedQuestionSource', 'answerDate', 'assistance'], 'No saved owning block establishes these flattened legacy associations.')
  const rewardIdentities = new Set<string>()
  const rewards = state.rewards.filter((reward, index) => {
    const identity = JSON.stringify([reward.day, reward.reason])
    if (!collectionsSchema.shape.rewards.element.safeParse(reward).success || rewardIdentities.has(identity)) {
      pending(`rewards.${index}`, ['day', 'reason'], 'The preserved reward declaration has an invalid calendar day or repeats a daily reward identity.')
      return false
    }
    rewardIdentities.add(identity)
    return true
  })
  files.push({ path: '.study/collections.json', file: collectionsSchema.parse({ format: 2, kind: 'collections', termId,
    mistakes: state.mistakes.map(({ stage: _stage, independentDays: _days, dueAt: _due, ...mistake }) => mistake), exercises: state.exercises, concepts: state.concepts, objectives: state.objectives, relations: state.relations, teachingQueue: state.teachingQueue, rewards,
    pendingLegacy: plan.pending.slice(0, 5000) }) })
  const validation = validateStudyFiles(files.map(({ path, file }) => ({ path, value: file })))
  plan.issues.push(...validation.issues)
  plan.outputs = files.map(({ path, file }) => {
    const prior = existing.find(entry => entry.path === path)
    return { path, file, status: prior ? canonical(prior.file) === canonical(file) ? 'already-valid' : 'conflict' : 'missing' }
  })
  plan.status = validation.valid && !plan.outputs.some(output => output.status === 'conflict') ? 'ready' : 'partial'
  return plan
}

/** A validated observed-version backup, separate from business authority. */
export const backupSchema = z.object({ format: z.literal(1), kind: z.literal('observed-version'), sourcePath: z.string().max(240), targetKey: z.string().max(2000), version: z.string().max(2000),
  observedAt: z.number().int().nonnegative(), sha256: z.string().regex(/^[a-f0-9]{64}$/u), bytesBase64: z.string().max(11_184_812) }).strict()
/** Stored backup bytes and source observation. */
export type ObservedBackup = z.infer<typeof backupSchema>
/**
 * Inspect existing backup candidates without restoring or deleting original invalid files.
 * @param fs - read-capable workspace adapter.
 * @param signal - cancellation signal.
 * @returns byte-verified backup records and bounded per-file failures.
 */
export async function readBackups(fs: StudyFiles, signal: AbortSignal): Promise<{ backups: { path: string; backup: ObservedBackup }[]; issues: FileIssue[] }> {
  const backupCache = fs.cache?.backups ?? new Map<string, { version: string; backup: ObservedBackup }>()
  const backups: { path: string; backup: ObservedBackup }[] = []
  const issues: FileIssue[] = []
  let entries: Awaited<ReturnType<StudyFiles['list']>>
  try { entries = await fs.list('.study/backups', signal) }
  catch (error) {
    signal.throwIfAborted()
    return { backups, issues: [{ path: '.study/backups', field: '', rule: 'backup-list', correction: (error instanceof Error ? error.message : 'Inspect the backup directory and retry.').slice(0, 500) }] }
  }
  signal.throwIfAborted()
  if (entries.length > 128) issues.push({ path: '.study/backups', field: '', rule: 'backup-count', correction: 'Inspect and explicitly remove excess external backup files; the application retains at most 128.' })
  let total = 0
  for (const entry of entries.slice(0, 128)) {
    const path = `.study/backups/${entry.name}`
    try {
      const observation = await fs.stat(path, signal)
      if (!observation || observation.type !== 'file') throw new Error('A backup must be a regular file.')
      const cached = backupCache.get(observation.targetKey)
      const backup = cached?.version === observation.version ? cached.backup : backupSchema.parse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await fs.read(path, signal, 12_000_000))))
      if ((await fs.stat(path, signal))?.version !== observation.version) throw new Error('The backup changed while reading; inspect it again.')
      if (sourceSha256(Buffer.from(backup.bytesBase64, 'base64')) !== backup.sha256) throw new Error('Backup bytes do not match their recorded digest.')
      total += Buffer.byteLength(backup.bytesBase64, 'base64')
      if (total > 33_554_432) throw new Error('Retained backup source bytes exceed the 32 MiB limit.')
      if (backupCache.size >= 128) backupCache.delete(backupCache.keys().next().value ?? '')
      while ([...backupCache.values()].reduce((sum, entry) => sum + entry.backup.bytesBase64.length, backup.bytesBase64.length) > 44_739_248 && backupCache.size > 0) backupCache.delete(backupCache.keys().next().value ?? '')
      backupCache.set(observation.targetKey, { version: observation.version, backup })
      backups.push({ path, backup })
    } catch (error) { if (signal.aborted) throw error; if (issues.length < 100) issues.push({ path, field: '', rule: 'backup-verification', correction: (error instanceof Error ? error.message : 'Preserve and inspect the invalid backup.').slice(0, 500) }) }
  }
  signal.throwIfAborted()
  return { backups, issues }
}

/**
 * Retain observed valid source bytes with three versions per entity, 128 files and 32 MiB total.
 * @param fs - application adapter with guarded backup writes and deletion.
 * @param read - current consistent validated read; invalid originals are never replaced.
 * @param now - observation clock, distinct from answer time.
 * @param signal - cancellation signal.
 * @returns verified retained candidates and explicit backup failures.
 */
export async function retainObservedBackups(fs: StudyFiles, read: WorkspaceRead, now: number, signal: AbortSignal): Promise<Awaited<ReturnType<typeof readBackups>>> {
  const identity = read.files.find(file => file.path === '.study/settings.json')?.targetKey
  return fs.backupRetention && identity ? fs.backupRetention.run(identity, retentionSignal => retainBackups(fs, read, now, retentionSignal), signal) : retainBackups(fs, read, now, signal)
}

async function retainBackups(fs: StudyFiles, read: WorkspaceRead, now: number, signal: AbortSignal): Promise<Awaited<ReturnType<typeof readBackups>>> {
  const existing = await readBackups(fs, signal)
  if (!fs.write || !fs.remove || read.status !== 'valid') return existing
  const backups = existing.backups.slice()
  if (existing.issues.length) return existing
  for (const source of read.files.filter(file => file.file)) {
    const hash = sourceSha256(source.bytes)
    if (backups.some(entry => entry.backup.sourcePath === source.path && entry.backup.sha256 === hash)) continue
    const backup: ObservedBackup = { format: 1, kind: 'observed-version', sourcePath: source.path, targetKey: source.targetKey, version: source.version, observedAt: now, sha256: hash, bytesBase64: Buffer.from(source.bytes).toString('base64') }
    const path = `.study/backups/${sourceSha256(new TextEncoder().encode(source.targetKey)).slice(0, 24)}-${hash.slice(0, 24)}.json`
    const size = (entry: { backup: ObservedBackup }) => Buffer.byteLength(entry.backup.bytesBase64, 'base64')
    while (backups.filter(entry => entry.backup.sourcePath === source.path).length >= 3 || backups.length >= 128 || backups.reduce((sum, entry) => sum + size(entry), source.bytes.byteLength) > 33_554_432) {
      const candidates = backups.filter(entry => backups.filter(candidate => candidate.backup.sourcePath === source.path).length >= 3 ? entry.backup.sourcePath === source.path : true).sort((left, right) => left.backup.observedAt - right.backup.observedAt || left.path.localeCompare(right.path))
      const oldest = candidates[0]
      if (!oldest) break
      try {
        const observed = await fs.stat(oldest.path, signal)
        if (observed) await fs.remove(oldest.path, observed.version, signal)
        signal.throwIfAborted()
      } catch (error) {
        signal.throwIfAborted()
        if (existing.issues.length < 100) existing.issues.push({ path: oldest.path, field: '', rule: 'backup-prune', correction: (error instanceof Error ? error.message : 'Inspect the retained backup before retrying.').slice(0, 500) })
        return { backups, issues: existing.issues }
      }
      backups.splice(backups.indexOf(oldest), 1)
    }
    try { await fs.write(path, `${JSON.stringify(backup)}\n`, { kind: 'createIfAbsent' }, signal); backups.push({ path, backup }) }
    catch (error) {
      if (signal.aborted) throw error
      const observed = await readBackups(fs, signal)
      existing.issues.push(...observed.issues.slice(0, 100 - existing.issues.length))
      if (existing.issues.length < 100 && !observed.backups.some(entry => entry.path === path && entry.backup.sha256 === hash)) existing.issues.push({ path, field: '', rule: 'backup-write', correction: (error instanceof Error ? error.message : 'Inspect whether this backup was saved before retrying.').slice(0, 500) })
    }
  }
  signal.throwIfAborted()
  return { backups, issues: existing.issues }
}

/**
 * Decode byte-verified backup files for available preserved-version comparison.
 * @param backups - explicitly retained observed-version candidates.
 * @returns strict official source files; malformed backups supply no trusted comparison.
 */
export function backupVersions(backups: readonly { path: string; backup: ObservedBackup }[]): { path: string; file: OfficialFile }[] {
  return backups.flatMap(({ backup }) => {
    try {
      const bytes = Buffer.from(backup.bytesBase64, 'base64')
      if (sourceSha256(bytes) !== backup.sha256) return []
      const raw: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      const kind = z.object({ kind: z.enum(['term-settings', 'block', 'worksheet', 'collections']) }).passthrough().parse(raw).kind
      return [{ path: backup.sourcePath, file: officialFileSchemas[kind].parse(raw) }]
    } catch (_error) { return [] }
  })
}

/** Restore is an explicit choice with invalid-current-byte preservation, never an automatic overwrite. */
export interface RestoreDescription { status: 'available' | 'blocked'; destinationPath: string; backupPath: string; sourceSha256: string; preserveCurrent?: { path: string; version: string; sha256: string }; issues: FileIssue[] }
/**
 * Validate a chosen restore candidate against independently read current entities.
 * @param read - current files, including invalid original bytes.
 * @param chosen - explicit user-selected verified backup.
 * @returns destination, preserved-current descriptor and revalidation issues; performs no writes.
 */
export function describeRestore(read: WorkspaceRead, chosen: { path: string; backup: ObservedBackup }): RestoreDescription {
  const source = backupVersions([chosen])[0]
  const current = read.files.find(file => file.path === chosen.backup.sourcePath)
  const issues = source ? validateStudyFiles([...read.files.filter(file => file.path !== source.path && file.file).map(file => ({ path: file.path, value: file.file })), { path: source.path, value: source.file }]).issues
    : [{ path: chosen.path, field: '', rule: 'backup-verification', correction: 'Choose a byte-verified strict official backup.' }]
  return { status: issues.length === 0 ? 'available' : 'blocked', destinationPath: chosen.backup.sourcePath, backupPath: chosen.path, sourceSha256: chosen.backup.sha256,
    ...(current ? { preserveCurrent: { path: current.path, version: current.version, sha256: sourceSha256(current.bytes) } } : {}), issues }
}

/** Independent archive/export and active-term replacement outcomes. */
export interface ArchiveDescription { termId: TermId; archivePath: string; status: 'export-needed' | 'export-valid-active-retained' | 'export-valid-active-unknown' | 'complete' | 'conflict'; missingPaths: string[]; issues: FileIssue[] }
/**
 * Inspect a partial term archive without recreating an existing valid export or changing the active term.
 * @param source - observed source term.
 * @param archive - independently read exported term directory.
 * @param active - current active term after the separate replacement step.
 * @returns stable archive identity, missing outputs and explicit partial outcome.
 */
export function describeArchive(source: WorkspaceRead, archive: WorkspaceRead, active: WorkspaceRead): ArchiveDescription | undefined {
  const termId = source.workspace?.settings.termId
  if (!termId || !['valid', 'archived'].includes(source.status)) return undefined
  const missingPaths = source.files.filter(file => file.file && !archive.files.some(exported => exported.path === file.path && exported.file && canonical(exported.file) === canonical(file.file))).map(file => file.path)
  const conflict = archive.workspace !== undefined && archive.workspace.settings.termId !== termId
  const exported = ['valid', 'archived'].includes(archive.status) && missingPaths.length === 0
  const retained = active.workspace?.settings.termId === termId && active.status !== 'archived'
  const activeKnown = ['valid', 'archived', 'missing'].includes(active.status)
  return { termId, archivePath: `.study/archives/${termId}`, status: conflict ? 'conflict' : exported ? !activeKnown ? 'export-valid-active-unknown' : retained ? 'export-valid-active-retained' : 'complete' : 'export-needed', missingPaths, issues: [...archive.issues, ...active.issues] }
}
