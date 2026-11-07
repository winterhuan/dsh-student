import type { Command } from './schema.ts'

/** Whether each study action may be submitted through the workbench API; keyed exhaustively by the command schema. */
const panelPermission: Record<Command['action'], boolean> = {
  setup: true,
  material: false,
  course: false,
  'configure-course': true,
  'school-progress': true,
  'archive-term': true,
  'openmaic-settings': true,
  interests: true,
  start: true,
  task: false,
  answer: true,
  hint: true,
  stuck: true,
  record: false,
  stop: true,
  mistake: false,
  'confirm-mistake': true,
  'delete-mistake': true,
  'save-exercise': true,
  'delete-exercise': true,
  concept: false,
  'confirm-concept': true,
  objective: false,
  relation: false,
  'link-mistake': true,
  'classify-mistake': true,
  worksheet: false,
  'paper-draft': false,
  'grade-sheet': true,
  'confirm-paper': true,
  'discard-sheet': true,
  'workbook-draft': false,
  'confirm-workbook': true,
  'dismiss-teaching': true,
}

/** Actions the workbench panel may submit directly; tutor assessment and rewards stay with the model tools. */
export const panelActions: ReadonlySet<Command['action']> = new Set(Object.entries(panelPermission).filter(([, allowed]) => allowed).map(([action]) => action as Command['action']))
