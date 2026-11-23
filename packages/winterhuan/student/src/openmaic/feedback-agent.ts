/** Native source tool returns bounded authoring facts; file writes and checkpoints belong to the agent. */
import type { Context } from '@deepseek-ai/cordis'
import { z } from 'zod'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { readStudentWorkspace } from '../transport.ts'
import { applicationStudyFiles } from '../files/application.ts'
import { readLessonFile } from '../files/lessons.ts'
import { openmaicAcademicQuestion } from './feedback-consumer.ts'
import { openmaicEntityId } from './feedback.ts'
import type {} from './service.ts'
/**
 * Register the source read alongside the official teaching tools in the Student preset.
 * @param ctx - Preset-scoped tool registry and protected Host connection.
 */
export function registerOpenmaicFeedback(ctx: Context): void {
  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'openmaic_feedback',
    description: 'Read original authorized classroom answers and grading, or prepare its frozen question binding before playback. Returns bounded authoring facts and independent saved-file acceptance; the agent writes the formal files and runs the read-only CLI before advancing a checkpoint.',
    parameters: {
      action: { type: 'string', enum: ['prepare', 'read'], required: true, description: 'prepare freezes the original generated classroom before playback; read rereads original submitted/reviewed records after return, continue or restart.' },
      lessonId: { type: 'string', required: true, description: 'Original ID in .study/openmaic-lessons.json.' },
      offset: { type: 'integer', description: 'Zero-based source-question/response page; defaults to 0. Each page returns at most twenty records.' },
    },
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const { action, lessonId, offset = 0 } = z.object({ action: z.enum(['prepare', 'read']), lessonId: z.string().min(1).max(80), offset: z.number().int().nonnegative().optional() }).parse(args)
      const { read, openmaic } = await readStudentWorkspace(exec)
      const lessonRead = await readLessonFile(applicationStudyFiles(exec), exec.signal)
      const lesson = lessonRead.file?.lessons.find(lesson => lesson.id === lessonId)
      const workspace = read.workspace
      const unavailable = openmaic.find(fact => fact.lessonId === lessonId && fact.status === 'unavailable')
      if (action === 'read' && read.status === 'changing' && unavailable) return { status: 'unavailable', lessonId, failure: unavailable.failure ?? 'incomplete-read', reason: unavailable.reason ?? 'Original official source changed during verification.', complete: false, records: [], total: null, drafts: null, nextOffset: null }
      if (read.status !== 'valid' || lessonRead.status !== 'valid' || !workspace?.settings.learnerId || !lesson?.learnerId || !lesson.termId || lesson.learnerId !== workspace.settings.learnerId || !lesson.blockId || !lesson.classroomId || !lesson.learnerKey || lesson.status !== 'ready') throw new Error('Confirm valid original learner, term, block and ready classroom files before reading its source.')
      const original = [workspace, ...(workspace.archivedEvidence ?? []).map(archive => archive.workspace)].find(owner => owner.settings.termId === lesson.termId && owner.settings.learnerId === workspace.settings.learnerId)
      const block = original?.blocks.find(block => block.id === lesson.blockId && block.learnerId === workspace.settings.learnerId)
      if (!block || !exec.agent?.session.header.cwd) throw new Error('Original classroom block ownership is unresolved.')
      let result: object
      if (action === 'prepare') {
        const target = block.questions.find(question => question.id === block.currentQuestionId)?.capability
        if (!target) throw new Error('Save the current capability, family and tested scope before preparing classroom feedback.')
        const prepared = await ctx.studentOpenmaic.feedback(exec.agent.session.header.cwd).prepare({ learnerId: lesson.learnerId, termId: lesson.termId, blockId: lesson.blockId, base: lesson.base, classroomId: lesson.classroomId, learnerKey: lesson.learnerKey }, target, exec.signal)
        result = { status: 'prepared', lessonId, feedback: prepared.binding, questions: prepared.questions.slice(offset, offset + 20).map(question => openmaicAcademicQuestion({ binding: prepared.binding, questionId: openmaicEntityId('q', [prepared.binding.bindingId, question.sceneId, question.questionId]), question })), total: prepared.questions.length, nextOffset: offset + 20 < prepared.questions.length ? offset + 20 : null }
      } else {
        const fact = openmaic.find(fact => fact.lessonId === lessonId)
        result = { status: fact?.status ?? 'unavailable', lessonId, reason: fact?.reason, failure: fact?.failure, complete: !!fact?.source, consumption: fact?.consumption,
          records: [...fact?.source?.observations.map(observation => ({ question: openmaicAcademicQuestion(observation), response: { id: observation.responseId, questionId: observation.questionId, rawResponse: JSON.stringify(observation.source.submittedAnswer), assistance: 'unknown', answerDate: { kind: 'unknown' }, source: observation.source }, assessment: { id: openmaicEntityId('a', [observation.responseId]), responseId: observation.responseId, result: observation.result, grading: observation.grading, ...(observation.official ? { official: observation.official, officialHistory: observation.officialHistory } : {}), assistance: 'unknown', assessedAt: Date.now(), feedback: observation.grading === 'equivalent' ? 'The submitted value is equivalent to the frozen criterion; the official result is preserved.' : observation.grading === 'conflict' ? 'The official and frozen criterion conflict; review before accepting evidence.' : observation.grading === 'pending' ? 'The original answer is preserved; missing grading or criterion needs review.' : 'Checked against the original frozen criterion.', answerEvidence: openmaicAcademicQuestion(observation).answerEvidence }, sourceStatus: observation.sourceStatus, reason: observation.reason, answerExposure: observation.answerExposure })) ?? [], ...fact?.source?.pending.map(pendingOpenmaic => ({ pendingOpenmaic })) ?? []].slice(offset, offset + 20),
          total: fact?.source ? fact.source.observations.length + fact.source.pending.length : null, drafts: fact?.source?.drafts ?? null, nextOffset: fact?.source && offset + 20 < fact.source.observations.length + fact.source.pending.length ? offset + 20 : null }
      }
      const bounded = z.record(z.string(), z.json()).parse(JSON.parse(JSON.stringify(result)))
      const rows = Array.isArray(bounded.records) ? bounded.records : Array.isArray(bounded.questions) ? bounded.questions : undefined
      const originalLength = rows?.length ?? 0
      if (bounded.consumption && typeof bounded.consumption === 'object' && !Array.isArray(bounded.consumption)) {
        for (const field of ['missingResponseIds', 'missingPendingIds', 'conflicts']) if (Array.isArray(bounded.consumption[field])) { const ids = bounded.consumption[field]; bounded.consumption[`${field}Count`] = ids.length; bounded.consumption[field] = ids.slice(0, 20) }
      }
      while (Buffer.byteLength(JSON.stringify(bounded)) > 32768 && rows?.length) rows.pop()
      if (rows && rows.length < originalLength) { bounded.nextOffset = offset + rows.length; bounded.omitted = originalLength - rows.length; if (!rows.length) { bounded.status = 'unavailable'; bounded.failure = 'read-limit'; bounded.complete = false; delete bounded.consumption; bounded.reason = 'This source record exceeds the native result limit. The offset has not advanced; keep its checkpoint pending.' } }
      if (Buffer.byteLength(JSON.stringify(bounded)) > 32768) throw new Error('Source metadata exceeds the bounded native read result.')
      return z.json().parse(bounded)
    },
  })), 'student: official feedback')
}
