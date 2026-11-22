# OpenMAIC 教学与恢复

一次 Student 安装固定官方 `@openmaic/dsh-openmaic@0.4.0`（修订 `09c1693cfe83224db89fdd4abd245ac9174d3a05`）。官方四个工具为 `openmaic_generate`、`openmaic_slide`、`openmaic_widget`、`openmaic_render`；四个 DSH skill 为 `openmaic-teach` 及对应三个编写契约。完整课堂、独立交互组件、卡片和课件均可直接用于当前目标。slide/widget/render 呈现 agent 编写的内容，generate 由官方服务异步生成课堂。

## 选择并教学

先读取正式学习文件中的稳定 learnerId、termId、当前 blockId、选定目标、母题和已有证据。身份缺失须由家长确认并由 agent 写入；不得从服务账号、工作区或 DSH Session 猜测孩子身份。当前目标适合操作时加载 `openmaic-widget`，编写 simulation/game/code 文档后调用 widget；图解或提示可用 render，结构课件用 slide。组件点击、组件即时评分、观看、生成成功和自报学完都不自动形成学业证据；直接组件通过原生真实作答形成证据。

完整课堂调用 `openmaic_generate`，传入稳定 learnerId、termId、blockId 和明确 requirement：目标、范围、困难、兴趣情境及接受证据。初次返回结构化 status/jobId/pollUrl/base；立即由 agent 保存课程生命周期到 `.study/openmaic-lessons.json` 并运行只读 CLI。状态 generating 时继续原 blockId/jobId；刷新、超时、换科目或服务中断均不得新建替代课堂。Host 保留任务传输身份，但不写学习文件。ready 后通过 [真实反馈导入](openmaic-feedback.md)准备并保存原题面与学习归属，再打开无凭据课堂 URL。失败、未知提交结果或身份冲突保留当前活动；先检查原任务，家长恢复服务后继续。

## 授权与课堂作答

默认官方 `https://open.maic.chat`，家长高级设置可指定原有自建服务。Host 设置引用 DSH 受限凭据中的账号、密码、访问码与 Token；模型不得读取这些值，不使用 shell/curl 携带凭据。访问码用于生成门禁，账户 auth_token 才用于读取本账户学习记录。Host 在 Token 剩余不足 24 小时续登，同账号/learner 验证后才替换缓存；401 最多续登重试一次，403/404 保留拒绝，不循环登录。

调用 `openmaic_feedback` 读取已授权原 records；按 [真实反馈导入](openmaic-feedback.md)核对课堂归属、原学习段与 learner，再保存原回答、官方批改、待核对事实与实际帮助/日期。历史题面版本未核实不套用当前题面。所有学习回答、评分和复习仍由 agent 写入并校验，Host 不自动入账。

浏览器登录态与 Host 分开。官方 `/api/auth/login?from=<无凭据课堂地址>` 是支持的家长恢复入口；登录挑战或账号不明确时请家长完成官方登录再继续原课堂。此入口不声称浏览器已经自动续登，不能把后台 200 当作播放器成功。不要构造带 Token 的课堂链接或绕过官方回调校验。

## 按需方法资源

读取 [24 项目录](../openmaic/README.md) 与 `../openmaic/manifest.json`。优先按当前目标选择核心素养、理解本位、最近发展区、费曼、学会学习、深度交互或事实核查；先读选中方法的 `student-adaptation.md`，再读需要的官方来源与 references。每项保留来源修订、依赖、适用范围与兼容结论。官网 create_stage/generate_scene/read_stage/patch_stage/import_pptx 等工作流没有通过安装 DSH 插件自动获得；不把 method 名称写进 requirement 就报告执行了官方方法。
