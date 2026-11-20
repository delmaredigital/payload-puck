/**
 * Editor side of block visibility: override composition, the action bar
 * toggle (driven through Puck's real reducer), and the generated CSS.
 */

import { createElement, Fragment, type ReactElement, type ReactNode } from 'react'
import type { ComponentData, Config, Data, Overrides } from '@puckeditor/core'
import { createReducer } from '@puckeditor/core/internal'
import { describe, expect, it } from 'vitest'

import {
  DefaultActionBar,
  VisibilityAction,
  VisibilityCanvasStyles,
  VisibilityEditorStyles,
  OWNER_ATTRIBUTE,
  collectVisibilityEntries,
  composeVisibilityOverrides,
  visibilityEntriesFor,
  toggleVisibilityAction,
} from '../../src/visibility/editor.js'
import { buildCanvasCss, buildOutlineCss, cssString } from '../../src/visibility/css.js'
import { resetProps } from '../../src/fields/ResetField.js'
import { withBlockVisibility } from '../../src/visibility/withBlockVisibility.js'

type ActionBarProps = Parameters<Overrides['actionBar']>[0]

const barProps = (children: ReactNode): ActionBarProps => ({
  label: 'Heading',
  children,
  parentAction: null,
})

const childrenOf = (element: ReactElement): ReactNode[] => {
  const { children } = element.props as { children?: ReactNode }
  return Array.isArray(children) ? children : [children]
}

describe('composeVisibilityOverrides', () => {
  const puckActions = createElement('span', { key: 'dup' }, 'duplicate')

  it("puts the toggle first in Puck's default action bar", () => {
    const { actionBar } = composeVisibilityOverrides({})
    const bar = actionBar!(barProps(puckActions)) as ReactElement
    expect(bar.type).toBe(DefaultActionBar)
    const [toggle, rest] = childrenOf(bar)
    expect((toggle as ReactElement).type).toBe(VisibilityAction)
    expect(rest).toBe(puckActions)
  })

  it("keeps a host's own action bar and passes the toggle into it", () => {
    const HostBar = (props: ActionBarProps) => createElement('div', { className: 'host' }, props.children)
    const { actionBar } = composeVisibilityOverrides({ actionBar: HostBar })
    const bar = actionBar!(barProps(puckActions)) as ReactElement
    expect(bar.type).toBe(HostBar)
    expect((bar.props as ActionBarProps).label).toBe('Heading')
    const [toggle, rest] = childrenOf(bar)
    expect((toggle as ReactElement).type).toBe(VisibilityAction)
    expect(rest).toBe(puckActions)
  })

  it("keeps a host's iframe and puck overrides and adds the styles beside them", () => {
    const HostIframe = ({ children }: { children: ReactNode }) => createElement('div', null, children)
    const HostPuck = ({ children }: { children: ReactNode }) => createElement('div', null, children)
    const headerActions = ({ children }: { children: ReactNode }) => createElement(Fragment, null, children)
    const composed = composeVisibilityOverrides({ iframe: HostIframe, puck: HostPuck, headerActions })
    expect(composed.headerActions).toBe(headerActions)

    const canvas = composed.iframe!({ children: 'canvas' }) as ReactElement
    expect(canvas.type).toBe(Fragment)
    const [canvasStyles, iframe] = childrenOf(canvas) as ReactElement[]
    expect(canvasStyles.type).toBe(VisibilityCanvasStyles)
    expect(iframe.type).toBe(HostIframe)
    expect((iframe.props as { children: ReactNode }).children).toBe('canvas')

    const ui = composed.puck!({ children: 'ui' }) as ReactElement
    const [editorStyles, puck] = childrenOf(ui) as ReactElement[]
    expect(editorStyles.type).toBe(VisibilityEditorStyles)
    expect(puck.type).toBe(HostPuck)
  })

  it("marks each overlay with its block id, keeping a host's componentOverlay", () => {
    const HostOverlay = ({ children }: { children: ReactNode }) => createElement('div', null, children)
    const overlayProps = { children: 'overlay', hover: false, isSelected: true, componentId: 'Heading-1', componentType: 'Heading' }
    for (const host of [undefined, HostOverlay]) {
      const overlay = composeVisibilityOverrides(host ? { componentOverlay: HostOverlay } : {}).componentOverlay!(overlayProps) as ReactElement
      const [marker, rest] = childrenOf(overlay) as ReactElement[]
      expect(marker.props).toEqual({ hidden: true, [OWNER_ATTRIBUTE]: 'Heading-1' })
      if (host) expect(rest.type).toBe(HostOverlay)
      else expect(rest).toBe('overlay')
    }
  })

  it('passes children straight through when there is no host override', () => {
    const composed = composeVisibilityOverrides({})
    expect(childrenOf(composed.iframe!({ children: 'canvas' }) as ReactElement)[1]).toBe('canvas')
    expect(childrenOf(composed.puck!({ children: 'ui' }) as ReactElement)[1]).toBe('ui')
  })
})

