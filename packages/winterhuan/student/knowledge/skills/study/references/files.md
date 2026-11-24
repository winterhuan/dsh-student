# 正式文件与校验

所有默认业务操作都在当前原生对话中完成：先观察正式文件和版本，按确认意图直接编辑，再运行只读 CLI，最后读取消费者的有效结果。文件工具成功只说明写入完成；CLI 成功只说明它读取的文件有效；界面独立读取当前版本。

## 找到随包 CLI

DSH 加载技能时给出的 Base directory 是 `knowledge/skills/study`。相对于该目录，CLI 是 `../../../lib/cli.js`；安装包不要求全局 PATH，也不要求用户源码仓库。把实际绝对位置代入：

```sh
STUDY_CLI='<study Base directory>/../../../lib/cli.js'
node "$STUDY_CLI" --help
node "$STUDY_CLI" schema term-settings
node "$STUDY_CLI" example term-settings
node "$STUDY_CLI" validate --workspace '<当前工作区绝对路径>'
```

开发者在插件仓库构建后使用 `node packages/winterhuan/student/lib/cli.js`。`study-validate` bin 指向同一文件，但 DSH Git 安装不承诺将它加进 shell PATH。schema/example 输出按需生成，不常驻在工具参数中。kind 可用 term-settings、block、worksheet、collections、openmaic-lessons、capability-goal、question-family、knowledge-extension、figure；figure 的 example 输出全部 23 种。示例是结构起点，不能当学生已学内容或用户确认。

结构 schema 来自共享 Zod 输入定义；CLI 再核对身份、关联、范围、帮助与已观察使用内容。日期合法性和其他跨字段规则以 CLI 为准，不以 JSON schema 独立判定业务完成。

内置目标的新题默认使用 context.profile 的历史年级与学期；跨册时保存明确的 context.scope，目标必须属于该册且在所选单元或目标范围内。浏览不授予新范围。intensity 仅用于 diagnose 学习段，摸底题省略 phase。review 学习段的新题必须绑定同科同目标的已确认 mistakeId；prepared 练习单的错题巩固题更换原题面，workbook 记录保留原题。旧题的待核实事实与已观察使用内容的冻结绑定继续保留，不按来源错题的当前分类重写历史。

## 文件归属

| 文件 | 所有内容 |
|---|---|
| `.study/settings.json` | format 2，kind term-settings；稳定 termId、revision、updatedAt、档案、教材、课程及学校进度、兴趣和 OpenMAIC 地址 |
| `.study/blocks/<id>.json` | format 2，kind block；一个学习段的历史 context、范围、题目、原回答、提示、卡住与评价 |
| `.study/worksheets/<id>.json` | format 2，kind worksheet；冻结题目/目标、全卷日期、转录草稿、所有确认原回答与评价 |
| `.study/collections.json` | format 2，kind collections；错题、题库、确认概念/目标/关系、教学队列和奖励 |
| `.study/openmaic-lessons.json` | format 1；独立课程生命周期，不存学生作答或 cookie |

每次新增身份都使用新的稳定 ID，文件名与所属身份一致。设置保留当前 termId 和稳定 learnerId；新学期创建新 termId 并保留同一孩子的 learnerId。缺少 learnerId 的旧格式2档案先核对身份，不能用家长账号、MAIC 账号或 DSH Session 代替。当前题只存在于所属学习段/卷中；评价引用 responseId，不能用局部题号跨段查找。原回答和已使用题目内容冻结；替换内容使用新题 ID，评价更正沿用回答 ID。每题都保存 objectiveId、来源、答案和可复查依据。

## 能力、母题与历史引用

能力内容在 `../../../knowledge/curriculum/capabilities/`，不写入学生回答。通过共享 `queryWorkspace` 的 capabilities、families、knowledge-sources 查询按需读取；完整目标、方法、变式约束与来源保留在目录。旧教材地图继续提供教材位置；整单元旧评分不授予拆分后的所有能力。工作区内容扩展写在既有 collections 的 knowledge 字段；相同能力、核心解法和结构只有一个有效母题，数字或情境变式保留为实例。

