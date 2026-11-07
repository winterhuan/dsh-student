import { registerStudyRoute } from "./route.js";
/** Independent student plugin identity. */
export const name = 'student';
/** The workspace route mounts when its Host services become available. */
export const inject = [];
/** Register the learning workspace API for the Host lifetime. */
export function apply(context) {
    registerStudyRoute(context);
}
//# sourceMappingURL=index.js.map