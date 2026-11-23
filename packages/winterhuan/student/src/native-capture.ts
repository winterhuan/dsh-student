/** Receipt-time ownership is support metadata; the agent still authors all academic records. */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { appendPluginRecord } from '@deepseek-ai/dsh-session'
import { applicationStudyFiles } from './files/application.ts'
import { readWorkspace, type WorkspaceRead } from './files/read.ts'
import { canonical } from './learning/shared.ts'
import { nativeMessageHash, nativeOwnerCaptureSchema } from './native-source.ts'
import type { z } from 'zod'

type Snapshot = Pick<z.infer<typeof nativeOwnerCaptureSchema>, 'scope' | 'questionSnapshot' | 'versions'>
type Admission = { snapshot: Snapshot; messageHash: string; sourceSnapshot: string; receiptSeq: number }
const owners = new WeakMap<Agent, Snapshot>()

/**
 * Cache a complete independent owner publication before later user receipt.
 * @param agent - Owning main native Agent.
 * @param read - Independently read files with observed versions.
 * @returns Frozen owner and question when complete; otherwise removes cached ownership.
 */
export function rememberNativeOwner(agent: Agent, read: WorkspaceRead): Snapshot | undefined {
  owners.delete(agent)
  const workspace = read.status === 'valid' ? read.workspace : undefined
  const block = workspace?.blocks.find(block => block.endedAt === undefined)
  const question = block?.questions.find(question => question.id === block.currentQuestionId)
  if (!workspace?.settings.learnerId || !block?.learnerId || !question || agent.session.header.parentSession || agent.session.header.origin === 'subagent') return undefined
  const paths = ['.study/settings.json', `.study/blocks/${block.id}.json`]
  const versions = read.files.filter(file => paths.includes(file.path) && file.targetKey && file.version).map(file => ({ path: file.path, targetKey: file.targetKey!, version: file.version! }))
  const snapshot = { scope: { learnerId: block.learnerId, termId: block.termId, blockId: block.id, questionId: question.id }, questionSnapshot: canonical(question), versions }
  if (versions.length !== 2 || snapshot.questionSnapshot.length > 65_536) return undefined
  owners.set(agent, snapshot)
  return snapshot
}
async function refresh(agent: Agent, signal: AbortSignal): Promise<Snapshot | undefined> {
  if (!agent.session.header.cwd || !agent.ctx.get('fs') || !agent.ctx.get('sandboxPolicy')) { owners.delete(agent); return undefined }
  let read: WorkspaceRead
  try { read = await readWorkspace(applicationStudyFiles({ agent, signal }), signal) }
  catch (error) { owners.delete(agent); if (signal.aborted) throw error; return undefined }
  signal.throwIfAborted()
  return rememberNativeOwner(agent, read)
}
/**
 * Freeze the cached owner at inbox insertion and recheck it after downstream admission hooks.
 * @param context - Student preset lifetime and native Agent events.
 */
export function registerNativeCapture(context: Context): void {
  const admissions = new WeakMap<Agent, Map<string, Admission>>()
  const seen = new Set<Agent>()
  context.effect(() => () => { for (const agent of seen) owners.delete(agent); seen.clear() })
  context.on('agent/created', async ({ agent, signal }) => { seen.add(agent); await refresh(agent, signal ?? AbortSignal.timeout(30_000)); return undefined })
  context.on('agent/inbox/discarded', ({ agent, message }) => {
    const splice = agent.session.snapshotEvents().at(-1)
    if (splice?.type !== 'agent/inbox/spliced' || splice.data.inserted.length !== 1 || splice.data.inserted[0]?.id !== message.id) admissions.get(agent)?.delete(message.id)
  })
  context.on('agent/inbox/inserted', ({ agent, message }) => {
    if (message.source.kind !== 'user') return
    const splice = agent.session.snapshotEvents().at(-1)
    if (splice?.type !== 'agent/inbox/spliced') return
    let pending = admissions.get(agent)
    if (!pending) { pending = new Map(); admissions.set(agent, pending) }
    const previous = pending.get(message.id)
    const messageHash = nativeMessageHash(message)
    const continuous = previous && splice.data.removedCount === 1 && splice.data.inserted.length === 1 && previous.sourceSnapshot === canonical(message.source)
    const snapshot = continuous ? previous.snapshot : agent.status === 'idle' ? owners.get(agent) : undefined
    pending.delete(message.id)
    if (snapshot) {
      if (pending.size >= 20) pending.delete(pending.keys().next().value!)
      pending.set(message.id, { snapshot, messageHash, sourceSnapshot: canonical(message.source), receiptSeq: continuous && previous.messageHash === messageHash ? previous.receiptSeq : splice.seq })
    }
    seen.add(agent)
  })
  context.on('agent/pre-step', async ({ agent, messages, turn, step, signal }, next) => {
    const users = messages.filter(message => message.source.kind === 'user')
    const original = users.length === 1 ? users[0] : undefined
    const admitted = original ? admissions.get(agent)?.get(original.id) : undefined
    for (const message of users) admissions.get(agent)?.delete(message.id)
    const decision = await next()
    if (decision.kind !== 'enter') return decision
    const current = await refresh(agent, signal)
    if (original && admitted && nativeMessageHash(original) === admitted.messageHash && decision.messages.filter(message => nativeMessageHash(message) === admitted.messageHash).length === 1 && canonical(current) === canonical(admitted.snapshot)) {
      signal.throwIfAborted()
      appendPluginRecord(agent.session, 'plugin:student/native-owner', { ...admitted.snapshot, sessionId: agent.session.id, turn, step, receiptSeq: admitted.receiptSeq, messageHash: admitted.messageHash })
    }
    return decision
  })
}
