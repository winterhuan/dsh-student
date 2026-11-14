import type { Context } from '@deepseek-ai/cordis';
import type { Dashboard } from '../dashboard.ts';
import type { Command } from '../schema.ts';
import type { ManualSaveRequest } from '../files/manual.ts';
import type { StudentJsonValue, StudentManualReply, StudentSessionId, StudentSubmissionRequest } from '../types.ts';
import type { Translate } from './locales.ts';
/**
 * Bind Gateway operations in the registration world and expose plain feature callbacks.
 * @param remote - mounted Student manual-save and submission-inspection operations.
 * @returns callbacks preserving original draft baselines and separate file outcomes.
 */
export declare function createStudentManualActions(remote: Pick<Context['remote']['student'], 'manualContext' | 'saveManual' | 'inspectSubmission'>): {
    saveSettings: (sessionId: StudentSessionId, command: Command, data: Dashboard, termId: string, original: string | undefined, t: Translate) => Promise<Dashboard & {
        manual?: StudentManualReply;
    }>;
    saveWorksheet: (sessionId: StudentSessionId, intent: ManualSaveRequest["intent"], baseline: Record<string, StudentJsonValue>, termId: string, t: Translate) => Promise<StudentManualReply>;
    inspectSubmission: (sessionId: StudentSessionId, request: StudentSubmissionRequest) => Promise<import("../types.ts").StudentSubmissionInspection>;
};
export type StudentManualActions = ReturnType<typeof createStudentManualActions>;
//# sourceMappingURL=manual-actions.d.ts.map