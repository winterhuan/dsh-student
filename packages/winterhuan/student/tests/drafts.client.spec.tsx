// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { useSyncExternalStore } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { createStudentDraftStore } from '../src/client/drafts.tsx'
import { DraftInput, ParentSettings, SaveForm } from '../src/client/forms.tsx'
import { dashboard } from '../src/dashboard.ts'
import { updateStudy, NOW, setup } from './fixtures.ts'
import { en } from '../src/client/locales.ts'

afterEach(() => { cleanup(); window.localStorage.clear(); window.sessionStorage.clear() })

it('renders a restored parent draft in the first flow before any effect can run', () => {
  const namespace = 'student:draft:session-one:term-one'
  window.sessionStorage.setItem(`${namespace}:profile`, JSON.stringify({ revision: 1, baseline: JSON.stringify(setup.profile), edited: ['nickname'], values: { nickname: 'Retained before render' } }))
  const store = createStudentDraftStore().create()
  const html = renderToStaticMarkup(<ParentSettings data={dashboard(updateStudy(undefined, setup, NOW), NOW)} draftScope={namespace} observation="original-v1" change={async () => { throw new Error('Rendering must not save') }} t={key => en[key]} useStore={selector => selector(store.getSnapshot())} actions={store.actions} />)
  expect(html).toContain('value="Retained before render"')
  expect(store.getSnapshot().drafts[`${namespace}:profile`]).toContain('Retained before render')
})

it.each(['saved', 'discarded'] as const)('does not resurrect a %s legacy draft when the declared store is recreated', async outcome => {
  const namespace = 'student:draft:session-one:term-one'
  const key = `${namespace}:profile`
  const legacy = JSON.stringify({ revision: 1, baseline: JSON.stringify({ nickname: 'Original name' }), edited: ['nickname'], values: { nickname: 'Legacy draft' } })
  window.sessionStorage.setItem(key, legacy)
  const declaration = createStudentDraftStore()
  const store = declaration.create('session-one')
  const submit = outcome === 'saved'
    ? vi.fn().mockResolvedValue({ baseline: JSON.stringify({ nickname: 'Saved name' }), currentValues: { nickname: 'Saved name' }, observation: 'saved-v2' })
    : vi.fn().mockRejectedValue(new Error('Current name changed'))
  function Form({ instance }: { instance: typeof store }) {
    const useStore = <T,>(selector: (state: ReturnType<typeof store.getSnapshot>) => T) => selector(useSyncExternalStore(instance.subscribe, instance.getSnapshot, instance.getSnapshot))
    return <SaveForm {...{ useStore, actions: instance.actions, submit }} revision={2} baseline={JSON.stringify({ nickname: 'Current name' })} currentValues={{ nickname: 'Current name' }} observation="current-v1" entity="profile" draftScope={namespace} t={key => en[key]}>
      <label>Nickname<DraftInput {...{ useStore }} draftKey={key} observation="current-v1" name="nickname" defaultValue="Current name" /></label>
    </SaveForm>
  }
  const mounted = render(<Form instance={store} />)
  expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('Legacy draft')
  fireEvent.click(screen.getByRole('button', { name: en.save }))
  if (outcome === 'saved') await screen.findByRole('status')
  else {
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: en.useCurrentValues }))
  }
  mounted.unmount()
  expect(window.sessionStorage.getItem(key)).toBe(legacy)
  const html = renderToStaticMarkup(<Form instance={declaration.create('session-one')} />)
  expect(html).toContain(`value="${outcome === 'saved' ? 'Saved name' : 'Current name'}"`)
  expect(html).not.toContain('Legacy draft')
})
