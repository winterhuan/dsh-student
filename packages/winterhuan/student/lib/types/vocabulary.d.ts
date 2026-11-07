/**
 * Subject-scoped learning vocabularies shared by the host schemas and the workbench.
 *
 * Kept free of schema dependencies so client code can import the lists without pulling zod.
 * @module @winterhuan/dsh-student/vocabulary
 */
/** Error causes offered for math mistakes. */
export declare const mathErrorTypes: readonly ["carry-borrow", "place-value", "operation-choice", "calculation", "unit-quantity", "reading-task", "pattern", "geometry-feature", "money-measure", "reasoning-incomplete"];
/** Error causes offered for Chinese mistakes. */
export declare const chineseErrorTypes: readonly ["pinyin-tone", "character-form", "character-usage", "word-meaning", "reading-evidence", "order", "expression-incomplete", "punctuation", "listening"];
/** Error causes offered for English mistakes. */
export declare const englishErrorTypes: readonly ["spelling", "word-meaning", "word-form", "sentence-pattern", "usage-context", "listening", "spoken-response", "writing-complete"];
/** Every error-cause value across the three subjects. */
export type ErrorTypeValue = (typeof mathErrorTypes)[number] | (typeof chineseErrorTypes)[number] | (typeof englishErrorTypes)[number];
/** Error causes offered for one subject; the parent can change any classification. */
export declare const errorTypesBySubject: Record<'chinese' | 'math' | 'english', readonly ErrorTypeValue[]>;
/** Daily-practice focuses offered for Chinese units. */
export declare const chineseFocus: readonly ["literacy", "pinyin", "reading", "writing", "review"];
/** Daily-practice focuses offered for math units. */
export declare const mathFocus: readonly ["concepts", "calculation", "geometry", "measurement", "review"];
/** Daily-practice focuses offered for English units. */
export declare const englishFocus: readonly ["words", "sentences", "story", "listen", "project", "review"];
/** Every daily-practice focus value. */
export type UnitFocusValue = (typeof chineseFocus)[number] | (typeof mathFocus)[number] | (typeof englishFocus)[number];
/** Daily-practice focuses offered for one subject's units. */
export declare const focusBySubject: Record<'chinese' | 'math' | 'english', readonly UnitFocusValue[]>;
//# sourceMappingURL=vocabulary.d.ts.map