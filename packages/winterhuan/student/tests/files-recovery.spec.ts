import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { it, expect, onTestFinished } from 'vitest'
import { nodeStudyFiles } from '../src/files/node.ts'
import { readWorkspace } from '../src/files/read.ts'
import { describeMigration, describeArchive, describeKnowledgeMigration, describeRestore, backupSchema, sourceSha256 } from '../src/files/recovery.ts'
import { readLessonFile } from '../src/files/lessons.ts'
import { queryWorkspace } from '../src/learning/queries.ts'
import { stateSchema } from '../src/schema.ts'
import { NOW, setup } from './fixtures.ts'
import { termSettingsSchema } from '../src/files/schema.ts'

const noLessons = { backups: [], lessons: { status: 'missing' as const, issues: [] } }

it('refuses to restore a format-2 backup over an unknown future-format term', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-future-restore-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const original = JSON.stringify({ format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] })
  const path = '.study/settings.json'
  await writeFile(join(cwd, path), original)
  const fs = nodeStudyFiles(cwd), signal = new AbortController().signal
  const observed = (await fs.stat(path, signal))!
  const chosen = { path: '.study/backups/settings.json', backup: backupSchema.parse({ format: 1, kind: 'observed-version', sourcePath: path, targetKey: observed.targetKey, version: observed.version, observedAt: NOW, sha256: sourceSha256(new TextEncoder().encode(original)), bytesBase64: Buffer.from(original).toString('base64') }) }
  const future = original.replace('"format":2', '"format":3')
  await writeFile(join(cwd, path), future)
  const read = await readWorkspace(fs, signal)
  expect(read.status).toBe('future-format')
  expect(describeRestore(read, chosen)).toMatchObject({ status: 'blocked', issues: [expect.objectContaining({ rule: 'future-format' })] })
  expect(await readFile(join(cwd, path), 'utf8')).toBe(future)
})