新能力题的 objectiveId 是稳定能力 ID，并保存 capability 的 goalId、familyId 和 scope；scope 包含独立 id、描述、表现形式及适用数域或词表。核对后的旧错题可在 collections.mistakes 的声明上保存相同 capability，objectiveId 必须等于 goalId；按同科同目标、母题和等价范围归并显示，所有原实例继续保留。这项归类不改写冻结旧题，不补授作答证据；改题面或目标后需重新核对归类。已全部评分且无待核对草稿的练习单可原位保存 archivedAt；日常列表收起，worksheets 查询指定 id 可查原记录，原题与作答证据继续保留。听、说、视听和实际操作分别保留对应证据。保持当时的题面、选项、答案依据和范围；母题更新不改写已使用实例。

settings 的 evidenceReferences 引用原 learnerId、termId、ownerKind、ownerId、responseId、goalId 与 scope；可保留复习的 mistakeId、stage、dueAt 和 independentDays。原文件位于 `.study/archives/<termId>/blocks|worksheets/<ownerId>.json`。先独立核对原学生、原回答和兼容范围，不能仅凭结构校验继承掌握。数域或词表扩展重新检查；未完成复习保留原到期日与阶段。

补检与复习的原轮次、已呈现题目、进入母题及暂停恢复事实保存在学习段，规则见 [继续与轮次](continuation.md)。

## 校验结果与恢复

validate 成功退出 0，输出实际读取的文件 kind、身份和观察版本。日志可缺失；学期设置不可缺失。归档设置返回 archived。只列最多 100 份文件和 20 个问题，完整验证摘要最多 32 KiB，omittedFiles/omittedIssues 明确遗漏；完整文件仍用原生 read 或 `study_status` 分页查看。schema/example 是显式请求的完整资源输出。

失败退出非零，JSON issues 给出 path、field、rule、correction。保留无效字节，读取具体文件并修复相关字段，再重新校验全部操作。CLI 不写业务文件、revision、备份或恢复。原生/ shell 写入没有应用手动保存的 CAS 保证；观察变了先重读，不能覆盖竞争保存。消费者不得把旧展示当当前成功。

回答写入、评价写入和多文件操作可部分完成。恢复先检查 termId、实体 ID、实际字节和已有 responseId；复用已保存回答，不再增加答案、星星或独立日期。每一步保留未完成的其他工作。CLI 没有原生 Session 观察；自填 receiptAt 和 inputVersion 的有效结构不证明回答日期。Host 独立匹配后才提供有效时间，不能伪造匹配信息。

`study_status` 的 `native` 给出独立观察的 `cut.sessionId`、已消费 `inputs` 的 messageId/inputVersion/原话及 receipt。只有原话完整且 receipt.kind 为 known 时，才用该版本和 receipt.at 保存对应原生来源。来源 unavailable、时间 unknown 或原话不可用时保留未知；omitted 明确省略的旧输入数量，不能把最近一条输入借给其他回答。admissions 的 pending/claimed/consumed/removed 是已记录的消息状态，和业务回答、评价保存无关；重试先用 requestId/messageId 核对，omittedAdmissions 表示省略数量。文件版本和 Session cut 是两个不同观察。

普通输入框、Headless 和 `/study` 回答沿用实际消费的原生消息。Host 在空闲接收时冻结已独立读取的 learner/term/block/question、题面和文件版本，在模型回合前复核原话及当前版本；成功时 `native.inputs[].learningScope` 给出稳定 responseId。只把该输入关联到返回的原归属。运行中排队的普通输入、缺失捕获、文件或题面变化均保持归属未知，不能按读取时的当前题补关联。tool、skill、系统消息和 student-sync 不提供孩子回答。

Host 可在同一规范工作区、当前会话访问授权下重读明确引用的原主 Session；原历史中必须有完整归属与精确消费来源。原历史不可用或不匹配时保留未知日期。不能用当前输入替换旧来源；当前 Session 的创建时间、消费时间和写入时间也不是旧回答日期。

## 迁移、归档和明确恢复

随包 `./files` 的实际文件是 `<study Base directory>/../../../lib/files.js`。原生 Node 可直接导入，不需要源码或全局包解析；以下只读命令列出已校验备份，供家长选择：

