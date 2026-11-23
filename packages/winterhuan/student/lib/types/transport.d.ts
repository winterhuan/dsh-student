/** Authorized Host reads pair original native/official sources with shared formal-file validation. */
import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import type { Context } from '@deepseek-ai/cordis';
import { type WorkspaceRead } from './files/read.ts';
import { type NativeSourceContext } from './native-source.ts';
import { consumeOpenmaicFeedback } from './openmaic/feedback-consumer.ts';
import type { OpenmaicSourceVerification } from './openmaic/feedback-schema.ts';
import type { OpenmaicFeedbackRead } from './openmaic/feedback.ts';
import type { FileIssue } from './files/validation.ts';
/** One independent source read and its saved-file consumption outcome. */
export interface StudentOfficialFeedback extends Omit<OpenmaicSourceVerification, 'consumption'> {
    consumption?: ReturnType<typeof consumeOpenmaicFeedback>;
    source?: OpenmaicFeedbackRead;
}
/** Independently observed native cuts, exact validated files and bounded official feedback availability. */
export interface StudentWorkspaceRead {
    read: WorkspaceRead;
    native: NativeSourceContext;
    backupIssues: FileIssue[];
    openmaic: StudentOfficialFeedback[];
}
/**
 * Read original sources with independent workspace/Remote authorization and consume the same formal files.
 * @param exec - Registered main execution Agent and caller cancellation.
 * @param invocation - Current Remote context for original-history access checks; native tool calls use their Agent context.
 * @param lessonId - Explicit classroom selection takes priority within the eight-source read budget.
 * @returns Validated facts and explicit per-source availability; releases every Session lease and never writes academic records.
 */
export declare function readStudentWorkspace(exec: Pick<ToolExecution, 'agent' | 'signal'>, invocation?: Context, lessonId?: string): Promise<StudentWorkspaceRead>;
//# sourceMappingURL=transport.d.ts.map