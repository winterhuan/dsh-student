/** Exact consumed native input versions from one immutable Session observation. */
import { createHash } from 'node:crypto';
import { KNOWN_SESSION_EVENT_TYPES } from '@deepseek-ai/dsh-session';
import { canonical } from "./learning/shared.js";
/**
 * Replay the complete immutable prefix and identify native versions actually consumed in entered steps.
 * @param observation - caller-owned raw observation; this function does not retain or dispose it.
 * @returns bounded text context and exact shared native observations, or explicit unavailability.
 */
export function resolveNativeSources(observation) {
    const cut = { sessionId: observation.header.id, cursor: observation.cursor, source: observation.source, inheritedEventCount: observation.inheritedEventCount, ...(observation.revision === undefined ? {} : { revision: observation.revision }) };
    const unavailable = (reason) => ({ status: 'unavailable', cut, inputs: [], admissions: [], observations: [], omitted: 0, omittedAdmissions: 0, reason });
    if (observation.cursor !== observation.events.length - 1)
        return unavailable('Session cut is incomplete.');
    if (observation.events.length > 100_000)
        return unavailable('Native source replay exceeds 100000 events.');
    let replayBytes = 0;
    const pending = { 'next-turn': [], 'next-step': [] };
    const seen = new Set();
    let claims = [];
    let sealed = [];
    let turn;
    let entered = false;
    let claimWindow = false;
    let firstStep = false;
    const claimTargets = new Set();
    const inputs = [];
    const observations = [];
    const admissions = [];
    for (const [seq, event] of observation.events.entries()) {
        replayBytes += Buffer.byteLength(JSON.stringify(event));
        if (replayBytes > 16_777_216)
            return unavailable('Native source replay exceeds 16 MiB.');
        if (event.seq !== seq)
            return unavailable('Session events are not contiguous.');
        if (!event.ignorable && !KNOWN_SESSION_EVENT_TYPES.has(event.type))
            return unavailable('Native source replay contains an unsupported required event.');
        switch (event.type) {
            case 'agent/inbox/spliced': {
                const { target, start, removedCount = 0, inserted, outcome } = event.data;
                if (!Number.isSafeInteger(start) || !Number.isSafeInteger(removedCount) || start < 0 || removedCount < 0 || start > pending[target].length || start + removedCount > pending[target].length)
                    return unavailable('Invalid inbox splice coordinates.');
                const removed = pending[target].slice(start, start + removedCount);
                const slots = inserted.map(message => {
                    const previous = removed.find(slot => slot.message.id === message.id);
                    let receipt = { kind: 'unknown', reason: 'Previously used ID has no continuous snapshot.' };
                    if (!seen.has(message.id))
                        receipt = { kind: 'known', at: event.time, seq: event.seq };
                    else if (previous && canonical(previous.message) === canonical(message))
                        receipt = previous.receipt;
                    else if (previous && removed.length === 1 && inserted.length === 1 && canonical(previous.message.source) === canonical(message.source))
                        receipt = { kind: 'known', at: event.time, seq: event.seq };
                    seen.add(message.id);
                    if (event.seq < observation.inheritedEventCount)
                        receipt = { kind: 'unknown', reason: 'Inherited input has no independently observed original Session.' };
                    const admission = event.seq < observation.inheritedEventCount || message.source.kind !== 'user' ? undefined : previous?.admission ?? { messageId: message.id, ...('rpcId' in message.source ? { requestId: message.source.rpcId } : {}), status: 'pending' };
                    if (admission && !previous?.admission)
                        admissions.push(admission);
                    return { message, receipt, ...(admission ? { admission } : {}) };
                });
                pending[target].splice(start, removedCount, ...slots);
                const ids = [...pending['next-turn'], ...pending['next-step']].map(slot => slot.message.id);
                if (new Set(ids).size !== ids.length)
                    return unavailable('Duplicate pending message ID.');
                if (outcome === undefined && inserted.length === 0 && removed.length > 0 && claimWindow && start === 0 && !claimTargets.has(target) && (target === 'next-step' ? removedCount === removed.length && pending[target].length === 0 : firstStep && removedCount === 1)) {
                    claims.push(...removed);
                    for (const slot of removed)
                        if (slot.admission)
                            slot.admission.status = 'claimed';
                    claimTargets.add(target);
                }
                else
                    for (const slot of removed)
                        if (slot.admission && !slots.some(current => current.admission === slot.admission))
                            slot.admission.status = 'removed';
                break;
            }
            case 'turn/start':
                turn = event.data.turn;
                firstStep = true;
                claimWindow = true;
                claims = [];
                sealed = [];
                entered = false;
                claimTargets.clear();
                break;
            case 'step/start':
                sealed = event.data.turn === turn && claimWindow ? claims : [];
                claims = [];
                entered = true;
                claimWindow = false;
                firstStep = false;
                break;
            case 'user/message': {
                const message = event.data;
                if (message.source.kind !== 'user')
                    break;
                const matches = sealed.flatMap((slot, index) => canonical(slot.message) === canonical(message) ? [index] : []);
                const match = matches.length === 1 && entered && event.surfaceOp === 'append' ? matches[0] : -1;
                const consumed = match < 0 ? undefined : sealed.splice(match, 1)[0];
                if (consumed?.admission)
                    consumed.admission.status = 'consumed';
                const receipt = event.seq < observation.inheritedEventCount ? { kind: 'unknown', reason: 'Inherited consumption is not new input in this Session.' } : consumed?.receipt ?? { kind: 'unknown', reason: 'No exact claim in the entered step.' };
                const inputVersion = `dsh-native-v1:${createHash('sha256').update(canonical({ algorithm: 'dsh-native-v1', sessionId: cut.sessionId, consumedSeq: event.seq, message })).digest('hex')}`;
                const text = message.content.filter(block => block.type === 'text').map(block => block.text).join('');
                const rawResponse = text.length > 0 && text.length <= 2000 ? text : undefined;
                const attachments = message.content.flatMap(block => block.type === 'image' || block.type === 'file' ? [{ kind: block.type, attachmentId: block.attachment.attachmentId }] : []);
                const input = { status: 'consumed', messageId: message.id, inputVersion, consumedSeq: event.seq, ...(rawResponse === undefined ? { textUnavailable: 'Exact native text is empty or exceeds 2000 characters.' } : { rawResponse }), receipt, ...('rpcId' in message.source ? { requestId: message.source.rpcId } : {}), attachments: attachments.slice(0, 8), omittedAttachments: Math.max(0, attachments.length - 8) };
                inputs.push(input);
                if (receipt.kind === 'known' && rawResponse !== undefined)
                    observations.push({ sessionId: cut.sessionId, messageId: message.id, inputVersion, rawResponse, receiptAt: receipt.at });
                break;
            }
            case 'step/end':
                claims = [];
                sealed = [];
                entered = false;
                claimWindow = true;
                claimTargets.clear();
                break;
            case 'turn/end':
                claims = [];
                sealed = [];
                entered = false;
                claimWindow = false;
                turn = undefined;
                break;
            default: break;
        }
    }
    const bounded = inputs.slice(-20);
    const boundedAdmissions = admissions.slice(-20);
    const view = () => ({ status: 'available', cut, inputs: bounded, admissions: boundedAdmissions, omitted: inputs.length - bounded.length, omittedAdmissions: admissions.length - boundedAdmissions.length });
    while (Buffer.byteLength(JSON.stringify(view())) > 32_768 && (bounded.length || boundedAdmissions.length)) {
        if (bounded.length)
            bounded.shift();
        else
            boundedAdmissions.shift();
    }
    return { ...view(), observations };
}
//# sourceMappingURL=native-source.js.map