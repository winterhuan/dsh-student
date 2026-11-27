/** Compact panel requests keep execution metadata out of visible native messages. */
import { z } from 'zod';
/** JSON metadata belongs to the panel wire face and carries no Host service declarations. */
export type PanelJsonValue = null | boolean | number | string | PanelJsonValue[] | {
    [key: string]: PanelJsonValue;
};
/** Versioned panel envelope, also retained in the original native message source. */
export declare const panelIntentSchema: z.ZodObject<{
    version: z.ZodLiteral<2>;
    nativeSessionId: z.ZodString;
    learnerId: z.ZodOptional<z.ZodString>;
    termId: z.ZodOptional<z.ZodString>;
    blockId: z.ZodOptional<z.ZodString>;
    questionId: z.ZodOptional<z.ZodString>;
    responseId: z.ZodOptional<z.ZodString>;
    selection: z.ZodOptional<z.ZodType<PanelJsonValue, unknown, z.core.$ZodTypeInternals<PanelJsonValue, unknown>>>;
    dailyContext: z.ZodOptional<z.ZodType<PanelJsonValue, unknown, z.core.$ZodTypeInternals<PanelJsonValue, unknown>>>;
    dailyAction: z.ZodOptional<z.ZodType<PanelJsonValue, unknown, z.core.$ZodTypeInternals<PanelJsonValue, unknown>>>;
    nextAction: z.ZodOptional<z.ZodType<PanelJsonValue, unknown, z.core.$ZodTypeInternals<PanelJsonValue, unknown>>>;
    previousActivity: z.ZodOptional<z.ZodType<PanelJsonValue, unknown, z.core.$ZodTypeInternals<PanelJsonValue, unknown>>>;
    continuationAction: z.ZodOptional<z.ZodString>;
    operation: z.ZodOptional<z.ZodType<PanelJsonValue, unknown, z.core.$ZodTypeInternals<PanelJsonValue, unknown>>>;
    courseAction: z.ZodOptional<z.ZodType<PanelJsonValue, unknown, z.core.$ZodTypeInternals<PanelJsonValue, unknown>>>;
    request: z.ZodString;
}, z.core.$strict>;
/** Execution metadata is user intent, never independently verified learning evidence. */
export type PanelIntent = z.infer<typeof panelIntentSchema>;
/** Prefix used only between the panel and its native bridge, never sent as visible text. */
export declare const PANEL_PREFIX = "Student panel v2\n";
/** @param text - Panel transport string. @returns Valid compact intent or undefined for ordinary text. */
export declare function parsePanelIntent(text: string): PanelIntent | undefined;
/** @param intent - Validated panel metadata. @returns Short visible user intent, with the exact answer retained. */
export declare function panelDisplay(intent: PanelIntent): string;
//# sourceMappingURL=panel-intent.d.ts.map