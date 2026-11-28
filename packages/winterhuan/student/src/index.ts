import type { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import StudentRemote from './remote-service.ts'
import type { StudentTransportConfig } from './types.ts'
import { StudentOpenmaicPlayback } from './openmaic/playback.ts'
import { StudentOpenmaic, openmaicConfig } from './openmaic/service.ts'
import type { StudentOpenmaicConfig } from './openmaic/service.ts'
import z from '@deepseek-ai/schemastery'
import { StudyBackupRetention } from './files/backup-retention.ts'
import { StudyReadCacheOwner } from './files/cache-owner.ts'
import { StudentTextbooks, textbookConfig, type TextbookConfig } from './textbooks/service.ts'
export * from './remote-service.ts'
export type * from './types.ts'

/** Independent student plugin identity. */
export const name = 'student'
/** Host services mount independently from the optional browser client. */
export const inject = ['credentials', 'agents', 'attachments', 'llm', 'typert']
/** Validated Host refresh interval and serialized response cap. */
export interface StudentHostConfig extends StudentTransportConfig { openmaic: StudentOpenmaicConfig; textbooks: TextbookConfig }
export const Config: z<StudentHostConfig> = z.object({ refreshIntervalMs: z.number().step(1).min(1).max(2_147_483_647).default(3000), maxWireBytes: z.number().step(1).min(1024).default(1_048_576), openmaic: openmaicConfig.default({}), textbooks: textbookConfig.default({}) })

/** Register Student reads, manual saves and backup retention for the Host lifetime. */
export async function apply(context: Context, config: StudentHostConfig): Promise<void> {
  context.plugin(Include, { path: new URL('./openmaic/cordis.yml', import.meta.url).href })
  context.plugin(StudentOpenmaic, config.openmaic)
  context.plugin(StudentOpenmaicPlayback)
  context.plugin(StudyBackupRetention)
  context.plugin(StudyReadCacheOwner)
  await context.plugin(StudentTextbooks, config.textbooks)
  context.plugin(StudentRemote, config)
}
