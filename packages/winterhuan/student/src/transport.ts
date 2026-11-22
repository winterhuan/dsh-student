/** Authorized Host reads pair original native/official sources with shared formal-file validation. */
import type { ToolExecution } from '@deepseek-ai/dsh-tools'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-session-query'
import type {} from './openmaic/service.ts'
import { applicationStudyFiles } from './files/application.ts'
import { readWorkspace, type WorkspaceRead } from './files/read.ts'
import { readBackups, backupVersions, retainObservedBackups } from './files/recovery.ts'
import { resolveNativeSources, type NativeSourceContext } from './native-source.ts'
import { readNativeHistory } from './native-history.ts'
import { readLessonFile } from './files/lessons.ts'
import { consumeOpenmaicFeedback } from './openmaic/feedback-consumer.ts'
import type { OpenmaicSourceVerification, OpenmaicInputObservation } from './openmaic/feedback-schema.ts'
import type { OpenmaicFeedbackRead } from './openmaic/feedback.ts'
import type { FileIssue } from './files/validation.ts'
/** One independent source read and its saved-file consumption outcome. */
export interface StudentOfficialFeedback extends OpenmaicSourceVerification { consumption?: ReturnType<typeof consumeOpenmaicFeedback>; source?: OpenmaicFeedbackRead }
/** Independently observed native cuts, exact validated files and bounded official feedback availability. */
export interface StudentWorkspaceRead { read: WorkspaceRead; native: NativeSourceContext; backupIssues: FileIssue[]; openmaic: StudentOfficialFeedback[] }
const signature = (read: WorkspaceRead) => JSON.stringify([read.files.map(({ path, targetKey, version }) => ({ path, targetKey, version })), read.membership])
/**
 * Read original sources with independent workspace/Remote authorization and consume the same formal files.
 * @param exec - Registered main execution Agent and caller cancellation.
 * @param invocation - Current Remote context for original-history access checks; native tool calls use their Agent context.
 * @returns Validated facts and explicit per-source availability; releases every Session lease and never writes academic records.
 */
