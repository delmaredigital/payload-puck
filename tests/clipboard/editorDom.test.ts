// @vitest-environment happy-dom

/**
 * Copy block / Paste block inside the real Puck editor (happy-dom, canvas
 * without an iframe), composed the way PuckEditor composes it: show/hide
 * first, then the clipboard.
 */

import { act, createElement, Fragment, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Puck, useGetPuck, type ComponentData, type Config, type Data, type Permissions } from '@puckeditor/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { composeVisibilityOverrides } from '../../src/visibility/editor.js'
import { composeClipboardOverrides, createEditorClipboard, resetClipboardStoresForTests, type ClipboardOptions } from '../../src/clipboard/editor.js'
import { useClipboardGuard } from '../../src/clipboard/signOut.js'
import { CLIPBOARD_FORMAT, CLIPBOARD_STORAGE_KEY, CLIPBOARD_VERSION, clipboardScope } from '../../src/clipboard/core.js'
import { withBlockVisibility } from '../../src/visibility/withBlockVisibility.js'
import type { CanPasteArgs } from '../../src/clipboard/types.js'
import { memoryStorage } from './memoryStorage.js'

const slotRender = ({ content: Content }: { content: () => ReactNode }) => createElement('section', null, createElement(Content))

function containsType(block: ComponentData, type: string): boolean {
  return block.type === type || Object.values(block.props).some((value) =>
    Array.isArray(value) && value.some((child) => child && typeof child === 'object' && 'type' in child && containsType(child as ComponentData, type)))
}

const config = withBlockVisibility({
  components: {
    Box: { fields: { content: { type: 'slot' } }, render: slotRender },
    Columns: {
      fields: { left: { type: 'slot', label: 'Left' }, right: { type: 'slot', label: 'Right' } },
      render: ({ left: Left, right: Right }: { left: () => ReactNode; right: () => ReactNode }) =>
        createElement('div', null, createElement(Left), createElement(Right)),
    },
    // A block whose slots are alternative versions of a section, not nestable:
    // its slot disallows it directly, and its hook refuses it anywhere below
    Versions: {
      label: 'Variants',
      fields: { a: { type: 'slot', label: 'Variant A', disallow: ['Versions'] } },
      blockClipboard: {
        canPaste: ({ block, destination }: CanPasteArgs) =>
          destination.ancestors.some((ancestor) => ancestor.type === 'Versions') && containsType(block, 'Versions')
            ? "A Variants block can't go inside another one."
            : true,
      },
      render: ({ a: A }: { a: () => ReactNode }) => createElement('div', null, createElement(A)),
    },
    Leaf: { label: 'Text', fields: { text: { type: 'text' } }, render: ({ text }: { text: string }) => createElement('p', null, text) },
  },
} as unknown as Config)

const initialData = (): Data => ({
  root: { props: {} },
  content: [
    { type: 'Box', props: { id: 'box', content: [
      { type: 'Leaf', props: { id: 'one', text: 'One', _visibility: { hideOn: ['phone'] } } },
      { type: 'Box', props: { id: 'inner', content: [{ type: 'Leaf', props: { id: 'deep', text: 'Deep' } }] } },
    ] } },
    { type: 'Columns', props: { id: 'cols', left: [], right: [] } },
    { type: 'Versions', props: { id: 'exp', a: [] } },
  ],
} as unknown as Data)

let root: Root
let container: HTMLDivElement
let getPuck: ReturnType<typeof useGetPuck>
let storage: Storage
let session: Storage

const USER: ClipboardOptions = { userId: 'user-1' }

function Capture() {
  getPuck = useGetPuck()
  return null
}

