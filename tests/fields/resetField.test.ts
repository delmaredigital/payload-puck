// @vitest-environment happy-dom

/**
 * "Reset to defaults" inside the real Puck editor: it resets only that block
 * with one atomic action (no whole-document `setData`, which Puck warns is
 * expensive), works for a block nested in a slot, keeps the block's
 * visibility, and undoes in one step.
 */

import { act, createElement, Fragment, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Puck, useGetPuck, type ComponentData, type Config, type Data } from '@puckeditor/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createResetField } from '../../src/fields/ResetField.js'

const leafDefaults = { text: 'Default text', size: 'md' }

const panelDefaults = {
  title: 'Default title',
  content: [],
  tabs: [{ label: 'Tab', body: [] }],
  side: { heading: 'Default heading', aside: [] },
}

const config = {
  components: {
    Box: {
      fields: { content: { type: 'slot' } },
      render: ({ content: Content }: { content: () => ReactNode }) => createElement('section', null, createElement(Content)),
    },
    // A container with a slot, slots inside an array field and inside an object field
    Panel: {
      fields: {
        _reset: createResetField({ defaultProps: panelDefaults }),
        title: { type: 'text' },
        content: { type: 'slot' },
        tabs: { type: 'array', arrayFields: { label: { type: 'text' }, body: { type: 'slot' } } },
        side: { type: 'object', objectFields: { heading: { type: 'text' }, aside: { type: 'slot' } } },
      },
      defaultProps: panelDefaults,
      render: ({ content: Content }: { content: () => ReactNode }) => createElement('div', null, createElement(Content)),
    },
    Leaf: {
      fields: { _reset: createResetField({ defaultProps: leafDefaults }), text: { type: 'text' }, size: { type: 'text' } },
      defaultProps: leafDefaults,
      render: ({ text }: { text: string }) => createElement('p', null, text),
    },
  },
} as unknown as Config

const initialData = (): Data => ({
  root: { props: {} },
  content: [
    { type: 'Box', props: { id: 'box', content: [
      { type: 'Leaf', props: { id: 'nested', text: 'Custom text', size: 'xl', _visibility: { hideOn: ['phone'] } } },
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

const nested = () =>
  ((getPuck().appState.data.content[0].props as { content: ComponentData[] }).content)[0]

/** Puck records history 300ms after the last change: run that timer now */
const recorded = () => act(() => { vi.advanceTimersByTime(350) })

/** Fakes only timers, so Puck's history debounce runs exactly when `recorded()` says. */
const fakeHistoryTimers = () => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

const leaf = (id: string, text: string) => ({ type: 'Leaf', props: { id, text, size: 'md' } })

/** A Panel full of content, with custom settings, at the top and inside a Box. */
const panelData = (): Data => {
  const panel = (id: string) => ({
    type: 'Panel',
    props: {
      id,
      title: 'Custom title',
      content: [leaf(`${id}-a`, 'In content')],
      tabs: [{ label: 'First', body: [leaf(`${id}-b`, 'In tab')] }, { label: 'Second', body: [] }],
      side: { heading: 'Custom heading', aside: [leaf(`${id}-c`, 'In aside')] },
    },
  })
  return {
    root: { props: {} },
    content: [panel('top'), { type: 'Box', props: { id: 'box', content: [panel('inner')] } }],
  } as unknown as Data
}

function mount(data: Data = initialData(), select = 'nested') {
  act(() => {
    root.render(createElement(Puck, {
      config,
      data,
      iframe: { enabled: false },
      overrides: { puck: ({ children }: { children: ReactNode }) => createElement(Fragment, null, createElement(Capture), children) },
    } as any))
  })
  act(() => {
    getPuck().dispatch({ type: 'setUi', ui: { itemSelector: getPuck().getSelectorForId(select)! } })
  })
}

const resetButton = () =>
  [...document.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Reset to defaults')!

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  vi.useRealTimers()
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Reset to defaults', () => {
  it('resets a block nested in a slot, keeping its visibility, without setData', async () => {
    fakeHistoryTimers()
    const warn = vi.spyOn(console, 'warn')
    mount()
    await recorded()

    act(() => resetButton().click())

    expect(nested().props).toEqual({ id: 'nested', text: 'Default text', size: 'md', _visibility: { hideOn: ['phone'] } })
    expect(warn.mock.calls.flat().join(' ')).not.toContain('setData')
  })

  it('undoes in one step', async () => {
    fakeHistoryTimers()
    mount()
    await recorded()
    act(() => resetButton().click())
    await recorded()
    expect(nested().props).toMatchObject({ text: 'Default text', size: 'md' })

    act(() => getPuck().history.back())
    expect(nested().props).toMatchObject({ text: 'Custom text', size: 'xl' })
  })

  it.each(['top', 'inner'])("resets a container's settings and keeps everything inside it (%s)", (id) => {
    mount(panelData(), id)
    act(() => resetButton().click())

    const props = getPuck().getItemById(id)!.props as any
    expect(props.title).toBe('Default title')
    expect(props.content.map((block: ComponentData) => block.props.id)).toEqual([`${id}-a`])
    // An array holding slots keeps its items, so their content stays
    expect(props.tabs.map((tab: any) => [tab.label, tab.body.map((block: ComponentData) => block.props.id)]))
      .toEqual([['First', [`${id}-b`]], ['Second', []]])
    // An object holding a slot resets its other settings and keeps the slot
    expect(props.side.heading).toBe('Default heading')
    expect(props.side.aside.map((block: ComponentData) => block.props.id)).toEqual([`${id}-c`])
    // And Puck still finds every child
    for (const child of ['a', 'b', 'c']) expect(getPuck().getSelectorForId(`${id}-${child}`)).toBeDefined()
  })
})
