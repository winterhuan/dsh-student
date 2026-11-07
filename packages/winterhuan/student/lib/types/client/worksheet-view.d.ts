import type { Dashboard } from '../dashboard.ts';
import type { Translate } from './locales.ts';
type Worksheet = NonNullable<Dashboard['study']>['worksheets'][number];
export declare function sheetTitle(worksheet: Worksheet, t: Translate): string;
/** The printable student sheet: title, name and date line, then questions with figures and answer space. Answers stay in the saved record. */
export declare function WorksheetSheet({ worksheet, t }: {
    worksheet: Worksheet;
    t: Translate;
}): import("react/jsx-runtime").JSX.Element;
/** Preview dialog doubling as the print source: the browser print dialog prints only the sheet. */
export declare function WorksheetPrint({ worksheet, onClose, t }: {
    worksheet: Worksheet;
    onClose: () => void;
    t: Translate;
}): import("react").ReactPortal;
export {};
//# sourceMappingURL=worksheet-view.d.ts.map