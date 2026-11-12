/** Authorized Host reads pair independent native Session observations with shared file validation. */
import type { ToolExecution } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-session-query'
import { applicationStudyFiles } from './files/application.ts'
import { readWorkspace, type WorkspaceRead } from './files/read.ts'
import { readBackups, backupVersions, retainObservedBackups } from './files/recovery.ts'
import { resolveNativeSources, type NativeSourceContext } from './native-source.ts'
import type { FileIssue } from './files/validation.ts'

/** One independently observed Session cut and one validated official-file read. */
export interface StudentWorkspaceRead { read: WorkspaceRead; native: NativeSourceContext; backupIssues: FileIssue[] }

/**
 * Read official files with receipt observations obtained from the calling Agent's authorized Session service.
 * @param exec - registered execution Agent and caller cancellation; missing source service leaves dates unknown.
 * Receipt matching covers only the calling Session. Earlier-Session responses remain saved, but their dates stay unknown without separately authorized source observations.
 * @returns shared validated facts and explicit native source availability, with no retained Session lease.
 */
export async function readStudentWorkspace(exec: Pick<ToolExecution, 'agent' | 'signal'>): Promise<StudentWorkspaceRead> {
  exec.signal.throwIfAborted()
  if (!exec.agent) throw new Error('Student reads require a registered Agent.')
  const query = exec.agent.ctx.get('sessionQuery')
  let native: NativeSourceContext = { status: 'unavailable', inputs: [], admissions: [], observations: [], omitted: 0, omittedAdmissions: 0, reason: 'Session source observation is unavailable.' }
  if (query) {
    using observation = await query.observeSession(exec.agent.session.id, { signal: exec.signal, projectionMode: 'none' })
    native = resolveNativeSources(observation)
  }
  exec.signal.throwIfAborted()
  const files = applicationStudyFiles(exec)
  const backups = await readBackups(files, exec.signal)
  const backupIssues = backups.issues.slice()
  const read = await readWorkspace(files, exec.signal, backupVersions(backups.backups), native.observations)
  if (read.status === 'valid') {
    const retained = await retainObservedBackups(files, read, Date.now(), exec.signal)
    backupIssues.push(...retained.issues)
  }
  exec.signal.throwIfAborted()
  return { read, native, backupIssues }
}
