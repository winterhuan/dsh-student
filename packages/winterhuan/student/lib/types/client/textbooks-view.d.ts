import type { TextbookCommand, TextbookReply, TextbookDevice, TextbookPairing } from '../types.ts';
import type { Translate } from './locales.ts';
/** Session-bound callbacks; the view never receives management credentials or filesystem paths to mutate. */
export interface TextbookActions {
    command(input: TextbookCommand): Promise<TextbookReply>;
    pair(): Promise<TextbookPairing>;
    devices(revoke?: string): Promise<TextbookDevice[]>;
    upload(input: {
        bookId: string;
        pageId: string;
        position: number;
        printedPage: string;
        data: string;
    }): Promise<TextbookReply>;
    image(bookId: string, pageId: string, kind: 'original' | 'asset', index: number, candidate: boolean, revision: number): Promise<{
        data: string;
        mediaType: string;
    }>;
}
/** Phone pairing, image import, reading and proofreading inside the existing Student workbench. */
export declare function TextbookLibrary({ api, t, scope }: {
    api: TextbookActions;
    t: Translate;
    scope: string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=textbooks-view.d.ts.map