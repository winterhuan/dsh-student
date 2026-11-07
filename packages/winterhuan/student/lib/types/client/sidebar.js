import { jsx as _jsx } from "react/jsx-runtime";
import { registerModeTab } from "./mode.js";
import { IconPlayOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { useEffect, useMemo } from 'react';
import { NS, zh, en } from "./locales.js";
import { tutorBridge } from "./bridge.js";
import { StudyDesk } from "./desk.js";
export const name = 'student';
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs'];
/** Register the learning desk inside DSH's existing session sidebar. */
export function apply(context) {
    context.effect(() => context.locale.register(NS, { zh, en }), 'student: dictionaries');
    const t = context.locale.bind(NS);
    context.effect(() => registerModeTab(context, {
        id: '@winterhuan/dsh-student', kind: 'student', title: () => t('title'),
        guide: [{ id: 'student', order: 24, title: () => t('title'), description: () => t('description'), icon: IconPlayOutlineRegular }],
    }), 'student: sidebar');
    function Sidebar({ sessionId, useTabInfo, useSession, useSessions, t }) {
        const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset);
        const { tab } = useTabInfo();
        useEffect(() => { if (typeof preset === 'string' && preset !== 'student')
            tab.actions.close(); }, [preset, tab.actions]);
        const running = useSession(snapshot => snapshot.running);
        const ask = useMemo(() => tutorBridge(context, sessionId, t('sessionError'), t('sendError')), [sessionId, t]);
        if (preset !== 'student')
            return null;
        return _jsx(StudyDesk, { sessionId: sessionId, visible: tab.visible, running: !!running, ask: ask, t: t }, sessionId);
    }
    context.slots.inject('sidebar.right.pane.tab', () => context.slots.register({ name: 'sidebar.right.pane.tab', key: '@winterhuan/dsh-student', locale: NS }, Sidebar));
}
//# sourceMappingURL=sidebar.js.map