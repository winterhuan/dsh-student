/** Pure parsed-file and cross-entity validation, shared by every Student consumer. */
import { z } from 'zod'
import { canonical, sameScope, scopeSelects, studyDay } from '../learning/shared.ts'
import { builtinObjectiveAnywhere, builtinObjectiveIn, curriculumFor, subjectExercises } from '../curriculum.ts'
import { officialFileSchemas, type OfficialFile, type TermSettings, type LearningBlock, type WorksheetFile, type CollectionsFile } from './schema.ts'
import { customObjectiveMethods } from '../schema.ts'
import { errorTypesBySubject } from '../vocabulary.ts'

/** Bounded, actionable durable-file failure. */
export interface FileIssue { path: string; field: string; rule: string; correction: string }
/** Parsed bytes supplied by a filesystem reader or a proposed manual edit. */
export interface ParsedFile { path: string; value: unknown }
/** The relevant valid business entities; no second persisted evidence authority. */
export interface ValidatedWorkspace { settings: TermSettings; blocks: LearningBlock[]; worksheets: WorksheetFile[]; collections?: CollectionsFile; nativeSources?: readonly NativeInputObservation[] }
/** Host-resolved consumed input version; official-file declarations alone cannot supply this observation. */
export interface NativeInputObservation { sessionId: string; messageId: string; inputVersion: string; rawResponse: string; receiptAt: number }
/** Validation outcome retains independently valid parsed files when related data fails. */
export interface ValidationResult { valid: boolean; issues: FileIssue[]; files: { path: string; file: OfficialFile }[]; workspace?: ValidatedWorkspace }

/**
 * Validate parsed official files and available previously validated versions.
 * @param input - discovered current files with exact workspace-relative paths.
 * @param prior - preserved valid file versions for used-content comparison.
 * @param nativeSources - matching consumed input versions resolved from native Session records.
 * @returns bounded issues and independently valid workspace entities.
 */
