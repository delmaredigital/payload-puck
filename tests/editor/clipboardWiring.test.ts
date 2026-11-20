// @vitest-environment happy-dom

/**
 * The block clipboard as PuckEditor wires it: the real PuckEditor →
 * PuckEditorImpl → Puck, with only the Next.js and Payload admin hooks faked.
 * Covers the signed-in user from Payload's auth context, `copyPaste={false}`,
 * a clipboard that survives the editor recomputing its overrides, and what
 * the host's onChange receives.
 */

import { act, createElement, Fragment, lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useGetPuck, type ComponentData, type Config, type Data } from '@puckeditor/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLIPBOARD_STORAGE_KEY } from '../../src/clipboard/core.js'
import { resetClipboardStoresForTests } from '../../src/clipboard/editor.js'
import { memoryStorage } from '../clipboard/memoryStorage.js'

const auth = vi.hoisted(() => ({ user: { id: 'user-1' } as { id: string } | null }))

vi.mock('next/dynamic', () => ({
  default: (load: () => Promise<ComponentType<any>>) => {
    const Lazy = lazy(() => load().then((component) => ({ default: component })))
    return (props: Record<string, unknown>) => createElement(Suspense, null, createElement(Lazy, props))
  },
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }) }))
vi.mock('@payloadcms/ui', () => ({ useLocale: () => ({ code: 'en' }), useAuth: () => ({ user: auth.user }) }))

const { PuckEditor } = await import('../../src/editor/PuckEditor.js')

const config = {
  components: {
    Box: {
      fields: { content: { type: 'slot' } },
      render: ({ content: Content }: { content: () => ReactNode }) => createElement('section', null, createElement(Content)),
    },
    Leaf: { fields: { text: { type: 'text' } }, render: ({ text }: { text: string }) => createElement('p', null, text) },
  },
} as unknown as Config

const initialData = {
  root: { props: {} },
  content: [
    { type: 'Leaf', props: { id: 'top', text: 'Top' } },
    { type: 'Box', props: { id: 'box', content: [{ type: 'Leaf', props: { id: 'one', text: 'One' } }] } },
  ],
} as unknown as Data

let root: Root
let container: HTMLDivElement
let getPuck: ReturnType<typeof useGetPuck>
let storage: Storage
let session: Storage

function Capture() {
  getPuck = useGetPuck()
  return null
}

const overrides = { puck: ({ children }: { children: ReactNode }) => createElement(Fragment, null, createElement(Capture), children) }

async function mount(props: Record<string, unknown> = {}) {
  await act(async () => {
    root.render(createElement(PuckEditor, {
      pageId: '1', pageTitle: 'Home', pageSlug: 'home', initialData, config, overrides, ...props,
    }))
  })
  // The editor is loaded lazily; the first load in a busy run can take a while
  await vi.waitFor(() => expect(getPuck).toBeDefined(), { timeout: 10_000 })
  // Select only once the canvas iframe shows the page: a block selected
  // before then never gets its action bar
  await vi.waitFor(
    () => expect(documents().some((doc) => doc.querySelector('[data-puck-component="one"]'))).toBe(true),
    { timeout: 10_000 },
  )
}

function select(id: string) {
  act(() => {
    getPuck().dispatch({ type: 'setUi', ui: { itemSelector: getPuck().getSelectorForId(id)! } })
  })
}

/** The editor's document and the canvas iframe's: the action bar lives in the iframe. */
const documents = () => [document, ...[...document.querySelectorAll('iframe')].flatMap((frame) => frame.contentDocument ? [frame.contentDocument] : [])]
const button = (title: string) =>
  documents().map((doc) => doc.querySelector<HTMLButtonElement>(`button[title="${title}"]`)).find(Boolean) ?? null
