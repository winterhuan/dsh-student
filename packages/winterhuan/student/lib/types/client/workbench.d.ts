/** Global learning workbench and its retained native tutoring conversation. */
import type { Context } from '@deepseek-ai/cordis';
import type { SessionReference } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { WorkspaceId } from '@deepseek-ai/dsh-api-workspace-controller/client';
import type { PropsLocale, PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
declare const sessionSlot = "student.workbench.session";
declare module '@deepseek-ai/dsh-api-session-controller/client' {
    interface SessionReferenceSourceMap {
        studentWorkbench: true;
    }
}
type WorkbenchState = {
    workspaceId: string;
    sessionId: string;
    chatVisible: boolean;
};
/** Create browser preferences independent of learning records.
 * @returns a registration-owned store persisting workspace, conversation and assistant visibility.
 */
export declare function createWorkbenchStore(): import("@deepseek-ai/dsh-client-store").EngineStoreHandle<WorkbenchState, {
    selectWorkspace: (draft: WorkbenchState, id: WorkspaceId) => void;
    selectSession: (draft: WorkbenchState, id: SessionId) => void;
    toggleChat: (draft: WorkbenchState) => void;
}>;
type WorkbenchInjected = {
    retainSession: (id: SessionId) => SessionReference;
    createSession: (workspaceId: WorkspaceId) => Promise<SessionId>;
    openSession: (id: SessionId) => void;
    reportCreate: (success: boolean) => void;
};
type SessionOwner = {
    chatVisible: boolean;
};
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'student.workbench.session': {
            kind: 'single';
            scope: 'session';
            owner: SessionOwner;
        };
    }
}
type WorkbenchProps = PropsRuntime<'main'> & PropsRenderSlots<typeof sessionSlot> & PropsStore<ReturnType<typeof createWorkbenchStore>> & PropsLocale<typeof NS> & WorkbenchInjected;
/** Select live main Student conversations within one learner workspace.
 * @param props - framework catalogs, preferences and native Session callbacks.
 * @returns the global workbench with the selected Session's learning and chat panels.
 */
export declare function Workbench({ useSessions, useWorkspaces, useStore, actions, retainSession, createSession, openSession, reportCreate, SessionProvider, renderSlot, t }: WorkbenchProps): import("react/jsx-runtime").JSX.Element;
/** Register the global entry and its strict Session child through native services.
 * @param context - mounted Student client services.
 */
export declare function registerWorkbench(context: Context): void;
export {};
//# sourceMappingURL=workbench.d.ts.map