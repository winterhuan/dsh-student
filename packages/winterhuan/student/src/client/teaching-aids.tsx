/** Discover official teaching aids beside the reply, using their original keyed views. */
import type { Context } from '@deepseek-ai/cordis'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChatNode, ToolCallBlock, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import { NS } from './locales.ts'

type Props = PropsRuntime<'conversation.chat.turnTail'> & PropsLocale<typeof NS>
const aidNames = new Set(['openmaic_widget', 'openmaic_slide', 'openmaic_render'])
function results(block: ToolCallBlock): ToolResultNode[] {
  const own = 'kind' in block && !block.isError && aidNames.has(block.call?.name ?? block.name) ? [block] : []
  return [...own, ...block.subCalls.flatMap(results)]
}
function revealAid(button: HTMLButtonElement, callId: string) {
  const flow = button.closest('[data-chat-flow]')
  const target = [...(flow?.querySelectorAll<HTMLElement>('[data-chat-call-id]') ?? [])].find(element => element.dataset.chatCallId === callId)
  if (!target) return
  // DSH keeps folded process bodies mounted and exposes them through beforematch.
  target.dispatchEvent(new Event('beforematch', { bubbles: true }))
  requestAnimationFrame(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }))
}

/**
 * Find a Turn's official teaching results and link to their original views.
 * @param props - native Session hooks, Turn identity and original tool dispatch.
 * @returns no contribution for other presets or Turns without teaching aids.
 */
export function TeachingAids({ turn, useSessions, sessionId, useChat, t }: Props) {
  const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset)
  const snapshot = useChat(value => value)
  const aids = snapshot.locations.getTurn(turn.turn).flatMap(key => {
    const node = snapshot.nodes.get(key)
    return node?.kind === 'tool-call' ? results((node as ChatNode<'tool-call'>).data.root) : []
  })
  if (preset !== 'student' || !aids.length) return null
  return <section className="student-teaching-aids" aria-label={t('teachingAids')}>
    <h3>{t('teachingAids')}</h3><p>{t('teachingAidsHelp')}</p>
    {aids.map((block, index) => <button type="button" key={block.callId} onClick={event => revealAid(event.currentTarget, block.callId)}>{t('openTeachingAid')}{aids.length > 1 ? ` ${index + 1}` : ''}</button>)}
  </section>
}

/**
 * Register discovery in the existing completed-reply surface.
 * @param context - native conversation and slot services.
 */
export function registerTeachingAids(context: Context): void {
  context.slots.inject('conversation.chat.turnTail', () => context.slots.register({
    name: 'conversation.chat.turnTail', id: 'student-teaching-aids', order: 24, locale: NS,
  }, TeachingAids))
}