/** Clicks once the button is there (the clipboard's scope resolves asynchronously). */
async function click(title: string) {
  await vi.waitFor(() => expect(button(title)).not.toBeNull(), { timeout: 10_000 })
  act(() => button(title)!.click())
}
const status = () => document.querySelector('[data-payload-puck-clipboard-status]')?.textContent ?? ''

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  storage = memoryStorage()
  session = memoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('sessionStorage', session)
  resetClipboardStoresForTests()
  auth.user = { id: 'user-1' }
  getPuck = undefined as unknown as typeof getPuck
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The first test loads the editor lazily, which can be slow on a busy machine
describe('the clipboard in PuckEditor', { timeout: 30_000 }, () => {
  it("keeps the copy for the signed-in Payload user, in localStorage, by hash", async () => {
    await mount()
    select('one')
    await click('Copy block')
    const stored = storage.getItem(CLIPBOARD_STORAGE_KEY)!
    expect(JSON.parse(stored).scope).toMatch(/^user:[0-9a-f]{64}$/)
    expect(stored).not.toContain('user-1')
  })

  it('keeps the copy for the tab only when Payload has no signed-in user', async () => {
    auth.user = null
    await mount()
    select('one')
    await click('Copy block')
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
    expect(session.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
  })

  it('is off with copyPaste={false}', async () => {
    await mount({ copyPaste: false })
    select('one')
    // The visibility toggle is there, so the action bar has rendered
    await vi.waitFor(() => expect(button('Hide block')).not.toBeNull())
    expect(button('Copy block')).toBeNull()
    expect(document.querySelector('[data-payload-puck-clipboard-status]')).toBeNull()
  })

  it('survives the editor recomputing its overrides: the message stays and copy still works', async () => {
    await mount()
    select('one')
    await click('Copy block')
    // The paste dirties the page, which recomputes the overrides
    await click('Paste after')
    // Wait for the dirty page's re-render, which recomputes the overrides
    await vi.waitFor(() => expect(document.body.textContent).toContain('Unsaved'))
    expect(status()).toBe('Block pasted.')

    select('top')
    await click('Paste after')
    expect(getPuck().appState.data.content).toHaveLength(3)
    expect(getPuck().appState.data.content[1]).toMatchObject({ type: 'Leaf', props: { text: 'One' } })
  })

  it("hands the host's onChange one change per paste, with the final block", async () => {
    const onChange = vi.fn()
    await mount({ onChange })
    select('box')
    await click('Copy block')
    onChange.mockClear()
    select('top')
    await click('Paste after')

    const pastes = onChange.mock.calls.map(([data]) => data as Data).filter((data) => data.content.length === 3)
    expect(pastes).toHaveLength(1)
    expect(pastes[0].content[1]).toMatchObject({
      type: 'Box',
      props: { content: [{ type: 'Leaf', props: { text: 'One' } }] },
    })
    // Never the bare block Puck's insert creates
    for (const [data] of onChange.mock.calls) {
      const pasted = (data as Data).content[1] as ComponentData | undefined
      if (pasted && pasted.props.id !== 'box') expect((pasted.props as any).content).toHaveLength(1)
    }
  })

  it('takes Cmd/Ctrl+C and Cmd/Ctrl+V pressed inside the canvas iframe', async () => {
    await mount()
    select('one')
    await vi.waitFor(() => expect(button('Copy block')).not.toBeNull())
    const frame = document.querySelector('iframe')!.contentDocument!
    const press = (key: string) => {
      const event = new (frame.defaultView as unknown as typeof window).KeyboardEvent('keydown', { key, metaKey: true, bubbles: true, cancelable: true })
      act(() => { frame.body.dispatchEvent(event) })
      return event
    }
    expect(press('c').defaultPrevented).toBe(true)
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
    expect(press('v').defaultPrevented).toBe(true)
    const box = getPuck().getItemById('box')!.props as { content: ComponentData[] }
    expect(box.content.map((block) => block.props.text)).toEqual(['One', 'One'])
  })
})
