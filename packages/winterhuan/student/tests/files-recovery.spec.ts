import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { it, expect, onTestFinished } from 'vitest'
import { nodeStudyFiles } from '../src/files/node.ts'
import { readWorkspace } from '../src/files/read.ts'
import { describeMigration, describeArchive } from '../src/files/recovery.ts'
import { queryWorkspace } from '../src/learning/queries.ts'
import { stateSchema } from '../src/schema.ts'
import { NOW, setup } from './fixtures.ts'

it('rereads official files edited while the preserved migration source is being verified', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-migrate-race-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const original = JSON.stringify(stateSchema.parse({ format: 1, revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [], sessions: [], attempts: [], mistakes: [], rewards: [] }))
  const settings = { format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [],
    migration: { sourcePath: '.study/state.json', backupPath: '.study/v1-original.json', sourceSha256: createHash('sha256').update(original).digest('hex') } }
  await writeFile(join(cwd, '.study/state.json'), original)
  await writeFile(join(cwd, '.study/v1-original.json'), original)
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(settings))
  await writeFile(join(cwd, '.study/collections.json'), JSON.stringify({ format: 2, kind: 'collections', termId: 'term-1', mistakes: [], rewards: [] }))
  const fs = nodeStudyFiles(cwd)
  let enter!: () => void
  let release!: () => void
  const entered = new Promise<void>(resolve => { enter = resolve })
  const released = new Promise<void>(resolve => { release = resolve })
  onTestFinished(release)
  let backupReads = 0
  const reading = readWorkspace({ ...fs, async read(path, signal, limit) {
    if (path === '.study/v1-original.json' && ++backupReads === 1) { enter(); await released }
    return fs.read(path, signal, limit)
  } }, new AbortController().signal)
  await entered
  try { await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ ...settings, profile: { ...settings.profile, nickname: 'Edited during source verification' } })) }
  finally { release() }
  const read = await reading
  expect(read).toMatchObject({ status: 'valid', workspace: { settings: { profile: { nickname: 'Edited during source verification' } } } })
  expect(backupReads).toBe(2)
})

it('requires an original-byte verified backup, retains pending legacy facts and retries stable output identities', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-migrate-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const state = stateSchema.parse({ format: 1, revision: 9, updatedAt: NOW, profile: { ...setup.profile, grade: 1 }, materials: [], courses: [], sessions: [], attempts: [], mistakes: [], rewards: [],
    workbookResults: [{ id: 'wb1', subject: 'math', prompt: '8 + 7?', response: '15', outcome: 'hinted', objectiveId: 'm2a-o-sub', uncertainties: '', receivedAt: NOW - 10, confirmedAt: NOW, userConfirmation: 'Parent confirmed help', imagePath: 'attachments/a.png' }] })
  const original = `${JSON.stringify(state, null, 2)}\n`
  await writeFile(join(cwd, '.study/state.json'), original)
  const fs = nodeStudyFiles(cwd)
  const read = await readWorkspace(fs, new AbortController().signal)
  expect(await readFile(join(cwd, '.study/state.json'), 'utf8')).toBe(original)
  const source = read.files[0]!
  await writeFile(join(cwd, '.study/v1-original.json'), original)
  const backupObservation = (await fs.stat('.study/v1-original.json', new AbortController().signal))!
  const backup = { ...backupObservation, path: '.study/v1-original.json', bytes: new TextEncoder().encode(original) }
  expect(describeMigration(read, { ...backup, bytes: new TextEncoder().encode('{}') })).toMatchObject({ status: 'blocked' })
  const plan = describeMigration(read, backup)
  expect(plan).toMatchObject({ status: 'ready', outputs: expect.arrayContaining([expect.objectContaining({ path: '.study/worksheets/workbook-wb1.json', file: expect.objectContaining({ responses: [expect.objectContaining({ rawResponse: '15', assistance: 'hint', answerDate: { kind: 'unknown' } })], assessments: [expect.objectContaining({ result: 'correct', assistance: 'hint' })] }) })]) })
  const retry = describeMigration(read, backup, plan.outputs)
  expect(retry.outputs.map(output => output.status)).toEqual(plan.outputs.map(() => 'already-valid'))
  expect(retry.termId).toBe(plan.termId)
  expect(plan.pending).toContainEqual(expect.objectContaining({ fields: expect.arrayContaining(['answerDate', 'nativeSource']) }))
  for (const output of plan.outputs) {
    await mkdir(join(cwd, output.path, '..'), { recursive: true })
    await writeFile(join(cwd, output.path), JSON.stringify(output.file))
  }
  const worksheet = plan.outputs.find(output => output.file.kind === 'worksheet')!
  if (worksheet.file.kind !== 'worksheet') throw new Error('Expected migrated workbook')
  worksheet.file.responses[0]!.answerDate = { kind: 'day', day: '2026-10-05', parentConfirmation: 'Actual date confirmed' }
  await writeFile(join(cwd, worksheet.path), JSON.stringify(worksheet.file))
  const dated = await readWorkspace(fs, new AbortController().signal)
  expect(dated).toMatchObject({ status: 'valid', workspace: { worksheets: [{ context: { pendingProfile: expect.any(String) }, items: [{ objectiveId: 'm2a-o-sub', source: { kind: 'legacy' } }] }] } })
  expect(queryWorkspace(dated, { kind: 'summary' }, NOW)).toMatchObject({ data: { practisedGoals: 0, masteredGoals: 0 } })
  expect(queryWorkspace(dated, { kind: 'learning-context' }, NOW)).toMatchObject({ data: { pendingFacts: expect.arrayContaining([expect.objectContaining({ fields: expect.arrayContaining(['answerBasis']) })]) } })
})