it('preserves every archived format-2 source and classroom log before resuming an interrupted identity migration', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-v2-preservation-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  const originals = new Map([
    ['.study/settings.json', `${JSON.stringify({ format: 2, kind: 'term-settings', termId: 'old-term', revision: 1, updatedAt: NOW, archivedAt: NOW, profile: setup.profile, materials: [], courses: [] }, null, 2)}\n`],
    ['.study/blocks/old-block.json', JSON.stringify({ format: 2, kind: 'block', termId: 'old-term', id: 'old-block', subject: 'math', mode: 'foundation', startedAt: NOW - 1, endedAt: NOW, context: { profile: setup.profile }, questions: [], responses: [], hints: [], assessments: [] })],
    ['.study/openmaic-lessons.json', JSON.stringify({ format: 1, lessons: [{ id: 'old-lesson', status: 'ready', createdAt: '2026-10-05T00:00:00Z', updatedAt: '2026-10-05T00:00:00Z', title: 'Saved lesson', requirement: 'Count counters', base: 'https://open.maic.chat', classroomId: 'old-classroom' }] })],
  ])
  for (const [path, bytes] of originals) await writeFile(join(cwd, path), bytes)
  const fs = nodeStudyFiles(cwd), signal = new AbortController().signal
  const source = await readWorkspace(fs, signal), lessons = await readLessonFile(fs, signal)
  const learnerId = termSettingsSchema.shape.learnerId.unwrap().parse('confirmed-child')
  expect(describeKnowledgeMigration(source, learnerId)).toMatchObject({ status: 'blocked', outputs: [], issues: [expect.objectContaining({ rule: 'original-byte-backup' })] })
  const backups = []
  for (const [path, text] of originals) {
    const backupPath = `.study/originals/${path.slice('.study/'.length)}`
    await mkdir(join(cwd, backupPath, '..'), { recursive: true })
    await writeFile(join(cwd, backupPath), text)
    backups.push({ ...(await fs.stat(backupPath, signal))!, path: backupPath, bytes: new TextEncoder().encode(text) })
  }
  const recovery = { backups, lessons }
  const initial = describeKnowledgeMigration(source, learnerId, recovery)
  expect(initial).toMatchObject({ status: 'ready', preservedSources: [...originals].map(([path, bytes]) => ({ path, backupPath: `.study/originals/${path.slice('.study/'.length)}`, sha256: sourceSha256(new TextEncoder().encode(bytes)) })) })
  expect(initial.pending).toContainEqual(expect.objectContaining({ sourcePath: '.study/openmaic-lessons.json', row: 'lessons.0', fields: expect.arrayContaining(['learnerId', 'termId', 'blockId']) }))
  expect(initial.outputs.at(-1)?.file.kind).toBe('term-settings')
  const first = initial.outputs[0]!
  await writeFile(join(cwd, first.path), JSON.stringify(first.file))
  const partialRead = await readWorkspace(fs, signal)
  expect(partialRead.status).toBe('invalid')
  const resumed = describeKnowledgeMigration(source, learnerId, { ...recovery, current: partialRead })
  expect(resumed.status).toBe('partial')
  expect(resumed.outputs.find(output => output.path === first.path)?.status).toBe('already-valid')
  for (const output of resumed.outputs.filter(output => output.status === 'write-needed')) await writeFile(join(cwd, output.path), JSON.stringify(output.file))
  const completed = await readWorkspace(nodeStudyFiles(cwd), signal)
  expect(completed).toMatchObject({ status: 'archived', workspace: { settings: { learnerId: 'confirmed-child', archivedAt: NOW }, blocks: [{ learnerId: 'confirmed-child', responses: [], assessments: [] }] } })
  expect(describeKnowledgeMigration(source, learnerId, { ...recovery, current: completed })).toMatchObject({ status: 'complete', outputs: [expect.objectContaining({ status: 'already-valid' }), expect.objectContaining({ status: 'already-valid' })] })
  for (const [path, bytes] of originals) expect(await readFile(join(cwd, `.study/originals/${path.slice('.study/'.length)}`), 'utf8')).toBe(bytes)
  expect(await readFile(join(cwd, '.study/openmaic-lessons.json'), 'utf8')).toBe(originals.get('.study/openmaic-lessons.json'))
  const extra = { ...completed.workspace!.blocks[0]!, id: 'concurrent-block' }
  await writeFile(join(cwd, '.study/blocks/concurrent-block.json'), JSON.stringify(extra))
  const concurrent = await readWorkspace(nodeStudyFiles(cwd), signal)
  expect(describeKnowledgeMigration(source, learnerId, { ...recovery, current: concurrent })).toMatchObject({ status: 'blocked', issues: [expect.objectContaining({ rule: 'migration-conflict' })] })
})

