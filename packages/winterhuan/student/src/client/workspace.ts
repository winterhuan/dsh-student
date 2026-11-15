import { useRef } from 'react'
import type { ResourceSnapshot } from '@deepseek-ai/dsh-client-resources/client'
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
  const context = useResource(visible ? studentResourceAddress(sessionId, { kind: 'learning-context' }) : '')
  const data = resource.value && dashboardValue(resource.value.data) ? resource.value.data : undefined
  const offset = useRef(0)
  if (data) offset.current = data.serverNow - Date.now()
  const facts = context.value?.data
  const termId = facts && typeof facts === 'object' && 'termId' in facts && typeof facts.termId === 'string' ? facts.termId : undefined
  const stale = resource.status === 'failed' || context.status === 'failed'
  return { data, context: facts, termId, value: resource.value, stale, error: stale ? networkError : '', offset }
}

// The shared Host dashboard query validates all business content; this checks its wire discriminator.
function dashboardValue(value: StudentJsonValue): value is StudentJsonValue & Dashboard {
  return value !== null && typeof value === 'object' && 'serverNow' in value && typeof value.serverNow === 'number' && 'revision' in value && 'study' in value && 'interactiveLessons' in value
}
