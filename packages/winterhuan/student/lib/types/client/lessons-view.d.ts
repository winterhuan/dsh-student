import type { Dashboard } from '../dashboard.ts';
import type { Translate } from './locales.ts';
type Lesson = Dashboard['interactiveLessons']['lessons'][number];
/**
 * Open a classroom URL in another browser tab.
 * The desk does not embed the classroom: a cross-origin frame would not carry the OpenMAIC cookie,
 * and a static export player is intentionally absent.
 */
/** http(s) URL without credentials, or undefined when the desk must not offer it. */
export declare function classroomUrl(value: string | undefined): string | undefined;
export declare function openClassroom(url: string): void;
/** Lessons for the open subject. A row with no subject stays visible; a row for another subject does not. */
export declare function lessonsForSubject<T extends {
    subject?: 'chinese' | 'math' | 'english' | undefined;
}>(lessons: readonly T[], subject: 'chinese' | 'math' | 'english'): T[];
/** Recent OpenMAIC lessons: open or copy the URL, and ask the tutor to generate, retry or review. */
export declare function LessonsPanel({ lessons, error, disabled, running, t, onGenerate, onRetry, onReview }: {
    lessons: Lesson[];
    error?: string;
    disabled: boolean;
    running: boolean;
    t: Translate;
    onGenerate?: () => void;
    onRetry: (runId: string) => void;
    onReview: (classroomId: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=lessons-view.d.ts.map