export async function readStudentWorkspace(exec: Pick<ToolExecution, 'agent' | 'signal'>, invocation?: Context): Promise<StudentWorkspaceRead> {
  exec.signal.throwIfAborted()
  if (!exec.agent) throw new Error('Student reads require a registered Agent.')
  const agent = exec.agent
  const query = agent.ctx.get('sessionQuery')
  let native: NativeSourceContext = { status: 'unavailable', inputs: [], admissions: [], observations: [], omitted: 0, omittedAdmissions: 0, reason: 'Session source observation is unavailable.' }
  if (query) { using observation = await query.observeSession(agent.session.id, { signal: exec.signal, projectionMode: 'none' }); native = resolveNativeSources(observation) }
  const files = applicationStudyFiles(exec)
  const backups = await readBackups(files, exec.signal)
  const backupIssues = backups.issues.slice()
  for (let attempt = 0; attempt < 3; attempt++) {
    const initial = await readWorkspace(files, exec.signal, backupVersions(backups.backups), native.observations)
    const historical = await readNativeHistory(agent, initial, exec.signal, invocation)
    const openmaic: StudentOfficialFeedback[] = [], observations: OpenmaicInputObservation[] = []
    const service = agent.ctx.get('studentOpenmaic')
    const lessons = await readLessonFile(files, exec.signal)
    const workspace = initial.workspace
    if (lessons.status === 'valid' && workspace) for (const [index, lesson] of lessons.file!.lessons.filter(lesson => lesson.status === 'ready').entries()) {
      const fact: StudentOfficialFeedback = { lessonId: lesson.id, status: 'ownership-unresolved', omitted: 0, ...(lesson.feedback ? { bindingId: lesson.feedback.bindingId } : {}) }
      openmaic.push(fact)
      const original = [workspace, ...(workspace.archivedEvidence ?? []).map(archive => archive.workspace)].find(owner => lesson.learnerId === workspace.settings.learnerId && lesson.learnerId === owner.settings.learnerId && lesson.termId === owner.settings.termId && owner.blocks.some(block => block.id === lesson.blockId && block.learnerId === lesson.learnerId))
      if (!lesson.feedback || !original || !lesson.learnerId || !lesson.termId || !lesson.blockId || !lesson.classroomId || !lesson.learnerKey) { fact.reason = 'Confirm the original learner and classroom binding before importing records.'; continue }
      if (!service || !agent.session.header.cwd || index >= 8) { fact.status = 'unavailable'; fact.reason = index >= 8 ? 'Official source reads exceed eight bound classrooms.' : 'Official source connection is unavailable.'; continue }
      try {
        fact.source = await service.feedback(agent.session.header.cwd).read({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, classroomId: lesson.classroomId, base: lesson.base, learnerKey: lesson.learnerKey }, lesson.feedback, exec.signal)
        fact.status = 'available'; observations.push(...fact.source.observations)
      } catch (error) { if (exec.signal.aborted) throw error; fact.status = 'unavailable'; fact.reason = 'Original official source could not be authorized or read. Restore its account connection and retry the same classroom.' }
    }
    let read = await readWorkspace(files, exec.signal, backupVersions(backups.backups), [...native.observations, ...historical.observations], observations)
    const finalLessons = await readLessonFile(files, exec.signal)
    if (signature(initial) !== signature(read) || lessons.observation?.version !== finalLessons.observation?.version || lessons.observation?.targetKey !== finalLessons.observation?.targetKey) continue
    if (read.status === 'valid') { const retained = await retainObservedBackups(files, read, Date.now(), exec.signal); backupIssues.push(...retained.issues) }
    let sourceChanged = false
    for (const fact of openmaic) if (fact.source) {
      const lesson = lessons.file!.lessons.find(lesson => lesson.id === fact.lessonId)!
      try { if (!await service!.feedback(agent.session.header.cwd!).verify({ learnerId: lesson.learnerId!, termId: lesson.termId!, blockId: lesson.blockId!, classroomId: lesson.classroomId!, base: lesson.base, learnerKey: lesson.learnerKey! }, lesson.feedback!, exec.signal, fact.source.revision)) sourceChanged = true }
      catch (error) {
        if (exec.signal.aborted) throw error
        fact.status = 'unavailable'; fact.reason = 'Original official source access changed before publication.'
        const bindingId = fact.bindingId; delete fact.source
        for (let index = observations.length - 1; index >= 0; index--) if (observations[index]!.binding.bindingId === bindingId) observations.splice(index, 1)
      }
    }
    if (sourceChanged) continue
    const publication = await readWorkspace(files, exec.signal, backupVersions(backups.backups), [...native.observations, ...historical.observations], observations)
    const publicationLessons = await readLessonFile(files, exec.signal)
    if (signature(read) !== signature(publication) || finalLessons.observation?.version !== publicationLessons.observation?.version || finalLessons.observation?.targetKey !== publicationLessons.observation?.targetKey) continue
    read = publication
    await historical.recheck()
    if (invocation?.get('remoteAccess') && !await invocation.remoteAccess.allows({ kind: 'session', id: agent.session.id })) throw new Error('Current Student Session access changed before publication.')
    if (read.workspace) {
      const owners = [read.workspace, ...(read.workspace.archivedEvidence ?? []).map(archive => archive.workspace)]
      for (const owner of owners) { owner.nativeSources = [...native.observations, ...historical.observations]; owner.openmaicSources = observations }
      for (const fact of openmaic) if (fact.source) { const original = owners.find(owner => owner.settings.termId === lessons.file!.lessons.find(lesson => lesson.id === fact.lessonId)?.termId) ?? read.workspace; fact.consumption = consumeOpenmaicFeedback(original, fact.source) }
    }
    read.sourceVerification = { native: historical.verification, openmaic: openmaic.map(({ source: _source, consumption: _consumption, ...fact }) => fact) }
    read.backupIssues = backupIssues.slice(0, 100)
    exec.signal.throwIfAborted()
    return { read, native, backupIssues: read.backupIssues, openmaic }
  }
  const read: WorkspaceRead = { status: 'changing', files: [], membership: [], issues: [{ path: '.study', field: '', rule: 'changing-source-reference', correction: 'Finish related file edits and independently read the original source again.' }] }
  return { read, native, backupIssues, openmaic: [] }
}
