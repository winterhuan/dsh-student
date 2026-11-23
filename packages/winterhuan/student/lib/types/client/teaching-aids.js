import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NS } from "./locales.js";
const aidNames = new Set(['openmaic_widget', 'openmaic_slide', 'openmaic_render']);
function results(block) {
    const own = 'kind' in block && !block.isError && aidNames.has(block.call?.name ?? block.name) ? [block] : [];
    return [...own, ...block.subCalls.flatMap(results)];
}
function revealAid(button, callId) {
    const flow = button.closest('[data-chat-flow]');
    const target = [...(flow?.querySelectorAll('[data-chat-call-id]') ?? [])].find(element => element.dataset.chatCallId === callId);
    if (!target)
        return;
    // DSH keeps folded process bodies mounted and exposes them through beforematch.
    target.dispatchEvent(new Event('beforematch', { bubbles: true }));
    requestAnimationFrame(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }));
}
/**
 * Find a Turn's official teaching results and link to their original views.
 * @param props - native Session hooks, Turn identity and original tool dispatch.
 * @returns no contribution for other presets or Turns without teaching aids.
 */
export function TeachingAids({ turn, useSessions, sessionId, useChat, t }) {
    const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset);
    const snapshot = useChat(value => value);
    const aids = snapshot.locations.getTurn(turn.turn).flatMap(key => {
        const node = snapshot.nodes.get(key);
        return node?.kind === 'tool-call' ? results(node.data.root) : [];
    });
    if (preset !== 'student' || !aids.length)
        return null;
    return _jsxs("section", { className: "student-teaching-aids", "aria-label": t('teachingAids'), children: [_jsx("h3", { children: t('teachingAids') }), _jsx("p", { children: t('teachingAidsHelp') }), aids.map((block, index) => _jsxs("button", { type: "button", onClick: event => revealAid(event.currentTarget, block.callId), children: [t('openTeachingAid'), aids.length > 1 ? ` ${index + 1}` : ''] }, block.callId))] });
}
/**
 * Register discovery in the existing completed-reply surface.
 * @param context - native conversation and slot services.
 */
export function registerTeachingAids(context) {
    context.slots.inject('conversation.chat.turnTail', () => context.slots.register({
        name: 'conversation.chat.turnTail', id: 'student-teaching-aids', order: 24, locale: NS,
    }, TeachingAids));
}
//# sourceMappingURL=teaching-aids.js.map