/** Renders the editor, then waits for the clipboard's scope (hashing is async). */
async function mount(
  data: Data = initialData(),
  permissions?: Partial<Permissions>,
  clipboard: ClipboardOptions = USER,
  puckConfig: Config = config,
  extra: { onChange?: (data: Data) => void } = {},
) {
  const editorClipboard = createEditorClipboard(clipboard)
  const overrides = composeClipboardOverrides(composeVisibilityOverrides({
    puck: ({ children }: { children: ReactNode }) => createElement(Fragment, null, createElement(Capture), children),
  }), editorClipboard)
  // As PuckEditor does: the in-between state of a top-level paste isn't a change
  const onChange = extra.onChange && ((next: Data) => { if (!editorClipboard.isPasting()) extra.onChange!(next) })
  act(() => {
    root.render(createElement(Puck, { config: puckConfig, data, overrides, permissions, onChange, iframe: { enabled: false } } as any))
  })
  await vi.waitFor(() => expect(editorClipboard.store()).toBeDefined())
}

/** A fresh editor in the same browser (other stores and memory forgotten). */
async function remount(...args: Parameters<typeof mount>) {
  act(() => root.unmount())
  resetClipboardStoresForTests()
  root = createRoot(container)
  await mount(...args)
}

const content = () => getPuck().appState.data.content
const slot = (id: string, name: string) => getPuck().getItemById(id)!.props[name] as ComponentData[]

function select(id: string) {
  act(() => {
    getPuck().dispatch({ type: 'setUi', ui: { itemSelector: getPuck().getSelectorForId(id)! } })
  })
}

const button = (title: string) => document.querySelector<HTMLButtonElement>(`button[title="${title}"]`)
const click = (title: string) => act(() => button(title)!.click())
const status = () => document.querySelector('[data-payload-puck-clipboard-status]')?.textContent ?? ''

/** Puck records history 300ms after the last change: run that timer now */
const recorded = () => act(() => { vi.advanceTimersByTime(350) })

/** Fakes only timers, so Puck's history debounce runs exactly when `recorded()` says. */
const fakeHistoryTimers = () => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

function key(target: EventTarget, key: string) {
  const event = new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true, cancelable: true })
  act(() => { target.dispatchEvent(event) })
  return event
}

