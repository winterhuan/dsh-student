import { jsx as _jsx } from "react/jsx-runtime";
/** Three dots showing independent-correct days toward mastery (n of 3); undefined hides the row. */
export function MasteryDots({ days, t }) {
    if (days === undefined)
        return null;
    const lit = Math.min(3, days);
    return _jsx("p", { className: "student-mastery", "aria-label": `${t('masteryProgress')} ${lit}/3`, children: [0, 1, 2].map(index => _jsx("span", { className: index < lit ? 'student-level-mastered' : 'student-level-untouched' }, index)) });
}
//# sourceMappingURL=mastery-dots.js.map