import { useRef } from 'react'
import type { WorkspaceRead } from '../files/read.ts'
import type { ResourceSnapshot } from '@deepseek-ai/dsh-client-resources/client'
import type { CapabilityProgress, LearningNextAction, LearningRoundView } from '../learning/mastery.ts'
import type { Dashboard, MistakeStatus } from '../dashboard.ts'
import type { StudentQueryResult, StudentSessionId, StudentJsonValue } from '../types.ts'
import { studentResourceAddress } from './resource.ts'

/** One dashboard selection; browsing and diagnostic ranges do not change the active block. */
export interface StudyQuery { tab: 'today' | 'map' | 'mistakes' | 'parent'; offset: number; subject: 'chinese' | 'math' | 'english'; status: MistakeStatus; mapGrade?: number; mapTerm?: 'first' | 'second'; diagGrade?: number; diagTerm?: 'first' | 'second'; diagUnit?: string }
/** Native resource hook supplied by the enclosing DSH slot. */
export type UseStudentResource = (address: string) => ResourceSnapshot<StudentQueryResult>

/** Read validated dashboard and stable learning identities through the shared resource lifetime. */
export function useStudy(sessionId: StudentSessionId, visible: boolean, networkError: string, query: StudyQuery, useResource: UseStudentResource) {
  const { offset: mistakeOffset, status: mistakeStatus, ...options } = query
  const resource = useResource(visible ? studentResourceAddress(sessionId, { kind: 'dashboard', options: { ...options, mistakeOffset, mistakeStatus } }) : '')
  const context = useResource(visible ? studentResourceAddress(sessionId, { kind: 'learning-context', subject: query.subject }) : '')
  const currentData = resource.value && dashboardValue(resource.value.data) ? resource.value.data : undefined
  const currentFacts = context.value?.data
  // Independent streams must agree on the files before an action can combine their facts.
  const contextReady = resource.status === 'live' && resource.value?.status === 'valid' && context.status === 'live' && context.value?.status === 'valid' && currentData !== undefined && currentFacts !== null && currentFacts !== undefined
    && resource.value.versions.length === context.value.versions.length && resource.value.versions.every(file => context.value!.versions.some(other => other.path === file.path && other.targetKey === file.targetKey && other.version === file.version))
  const lastView = useRef<{ sessionId: StudentSessionId; subject: StudyQuery['subject']; data: StudentJsonValue & Dashboard; facts: StudentJsonValue }>()
  if (contextReady) lastView.current = { sessionId, subject: query.subject, data: currentData, facts: currentFacts }
  // Preserve one coherent question and draft identity while current reads disable actions.
  const retained = lastView.current?.sessionId === sessionId && lastView.current.subject === query.subject ? lastView.current : undefined
  const data = contextReady ? currentData : retained?.data ?? currentData
  const facts = contextReady ? currentFacts : retained?.facts ?? currentFacts
  const offset = useRef(0)
  if (data) offset.current = data.serverNow - Date.now()
  const termId = facts && typeof facts === 'object' && 'termId' in facts && typeof facts.termId === 'string' ? facts.termId : undefined
  const learnerId = facts && typeof facts === 'object' && 'learnerId' in facts && typeof facts.learnerId === 'string' ? facts.learnerId : undefined
  const question = facts && typeof facts === 'object' && 'currentQuestion' in facts ? facts.currentQuestion : undefined
  const source = question && typeof question === 'object' && 'openmaic' in question ? question.openmaic : undefined
  const classroomBindingId = source && typeof source === 'object' && 'bindingId' in source && typeof source.bindingId === 'string' ? source.bindingId : undefined
  const nextAction = facts && typeof facts === 'object' && 'nextAction' in facts ? facts.nextAction as (StudentJsonValue & LearningNextAction) | null : null
  const round = facts && typeof facts === 'object' && 'round' in facts ? facts.round as (StudentJsonValue & LearningRoundView) | null : null
  const legalActions = facts && typeof facts === 'object' && 'legalActions' in facts && Array.isArray(facts.legalActions) ? facts.legalActions.filter((value): value is string => typeof value === 'string') : []
  const sourceVerification = facts && typeof facts === 'object' && 'sourceVerification' in facts ? facts.sourceVerification as StudentJsonValue & NonNullable<WorkspaceRead['sourceVerification']> : null
  const goalProgress = facts && typeof facts === 'object' && 'goalProgress' in facts && Array.isArray(facts.goalProgress) ? facts.goalProgress as StudentJsonValue[] & CapabilityProgress[] : []
  const loadNeeded = !data && (resource.failure?.code === 'student/main-session-required' || context.failure?.code === 'student/main-session-required')
  const stale = resource.status === 'failed' || context.status === 'failed'
  const invalidRecords = resource.status === 'failed' && resource.failure?.code === 'student/invalid-records' || context.status === 'failed' && context.failure?.code === 'student/invalid-records'
  return { data, context: facts, contextState: { status: context.status, readStatus: context.value?.status, versions: context.value?.versions ?? [], issues: context.value?.issues ?? [], failure: context.failure }, contextReady, termId, learnerId, classroomBindingId, nextAction, round, legalActions, sourceVerification, goalProgress, value: resource.value, loadNeeded, stale, invalidRecords, error: stale ? networkError : '', offset }
}

// The shared Host dashboard query validates all business content; this checks its wire discriminator.
function dashboardValue(value: StudentJsonValue): value is StudentJsonValue & Dashboard {
  return value !== null && typeof value === 'object' && 'serverNow' in value && typeof value.serverNow === 'number' && 'revision' in value && 'study' in value && 'interactiveLessons' in value
}
