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

开发者在插件仓库构建后使用 `node packages/winterhuan/student/lib/cli.js`。`study-validate` bin 指向同一文件，但 DSH Git 安装不承诺将它加进 shell PATH。schema/example 输出按需生成，不常驻在工具参数中。kind 可用 term-settings、block、worksheet、collections、openmaic-lessons、figure；figure 的 example 输出全部 23 种。示例是结构起点，不能当学生已学内容或用户确认。

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

每次新增身份都使用新的稳定 ID，文件名与所属身份一致。设置保留当前 termId；新学期创建新 termId。当前题只存在于所属学习段/卷中；评价引用 responseId，不能用局部题号跨段查找。原回答和已使用题目内容冻结；替换内容使用新题 ID，评价更正沿用回答 ID。每题都保存 objectiveId、来源、答案和可复查依据。

## 校验结果与恢复

validate 成功退出 0，输出实际读取的文件 kind、身份和观察版本。日志可缺失；学期设置不可缺失。归档设置返回 archived。只列最多 100 份文件和 20 个问题，完整验证摘要最多 32 KiB，omittedFiles/omittedIssues 明确遗漏；完整文件仍用原生 read 或 `study_status` 分页查看。schema/example 是显式请求的完整资源输出。

失败退出非零，JSON issues 给出 path、field、rule、correction。保留无效字节，读取具体文件并修复相关字段，再重新校验全部操作。CLI 不写业务文件、revision、备份或恢复。原生/ shell 写入没有应用手动保存的 CAS 保证；观察变了先重读，不能覆盖竞争保存。消费者不得把旧展示当当前成功。

回答写入、评价写入和多文件操作可部分完成。恢复先检查 termId、实体 ID、实际字节和已有 responseId；复用已保存回答，不再增加答案、星星或独立日期。每一步保留未完成的其他工作。CLI 没有原生 Session 观察；自填 receiptAt 和 inputVersion 的有效结构不证明回答日期。Host 独立匹配后才提供有效时间，不能伪造匹配信息。

`study_status` 的 `native` 给出独立观察的 `cut.sessionId`、已消费 `inputs` 的 messageId/inputVersion/原话及 receipt。只有原话完整且 receipt.kind 为 known 时，才用该版本和 receipt.at 保存对应原生来源。来源 unavailable、时间 unknown 或原话不可用时保留未知；omitted 明确省略的旧输入数量，不能把最近一条输入借给其他回答。admissions 的 pending/claimed/consumed/removed 是已记录的消息状态，和业务回答、评价保存无关；重试先用 requestId/messageId 核对，omittedAdmissions 表示省略数量。文件版本和 Session cut 是两个不同观察。

Host 只匹配当前授权 Session 的接收来源。其他 Session 的已保存回答继续保留，但从当前 Session 读取时原生日期可能变为未知；不能用当前输入补写或替换旧来源，也不能宣称已经跨会话核实。

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

同一导出提供 `readWorkspace`、`backupVersions`、`describeMigration(read, backup, existing)`、`describeRestore(read, chosen)` 和 `describeArchive(source, archive, active)`；完整输入说明在包内 `lib/types/files/recovery.d.ts`。`read` 使用 `readWorkspace` 的当前观察；迁移的 backup 是单独读取且版本稳定的原字节 `ObservedFile`，existing 是已校验的输出。中断迁移保留此前源观察，或单独读取原 v1 来源并校验，再比对现有输出。恢复的 chosen 是家长选定的 `readBackups` 项；归档的三个参数分别是原学期、导出目录与当前活动学期的独立读取。描述只读，输出文件仍由原生工具逐项写入。

旧 `.study/state.json` 先保留原字节、摘要与备份路径。使用随包 `./files` 的 `describeMigration` 逐项 outputs；不要根据旧评分时间、照片接收时间、默认 independent 和未保存的答案补出新事实。无法核实的字段保留 pendingLegacy、未知日期/帮助和来源。迁移路径含 termId 和实体身份，部分写入时先比对已有输出后继续；最后 CLI 校验并读取消费者。

归档前确认家长意图并结束活动段，保存其待评价回答。按描述保留学期所有源字节到 `.study/archives/<termId>/`，逐项检查已有输出；报告未完成文件。新学期另建 termId，不重用旧身份。CLI 校验当前学期不等于归档副本逐字节完整，必须独立比对归档输出。

应用在 `.study/backups/` 留最多三份已观察有效版本/实体，总共 128 份和 32 MiB。备份不覆盖未曾观察过的原生或 shell 写入。恢复先读取候选并说明对应源版本，等待家长明确选择；保留无效原件再写所选有效内容，随后 CLI 和消费者重读。未知或较新格式保留原样，用兼容版本检查。