// -----------------------------------------------------------------------------
// Puck's real reducer. Its only use of the app store is `appStore.config`.
// -----------------------------------------------------------------------------

const config = withBlockVisibility({
  components: {
    Box: { fields: { content: { type: 'slot' }, title: { type: 'text' } }, render: () => null },
    Leaf: { fields: { text: { type: 'text' } }, render: () => null },
  },
} as unknown as Config)

function puckState(data: Partial<Data>) {
  const reducer = createReducer({ appStore: { config } as any })
  const empty = { data: { root: { props: {} }, content: [], zones: {} }, ui: {}, indexes: { nodes: {}, zones: {} } } as any
  let state = reducer(empty, { type: 'setData', data: () => data as Data })
  return {
    dispatch(action: Parameters<typeof reducer>[1]) {
      state = reducer(state, action)
    },
    get data() {
      return state.data as Data
    },
    selector(id: string) {
      const node = state.indexes.nodes[id]
      const zone = `${node.parentId}:${node.zone}`
      return { zone, index: state.indexes.zones[zone].contentIds.indexOf(id) }
    },
    item(id: string) {
      return state.indexes.nodes[id].data as ComponentData
    },
  }
}

const nested = (): Partial<Data> => ({
  root: { props: {} },
  content: [
    { type: 'Box', props: { id: 'box', title: 'Outer', content: [{ type: 'Leaf', props: { id: 'leaf', text: 'Inner' } }] } },
  ],
})

