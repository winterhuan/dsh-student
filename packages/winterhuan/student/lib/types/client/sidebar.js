import { jsx as _jsx } from "react/jsx-runtime";
import { registerModeTab } from "./mode.js";
import { IconPlayOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { useEffect } from 'react';
import { NS, zh, en } from "./locales.js";
import { tutorBridge } from "./bridge.js";
import { StudyDesk } from "./desk.js";
import { mountStudentResource } from "./resource.js";
import { createStudentDraftStore } from "./drafts.js";
import { createStudentManualActions } from "./manual-actions.js";
export const name = 'student';
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs', 'remote', 'resources'];
function studentCallbacks(scope) {
    const t = scope.locale.bind(NS);
    return {
        ...createStudentManualActions(scope.remote.student),
        askStudent: (sessionId, text, photo) => tutorBridge(scope, sessionId, t('sessionError'), t('sendError'))(text, photo),
    };
}
function Sidebar({ sessionId, useTabInfo, useSession, useSessions, useResource, t, useStore, actions, askStudent, saveSettings, saveWorksheet, inspectSubmission }) {
    const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset);
    const { tab } = useTabInfo();
    useEffect(() => { if (typeof preset === 'string' && preset !== 'student')
        tab.actions.close(); }, [preset, tab.actions]);
    const running = useSession(snapshot => snapshot.running);
    if (preset !== 'student')
        return null;
    return _jsx(StudyDesk, { sessionId: sessionId, visible: tab.visible, running: !!running, ask: (text, photo) => askStudent(sessionId, text, photo), t: t, useResource: useResource, useStore, actions, saveSettings, saveWorksheet, inspectSubmission }, sessionId);
}
/** Register the learning desk inside DSH's existing session sidebar. */
export async function apply(context) {
    await mountStudentResource(context);
    context.effect(() => context.locale.register(NS, { zh, en }), 'student: dictionaries');
    const t = context.locale.bind(NS);
    context.effect(() => registerModeTab(context, {
        id: '@winterhuan/dsh-student', kind: 'student', title: () => t('title'),
        guide: [{ id: 'student', order: 24, title: () => t('title'), description: () => t('description'), icon: IconPlayOutlineRegular }],
    }), 'student: sidebar');
    context.inject(['remote.student'], scope => {
        const store = createStudentDraftStore();
        scope.slots.inject('sidebar.right.pane.tab', () => scope.slots.register({ name: 'sidebar.right.pane.tab', key: '@winterhuan/dsh-student', locale: NS, store, inject: () => studentCallbacks(scope) }, Sidebar));
    });
}
//# sourceMappingURL=sidebar.js.map