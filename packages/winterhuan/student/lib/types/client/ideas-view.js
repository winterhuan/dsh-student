import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
function isGrouped(edge) {
    return edge.kind === 'contrast' || edge.kind === 'part-of' || edge.kind === 'cause-effect';
}
function grouped(relations) {
    const result = [];
    for (const edge of relations)
        if (isGrouped(edge))
            result.push(edge);
    return result;
}
/** Parent concepts: compare / classify / cause for the open book, then the subject's cross-grade idea list. */
export function IdeasView({ study, curriculum, t, onOpenConcept }) {
    const nameOf = (id) => curriculum?.concepts.find(item => item.id === id)?.name ?? study.concepts.find(item => item.id === id)?.name ?? id;
    const open = (id) => {
        if (!onOpenConcept)
            return;
        if (curriculum?.concepts.some(item => item.id === id) || study.concepts.some(item => item.id === id))
            onOpenConcept(id);
    };
    const ConceptLink = ({ id }) => onOpenConcept && (curriculum?.concepts.some(item => item.id === id) || study.concepts.some(item => item.id === id))
        ? _jsx("button", { type: "button", className: "student-quiet", onClick: () => open(id), children: nameOf(id) })
        : _jsx("span", { children: nameOf(id) });
    const shipped = grouped(curriculum?.relations ?? []);
    const confirmed = grouped(study.relations);
    const edges = [...shipped, ...confirmed.filter(edge => !shipped.some(item => item.id === edge.id))];
    const contrasts = edges.filter(edge => edge.kind === 'contrast');
    const causes = edges.filter(edge => edge.kind === 'cause-effect');
    const classes = new Map();
    for (const edge of edges) {
        if (edge.kind !== 'part-of')
            continue;
        const members = classes.get(edge.toId) ?? [];
        members.push(edge);
        classes.set(edge.toId, members);
    }
    const ideaConcepts = (ideaId) => curriculum?.concepts.filter(item => (item.ideaIds ?? []).includes(ideaId)) ?? [];
    return _jsxs(_Fragment, { children: [_jsxs("section", { children: [_jsx("h3", { children: t('ideas') }), _jsx("p", { className: "student-muted", children: t('ideasHelp') }), onOpenConcept && _jsx("p", { className: "student-muted", children: t('ideasOpenOnMap') })] }), _jsxs("section", { children: [_jsx("h3", { children: t('compareGroup') }), contrasts.length === 0 ? _jsx("p", { className: "student-muted", children: t('relationEmpty') }) : contrasts.map(edge => _jsxs("div", { className: "student-unit", children: [_jsxs("div", { className: "student-pair", children: [_jsx("p", { children: _jsx(ConceptLink, { id: edge.fromId }) }), _jsx("p", { children: _jsx(ConceptLink, { id: edge.toId }) })] }), _jsx("p", { className: "student-muted", children: edge.explanation })] }, edge.id))] }), _jsxs("section", { children: [_jsx("h3", { children: t('classifyGroup') }), classes.size === 0 ? _jsx("p", { className: "student-muted", children: t('relationEmpty') }) : [...classes].map(([category, members]) => _jsxs("div", { className: "student-unit", children: [_jsx("p", { children: _jsx(ConceptLink, { id: category }) }), _jsx("ul", { children: members.map(edge => _jsxs("li", { children: [_jsx(ConceptLink, { id: edge.fromId }), _jsx("p", { className: "student-muted", children: edge.explanation })] }, edge.id)) })] }, category))] }), _jsxs("section", { children: [_jsx("h3", { children: t('causeGroup') }), causes.length === 0 ? _jsx("p", { className: "student-muted", children: t('relationEmpty') }) : causes.map(edge => _jsxs("div", { className: "student-unit", children: [_jsxs("p", { children: [_jsx(ConceptLink, { id: edge.fromId }), " \u2192 ", _jsx(ConceptLink, { id: edge.toId })] }), _jsx("p", { className: "student-muted", children: edge.explanation })] }, edge.id))] }), _jsxs("section", { children: [_jsx("h3", { children: t('ideaCatalog') }), curriculum && curriculum.ideas.length > 0 ? curriculum.ideas.map(idea => {
                        const linked = ideaConcepts(idea.id);
                        return _jsxs("div", { className: "student-unit", children: [_jsx("p", { children: idea.name }), _jsxs("p", { children: [t('definition'), ": ", idea.definition] }), _jsxs("p", { className: "student-muted", children: [t('example'), ": ", idea.example] }), linked.length > 0 && _jsxs("p", { className: "student-muted", children: [t('ideaOnMap'), ": ", linked.map((item, index) => _jsxs("span", { children: [index > 0 ? ' · ' : '', _jsx(ConceptLink, { id: item.id })] }, item.id))] })] }, idea.id);
                    }) : _jsx("p", { children: t('mapUnavailable') })] })] });
}
//# sourceMappingURL=ideas-view.js.map