describe('toggleVisibilityAction through the real reducer', () => {
  it('hides and shows a block nested in a slot, keeping its other props', () => {
    const puck = puckState(nested())
    puck.dispatch(toggleVisibilityAction(puck.item('leaf'), puck.selector('leaf')))
    expect(puck.item('leaf').props).toEqual({ id: 'leaf', text: 'Inner', _visibility: { hidden: true } })

    puck.dispatch(toggleVisibilityAction(puck.item('leaf'), puck.selector('leaf')))
    expect(puck.item('leaf').props).toEqual({ id: 'leaf', text: 'Inner' })
  })

  it("hides a parent without touching its slot's children", () => {
    const puck = puckState(nested())
    puck.dispatch(toggleVisibilityAction(puck.item('box'), puck.selector('box')))
    const box = puck.data.content[0]
    expect(box.props._visibility).toEqual({ hidden: true })
    expect((box.props.content as ComponentData[])[0].props).toEqual({ id: 'leaf', text: 'Inner' })
  })

  it('is a recorded replace action, so undo/redo cover it', () => {
    const puck = puckState(nested())
    const action = toggleVisibilityAction(puck.item('leaf'), puck.selector('leaf'))
    expect(action).toMatchObject({ type: 'replace', destinationZone: 'box:content', destinationIndex: 0 })
    expect(action).not.toHaveProperty('recordHistory')
  })

  it('restores screen-size choices when a hidden block is shown again', () => {
    const data = nested()
    ;(data.content![0].props.content as ComponentData[])[0].props._visibility = { hideOn: ['phone'] }
    const puck = puckState(data)
    puck.dispatch(toggleVisibilityAction(puck.item('leaf'), puck.selector('leaf')))
    expect(puck.item('leaf').props._visibility).toEqual({ hidden: true, hideOn: ['phone'] })
    puck.dispatch(toggleVisibilityAction(puck.item('leaf'), puck.selector('leaf')))
    expect(puck.item('leaf').props._visibility).toEqual({ hideOn: ['phone'] })
  })

  it('duplicating a hidden block keeps it hidden, including blocks inside it', () => {
    const data = nested()
    data.content![0].props._visibility = { hidden: true }
    ;(data.content![0].props.content as ComponentData[])[0].props._visibility = { hideOn: ['tablet'] }
    const puck = puckState(data)
    puck.dispatch({ type: 'duplicate', sourceIndex: 0, sourceZone: 'root:default-zone' })

    const [original, copy] = puck.data.content
    expect(copy.props.id).not.toBe(original.props.id)
    expect(copy.props._visibility).toEqual({ hidden: true })
    const innerCopy = (copy.props.content as ComponentData[])[0]
    expect(innerCopy.props.id).not.toBe('leaf')
    expect(innerCopy.props._visibility).toEqual({ hideOn: ['tablet'] })
  })
})

describe('resetProps', () => {
  it("resets a block's styles but not whether it is shown", () => {
    expect(resetProps({ text: 'Default', _visibility: { hidden: true } }, { text: 'Custom', _visibility: { hideOn: ['phone'] } }))
      .toEqual({ text: 'Default', _visibility: { hideOn: ['phone'] } })
    expect(resetProps({ text: 'Default' }, { text: 'Custom' })).toEqual({ text: 'Default' })
  })

  it('keeps what is inside slots at any depth, resetting everything else', () => {
    const fields = {
      content: { type: 'slot' },
      tabs: { type: 'array', arrayFields: { label: { type: 'text' }, body: { type: 'slot' } } },
      plain: { type: 'array', arrayFields: { label: { type: 'text' } } },
      side: { type: 'object', objectFields: { heading: { type: 'text' }, aside: { type: 'slot' } } },
    }
    const child = { type: 'Leaf', props: { id: 'c' } }
    expect(resetProps(
      { title: 'Default', content: [], tabs: [], plain: [{ label: 'One' }], side: { heading: 'Default', aside: [] } },
      { title: 'Custom', content: [child], tabs: [{ label: 'Mine', body: [child] }], plain: [{ label: 'Mine' }], side: { heading: 'Mine', aside: [child] } },
      fields,
    )).toEqual({
      title: 'Default',
      content: [child],
      tabs: [{ label: 'Mine', body: [child] }],
      plain: [{ label: 'One' }],
      side: { heading: 'Default', aside: [child] },
    })
  })
})

describe('collectVisibilityEntries', () => {
  it('finds hidden blocks at any depth, inside hidden blocks and in legacy zones', () => {
    const data = {
      root: { props: {} },
      content: [
        { type: 'Box', props: { id: 'box', _visibility: { hidden: true }, content: [
          { type: 'Leaf', props: { id: 'inner', _visibility: { hideOn: ['phone'] } } },
          { type: 'Leaf', props: { id: 'plain' } },
        ] } },
      ],
    } as unknown as Data
    const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id)
    // A legacy DropZone zone of a top-level block
    ;(data.content as any[]).push({ type: 'Leaf', props: { id: 'zoneHost' } })
    ;(data as any).zones = { 'zoneHost:left': [{ type: 'Leaf', props: { id: 'zoned', _visibility: { hidden: true } } }] }
    expect(collectVisibilityEntries(data, config).sort(byId)).toEqual([
      { id: 'box', visibility: { hidden: true, hideOn: [] } },
      { id: 'inner', visibility: { hidden: false, hideOn: ['phone'] } },
      { id: 'zoned', visibility: { hidden: true, hideOn: [] } },
    ])
  })
})