```sh
STUDY_FILES='<study Base directory>/../../../lib/files.js'
node --input-type=module - "$STUDY_FILES" '<当前工作区绝对路径>' <<'JS'
import { pathToFileURL } from 'node:url'
const { nodeStudyFiles, readBackups } = await import(pathToFileURL(process.argv[2]).href)
const result = await readBackups(nodeStudyFiles(process.argv[3]), new AbortController().signal)
console.log(JSON.stringify({ candidates: result.backups.map(({ path, backup }) => ({ path, sourcePath: backup.sourcePath, version: backup.version, sha256: backup.sha256 })), issues: result.issues }, null, 2))
JS
```

同一导出提供 `readWorkspace`、`backupVersions`、`describeMigration(read, backup, existing, learnerId, recovery)`、`describeKnowledgeMigration(read, learnerId, recovery)`、`describeRestore(read, chosen)` 和 `describeArchive(source, archive, active)`；完整输入说明在包内 `lib/types/files/recovery.d.ts`。`read` 使用 `readWorkspace` 的当前观察；迁移的 backup 是单独读取且版本稳定的原字节 `ObservedFile`，existing 是已校验的输出。中断迁移保留此前源观察，或单独读取原 v1 来源并校验，再比对现有输出。恢复的 chosen 是家长选定的 `readBackups` 项；归档的三个参数分别是原学期、导出目录与当前活动学期的独立读取。描述只读，输出文件仍由原生工具逐项写入。

旧 `.study/state.json` 先保留原字节、摘要与备份路径，并传入明确核对的 Student learnerId；重试可沿用已保存输出中的身份，文件摘要不能识别孩子。使用随包 `./files` 的 `describeMigration` 逐项 outputs；不要根据旧评分时间、照片接收时间、默认 independent 和未保存的答案补出新事实。无法核实的字段保留 pendingLegacy、未知日期/帮助和来源。迁移路径含 termId 和实体身份，部分写入时先比对已有输出后继续；最后 CLI 校验并读取消费者。

格式2的活动学期和归档逐学期在隔离副本调用 describeKnowledgeMigration。缺少身份时必须传入明确核对的 learnerId，否则描述返回 blocked；已有身份保持不变，不能用学期标签或共享账号生成孩子身份。原题、选项、回答、评分、帮助、日期、归档时间和课堂日志保留；旧 ID 的 pending/review-required 去向不授予掌握。相同身份的重试不创建回答、复习、母题或奖励。

两种迁移的 recovery 都包含独立读取的原字节 backups 和 readLessonFile 返回的 lessons；课堂日志缺失也须实际读取确认。V1 的 backup 参数提供 state.json 原件，backups 另含已有课堂日志；格式2的 backups 包含全部正式文件及课堂日志。preservedSources 返回每个原路径、备份路径和 SHA-256；先保存该清单与旧 ID 映射，再按输出逐文件写入。未绑定旧课堂保持 pending，不自动补 learnerId、termId 或 blockId。新版本或不完整日志返回 blocked 且不给可写输出。归档使用路径重映射的 StudyFiles 读取，保留原 termId；按同一流程逐个处理全部归档，不能只检查当前引用的学期。

格式2输出将 settings 放在最后。恢复时以保留原件重新取得 source read，将当前输出的独立 readWorkspace 观察放进 recovery.current；write-needed 才写，already-valid 跳过，conflict 或 blocked 先保留并核对并发变更。partial 仍未完成，complete 只说明该份计划已保存；再运行 CLI、重新创建读取器并核对原答案数、评分、复习和奖励。已验证备份用于回退，不让旧插件强读或降级覆盖未知新格式。原生工具单文件版本保护不能覆盖 shell、多文件迁移或归档，逐份失败必须保留已完成状态。

归档前确认家长意图并结束活动段，保存其待评价回答。按描述保留学期所有源字节到 `.study/archives/<termId>/`，逐项检查已有输出；报告未完成文件。新学期另建 termId，不重用旧身份。CLI 校验当前学期不等于归档副本逐字节完整，必须独立比对归档输出。

应用在 `.study/backups/` 留最多三份已观察有效版本/实体，总共 128 份和 32 MiB。备份不覆盖未曾观察过的原生或 shell 写入。恢复先读取候选并说明对应源版本，等待家长明确选择；保留无效原件再写所选有效内容，随后 CLI 和消费者重读。未知或较新格式保留原样，用兼容版本检查。
