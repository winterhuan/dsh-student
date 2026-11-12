/** Consistent complete reads for the independent OpenMAIC file. No classroom URL earns learner evidence. */
import { lessonFileSchema, parseInteractiveLessons, OPENMAIC_LESSONS_PATH, type LessonFile, type InteractiveLesson } from '../openmaic.ts'
import type { StudyFiles, FileObservation } from './read.ts'
import type { FileIssue } from './validation.ts'

/** Complete independent lesson-file read, before application display pagination. */
export interface LessonFileRead { status: 'valid' | 'missing' | 'invalid' | 'future-format' | 'changing'; file?: LessonFile; validRows?: InteractiveLesson[]; observation?: FileObservation; issues: FileIssue[] }
/**
 * Validate every lesson row at one bounded actual file version.
 * @param fs - caller's execution-world adapter.
 * @param signal - cancels bounded version rereads.
 * @returns the complete valid file or explicit failure; performs no repairs or cookie reads.
 */
export async function readLessonFile(fs: StudyFiles, signal: AbortSignal): Promise<LessonFileRead> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const before = await fs.stat(OPENMAIC_LESSONS_PATH, signal)
    if (!before) return { status: 'missing', issues: [] }
    try {
      if (before.type !== 'file') throw new Error('Use a regular lesson JSON file.')
      const bytes = await fs.read(OPENMAIC_LESSONS_PATH, signal, 524_288)
      const after = await fs.stat(OPENMAIC_LESSONS_PATH, signal)
      if (before.version !== after?.version || before.targetKey !== after.targetKey) continue
      const raw: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      const parsed = lessonFileSchema.safeParse(raw)
      if (!parsed.success) return { status: typeof raw === 'object' && raw !== null && 'format' in raw && typeof raw.format === 'number' && raw.format > 1 ? 'future-format' : 'invalid', observation: before, validRows: parseInteractiveLessons(new TextDecoder().decode(bytes)).lessons,
        issues: parsed.error.issues.slice(0, 100).map(issue => ({ path: OPENMAIC_LESSONS_PATH, field: issue.path.join('.'), rule: 'lesson-file', correction: issue.message })) }
      return { status: 'valid', file: parsed.data, observation: before, issues: [] }
    } catch (error) { if (signal.aborted) throw error; return { status: 'invalid', observation: before, issues: [{ path: OPENMAIC_LESSONS_PATH, field: '', rule: 'lesson-file', correction: error instanceof Error ? error.message : 'Preserve the original and repair the lesson file explicitly.' }] } }
  }
  return { status: 'changing', issues: [{ path: OPENMAIC_LESSONS_PATH, field: '', rule: 'changing-read', correction: 'Finish the lesson write and read again.' }] }
}
