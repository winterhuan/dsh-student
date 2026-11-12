import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { it, expect, onTestFinished } from 'vitest'
import { applicationStudyFiles } from '../src/files/application.ts'
import { readWorkspace } from '../src/files/read.ts'
import { saveManual, manualFields, type ManualSaveRequest } from '../src/files/manual.ts'
import { worksheetSchema } from '../src/files/schema.ts'
import { studyStore } from '../src/store.ts'
import { readBackups, describeRestore } from '../src/files/recovery.ts'
import { NOW, setup, material, course } from './fixtures.ts'
import { readLessonFile } from '../src/files/lessons.ts'
import { readInteractiveLessons } from '../src/openmaic.ts'

async function fixture() {
  const cwd = await mkdtemp(join(tmpdir(), 'student-manual-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study'), { recursive: true })
  const settings = { format: 2, kind: 'term-settings', termId: 'term-1', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] }
  const save = (value: unknown) => writeFile(join(cwd, '.study/settings.json'), JSON.stringify(value))
  await save(settings)
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await ctx.plugin(LocalFileSystem, { cwd })
  const agent = { session: { header: { cwd } }, ctx: { get: (name: string) => name === 'sandboxPolicy' ? { resolve: () => undefined } : ctx.get(name) } } as Agent
  const signal = new AbortController().signal
  const fs = applicationStudyFiles({ agent, signal })
  const read = await readWorkspace(fs, signal)
  const intent: ManualSaveRequest['intent'] = { kind: 'settings', editedProfileFields: ['nickname'], command: { ...setup, profile: { ...setup.profile, nickname: 'New nickname' } } }
  const request: ManualSaveRequest = { termId: read.workspace!.settings.termId, expectedVersions: read.files.map(({ path, version }) => ({ path, version })), baseline: manualFields(read, intent), intent }
  return { fs, signal, read, request, settings, save, cwd, agent }
}

it('rejects a manual request with missing relevant expected versions before touching settings', async () => {
  const { fs, signal, request } = await fixture()
  const result = await saveManual(fs, { ...request, expectedVersions: [] }, NOW, signal)
  expect(result.status).toBe('conflict')
  expect((await readWorkspace(fs, signal)).workspace!.settings.profile.nickname).toBe(setup.profile.nickname)
})

it('rebases a nickname draft over an unrelated profile field and retains current values on a nickname conflict', async () => {
  const { fs, signal, request, settings, save } = await fixture()
  await save({ ...settings, profile: { ...settings.profile, schoolAlias: 'Externally updated school' } })
  const saved = await saveManual(fs, request, NOW, signal)
  expect(saved).toMatchObject({ status: 'saved', read: { workspace: { settings: { profile: { nickname: 'New nickname', schoolAlias: 'Externally updated school' } } } } })
  await save({ ...settings, profile: { ...settings.profile, nickname: 'Competing nickname', schoolAlias: 'Externally updated school' } })
  const conflict = await saveManual(fs, request, NOW + 1, signal)
  expect(conflict).toMatchObject({ status: 'conflict', current: { 'profile:nickname': 'Competing nickname' } })
  expect(request.intent).toMatchObject({ command: { profile: { nickname: 'New nickname' } } })
  expect((await readWorkspace(fs, signal)).workspace!.settings.profile.nickname).toBe('Competing nickname')
})

it('application reads v2 files, bounds observed backups and describes an explicit restore while retaining invalid originals', async () => {
  const { fs, signal, settings, save, cwd, agent } = await fixture()
  for (let index = 0; index < 5; index += 1) {
    await save({ ...settings, profile: { ...settings.profile, nickname: `Observed ${index}` } })
    expect((await studyStore({ agent, signal }))!.profile.nickname).toBe(`Observed ${index}`)
  }
  const backups = await readBackups(fs, signal)
  expect(backups.issues).toEqual([])
  expect(backups.backups).toHaveLength(3)
  await writeFile(join(cwd, '.study/settings.json'), '{broken')
  await expect(studyStore({ agent, signal })).rejects.toThrow()
  const invalid = await readWorkspace(fs, signal)
  const chosen = backups.backups.sort((a, b) => b.backup.observedAt - a.backup.observedAt)[0]!
  const restore = describeRestore(invalid, chosen)
  expect(restore).toMatchObject({ status: 'available', destinationPath: '.study/settings.json', preserveCurrent: { path: '.study/settings.json' } })
  expect(new TextDecoder().decode(await fs.read('.study/settings.json', signal, 100))).toBe('{broken')
  await mkdir(join(cwd, '.study/blocks'))
  await writeFile(join(cwd, '.study/blocks/other-term.json'), JSON.stringify({ format: 2, kind: 'block', termId: 'term-2', id: 'other-term', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, questions: [], responses: [], hints: [], assessments: [] }))
  expect(describeRestore(await readWorkspace(fs, signal), chosen)).toMatchObject({ status: 'blocked', issues: expect.arrayContaining([expect.objectContaining({ rule: 'term-identity' })]) })
  await rm(join(cwd, '.study/blocks/other-term.json'))
  const current = (await fs.stat('.study/settings.json', signal))!
  await fs.write!('.study/restore-original.json', '{broken', { kind: 'createIfAbsent' }, signal)
  await fs.write!('.study/settings.json', Buffer.from(chosen.backup.bytesBase64, 'base64').toString('utf8'), { kind: 'replaceIfVersion', version: current.version }, signal)
  expect((await readWorkspace(fs, signal)).status).toBe('valid')
})

