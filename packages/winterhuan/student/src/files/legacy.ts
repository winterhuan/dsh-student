/** Non-mutating callers clone legacy parsed values before compatibility parsing. Original bytes remain untouched. */
/**
 * One-time fix for worksheets saved before the place-value rule split borrowing from crossing.
 * A figure that mixed `regroup: 'yes'` with crossed dots had its crosses dropped; the subtraction
 * the author intended stays answerable because the prompt and answer are unchanged.
 */
function migrateLegacyFigures(parsed: unknown): unknown {
  if (typeof parsed !== 'object' || parsed === null) return parsed
  const worksheets = (parsed as { worksheets?: unknown }).worksheets
  if (!Array.isArray(worksheets)) return parsed
  for (const worksheet of worksheets) {
    const items = (worksheet as { items?: unknown }).items
    if (!Array.isArray(items)) continue
    for (const item of items) {
      const figure = (item as { figure?: { kind?: string; regroup?: string; crossTens?: number; crossOnes?: number } }).figure
      if (figure?.kind === 'place-value' && figure.regroup === 'yes' && ((figure.crossTens ?? 0) > 0 || (figure.crossOnes ?? 0) > 0)) {
        figure.crossTens = 0
        figure.crossOnes = 0
      }
    }
  }
  return parsed
}

/**
 * Turn a saved hint flag into a hint level and strip retired time-limit fields before parsing.
 * Missing workbook drafts, exercises and the teaching queue are filled by the state schema defaults.
 */
export function migrateStudyFile(parsed: unknown): unknown {
  const next = migrateLegacyFigures(parsed)
  if (typeof next !== 'object' || next === null) return next
  const root = next as Record<string, unknown>
  delete root.breakUntil
  if (typeof root.profile === 'object' && root.profile !== null) {
    delete (root.profile as Record<string, unknown>).limits
  }
  if (Array.isArray(root.sessions)) {
    for (const session of root.sessions) {
      if (typeof session === 'object' && session !== null) delete (session as Record<string, unknown>).deadline
    }
  }
  if (Array.isArray(root.attempts)) {
    for (const attempt of root.attempts) {
      if (typeof attempt === 'object' && attempt !== null) delete (attempt as Record<string, unknown>).late
    }
  }
  const task = root.task
  if (typeof task === 'object' && task !== null) {
    const record = task as { hintRequested?: unknown; hintLevel?: unknown }
    if (typeof record.hintLevel !== 'number') record.hintLevel = record.hintRequested === true ? 1 : 0
    delete record.hintRequested
  }
  return next
}