export function validateStudyFiles(input: readonly ParsedFile[], prior: readonly { path: string; file: OfficialFile }[] = [], nativeSources: readonly NativeInputObservation[] = []): ValidationResult {
  const issues: FileIssue[] = []
  const files: ValidationResult['files'] = []
  const paths = new Set<string>()
  const fail = (path: string, field: string, rule: string, correction: string) => {
    if (issues.length < 100) issues.push({ path, field: field.slice(0, 240), rule, correction: correction.slice(0, 500) })
  }
  for (const entry of input) {
    if (paths.has(entry.path)) fail(entry.path, '', 'duplicate-file', 'Supply one current file per path.')
    paths.add(entry.path)
    const raw = z.object({ kind: z.string(), format: z.number() }).passthrough().safeParse(entry.value)
    if (!raw.success) { fail(entry.path, '', 'schema', 'Save an official JSON object with format and kind.'); continue }
    const schema = Object.hasOwn(officialFileSchemas, raw.data.kind) ? officialFileSchemas[raw.data.kind as keyof typeof officialFileSchemas] : undefined
    if (!schema) { fail(entry.path, 'kind', 'file-kind', 'Use term-settings, block, worksheet or collections.'); continue }
    const parsed = schema.safeParse(entry.value)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) fail(entry.path, issue.path.join('.'), raw.data.format > 2 ? 'future-format' : 'schema', issue.message)
      continue
    }
    const file = parsed.data
    const expected = file.kind === 'term-settings' ? '.study/settings.json' : file.kind === 'collections' ? '.study/collections.json' : `.study/${file.kind === 'block' ? 'blocks' : 'worksheets'}/${file.id}.json`
    if (entry.path !== expected) fail(entry.path, 'id', 'file-membership', `Place this ${file.kind} at ${expected}.`)
    files.push({ path: entry.path, file })
  }
  const settings = files.find(entry => entry.file.kind === 'term-settings')?.file
  if (!settings || settings.kind !== 'term-settings') {
    fail('.study/settings.json', '', 'missing-settings', 'Create valid term settings before publishing other entities.')
    return { valid: false, issues, files }
  }
  const blocks = files.flatMap(entry => entry.file.kind === 'block' ? [entry.file] : [])
  const worksheets = files.flatMap(entry => entry.file.kind === 'worksheet' ? [entry.file] : [])
  if (blocks.length > 5000) fail('.study/blocks', '', 'collection-limit', 'Keep at most 5,000 block files in this term.')
  if (worksheets.length > 500) fail('.study/worksheets', '', 'collection-limit', 'Keep at most 500 worksheet files in this term.')
  const collections = files.find(entry => entry.file.kind === 'collections')?.file
  const workspace: ValidatedWorkspace = { settings, blocks, worksheets, nativeSources, ...(collections?.kind === 'collections' ? { collections } : {}) }
  const unique = (path: string, field: string, rows: readonly { id: string }[]) => {
    const seen = new Set<string>()
    rows.forEach((row, index) => { if (seen.has(row.id)) fail(path, `${field}.${index}.id`, 'duplicate-identity', 'Keep one entry per stable identity; use a new identity for a new attempt.'); seen.add(row.id) })
  }
  unique('.study/settings.json', 'materials', settings.materials)
  if (new Set(settings.courses.map(course => course.subject)).size !== settings.courses.length) fail('.study/settings.json', 'courses', 'duplicate-subject', 'Keep one course per subject.')
  for (const course of settings.courses) {
    const material = settings.materials.find(item => item.id === course.materialId)
    if (!material || material.subject !== course.subject || material.editionStatus !== 'identified' || !['official-textbook', 'school-material'].includes(material.kind)) fail('.study/settings.json', 'courses', 'course-material', 'Reference an identified school material of the same subject.')
    if (course.progress && !curriculumFor(settings.profile, course.subject)?.units.some(unit => unit.id === course.progress?.unitId)) fail('.study/settings.json', 'courses.progress.unitId', 'school-progress', 'Confirm a unit in the current knowledge map.')
  }
  if (blocks.filter(block => block.endedAt === undefined).length > 1) fail('.study/blocks', '', 'active-block', 'End the previous block before starting another; retain its pending responses.')
  for (const { path, file } of files) {
    if (file.termId !== settings.termId) fail(path, 'termId', 'term-identity', 'Use the current term identity or preserve this entity in its original archive.')
    if (file.kind === 'collections') {
      for (const field of ['mistakes', 'exercises', 'concepts', 'objectives', 'relations', 'teachingQueue'] as const) unique(path, field, file[field])
      for (const objective of file.objectives) {
        if (!customObjectiveMethods[objective.subject].some(method => method === objective.method) || new Set(objective.conceptIds).size !== objective.conceptIds.length || !objective.conceptIds.every(id => file.concepts.some(concept => concept.id === id && concept.subject === objective.subject && concept.confirmedAt !== undefined && concept.userConfirmation))) fail(path, 'objectives', 'confirmed-goal', 'Reference distinct confirmed concepts of this subject and use an allowed learning method.')
      }
      for (const relation of file.relations) {
        const from = file.concepts.find(concept => concept.id === relation.fromId)
        const to = file.concepts.find(concept => concept.id === relation.toId)
        if (!from || !to || from.id === to.id || from.subject !== to.subject || from.confirmedAt === undefined || to.confirmedAt === undefined || !from.userConfirmation || !to.userConfirmation) fail(path, 'relations', 'concept-reference', 'Reference two distinct confirmed concepts of the same subject.')
      }
      for (const mistake of file.mistakes) {
        if (mistake.errorType && !errorTypesBySubject[mistake.subject].includes(mistake.errorType)) fail(path, 'mistakes.errorType', 'subject-cause', 'Use a cause belonging to the mistake subject.')
        if (mistake.confirmedAt !== undefined && (!mistake.userConfirmation || mistake.uncertainties !== '')) fail(path, 'mistakes', 'mistake-confirmation', 'Retain a parent statement and resolve transcription uncertainty before confirmation.')
      }
      continue
    }
    if (file.kind !== 'block' && file.kind !== 'worksheet') continue
    if (file.kind === 'block' && file.mode !== 'diagnose' && file.intensity !== undefined) fail(path, 'intensity', 'diagnostic-intensity', 'Record intensity only for a diagnostic block; omit it for other activities.')
    const questions = file.kind === 'block' ? file.questions : file.items
    unique(path, 'questions', questions); unique(path, 'responses', file.responses); unique(path, 'assessments', file.assessments)
    if (new Set(file.assessments.map(item => item.responseId)).size !== file.assessments.length) fail(path, 'assessments', 'one-assessment-per-response', 'Correct the existing assessment instead of adding another for the same response.')
    if (file.kind === 'block' && file.currentQuestionId && !questions.some(item => item.id === file.currentQuestionId)) fail(path, 'currentQuestionId', 'question-reference', 'Reference a saved question in this block.')
    if (file.kind === 'block' && file.currentResponseId && !file.responses.some(response => response.id === file.currentResponseId && response.questionId === file.currentQuestionId)) fail(path, 'currentResponseId', 'response-reference', 'Select a saved response to the current question in this block.')
    if (!file.context.profile && !file.context.pendingProfile) fail(path, 'context.profile', 'historical-profile', 'Save the historical profile, or explicitly retain a pending legacy profile source.')
    if (file.context.pendingProfile && !settings.migration) fail(path, 'context.pendingProfile', 'legacy-profile-source', 'Pending historical profiles require a preserved migration source.')
    if (file.kind === 'block' && file.mode === 'school' && !file.context.pendingProfile && (!file.context.profile || !file.context.material || !sameScope(file.context.profile, file.context.material.scope))) fail(path, 'context.material', 'historical-course', 'Save the confirmed compatible course context for this school block.')
    if (file.kind === 'block' && file.mode === 'school' && file.startedAt >= settings.updatedAt) {
      const course = settings.courses.find(course => course.subject === file.subject)
      const material = settings.materials.find(material => material.id === course?.materialId)
      if (!file.context.pendingProfile && (!file.context.profile || !material || !sameScope(settings.profile, material.scope) || !sameScope(settings.profile, file.context.profile) || file.context.material?.id !== material.id)) fail(path, 'context.material', 'future-course-confirmation', 'Confirm a course compatible with the current profile before starting a future school block.')
    }
    for (const [i, question] of questions.entries()) {
      const frozen = prior.some(entry => {
        if (entry.path !== path || entry.file.kind !== file.kind || (entry.file.kind !== 'block' && entry.file.kind !== 'worksheet')) return false
        const oldQuestions = entry.file.kind === 'block' ? entry.file.questions : entry.file.items
        const old = oldQuestions.find(item => item.id === question.id)
        const used = entry.file.responses.some(response => response.questionId === question.id) || (entry.file.kind === 'worksheet' && entry.file.drafts.some(draft => draft.questionId === question.id))
        return used && canonical(old) === canonical(question)
      })
      if (file.kind === 'block' && file.mode === 'diagnose' && question.phase !== undefined) fail(path, `questions.${i}.phase`, 'diagnostic-phase', 'Omit teaching phases from diagnostic questions.')
      if (file.kind === 'block' && file.mode === 'review' && !question.mistakeId && question.source.kind !== 'legacy') fail(path, `questions.${i}.mistakeId`, 'review-mistake', 'Bind a review question to a confirmed mistake of the same subject and goal.')
      if (question.basisStatus && question.source.kind !== 'legacy') fail(path, `questions.${i}.basisStatus`, 'legacy-basis-source', 'Unresolved answer bases belong only to preserved legacy questions.')
      if (typeof question.objectiveId !== 'string') {
        if (question.source.kind !== 'legacy') fail(path, `questions.${i}.objectiveId`, 'pending-target', 'Only preserved legacy questions may carry an unresolved target.')
        continue
      }
      const builtin = builtinObjectiveAnywhere(question.objectiveId)
      const custom = workspace.collections?.objectives.find(item => item.id === question.objectiveId)
      const goal = builtin ?? custom
      if (!goal || goal.subject !== file.subject) fail(path, `questions.${i}.objectiveId`, 'subject-target', 'Reference a saved or shipped learning goal of this subject.')
      const effective = file.context.scope ?? file.context.profile
      if (builtin && !frozen && question.source.kind !== 'legacy' && (!effective || !builtinObjectiveIn(effective, file.subject, question.objectiveId))) fail(path, `questions.${i}.objectiveId`, 'effective-curriculum', 'Publish a goal in the historical profile book, or save an explicit scope selecting the goal’s book.')
      if (file.context.scope && (!goal || !scopeSelects(file.context.scope, file.subject, builtin?.unit ?? '', question.objectiveId))) fail(path, `questions.${i}.objectiveId`, 'effective-scope', 'Publish a question inside the explicitly selected scope.')
      if (question.source.kind === 'exercise') {
        const sourceId = question.source.exerciseId
        if (![...(workspace.collections?.exercises ?? []), ...subjectExercises(file.subject)].some(item => item.id === sourceId && item.objectiveId === question.objectiveId)) fail(path, `questions.${i}.source`, 'exercise-source', 'Reference a saved or shipped exercise for this goal.')
      }
      if (question.source.kind === 'mistake' && question.source.mistakeId !== question.mistakeId) fail(path, `questions.${i}.source`, 'mistake-source', 'Use the same mistake identity for the source and frozen review binding.')
      if (question.mistakeId) {
        const mistake = workspace.collections?.mistakes.find(item => item.id === question.mistakeId)
        if (!frozen && (!mistake || mistake.subject !== file.subject || mistake.objectiveId !== question.objectiveId || mistake.confirmedAt === undefined || !mistake.userConfirmation)) fail(path, `questions.${i}.mistakeId`, 'mistake-source', 'Bind new review content to a confirmed mistake of the same subject and goal; preserve validated used content for historical bindings.')
        if (!frozen && question.source.kind !== 'legacy' && file.kind === 'worksheet' && file.origin === 'prepared' && mistake?.prompt === question.prompt) fail(path, `questions.${i}.prompt`, 'review-variation', 'Vary the prompt of a prepared mistake question; retain original prompts in workbook records.')
      }
    }
    for (const [i, response] of file.responses.entries()) {
      const question = questions.find(item => item.id === response.questionId)
      if (!question) fail(path, `responses.${i}.questionId`, 'question-reference', 'Save the referenced question before its original answer.')
      if (question?.phase === 'demo' && response.assistance !== 'worked-example') fail(path, `responses.${i}.assistance`, 'demonstration', 'A real response to a demonstration carries worked-example assistance.')
      if (response.answerDate?.kind === 'instant' && response.answerDate.basis === 'native-input' && (response.source.kind !== 'native' || response.source.receiptAt !== response.answerDate.at || response.source.inputVersion !== response.answerDate.sourceVersion)) fail(path, `responses.${i}.answerDate`, 'native-input-version', 'Use the matching consumed native input version and receipt time, or retain an unknown date.')
      if (response.answerDate?.kind === 'instant' && response.answerDate.basis === 'current-manual' && (response.source.kind !== 'manual' || response.source.entry !== 'current')) fail(path, `responses.${i}.answerDate`, 'current-manual-source', 'Use a confirmed current manual response; historical and paper entry retain day precision or an unknown date.')
      if (file.kind === 'worksheet' && file.answerDate?.kind === 'instant') fail(path, 'answerDate', 'worksheet-date-precision', 'Use a parent-confirmed calendar date for a worksheet-wide date.')
      if (file.kind === 'block') {
        const hints = file.hints.filter(hint => hint.questionId === response.questionId)
        const known = hints.some(hint => hint.responseId === response.id || (!hint.responseId && response.answerDate?.kind === 'instant' && hint.at <= response.answerDate.at))
        const ambiguous = hints.some(hint => !hint.responseId && (response.answerDate?.kind === 'day' ? studyDay(hint.at) <= response.answerDate.day : response.answerDate?.kind !== 'instant'))
        if (known && !['hint', 'worked-example'].includes(response.assistance) || ambiguous && response.assistance === 'independent') fail(path, `responses.${i}.assistance`, 'known-help', 'Preserve known help; associate a question hint with its actual response before claiming an independently answered attempt with uncertain order.')
      }
    }
    for (const [i, assessment] of file.assessments.entries()) {
      const response = file.responses.find(item => item.id === assessment.responseId)
      if (!response) fail(path, `assessments.${i}.responseId`, 'response-reference', 'Save the original learner response before assessment.')
      if (response && assessment.assistance !== response.assistance) fail(path, `assessments.${i}.assistance`, 'assistance-association', 'Keep assessment assistance consistent with the saved response.')
      if (file.kind === 'worksheet' && !assessment.userConfirmation) fail(path, `assessments.${i}.userConfirmation`, 'parent-confirmation', 'Record the parent statement confirming this paper result.')
    }
    if (file.kind === 'worksheet') {
      unique(path, 'drafts', file.drafts)
      for (const draft of file.drafts) if (!questions.some(question => question.id === draft.questionId)) fail(path, 'drafts.questionId', 'question-reference', 'Retain the published question used by transcription.')
    }
    for (const old of prior.filter(entry => entry.path === path && entry.file.kind === file.kind)) {
      if (old.file.kind !== 'block' && old.file.kind !== 'worksheet') continue
      if (old.file.termId !== file.termId || old.file.id !== file.id) { fail(path, 'id', 'identity-reuse', 'Preserve term and entity identity at this path.'); continue }
      const oldQuestions = old.file.kind === 'block' ? old.file.questions : old.file.items
      if ((old.file.responses.length > 0 || (old.file.kind === 'worksheet' && old.file.drafts.length > 0)) && canonical(old.file.context) !== canonical(file.context)) fail(path, 'context', 'historical-context', 'Preserve the historical profile, material and selected scope used by these responses.')
      for (const question of oldQuestions) {
        const used = old.file.responses.some(response => response.questionId === question.id) || (old.file.kind === 'worksheet' && old.file.drafts.some(draft => draft.questionId === question.id))
        if (used && canonical(question) !== canonical(questions.find(item => item.id === question.id))) fail(path, 'questions', 'frozen-content', 'Retain used question content and target; publish replacements under a new identity.')
      }
      for (const response of old.file.responses) {
        const current = file.responses.find(item => item.id === response.id)
        const { assistance: oldHelp, assistanceConfirmation: _oldConfirmation, answerDate: oldDate, answerDateConfirmation: _oldDateConfirmation, ...original } = response
        const { assistance: newHelp, assistanceConfirmation: newConfirmation, answerDate: newDate, answerDateConfirmation: dateConfirmation, ...comparable } = current ?? response
        const greaterHelp = oldHelp === 'independent' && ['hint', 'worked-example'].includes(newHelp) || oldHelp === 'hint' && newHelp === 'worked-example'
        const helpChanged = newHelp !== oldHelp && !((oldHelp === 'unknown' || greaterHelp) && newConfirmation)
        const dateChanged = canonical(oldDate) !== canonical(newDate) && !(oldDate?.kind !== 'instant' && (newDate?.kind === 'day' && newDate.parentConfirmation || newDate?.kind === 'unknown' && dateConfirmation))
        if (!current || canonical(comparable) !== canonical(original) || helpChanged || dateChanged) fail(path, 'responses', 'original-response', 'Preserve original response identity and wording; confirm unknown help or actual paper dates explicitly and correct assessment separately.')
      }
    }
  }
  const affected = (path: string) => issues.some(issue => issue.path === path || path.startsWith(`${issue.path}/`))
  if (affected('.study/collections.json')) for (const file of [...blocks, ...worksheets]) {
    const questions = file.kind === 'block' ? file.questions : file.items
    if (questions.some(question => typeof question.objectiveId === 'string' && !builtinObjectiveAnywhere(question.objectiveId))) fail(`.study/${file.kind === 'block' ? 'blocks' : 'worksheets'}/${file.id}.json`, 'objectiveId', 'invalid-target-source', 'Repair the referenced custom-goal collection before using this entity.')
  }
  const partial = affected('.study/settings.json') ? undefined : {
    settings, nativeSources, blocks: blocks.filter(block => !affected(`.study/blocks/${block.id}.json`)),
    worksheets: worksheets.filter(sheet => !affected(`.study/worksheets/${sheet.id}.json`)),
    ...(workspace.collections && !affected('.study/collections.json') ? { collections: workspace.collections } : {}),
  }
  return { valid: issues.length === 0, issues, files, ...(partial ? { workspace: partial } : {}) }
}
