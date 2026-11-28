import { Context, Service } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import s from '@deepseek-ai/schemastery';
import { type TextbookCommand, type TextbookReply } from './schema.ts';
/** LAN configuration is disabled until an explicit local interface and TLS files are supplied. */
export interface TextbookConfig {
    host: string;
    port: number;
    certFile: string;
    keyFile: string;
    parseTimeoutMs: number;
    pollIntervalMs: number;
}
export declare const textbookConfig: s<TextbookConfig>;
/** One-time pairing information copied from the authenticated Mac UI. */
export interface TextbookPairing {
    version: 1;
    url: string;
    pin: string;
    code: string;
    expiresAt: number;
}
/** Public device information; token hashes and Session identities stay on the Host. */
export interface TextbookDevice {
    id: string;
    name: string;
    createdAt: number;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        studentTextbooks: StudentTextbooks;
    }
}
/** Shared Host service; the LAN listener exposes no general DSH API. */
export declare class StudentTextbooks extends Service {
    private readonly config;
    static inject: string[];
    static Config: s<TextbookConfig>;
    private readonly shutdown;
    private readonly pairings;
    private readonly jobs;
    private readonly operations;
    private server?;
    private certificate?;
    constructor(ctx: Context, config: TextbookConfig);
    [Service.init](): Promise<void>;
    /** Resolve a previously authorized Session and reject moved workspaces. */
    private agent;
    private owner;
    private store;
    private serialize;
    /** Apply a desktop or device command with the same filesystem ownership and validation. */
    command(agent: Agent, input: TextbookCommand): Promise<TextbookReply>;
    /** Receive a photo without making a model request. */
    upload(agent: Agent, input: unknown, bytes: Buffer): Promise<{
        format: 1;
        id: string;
        bookId: string;
        position: number;
        printedPage: string;
        sha256: string;
        mediaType: "image/jpeg" | "image/png" | "image/webp";
        width: number;
        height: number;
        original: string;
        revision: number;
        status: "received" | "queued" | "parsing" | "review" | "confirmed" | "failed";
        updatedAt: number;
        excluded?: boolean | undefined;
        content?: {
            path: string;
            assets: {
                path: string;
                left: number;
                top: number;
                width: number;
                height: number;
            }[];
            issues: string[];
            source: "agent" | "manual";
        } | undefined;
        candidate?: {
            path: string;
            assets: {
                path: string;
                left: number;
                top: number;
                width: number;
                height: number;
            }[];
            issues: string[];
            source: "agent" | "manual";
        } | undefined;
        job?: {
            id: string;
            model: {
                provider: string;
                model: string;
            };
        } | undefined;
        error?: string | undefined;
    }>;
    /** Read only a file referenced by the selected page, never a caller-supplied path. */
    file(agent: Agent, bookId: string, pageId: string, kind: string, index: number, candidate: boolean, revision: number): Promise<{
        bytes: Buffer<ArrayBufferLike>;
        mediaType: "image/jpeg" | "image/png" | "image/webp";
    }>;
    /** Issue a short-lived pairing grant from an authorized desktop Session. */
    pair(agent: Agent): TextbookPairing;
    /** List or revoke devices belonging to the authorized workspace. */
    devices(agent: Agent, revoke?: string): Promise<TextbookDevice[]>;
    private wake;
    private recover;
    private drain;
    private body;
    private authenticate;
    private http;
}
//# sourceMappingURL=service.d.ts.map