/** Compact panel requests keep execution metadata out of visible native messages. */
import { z } from 'zod';
const json = z.json();
/** Versioned panel envelope, also retained in the original native message source. */
export const panelIntentSchema = z.object({
    version: z.literal(2), nativeSessionId: z.string().min(1),
    learnerId: z.string().min(1).optional(), termId: z.string().min(1).optional(),
    blockId: z.string().min(1).optional(), questionId: z.string().min(1).optional(), responseId: z.string().min(1).optional(),
    selection: json.optional(), dailyContext: json.optional(), dailyAction: json.optional(),
    nextAction: json.optional(), previousActivity: json.optional(),
    continuationAction: z.string().optional(), operation: json.optional(),
    courseAction: json.optional(), request: z.string().min(1).max(8000),
}).strict();
/** Prefix used only between the panel and its native bridge, never sent as visible text. */
export const PANEL_PREFIX = 'Student panel v2\n';
/** @param text - Panel transport string. @returns Valid compact intent or undefined for ordinary text. */
export function parsePanelIntent(text) {
    if (!text.startsWith(PANEL_PREFIX))
        return undefined;
    return panelIntentSchema.parse(JSON.parse(text.slice(PANEL_PREFIX.length)));
}
/** @param intent - Validated panel metadata. @returns Short visible user intent, with the exact answer retained. */
export function panelDisplay(intent) {
    const op = z.object({ action: z.string(), response: z.string().optional() }).safeParse(intent.operation);
    if (op.success && op.data.action === 'answer' && op.data.response)
        return op.data.response;
    const course = z.object({ action: z.string() }).safeParse(intent.courseAction);
    if (course.success)
        return course.data.action === 'setup' ? '整理单元课程' : course.data.action === 'foundation' ? '先学基础目标课' : course.data.action === 'synthesis' ? '准备单元综合课' : course.data.action === 'mini' || course.data.action === 'temporary' ? '开始小课' : '开始互动课';
    const daily = z.object({ action: z.string() }).safeParse(intent.dailyAction);
    const action = daily.success ? daily.data.action : op.success ? op.data.action : intent.continuationAction;
    return action === 'pause' ? '暂停学习' : action === 'stop' ? '结束本次学习' : action === 'start' || action === 'extra' ? '开始互动课' : action === 'hint' || action === 'stuck' ? '请帮我讲解' : '继续学习';
}
//# sourceMappingURL=panel-intent.js.map