/** Workspace textbook library with durable remote saves and retained local proofreading drafts. */
import { useEffect, useRef, useState } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { Textbook, TextbookPage, TextbookCommand, TextbookReply, TextbookDevice, TextbookPairing } from '../types.ts'
import type { Translate } from './locales.ts'

/** Session-bound callbacks; the view never receives management credentials or filesystem paths to mutate. */
export interface TextbookActions {
  command(input: TextbookCommand): Promise<TextbookReply>
  pair(): Promise<TextbookPairing>
  devices(revoke?: string): Promise<TextbookDevice[]>
  upload(input: { bookId: string; pageId: string; position: number; printedPage: string; data: string }): Promise<TextbookReply>
  image(bookId: string, pageId: string, kind: 'original' | 'asset', index: number, candidate: boolean, revision: number): Promise<{ data: string; mediaType: string }>
}

const statusKeys = { received: 'tbReceived', queued: 'tbQueued', parsing: 'tbParsing', review: 'tbReview', confirmed: 'tbConfirmed', failed: 'tbFailed' } as const

/** Phone pairing, image import, reading and proofreading inside the existing Student workbench. */
export function TextbookLibrary({ api, t, scope }: { api: TextbookActions; t: Translate; scope: string }) {
  const [open, setOpen] = useState(false)
  const [books, setBooks] = useState<Textbook[]>([])
  const [book, setBook] = useState<Textbook>()
  const [pages, setPages] = useState<TextbookPage[]>([])
  const [selected, setSelected] = useState<TextbookReply>()
  const [draft, setDraft] = useState('')
  const [position, setPosition] = useState(1)
  const [printed, setPrinted] = useState('')
  const [candidate, setCandidate] = useState(false)
  const [baseRevision, setBaseRevision] = useState(0)
  const [image, setImage] = useState('')
  const [assets, setAssets] = useState<Record<string, string>>({})
  const [pairing, setPairing] = useState('')
  const [devices, setDevices] = useState<TextbookDevice[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const generation = useRef(0)
  const refreshGeneration = useRef(0)
  const page = selected?.page
  const draftKey = (pageId: string) => `student:textbook:${scope}:${pageId}`

  async function run(action: () => Promise<void>) {
    setBusy(true); setError('')
    try { await action() } catch (reason) { setError(reason instanceof Error ? reason.message : t('networkError')) }
    finally { setBusy(false) }
  }
  async function refresh(bookId = book?.id) {
    const current = ++refreshGeneration.current
    const catalog = await api.command({ action: 'list' })
    if (current !== refreshGeneration.current) return
    setBooks(catalog.books ?? [])
    if (bookId) { const reply = await api.command({ action: 'book', bookId }); if (current !== refreshGeneration.current) return; setBook(reply.book); setPages(reply.pages ?? []) }
  }
  useEffect(() => {
    if (!open) return
    void run(async () => { await refresh(); setDevices(await api.devices()) })
  }, [open])
  useEffect(() => {
    if (!open || busy || !book || !pages.some(item => item.status === 'queued' || item.status === 'parsing')) return
    const timer = window.setInterval(() => { void refresh(book.id).catch(reason => setError(String(reason))) }, 5000)
    return () => window.clearInterval(timer)
  }, [open, busy, book?.id, pages])
  useEffect(() => () => { generation.current += 1; refreshGeneration.current += 1 }, [])

  async function choose(item: TextbookPage) {
    const current = ++generation.current
    const reply = await api.command({ action: 'page', bookId: item.bookId, pageId: item.id })
    if (generation.current !== current) return
    setSelected(reply); setCandidate(false); setImage(''); setAssets({})
    const retained = window.localStorage.getItem(draftKey(item.id))
    const saved = retained ? JSON.parse(retained) as { markdown: string; position: number; printed: string; candidate: boolean; revision: number } : undefined
    setDraft(saved?.markdown ?? reply.markdown ?? ''); setPosition(saved?.position ?? reply.page!.position); setPrinted(saved?.printed ?? reply.page!.printedPage); setCandidate(saved?.candidate ?? false); setBaseRevision(saved?.revision ?? reply.page!.revision)
    const original = await api.image(item.bookId, item.id, 'original', 0, false, reply.page!.revision)
    if (generation.current !== current) return
    setImage(`data:${original.mediaType};base64,${original.data}`)
    const pictures: Record<string, string> = {}
    for (const [isCandidate, content] of [[false, reply.page?.content], [true, reply.page?.candidate]] as const) {
      for (const [index, asset] of (content?.assets ?? []).entries()) {
        const value = await api.image(item.bookId, item.id, 'asset', index, isCandidate, reply.page!.revision)
        pictures[`../assets/${asset.path.split('/').at(-1)}`] = `data:${value.mediaType};base64,${value.data}`
      }
    }
    if (generation.current === current) setAssets(pictures)
  }
  function retain(value = draft, order = position, printedPage = printed, useCandidate = candidate, revision = baseRevision) { if (page) window.localStorage.setItem(draftKey(page.id), JSON.stringify({ markdown: value, position: order, printed: printedPage, candidate: useCandidate, revision })) }
  function edit(value: string) { setDraft(value); retain(value) }
  async function save(confirm: boolean) {
    if (!page) return
    const reply = await api.command({ action: 'edit', bookId: page.bookId, pageId: page.id, revision: baseRevision, markdown: draft, position, printedPage: printed, confirm, useCandidate: candidate })
    window.localStorage.removeItem(draftKey(page.id))
    setSelected(reply); setCandidate(false); setBaseRevision(reply.page!.revision)
    await refresh(page.bookId)
  }

  return <details className="student-textbooks" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>{t('tbTitle')}</summary>
    <p>{t('tbHelp')}</p>
    {error && <p role="alert">{error}</p>}
    <div className="student-toolbar">
      <button type="button" disabled={busy} onClick={() => { void run(() => refresh()) }}>{t('tbRefresh')}</button>
      <button type="button" disabled={busy} onClick={() => { void run(async () => setPairing(JSON.stringify(await api.pair()))) }}>{t('tbPair')}</button>
    </div>
    {pairing && <label>{t('tbPairHelp')}<textarea readOnly value={pairing} rows={4} onFocus={event => event.currentTarget.select()} /></label>}
    {devices.map(device => <p key={device.id}>{device.name} <button type="button" disabled={busy} onClick={() => { void run(async () => setDevices(await api.devices(device.id))) }}>{t('tbRevoke')}</button></p>)}
    <form onSubmit={event => {
      event.preventDefault(); const form = event.currentTarget; const data = new FormData(form)
      void run(async () => { const result = await api.command({ action: 'create', id: crypto.randomUUID(), title: String(data.get('title')), subject: 'other', expectedPages: data.get('count') ? Number(data.get('count')) : null }); form.reset(); await refresh(result.book!.id) })
    }}>
      <label>{t('tbBookName')}<input name="title" required maxLength={200} /></label>
      <label>{t('tbPageCount')}<input name="count" type="number" min={1} max={2000} /></label>
      <button disabled={busy}>{t('tbCreate')}</button>
    </form>
    <nav aria-label={t('tbTitle')}>{books.map(item => <button key={item.id} type="button" disabled={busy} aria-pressed={book?.id === item.id} onClick={() => { generation.current++; setSelected(undefined); void run(() => refresh(item.id)) }}>{item.title}</button>)}</nav>
    {book && <section>
      <h3>{book.title}</h3>
      <p>{pages.filter(item => !item.excluded).length} / {book.expectedPages ?? '—'} · {book.confirmedAt ? t('tbComplete') : t('tbIncomplete')}</p>
      <form key={`${book.id}:${book.revision}`} onSubmit={event => { event.preventDefault(); const count = new FormData(event.currentTarget).get('count'); void run(async () => { await api.command({ action: 'configure', bookId: book.id, revision: book.revision, title: book.title, expectedPages: count ? Number(count) : null }); await refresh() }) }}>
        <label>{t('tbPageCount')}<input name="count" type="number" min={1} max={2000} defaultValue={book.expectedPages ?? ''} /></label><button disabled={busy}>{t('tbSave')}</button>
      </form>
      <label>{t('tbUpload')}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={event => {
        const files = Array.from(event.currentTarget.files ?? []); event.currentTarget.value = ''
        void run(async () => {
          let next = Math.max(0, ...pages.map(item => item.position)) + 1
          for (const file of files) {
            if (file.size > 20 * 1024 * 1024) throw new Error(t('tbPhotoSize'))
            const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]!); reader.onerror = reject; reader.readAsDataURL(file) })
            await api.upload({ bookId: book.id, pageId: crypto.randomUUID(), position: next++, printedPage: '', data })
          }
          await refresh()
        })
      }} /></label>
      <button type="button" disabled={busy || !pages.some(item => !item.excluded && (item.status === 'received' || item.status === 'failed'))} onClick={() => { void run(async () => { for (const item of pages.filter(item => !item.excluded && (item.status === 'received' || item.status === 'failed'))) await api.command({ action: 'queue', bookId: book.id, pageId: item.id, revision: item.revision, requestId: crypto.randomUUID() }); await refresh() }) }}>{t('tbParsePending')}</button>
      <p>{t('tbCompleteHelp')}</p>
      <button type="button" disabled={busy} onClick={() => { void run(async () => { await api.command({ action: 'complete', bookId: book.id, revision: book.revision }); await refresh() }) }}>{t('tbConfirmBook')}</button>
      <ol>{pages.map(item => <li key={item.id}><button type="button" disabled={busy} onClick={() => { void run(() => choose(item)) }}>{item.position} · {item.printedPage || t('tbUnnumbered')} · {t(item.excluded ? 'tbExcluded' : statusKeys[item.status])}</button><button type="button" disabled={busy} onClick={() => { void run(async () => { await api.command({ action: 'exclude', bookId: item.bookId, pageId: item.id, revision: item.revision, excluded: !item.excluded }); await refresh() }) }}>{t(item.excluded ? 'tbRestore' : 'tbExclude')}</button>{item.error && <p>{item.error}</p>}</li>)}</ol>
    </section>}
    {page && <section>
      <h3>{t('tbPage')} {page.position}</h3>
      {image && <details><summary>{t('tbOriginal')}</summary><img src={image} alt={t('tbOriginal')} style={{ maxWidth: '100%' }} /></details>}
      <button type="button" disabled={busy} onClick={() => { void run(async () => { await api.command({ action: 'queue', bookId: page.bookId, pageId: page.id, revision: page.revision }); await choose(page); await refresh() }) }}>{t('tbReparse')}</button>
      {page.candidate && <details><summary>{t('tbCandidate')}</summary><MarkdownText text={selected?.candidateMarkdown ?? ''} omitHtml labels={{ code: { copyLabel: t('tbCopy'), copiedLabel: t('tbCopied') }, footnotes: t('tbFootnotes') }} pathImages={{ resolve: value => assets[value] }} /><button type="button" disabled={busy} onClick={() => { const value = selected?.candidateMarkdown ?? ''; setCandidate(true); setDraft(value); setBaseRevision(page.revision); retain(value, position, printed, true, page.revision) }}>{t('tbUseCandidate')}</button></details>}
      {(candidate ? page.candidate : page.content)?.issues.map((issue, index) => <p key={index} role="status">{issue}</p>)}
      {page.content && <>
        {draft !== selected?.markdown && <details><summary>{t('tbSavedVersion')}</summary><MarkdownText text={selected?.markdown ?? ''} omitHtml labels={{ code: { copyLabel: t('tbCopy'), copiedLabel: t('tbCopied') }, footnotes: t('tbFootnotes') }} pathImages={{ resolve: value => assets[value] }} /></details>}
        <MarkdownText text={draft} omitHtml labels={{ code: { copyLabel: t('tbCopy'), copiedLabel: t('tbCopied') }, footnotes: t('tbFootnotes') }} pathImages={{ resolve: value => assets[value] }} />
        <label>{t('tbPosition')}<input disabled={busy} type="number" min={1} max={2000} value={position} onChange={event => { const value = Number(event.currentTarget.value); setPosition(value); retain(draft, value) }} /></label>
        <label>{t('tbPrinted')}<input disabled={busy} maxLength={40} value={printed} onChange={event => { const value = event.currentTarget.value; setPrinted(value); retain(draft, position, value) }} /></label>
        <label>{t('tbMarkdown')}<textarea disabled={busy} rows={16} value={draft} onChange={event => edit(event.currentTarget.value)} /></label>
        <button type="button" disabled={busy || !draft.trim()} onClick={() => { void run(() => save(false)) }}>{t('tbSave')}</button>
        <button type="button" disabled={busy || !draft.trim()} onClick={() => { void run(() => save(true)) }}>{t('tbConfirmPage')}</button>
        <p>{t('tbConflictHelp')}</p>
        {baseRevision !== page.revision && <button type="button" disabled={busy} onClick={() => { setBaseRevision(page.revision); retain(draft, position, printed, candidate, page.revision) }}>{t('tbMerge')}</button>}
      </>}
    </section>}
  </details>
}
