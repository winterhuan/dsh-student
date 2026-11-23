// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useSearchableHidden } from '../../../../upstream/packages/client/ui-chat/src/client/chat/searchable-hidden.ts'
import { TeachingAids } from '../src/client/teaching-aids.tsx'
import { en } from '../src/client/locales.ts'

const t = (key: keyof typeof en) => en[key]
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
const aid = { kind: 'tool-result', callId: 'original-widget', name: 'openmaic_widget', call: { name: 'openmaic_widget' }, isError: false, subCalls: [] }
const snapshot = { locations: { getTurn: () => ['original-node'] }, nodes: new Map([['original-node', { kind: 'tool-call', data: { root: { kind: 'tool-result', callId: 'parent', name: 'delegate', call: { name: 'delegate' }, isError: false, subCalls: [aid] } } }]]) }
const props = { turn: { turn: 1 }, sessionId: 'student-session', useSessions: (selector: Function) => selector({ byId: { 'student-session': { projectionValues: { agentPreset: 'student' } } } }), useChat: (selector: Function) => selector(snapshot), t }

it('reveals the existing keyed official card through native searchable hiding without duplicating it', async () => {
  const scroll = vi.fn()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1 })
  function OriginalGroup() {
    const [open, setOpen] = useState(false)
    const ref = useSearchableHidden(!open, () => setOpen(true))
    return <div ref={ref} data-step-process-body><div data-chat-flow=""><div data-chat-call-id="original-widget" ref={element => { if (element) element.scrollIntoView = scroll }}><iframe title="Original official simulation" /></div></div></div>
  }
  const view = render(<div data-chat-flow=""><OriginalGroup /><TeachingAids {...props as import('react').ComponentProps<typeof TeachingAids>} /></div>)
  const card = view.container.querySelector('[data-chat-call-id]')!
  expect(card.closest('[data-step-process-body]')!.getAttribute('hidden')).toBe('until-found')
  fireEvent.click(screen.getByRole('button', { name: en.openTeachingAid }))
  await waitFor(() => expect(card.closest('[data-step-process-body]')!.hasAttribute('hidden')).toBe(false))
  expect(view.container.querySelector('[data-chat-call-id]')).toBe(card)
  expect(view.container.querySelectorAll('iframe')).toHaveLength(1)
  expect(scroll).toHaveBeenCalledOnce()
})

it('contributes no controls for a different preset or failed official results', () => {
  const view = render(<TeachingAids {...{ ...props, useSessions: () => 'default' } as import('react').ComponentProps<typeof TeachingAids>} />)
  expect(screen.queryByText(en.teachingAids)).toBeNull()
  view.rerender(<TeachingAids {...{ ...props, useChat: (selector: Function) => selector({ locations: { getTurn: () => ['failed'] }, nodes: new Map([['failed', { kind: 'tool-call', data: { root: { ...aid, isError: true } } }]]) }) } as import('react').ComponentProps<typeof TeachingAids>} />)
  expect(screen.queryByText(en.teachingAids)).toBeNull()
})
