import { useRef } from 'react';
import { studentResourceAddress } from "./resource.js";
/** Read validated dashboard and stable learning identities through the shared resource lifetime. */
export function useStudy(sessionId, visible, networkError, query, useResource) {
    const { offset: mistakeOffset, status: mistakeStatus, ...options } = query;
    const resource = useResource(visible ? studentResourceAddress(sessionId, { kind: 'dashboard', options: { ...options, mistakeOffset, mistakeStatus } }) : '');
    const context = useResource(visible ? studentResourceAddress(sessionId, { kind: 'learning-context', subject: query.subject }) : '');
    const currentData = resource.value && dashboardValue(resource.value.data) ? resource.value.data : undefined;
    const currentFacts = context.value?.data;
    // Independent streams must agree on the files before an action can combine their facts.
    const contextReady = resource.status === 'live' && resource.value?.status === 'valid' && context.status === 'live' && context.value?.status === 'valid' && currentData !== undefined && currentFacts !== null && currentFacts !== undefined
        && resource.value.versions.length === context.value.versions.length && resource.value.versions.every(file => context.value.versions.some(other => other.path === file.path && other.targetKey === file.targetKey && other.version === file.version));
    const lastView = useRef();
    if (contextReady)
        lastView.current = { sessionId, subject: query.subject, data: currentData, facts: currentFacts };
    // Preserve one coherent question and draft identity while current reads disable actions.
    const retained = lastView.current?.sessionId === sessionId && lastView.current.subject === query.subject ? lastView.current : undefined;
    const data = contextReady ? currentData : retained?.data ?? currentData;
    const facts = contextReady ? currentFacts : retained?.facts ?? currentFacts;
    const offset = useRef(0);
    if (data)
        offset.current = data.serverNow - Date.now();
    const termId = facts && typeof facts === 'object' && 'termId' in facts && typeof facts.termId === 'string' ? facts.termId : undefined;
    const learnerId = facts && typeof facts === 'object' && 'learnerId' in facts && typeof facts.learnerId === 'string' ? facts.learnerId : undefined;
    const question = facts && typeof facts === 'object' && 'currentQuestion' in facts ? facts.currentQuestion : undefined;
    const source = question && typeof question === 'object' && 'openmaic' in question ? question.openmaic : undefined;
    const classroomBindingId = source && typeof source === 'object' && 'bindingId' in source && typeof source.bindingId === 'string' ? source.bindingId : undefined;
    const nextAction = facts && typeof facts === 'object' && 'nextAction' in facts ? facts.nextAction : null;
    const round = facts && typeof facts === 'object' && 'round' in facts ? facts.round : null;
    const legalActions = facts && typeof facts === 'object' && 'legalActions' in facts && Array.isArray(facts.legalActions) ? facts.legalActions.filter((value) => typeof value === 'string') : [];
    const sourceVerification = facts && typeof facts === 'object' && 'sourceVerification' in facts ? facts.sourceVerification : null;
    const goalProgress = facts && typeof facts === 'object' && 'goalProgress' in facts && Array.isArray(facts.goalProgress) ? facts.goalProgress : [];
    const loadNeeded = !data && (resource.failure?.code === 'student/main-session-required' || context.failure?.code === 'student/main-session-required');
    const stale = resource.status === 'failed' || context.status === 'failed';
    return { data, context: facts, contextState: { status: context.status, readStatus: context.value?.status, versions: context.value?.versions ?? [], issues: context.value?.issues ?? [], failure: context.failure }, contextReady, termId, learnerId, classroomBindingId, nextAction, round, legalActions, sourceVerification, goalProgress, value: resource.value, loadNeeded, stale, error: stale ? networkError : '', offset };
}
// The shared Host dashboard query validates all business content; this checks its wire discriminator.
function dashboardValue(value) {
    return value !== null && typeof value === 'object' && 'serverNow' in value && typeof value.serverNow === 'number' && 'revision' in value && 'study' in value && 'interactiveLessons' in value;
}
//# sourceMappingURL=workspace.js.map