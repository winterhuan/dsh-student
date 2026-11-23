/** Receipt-time ownership is support metadata; the agent still authors all academic records. */
import { Service, type Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type WorkspaceRead } from './files/read.ts';
import { nativeOwnerCaptureSchema } from './native-source.ts';
import type { z } from 'zod';
type Snapshot = Pick<z.infer<typeof nativeOwnerCaptureSchema>, 'scope' | 'questionSnapshot' | 'versions'>;
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Host-owned receipt metadata for the registered Student Agents. */
        studentNativeCapture: StudentNativeCapture;
    }
}
/** Host-owned receipt snapshots are released on Agent disposal and Host teardown. */
export declare class StudentNativeCapture extends Service {
    private owners;
    private admissions;
    /** @param ctx - Host lifetime owning receipt metadata. */
    constructor(ctx: Context);
    /** @param agent - Main Agent. @returns Current receipt owner, if available. */
    owner(agent: Agent): Snapshot | undefined;
    /**
     * Cache a complete independent owner publication before later user receipt.
     * @param agent - Owning main native Agent.
     * @param read - Independently read files with observed versions.
     * @returns Frozen owner and question when complete; otherwise removes cached ownership.
     */
    remember(agent: Agent, read: WorkspaceRead): Snapshot | undefined;
    private refresh;
    /**
     * Freeze the cached owner at inbox insertion and recheck it after downstream admission hooks.
     * @param context - Student preset lifetime and native Agent events.
     */
    register(context: Context): void;
}
/** @param context - Student preset registering capture before Agent creation. */
export declare function registerNativeCapture(context: Context): void;
export {};
//# sourceMappingURL=native-capture.d.ts.map