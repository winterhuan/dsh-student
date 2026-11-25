/** Session projection owns domain-mode availability, including blank-session selections. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent-preset-registry/types'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Read the selected preset from the current Session list, failing closed while unknown.
 * @param context - browser Session services.
 * @param sessionId - Session to inspect.
 * @returns whether this Session uses the domain preset.
 */
export function isModeSession(context: Context, sessionId: SessionId | undefined): boolean {
  return sessionId !== undefined && context.sessions.list.getSnapshot().byId[sessionId]?.projectionValues?.agentPreset === 'student'
}

/** Keep the domain guide entry visible only for the on-screen domain Session.
 * The tab body and its persisted store remain registered across Session switches.
 * @param context - browser Session and sidebar services.
 * @param definition - domain tab type with its guide entry.
 * @returns disposer for the subscriptions and current tab registration.
 */
export function registerModeTab(context: Context, definition: SidebarRightTabDefinition): () => void {
  const current = context.uiSession.adapter.current
  const opened = new Set<SessionId>()
  let openTimer: ReturnType<typeof setTimeout> | undefined
  let visible: boolean | undefined
  let release: (() => void) | undefined
  const sync = () => {
    const next = isModeSession(context, current.getSnapshot().key as SessionId | undefined)
    if (next !== visible) {
      visible = next
      release?.()
      release = context.sidebarRightTabs.register({ ...definition, guide: next ? definition.guide ?? [] : [] })
    }
    const mounted = context.sidebarRight.mounted.getSnapshot()
    if (next && mounted && mounted === current.getSnapshot().key && !opened.has(mounted)) {
      clearTimeout(openTimer)
      openTimer = setTimeout(() => {
        if (context.sidebarRight.mounted.getSnapshot() !== mounted || !isModeSession(context, mounted)) return
        opened.add(mounted)
        context.sidebarRight.openTab('student')
      }, 0)
    }
  }
  const stopCurrent = current.subscribe(sync)
  const stopSessions = context.sessions.list.subscribe(sync)
  const stopMounted = context.sidebarRight.mounted.subscribe(sync)
  sync()
  return () => { clearTimeout(openTimer); stopCurrent(); stopSessions(); stopMounted(); release?.() }
}
