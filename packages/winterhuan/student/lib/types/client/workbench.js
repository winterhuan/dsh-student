import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createSnapshotStore, defineStore } from '@deepseek-ai/dsh-client-store';
import { IconPlayOutlineRegular, Toast } from '@deepseek-ai/dsh-client-ui-primitives';
import { useEffect, useState } from 'react';
import { tutorBridge } from "./bridge.js";
import { StudyDesk } from "./desk.js";
import { createStudentManualActions } from "./manual-actions.js";
import { NS } from "./locales.js";
import css from './workbench.module.css';
const sessionSlot = 'student.workbench.session';
/** Create browser preferences independent of learning records.
 * @returns a registration-owned store persisting workspace, conversation and assistant visibility.
 */
export function createWorkbenchStore() {
    return defineStore({
        init: () => ({ workspaceId: '', sessionId: '', chatVisible: true }),
        persist: 'dsh.student.workbench.v1',
        actions: {
            selectWorkspace: (draft, id) => { draft.workspaceId = id; draft.sessionId = ''; },
            selectSession: (draft, id) => { draft.sessionId = id; },
            toggleChat: draft => { draft.chatVisible = !draft.chatVisible; },
        },
    });
}
/** Select live main Student conversations within one learner workspace.
 * @param props - framework catalogs, preferences and native Session callbacks.
 * @returns the global workbench with the selected Session's learning and chat panels.
 */
export function Workbench({ useSessions, useWorkspaces, useStore, actions, retainSession, createSession, openSession, reportCreate, SessionProvider, renderSlot, t }) {
    const catalog = useSessions(state => state);
    const workspaces = useWorkspaces(state => state);
    const preferences = useStore(state => state);
    const [creating, setCreating] = useState(false);
    const remembered = workspaces.items.find(item => item.sessionIds.some(id => id === preferences.sessionId));
    const workspace = workspaces.items.find(item => item.workspaceId === preferences.workspaceId) ?? remembered ?? workspaces.items.find(item => item.sessionIds.some(id => catalog.byId[id]?.projectionValues?.agentPreset === 'student')) ?? workspaces.items[0];
    const sessions = (workspace?.sessionIds ?? []).flatMap(id => {
        const row = catalog.byId[id];
        return row && catalog.ids.includes(id) && row.projectionValues?.agentPreset === 'student' && !row.parentId && row.origin !== 'subagent' && !workspaces.archivedSessionIds.includes(id) ? [row] : [];
    }).sort((a, b) => b.updatedAt - a.updatedAt);
    const selected = sessions.find(item => item.id === preferences.sessionId) ?? sessions[0];
    const sessionId = selected?.id;
    const pending = catalog.phase !== 'ready' || workspaces.phase !== 'ready';
    async function create() {
        if (!workspace || creating)
            return;
        setCreating(true);
        try {
            const id = await createSession(workspace.workspaceId);
            actions.selectWorkspace(workspace.workspaceId);
            actions.selectSession(id);
            reportCreate(true);
        }
        catch {
            reportCreate(false);
        }
        finally {
            setCreating(false);
        }
    }
    return _jsxs("div", { className: css.workbench, children: [_jsxs("header", { className: css.header, children: [_jsxs("div", { className: css.heading, children: [_jsx("h1", { children: t('title') }), _jsx("p", { children: t('workbenchHelp') })] }), _jsxs("div", { className: css.controls, children: [_jsxs("label", { children: [t('learnerWorkspace'), _jsx("select", { value: workspace?.workspaceId ?? '', disabled: pending || creating, onChange: event => {
                                            const next = workspaces.items.find(item => item.workspaceId === event.target.value);
                                            if (next)
                                                actions.selectWorkspace(next.workspaceId);
                                        }, children: workspaces.items.map(item => _jsx("option", { value: item.workspaceId, children: item.title }, item.workspaceId)) })] }), _jsxs("label", { children: [t('learningConversation'), _jsxs("select", { value: sessionId ?? '', disabled: pending || creating || !sessions.length, onChange: event => {
                                            const next = sessions.find(item => item.id === event.target.value);
                                            if (next)
                                                actions.selectSession(next.id);
                                        }, children: [!sessions.length && _jsx("option", { value: "", children: t('noLearningConversation') }), sessions.map(item => _jsx("option", { value: item.id, children: item.displayTitle }, item.id))] })] }), _jsx("button", { type: "button", disabled: pending || creating || !workspace, onClick: () => { void create(); }, children: t('newLearningConversation') }), sessionId && _jsx("button", { type: "button", onClick: () => openSession(sessionId), children: t('openConversation') }), sessionId && _jsx("button", { type: "button", "aria-pressed": preferences.chatVisible, onClick: actions.toggleChat, children: t(preferences.chatVisible ? 'hideTutor' : 'showTutor') })] })] }), pending ? _jsx(Loading, {}) : !workspace ? _jsx("div", { className: css.empty, children: _jsx("p", { children: t('noLearnerWorkspace') }) }) : !sessionId ? _jsxs("div", { className: css.empty, children: [_jsx("h2", { children: t('welcomeWorkbench') }), _jsx("p", { children: t('createLearningHelp') })] }) : _jsx(SelectedSession, { sessionId: sessionId, chatVisible: preferences.chatVisible, retainSession: retainSession, SessionProvider: SessionProvider, renderSlot: renderSlot, t: t }, sessionId)] });
}
function Loading() { return _jsx("div", { className: css.empty, "aria-busy": "true", children: _jsx("span", { className: css.spinner }) }); }
function SelectedSession({ sessionId, chatVisible, retainSession, SessionProvider, renderSlot, t }) {
    const [binding, setBinding] = useState(null);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let alive = true;
        const reference = retainSession(sessionId);
        void reference.ready.then(() => { if (alive)
            setBinding(reference); }).catch(() => { if (alive)
            setFailed(true); });
        return () => { alive = false; reference.release(); };
    }, [sessionId, retainSession, retry]);
    if (failed)
        return _jsxs("div", { className: css.empty, children: [_jsx("p", { role: "alert", children: t('openConversationError') }), _jsx("button", { type: "button", onClick: () => { setFailed(false); setBinding(null); setRetry(value => value + 1); }, children: t('reload') })] });
    return binding ? _jsx(SessionProvider, { session: binding, children: renderSlot(sessionSlot, { chatVisible }) }) : _jsx(Loading, {});
}
function LearningSession({ sessionId, chatVisible, ask, useSession, useConversation, renderFactorySlot, useResource, useStore, actions, saveSettings, saveWorksheet, inspectSubmission, t }) {
    const session = useSession(state => state);
    const conversation = useConversation(state => state);
    const settling = session.openState === 'loading' && !conversation.activeTargets.size;
    return _jsxs("div", { className: `${css.body} ${chatVisible ? css.withChat : ''}`, children: [_jsx("div", { className: css.study, children: _jsx(StudyDesk, { sessionId: sessionId, visible: true, running: !!session.running, ask: ask, t: t, useResource: useResource, useStore, actions, saveSettings, saveWorksheet, inspectSubmission }) }), chatVisible && _jsxs("aside", { className: css.chat, "aria-label": t('tutorConversation'), children: [_jsx("h2", { children: t('tutorConversation') }), renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : 'active', hero: false })] })] });
}
function PanelIcon({ size }) { return _jsx(IconPlayOutlineRegular, { size: size }); }
function WorkbenchNotice({ useNotice, dismissNotice, t }) {
    const notice = useNotice(value => value);
    return notice ? _jsx(Toast, { text: t(notice.success ? 'createdLearningConversation' : 'createConversationError'), ...(notice.success ? { tone: 'success' } : {}), onDone: dismissNotice }, notice.sequence) : null;
}
/** Register the global entry and its strict Session child through native services.
 * @param context - mounted Student client services.
 * @param draftStore - shared learning-form drafts for both workbench and sidebar.
 */
