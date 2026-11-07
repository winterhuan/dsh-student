import type { AskTutor } from './bridge.ts';
import type { Translate } from './locales.ts';
/** Workbench actions share the same persisted state as the native tutoring tools. */
export declare function StudyDesk({ sessionId, visible, ask, running, t }: {
    sessionId: string;
    visible: boolean;
    ask: AskTutor;
    running: boolean;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=desk.d.ts.map