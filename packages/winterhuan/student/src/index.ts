import type { Context } from '@deepseek-ai/cordis'
import { registerStudyRoute } from './route.ts'
import StudentRemote from './remote-service.ts'
import type { StudentTransportConfig } from './types.ts'
import type z from '@deepseek-ai/schemastery'
import { StudyBackupRetention } from './files/backup-retention.ts'
import { StudyReadCacheOwner } from './files/cache.ts'
export * from './remote-service.ts'
export type * from './types.ts'

/** Independent student plugin identity. */
export const name = 'student'
/** The workspace route mounts when its Host services become available. */
export const inject = []
/** Validated Host refresh interval and serialized response cap. */
export const Config: z<StudentTransportConfig> = StudentRemote.Config

/** Register the learning workspace API for the Host lifetime. */
export function apply(context: Context, config: StudentTransportConfig): void {
  registerStudyRoute(context)
  context.plugin(StudyBackupRetention)
  context.plugin(StudyReadCacheOwner)
  context.plugin(StudentRemote, config)
}
