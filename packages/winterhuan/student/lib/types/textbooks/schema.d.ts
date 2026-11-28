/** Validated textbook files and commands shared by the desktop and phone. */
import { z } from 'zod';
export declare const textbookId: z.ZodString;
export declare const modelSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strict>;
export declare const assetSchema: z.ZodObject<{
    path: z.ZodString;
    left: z.ZodNumber;
    top: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
}, z.core.$strict>;
export declare const contentSchema: z.ZodObject<{
    path: z.ZodString;
    assets: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        left: z.ZodNumber;
        top: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strict>>;
    issues: z.ZodArray<z.ZodString>;
    source: z.ZodEnum<{
        agent: "agent";
        manual: "manual";
    }>;
}, z.core.$strict>;
export declare const bookSchema: z.ZodObject<{
    format: z.ZodLiteral<1>;
    id: z.ZodString;
    title: z.ZodString;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
        other: "other";
    }>;
    expectedPages: z.ZodNullable<z.ZodNumber>;
    revision: z.ZodNumber;
    confirmedAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const pageSchema: z.ZodObject<{
    format: z.ZodLiteral<1>;
    id: z.ZodString;
    bookId: z.ZodString;
    position: z.ZodNumber;
    printedPage: z.ZodString;
    sha256: z.ZodString;
    mediaType: z.ZodEnum<{
        "image/jpeg": "image/jpeg";
        "image/png": "image/png";
        "image/webp": "image/webp";
    }>;
    width: z.ZodNumber;
    height: z.ZodNumber;
    original: z.ZodString;
    revision: z.ZodNumber;
    status: z.ZodEnum<{
        received: "received";
        queued: "queued";
        parsing: "parsing";
        review: "review";
        confirmed: "confirmed";
        failed: "failed";
    }>;
    updatedAt: z.ZodNumber;
    excluded: z.ZodOptional<z.ZodBoolean>;
    content: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        assets: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            left: z.ZodNumber;
            top: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>>;
        issues: z.ZodArray<z.ZodString>;
        source: z.ZodEnum<{
            agent: "agent";
            manual: "manual";
        }>;
    }, z.core.$strict>>;
    candidate: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        assets: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            left: z.ZodNumber;
            top: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>>;
        issues: z.ZodArray<z.ZodString>;
        source: z.ZodEnum<{
            agent: "agent";
            manual: "manual";
        }>;
    }, z.core.$strict>>;
    job: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        model: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** Persistent book identity; importing it never confirms a school curriculum. */
export type Textbook = z.infer<typeof bookSchema>;
/** Page state is committed only after its immutable files exist. */
export type TextbookPage = z.infer<typeof pageSchema>;
/** One immutable Markdown revision and the pictures it references. */
export type TextbookContent = z.infer<typeof contentSchema>;
/** Model route captured from an authorized desktop Session. */
export type TextbookModel = z.infer<typeof modelSchema>;
export declare const textbookCommand: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"create">;
    id: z.ZodString;
    title: z.ZodString;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
        other: "other";
    }>;
    expectedPages: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"book">;
    bookId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"configure">;
    bookId: z.ZodString;
    revision: z.ZodNumber;
    title: z.ZodString;
    expectedPages: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"page">;
    bookId: z.ZodString;
    pageId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"queue">;
    bookId: z.ZodString;
    pageId: z.ZodString;
    revision: z.ZodNumber;
    requestId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"exclude">;
    bookId: z.ZodString;
    pageId: z.ZodString;
    revision: z.ZodNumber;
    excluded: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"edit">;
    bookId: z.ZodString;
    pageId: z.ZodString;
    revision: z.ZodNumber;
    markdown: z.ZodString;
    printedPage: z.ZodString;
    position: z.ZodNumber;
    confirm: z.ZodBoolean;
    useCandidate: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"complete">;
    bookId: z.ZodString;
    revision: z.ZodNumber;
}, z.core.$strict>], "action">;
/** Bounded wire command; upload carries a binary body on a separate route. */
export type TextbookCommand = z.infer<typeof textbookCommand>;
export declare const uploadSchema: z.ZodObject<{
    bookId: z.ZodString;
    pageId: z.ZodString;
    position: z.ZodCoercedNumber<unknown>;
    printedPage: z.ZodString;
}, z.core.$strict>;
/** Upload identity is stable across retries and independent of printed page numbering. */
export type TextbookUpload = z.infer<typeof uploadSchema>;
/** Same response format for the authenticated desktop and scoped mobile transport. */
export interface TextbookReply {
    workspaceId?: string;
    books?: Textbook[];
    book?: Textbook;
    pages?: TextbookPage[];
    page?: TextbookPage;
    markdown?: string;
    candidateMarkdown?: string;
}
/** Expected failures safe to show without leaking filesystem or provider credentials. */
export declare class TextbookError extends Error {
    readonly code: 'invalid' | 'missing' | 'conflict' | 'unauthorized' | 'unavailable';
    constructor(code: 'invalid' | 'missing' | 'conflict' | 'unauthorized' | 'unavailable', message: string);
}
//# sourceMappingURL=schema.d.ts.map