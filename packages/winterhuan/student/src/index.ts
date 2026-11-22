import type { Context } from '@deepseek-ai/cordis'
import StudentRemote from './remote-service.ts'
import type { StudentTransportConfig } from './types.ts'
import { StudentOpenmaicPlayback } from './openmaic/playback.ts'
import { StudentOpenmaic, openmaicConfig } from './openmaic/service.ts'
import type { StudentOpenmaicConfig } from './openmaic/service.ts'
import z from '@deepseek-ai/schemastery'
import { StudyBackupRetention } from './files/backup-retention.ts'
import { StudyReadCacheOwner } from './files/cache-owner.ts'
export * from './remote-service.ts'
export type * from './types.ts'

/** Independent student plugin identity. */
export const name = 'student'
/** Host services mount independently from the optional browser client. */
export const inject = []
/** Validated Host refresh interval and serialized response cap. */
export interface StudentHostConfig extends StudentTransportConfig { openmaic: StudentOpenmaicConfig }
export const Config: z<StudentHostConfig> = z.object({ refreshIntervalMs: z.number().step(1).min(1).max(2_147_483_647).default(3000), maxWireBytes: z.number().step(1).min(1024).default(1_048_576), openmaic: openmaicConfig.default({}) })

/** Register Student reads, manual saves and backup retention for the Host lifetime. */
export function apply(context: Context, config: StudentHostConfig): void {
  context.plugin(StudentOpenmaic, config.openmaic)
  context.plugin(StudentOpenmaicPlayback)
  context.plugin(StudyBackupRetention)
  context.plugin(StudyReadCacheOwner)
  context.plugin(StudentRemote, config)
}
