import { type OfficialFile, type TermSettings, type LearningBlock, type WorksheetFile, type CollectionsFile } from './schema.ts';
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
    blocks: LearningBlock[];
    worksheets: WorksheetFile[];
    collections?: CollectionsFile;
    nativeSources?: readonly NativeInputObservation[];
}
/** Host-resolved consumed input version; official-file declarations alone cannot supply this observation. */
export interface NativeInputObservation {
    sessionId: string;
    messageId: string;
    inputVersion: string;
    rawResponse: string;
    receiptAt: number;
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
 * @returns bounded issues and independently valid workspace entities.
 */
export declare function validateStudyFiles(input: readonly ParsedFile[], prior?: readonly {
    path: string;
    file: OfficialFile;
}[], nativeSources?: readonly NativeInputObservation[]): ValidationResult;
//# sourceMappingURL=validation.d.ts.map