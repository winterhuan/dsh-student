import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Browser image payload follows DSH's native attachment admission path. */
export interface StudyPhoto {
    mediaType: 'image/png' | 'image/jpeg' | 'image/webp';
    data: string;
    preview: string;
    name: string;
}
export type AskTutor = (text: string, photo?: StudyPhoto) => Promise<void>;
/** Register the native submission echo without changing the user's composer draft. */
export declare function tutorBridge(context: Context, sessionId: SessionId, unavailable: string, failed: string): AskTutor;
//# sourceMappingURL=bridge.d.ts.map