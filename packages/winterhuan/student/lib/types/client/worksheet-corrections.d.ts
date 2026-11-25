import { type DraftProps } from './drafts.tsx';
import type { StudentJsonValue, StudentSessionId, StudentManualReply } from '../types.ts';
import type { ManualSaveRequest } from '../files/manual.ts';
import type { UseStudentResource } from './workspace.ts';
import type { Translate } from './locales.ts';
import type { Subject } from './display.ts';
type ManualSave = (intent: ManualSaveRequest['intent'], baseline: Record<string, StudentJsonValue>) => Promise<StudentManualReply | void>;
/** Optional corrections edit confirmed records; the original response and frozen question stay visible. */
export declare function WorksheetCorrections({ sessionId, termId, subject, draftScope, useResource, save, t, disabled, useStore, actions }: DraftProps & {
    sessionId: StudentSessionId;
    termId: string;
    subject: Subject;
    draftScope: string;
    useResource: UseStudentResource;
    save: ManualSave;
    t: Translate;
    disabled: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=worksheet-corrections.d.ts.map