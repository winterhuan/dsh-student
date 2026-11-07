import type { UpdateContext } from './index.ts';
import type { StudyState } from '../../schema.ts';
/** Save one printable sheet and freeze its mistake citations. */
export declare function applyWorksheet(ctx: UpdateContext<'worksheet'>): StudyState;
/** Save one photo transcription draft for a sheet item. */
export declare function applyPaperDraft(ctx: UpdateContext<'paper-draft'>): StudyState;
/** Apply the parent per-item marks for one sheet. */
export declare function applyGradeSheet(ctx: UpdateContext<'grade-sheet'>): StudyState;
/** Confirm transcription drafts into paper results. */
export declare function applyConfirmPaper(ctx: UpdateContext<'confirm-paper'>): StudyState;
/** Discard one sheet so its mistakes can print again. */
export declare function applyDiscardSheet(ctx: UpdateContext<'discard-sheet'>): StudyState;
/** Save one workbook photo draft without a sheet. */
export declare function applyWorkbookDraft(ctx: UpdateContext<'workbook-draft'>): StudyState;
/** Route a confirmed workbook draft to teaching, mistakes or nothing. */
export declare function applyConfirmWorkbook(ctx: UpdateContext<'confirm-workbook'>): StudyState;
/** Remove one item from the teaching queue. */
export declare function applyDismissTeaching(ctx: UpdateContext<'dismiss-teaching'>): StudyState;
//# sourceMappingURL=paper.d.ts.map