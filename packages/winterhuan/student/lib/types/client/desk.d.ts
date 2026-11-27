import { type AskTutor, type StudentSessionActions } from './bridge.ts';
import type { StudentManualActions } from './manual-actions.ts';
import type { DraftProps } from './drafts.tsx';
import type { StudentSessionId } from '../types.ts';
import type { UseStudentResource } from './workspace.ts';
import type { Translate } from './locales.ts';
/** Workbench actions share the same persisted state as the native tutoring tools. */
export declare function StudyDesk({ sessionId, visible, ask, running, pending, syncFeedback, cancel, t, useResource, saveSettings, saveWorksheet: saveWorksheetRecord, openLesson, pollLesson, readMini, useStore, actions }: DraftProps & StudentManualActions & Partial<StudentSessionActions> & {
    sessionId: StudentSessionId;
    useResource: UseStudentResource;
    visible: boolean;
    ask: AskTutor;
    running: boolean;
    pending?: boolean;
    t: Translate;
    readMini?: (miniId: string) => Promise<{
        id: string;
        html: string;
    }>;
    openLesson?: (lessonId: string) => Promise<import('../openmaic/playback.ts').OpenmaicPlaybackResult>;
    pollLesson?: (lessonId: string, signal: AbortSignal) => Promise<import('../openmaic/playback.ts').LessonGenerationStatus>;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=desk.d.ts.map