/** Stores a record as user-1 would have it, with `overrides` applied. */
async function writeRaw(overrides: Record<string, unknown>) {
  const { key } = await clipboardScope(USER.userId, undefined)
  storage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify({
    format: CLIPBOARD_FORMAT, version: CLIPBOARD_VERSION, scope: key, expiresAt: Date.now() + 60_000, ...overrides,
  }))
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  storage = memoryStorage()
  session = memoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('sessionStorage', session)
  resetClipboardStoresForTests()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  vi.useRealTimers()
  act(() => root.unmount())
  container.remove()
  resetClipboardStoresForTests()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('copy and paste in the Puck editor', () => {
  it('offers Copy block, and Paste only once something is copied', async () => {
    await mount()
    select('one')
    expect(button('Copy block')).not.toBeNull()
    expect(button('Paste after')).toBeNull()

    click('Copy block')
    expect(status()).toBe('Block copied.')
    expect(button('Paste after')).not.toBeNull()
  })

  it('pastes after the selected block, in the same slot, and selects it', async () => {
    await mount()
    select('one')
    click('Copy block')
    click('Paste after')

    const [first, pasted, third] = slot('box', 'content')
    expect(first.props.id).toBe('one')
    expect(third.props.id).toBe('inner')
    expect(pasted).toMatchObject({ type: 'Leaf', props: { text: 'One', _visibility: { hideOn: ['phone'] } } })
    expect(pasted.props.id).not.toBe('one')
    expect(getPuck().selectedItem?.props.id).toBe(pasted.props.id)
    // The canvas shows it too, a moment later (as with Puck's own Duplicate)
    await vi.waitFor(() => expect([...container.querySelectorAll('p')].filter((p) => p.textContent === 'One')).toHaveLength(2))
  })

  it('pastes into an empty slot of a block with several slots, from a menu', async () => {
    await mount()
    select('one')
    click('Copy block')
    select('cols')
    click('Paste inside')

    const items = [...document.querySelectorAll('[role="menuitem"]')].map((item) => item.textContent)
    expect(items).toEqual(['Paste into Left', 'Paste into Right'])
    click('Paste into Right')

    expect(slot('cols', 'left')).toEqual([])
    expect(slot('cols', 'right')).toMatchObject([{ type: 'Leaf', props: { text: 'One' } }])
  })

  it('pastes straight into a block with one slot', async () => {
    await mount()
    select('deep')
    click('Copy block')
    select('exp')
    click('Paste inside')
    expect(slot('exp', 'a')).toMatchObject([{ type: 'Leaf', props: { text: 'Deep' } }])
  })

  it('gives the pasted block and everything in it new ids', async () => {
    await mount()
    select('box')
    click('Copy block')
    click('Paste after')

    const pasted = content()[1]
    const ids: string[] = []
    const collect = (block: ComponentData) => {
      ids.push(block.props.id as string)
      for (const child of ((block.props as { content?: ComponentData[] }).content ?? [])) collect(child)
    }
    collect(pasted)
    expect(ids).toHaveLength(4)
    expect(ids.filter((id) => ['box', 'one', 'inner', 'deep'].includes(id))).toEqual([])
    expect(new Set(ids).size).toBe(4)
    // And Puck can find each of them
    for (const id of ids) expect(getPuck().getSelectorForId(id)).toBeDefined()
  })

  it('pastes in another editor through storage', async () => {
    await mount()
    select('one')
    click('Copy block')
    // A new tab: nothing in memory, only what storage holds
    await remount({ root: { props: {} }, content: [{ type: 'Box', props: { id: 'other', content: [] } }] } as unknown as Data)
    select('other')
    click('Paste inside')
    expect(slot('other', 'content')).toMatchObject([{ type: 'Leaf', props: { text: 'One' } }])
  })

  it('refuses a slot that disallows the block, and says why', async () => {
    await mount()
    select('exp')
    click('Copy block')
    click('Paste inside')

    expect(status()).toBe("Variants blocks aren't allowed in Variant A.")
    expect(slot('exp', 'a')).toEqual([])
  })

  it('refuses a block type this editor does not have', async () => {
    await writeRaw({ block: { type: 'Gone', props: { id: 'g' } } })
    await mount()
    select('one')
    click('Paste after')
    expect(status()).toBe('This editor has no "Gone" block, so the copied block can\'t be pasted here.')
    expect(slot('box', 'content')).toHaveLength(2)
  })

  it('ignores a clipboard record from another version, and says so', async () => {
    await writeRaw({ version: CLIPBOARD_VERSION + 1, block: { type: 'Leaf', props: { id: 'x' } } })
    await mount()
    select('one')
    click('Paste after')
    expect(status()).toBe('The copied block came from a different version of the editor. Copy it again.')
    expect(slot('box', 'content')).toHaveLength(2)
  })

  it('follows Puck permissions: no Copy without duplicate, no paste without insert', async () => {
    await mount(initialData(), { duplicate: false })
    select('one')
    expect(button('Copy block')).toBeNull()
    await writeRaw({ block: { type: 'Leaf', props: { id: 'x', text: 'X' } } })
    await remount(initialData(), { insert: false })
    select('one')
    click('Paste after')
    expect(status()).toBe("You can't add Text blocks here.")
    expect(slot('box', 'content')).toHaveLength(2)
  })

  it('undoes a paste in one step', async () => {
    fakeHistoryTimers()
    await mount()
    await recorded()
    select('one')
    click('Copy block')
    click('Paste after')
    await recorded()
    expect(slot('box', 'content')).toHaveLength(3)

    act(() => getPuck().history.back())
    expect(slot('box', 'content').map((block) => block.props.id)).toEqual(['one', 'inner'])
  })

  it('copies and pastes with Cmd/Ctrl+C and Cmd/Ctrl+V on a selected block', async () => {
    await mount()
    select('one')
    expect(key(document.body, 'c').defaultPrevented).toBe(true)
    expect(key(document.body, 'v').defaultPrevented).toBe(true)
    expect(slot('box', 'content')).toHaveLength(3)
  })

  it('leaves Cmd/Ctrl+C and Cmd/Ctrl+V alone in text fields', async () => {
    await mount()
    select('one')
    click('Copy block')
    const input = document.createElement('input')
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    document.body.append(input, editable)

    for (const target of [input, editable]) {
      expect(key(target, 'c').defaultPrevented).toBe(false)
      expect(key(target, 'v').defaultPrevented).toBe(false)
    }
    expect(slot('box', 'content')).toHaveLength(2)
    input.remove()
    editable.remove()
  })

  it('leaves Cmd/Ctrl+V alone when nothing is copied, and does nothing with no block selected', async () => {
    await mount()
    select('one')
    expect(key(document.body, 'v').defaultPrevented).toBe(false)

    act(() => getPuck().dispatch({ type: 'setUi', ui: { itemSelector: null } }))
    expect(key(document.body, 'c').defaultPrevented).toBe(false)
  })

  it('works in this tab when storage is unavailable', async () => {
    const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    vi.stubGlobal('localStorage', blocked)
    await mount()
    select('one')
    click('Copy block')
    click('Paste after')
    expect(slot('box', 'content')).toHaveLength(3)
  })

  describe('privacy', () => {
    it('keeps the user id out of storage', async () => {
      await mount()
      select('one')
      click('Copy block')
      const stored = storage.getItem(CLIPBOARD_STORAGE_KEY)!
      expect(stored).not.toContain('user-1')
      expect(JSON.parse(stored).scope).toMatch(/^user:[0-9a-f]{64}$/)
    })

    it("doesn't offer another user's copy", async () => {
      await mount()
      select('one')
      click('Copy block')

      await remount(initialData(), undefined, { userId: 'user-2' })
      select('one')
      expect(button('Paste after')).toBeNull()
      expect(key(document.body, 'v').defaultPrevented).toBe(false)
      expect(slot('box', 'content')).toHaveLength(2)
    })

    it("doesn't offer a copy made under another host scope", async () => {
      await mount(initialData(), undefined, { userId: 'user-1', scope: 'tenant-a' })
      select('one')
      click('Copy block')

      await remount(initialData(), undefined, { userId: 'user-1', scope: 'tenant-b' })
      select('one')
      expect(button('Paste after')).toBeNull()

      await remount(initialData(), undefined, { userId: 'user-1', scope: 'tenant-a' })
      select('one')
      expect(button('Paste after')).not.toBeNull()
    })

    it("doesn't offer an expired copy, and deletes it", async () => {
      await writeRaw({ expiresAt: Date.now() - 1, block: { type: 'Leaf', props: { id: 'x', text: 'Old' } } })
      await mount()
      select('one')
      expect(button('Paste after')).toBeNull()
      expect(status()).toBe('')
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
    })

    it('deletes the stored copy when the signed-in user signs out', async () => {
      await mount()
      select('one')
      click('Copy block')
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()

      const SignOutWatcher = ({ userId }: { userId?: string }) => {
        useClipboardGuard(userId)
        return null
      }
      const watcherRoot = createRoot(document.createElement('div'))
      act(() => watcherRoot.render(createElement(SignOutWatcher, { userId: 'user-1' })))
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
      act(() => watcherRoot.render(createElement(SignOutWatcher, { userId: undefined })))
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
      act(() => watcherRoot.unmount())
    })

    it('deletes the stored copy when a different user signs in', async () => {
      await mount()
      select('one')
      click('Copy block')
      const SignOutWatcher = ({ userId }: { userId?: string }) => {
        useClipboardGuard(userId)
        return null
      }
      const watcherRoot = createRoot(document.createElement('div'))
      act(() => watcherRoot.render(createElement(SignOutWatcher, { userId: 'user-1' })))
      act(() => watcherRoot.render(createElement(SignOutWatcher, { userId: 'user-2' })))
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
      act(() => watcherRoot.unmount())
    })

    it("doesn't delete anything when no one was signed in", async () => {
      await writeRaw({ block: { type: 'Leaf', props: { id: 'x' } } })
      const SignOutWatcher = ({ userId }: { userId?: string }) => {
        useClipboardGuard(userId)
        return null
      }
      const watcherRoot = createRoot(document.createElement('div'))
      act(() => watcherRoot.render(createElement(SignOutWatcher, {})))
      act(() => watcherRoot.render(createElement(SignOutWatcher, {})))
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
      act(() => watcherRoot.unmount())
    })

    it('keeps the copy in the tab only when no user is signed in', async () => {
      await mount(initialData(), undefined, {})
      select('one')
      click('Copy block')
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
      expect(session.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
      click('Paste after')
      expect(slot('box', 'content')).toHaveLength(3)
    })
  })

  describe("a block's canPaste hook", () => {
    // A Variants block with a Box in its version, and a Box holding a Variants block
    const nestedData = (): Data => ({
      root: { props: {} },
      content: [
        { type: 'Versions', props: { id: 'exp', a: [{ type: 'Box', props: { id: 'vbox', content: [] } }] } },
        { type: 'Box', props: { id: 'holder', content: [{ type: 'Versions', props: { id: 'inner-exp', a: [] } }] } },
        { type: 'Leaf', props: { id: 'top', text: 'Top' } },
      ],
    } as unknown as Data)

    it('lets a container refuse its own type anywhere beneath it, with its message', async () => {
      await mount(nestedData())
      select('holder')
      click('Copy block')
      select('vbox')
      click('Paste inside')

      expect(status()).toBe("A Variants block can't go inside another one.")
      expect(slot('vbox', 'content')).toEqual([])
    })

    it('allows the same block where no such container is above it', async () => {
      await mount(nestedData())
      select('holder')
      click('Copy block')
      select('top')
      click('Paste after')

      expect(content().map((block) => block.type)).toEqual(['Versions', 'Box', 'Leaf', 'Box'])
    })

    it('passes the ancestor chain, nearest first, with ids, types and slots', async () => {
      const hook = vi.fn(() => true as const)
      const spied = {
        ...config,
        components: { ...config.components, Box: { ...config.components.Box, blockClipboard: { canPaste: hook } } },
      } as Config
      await mount(nestedData(), undefined, USER, spied)
      select('top')
      click('Copy block')
      select('vbox')
      click('Paste inside')

      expect(hook).toHaveBeenCalledWith(expect.objectContaining({
        block: expect.objectContaining({ type: 'Leaf', props: expect.objectContaining({ id: 'top' }) }),
        destination: {
          zone: 'vbox:content',
          index: 0,
          ancestors: [{ id: 'vbox', type: 'Box', slot: 'content' }, { id: 'exp', type: 'Versions', slot: 'a' }],
        },
        ancestor: { id: 'vbox', type: 'Box', slot: 'content' },
      }))
      expect(slot('vbox', 'content')).toHaveLength(1)
    })
  })

  describe('slots inside array and object fields', () => {
    const tabsConfig = withBlockVisibility({
      components: {
        ...config.components,
        Tabs: {
          fields: {
            tabs: { type: 'array', label: 'Tabs', arrayFields: { label: { type: 'text' }, body: { type: 'slot', label: 'Content', allow: ['Leaf'] } } },
          },
          render: ({ tabs }: { tabs: { body: () => ReactNode }[] }) =>
            createElement('div', null, tabs.map((tab, index) => createElement(tab.body, { key: index }))),
        },
      },
    } as unknown as Config)
    const tabsData = () => ({
      root: { props: {} },
      content: [
        { type: 'Leaf', props: { id: 'one', text: 'One' } },
        { type: 'Box', props: { id: 'box', content: [] } },
        { type: 'Tabs', props: { id: 'tabs', tabs: [{ label: 'A', body: [] }, { label: 'B', body: [{ type: 'Leaf', props: { id: 'b1', text: 'B1' } }] }] } },
      ],
    }) as unknown as Data
    const tabBody = (index: number) => (getPuck().getItemById('tabs')!.props as any).tabs[index].body as ComponentData[]

    it('offers Paste inside for them, with readable names, and pastes into the right one', async () => {
      await mount(tabsData(), undefined, USER, tabsConfig)
      select('one')
      click('Copy block')
      select('tabs')
      click('Paste inside')
      expect([...document.querySelectorAll('[role="menuitem"]')].map((item) => item.textContent))
        .toEqual(['Paste into Tabs 1 › Content', 'Paste into Tabs 2 › Content'])
      click('Paste into Tabs 2 › Content')

      expect(tabBody(0)).toEqual([])
      expect(tabBody(1).map((block) => block.props.text)).toEqual(['B1', 'One'])
      expect(getPuck().getSelectorForId(tabBody(1)[1].props.id as string)).toEqual({ zone: 'tabs:tabs[1].body', index: 1 })
    })

    it('applies their allow list to Paste after, too', async () => {
      await mount(tabsData(), undefined, USER, tabsConfig)
      select('box')
      click('Copy block')
      select('b1')
      click('Paste after')
      expect(status()).toBe("Box blocks aren't allowed in Tabs 2 › Content.")
      expect(tabBody(1)).toHaveLength(1)
    })
  })

  describe('what the host sees', () => {
    it('one change per paste into a slot, already holding the final block', async () => {
      const changes: Data[] = []
      await mount(initialData(), undefined, USER, config, { onChange: (data) => changes.push(data) })
      select('one')
      click('Copy block')
      changes.length = 0
      click('Paste after')

      expect(changes).toHaveLength(1)
      const pasted = (changes[0].content[0].props as any).content[1]
      expect(pasted).toMatchObject({ type: 'Leaf', props: { text: 'One', _visibility: { hideOn: ['phone'] } } })
    })

    it('one change per paste at the top of the page, never the bare inserted block', async () => {
      const changes: Data[] = []
      await mount(initialData(), undefined, USER, config, { onChange: (data) => changes.push(data) })
      select('box')
      click('Copy block')
      changes.length = 0
      click('Paste after')

      expect(changes).toHaveLength(1)
      expect(changes[0].content[1]).toMatchObject({ type: 'Box', props: { content: [{ type: 'Leaf' }, { type: 'Box' }] } })
    })

    it("runs the pasted block's resolveData, as Puck's own insert does", async () => {
      const resolveData = vi.fn(async (data: ComponentData) => ({ ...data, props: { ...data.props, text: 'Resolved' } }))
      const resolving = { ...config, components: { ...config.components, Leaf: { ...config.components.Leaf, resolveData } } } as unknown as Config
      await mount(initialData(), undefined, USER, resolving)
      select('one')
      click('Copy block')
      resolveData.mockClear()
      click('Paste after')

      await vi.waitFor(() => expect(slot('box', 'content')[1].props.text).toBe('Resolved'))
      expect(resolveData).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ trigger: 'insert' }))
    })
  })

  describe('the Paste inside menu', () => {
    const openMenu = async () => {
      await mount()
      select('one')
      click('Copy block')
      select('cols')
      click('Paste inside')
    }
    const trigger = () => button('Paste inside')!
    const items = () => [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
    const press = (key: string) => act(() => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    })

    it('is a menu button that moves focus into the menu', async () => {
      await mount()
      select('one')
      click('Copy block')
      select('cols')
      expect(trigger().getAttribute('aria-haspopup')).toBe('menu')
      expect(trigger().getAttribute('aria-expanded')).toBe('false')

      click('Paste inside')
      expect(trigger().getAttribute('aria-expanded')).toBe('true')
      expect(trigger().getAttribute('aria-controls')).toBe(document.querySelector('[role="menu"]')!.id)
      expect(document.activeElement).toBe(items()[0])
      expect(items().map((item) => item.tabIndex)).toEqual([0, -1])
    })

    it('moves with Up, Down, Home and End, wrapping around', async () => {
      await openMenu()
      press('ArrowDown')
      expect(document.activeElement).toBe(items()[1])
      expect(items().map((item) => item.tabIndex)).toEqual([-1, 0])
      press('ArrowDown')
      expect(document.activeElement).toBe(items()[0])
      press('ArrowUp')
      expect(document.activeElement).toBe(items()[1])
      press('Home')
      expect(document.activeElement).toBe(items()[0])
      press('End')
      expect(document.activeElement).toBe(items()[1])
    })

    it('closes on Escape and gives focus back to the trigger', async () => {
      await openMenu()
      press('Escape')
      expect(items()).toEqual([])
      expect(document.activeElement).toBe(trigger())
      expect(trigger().getAttribute('aria-expanded')).toBe('false')
    })

    it('closes on a click outside', async () => {
      await openMenu()
      act(() => { document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })) })
      expect(items()).toEqual([])
    })

    it('has no menu semantics for a block with one slot', async () => {
      await mount()
      select('one')
      click('Copy block')
      select('exp')
      expect(trigger().hasAttribute('aria-haspopup')).toBe(false)
    })
  })

  describe('announcements', () => {
    it('keeps the live region in the page, hidden from view, and announces a repeat', async () => {
      await mount()
      const region = document.querySelector<HTMLElement>('[data-payload-puck-clipboard-status]')!
      expect(region.getAttribute('aria-live')).toBe('polite')
      expect(region.style.display).not.toBe('none')
      expect(region.textContent).toBe('')

      select('one')
      click('Copy block')
      const first = region.firstElementChild
      click('Copy block')
      expect(region.textContent).toBe('Block copied.')
      // A new node, so screen readers announce it again
      expect(region.firstElementChild).not.toBe(first)
    })

    it("says so when a block holds something that can't be copied", async () => {
      const data = initialData()
      ;(data.content[0].props as any).content[0].props.onClick = () => {}
      await mount(data)
      select('one')
      click('Copy block')
      expect(status()).toBe("This block holds something that can't be copied.")
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
    })
  })

  describe('without Web Crypto (an admin served over plain http)', () => {
    it('copies and pastes in the tab, with no randomUUID or subtle', async () => {
      const realCrypto = globalThis.crypto
      vi.stubGlobal('crypto', { getRandomValues: <T extends ArrayBufferView>(array: T) => realCrypto.getRandomValues(array) })

      await mount()
      select('one')
      click('Copy block')
      expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
      expect(session.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
      click('Paste after')
      const pasted = slot('box', 'content')[1]
      expect(pasted.props.text).toBe('One')
      expect(pasted.props.id).toMatch(/^Leaf-[0-9a-f-]{36}$/)
    })
  })

  it('leaves Cmd/Ctrl+C to the browser until the clipboard is ready', () => {
    const editorClipboard = createEditorClipboard(USER)
    const overrides = composeClipboardOverrides(composeVisibilityOverrides({
      puck: ({ children }: { children: ReactNode }) => createElement(Fragment, null, createElement(Capture), children),
    }), editorClipboard)
    act(() => {
      root.render(createElement(Puck, { config, data: initialData(), overrides, iframe: { enabled: false } } as any))
    })
    // Hashing the user id hasn't finished: no store yet
    expect(editorClipboard.store()).toBeUndefined()
    select('one')
    expect(key(document.body, 'c').defaultPrevented).toBe(false)
    expect(button('Copy block')).toBeNull()
  })

  it("without Web Crypto, never offers one user's copy to the next user in the same tab", async () => {
    const realCrypto = globalThis.crypto
    vi.stubGlobal('crypto', { getRandomValues: <T extends ArrayBufferView>(array: T) => realCrypto.getRandomValues(array) })
    await mount()
    select('one')
    click('Copy block')
    expect(session.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()

    await remount(initialData(), undefined, { userId: 'user-2' })
    select('one')
    expect(button('Paste after')).toBeNull()

    await remount(initialData(), undefined, USER)
    select('one')
    expect(button('Paste after')).not.toBeNull()
  })

  it('never copies a block while text is selected', async () => {
    await mount()
    select('one')
    const text = document.createElement('p')
    text.textContent = 'Some words'
    document.body.append(text)
    const range = document.createRange()
    range.selectNodeContents(text)
    document.getSelection()!.removeAllRanges()
    document.getSelection()!.addRange(range)

    expect(key(document.body, 'c').defaultPrevented).toBe(false)
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
    document.getSelection()!.removeAllRanges()
    text.remove()
  })
})
