import { registerStudyRoute } from "./route.js";
import StudentRemote from "./remote-service.js";
import { StudyBackupRetention } from "./files/backup-retention.js";
import { StudyReadCacheOwner } from "./files/cache.js";
export * from "./remote-service.js";
/** Independent student plugin identity. */
export const name = 'student';
/** The workspace route mounts when its Host services become available. */
export const inject = [];
/** Validated Host refresh interval and serialized response cap. */
export const Config = StudentRemote.Config;
/** Register the learning workspace API for the Host lifetime. */
export function apply(context, config) {
    registerStudyRoute(context);
    context.plugin(StudyBackupRetention);
    context.plugin(StudyReadCacheOwner);
    context.plugin(StudentRemote, config);
}
//# sourceMappingURL=index.js.map