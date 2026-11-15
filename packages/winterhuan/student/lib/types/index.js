import StudentRemote from "./remote-service.js";
import { StudyBackupRetention } from "./files/backup-retention.js";
import { StudyReadCacheOwner } from "./files/cache-owner.js";
export * from "./remote-service.js";
/** Independent student plugin identity. */
export const name = 'student';
/** Host services mount independently from the optional browser client. */
export const inject = [];
/** Validated Host refresh interval and serialized response cap. */
export const Config = StudentRemote.Config;
/** Register Student reads, manual saves and backup retention for the Host lifetime. */
export function apply(context, config) {
    context.plugin(StudyBackupRetention);
    context.plugin(StudyReadCacheOwner);
    context.plugin(StudentRemote, config);
}
//# sourceMappingURL=index.js.map