it('profile changes preserve the active school context while a future incompatible school block requires confirmation', async () => {
  const { fs, signal, settings, save, cwd } = await fixture()
  await save({ ...settings, materials: [material], courses: [course] })
  await mkdir(join(cwd, '.study/blocks'))
  const block = { format: 2, kind: 'block', termId: 'term-1', id: 'school-1', subject: 'math', mode: 'school', startedAt: NOW, context: { profile: setup.profile, material }, questions: [], responses: [], hints: [], assessments: [] }
  await writeFile(join(cwd, '.study/blocks/school-1.json'), JSON.stringify(block))
  const read = await readWorkspace(fs, signal)
  const intent: ManualSaveRequest['intent'] = { kind: 'settings', editedProfileFields: ['grade'], command: { ...setup, profile: { ...setup.profile, grade: 3 } } }
  const result = await saveManual(fs, { termId: read.workspace!.settings.termId, expectedVersions: read.files.map(({ path, version }) => ({ path, version })), baseline: manualFields(read, intent), intent }, NOW + 1, signal)
  expect(result).toMatchObject({ status: 'saved', read: { workspace: { blocks: [{ context: { profile: { grade: 2 } } }] } } })
  await writeFile(join(cwd, '.study/blocks/school-1.json'), JSON.stringify({ ...block, endedAt: NOW + 2 }))
  await writeFile(join(cwd, '.study/blocks/school-2.json'), JSON.stringify({ ...block, id: 'school-2', startedAt: NOW + 3 }))
  expect(await readWorkspace(fs, signal)).toMatchObject({ status: 'invalid', issues: expect.arrayContaining([expect.objectContaining({ rule: 'future-course-confirmation' })]) })
})

it('confirms unknown paper assistance and an actual calendar date while correcting the same original response', async () => {
  const { fs, signal, cwd } = await fixture()
  await mkdir(join(cwd, '.study/worksheets'))
  const sheet = worksheetSchema.parse({ format: 2, kind: 'worksheet', termId: 'term-1', id: 'sheet-1', subject: 'math', origin: 'prepared', createdAt: NOW, context: { profile: setup.profile },
    items: [{ id: 'q1', objectiveId: 'm2a-o-sub', topic: 'Subtraction', prompt: '18 - 7?', answer: '11', explanation: 'Subtract seven', answerEvidence: '11 + 7 = 18', source: { kind: 'authored', description: 'Original' } }],
    responses: [{ id: 'r1', questionId: 'q1', rawResponse: '11', assistance: 'unknown', source: { kind: 'paper', imagePaths: ['attachments/a.png'], parentConfirmation: 'Parent confirmed original response' }, answerDate: { kind: 'unknown' } }],
    assessments: [{ id: 'a1', responseId: 'r1', result: 'correct', assistance: 'unknown', feedback: 'Correct', answerEvidence: 'Verified', assessedAt: NOW, userConfirmation: 'Parent confirmed' }], drafts: [] })
  await writeFile(join(cwd, '.study/worksheets/sheet-1.json'), JSON.stringify(sheet))
  const read = await readWorkspace(fs, signal)
  const intent = { kind: 'worksheet-assessments' as const, worksheetId: sheet.id, assessments: [{ ...sheet.assessments[0]!, assistance: 'hint' as const }], responseUpdates: [{ responseId: sheet.responses[0]!.id, assistance: 'hint' as const, answerDate: { kind: 'day' as const, day: '2026-10-01', parentConfirmation: 'Actual day confirmed' }, userConfirmation: 'A hint was used' }] }
  const result = await saveManual(fs, { termId: read.workspace!.settings.termId, expectedVersions: read.files.map(({ path, version }) => ({ path, version })), baseline: manualFields(read, intent), intent }, NOW + 1, signal)
  expect(result).toMatchObject({ status: 'saved', read: { workspace: { worksheets: [{ responses: [{ id: 'r1', rawResponse: '11', assistance: 'hint', answerDate: { kind: 'day', day: '2026-10-01' } }], assessments: [{ responseId: 'r1', assessedAt: NOW, correctedAt: NOW + 1 }] }] } } })
})

