import type { Command } from '../schema.ts';
import type { Dashboard } from '../dashboard.ts';
import type { CheckInIntensity } from '../learning/mastery.ts';
import type { Translate } from './locales.ts';
import { type ScopeChoice, type Subject } from './display.ts';
type Study = NonNullable<Dashboard['study']>;
type Curriculum = NonNullable<Study['curriculum']>;
/** Parent map: unit spine with inline concept detail, pending concepts, and folded check-ins. */
export declare function MapView({ study, curriculum, subject, selectedConceptId, setSelectedConceptId, selectedObjectiveId, clearGoal, chooseGoal, active, scopeGrade, scopeTerm, setMapGrade, setMapTerm, clearBrowse, intensities, setIntensity, scopeOf, setScope, selectSubject, startDiagnosis, disabled, running, organize, change, t }: {
    study: Study;
    curriculum: Curriculum | null;
    subject: Subject;
    selectedConceptId: string;
    setSelectedConceptId: (id: string) => void;
    selectedObjectiveId: string;
    clearGoal: () => void;
    chooseGoal: (goal: {
        id: string;
        subject: Subject;
    }) => void;
    active: boolean;
    scopeGrade: number;
    scopeTerm: 'first' | 'second';
    setMapGrade: (grade: number) => void;
    setMapTerm: (term: 'first' | 'second') => void;
    clearBrowse: () => void;
    intensities: Partial<Record<Subject, CheckInIntensity>>;
    setIntensity: (subject: Subject, intensity: CheckInIntensity) => void;
    scopeOf: (subject: Subject) => ScopeChoice;
    setScope: (subject: Subject, scope: ScopeChoice) => void;
    selectSubject: (subject: Subject) => void;
    startDiagnosis: (subject: Subject, intensity: CheckInIntensity) => Promise<void>;
    disabled: boolean;
    running: boolean;
    organize: () => void;
    change: (command: Command) => Promise<void>;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=map-view.d.ts.map