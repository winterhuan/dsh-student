import type { StudyFiles } from '../files/read.ts';
import { type Textbook, type TextbookPage, type TextbookModel, type TextbookUpload, type TextbookCommand, type TextbookReply } from './schema.ts';
/** A workspace-bound store. Metadata writes use the existing DSH filesystem CAS. */
export declare class TextbookStore {
    readonly workspace: string;
    private readonly files;
    constructor(workspace: string, files: StudyFiles);
    private load;
    private write;
    private updateBook;
    /** Read a book without modifying its metadata. */
    book(id: string): Promise<Textbook>;
    /** Read a page, verifying its stored ownership matches the requested path. */
    page(bookId: string, pageId: string): Promise<TextbookPage>;
    /** List committed books; temporary/orphaned files are not records. */
    books(): Promise<Textbook[]>;
    /** List committed pages in capture order; unnumbered pages have their own positions. */
    pages(bookId: string): Promise<TextbookPage[]>;
    /** Resolve only generated textbook paths; reject symlinks before opening binary files. */
    private binaryPath;
    /** Publish immutable bytes before updating the metadata pointer; failed writes leave no accepted page. */
    private put;
    /** Read a bounded original/asset/revision selected from a validated page record. */
    bytes(path: string): Promise<Buffer>;
    /** Update one record with a caller-observed revision and filesystem version. */
    savePage(page: TextbookPage, expected: number): Promise<TextbookPage>;
    /** Receive original bytes idempotently; decoding precedes durable acceptance. */
    upload(request: TextbookUpload, bytes: Buffer): Promise<TextbookPage>;
    /** Save cropped illustrations and a Markdown revision without replacing an existing human edit. */
    parsed(page: TextbookPage, markdown: string, issues: string[], crops: {
        left: number;
        top: number;
        width: number;
        height: number;
    }[]): Promise<TextbookPage>;
    private validateMarkdown;
    /** Apply a bounded user command; provider failures do not block photo admission. */
    command(command: TextbookCommand, model: TextbookModel): Promise<TextbookReply>;
}
//# sourceMappingURL=store.d.ts.map