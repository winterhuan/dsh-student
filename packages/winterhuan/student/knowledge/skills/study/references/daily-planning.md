# 每日安排与自主学习

## 操作前读取

读取 `study_status kind=daily-plan` 与 `kind=learning-context`。前者返回 `saved`、只读 `preview`、`recommended`、每科 `suggestions`、当前任务、真实作答汇总和范围建议；后者给出实际原题、回答和合法教学动作。历史详情用 `kind=daily-plan id=YYYY-MM-DD`。所有日期按 Asia/Shanghai。

只有用户明确开始、继续、暂停、结束、调整或再学一点才修改安排。页面打开、换科、刷新、午夜和同步返回均只读。用户选择优先，但遵守已有学校进度、家长额外限制、原来源和剩余额度。不要引入每日任务数量配额、轻量/标准每日模式或欠课补齐。既有摸底强度不等于每日负担。

## 沿用已有资料

已有档案直接沿用教材、已确认学校进度和历史学习范围，不因缺少 learningScopes 要求逐科解锁。查询根据这些资料生成 scopeSuggestions；无进度时使用年级目录做简短摸底，不猜学校正在教的单元，也不把没有证据称为薄弱。默认使用书面活动，不能据此评定听说能力。learningScopes 仅保存家长额外指定的内容限制，优先于同科默认建议；不为迁移或自动建议伪造 parentConfirmation。家长主动调整时，保存实际意图和修改后的 settings revision/updatedAt，运行只读 CLI 并独立读取。

## 首次开始

1. 核对意图 `observedVersions` 与计划 revision；读到变化先保留用户选择，重新核对，不能覆盖新记录。原生文件写入仍使用实际文件观察版本；模型声明不能替代冲突检查。
2. 读取当天 `.study/plans/YYYY-MM-DD.json`。已存在则沿原 id、任务与活动继续，不再创建默认计划。消息接收结果未知时先检查原操作，不再次提交回答或课堂。
3. 无计划时使用当前查询 `preview`。选科或明确任务时使用匹配 suggestion，其他内容按实际需要调整。计划 ID 固定 `day-YYYY-MM-DD`；任务 ID 使用投影提供的稳定 ID。计划必须属于已确认 learnerId/termId，timezone 固定 Asia/Shanghai，policyVersion=1。从随包 CLI 读取 `schema daily-plan`。
4. 保存计划 ready 和用户 start choice，随后绑定当前任务的同一 block，并把 `block.plan={day,taskId}` 写回该原活动。将任务与计划设为 active，增加 revision/updatedAt。计划、活动非原子写入：中断后恢复原身份，不新建替代。
5. 运行只读 CLI，再独立 study_status 读取两个文件实际版本。只有来源接受且绑定一致才开始呈现；保存计划但尚无 activity 时说明准备未完成，继续原安排。

## 接续已有活动

升级前的 active block 可能没有 `block.plan`。查询会在 `tasks` 和 `currentTaskId` 中只读投影该原活动，`saved` 仍表示真实保存的计划；打开、查看今日收获和返回首页都不写文件。

孩子首次明确继续、暂停或结束时，使用该投影任务登记原活动。当日无计划时，沿用 `preview` 的计划元数据，但 `tasks` 只保留当前原活动，`subjects` 只含其学科，`choices` 只记录本次真实动作、operationId 和时间，不补造 start、历史日期或完成。无 preview 时从随包 schema 创建当天元数据。已有当日计划则保留它，追加该任务和本次选择；计划已完成时该原有活动作为 optional 接续，不改原完成事实。为原 block 添加对应 `plan`，不替换题目、作答、评价、轮次或时间。运行 CLI 并独立复读关联后，再按 continue/pause/stop 设置任务和计划状态。

暂停或结束只保存接续点，不出新题、不把其他建议加入安排。今天已经结束但未关联计划的旧活动也可直接查看今日收获；没有当天实际作答就如实显示为空，不把历史回答计入今天。

任务的 `basis`、`outcomes` 只保存原 term/ownerKind/ownerId/responseId 引用。题目、答案、评分、掌握状态不能复制到计划。`reason` 解释真实选择依据；没历史就探索已会什么，不能称薄弱。`ending` 是 short-check、review-attempts 或 original-activity。任务顺序就是 tasks 数组顺序。

