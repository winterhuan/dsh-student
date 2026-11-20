# 生成 OpenMAIC 互动课

在已经配置的 OpenMAIC 服务上操作。这份说明只覆盖：拼 requirement、用 curl 生成、轮询、把课记到工作区、在对话里给出裸 URL、失败重试，以及课后摘要和巩固题。

不要做这些事：clone OpenMAIC、启动或重启它的容器、配置模型密钥、Live Demo、openclaw，以及把 `skills/openmaic` 或 `agent-runtime` 整包拷进学习工作区。不要把课堂嵌进侧栏 iframe。不要做静态导出播放器。

## 地址、访问码和 cookie

先 `study_status`。使用有效结果 data.openmaic.baseUrl。家长在工作台保存的地址优先，否则是运行 DSH 的环境变量 `OPENMAIC_BASE`，都没有时是 `http://localhost:3000`。不要自己再猜端口。

访问码只在环境变量 `OPENMAIC_ACCESS_CODE` 非空时使用。先对同一 cookie jar 执行 `POST {base}/api/access-code/verify`，JSON 正文只有 `code`。验证失败就停止，并说明访问码被拒绝。不要把访问码、cookie 文件或 Authorization 头写进档案、`.study/openmaic-lessons.json`、命令回显或对话。

`web_fetch` 访问不了 localhost。生成、轮询、retry 和拉 stage 都用当前 shell 的 curl。Linux 和 macOS 用 bash；Windows 上该模式提供的是 PowerShell，用 `curl.exe`。每一次请求都带上同一个 cookie jar：`openmaic.cookiePath`（`.study/openmaic-cookies.txt`）。先 `mkdir -p .study`。拼 JSON 用 node 读环境变量，不依赖 jq。

轮询 URL、retry 和 stage 只打 `baseUrl` 的主机。相对路径拼到 base 上。绝对 URL 的协议和主机必须与 base 相同，否则停止并记一条失败，避免 cookie 被送到别的主机。

## 拼 requirement

1. 读 `study_status` 的 `recommendation`。没有时长限制，不因已学多久取消生成。
2. 家长或孩子指定了学习目标就用那个 `objectiveId`，否则用今日建议里的目标。用 `kind=curriculum` 或 `kind=elements` 取标题、定义和可考事实，不要把整册地图或课页塞进 requirement。若建议带 `unitName`，或学校进度能对上单元名（例如欢乐购物街），把这个单元名写进场景。
3. 在工作区根目录和 `.study/` 查找 `openmaic-requirement-*.md`。先核对科目和目标，只合并当前课程相关的简报；同一目标有多份时用修改时间最新的一份。没有匹配简报就只用目标、事实、兴趣标签和单元名。
4. `requirement` 写成一段中文：年级、科目、目标、两三条可考事实、`interests` 里的一个标签（优先 `interestFocus`，下一节课可以换）、已知的校内单元名、希望孩子在课上做什么。场景壳子见 `interest-hooks.md`。事实仍只核知识地图，不把兴趣写成知识点。`materialIds` 只有用户已经给出 OpenMAIC 材料 id 时才附上，不要编造。

常规知识讲解优先用简短 slide 和 quiz，通过口头回答或选择题互动。只有学习目标或用户要求需要操作演示时才要求 interactive 场景，并缩小到一个操作。requirement 中的场景数量、类型和“不要 TTS／图片／视频／检索”都是文本要求；`generate-classroom` 只接收 requirement 和 materialIds，媒体与检索能力取决于 OpenMAIC 服务配置。不能承诺文本要求会关闭这些能力，也不要添加服务不支持的开关字段。

## 生成和轮询

正文只有 `{ "requirement": "...", "materialIds": ["..."] }`，没有材料 id 时不要带 `materialIds`。下面是 bash 示例；PowerShell 用 `curl.exe`，把 `$BASE` 写成 `$env:BASE`，cookie 参数不变。

```sh
BASE='http://localhost:3000'   # 换成 study_status 的 openmaic.baseUrl
JAR='.study/openmaic-cookies.txt'
mkdir -p .study
# 仅当 OPENMAIC_ACCESS_CODE 非空时。node 用 UTF-8 写临时正文，不要 echo，用完即删。
node -e 'require("node:fs").writeFileSync(".study/openmaic-access-body.json", JSON.stringify({ code: process.env.OPENMAIC_ACCESS_CODE }))'
curl -sS -c "$JAR" -b "$JAR" -H 'content-type: application/json' \
  -d @.study/openmaic-access-body.json \
  "$BASE/api/access-code/verify"
node -e 'require("node:fs").rmSync(".study/openmaic-access-body.json", { force: true })'
node -e 'require("node:fs").writeFileSync(".study/openmaic-generate-body.json", JSON.stringify({ requirement: process.env.REQ }))'
curl -sS -c "$JAR" -b "$JAR" -H 'content-type: application/json' \
  -d @.study/openmaic-generate-body.json \
  "$BASE/api/generate-classroom"
node -e 'require("node:fs").rmSync(".study/openmaic-generate-body.json", { force: true })'
```

请求分别检查 curl 退出码、HTTP 状态和 JSON 正文，可用 `--connect-timeout 5 --max-time 30 -o <响应文件> -w '%{http_code}'` 保存响应。网络超时只表示本次请求结果未知，不能据此判定后台任务失败或重复提交 requirement。

`POST /api/generate-classroom` 返回 202。从 JSON 记下 `jobId`、`runId` 和 `pollUrl`。先把一条 `status: generating` 的记录写入课表，再开始轮询。

