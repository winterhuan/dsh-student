import type { Context } from '@deepseek-ai/cordis';
import type { StudentSessionId } from '../types.ts';
export declare const name = "student";
export declare const inject: string[];
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'student.desk': {
            kind: 'single';
            scope: 'root';
            owner: {
                sessionId: StudentSessionId;
                visible: boolean;
                running: boolean;
                pending: boolean;
            };
        };
    }
}
/** Register the learning desk inside DSH's existing session sidebar. */
export declare function apply(context: Context): Promise<void>;
//# sourceMappingURL=sidebar.d.ts.map