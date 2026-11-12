/** Typed application-owned manual saves share official validation and current-version CAS. */
import type { FsVersion } from '@deepseek-ai/dsh-fs';
import type { Command } from '../schema.ts';
import { type StudyFiles, type WorkspaceRead } from './read.ts';
import type { TermId, TermSettings, Assessment, WorksheetId, ResponseId, AnswerDate, LearnerResponse } from './schema.ts';
/** Existing handler families retain settings business ownership. */
export type ManualSettingsCommand = Extract<Command, {
    action: 'setup' | 'configure-course' | 'school-progress' | 'interests' | 'openmaic-settings';
}>;
/** Profile saves select edited fields; every other settings command retains its existing record ownership. */
export type ManualSettingsIntent = {
    kind: 'settings';
    command: Extract<ManualSettingsCommand, {
        action: 'setup';
    }>;
    editedProfileFields: readonly (keyof TermSettings['profile'])[];
} | {
    kind: 'settings';
    command: Exclude<ManualSettingsCommand, {
        action: 'setup';
    }>;
    editedProfileFields?: never;
};
/** A manual command's edited fields and their original values. */
export type ManualBaseline = Record<string, unknown>;
/** Manual paper corrections preserve the original response and its actual date. */
export interface ManualWorksheetIntent {
    kind: 'worksheet-assessments';
    worksheetId: WorksheetId;
    assessments: Assessment[];
    answerDate?: Exclude<AnswerDate, {
        kind: 'instant';
    }>;
    responseUpdates?: {
        responseId: ResponseId;
        assistance?: LearnerResponse['assistance'];
        answerDate?: Exclude<AnswerDate, {
            kind: 'instant';
        }>;
        userConfirmation: string;
    }[];
}
/** Manual request captures term identity, actual observed versions and edited-field values. */
export interface ManualSaveRequest {
    termId: TermId;
    expectedVersions: {
        path: string;
        version: FsVersion;
    }[];
    baseline: ManualBaseline;
    intent: ManualSettingsIntent | ManualWorksheetIntent;
}
/** Outcomes keep current edited values available for retained-draft conflicts. */
export interface ManualSaveResult {
    status: 'saved' | 'unchanged' | 'conflict' | 'invalid' | 'old-term' | 'unknown';
    current: ManualBaseline;
    read: WorkspaceRead;
    reason?: string;
}
/**
 * Capture exactly the fields a typed manual intent edits.
 * @param read - current valid relevant owner.
 * @param intent - intended settings save or worksheet corrections.
 * @returns edited field values suitable for the draft baseline and conflict display.
 */
export declare function manualFields(read: WorkspaceRead, intent: ManualSaveRequest['intent']): ManualBaseline;
/**
 * Save a manual draft after checking edited-field baselines, term and every related actual file version.
 * Unrelated version changes may rebase; a relevant change returns current values and preserves the caller's draft.
 * @param fs - DSH-backed adapter with guarded write capability.
 * @param request - typed intent with original edited fields and observed versions.
 * @param now - current application clock.
 * @param signal - cancellation signal.
 * @returns saved, unchanged or explicit conflict/invalid/unknown result with independently reread files.
 */
export declare function saveManual(fs: StudyFiles, request: ManualSaveRequest, now: number, signal: AbortSignal): Promise<ManualSaveResult>;
//# sourceMappingURL=manual.d.ts.map