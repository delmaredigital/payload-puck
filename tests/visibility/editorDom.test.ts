// @vitest-environment happy-dom

/**
 * Block visibility inside the real Puck editor (happy-dom, canvas without an
 * iframe). Covers what a DOM can show: hidden blocks stay rendered, selectable
 * and wired for drag; the action bar toggle; undo/redo; duplicate; the styles
 * keyed on Puck's markup; and a host action bar override kept in place.
 * Visual checks (graying, badge placement, action bar not dimmed) need a real
 * browser.
 */

import { act, createElement, Fragment, useEffect, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Puck, Render, outlinePlugin, useGetPuck, type ComponentData, type Config, type Data, type Overrides } from '@puckeditor/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { withBlockVisibility } from '../../src/visibility/withBlockVisibility.js'
import { composeVisibilityOverrides, ownerBlock } from '../../src/visibility/editor.js'

const components = {
    Box: {
      fields: { content: { type: 'slot' } },
      render: ({ content: Content }: { content: () => ReactNode }) => createElement('section', null, createElement(Content)),
    },
    Leaf: {
      fields: { text: { type: 'text' } },
      render: ({ text }: { text: string }) => createElement('p', null, text),
    },
}
const config = withBlockVisibility({ components } as unknown as Config)

const initialData = (): Data => ({
  root: { props: {} },
  content: [
    { type: 'Box', props: { id: 'box', content: [
      { type: 'Leaf', props: { id: 'hidden', text: 'Hidden text', _visibility: { hidden: true } } },
      { type: 'Leaf', props: { id: 'shown', text: 'Shown text' } },
    ] } },
  ],
} as unknown as Data)

let root: Root
let container: HTMLDivElement
let getPuck: ReturnType<typeof useGetPuck>

function Capture() {
  getPuck = useGetPuck()
  return null
}

function mount(hostOverrides: Partial<Overrides> = {}, puckConfig: Config = config) {
  const overrides = composeVisibilityOverrides({
    ...hostOverrides,
    // A host `puck` override: also proves ours wraps rather than replaces it
    puck: ({ children }: { children: ReactNode }) => createElement(Fragment, null, createElement(Capture), children),
  })
  act(() => {
    root.render(createElement(Puck, {
      config: puckConfig,
      data: initialData(),
      overrides,
      plugins: [outlinePlugin()],
      iframe: { enabled: false },
      ui: { plugin: { current: 'outline' }, itemExpanded: { box: true } },
    } as any))
  })
}

const data = () => getPuck().appState.data
const leaf = (id: string) =>
  ((data().content[0].props as { content: ComponentData[] }).content).find((item) => item.props.id === id)

function select(id: string) {
  act(() => {
    const selector = getPuck().getSelectorForId(id)!
    getPuck().dispatch({ type: 'setUi', ui: { itemSelector: selector } })
  })
}

/** Puck records history 300ms after the last change */
const recorded = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 350)))

const button = (title: string) => document.querySelector<HTMLButtonElement>(`button[title="${title}"]`)

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
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