it('requires the confirmed same-child identity for legacy terms instead of deriving it from source bytes', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-legacy-identity-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const original = await readFile(new URL('./fixtures/legacy-recovery.json', import.meta.url))
  await writeFile(join(cwd, '.study/state.json'), original)
  await writeFile(join(cwd, '.study/v1-original.json'), original)
  const fs = nodeStudyFiles(cwd), signal = new AbortController().signal
  const read = await readWorkspace(fs, signal)
  const backup = { ...(await fs.stat('.study/v1-original.json', signal))!, path: '.study/v1-original.json', bytes: original }
  expect(describeMigration(read, backup)).toMatchObject({ status: 'blocked', outputs: [], issues: [expect.objectContaining({ rule: 'learner-identity' })] })
  const learnerId = termSettingsSchema.shape.learnerId.unwrap().parse('same-child')
  const plan = describeMigration(read, backup, [], learnerId)
  expect(plan).toMatchObject({ status: 'blocked', outputs: [], issues: [expect.objectContaining({ rule: 'original-byte-backup' })] })
  await writeFile(join(cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 3, lessons: [] }))
  expect(describeMigration(read, backup, [], learnerId, { backups: [], lessons: await readLessonFile(fs, signal) })).toMatchObject({ status: 'blocked', outputs: [], issues: [expect.objectContaining({ rule: 'migration-read' })] })
  const confirmed = describeMigration(read, backup, [], learnerId, noLessons)
  expect(confirmed.status).toBe('ready')
  expect(confirmed.outputs.every(output => output.file.learnerId === learnerId)).toBe(true)
  expect(describeMigration(read, backup, confirmed.outputs, undefined, noLessons).outputs.every(output => output.status === 'already-valid')).toBe(true)
  expect(describeMigration(read, backup, confirmed.outputs, termSettingsSchema.shape.learnerId.unwrap().parse('other-child'), noLessons)).toMatchObject({ status: 'blocked', outputs: [] })
})

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
  const plan = describeMigration(read, backup, [], termSettingsSchema.shape.learnerId.unwrap().parse('fixture-child'), noLessons)
  expect(plan).toMatchObject({ status: 'ready', outputs: expect.arrayContaining([expect.objectContaining({ path: '.study/worksheets/workbook-wb1.json', file: expect.objectContaining({ responses: [expect.objectContaining({ rawResponse: '15', assistance: 'hint', answerDate: { kind: 'unknown' } })], assessments: [expect.objectContaining({ result: 'correct', assistance: 'hint' })] }) })]) })
  const retry = describeMigration(read, backup, plan.outputs, undefined, noLessons)
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
  const plan = describeMigration(source, backup, [], termSettingsSchema.shape.learnerId.unwrap().parse('fixture-child'), noLessons)
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
  expect(describeMigration(read, backup, [], termSettingsSchema.shape.learnerId.unwrap().parse('fixture-child'), noLessons)).toMatchObject({ status: 'blocked', outputs: [], pending: [expect.objectContaining({ row: 'profile', fields: ['parentConfirmation'] })] })
})

it('preserves unsupported legacy reward declarations as pending facts without inflating valid stars', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-legacy-rewards-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const rewards = [{ day: '2024-02-29', reason: 'participation' }, { day: '2024-02-29', reason: 'reflection' }, { day: '2024-02-29', reason: 'participation' }, { day: '2026-02-29', reason: 'reflection' }]
  const original = JSON.stringify(stateSchema.parse({ format: 1, revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [], sessions: [], attempts: [], mistakes: [], rewards }))
  await writeFile(join(cwd, '.study/state.json'), original)
  await writeFile(join(cwd, '.study/v1-original.json'), original)
  const fs = nodeStudyFiles(cwd)
  const signal = new AbortController().signal
  const read = await readWorkspace(fs, signal)
  const backup = { ...(await fs.stat('.study/v1-original.json', signal))!, path: '.study/v1-original.json', bytes: new TextEncoder().encode(original) }
  const plan = describeMigration(read, backup, [], termSettingsSchema.shape.learnerId.unwrap().parse('fixture-child'), noLessons)
  expect(plan).toMatchObject({ status: 'ready', pending: expect.arrayContaining([expect.objectContaining({ row: 'rewards.2', fields: ['day', 'reason'] }), expect.objectContaining({ row: 'rewards.3', fields: ['day', 'reason'] })]) })
  expect(plan.outputs.find(output => output.file.kind === 'collections')?.file).toMatchObject({ rewards: [{ day: '2024-02-29', reason: 'participation' }, { day: '2024-02-29', reason: 'reflection' }] })
  expect(describeMigration(read, backup, plan.outputs, undefined, noLessons).outputs.every(output => output.status === 'already-valid')).toBe(true)
  expect(await readFile(join(cwd, '.study/state.json'), 'utf8')).toBe(original)
  expect(await readFile(join(cwd, '.study/v1-original.json'), 'utf8')).toBe(original)
})

