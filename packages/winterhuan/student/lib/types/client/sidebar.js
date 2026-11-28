import { jsx as _jsx } from "react/jsx-runtime";
import { registerModeTab } from "./mode.js";
import { IconPlayOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { useEffect } from 'react';
import { NS, zh, en } from "./locales.js";
import { tutorBridge, studentSessionBridge } from "./bridge.js";
import { StudyDesk } from "./desk.js";
import { registerTeachingAids } from "./teaching-aids.js";
import { mountStudentResource } from "./resource.js";
import { createStudentDraftStore } from "./drafts.js";
import { createStudentManualActions } from "./manual-actions.js";
export const name = 'student';
export const inject = ['slots', 'sessions', 'uiSession', 'locale', 'sidebarRightTabs', 'sidebarRight', 'remote', 'resources', 'conversation'];
function studentCallbacks(scope) {
    const t = scope.locale.bind(NS);
    return {
        textbookActions: (sessionId) => ({
            async command(request) { const result = await scope.remote.student.textbooks(sessionId, request, new AbortController().signal); if (!result.ok)
                throw new Error(result.error.message); return result.value; },
            async pair() { const result = await scope.remote.student.textbookPair(sessionId, new AbortController().signal); if (!result.ok)
                throw new Error(result.error.message); return result.value; },
            async devices(revoke) { const result = await scope.remote.student.textbookDevices(sessionId, revoke, new AbortController().signal); if (!result.ok)
                throw new Error(result.error.message); return result.value; },
            async upload(request) { const result = await scope.remote.student.textbookUpload(sessionId, request, new AbortController().signal); if (!result.ok)
                throw new Error(result.error.message); return result.value; },
            async image(bookId, pageId, kind, index, candidate, revision) { const result = await scope.remote.student.textbookImage(sessionId, bookId, pageId, kind, index, candidate, revision, new AbortController().signal); if (!result.ok)
                throw new Error(result.error.message); return result.value; },
        }),
        ...createStudentManualActions(scope.remote.student),
        sessionActions: (sessionId) => studentSessionBridge(scope, sessionId, t('sessionError')),
        readMini: async (sessionId, miniId) => { const result = await scope.remote.studentOpenmaicPlayback.mini(sessionId, miniId, new AbortController().signal); if (!result.ok)
            throw new Error(result.error.message); return result.value; },
        pollLesson: async (sessionId, lessonId, signal) => { const result = await scope.remote.studentOpenmaicPlayback.progress(sessionId, lessonId, signal); if (!result.ok)
            throw new Error(result.error.message); return result.value; },
        openLesson: async (sessionId, lessonId) => { const result = await scope.remote.studentOpenmaicPlayback.open(sessionId, lessonId, new AbortController().signal); if (!result.ok)
            throw new Error(result.error.message); return result.value; },
        askStudent: (sessionId, text, photo) => tutorBridge(scope, sessionId, t('sessionError'), t('sendError'))(text, photo),
    };
}
function Desk({ sessionId, visible, running, pending, useResource, t, useStore, actions, askStudent, saveSettings, saveWorksheet, inspectSubmission, openLesson, pollLesson, readMini, sessionActions, textbookActions }) {
    return _jsx(StudyDesk, { textbookActions: textbookActions(sessionId), sessionId, visible, running, pending, ...sessionActions(sessionId), ask: (text, photo) => askStudent(sessionId, text, photo), t: t, useResource: useResource, readMini: miniId => readMini(sessionId, miniId), openLesson: lessonId => openLesson(sessionId, lessonId), pollLesson: (lessonId, signal) => pollLesson(sessionId, lessonId, signal), useStore, actions, saveSettings, saveWorksheet, inspectSubmission }, sessionId);
}
function Sidebar({ sessionId, useTabInfo, useSession, useSessions, renderSlot }) {
    const preset = useSessions(state => state.byId[sessionId]?.projectionValues?.agentPreset);
    const { tab } = useTabInfo();
    useEffect(() => { if (typeof preset === 'string' && preset !== 'student')
        tab.actions.close(); }, [preset, tab.actions]);
    const session = useSession(snapshot => snapshot);
    return preset === 'student' ? renderSlot('student.desk', { sessionId, visible: tab.visible, running: !!session.running, pending: session.pendingSubmissions.length > 0 || session.awaitingFirstTurn }) : null;
}
/** Register the learning desk inside DSH's existing session sidebar. */
export async function apply(context) {
    await mountStudentResource(context);
    context.effect(() => context.locale.register(NS, { zh, en }), 'student: dictionaries');
    registerTeachingAids(context);
    const t = context.locale.bind(NS);
    context.effect(() => registerModeTab(context, {
        id: '@winterhuan/dsh-student', kind: 'student', keepMounted: true, title: () => t('title'),
        guide: [{ id: 'student', order: 24, title: () => t('title'), description: () => t('description'), icon: IconPlayOutlineRegular }],
    }), 'student: sidebar');
    context.inject(['remote.student', 'remote.studentOpenmaicPlayback'], scope => {
        const store = createStudentDraftStore();
        scope.slots.inject('sidebar.right.pane.tab', () => scope.slots.register({ name: 'sidebar.right.pane.tab', key: '@winterhuan/dsh-student', children: { 'student.desk': { kind: 'single', scope: 'root' } } }, Sidebar));
        scope.slots.inject('student.desk', () => scope.slots.register({ name: 'student.desk', locale: NS, store, inject: () => studentCallbacks(scope) }, Desk));
    });
}
//# sourceMappingURL=sidebar.js.map