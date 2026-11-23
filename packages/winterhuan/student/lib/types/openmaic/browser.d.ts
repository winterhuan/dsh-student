import { chromium, type BrowserContext } from 'playwright-core';
import type { OpenmaicIdentity } from './connection.ts';
/** Safe account facts provided by the Host connection, without secret values. */
export interface OpenmaicBrowserAccount {
    baseUrl: string;
    identity(signal: AbortSignal): Promise<OpenmaicIdentity>;
}
/** Browser secrets are resolved within Host and never become model parameters. */
export interface OpenmaicBrowserConfig {
    profileRoot: string;
    credentials(): Promise<{
        account: string;
        password: string;
    } | undefined>;
}
/** Browser process factory and clock; production uses installed Chrome. */
export interface OpenmaicBrowserRuntime {
    launch?: (profile: string, options: NonNullable<Parameters<typeof chromium.launchPersistentContext>[1]>) => Promise<BrowserContext>;
    now?: () => number;
}
/** Playback authorization distinguishes open content from a retained parent sign-in window. */
export interface OpenmaicBrowserResult {
    status: 'opened' | 'login-required' | 'identity-mismatch';
    browser: 'dedicated-chrome';
    classroomUrl: string;
    loginUrl?: string;
    reason?: 'credentials-missing' | 'form-unavailable' | 'callback-pending';
}
/** Owns its private browser profile and closes its browser at Host disposal. */
export declare class OpenmaicBrowser {
    private readonly account;
    private readonly config;
    private readonly runtime;
    private context;
    private readonly pages;
    private serial;
    private disposed;
    private readonly lifetime;
    constructor(account: OpenmaicBrowserAccount, config: OpenmaicBrowserConfig, runtime?: OpenmaicBrowserRuntime);
    /**
     * Open the original classroom, renewing its browser login inside 24 hours of expiry.
     * @param classroomId - Original official classroom identity.
     * @param signal - Cancellation for this opening operation.
     * @returns Safe playback or parent-sign-in outcome.
     */
    open(classroomId: string, signal: AbortSignal): Promise<OpenmaicBrowserResult>;
    private browser;
    private learner;
    private perform;
    /** Cancel queued and active operations, close owned Chrome, then await quiescence. */
    dispose(): Promise<void>;
}
//# sourceMappingURL=browser.d.ts.map