import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FigureView } from "./figure-view.js";
const roleNames = { daily: 'sheetDaily', practice: 'sheetPractice', review: 'sheetReview' };
/** A sheet's printed role: its saved kind, or the legacy all-sourced-mistakes heuristic. */
function sheetRole(worksheet) {
    if (worksheet.kind !== undefined)
        return worksheet.kind;
    const sourcedElsewhere = worksheet.items.every(item => item.mistakeId !== undefined
        && worksheet.sources.find(source => source.itemId === item.id)?.mistakeId !== undefined);
    return sourcedElsewhere ? 'review' : 'practice';
}
export function sheetTitle(worksheet, t) {
    return `${t(worksheet.subject)}${t(roleNames[sheetRole(worksheet)])}`;
}
/** The answer space one printed question leaves: one ruled line, three lines, or a dashed box. */
function AnswerSpace({ space }) {
    if (space === 'none')
        return null;
    if (space === 'box')
        return _jsx("div", { className: "student-sheet-box" });
    return _jsx("div", { className: `student-sheet-lines student-sheet-${space}`, children: Array.from({ length: space === 'line' ? 1 : 3 }, (_, index) => _jsx("div", { className: "student-sheet-rule" }, index)) });
}
/** The printable student sheet: title, name and date line, then questions with figures and answer space. Answers stay in the saved record. */
export function WorksheetSheet({ worksheet, t }) {
    return _jsxs("div", { className: "student-sheet", children: [_jsx("h2", { children: sheetTitle(worksheet, t) }), _jsxs("p", { className: "student-sheet-meta", children: [t('sheetIdLabel'), "\uFF1A", worksheet.id, worksheet.objectiveTitle !== '' ? `　${t('sheetGoalLabel')}：${worksheet.objectiveTitle}` : ''] }), _jsx("p", { className: "student-sheet-meta", children: t('sheetNameDate') }), worksheet.items.map((item, index) => _jsxs("div", { className: "student-sheet-item", children: [_jsxs("p", { children: [index + 1, ". ", item.prompt] }), item.figure !== undefined && _jsx(FigureView, { figure: item.figure, t: t }), _jsx(AnswerSpace, { space: item.space ?? (item.figure !== undefined ? 'line' : 'lines') })] }, item.id))] });
}
/** Preview dialog doubling as the print source: the browser print dialog prints only the sheet. */
export function WorksheetPrint({ worksheet, onClose, t }) {
    const [container] = useState(() => {
        const element = document.createElement('div');
        element.className = 'student-sheet-portal';
        return element;
    });
    useEffect(() => {
        document.body.appendChild(container);
        return () => { container.remove(); };
    }, [container]);
    useEffect(() => {
        const onKey = (event) => { if (event.key === 'Escape')
            onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return createPortal(_jsx("div", { className: "student-sheet-backdrop", onClick: onClose, children: _jsxs("div", { className: "student-sheet-dialog", role: "dialog", "aria-modal": "true", "aria-label": sheetTitle(worksheet, t), onClick: event => event.stopPropagation(), children: [_jsxs("div", { className: "student-sheet-toolbar", children: [_jsx("p", { className: "student-muted", children: t('printSheetHelp') }), _jsx("button", { type: "button", className: "student-primary", onClick: () => { window.print(); }, children: t('printSheet') }), _jsx("button", { type: "button", className: "student-quiet", onClick: onClose, children: t('close') })] }), _jsx("div", { className: "student-sheet-scroll", children: _jsx(WorksheetSheet, { worksheet: worksheet, t: t }) })] }) }), container);
}
//# sourceMappingURL=worksheet-view.js.map