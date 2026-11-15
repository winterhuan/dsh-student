/** DSH filesystem and sandbox-policy adapter; native and shell writes remain outside application CAS. */
import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import type { StudyFiles } from './read.ts';
/**
 * Bind official-file reads and guarded manual writes to the calling execution world.
 * @param exec - current registered agent and cancellation signal.
 * @returns filesystem adapter that preserves DSH containment and write policy.
 */
export declare function applicationStudyFiles(exec: Pick<ToolExecution, 'agent' | 'signal'>): StudyFiles;
//# sourceMappingURL=application.d.ts.map