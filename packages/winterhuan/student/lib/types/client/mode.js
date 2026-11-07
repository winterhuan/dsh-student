/** Read the selected preset from the current Session list, failing closed while unknown.
 * @param context - browser Session services.
 * @param sessionId - Session to inspect.
 * @returns whether this Session uses the domain preset.
 */
export function isModeSession(context, sessionId) {
    return sessionId !== undefined && context.sessions.list.getSnapshot().byId[sessionId]?.projectionValues?.agentPreset === 'student';
}
/** Keep the domain guide entry visible only for the on-screen domain Session.
 * The tab body and its persisted store remain registered across Session switches.
 * @param context - browser Session and sidebar services.
 * @param definition - domain tab type with its guide entry.
 * @returns disposer for the subscriptions and current tab registration.
 */
export function registerModeTab(context, definition) {
    const current = context.uiSession.adapter.current;
    let visible;
    let release;
    const sync = () => {
        const next = isModeSession(context, current.getSnapshot().key);
        if (next === visible)
            return;
        visible = next;
        release?.();
        release = context.sidebarRightTabs.register({ ...definition, guide: next ? definition.guide ?? [] : [] });
    };
    const stopCurrent = current.subscribe(sync);
    const stopSessions = context.sessions.list.subscribe(sync);
    sync();
    return () => { stopCurrent(); stopSessions(); release?.(); };
}
//# sourceMappingURL=mode.js.map