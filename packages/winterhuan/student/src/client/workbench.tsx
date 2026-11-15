/** Global learning workbench and its retained native tutoring conversation. */
import type { Context } from '@deepseek-ai/cordis'
import { createSnapshotStore, defineStore, type ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { InjectFace, PropsLocale, PropsRenderFactories, PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { IconPlayOutlineRegular, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { useEffect, useState } from 'react'
import { tutorBridge, type AskTutor } from './bridge.ts'
import { StudyDesk } from './desk.tsx'
import { createStudentDraftStore, type DraftProps } from './drafts.tsx'
import { createStudentManualActions, type StudentManualActions } from './manual-actions.ts'
import { NS } from './locales.ts'
import css from './workbench.module.css'

const sessionSlot = 'student.workbench.session'
declare module '@deepseek-ai/dsh-api-session-controller/client' {
  interface SessionReferenceSourceMap { studentWorkbench: true }
}
type WorkbenchState = { workspaceId: string; sessionId: string; chatVisible: boolean }

/** Create browser preferences independent of learning records.
 * @returns a registration-owned store persisting workspace, conversation and assistant visibility.
 */
export function createWorkbenchStore() {
  return defineStore({
    init: (): WorkbenchState => ({ workspaceId: '', sessionId: '', chatVisible: true }),
    persist: 'dsh.student.workbench.v1',
    actions: {
      selectWorkspace: (draft, id: WorkspaceId) => { draft.workspaceId = id; draft.sessionId = '' },
      selectSession: (draft, id: SessionId) => { draft.sessionId = id },
      toggleChat: draft => { draft.chatVisible = !draft.chatVisible },
    },
  })
}

type WorkbenchInjected = {
  retainSession: (id: SessionId) => SessionReference
  createSession: (workspaceId: WorkspaceId) => Promise<SessionId>
  openSession: (id: SessionId) => void
  reportCreate: (success: boolean) => void
}
type Notice = { success: boolean; sequence: number }
type NoticeInjected = { hooks: { notice: ObservableSnapshot<Notice | null> }; dismissNotice: () => void }
type SessionInjected = { ask: AskTutor } & StudentManualActions
type SessionOwner = { chatVisible: boolean }
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'student.workbench.session': { kind: 'single'; scope: 'session'; owner: SessionOwner }
  }
}
type WorkbenchProps = PropsRuntime<'main'> & PropsRenderSlots<typeof sessionSlot> & PropsStore<ReturnType<typeof createWorkbenchStore>> & PropsLocale<typeof NS> & WorkbenchInjected
type SessionProps = PropsRuntime<typeof sessionSlot> & PropsRenderFactories & PropsLocale<typeof NS> & DraftProps & SessionInjected

/** Select live main Student conversations within one learner workspace.
 * @param props - framework catalogs, preferences and native Session callbacks.
 * @returns the global workbench with the selected Session's learning and chat panels.
 */
export function Workbench({ useSessions, useWorkspaces, useStore, actions, retainSession, createSession, openSession, reportCreate, SessionProvider, renderSlot, t }: WorkbenchProps) {
  const catalog = useSessions(state => state)
  const workspaces = useWorkspaces(state => state)
  const preferences = useStore(state => state)
  const [creating, setCreating] = useState(false)
  const remembered = workspaces.items.find(item => item.sessionIds.some(id => id === preferences.sessionId))
  const workspace = workspaces.items.find(item => item.workspaceId === preferences.workspaceId) ?? remembered ?? workspaces.items.find(item => item.sessionIds.some(id => catalog.byId[id]?.projectionValues?.agentPreset === 'student')) ?? workspaces.items[0]
  const sessions = (workspace?.sessionIds ?? []).flatMap(id => {
    const row = catalog.byId[id]
    return row && catalog.ids.includes(id) && row.projectionValues?.agentPreset === 'student' && !row.parentId && row.origin !== 'subagent' && !workspaces.archivedSessionIds.includes(id) ? [row] : []
  }).sort((a, b) => b.updatedAt - a.updatedAt)
  const selected = sessions.find(item => item.id === preferences.sessionId) ?? sessions[0]
  const sessionId = selected?.id
  const pending = catalog.phase !== 'ready' || workspaces.phase !== 'ready'
  async function create() {
    if (!workspace || creating) return
    setCreating(true)
    try {
      const id = await createSession(workspace.workspaceId)
      actions.selectWorkspace(workspace.workspaceId)
      actions.selectSession(id)
      reportCreate(true)
    } catch { reportCreate(false) }
    finally { setCreating(false) }
  }
  return <div className={css.workbench}>
    <header className={css.header}>
      <div className={css.heading}><h1>{t('title')}</h1><p>{t('workbenchHelp')}</p></div>
      <div className={css.controls}>
        <label>{t('learnerWorkspace')}<select value={workspace?.workspaceId ?? ''} disabled={pending || creating} onChange={event => {
          const next = workspaces.items.find(item => item.workspaceId === event.target.value)
          if (next) actions.selectWorkspace(next.workspaceId)
        }}>{workspaces.items.map(item => <option key={item.workspaceId} value={item.workspaceId}>{item.title}</option>)}</select></label>
        <label>{t('learningConversation')}<select value={sessionId ?? ''} disabled={pending || creating || !sessions.length} onChange={event => {
          const next = sessions.find(item => item.id === event.target.value)
          if (next) actions.selectSession(next.id)
        }}>{!sessions.length && <option value="">{t('noLearningConversation')}</option>}{sessions.map(item => <option key={item.id} value={item.id}>{item.displayTitle}</option>)}</select></label>
        <button type="button" disabled={pending || creating || !workspace} onClick={() => { void create() }}>{t('newLearningConversation')}</button>
        {sessionId && <button type="button" onClick={() => openSession(sessionId)}>{t('openConversation')}</button>}
        {sessionId && <button type="button" aria-pressed={preferences.chatVisible} onClick={actions.toggleChat}>{t(preferences.chatVisible ? 'hideTutor' : 'showTutor')}</button>}
      </div>
    </header>
    {pending ? <Loading /> : !workspace ? <div className={css.empty}><p>{t('noLearnerWorkspace')}</p></div> : !sessionId ? <div className={css.empty}><h2>{t('welcomeWorkbench')}</h2><p>{t('createLearningHelp')}</p></div> : <SelectedSession key={sessionId} sessionId={sessionId} chatVisible={preferences.chatVisible} retainSession={retainSession} SessionProvider={SessionProvider} renderSlot={renderSlot} t={t} />}
  </div>
}
function Loading() { return <div className={css.empty} aria-busy="true"><span className={css.spinner} /></div> }
function SelectedSession({ sessionId, chatVisible, retainSession, SessionProvider, renderSlot, t }: Pick<WorkbenchProps, 'retainSession' | 'SessionProvider' | 'renderSlot' | 't'> & { sessionId: SessionId; chatVisible: boolean }) {
  const [binding, setBinding] = useState<SessionReference | null>(null)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let alive = true
    const reference = retainSession(sessionId)
    void reference.ready.then(() => { if (alive) setBinding(reference) }).catch(() => { if (alive) setFailed(true) })
    return () => { alive = false; reference.release() }
  }, [sessionId, retainSession, retry])
  if (failed) return <div className={css.empty}><p role="alert">{t('openConversationError')}</p><button type="button" onClick={() => { setFailed(false); setBinding(null); setRetry(value => value + 1) }}>{t('reload')}</button></div>
  return binding ? <SessionProvider session={binding}>{renderSlot(sessionSlot, { chatVisible })}</SessionProvider> : <Loading />
}
function LearningSession({ sessionId, chatVisible, ask, useSession, useConversation, renderFactorySlot, useResource, useStore, actions, saveSettings, saveWorksheet, inspectSubmission, t }: SessionProps) {
  const session = useSession(state => state)
  const conversation = useConversation(state => state)
  const settling = session.openState === 'loading' && !conversation.activeTargets.size
  return <div className={`${css.body} ${chatVisible ? css.withChat : ''}`}>
    <div className={css.study}><StudyDesk sessionId={sessionId} visible={true} running={!!session.running} ask={ask} t={t} useResource={useResource} {...{ useStore, actions, saveSettings, saveWorksheet, inspectSubmission }} /></div>
    {chatVisible && <aside className={css.chat} aria-label={t('tutorConversation')}><h2>{t('tutorConversation')}</h2>{renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : 'active', hero: false })}</aside>}
  </div>
}
function PanelIcon({ size }: PropsRuntime<'sidebar.panellist'>) { return <IconPlayOutlineRegular size={size} /> }
function WorkbenchNotice({ useNotice, dismissNotice, t }: InjectFace<NoticeInjected> & PropsLocale<typeof NS>) {
  const notice = useNotice(value => value)
  return notice ? <Toast key={notice.sequence} text={t(notice.success ? 'createdLearningConversation' : 'createConversationError')} {...(notice.success ? { tone: 'success' as const } : {})} onDone={dismissNotice} /> : null
}