## 回答与推进

回答、提示与不会仍走原题身份。保存回答和评价后重新读取能力投影：有错误/帮助先讲对应方法；证据不足只补缺项；当前检验已满足且范围允许，可以推进下一目标，不必等待三天长期掌握。每轮最多三道新检验题，不能通过换块、改日或重开轮次延长。达到额度可以以待巩固结束本次；后续针对性教学，不无限出题求掌握。

保存评价可以更新已发生事实及任务结束状态，但不能自动呈现下一题。孩子明确继续才修订未开始内容，保留当前题、草稿、回答和轮次身份。修订增加 revision，并追加 choice：稳定 id、实际 at、revision、action、reason、taskIds、replacedTaskIds。被替换项保留为 deferred/skipped；不能删除任务或已有选择。不要因一次错误自动扩大今天的列表。

主任务有实际检验且原活动已结束、或预算已耗尽时，按真实 ending 结束。复习任务需所选各类有实际尝试和可核实评价；错题可以结束本次尝试，但仍需巩固。待评价或来源不明不能称已验证完成。全部原始任务真正 completed 后设置计划 completed、completedAt；停止、跳过、推迟不伪装全部完成。所有掌握、独立日期、复习阶段来自原始证据。

## 暂停、结束和恢复

- pause：尚未完成的计划设为 paused、当前任务 paused，保存原 activity 的 questionId/responseId/roundId。若暂停的是已完成计划中的 optional 活动，只暂停该任务，原计划 completed、completedAt 和原始任务完成状态不变。保留原题与未结束轮次；不返还额度。可以保留 active block 以便原位恢复。
- stop：尚未完成的计划设为 stopped，未完成项保留 paused/deferred；若原计划已完成，只停止当前 optional 活动，保留原完成事实。保留当前题、已提交回答和实际结束情况。今日收获只列真实作答、待巩固、待核对、未完成，不再展示推荐列表。
- continue：先处理同一原回答、来源及活动。原 block 因暂停已有 endedAt 时，先暂停其他块，恢复同一 block 与原轮次；不创建替代题。当天继续复用当天计划，completedAt 一经保存保留；已完成计划只允许明确 extra 添加可选活动。
- extra：孩子明确选择后追加一个 optional=true 活动及 extra choice；原始完成事实不改变，不自动继续追加。若只说“再学一点”，展示可选内容等待选择。
- 跨午夜：原活动保持原计划，实际回答日期来自原始证据，不自动新建计划。
- 后一天明确开始今天：创建今天的计划并引用原任务；新任务 original 直接指向最初 day/taskId，activity 仍指向原 block。同时把 block.plan 更新为今天的 day/taskId，使冷启动直接找到当前所有者；旧当前所有者标记 carried-forward、carriedTo 指向今天；原始 task 不能通过多层链转移。先校验原身份，再修复两文件部分写入。一份活动同时只能有一个待推进所有者。
- 几天没学：按当前需要安排，不累计缺席日任务。

## 复习日期与限制

复习保存 `familyEntries=[{familyId,at}]`，每类首次进入的真实时间不变；不得用作答/评分日期替代。每天自动复习总共最多两类，跨学科、跨计划合计，未结束轮次还受自身原额度约束。同日重开不重新领取；结束轮次在以后学习日可依据真实到期证据开启一次有界复习。明确额外复习保存 moreReview.afterRoundId/request，不能把普通继续当作再复习授权。

## 范围调整与恢复

家长缩小范围后，未开始的不合适任务标记 deferred 并说明原因；当前原题、回答保留，停止新增越界题。扩大范围只提出调整剩余安排，孩子/家长明确继续或调整才修订。临时指定今天内容不能默默扩大长期范围；先确认仅今日或长期变更。迟到评分、历史导入只修正原证据和未来候选，不能重开已完成计划或制造今天作答。

缺失/无效计划不删除原件、不重置学习记录。用独立读取的具体问题恢复原文件/引用，保留用户选择与草稿。最多扫描 1,000 个计划，每个 1 MiB，计入当前学期 32 MiB 限制；达到限制请家长归档或明确调整，不自动清理。CLI 只验证，不写入、迁移或修复。
