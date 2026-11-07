/** Session projection owns domain-mode availability, including blank-session selections. */
import type { Context } from '@deepseek-ai/cordis';
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Read the selected preset from the current Session list, failing closed while unknown.
 * @param context - browser Session services.
 * @param sessionId - Session to inspect.
 * @returns whether this Session uses the domain preset.
 */
export declare function isModeSession(context: Context, sessionId: SessionId | undefined): boolean;
/** Keep the domain guide entry visible only for the on-screen domain Session.
 * The tab body and its persisted store remain registered across Session switches.
 * @param context - browser Session and sidebar services.
 * @param definition - domain tab type with its guide entry.
 * @returns disposer for the subscriptions and current tab registration.
 */
export declare function registerModeTab(context: Context, definition: SidebarRightTabDefinition): () => void;
//# sourceMappingURL=mode.d.ts.map