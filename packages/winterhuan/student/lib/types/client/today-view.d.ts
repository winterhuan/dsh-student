import type { Command } from '../schema.ts';
import type { CheckInIntensity } from '../learning/mastery.ts';
import type { Translate } from './locales.ts';
import { type DraftProps } from './drafts.tsx';
import { type Activity, type Mode, type ScopeChoice, type Subject } from './display.ts';
import type { Dashboard } from '../dashboard.ts';
type Study = NonNullable<Dashboard['study']>;
type Curriculum = NonNullable<Study['curriculum']>;
type Goal = {
    id: string;
    title: string;
};
type Act = (command: Command, withTutor?: boolean, prompt?: string) => Promise<void>;
/** The learner's page: one recommended next step, the current question, and a folded set of other ways to practise. */
export declare function TodayView({ study, subject, activity, setActivity, goal, clearGoal, curriculum, selectedObjectiveId, chooseGoal, intensityLabel, openParent, openCheckins, scope, setScope, scopeUnits, start, startRecommended, startDiagnosis, chosenIntensity, disabled, running, act, tutor, t, prompts, lessons, onInterestPractice, onOpenLesson, onClearDue, onOpenClassroom, draftScope, useStore, actions }: DraftProps & {
    draftScope?: string;
    study: Study;
    subject: Subject;
    activity: Activity;
    setActivity: (activity: Activity) => void;
    goal: Goal | undefined;
    clearGoal: () => void;
    curriculum: Curriculum | null;
    selectedObjectiveId: string;
    chooseGoal: (goal: {
        id: string;
        subject: Subject;
    }) => void;
    intensityLabel: string;
    openParent: () => void;
    openCheckins: () => void;
    scope: ScopeChoice;
    setScope: (scope: ScopeChoice) => void;
    scopeUnits: {
        id: string;
        name: string;
    }[];
    start: (subject: Subject, mode: Mode, inquiry?: string) => Promise<void>;
    startRecommended: () => void;
    startDiagnosis: (subject: Subject, intensity: CheckInIntensity) => Promise<void>;
    chosenIntensity: CheckInIntensity;
    disabled: boolean;
    running: boolean;
    act: Act;
    tutor: (text: string, currentBlock?: boolean) => Promise<void>;
    t: Translate;
    prompts: {
        daily: string;
        dictation: string;
    };
    lessons: Dashboard['interactiveLessons']['lessons'];
    onInterestPractice: () => void;
    onOpenLesson: () => void;
    onClearDue: () => void;
    onOpenClassroom: (url: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=today-view.d.ts.map