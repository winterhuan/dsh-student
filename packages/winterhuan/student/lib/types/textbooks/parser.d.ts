import type { Context } from '@deepseek-ai/cordis';
import { type TextbookPage } from './schema.ts';
import type { TextbookStore } from './store.ts';
/** Parse a durable queued page through a real native Agent and preserve its Session log.
 * @param ctx - owning Student Host with the native Agent factory and attachments.
 * @param store - original authorized workspace.
 * @param page - currently claimed page and captured model route.
 * @param timeoutMs - maximum wall time before stopping this page's Agent.
 * @param signal - service disposal cancellation.
 */
export declare function parseTextbookPage(ctx: Context, store: TextbookStore, page: TextbookPage, timeoutMs: number, signal: AbortSignal): Promise<void>;
//# sourceMappingURL=parser.d.ts.map