import type { CheckInIntensity } from '../learning/mastery.ts';
import type { Translate } from './locales.ts';
/** Natural-language tutor requests. The study skill owns the teaching rules. */
export declare const continuePrompt = "\u8BF7\u52A0\u8F7D study\uFF0C\u8BFB\u53D6 references/continuation.md \u548C\u72EC\u7ACB learning-context\uFF0C\u6309 nextAction\u3001round\u3001legalActions \u5904\u7406\u660E\u786E\u7684\u4E0B\u4E00\u6B65\u3002\u6267\u884C\u8EAB\u4EFD\u4EC5\u6765\u81EA nextAction\uFF0C\u4FDD\u7559 previousActivity \u7684\u539F\u9898\u548C\u56DE\u7B54\uFF1B\u4E0D\u53E6\u6392\u76EE\u6807\u6216\u91CD\u7F6E\u8F6E\u6B21\u3002\u6309\u9700\u9009\u62E9\u5B98\u65B9\u8BFE\u5802\u6216\u72EC\u7ACB\u7EC4\u4EF6\uFF0C\u6CBF requirement \u6559\u5B66\u3002\u539F\u751F\u5199\u5165\u540E\u8FD0\u884C\u968F\u5305\u53EA\u8BFB CLI\uFF0C\u518D\u72EC\u7ACB\u8BFB\u53D6\u786E\u8BA4\uFF1B\u6765\u6E90\u672A\u63A5\u53D7\u65F6\u4FDD\u7559\u72B6\u6001\u3002";
/** Read initial learning records through the native tutor before the resource can follow them. */
export declare const loadLearningPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u53EA\u8BFB study_status kind=status \u548C kind=learning-context\uFF0C\u6838\u5BF9\u5DF2\u6709\u6863\u6848\u4E0E\u5F53\u524D nextAction\u3002\u4EC5\u663E\u793A\u5F53\u524D\u5B66\u4E60\u76EE\u6807\u3001\u4FDD\u7559\u7684\u9898\u76EE\u548C\u4E0B\u4E00\u6B65\uFF1B\u65E0\u6863\u6848\u65F6\u8BF4\u660E\u53EF\u4EE5\u5148\u5728\u5BB6\u957F\u9875\u786E\u8BA4\u8D44\u6599\u3002\u6B64\u8BF7\u6C42\u53EA\u8BFB\uFF0C\u4E0D\u4FEE\u6539\u5B66\u4E60\u6587\u4EF6\u3001\u4E0D\u5EFA\u7ACB\u5B66\u4E60\u6BB5\u3001\u4E0D\u751F\u6210\u8BFE\u5802\u6216\u9898\u76EE\u3001\u4E0D\u8BB0\u5F55\u56DE\u7B54\u6216\u638C\u63E1\u3002";
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
export declare const stuckPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u9605\u8BFB references/teaching.md \u7684\u300C\u4E0D\u4F1A\u505A\u65F6\u5148\u6559\u300D\u3002\u5B69\u5B50\u8BF4\u4E0D\u4F1A\u3002\u5148\u7528 demo \u793A\u8303\u65B9\u6CD5\uFF0C\u518D\u8FDB\u5165 guide\u3002\u6478\u5E95\u6BB5\u53EA\u8BB0\u4E0B\u4E0D\u4F1A\uFF0C\u4E0D\u8BB2\u8BFE\u3002";
export declare const mistakePhotoPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\uFF0C\u8BFB\u53D6\u8FD9\u5F20\u9898\u76EE\u7167\u7247\uFF0C\u7528 mistake \u4FDD\u5B58\u5F85\u786E\u8BA4\u9519\u9898\u3002\u80FD\u5BF9\u5E94\u77E5\u8BC6\u5730\u56FE\u65F6\u5199\u4E0A objectiveId\u3002\u4E0D\u8981\u66FF\u6211\u786E\u8BA4\u3002";
/** Problem-based explore: guess, check, revise. */
export declare function explorePrompt(question: string | undefined): string;
/** Continue around one shipped or custom learning goal. */
export declare function goalPrompt(objectiveId: string): string;
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
/** Recover one original job, prepare its saved questions and continue authorized playback. */
export declare function openmaicQueryPrompt(lessonId: string): string;
/** Recover a failed original job without creating a replacement requirement. */
export declare function openmaicRetryPrompt(runId: string): string;
/** Import original answers and supplement only criteria still missing. */
export declare function openmaicReviewPrompt(classroomId: string): string;
/** Transcribe a workbook photo that is not tied to a saved worksheet. */
export declare const workbookPhotoPrompt = "\u8BF7\u52A0\u8F7D study \u6280\u80FD\u3002\u8FD9\u662F\u7EC3\u4E60\u518C\u7167\u7247\uFF0C\u4E8B\u5148\u6CA1\u6709\u7EC3\u4E60\u5355\u3002\u7528 workbook-draft \u6309\u9898\u4FDD\u5B58\u8349\u7A3F\uFF1A\u4E0D\u4F1A\u7528 stuck\uFF0C\u63D0\u793A\u540E\u624D\u5BF9\u7528 hinted\uFF0C\u72EC\u7ACB\u505A\u9519\u7528 independent-wrong\uFF0C\u72EC\u7ACB\u505A\u5BF9\u7528 independent-correct\u3002\u80FD\u5BF9\u5E94\u76EE\u6807\u5C31\u5199 objectiveId\u3002\u4E0D\u8981\u76F4\u63A5\u5165\u5E93\uFF0C\u7B49\u5BB6\u957F\u786E\u8BA4\u3002";
/** Complete panel intention; official file validation determines business completion. */
export declare function nativeIntentPrompt(intent: object, request: string): string;
/** Daily choices are persisted by the native executor after checking observed versions. */
export declare const dailyPlanPrompt = "\u8BF7\u52A0\u8F7D study\uFF0C\u8BFB\u53D6 references/daily-planning.md\u3001references/continuation.md \u548C study_status kind=daily-plan\u3002\u6267\u884C\u672C\u6B21 dailyAction\uFF1A\u5148\u6838\u5BF9\u610F\u56FE\u643A\u5E26\u7684\u6B63\u5F0F\u6587\u4EF6\u7248\u672C\u3001\u8BA1\u5212 revision \u548C\u4EFB\u52A1\u8EAB\u4EFD\uFF1B\u53D8\u5316\u65F6\u4FDD\u7559\u7528\u6237\u9009\u62E9\uFF0C\u91CD\u65B0\u6838\u5BF9\uFF0C\u4E0D\u80FD\u8986\u76D6\u522B\u7684\u4F1A\u8BDD\u7684\u65B0\u8BB0\u5F55\u3002\u82E5\u5F53\u524D\u539F\u6D3B\u52A8\u8FD8\u672A\u5173\u8054\u8BA1\u5212\uFF0C\u6309\u201C\u63A5\u7EED\u5DF2\u6709\u6D3B\u52A8\u201D\u4EC5\u767B\u8BB0\u8BE5\u539F\u6D3B\u52A8\uFF0C\u8BB0\u5F55\u672C\u6B21\u771F\u5B9E continue/pause/stop \u9009\u62E9\uFF0C\u4E0D\u628A\u5176\u4ED6\u63A8\u8350\u4E00\u8D77\u52A0\u5165\uFF0C\u4E5F\u4E0D\u8865\u9020\u5386\u53F2 start \u6216\u5B8C\u6210\u3002\u9996\u6B21\u5F00\u59CB\u590D\u7528 day-YYYY-MM-DD \u548C\u7A33\u5B9A\u4EFB\u52A1\u8EAB\u4EFD\uFF0C\u5148\u4FDD\u5B58\u8BA1\u5212\uFF0C\u518D\u51C6\u5907\u5F53\u524D\u4EFB\u52A1\uFF0C\u72EC\u7ACB\u8BFB\u53D6\u786E\u8BA4\u4E24\u8005\u5173\u8054\u3002\u7EE7\u7EED\u539F\u9898\u548C\u8349\u7A3F\uFF1B\u6682\u505C\u4E0E\u7ED3\u675F\u4E0D\u80FD\u5236\u9020\u5B66\u4E60\u5B8C\u6210\u6216\u638C\u63E1\u3002\u53EA\u6709\u660E\u786E\u7EE7\u7EED\u624D\u8C03\u6574\u672A\u5F00\u59CB\u5185\u5BB9\uFF1B\u53EA\u6709 extra \u624D\u6DFB\u52A0\u53EF\u9009\u6D3B\u52A8\u3002\u8BA1\u5212\u7ED3\u675F\u540E\u4E0D\u81EA\u52A8\u751F\u6210\u65B0\u9898\u3002";
/** Adjust an optional family preference while retaining existing profile and school progress. */
export declare function scopeConfirmationPrompt(subject: string, suggestion: object | undefined): string;
//# sourceMappingURL=prompts.d.ts.map