import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Workspace textbook library with durable remote saves and retained local proofreading drafts. */
import { useEffect, useRef, useState } from 'react';
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives';
const statusKeys = { received: 'tbReceived', queued: 'tbQueued', parsing: 'tbParsing', review: 'tbReview', confirmed: 'tbConfirmed', failed: 'tbFailed' };
/** Phone pairing, image import, reading and proofreading inside the existing Student workbench. */
export function TextbookLibrary({ api, t, scope }) {
    const [open, setOpen] = useState(false);
    const [books, setBooks] = useState([]);
    const [book, setBook] = useState();
    const [pages, setPages] = useState([]);
    const [selected, setSelected] = useState();
    const [draft, setDraft] = useState('');
    const [position, setPosition] = useState(1);
    const [printed, setPrinted] = useState('');
    const [candidate, setCandidate] = useState(false);
    const [baseRevision, setBaseRevision] = useState(0);
    const [image, setImage] = useState('');
    const [assets, setAssets] = useState({});
    const [pairing, setPairing] = useState('');
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const generation = useRef(0);
    const refreshGeneration = useRef(0);
    const page = selected?.page;
    const draftKey = (pageId) => `student:textbook:${scope}:${pageId}`;
    async function run(action) {
        setBusy(true);
        setError('');
        try {
            await action();
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('networkError'));
        }
        finally {
            setBusy(false);
        }
    }
    async function refresh(bookId = book?.id) {
        const current = ++refreshGeneration.current;
        const catalog = await api.command({ action: 'list' });
        if (current !== refreshGeneration.current)
            return;
        setBooks(catalog.books ?? []);
        if (bookId) {
            const reply = await api.command({ action: 'book', bookId });
            if (current !== refreshGeneration.current)
                return;
            setBook(reply.book);
            setPages(reply.pages ?? []);
        }
    }
    useEffect(() => {
        if (!open)
            return;
        void run(async () => { await refresh(); setDevices(await api.devices()); });
    }, [open]);
    useEffect(() => {
        if (!open || busy || !book || !pages.some(item => item.status === 'queued' || item.status === 'parsing'))
            return;
        const timer = window.setInterval(() => { void refresh(book.id).catch(reason => setError(String(reason))); }, 5000);
        return () => window.clearInterval(timer);
    }, [open, busy, book?.id, pages]);
    useEffect(() => () => { generation.current += 1; refreshGeneration.current += 1; }, []);
    async function choose(item) {
        const current = ++generation.current;
        const reply = await api.command({ action: 'page', bookId: item.bookId, pageId: item.id });
        if (generation.current !== current)
            return;
        setSelected(reply);
        setCandidate(false);
        setImage('');
        setAssets({});
        const retained = window.localStorage.getItem(draftKey(item.id));
        const saved = retained ? JSON.parse(retained) : undefined;
        setDraft(saved?.markdown ?? reply.markdown ?? '');
        setPosition(saved?.position ?? reply.page.position);
        setPrinted(saved?.printed ?? reply.page.printedPage);
        setCandidate(saved?.candidate ?? false);
        setBaseRevision(saved?.revision ?? reply.page.revision);
        const original = await api.image(item.bookId, item.id, 'original', 0, false, reply.page.revision);
        if (generation.current !== current)
            return;
        setImage(`data:${original.mediaType};base64,${original.data}`);
        const pictures = {};
        for (const [isCandidate, content] of [[false, reply.page?.content], [true, reply.page?.candidate]]) {
            for (const [index, asset] of (content?.assets ?? []).entries()) {
                const value = await api.image(item.bookId, item.id, 'asset', index, isCandidate, reply.page.revision);
                pictures[`../assets/${asset.path.split('/').at(-1)}`] = `data:${value.mediaType};base64,${value.data}`;
            }
        }
        if (generation.current === current)
            setAssets(pictures);
    }
    function retain(value = draft, order = position, printedPage = printed, useCandidate = candidate, revision = baseRevision) { if (page)
        window.localStorage.setItem(draftKey(page.id), JSON.stringify({ markdown: value, position: order, printed: printedPage, candidate: useCandidate, revision })); }
    function edit(value) { setDraft(value); retain(value); }
    async function save(confirm) {
        if (!page)
            return;
        const reply = await api.command({ action: 'edit', bookId: page.bookId, pageId: page.id, revision: baseRevision, markdown: draft, position, printedPage: printed, confirm, useCandidate: candidate });
        window.localStorage.removeItem(draftKey(page.id));
        setSelected(reply);
        setCandidate(false);
        setBaseRevision(reply.page.revision);
        await refresh(page.bookId);
    }
    return _jsxs("details", { className: "student-textbooks", open: open, onToggle: event => setOpen(event.currentTarget.open), children: [_jsx("summary", { children: t('tbTitle') }), _jsx("p", { children: t('tbHelp') }), error && _jsx("p", { role: "alert", children: error }), _jsxs("div", { className: "student-toolbar", children: [_jsx("button", { type: "button", disabled: busy, onClick: () => { void run(() => refresh()); }, children: t('tbRefresh') }), _jsx("button", { type: "button", disabled: busy, onClick: () => { void run(async () => setPairing(JSON.stringify(await api.pair()))); }, children: t('tbPair') })] }), pairing && _jsxs("label", { children: [t('tbPairHelp'), _jsx("textarea", { readOnly: true, value: pairing, rows: 4, onFocus: event => event.currentTarget.select() })] }), devices.map(device => _jsxs("p", { children: [device.name, " ", _jsx("button", { type: "button", disabled: busy, onClick: () => { void run(async () => setDevices(await api.devices(device.id))); }, children: t('tbRevoke') })] }, device.id)), _jsxs("form", { onSubmit: event => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const data = new FormData(form);
                    void run(async () => { const result = await api.command({ action: 'create', id: crypto.randomUUID(), title: String(data.get('title')), subject: 'other', expectedPages: data.get('count') ? Number(data.get('count')) : null }); form.reset(); await refresh(result.book.id); });
                }, children: [_jsxs("label", { children: [t('tbBookName'), _jsx("input", { name: "title", required: true, maxLength: 200 })] }), _jsxs("label", { children: [t('tbPageCount'), _jsx("input", { name: "count", type: "number", min: 1, max: 2000 })] }), _jsx("button", { disabled: busy, children: t('tbCreate') })] }), _jsx("nav", { "aria-label": t('tbTitle'), children: books.map(item => _jsx("button", { type: "button", disabled: busy, "aria-pressed": book?.id === item.id, onClick: () => { generation.current++; setSelected(undefined); void run(() => refresh(item.id)); }, children: item.title }, item.id)) }), book && _jsxs("section", { children: [_jsx("h3", { children: book.title }), _jsxs("p", { children: [pages.filter(item => !item.excluded).length, " / ", book.expectedPages ?? '—', " \u00B7 ", book.confirmedAt ? t('tbComplete') : t('tbIncomplete')] }), _jsxs("form", { onSubmit: event => { event.preventDefault(); const count = new FormData(event.currentTarget).get('count'); void run(async () => { await api.command({ action: 'configure', bookId: book.id, revision: book.revision, title: book.title, expectedPages: count ? Number(count) : null }); await refresh(); }); }, children: [_jsxs("label", { children: [t('tbPageCount'), _jsx("input", { name: "count", type: "number", min: 1, max: 2000, defaultValue: book.expectedPages ?? '' })] }), _jsx("button", { disabled: busy, children: t('tbSave') })] }, `${book.id}:${book.revision}`), _jsxs("label", { children: [t('tbUpload'), _jsx("input", { type: "file", accept: "image/jpeg,image/png,image/webp", multiple: true, disabled: busy, onChange: event => {
                                    const files = Array.from(event.currentTarget.files ?? []);
                                    event.currentTarget.value = '';
                                    void run(async () => {
                                        let next = Math.max(0, ...pages.map(item => item.position)) + 1;
                                        for (const file of files) {
                                            if (file.size > 20 * 1024 * 1024)
                                                throw new Error(t('tbPhotoSize'));
                                            const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
                                            await api.upload({ bookId: book.id, pageId: crypto.randomUUID(), position: next++, printedPage: '', data });
                                        }
                                        await refresh();
                                    });
                                } })] }), _jsx("button", { type: "button", disabled: busy || !pages.some(item => !item.excluded && (item.status === 'received' || item.status === 'failed')), onClick: () => { void run(async () => { for (const item of pages.filter(item => !item.excluded && (item.status === 'received' || item.status === 'failed')))
                            await api.command({ action: 'queue', bookId: book.id, pageId: item.id, revision: item.revision, requestId: crypto.randomUUID() }); await refresh(); }); }, children: t('tbParsePending') }), _jsx("p", { children: t('tbCompleteHelp') }), _jsx("button", { type: "button", disabled: busy, onClick: () => { void run(async () => { await api.command({ action: 'complete', bookId: book.id, revision: book.revision }); await refresh(); }); }, children: t('tbConfirmBook') }), _jsx("ol", { children: pages.map(item => _jsxs("li", { children: [_jsxs("button", { type: "button", disabled: busy, onClick: () => { void run(() => choose(item)); }, children: [item.position, " \u00B7 ", item.printedPage || t('tbUnnumbered'), " \u00B7 ", t(item.excluded ? 'tbExcluded' : statusKeys[item.status])] }), _jsx("button", { type: "button", disabled: busy, onClick: () => { void run(async () => { await api.command({ action: 'exclude', bookId: item.bookId, pageId: item.id, revision: item.revision, excluded: !item.excluded }); await refresh(); }); }, children: t(item.excluded ? 'tbRestore' : 'tbExclude') }), item.error && _jsx("p", { children: item.error })] }, item.id)) })] }), page && _jsxs("section", { children: [_jsxs("h3", { children: [t('tbPage'), " ", page.position] }), image && _jsxs("details", { children: [_jsx("summary", { children: t('tbOriginal') }), _jsx("img", { src: image, alt: t('tbOriginal'), style: { maxWidth: '100%' } })] }), _jsx("button", { type: "button", disabled: busy, onClick: () => { void run(async () => { await api.command({ action: 'queue', bookId: page.bookId, pageId: page.id, revision: page.revision }); await choose(page); await refresh(); }); }, children: t('tbReparse') }), page.candidate && _jsxs("details", { children: [_jsx("summary", { children: t('tbCandidate') }), _jsx(MarkdownText, { text: selected?.candidateMarkdown ?? '', omitHtml: true, labels: { code: { copyLabel: t('tbCopy'), copiedLabel: t('tbCopied') }, footnotes: t('tbFootnotes') }, pathImages: { resolve: value => assets[value] } }), _jsx("button", { type: "button", disabled: busy, onClick: () => { const value = selected?.candidateMarkdown ?? ''; setCandidate(true); setDraft(value); setBaseRevision(page.revision); retain(value, position, printed, true, page.revision); }, children: t('tbUseCandidate') })] }), (candidate ? page.candidate : page.content)?.issues.map((issue, index) => _jsx("p", { role: "status", children: issue }, index)), page.content && _jsxs(_Fragment, { children: [draft !== selected?.markdown && _jsxs("details", { children: [_jsx("summary", { children: t('tbSavedVersion') }), _jsx(MarkdownText, { text: selected?.markdown ?? '', omitHtml: true, labels: { code: { copyLabel: t('tbCopy'), copiedLabel: t('tbCopied') }, footnotes: t('tbFootnotes') }, pathImages: { resolve: value => assets[value] } })] }), _jsx(MarkdownText, { text: draft, omitHtml: true, labels: { code: { copyLabel: t('tbCopy'), copiedLabel: t('tbCopied') }, footnotes: t('tbFootnotes') }, pathImages: { resolve: value => assets[value] } }), _jsxs("label", { children: [t('tbPosition'), _jsx("input", { disabled: busy, type: "number", min: 1, max: 2000, value: position, onChange: event => { const value = Number(event.currentTarget.value); setPosition(value); retain(draft, value); } })] }), _jsxs("label", { children: [t('tbPrinted'), _jsx("input", { disabled: busy, maxLength: 40, value: printed, onChange: event => { const value = event.currentTarget.value; setPrinted(value); retain(draft, position, value); } })] }), _jsxs("label", { children: [t('tbMarkdown'), _jsx("textarea", { disabled: busy, rows: 16, value: draft, onChange: event => edit(event.currentTarget.value) })] }), _jsx("button", { type: "button", disabled: busy || !draft.trim(), onClick: () => { void run(() => save(false)); }, children: t('tbSave') }), _jsx("button", { type: "button", disabled: busy || !draft.trim(), onClick: () => { void run(() => save(true)); }, children: t('tbConfirmPage') }), _jsx("p", { children: t('tbConflictHelp') }), baseRevision !== page.revision && _jsx("button", { type: "button", disabled: busy, onClick: () => { setBaseRevision(page.revision); retain(draft, position, printed, candidate, page.revision); }, children: t('tbMerge') })] })] })] });
}
//# sourceMappingURL=textbooks-view.js.map