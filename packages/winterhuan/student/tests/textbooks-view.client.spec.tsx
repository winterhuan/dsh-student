// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TextbookLibrary, type TextbookActions } from '../src/client/textbooks-view.tsx'
import { en } from '../src/client/locales.ts'
import type { Textbook, TextbookPage } from '../src/types.ts'

afterEach(() => { cleanup(); localStorage.clear() })

it('restores the whole draft with its original revision and requires an explicit merge after a remote change', async () => {
  const book: Textbook = { format: 1, id: 'book', title: 'My textbook', subject: 'math', expectedPages: 1, revision: 1 }
  const page: TextbookPage = { format: 1, id: 'page', bookId: book.id, position: 1, printedPage: '1', original: '.study/textbooks/book/pages/page/original.png', sha256: 'a'.repeat(64), width: 100, height: 100, mediaType: 'image/png', revision: 5, status: 'review', updatedAt: 0, content: { path: '.study/textbooks/book/pages/page/revisions/current.md', assets: [], issues: [], source: 'manual' } }
  localStorage.setItem('student:textbook:test:page', JSON.stringify({ markdown: 'Retained correction', position: 2, printed: 'cover', candidate: false, revision: 3 }))
  const command = vi.fn<TextbookActions['command']>(async input => {
    if (input.action === 'list') return { books: [book] }
    if (input.action === 'book') return { book, pages: [page] }
    if (input.action === 'page') return { page, markdown: 'Changed on Mac' }
    if (input.action === 'edit') {
      if (input.revision !== page.revision) throw new Error('Revision conflict')
      return { page: { ...page, revision: 6 }, markdown: input.markdown }
    }
    throw new Error(`Unexpected ${input.action}`)
  })
  const api: TextbookActions = { command, devices: async () => [], pair: vi.fn(), upload: vi.fn(), image: async () => ({ data: '', mediaType: 'image/png' }) }
  const view = render(<TextbookLibrary api={api} t={key => en[key]} scope="test" />)
  const details = view.container.querySelector('details')!
  details.open = true; fireEvent(details, new Event('toggle'))
  fireEvent.click(await screen.findByRole('button', { name: book.title }))
  fireEvent.click(await screen.findByRole('button', { name: '1 · 1 · Needs proofreading' }))
  expect((await screen.findByLabelText(en.tbMarkdown) as HTMLTextAreaElement).value).toBe('Retained correction')
  expect((screen.getByLabelText(en.tbPosition) as HTMLInputElement).value).toBe('2')
  expect((screen.getByLabelText(en.tbPrinted) as HTMLInputElement).value).toBe('cover')
  const save = () => screen.getAllByRole('button', { name: en.tbSave }).at(-1)!
  await waitFor(() => expect((save() as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(save())
  await screen.findByText('Revision conflict')
  expect(command).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'edit', revision: 3 }))
  expect(localStorage.getItem('student:textbook:test:page')).toContain('Retained correction')
  fireEvent.click(screen.getByRole('button', { name: en.tbMerge }))
  fireEvent.click(save())
  await waitFor(() => expect(localStorage.getItem('student:textbook:test:page')).toBeNull())
  expect(command.mock.calls.some(([input]) => input.action === 'edit' && input.revision === 5 && input.position === 2 && input.printedPage === 'cover')).toBe(true)
})
