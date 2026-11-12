import type { Context } from '@deepseek-ai/cordis';
import type { StudentTransportConfig } from './types.ts';
import type z from '@deepseek-ai/schemastery';
export * from './remote-service.ts';
export type * from './types.ts';
/** Independent student plugin identity. */
export declare const name = "student";
/** Host services mount independently from the optional browser client. */
export declare const inject: never[];
/** Validated Host refresh interval and serialized response cap. */
export declare const Config: z<StudentTransportConfig>;
/** Register Student reads, manual saves and backup retention for the Host lifetime. */
export declare function apply(context: Context, config: StudentTransportConfig): void;
//# sourceMappingURL=index.d.ts.map