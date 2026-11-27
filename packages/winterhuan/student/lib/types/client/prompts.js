import { PANEL_PREFIX, panelIntentSchema } from "../panel-intent.js";
import { intensityKeys } from "./display.js";
/** Natural-language tutor requests. The study skill owns the teaching rules. */
export const continuePrompt = '请加载 study，读取 references/continuation.md 和独立 learning-context，按 nextAction、round、legalActions 处理明确的下一步。执行身份仅来自 nextAction，保留 previousActivity 的原题和回答；不另排目标或重置轮次。按需选择官方课堂或独立组件，沿 requirement 教学。原生写入后运行随包只读 CLI，再独立读取确认；来源未接受时保留状态。';
/** Read initial learning records through the native tutor before the resource can follow them. */
export const loadLearningPrompt = '请加载 study 技能，只读 study_status kind=status 和 kind=learning-context，核对已有档案与当前 nextAction。仅显示当前学习目标、保留的题目和下一步；无档案时说明可以先在学习档案页确认资料。此请求只读，不修改学习文件、不建立学习段、不生成课堂或题目、不记录回答或掌握。';
/** Verify one saved response without replacing the current learning question. */
export function pendingRecordPrompt(kind, ownerId, responseId) {
    const path = `.study/${kind === 'block' ? 'blocks' : 'worksheets'}/${ownerId}.json`;
    return `请加载 study 技能，阅读 references/files.md，核对 ${path} 中 responseId=${responseId} 的作答记录。先解释题目、原回答、已有批改和缺少的信息，再依据原始证据或家长明确确认修正。无法核实的信息保留未知；不能把评分或接收时间当作答日期，不能把旧默认值当独立作答证明。保留原题和原回答，不新增一次作答，不更换当前学习题。`;
}
/** Check saved response details in groups while preserving unknown facts and original answers. */
export const pendingRecordsPrompt = '请加载 study 技能，阅读 references/files.md，批量整理当前学期已保存的作答资料。先读取 .study/settings.json，再按学习段或练习卷分批检查 .study/blocks/ 和 .study/worksheets/ 中的正式记录，排除已作废练习单；不要只处理界面显示的前 20 条。只依据可核实的原始证据补充信息，修改后运行只读校验。无法核实的日期、帮助、来源或题目依据保留未知，无需家长逐条补齐，也不要求孩子重做。多条记录确实共享同一项待确认事实时，合并询问；不能把不同作答的日期或帮助一概填成相同值。不能把评分或接收时间当作答日期，不能把旧默认值当独立作答证明。保留原题、原回答和已有批改，不新增作答，不更换当前学习题。最后简要汇总已补充和仍未知的信息，只提出影响当前学习安排且家长能够确认的问题。';
/** Ask the child to teach the idea back like a little teacher (Feynman). */
export function feynmanPrompt(topic) {
    const focus = topic ? `围绕「${topic}」` : '围绕刚才学的内容';
    return `请加载 study 技能。你扮演好奇的同桌。请孩子${focus}当小老师讲一讲：用简单的话说明是什么、怎么做、为什么。孩子讲完后，用一两句追问帮他发现漏洞并补齐；不要直接替他讲完整答案。`;
}
export const reviewPrompt = '请加载 study 技能，查询 study_status 和到期错题。本段复习到期错题：先做变式，不展示已保存答案。task 写上 mistakeId 和 objectiveId。一次一题。';
export const hintPrompt = '请加载 study 技能。学生要提示：只指出条件或该画的图，不给算式和答案。如果这题已经答错，下一题换一种表示，并在 task 上写 figure。';
export const teachHintPrompt = '请加载 study 技能，阅读 references/teaching.md 的「不会做时先教」。按当前题的 phase 教方法：还没示范就先 demo，引导步先给一步提示，不把算式和答案直接填进括号。';
/** Ordinary tries get a nudge. A stuck learner, a teaching step, or a follow-up hint follows the teaching steps. */
export function hintPromptFor(task) {
    if (task.stuck || task.phase === 'demo' || task.phase === 'guide' || (task.hintLevel ?? 0) >= 1)
        return teachHintPrompt;
    return hintPrompt;
}
export const stuckPrompt = '请加载 study 技能，阅读 references/teaching.md 的「不会做时先教」。孩子说不会。先用 demo 示范方法，再进入 guide。摸底段只记下不会，不讲课。';
export const mistakePhotoPrompt = '请加载 study 技能，读取这张题目照片，用 mistake 保存待确认错题。能对应知识地图时写上 objectiveId。不要替我确认。';
/** Problem-based explore: guess, check, revise. */
export function explorePrompt(question) {
    const focus = question && question.trim() !== '' ? `孩子的疑问是：${question.trim()}。` : '先问孩子想弄清什么。';
    return `请加载 study 技能。本段是自主探究（explore）。${focus}按问题导向法引导：我猜什么 → 如何验证（翻课页或做小实验）→ 看到了什么 → 我改变了什么想法。一次只推进一小步，不要直接给出完整答案。`;
}
/** Continue around one shipped or custom learning goal. */
export function goalPrompt(objectiveId) {
    return `请加载 study 技能，查询 study_status。本段围绕学习目标 ${objectiveId} 出题，一次一题，task 写上这个 objectiveId。需要看图时写 figure。`;
}
/** One short question per sampled check-in goal. */
export function diagnosePrompt(intensity, ids, t) {
    const intensityName = t(intensityKeys[intensity]);
    return `请加载 study 技能，查询 study_status kind=diagnose。本段是${intensityName}摸底，按这些学习目标各出一道短题：${ids.join('，')}。task 和 record 都写 objectiveId。每题只给简短反馈，不展开教学。`;
}
/** A 4–6 question daily mini sheet for one subject. */
export function dailySheetPrompt(subject) {
    return `请加载 study 技能，阅读 references/questions.md 和 references/daily-routine.md。用 study_status kind=elements subject=${subject} 写一张每日小卷，4 到 6 题，kind 写 daily，每题写 objectiveId。用 worksheet 保存后告诉我编号。`;
}
/** Dictate one word or sentence at a time in the conversation. */
export function dictationPrompt(subject) {
    return `请加载 study 技能，用 study_status kind=elements subject=${subject} 做对话听写。没有进行中的学习段时，用 start 开始一段 foundation（subject=${subject}）。一次报一个，task 写 objectiveId。`;
}
/** A mixed practice sheet for the current school unit. */
export function practiceSheetPrompt(subject) {
    return `请加载 study 技能，阅读 references/questions.md。用 study_status kind=elements subject=${subject} 写一张当前单元练习卷：6 到 8 题，题型要换，kind 写 practice，每题写 objectiveId，不要写 mistakeId。需要图时用 figure。用 worksheet 保存后告诉我编号。`;
}
/** A review sheet limited to the picks and objective fills already chosen. */
export function reviewSheetPrompt(subject) {
    return `请加载 study 技能，阅读 references/questions.md。按 study_status kind=review-sheet subject=${subject} 的 picks 和 objectiveFills 写巩固卷，kind 写 review。用 worksheet 保存后告诉我编号。`;
}
/** Ask the tutor to propose a concept that is outside the shipped map. */
export function organizePrompt(subject) {
    return `请加载 study 技能，查看 ${subject} 的知识地图。如果有地图之外的概念，先保存待确认概念，等家长核对后再创建学习目标。`;
}
/** Transcribe one photographed worksheet into drafts. */
export function paperPhotoPrompt(worksheetId) {
    return `请加载 study 技能，读取练习单 ${worksheetId} 的作答照片，按题号用 paper-draft 保存转录草稿。不要直接入库。`;
}
/** Recover one original job, prepare its saved questions and continue authorized playback. */
export function openmaicQueryPrompt(lessonId) {
    return `请加载 study、openmaic-teach，阅读 references/unit-courses.md 和 references/openmaic-feedback.md。继续 .study/openmaic-lessons.json 中 id=${lessonId} 的原课堂。读取原 learnerId/termId/blockId/jobId；已有任务只恢复或查询。仅 planned 且已确认未提交时，复用已保存并校验的 requirement、teaching 与 questionPlan 调用 openmaic_generate；超时或提交未知不新建任务。旧格式且无 purpose 的既有课堂沿用 prepare 绑定流程；新增完整课 ready 后调用一次 openmaic_feedback action=review，原样保存返回 quality、feedback 和原题，运行只读 CLI 并独立读取；rejected、缺失或无法核验均不可打开。不得自己填写通过声明。已有作答先读取并保存原记录，接受后才更新 checkpoint；已确认范围内继续教学，无需逐课确认。`;
}
/** Recover a failed original job without creating a replacement requirement. */
export function openmaicRetryPrompt(runId) {
    return `请加载 study，阅读 references/openmaic.md。读取 runId=${runId} 对应原课堂的身份，用 openmaic_generate 查询和恢复同一 jobId，按官方实际状态提供恢复步骤，保存同一条课堂记录并校验。提交未知先核对原任务；不得重新提交 requirement 或换课堂。`;
}
/** Import original answers and supplement only criteria still missing. */
export function openmaicReviewPrompt(classroomId) {
    return `请加载 study、openmaic-teach，阅读 references/openmaic-feedback.md。继续课堂 ${classroomId} 的原 learnerId/termId/blockId，用 openmaic_feedback 读取全部有界来源页，逐页通过原生文件工具保存原回答和官方/有效评分。运行随包只读 CLI，并用 study_status 独立读取核对接受后才更新原 checkpoint。读取 references/continuation.md，按 learning-context 的 nextAction、round 和 legalActions 沿原轮次只补缺少判据，一次一题，不要求已有效覆盖的题重做；未知日期和帮助保持未知。`;
}
/** Transcribe a workbook photo that is not tied to a saved worksheet. */
export const workbookPhotoPrompt = '请加载 study 技能。这是练习册照片，事先没有练习单。用 workbook-draft 按题保存草稿：不会用 stuck，提示后才对用 hinted，独立做错用 independent-wrong，独立做对用 independent-correct。能对应目标就写 objectiveId。不要直接入库，等家长确认。';
/** Complete panel intention; official file validation determines business completion. */
export function nativeIntentPrompt(intent, request) {
    return PANEL_PREFIX + JSON.stringify(panelIntentSchema.strip().parse(JSON.parse(JSON.stringify({ ...intent, version: 2, request }))));
}
/** Daily choices are persisted by the native executor after checking observed versions. */
export const dailyPlanPrompt = '请加载 study，先读 study_status kind=daily-plan，按 references/daily-planning.md 执行 dailyAction。保留选中 suggestion 的任务身份与 nextAction.requirement；核对相关文件实际版本和计划 revision 后写入，再运行只读 CLI 并独立读取。新学按 references/unit-courses.md 先确认教材与学校位置，再建立目录和完整互动课；缺资料时只询问缺项并结束，不探索 schema、写计划或自动摸底。继续沿原活动、题目、回答和额度；暂停和结束不制造完成或掌握。';
/** Adjust an optional family preference while retaining existing profile and school progress. */
export function scopeConfirmationPrompt(subject, suggestion) {
    return `请加载 study，读取 references/daily-planning.md。家长想调整 ${subject} 的学习内容。先读取已有档案、教材、学校进度、有效作答和当前建议：${JSON.stringify(suggestion ?? null)}。说明当前依据，询问希望改变的内容；默认沿用已有资料，不要求逐科解锁。只有家长明确提出额外限制时才保存此学科的 learningScopes 与原话，不替其他学科补写确认。缺少学校进度时只补问实际位置，不猜正在教的单元。保存后只读校验并独立读取，再回到今日推荐。`;
}
/** Explicit course actions retain source ownership and never substitute the previously active subject. */
export function unitCoursePrompt(action, courseId, sectionId) {
    return `请加载 study 并读取 references/unit-courses.md。执行用户明确选择的课程动作 ${JSON.stringify({ action, courseId, sectionId })}。revise 表示用户要求按旧 lesson 的 quality.notes 修正内容：先确认旧任务结果确定，为修订版建立新 block/lesson，写 replacesLessonId，保留原记录与证据；旧 daily-plan task 仅暂停或 deferred，保留 activity.blockId；为新 block 追加新 task 与 choice，不能替换旧 task 的 blockId。sectionId 在此动作中是旧 lessonId。先读取现有课程文件和相关学业记录，复用已保存教材确认和原任务；只问缺失资料。新学先完整互动课；复习先回忆或尝试，困难才补讲。暂停旧活动但保留原题、回答及反馈归属。生成前保存完整 teaching 和 questionPlan 并校验；预审拒绝时修正尚未提交的草稿，ready 后用 action=review 复核；结果未知不重复提交。`;
}
//# sourceMappingURL=prompts.js.map