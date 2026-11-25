# 继续与轮次

先独立读 `study_status kind=learning-context`。`nextAction` 决定唯一下一步，`legalActions` 列出当前允许的明确意图，`round` 给出原轮次、状态和剩余额度。缺失、部分或版本变化时保留题目与草稿，重新读取；不回退到旧 dashboard recommendation，也不按浏览中的科目重排。

## 身份与范围

继续的 blockId、questionId、responseId 仅取 nextAction。新目标或尚未建立的新复习没有旧 blockId；`previousActivity` 只用于保留旧题、原回答和迟到评价。回答、提示、不会和停止仍属于原题。执行当前可学范围内的新学习时保存新学习段身份；课堂及独立组件都使用 nextAction.requirement。

已有档案、学校进度和历史学习范围直接参与下一步选择；缺少 settings.learningScopes 不阻止学习。缺进度时按年级目录短摸底，不猜学校单元。learningScopes 是可选的家长额外限制，保留实际 parentConfirmation，不为默认建议补写确认。校内建议遵守现有学校进度：紧跟当前单元、追赶已教内容、复习周不增加新目标；已有回答优先恢复。

## 保存原轮次

补检开始前在原 block.rounds 保存稳定 id、kind=check、startedAt、members、enteredFamilyIds、presentedQuestionIds；member 包含 goalId、familyId、精确 scope，复习成员还可有 mistakeId。正式 schema 由随包 `study-validate schema block` 获取，写入后按 files.md 校验并独立重读。

补检一轮最多三道首次呈现的新题实例。先把新题 ID 加入原 round.presentedQuestionIds，保存冻结题目并校验，再展示给孩子；不能等作答或评分才计数。示范、提示、不会、前置切换、官方判据已有或未知、来源失败都不减少已呈现计数，也不创建新轮领取额度。仅补投影指出的缺项；到限后请求讲解、换允许内容或休息。

短复习 kind=review，一轮最多进入两类母题。保存原成员及每次首次进入的 familyId 和 familyEntries 的真实 at；同母题数字或情境变式不变成另一类。计数由已保存进入事实决定，不能只数答对题，也不能在暂停、失败、切块或跨天后复位。投影的 remaining 是唯一展示额度，不在界面重新算。

暂停只在原 block 保存 endedAt，保留未结束 round 的全部呈现与进入事实。`resume-round` 先结束其他活动段，再移除原 block 的暂停结束标记，沿同一个 round 和原额度继续；先处理来源 hold。确定结束轮次时保存 round.endedAt 与 endReason（complete、budget-exhausted 或 stopped），之后保留结束事实。上一复习轮次明确结束后，后续学习日可依真实到期事实开启一次有界复习，同日不能返还额度。当天另开额外复习须有上一轮结束后孩子明确的“再复习”请求，保存 moreReview.afterRoundId 与原 request；新目标学习也不能重置当天自动复习额度。每日安排及跨天所有权见 [每日安排](daily-planning.md)。普通“继续”不等于追加复习。

## 来源与等待

source-unavailable / source-pending 时只执行投影允许的核对、切换或休息。原课堂同步按 [官方反馈](openmaic-feedback.md) 保存、CLI 校验、独立消费并推进 checkpoint；原生来源核对使用原 Session 的真实历史。queued/coalesced 只表示已排队或已有核对任务，不代表回答已保存或下一步已完成。合并中的返回任务只同步；结果显示后孩子可再次明确继续。

未知日期、帮助或原来源保留未知。原官方记录未能成为有效证据时可以展示差异；只有投影允许时才补独立检验，不能修饰原记录来通过掌握判据。结束或切换保留待评价回答，迟到评价写回原身份。
