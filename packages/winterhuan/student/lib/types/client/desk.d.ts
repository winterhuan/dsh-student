import { type AskTutor } from './bridge.ts';
import type { StudentManualActions } from './manual-actions.ts';
import type { DraftProps } from './drafts.tsx';
import type { StudentSessionId } from '../types.ts';
import type { UseStudentResource } from './workspace.ts';
import type { Translate } from './locales.ts';
/** Workbench actions share the same persisted state as the native tutoring tools. */
export declare function StudyDesk({ sessionId, visible, ask, running, t, useResource, saveSettings, saveWorksheet: saveWorksheetRecord, inspectSubmission, useStore, actions }: DraftProps & StudentManualActions & {
    sessionId: StudentSessionId;
    useResource: UseStudentResource;
    visible: boolean;
    ask: AskTutor;
    running: boolean;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=desk.d.ts.map