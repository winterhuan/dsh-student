import { Context, Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { OpenmaicConnection, type OpenmaicConnectionConfig } from './connection.ts';
import { OpenmaicBrowser } from './browser.ts';
import { OpenmaicFeedback } from './feedback.ts';
import { CourseReviewer } from './review.ts';
import { OpenmaicGeneration } from './generation.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        studentOpenmaic: StudentOpenmaic;
    }
}
/** Host account settings name credential references; secret values stay in credentials-local. */
export interface StudentOpenmaicConfig extends OpenmaicConnectionConfig {
    browserProfileRoot: string;
}
/** Host defaults for the official service, credential references and private browser root. */
export declare const openmaicConfig: z<StudentOpenmaicConfig>;
/** Installed once at Host scope, shared by every Student agent. */
export declare class StudentOpenmaic extends Service {
    static inject: string[];
    static Config: z<StudentOpenmaicConfig>;
    /** Verified account transport shared across Student conversations. */
    readonly connection: OpenmaicConnection;
    /** Dedicated Chrome profile and process owned by this service. */
    readonly browser: OpenmaicBrowser;
    /** Protected content review receipts; academic quality remains agent-authored. */
    readonly reviewer: CourseReviewer;
    private readonly feedbackReaders;
    private readonly generations;
    constructor(ctx: Context, config: StudentOpenmaicConfig);
    /**
     * Read original authorized feedback with protected capture ownership shared across children.
     * @param workspace - Authorized original workspace used to verify its generation job.
     * @returns Read-only source transport; academic writes remain native agent operations.
     */
    feedback(workspace: string): OpenmaicFeedback;
    /**
     * Recover jobs within their original workspace, learner, term and learning block.
     * @param workspace - Original Student workspace path from the authorized agent.
     * @returns Workspace-scoped official job transport.
     */
    generation(workspace: string): OpenmaicGeneration;
}
//# sourceMappingURL=service.d.ts.map