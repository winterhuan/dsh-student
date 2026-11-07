import type { Dashboard } from '../dashboard.ts';
import type { Translate } from './locales.ts';
type Study = NonNullable<Dashboard['study']>;
type Curriculum = NonNullable<Study['curriculum']>;
/** Parent concepts: compare / classify / cause for the open book, then the subject's cross-grade idea list. */
export declare function IdeasView({ study, curriculum, t, onOpenConcept }: {
    study: Study;
    curriculum: Curriculum | null;
    t: Translate;
    onOpenConcept?: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ideas-view.d.ts.map