it('materializes every old answer and original grade once while keeping unknown dates and capability routes pending', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-legacy-history-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const sourceState = stateSchema.parse({ format: 1, revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [],
    sessions: [{ id: 'old-block', subject: 'math', mode: 'foundation', startedAt: NOW - 100, endedAt: NOW }],
    attempts: [{ id: 'old-answer', sessionId: 'old-block', subject: 'math', topic: '加法', prompt: '8+7等于多少？', response: '15', rawResponse: '十五', result: 'correct', assistance: 'independent', feedback: '正确', answerEvidence: '合并两部分', objectiveId: 'm2a-o-sub', at: NOW }],
    mistakes: [], rewards: [] })
  const original = JSON.stringify(sourceState)
  await writeFile(join(cwd, '.study/state.json'), original)
  await writeFile(join(cwd, '.study/v1-original.json'), original)
  const fs = nodeStudyFiles(cwd); const signal = new AbortController().signal
  const read = await readWorkspace(fs, signal)
  const backup = { ...(await fs.stat('.study/v1-original.json', signal))!, path: '.study/v1-original.json', bytes: new TextEncoder().encode(original) }
  const plan = describeMigration(read, backup, [], termSettingsSchema.shape.learnerId.unwrap().parse('fixture-child'), noLessons)
  expect(plan.status).toBe('ready')
  const block = plan.outputs.find(output => output.file.kind === 'block')!.file
  expect(block).toMatchObject({ questions: [{ prompt: '8+7等于多少？', objectiveId: 'm2a-o-sub', basisStatus: 'legacy-pending' }], responses: [{ id: 'old-answer', rawResponse: '十五', response: '15', assistance: 'unknown', answerDate: { kind: 'unknown' } }], assessments: [{ result: 'correct', assessedAt: NOW }] })
  expect(plan.outputs.find(output => output.file.kind === 'term-settings')!.file).toMatchObject({ learnerId: 'fixture-child' })
  expect(plan.outputs.find(output => output.file.kind === 'collections')!.file).toMatchObject({ legacyReferences: expect.arrayContaining([expect.objectContaining({ oldId: 'm2a-o-sub', status: 'pending' })]) })
  expect(describeMigration(read, backup, plan.outputs, undefined, noLessons).outputs.every(output => output.status === 'already-valid')).toBe(true)
  for (const output of plan.outputs) { await mkdir(join(cwd, output.path, '..'), { recursive: true }); await writeFile(join(cwd, output.path), JSON.stringify(output.file)) }
  const independent = await readWorkspace(fs, signal)
  expect(independent.status).toBe('valid')
  expect(queryWorkspace(independent, { kind: 'summary' }, NOW)).toMatchObject({ data: { practisedGoals: 0, masteredGoals: 0 } })
  expect(await readFile(join(cwd, '.study/state.json'), 'utf8')).toBe(original)
})

it('keeps the unfinished legacy question, choices and reported help without fabricating answer time', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-legacy-slot-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'))
  const original = JSON.stringify(stateSchema.parse({ format: 1, revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [],
    sessions: [{ id: 'old-block', subject: 'math', mode: 'foundation', startedAt: NOW - 100 }], attempts: [], mistakes: [], rewards: [],
    task: { id: 'live-q', sessionId: 'old-block', subject: 'math', topic: '加法', prompt: '8+7是多少？', choices: ['15', '14'], objectiveId: 'unknown-old-goal', response: '15', answeredAt: NOW - 10, hintLevel: 1 } }))
  await writeFile(join(cwd, '.study/state.json'), original); await writeFile(join(cwd, '.study/v1-original.json'), original)
  const fs = nodeStudyFiles(cwd), signal = new AbortController().signal
  const read = await readWorkspace(fs, signal)
  const backup = { ...(await fs.stat('.study/v1-original.json', signal))!, path: '.study/v1-original.json', bytes: new TextEncoder().encode(original) }
  const plan = describeMigration(read, backup, [], termSettingsSchema.shape.learnerId.unwrap().parse('fixture-child'), noLessons)
  expect(plan.status).toBe('ready')
  expect(plan.outputs.find(output => output.file.kind === 'block')!.file).toMatchObject({ currentQuestionId: 'live-q', questions: [{ id: 'live-q', prompt: '8+7是多少？', choices: ['15', '14'], objectiveId: { kind: 'pending' }, basisStatus: 'legacy-pending' }], responses: [{ rawResponse: '15', assistance: 'hint', answerDate: { kind: 'unknown' }, legacyRecord: { answeredAt: NOW - 10, hintLevel: 1 } }] })
  expect(describeMigration(read, backup, plan.outputs, undefined, noLessons).outputs.every(output => output.status === 'already-valid')).toBe(true)
})
