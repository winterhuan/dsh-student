import type { CheckInIntensity } from '../learning/mastery.ts';
import type { Translate } from './locales.ts';
/** Natural-language tutor requests. The study skill owns the teaching rules. */
export declare const continuePrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u67E5\u8BE2 study_status\uFF0C\u7EE7\u7EED\u5F53\u524D\u5B66\u4E60\u6BB5\u3002\u5148\u5904\u7406\u672A\u53CD\u9988\u7684\u7B54\u6848\u6216\u63D0\u793A\uFF0C\u4FDD\u7559\u5F53\u524D\u9898\u76EE\uFF1B\u53EA\u6709\u660E\u786E\u8981\u6C42\u4E0B\u4E00\u9898\u65F6\u624D\u6362\u9898\u3002\u4E00\u6B21\u4E00\u9898\u3002\u6CA1\u6709\u65F6\u957F\u9650\u5236\uFF0C\u5B69\u5B50\u60F3\u7EE7\u7EED\u5C31\u7EE7\u7EED\uFF1B\u60F3\u4F11\u606F\u5C31 stop\u3002";
/** Verify one saved response without replacing the current learning question. */
export declare function pendingRecordPrompt(kind: 'block' | 'worksheet', ownerId: string, responseId: string): string;
/** Check saved response details in groups while preserving unknown facts and original answers. */
export declare const pendingRecordsPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u9605\u8BFB references/files.md\uFF0C\u6279\u91CF\u6574\u7406\u5F53\u524D\u5B66\u671F\u5DF2\u4FDD\u5B58\u7684\u4F5C\u7B54\u8D44\u6599\u3002\u5148\u8BFB\u53D6 .study/settings.json\uFF0C\u518D\u6309\u5B66\u4E60\u6BB5\u6216\u7EC3\u4E60\u5377\u5206\u6279\u68C0\u67E5 .study/blocks/ \u548C .study/worksheets/ \u4E2D\u7684\u6B63\u5F0F\u8BB0\u5F55\uFF0C\u6392\u9664\u5DF2\u4F5C\u5E9F\u7EC3\u4E60\u5355\uFF1B\u4E0D\u8981\u53EA\u5904\u7406\u754C\u9762\u663E\u793A\u7684\u524D 20 \u6761\u3002\u53EA\u4F9D\u636E\u53EF\u6838\u5B9E\u7684\u539F\u59CB\u8BC1\u636E\u8865\u5145\u4FE1\u606F\uFF0C\u4FEE\u6539\u540E\u8FD0\u884C\u53EA\u8BFB\u6821\u9A8C\u3002\u65E0\u6CD5\u6838\u5B9E\u7684\u65E5\u671F\u3001\u5E2E\u52A9\u3001\u6765\u6E90\u6216\u9898\u76EE\u4F9D\u636E\u4FDD\u7559\u672A\u77E5\uFF0C\u65E0\u9700\u5BB6\u957F\u9010\u6761\u8865\u9F50\uFF0C\u4E5F\u4E0D\u8981\u6C42\u5B69\u5B50\u91CD\u505A\u3002\u591A\u6761\u8BB0\u5F55\u786E\u5B9E\u5171\u4EAB\u540C\u4E00\u9879\u5F85\u786E\u8BA4\u4E8B\u5B9E\u65F6\uFF0C\u5408\u5E76\u8BE2\u95EE\uFF1B\u4E0D\u80FD\u628A\u4E0D\u540C\u4F5C\u7B54\u7684\u65E5\u671F\u6216\u5E2E\u52A9\u4E00\u6982\u586B\u6210\u76F8\u540C\u503C\u3002\u4E0D\u80FD\u628A\u8BC4\u5206\u6216\u63A5\u6536\u65F6\u95F4\u5F53\u4F5C\u7B54\u65E5\u671F\uFF0C\u4E0D\u80FD\u628A\u65E7\u9ED8\u8BA4\u503C\u5F53\u72EC\u7ACB\u4F5C\u7B54\u8BC1\u660E\u3002\u4FDD\u7559\u539F\u9898\u3001\u539F\u56DE\u7B54\u548C\u5DF2\u6709\u6279\u6539\uFF0C\u4E0D\u65B0\u589E\u4F5C\u7B54\uFF0C\u4E0D\u66F4\u6362\u5F53\u524D\u5B66\u4E60\u9898\u3002\u6700\u540E\u7B80\u8981\u6C47\u603B\u5DF2\u8865\u5145\u548C\u4ECD\u672A\u77E5\u7684\u4FE1\u606F\uFF0C\u53EA\u63D0\u51FA\u5F71\u54CD\u5F53\u524D\u5B66\u4E60\u5B89\u6392\u4E14\u5BB6\u957F\u80FD\u591F\u786E\u8BA4\u7684\u95EE\u9898\u3002";
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
/** Ask the tutor to refresh one saved lesson using its original service and poll URL. */
export declare function openmaicQueryPrompt(lessonId: string): string;
/** Ask the tutor to verify the failed run before requesting an idempotent retry. */
export declare function openmaicRetryPrompt(runId: string): string;
/** Ask the tutor to pull the stage outline and write a few consolidation questions. */
export declare function openmaicReviewPrompt(classroomId: string): string;
/** Transcribe a workbook photo that is not tied to a saved worksheet. */
export declare const workbookPhotoPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\u3002\u8FD9\u662F\u7EC3\u4E60\u518C\u7167\u7247\uFF0C\u4E8B\u5148\u6CA1\u6709\u7EC3\u4E60\u5355\u3002\u7528 workbook-draft \u6309\u9898\u4FDD\u5B58\u8349\u7A3F\uFF1A\u4E0D\u4F1A\u7528 stuck\uFF0C\u63D0\u793A\u540E\u624D\u5BF9\u7528 hinted\uFF0C\u72EC\u7ACB\u505A\u9519\u7528 independent-wrong\uFF0C\u72EC\u7ACB\u505A\u5BF9\u7528 independent-correct\u3002\u80FD\u5BF9\u5E94\u76EE\u6807\u5C31\u5199 objectiveId\u3002\u4E0D\u8981\u76F4\u63A5\u5165\u5E93\uFF0C\u7B49\u5BB6\u957F\u786E\u8BA4\u3002";
/** Complete panel intention; official file validation determines business completion. */
export declare function nativeIntentPrompt(intent: object, request: string): string;
//# sourceMappingURL=prompts.d.ts.map