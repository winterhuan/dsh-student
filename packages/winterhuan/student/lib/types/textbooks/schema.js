/** Validated textbook files and commands shared by the desktop and phone. */
import { z } from 'zod';
export const textbookId = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const revision = z.number().int().min(0);
const label = z.string().trim().min(1).max(200);
export const modelSchema = z.object({ provider: label, model: label }).strict();
export const assetSchema = z.object({ path: z.string().max(300), left: z.number().int().min(0), top: z.number().int().min(0), width: z.number().int().positive(), height: z.number().int().positive() }).strict();
export const contentSchema = z.object({ path: z.string().max(300), assets: z.array(assetSchema).max(40), issues: z.array(z.string().max(1000)).max(100), source: z.enum(['agent', 'manual']) }).strict();
export const bookSchema = z.object({ format: z.literal(1), id: textbookId, title: label, subject: z.enum(['chinese', 'math', 'english', 'other']), expectedPages: z.number().int().min(1).max(2000).nullable(), revision, confirmedAt: z.number().optional() }).strict();
export const pageSchema = z.object({
    format: z.literal(1), id: textbookId, bookId: textbookId, position: z.number().int().min(1).max(2000), printedPage: z.string().max(40),
    sha256: z.string().regex(/^[a-f0-9]{64}$/u), mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']), width: z.number().int().positive(), height: z.number().int().positive(), original: z.string().max(300),
    revision, status: z.enum(['received', 'queued', 'parsing', 'review', 'confirmed', 'failed']), updatedAt: z.number(), excluded: z.boolean().optional(),
    content: contentSchema.optional(), candidate: contentSchema.optional(),
    job: z.object({ id: textbookId, model: modelSchema }).strict().optional(), error: z.string().max(1000).optional(),
}).strict();
export const textbookCommand = z.discriminatedUnion('action', [
    z.object({ action: z.literal('list') }).strict(),
    z.object({ action: z.literal('create'), id: textbookId, title: label, subject: bookSchema.shape.subject, expectedPages: bookSchema.shape.expectedPages }).strict(),
    z.object({ action: z.literal('book'), bookId: textbookId }).strict(),
    z.object({ action: z.literal('configure'), bookId: textbookId, revision, title: label, expectedPages: bookSchema.shape.expectedPages }).strict(),
    z.object({ action: z.literal('page'), bookId: textbookId, pageId: textbookId }).strict(),
    z.object({ action: z.literal('queue'), bookId: textbookId, pageId: textbookId, revision, requestId: textbookId.optional() }).strict(),
    z.object({ action: z.literal('exclude'), bookId: textbookId, pageId: textbookId, revision, excluded: z.boolean() }).strict(),
    z.object({ action: z.literal('edit'), bookId: textbookId, pageId: textbookId, revision, markdown: z.string().min(1).max(262144), printedPage: z.string().max(40), position: z.number().int().min(1).max(2000), confirm: z.boolean(), useCandidate: z.boolean() }).strict(),
    z.object({ action: z.literal('complete'), bookId: textbookId, revision }).strict(),
]);
export const uploadSchema = z.object({ bookId: textbookId, pageId: textbookId, position: z.coerce.number().int().min(1).max(2000), printedPage: z.string().max(40) }).strict();
/** Expected failures safe to show without leaking filesystem or provider credentials. */
export class TextbookError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
//# sourceMappingURL=schema.js.map