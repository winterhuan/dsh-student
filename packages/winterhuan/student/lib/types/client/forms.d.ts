import { type ReactNode } from 'react';
import type { Command, StudyState } from '../schema.ts';
import type { Dashboard } from '../dashboard.ts';
import type { Translate } from './locales.ts';
export type ChangeStudy = (command: Command, revision?: number, baseline?: string) => Promise<Dashboard>;
export declare const subjects: readonly ["chinese", "math", "english"];
/** Labelled native field with browser validation. */
export declare function Field({ name, label, value, type, min, max, required }: {
    name: string;
    label: string;
    value?: string | number;
    type?: string;
    min?: number;
    max?: number;
    required?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function SaveForm({ revision, baseline, submit, children, t, disabled, button, entity, draftScope, currentValues, resetValues }: {
    revision: number;
    baseline: string;
    submit: (data: FormData, revision: number, baseline: string) => Promise<unknown>;
    children: ReactNode;
    t: Translate;
    disabled?: boolean;
    button?: 'save' | 'confirm' | false;
    entity?: string;
    draftScope?: string | undefined;
    currentValues?: Record<string, string | number | boolean | undefined>;
    resetValues?: () => void;
}): import("react/jsx-runtime").JSX.Element;
/** Parent-confirmed setup or in-place profile update, plus an atomic textbook/course update. */
export declare function ParentSettings({ data, change, t, curriculum, subject, onSubject, draftScope }: {
    data: Dashboard;
    change: ChangeStudy;
    t: Translate;
    curriculum?: NonNullable<Dashboard['study']>['curriculum'];
    subject?: typeof subjects[number];
    onSubject?: (subject: typeof subjects[number]) => void;
    draftScope?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
/** Confirmation retains the unedited image transcription until a user explicitly saves it. */
export declare function MistakeConfirmation({ mistake, revision, change, t }: {
    mistake: StudyState['mistakes'][number];
    revision: number;
    change: ChangeStudy;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=forms.d.ts.map