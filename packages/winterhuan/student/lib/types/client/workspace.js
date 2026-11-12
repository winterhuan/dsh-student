import { useRef } from 'react';
import { studentResourceAddress } from "./resource.js";
/** Read validated dashboard and stable learning identities through the shared resource lifetime. */
export function useStudy(sessionId, visible, networkError, query, useResource) {
    const { offset: mistakeOffset, status: mistakeStatus, ...options } = query;
    const resource = useResource(visible ? studentResourceAddress(sessionId, { kind: 'dashboard', options: { ...options, mistakeOffset, mistakeStatus } }) : '');
    const context = useResource(visible ? studentResourceAddress(sessionId, { kind: 'learning-context' }) : '');
    const data = resource.value && dashboardValue(resource.value.data) ? resource.value.data : undefined;
    const offset = useRef(0);
    if (data)
        offset.current = data.serverNow - Date.now();
    const facts = context.value?.data;
    const termId = facts && typeof facts === 'object' && 'termId' in facts && typeof facts.termId === 'string' ? facts.termId : undefined;
    const stale = resource.status === 'failed' || context.status === 'failed';
    return { data, context: facts, termId, value: resource.value, stale, error: stale ? networkError : '', offset };
}
// The shared Host dashboard query validates all business content; this checks its wire discriminator.
function dashboardValue(value) {
    return value !== null && typeof value === 'object' && 'serverNow' in value && typeof value.serverNow === 'number' && 'revision' in value && 'study' in value && 'interactiveLessons' in value;
}
//# sourceMappingURL=workspace.js.map