export function registerWorkbench(context, draftStore) {
    const t = context.locale.bind(NS);
    const notice = createSnapshotStore(null);
    let sequence = 0;
    context.slots.inject('main', () => context.slots.register({
        name: 'main', key: 'student', locale: NS, store: createWorkbenchStore(),
        children: { [sessionSlot]: { kind: 'single', scope: 'session' } },
        inject: () => ({
            retainSession: id => context.sessions.retain(id, { source: 'studentWorkbench' }),
            createSession: workspaceId => context.sessions.create({ workspaceId, agentPreset: 'student' }),
            openSession: id => { context.uiWorkspace.openSession(id); },
            reportCreate: success => { notice.set({ success, sequence: ++sequence }); },
        }),
    }, Workbench));
    context.slots.inject(sessionSlot, () => context.slots.register({ name: sessionSlot, locale: NS, store: draftStore,
        inject: (sessionId) => ({ ask: tutorBridge(context, sessionId, t('sessionError'), t('sendError')), ...createStudentManualActions(context.remote.student) }),
    }, LearningSession));
    context.slots.inject('sidebar.panellist', () => context.slots.register({ name: 'sidebar.panellist', id: 'student', order: 6, locale: NS, label: () => t('title') }, PanelIcon));
    context.slots.inject('shell.overlay', () => context.slots.register({ name: 'shell.overlay', id: 'student.workbench.notice', locale: NS,
        inject: () => ({ hooks: { notice }, dismissNotice: () => { notice.set(null); } }),
    }, WorkbenchNotice));
}
//# sourceMappingURL=workbench.js.map