describe('block visibility in the Puck editor', () => {
  it('keeps a hidden block rendered, selectable and wired for drag', () => {
    mount()
    const block = document.querySelector('[data-puck-component="hidden"]')
    expect(block?.textContent).toContain('Hidden text')
    expect(block?.hasAttribute('data-puck-dnd')).toBe(true)

    select('hidden')
    expect(getPuck().selectedItem?.props.id).toBe('hidden')
    expect(button('Show block')).not.toBeNull()
  })

  it('renders Outline rows with data-puck-layer-tree-id and styles them', () => {
    mount()
    // Contract: the Outline tag depends on this attribute
    expect(document.querySelector('[data-puck-layer-tree-id="hidden"]')).not.toBeNull()
    expect(document.querySelector('[data-puck-layer-tree-id="shown"]')).not.toBeNull()

    const css = document.querySelector('style[data-payload-puck-visibility="editor"]')?.textContent ?? ''
    expect(css).toContain('[data-puck-layer-tree-id="hidden"]::before{content:"Hidden";')
    expect(css).toContain('[data-puck-component="hidden"]>*{opacity:.45;')
    expect(css).not.toContain('"shown"')
  })

  it('toggles from the action bar, and undo/redo restore each state', async () => {
    mount()
    select('shown')
    await recorded()
    act(() => button('Hide block')!.click())
    await recorded()
    expect(leaf('shown')?.props._visibility).toEqual({ hidden: true })
    expect(button('Show block')).not.toBeNull()
    expect(document.querySelector('style[data-payload-puck-visibility="editor"]')?.textContent)
      .toContain('[data-puck-component="shown"]')

    act(() => getPuck().history.back())
    expect(leaf('shown')?.props).not.toHaveProperty('_visibility')

    act(() => getPuck().history.forward())
    expect(leaf('shown')?.props._visibility).toEqual({ hidden: true })

    act(() => button('Show block')!.click())
    expect(leaf('shown')?.props).not.toHaveProperty('_visibility')
  })

  it('keeps the hidden state on a duplicate', () => {
    mount()
    act(() => getPuck().dispatch({ type: 'duplicate', sourceIndex: 0, sourceZone: 'box:content' }))
    const [original, copy] = (data().content[0].props as { content: ComponentData[] }).content
    expect(copy.props.id).not.toBe(original.props.id)
    expect(copy.props._visibility).toEqual({ hidden: true })
  })

  it("acts on the block whose bar it is in, not the selected one", () => {
    mount()
    select('shown')
    // Hovering another block gives it an overlay and action bar too
    act(() => {
      document.querySelector('[data-puck-component="hidden"]')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    })
    const bars = [...document.querySelectorAll('[data-puck-overlay]')]
    const hoveredBar = bars.find((bar) => bar.querySelector('[data-payload-puck-visibility-owner="hidden"]'))
    const selectedBar = bars.find((bar) => bar.querySelector('[data-payload-puck-visibility-owner="shown"]'))
    expect(hoveredBar && selectedBar).toBeTruthy()
    expect(hoveredBar!.querySelector('button[title="Show block"]')).not.toBeNull()
    expect(selectedBar!.querySelector('button[title="Hide block"]')).not.toBeNull()

    act(() => hoveredBar!.querySelector<HTMLButtonElement>('button[title="Show block"]')!.click())
    expect(leaf('hidden')?.props).not.toHaveProperty('_visibility')
    expect(leaf('shown')?.props).not.toHaveProperty('_visibility')
  })

  it('offers no toggle on a block that may not be edited', () => {
    const locked = withBlockVisibility({
      components: { ...components, Leaf: { ...components.Leaf, permissions: { edit: false } } },
    } as unknown as Config)
    mount({}, locked)
    select('shown')
    expect(button('Duplicate')).not.toBeNull()
    expect(button('Hide block')).toBeNull()
  })

  it('honors resolvePermissions per block', async () => {
    const perBlock = withBlockVisibility({
      components: {
        ...components,
        Leaf: { ...components.Leaf, resolvePermissions: (data: ComponentData) => ({ edit: data.props.id !== 'shown' }) },
      },
    } as unknown as Config)
    mount({}, perBlock)
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 50)))
    select('shown')
    expect(button('Hide block')).toBeNull()
    select('hidden')
    expect(button('Show block')).not.toBeNull()
  })

  it("keeps a host's own action bar, with the toggle inside it", () => {
    mount({
      actionBar: ({ children }) => createElement('div', { 'data-host-bar': '' }, children),
    })
    select('shown')
    const host = document.querySelector('[data-host-bar]')
    expect(host).not.toBeNull()
    expect(host!.querySelector('button[title="Hide block"]')).not.toBeNull()
    // Puck's own actions are still passed in
    expect(host!.querySelector('button[title="Duplicate"]')).not.toBeNull()
  })

  describe('when the block a toggle belongs to goes away', () => {
    // A throw inside Puck's store selectors surfaces as a React error report.
    // Puck logs unrelated noise here (localStorage, act warnings), so look for
    // the getItemById failure itself or React's report of an uncaught error
    const errors = () =>
      (console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls
        .map((args) => args.map((arg) => (arg instanceof Error ? `${arg.name}: ${arg.message}` : String(arg))).join(' '))
        .filter((line) => /reading 'data'|error occurred in|Uncaught/i.test(line))
    beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}) })

    function hover(id: string) {
      act(() => {
        document.querySelector(`[data-puck-component="${id}"]`)!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      })
    }

    it("looks up a deleted block without throwing (Puck's getItemById would)", () => {
      mount()
      act(() => getPuck().dispatch({ type: 'remove', index: 0, zone: 'box:content' }))
      // The real Puck API: getItemById throws for an id that is gone...
      expect(() => getPuck().getItemById('hidden')).toThrow()
      // ...so the toggle's lookup must not call it for one
      expect(ownerBlock(getPuck(), 'hidden')).toBeUndefined()
      expect(ownerBlock(getPuck(), null)).toBeUndefined()
      expect(ownerBlock(getPuck(), 'shown')?.props.id).toBe('shown')
    })

    // React catches errors thrown by store selectors while notifying, and
    // these bars unmount with their blocks, so the scenarios below pass even
    // without the guard. They pin that the real flows stay error-free.
    it('does not throw when the hovered block is deleted', () => {
      mount()
      select('shown')
      hover('hidden')
      expect(() => act(() => getPuck().dispatch({ type: 'remove', index: 0, zone: 'box:content' }))).not.toThrow()
      expect(leaf('hidden')).toBeUndefined()
      expect(errors()).toEqual([])
    })

    it('does not throw when the selected block is deleted', () => {
      mount()
      select('shown')
      expect(button('Hide block')).not.toBeNull()
      expect(() => act(() => getPuck().dispatch({ type: 'remove', index: 1, zone: 'box:content' }))).not.toThrow()
      expect(leaf('shown')).toBeUndefined()
      expect(errors()).toEqual([])
    })

    it('does not throw when undo removes a newly inserted, selected block', async () => {
      mount()
      await recorded()
      act(() => getPuck().dispatch({
        type: 'insert', componentType: 'Leaf', destinationIndex: 0, destinationZone: 'box:content', id: 'added',
      }))
      select('added')
      await recorded()
      expect(button('Hide block')).not.toBeNull()
      expect(() => act(() => getPuck().history.back())).not.toThrow()
      expect(leaf('added')).toBeUndefined()
      expect(errors()).toEqual([])
    })
  })
})

describe('wrapped blocks on a live page', () => {
  it('stay mounted when the host passes a new config object on every render', () => {
    let mounts = 0
    function Stateful() {
      useEffect(() => { mounts++ }, [])
      return createElement('p', null, 'stateful')
    }
    const base = { components: { Stateful: { render: Stateful } } } as unknown as Config
    const data = { root: { props: {} }, content: [{ type: 'Stateful', props: { id: 's' } }] } as unknown as Data

    act(() => root.render(createElement(Render, { config: withBlockVisibility({ ...base }), data })))
    act(() => root.render(createElement(Render, { config: withBlockVisibility({ ...base }), data })))
    act(() => root.render(createElement(Render, { config: withBlockVisibility({ ...base, root: {} }), data })))
    expect(container.textContent).toBe('stateful')
    expect(mounts).toBe(1)
  })
})
