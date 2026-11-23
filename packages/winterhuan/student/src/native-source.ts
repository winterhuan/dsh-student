/** Exact consumed native input versions from one immutable Session observation. */
import { z } from 'zod'
import { createHash } from 'node:crypto'
import type { UserMessage } from '@deepseek-ai/dsh-llm'
import { KNOWN_SESSION_EVENT_TYPES, pluginRecordOf } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type { SessionObservation } from '@deepseek-ai/dsh-session-query'
import type { NativeInputObservation } from './files/validation.ts'
import { canonical } from './learning/shared.ts'

/** Independently observed Session cut; it is separate from official-file versions. */
export interface NativeSourceCut { sessionId: string; cursor: number; source: 'live' | 'prepared'; inheritedEventCount: number; revision?: string }
/** Receipt time is known only for an exactly claimed and consumed continuous input version. */
export type NativeReceipt = { kind: 'known'; at: number; seq: number } | { kind: 'unknown'; reason: string }
/** Bounded consumed text context, with a version of the complete source and attachment snapshot. */
export interface NativeConsumedInput { status: 'consumed'; messageId: string; requestId?: string; inputVersion: string; consumedSeq: number; rawResponse?: string; textUnavailable?: string; receipt: NativeReceipt; learningScope?: NativeInputObservation['learningScope']; attachments: { kind: 'image' | 'file'; attachmentId: string }[]; omittedAttachments: number }
/** A logged inbox insertion establishes admission, while consumption and removal remain separate states. */
export interface NativeAdmission { messageId: string; requestId?: string; status: 'pending' | 'claimed' | 'consumed' | 'removed' }
/** Source reconstruction failure stops all independently trusted receipt observations. */
export interface NativeSourceContext { status: 'available' | 'unavailable'; cut?: NativeSourceCut; inputs: NativeConsumedInput[]; admissions: NativeAdmission[]; observations: NativeInputObservation[]; omitted: number; omittedAdmissions: number; reason?: string }
const learningScopeSchema = z.object({ learnerId: z.string().min(1), termId: z.string().min(1), blockId: z.string().min(1), questionId: z.string().min(1), responseId: z.string().min(1).optional() })
/** Log-only Host support; losing this record leaves ordinary native ownership unknown. */
export const nativeOwnerCaptureSchema = z.object({ sessionId: z.string().min(1), turn: z.number().int().nonnegative(), step: z.number().int().positive(), receiptSeq: z.number().int().nonnegative(), messageHash: z.string().regex(/^[a-f0-9]{64}$/u), scope: learningScopeSchema.omit({ responseId: true }), questionSnapshot: z.string().min(1).max(65_536), versions: z.array(z.object({ path: z.string(), targetKey: z.string(), version: z.string() })).length(2) })
type NativeOwnerCapture = z.infer<typeof nativeOwnerCaptureSchema>
declare module '@deepseek-ai/dsh-session/types' {
  interface PluginRecordMap { 'plugin:student/native-owner': NativeOwnerCapture }
}
/**
 * Fingerprint an immutable native input including its identity and attachments.
 * @param message - Complete originally inserted or consumed message.
 * @returns Stable hash for exact receipt and consumption matching.
 */
export function nativeMessageHash(message: UserMessage): string { return createHash('sha256').update(canonical(message)).digest('hex') }
function learningScope(text: string): NativeInputObservation['learningScope'] {
  const intention = /(?:^|\n)Student intention:\n([^\n]+)(?:\n|$)/u.exec(text)?.[1]
  if (!intention) return undefined
  try { const scope = learningScopeSchema.safeParse(JSON.parse(intention)); return scope.success ? { learnerId: scope.data.learnerId, termId: scope.data.termId, blockId: scope.data.blockId, questionId: scope.data.questionId, ...(scope.data.responseId ? { responseId: scope.data.responseId } : {}) } : undefined }
  catch { return undefined }
}
function panelAnswer(text: string, sessionId: string): { rawResponse: string; scope: NonNullable<NativeInputObservation['learningScope']> } | 'invalid' | undefined {
  if (!text.startsWith('请加载 study 技能。在当前原生会话处理下面的意图，')) return undefined
  if (Buffer.byteLength(text) > 32_768) return 'invalid'
  const lines = /^[^\n]+\nStudent intention:\n([^\n]+)\n([\s\S]*)$/u.exec(text)
  try {
    const intent = lines && z.object({ ...learningScopeSchema.shape, responseId: z.string().min(1), nativeSessionId: z.literal(sessionId), request: z.string(), operation: z.object({ action: z.literal('answer'), taskId: z.string().min(1), response: z.string().min(1).max(2000) }).passthrough() }).passthrough().safeParse(JSON.parse(lines[1]!))
    if (!intent || !intent.success || intent.data.request !== lines![2] || intent.data.operation.taskId !== intent.data.questionId) return 'invalid'
    const { learnerId, termId, blockId, questionId, responseId } = intent.data
    return { rawResponse: intent.data.operation.response, scope: { learnerId, termId, blockId, questionId, responseId } }
  } catch { return 'invalid' }
}
type Slot = { message: UserMessage; receipt: NativeReceipt; admission?: NativeAdmission; capture?: NativeOwnerCapture }

