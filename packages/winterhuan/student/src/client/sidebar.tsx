import { registerModeTab } from './mode.ts'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { PropsLocale, PropsRuntime, PropsStore, PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
import { IconPlayOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useEffect } from 'react'
import { NS, zh, en } from './locales.ts'
import { tutorBridge, studentSessionBridge, type StudentSessionActions, type StudyPhoto } from './bridge.ts'
import { StudyDesk } from './desk.tsx'
import { registerTeachingAids } from './teaching-aids.tsx'
import { mountStudentResource } from './resource.ts'
import { createStudentDraftStore } from './drafts.tsx'
import { createStudentManualActions } from './manual-actions.ts'
import type { StudentSessionId } from '../types.ts'

export const name = 'student'
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs', 'sidebarRight', 'remote', 'resources', 'conversation']
function studentCallbacks(scope: Context) {
  const t = scope.locale.bind(NS)
  return {
    ...createStudentManualActions(scope.remote.student),
    sessionActions: (sessionId: StudentSessionId): StudentSessionActions => studentSessionBridge(scope, sessionId, t('sessionError')),
    openLesson: async (sessionId: StudentSessionId, lessonId: string) => { const result = await scope.remote.studentOpenmaicPlayback.open(sessionId, lessonId, new AbortController().signal); if (!result.ok) throw new Error(result.error.message); return result.value },
    askStudent: (sessionId: StudentSessionId, text: string, photo?: StudyPhoto) => tutorBridge(scope, sessionId, t('sessionError'), t('sendError'))(text, photo),
  }
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'student.desk': { kind: 'single'; scope: 'root'; owner: { sessionId: StudentSessionId; visible: boolean; running: boolean; pending: boolean } }
  }
}

type Props = PropsRuntime<'student.desk'> & PropsLocale<typeof NS> & PropsStore<ReturnType<typeof createStudentDraftStore>> & ReturnType<typeof studentCallbacks>

function Desk({ sessionId, visible, running, pending, useResource, t, useStore, actions, askStudent, saveSettings, saveWorksheet, inspectSubmission, openLesson, sessionActions }: Props) {
  return <StudyDesk key={sessionId} {...{ sessionId, visible, running, pending }} {...sessionActions(sessionId)} ask={(text, photo) => askStudent(sessionId, text, photo)} t={t} useResource={useResource} openLesson={lessonId => openLesson(sessionId, lessonId)} {...{ useStore, actions, saveSettings, saveWorksheet, inspectSubmission }} />
}

function Sidebar({ sessionId, useTabInfo, useSession, useSessions, renderSlot }: PropsRuntime<'sidebar.right.pane.tab'> & PropsRenderSlots<'student.desk'>) {
  const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset)
  const { tab } = useTabInfo()
  useEffect(() => { if (typeof preset === 'string' && preset !== 'student') tab.actions.close() }, [preset, tab.actions])
  const session = useSession(snapshot => snapshot)
  return preset === 'student' ? renderSlot('student.desk', { sessionId, visible: tab.visible, running: !!session.running, pending: session.pendingSubmissions.length > 0 || session.awaitingFirstTurn }) : null
}

/** Register the learning desk inside DSH's existing session sidebar. */
export async function apply(context: Context): Promise<void> {
  await mountStudentResource(context)
  context.effect(() => context.locale.register(NS, { zh, en }), 'student: dictionaries')
  registerTeachingAids(context)
  const t = context.locale.bind(NS)
  context.effect(() => registerModeTab(context, {
    id: '@winterhuan/dsh-student', kind: 'student', keepMounted: true, title: () => t('title'),
    guide: [{ id: 'student', order: 24, title: () => t('title'), description: () => t('description'), icon: IconPlayOutlineRegular }],
  }), 'student: sidebar')
  context.inject(['remote.student', 'remote.studentOpenmaicPlayback'], scope => {
    const store = createStudentDraftStore()
    scope.slots.inject('sidebar.right.pane.tab', () => scope.slots.register({ name: 'sidebar.right.pane.tab', key: '@winterhuan/dsh-student', children: { 'student.desk': { kind: 'single', scope: 'root' } } }, Sidebar))
    scope.slots.inject('student.desk', () => scope.slots.register({ name: 'student.desk', locale: NS, store, inject: () => studentCallbacks(scope) }, Desk))
  })
}
