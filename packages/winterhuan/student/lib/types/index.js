import Include from '@deepseek-ai/cordis-plugin-include';
import StudentRemote from "./remote-service.js";
import { StudentOpenmaicPlayback } from "./openmaic/playback.js";
import { StudentOpenmaic, openmaicConfig } from "./openmaic/service.js";
import z from '@deepseek-ai/schemastery';
import { StudyBackupRetention } from "./files/backup-retention.js";
import { StudyReadCacheOwner } from "./files/cache-owner.js";
import { StudentTextbooks, textbookConfig } from "./textbooks/service.js";
export * from "./remote-service.js";
/** Independent student plugin identity. */
export const name = 'student';
/** Host services mount independently from the optional browser client. */
export const inject = ['credentials', 'agents', 'attachments', 'llm', 'typert'];
export const Config = z.object({ refreshIntervalMs: z.number().step(1).min(1).max(2_147_483_647).default(3000), maxWireBytes: z.number().step(1).min(1024).default(1_048_576), openmaic: openmaicConfig.default({}), textbooks: textbookConfig.default({}) });
/** Register Student reads, manual saves and backup retention for the Host lifetime. */
export async function apply(context, config) {
    context.plugin(Include, { path: new URL('./openmaic/cordis.yml', import.meta.url).href });
    context.plugin(StudentOpenmaic, config.openmaic);
    context.plugin(StudentOpenmaicPlayback);
    context.plugin(StudyBackupRetention);
    context.plugin(StudyReadCacheOwner);
    await context.plugin(StudentTextbooks, config.textbooks);
    context.plugin(StudentRemote, config);
}
//# sourceMappingURL=index.js.map