轮询大约 60 秒一次，不要更密。bash 用 `sleep 60`，PowerShell 用 `Start-Sleep -Seconds 60`。用同一个 cookie jar `GET` pollUrl。最多 20 次。

根据成功读取的任务 JSON 更新记录：

- `status: succeeded` 且有 `result.classroomId` 和 `result.url`：记为 `ready`。保存 `result.warning` 并告诉家长。
- `status: failed` 或 `runState: paused/ended`：记为 `failed`。保存实际 error、runId 和 retryable。`retryable: true` 表示服务允许恢复，不能保证下一次成功。
- `status: queued/running` 且 `done` 不为 true：保持 `generating`。可报告 progress 和 scenesGenerated/totalScenes。正常响应也有 `retryable: false`，字段存在与否不表示失败。
- 非 2xx、网络失败、非 JSON 或无法识别的状态：保留最后一次已确认状态，把查询问题记入 warning。401/403 先处理访问码，404 检查记录中的 base、身份和同一 cookie jar；其余查询失败稍后继续 GET。不要从查询失败推断任务已失败，也不要从顶层 `success: true` 推断课程已完成。

20 次后仍未结束：保留 `generating`，warning 写「本次查询已结束，后台仍在生成，可继续查询」。用户点「继续查询」时，先读取日志中对应 id，使用该条的 base、pollUrl 和同一 cookie jar 恢复 GET。旧记录即使写成 failed，也按实际响应修正。课程完成或成功恢复查询后清除过期的查询 warning，确认恢复生成或完成后清除旧 error。不要重复 POST requirement。

## 记课

课程日志是独立的 `.study/openmaic-lessons.json`，严格定义和示例用随包 CLI 的 schema/example openmaic-lessons 按需读取。用原生 read 检查当前日志，直接创建或编辑 lessons 中同一稳定 id 的生命周期记录，再运行 validate；不要吞掉 JSON 错误、清空无效日志或根据展示的二十行覆盖其余课程。日志最多八十行，实际字段与时间格式以生成 schema 为准。

保留实际 createdAt，更新 updatedAt。生成中记录 jobId 与 pollUrl；失败保存实际错误、retryable 与 runId；成功保存 classroomId、url 和 warning。没有返回的身份或链接保持缺失，不能猜。访问码、cookie 和认证头只在 shell 环境/独立 cookie jar 中，模型可见业务文件不保存它们。服务日志保存和 CLI 校验完成后才报告“课程记录已保存”。

## 对话里怎么给链接

成功后在对话里先用一句孩子能懂的话说明课好了。下一行只放课堂 URL 原文，单独一行，前后不要加括号、反引号或 Markdown 链接。若有 `warning`，用另一句告诉家长。请家长用系统浏览器打开这一行。工作台的「在浏览器打开」做的是同一件事。

可以问孩子要不要记一段学习时间。要的话，该科已确认学校进度就创建 mode 为 school 的 block，否则用 explore，保存历史 context 并校验。这只是可选的学习记录外壳，不要说系统会关掉页面。

## 失败后重试

先读取对应记录，用记录的 base、pollUrl 和同一 cookie jar 查询最新状态。课程已完成就更新链接；仍在生成就继续查询。只有服务确认 `status: failed`、`retryable: true` 且有 `runId` 时，才 `POST {base}/api/generation-runs/{runId}/retry`。

正文必须包含调用方创建的 `commandId`，例如 `{ "commandId": "<crypto.randomUUID() 生成的 UUID>" }`。发送前把它保存到同一条课程记录并校验。每次新的恢复尝试用新 id；同一次请求因超时等原因需要重发时复用该 id，服务会按 id 去重。响应只返回 state、seq 等结果，不能等服务返回 commandId，也不能发送空对象。

仅在 retry 请求明确被接受后，把记录改为 `generating` 并清除旧 error、warning 和 retryable。继续 GET 原 pollUrl；响应若明确给出新 pollUrl/jobId 才替换。409 时重新查询状态，429 时保留失败记录并说明服务繁忙，网络结果未知时先查询再决定是否复用 commandId 重发。不要再次提交 requirement。

retry 会重新执行原失败步骤并保留已生成内容。同一幕反复超时，或出现明确的内容过滤拒绝时，先报告实际原因并检查需求、场景复杂度和服务配置，避免无变化地连续重试。需要调整大纲时，按用户的课程目标重新生成并保留旧记录；可将复杂操作拆小，或改成 slide 讲解加 quiz。不能声称 retry 会自动替换原大纲。

## 课后摘要和巩固题

孩子上完课后，用同一 cookie jar：

```sh
curl -sS -c "$JAR" -b "$JAR" "$BASE/api/stages/$CLASSROOM_ID"
```

从 JSON 里取大纲和场景，不要把整份 stage 贴进对话或课表。优先用字符串字段 `outline`。没有它时，从 `scenes` 数组取每场的 `title` 或 `name`，以及一句 `summary` 或 `description`，最多 12 场。写成记录上的 `summary`：

- `fetchedAt`：ISO 时间
- `outline`：大纲或各场标题连成的短文，不超过 2000 字
- `scenes`：`{ "title", "summary"? }` 列表

然后出 2 到 5 道巩固题。走现有出题和作答：对话里一次一题，block.questions 带上这节课的 objectiveId，保存原回答后评价并校验；家长要纸上卷时保存正式 worksheet，worksheetKind 写 practice 并校验，题量不超过 5。题目要能用摘要和该知识点的 `facts` 核对，不要照抄舞台动画里孩子没看到的句子，也不要另做播放器。出题细则仍以 `questions.md` 为准。