/**
 * Replay the complete immutable prefix and identify native versions actually consumed in entered steps.
 * @param observation - caller-owned raw observation; this function does not retain or dispose it.
 * @returns bounded text context and exact shared native observations, or explicit unavailability.
 */
export function resolveNativeSources(observation: Pick<SessionObservation, 'header' | 'events' | 'cursor' | 'source' | 'inheritedEventCount' | 'revision'>): NativeSourceContext {
  const cut: NativeSourceCut = { sessionId: observation.header.id, cursor: observation.cursor, source: observation.source, inheritedEventCount: observation.inheritedEventCount, ...(observation.revision === undefined ? {} : { revision: observation.revision }) }
  const unavailable = (reason: string): NativeSourceContext => ({ status: 'unavailable', cut, inputs: [], admissions: [], observations: [], omitted: 0, omittedAdmissions: 0, reason })
  if (observation.cursor !== observation.events.length - 1) return unavailable('Session cut is incomplete.')
  if (observation.events.length > 100_000) return unavailable('Native source replay exceeds 100000 events.')
  let replayBytes = 0
  const pending: Record<'next-turn' | 'next-step', Slot[]> = { 'next-turn': [], 'next-step': [] }
  const seen = new Set<string>()
  let claims: Slot[] = []
  let sealed: Slot[] = []
  let turn: number | undefined
  let entered = false
  let claimWindow = false
  let firstStep = false
  const claimTargets = new Set<string>()
  const inputs: NativeConsumedInput[] = []
  const observations: NativeInputObservation[] = []
  const admissions: NativeAdmission[] = []
  for (const [seq, event] of observation.events.entries()) {
    replayBytes += Buffer.byteLength(JSON.stringify(event))
    if (replayBytes > 16_777_216) return unavailable('Native source replay exceeds 16 MiB.')
    if (event.seq !== seq) return unavailable('Session events are not contiguous.')
    if (!event.ignorable && !KNOWN_SESSION_EVENT_TYPES.has(event.type)) return unavailable('Native source replay contains an unsupported required event.')
    const record = pluginRecordOf(event)
    if (record?.type === 'plugin:student/native-owner' && event.seq >= observation.inheritedEventCount && claimWindow && !entered) {
      const parsed = nativeOwnerCaptureSchema.safeParse(record.data)
      if (parsed.success && parsed.data.sessionId === cut.sessionId && parsed.data.turn === turn) {
        const slot = claims.find(slot => slot.receipt.kind === 'known' && slot.receipt.seq === parsed.data.receiptSeq && nativeMessageHash(slot.message) === parsed.data.messageHash)
        if (slot && !slot.capture) slot.capture = parsed.data
      }
    }
    switch (event.type) {
      case 'agent/inbox/spliced': {
        const { target, start, removedCount = 0, inserted, outcome } = event.data
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(removedCount) || start < 0 || removedCount < 0 || start > pending[target].length || start + removedCount > pending[target].length) return unavailable('Invalid inbox splice coordinates.')
        const removed = pending[target].slice(start, start + removedCount)
        const slots = inserted.map(message => {
          const previous = removed.find(slot => slot.message.id === message.id)
          let receipt: NativeReceipt = { kind: 'unknown', reason: 'Previously used ID has no continuous snapshot.' }
          if (!seen.has(message.id)) receipt = { kind: 'known', at: event.time, seq: event.seq }
          else if (previous && canonical(previous.message) === canonical(message)) receipt = previous.receipt
          else if (previous && removed.length === 1 && inserted.length === 1 && canonical(previous.message.source) === canonical(message.source)) receipt = { kind: 'known', at: event.time, seq: event.seq }
          seen.add(message.id)
          if (event.seq < observation.inheritedEventCount) receipt = { kind: 'unknown', reason: 'Inherited input has no independently observed original Session.' }
          const admission = event.seq < observation.inheritedEventCount || message.source.kind !== 'user' ? undefined : previous?.admission ?? { messageId: message.id, ...('rpcId' in message.source ? { requestId: message.source.rpcId } : {}), status: 'pending' as const }
          if (admission && !previous?.admission) admissions.push(admission)
          return { message, receipt, ...(admission ? { admission } : {}) }
        })
        pending[target].splice(start, removedCount, ...slots)
        const ids = [...pending['next-turn'], ...pending['next-step']].map(slot => slot.message.id)
        if (new Set(ids).size !== ids.length) return unavailable('Duplicate pending message ID.')
        if (outcome === undefined && inserted.length === 0 && removed.length > 0 && claimWindow && start === 0 && !claimTargets.has(target) && (target === 'next-step' ? removedCount === removed.length && pending[target].length === 0 : firstStep && removedCount === 1)) {
          claims.push(...removed)
          for (const slot of removed) if (slot.admission) slot.admission.status = 'claimed'
          claimTargets.add(target)
        } else for (const slot of removed) if (slot.admission && !slots.some(current => current.admission === slot.admission)) slot.admission.status = 'removed'
        break
      }
      case 'turn/start': turn = event.data.turn; firstStep = true; claimWindow = true; claims = []; sealed = []; entered = false; claimTargets.clear(); break
      case 'step/start':
        sealed = event.data.turn === turn && claimWindow ? claims : []
        for (const slot of sealed) if (slot.capture?.step !== event.data.step) delete slot.capture
        claims = []; entered = true; claimWindow = false; firstStep = false
        break
      case 'user/message': {
        const message = event.data
        if (message.source.kind !== 'user') break
        const matches = sealed.flatMap((slot, index) => canonical(slot.message) === canonical(message) ? [index] : [])
        const match = matches.length === 1 && entered && event.surfaceOp === 'append' ? matches[0]! : -1
        const consumed = match < 0 ? undefined : sealed.splice(match, 1)[0]!
        if (consumed?.admission) consumed.admission.status = 'consumed'
        const receipt: NativeReceipt = event.seq < observation.inheritedEventCount ? { kind: 'unknown', reason: 'Inherited consumption is not new input in this Session.' } : consumed?.receipt ?? { kind: 'unknown', reason: 'No exact claim in the entered step.' }
        const inputVersion = `dsh-native-v1:${createHash('sha256').update(canonical({ algorithm: 'dsh-native-v1', sessionId: cut.sessionId, consumedSeq: event.seq, message })).digest('hex')}`
        const text = message.content.filter(block => block.type === 'text').map(block => block.text).join('')
        const panel = panelAnswer(text, cut.sessionId)
        const rawResponse = panel === 'invalid' ? undefined : panel?.rawResponse ?? (text.length > 0 && text.length <= 2000 ? text : undefined)
        const attachments = message.content.flatMap(block => block.type === 'image' || block.type === 'file' ? [{ kind: block.type, attachmentId: block.attachment.attachmentId }] : [])
        const explicitScope = panel && panel !== 'invalid' ? panel.scope : rawResponse === undefined ? undefined : learningScope(rawResponse)
        const captured = panel === undefined && !explicitScope && !/Student (?:intention|grading correction):/u.test(text) ? consumed?.capture : undefined
        const originalScope = explicitScope ?? (captured ? { ...captured.scope, responseId: `native_${inputVersion.slice('dsh-native-v1:'.length)}` } : undefined)
        const input: NativeConsumedInput = { status: 'consumed', messageId: message.id, inputVersion, consumedSeq: event.seq, ...(rawResponse === undefined ? { textUnavailable: 'Exact native text is empty or exceeds 2000 characters.' } : { rawResponse }), receipt, ...(originalScope ? { learningScope: originalScope } : {}), ...('rpcId' in message.source ? { requestId: message.source.rpcId } : {}), attachments: attachments.slice(0, 8), omittedAttachments: Math.max(0, attachments.length - 8) }
        inputs.push(input)
        if (receipt.kind === 'known' && rawResponse !== undefined) observations.push({ sessionId: cut.sessionId, messageId: message.id, inputVersion, rawResponse, receiptAt: receipt.at, ...(originalScope ? { learningScope: originalScope } : {}), ...(captured ? { questionSnapshot: captured.questionSnapshot } : {}) })
        // Previously saved short panel envelopes retain their exact input reference during answer extraction.
        if (receipt.kind === 'known' && panel && panel !== 'invalid' && text.length <= 2000) observations.push({ sessionId: cut.sessionId, messageId: message.id, inputVersion, rawResponse: text, receiptAt: receipt.at, learningScope: panel.scope })
        break
      }
      case 'step/end': claims = []; sealed = []; entered = false; claimWindow = true; claimTargets.clear(); break
      case 'turn/end': claims = []; sealed = []; entered = false; claimWindow = false; turn = undefined; break
      default: break
    }
  }
  const bounded = inputs.slice(-20)
  const boundedAdmissions = admissions.slice(-20)
  const view = () => ({ status: 'available' as const, cut, inputs: bounded, admissions: boundedAdmissions, omitted: inputs.length - bounded.length, omittedAdmissions: admissions.length - boundedAdmissions.length })
  while (Buffer.byteLength(JSON.stringify(view())) > 32_768 && (bounded.length || boundedAdmissions.length)) { if (bounded.length) bounded.shift(); else boundedAdmissions.shift() }
  return { ...view(), observations }
}
