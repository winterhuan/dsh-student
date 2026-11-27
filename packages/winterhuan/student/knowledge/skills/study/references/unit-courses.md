# 单元课程与完整互动课

新学使用完整互动课；复习先回忆或尝试，困难才补讲。目录浏览、已保存课堂打开和任务状态查询由界面直接完成，不启动模型循环。不要把课程生成、观看、活动结束或组件分数写成能力掌握。

## 读取与选择

一次 study_status 获取当前状态、相关版本和最新 native.inputs[].intention。按钮选择的学科、suggestion.nextAction.requirement 和 courseAction 优先于旧活动；保留旧题、回答和迟到反馈的原归属。只读取所选目标所需材料、正式文件和本文，不重复加载完整知识库。对相关文件合并独立读取；写入前复核实际版本，变动则保留新回答后重新计算。不要为获取时间戳单独增加模型步骤。

原生回答用同条 consumed input 的原话、inputVersion、learningScope 和 receipt。先保存原回答并运行 CLI；再写评价并运行 CLI、独立读取确认。普通回答目标不超过五个模型步骤，不省略来源验证。运行中排队的未消费输入不能当已保存回答。

## 课程文件

继续使用 `.study/openmaic-lessons.json`，新内容用 `format: 2`，保留原 lessons。用随包 CLI `schema openmaic-lessons` 获取精确字段；`format: 1` 旧记录只读兼容，不自动补造课程。该文件不是作答库。

`courses[]` 保存 id、learnerId、termId、subject、unit、revision、materials 与 sections。教材材料需有 edition、sourcePath、sourceRevision、原单元 directory、真实 confirmation.quote/at；position 为 entering、studying 或 finished，studying 指向 currentSectionId。文件路径为工作区相对路径。保存多个材料修订，既有课堂继续引用原版本。

## 先复用材料，再确认校内同步

开始前只查询一次 `study_status kind=materials subject=所选学科`；items 是登记资料，availableSources 是当前册次可用的知识地图和默认教材入口。地图登记记录不等于没有教材可用，也不证明学校版本已核实。材料选择按下列顺序进行：

1. 用户指定或已关联的真实教材优先，复用已读正文与版本依据。暂时读不到用户教材时说明具体读取问题，不静默换书。
2. 仅有知识地图且有默认教材时，按 [默认教材](default-textbooks.md) 读取目录和相关课页，不要求重传随包已有的封面或正文。学校版本未确认可以按默认教材学习，说明“本课使用默认教材，学校版本尚未核对”。已有课名或明确字词范围时直接定位；只有“认读汉字”等宽泛能力时先从所选单元的已核实 facts、历史范围或课页提取具体字表，不能凭能力名称编造范围。学校具体课文不明且影响选课时只问“现在学到哪一篇？”，不要同时索要整套教材。
3. 没有可用课页但知识地图已有本目标的可考事实时，按这些事实制作完整知识点互动课，自编例句标明来源，不冒称教材原文或覆盖整个单元。先读取 `study_status kind=curriculum` 的具体 facts；概念名称和能力总判据本身不够。范围仍不清楚时只问本课字词或题型，不索要与本课无关的版权页。

用户点击开始或要求学习一个目标，已授权在已确认范围内制作完整互动课；无需再次要求选择 foundation 或接受小课。对于未声明校内同步的默认教材课、知识点课，使用 `purpose=foundation` 和 foundation 学习段，foundationConfirmation 保存这次实际开始请求，不伪造“家长已确认教材”。teaching 仍含六个完整教学环节；materialLimitations 写明实际来源、自编内容及校内匹配限制。完整课仍调用 openmaic_generate，不用复习小课替代。面向孩子只简短说明本课学什么、资料来源及下一步，不展示 foundation、校验字段或备课步骤；没有提交成功前不承诺课程已开好。

只有用户明确要求按学校教材逐课同步或创建完整教材单元时，才要求版本、正文/目录与单元内位置齐全。已有默认教材时先读其版本依据和目录，只问“学校用的也是这本吗？现在学到哪一篇？”；确认一致就复用已有课页，不索要重复照片。只有家长答版本不同、无法辨别或所需正文确实缺失时，才询问对应封面/版权页或当前课页，不一次索要整单元全部照片。缺项时保留用户要求，只问关键缺项，不静默改成知识点课。仅缺校内匹配不阻断用户已选择的知识点课或默认教材课。无相关可考事实或可读正文时才暂停生成；不得假装已读、伪造引句或降低内容审查。

教材录入沿用 DSH 对话附件：家长提供可读 PDF 或当前课文照片，只有版本需要核对时才补封面/版权页或目录。按 [教材与来源](materials.md) 核对并保存，不能让家长编辑 JSON。用户明确请求整理目录但正文尚缺时可建 materials 为空的目录草稿，说明待补资料。

sections 按数组顺序排列，包含稳定 id、title、goalIds、scope、kind=lesson/synthesis、prerequisiteIds 及已确认 materialRevision。不要把整单元作为一个能力。默认不超越校内位置；提前学习需要真实 advanceConfirmation。单元综合课仅在 position=finished 或显式 testPreparation 确认后建立，sourceLessonIds 引用原课堂，需求说明实际覆盖及证据缺口。

## 首次生成与恢复

