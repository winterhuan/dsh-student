/** Authorized Host reads pair original native/official sources with shared formal-file validation. */
import type { ToolExecution } from '@deepseek-ai/dsh-tools'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-session-query'
import type {} from './openmaic/service.ts'
import { applicationStudyFiles } from './files/application.ts'
import { readWorkspace, type WorkspaceRead } from './files/read.ts'
import { readBackups, backupVersions, retainObservedBackups } from './files/recovery.ts'
import { resolveNativeSources, type NativeSourceContext } from './native-source.ts'
import type {} from './native-capture.ts'
import { readNativeHistory } from './native-history.ts'
import { canonical } from './learning/shared.ts'
import type { InteractiveLesson } from './openmaic.ts'
import { readLessonFile } from './files/lessons.ts'
import { consumeOpenmaicFeedback } from './openmaic/feedback-consumer.ts'
import type { OpenmaicSourceVerification, OpenmaicInputObservation } from './openmaic/feedback-schema.ts'
import { OpenmaicError } from './openmaic/connection.ts'
import type { OpenmaicFeedbackRead } from './openmaic/feedback.ts'
import type { FileIssue } from './files/validation.ts'
/** One independent source read and its saved-file consumption outcome. */
export interface StudentOfficialFeedback extends Omit<OpenmaicSourceVerification, 'consumption'> { consumption?: ReturnType<typeof consumeOpenmaicFeedback>; source?: OpenmaicFeedbackRead }
/** Independently observed native cuts, exact validated files and bounded official feedback availability. */
export interface StudentWorkspaceRead { read: WorkspaceRead; native: NativeSourceContext; backupIssues: FileIssue[]; openmaic: StudentOfficialFeedback[] }
const signature = (read: WorkspaceRead) => JSON.stringify([[...read.files, ...read.archiveFiles ?? []].map(({ path, targetKey, version }) => ({ path, targetKey, version })), read.membership])
/**
 * Read original sources with independent workspace/Remote authorization and consume the same formal files.
 * @param exec - Registered main execution Agent and caller cancellation.
 * @param invocation - Current Remote context for original-history access checks; native tool calls use their Agent context.
 * @param lessonId - Explicit classroom selection takes priority within the eight-source read budget.
 * @returns Validated facts and explicit per-source availability; releases every Session lease and never writes academic records.
 */
