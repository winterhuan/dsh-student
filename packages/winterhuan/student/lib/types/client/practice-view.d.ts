import type { DraftProps } from './drafts.tsx';
import type { Dashboard, MistakeStatus } from '../dashboard.ts';
import type { AskTutor } from './bridge.ts';
import { type ChangeStudy } from './forms.tsx';
import type { Translate } from './locales.ts';
import type { Subject } from './display.ts';
type Study = NonNullable<Dashboard['study']>;
type Goal = {
    id: string;
    title: string;
};
/** Parent practice page: the mistake notebook, printed sheets, and due review. */
export declare function PracticeView({ study, now, subject, goals, mistakeStatus, setMistakeStatus, setMistakeOffset, revision, disabled, running, change, ask, onReview, epoch, t, useStore, actions }: DraftProps & {
    study: Study;
    now: number;
    subject: Subject;
    goals: Goal[];
    mistakeStatus: MistakeStatus;
    setMistakeStatus: (status: MistakeStatus) => void;
    setMistakeOffset: (offset: number) => void;
    revision: number;
    disabled: boolean;
    running: boolean;
    change: ChangeStudy;
    ask: AskTutor;
    onReview: (subject: Subject) => void;
    epoch: number;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=practice-view.d.ts.map