/** Host configuration carries credential references rather than secret values. */
export interface OpenmaicConnectionConfig {
    baseUrl: string;
    accountBaseUrl: string;
    accountRef: string;
    passwordRef: string;
    accessCodeRef: string;
    tokenRef: string;
    accountId: string;
    requestTimeoutMs?: number;
    operationTimeoutMs?: number;
}
/** Private storage implemented by the DSH credential provider. */
export interface OpenmaicSecretStore {
    resolve(ref: string): Promise<string | undefined>;
    load(): Promise<unknown>;
    save(value: unknown): Promise<void>;
}
/** External wire and clock dependencies; production uses Node fetch and RSA-OAEP. */
export interface OpenmaicNetwork {
    fetch?: typeof fetch;
    now?: () => number;
    encryptPassword?: (password: string, key: string) => Promise<string>;
}
/** Credential failures expose only actionable codes, never server messages or secret payloads. */
export declare class OpenmaicError extends Error {
    readonly code: 'login-required' | 'login-challenge' | 'identity-changed' | 'permission-denied' | 'not-found' | 'service-unavailable' | 'invalid-response' | 'unsafe-origin' | 'generation-unknown' | 'browser-unavailable' | 'operation-timeout' | 'operation-canceled' | 'response-too-large' | 'incomplete-read' | 'read-limit' | 'unsupported-version';
    readonly status?: number | undefined;
    constructor(code: 'login-required' | 'login-challenge' | 'identity-changed' | 'permission-denied' | 'not-found' | 'service-unavailable' | 'invalid-response' | 'unsafe-origin' | 'generation-unknown' | 'browser-unavailable' | 'operation-timeout' | 'operation-canceled' | 'response-too-large' | 'incomplete-read' | 'read-limit' | 'unsupported-version', status?: number | undefined);
}
/**
 * Bound local waiting without reporting that the remote job was canceled.
 * @param signal - Caller cancellation; its arbitrary reason is never exposed.
 * @param timeoutMs - Total operation deadline in milliseconds.
 * @param operation - Work receiving the combined cancellation signal.
 * @returns The operation result, or a sanitized cancellation/deadline failure.
 */
export declare function boundedOpenmaicOperation<T>(signal: AbortSignal, timeoutMs: number, operation: (signal: AbortSignal) => Promise<T>): Promise<T>;
/** Safe public account identity; no access code, password or token crosses this view. */
export interface OpenmaicIdentity {
    baseUrl: string;
    accountId: string;
    learnerKey: string;
    expiresAt: number;
}
/** Same-account login renewal is serialized and replacement follows learner verification. */
export declare class OpenmaicConnection {
    private readonly config;
    private readonly store;
    private readonly network;
    /** Normalized official classroom origin used by tools and safe links. */
    readonly baseUrl: string;
    /** Total local wait limit shared by authorization, generation and continuation. */
    readonly operationTimeoutMs: number;
    private readonly accountBaseUrl;
    private readonly external;
    private readonly now;
    private renewal;
    private loaded?;
    private accessCookie;
    constructor(config: OpenmaicConnectionConfig, store: OpenmaicSecretStore, network?: OpenmaicNetwork);
    private wire;
    private body;
    private account;
    private learner;
    private expires;
    private renew;
    private auth;
    /**
     * Read safe current account facts after renewal when less than 24 hours remain.
     * @param signal - Cancellation for authorized account operations.
     * @returns Verified account identity without secret values.
     */
    identity(signal: AbortSignal): Promise<OpenmaicIdentity>;
    /**
     * Read authorized persistence JSON without login loops for permission or not-found refusals.
     * @param path - Same-origin persistence API path without a query or fragment.
     * @param signal - Cancellation for this source read.
     * @returns Original official source JSON without evaluating learning results.
     */
    read(path: string, signal: AbortSignal): Promise<unknown>;
    /**
     * Request the same-origin service; safe reads retry a 401 once, submissions never replay.
     * @param path - Official service path or same-origin URL.
     * @param init - Non-secret request payload and options; Host adds authorization.
     * @param signal - Cancellation for this request and renewal.
     * @returns Official response JSON.
     */
    request(path: string, init: RequestInit, signal: AbortSignal): Promise<unknown>;
    private performRequest;
    /**
     * Verify the separate generation access code without exposing its value to a tool.
     * @param signal - Cancellation for access verification.
     */
    prepareGeneration(signal: AbortSignal): Promise<void>;
    private verifyAccess;
    /**
     * Build an official browser sign-in recovery URL, separate from Host renewal.
     * @param classroomId - Original classroom identity to resume after sign-in.
     * @returns A safe parent-sign-in URL with no token.
     */
    browserHandoff(classroomId: string): {
        url: string;
        automatic: false;
    };
}
//# sourceMappingURL=connection.d.ts.map