export async function readStudentWorkspace(exec: Pick<ToolExecution, 'agent' | 'signal'>, invocation?: Context, lessonId?: string): Promise<StudentWorkspaceRead> {
  exec.signal.throwIfAborted()
  if (!exec.agent) throw new Error('Student reads require a registered Agent.')
  const agent = exec.agent
  const query = agent.ctx.get('sessionQuery')
  let native: NativeSourceContext = { status: 'unavailable', inputs: [], admissions: [], observations: [], omitted: 0, omittedAdmissions: 0, reason: 'Session source observation is unavailable.' }
  if (query) { using observation = await query.observeSession(agent.session.id, { signal: exec.signal, projectionMode: 'none' }); native = resolveNativeSources(observation) }
  const files = applicationStudyFiles(exec)
  const backups = await readBackups(files, exec.signal)
  const backupIssues = backups.issues.slice()
  let unstableSources: StudentOfficialFeedback[] = []
  for (let attempt = 0; attempt < 3; attempt++) {
    const initial = await readWorkspace(files, exec.signal, backupVersions(backups.backups), native.observations)
    const historical = await readNativeHistory(agent, initial, exec.signal, invocation)
    const openmaic: StudentOfficialFeedback[] = [], observations: OpenmaicInputObservation[] = []
    const service = agent.ctx.get('studentOpenmaic')
    const lessons = await readLessonFile(files, exec.signal)
    const workspace = initial.workspace
    const sourceLessons = new Map<StudentOfficialFeedback, InteractiveLesson>()
    const currentBlock = workspace?.blocks.find(block => block.endedAt === undefined)
    const requiredBindings = new Set((initial.archiveSources ?? []).flatMap(archive => archive.workspace.blocks.flatMap(block => block.responses.flatMap(response => {
      const question = block.questions.find(question => question.id === response.questionId)
      return response.source.kind === 'openmaic' && archive.references.some(reference => reference.learnerId === block.learnerId && reference.goalId === question?.capability?.goalId && (reference.ownerKind === 'block' && reference.ownerId === block.id && reference.responseId === response.id || reference.review && reference.review.mistakeId === question.mistakeId)) ? [response.source.bindingId] : []
    }))))
    const priority = (lesson: InteractiveLesson) => lesson.id === lessonId ? 0 : lesson.termId === workspace?.settings.termId && lesson.blockId === currentBlock?.id ? 1 : lesson.feedback && requiredBindings.has(lesson.feedback.bindingId) ? 2 : 3
    const sourceKey = (lesson: InteractiveLesson) => canonical([lesson.base, lesson.classroomId, lesson.learnerKey])
    const sourceOwner = (lesson: InteractiveLesson) => canonical([lesson.learnerId, lesson.termId, lesson.blockId, lesson.feedback])
    const unique = new Map<string, InteractiveLesson>(), conflicts = new Set<string>()
    for (const lesson of [...(lessons.status === 'valid' ? lessons.file!.lessons : []), ...(initial.archiveSources ?? []).flatMap(archive => archive.lessons.status === 'valid' ? archive.lessons.file!.lessons.filter(lesson => lesson.termId === archive.workspace.settings.termId) : [])].filter(lesson => lesson.status === 'ready').sort((a, b) => priority(a) - priority(b))) {
      const key = sourceKey(lesson), previous = unique.get(key)
      if (!previous) unique.set(key, lesson)
      else if (sourceOwner(previous) !== sourceOwner(lesson)) conflicts.add(key)
    }
    const ready = [...unique.values()]
    let sourceReads = 0
    if (workspace) for (const lesson of ready) {
      const fact: StudentOfficialFeedback = { lessonId: lesson.id, ...(lesson.learnerId ? { learnerId: lesson.learnerId } : {}), ...(lesson.termId ? { termId: lesson.termId } : {}), ...(lesson.blockId ? { blockId: lesson.blockId } : {}), status: 'ownership-unresolved', omitted: 0, ...(lesson.feedback ? { bindingId: lesson.feedback.bindingId } : {}) }
      openmaic.push(fact); sourceLessons.set(fact, lesson)
      const original = [workspace, ...(initial.archiveSources ?? []).map(archive => archive.workspace)].find(owner => lesson.learnerId === workspace.settings.learnerId && lesson.learnerId === owner.settings.learnerId && lesson.termId === owner.settings.termId && owner.blocks.some(block => block.id === lesson.blockId && block.learnerId === lesson.learnerId))
      if (conflicts.has(sourceKey(lesson))) { fact.reason = 'Resolve conflicting saved ownership for the same original classroom before importing records.'; continue }
      if (!lesson.feedback || !original || !lesson.learnerId || !lesson.termId || !lesson.blockId || !lesson.classroomId || !lesson.learnerKey) { fact.reason = 'Confirm the original learner and classroom binding before importing records.'; continue }
      if (!service || !agent.session.header.cwd || sourceReads >= 8) { fact.status = 'unavailable'; if (sourceReads >= 8) { fact.failure = 'read-limit'; fact.omitted = 1 }; fact.reason = sourceReads >= 8 ? 'Official source reads exceed eight bound classrooms.' : 'Official source connection is unavailable.'; continue }
      sourceReads++
      try {
        fact.source = await service.feedback(agent.session.header.cwd).read({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, classroomId: lesson.classroomId, base: lesson.base, learnerKey: lesson.learnerKey }, lesson.feedback, exec.signal)
        fact.status = 'available'; observations.push(...fact.source.observations)
      } catch (error) { if (exec.signal.aborted) throw error; fact.status = 'unavailable'; fact.failure = error instanceof OpenmaicError ? error.code : 'invalid-response'; fact.reason = error instanceof OpenmaicError ? error.message : 'Original official source could not be read completely. Retry the same classroom.' }
    }
    let read = await readWorkspace(files, exec.signal, backupVersions(backups.backups), [...native.observations, ...historical.observations], observations)
    const finalLessons = await readLessonFile(files, exec.signal)
    if (signature(initial) !== signature(read) || lessons.observation?.version !== finalLessons.observation?.version || lessons.observation?.targetKey !== finalLessons.observation?.targetKey) continue
    if (read.status === 'valid') { const retained = await retainObservedBackups(files, read, Date.now(), exec.signal); backupIssues.push(...retained.issues) }
    let sourceChanged = false
    for (const fact of openmaic) if (fact.source) {
      const lesson = sourceLessons.get(fact)!
      try { if (!await service!.feedback(agent.session.header.cwd!).verify({ learnerId: lesson.learnerId!, termId: lesson.termId!, blockId: lesson.blockId!, classroomId: lesson.classroomId!, base: lesson.base, learnerKey: lesson.learnerKey! }, lesson.feedback!, exec.signal, fact.source.revision)) sourceChanged = true }
      catch (error) {
        if (exec.signal.aborted) throw error
        fact.status = 'unavailable'; fact.failure = error instanceof OpenmaicError ? error.code : 'incomplete-read'; fact.reason = 'Original official source access changed before publication.'
        const bindingId = fact.bindingId; delete fact.source
        for (let index = observations.length - 1; index >= 0; index--) if (observations[index]!.binding.bindingId === bindingId) observations.splice(index, 1)
      }
    }
    if (sourceChanged) { unstableSources = openmaic.map(({ source: _source, consumption: _consumption, ...fact }) => ({ ...fact, status: 'unavailable', failure: 'incomplete-read', reason: 'Original official source changed during verification. Retry the same classroom.' })); continue }
    await historical.recheck()
    const publication = await readWorkspace(files, exec.signal, backupVersions(backups.backups), [...native.observations, ...historical.observations], observations)
    const publicationLessons = await readLessonFile(files, exec.signal)
    if (signature(read) !== signature(publication) || finalLessons.observation?.version !== publicationLessons.observation?.version || finalLessons.observation?.targetKey !== publicationLessons.observation?.targetKey) continue
    read = publication
    if (invocation && !await invocation.get('remoteAccess')?.allows({ kind: 'session', id: agent.session.id })) throw new Error('Current Student Session access changed before publication.')
    if (read.workspace) {
      const owners = [read.workspace, ...(read.archiveSources ?? []).map(archive => archive.workspace)]
      for (const owner of owners) { owner.nativeSources = [...native.observations, ...historical.observations]; owner.openmaicSources = observations }
      for (const fact of openmaic) if (fact.source) { const original = owners.find(owner => owner.settings.termId === sourceLessons.get(fact)?.termId) ?? read.workspace; fact.consumption = consumeOpenmaicFeedback(original, fact.source) }
    }
    read.sourceVerification = { native: historical.verification, openmaic: openmaic.map(({ source, consumption, ...fact }) => ({ ...fact, ...(consumption ? { consumption: consumption.status, pendingCount: source!.pending.length, conflictCount: consumption.conflicts.length } : {}) })) }
    read.backupIssues = backupIssues.slice(0, 100)
    exec.signal.throwIfAborted()
    agent.ctx.get('studentNativeCapture')?.remember(agent, read)
    return { read, native, backupIssues: read.backupIssues, openmaic }
  }
  const read: WorkspaceRead = { status: 'changing', files: [], membership: [], issues: [{ path: '.study', field: '', rule: 'changing-source-reference', correction: 'Finish related file edits and independently read the original source again.' }] }
  return { read, native, backupIssues, openmaic: unstableSources }
}
