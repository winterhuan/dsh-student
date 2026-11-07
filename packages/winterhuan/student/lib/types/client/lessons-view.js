import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
const statusKey = { generating: 'openmaicGenerating', ready: 'openmaicReady', failed: 'openmaicFailed' };
/**
 * Open a classroom URL in another browser tab.
 * The desk does not embed the classroom: a cross-origin frame would not carry the OpenMAIC cookie,
 * and a static export player is intentionally absent.
 */
/** http(s) URL without credentials, or undefined when the desk must not offer it. */
export function classroomUrl(value) {
    if (value === undefined || value === '')
        return undefined;
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        return undefined;
    }
    if (parsed.username !== '' || parsed.password !== '' || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:'))
        return undefined;
    return parsed.href;
}
export function openClassroom(url) {
    // TODO: do not add a sidebar iframe or a static export player. Playback stays in the system browser.
    const href = classroomUrl(url);
    if (href === undefined)
        return;
    window.open(href, '_blank', 'noopener,noreferrer');
}
/** Lessons for the open subject. A row with no subject stays visible; a row for another subject does not. */
export function lessonsForSubject(lessons, subject) {
    return lessons.filter(lesson => lesson.subject === undefined || lesson.subject === subject);
}
/** Recent OpenMAIC lessons: open or copy the URL, and ask the tutor to generate, retry or review. */
export function LessonsPanel({ lessons, error, disabled, running, t, onGenerate, onRetry, onReview }) {
    const [copiedId, setCopiedId] = useState('');
    const busy = disabled || running;
    return _jsxs("section", { "aria-label": t('openmaicTitle'), children: [_jsx("h3", { children: t('openmaicTitle') }), _jsx("p", { className: "student-muted", children: t('openmaicHelp') }), error && _jsx("p", { role: "alert", children: error }), onGenerate && _jsx("button", { type: "button", disabled: busy, onClick: onGenerate, children: t('openmaicGenerate') }), lessons.length === 0 ? _jsx("p", { children: t('openmaicEmpty') }) : lessons.map((lesson, index) => _jsxs("details", { open: index === 0, children: [_jsxs("summary", { children: [lesson.title, " \u00B7 ", t(statusKey[lesson.status])] }), _jsx("p", { className: "student-muted", children: lesson.requirement }), lesson.warning && _jsxs("p", { children: [t('openmaicWarning'), ": ", lesson.warning] }), lesson.error && _jsx("p", { role: "alert", children: lesson.error }), classroomUrl(lesson.url) && _jsxs(_Fragment, { children: [_jsx("p", { className: "student-url", children: classroomUrl(lesson.url) }), _jsxs("div", { className: "student-segments", children: [_jsx("button", { type: "button", onClick: () => openClassroom(lesson.url ?? ''), children: t('openmaicOpen') }), _jsx("button", { type: "button", onClick: () => {
                                            const url = classroomUrl(lesson.url);
                                            if (url === undefined)
                                                return;
                                            void navigator.clipboard?.writeText(url).then(() => setCopiedId(lesson.id)).catch(() => setCopiedId(''));
                                        }, children: copiedId === lesson.id ? t('openmaicCopied') : t('openmaicCopy') })] })] }), lesson.status === 'failed' && lesson.retryable === true && lesson.runId && _jsx("button", { type: "button", disabled: busy, onClick: () => onRetry(lesson.runId ?? ''), children: t('openmaicRetry') }), lesson.status === 'ready' && lesson.classroomId && _jsx("button", { type: "button", disabled: busy, onClick: () => onReview(lesson.classroomId ?? ''), children: t('openmaicReview') }), lesson.summary && _jsxs("div", { children: [_jsx("p", { children: t('openmaicOutline') }), _jsx("p", { children: lesson.summary.outline }), lesson.summary.scenes.map((scene, sceneIndex) => _jsxs("p", { className: "student-muted", children: [scene.title, scene.summary ? ` · ${scene.summary}` : ''] }, `${scene.title}-${sceneIndex}`))] })] }, lesson.id))] });
}
//# sourceMappingURL=lessons-view.js.map