it('rebases unrelated edits, retains current values on relevant conflict and rejects equal-revision old terms', async () => {
  const { fs, signal, request, settings, save } = await fixture()
  await save({ ...settings, interests: { tags: ['动物', '足球', '太空'], parentConfirmation: 'Confirmed' } })
  expect((await saveManual(fs, request, NOW, signal)).status).toBe('saved')
  const conflicting = await saveManual(fs, { ...request, intent: { kind: 'settings', editedProfileFields: ['nickname'], command: { ...setup, profile: { ...setup.profile, nickname: 'Other nickname' } } } }, NOW, signal)
  expect(conflicting).toMatchObject({ status: 'conflict', current: { 'profile:nickname': 'New nickname' } })
  await save({ ...settings, termId: 'term-2' })
  expect((await saveManual(fs, request, NOW, signal)).status).toBe('old-term')
})

it('saves course and confirmed progress in one owning file and permits the next current-version save', async () => {
  const { fs, signal, read } = await fixture()
  const intent: ManualSaveRequest['intent'] = { kind: 'settings', command: { action: 'configure-course', material, course, progress: { unitId: 'm2a-u-sub', posture: 'keep-up', preview: 'off', pace: 'teaching', parentConfirmation: 'Confirmed together' } } }
  const result = await saveManual(fs, { termId: read.workspace!.settings.termId, expectedVersions: read.files.map(({ path, version }) => ({ path, version })), baseline: manualFields(read, intent), intent }, NOW, signal)
  expect(result).toMatchObject({ status: 'saved', read: { workspace: { settings: { revision: 2, courses: [{ progress: { unitId: 'm2a-u-sub' } }] } } } })
  const next: ManualSaveRequest['intent'] = { kind: 'settings', command: { action: 'interests', tags: ['动物', '足球', '太空'], parentConfirmation: 'Confirmed' } }
  expect((await saveManual(fs, { termId: result.read.workspace!.settings.termId, expectedVersions: result.read.files.map(({ path, version }) => ({ path, version })), baseline: manualFields(result.read, next), intent: next }, NOW + 1, signal)).status).toBe('saved')
})

it('validates the complete lesson file beyond the twenty-row application display', async () => {
  const { fs, signal, cwd, agent } = await fixture()
  const lessons = Array.from({ length: 21 }, (_, index) => ({ id: `om-${index}`, status: 'ready', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:01:00.000Z', title: 'Subtraction', requirement: 'Explain subtraction', base: 'http://localhost:3000', url: `http://localhost:3000/classroom/room-${index}` }))
  await writeFile(join(cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons }))
  expect((await readLessonFile(fs, signal)).file!.lessons).toHaveLength(21)
  expect((await readInteractiveLessons(agent, signal, undefined)).lessons).toHaveLength(20)
  lessons[20]!.createdAt = '2026-11-02T00:00:00.000Z'
  lessons[20]!.updatedAt = '2026-11-01T00:00:00.000Z'
  await writeFile(join(cwd, '.study/openmaic-lessons.json'), JSON.stringify({ format: 1, lessons }))
  expect(await readLessonFile(fs, signal)).toMatchObject({ status: 'invalid', issues: [expect.objectContaining({ field: 'lessons.20.updatedAt' })] })
  const shown = await readInteractiveLessons(agent, signal, undefined)
  expect(shown.error).toBeDefined()
  expect(shown.lessons.some(lesson => lesson.id === 'om-20')).toBe(false)
})

it('returns an invalid manual outcome for a bad compound progress command and permits unrelated invalid data', async () => {
  const { fs, signal, read, request, cwd } = await fixture()
  const intent: ManualSaveRequest['intent'] = { kind: 'settings', command: { action: 'configure-course', material, course, progress: { unitId: 'absent', posture: 'keep-up', preview: 'off', pace: 'teaching', parentConfirmation: 'Confirmed' } } }
  const invalid = await saveManual(fs, { ...request, intent, baseline: manualFields(read, intent) }, NOW, signal)
  expect(invalid.status).toBe('invalid')
  expect((await readWorkspace(fs, signal)).workspace!.settings.courses).toEqual([])
  await mkdir(join(cwd, '.study/worksheets'))
  await writeFile(join(cwd, '.study/worksheets/broken.json'), '{broken')
  expect((await saveManual(fs, request, NOW, signal)).status).toBe('saved')
  await writeFile(join(cwd, '.study/settings.json'), '{broken')
  expect((await saveManual(fs, request, NOW, signal)).status).toBe('invalid')
})
