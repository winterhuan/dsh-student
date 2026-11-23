# OpenMAIC 真实反馈导入

本流程使用当前 Student 原生会话和正式学习文件。Host 授权读取原记录、保存凭据和题面捕获元数据；回答、评分、学习进度和检查点由 agent 用原生文件工具编写。先加载 [文件规则](files.md)，读取 `study_status(kind="learning-context")`。

## 打开课堂前

确认 `.study/settings.json` 的稳定 learnerId、termId，以及原 blockId、当前题目的 capability（goalId、familyId、scope）。原课堂日志必须保存同一 learnerId、termId、blockId、base、learnerKey、classroomId 和 jobId。身份缺失或不一致时保留当前活动，请家长核对，不从服务账号或工作区推测孩子身份。

调用 `openmaic_feedback(action="prepare", lessonId)`。Host 核对受保护的原生成任务和当前账户，冻结原 question snapshot/hash/revision，记录已有 attempt 的序列头。同一 base/classroomId/learnerKey 分区只保留一个 Student 学生、学期和学习段；第二个孩子需要自己的课堂。把返回的 feedback 写入原 lesson，把 questions 写入原 block；有 nextOffset 时继续取页，每页最多 20 项。运行随包只读 CLI，再用 `study_status(kind="learning-context")` 独立读取，确认全部冻结题面及绑定已保存后才能通过受保护的课堂入口打开。历史已提交记录不会因今日 prepare 获得已核实题面。

## 返回、继续与重启

1. 调用 `openmaic_feedback(action="read", lessonId, offset)`，逐页读取原课堂当前 submitted/reviewed 记录。每行可能是 question、response、assessment，也可能只有 pendingOpenmaic；前者写入对应正式数组，后者完整保存在原 block.pendingOpenmaic，保留 binding、原 record 及 JSON 扩展和 reason。draft 不写成回答。
2. 以返回的稳定 response.id 查找已有回答；重复读取不追加。rawResponse 是 submittedAnswer 的 JSON 字符串，单值也保留 JSON 引号。批改更新同一回答的 assessment，official 保留当前官方评分，officialHistory 保留按 seq 排列的原批改。seq 只在各 runtime session 内排序；event 的 record.id 不等于回答身份。同题跨 session 无已核实关联时保存原事件待核对，不能仅因新 session 就认定真实重答。
3. 运行打包只读 CLI。失败时修复正式文件，保留原回答和既有 checkpoint；工具成功、模型声称已保存或 CLI 退出 0 都不等于来源已被独立接受。
4. 再读取 `study_status(kind="learning-context")` 和 `openmaic_feedback(action="read", lessonId)`。仅 consumption.status 为 accepted 且各页完整保存时，才用原生 edit 把 consumption.checkpoint 保存到原 lesson。缺少回答、评价、冻结题目或原始待核对事件时消费仍为 pending；完整保存的待核对事实可以确认已读取，但不计有效掌握。遗漏、版本变动、权限失效或缺失来源时继续原检查点重读。

官网读取没有 afterSeq 或分页参数。Host 读取完整数组并核对连续序列和读取前后版本；来源不完整、版本不支持或超限分别报告 incomplete-read、unsupported-version 或 read-limit。原生工具的 offset 只用于返回已完整读取的事实，每页最多 20 项且至多 32 KiB；单条超限时 nextOffset 不前进、complete 为 false，保留检查点。来源不可用时 total/drafts 为 null；真实空来源才是 0。

面板通过现有主 Session 的 `student-sync` 系统消息请求同步。return/resume 只同步原活动；显式 continue 在独立消费完成后才按共享 nextAction/legalActions 继续。queued/coalesced 只表示原生接纳，不能报告保存或推进成功。暂停撤销该课堂尚未执行的同步请求，再由原生会话取消当前回合；下次明确返回或继续可以重试。系统同步消息不提供孩子回答、家长核对或实际作答日。

不把 sourceStatus 写成自己的认证标记。Student 独立读取原来源、学习文件和课堂日志版本；重启重新授权，不信任模型写入的 verified 标记。部分写入保留待同步，之后以同一原身份恢复。

## 评分与未知事实

保留原官方结果与 Student 有效结果。明确选项值或数值等价可核验；equivalent 返回的依据须保留。无法自动比较的文字选项、文本题或缺少判据为 pending，未解决的官方评分冲突为 conflict；不要用总分替代目标评价。题面修订不一致、历史题面不可取得时保留原回答和原事件，来源未知且有效结果未评价。原 submitted 缺失、同 attempt 回答冲突或跨 session 关联不明时只保存原事件，不编造提交或回答。

官网作答时间戳是记录生命周期，不能推断实际作答日。默认 answerDate.kind 为 unknown，assistance 为 unknown；家长明确核对后才补实际日期或帮助声明。同题看过答案后的重答可能有答案揭示，不能贡献独立作答；本地补题不能回填历史。点击、截图、观看、自报成绩和课堂完成报告均不直接形成掌握。

家长可在原生对话明确核对原回答的等价判据。确认消息必须仅有两行：第一行是 `Student grading correction:`，第二行是 JSON，包含 `learnerId`、`termId`、`blockId`、`responseId`、`questionId`、原 `snapshotHash`、原 `submittedAnswer`、`result`（`correct`、`incorrect`、`partial` 或 `unassessed`）、`criterion` 和 `parentConfirmation`。先展示原题、原回答和官方评分供家长核对，不能替家长发送确认。把独立消费返回的该消息 `sessionId`、`messageId`、`inputVersion` 和完整原文保存在原 assessment 的 `criterionCorrection`；保留原 official 与 officialHistory，feedback 等于确认的 criterion，正确时 grading 为 equivalent，错误或部分正确时为 aligned，仍有歧义时为 pending。Student 重读真实消费过的原生输入、原题哈希和原提交后才接受有效更正；模型自写确认无效。更正不新增 response，也不确认作答日期、帮助或独立性；原来源失效时仍不接受证据。
