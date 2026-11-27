import { expect, it, onTestFinished } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanupEmptyActivities } from '../src/files/cleanup-node.ts'
import { readWorkspace } from '../src/files/read.ts'
import { nodeStudyFiles } from '../src/files/node.ts'
import { termSettingsSchema, blockSchema } from '../src/files/schema.ts'
import { setup, NOW } from './fixtures.ts'
it('deletes only an explicitly selected empty ended activity, verifies its preserved bytes and is idempotent', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-cleanup-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  const settings = termSettingsSchema.parse({ format: 2, kind: 'term-settings', learnerId: 'child', termId: 'term', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] })
  const block = blockSchema.parse({ format: 2, kind: 'block', learnerId: 'child', termId: 'term', id: 'empty', subject: 'math', mode: 'foundation', startedAt: NOW, endedAt: NOW + 1, context: { profile: setup.profile }, questions: [], responses: [], assessments: [], hints: [] })
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(settings))
  const bytes = JSON.stringify(block)
  await writeFile(join(cwd, '.study/blocks/empty.json'), bytes)
  const result = await cleanupEmptyActivities(cwd, ['empty'])
  expect(result.deleted).toEqual(['.study/blocks/empty.json'])
  expect(await readFile(join(result.backup!, 'blocks/empty.json'), 'utf8')).toBe(bytes)
  expect(await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal)).toMatchObject({ status: 'valid', workspace: { blocks: [] } })
  expect(await cleanupEmptyActivities(cwd, ['empty'])).toEqual({ deleted: [], modified: [] })
  const current = JSON.parse(await readFile(join(cwd, '.study/settings.json'), 'utf8'))
  await writeFile(join(cwd, current.retiredEmptyBlocks[0].backupPath), bytes + ' ')
  expect((await readWorkspace(nodeStudyFiles(cwd), new AbortController().signal)).status).toBe('invalid')
})
it('rejects live unanswered questions and leaves the original byte-for-byte intact', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'student-cleanup-live-'))
  onTestFinished(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, '.study/blocks'), { recursive: true })
  await writeFile(join(cwd, '.study/settings.json'), JSON.stringify(termSettingsSchema.parse({ format: 2, kind: 'term-settings', learnerId: 'child', termId: 'term', revision: 1, updatedAt: NOW, profile: setup.profile, materials: [], courses: [] })))
  const bytes = JSON.stringify(blockSchema.parse({ format: 2, kind: 'block', learnerId: 'child', termId: 'term', id: 'live', subject: 'math', mode: 'foundation', startedAt: NOW, context: { profile: setup.profile }, questions: [], responses: [], assessments: [], hints: [] }))
  await writeFile(join(cwd, '.study/blocks/live.json'), bytes)
  await expect(cleanupEmptyActivities(cwd, ['live'])).rejects.toThrow('not an ended empty activity')
  expect(await readFile(join(cwd, '.study/blocks/live.json'), 'utf8')).toBe(bytes)
})
