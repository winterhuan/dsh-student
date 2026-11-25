import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { levelKeys } from "./display.js";
/** Capability state always names its tested range and actual independent dates. */
export function CapabilityProgressView({ goals, subject, t }) {
    const selected = goals.filter(goal => (!subject || goal.subject === subject) && (goal.scope || goal.feedback.length));
    return _jsxs("section", { children: [_jsx("h3", { children: t('capabilityProgressTitle') }), selected.length ? selected.map(goal => _jsxs("details", { children: [_jsxs("summary", { children: [t(goal.subject), " \u00B7 ", goal.title, " \u00B7 ", t(levelKeys[goal.level])] }), goal.scope && _jsx("p", { children: goal.scope.description }), _jsxs("p", { children: [t('independentDates'), ": ", goal.independentDays.length ? goal.independentDays.join(' · ') : t('empty')] }), goal.feedback.slice(-3).map(row => _jsxs("p", { children: [t(row.result), " \u00B7 ", row.feedback] }, `${row.termId}:${row.ownerId}:${row.responseId}`))] }, `${goal.id}:${goal.scope?.id}`)) : _jsx("p", { children: t('empty') })] });
}
//# sourceMappingURL=capability-progress.js.map