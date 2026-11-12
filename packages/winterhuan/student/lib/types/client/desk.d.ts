import { type AskTutor } from './bridge.ts';
import type { Context } from '@deepseek-ai/cordis';
import type { StudentSessionId } from '../types.ts';
import type { UseStudentResource } from './workspace.ts';
import type { Translate } from './locales.ts';
/** Workbench actions share the same persisted state as the native tutoring tools. */
export declare function StudyDesk({ sessionId, visible, ask, running, t, useResource, remote }: {
    sessionId: StudentSessionId;
    useResource: UseStudentResource;
    remote: Pick<Context['remote']['student'], 'manualContext' | 'saveManual' | 'inspectSubmission'>;
    visible: boolean;
    ask: AskTutor;
    running: boolean;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=desk.d.ts.map