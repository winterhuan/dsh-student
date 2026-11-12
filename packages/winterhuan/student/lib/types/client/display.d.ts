import type { InsightReason } from '../learning/mastery.ts';
import type { Translate } from './locales.ts';
/** Shared subject order for the workbench. */
export declare const subjects: readonly ["chinese", "math", "english"];
/** One workbench subject. */
export type Subject = typeof subjects[number];
/** Stored learning mode. Sync practice is recorded as school or foundation. */
export type Mode = 'foundation' | 'school' | 'review' | 'explore' | 'diagnose';
/** The subject and mode the learner is about to start. */
export type Activity = {
    subject: Subject;
    mode: Mode;
};
/** Optional grade, term or unit for one block. */
export type ScopeChoice = {
    grade?: number;
    term?: 'first' | 'second';
    unit?: string;
};
export declare const levelKeys: {
    readonly due: "levelDue";
    readonly weak: "levelWeak";
    readonly stalled: "levelStalled";
    readonly mastered: "levelMastered";
    readonly practising: "levelPractising";
    readonly untouched: "levelUntouched";
};
export declare const reasonKeys: {
    readonly 'due-mistakes': "reasonDue";
    readonly 'open-mistakes': "reasonOpen";
    readonly 'recent-help-or-error': "reasonRecent";
    readonly 'recurring-error': "reasonRecurring";
    readonly 'not-practised-recently': "reasonStalled";
    readonly 'not-started': "reasonNew";
    readonly 'diagnosis-due': "reasonDiagnose";
    readonly preview: "reasonPreview";
    readonly 'school-pace': "reasonSchoolPace";
    readonly 'needs-teaching': "reasonTeaching";
    readonly 'prerequisite-gap': "reasonPrerequisite";
};
export declare const planKeys: {
    readonly review: "recommendReview";
    readonly practice: "recommendPractice";
    readonly diagnose: "recommendDiagnose";
    readonly learn: "recommendLearn";
    readonly preview: "recommendPreview";
    readonly hold: "recommendHold";
};
export declare const intensityKeys: {
    readonly light: "intensityLight";
    readonly standard: "intensityStandard";
    readonly deep: "intensityDeep";
};
export declare const intensityHelpKeys: {
    readonly light: "intensityLightHelp";
    readonly standard: "intensityStandardHelp";
    readonly deep: "intensityDeepHelp";
};
export declare const sampleKeys: {
    readonly untouched: "sampleUntouched";
    readonly stalled: "sampleStalled";
    readonly recheck: "sampleRecheck";
    readonly progress: "sampleProgress";
};
export declare const assistKeys: {
    readonly independent: "assistIndependent";
    readonly hint: "assistHint";
    readonly 'worked-example': "assistWorked";
    readonly unknown: "assistUnknown";
};
export declare const focusKeys: {
    readonly literacy: "focusLiteracy";
    readonly pinyin: "focusPinyin";
    readonly reading: "focusReading";
    readonly writing: "focusWriting";
    readonly concepts: "focusConcepts";
    readonly calculation: "focusCalculation";
    readonly geometry: "focusGeometry";
    readonly measurement: "focusMeasurement";
    readonly words: "focusWords";
    readonly sentences: "focusSentences";
    readonly story: "focusStory";
    readonly listen: "focusListen";
    readonly project: "focusProject";
    readonly review: "focusReview";
};
export declare const reminderKeys: {
    readonly 'first-explain': "remindFirst";
    readonly 'after-correction': "remindAfterFix";
    readonly 'before-next': "remindNext";
};
/** Remaining time as m:ss. */
export declare function clock(ms: number): string;
/** Local calendar date, or an empty string when unknown. */
export declare function day(ms: number | undefined): string;
/** One line of evidence reasons for a goal or recommendation. */
export declare function reasonText(reasons: InsightReason[], t: Translate): string;
//# sourceMappingURL=display.d.ts.map