describe('visibilityEntriesFor', () => {
  it('walks each data object once for both style sheets', () => {
    const data = { root: { props: {} }, content: [{ type: 'Leaf', props: { id: 'a', _visibility: { hidden: true } } }] } as unknown as Data
    const first = visibilityEntriesFor(data, config)
    expect(visibilityEntriesFor(data, config)).toBe(first)
    expect(visibilityEntriesFor({ ...data }, config)).not.toBe(first)
  })
})

describe('editor CSS', () => {
  const hidden = { id: 'Heading-1', visibility: { hidden: true, hideOn: [] } }
  const phone = { id: 'Text-2', visibility: { hidden: false, hideOn: ['phone' as const] } }

  it('grays and badges a hidden block through its content, not the block element', () => {
    const css = buildCanvasCss([hidden])
    expect(css).toContain('[data-puck-component="Heading-1"]::after{content:"Hidden";')
    expect(css).toContain('[data-puck-component="Heading-1"]>*{opacity:.45;filter:grayscale(1);}')
    // The block element itself is outlined, never dimmed
    expect(css).not.toMatch(/\[data-puck-component="Heading-1"\]\{[^}]*opacity/)
  })

  it('grays a per-size block only at that size but always badges it', () => {
    const css = buildCanvasCss([phone])
    expect(css).toContain('[data-puck-component="Text-2"]::after{content:"Hidden on phone";')
    expect(css).toContain('@media (max-width: 767.98px){[data-puck-component="Text-2"]>*{opacity:.45;')
    expect(css.split('\n').filter((rule) => rule.includes('opacity')).every((rule) => rule.startsWith('@media'))).toBe(true)
  })

  it('dims and tags a Hidden row in the Outline, and only tags a per-size row', () => {
    const css = buildOutlineCss([hidden, phone])
    expect(css).toContain('[data-puck-layer-tree-id="Heading-1"]{position:relative;opacity:.55;}')
    expect(css).toContain('[data-puck-layer-tree-id="Heading-1"]::before{content:"Hidden";')
    expect(css).toContain('[data-puck-layer-tree-id="Text-2"]{position:relative;}')
    expect(css).toContain('[data-puck-layer-tree-id="Text-2"]::before{content:"Hidden on phone";')
  })

  it('uses media queries older Safari understands (no range syntax)', () => {
    expect(buildCanvasCss([phone, { ...phone, id: 'b', visibility: { hidden: false, hideOn: ['tablet', 'desktop'] } }]))
      .not.toMatch(/width\s*[<>]/)
  })

  it('emits nothing when no block is hidden', () => {
    expect(buildCanvasCss([])).toBe('')
    expect(buildOutlineCss([{ id: 'a', visibility: { hidden: false, hideOn: [] } }])).toBe('')
  })

  it('quotes ids safely', () => {
    expect(cssString('Heading-1_a b')).toBe('"Heading-1_a b"')
    expect(cssString('a"b\\c')).toBe('"a\\22 b\\5c c"')
    // Every CSS newline, NUL, and the characters that could end the rule or <style>
    for (const hostile of ['x"]{}*{display:none', 'x\ry', 'x\fy', 'x\ny', 'x\0y', '</style><script>']) {
      const quoted = cssString(hostile)
      expect(quoted.slice(1, -1), JSON.stringify(hostile)).toMatch(/^[A-Za-z0-9 _\\-]*$/)
    }
    expect(cssString('\0')).toBe('"\\fffd "')
    expect(buildCanvasCss([{ ...hidden, id: 'x"]{}' }])).toContain('[data-puck-component="x\\22 \\5d \\7b \\7d "]')
  })
})
