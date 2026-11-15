/** Shared subject order for the workbench. */
export const subjects = ['chinese', 'math', 'english'];
export const levelKeys = { due: 'levelDue', weak: 'levelWeak', stalled: 'levelStalled', mastered: 'levelMastered', practising: 'levelPractising', untouched: 'levelUntouched' };
export const reasonKeys = { 'due-mistakes': 'reasonDue', 'open-mistakes': 'reasonOpen', 'recent-help-or-error': 'reasonRecent', 'recurring-error': 'reasonRecurring', 'not-practised-recently': 'reasonStalled', 'not-started': 'reasonNew', 'diagnosis-due': 'reasonDiagnose', preview: 'reasonPreview', 'school-pace': 'reasonSchoolPace', 'needs-teaching': 'reasonTeaching', 'prerequisite-gap': 'reasonPrerequisite' };
export const planKeys = { review: 'recommendReview', practice: 'recommendPractice', diagnose: 'recommendDiagnose', learn: 'recommendLearn', preview: 'recommendPreview', hold: 'recommendHold' };
export const intensityKeys = { light: 'intensityLight', standard: 'intensityStandard', deep: 'intensityDeep' };
export const intensityHelpKeys = { light: 'intensityLightHelp', standard: 'intensityStandardHelp', deep: 'intensityDeepHelp' };
export const sampleKeys = { untouched: 'sampleUntouched', stalled: 'sampleStalled', recheck: 'sampleRecheck', progress: 'sampleProgress' };
export const assistKeys = { independent: 'assistIndependent', hint: 'assistHint', 'worked-example': 'assistWorked', unknown: 'assistUnknown' };
export const focusKeys = { literacy: 'focusLiteracy', pinyin: 'focusPinyin', reading: 'focusReading', writing: 'focusWriting', concepts: 'focusConcepts', calculation: 'focusCalculation', geometry: 'focusGeometry', measurement: 'focusMeasurement', words: 'focusWords', sentences: 'focusSentences', story: 'focusStory', listen: 'focusListen', project: 'focusProject', review: 'focusReview' };
export const reminderKeys = { 'first-explain': 'remindFirst', 'after-correction': 'remindAfterFix', 'before-next': 'remindNext' };
/** Remaining time as m:ss. */
export function clock(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
/** Local calendar date, or an empty string when unknown. */
export function day(ms) {
    return ms === undefined ? '' : new Date(ms).toLocaleDateString();
}
/** One line of evidence reasons for a goal or recommendation. */
export function reasonText(reasons, t) {
    return reasons.map(reason => reason.code === 'not-started' || reason.code === 'preview' || reason.code === 'school-pace' || reason.code === 'needs-teaching' ? t(reasonKeys[reason.code]) : `${t(reasonKeys[reason.code])} ${reason.count}`).join(' · ');
}
//# sourceMappingURL=display.js.map