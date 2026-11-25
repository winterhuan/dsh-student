import type { DailyLearning, DailySuggestion } from '../learning/daily.ts';
import type { Translate } from './locales.ts';
import type { Subject } from './display.ts';
/** Home is the only learner surface for browsing subjects or choosing new content. */
export declare function DailyHome({ daily, subject, disabled, extra, onStart, onResume, onSummary, t }: {
    daily: DailyLearning;
    subject: Subject | 'all';
    disabled: boolean;
    extra: boolean;
    onStart: (suggestion?: DailySuggestion) => void;
    onResume: () => void;
    onSummary: () => void;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
/** Summaries report actual responses and unfinished work, without adding recommendations. */
export declare function DailySummary({ daily, disabled, onContinue, onExtra, onHome, t }: {
    daily: DailyLearning;
    disabled: boolean;
    onContinue: () => void;
    onExtra: () => void;
    onHome: () => void;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=daily-view.d.ts.map