/** Register the global entry and its strict Session child through native services.
 * @param context - mounted Student client services.
 * @param draftStore - shared learning-form drafts for both workbench and sidebar.
 */
export function registerWorkbench(context: Context, draftStore: ReturnType<typeof createStudentDraftStore>): void {
  const t = context.locale.bind(NS)
  const notice = createSnapshotStore<Notice | null>(null)
  let sequence = 0
  context.slots.inject('main', () => context.slots.register({
    name: 'main', key: 'student', locale: NS, store: createWorkbenchStore(),
    children: { [sessionSlot]: { kind: 'single', scope: 'session' } },
    inject: (): WorkbenchInjected => ({
      retainSession: id => context.sessions.retain(id, { source: 'studentWorkbench' }),
      createSession: workspaceId => context.sessions.create({ workspaceId, agentPreset: 'student' }),
      openSession: id => { context.uiWorkspace.openSession(id) },
      reportCreate: success => { notice.set({ success, sequence: ++sequence }) },
    }),
  }, Workbench))
  context.slots.inject(sessionSlot, () => context.slots.register({ name: sessionSlot, locale: NS, store: draftStore,
    inject: (sessionId: SessionId): SessionInjected => ({ ask: tutorBridge(context, sessionId, t('sessionError'), t('sendError')), ...createStudentManualActions(context.remote.student) }),
  }, LearningSession))
  context.slots.inject('sidebar.panellist', () => context.slots.register({ name: 'sidebar.panellist', id: 'student', order: 6, locale: NS, label: () => t('title') }, PanelIcon))
  context.slots.inject('shell.overlay', () => context.slots.register({ name: 'shell.overlay', id: 'student.workbench.notice', locale: NS,
    inject: (): NoticeInjected => ({ hooks: { notice }, dismissNotice: () => { notice.set(null) } }),
  }, WorkbenchNotice))
}