it('withholds current data until every stable migration output exists and permits later settings corrections', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-migrate-partial-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const original = await readFile(new URL('./fixtures/legacy-recovery.json', import.meta.url))
  await writeFile(join(cwd, '.study/state.json'), original)
  await writeFile(join(cwd, '.study/v1-original.json'), original)
  const fs = nodeStudyFiles(cwd)
  const signal = new AbortController().signal
  const source = await readWorkspace(fs, signal)
  const backup = { ...(await fs.stat('.study/v1-original.json', signal))!, path: '.study/v1-original.json', bytes: original }
  const plan = describeMigration(source, backup)
  const settings = plan.outputs.find(output => output.file.kind === 'term-settings')!
  await writeFile(join(cwd, settings.path), JSON.stringify(settings.file))
  const partial = await readWorkspace(fs, signal)
  expect(partial.status).toBe('invalid')
  expect(partial.issues).toContainEqual(expect.objectContaining({ path: '.study/settings.json', rule: 'migration-incomplete' }))
  expect(queryWorkspace(partial, { kind: 'learning-context' }, NOW).data).toBeUndefined()
  for (const output of plan.outputs.filter(output => output.file.kind !== 'term-settings')) {
    await mkdir(join(cwd, output.path, '..'), { recursive: true })
    await writeFile(join(cwd, output.path), JSON.stringify(output.file))
  }
  expect((await readWorkspace(fs, signal)).status).toBe('valid')
  if (settings.file.kind !== 'term-settings') throw new Error('Expected migration settings')
  await writeFile(join(cwd, settings.path), JSON.stringify({ ...settings.file, profile: { ...settings.file.profile, nickname: 'Parent-corrected nickname' } }))
  expect(await readWorkspace(fs, signal)).toMatchObject({ status: 'valid', workspace: { settings: { profile: { nickname: 'Parent-corrected nickname' } } } })
  await rm(join(cwd, '.study/state.json'))
  expect((await readWorkspace(fs, signal)).status).toBe('valid')
})

it('resumes a partial archive under the original term and distinguishes an unknown active replacement', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-archive-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  const settings = { format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const block = { format: 2, kind: 'block', termId: 'term-1', id: 'block-1', subject: 'math', mode: 'foundation', startedAt: NOW, endedAt: NOW + 1, context: { profile: setup.profile }, questions: [], responses: [], hints: [], assessments: [] }
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(settings))
  await writeFile(join(cwd, '.study/blocks/block-1.json'), JSON.stringify(block))
  const fs = nodeStudyFiles(cwd)
  const signal = new AbortController().signal
  const source = await readWorkspace(fs, signal)
  const archivePath = '.study/archives/term-1'
  await mkdir(join(cwd, archivePath, 'blocks'), { recursive: true })
  await writeFile(join(cwd, archivePath, 'settings.json'), JSON.stringify(settings))
  const archivedPath = (path: string) => path.replace(/^\.study/u, archivePath)
  const archiveFs = { stat: (path: string, signal: AbortSignal) => fs.stat(archivedPath(path), signal), list: (path: string, signal: AbortSignal) => fs.list(archivedPath(path), signal), read: (path: string, signal: AbortSignal, max: number) => fs.read(archivedPath(path), signal, max) }
  expect(describeArchive(source, await readWorkspace(archiveFs, signal), await readWorkspace(fs, signal))).toMatchObject({ termId: 'term-1', archivePath, status: 'export-needed', missingPaths: ['.study/blocks/block-1.json'] })
  await writeFile(join(cwd, archivePath, 'blocks/block-1.json'), JSON.stringify(block))
  const completeExport = await readWorkspace(archiveFs, signal)
  expect(describeArchive(source, completeExport, await readWorkspace(fs, signal))).toMatchObject({ status: 'export-valid-active-retained', missingPaths: [] })
  await writeFile(join(cwd, '.study/settings.json'), '{broken')
  expect(describeArchive(source, completeExport, await readWorkspace(fs, signal))).toMatchObject({ status: 'export-valid-active-unknown' })
  await rm(join(cwd, '.study/blocks/block-1.json'))
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify({ ...settings, termId: 'term-2' }))
  expect(describeArchive(source, completeExport, await readWorkspace(fs, signal))).toMatchObject({ termId: 'term-1', status: 'complete' })
})

it('keeps absent legacy confirmations pending instead of turning parser defaults into parent statements', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-legacy-confirmation-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const original = JSON.stringify({ format: 1, revision: 1, updatedAt: NOW, profile: { ...setup.profile, parentConfirmation: undefined }, materials: [], courses: [], sessions: [], attempts: [], mistakes: [], rewards: [] })
  await writeFile(join(cwd, '.study/state.json'), original)
  await writeFile(join(cwd, '.study/v1-original.json'), original)
  const fs = nodeStudyFiles(cwd)
  const signal = new AbortController().signal
  const read = await readWorkspace(fs, signal)
  const backup = { ...(await fs.stat('.study/v1-original.json', signal))!, path: '.study/v1-original.json', bytes: new TextEncoder().encode(original) }
  expect(describeMigration(read, backup)).toMatchObject({ status: 'blocked', outputs: [], pending: [expect.objectContaining({ row: 'profile', fields: ['parentConfirmation'] })] })
})
