/** Discover official teaching aids beside the reply, using their original keyed views. */
import type { Context } from '@deepseek-ai/cordis';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
type Props = PropsRuntime<'conversation.chat.turnTail'> & PropsLocale<typeof NS>;
/**
 * Find a Turn's official teaching results and link to their original views.
 * @param props - native Session hooks, Turn identity and original tool dispatch.
 * @returns no contribution for other presets or Turns without teaching aids.
 */
export declare function TeachingAids({ turn, useSessions, sessionId, useChat, t }: Props): import("react/jsx-runtime").JSX.Element | null;
/**
 * Register discovery in the existing completed-reply surface.
 * @param context - native conversation and slot services.
 */
export declare function registerTeachingAids(context: Context): void;
export {};
//# sourceMappingURL=teaching-aids.d.ts.map