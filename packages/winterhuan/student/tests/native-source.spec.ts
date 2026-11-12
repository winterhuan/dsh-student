import { expect, it } from 'vitest'
import { SESSION_FORMAT_VERSION, SessionId, SessionSeq, SessionLogOffset } from '@deepseek-ai/dsh-session'
import type { SessionEvent, SessionHeader } from '@deepseek-ai/dsh-session'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { resolveNativeSources } from '../src/native-source.ts'

const message = { ...createUserMessage({ source: { kind: 'user', rpcId: 'r' }, content: [{ type: 'text', text: '42' }] }), id: 'm' }
const header: SessionHeader = { version: SESSION_FORMAT_VERSION, id: SessionId('s'), createdAt: 1, isSeeded: false }
function consumed(): SessionEvent[] {
  return [
    { seq: SessionSeq(0), time: 10, type: 'agent/inbox/spliced', data: { target: 'next-turn', start: 0, inserted: [message] } },
    { seq: SessionSeq(1), time: 90, type: 'turn/start', data: { turn: 1 } },
    { seq: SessionSeq(2), time: 91, type: 'agent/inbox/spliced', data: { target: 'next-turn', start: 0, removedCount: 1, inserted: [] } },
    { seq: SessionSeq(3), time: 92, type: 'step/start', data: { turn: 1, step: 1 } },
    { seq: SessionSeq(4), time: 93, type: 'user/message', data: message, surfaceOp: 'append' },
    { seq: SessionSeq(5), time: 94, type: 'step/end', data: { turn: 1, step: 1 } },
    { seq: SessionSeq(6), time: 95, type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
  ]
}
function resolve(events: SessionEvent[]) {
  return resolveNativeSources({ header, events: events.map((event, seq) => ({ ...event, seq: SessionSeq(seq) })), cursor: SessionSeq(events.length - 1), inheritedEventCount: SessionLogOffset(0), source: 'live' })
}
function edit(text: string, time: number): SessionEvent {
  return { seq: SessionSeq(0), time, type: 'agent/inbox/spliced', data: { target: 'next-turn', start: 0, removedCount: 1, inserted: [{ ...message, content: [{ type: 'text', text }] }], outcome: 'canceled' } }
}
it('ties an exactly consumed native snapshot to its inbox receipt rather than consumption time', () => {
  const result = resolveNativeSources({ header, events: consumed(), cursor: SessionSeq(6), inheritedEventCount: SessionLogOffset(0), source: 'live' })
  expect(result).toMatchObject({ status: 'available', cut: { sessionId: 's', cursor: 6 }, inputs: [{ messageId: 'm', rawResponse: '42', status: 'consumed', receipt: { kind: 'known', at: 10, seq: 0 } }] })
  expect(result.observations).toMatchObject([{ sessionId: 's', messageId: 'm', rawResponse: '42', receiptAt: 10 }])
  expect(result.inputs[0]?.inputVersion).toBe('dsh-native-v1:52137722a24329b658d06a88ac2470a9e2a4355abf47d01c56899148e1cc580c')
  expect(result.admissions).toEqual([{ messageId: 'm', requestId: 'r', status: 'consumed' }])
})
it('distinguishes pending admission and claim from actually consumed native input at a pinned cut', () => {
  expect(resolve(consumed().slice(0, 1))).toMatchObject({ inputs: [], admissions: [{ requestId: 'r', status: 'pending' }] })
  expect(resolve(consumed().slice(0, 4))).toMatchObject({ inputs: [], admissions: [{ requestId: 'r', status: 'claimed' }] })
})
it('bounds emitted text context without truncating exact response observations or snapshot hashes', () => {
  const huge = consumed().map(event => event.type === 'user/message' ? { ...event, data: { ...message, content: [{ type: 'text' as const, text: 'x'.repeat(2001) }] } } : event.type === 'agent/inbox/spliced' && event.seq === 0 ? { ...event, data: { ...event.data, inserted: [{ ...message, content: [{ type: 'text' as const, text: 'x'.repeat(2001) }] }] } } : event)
  expect(resolve(huge).inputs[0]?.rawResponse).toBeUndefined()
  expect(resolve(huge).observations).toEqual([])
  const many = resolve(Array.from({ length: 25 }, (_, index) => consumed().map(event => event.type === 'user/message' ? { ...event, data: { ...event.data, id: `m-${index}` } } : event.type === 'agent/inbox/spliced' ? { ...event, data: { ...event.data, inserted: event.data.inserted.map(message => ({ ...message, id: `m-${index}` })) } } : event)).flat())
  expect(many.inputs).toHaveLength(20)
  expect(many.omitted).toBe(5)
  expect(many.observations).toHaveLength(25)
})
it('resolves edits and reversions from the continuous pending version, preserving byte-identical edits', () => {
  const original = consumed()
  expect(resolve([original[0]!, edit('43', 20), edit('42', 30), ...original.slice(1)]).inputs[0]?.receipt).toEqual({ kind: 'known', at: 30, seq: 2 })
  expect(resolve([original[0]!, edit('42', 20), ...original.slice(1)]).inputs[0]?.receipt).toEqual({ kind: 'known', at: 10, seq: 0 })
})
it('keeps separate removal and reinsertion ambiguous and never borrows an old same-ID receipt', () => {
  const original = consumed()
  const remove: SessionEvent = { seq: SessionSeq(0), time: 20, type: 'agent/inbox/spliced', data: { target: 'next-turn', start: 0, removedCount: 1, inserted: [], outcome: 'canceled' } }
  const result = resolve([original[0]!, remove, { ...original[0]!, time: 21 }, ...original.slice(1)])
  expect(result.inputs[0]?.receipt.kind).toBe('unknown')
  expect(result.observations).toEqual([])
  const reused = resolve([...original, ...original.map(event => ({ ...event, time: event.time + 100 }))])
  expect(reused.inputs.map(input => input.receipt.kind)).toEqual(['known', 'unknown'])
  expect(new Set(reused.inputs.map(input => input.inputVersion)).size).toBe(2)
})
it('requires a conforming claim sealed to an entered step and the exact appended full snapshot', () => {
  const original = consumed()
  expect(resolve(original.filter(event => event.type !== 'step/start')).inputs[0]?.receipt.kind).toBe('unknown')
  expect(resolve(original.map(event => event.type === 'user/message' ? { ...event, data: { ...message, content: [{ type: 'text', text: 'rewritten' }] } } : event)).inputs[0]?.receipt.kind).toBe('unknown')
  expect(resolve(original.map(event => event.type === 'user/message' ? { ...event, surfaceOp: 'replace' } : event)).inputs[0]?.receipt.kind).toBe('unknown')
  expect(resolve(original.filter(event => event.type !== 'user/message')).inputs).toEqual([])
})
it('refuses incomplete or invalid inbox replay and never attributes inherited input to the child', () => {
  const original = consumed()
  const observe = (events: SessionEvent[], inherited = 0) => resolveNativeSources({ header, events, cursor: SessionSeq(events.length - 1), inheritedEventCount: SessionLogOffset(inherited), source: 'live' })
  expect(observe(original.map((event, index) => index === 2 ? { ...event, seq: SessionSeq(8) } : event)).status).toBe('unavailable')
  expect(resolve(original.map(event => event.type === 'agent/inbox/spliced' && event.seq === 0 ? { ...event, data: { ...event.data, start: 1 } } : event)).status).toBe('unavailable')
  expect(resolve([original[0]!, original[0]!, ...original.slice(1)]).status).toBe('unavailable')
  expect(observe(original, 5).observations).toEqual([])
  expect(observe(original, 5).inputs[0]?.receipt.kind).toBe('unknown')
})
