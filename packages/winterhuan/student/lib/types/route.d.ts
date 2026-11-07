import type { Context } from '@deepseek-ai/cordis';
import type { IncomingMessage, ServerResponse } from 'node:http';
/** Browser requests must address the local DSH host and originate from the same authority. */
export declare function trustedStudyRequest(request: Pick<IncomingMessage, 'headers'>): boolean;
/** The UI can submit learner actions and the parent's marks on a printed sheet; tutor assessment and rewards stay with the model tools. */
export declare function handleStudyRequest(context: Context, request: IncomingMessage, response: ServerResponse): Promise<void>;
/** Optional web integration leaves the same plugin usable in terminal sessions. */
export declare function registerStudyRoute(context: Context): void;
//# sourceMappingURL=route.d.ts.map