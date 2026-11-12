window.__ModuleLoader__.load({
	id: "@winterhuan/dsh-student",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region \0dsh-global-css:/Users/winter/dsh-creative/.worktrees/student-native-chat-parent/plugins/dsh-student/packages/winterhuan/student/src/client/plugin.css.mjs
		const css = ".student-desk{box-sizing:border-box;height:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font:13px/1.5 var(--dsw-font-family);flex-direction:column;gap:12px;padding:0 12px 20px;display:flex;overflow:auto}.student-top{z-index:2;background:var(--dsw-alias-bg-base);border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;margin:0 -12px;padding:10px 12px 8px;display:flex;position:sticky;top:0}.student-toolbar{align-items:center;gap:8px;display:flex}.student-tabs{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;display:grid}.student-subjects{background:var(--dsw-alias-bg-layer-1);border-radius:8px;flex:1;gap:2px;padding:2px;display:flex}.student-subjects button{background:0 0;border:0;flex:1}.student-quiet{background:0 0;border:0;flex:none;padding:6px 8px}.student-desk section{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;flex-direction:column;gap:8px;padding:12px;display:flex}.student-desk details{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:10px;padding:10px 12px}.student-desk h3{margin:0;font-size:13px;font-weight:500}.student-desk p{overflow-wrap:anywhere;white-space:pre-wrap;margin:0}.student-desk form,.student-desk fieldset,.student-desk label{flex-direction:column;gap:8px;min-width:0;display:flex}.student-desk fieldset{border:0;margin:0;padding:0}.student-desk button,.student-desk input,.student-desk select,.student-desk textarea{font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);box-sizing:border-box;border-radius:8px;min-width:0;max-width:100%;padding:8px}.student-desk button{cursor:pointer}.student-desk .student-subjects button,.student-desk .student-quiet{background:0 0;border:0}.student-desk button:hover:enabled:not([aria-pressed=true]):not(.student-primary){background:var(--dsw-alias-button-ghost-active-fill)}.student-desk .student-tabs button[aria-pressed=true],.student-desk .student-views button[aria-pressed=true],.student-desk .student-primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);border-color:#0000}.student-desk .student-tabs button[aria-pressed=true]:hover:enabled,.student-desk .student-views button[aria-pressed=true]:hover:enabled,.student-desk .student-primary:hover:enabled{background:var(--dsw-alias-button-primary-hover);color:var(--dsw-alias-label-primary-foreground)}.student-desk .student-subjects button[aria-pressed=true],.student-desk .student-segments button[aria-pressed=true],.student-desk .student-segments button[aria-checked=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1px var(--dsw-alias-state-business-primary)}.student-desk :disabled{opacity:.6;cursor:default}.student-desk :focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.student-desk textarea{resize:vertical;min-height:72px}.student-desk .student-check{flex-direction:row;align-items:flex-start}.student-desk .student-check input{flex:none}.student-desk img{object-fit:contain;background:var(--dsw-alias-bg-base);border-radius:8px;width:100%;max-height:240px}.student-status{gap:6px}.student-desk .student-question{background:var(--dsw-alias-bg-base);border-radius:8px;padding:12px;font-size:16px;line-height:1.45}.student-desk summary{cursor:pointer;overflow-wrap:anywhere;font-weight:500}.student-desk .student-pages{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.student-plan{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, var(--dsw-alias-bg-layer-1))}.student-desk details>details,.student-desk details>div,.student-desk details>p{margin-top:8px}.student-muted{color:var(--dsw-alias-label-secondary)}.student-unit{border-top:1px solid var(--dsw-alias-border-l2);padding-top:8px}.student-choices{flex-direction:column;gap:8px;display:flex}.student-choices button{text-align:left;width:100%;padding:12px 14px;font-size:15px}.student-result{font-size:15px;font-weight:500}.student-scope{flex-wrap:wrap;align-items:flex-end;gap:8px;display:flex}.student-scope label{flex:120px}.student-segments{flex-wrap:wrap;gap:6px;display:flex}.student-desk .student-grade{border-top:1px solid var(--dsw-alias-border-l2);padding:8px 0}.student-bar{background:var(--dsw-alias-bg-layer-2);border-radius:999px;height:8px;display:flex;overflow:hidden}.student-bar span{height:100%;display:block}.student-level-mastered,.student-fill-mastered{background:var(--dsw-alias-state-success-primary)}.student-level-practising,.student-fill-practising{background:var(--dsw-alias-state-business-primary)}.student-level-stalled,.student-fill-stalled{background:var(--dsw-alias-state-warn-primary)}.student-level-weak,.student-fill-weak{background:var(--dsw-alias-state-error-primary)}.student-level-due,.student-fill-due{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, var(--dsw-alias-state-warn-primary))}.student-level-untouched,.student-fill-untouched{background:var(--dsw-alias-label-tertiary)}.student-legend{flex-wrap:wrap;gap:8px 12px;display:flex}.student-dot{vertical-align:middle;border-radius:50%;width:8px;height:8px;margin-right:4px;display:inline-block}.student-chips{flex-direction:column;gap:6px;display:flex}.student-chip{text-align:left;border-radius:8px;align-items:center;gap:6px;width:100%;padding:8px 10px;display:flex}.student-views{grid-template-columns:1fr 1fr;gap:6px;display:grid}.student-pair{grid-template-columns:1fr 1fr;gap:8px;display:grid}.student-mastery{align-items:center;gap:6px;display:flex}.student-mastery span{border-radius:50%;width:10px;height:10px}.student-simon{flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none;display:flex}.student-simon li{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);border-radius:6px;padding:4px 8px}.student-simon-done{opacity:.7}.student-simon-current{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, var(--dsw-alias-bg-base));font-weight:500}.student-steps{flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;display:flex}.student-map-inline{border:1px solid var(--dsw-alias-border-l2);border-left:3px solid var(--dsw-alias-state-business-primary);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));border-radius:8px;margin:4px 0 8px;padding:8px 10px}.student-map-links{margin-top:8px}.student-mindmap-unit{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:8px;margin:8px 0;padding:10px}.student-mindmap-unit>summary{cursor:pointer;font-weight:500}.student-mindmap-branch{border-left:2px solid var(--dsw-alias-border-l2);flex-direction:column;gap:6px;margin:8px 0 0;padding:0 0 0 12px;list-style:none;display:flex}.student-mindmap-node{flex-direction:column;gap:4px;display:flex}.student-mindmap-concept{text-align:left;align-items:center;gap:6px;width:100%;display:flex}.student-mindmap-concept[aria-pressed=true]{background:var(--dsw-alias-bg-layer-2,transparent)}.student-mindmap-concept.student-level-mastered{box-shadow:inset 3px 0 0 var(--dsw-alias-state-success-primary)}.student-mindmap-concept.student-level-practising{box-shadow:inset 3px 0 0 var(--dsw-alias-state-business-primary)}.student-mindmap-concept.student-level-stalled{box-shadow:inset 3px 0 0 var(--dsw-alias-state-warn-primary)}.student-mindmap-concept.student-level-weak,.student-mindmap-concept.student-level-due{box-shadow:inset 3px 0 0 var(--dsw-alias-state-error-primary)}.student-figure svg{width:100%;height:auto;max-height:220px;color:var(--dsw-alias-label-primary)}.student-figure circle,.student-figure rect,.student-figure line,.student-figure path,.student-figure polyline,.student-figure polygon{fill:none;stroke:currentColor;stroke-width:1.4px}.student-figure text{fill:currentColor;stroke:none}.student-figure .student-fill{fill:currentColor}.student-desk progress{width:100%;height:8px}.student-desk progress::-webkit-progress-bar{background:var(--dsw-alias-bg-layer-2);border-radius:999px}.student-desk progress::-webkit-progress-value{background:var(--dsw-alias-state-business-primary);border-radius:999px}.student-sheet-portal{font:13px/1.5 var(--dsw-font-family)}.student-sheet-portal button{font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);cursor:pointer;border-radius:8px;padding:8px}.student-sheet-portal .student-primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);border-color:#0000}.student-sheet-portal .student-quiet{background:0 0;border:0}.student-sheet-backdrop{z-index:1000;box-sizing:border-box;background:color-mix(in srgb, var(--dsw-alias-label-primary) 32%, transparent);justify-content:center;align-items:flex-start;padding:32px 16px;display:flex;position:fixed;inset:0;overflow:auto}.student-sheet-dialog{box-sizing:border-box;background:var(--dsw-alias-bg-base);border-radius:10px;flex-direction:column;gap:8px;width:min(720px,100%);padding:12px;display:flex}.student-sheet-toolbar{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.student-sheet-toolbar .student-muted{flex:200px;margin:0}.student-sheet-scroll{overflow:auto}.student-sheet{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);color:#333;font:14px/1.6 var(--dsw-font-family);background:#fff;border-radius:8px;flex-direction:column;gap:12px;padding:24px;display:flex}.student-url{user-select:text;overflow-wrap:anywhere;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.student-sheet h2{text-align:center;margin:0;font-size:18px;font-weight:500}.student-sheet-meta{text-align:center;margin:0;font-size:12px}.student-sheet-item{break-inside:avoid;flex-direction:column;gap:8px;display:flex}.student-sheet-item>p{white-space:pre-wrap;margin:0}.student-sheet .student-figure svg{color:#333;width:100%;height:auto;max-height:260px}.student-sheet-lines{flex-direction:column;display:flex}.student-sheet-rule{border-bottom:1px solid #b9c0c7;height:22px}.student-sheet-box{border:1px dashed #b9c0c7;border-radius:4px;height:84px}@page{size:A4;margin:12mm 14mm}@media print{body>:not(.student-sheet-portal){display:none!important}.student-sheet-backdrop{background:0 0;padding:0;display:block;position:static;overflow:visible}.student-sheet-dialog{display:contents}.student-sheet-toolbar{display:none}.student-sheet-scroll{overflow:visible}.student-sheet{border:0;border-radius:0;width:100%;padding:0}.student-sheet-item{page-break-inside:avoid}}";
		const tagId = "@winterhuan/dsh-student/plugin.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@winterhuan/dsh-student";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region lib/types/client/mode.js
		/** Read the selected preset from the current Session list, failing closed while unknown.
		* @param context - browser Session services.
		* @param sessionId - Session to inspect.
		* @returns whether this Session uses the domain preset.
		*/
		function isModeSession(context, sessionId) {
			return sessionId !== void 0 && context.sessions.list.getSnapshot().byId[sessionId]?.projectionValues?.agentPreset === "student";
		}
		/** Keep the domain guide entry visible only for the on-screen domain Session.
		* The tab body and its persisted store remain registered across Session switches.
		* @param context - browser Session and sidebar services.
		* @param definition - domain tab type with its guide entry.
		* @returns disposer for the subscriptions and current tab registration.
		*/
		function registerModeTab(context, definition) {
			const current = context.uiSession.adapter.current;
			let visible;
			let release;
			const sync = () => {
				const next = isModeSession(context, current.getSnapshot().key);
				if (next === visible) return;
				visible = next;
				release?.();
				release = context.sidebarRightTabs.register({
					...definition,
					guide: next ? definition.guide ?? [] : []
				});
			};
			const stopCurrent = current.subscribe(sync);
			const stopSessions = context.sessions.list.subscribe(sync);
			sync();
			return () => {
				stopCurrent();
				stopSessions();
				release?.();
			};
		}
		//#endregion
		//#region lib/types/client/locales.js
		const NS = "studentDesk";
		const zh = {
			"chooseSchoolYear": "请选择学年",
			"schoolYearHelp": "学年跨两个年份，例如 2026–2027；请按孩子实际就读学年选择",
			"schoolAliasHelp": "可填写“二年级课程”等备注，无需官方代码或真实校名",
			"todayStars": "今日参与和复述星",
			"otherSubjectActive": "当前学习段是{subject}；在本页开始会自动结束上一段",
			"chatHelp": "可在这里作答，或用对话麦克风转写并核对后发送；讲解和反馈在对话中进行",
			"learningMethod": "本科学习方法",
			"chineseMethod": "识字先看偏旁想意思再放进词语辨析；阅读带着问题圈画原句找依据；写话先按“是谁—什么样—怎么做”说顺再动笔。",
			"mathMethod": "先圈条件明问题，再画图或摆实物建模，用自己的话讲算理，最后用逆运算或换法复核。",
			"englishMethod": "先看图入情境猜意思，再结合字母读音规律认词，用句型词块替换表达，最后分角色一问一答用出来。",
			"feynmanTeach": "当小老师讲一讲",
			"objectiveGoal": "今天要会做",
			"simonSteps": "西蒙四步",
			"microSteps": "微步骤",
			"inquiryQuestion": "我的疑问 / 待解问题",
			"inquiryPlaceholder": "例如：为什么退位减法要借一当十？",
			"reflectionOptional": "可选：记下今天的小收获",
			"mindMap": "单元与知识点",
			"mindMapHelp": "按单元看进度。点知识点在下方展开定义、关系和练习目标。",
			"mapFilter": "知识点筛选",
			"mapFilterAll": "全部",
			"mapFilterNeedsWork": "待加强与到期",
			"mapFilterUntouched": "未开始",
			"mapFilterEmpty": "没有符合筛选的知识点",
			"ideasOpenOnMap": "点名称可跳回知识地图，在对应单元下查看并选练。",
			"ideaCatalog": "跨年级概念",
			"ideaOnMap": "本册相关知识点",
			"addMistake": "添加错题",
			"editMistake": "编辑错题",
			"deleteMistake": "删除错题",
			"deleteMistakeConfirm": "确定删除这条错题？相关练习单上的引用会一并去掉。",
			"saveToExerciseBank": "收入本题库",
			"workspaceExercises": "工作区题库",
			"deleteExercise": "删除习题",
			"profileConfirm": "家长已确认学习档案",
			"topic": "题目主题",
			"organizeConcepts": "请助手整理概念",
			"pendingConcept": "待家长核对",
			"definition": "定义",
			"example": "例子",
			"facts": "可考事实",
			"source": "依据",
			"confirmConcept": "确认概念",
			"prerequisite": "先学",
			"part-of": "属于",
			"contrast": "对比",
			"explains": "解释",
			"cause-effect": "导致",
			"recognize": "识字词义",
			"read-evidence": "阅读找依据",
			"express": "自主表达",
			"represent": "表示数量关系",
			"reason": "推理",
			"verify": "复核",
			"context": "情境理解",
			"listen": "听读",
			"speak": "口头表达",
			"learningGoal": "学习目标",
			"chooseGoal": "围绕此目标练习",
			"clearGoal": "取消目标选择",
			"unclassified": "待归类",
			"linkGoal": "保存关联",
			"worksheets": "纸上练习单",
			"createWorksheet": "打印练习卷",
			"printConsolidation": "打印巩固卷",
			"practiceItem": "练习题",
			"worksheet": "选择练习单",
			"paperPhoto": "上传纸上作答",
			"paperPhotoHelp": "拍摄已完成的练习单，助手转录为待核对草稿，请逐题核对后确认入库",
			"questions": "题",
			"previewPrintSheet": "预览与打印",
			"printSheet": "打印",
			"printSheetHelp": "在打印对话框中选择打印机，或“存储为 PDF”",
			"close": "关闭",
			"sheetDaily": "每日小卷",
			"sheetPractice": "练习卷",
			"sheetReview": "巩固卷",
			"sheetIdLabel": "编号",
			"sheetGoalLabel": "学习目标",
			"sheetNameDate": "姓名：____________　　日期：____________",
			"tutorWorking": "助手正在处理，请等待对话回复",
			"prepareTask": "请助手出题",
			"nextTask": "下一题",
			"retryFeedback": "重新请求反馈",
			"retryHint": "重新请求提示",
			"reviewBlocked": "当前有进行中的学习段时，开始复习会自动结束上一段",
			"foundationHelp": "围绕一个基础概念练习，不代表学校当前教学内容",
			"schoolHelp": "按家长确认的教材和学校当前单元练习",
			"reviewHelp": "复习所选科目已确认且到期的错题",
			"exploreHelp": "带着具体疑问翻课页或做小实验：我猜什么 → 如何验证 → 看到了什么 → 我改变了什么想法",
			"title": "学习工作台",
			"description": "每天学一点，带着收获去玩耍",
			"today": "今日学习",
			"mistakes": "错题巩固",
			"growth": "成长记录",
			"parent": "家长设置",
			"reload": "刷新",
			"setupFirst": "请先由家长确认学习档案",
			"chinese": "语文",
			"math": "数学",
			"english": "英语",
			"foundation": "通用基础",
			"school": "校内同步",
			"review": "到期错题",
			"explore": "自主探究",
			"subject": "科目",
			"mode": "学习方式",
			"start": "开始学习",
			"unconfirmed": "校内同步需先确认教材；其他方式按各自条件选择",
			"time": "已学时长",
			"stop": "结束本段",
			"reflection": "今天的小收获（可以留空）",
			"waiting": "学习段已开始，助手会准备一道题",
			"answer": "我的回答",
			"submit": "提交回答",
			"hint": "给我一点提示",
			"hintMore": "再要一点提示",
			"submitted": "回答已保存，等待助手反馈；如未收到回复，可重新请求反馈",
			"hinted": "已请求提示，提示会出现在对话中",
			"hintLevel": "已提示",
			"wont": "我不会",
			"stuck": "不会",
			"phaseDemo": "准备/示范",
			"phaseGuide": "解释/跟着拆",
			"phaseTry": "操作/自己试",
			"phaseVary": "评价/变一变",
			"hintedCorrect": "提示后才对",
			"reasonTeaching": "需要教学",
			"reasonPrerequisite": "先补这个前置目标",
			"prerequisiteFor": "补好这个目标后，再学",
			"photo": "拍照录入错题",
			"photoHelp": "选择题目照片，助手会在对话中转录。核对后才加入复习",
			"workbookPhoto": "练习册照片",
			"workbookPhotoHelp": "没有练习单也可以拍。助手先存草稿；确认后，不会或提示后才对的进入待教，独立做错才记错题",
			"workbookDrafts": "练习册待确认",
			"teachingQueue": "待教",
			"workbookStuck": "不会",
			"workbookHinted": "提示后才对",
			"workbookWrong": "独立做错",
			"workbookRight": "独立做对",
			"workbookNoGoal": "不指定目标",
			"confirmWorkbook": "确认这题",
			"dismissTeaching": "先不教这题",
			"teachQueued": "已放进待教",
			"workbookSaved": "已按确认保存",
			"workbookNeedCorrection": "独立做错要填写订正、说明和答案依据",
			"sendPhoto": "发送照片给助手",
			"photoError": "请选择不超过 8 MiB 的 PNG、JPEG 或 WebP 图片",
			"pending": "待核对错题",
			"due": "到期复习",
			"notebook": "已确认错题本",
			"nextReview": "下次复习",
			"dueNow": "已到期",
			"previousPage": "上一页",
			"nextPage": "下一页",
			"page": "页码",
			"empty": "还没有记录",
			"bounded": "这里显示最近或待处理的 20 条，完整历史可在对话中查询",
			"mistakeBounded": "待核对和到期列表最多显示 20 条；语文、数学、英语错题本分别翻页查看",
			"prompt": "题干",
			"learnerAnswer": "原始回答",
			"correction": "订正答案",
			"explanation": "解题说明",
			"answerEvidence": "答案依据",
			"uncertainties": "需要核对",
			"confirmMistake": "我已核对原题、订正与依据，疑点均已解决",
			"confirm": "确认并安排复习",
			"weeklyTitle": "本周小结",
			"weeklyTime": "本周时长",
			"minuteUnit": "分钟",
			"weeklyActiveDays": "练习天数",
			"weeklyMastered": "新掌握",
			"weeklyPractised": "练习中",
			"weeklyMistakesNew": "新错题",
			"weeklyConsolidated": "已巩固",
			"weeklyDueDone": "到期完成",
			"weeklyCauses": "本周错因",
			"stars": "参与和复述星",
			"starsHelp": "不按题量或连续天数奖励，休息不扣星",
			"evidence": "学习证据",
			"practising": "继续练习",
			"independent": "三个不同日期独立答对",
			"nickname": "昵称",
			"region": "地区",
			"grade": "年级",
			"term": "学期",
			"first": "上册",
			"second": "下册",
			"schoolYear": "学年",
			"schoolAlias": "课程备注（选填）",
			"schoolSystem": "学制",
			"five-four": "五四制",
			"six-three": "六三制",
			"parentConfirmation": "家长确认说明",
			"parentHelp": "每个工作区保存一名学生的一学期。档案可随时修改，学习记录会保留。没有时长限制，孩子想学就学、想停就停。家长区不提供身份验证",
			"save": "保存",
			"saved": "已保存",
			"curriculum": "教材与学校进度",
			"titleField": "教材名称",
			"publisher": "出版社",
			"edition": "版次",
			"locator": "官方链接或家长提供的资料位置",
			"evidenceField": "封面、版权页等核实依据",
			"unit": "学校当前单元",
			"chooseUnit": "请选择单元",
			"materialConfirm": "确认学校现在教到这个单元",
			"materialHelp": "选择这一册里学校现在教到的单元。不用填写书名、出版社或版次",
			"mapMaterialPublisher": "随包知识地图",
			"mapMaterialEdition": "未另行登记版次",
			"mapMaterialLocator": "工作台",
			"mapMaterialEvidence": "家长在工作台确认了学校当前单元，没有填写封面或版权页",
			"networkError": "暂时无法连接学习服务，请重试",
			"sessionError": "请先在当前会话发送一条消息，再刷新",
			"sendError": "未能提交给助手，已保存的学习记录仍在，可重试",
			"correct": "正确",
			"partial": "部分正确",
			"incorrect": "需要再想想",
			"unassessed": "等待核对",
			"map": "知识地图",
			"todayPlan": "今日建议",
			"weakPoints": "薄弱点",
			"startNow": "现在开始",
			"allDone": "暂时没有待复习或薄弱项，可以从知识地图选一个新知识点",
			"openMap": "打开知识地图",
			"openMistakes": "打开错题本",
			"mapBasis": "地图依据",
			"mapUnavailable": "知识地图目前覆盖一、二年级；请家长核对学习档案的年级和学期",
			"knowledgePoints": "知识点",
			"ideas": "概念",
			"ideasHelp": "这里看概念之间的比较、分类和因果；进度与选练请回知识地图。换年级或上下册时跨年级概念清单不变。",
			"compareGroup": "比较",
			"classifyGroup": "分类",
			"causeGroup": "因果",
			"relationEmpty": "这一册还没有这种关系",
			"relationsLabel": "概念关系",
			"masteryOverview": "掌握概览",
			"levelDue": "待复习",
			"levelWeak": "需要加强",
			"levelStalled": "久未练习",
			"levelMastered": "已掌握",
			"levelPractising": "练习中",
			"levelUntouched": "待学习",
			"all": "全部",
			"bookDue": "待复习",
			"bookReviewing": "复习中",
			"bookMastered": "已巩固",
			"mistakeStatus": "错题筛选",
			"reasonDue": "到期错题",
			"reasonOpen": "还有错题没有完成复习",
			"reasonRecent": "最近出错或依赖提示",
			"reasonStalled": "已有多日没有练习",
			"reasonNew": "还没有开始学",
			"recommendReview": "先复习到期错题",
			"recommendPractice": "先补一个薄弱知识点",
			"recommendLearn": "开始一个新知识点",
			"recommendPreview": "预习下一单元",
			"recommendHold": "等学校往下教",
			"reasonPreview": "家长打开了预习，只提前一个单元",
			"reasonSchoolPace": "学校还在这一单元，先不学后面的内容",
			"schoolFrontier": "学校进度",
			"homeProgress": "家里练到",
			"homeNotStarted": "这一册还没练过",
			"keepUp": "跟上学校",
			"catchUp": "先补缺",
			"reviewWeek": "这周学校在复习",
			"schoolHere": "学校在这里",
			"notTaughtYet": "学校还没教到",
			"previewUnit": "可预习的下一单元",
			"schoolProgressHelp": "选择学校现在教到的地图单元。进度只在确认后前移，不会按日期自动跳。新课和摸底停在这个单元，以及已经教过的单元",
			"schoolProgressNeedsCourse": "先确认这科的教材，再标学校进度",
			"archiveTerm": "归档本学期",
			"archiveTermHelp": "导出全部学习证据到 .study/ 归档文件，然后清空档案，供新学期重新设置",
			"archiveTermConfirm": "确认归档本学期？将先导出全部证据，再清空学习档案",
			"archiveTermConfirmation": "家长确认归档本学期",
			"stillThisUnit": "还在这一单元",
			"nextSchoolUnit": "进入下一单元",
			"noNextUnit": "已经是这一册的最后一单元",
			"confirmSchoolProgress": "确认学校进度",
			"updateSchoolProgress": "更新学校进度",
			"weakHint": "薄弱点来自实际作答、纸上练习和错题记录，不是考试排名",
			"mapScope": "浏览年级学期",
			"mapBrowsing": "正在浏览其他年级学期，仅供预习或复习参考；掌握状态只统计当前学期",
			"backToCurrent": "回到当前学期",
			"gradeOne": "一年级",
			"gradeTwo": "二年级",
			"reviewStage": "复习阶段",
			"sourceMistake": "来源错题",
			"graded": "已批改",
			"notGraded": "待批改",
			"markCorrect": "对",
			"markPartial": "半对",
			"markWrong": "错",
			"referenceAnswer": "参考答案",
			"childAnswer": "孩子写的（选填）",
			"gradeHelp": "孩子做完后，对照参考答案逐题点对、半对或错，判错时可选错因；答错和半对的题会自动记成错题，巩固题按结果安排下次复习",
			"saveGrades": "保存批改",
			"gradesSaved": "批改已保存",
			"gradeConfirmation": "家长在面板逐题批改",
			"discardSheet": "作废这张卷",
			"discardConfirm": "作废后这张卷不再计入复习，也不能再录入作答，卷上的错题可以重新出题。确定作废？",
			"reviewReady": "可出巩固题",
			"reviewLater": "其余到期",
			"reviewUnlinked": "到期但未归类",
			"reviewOpenSheets": "还没批改的卷",
			"reviewSheetHelp": "巩固卷由系统按到期和复习阶段挑错题，每条错题一道变式（先换数字，再换情境，最后说理）；卷上的题批改后才算复习",
			"chooseAnswer": "点选一个答案",
			"relatedWorksheets": "相关练习单",
			"createdAt": "生成于",
			"diagnose": "摸底检测",
			"diagnoseHelp": "按知识地图抽几个目标各做一道短题，看看哪些已经会了、哪些要再练；不计分数，只找方向",
			"diagnosisTitle": "学习摸底",
			"diagnosisNever": "还没有做过摸底",
			"diagnosisLast": "上次摸底",
			"nextCheck": "下次建议",
			"diagnosisDue": "建议做一次摸底",
			"diagnosisNotDue": "近期已摸底，可随时再做一次",
			"diagnosisSample": "本次探查",
			"startDiagnosis": "开始摸底",
			"repeatDiagnosis": "再做一次摸底",
			"diagnosisResults": "摸底结果",
			"recommendDiagnose": "先做一次摸底，找准方向",
			"reasonDiagnose": "待探查的知识点",
			"scopeLabel": "范围",
			"scopeCurrent": "本学期",
			"scopeCustom": "选择年级学期",
			"scopeWholeMap": "整册",
			"scopeUnit": "指定单元",
			"assistIndependent": "独立完成",
			"assistHint": "提示后完成",
			"assistWorked": "示范后完成",
			"checkin": "学习摸底",
			"checkinHelp": "摸底是重复进行的小样本探查：每科按单元轮流抽取未探查、久未练习和需要抽查的目标，结果直接进入掌握状态和薄弱点。不计分、不排名",
			"coverage": "探查覆盖",
			"intensity": "摸底强度",
			"intensityLight": "轻量",
			"intensityStandard": "常规",
			"intensityDeep": "全面",
			"intensityLightHelp": "3 道选择题，几分钟完成",
			"intensityStandardHelp": "6 道题，选择题为主，跨单元取样",
			"intensityDeepHelp": "最多 12 道题，每个单元含一道说理题，并复测练习中的目标",
			"recommended": "推荐",
			"history": "摸底记录",
			"wrong": "答错",
			"mapGraph": "知识点关系图：实线为先学关系，虚线为其他关系；点击知识点查看详情",
			"learningPath": "建议学习顺序",
			"lastPractised": "最近练习",
			"chooseIntensity": "选择摸底强度",
			"sampleUntouched": "未探查",
			"sampleStalled": "久未练习",
			"sampleRecheck": "抽查已掌握",
			"sampleProgress": "看看进步",
			"selectConcept": "当前知识点",
			"unitsLabel": "单元进度",
			"preview": "待发送的题目照片",
			"busy": "处理中",
			"carry-borrow": "进位退位算错",
			"place-value": "数位看错",
			"operation-choice": "运算选错",
			"calculation": "口算笔算出错",
			"unit-quantity": "单位或数量看错",
			"reading-task": "审题不清",
			"pattern": "规律找错",
			"geometry-feature": "图形特征混淆",
			"money-measure": "钱币或测量出错",
			"reasoning-incomplete": "说理不完整",
			"pinyin-tone": "拼音或声调出错",
			"character-form": "字形偏旁错误",
			"character-usage": "组词用字不当",
			"word-meaning": "词义理解偏差",
			"reading-evidence": "找错阅读依据",
			"order": "语序顺序颠倒",
			"expression-incomplete": "表达不完整",
			"punctuation": "标点遗漏或用错",
			"listening": "听读理解出错",
			"spelling": "拼写错误",
			"word-form": "词形变化出错",
			"sentence-pattern": "句型结构出错",
			"usage-context": "情境用语不当",
			"spoken-response": "口头表达不完整",
			"writing-complete": "写话不完整",
			"errorTypeLabel": "错因",
			"errorTypeNone": "不选错因",
			"saveErrorType": "保存错因",
			"reasonRecurring": "同一种错误反复出现",
			"remindersTitle": "说一遍思路",
			"remindersHint": "做完后请孩子用自己的话讲一遍；只作提醒，不评分、不计入掌握证据",
			"remindFirst": "第一次接触这个知识点",
			"remindAfterFix": "错题今天独立做对了",
			"remindNext": "要进入新的单元了",
			"confirmHighConfidence": "一键确认高置信转录",
			"draftsTitle": "待核对转录",
			"draftsHelp": "助手已转录这张卷的作答，请逐题核对判读结果和错因后再入库",
			"draftChoice": "判读结果",
			"confirmPaper": "确认入库",
			"confirmPaperDone": "核对结果已保存",
			"routineTitle": "今日学科环节",
			"routineHelp": "按本单元的学习侧重，每天练一小项；也可以打印成小卷",
			"printDailySheet": "打印今日小卷",
			"dictation": "对话听写",
			"topCauses": "反复出现的错因",
			"focusLiteracy": "生字认读与听写 3–5 个",
			"focusPinyin": "拼音拼读与声调",
			"focusReading": "朗读一小段并找依据",
			"focusWriting": "写一两句话",
			"focusConcepts": "说清概念和数量关系",
			"focusCalculation": "口算或笔算一组",
			"focusGeometry": "图形与方位指一指说一说",
			"focusMeasurement": "认一认、量一量",
			"focusWords": "单词认读与拼写 5–6 个",
			"focusSentences": "一句句型问答",
			"focusStory": "读一小段故事",
			"focusListen": "听读一小段",
			"focusProject": "做一个小情景任务",
			"focusReview": "复习本单元已错内容",
			"parentView": "家长",
			"otherWays": "换一种方式",
			"sync": "同步学习",
			"syncHelp": "按已确认的学校进度练习；还没确认教材时，作为通用基础练习并说明来源",
			"markAllCorrect": "全标为对",
			"masteryProgress": "独立答对",
			"goalMastered": "三个不同日子独立做对，这个目标掌握了！",
			"explainPrompt": "用一句话讲讲刚才的做法",
			"figureCounter": "计数器",
			"figureSticks": "小棒",
			"figureClock": "钟面",
			"figureSplit": "数的分与合",
			"figureFourline": "四线格",
			"figureTianzige": "田字格",
			"figureMoney": "人民币",
			"figureVertical": "竖式",
			"figureShapes": "图形比较",
			"figureSequence": "规律条",
			"figureOverlap": "重叠圈",
			"figureWall": "数墙",
			"figureGrid": "方格表",
			"figureMeasure": "厘米尺",
			"figureCompass": "方向板",
			"figureBalance": "天平",
			"figureSketch": "简笔画",
			"figureTensPlace": "十位",
			"figureOnesPlace": "个位",
			"compassNorth": "北",
			"compassSouth": "南",
			"compassWest": "西",
			"compassEast": "东",
			"interestPractice": "趣味情境练当前目标",
			"openLesson": "开互动课",
			"goToClass": "去上课",
			"dueTodayTitle": "今日必清",
			"dueTodayHelp": "今天先清这几条，其余到期错题以后再练",
			"clearDue": "清这 {count} 条",
			"dueLater": "还有 {count} 条以后再清",
			"interestFocusLabel": "今天的情境",
			"interestsTitle": "兴趣标签",
			"interestsHelp": "填 3 到 8 个孩子喜欢的主题。出题和互动课用它们换场景，知识点仍以知识地图为准",
			"interestTag": "标签",
			"addInterest": "添加标签",
			"removeInterest": "去掉最后一个",
			"interestConfirm": "家长确认兴趣标签",
			"interestCount": "请填写 3 到 8 个不重复的标签",
			"interestShape": "每个标签用 2 到 16 个汉字、字母或数字",
			"openmaicTitle": "互动课",
			"openmaicHelp": "按今天的目标，用本机 OpenMAIC 生成一节互动课。生成由学习助手完成，这里列出记录并在浏览器打开",
			"openmaicEmpty": "还没有互动课",
			"openmaicGenerate": "请助手生成",
			"openmaicOpen": "在浏览器打开",
			"openmaicCopy": "复制链接",
			"openmaicCopied": "已复制",
			"openmaicRetry": "请助手重试",
			"openmaicReview": "课后巩固",
			"openmaicGenerating": "生成中",
			"openmaicReady": "可以上课",
			"openmaicFailed": "生成失败",
			"openmaicWarning": "生成提示",
			"openmaicOutline": "课后摘要",
			"openmaicBase": "OpenMAIC 地址",
			"openmaicBaseHelp": "留空则使用环境变量 OPENMAIC_BASE，否则默认为 http://localhost:3000",
			"openmaicAccessHint": "若服务要求访问码，在运行 DSH 的环境里设置 OPENMAIC_ACCESS_CODE。访问码不写入学习档案",
			"openmaicConfirm": "家长确认 OpenMAIC 地址",
			"openmaicEffective": "当前使用"
		};
		const en = {
			"chooseSchoolYear": "Select a school year",
			"schoolYearHelp": "A school year spans two years, for example 2026–2027. Choose the learner’s actual school year",
			"schoolAliasHelp": "An optional label such as “Grade two course”; no official code or real school name is needed",
			"todayStars": "Stars today",
			"otherSubjectActive": "The open block is {subject}. Starting here will close it first",
			"chatHelp": "Answer here, or review a microphone transcript in chat before sending it. Explanations and feedback appear in chat",
			"learningMethod": "Learning method",
			"chineseMethod": "For characters, read radicals then check them in words. For reading, mark evidence sentences. For writing, say who–what–how before writing.",
			"mathMethod": "Circle givens and the question, draw or model, explain the steps in your own words, then check with the inverse or another method.",
			"englishMethod": "Enter the scene from a picture, use phonics for words, swap chunks in a sentence frame, then role-play a short Q and A.",
			"feynmanTeach": "Teach it like a little teacher",
			"objectiveGoal": "Goal for today",
			"simonSteps": "Simon four steps",
			"microSteps": "Micro-steps",
			"inquiryQuestion": "My question",
			"inquiryPlaceholder": "For example: why do we borrow a ten when subtracting?",
			"reflectionOptional": "Optional: note today's takeaway",
			"mindMap": "Units and knowledge points",
			"mindMapHelp": "Browse progress by unit. Tap a knowledge point to expand its definition, links and practice goals underneath.",
			"mapFilter": "Knowledge-point filter",
			"mapFilterAll": "All",
			"mapFilterNeedsWork": "Needs work or due",
			"mapFilterUntouched": "Not started",
			"mapFilterEmpty": "No knowledge points match this filter",
			"ideasOpenOnMap": "Tap a name to jump to the map and practise that point under its unit.",
			"ideaCatalog": "Cross-grade ideas",
			"ideaOnMap": "Related points in this book",
			"addMistake": "Add a mistake",
			"editMistake": "Edit mistake",
			"deleteMistake": "Delete mistake",
			"deleteMistakeConfirm": "Delete this mistake? Worksheet links to it will be cleared.",
			"saveToExerciseBank": "Save to exercise bank",
			"workspaceExercises": "Workspace exercises",
			"deleteExercise": "Delete exercise",
			"profileConfirm": "Parent confirmed the learner profile",
			"topic": "Topic",
			"organizeConcepts": "Ask tutor to organize concepts",
			"pendingConcept": "Awaiting parent review",
			"definition": "Definition",
			"example": "Example",
			"facts": "Checkable facts",
			"source": "Evidence",
			"confirmConcept": "Confirm concept",
			"prerequisite": "Prerequisite for",
			"part-of": "Part of",
			"contrast": "Compare with",
			"explains": "Explains",
			"cause-effect": "Causes",
			"recognize": "Recognize words",
			"read-evidence": "Find reading evidence",
			"express": "Express independently",
			"represent": "Represent quantities",
			"reason": "Reason",
			"verify": "Check",
			"context": "Understand context",
			"listen": "Listen and read",
			"speak": "Speak",
			"learningGoal": "Learning goal",
			"chooseGoal": "Practise this goal",
			"clearGoal": "Clear goal choice",
			"unclassified": "Not classified",
			"linkGoal": "Save link",
			"worksheets": "Paper worksheets",
			"createWorksheet": "Print a practice sheet",
			"printConsolidation": "Print a review sheet",
			"practiceItem": "Practice question",
			"worksheet": "Choose worksheet",
			"paperPhoto": "Upload paper answers",
			"paperPhotoHelp": "Photograph the completed sheet; the tutor saves a transcription draft for you to check item by item and confirm",
			"questions": "questions",
			"previewPrintSheet": "Preview & print",
			"printSheet": "Print",
			"printSheetHelp": "Pick a printer in the print dialog, or save as PDF",
			"close": "Close",
			"sheetDaily": " daily mini sheet",
			"sheetPractice": " practice sheet",
			"sheetReview": " review sheet",
			"sheetIdLabel": "No.",
			"sheetGoalLabel": "Goal",
			"sheetNameDate": "Name ______________    Date ______________",
			"tutorWorking": "The tutor is working. Wait for the conversation reply",
			"prepareTask": "Ask for a question",
			"nextTask": "Next question",
			"retryFeedback": "Request feedback again",
			"retryHint": "Request hint again",
			"reviewBlocked": "Starting review will close the open learning block first",
			"foundationHelp": "Practise one basic concept without claiming alignment with the current school unit",
			"schoolHelp": "Practise the parent-confirmed textbook and current school unit",
			"reviewHelp": "Review confirmed mistakes that are due in the selected subject",
			"exploreHelp": "Bring a concrete question, then guess, check (book or mini experiment), notice, and revise your idea",
			"title": "Learning desk",
			"description": "Learn a little, then enjoy a break",
			"today": "Today",
			"mistakes": "Mistakes",
			"growth": "Progress",
			"parent": "Parent setup",
			"reload": "Reload",
			"setupFirst": "Ask a parent to set up your learning profile",
			"chinese": "Chinese",
			"math": "Math",
			"english": "English",
			"foundation": "Foundations",
			"school": "School course",
			"review": "Due review",
			"explore": "Explore",
			"subject": "Subject",
			"mode": "Learning mode",
			"start": "Start learning",
			"unconfirmed": "Confirm the textbook before using School course; other activities have their own requirements",
			"time": "Time learned",
			"stop": "End this block",
			"reflection": "What did you learn? (optional)",
			"waiting": "Your block has started. The tutor will prepare one question",
			"answer": "My answer",
			"submit": "Submit answer",
			"hint": "Give me a hint",
			"hintMore": "Another hint",
			"submitted": "Answer saved, awaiting feedback. Request feedback again if needed",
			"hinted": "Hint requested. Look for it in the conversation",
			"hintLevel": "Hints given",
			"wont": "I can't do this",
			"stuck": "Cannot start",
			"phaseDemo": "Prepare / demo",
			"phaseGuide": "Explain / guide",
			"phaseTry": "Try alone",
			"phaseVary": "Evaluate / vary",
			"hintedCorrect": "Right only after a hint",
			"reasonTeaching": "Needs teaching",
			"reasonPrerequisite": "Strengthen this earlier goal first",
			"prerequisiteFor": "After this goal, continue with",
			"photo": "Add a mistake photo",
			"photoHelp": "Choose a question photo. The tutor transcribes it in chat; confirm it before review",
			"workbookPhoto": "Workbook photo",
			"workbookPhotoHelp": "A photo needs no saved sheet. The tutor stores a draft; after you confirm, cannot-start and hinted items wait to be taught, and only an independent wrong becomes a mistake",
			"workbookDrafts": "Workbook drafts to confirm",
			"teachingQueue": "Waiting to teach",
			"workbookStuck": "Cannot start",
			"workbookHinted": "Right only after a hint",
			"workbookWrong": "Independent wrong",
			"workbookRight": "Independent right",
			"workbookNoGoal": "No goal",
			"confirmWorkbook": "Confirm this item",
			"dismissTeaching": "Skip teaching this",
			"teachQueued": "Added to the teaching list",
			"workbookSaved": "Confirmation saved",
			"workbookNeedCorrection": "An independent wrong needs a correction, an explanation and the answer evidence",
			"sendPhoto": "Send photo to tutor",
			"photoError": "Choose a PNG, JPEG or WebP image up to 8 MiB",
			"pending": "Awaiting confirmation",
			"due": "Due for review",
			"notebook": "Confirmed mistakes",
			"nextReview": "Next review",
			"dueNow": "Due now",
			"previousPage": "Previous page",
			"nextPage": "Next page",
			"page": "Page",
			"empty": "No records yet",
			"bounded": "Shows up to 20 recent or pending records; ask in chat for the full history",
			"mistakeBounded": "Pending and due lists show up to 20 records; browse each subject notebook by page",
			"prompt": "Question",
			"learnerAnswer": "Original answer",
			"correction": "Corrected answer",
			"explanation": "Explanation",
			"answerEvidence": "Answer evidence",
			"uncertainties": "Needs checking",
			"confirmMistake": "I checked the original question, correction and evidence and resolved all uncertainties",
			"confirm": "Confirm and schedule review",
			"weeklyTitle": "This week",
			"weeklyTime": "Minutes this week",
			"minuteUnit": "min",
			"weeklyActiveDays": "active days",
			"weeklyMastered": "newly mastered",
			"weeklyPractised": "practised",
			"weeklyMistakesNew": "new mistakes",
			"weeklyConsolidated": "consolidated",
			"weeklyDueDone": "due completed",
			"weeklyCauses": "causes this week",
			"stars": "Participation and reflection stars",
			"starsHelp": "No rewards for volume or streaks; breaks never cost stars",
			"evidence": "Learning evidence",
			"practising": "Practising",
			"independent": "Independent success on three different days",
			"nickname": "Nickname",
			"region": "Region",
			"grade": "Grade",
			"term": "Term",
			"first": "First term",
			"second": "Second term",
			"schoolYear": "School year",
			"schoolAlias": "Course note (optional)",
			"schoolSystem": "School system",
			"five-four": "Five-four",
			"six-three": "Six-three",
			"parentConfirmation": "Parent confirmation",
			"parentHelp": "One learner and term per workspace. The profile can be edited anytime without losing records. There is no time limit. This section does not authenticate parents",
			"save": "Save",
			"saved": "Saved",
			"curriculum": "Textbook and school progress",
			"titleField": "Textbook title",
			"publisher": "Publisher",
			"edition": "Edition",
			"locator": "Official link or parent-provided source",
			"evidenceField": "Verification from cover, copyright page, etc.",
			"unit": "Current school unit",
			"chooseUnit": "Choose a unit",
			"materialConfirm": "Confirm the class is on this unit",
			"materialHelp": "Choose the unit the class has reached in this book. Title, publisher and edition are not required",
			"mapMaterialPublisher": "Shipped knowledge map",
			"mapMaterialEdition": "No separate edition entered",
			"mapMaterialLocator": "Learning desk",
			"mapMaterialEvidence": "The parent confirmed the current school unit in the learning desk and did not enter a cover or copyright page",
			"networkError": "Cannot reach the learning service. Try again",
			"sessionError": "Send a message in this session, then reload",
			"sendError": "Could not submit to the tutor. Saved learning records remain; you can retry",
			"correct": "Assessment: correct",
			"partial": "Partly correct",
			"incorrect": "Needs another try",
			"unassessed": "Not yet assessed",
			"map": "Knowledge map",
			"todayPlan": "Today’s plan",
			"weakPoints": "Weak points",
			"startNow": "Start now",
			"allDone": "Nothing due and no weak points right now; pick a new knowledge point from the map",
			"openMap": "Open knowledge map",
			"openMistakes": "Open mistake book",
			"mapBasis": "Map basis",
			"mapUnavailable": "The knowledge map covers grades one and two. Check the profile grade and term",
			"knowledgePoints": "Knowledge points",
			"ideas": "Concepts",
			"ideasHelp": "Use this tab for compare, classify and cause links. Progress and practice goals live on the knowledge map. The cross-grade idea list stays the same when you change grade or term.",
			"compareGroup": "Compare",
			"classifyGroup": "Classify",
			"causeGroup": "Cause and effect",
			"relationEmpty": "This book has no relation of this kind yet",
			"relationsLabel": "Concept relations",
			"masteryOverview": "Mastery overview",
			"levelDue": "Review due",
			"levelWeak": "Needs work",
			"levelStalled": "Not practised lately",
			"levelMastered": "Mastered",
			"levelPractising": "Practising",
			"levelUntouched": "Not started",
			"all": "All",
			"bookDue": "Due",
			"bookReviewing": "Reviewing",
			"bookMastered": "Consolidated",
			"mistakeStatus": "Mistake filter",
			"reasonDue": "Mistakes due for review",
			"reasonOpen": "Open mistakes not yet reviewed",
			"reasonRecent": "Recent errors or hint dependence",
			"reasonStalled": "Not practised for days",
			"reasonNew": "Not started yet",
			"recommendReview": "Review due mistakes first",
			"recommendPractice": "Strengthen one weak knowledge point",
			"recommendLearn": "Start a new knowledge point",
			"recommendPreview": "Preview the next unit",
			"recommendHold": "Wait until school moves on",
			"reasonPreview": "Preview is on, and it covers only the next unit",
			"reasonSchoolPace": "School is still on this unit, so later units wait",
			"schoolFrontier": "School progress",
			"homeProgress": "Practised through",
			"homeNotStarted": "No practice in this book yet",
			"keepUp": "Keep up with school",
			"catchUp": "Fill earlier gaps first",
			"reviewWeek": "School is reviewing this week",
			"schoolHere": "School is here",
			"notTaughtYet": "Not taught at school yet",
			"previewUnit": "Next unit available to preview",
			"schoolProgressHelp": "Choose the map unit the class has reached. It moves only after confirmation, not by the calendar. New goals and check-ins stay in this unit and the units already taught",
			"schoolProgressNeedsCourse": "Confirm this subject’s textbook before marking school progress",
			"archiveTerm": "Archive this term",
			"archiveTermHelp": "Exports all learning evidence to a .study/ archive file, then clears the profile for a fresh term",
			"archiveTermConfirm": "Archive this term? All evidence is exported first, then the profile is cleared",
			"archiveTermConfirmation": "The parent confirmed archiving this term",
			"stillThisUnit": "Still on this unit",
			"nextSchoolUnit": "Move to the next unit",
			"noNextUnit": "This is the last unit in the book",
			"confirmSchoolProgress": "Confirm school progress",
			"updateSchoolProgress": "Update school progress",
			"weakHint": "Weak points come from real answers, paper practice and mistake records, not exam rankings",
			"mapScope": "Browse grade and term",
			"mapBrowsing": "Browsing another grade or term for preview or review only; mastery counts the current term only",
			"backToCurrent": "Back to current term",
			"gradeOne": "Grade 1",
			"gradeTwo": "Grade 2",
			"reviewStage": "Review stage",
			"sourceMistake": "Source mistake",
			"graded": "Checked",
			"notGraded": "Not checked yet",
			"markCorrect": "Right",
			"markPartial": "Partly right",
			"markWrong": "Wrong",
			"referenceAnswer": "Answer key",
			"childAnswer": "What the child wrote (optional)",
			"gradeHelp": "After the child finishes, mark each question right, partly right or wrong against the answer key and pick an error cause when marking wrong; wrong and partly right questions become mistakes, and review questions schedule the next review from the result",
			"saveGrades": "Save marks",
			"gradesSaved": "Marks saved",
			"gradeConfirmation": "Parent marked each question in the panel",
			"discardSheet": "Discard this sheet",
			"discardConfirm": "A discarded sheet no longer counts for review and cannot take answers; its mistakes can go on a new sheet. Discard it?",
			"reviewReady": "Ready for review",
			"reviewLater": "Other due",
			"reviewUnlinked": "Due but unclassified",
			"reviewOpenSheets": "Sheets not yet checked",
			"reviewSheetHelp": "The system picks review mistakes by due date and review stage, one variant each (numbers first, then context, then reasoning); a sheet counts as review once it is marked",
			"chooseAnswer": "Tap an answer",
			"relatedWorksheets": "Related worksheets",
			"createdAt": "Created",
			"diagnose": "Check-in",
			"diagnoseHelp": "Sample a few goals from the knowledge map with one short question each to see what is known and what needs work; no score, just direction",
			"diagnosisTitle": "Learning check-in",
			"diagnosisNever": "No check-in yet",
			"diagnosisLast": "Last check-in",
			"nextCheck": "Next suggested",
			"diagnosisDue": "A check-in is suggested",
			"diagnosisNotDue": "Checked in recently; repeat any time",
			"diagnosisSample": "This round probes",
			"startDiagnosis": "Start check-in",
			"repeatDiagnosis": "Repeat check-in",
			"diagnosisResults": "Check-in results",
			"recommendDiagnose": "Start with a check-in to find direction",
			"reasonDiagnose": "Knowledge points to probe",
			"scopeLabel": "Scope",
			"scopeCurrent": "Current term",
			"scopeCustom": "Pick grade and term",
			"scopeWholeMap": "Whole book",
			"scopeUnit": "One unit",
			"assistIndependent": "Independent",
			"assistHint": "With a hint",
			"assistWorked": "After a worked example",
			"checkin": "Check-ins",
			"checkinHelp": "A check-in is a small recurring probe: each subject samples untouched, stalled and spot-check goals across units, and the results feed mastery and weak points directly. No score, no ranking",
			"coverage": "Coverage",
			"intensity": "Check-in intensity",
			"intensityLight": "Light",
			"intensityStandard": "Standard",
			"intensityDeep": "Deep",
			"intensityLightHelp": "3 choice questions, a few minutes",
			"intensityStandardHelp": "6 questions, mostly choices, sampled across units",
			"intensityDeepHelp": "Up to 12 questions with one reasoning task per unit and re-checks of goals in progress",
			"recommended": "Recommended",
			"history": "Check-in history",
			"wrong": "Wrong",
			"mapGraph": "Knowledge-point graph: solid edges are prerequisites, dashed edges other relations; tap a point for details",
			"learningPath": "Suggested learning order",
			"lastPractised": "Last practised",
			"chooseIntensity": "Choose check-in intensity",
			"sampleUntouched": "Not probed",
			"sampleStalled": "Not practised lately",
			"sampleRecheck": "Spot-check mastered",
			"sampleProgress": "Progress check",
			"selectConcept": "Selected knowledge point",
			"unitsLabel": "Unit progress",
			"preview": "Question photo ready to send",
			"busy": "Working",
			"carry-borrow": "Carrying or borrowing slip",
			"place-value": "Place value mixed up",
			"operation-choice": "Wrong operation chosen",
			"calculation": "Calculation slip",
			"unit-quantity": "Unit or quantity misread",
			"reading-task": "Task misread",
			"pattern": "Pattern missed",
			"geometry-feature": "Shape feature confused",
			"money-measure": "Money or measuring slip",
			"reasoning-incomplete": "Reasoning incomplete",
			"pinyin-tone": "Pinyin or tone slip",
			"character-form": "Character form error",
			"character-usage": "Wrong character used",
			"word-meaning": "Word meaning off",
			"reading-evidence": "Wrong reading evidence",
			"order": "Order mixed up",
			"expression-incomplete": "Expression incomplete",
			"punctuation": "Punctuation slip",
			"listening": "Listening slip",
			"spelling": "Spelling mistake",
			"word-form": "Word form slip",
			"sentence-pattern": "Sentence pattern slip",
			"usage-context": "Wrong context wording",
			"spoken-response": "Speech incomplete",
			"writing-complete": "Writing incomplete",
			"errorTypeLabel": "Error cause",
			"errorTypeNone": "No error cause",
			"saveErrorType": "Save error cause",
			"reasonRecurring": "The same error keeps coming back",
			"remindersTitle": "Explain it back",
			"remindersHint": "Ask the child to say it in their own words afterwards; a reminder only, never scored or counted as mastery",
			"remindFirst": "First time on this goal",
			"remindAfterFix": "Today's review answered independently",
			"remindNext": "Before moving to the next unit",
			"confirmHighConfidence": "Confirm high-confidence transcriptions",
			"draftsTitle": "Transcription ready to check",
			"draftsHelp": "The tutor transcribed this sheet; check each result and error cause before saving",
			"draftChoice": "Judged result",
			"confirmPaper": "Confirm results",
			"confirmPaperDone": "Checked results saved",
			"routineTitle": "Today’s subject routine",
			"routineHelp": "Practise one small routine per day for this unit’s focus; print it as a mini sheet if you like",
			"printDailySheet": "Print a daily mini sheet",
			"dictation": "Dictate in chat",
			"topCauses": "Recurring error causes",
			"focusLiteracy": "Read and write 3–5 new characters",
			"focusPinyin": "Pinyin and tones",
			"focusReading": "Read a short passage and find evidence",
			"focusWriting": "Write one or two sentences",
			"focusConcepts": "Explain the concept and quantities",
			"focusCalculation": "One set of oral or written calculation",
			"focusGeometry": "Point out shapes and directions and say them",
			"focusMeasurement": "Recognise and measure",
			"focusWords": "Read and spell 5–6 words",
			"focusSentences": "One sentence-pattern exchange",
			"focusStory": "Read a short story",
			"focusListen": "Listen and read a short passage",
			"focusProject": "A small situational task",
			"focusReview": "Review this unit’s past mistakes",
			"parentView": "Parent",
			"otherWays": "Another way",
			"sync": "Sync",
			"syncHelp": "Practise the confirmed school unit, or labelled foundations when that course is not confirmed yet",
			"markAllCorrect": "Mark all right",
			"masteryProgress": "Independent days",
			"goalMastered": "Three independent days — this goal is mastered!",
			"explainPrompt": "Say in one sentence how you did it",
			"figureCounter": "Counter",
			"figureSticks": "Counting sticks",
			"figureClock": "Clock",
			"figureSplit": "Number split",
			"figureFourline": "Four-line grid",
			"figureTianzige": "Character grid",
			"figureMoney": "Chinese money",
			"figureVertical": "Column arithmetic",
			"figureShapes": "Shape comparison",
			"figureSequence": "Pattern strip",
			"figureOverlap": "Overlap circles",
			"figureWall": "Number wall",
			"figureGrid": "Grid",
			"figureMeasure": "Centimetre ruler",
			"figureCompass": "Direction board",
			"figureBalance": "Balance scale",
			"figureSketch": "Sketch",
			"figureTensPlace": "Tens",
			"figureOnesPlace": "Ones",
			"compassNorth": "North",
			"compassSouth": "South",
			"compassWest": "West",
			"compassEast": "East",
			"interestPractice": "Practise this goal in a favourite scene",
			"openLesson": "Open an interactive lesson",
			"goToClass": "Go to class",
			"dueTodayTitle": "Clear today",
			"dueTodayHelp": "Clear these today. Leave the rest of the overdue list for later",
			"clearDue": "Clear these {count}",
			"dueLater": "{count} more can wait",
			"interestFocusLabel": "Today's scene",
			"interestsTitle": "Interest tags",
			"interestsHelp": "Enter 3 to 8 themes the child likes. Questions and lessons use them as scenes. Facts stay on the knowledge map",
			"interestTag": "Tag",
			"addInterest": "Add a tag",
			"removeInterest": "Remove the last tag",
			"interestConfirm": "Parent confirms the interest tags",
			"interestCount": "Enter 3 to 8 different tags",
			"interestShape": "Use 2 to 16 Chinese characters, letters or digits for each tag",
			"openmaicTitle": "Interactive lesson",
			"openmaicHelp": "Generate one lesson on this computer with OpenMAIC from today's goal. The tutor runs generation; this list opens the link in the browser",
			"openmaicEmpty": "No interactive lessons yet",
			"openmaicGenerate": "Ask the tutor to generate",
			"openmaicOpen": "Open in browser",
			"openmaicCopy": "Copy link",
			"openmaicCopied": "Copied",
			"openmaicRetry": "Ask the tutor to retry",
			"openmaicReview": "Review after class",
			"openmaicGenerating": "Generating",
			"openmaicReady": "Ready",
			"openmaicFailed": "Failed",
			"openmaicWarning": "Notice",
			"openmaicOutline": "After-class summary",
			"openmaicBase": "OpenMAIC address",
			"openmaicBaseHelp": "Leave blank to use OPENMAIC_BASE, or http://localhost:3000 when that variable is unset",
			"openmaicAccessHint": "If the service asks for an access code, set OPENMAIC_ACCESS_CODE in the environment that runs DSH. The code is not saved in the learning profile",
			"openmaicConfirm": "Parent confirms the OpenMAIC address",
			"openmaicEffective": "In use"
		};
		//#endregion
		//#region lib/types/client/bridge.js
		/** Register the native submission echo without changing the user's composer draft. */
		function tutorBridge(context, sessionId, unavailable, failed) {
			return async (text, photo) => {
				const session = context.sessions.binding(sessionId)?.session;
				if (!session) throw new Error(unavailable);
				const submission = session.beginSubmission({
					mode: "queue",
					text,
					attachments: photo ? [{
						type: "image",
						value: {
							previewUrl: photo.preview,
							name: photo.name
						}
					}] : []
				});
				try {
					const result = await session.prompt([{
						type: "text",
						text
					}, ...photo ? [{
						type: "image",
						mediaType: photo.mediaType,
						data: photo.data,
						name: photo.name
					}] : []], "queue", void 0, submission.requestId);
					if (!result.ok) throw new Error(result.error.message || failed);
				} catch (error) {
					submission.abandon();
					throw error;
				}
			};
		}
		//#endregion
		//#region lib/types/interests.js
		/** One saved tag: 2–16 Han characters, letters or digits, with no spaces. */
		const INTEREST_TAG = /^[\p{Script=Han}A-Za-z0-9]{2,16}$/u;
		/** Error causes offered for one subject; the parent can change any classification. */
		const errorTypesBySubject = {
			math: [
				"carry-borrow",
				"place-value",
				"operation-choice",
				"calculation",
				"unit-quantity",
				"reading-task",
				"pattern",
				"geometry-feature",
				"money-measure",
				"reasoning-incomplete"
			],
			chinese: [
				"pinyin-tone",
				"character-form",
				"character-usage",
				"word-meaning",
				"reading-evidence",
				"order",
				"expression-incomplete",
				"punctuation",
				"listening"
			],
			english: [
				"spelling",
				"word-meaning",
				"word-form",
				"sentence-pattern",
				"usage-context",
				"listening",
				"spoken-response",
				"writing-complete"
			]
		};
		//#endregion
		//#region lib/types/client/forms.js
		const subjects$1 = [
			"chinese",
			"math",
			"english"
		];
		const read = (form, name) => String(form.get(name) ?? "").trim();
		/** Labelled native field with browser validation, preserving unsaved text across polling. */
		function Field({ name, label, value = "", type = "text", min, max, required = true }) {
			return (0, react_jsx_runtime.jsxs)("label", { children: [label, (0, react_jsx_runtime.jsx)("input", {
				name,
				defaultValue: value,
				type,
				min,
				max,
				required,
				maxLength: 2e3
			})] });
		}
		function SaveForm({ revision, baseline, submit, children, t, disabled = false, button = "save" }) {
			const [base, setBase] = (0, react.useState)({
				revision,
				baseline
			});
			(0, react.useEffect)(() => {
				setBase((previous) => previous.baseline === baseline || previous.revision === revision ? {
					revision,
					baseline
				} : previous);
			}, [revision, baseline]);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [saved, setSaved] = (0, react.useState)(false);
			async function save(event) {
				event.preventDefault();
				if (busy) return;
				const values = new FormData(event.currentTarget);
				setBusy(true);
				setSaved(false);
				setError("");
				try {
					const result = await submit(values, base.revision);
					setBase({
						revision: result.revision,
						baseline
					});
					setSaved(true);
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : t("networkError"));
				} finally {
					setBusy(false);
				}
			}
			return (0, react_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => {
					save(event);
				},
				onChange: () => setSaved(false),
				children: [
					(0, react_jsx_runtime.jsxs)("fieldset", {
						disabled: disabled || busy,
						children: [children, (0, react_jsx_runtime.jsx)("button", {
							type: "submit",
							children: busy ? t("busy") : t(button)
						})]
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: error
					}),
					saved && (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: t("saved")
					})
				]
			});
		}
		/** Parent-confirmed setup or in-place profile update, plus an atomic textbook/course update. */
		function ParentSettings({ data, change, t, curriculum = null, subject = "math", onSubject }) {
			const [progressError, setProgressError] = (0, react.useState)("");
			const study = data.study;
			const profile = study?.profile;
			const today = new Date(data.serverNow + 288e5);
			const currentYear = today.getUTCFullYear() - (today.getUTCMonth() < 8 ? 1 : 0);
			const years = Array.from({ length: 7 }, (_, index) => `${currentYear + 1 - index}–${currentYear + 2 - index}`);
			return (0, react_jsx_runtime.jsxs)("section", { children: [
				(0, react_jsx_runtime.jsx)("p", { children: t("parentHelp") }),
				(0, react_jsx_runtime.jsxs)(SaveForm, {
					revision: data.revision,
					baseline: JSON.stringify(profile ?? null),
					t,
					submit: (form, revision) => change({
						action: "setup",
						profile: {
							nickname: read(form, "nickname"),
							region: read(form, "region"),
							grade: Number(form.get("grade")),
							term: form.get("term") === "second" ? "second" : "first",
							schoolYear: read(form, "schoolYear"),
							schoolAlias: read(form, "schoolAlias"),
							schoolSystem: form.get("schoolSystem") === "six-three" ? "six-three" : "five-four",
							parentConfirmation: t("profileConfirm")
						}
					}, revision),
					children: [
						(0, react_jsx_runtime.jsx)(Field, {
							name: "nickname",
							label: t("nickname"),
							value: profile?.nickname ?? ""
						}),
						(0, react_jsx_runtime.jsx)(Field, {
							name: "region",
							label: t("region"),
							value: profile?.region ?? "上海市"
						}),
						(0, react_jsx_runtime.jsx)(Field, {
							name: "grade",
							label: t("grade"),
							value: profile?.grade ?? 2,
							type: "number",
							min: 1,
							max: 6
						}),
						(0, react_jsx_runtime.jsxs)("label", { children: [t("term"), (0, react_jsx_runtime.jsxs)("select", {
							name: "term",
							"aria-label": t("term"),
							defaultValue: profile?.term ?? "first",
							children: [(0, react_jsx_runtime.jsx)("option", {
								value: "first",
								children: t("first")
							}), (0, react_jsx_runtime.jsx)("option", {
								value: "second",
								children: t("second")
							})]
						})] }),
						(0, react_jsx_runtime.jsxs)("label", { children: [t("schoolYear"), (0, react_jsx_runtime.jsxs)("select", {
							name: "schoolYear",
							"aria-label": t("schoolYear"),
							defaultValue: profile?.schoolYear ?? "",
							required: true,
							children: [(0, react_jsx_runtime.jsx)("option", {
								value: "",
								disabled: true,
								children: t("chooseSchoolYear")
							}), years.map((year) => (0, react_jsx_runtime.jsx)("option", {
								value: year,
								children: year
							}, year))]
						})] }),
						(0, react_jsx_runtime.jsx)("p", { children: t("schoolYearHelp") }),
						(0, react_jsx_runtime.jsx)(Field, {
							name: "schoolAlias",
							label: t("schoolAlias"),
							value: profile?.schoolAlias ?? "",
							required: false
						}),
						(0, react_jsx_runtime.jsx)("p", { children: t("schoolAliasHelp") }),
						(0, react_jsx_runtime.jsxs)("label", { children: [t("schoolSystem"), (0, react_jsx_runtime.jsxs)("select", {
							name: "schoolSystem",
							"aria-label": t("schoolSystem"),
							defaultValue: profile?.schoolSystem ?? "five-four",
							children: [(0, react_jsx_runtime.jsx)("option", {
								value: "five-four",
								children: t("five-four")
							}), (0, react_jsx_runtime.jsx)("option", {
								value: "six-three",
								children: t("six-three")
							})]
						})] })
					]
				}),
				profile && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("curriculum") }),
					(0, react_jsx_runtime.jsx)("p", { children: t("materialHelp") }),
					study.courses.map((course) => (0, react_jsx_runtime.jsxs)("p", { children: [
						t(course.subject),
						" · ",
						study.materials.find((item) => item.id === course.materialId)?.title,
						" · ",
						course.unit
					] }, course.subject)),
					(0, react_jsx_runtime.jsxs)(SaveForm, {
						revision: data.revision,
						baseline: JSON.stringify({
							scope: {
								region: profile.region,
								grade: profile.grade,
								term: profile.term,
								schoolYear: profile.schoolYear,
								schoolSystem: profile.schoolSystem
							},
							course: study.courses.find((item) => item.subject === subject)
						}),
						t,
						submit: async (form, revision) => {
							const materialId = crypto.randomUUID();
							const selected = read(form, "subject");
							const courseSubject = subjects$1.find((item) => item === selected) ?? subject;
							const unitId = read(form, "unitId");
							const unit = curriculum?.scope.current ? curriculum.units.find((item) => item.id === unitId) : void 0;
							const { region, grade, term, schoolYear, schoolSystem } = profile;
							const existing = study.courses.find((item) => item.subject === courseSubject)?.progress;
							return change({
								action: "configure-course",
								material: {
									id: materialId,
									subject: courseSubject,
									scope: {
										region,
										grade,
										term,
										schoolYear,
										schoolSystem
									},
									title: curriculum?.scope.current ? curriculum.title : t(courseSubject),
									publisher: t("mapMaterialPublisher"),
									edition: curriculum?.scope.current ? curriculum.id : t("mapMaterialEdition"),
									editionStatus: "identified",
									kind: "official-textbook",
									locator: curriculum?.scope.current ? `knowledge/curriculum/${curriculum.id}.json` : t("mapMaterialLocator"),
									evidence: t("mapMaterialEvidence")
								},
								course: {
									subject: courseSubject,
									materialId,
									unit: unit?.name ?? read(form, "unit"),
									parentConfirmation: t("materialConfirm")
								},
								...unit ? { progress: {
									unitId: unit.id,
									posture: existing?.posture ?? "keep-up",
									preview: existing?.preview ? "on" : "off",
									pace: existing?.pace ?? "teaching",
									parentConfirmation: t("confirmSchoolProgress")
								} } : {}
							}, revision);
						},
						children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("subject"), (0, react_jsx_runtime.jsx)("select", {
							name: "subject",
							"aria-label": t("subject"),
							value: subject,
							onChange: (event) => {
								const next = subjects$1.find((item) => item === event.target.value);
								if (next) onSubject?.(next);
							},
							children: subjects$1.map((item) => (0, react_jsx_runtime.jsx)("option", {
								value: item,
								children: t(item)
							}, item))
						})] }), curriculum?.scope.current ? (0, react_jsx_runtime.jsxs)("label", { children: [t("unit"), (0, react_jsx_runtime.jsxs)("select", {
							name: "unitId",
							"aria-label": t("unit"),
							defaultValue: study.courses.find((item) => item.subject === subject)?.progress?.unitId ?? "",
							required: true,
							children: [(0, react_jsx_runtime.jsx)("option", {
								value: "",
								disabled: true,
								children: t("chooseUnit")
							}), curriculum.units.map((unit) => (0, react_jsx_runtime.jsx)("option", {
								value: unit.id,
								children: unit.name
							}, unit.id))]
						}, subject)] }) : (0, react_jsx_runtime.jsx)(Field, {
							name: "unit",
							label: t("unit")
						})]
					}),
					curriculum?.scope.current && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)("h3", { children: t("schoolFrontier") }),
						(0, react_jsx_runtime.jsx)("p", { children: t("schoolProgressHelp") }),
						onSubject && (0, react_jsx_runtime.jsx)("nav", {
							className: "student-segments",
							"aria-label": t("schoolFrontier"),
							children: subjects$1.map((item) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": subject === item,
								onClick: () => onSubject(item),
								children: t(item)
							}, item))
						}),
						study.courses.some((course) => course.subject === subject) ? (0, react_jsx_runtime.jsxs)("form", {
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								const submitter = event.nativeEvent.submitter;
								const move = submitter instanceof HTMLButtonElement ? submitter.value : "stay";
								const units = curriculum.units;
								const selected = String(form.get("unitId") ?? "");
								const index = units.findIndex((unit) => unit.id === selected);
								const next = units[index + 1];
								if (index < 0) return;
								if (move === "next" && !next) {
									setProgressError(t("noNextUnit"));
									return;
								}
								setProgressError("");
								change({
									action: "school-progress",
									subject,
									unitId: move === "next" && next ? next.id : selected,
									posture: form.get("posture") === "catch-up" ? "catch-up" : "keep-up",
									preview: form.get("preview") === "on" ? "on" : "off",
									pace: move === "review" ? "review" : "teaching",
									parentConfirmation: t("confirmSchoolProgress")
								}, data.revision);
							},
							children: [
								(0, react_jsx_runtime.jsxs)("label", { children: [t("schoolFrontier"), (0, react_jsx_runtime.jsx)("select", {
									name: "unitId",
									"aria-label": t("schoolFrontier"),
									defaultValue: study.courses.find((course) => course.subject === subject)?.progress?.unitId ?? curriculum.units[0]?.id,
									required: true,
									children: curriculum.units.map((unit) => (0, react_jsx_runtime.jsx)("option", {
										value: unit.id,
										children: unit.name
									}, unit.id))
								})] }),
								(0, react_jsx_runtime.jsxs)("label", { children: [t("keepUp"), (0, react_jsx_runtime.jsxs)("select", {
									name: "posture",
									"aria-label": t("keepUp"),
									defaultValue: study.courses.find((course) => course.subject === subject)?.progress?.posture ?? "keep-up",
									children: [(0, react_jsx_runtime.jsx)("option", {
										value: "keep-up",
										children: t("keepUp")
									}), (0, react_jsx_runtime.jsx)("option", {
										value: "catch-up",
										children: t("catchUp")
									})]
								})] }),
								(0, react_jsx_runtime.jsxs)("label", {
									className: "student-check",
									children: [(0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										name: "preview",
										defaultChecked: study.courses.find((course) => course.subject === subject)?.progress?.preview === true
									}), t("previewUnit")]
								}),
								progressError && (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									children: progressError
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: "student-segments",
									children: [
										(0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											value: "stay",
											children: t("stillThisUnit")
										}),
										(0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											value: "next",
											children: t("nextSchoolUnit")
										}),
										(0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											value: "review",
											children: t("reviewWeek")
										})
									]
								})
							]
						}, `${subject}:${study.courses.find((course) => course.subject === subject)?.progress?.unitId ?? ""}`) : (0, react_jsx_runtime.jsx)("p", { children: t("schoolProgressNeedsCourse") })
					] }),
					(0, react_jsx_runtime.jsx)(InterestsForm, {
						tags: study.interests,
						revision: data.revision,
						change,
						t
					}),
					(0, react_jsx_runtime.jsx)("h3", { children: t("openmaicTitle") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("openmaicBaseHelp")
					}),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("openmaicEffective"),
						": ",
						data.interactiveLessons.baseUrl
					] }),
					(0, react_jsx_runtime.jsxs)(SaveForm, {
						revision: data.revision,
						baseline: study.openmaic?.savedBaseUrl ?? "",
						t,
						submit: (form, revision) => change({
							action: "openmaic-settings",
							baseUrl: read(form, "baseUrl"),
							parentConfirmation: t("openmaicConfirm")
						}, revision),
						children: [(0, react_jsx_runtime.jsx)(Field, {
							name: "baseUrl",
							label: t("openmaicBase"),
							value: study.openmaic?.savedBaseUrl ?? "",
							required: false
						}), (0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("openmaicAccessHint")
						})]
					}),
					data.study && (0, react_jsx_runtime.jsxs)("div", { children: [
						(0, react_jsx_runtime.jsx)("h3", { children: t("archiveTerm") }),
						(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("archiveTermHelp")
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: !!study.active,
							onClick: () => {
								if (!window.confirm(t("archiveTermConfirm"))) return;
								change({
									action: "archive-term",
									parentConfirmation: t("archiveTermConfirmation")
								}, data.revision).catch(() => {});
							},
							children: t("archiveTerm")
						})
					] })
				] })
			] });
		}
		/** Parent theme tags. The saved list is edited here; an empty profile shows the example tags from status. */
		function InterestsForm({ tags, revision, change, t }) {
			const [draft, setDraft] = (0, react.useState)(tags);
			return (0, react_jsx_runtime.jsxs)(SaveForm, {
				revision,
				baseline: JSON.stringify(tags),
				t,
				submit: (_form, nextRevision) => {
					const next = [...new Set(draft.map((tag) => tag.trim()).filter((tag) => tag !== ""))];
					if (next.length < 3 || next.length > 8) throw new Error(t("interestCount"));
					if (next.some((tag) => !INTEREST_TAG.test(tag))) throw new Error(t("interestShape"));
					return change({
						action: "interests",
						tags: next,
						parentConfirmation: t("interestConfirm")
					}, nextRevision);
				},
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("interestsTitle") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("interestsHelp")
					}),
					draft.map((tag, index) => (0, react_jsx_runtime.jsxs)("label", { children: [
						t("interestTag"),
						" ",
						index + 1,
						(0, react_jsx_runtime.jsx)("input", {
							"aria-label": `${t("interestTag")} ${index + 1}`,
							value: tag,
							required: true,
							minLength: 2,
							maxLength: 16,
							onChange: (event) => setDraft(draft.map((item, itemIndex) => itemIndex === index ? event.target.value : item))
						})
					] }, index)),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "student-segments",
						children: [draft.length < 8 && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDraft([...draft, ""]),
							children: t("addInterest")
						}), draft.length > 3 && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDraft(draft.slice(0, -1)),
							children: t("removeInterest")
						})]
					})
				]
			});
		}
		/** Confirmation retains the unedited image transcription until a user explicitly saves it. */
		function MistakeConfirmation({ mistake, revision, change, t }) {
			return (0, react_jsx_runtime.jsxs)("details", { children: [
				(0, react_jsx_runtime.jsx)("summary", { children: mistake.topic }),
				(0, react_jsx_runtime.jsxs)("p", { children: [
					t("learnerAnswer"),
					": ",
					mistake.learnerAnswer
				] }),
				mistake.uncertainties && (0, react_jsx_runtime.jsxs)("p", { children: [
					t("uncertainties"),
					": ",
					mistake.uncertainties
				] }),
				(0, react_jsx_runtime.jsxs)(SaveForm, {
					revision,
					baseline: JSON.stringify(mistake),
					t,
					button: "confirm",
					submit: (form, base) => {
						const picked = read(form, "errorType");
						const errorType = errorTypesBySubject[mistake.subject].find((candidate) => candidate === picked);
						return change({
							action: "confirm-mistake",
							id: mistake.id,
							prompt: read(form, "prompt"),
							learnerAnswer: read(form, "learnerAnswer"),
							correction: read(form, "correction"),
							explanation: read(form, "explanation"),
							answerEvidence: read(form, "answerEvidence"),
							...errorType !== void 0 ? { errorType } : {},
							userConfirmation: t("confirmMistake")
						}, base);
					},
					children: [[
						"prompt",
						"learnerAnswer",
						"correction",
						"explanation",
						"answerEvidence"
					].map((name) => (0, react_jsx_runtime.jsxs)("label", { children: [t(name), (0, react_jsx_runtime.jsx)("textarea", {
						"aria-label": t(name),
						name,
						defaultValue: mistake[name],
						required: true,
						maxLength: 2e3
					})] }, name)), (0, react_jsx_runtime.jsxs)("label", { children: [t("errorTypeLabel"), (0, react_jsx_runtime.jsxs)("select", {
						name: "errorType",
						defaultValue: mistake.errorType ?? "",
						children: [(0, react_jsx_runtime.jsx)("option", {
							value: "",
							children: t("errorTypeNone")
						}), errorTypesBySubject[mistake.subject].map((type) => (0, react_jsx_runtime.jsx)("option", {
							value: type,
							children: t(type)
						}, type))]
					})] })]
				})
			] });
		}
		//#endregion
		//#region lib/types/client/workspace.js
		/** Poll visible workbenches; preserve data on failure and discard obsolete responses. */
		function useStudy(sessionId, visible, networkError, query) {
			const [data, setData] = (0, react.useState)();
			const [error, setError] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const latest = (0, react.useRef)(0);
			const alive = (0, react.useRef)(true);
			const writing = (0, react.useRef)(false);
			const offset = (0, react.useRef)(0);
			const controllers = (0, react.useRef)(/* @__PURE__ */ new Set());
			const request = (0, react.useCallback)(async (change, revision) => {
				const sequence = ++latest.current;
				const controller = new AbortController();
				controllers.current.add(controller);
				try {
					const scope = `${query.mapGrade !== void 0 ? `&mapGrade=${query.mapGrade}` : ""}${query.mapTerm !== void 0 ? `&mapTerm=${query.mapTerm}` : ""}${query.diagGrade !== void 0 ? `&diagGrade=${query.diagGrade}` : ""}${query.diagTerm !== void 0 ? `&diagTerm=${query.diagTerm}` : ""}${query.diagUnit !== void 0 && query.diagUnit !== "" ? `&diagUnit=${encodeURIComponent(query.diagUnit)}` : ""}`;
					const response = await fetch(`/student/workspace?sessionId=${encodeURIComponent(sessionId)}&tab=${query.tab}&mistakeOffset=${query.offset}&subject=${query.subject}&mistakeStatus=${query.status}${scope}`, {
						signal: controller.signal,
						...change ? {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: JSON.stringify({
								revision,
								change
							})
						} : {}
					});
					const value = await response.json();
					if (!response.ok) throw new Error(value.error ?? networkError);
					if (alive.current && sequence === latest.current) {
						offset.current = value.serverNow - Date.now();
						setData(value);
						setError("");
					}
					return value;
				} catch (reason) {
					if (alive.current && !controller.signal.aborted && sequence === latest.current) setError(reason instanceof Error ? reason.message : networkError);
					throw reason;
				} finally {
					controllers.current.delete(controller);
				}
			}, [
				sessionId,
				networkError,
				query.tab,
				query.offset,
				query.subject,
				query.status,
				query.mapGrade,
				query.mapTerm,
				query.diagGrade,
				query.diagTerm,
				query.diagUnit
			]);
			const reload = (0, react.useCallback)(async () => {
				if (writing.current) return;
				await request().catch(() => {});
			}, [request]);
			(0, react.useEffect)(() => {
				alive.current = true;
				return () => {
					alive.current = false;
					latest.current++;
					for (const controller of controllers.current) controller.abort();
				};
			}, []);
			(0, react.useEffect)(() => {
				if (!visible) return;
				reload();
				const timer = window.setInterval(() => {
					if (document.visibilityState !== "hidden") reload();
				}, 3e3);
				return () => window.clearInterval(timer);
			}, [visible, reload]);
			return {
				data,
				error,
				busy,
				reload,
				change: (0, react.useCallback)(async (command, revision = data?.revision ?? 0) => {
					if (writing.current) throw new Error(networkError);
					writing.current = true;
					setBusy(true);
					try {
						return await request(command, revision);
					} finally {
						writing.current = false;
						if (alive.current) setBusy(false);
					}
				}, [
					request,
					data?.revision,
					networkError
				]),
				offset
			};
		}
		//#endregion
		//#region lib/types/client/display.js
		/** Shared subject order for the workbench. */
		const subjects = [
			"chinese",
			"math",
			"english"
		];
		const levelKeys = {
			due: "levelDue",
			weak: "levelWeak",
			stalled: "levelStalled",
			mastered: "levelMastered",
			practising: "levelPractising",
			untouched: "levelUntouched"
		};
		const reasonKeys = {
			"due-mistakes": "reasonDue",
			"open-mistakes": "reasonOpen",
			"recent-help-or-error": "reasonRecent",
			"recurring-error": "reasonRecurring",
			"not-practised-recently": "reasonStalled",
			"not-started": "reasonNew",
			"diagnosis-due": "reasonDiagnose",
			preview: "reasonPreview",
			"school-pace": "reasonSchoolPace",
			"needs-teaching": "reasonTeaching",
			"prerequisite-gap": "reasonPrerequisite"
		};
		const planKeys = {
			review: "recommendReview",
			practice: "recommendPractice",
			diagnose: "recommendDiagnose",
			learn: "recommendLearn",
			preview: "recommendPreview",
			hold: "recommendHold"
		};
		const intensityKeys = {
			light: "intensityLight",
			standard: "intensityStandard",
			deep: "intensityDeep"
		};
		const intensityHelpKeys = {
			light: "intensityLightHelp",
			standard: "intensityStandardHelp",
			deep: "intensityDeepHelp"
		};
		const sampleKeys = {
			untouched: "sampleUntouched",
			stalled: "sampleStalled",
			recheck: "sampleRecheck",
			progress: "sampleProgress"
		};
		const assistKeys = {
			independent: "assistIndependent",
			hint: "assistHint",
			"worked-example": "assistWorked"
		};
		const focusKeys = {
			literacy: "focusLiteracy",
			pinyin: "focusPinyin",
			reading: "focusReading",
			writing: "focusWriting",
			concepts: "focusConcepts",
			calculation: "focusCalculation",
			geometry: "focusGeometry",
			measurement: "focusMeasurement",
			words: "focusWords",
			sentences: "focusSentences",
			story: "focusStory",
			listen: "focusListen",
			project: "focusProject",
			review: "focusReview"
		};
		const reminderKeys = {
			"first-explain": "remindFirst",
			"after-correction": "remindAfterFix",
			"before-next": "remindNext"
		};
		/** Local calendar date, or an empty string when unknown. */
		function day(ms) {
			return ms === void 0 ? "" : new Date(ms).toLocaleDateString();
		}
		/** One line of evidence reasons for a goal or recommendation. */
		function reasonText(reasons, t) {
			return reasons.map((reason) => reason.code === "not-started" || reason.code === "preview" || reason.code === "school-pace" || reason.code === "needs-teaching" ? t(reasonKeys[reason.code]) : `${t(reasonKeys[reason.code])} ${reason.count}`).join(" · ");
		}
		//#endregion
		//#region lib/types/client/ideas-view.js
		function isGrouped(edge) {
			return edge.kind === "contrast" || edge.kind === "part-of" || edge.kind === "cause-effect";
		}
		function grouped(relations) {
			const result = [];
			for (const edge of relations) if (isGrouped(edge)) result.push(edge);
			return result;
		}
		/** Parent concepts: compare / classify / cause for the open book, then the subject's cross-grade idea list. */
		function IdeasView({ study, curriculum, t, onOpenConcept }) {
			const nameOf = (id) => curriculum?.concepts.find((item) => item.id === id)?.name ?? study.concepts.find((item) => item.id === id)?.name ?? id;
			const open = (id) => {
				if (!onOpenConcept) return;
				if (curriculum?.concepts.some((item) => item.id === id) || study.concepts.some((item) => item.id === id)) onOpenConcept(id);
			};
			const ConceptLink = ({ id }) => onOpenConcept && (curriculum?.concepts.some((item) => item.id === id) || study.concepts.some((item) => item.id === id)) ? (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "student-quiet",
				onClick: () => open(id),
				children: nameOf(id)
			}) : (0, react_jsx_runtime.jsx)("span", { children: nameOf(id) });
			const shipped = grouped(curriculum?.relations ?? []);
			const confirmed = grouped(study.relations);
			const edges = [...shipped, ...confirmed.filter((edge) => !shipped.some((item) => item.id === edge.id))];
			const contrasts = edges.filter((edge) => edge.kind === "contrast");
			const causes = edges.filter((edge) => edge.kind === "cause-effect");
			const classes = /* @__PURE__ */ new Map();
			for (const edge of edges) {
				if (edge.kind !== "part-of") continue;
				const members = classes.get(edge.toId) ?? [];
				members.push(edge);
				classes.set(edge.toId, members);
			}
			const ideaConcepts = (ideaId) => curriculum?.concepts.filter((item) => (item.ideaIds ?? []).includes(ideaId)) ?? [];
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("ideas") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("ideasHelp")
					}),
					onOpenConcept && (0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("ideasOpenOnMap")
					})
				] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsx)("h3", { children: t("compareGroup") }), contrasts.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
					className: "student-muted",
					children: t("relationEmpty")
				}) : contrasts.map((edge) => (0, react_jsx_runtime.jsxs)("div", {
					className: "student-unit",
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: "student-pair",
						children: [(0, react_jsx_runtime.jsx)("p", { children: (0, react_jsx_runtime.jsx)(ConceptLink, { id: edge.fromId }) }), (0, react_jsx_runtime.jsx)("p", { children: (0, react_jsx_runtime.jsx)(ConceptLink, { id: edge.toId }) })]
					}), (0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: edge.explanation
					})]
				}, edge.id))] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsx)("h3", { children: t("classifyGroup") }), classes.size === 0 ? (0, react_jsx_runtime.jsx)("p", {
					className: "student-muted",
					children: t("relationEmpty")
				}) : [...classes].map(([category, members]) => (0, react_jsx_runtime.jsxs)("div", {
					className: "student-unit",
					children: [(0, react_jsx_runtime.jsx)("p", { children: (0, react_jsx_runtime.jsx)(ConceptLink, { id: category }) }), (0, react_jsx_runtime.jsx)("ul", { children: members.map((edge) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)(ConceptLink, { id: edge.fromId }), (0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: edge.explanation
					})] }, edge.id)) })]
				}, category))] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsx)("h3", { children: t("causeGroup") }), causes.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
					className: "student-muted",
					children: t("relationEmpty")
				}) : causes.map((edge) => (0, react_jsx_runtime.jsxs)("div", {
					className: "student-unit",
					children: [(0, react_jsx_runtime.jsxs)("p", { children: [
						(0, react_jsx_runtime.jsx)(ConceptLink, { id: edge.fromId }),
						" → ",
						(0, react_jsx_runtime.jsx)(ConceptLink, { id: edge.toId })
					] }), (0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: edge.explanation
					})]
				}, edge.id))] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsx)("h3", { children: t("ideaCatalog") }), curriculum && curriculum.ideas.length > 0 ? curriculum.ideas.map((idea) => {
					const linked = ideaConcepts(idea.id);
					return (0, react_jsx_runtime.jsxs)("div", {
						className: "student-unit",
						children: [
							(0, react_jsx_runtime.jsx)("p", { children: idea.name }),
							(0, react_jsx_runtime.jsxs)("p", { children: [
								t("definition"),
								": ",
								idea.definition
							] }),
							(0, react_jsx_runtime.jsxs)("p", {
								className: "student-muted",
								children: [
									t("example"),
									": ",
									idea.example
								]
							}),
							linked.length > 0 && (0, react_jsx_runtime.jsxs)("p", {
								className: "student-muted",
								children: [
									t("ideaOnMap"),
									": ",
									linked.map((item, index) => (0, react_jsx_runtime.jsxs)("span", { children: [index > 0 ? " · " : "", (0, react_jsx_runtime.jsx)(ConceptLink, { id: item.id })] }, item.id))
								]
							})
						]
					}, idea.id);
				}) : (0, react_jsx_runtime.jsx)("p", { children: t("mapUnavailable") })] })
			] });
		}
		//#endregion
		//#region lib/types/client/mastery-dots.js
		/** Three dots showing independent-correct days toward mastery (n of 3); undefined hides the row. */
		function MasteryDots({ days, t }) {
			if (days === void 0) return null;
			const lit = Math.min(3, days);
			return (0, react_jsx_runtime.jsx)("p", {
				className: "student-mastery",
				"aria-label": `${t("masteryProgress")} ${lit}/3`,
				children: [
					0,
					1,
					2
				].map((index) => (0, react_jsx_runtime.jsx)("span", { className: index < lit ? "student-level-mastered" : "student-level-untouched" }, index))
			});
		}
		//#endregion
		//#region lib/types/client/map-view.js
		const levels = [
			"mastered",
			"practising",
			"stalled",
			"weak",
			"due",
			"untouched"
		];
		function matchesFilter(level, filter) {
			if (filter === "all") return true;
			if (filter === "untouched") return level === "untouched";
			return level === "weak" || level === "due" || level === "stalled";
		}
		/** Parent map: unit spine with inline concept detail, pending concepts, and folded check-ins. */
		function MapView({ study, curriculum, subject, selectedConceptId, setSelectedConceptId, selectedObjectiveId, clearGoal, chooseGoal, active, scopeGrade, scopeTerm, setMapGrade, setMapTerm, clearBrowse, intensities, setIntensity, scopeOf, setScope, selectSubject, startDiagnosis, disabled, running, organize, change, t }) {
			const [filter, setFilter] = (0, react.useState)("all");
			const progress = curriculum?.scope.current ? study.courses.find((item) => item.subject === subject)?.progress : void 0;
			const frontierIndex = progress ? curriculum?.units.findIndex((unit) => unit.id === progress.unitId) ?? -1 : -1;
			function unitNote(unitId) {
				if (!progress || frontierIndex < 0 || !curriculum) return void 0;
				const index = curriculum.units.findIndex((unit) => unit.id === unitId);
				if (index === frontierIndex) return t("schoolHere");
				if (progress.preview && progress.pace === "teaching" && index === frontierIndex + 1) return t("previewUnit");
				if (index > frontierIndex) return t("notTaughtYet");
			}
			const selectedConcept = curriculum?.concepts.find((item) => item.id === selectedConceptId);
			const chosen = (target) => intensities[target] ?? study.diagnostics.find((plan) => plan.subject === target)?.recommendedIntensity ?? "standard";
			const summary = curriculum?.summary;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: curriculum ? curriculum.title : t("map") }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "student-scope",
						children: [
							(0, react_jsx_runtime.jsxs)("label", { children: [t("mapScope"), (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": t("grade"),
								value: scopeGrade,
								onChange: (event) => setMapGrade(Number(event.target.value)),
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: 1,
									children: t("gradeOne")
								}), (0, react_jsx_runtime.jsx)("option", {
									value: 2,
									children: t("gradeTwo")
								})]
							})] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("term"), (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": t("term"),
								value: scopeTerm,
								onChange: (event) => setMapTerm(event.target.value === "second" ? "second" : "first"),
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "first",
									children: t("first")
								}), (0, react_jsx_runtime.jsx)("option", {
									value: "second",
									children: t("second")
								})]
							})] }),
							(scopeGrade !== study.profile.grade || scopeTerm !== study.profile.term) && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: clearBrowse,
								children: t("backToCurrent")
							})
						]
					}),
					curriculum && !curriculum.scope.current && (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: t("mapBrowsing")
					}),
					summary && (0, react_jsx_runtime.jsxs)("p", {
						className: "student-muted",
						children: [
							t("levelMastered"),
							" ",
							summary.mastered,
							" · ",
							t("levelPractising"),
							" ",
							summary.practising,
							" · ",
							t("levelWeak"),
							" ",
							summary.weak + summary.due,
							" · ",
							t("levelUntouched"),
							" ",
							summary.untouched,
							summary.stalled > 0 ? ` · ${t("levelStalled")} ${summary.stalled}` : ""
						]
					}),
					curriculum && (0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsx)("summary", { children: t("mapBasis") }), (0, react_jsx_runtime.jsx)("p", { children: curriculum.basis })] }),
					!curriculum && (0, react_jsx_runtime.jsx)("p", { children: t("mapUnavailable") }),
					selectedObjectiveId && !active && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: clearGoal,
						children: t("clearGoal")
					})
				] }),
				curriculum && (0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("mindMap") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("mindMapHelp")
					}),
					(0, react_jsx_runtime.jsx)("nav", {
						className: "student-segments",
						"aria-label": t("mapFilter"),
						children: [
							["all", "mapFilterAll"],
							["needs-work", "mapFilterNeedsWork"],
							["untouched", "mapFilterUntouched"]
						].map(([value, key]) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": filter === value,
							onClick: () => setFilter(value),
							children: t(key)
						}, value))
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: "student-legend",
						children: levels.map((level) => (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("span", { className: `student-dot student-level-${level}` }), t(levelKeys[level])] }, level))
					}),
					curriculum.units.map((unit) => {
						const own = curriculum.concepts.filter((item) => item.unit === unit.id);
						const shown = own.filter((item) => matchesFilter(item.level, filter));
						if (filter !== "all" && shown.length === 0) return null;
						const note = unitNote(unit.id);
						const open = unit.id === selectedConcept?.unit || frontierIndex >= 0 && curriculum.units[frontierIndex]?.id === unit.id;
						return (0, react_jsx_runtime.jsxs)("details", {
							className: "student-mindmap-unit",
							...open ? { open: true } : {},
							children: [
								(0, react_jsx_runtime.jsxs)("summary", { children: [
									unit.name,
									" · ",
									t("levelMastered"),
									" ",
									unit.mastered,
									"/",
									unit.concepts,
									unit.weak + unit.due > 0 ? ` · ${t("levelWeak")} ${unit.weak + unit.due}` : ""
								] }),
								note && (0, react_jsx_runtime.jsx)("p", {
									className: "student-muted",
									children: note
								}),
								(0, react_jsx_runtime.jsx)(StackedBar, {
									counts: countLevels(own),
									t
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: "student-muted",
									children: unit.summary
								}),
								shown.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
									className: "student-muted",
									children: t("mapFilterEmpty")
								}) : (0, react_jsx_runtime.jsx)("ul", {
									className: "student-mindmap-branch",
									children: shown.map((item) => (0, react_jsx_runtime.jsxs)("li", {
										className: "student-mindmap-node",
										children: [(0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: `student-mindmap-concept student-level-${item.level}`,
											"aria-pressed": selectedConceptId === item.id,
											onClick: () => setSelectedConceptId(item.id),
											children: [(0, react_jsx_runtime.jsx)("span", { className: `student-dot student-level-${item.level}` }), item.name]
										}), selectedConceptId === item.id && (0, react_jsx_runtime.jsx)(ConceptDetail, {
											curriculum,
											concept: item,
											selectedObjectiveId,
											chooseGoal,
											setSelectedConceptId,
											t
										})]
									}, item.id))
								})
							]
						}, `${unit.id}:${open ? selectedConceptId || "frontier" : "rest"}:${filter}`);
					}),
					filter !== "all" && curriculum.units.every((unit) => curriculum.concepts.filter((item) => item.unit === unit.id).filter((item) => matchesFilter(item.level, filter)).length === 0) && (0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("mapFilterEmpty")
					})
				] }),
				(study.objectives.length > 0 || study.concepts.length > 0) && (0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("learningGoal"),
						" · ",
						t("pendingConcept")
					] }),
					study.concepts.map((item) => (0, react_jsx_runtime.jsxs)("details", { children: [
						(0, react_jsx_runtime.jsxs)("summary", { children: [item.name, item.confirmedAt === void 0 ? ` · ${t("pendingConcept")}` : ""] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("definition"),
							": ",
							item.definition
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("example"),
							": ",
							item.example
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("source"),
							": ",
							item.source
						] }),
						item.confirmedAt === void 0 && (0, react_jsx_runtime.jsxs)("form", {
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								change({
									action: "confirm-concept",
									id: item.id,
									definition: String(form.get("definition") ?? ""),
									example: String(form.get("example") ?? ""),
									source: String(form.get("source") ?? ""),
									userConfirmation: t("confirmConcept")
								}).catch(() => {});
							},
							children: [[
								"definition",
								"example",
								"source"
							].map((name) => (0, react_jsx_runtime.jsxs)("label", { children: [t(name), (0, react_jsx_runtime.jsx)("textarea", {
								name,
								defaultValue: item[name],
								required: true,
								maxLength: 2e3
							})] }, name)), (0, react_jsx_runtime.jsx)("button", {
								disabled,
								type: "submit",
								children: t("confirmConcept")
							})]
						})
					] }, item.id)),
					study.relations.map((item) => (0, react_jsx_runtime.jsxs)("p", { children: [
						study.concepts.find((concept) => concept.id === item.fromId)?.name ?? item.fromId,
						" · ",
						t(item.kind),
						" · ",
						study.concepts.find((concept) => concept.id === item.toId)?.name ?? item.toId,
						": ",
						item.explanation,
						" · ",
						t("source"),
						": ",
						item.source
					] }, item.id)),
					study.objectives.map((item) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("p", { children: [
						item.title,
						" · ",
						t(item.method),
						": ",
						item.goal
					] }), (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": selectedObjectiveId === item.id,
						onClick: () => chooseGoal({
							id: item.id,
							subject
						}),
						children: [
							t("chooseGoal"),
							" · ",
							item.title
						]
					})] }, item.id)),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: disabled || running,
						onClick: organize,
						children: t("organizeConcepts")
					})
				] }),
				!(study.objectives.length > 0 || study.concepts.length > 0) && (0, react_jsx_runtime.jsx)("section", { children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: disabled || running,
					onClick: organize,
					children: t("organizeConcepts")
				}) }),
				(0, react_jsx_runtime.jsxs)("details", {
					className: "student-fold",
					children: [
						(0, react_jsx_runtime.jsx)("summary", { children: t("diagnosisTitle") }),
						(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("checkinHelp")
						}),
						study.diagnostics.map((plan) => {
							const target = plan.subject;
							const scope = scopeOf(target);
							const scoped = scope.grade !== void 0 || scope.term !== void 0;
							const shown = (scoped && target === subject ? study.scopedDiagnostic : null) ?? plan;
							const intensity = chosen(target);
							const sample = shown.samples[intensity];
							const history = study.checkIns.filter((item) => item.subject === target);
							const scopeUnits = scoped && target === subject ? study.scopedUnits ?? [] : [];
							return (0, react_jsx_runtime.jsxs)("section", { children: [
								(0, react_jsx_runtime.jsxs)("h3", { children: [
									t(target),
									" · ",
									t(shown.due ? "diagnosisDue" : "diagnosisNotDue")
								] }),
								(0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("scopeLabel"), (0, react_jsx_runtime.jsxs)("select", {
									"aria-label": t("scopeLabel"),
									value: scoped ? `${scope.grade ?? study.profile.grade}-${scope.term ?? study.profile.term}` : "current",
									onChange: (event) => {
										const value = event.target.value;
										if (value === "current") {
											setScope(target, {});
											return;
										}
										const [grade, term] = value.split("-");
										setScope(target, {
											grade: Number(grade),
											term
										});
										if (target !== subject) selectSubject(target);
									},
									children: [(0, react_jsx_runtime.jsx)("option", {
										value: "current",
										children: t("scopeCurrent")
									}), [
										[1, "first"],
										[1, "second"],
										[2, "first"],
										[2, "second"]
									].filter(([grade, term]) => !(grade === study.profile.grade && term === study.profile.term)).map(([grade, term]) => (0, react_jsx_runtime.jsxs)("option", {
										value: `${grade}-${term}`,
										children: [
											t(grade === 1 ? "gradeOne" : "gradeTwo"),
											" · ",
											t(term)
										]
									}, `${grade}-${term}`))]
								})] }), scoped && target === subject && (0, react_jsx_runtime.jsxs)("label", { children: [t("scopeUnit"), (0, react_jsx_runtime.jsxs)("select", {
									"aria-label": t("scopeUnit"),
									value: scope.unit ?? "",
									onChange: (event) => setScope(target, {
										...scope,
										...event.target.value ? { unit: event.target.value } : {}
									}),
									children: [(0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("scopeWholeMap")
									}), scopeUnits.map((unit) => (0, react_jsx_runtime.jsx)("option", {
										value: unit.id,
										children: unit.name
									}, unit.id))]
								})] })] }),
								(0, react_jsx_runtime.jsx)("p", { children: shown.lastAt !== void 0 ? `${t("diagnosisLast")}: ${day(shown.lastAt)} · ${t("nextCheck")}: ${day(shown.nextAt)}` : t("diagnosisNever") }),
								(0, react_jsx_runtime.jsxs)("p", { children: [
									t("coverage"),
									": ",
									shown.coverage.probed,
									" / ",
									shown.coverage.total
								] }),
								(0, react_jsx_runtime.jsx)("progress", {
									value: shown.coverage.probed,
									max: Math.max(1, shown.coverage.total),
									"aria-label": t("coverage")
								}),
								(0, react_jsx_runtime.jsx)("nav", {
									className: "student-segments",
									"aria-label": t("intensity"),
									children: [
										"light",
										"standard",
										"deep"
									].map((level) => (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-pressed": intensity === level,
										onClick: () => setIntensity(target, level),
										children: [
											t(intensityKeys[level]),
											" · ",
											shown.samples[level].length,
											shown.recommendedIntensity === level ? ` · ${t("recommended")}` : ""
										]
									}, level))
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: "student-muted",
									children: t(intensityHelpKeys[intensity])
								}),
								sample.length > 0 ? (0, react_jsx_runtime.jsxs)("p", {
									className: "student-muted",
									children: [
										t("diagnosisSample"),
										": ",
										sample.map((item) => `${item.title} · ${t(sampleKeys[item.reason])}`).join("；")
									]
								}) : (0, react_jsx_runtime.jsx)("p", { children: t("empty") }),
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: disabled || running || sample.length === 0,
									onClick: () => {
										startDiagnosis(target, intensity);
									},
									children: [
										t(shown.due ? "startDiagnosis" : "repeatDiagnosis"),
										" · ",
										t(target)
									]
								}),
								history.length > 0 && (0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsxs)("summary", { children: [
									t("history"),
									" · ",
									history.length
								] }), history.map((item) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("p", { children: [
									day(item.startedAt),
									" · ",
									t(intensityKeys[item.intensity]),
									" · ",
									t("assistIndependent"),
									" ",
									item.counts.independent,
									" · ",
									t("assistHint"),
									" ",
									item.counts.helped,
									" · ",
									t("wrong"),
									" ",
									item.counts.wrong
								] }), item.results.map((result) => (0, react_jsx_runtime.jsxs)("p", {
									className: "student-muted",
									children: [
										result.title,
										" · ",
										t(result.result),
										" · ",
										t(assistKeys[result.assistance])
									]
								}, result.id))] }, item.sessionId))] })
							] }, target);
						})
					]
				})
			] });
		}
		function ConceptDetail({ curriculum, concept, selectedObjectiveId, chooseGoal, setSelectedConceptId, t }) {
			const goals = curriculum.objectives.filter((item) => item.conceptIds.includes(concept.id));
			const relations = curriculum.relations.filter((relation) => relation.fromId === concept.id || relation.toId === concept.id);
			const nameOf = (id) => curriculum.concepts.find((item) => item.id === id)?.name ?? id;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "student-map-inline",
				"aria-live": "polite",
				children: [
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("definition"),
						": ",
						concept.definition
					] }),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("example"),
						": ",
						concept.example
					] }),
					(concept.ideaIds ?? []).map((id) => {
						const idea = curriculum.ideas.find((item) => item.id === id);
						return idea ? (0, react_jsx_runtime.jsxs)("p", { children: [
							idea.name,
							": ",
							idea.definition
						] }, id) : null;
					}),
					concept.facts !== void 0 && concept.facts.length > 0 && (0, react_jsx_runtime.jsx)("ul", { children: concept.facts.map((fact) => (0, react_jsx_runtime.jsx)("li", { children: fact }, fact)) }),
					(0, react_jsx_runtime.jsxs)("p", {
						className: "student-muted",
						children: [
							t("source"),
							": ",
							concept.source
						]
					}),
					concept.lastAt !== void 0 && (0, react_jsx_runtime.jsxs)("p", {
						className: "student-muted",
						children: [
							t("lastPractised"),
							": ",
							day(concept.lastAt),
							concept.activeMistakes > 0 ? ` · ${t("bookReviewing")} ${concept.activeMistakes}` : ""
						]
					}),
					goals.map((item) => (0, react_jsx_runtime.jsxs)("div", { children: [
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("learningGoal"),
							" · ",
							item.title,
							" · ",
							t(levelKeys[item.level]),
							" · ",
							t(item.method)
						] }),
						(0, react_jsx_runtime.jsx)(MasteryDots, {
							days: curriculum.scope.current ? item.independentDays : void 0,
							t
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: item.goal
						}),
						item.reasons.length > 0 && item.level !== "untouched" && (0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: reasonText(item.reasons, t)
						}),
						curriculum.scope.current && (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": selectedObjectiveId === item.id,
							onClick: () => chooseGoal(item),
							children: [
								t("chooseGoal"),
								" · ",
								item.title
							]
						})
					] }, item.id)),
					relations.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: "student-map-links",
						children: [(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("relationsLabel")
						}), relations.map((relation) => (0, react_jsx_runtime.jsxs)("p", {
							className: "student-muted",
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "student-quiet",
									onClick: () => setSelectedConceptId(relation.fromId),
									children: nameOf(relation.fromId)
								}),
								` · ${t(relation.kind)} · `,
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "student-quiet",
									onClick: () => setSelectedConceptId(relation.toId),
									children: nameOf(relation.toId)
								}),
								`: ${relation.explanation}`
							]
						}, relation.id))]
					})
				]
			});
		}
		function countLevels(concepts) {
			const counts = {
				mastered: 0,
				practising: 0,
				stalled: 0,
				weak: 0,
				due: 0,
				untouched: 0
			};
			for (const concept of concepts) counts[concept.level] += 1;
			return counts;
		}
		function StackedBar({ counts, t }) {
			const total = levels.reduce((sum, level) => sum + counts[level], 0);
			if (total === 0) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className: "student-bar",
				role: "img",
				"aria-label": levels.map((level) => `${t(levelKeys[level])} ${counts[level]}`).join(" · "),
				children: levels.map((level) => counts[level] > 0 ? (0, react_jsx_runtime.jsx)("span", {
					className: `student-level-${level}`,
					style: { width: `${counts[level] / total * 100}%` }
				}, level) : null)
			});
		}
		//#endregion
		//#region lib/types/client/prompts.js
		/** Natural-language tutor requests. The study skill owns the teaching rules. */
		const continuePrompt = "请加载 study 技能，查询 study_status，继续当前学习段。先处理未反馈的答案或提示，再出下一题。一次一题。没有时长限制，孩子想继续就继续；想休息就 stop。";
		/** Ask the child to teach the idea back like a little teacher (Feynman). */
		function feynmanPrompt(topic) {
			return `请加载 study 技能。你扮演好奇的同桌。请孩子${topic ? `围绕「${topic}」` : "围绕刚才学的内容"}当小老师讲一讲：用简单的话说明是什么、怎么做、为什么。孩子讲完后，用一两句追问帮他发现漏洞并补齐；不要直接替他讲完整答案。`;
		}
		const reviewPrompt = "请加载 study 技能，查询 study_status 和到期错题。本段复习到期错题：先做变式，不展示已保存答案。task 写上 mistakeId 和 objectiveId。一次一题。";
		const hintPrompt = "请加载 study 技能。学生要提示：只指出条件或该画的图，不给算式和答案。如果这题已经答错，下一题换一种表示，并在 task 上写 figure。";
		const teachHintPrompt = "请加载 study 技能，阅读 references/teaching.md 的「不会做时先教」。按当前题的 phase 教方法：还没示范就先 demo，引导步先给一步提示，不把算式和答案直接填进括号。";
		/** Ordinary tries get a nudge. A stuck learner, a teaching step, or a follow-up hint follows the teaching steps. */
		function hintPromptFor(task) {
			if (task.stuck || task.phase === "demo" || task.phase === "guide" || (task.hintLevel ?? 0) >= 1) return teachHintPrompt;
			return hintPrompt;
		}
		/** Teach one objective before any later lesson. */
		function teachPrompt(objectiveId) {
			return `请加载 study 技能，阅读 references/teaching.md 的「不会做时先教」。本段先教学习目标 ${objectiveId}：按 demo、guide、try、vary 四步，task 写 phase 和这个 objectiveId。今天停在这个目标上，不排下一课。`;
		}
		/** Teach one confirmed workbook item that is not linked to an objective yet. */
		function teachQueuePrompt(title) {
			return `请加载 study 技能，阅读 references/teaching.md 的「不会做时先教」。本段教这道待教的题：${title}。按 demo、guide、try、vary 四步，task 写 phase。`;
		}
		const stuckPrompt = "请加载 study 技能，阅读 references/teaching.md 的「不会做时先教」。孩子说不会。先用 demo 示范方法，再进入 guide。摸底段只记下不会，不讲课。";
		const mistakePhotoPrompt = "请加载 study 技能，读取这张题目照片，用 mistake 保存待确认错题。能对应知识地图时写上 objectiveId。不要替我确认。";
		/** Practise the current goal inside one interest scene. Facts stay on the knowledge map. */
		function interestPracticePrompt(objectiveId, tags, focus, unitName) {
			return `请加载 study 技能，阅读 references/interest-hooks.md 和 references/questions.md。本段用趣味情境练${objectiveId ? `学习目标 ${objectiveId}` : "今日建议的目标"}。${tags.length > 0 ? `兴趣标签：${tags.join("、")}。本题优先用「${focus}」套壳，下一题可以换一个标签。` : "用 study_status 的 interests 套壳。"}${unitName ? `校内单元「${unitName}」。` : ""}事实只核知识地图的 facts，不把兴趣写成知识点。一次一题，task 写 objectiveId。`;
		}
		/** Clear only the one or two due mistakes named for today. */
		function dueClearPrompt(ids) {
			return `请加载 study 技能，阅读 references/interest-hooks.md。今天只清 dueToday 里的这 ${ids.length} 条到期错题（${ids.join("、")}），其余到期错题留到以后。先做变式，不展示已保存答案。task 写 mistakeId 和 objectiveId。情境用 interests 里的标签套壳，事实只核知识地图。一次一题。`;
		}
		/** Problem-based explore: guess, check, revise. */
		function explorePrompt(question) {
			return `请加载 study 技能。本段是自主探究（explore）。${question && question.trim() !== "" ? `孩子的疑问是：${question.trim()}。` : "先问孩子想弄清什么。"}按问题导向法引导：我猜什么 → 如何验证（翻课页或做小实验）→ 看到了什么 → 我改变了什么想法。一次只推进一小步，不要直接给出完整答案。`;
		}
		/** Continue around one shipped or custom learning goal. */
		function goalPrompt(objectiveId) {
			return `请加载 study 技能，查询 study_status。本段围绕学习目标 ${objectiveId} 出题，一次一题，task 写上这个 objectiveId。需要看图时写 figure。`;
		}
		/** Tell the child the next unit is still ahead of school. */
		function previewPrompt(objectiveId) {
			return `${goalPrompt(objectiveId)}先告诉孩子这是预习，学校还没教到这里。`;
		}
		/** One short question per sampled check-in goal. */
		function diagnosePrompt(intensity, ids, t) {
			return `请加载 study 技能，查询 study_status kind=diagnose。本段是${t(intensityKeys[intensity])}摸底，按这些学习目标各出一道短题：${ids.join("，")}。task 和 record 都写 objectiveId。每题只给简短反馈，不展开教学。`;
		}
		/** A 4–6 question daily mini sheet for one subject. */
		function dailySheetPrompt(subject) {
			return `请加载 study 技能，阅读 references/questions.md 和 references/daily-routine.md。用 study_status kind=elements subject=${subject} 写一张每日小卷，4 到 6 题，kind 写 daily，每题写 objectiveId。用 worksheet 保存后告诉我编号。`;
		}
		/** Dictate one word or sentence at a time in the conversation. */
		function dictationPrompt(subject) {
			return `请加载 study 技能，用 study_status kind=elements subject=${subject} 做对话听写。没有进行中的学习段时，用 start 开始一段 foundation（subject=${subject}）。一次报一个，task 写 objectiveId。`;
		}
		/** A mixed practice sheet for the current school unit. */
		function practiceSheetPrompt(subject) {
			return `请加载 study 技能，阅读 references/questions.md。用 study_status kind=elements subject=${subject} 写一张当前单元练习卷：6 到 8 题，题型要换，kind 写 practice，每题写 objectiveId，不要写 mistakeId。需要图时用 figure。用 worksheet 保存后告诉我编号。`;
		}
		/** A review sheet limited to the picks and objective fills already chosen. */
		function reviewSheetPrompt(subject) {
			return `请加载 study 技能，阅读 references/questions.md。按 study_status kind=review-sheet subject=${subject} 的 picks 和 objectiveFills 写巩固卷，kind 写 review。用 worksheet 保存后告诉我编号。`;
		}
		/** Ask the tutor to propose a concept that is outside the shipped map. */
		function organizePrompt(subject) {
			return `请加载 study 技能，查看 ${subject} 的知识地图。如果有地图之外的概念，先保存待确认概念，等家长核对后再创建学习目标。`;
		}
		/** Transcribe one photographed worksheet into drafts. */
		function paperPhotoPrompt(worksheetId) {
			return `请加载 study 技能，读取练习单 ${worksheetId} 的作答照片，按题号用 paper-draft 保存转录草稿。不要直接入库。`;
		}
		/** Ask the tutor to generate one local OpenMAIC lesson for the current goal, with interest tags and the school unit. */
		function openmaicGeneratePrompt(subjectLabel, objectiveId, tags, focus, unitName) {
			const goal = objectiveId ? `围绕学习目标 ${objectiveId}。` : "围绕今日建议或孩子要点的知识点。";
			const scene = tags.length > 0 ? `requirement 必须写入兴趣标签（${tags.join("、")}），本题优先套「${focus}」。` : "requirement 必须写入 study_status 的 interests。";
			return `请加载 study 技能，阅读 references/openmaic.md 和 references/interest-hooks.md。为${subjectLabel}生成一节 OpenMAIC 互动课。${goal}${unitName ? `校内单元「${unitName}」。` : ""}${scene}事实只核知识地图。用 shell 和 curl 调用本机服务，不要用 web_fetch 访问 localhost。成功后把课堂 URL 单独一行原文发给我，并写入 .study/openmaic-lessons.json。`;
		}
		/** Ask the tutor to retry a failed generation without resubmitting the requirement. */
		function openmaicRetryPrompt(runId) {
			return `请加载 study 技能，阅读 references/openmaic.md。互动课生成失败且可以重试。用同一 cookie jar 对 runId ${runId} 调用 retry，不要重新提交 requirement。把结果写回 .study/openmaic-lessons.json。成功后把课堂 URL 单独一行原文发给我。`;
		}
		/** Ask the tutor to pull the stage outline and write a few consolidation questions. */
		function openmaicReviewPrompt(classroomId) {
			return `请加载 study 技能，阅读 references/openmaic.md 和 references/questions.md。孩子上完互动课 ${classroomId}。用同一 cookie jar GET /api/stages/${classroomId}，把大纲和场景摘要写回 .study/openmaic-lessons.json 的 summary。再按摘要出 2 到 5 道巩固题，走现有出题和作答，不要嵌播放器。`;
		}
		/** Transcribe a workbook photo that is not tied to a saved worksheet. */
		const workbookPhotoPrompt = "请加载 study 技能。这是练习册照片，事先没有练习单。用 workbook-draft 按题保存草稿：不会用 stuck，提示后才对用 hinted，独立做错用 independent-wrong，独立做对用 independent-correct。能对应目标就写 objectiveId。不要直接入库，等家长确认。";
		//#endregion
		//#region lib/types/client/figure-view.js
		/** On-screen teaching figure for the current task. The prompt stays the question; the drawing is the given information. */
		function FigureView({ figure, t }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: "student-figure",
				children: draw(figure, t)
			});
		}
		function Frame({ width, height, label, children }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				viewBox: `0 0 ${width} ${height}`,
				role: "img",
				"aria-label": label,
				children
			});
		}
		function draw(figure, t) {
			switch (figure.kind) {
				case "counter": return (0, react_jsx_runtime.jsx)(Counter, {
					figure,
					t
				});
				case "sticks": return (0, react_jsx_runtime.jsx)(Sticks, {
					figure,
					t
				});
				case "place-value": return (0, react_jsx_runtime.jsx)(PlaceValue, {
					figure,
					t
				});
				case "dot-array": return (0, react_jsx_runtime.jsx)(DotArray, { figure });
				case "clock": return (0, react_jsx_runtime.jsx)(Clocks, {
					figure,
					t
				});
				case "number-line": return (0, react_jsx_runtime.jsx)(NumberLine, { figure });
				case "split": return (0, react_jsx_runtime.jsx)(Split, {
					figure,
					t
				});
				case "bar-model": return (0, react_jsx_runtime.jsx)(BarModel, { figure });
				case "writing": return (0, react_jsx_runtime.jsx)(Writing, {
					figure,
					t
				});
				case "money": return (0, react_jsx_runtime.jsx)(Money, {
					figure,
					t
				});
				case "hundred-chart": return (0, react_jsx_runtime.jsx)(HundredChart, { figure });
				case "vertical": return (0, react_jsx_runtime.jsx)(Vertical, {
					figure,
					t
				});
				case "shapes": return (0, react_jsx_runtime.jsx)(ShapeRows, {
					figure,
					t
				});
				case "sequence": return (0, react_jsx_runtime.jsx)(Sequence, {
					figure,
					t
				});
				case "plane":
				case "solid": return (0, react_jsx_runtime.jsx)(FigureRow, { figure });
				case "overlap": return (0, react_jsx_runtime.jsx)(Overlap, {
					figure,
					t
				});
				case "wall": return (0, react_jsx_runtime.jsx)(Wall, {
					figure,
					t
				});
				case "grid": return (0, react_jsx_runtime.jsx)(Grid, {
					figure,
					t
				});
				case "measure": return (0, react_jsx_runtime.jsx)(Measure, {
					figure,
					t
				});
				case "compass": return (0, react_jsx_runtime.jsx)(Compass, {
					figure,
					t
				});
				case "balance": return (0, react_jsx_runtime.jsx)(Balance, {
					figure,
					t
				});
				case "sketch": return (0, react_jsx_runtime.jsx)(Sketch, {
					figure,
					t
				});
				default: return null;
			}
		}
		function Counter({ figure, t }) {
			const rods = [
				["百", figure.hundreds],
				["十", figure.tens],
				["个", figure.ones]
			];
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: 240,
				height: 150,
				label: t("figureCounter"),
				children: [rods.map(([name, beads], index) => {
					const x = 40 + index * 70;
					return (0, react_jsx_runtime.jsxs)("g", { children: [
						(0, react_jsx_runtime.jsx)("line", {
							x1: x,
							y1: 20,
							x2: x,
							y2: 110
						}),
						Array.from({ length: beads }, (_, bead) => (0, react_jsx_runtime.jsx)("circle", {
							cx: x,
							cy: 100 - bead * 14,
							r: 6
						}, bead)),
						(0, react_jsx_runtime.jsx)("text", {
							x,
							y: 136,
							textAnchor: "middle",
							children: name
						})
					] }, name);
				}), (0, react_jsx_runtime.jsx)("line", {
					x1: 24,
					y1: 110,
					x2: 216,
					y2: 110
				})]
			});
		}
		function Sticks({ figure, t }) {
			const width = Math.max(160, figure.bundles * 36 + figure.singles * 12 + 16);
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width,
				height: 48,
				label: t("figureSticks"),
				children: [Array.from({ length: figure.bundles }, (_, bundle) => {
					const x = 8 + bundle * 36;
					const crossed = (figure.crossBundles ?? 0) > figure.bundles - 1 - bundle;
					return (0, react_jsx_runtime.jsxs)("g", { children: [
						Array.from({ length: 10 }, (_, stick) => (0, react_jsx_runtime.jsx)("line", {
							x1: x + stick * 2.4,
							y1: 6,
							x2: x + stick * 2.4,
							y2: 34
						}, stick)),
						(0, react_jsx_runtime.jsx)("rect", {
							x,
							y: 16,
							width: 24,
							height: 8
						}),
						crossed && (0, react_jsx_runtime.jsx)("line", {
							x1: x,
							y1: 36,
							x2: x + 26,
							y2: 4
						})
					] }, `b${bundle}`);
				}), Array.from({ length: figure.singles }, (_, stick) => {
					const x = 8 + figure.bundles * 36 + stick * 12;
					const crossed = (figure.crossSingles ?? 0) > figure.singles - 1 - stick;
					return (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("line", {
						x1: x,
						y1: 6,
						x2: x,
						y2: 34
					}), crossed && (0, react_jsx_runtime.jsx)("line", {
						x1: x - 4,
						y1: 36,
						x2: x + 4,
						y2: 4
					})] }, `s${stick}`);
				})]
			});
		}
		function PlaceValue({ figure, t }) {
			const ones = figure.ones + (figure.regroup === "yes" ? 10 : 0);
			const height = 36 + Math.ceil(ones / 10) * 18;
			const dot = (cx, cy, crossed, dashed) => (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: 6,
				strokeDasharray: dashed ? "2 2" : void 0
			}), crossed && (0, react_jsx_runtime.jsx)("line", {
				x1: cx - 6,
				y1: cy + 6,
				x2: cx + 6,
				y2: cy - 6
			})] }, `${cx}-${cy}`);
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: 280,
				height,
				label: "place-value",
				children: [
					(0, react_jsx_runtime.jsx)("text", {
						x: 16,
						y: 16,
						children: t("figureTensPlace")
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 150,
						y: 16,
						children: t("figureOnesPlace")
					}),
					Array.from({ length: figure.tens }, (_, index) => dot(24 + index * 16, 32, figure.regroup === "no" && index < figure.crossTens, figure.regroup === "yes" && index === figure.tens - 1)),
					Array.from({ length: ones }, (_, index) => dot(158 + index % 10 * 16, 32 + Math.floor(index / 10) * 18, index < figure.crossOnes, figure.regroup === "yes" && index >= figure.ones))
				]
			});
		}
		function DotArray({ figure }) {
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: Math.max(80, figure.columns * 18 + 16),
				height: figure.rows * 18 + (figure.total !== void 0 ? 36 : 16),
				label: "dot-array",
				children: [Array.from({ length: figure.rows * figure.columns }, (_, index) => (0, react_jsx_runtime.jsx)("circle", {
					className: "student-fill",
					cx: 16 + index % figure.columns * 18,
					cy: 14 + Math.floor(index / figure.columns) * 18,
					r: 3.5
				}, index)), figure.total !== void 0 && (0, react_jsx_runtime.jsx)("text", {
					x: figure.columns * 18 / 2 + 8,
					y: figure.rows * 18 + 28,
					textAnchor: "middle",
					children: figure.total
				})]
			});
		}
		function Clocks({ figure, t }) {
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: figure.clocks.length * 120,
				height: 120,
				label: t("figureClock"),
				children: figure.clocks.map((clock, index) => {
					const cx = 60 + index * 120;
					const cy = 58;
					const hand = (angle, length) => (0, react_jsx_runtime.jsx)("line", {
						x1: cx,
						y1: cy,
						x2: cx + Math.sin(angle) * length,
						y2: cy - Math.cos(angle) * length
					});
					return (0, react_jsx_runtime.jsxs)("g", { children: [
						(0, react_jsx_runtime.jsx)("circle", {
							cx,
							cy,
							r: 46
						}),
						Array.from({ length: 12 }, (_, hour) => {
							const angle = (hour + 1) / 12 * Math.PI * 2;
							return (0, react_jsx_runtime.jsx)("text", {
								x: cx + Math.sin(angle) * 34,
								y: cy - Math.cos(angle) * 34 + 4,
								textAnchor: "middle",
								children: hour + 1
							}, hour);
						}),
						hand((clock.hour % 12 + clock.minute / 60) / 12 * Math.PI * 2, 22),
						hand(clock.minute / 60 * Math.PI * 2, 32),
						(0, react_jsx_runtime.jsx)("circle", {
							className: "student-fill",
							cx,
							cy,
							r: 2.5
						})
					] }, index);
				})
			});
		}
		function NumberLine({ figure }) {
			const width = 300;
			const span = figure.to - figure.from;
			const at = (value) => 16 + (value - figure.from) / span * 268;
			const ticks = span / figure.step;
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width,
				height: 78,
				label: "number-line",
				children: [
					(0, react_jsx_runtime.jsx)("line", {
						x1: 16,
						y1: 40,
						x2: 284,
						y2: 40
					}),
					Array.from({ length: ticks + 1 }, (_, index) => {
						const value = figure.from + index * figure.step;
						const x = at(value);
						return (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("line", {
							x1: x,
							y1: 34,
							x2: x,
							y2: 46
						}), ticks <= 16 && (0, react_jsx_runtime.jsx)("text", {
							x,
							y: 62,
							textAnchor: "middle",
							children: value
						})] }, value);
					}),
					(figure.marks ?? []).map((mark) => (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("circle", {
						className: "student-fill",
						cx: at(mark.value),
						cy: 40,
						r: 4
					}), mark.label && (0, react_jsx_runtime.jsx)("text", {
						x: at(mark.value),
						y: 24,
						textAnchor: "middle",
						children: mark.label
					})] }, mark.value)),
					(figure.jumps ?? []).map((jump) => (0, react_jsx_runtime.jsx)("path", { d: `M ${at(jump.from)} 32 Q ${(at(jump.from) + at(jump.to)) / 2} 8 ${at(jump.to)} 32` }, `${jump.from}-${jump.to}`))
				]
			});
		}
		function Split({ figure, t }) {
			const part = 90;
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: figure.parts.length * 102,
				height: 78,
				label: t("figureSplit"),
				children: figure.parts.map((item, index) => {
					const x = 8 + index * 102;
					return (0, react_jsx_runtime.jsxs)("g", { children: [
						(0, react_jsx_runtime.jsx)(Box, {
							x: x + 20,
							y: 4,
							text: item.top
						}),
						(0, react_jsx_runtime.jsx)("line", {
							x1: x + part / 2,
							y1: 24,
							x2: x + 22,
							y2: 40
						}),
						(0, react_jsx_runtime.jsx)("line", {
							x1: x + part / 2,
							y1: 24,
							x2: x + part - 22,
							y2: 40
						}),
						(0, react_jsx_runtime.jsx)(Box, {
							x,
							y: 44,
							text: item.left
						}),
						(0, react_jsx_runtime.jsx)(Box, {
							x: x + 48,
							y: 44,
							text: item.right
						})
					] }, index);
				})
			});
		}
		function Box({ x, y, text }) {
			return (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("rect", {
				x,
				y,
				width: 40,
				height: 22
			}), text !== "" && (0, react_jsx_runtime.jsx)("text", {
				x: x + 20,
				y: y + 15,
				textAnchor: "middle",
				children: text
			})] });
		}
		function BarModel({ figure }) {
			const max = Math.max(...figure.bars.map((bar) => bar.segments.reduce((sum, segment) => sum + segment.units, 0)));
			const height = figure.bars.reduce((sum, bar) => sum + (bar.total !== void 0 ? 18 : 0) + 46, 8);
			let top = 8;
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: 320,
				height,
				label: "bar-model",
				children: figure.bars.map((bar) => {
					const total = bar.total !== void 0;
					const y = top + (total ? 18 : 0);
					const length = bar.segments.reduce((sum, segment) => sum + segment.units, 0) / max * 220;
					let cursor = 72;
					const row = (0, react_jsx_runtime.jsxs)("g", { children: [
						total && (0, react_jsx_runtime.jsx)("text", {
							x: 72 + length / 2,
							y: top + 12,
							textAnchor: "middle",
							children: bar.total
						}),
						(0, react_jsx_runtime.jsx)("text", {
							x: 64,
							y: y + 16,
							textAnchor: "end",
							children: bar.name
						}),
						bar.segments.map((segment, index) => {
							const segmentWidth = segment.units / max * 220;
							const cell = (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("rect", {
								x: cursor,
								y,
								width: segmentWidth,
								height: 20,
								strokeDasharray: segment.style === "dashed" ? "3 3" : void 0
							}), segment.label !== "" && (0, react_jsx_runtime.jsx)("text", {
								x: cursor + segmentWidth / 2,
								y: y + 34,
								textAnchor: "middle",
								children: segment.label
							})] }, index);
							cursor += segmentWidth;
							return cell;
						})
					] }, bar.name);
					top = y + 46;
					return row;
				})
			});
		}
		function Writing({ figure, t }) {
			if (figure.style === "fourline") return (0, react_jsx_runtime.jsxs)(Frame, {
				width: 280,
				height: 48,
				label: t("figureFourline"),
				children: [[
					8,
					18,
					28,
					38
				].map((y) => (0, react_jsx_runtime.jsx)("line", {
					x1: 12,
					y1: y,
					x2: 268,
					y2: y
				}, y)), figure.example && (0, react_jsx_runtime.jsx)("text", {
					x: 20,
					y: 32,
					children: figure.example
				})]
			});
			const count = figure.count ?? 4;
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: count * 44 + 8,
				height: 52,
				label: t("figureTianzige"),
				children: Array.from({ length: count }, (_, index) => {
					const x = 8 + index * 44;
					return (0, react_jsx_runtime.jsxs)("g", { children: [
						(0, react_jsx_runtime.jsx)("rect", {
							x,
							y: 6,
							width: 36,
							height: 36
						}),
						(0, react_jsx_runtime.jsx)("line", {
							x1: x + 18,
							y1: 6,
							x2: x + 18,
							y2: 42,
							strokeDasharray: "2 2"
						}),
						(0, react_jsx_runtime.jsx)("line", {
							x1: x,
							y1: 24,
							x2: x + 36,
							y2: 24,
							strokeDasharray: "2 2"
						}),
						index === 0 && figure.example && (0, react_jsx_runtime.jsx)("text", {
							x: x + 18,
							y: 30,
							textAnchor: "middle",
							children: figure.example
						})
					] }, index);
				})
			});
		}
		function Money({ figure, t }) {
			const items = figure.items.flatMap((item) => typeof item === "string" ? [item] : Array.from({ length: item.count }, () => item.denomination));
			const perRow = 4;
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: 280,
				height: Math.ceil(items.length / perRow) * 48 + 8,
				label: t("figureMoney"),
				children: items.map((value, index) => {
					const x = 12 + index % perRow * 68;
					const y = 8 + Math.floor(index / perRow) * 48;
					const note = value.endsWith("元") && value !== "1元";
					return (0, react_jsx_runtime.jsxs)("g", { children: [note ? (0, react_jsx_runtime.jsx)("rect", {
						x,
						y,
						width: 60,
						height: 32
					}) : (0, react_jsx_runtime.jsx)("circle", {
						cx: x + 18,
						cy: y + 16,
						r: 16
					}), (0, react_jsx_runtime.jsx)("text", {
						x: note ? x + 30 : x + 18,
						y: y + 21,
						textAnchor: "middle",
						children: value
					})] }, index);
				})
			});
		}
		function HundredChart({ figure }) {
			if (figure.window) {
				const center = figure.window.center;
				return (0, react_jsx_runtime.jsx)(Frame, {
					width: 96,
					height: 96,
					label: "hundred-chart",
					children: [
						-1,
						0,
						1
					].flatMap((row) => [
						-1,
						0,
						1
					].map((column) => {
						const value = center + row * 10 + column;
						const x = (column + 1) * 30;
						const y = (row + 1) * 30;
						return (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("rect", {
							x,
							y,
							width: 28,
							height: 28
						}), row === 0 && column === 0 && (0, react_jsx_runtime.jsx)("text", {
							x: x + 14,
							y: y + 18,
							textAnchor: "middle",
							children: value
						})] }, `${row}-${column}`);
					}))
				});
			}
			const hidden = new Set(figure.hidden ?? []);
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: 230,
				height: 230,
				label: "hundred-chart",
				children: Array.from({ length: 100 }, (_, index) => {
					const x = index % 10 * 22 + 6;
					const y = Math.floor(index / 10) * 22 + 6;
					const number = index + 1;
					return (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("rect", {
						x,
						y,
						width: 20,
						height: 20
					}), !hidden.has(number) && (0, react_jsx_runtime.jsx)("text", {
						x: x + 10,
						y: y + 14,
						textAnchor: "middle",
						children: number
					})] }, number);
				})
			});
		}
		function Vertical({ figure, t }) {
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: figure.count * 110,
				height: 100,
				label: t("figureVertical"),
				children: Array.from({ length: figure.count }, (_, frame) => {
					const x = 16 + frame * 110;
					return (0, react_jsx_runtime.jsxs)("g", { children: [[
						0,
						1,
						3
					].flatMap((row) => [
						0,
						1,
						2
					].map((column) => (0, react_jsx_runtime.jsx)("rect", {
						x: x + column * 22,
						y: row * 22,
						width: 20,
						height: 20
					}, `${row}-${column}`))), (0, react_jsx_runtime.jsx)("line", {
						x1: x,
						y1: 54,
						x2: x + 66,
						y2: 54
					})] }, frame);
				})
			});
		}
		function ShapeRows({ figure, t }) {
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: 280,
				height: figure.rows.length * 32 + 8,
				label: t("figureShapes"),
				children: figure.rows.map((row, index) => (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("text", {
					x: 48,
					y: index * 32 + 22,
					textAnchor: "end",
					children: row.name
				}), Array.from({ length: row.count }, (_, item) => (0, react_jsx_runtime.jsx)(Small, {
					shape: row.shape,
					x: 64 + item * 18,
					y: index * 32 + 16
				}, item))] }, row.name))
			});
		}
		function Small({ shape, x, y }) {
			if (shape === "circle") return (0, react_jsx_runtime.jsx)("circle", {
				cx: x,
				cy: y,
				r: 6
			});
			if (shape === "square") return (0, react_jsx_runtime.jsx)("rect", {
				x: x - 6,
				y: y - 6,
				width: 12,
				height: 12
			});
			if (shape === "triangle") return (0, react_jsx_runtime.jsx)("polygon", { points: `${x},${y - 7} ${x + 7},${y + 6} ${x - 7},${y + 6}` });
			return (0, react_jsx_runtime.jsx)("polygon", { points: `${x},${y - 7} ${x + 2},${y - 2} ${x + 7},${y - 2} ${x + 3},${y + 1} ${x + 5},${y + 7} ${x},${y + 3} ${x - 5},${y + 7} ${x - 3},${y + 1} ${x - 7},${y - 2} ${x - 2},${y - 2}` });
		}
		function Sequence({ figure, t }) {
			const count = figure.items.reduce((sum, item) => sum + item.count, 0) + (figure.blank ?? 0);
			let cursor = 16;
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: Math.max(80, count * 22 + 16),
				height: 40,
				label: t("figureSequence"),
				children: [figure.items.flatMap((item) => Array.from({ length: item.count }, () => {
					const shape = (0, react_jsx_runtime.jsx)(Small, {
						shape: item.shape,
						x: cursor,
						y: 18
					}, cursor);
					cursor += 22;
					return shape;
				})), Array.from({ length: figure.blank ?? 0 }, () => {
					const box = (0, react_jsx_runtime.jsx)("rect", {
						x: cursor - 8,
						y: 8,
						width: 16,
						height: 16,
						strokeDasharray: "2 2"
					}, cursor);
					cursor += 22;
					return box;
				})]
			});
		}
		function FigureRow({ figure }) {
			const total = figure.items.reduce((sum, item) => sum + item.count, 0);
			let cursor = 20;
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: Math.max(80, total * 28 + figure.items.length * 16),
				height: figure.mark === "yes" ? 64 : 44,
				label: figure.kind,
				children: figure.items.map((item) => {
					const group = (0, react_jsx_runtime.jsxs)("g", { children: [Array.from({ length: item.count }, (_, index) => {
						return figure.kind === "solid" ? (0, react_jsx_runtime.jsx)("rect", {
							x: cursor + index * 26,
							y: 8,
							width: 18,
							height: 16
						}, index) : (0, react_jsx_runtime.jsx)(Small, {
							shape: item.shape === "circle" || item.shape === "square" || item.shape === "triangle" ? item.shape : "square",
							x: cursor + index * 26 + 8,
							y: 16
						}, index);
					}), figure.mark === "yes" && (0, react_jsx_runtime.jsx)("rect", {
						x: cursor,
						y: 36,
						width: 24,
						height: 14
					})] }, cursor);
					cursor += item.count * 26 + 16;
					return group;
				})
			});
		}
		function Overlap({ figure, t }) {
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: 220,
				height: figure.total !== void 0 ? 150 : 120,
				label: t("figureOverlap"),
				children: [
					(0, react_jsx_runtime.jsx)("circle", {
						cx: 78,
						cy: 68,
						r: 46
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: 142,
						cy: 68,
						r: 46
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 78,
						y: 16,
						textAnchor: "middle",
						children: figure.left
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 142,
						y: 16,
						textAnchor: "middle",
						children: figure.right
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 48,
						y: 72,
						textAnchor: "middle",
						children: figure.leftOnly
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 110,
						y: 72,
						textAnchor: "middle",
						children: figure.both
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 172,
						y: 72,
						textAnchor: "middle",
						children: figure.rightOnly
					}),
					figure.total !== void 0 && (0, react_jsx_runtime.jsx)("text", {
						x: 110,
						y: 136,
						textAnchor: "middle",
						children: figure.total
					})
				]
			});
		}
		function Wall({ figure, t }) {
			const widest = figure.rows.reduce((max, row) => Math.max(max, row.length), 0);
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: widest * 48 + 16,
				height: figure.rows.length * 28 + 8,
				label: t("figureWall"),
				children: figure.rows.map((row, rowIndex) => {
					const left = (widest - row.length) * 24 + 8;
					return row.map((cell, column) => (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("rect", {
						x: left + column * 48,
						y: rowIndex * 28 + 4,
						width: 46,
						height: 24
					}), cell !== "" && (0, react_jsx_runtime.jsx)("text", {
						x: left + column * 48 + 23,
						y: rowIndex * 28 + 20,
						textAnchor: "middle",
						children: cell
					})] }, `${rowIndex}-${column}`));
				})
			});
		}
		function Grid({ figure, t }) {
			const columns = figure.rows.reduce((max, row) => Math.max(max, row.cells.length), 0);
			const header = figure.columns !== void 0 ? 1 : 0;
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: columns * 40 + 48,
				height: (figure.rows.length + header) * 28 + 8,
				label: t("figureGrid"),
				children: [figure.columns?.map((head, index) => (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("rect", {
					x: 40 + index * 40,
					y: 4,
					width: 38,
					height: 24
				}), (0, react_jsx_runtime.jsx)("text", {
					x: 59 + index * 40,
					y: 20,
					textAnchor: "middle",
					children: head
				})] }, head)), figure.rows.map((row, rowIndex) => (0, react_jsx_runtime.jsxs)("g", { children: [row.name && (0, react_jsx_runtime.jsx)("text", {
					x: 36,
					y: header * 28 + rowIndex * 28 + 20,
					textAnchor: "end",
					children: row.name
				}), row.cells.map((cell, column) => (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("rect", {
					x: 40 + column * 40,
					y: 4 + (rowIndex + header) * 28,
					width: 38,
					height: 24
				}), cell !== "" && (0, react_jsx_runtime.jsx)("text", {
					x: 59 + column * 40,
					y: (rowIndex + header) * 28 + 20,
					textAnchor: "middle",
					children: cell
				})] }, column))] }, rowIndex))]
			});
		}
		function Measure({ figure, t }) {
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: 280,
				height: figure.bars.length * 24 + (figure.ruler === "yes" ? 36 : 12),
				label: t("figureMeasure"),
				children: [figure.bars.map((bar, index) => (0, react_jsx_runtime.jsx)("line", {
					x1: 16,
					y1: 16 + index * 24,
					x2: 16 + Math.min(bar.length, 15) * 16,
					y2: 16 + index * 24
				}, bar.name)), figure.ruler === "yes" && Array.from({ length: 16 }, (_, cm) => (0, react_jsx_runtime.jsxs)("g", { children: [(0, react_jsx_runtime.jsx)("line", {
					x1: 16 + cm * 16,
					y1: figure.bars.length * 24 + 8,
					x2: 16 + cm * 16,
					y2: figure.bars.length * 24 + 16
				}), (0, react_jsx_runtime.jsx)("text", {
					x: 16 + cm * 16,
					y: figure.bars.length * 24 + 30,
					textAnchor: "middle",
					children: cm
				})] }, cm))]
			});
		}
		function Compass({ figure, t }) {
			const blank = figure.blank === "yes";
			const direction = (name) => blank ? "" : t(name);
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: 180,
				height: 160,
				label: t("figureCompass"),
				children: [
					(0, react_jsx_runtime.jsx)("line", {
						x1: 90,
						y1: 24,
						x2: 90,
						y2: 136
					}),
					(0, react_jsx_runtime.jsx)("line", {
						x1: 24,
						y1: 80,
						x2: 156,
						y2: 80
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 90,
						y: 18,
						textAnchor: "middle",
						children: direction("compassNorth")
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 90,
						y: 154,
						textAnchor: "middle",
						children: direction("compassSouth")
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 12,
						y: 84,
						children: direction("compassWest")
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 176,
						y: 84,
						textAnchor: "end",
						children: direction("compassEast")
					})
				]
			});
		}
		function Balance({ figure, t }) {
			const drop = figure.tilt === "left" ? 16 : figure.tilt === "right" ? -16 : 0;
			return (0, react_jsx_runtime.jsxs)(Frame, {
				width: 220,
				height: 110,
				label: t("figureBalance"),
				children: [
					(0, react_jsx_runtime.jsx)("line", {
						x1: 110,
						y1: 28,
						x2: 110,
						y2: 90
					}),
					(0, react_jsx_runtime.jsx)("line", {
						x1: 70,
						y1: 90,
						x2: 150,
						y2: 90
					}),
					(0, react_jsx_runtime.jsx)("line", {
						x1: 40,
						y1: 28 + drop,
						x2: 180,
						y2: 28 - drop
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 40,
						y: 24 + drop,
						textAnchor: "middle",
						children: figure.left
					}),
					(0, react_jsx_runtime.jsx)("text", {
						x: 180,
						y: 24 - drop,
						textAnchor: "middle",
						children: figure.right
					})
				]
			});
		}
		function Sketch({ figure, t }) {
			return (0, react_jsx_runtime.jsx)(Frame, {
				width: 480,
				height: figure.height,
				label: t("figureSketch"),
				children: figure.elements.map((element, index) => {
					if (element.draw === "line" || element.draw === "arrow") return (0, react_jsx_runtime.jsx)("line", {
						x1: element.from.x,
						y1: element.from.y,
						x2: element.to.x,
						y2: element.to.y
					}, index);
					if (element.draw === "polyline") return (0, react_jsx_runtime.jsx)("polyline", {
						points: element.points.map((point) => `${point.x},${point.y}`).join(" "),
						fill: element.closed === "yes" ? "none" : "none"
					}, index);
					if (element.draw === "rect") return (0, react_jsx_runtime.jsx)("rect", {
						x: element.x,
						y: element.y,
						width: element.width,
						height: element.height
					}, index);
					if (element.draw === "circle") return (0, react_jsx_runtime.jsx)("circle", {
						cx: element.x,
						cy: element.y,
						r: element.radius
					}, index);
					return (0, react_jsx_runtime.jsx)("text", {
						x: element.x,
						y: element.y,
						textAnchor: element.align === "center" ? "middle" : "start",
						children: element.label
					}, index);
				})
			});
		}
		//#endregion
		//#region lib/types/client/worksheet-view.js
		const roleNames = {
			daily: "sheetDaily",
			practice: "sheetPractice",
			review: "sheetReview"
		};
		/** A sheet's printed role: its saved kind, or the legacy all-sourced-mistakes heuristic. */
		function sheetRole(worksheet) {
			if (worksheet.kind !== void 0) return worksheet.kind;
			return worksheet.items.every((item) => item.mistakeId !== void 0 && worksheet.sources.find((source) => source.itemId === item.id)?.mistakeId !== void 0) ? "review" : "practice";
		}
		function sheetTitle(worksheet, t) {
			return `${t(worksheet.subject)}${t(roleNames[sheetRole(worksheet)])}`;
		}
		/** The answer space one printed question leaves: one ruled line, three lines, or a dashed box. */
		function AnswerSpace({ space }) {
			if (space === "none") return null;
			if (space === "box") return (0, react_jsx_runtime.jsx)("div", { className: "student-sheet-box" });
			return (0, react_jsx_runtime.jsx)("div", {
				className: `student-sheet-lines student-sheet-${space}`,
				children: Array.from({ length: space === "line" ? 1 : 3 }, (_, index) => (0, react_jsx_runtime.jsx)("div", { className: "student-sheet-rule" }, index))
			});
		}
		/** The printable student sheet: title, name and date line, then questions with figures and answer space. Answers stay in the saved record. */
		function WorksheetSheet({ worksheet, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "student-sheet",
				children: [
					(0, react_jsx_runtime.jsx)("h2", { children: sheetTitle(worksheet, t) }),
					(0, react_jsx_runtime.jsxs)("p", {
						className: "student-sheet-meta",
						children: [
							t("sheetIdLabel"),
							"：",
							worksheet.id,
							worksheet.objectiveTitle !== "" ? `　${t("sheetGoalLabel")}：${worksheet.objectiveTitle}` : ""
						]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-sheet-meta",
						children: t("sheetNameDate")
					}),
					worksheet.items.map((item, index) => (0, react_jsx_runtime.jsxs)("div", {
						className: "student-sheet-item",
						children: [
							(0, react_jsx_runtime.jsxs)("p", { children: [
								index + 1,
								". ",
								item.prompt
							] }),
							item.figure !== void 0 && (0, react_jsx_runtime.jsx)(FigureView, {
								figure: item.figure,
								t
							}),
							(0, react_jsx_runtime.jsx)(AnswerSpace, { space: item.space ?? (item.figure !== void 0 ? "line" : "lines") })
						]
					}, item.id))
				]
			});
		}
		/** Preview dialog doubling as the print source: the browser print dialog prints only the sheet. */
		function WorksheetPrint({ worksheet, onClose, t }) {
			const [container] = (0, react.useState)(() => {
				const element = document.createElement("div");
				element.className = "student-sheet-portal";
				return element;
			});
			(0, react.useEffect)(() => {
				document.body.appendChild(container);
				return () => {
					container.remove();
				};
			}, [container]);
			(0, react.useEffect)(() => {
				const onKey = (event) => {
					if (event.key === "Escape") onClose();
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [onClose]);
			return (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)("div", {
				className: "student-sheet-backdrop",
				onClick: onClose,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: "student-sheet-dialog",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": sheetTitle(worksheet, t),
					onClick: (event) => event.stopPropagation(),
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: "student-sheet-toolbar",
						children: [
							(0, react_jsx_runtime.jsx)("p", {
								className: "student-muted",
								children: t("printSheetHelp")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "student-primary",
								onClick: () => {
									window.print();
								},
								children: t("printSheet")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "student-quiet",
								onClick: onClose,
								children: t("close")
							})
						]
					}), (0, react_jsx_runtime.jsx)("div", {
						className: "student-sheet-scroll",
						children: (0, react_jsx_runtime.jsx)(WorksheetSheet, {
							worksheet,
							t
						})
					})]
				})
			}), container);
		}
		//#endregion
		//#region lib/types/client/practice-view.js
		const markKeys = {
			correct: "markCorrect",
			partial: "markPartial",
			incorrect: "markWrong"
		};
		/** Parent practice page: the mistake notebook, printed sheets, and due review. */
		function PracticeView({ study, now, subject, goals, mistakeStatus, setMistakeStatus, setMistakeOffset, revision, disabled, running, change, ask, onReview, epoch, t }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)(PhotoIntake, {
					ask,
					disabled: disabled || running,
					t
				}),
				(0, react_jsx_runtime.jsx)(WorkbookIntake, {
					study,
					goals,
					revision,
					disabled: disabled || running,
					change,
					ask,
					t
				}),
				(0, react_jsx_runtime.jsx)(MistakeEditor, {
					subject,
					goals,
					revision,
					change,
					t
				}),
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("notebook"),
						" · ",
						t(subject),
						" · ",
						study.confirmedCount
					] }),
					(0, react_jsx_runtime.jsx)("nav", {
						className: "student-segments",
						"aria-label": t("mistakeStatus"),
						children: [
							"all",
							"due",
							"reviewing",
							"mastered"
						].map((name) => (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": mistakeStatus === name,
							onClick: () => {
								setMistakeStatus(name);
								setMistakeOffset(0);
							},
							children: [t(name === "all" ? "all" : name === "due" ? "bookDue" : name === "reviewing" ? "bookReviewing" : "bookMastered"), name === "all" ? "" : ` · ${study.mistakeBook[name]}`]
						}, name))
					}),
					study.confirmedMistakes.length === 0 && (0, react_jsx_runtime.jsx)("p", { children: t("empty") }),
					study.confirmedMistakes.map((item) => (0, react_jsx_runtime.jsxs)("details", { children: [
						(0, react_jsx_runtime.jsxs)("summary", { children: [item.topic, item.stage >= 4 ? ` · ${t("bookMastered")}` : item.dueAt !== void 0 && item.dueAt <= now ? ` · ${t("dueNow")}` : ""] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("prompt"),
							": ",
							item.prompt
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("learnerAnswer"),
							": ",
							item.learnerAnswer
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("correction"),
							": ",
							item.correction
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("explanation"),
							": ",
							item.explanation
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("answerEvidence"),
							": ",
							item.answerEvidence
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("errorTypeLabel"),
							": ",
							item.errorType !== void 0 ? t(item.errorType) : t("errorTypeNone")
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("reviewStage"),
							": ",
							item.stage + 1,
							" / 5",
							item.dueAt !== void 0 ? ` · ${t("nextReview")}: ${item.dueAt <= now ? t("dueNow") : new Date(item.dueAt).toLocaleString()}` : ""
						] }),
						study.worksheets.filter((sheet) => sheet.sources.some((source) => source.mistakeId === item.id)).map((sheet) => (0, react_jsx_runtime.jsxs)("p", {
							className: "student-muted",
							children: [
								t("relatedWorksheets"),
								": ",
								sheet.objectiveTitle,
								" · ",
								t("graded"),
								" ",
								sheet.results.length,
								"/",
								sheet.items.length
							]
						}, sheet.id)),
						(0, react_jsx_runtime.jsx)(MistakeObjective, {
							mistake: item,
							objectives: goals,
							change,
							t
						}),
						(0, react_jsx_runtime.jsx)(MistakeEditor, {
							subject,
							goals,
							revision,
							change,
							t,
							existing: item
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: "student-segments",
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (!window.confirm(t("deleteMistakeConfirm"))) return;
									change({
										action: "delete-mistake",
										id: item.id
									}, revision).catch(() => {});
								},
								children: t("deleteMistake")
							}), item.objectiveId && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									const objectiveId = item.objectiveId;
									change({
										action: "save-exercise",
										exercise: {
											id: `ws-${item.id}`.slice(0, 80),
											subject: item.subject,
											objectiveId,
											role: "vary",
											variant: "numeric",
											prompt: item.prompt,
											steps: [
												"先回忆错因",
												"独立做一遍",
												"对照订正"
											],
											answer: item.correction,
											explanation: item.explanation,
											answerEvidence: item.answerEvidence,
											...item.errorType !== void 0 ? { errorType: item.errorType } : {}
										}
									}, revision).catch(() => {});
								},
								children: t("saveToExerciseBank")
							})]
						})
					] }, item.id)),
					study.confirmedCount > 20 && (0, react_jsx_runtime.jsxs)("div", {
						className: "student-pages",
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: study.confirmedOffset === 0,
								onClick: () => setMistakeOffset(study.confirmedOffset - 20),
								children: t("previousPage")
							}),
							(0, react_jsx_runtime.jsxs)("span", { children: [
								t("page"),
								" ",
								Math.floor(study.confirmedOffset / 20) + 1,
								" / ",
								Math.ceil(study.confirmedCount / 20)
							] }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: study.confirmedOffset + 20 >= study.confirmedCount,
								onClick: () => setMistakeOffset(study.confirmedOffset + 20),
								children: t("nextPage")
							})
						]
					})
				] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("workspaceExercises"),
						" · ",
						(study.exercises ?? []).length
					] }),
					(study.exercises ?? []).length === 0 && (0, react_jsx_runtime.jsx)("p", { children: t("empty") }),
					(study.exercises ?? []).map((item) => (0, react_jsx_runtime.jsxs)("details", { children: [
						(0, react_jsx_runtime.jsx)("summary", { children: item.prompt.slice(0, 40) }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("learningGoal"),
							": ",
							goals.find((goal) => goal.id === item.objectiveId)?.title ?? item.objectiveId
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("answer"),
							": ",
							item.answer
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("explanation"),
							": ",
							item.explanation
						] }),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								change({
									action: "delete-exercise",
									id: item.id
								}, revision).catch(() => {});
							},
							children: t("deleteExercise")
						})
					] }, item.id))
				] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("worksheets") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("reviewSheetHelp")
					}),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("reviewReady"),
						": ",
						study.reviewPlan.picks,
						study.reviewPlan.remaining > 0 ? ` · ${t("reviewLater")}: ${study.reviewPlan.remaining}` : "",
						study.reviewPlan.unlinkedDue > 0 ? ` · ${t("reviewUnlinked")}: ${study.reviewPlan.unlinkedDue}` : "",
						study.reviewPlan.openSheets > 0 ? ` · ${t("reviewOpenSheets")}: ${study.reviewPlan.openSheets}` : ""
					] }),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: disabled || running || goals.length === 0,
						onClick: () => {
							ask(practiceSheetPrompt(subject)).catch(() => {});
						},
						children: t("createWorksheet")
					}),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: disabled || running || study.reviewPlan.picks === 0,
						onClick: () => {
							ask(reviewSheetPrompt(subject)).catch(() => {});
						},
						children: t("printConsolidation")
					}),
					study.worksheets.length === 0 && (0, react_jsx_runtime.jsx)("p", { children: t("empty") }),
					study.worksheets.map((sheet) => (0, react_jsx_runtime.jsx)(WorksheetActions, {
						worksheet: sheet,
						revision,
						change,
						ask,
						disabled: disabled || running,
						t
					}, sheet.id))
				] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("due"),
						" · ",
						study.dueCount
					] }),
					study.dueMistakes.length === 0 && (0, react_jsx_runtime.jsx)("p", { children: t("empty") }),
					study.dueMistakes.map((item) => (0, react_jsx_runtime.jsxs)("p", { children: [
						t(item.subject),
						" · ",
						item.topic
					] }, item.id)),
					study.dueSubjects.map((item) => (0, react_jsx_runtime.jsxs)("button", {
						disabled: disabled || running,
						onClick: () => onReview(item),
						children: [
							t("review"),
							" · ",
							t(item)
						]
					}, item))
				] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("pending"),
						" · ",
						study.pendingCount
					] }),
					study.pendingMistakes.length === 0 && (0, react_jsx_runtime.jsx)("p", { children: t("empty") }),
					study.pendingMistakes.map((item) => (0, react_jsx_runtime.jsx)(MistakeConfirmation, {
						mistake: item,
						revision,
						change,
						t
					}, `${epoch}-${item.id}`))
				] }),
				(0, react_jsx_runtime.jsx)("p", { children: t("mistakeBounded") })
			] });
		}
		function MistakeEditor({ subject, goals, revision, change, t, existing }) {
			const [error, setError] = (0, react.useState)("");
			return (0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsx)("summary", { children: existing ? t("editMistake") : t("addMistake") }), (0, react_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					const form = new FormData(event.currentTarget);
					const objectiveId = String(form.get("objectiveId") ?? "");
					const picked = String(form.get("errorType") ?? "");
					const errorType = errorTypesBySubject[subject].find((candidate) => candidate === picked);
					change({
						action: "confirm-mistake",
						id: existing?.id ?? crypto.randomUUID(),
						subject,
						topic: String(form.get("topic") ?? "").trim() || void 0,
						prompt: String(form.get("prompt") ?? ""),
						learnerAnswer: String(form.get("learnerAnswer") ?? "") || void 0,
						correction: String(form.get("correction") ?? ""),
						explanation: String(form.get("explanation") ?? ""),
						answerEvidence: String(form.get("answerEvidence") ?? ""),
						objectiveId: objectiveId === "" ? "" : objectiveId,
						...errorType !== void 0 ? { errorType } : {},
						userConfirmation: t("confirmMistake")
					}, revision).catch((reason) => setError(reason instanceof Error ? reason.message : t("networkError")));
				},
				children: [
					(0, react_jsx_runtime.jsxs)("label", { children: [t("topic"), (0, react_jsx_runtime.jsx)("input", {
						name: "topic",
						defaultValue: existing?.topic ?? "",
						maxLength: 2e3
					})] }),
					[
						"prompt",
						"learnerAnswer",
						"correction",
						"explanation",
						"answerEvidence"
					].map((name) => (0, react_jsx_runtime.jsxs)("label", { children: [t(name), (0, react_jsx_runtime.jsx)("textarea", {
						name,
						defaultValue: existing?.[name] ?? "",
						required: name !== "learnerAnswer",
						maxLength: 2e3
					})] }, name)),
					(0, react_jsx_runtime.jsxs)("label", { children: [t("learningGoal"), (0, react_jsx_runtime.jsxs)("select", {
						name: "objectiveId",
						defaultValue: existing?.objectiveId ?? "",
						children: [(0, react_jsx_runtime.jsx)("option", {
							value: "",
							children: t("unclassified")
						}), goals.map((item) => (0, react_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.title
						}, item.id))]
					})] }),
					(0, react_jsx_runtime.jsxs)("label", { children: [t("errorTypeLabel"), (0, react_jsx_runtime.jsxs)("select", {
						name: "errorType",
						defaultValue: existing?.errorType ?? "",
						children: [(0, react_jsx_runtime.jsx)("option", {
							value: "",
							children: t("errorTypeNone")
						}), errorTypesBySubject[subject].map((type) => (0, react_jsx_runtime.jsx)("option", {
							value: type,
							children: t(type)
						}, type))]
					})] }),
					(0, react_jsx_runtime.jsx)("button", {
						type: "submit",
						children: existing ? t("save") : t("addMistake")
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: error
					})
				]
			})] });
		}
		function MistakeObjective({ mistake, objectives, change, t }) {
			const [error, setError] = (0, react.useState)("");
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						setError("");
						const objectiveId = String(new FormData(event.currentTarget).get("objectiveId") ?? "");
						change({
							action: "link-mistake",
							mistakeId: mistake.id,
							objectiveId
						}).catch((reason) => setError(reason instanceof Error ? reason.message : t("networkError")));
					},
					children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("learningGoal"), (0, react_jsx_runtime.jsxs)("select", {
						name: "objectiveId",
						defaultValue: mistake.objectiveId ?? "",
						required: true,
						children: [(0, react_jsx_runtime.jsx)("option", {
							value: "",
							disabled: true,
							children: t("unclassified")
						}), objectives.map((item) => (0, react_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.title
						}, item.id))]
					})] }), (0, react_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: objectives.length === 0,
						children: t("linkGoal")
					})]
				}),
				(0, react_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						setError("");
						const picked = String(new FormData(event.currentTarget).get("errorType") ?? "");
						const errorType = errorTypesBySubject[mistake.subject].find((candidate) => candidate === picked) ?? "";
						change({
							action: "classify-mistake",
							mistakeId: mistake.id,
							errorType
						}).catch((reason) => setError(reason instanceof Error ? reason.message : t("networkError")));
					},
					children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("errorTypeLabel"), (0, react_jsx_runtime.jsxs)("select", {
						name: "errorType",
						defaultValue: mistake.errorType ?? "",
						children: [(0, react_jsx_runtime.jsx)("option", {
							value: "",
							children: t("errorTypeNone")
						}), errorTypesBySubject[mistake.subject].map((type) => (0, react_jsx_runtime.jsx)("option", {
							value: type,
							children: t(type)
						}, type))]
					})] }), (0, react_jsx_runtime.jsx)("button", {
						type: "submit",
						children: t("saveErrorType")
					})]
				}),
				error && (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					children: error
				})
			] });
		}
		function WorksheetActions({ worksheet, revision, change, ask, disabled, t }) {
			const [previewing, setPreviewing] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)("");
			const [marks, setMarks] = (0, react.useState)(() => Object.fromEntries(worksheet.results.flatMap((item) => item.result === "unassessed" ? [] : [[item.itemId, item.result]])));
			const [answers, setAnswers] = (0, react.useState)({});
			const [causes, setCauses] = (0, react.useState)({});
			const [helped, setHelped] = (0, react.useState)({});
			const [paper, setPaper] = (0, react.useState)(() => Object.fromEntries(worksheet.drafts.map((draft) => [draft.itemId, {
				...draft.result === "correct" || draft.result === "partial" || draft.result === "incorrect" ? { result: draft.result } : {},
				response: draft.response,
				errorType: draft.errorType ?? ""
			}])));
			const [saving, setSaving] = (0, react.useState)(false);
			function assistanceFor(itemId) {
				const saved = worksheet.results.find((item) => item.itemId === itemId)?.assistance ?? worksheet.drafts.find((item) => item.itemId === itemId)?.assistance ?? "independent";
				return helped[itemId] === void 0 ? saved : helped[itemId] ? saved === "worked-example" ? "worked-example" : "hint" : "independent";
			}
			const changed = worksheet.items.filter((item) => {
				const before = worksheet.results.find((result) => result.itemId === item.id);
				const mark = marks[item.id];
				if (mark === void 0) return false;
				const assistance = assistanceFor(item.id);
				return mark !== before?.result || (answers[item.id]?.trim() ?? "") !== "" || before !== void 0 && assistance !== before.assistance || mark !== "correct" && causes[item.id] !== void 0 && causes[item.id] !== (before?.errorType ?? "");
			});
			function markAllRight() {
				setMarks((previous) => {
					const next = { ...previous };
					for (const item of worksheet.items) {
						const saved = worksheet.results.find((result) => result.itemId === item.id);
						if (saved && saved.result !== "unassessed") continue;
						if (next[item.id] !== void 0) continue;
						next[item.id] = "correct";
					}
					return next;
				});
			}
			async function grade() {
				setSaving(true);
				setError("");
				setMessage("");
				try {
					await change({
						action: "grade-sheet",
						grade: {
							worksheetId: worksheet.id,
							userConfirmation: t("gradeConfirmation"),
							results: changed.map((item) => {
								const response = answers[item.id]?.trim();
								const mark = marks[item.id] ?? "correct";
								const cause = causes[item.id] ?? worksheet.results.find((result) => result.itemId === item.id)?.errorType;
								return {
									itemId: item.id,
									result: mark,
									...response ? { response } : {},
									assistance: assistanceFor(item.id),
									...mark !== "correct" && cause ? { errorType: cause } : {}
								};
							})
						}
					}, revision);
					setAnswers({});
					setMessage(t("gradesSaved"));
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : t("networkError"));
				} finally {
					setSaving(false);
				}
			}
			const highConfidence = worksheet.drafts.filter((draft) => draft.confidence === "high" && draft.result === "correct" && draft.uncertainties === "");
			async function confirmBatch(drafts) {
				setSaving(true);
				setError("");
				setMessage("");
				try {
					await change({
						action: "confirm-paper",
						worksheetId: worksheet.id,
						userConfirmation: t("confirmPaper"),
						results: drafts.map((draft) => ({
							itemId: draft.itemId,
							result: "correct",
							response: draft.response,
							assistance: draft.assistance,
							...draft.errorType !== void 0 ? { errorType: draft.errorType } : {}
						}))
					}, revision);
					setMessage(t("confirmPaperDone"));
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : t("networkError"));
				} finally {
					setSaving(false);
				}
			}
			const paperEntries = worksheet.drafts.flatMap((draft) => {
				const value = paper[draft.itemId];
				return value?.result !== void 0 ? [{
					itemId: draft.itemId,
					result: value.result,
					response: value.response,
					...value.errorType !== "" ? { errorType: value.errorType } : {}
				}] : [];
			});
			const patchPaper = (itemId, patch) => {
				setPaper((previous) => {
					const prev = previous[itemId];
					return {
						...previous,
						[itemId]: {
							...prev?.result !== void 0 ? { result: prev.result } : {},
							response: prev?.response ?? "",
							errorType: prev?.errorType ?? "",
							...patch
						}
					};
				});
			};
			async function confirmPaper() {
				setSaving(true);
				setError("");
				setMessage("");
				try {
					await change({
						action: "confirm-paper",
						worksheetId: worksheet.id,
						userConfirmation: t("confirmPaper"),
						results: paperEntries
					}, revision);
					setMessage(t("confirmPaperDone"));
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : t("networkError"));
				} finally {
					setSaving(false);
				}
			}
			async function discard() {
				if (!window.confirm(t("discardConfirm"))) return;
				setError("");
				try {
					await change({
						action: "discard-sheet",
						worksheetId: worksheet.id
					}, revision);
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : t("networkError"));
				}
			}
			return (0, react_jsx_runtime.jsxs)("details", { children: [
				(0, react_jsx_runtime.jsxs)("summary", { children: [
					worksheet.objectiveTitle,
					" · ",
					worksheet.items.length,
					" ",
					t("questions"),
					" · ",
					worksheet.open ? `${t("notGraded")} ${worksheet.items.length - worksheet.results.length}` : `${t("graded")} ${worksheet.results.length}/${worksheet.items.length}`
				] }),
				(0, react_jsx_runtime.jsxs)("p", {
					className: "student-muted",
					children: [
						t("createdAt"),
						": ",
						new Date(worksheet.createdAt).toLocaleDateString(),
						" · ",
						t("gradeHelp")
					]
				}),
				(0, react_jsx_runtime.jsx)("button", {
					type: "button",
					disabled,
					onClick: () => {
						setPreviewing(true);
						setMessage("");
					},
					children: t("previewPrintSheet")
				}),
				previewing && (0, react_jsx_runtime.jsx)(WorksheetPrint, {
					worksheet,
					onClose: () => setPreviewing(false),
					t
				}),
				(0, react_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: disabled || saving,
					onClick: markAllRight,
					children: t("markAllCorrect")
				}),
				worksheet.items.map((item, index) => {
					const source = worksheet.sources.find((candidate) => candidate.itemId === item.id);
					const result = worksheet.results.find((candidate) => candidate.itemId === item.id);
					return (0, react_jsx_runtime.jsxs)("fieldset", {
						className: "student-grade",
						disabled: disabled || saving,
						children: [
							(0, react_jsx_runtime.jsxs)("p", { children: [
								index + 1,
								". ",
								item.prompt
							] }),
							(0, react_jsx_runtime.jsxs)("p", {
								className: "student-muted",
								children: [
									t("referenceAnswer"),
									": ",
									item.answer,
									" · ",
									source?.mistakeId ? `${t("sourceMistake")}: ${source.topic}` : t("practiceItem"),
									result ? ` · ${t(result.result)}: ${result.response}` : ""
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "student-segments",
								role: "radiogroup",
								"aria-label": `${index + 1}`,
								children: [
									"correct",
									"partial",
									"incorrect"
								].map((mark) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									role: "radio",
									"aria-checked": marks[item.id] === mark,
									onClick: () => setMarks((previous) => ({
										...previous,
										[item.id]: mark
									})),
									children: t(markKeys[mark])
								}, mark))
							}),
							marks[item.id] === "correct" && (0, react_jsx_runtime.jsxs)("label", { children: [
								(0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: assistanceFor(item.id) !== "independent",
									onChange: (event) => {
										const checked = event.target.checked;
										setHelped((previous) => ({
											...previous,
											[item.id]: checked
										}));
									}
								}),
								" ",
								t("hintedCorrect")
							] }),
							marks[item.id] !== void 0 && marks[item.id] !== "correct" && (0, react_jsx_runtime.jsxs)("label", { children: [t("childAnswer"), (0, react_jsx_runtime.jsx)("input", {
								value: answers[item.id] ?? "",
								maxLength: 2e3,
								onChange: (event) => {
									const value = event.target.value;
									setAnswers((previous) => ({
										...previous,
										[item.id]: value
									}));
								}
							})] }),
							marks[item.id] !== void 0 && marks[item.id] !== "correct" && (0, react_jsx_runtime.jsxs)("label", { children: [t("errorTypeLabel"), (0, react_jsx_runtime.jsxs)("select", {
								value: causes[item.id] ?? result?.errorType ?? "",
								onChange: (event) => {
									const type = errorTypesBySubject[worksheet.subject].find((candidate) => candidate === event.target.value);
									setCauses((previous) => ({
										...previous,
										[item.id]: type ?? ""
									}));
								},
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: t("errorTypeNone")
								}), errorTypesBySubject[worksheet.subject].map((type) => (0, react_jsx_runtime.jsx)("option", {
									value: type,
									children: t(type)
								}, type))]
							})] })
						]
					}, item.id);
				}),
				worksheet.drafts.length > 0 && (0, react_jsx_runtime.jsxs)("fieldset", {
					className: "student-grade",
					disabled: disabled || saving,
					children: [
						(0, react_jsx_runtime.jsx)("legend", { children: t("draftsTitle") }),
						(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("draftsHelp")
						}),
						highConfidence.length > 0 && (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: disabled || saving,
							onClick: () => {
								confirmBatch(highConfidence);
							},
							children: [
								t("confirmHighConfidence"),
								" · ",
								highConfidence.length
							]
						}),
						worksheet.drafts.map((draft) => {
							const index = worksheet.items.findIndex((item) => item.id === draft.itemId);
							const value = paper[draft.itemId];
							return (0, react_jsx_runtime.jsxs)("div", { children: [
								(0, react_jsx_runtime.jsx)("p", { children: index >= 0 ? `${index + 1}. ${worksheet.items[index]?.prompt ?? ""}` : draft.itemId }),
								(0, react_jsx_runtime.jsxs)("label", { children: [t("learnerAnswer"), (0, react_jsx_runtime.jsx)("input", {
									value: value?.response ?? draft.response,
									maxLength: 2e3,
									onChange: (event) => {
										patchPaper(draft.itemId, { response: event.target.value });
									}
								})] }),
								draft.uncertainties !== "" && (0, react_jsx_runtime.jsxs)("p", {
									className: "student-muted",
									children: [
										t("uncertainties"),
										": ",
										draft.uncertainties
									]
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: "student-segments",
									role: "radiogroup",
									"aria-label": t("draftChoice"),
									children: [
										"correct",
										"partial",
										"incorrect"
									].map((mark) => (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										role: "radio",
										"aria-checked": value?.result === mark,
										onClick: () => {
											patchPaper(draft.itemId, { result: mark });
										},
										children: t(markKeys[mark])
									}, mark))
								}),
								(value?.result === "partial" || value?.result === "incorrect") && (0, react_jsx_runtime.jsxs)("label", { children: [t("errorTypeLabel"), (0, react_jsx_runtime.jsxs)("select", {
									value: value.errorType,
									onChange: (event) => {
										const type = errorTypesBySubject[worksheet.subject].find((candidate) => candidate === event.target.value);
										patchPaper(draft.itemId, { errorType: type ?? "" });
									},
									children: [(0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("errorTypeNone")
									}), errorTypesBySubject[worksheet.subject].map((type) => (0, react_jsx_runtime.jsx)("option", {
										value: type,
										children: t(type)
									}, type))]
								})] })
							] }, draft.itemId);
						}),
						(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "student-primary",
							disabled: disabled || saving || paperEntries.length === 0,
							onClick: () => {
								confirmPaper();
							},
							children: [t("confirmPaper"), paperEntries.length > 0 ? ` · ${paperEntries.length}` : ""]
						})
					]
				}),
				(0, react_jsx_runtime.jsx)(PhotoIntake, {
					ask,
					disabled: disabled || saving,
					t,
					variant: "paper",
					prompt: paperPhotoPrompt(worksheet.id)
				}),
				(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "student-primary",
					disabled: disabled || saving || changed.length === 0,
					onClick: () => {
						grade();
					},
					children: [t("saveGrades"), changed.length > 0 ? ` · ${changed.length}` : ""]
				}),
				(0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "student-quiet",
					disabled: disabled || saving,
					onClick: () => {
						discard();
					},
					children: t("discardSheet")
				}),
				message && (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: message
				}),
				error && (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					children: error
				})
			] });
		}
		const workbookOutcomeKeys = {
			stuck: "workbookStuck",
			hinted: "workbookHinted",
			"independent-wrong": "workbookWrong",
			"independent-correct": "workbookRight"
		};
		function WorkbookIntake({ study, goals, revision, disabled, change, ask, t }) {
			const [message, setMessage] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)("");
			const [saving, setSaving] = (0, react.useState)(false);
			const [outcomes, setOutcomes] = (0, react.useState)({});
			const [goalsChosen, setGoalsChosen] = (0, react.useState)({});
			const [corrections, setCorrections] = (0, react.useState)({});
			const [explanations, setExplanations] = (0, react.useState)({});
			const [evidence, setEvidence] = (0, react.useState)({});
			async function confirmDraft(draft) {
				const outcome = outcomes[draft.id] ?? draft.outcome;
				const objectiveId = goalsChosen[draft.id] ?? draft.objectiveId ?? "";
				const correction = corrections[draft.id]?.trim() ?? "";
				const explanation = explanations[draft.id]?.trim() ?? "";
				const answerEvidence = evidence[draft.id]?.trim() ?? "";
				if (outcome === "independent-wrong" && (correction === "" || explanation === "" || answerEvidence === "")) {
					setError(t("workbookNeedCorrection"));
					return;
				}
				setSaving(true);
				setError("");
				setMessage("");
				try {
					await change({
						action: "confirm-workbook",
						id: draft.id,
						outcome,
						userConfirmation: t("confirmWorkbook"),
						...objectiveId !== (draft.objectiveId ?? "") ? { objectiveId } : {},
						...outcome === "independent-wrong" ? {
							correction,
							explanation,
							answerEvidence
						} : {}
					}, revision);
					setMessage(outcome === "stuck" || outcome === "hinted" ? t("teachQueued") : t("workbookSaved"));
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : t("networkError"));
				} finally {
					setSaving(false);
				}
			}
			async function dismiss(id) {
				setSaving(true);
				setError("");
				setMessage("");
				try {
					await change({
						action: "dismiss-teaching",
						id
					}, revision);
					setMessage(t("workbookSaved"));
				} catch (reason) {
					setError(reason instanceof Error ? reason.message : t("networkError"));
				} finally {
					setSaving(false);
				}
			}
			return (0, react_jsx_runtime.jsxs)("section", { children: [
				(0, react_jsx_runtime.jsx)(PhotoIntake, {
					ask,
					disabled: disabled || saving,
					t,
					variant: "workbook",
					prompt: workbookPhotoPrompt
				}),
				study.workbookDrafts.length > 0 && (0, react_jsx_runtime.jsxs)("fieldset", {
					className: "student-grade",
					disabled: disabled || saving,
					children: [(0, react_jsx_runtime.jsx)("legend", { children: t("workbookDrafts") }), study.workbookDrafts.map((draft) => {
						const outcome = outcomes[draft.id] ?? draft.outcome;
						const objectiveId = goalsChosen[draft.id] ?? draft.objectiveId ?? "";
						const known = goals.some((goal) => goal.id === draft.objectiveId);
						return (0, react_jsx_runtime.jsxs)("div", { children: [
							(0, react_jsx_runtime.jsx)("p", { children: draft.prompt }),
							draft.response && (0, react_jsx_runtime.jsxs)("p", {
								className: "student-muted",
								children: [
									t("learnerAnswer"),
									": ",
									draft.response
								]
							}),
							draft.uncertainties !== "" && (0, react_jsx_runtime.jsxs)("p", {
								className: "student-muted",
								children: [
									t("uncertainties"),
									": ",
									draft.uncertainties
								]
							}),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("learningGoal"), (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": t("learningGoal"),
								value: objectiveId,
								onChange: (event) => {
									const value = event.target.value;
									setGoalsChosen((previous) => ({
										...previous,
										[draft.id]: value
									}));
								},
								children: [
									(0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("workbookNoGoal")
									}),
									draft.objectiveId && !known && (0, react_jsx_runtime.jsx)("option", {
										value: draft.objectiveId,
										children: draft.objectiveId
									}),
									goals.map((goal) => (0, react_jsx_runtime.jsx)("option", {
										value: goal.id,
										children: goal.title
									}, goal.id))
								]
							})] }),
							(0, react_jsx_runtime.jsx)("div", {
								className: "student-segments",
								role: "radiogroup",
								"aria-label": draft.prompt,
								children: [
									"stuck",
									"hinted",
									"independent-wrong",
									"independent-correct"
								].map((name) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									role: "radio",
									"aria-checked": outcome === name,
									onClick: () => setOutcomes((previous) => ({
										...previous,
										[draft.id]: name
									})),
									children: t(workbookOutcomeKeys[name])
								}, name))
							}),
							outcome === "independent-wrong" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								(0, react_jsx_runtime.jsxs)("label", { children: [t("correction"), (0, react_jsx_runtime.jsx)("input", {
									value: corrections[draft.id] ?? "",
									maxLength: 2e3,
									onChange: (event) => {
										const value = event.target.value;
										setCorrections((previous) => ({
											...previous,
											[draft.id]: value
										}));
									}
								})] }),
								(0, react_jsx_runtime.jsxs)("label", { children: [t("explanation"), (0, react_jsx_runtime.jsx)("input", {
									value: explanations[draft.id] ?? "",
									maxLength: 2e3,
									onChange: (event) => {
										const value = event.target.value;
										setExplanations((previous) => ({
											...previous,
											[draft.id]: value
										}));
									}
								})] }),
								(0, react_jsx_runtime.jsxs)("label", { children: [t("answerEvidence"), (0, react_jsx_runtime.jsx)("input", {
									value: evidence[draft.id] ?? "",
									maxLength: 2e3,
									onChange: (event) => {
										const value = event.target.value;
										setEvidence((previous) => ({
											...previous,
											[draft.id]: value
										}));
									}
								})] })
							] }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "student-primary",
								disabled: disabled || saving,
								onClick: () => {
									confirmDraft(draft);
								},
								children: t("confirmWorkbook")
							})
						] }, draft.id);
					})]
				}),
				study.teachingQueue.length > 0 && (0, react_jsx_runtime.jsxs)("fieldset", {
					className: "student-grade",
					disabled: disabled || saving,
					children: [(0, react_jsx_runtime.jsx)("legend", { children: t("teachingQueue") }), study.teachingQueue.map((item) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("p", { children: item.prompt }), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "student-quiet",
						disabled: disabled || saving,
						onClick: () => {
							dismiss(item.id);
						},
						children: t("dismissTeaching")
					})] }, item.id))]
				}),
				message && (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: message
				}),
				error && (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					children: error
				})
			] });
		}
		function PhotoIntake({ ask, disabled, t, variant = "mistake", prompt = mistakePhotoPrompt }) {
			const [photo, setPhoto] = (0, react.useState)();
			const [error, setError] = (0, react.useState)("");
			const [reading, setReading] = (0, react.useState)(false);
			async function select(file) {
				setPhoto(void 0);
				setError("");
				if (!file) return;
				const mediaType = file.type;
				if (file.size > 8388608 || ![
					"image/png",
					"image/jpeg",
					"image/webp"
				].includes(mediaType)) {
					setError(t("photoError"));
					return;
				}
				setReading(true);
				try {
					const preview = await new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error(t("photoError")));
						reader.onerror = () => reject(new Error(t("photoError")));
						reader.readAsDataURL(file);
					});
					if (mediaType === "image/png" || mediaType === "image/jpeg" || mediaType === "image/webp") setPhoto({
						mediaType,
						data: preview.slice(preview.indexOf(",") + 1),
						preview,
						name: file.name
					});
				} catch {
					setError(t("photoError"));
				} finally {
					setReading(false);
				}
			}
			async function submit(event) {
				event.preventDefault();
				if (!photo) return;
				try {
					await ask(prompt, photo);
					setPhoto(void 0);
				} catch {}
			}
			return (0, react_jsx_runtime.jsxs)("section", { children: [
				(0, react_jsx_runtime.jsx)("h3", { children: t(variant === "mistake" ? "photo" : variant === "paper" ? "paperPhoto" : "workbookPhoto") }),
				(0, react_jsx_runtime.jsx)("p", { children: t(variant === "mistake" ? "photoHelp" : variant === "paper" ? "paperPhotoHelp" : "workbookPhotoHelp") }),
				(0, react_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						submit(event);
					},
					children: [
						(0, react_jsx_runtime.jsxs)("label", { children: [t("photo"), (0, react_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "image/png,image/jpeg,image/webp",
							disabled: disabled || reading,
							onChange: (event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								select(file);
							}
						})] }),
						photo && (0, react_jsx_runtime.jsx)("img", {
							src: photo.preview,
							alt: t("preview")
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: !photo || disabled || reading,
							children: t("sendPhoto")
						}),
						error && (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: error
						})
					]
				})
			] });
		}
		//#endregion
		//#region lib/types/client/lessons-view.js
		const statusKey = {
			generating: "openmaicGenerating",
			ready: "openmaicReady",
			failed: "openmaicFailed"
		};
		/**
		* Open a classroom URL in another browser tab.
		* The desk does not embed the classroom: a cross-origin frame would not carry the OpenMAIC cookie,
		* and a static export player is intentionally absent.
		*/
		/** http(s) URL without credentials, or undefined when the desk must not offer it. */
		function classroomUrl(value) {
			if (value === void 0 || value === "") return void 0;
			let parsed;
			try {
				parsed = new URL(value);
			} catch {
				return;
			}
			if (parsed.username !== "" || parsed.password !== "" || parsed.protocol !== "http:" && parsed.protocol !== "https:") return void 0;
			return parsed.href;
		}
		function openClassroom(url) {
			const href = classroomUrl(url);
			if (href === void 0) return;
			window.open(href, "_blank", "noopener,noreferrer");
		}
		/** Lessons for the open subject. A row with no subject stays visible; a row for another subject does not. */
		function lessonsForSubject(lessons, subject) {
			return lessons.filter((lesson) => lesson.subject === void 0 || lesson.subject === subject);
		}
		/** Recent OpenMAIC lessons: open or copy the URL, and ask the tutor to generate, retry or review. */
		function LessonsPanel({ lessons, error, disabled, running, t, onGenerate, onRetry, onReview }) {
			const [copiedId, setCopiedId] = (0, react.useState)("");
			const busy = disabled || running;
			return (0, react_jsx_runtime.jsxs)("section", {
				"aria-label": t("openmaicTitle"),
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("openmaicTitle") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("openmaicHelp")
					}),
					error && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: error
					}),
					onGenerate && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: onGenerate,
						children: t("openmaicGenerate")
					}),
					lessons.length === 0 ? (0, react_jsx_runtime.jsx)("p", { children: t("openmaicEmpty") }) : lessons.map((lesson, index) => (0, react_jsx_runtime.jsxs)("details", {
						open: index === 0,
						children: [
							(0, react_jsx_runtime.jsxs)("summary", { children: [
								lesson.title,
								" · ",
								t(statusKey[lesson.status])
							] }),
							(0, react_jsx_runtime.jsx)("p", {
								className: "student-muted",
								children: lesson.requirement
							}),
							lesson.warning && (0, react_jsx_runtime.jsxs)("p", { children: [
								t("openmaicWarning"),
								": ",
								lesson.warning
							] }),
							lesson.error && (0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								children: lesson.error
							}),
							classroomUrl(lesson.url) && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
								className: "student-url",
								children: classroomUrl(lesson.url)
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: "student-segments",
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => openClassroom(lesson.url ?? ""),
									children: t("openmaicOpen")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										const url = classroomUrl(lesson.url);
										if (url === void 0) return;
										navigator.clipboard?.writeText(url).then(() => setCopiedId(lesson.id)).catch(() => setCopiedId(""));
									},
									children: copiedId === lesson.id ? t("openmaicCopied") : t("openmaicCopy")
								})]
							})] }),
							lesson.status === "failed" && lesson.retryable === true && lesson.runId && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy,
								onClick: () => onRetry(lesson.runId ?? ""),
								children: t("openmaicRetry")
							}),
							lesson.status === "ready" && lesson.classroomId && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy,
								onClick: () => onReview(lesson.classroomId ?? ""),
								children: t("openmaicReview")
							}),
							lesson.summary && (0, react_jsx_runtime.jsxs)("div", { children: [
								(0, react_jsx_runtime.jsx)("p", { children: t("openmaicOutline") }),
								(0, react_jsx_runtime.jsx)("p", { children: lesson.summary.outline }),
								lesson.summary.scenes.map((scene, sceneIndex) => (0, react_jsx_runtime.jsxs)("p", {
									className: "student-muted",
									children: [scene.title, scene.summary ? ` · ${scene.summary}` : ""]
								}, `${scene.title}-${sceneIndex}`))
							] })
						]
					}, lesson.id))
				]
			});
		}
		//#endregion
		//#region lib/types/client/today-view.js
		/** The learner's page: one recommended next step, the current question, and a folded set of other ways to practise. */
		function TodayView({ study, subject, activity, setActivity, goal, clearGoal, curriculum, selectedObjectiveId, chooseGoal, intensityLabel, openParent, openCheckins, scope, setScope, scopeUnits, start, startRecommended, startDiagnosis, chosenIntensity, disabled, running, act, tutor, t, prompts, lessons, onInterestPractice, onOpenLesson, onClearDue, onOpenClassroom }) {
			const active = study.active;
			const ownSession = !!active && active.subject === subject;
			const task = ownSession && study.task?.sessionId === active.id ? study.task : void 0;
			const available = ownSession;
			const recommendation = study.recommendation;
			const progress = curriculum?.scope.current ? study.courses.find((item) => item.subject === subject)?.progress : void 0;
			const frontierIndex = progress ? curriculum?.units.findIndex((unit) => unit.id === progress.unitId) ?? -1 : -1;
			const schoolUnit = frontierIndex >= 0 ? curriculum?.units[frontierIndex] : void 0;
			const homeUnit = curriculum?.scope.current ? [...curriculum.units].reverse().find((unit) => curriculum.concepts.some((concept) => concept.unit === unit.id && concept.level !== "untouched")) : void 0;
			const objectiveMeta = curriculum?.scope.current ? curriculum.objectives.find((item) => item.id === task?.objectiveId) : void 0;
			const recommendGoal = curriculum?.scope.current && recommendation?.objectiveId ? curriculum.objectives.find((item) => item.id === recommendation.objectiveId) : void 0;
			const explain = study.understandingReminders[0];
			const generating = lessons.find((item) => item.status === "generating");
			const ready = lessons.find((item) => item.status === "ready" && item.objectiveId !== void 0 && item.objectiveId === recommendation?.objectiveId && classroomUrl(item.url)) ?? lessons.find((item) => item.status === "ready" && classroomUrl(item.url));
			const readyUrl = classroomUrl(ready?.url);
			const goalPractice = recommendation?.kind === "practice" || recommendation?.kind === "learn" || recommendation?.kind === "preview" || recommendation?.kind === "review" && recommendation.objectiveId !== void 0;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(generating || readyUrl) && (0, react_jsx_runtime.jsxs)("section", { children: [
					generating && (0, react_jsx_runtime.jsxs)("p", {
						role: "status",
						children: [
							t("openmaicGenerating"),
							" · ",
							generating.title
						]
					}),
					readyUrl && (0, react_jsx_runtime.jsx)("div", {
						className: "student-segments",
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "student-primary",
							onClick: () => onOpenClassroom(readyUrl),
							children: t("goToClass")
						})
					}),
					ready && (0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: ready.title
					})
				] }),
				(0, react_jsx_runtime.jsxs)("section", {
					className: "student-status",
					children: [
						(0, react_jsx_runtime.jsxs)("p", { children: [
							study.profile.nickname,
							" · ",
							t("todayStars"),
							": ",
							study.todayStars
						] }),
						(0, react_jsx_runtime.jsxs)("p", { children: [
							t("due"),
							": ",
							study.dueCount,
							" · ",
							t("weakPoints"),
							": ",
							study.weakPoints.length
						] }),
						schoolUnit && (0, react_jsx_runtime.jsxs)("p", { children: [
							t("schoolFrontier"),
							": ",
							schoolUnit.name,
							" · ",
							t(progress?.posture === "catch-up" ? "catchUp" : "keepUp"),
							progress?.pace === "review" ? ` · ${t("reviewWeek")}` : "",
							" · ",
							t("homeProgress"),
							": ",
							homeUnit?.name ?? t("homeNotStarted")
						] }),
						(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t(subject === "chinese" ? "chineseMethod" : subject === "math" ? "mathMethod" : "englishMethod")
						}),
						ownSession ? (0, react_jsx_runtime.jsxs)("p", { children: [
							t(active.subject),
							" · ",
							t(active.mode)
						] }) : active && active.subject !== subject ? (0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("otherSubjectActive").replace("{subject}", t(active.subject))
						}) : null
					]
				}),
				ownSession && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("section", {
					className: "student-focus",
					children: [
						(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("chatHelp")
						}),
						task ? (0, react_jsx_runtime.jsx)(Task, {
							study,
							goalTitle: goalTitle(study, task.objectiveId),
							goalText: objectiveMeta?.goal,
							days: objectiveMeta?.independentDays,
							disabled: disabled || running,
							t,
							act,
							tutor
						}, `${task.sessionId}:${task.id}`) : (0, react_jsx_runtime.jsx)("p", { children: t("waiting") }),
						available && (running ? (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							children: t("tutorWorking")
						}) : (!task || study.feedback || task.response !== void 0 || task.hintLevel > 0) && (0, react_jsx_runtime.jsx)("button", {
							disabled,
							onClick: () => {
								tutor("").catch(() => {});
							},
							children: t(!task ? "prepareTask" : study.feedback ? "nextTask" : task.response !== void 0 ? "retryFeedback" : "retryHint")
						}))
					]
				}), (0, react_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						act({
							action: "stop",
							sessionId: active.id,
							reflection: String(form.get("reflection") ?? "")
						});
					},
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: "student-segments",
						children: [(0, react_jsx_runtime.jsx)("button", {
							disabled,
							type: "submit",
							className: "student-primary",
							children: t("stop")
						}), (explain || task?.objectiveId) && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: disabled || running,
							onClick: () => {
								tutor(feynmanPrompt(explain?.title ?? goalTitle(study, task?.objectiveId))).catch(() => {});
							},
							children: t("feynmanTeach")
						})]
					}), (0, react_jsx_runtime.jsxs)("details", {
						className: "student-fold",
						children: [
							(0, react_jsx_runtime.jsx)("summary", { children: t("reflectionOptional") }),
							(explain || task?.objectiveId) && (0, react_jsx_runtime.jsxs)("p", { children: [t("explainPrompt"), explain ? ` · ${explain.title}` : ""] }),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("reflection"), (0, react_jsx_runtime.jsx)("textarea", {
								"aria-label": t("reflection"),
								name: "reflection",
								maxLength: 2e3,
								placeholder: t("explainPrompt")
							})] })
						]
					})]
				})] }),
				!ownSession && (0, react_jsx_runtime.jsxs)("section", {
					className: "student-plan",
					children: [
						(0, react_jsx_runtime.jsx)("h3", { children: t("todayPlan") }),
						recommendation ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsxs)("p", { children: [
								t(planKeys[recommendation.kind]),
								" · ",
								t(recommendation.subject),
								recommendation.title ? ` · ${recommendation.title}` : ""
							] }),
							recommendGoal?.goal && (0, react_jsx_runtime.jsxs)("p", { children: [
								t("objectiveGoal"),
								": ",
								recommendGoal.goal
							] }),
							recommendGoal && (0, react_jsx_runtime.jsx)(MasteryDots, {
								days: recommendGoal.independentDays,
								t
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: "student-muted",
								children: reasonText([recommendation.reason], t)
							}),
							study.interestFocus && (0, react_jsx_runtime.jsxs)("p", {
								className: "student-muted",
								children: [
									t("interestFocusLabel"),
									": ",
									study.interestFocus
								]
							}),
							recommendation.redirectedFrom && (0, react_jsx_runtime.jsxs)("p", {
								className: "student-muted",
								children: [
									t("prerequisiteFor"),
									": ",
									recommendation.redirectedFrom.title
								]
							}),
							recommendation.kind === "hold" ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: openParent,
								children: t("updateSchoolProgress")
							}) : (0, react_jsx_runtime.jsxs)("div", {
								className: "student-segments",
								children: [
									goalPractice && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "student-primary",
										disabled: disabled || running,
										onClick: onInterestPractice,
										children: t("interestPractice")
									}),
									recommendation.kind === "diagnose" && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "student-primary",
										disabled: disabled || running,
										onClick: startRecommended,
										children: t("startNow")
									}),
									recommendation.kind === "review" && study.dueToday.length === 0 && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "student-primary",
										disabled: disabled || running,
										onClick: startRecommended,
										children: t("startNow")
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: disabled || running || generating !== void 0,
										onClick: onOpenLesson,
										children: t("openLesson")
									})
								]
							})
						] }) : (0, react_jsx_runtime.jsx)("p", { children: t("allDone") }),
						goal && (0, react_jsx_runtime.jsxs)("p", { children: [
							t("learningGoal"),
							": ",
							goal.title,
							" ",
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: clearGoal,
								children: t("clearGoal")
							})
						] }),
						study.weakPoints.length > 0 && (0, react_jsx_runtime.jsxs)("details", { children: [
							(0, react_jsx_runtime.jsxs)("summary", { children: [
								t("weakPoints"),
								" · ",
								study.weakPoints.length
							] }),
							(0, react_jsx_runtime.jsx)("p", {
								className: "student-muted",
								children: t("weakHint")
							}),
							study.weakPoints.map((item) => (0, react_jsx_runtime.jsxs)("div", { children: [
								(0, react_jsx_runtime.jsxs)("p", { children: [
									t(item.subject),
									" · ",
									item.title,
									" · ",
									t(levelKey(item.level))
								] }),
								(0, react_jsx_runtime.jsx)("p", {
									className: "student-muted",
									children: reasonText(item.reasons, t)
								}),
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: disabled || running,
									"aria-pressed": selectedObjectiveId === item.id,
									onClick: () => chooseGoal(item),
									children: [
										t("chooseGoal"),
										" · ",
										item.title
									]
								})
							] }, item.id))
						] })
					]
				}),
				!ownSession && study.dueToday.length > 0 && (0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("dueTodayTitle") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("dueTodayHelp")
					}),
					study.dueToday.map((item) => (0, react_jsx_runtime.jsxs)("p", { children: [
						t(item.subject),
						" · ",
						item.topic
					] }, item.id)),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: disabled || running,
						onClick: onClearDue,
						children: t("clearDue").replace("{count}", String(study.dueToday.length))
					}),
					study.dueBacklog > study.dueToday.length && (0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("dueLater").replace("{count}", String(study.dueBacklog - study.dueToday.length))
					})
				] }),
				!ownSession && (0, react_jsx_runtime.jsx)(Alternate, {
					study,
					activity,
					setActivity,
					disabled: disabled || running,
					t,
					goal,
					intensityLabel,
					openCheckins,
					scope,
					setScope,
					scopeUnits,
					start
				}),
				!ownSession && (() => {
					const unit = progress && curriculum ? curriculum.units.find((item) => item.id === progress.unitId) : void 0;
					const causes = study.errorProfile.filter((item) => item.subject === subject).slice(0, 3);
					if (unit?.focus === void 0 && causes.length === 0) return null;
					return (0, react_jsx_runtime.jsxs)("section", { children: [
						(0, react_jsx_runtime.jsxs)("h3", { children: [
							t("routineTitle"),
							" · ",
							t(subject)
						] }),
						(0, react_jsx_runtime.jsx)("p", {
							className: "student-muted",
							children: t("routineHelp")
						}),
						unit?.focus !== void 0 && (0, react_jsx_runtime.jsxs)("p", { children: [
							unit.name,
							"：",
							t(focusKeys[unit.focus])
						] }),
						causes.length > 0 && (0, react_jsx_runtime.jsxs)("p", {
							className: "student-muted",
							children: [
								t("topCauses"),
								"：",
								causes.map((item) => `${t(item.type)} ×${item.count}`).join("、")
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: "student-segments",
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: disabled || running,
								onClick: () => {
									tutor(prompts.daily).catch(() => {});
								},
								children: t("printDailySheet")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: disabled || running,
								onClick: () => {
									tutor(prompts.dictation).catch(() => {});
								},
								children: t("dictation")
							})]
						})
					] });
				})(),
				!ownSession && study.understandingReminders.length > 0 && (0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("remindersTitle") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-muted",
						children: t("remindersHint")
					}),
					study.understandingReminders.map((item) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("p", { children: [
						t(reminderKeys[item.code]),
						" · ",
						item.title
					] }), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: disabled || running,
						onClick: () => {
							tutor(feynmanPrompt(item.title)).catch(() => {});
						},
						children: t("feynmanTeach")
					})] }, `${item.code}-${item.objectiveId ?? item.title}`))
				] }),
				!ownSession && study.diagnostic && (0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("diagnosisTitle"),
						" · ",
						t(subject)
					] }),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						study.diagnostic.lastAt !== void 0 ? `${t("diagnosisLast")}: ${day(study.diagnostic.lastAt)} · ${t("nextCheck")}: ${day(study.diagnostic.nextAt)}` : t("diagnosisNever"),
						" · ",
						t("coverage"),
						": ",
						study.diagnostic.coverage.probed,
						" / ",
						study.diagnostic.coverage.total
					] }),
					(0, react_jsx_runtime.jsxs)("p", {
						className: "student-muted",
						children: [t(study.diagnostic.due ? "diagnosisDue" : "diagnosisNotDue"), study.diagnostic.samples[chosenIntensity].length > 0 ? ` · ${t("diagnosisSample")}: ${study.diagnostic.samples[chosenIntensity].map((item) => item.title).join(" · ")}` : ""]
					}),
					(0, react_jsx_runtime.jsxs)("p", {
						className: "student-muted",
						children: [
							t("intensity"),
							": ",
							t(intensityKeys[chosenIntensity]),
							" · ",
							t(intensityHelpKeys[chosenIntensity]),
							" ",
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: openCheckins,
								children: t("chooseIntensity")
							})
						]
					}),
					study.diagnostic.samples[chosenIntensity].length > 0 && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: disabled || running,
						onClick: () => {
							startDiagnosis(subject, chosenIntensity);
						},
						children: t(study.diagnostic.due ? "startDiagnosis" : "repeatDiagnosis")
					}),
					(() => {
						const last = study.checkIns.find((item) => item.subject === subject);
						return last && last.results.length > 0 ? (0, react_jsx_runtime.jsxs)("details", {
							open: !study.diagnostic.due,
							children: [
								(0, react_jsx_runtime.jsxs)("summary", { children: [
									t("diagnosisResults"),
									" · ",
									day(last.startedAt),
									" · ",
									t(intensityKeys[last.intensity])
								] }),
								(0, react_jsx_runtime.jsxs)("p", {
									className: "student-muted",
									children: [
										t("assistIndependent"),
										" ",
										last.counts.independent,
										" · ",
										t("assistHint"),
										" ",
										last.counts.helped,
										" · ",
										t("wrong"),
										" ",
										last.counts.wrong
									]
								}),
								last.results.map((item) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("p", { children: [
									item.title,
									" · ",
									t(item.result),
									" · ",
									t(assistKeys[item.assistance])
								] }), item.objectiveId !== null && (item.result !== "correct" || item.assistance !== "independent") && (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: disabled || running,
									"aria-pressed": selectedObjectiveId === item.objectiveId,
									onClick: () => chooseGoal({
										id: item.objectiveId ?? "",
										subject
									}),
									children: [
										t("chooseGoal"),
										" · ",
										item.title
									]
								})] }, item.id))
							]
						}) : null;
					})()
				] })
			] });
		}
		function levelKey(level) {
			return level === "due" ? "levelDue" : level === "weak" ? "levelWeak" : level === "stalled" ? "levelStalled" : level === "mastered" ? "levelMastered" : level === "practising" ? "levelPractising" : "levelUntouched";
		}
		function goalTitle(study, objectiveId) {
			if (!objectiveId) return void 0;
			return study.curriculum?.objectives.find((item) => item.id === objectiveId)?.title ?? study.objectives.find((item) => item.id === objectiveId)?.title;
		}
		function Alternate({ study, activity, setActivity, disabled, start, goal, intensityLabel, openCheckins, scope, setScope, scopeUnits, t }) {
			const { subject, mode } = activity;
			const confirmed = study.courses.some((item) => item.subject === subject);
			const due = study.dueSubjects.includes(subject);
			const uiMode = mode === "review" || mode === "explore" || mode === "diagnose" ? mode : "sync";
			const alternate = uiMode !== "sync" || goal !== void 0;
			const [open, setOpen] = (0, react.useState)(alternate);
			const [inquiry, setInquiry] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				if (alternate) setOpen(true);
			}, [alternate]);
			const scoped = scope.grade !== void 0 || scope.term !== void 0;
			return (0, react_jsx_runtime.jsxs)("details", {
				className: "student-fold",
				open,
				onToggle: (event) => setOpen(event.currentTarget.open),
				children: [(0, react_jsx_runtime.jsx)("summary", { children: t("otherWays") }), (0, react_jsx_runtime.jsx)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						start(subject, mode, uiMode === "explore" ? inquiry.trim() : void 0);
					},
					children: (0, react_jsx_runtime.jsxs)("fieldset", {
						disabled,
						children: [
							(0, react_jsx_runtime.jsxs)("label", { children: [t("mode"), (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": t("mode"),
								value: uiMode,
								onChange: (event) => {
									const value = event.target.value;
									setActivity({
										subject,
										mode: value === "review" || value === "explore" || value === "diagnose" ? value : confirmed ? "school" : "foundation"
									});
								},
								children: [
									(0, react_jsx_runtime.jsx)("option", {
										value: "sync",
										children: t("sync")
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "review",
										disabled: !due,
										children: t("review")
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "diagnose",
										children: t("diagnose")
									}),
									(0, react_jsx_runtime.jsx)("option", {
										value: "explore",
										children: t("explore")
									})
								]
							})] }),
							(0, react_jsx_runtime.jsx)("p", { children: t(uiMode === "sync" ? "syncHelp" : uiMode === "review" ? "reviewHelp" : uiMode === "diagnose" ? "diagnoseHelp" : "exploreHelp") }),
							uiMode === "explore" && (0, react_jsx_runtime.jsxs)("label", { children: [t("inquiryQuestion"), (0, react_jsx_runtime.jsx)("textarea", {
								"aria-label": t("inquiryQuestion"),
								value: inquiry,
								onChange: (event) => setInquiry(event.target.value),
								maxLength: 2e3,
								placeholder: t("inquiryPlaceholder")
							})] }),
							(uiMode === "sync" || uiMode === "diagnose") && (0, react_jsx_runtime.jsxs)("p", { children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("scopeLabel"), (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": t("scopeLabel"),
								value: scoped ? `${scope.grade ?? study.profile.grade}-${scope.term ?? study.profile.term}` : "current",
								onChange: (event) => {
									const value = event.target.value;
									if (value === "current") {
										setScope({});
										return;
									}
									const [grade, term] = value.split("-");
									setScope({
										grade: Number(grade),
										term
									});
								},
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "current",
									children: t("scopeCurrent")
								}), [
									[1, "first"],
									[1, "second"],
									[2, "first"],
									[2, "second"]
								].filter(([grade, term]) => !(grade === study.profile.grade && term === study.profile.term)).map(([grade, term]) => (0, react_jsx_runtime.jsxs)("option", {
									value: `${grade}-${term}`,
									children: [
										t(grade === 1 ? "gradeOne" : "gradeTwo"),
										" · ",
										t(term)
									]
								}, `${grade}-${term}`))]
							})] }), scoped && (0, react_jsx_runtime.jsxs)("label", { children: [t("scopeUnit"), (0, react_jsx_runtime.jsxs)("select", {
								"aria-label": t("scopeUnit"),
								value: scope.unit ?? "",
								onChange: (event) => {
									const { unit: _unit, ...book } = scope;
									setScope({
										...book,
										...event.target.value ? { unit: event.target.value } : {}
									});
								},
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: t("scopeWholeMap")
								}), scopeUnits.map((unit) => (0, react_jsx_runtime.jsx)("option", {
									value: unit.id,
									children: unit.name
								}, unit.id))]
							})] })] }),
							uiMode === "diagnose" && (0, react_jsx_runtime.jsxs)("p", { children: [
								t("intensity"),
								": ",
								intensityLabel,
								" ",
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: openCheckins,
									children: t("chooseIntensity")
								})
							] }),
							!confirmed && uiMode === "sync" && (0, react_jsx_runtime.jsx)("p", { children: t("unconfirmed") }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "student-primary",
								disabled: uiMode === "review" && !due,
								children: t("start")
							})
						]
					})
				})]
			});
		}
		const phaseOrder = [
			"demo",
			"guide",
			"try",
			"vary"
		];
		const phaseKeys = {
			demo: "phaseDemo",
			guide: "phaseGuide",
			try: "phaseTry",
			vary: "phaseVary"
		};
		function SimonSteps({ phase, t }) {
			const current = phaseOrder.indexOf(phase);
			return (0, react_jsx_runtime.jsx)("ol", {
				className: "student-simon",
				"aria-label": t("simonSteps"),
				children: phaseOrder.map((step, index) => (0, react_jsx_runtime.jsx)("li", {
					className: index < current ? "student-simon-done" : index === current ? "student-simon-current" : void 0,
					"aria-current": index === current ? "step" : void 0,
					children: t(phaseKeys[step])
				}, step))
			});
		}
		function Task({ study, goalTitle: title, goalText, days, disabled, t, act, tutor }) {
			const task = study.task;
			if (!task) return null;
			const hintLabel = task.hintLevel > 0 ? t("hintMore") : t("hint");
			const [checked, setChecked] = (0, react.useState)({});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("h3", { children: task.topic }),
				title && (0, react_jsx_runtime.jsxs)("p", {
					className: "student-muted",
					children: [
						t("learningGoal"),
						": ",
						title
					]
				}),
				goalText && (0, react_jsx_runtime.jsxs)("p", { children: [
					t("objectiveGoal"),
					": ",
					goalText
				] }),
				task.phase && (0, react_jsx_runtime.jsx)(SimonSteps, {
					phase: task.phase,
					t
				}),
				(0, react_jsx_runtime.jsx)(MasteryDots, {
					days,
					t
				}),
				days === 3 && study.feedback?.id === task.id && (0, react_jsx_runtime.jsx)("p", {
					className: "student-result",
					children: t("goalMastered")
				}),
				(0, react_jsx_runtime.jsx)("p", {
					className: "student-question",
					children: task.prompt
				}),
				task.figure && (0, react_jsx_runtime.jsx)(FigureView, {
					figure: task.figure,
					t
				}),
				task.steps && task.steps.length > 0 && (0, react_jsx_runtime.jsx)("ul", {
					className: "student-steps",
					"aria-label": t("microSteps"),
					children: task.steps.map((step, index) => (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("label", {
						className: "student-check",
						children: [(0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: !!checked[index],
							onChange: (event) => setChecked((previous) => ({
								...previous,
								[index]: event.target.checked
							}))
						}), step]
					}) }, `${index}-${step}`))
				}),
				task.response !== void 0 && (0, react_jsx_runtime.jsxs)("p", { children: [
					t("answer"),
					": ",
					task.response
				] }),
				study.feedback ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					(0, react_jsx_runtime.jsx)("p", {
						className: "student-result",
						children: t(study.feedback.result)
					}),
					(0, react_jsx_runtime.jsx)("p", { children: study.feedback.feedback }),
					study.feedback.result === "correct" && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled,
						onClick: () => {
							tutor(feynmanPrompt(title)).catch(() => {});
						},
						children: t("feynmanTeach")
					})
				] }) : task.response !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: t("submitted")
				}) : task.choices ? (0, react_jsx_runtime.jsxs)("fieldset", {
					disabled,
					children: [
						(0, react_jsx_runtime.jsx)("p", { children: t("chooseAnswer") }),
						(0, react_jsx_runtime.jsx)("div", {
							className: "student-choices",
							children: task.choices.map((choice) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									act({
										action: "answer",
										taskId: task.id,
										response: choice
									}, true);
								},
								children: choice
							}, choice))
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								act({
									action: "hint",
									taskId: task.id
								}, true, hintPromptFor(task));
							},
							children: hintLabel
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								act({
									action: "stuck",
									taskId: task.id
								}, true, stuckPrompt);
							},
							children: t("wont")
						})
					]
				}) : (0, react_jsx_runtime.jsx)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						act({
							action: "answer",
							taskId: task.id,
							response: String(new FormData(event.currentTarget).get("answer") ?? "")
						}, true);
					},
					children: (0, react_jsx_runtime.jsxs)("fieldset", {
						disabled,
						children: [
							(0, react_jsx_runtime.jsxs)("label", { children: [t("answer"), (0, react_jsx_runtime.jsx)("input", {
								name: "answer",
								required: true,
								maxLength: 2e3
							})] }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								children: t("submit")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									act({
										action: "hint",
										taskId: task.id
									}, true, hintPromptFor(task));
								},
								children: hintLabel
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									act({
										action: "stuck",
										taskId: task.id
									}, true, stuckPrompt);
								},
								children: t("wont")
							})
						]
					})
				}),
				task.hintLevel > 0 && (0, react_jsx_runtime.jsxs)("p", { children: [
					t("hinted"),
					" · ",
					t("hintLevel"),
					" ",
					task.hintLevel
				] })
			] });
		}
		//#endregion
		//#region lib/types/client/desk.js
		const subjectPreference = "student-desk:subject";
		function storedSubject() {
			try {
				const value = window.localStorage.getItem(subjectPreference);
				return value === "chinese" || value === "english" ? value : "math";
			} catch {
				return "math";
			}
		}
		function storeSubject(value) {
			try {
				window.localStorage.setItem(subjectPreference, value);
			} catch {}
		}
		/** Workbench actions share the same persisted state as the native tutoring tools. */
		function StudyDesk({ sessionId, visible, ask, running, t }) {
			const [subject, setSubject] = (0, react.useState)(storedSubject);
			const [mistakeOffset, setMistakeOffset] = (0, react.useState)(0);
			const [mistakeStatus, setMistakeStatus] = (0, react.useState)("all");
			const [mapGrade, setMapGrade] = (0, react.useState)();
			const [mapTerm, setMapTerm] = (0, react.useState)();
			const [selectedConceptId, setSelectedConceptId] = (0, react.useState)("");
			const [intensities, setIntensities] = (0, react.useState)({});
			const [scopeChoice, setScopeChoice] = (0, react.useState)({});
			const [view, setView] = (0, react.useState)("student");
			const [parentTab, setParentTab] = (0, react.useState)("map");
			const scopeOf = (target) => scopeChoice[target] ?? {};
			const activeScope = scopeOf(subject);
			const showMap = view === "parent" && parentTab === "map";
			const tab = view === "student" ? "today" : parentTab === "map" || parentTab === "ideas" ? "map" : parentTab === "mistakes" ? "mistakes" : "parent";
			const showBook = view === "parent" && (parentTab === "map" || parentTab === "ideas");
			const workspace = useStudy(sessionId, visible, t("networkError"), {
				tab,
				offset: mistakeOffset,
				subject,
				status: mistakeStatus,
				...showBook && mapGrade !== void 0 ? { mapGrade } : {},
				...showBook && mapTerm !== void 0 ? { mapTerm } : {},
				...activeScope.grade !== void 0 ? { diagGrade: activeScope.grade } : {},
				...activeScope.term !== void 0 ? { diagTerm: activeScope.term } : {},
				...activeScope.unit ? { diagUnit: activeScope.unit } : {}
			});
			const { data, busy, change } = workspace;
			const [activity, setActivity] = (0, react.useState)({
				subject: storedSubject(),
				mode: "foundation"
			});
			const [selectedObjectiveId, setSelectedObjectiveId] = (0, react.useState)("");
			const [epoch, setEpoch] = (0, react.useState)(0);
			const [localNow, setLocalNow] = (0, react.useState)(Date.now());
			const [sending, setSending] = (0, react.useState)(false);
			const [sendError, setSendError] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				if (!visible) return;
				const timer = window.setInterval(() => setLocalNow(Date.now()), 1e3);
				return () => window.clearInterval(timer);
			}, [visible, workspace.offset]);
			async function tutor(text = continuePrompt, photo) {
				setSending(true);
				setSendError("");
				try {
					await ask(text.trim() === "" ? continuePrompt : text, photo);
				} catch (reason) {
					setSendError(reason instanceof Error ? reason.message : t("sendError"));
					throw reason;
				} finally {
					setSending(false);
				}
			}
			async function act(command, withTutor = false, prompt = continuePrompt) {
				try {
					await change(command);
					if (withTutor) await tutor(prompt);
				} catch {}
			}
			function selectSubject(item) {
				setSubject(item);
				storeSubject(item);
			}
			const now = Math.max(localNow + workspace.offset.current, data?.serverNow ?? 0);
			const study = data?.study;
			const subjectLoading = !!study && study.confirmedSubject !== subject;
			const disabled = busy || sending;
			const active = study?.active;
			(0, react.useEffect)(() => {
				if (active) {
					selectSubject(active.subject);
					setActivity({
						subject: active.subject,
						mode: active.mode
					});
				}
			}, [active?.id]);
			const curriculum = study?.curriculum ?? null;
			const scopeGrade = curriculum?.scope.grade ?? mapGrade ?? study?.profile.grade ?? 1;
			const scopeTerm = curriculum?.scope.term ?? mapTerm ?? study?.profile.term ?? "first";
			const goals = [...(curriculum && curriculum.scope.current ? curriculum.objectives : []).map((item) => ({
				id: item.id,
				title: item.title
			})), ...(study?.objectives ?? []).map((item) => ({
				id: item.id,
				title: item.title
			}))];
			const planOf = (target) => study?.diagnostics.find((plan) => plan.subject === target);
			const chosenIntensity = (target) => intensities[target] ?? planOf(target)?.recommendedIntensity ?? "standard";
			function resolveMode(target, mode) {
				if (mode === "review" || mode === "explore" || mode === "diagnose") return mode;
				return study?.courses.some((item) => item.subject === target) ? "school" : "foundation";
			}
			function chooseGoal(goal) {
				selectSubject(goal.subject);
				setActivity({
					subject: goal.subject,
					mode: "foundation"
				});
				setSelectedObjectiveId(goal.id);
				setMistakeOffset(0);
				setView("student");
			}
			function scopeCommand(target) {
				const scope = scopeOf(target);
				if (scope.grade === void 0 && scope.term === void 0) return {};
				return { scope: {
					grade: scope.grade ?? study?.profile.grade ?? 2,
					term: scope.term ?? study?.profile.term ?? "first",
					...scope.unit ? { units: [scope.unit] } : {}
				} };
			}
			function startDiagnosis(target, intensity) {
				if (!study) return Promise.resolve();
				const scope = scopeOf(target);
				const scoped = scope.grade !== void 0 || scope.term !== void 0;
				const ids = (scoped ? study.scopedDiagnostic : planOf(target))?.samples[intensity].map((item) => item.id) ?? [];
				selectSubject(target);
				setActivity({
					subject: target,
					mode: "diagnose"
				});
				setSelectedObjectiveId("");
				setMistakeOffset(0);
				setView("student");
				return act({
					action: "start",
					id: crypto.randomUUID(),
					subject: target,
					mode: "diagnose",
					intensity,
					...scoped ? scopeCommand(target) : {}
				}, true, diagnosePrompt(intensity, ids, t));
			}
			function start(target, mode, inquiry) {
				if (mode === "diagnose") return startDiagnosis(target, chosenIntensity(target));
				const next = resolveMode(target, mode);
				const prompt = next === "review" ? reviewPrompt : next === "explore" ? explorePrompt(inquiry) : selectedObjectiveId ? goalPrompt(selectedObjectiveId) : continuePrompt;
				return act({
					action: "start",
					id: crypto.randomUUID(),
					subject: target,
					mode: next,
					...next === "foundation" || next === "school" ? scopeCommand(target) : {}
				}, true, prompt);
			}
			function lessonRequest() {
				const recommendation = study?.recommendation;
				const objectiveId = recommendation?.objectiveId || selectedObjectiveId || void 0;
				const subjectKey = recommendation?.objectiveId ? recommendation.subject : subject;
				const progress = study?.courses.find((item) => item.subject === subjectKey)?.progress;
				return {
					objectiveId,
					unitName: recommendation?.objectiveId ? recommendation.unitName : progress ? curriculum?.units.find((unit) => unit.id === progress.unitId)?.name : void 0,
					subjectLabel: t(subjectKey),
					tags: study?.interests ?? [],
					focus: study?.interestFocus ?? ""
				};
			}
			function startInterest() {
				const recommendation = study?.recommendation;
				if (!recommendation || recommendation.kind === "hold" || !study) return;
				const mode = resolveMode(recommendation.subject, "foundation");
				const request = lessonRequest();
				selectSubject(recommendation.subject);
				setActivity({
					subject: recommendation.subject,
					mode
				});
				setSelectedObjectiveId(recommendation.objectiveId ?? "");
				setMistakeOffset(0);
				const teaching = recommendation.reason.code === "needs-teaching" || recommendation.reason.code === "prerequisite-gap";
				const scene = interestPracticePrompt(request.objectiveId, request.tags, request.focus, request.unitName);
				const prompt = teaching && recommendation.objectiveId ? `${teachPrompt(recommendation.objectiveId)}${scene}` : scene;
				act({
					action: "start",
					id: crypto.randomUUID(),
					subject: recommendation.subject,
					mode
				}, true, prompt);
			}
			function startDue() {
				const items = study?.dueToday ?? [];
				const first = items[0];
				if (!study || !first) return;
				selectSubject(first.subject);
				setActivity({
					subject: first.subject,
					mode: "review"
				});
				setSelectedObjectiveId("");
				setMistakeOffset(0);
				act({
					action: "start",
					id: crypto.randomUUID(),
					subject: first.subject,
					mode: "review"
				}, true, dueClearPrompt(items.map((item) => item.id)));
			}
			function startRecommended() {
				const recommendation = study?.recommendation;
				if (!recommendation || recommendation.kind === "hold" || !study) return;
				if (recommendation.kind === "diagnose") {
					startDiagnosis(recommendation.subject, chosenIntensity(recommendation.subject));
					return;
				}
				const mode = recommendation.kind === "review" ? "review" : resolveMode(recommendation.subject, "foundation");
				selectSubject(recommendation.subject);
				setActivity({
					subject: recommendation.subject,
					mode
				});
				setSelectedObjectiveId(mode === "review" ? "" : recommendation.objectiveId ?? "");
				setMistakeOffset(0);
				const teaching = recommendation.reason.code === "needs-teaching";
				const prompt = recommendation.kind === "review" ? reviewPrompt : teaching && recommendation.objectiveId ? teachPrompt(recommendation.objectiveId) : teaching ? teachQueuePrompt(recommendation.title ?? "") : recommendation.kind === "preview" && recommendation.objectiveId ? previewPrompt(recommendation.objectiveId) : recommendation.objectiveId ? goalPrompt(recommendation.objectiveId) : continuePrompt;
				act({
					action: "start",
					id: crypto.randomUUID(),
					subject: recommendation.subject,
					mode
				}, true, prompt);
			}
			const parentSettings = view === "parent" && parentTab === "parent";
			return (0, react_jsx_runtime.jsxs)("main", {
				className: "student-desk",
				"aria-label": t("title"),
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: "student-top",
						children: [
							(0, react_jsx_runtime.jsxs)("nav", {
								className: "student-views",
								"aria-label": t("title"),
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": view === "student",
									onClick: () => setView("student"),
									children: t("today")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": view === "parent",
									onClick: () => setView("parent"),
									children: t("parentView")
								})]
							}),
							view === "parent" && (0, react_jsx_runtime.jsxs)("nav", {
								className: "student-tabs",
								"aria-label": t("parentView"),
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": parentTab === "map",
										onClick: () => setParentTab("map"),
										children: t("map")
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": parentTab === "ideas",
										onClick: () => setParentTab("ideas"),
										children: t("ideas")
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-label": t("mistakes"),
										"aria-pressed": parentTab === "mistakes",
										onClick: () => setParentTab("mistakes"),
										children: [t("mistakes"), study && study.dueTotal > 0 ? ` · ${study.dueTotal}` : ""]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": parentTab === "parent",
										onClick: () => setParentTab("parent"),
										children: t("parent")
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: "student-toolbar",
								children: [study && !parentSettings && (0, react_jsx_runtime.jsx)("nav", {
									className: "student-subjects",
									"aria-label": t("subject"),
									children: subjects.map((item) => (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": subject === item,
										onClick: () => {
											selectSubject(item);
											setActivity({
												subject: item,
												mode: "foundation"
											});
											setSelectedObjectiveId("");
											setMistakeOffset(0);
											setMistakeStatus("all");
										},
										children: t(item)
									}, item))
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "student-quiet",
									disabled,
									onClick: () => {
										workspace.reload().then(() => setEpoch((value) => value + 1));
									},
									children: t("reload")
								})]
							})
						]
					}),
					workspace.error && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: workspace.error
					}),
					sendError && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: sendError
					}),
					!data ? !workspace.error && (0, react_jsx_runtime.jsx)("progress", { "aria-label": t("busy") }) : !study && view !== "parent" ? (0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsx)("p", { children: t("setupFirst") }), (0, react_jsx_runtime.jsx)("button", {
						onClick: () => {
							setView("parent");
							setParentTab("parent");
						},
						children: t("parent")
					})] }) : subjectLoading && !parentSettings ? (0, react_jsx_runtime.jsx)("progress", { "aria-label": t("busy") }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						study && view === "student" && (0, react_jsx_runtime.jsx)(TodayView, {
							study,
							subject,
							activity,
							setActivity,
							goal: goals.find((item) => item.id === selectedObjectiveId),
							clearGoal: () => setSelectedObjectiveId(""),
							curriculum,
							selectedObjectiveId,
							chooseGoal,
							intensityLabel: `${t(intensityKeys[chosenIntensity(subject)])} · ${planOf(subject)?.samples[chosenIntensity(subject)].length ?? 0}`,
							openParent: () => {
								setView("parent");
								setParentTab("parent");
							},
							openCheckins: () => {
								setView("parent");
								setParentTab("map");
							},
							scope: activeScope,
							setScope: (next) => setScopeChoice((previous) => ({
								...previous,
								[subject]: next
							})),
							scopeUnits: study.scopedUnits ?? [],
							start,
							startRecommended,
							startDiagnosis,
							chosenIntensity: chosenIntensity(subject),
							disabled,
							running,
							act,
							tutor,
							t,
							prompts: {
								daily: dailySheetPrompt(subject),
								dictation: dictationPrompt(subject)
							},
							lessons: lessonsForSubject(data.interactiveLessons?.lessons ?? [], subject),
							onInterestPractice: startInterest,
							onOpenLesson: () => {
								const request = lessonRequest();
								tutor(openmaicGeneratePrompt(request.subjectLabel, request.objectiveId, request.tags, request.focus, request.unitName)).catch(() => {});
							},
							onClearDue: startDue,
							onOpenClassroom: openClassroom
						}),
						study && view === "student" && data.interactiveLessons && (0, react_jsx_runtime.jsx)(LessonsPanel, {
							lessons: lessonsForSubject(data.interactiveLessons.lessons, subject),
							...data.interactiveLessons.error !== void 0 ? { error: data.interactiveLessons.error } : {},
							disabled,
							running,
							t,
							onRetry: (runId) => {
								tutor(openmaicRetryPrompt(runId)).catch(() => {});
							},
							onReview: (classroomId) => {
								tutor(openmaicReviewPrompt(classroomId)).catch(() => {});
							}
						}),
						study && showMap && (0, react_jsx_runtime.jsx)(MapView, {
							study,
							curriculum,
							subject,
							selectedConceptId,
							setSelectedConceptId,
							selectedObjectiveId,
							clearGoal: () => setSelectedObjectiveId(""),
							chooseGoal,
							active: !!active,
							scopeGrade,
							scopeTerm,
							setMapGrade,
							setMapTerm,
							clearBrowse: () => {
								setMapGrade(void 0);
								setMapTerm(void 0);
							},
							intensities,
							setIntensity: (target, level) => setIntensities((previous) => ({
								...previous,
								[target]: level
							})),
							scopeOf,
							setScope: (target, next) => setScopeChoice((previous) => ({
								...previous,
								[target]: next
							})),
							selectSubject,
							startDiagnosis,
							disabled,
							running,
							organize: () => {
								tutor(organizePrompt(subject)).catch(() => {});
							},
							change: (command) => change(command).then(() => void 0),
							t
						}),
						study && view === "parent" && parentTab === "ideas" && (0, react_jsx_runtime.jsx)(IdeasView, {
							study,
							curriculum,
							t,
							onOpenConcept: (id) => {
								setSelectedConceptId(id);
								setParentTab("map");
							}
						}),
						study && view === "parent" && parentTab === "mistakes" && (0, react_jsx_runtime.jsx)(PracticeView, {
							study,
							now,
							subject,
							goals,
							mistakeStatus,
							setMistakeStatus,
							setMistakeOffset,
							revision: data.revision,
							disabled,
							running,
							change,
							ask: tutor,
							onReview: (item) => {
								selectSubject(item);
								setActivity({
									subject: item,
									mode: "review"
								});
								setSelectedObjectiveId("");
								setView("student");
							},
							epoch,
							t
						}),
						parentSettings && (0, react_jsx_runtime.jsx)(ParentSettings, {
							data,
							change,
							t,
							curriculum,
							subject,
							onSubject: (item) => {
								selectSubject(item);
								setActivity({
									subject: item,
									mode: "foundation"
								});
							}
						}, epoch),
						study && parentSettings && (0, react_jsx_runtime.jsx)(Growth, {
							study,
							curriculum,
							subject,
							goals,
							t
						})
					] })
				]
			});
		}
		function Growth({ study, curriculum, subject, goals, t }) {
			const weekly = study.weekly;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				weekly && (0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("weeklyTitle") }),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("weeklyTime"),
						": ",
						weekly.minutesByDay.reduce((sum, item) => sum + item.minutes, 0),
						" ",
						t("minuteUnit"),
						" · ",
						t("weeklyActiveDays"),
						" ",
						weekly.activeDays,
						"/7"
					] }),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("weeklyMastered"),
						" ",
						weekly.masteredGoals,
						" · ",
						t("weeklyPractised"),
						" ",
						weekly.practisedGoals,
						" · ",
						t("weeklyMistakesNew"),
						" ",
						weekly.newMistakes,
						" · ",
						t("weeklyConsolidated"),
						" ",
						weekly.consolidatedMistakes
					] }),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("weeklyDueDone"),
						" ",
						weekly.dueCompletion.done,
						"/",
						weekly.dueCompletion.total,
						weekly.errorCauses.length > 0 ? ` · ${t("weeklyCauses")}: ${weekly.errorCauses.map((cause) => `${t(cause.type)} ×${cause.count}`).join("、")}` : ""
					] })
				] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsxs)("h3", { children: [
					t("stars"),
					": ",
					study.stars
				] }), (0, react_jsx_runtime.jsx)("p", { children: t("starsHelp") })] }),
				curriculum && curriculum.scope.current && (0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("masteryOverview"),
						" · ",
						t(subject)
					] }),
					(0, react_jsx_runtime.jsxs)("p", { children: [
						t("levelMastered"),
						": ",
						curriculum.summary.mastered,
						" · ",
						t("levelPractising"),
						": ",
						curriculum.summary.practising + curriculum.summary.stalled,
						" · ",
						t("levelWeak"),
						": ",
						curriculum.summary.weak + curriculum.summary.due,
						" · ",
						t("levelUntouched"),
						": ",
						curriculum.summary.untouched
					] }),
					curriculum.objectives.filter((item) => item.attempts > 0 || item.activeMistakes > 0).map((item) => (0, react_jsx_runtime.jsxs)("p", { children: [
						item.title,
						" · ",
						t(levelKeys[item.level]),
						" · ",
						t("independent"),
						": ",
						item.independentDays
					] }, item.id))
				] }),
				(0, react_jsx_runtime.jsxs)("section", { children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("evidence") }),
					study.progress.length === 0 && (0, react_jsx_runtime.jsx)("p", { children: t("empty") }),
					study.progress.map((item) => (0, react_jsx_runtime.jsxs)("p", { children: [
						goals.find((goal) => goal.id === item.objectiveId)?.title ?? item.topic,
						" · ",
						t(item.level === "independent-on-three-days" ? "independent" : "practising")
					] }, JSON.stringify([
						item.subject,
						item.topic,
						item.materialId,
						item.objectiveId
					]))),
					study.recentAttempts.map((item) => (0, react_jsx_runtime.jsxs)("details", { children: [
						(0, react_jsx_runtime.jsxs)("summary", { children: [
							item.topic,
							" · ",
							t(item.result)
						] }),
						(0, react_jsx_runtime.jsx)("p", { children: item.prompt }),
						(0, react_jsx_runtime.jsx)("p", { children: item.response }),
						(0, react_jsx_runtime.jsx)("p", { children: item.feedback }),
						(0, react_jsx_runtime.jsx)("p", { children: item.answerEvidence })
					] }, item.id))
				] }),
				(0, react_jsx_runtime.jsx)("p", { children: t("bounded") })
			] });
		}
		//#endregion
		//#region lib/types/client/sidebar.js
		const name = "student";
		const inject = [
			"slots",
			"sessions",
			"uiSession",
			"locale",
			"sidebarRightTabs"
		];
		/** Register the learning desk inside DSH's existing session sidebar. */
		function apply(context) {
			context.effect(() => context.locale.register(NS, {
				zh,
				en
			}), "student: dictionaries");
			const t = context.locale.bind(NS);
			context.effect(() => registerModeTab(context, {
				id: "@winterhuan/dsh-student",
				kind: "student",
				title: () => t("title"),
				guide: [{
					id: "student",
					order: 24,
					title: () => t("title"),
					description: () => t("description"),
					icon: _deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular
				}]
			}), "student: sidebar");
			function Sidebar({ sessionId, useTabInfo, useSession, useSessions, t }) {
				const preset = useSessions((state) => state.byId[sessionId]?.projectionValues?.agentPreset);
				const { tab } = useTabInfo();
				(0, react.useEffect)(() => {
					if (typeof preset === "string" && preset !== "student") tab.actions.close();
				}, [preset, tab.actions]);
				const running = useSession((snapshot) => snapshot.running);
				const ask = (0, react.useMemo)(() => tutorBridge(context, sessionId, t("sessionError"), t("sendError")), [sessionId, t]);
				if (preset !== "student") return null;
				return (0, react_jsx_runtime.jsx)(StudyDesk, {
					sessionId,
					visible: tab.visible,
					running: !!running,
					ask,
					t
				}, sessionId);
			}
			context.slots.inject("sidebar.right.pane.tab", () => context.slots.register({
				name: "sidebar.right.pane.tab",
				key: "@winterhuan/dsh-student",
				locale: NS
			}, Sidebar));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map