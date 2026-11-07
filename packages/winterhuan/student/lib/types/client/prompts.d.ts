import type { CheckInIntensity } from '../learning/mastery.ts';
import type { Translate } from './locales.ts';
/** Natural-language tutor requests. The study skill owns the teaching rules. */
export declare const continuePrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u67E5\u8BE2 study_status\uFF0C\u7EE7\u7EED\u5F53\u524D\u5B66\u4E60\u6BB5\u3002\u5148\u5904\u7406\u672A\u53CD\u9988\u7684\u7B54\u6848\u6216\u63D0\u793A\uFF0C\u518D\u51FA\u4E0B\u4E00\u9898\u3002\u4E00\u6B21\u4E00\u9898\u3002\u6CA1\u6709\u65F6\u957F\u9650\u5236\uFF0C\u5B69\u5B50\u60F3\u7EE7\u7EED\u5C31\u7EE7\u7EED\uFF1B\u60F3\u4F11\u606F\u5C31 stop\u3002";
/** Ask the child to teach the idea back like a little teacher (Feynman). */
export declare function feynmanPrompt(topic: string | undefined): string;
export declare const reviewPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u67E5\u8BE2 study_status \u548C\u5230\u671F\u9519\u9898\u3002\u672C\u6BB5\u590D\u4E60\u5230\u671F\u9519\u9898\uFF1A\u5148\u505A\u53D8\u5F0F\uFF0C\u4E0D\u5C55\u793A\u5DF2\u4FDD\u5B58\u7B54\u6848\u3002task \u5199\u4E0A mistakeId \u548C objectiveId\u3002\u4E00\u6B21\u4E00\u9898\u3002";
export declare const hintPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\u3002\u5B66\u751F\u8981\u63D0\u793A\uFF1A\u53EA\u6307\u51FA\u6761\u4EF6\u6216\u8BE5\u753B\u7684\u56FE\uFF0C\u4E0D\u7ED9\u7B97\u5F0F\u548C\u7B54\u6848\u3002\u5982\u679C\u8FD9\u9898\u5DF2\u7ECF\u7B54\u9519\uFF0C\u4E0B\u4E00\u9898\u6362\u4E00\u79CD\u8868\u793A\uFF0C\u5E76\u5728 task \u4E0A\u5199 figure\u3002";
export declare const teachHintPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u9605\u8BFB references/teaching.md \u7684\u300C\u4E0D\u4F1A\u505A\u65F6\u5148\u6559\u300D\u3002\u6309\u5F53\u524D\u9898\u7684 phase \u6559\u65B9\u6CD5\uFF1A\u8FD8\u6CA1\u793A\u8303\u5C31\u5148 demo\uFF0C\u5F15\u5BFC\u6B65\u5148\u7ED9\u4E00\u6B65\u63D0\u793A\uFF0C\u4E0D\u628A\u7B97\u5F0F\u548C\u7B54\u6848\u76F4\u63A5\u586B\u8FDB\u62EC\u53F7\u3002";
/** Ordinary tries get a nudge. A stuck learner, a teaching step, or a follow-up hint follows the teaching steps. */
export declare function hintPromptFor(task: {
    phase?: string | undefined;
    hintLevel?: number | undefined;
    stuck?: boolean | undefined;
}): string;
/** Teach one objective before any later lesson. */
export declare function teachPrompt(objectiveId: string): string;
/** Teach one confirmed workbook item that is not linked to an objective yet. */
export declare function teachQueuePrompt(title: string): string;
export declare const stuckPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u9605\u8BFB references/teaching.md \u7684\u300C\u4E0D\u4F1A\u505A\u65F6\u5148\u6559\u300D\u3002\u5B69\u5B50\u8BF4\u4E0D\u4F1A\u3002\u5148\u7528 demo \u793A\u8303\u65B9\u6CD5\uFF0C\u518D\u8FDB\u5165 guide\u3002\u6478\u5E95\u6BB5\u53EA\u8BB0\u4E0B\u4E0D\u4F1A\uFF0C\u4E0D\u8BB2\u8BFE\u3002";
export declare const mistakePhotoPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u8BFB\u53D6\u8FD9\u5F20\u9898\u76EE\u7167\u7247\uFF0C\u7528 mistake \u4FDD\u5B58\u5F85\u786E\u8BA4\u9519\u9898\u3002\u80FD\u5BF9\u5E94\u77E5\u8BC6\u5730\u56FE\u65F6\u5199\u4E0A objectiveId\u3002\u4E0D\u8981\u66FF\u6211\u786E\u8BA4\u3002";
/** Practise the current goal inside one interest scene. Facts stay on the knowledge map. */
export declare function interestPracticePrompt(objectiveId: string | undefined, tags: string[], focus: string, unitName?: string): string;
/** Clear only the one or two due mistakes named for today. */
export declare function dueClearPrompt(ids: string[]): string;
/** Problem-based explore: guess, check, revise. */
export declare function explorePrompt(question: string | undefined): string;
/** Continue around one shipped or custom learning goal. */
export declare function goalPrompt(objectiveId: string): string;
/** Tell the child the next unit is still ahead of school. */
export declare function previewPrompt(objectiveId: string): string;
/** One short question per sampled check-in goal. */
export declare function diagnosePrompt(intensity: CheckInIntensity, ids: string[], t: Translate): string;
/** A 4–6 question daily mini sheet for one subject. */
export declare function dailySheetPrompt(subject: string): string;
/** Dictate one word or sentence at a time in the conversation. */
export declare function dictationPrompt(subject: string): string;
/** A mixed practice sheet for the current school unit. */
export declare function practiceSheetPrompt(subject: string): string;
/** A review sheet limited to the picks and objective fills already chosen. */
export declare function reviewSheetPrompt(subject: string): string;
/** Ask the tutor to propose a concept that is outside the shipped map. */
export declare function organizePrompt(subject: string): string;
/** Transcribe one photographed worksheet into drafts. */
export declare function paperPhotoPrompt(worksheetId: string): string;
/** Ask the tutor to generate one local OpenMAIC lesson for the current goal, with interest tags and the school unit. */
export declare function openmaicGeneratePrompt(subjectLabel: string, objectiveId: string | undefined, tags: string[], focus: string, unitName?: string): string;
/** Ask the tutor to retry a failed generation without resubmitting the requirement. */
export declare function openmaicRetryPrompt(runId: string): string;
/** Ask the tutor to pull the stage outline and write a few consolidation questions. */
export declare function openmaicReviewPrompt(classroomId: string): string;
/** Transcribe a workbook photo that is not tied to a saved worksheet. */
export declare const workbookPhotoPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\u3002\u8FD9\u662F\u7EC3\u4E60\u518C\u7167\u7247\uFF0C\u4E8B\u5148\u6CA1\u6709\u7EC3\u4E60\u5355\u3002\u7528 workbook-draft \u6309\u9898\u4FDD\u5B58\u8349\u7A3F\uFF1A\u4E0D\u4F1A\u7528 stuck\uFF0C\u63D0\u793A\u540E\u624D\u5BF9\u7528 hinted\uFF0C\u72EC\u7ACB\u505A\u9519\u7528 independent-wrong\uFF0C\u72EC\u7ACB\u505A\u5BF9\u7528 independent-correct\u3002\u80FD\u5BF9\u5E94\u76EE\u6807\u5C31\u5199 objectiveId\u3002\u4E0D\u8981\u76F4\u63A5\u5165\u5E93\uFF0C\u7B49\u5BB6\u957F\u786E\u8BA4\u3002";
//# sourceMappingURL=prompts.d.ts.map