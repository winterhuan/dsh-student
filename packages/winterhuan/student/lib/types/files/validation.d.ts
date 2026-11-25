import type { OpenmaicInputObservation } from '../openmaic/feedback-schema.ts';
import { type OfficialFile, type TermSettings, type LearningBlock, type WorksheetFile, type CollectionsFile, type DailyPlan } from './schema.ts';
/** Bounded, actionable durable-file failure. */
export interface FileIssue {
    path: string;
    field: string;
    rule: string;
    correction: string;
}
/** Parsed bytes supplied by a filesystem reader or a proposed manual edit. */
export interface ParsedFile {
    path: string;
    value: unknown;
}
/** The relevant valid business entities; no second persisted evidence authority. */
export interface ValidatedWorkspace {
    settings: TermSettings;
    plans?: DailyPlan[];
    blocks: LearningBlock[];
    worksheets: WorksheetFile[];
    collections?: CollectionsFile;
    nativeSources?: readonly NativeInputObservation[];
    openmaicSources?: readonly OpenmaicInputObservation[];
    archivedEvidence?: {
        workspace: ValidatedWorkspace;
        references: NonNullable<TermSettings['evidenceReferences']>;
    }[];
}
/** Host-resolved consumed input version; official-file declarations alone cannot supply this observation. */
export interface NativeInputObservation {
    sessionId: string;
    messageId: string;
    inputVersion: string;
    rawResponse: string;
    receiptAt: number;
    learningScope?: {
        learnerId: string;
        termId: string;
        blockId: string;
        questionId: string;
        responseId?: string;
    };
    questionSnapshot?: string;
}
/** Validation outcome retains independently valid parsed files when related data fails. */
export interface ValidationResult {
    valid: boolean;
    issues: FileIssue[];
    files: {
        path: string;
        file: OfficialFile;
    }[];
    workspace?: ValidatedWorkspace;
}
/**
 * Validate parsed official files and available previously validated versions.
 * @param input - discovered current files with exact workspace-relative paths.
 * @param prior - preserved valid file versions for used-content comparison.
 * @param nativeSources - matching consumed input versions resolved from native Session records.
 * @param openmaicSources - independently authorized original official submissions and grading.
 * @returns bounded issues and independently valid workspace entities.
 */
export declare function validateStudyFiles(input: readonly ParsedFile[], prior?: readonly {
    path: string;
    file: OfficialFile;
}[], nativeSources?: readonly NativeInputObservation[], openmaicSources?: readonly OpenmaicInputObservation[]): ValidationResult;
//# sourceMappingURL=validation.d.ts.map