1. 学习段 mode 与课堂 purpose 是不同字段：school 仅用于 settings 中已经确认且匹配的真实校内课程；自编教材使用 foundation 学习段，完整单元课仍可用 purpose=full，不能为通过校验把自编教材写成学校教材或伪造地图单元。暂停旧活动，按 daily-planning.md 同时协调旧计划、新活动、当前计划；不修改原课堂 blockId。校验失败时修复原关联，不新建替代记录。
2. 建立当前课节的学习段和稳定 lesson id。课程行使用 purpose=full/synthesis；基础课 purpose=foundation。写 learnerId/termId/blockId、subject、requirement、base、createdAt/updatedAt、status=planned。course 保存 id/sectionId/revision/materialRevision，目录 section.lessonId 反向引用。
3. teaching 保存 revision、goal、scope、materialLimitations、introduction、explanation、demonstration、guidedPractice、independentPractice、summary、maxAssessmentQuestions（1–3）。这些字段只保存最终教学要求，不写草稿推演、被否决例句或历史问题全文。independentPractice 必须与 questionPlan 的题数、题型及作答方式一致，不再另行要求清单外的题。引导与示范在讲解场景呈现，quiz 总共最多三题，不能换块重置额度。
4. 同一行保存 questionPlan：revision、source={path,sha256}、target={goalId,familyId,scope}、questions（1–3题）。source 是工作区内可读 UTF-8 材料，sha256 为文件原始字节哈希。默认课页须实际看图核对后，将本课所需正文摘录、书名、书页和原课页路径保存为材料快照；知识点课保存实际读到的 facts、地图/知识点 ID 及自编例句标记，不把未校对 TXT 或模型回忆当原文。教材课必须是 course 引用的原材料路径。每题保存 id、type=single/multiple/short_answer、question、options=[{value,label}]（简答可为空）、answer（选项 value 或简答标准）、analysis、sourceQuote（原文逐字引用）、completedAnswer（答案代回的完整句子或完整作答）。先独立解题，确认语法、事实、唯一性与判分依据；不把答案唯一当作语言正确。材料和完整生成需求合计不超过8000字符，过长时拆课，不能截断或换用未确认来源。
5. CLI validate 成功后，调用 openmaic_generate，requirement 与已保存行一致。工具自动独立审题并追加材料、完整题目、教学计划与题量限制；不要手工重复追加。返回 review-rejected/submitted=false 时尚未提交，按 issues 修改当前计划再校验，最多自动修订一次后仍失败则说明具体问题并结束；不得称课程正在生成。超时或无法判断保持待审。保存原返回 jobId/pollUrl/learnerKey、状态与课堂身份。只提交当前课节一次。
6. 生成中立即告知任务已受理并结束模型回合，由面板查询真实状态。超时且是否受理未知，行标 unknown 并保留原 block；不得换 ID 重试。页面结果 ready 但文件尚未保存时，用同一 owner/job 恢复并补写，不能重新提交。
7. 新版本只能在旧任务结果确定且用户明确要求时创建新 block/lesson，replacesLessonId 指旧版本并保留旧引用。不假定服务支持失败任务重试。

## 内容检查与学习

ready 只表示生成成功。调用一次 `openmaic_feedback action=review lessonId=...`，Host 读取全部实际场景和原材料，在无历史、无工具的独立模型请求中逐题代回答案并检查语法、事实、歧义、判分、范围及六环节。完整输入超过上限、输出缺项、超时或不确定均不放行。相同来源、计划、课堂、模型和审查规则命中受保护缓存；查询状态与打开课堂不调用模型。

工具返回 quality、feedback 和 questions。按原样保存 quality 与 feedback，并将 questions 保存到原学习段；无需准备锚点题，也无需先分页读取内容。quality 包含真实 reviewId/contentHash、场景和原题身份。不得自己生成或修改 passed 声明。CLI 校验后由应用再次验证。需要人工定位时使用 action=content 分页读原场景。

任何病句、错误事实或解析、歧义、不完整审查均 rejected；界面保留原因并禁止播放。服务若增删或改写已审题目的题干、选项、答案、解析，也拒绝。官方接口只有生成需求，不能保证原样保留题目，不能宣称已有受控题目注入或原地修补能力。旧任务没有独立预审凭证时不能补写通过，应保留旧版本并在用户明确选择重新制作后建立新版本。已提交任务的原 questionPlan、材料和 owner 不可改绑。

失败后的修正必须以具体问题为依据。生成前尚未提交可改当前草稿；生成后保留原课堂、原题和所有回答，明确重新制作才建立新 block/lesson 和 replacesLessonId。禁止自动无限重试。工具不写孩子的回答、评价或掌握状态。

activity 保存当前学习用途对应的 blockId、state=not-started/learning/paused/ended 和可核验 position。原生成 blockId 永不改绑；复习新建自己的活动引用原课程。播放器未同步页码时明确说明只恢复同一课堂。结束活动不授予掌握；反馈按原绑定导入并保留 pending/冲突。

## 小课与综合

miniLessons 保存稳定 id、learnerId/termId、subject、revision、goalIds、scope、purpose=review/explanation/temporary、可选 sourceLessonId、contentPath、contentHash（内容字节的 SHA-256）、createdAt。保留可独立显示的 HTML 教学卡或 widget 到工作区相对路径；课件同时保留对应 HTML 摘要。界面校验内容指纹后隔离显示，重新打开不调用模型，不支持外部脚本或联网。首次编写按需加载官方 render/slide/widget 编写技能并调用工具呈现。先复用匹配内容，回忆/尝试后只补实际困难。temporary 是用户明确选择的替代，不将原完整课标已生成或已结束；迟到就绪不打断它。

单元综合课按当前真实学习覆盖、原回答与困难组织联系和迁移，未覆盖处明确注明；不能重做全单元每一道题。综合活动完成保留薄弱点与复习安排。后续课节和综合课必须显式开始，不因刷新或前课结束自动生成。
