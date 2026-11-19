/**
 * withBlockVisibility: the config transform that gives every block show/hide.
 * Live-page behavior is checked by rendering through Puck's real <Render>.
 */

import { createElement, isValidElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Render, type ComponentConfig, type Config, type Data } from '@puckeditor/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { withBlockVisibility } from '../../src/visibility/withBlockVisibility.js'
import { walkShownBlocks } from '../../src/visibility/index.js'
import { isWrapped } from './isWrapped.js'
import { LIVE_CSS, LIVE_STYLE_HREF } from '../../src/visibility/css.js'
import { resetIntegrationWarningsForTests } from '../../src/config/merge.js'
import { createFieldLayout } from '../../src/fields/fieldLayout.js'
import { emailEditorConfig } from '../../src/config/config.email.editor.js'
import { emailBaseConfig } from '../../src/config/config.email.js'
import { renderToEmailHtml } from '../../src/email/renderToEmailHtml.js'
import { PageRenderer } from '../../src/render/PageRenderer.js'

const leafRender = vi.fn(({ text }: { text: string }) => createElement('p', null, text))

const hostConfig = {
  root: { fields: { title: { type: 'text' } }, render: ({ children }: { children: ReactNode }) => createElement('main', null, children) },
  components: {
    Box: {
      fields: { content: { type: 'slot' } },
      render: ({ content: Content }: { content: () => ReactNode }) => createElement('section', null, createElement(Content)),
    },
    Leaf: { fields: { text: { type: 'text' } }, render: leafRender },
  },
} as unknown as Config

const leaf = (id: string, text: string, _visibility?: unknown) => ({
  type: 'Leaf',
  props: { id, text, ...(_visibility ? { _visibility } : {}) },
})

const page = (content: unknown[]): Data => ({ root: { props: {} }, content } as unknown as Data)

const render = (config: Config, data: Data) => renderToStaticMarkup(createElement(Render, { config, data }))

// Puck's <Render> wraps each zone and slot in a <div>

afterEach(() => {
  leafRender.mockClear()
  resetIntegrationWarningsForTests()
  vi.restoreAllMocks()
})

describe('withBlockVisibility — config', () => {
  const config = withBlockVisibility(hostConfig)

  it('adds the Visibility field to every block, first, and leaves the root alone', () => {
    for (const name of ['Box', 'Leaf']) {
      const component = config.components[name] as ComponentConfig
      expect(Object.keys(component.fields ?? {})[0], name).toBe('_visibility')
      expect(isWrapped(component)).toBe(true)
    }
    expect(config.root).toBe(hostConfig.root)
    expect((config.root as ComponentConfig).fields).not.toHaveProperty('_visibility')
  })

  it('keeps the rest of each block config', () => {
    const box = config.components.Box as ComponentConfig
    expect(box.fields).toHaveProperty('content', { type: 'slot' })
  })

  it('is idempotent: a wrapped config comes back unchanged', () => {
    expect(withBlockVisibility(config)).toBe(config)
    expect(withBlockVisibility({ ...config }).components).toBe(config.components)
  })

  it('gives every config built from the same blocks the same render', () => {
    // e.g. a host passing `{ ...baseConfig, root }` inline on every render
    const a = withBlockVisibility({ ...hostConfig })
    const b = withBlockVisibility({ ...hostConfig })
    expect(a).not.toBe(b)
    expect((a.components.Leaf as ComponentConfig).render).toBe((b.components.Leaf as ComponentConfig).render)
    expect((a.components.Box as ComponentConfig).render).toBe((b.components.Box as ComponentConfig).render)
  })

  it('reflects changes a host makes to a block config in place, keeping its render', () => {
    const Card = {
      label: 'Card',
      fields: { text: { type: 'text' } },
      render: ({ text, x: X }: { text: string; x?: () => ReactNode }) =>
        createElement('article', null, text, X ? createElement(X) : null),
    } as Record<string, any>
    const host = { components: { Card, Leaf: hostConfig.components.Leaf } } as unknown as Config
    const before = withBlockVisibility(host).components.Card as ComponentConfig

    const resolveData = (data: unknown) => data
    Card.label = 'Renamed card'
    Card.defaultProps = { text: 'Default' }
    Card.resolveData = resolveData
    Card.fields.x = { type: 'slot' }

    const after = withBlockVisibility(host).components.Card as ComponentConfig
    expect(after.label).toBe('Renamed card')
    expect(after.defaultProps).toEqual({ text: 'Default' })
    expect(after.resolveData).toBe(resolveData)
    expect(Object.keys(after.fields!)).toEqual(['_visibility', 'text', 'x'])
    expect(after.render).toBe(before.render)

    // The new slot's blocks are found and rendered
    const data = page([{ type: 'Card', props: { id: 'c', text: 'Card', x: [leaf('inner', 'In slot')] } }])
    const seen: string[] = []
    walkShownBlocks(data, withBlockVisibility(host), (block) => seen.push(String(block.props.id)))
    expect(seen).toEqual(['c', 'inner'])
    expect(render(withBlockVisibility(host), data)).toContain('<p>In slot</p>')
  })

  it("names each wrapper after the render it wraps, not the first block type that used it", () => {
    function SharedRender() { return null }
    const shared = withBlockVisibility({
      components: { First: { render: SharedRender }, Second: { render: SharedRender } },
    } as unknown as Config)
    const display = (name: string) => ((shared.components[name] as ComponentConfig).render as { displayName?: string }).displayName
    expect(display('First')).toBe('BlockVisibility(SharedRender)')
    expect(display('Second')).toBe('BlockVisibility(SharedRender)')
    const Named = Object.assign(() => null, { displayName: 'FancyBlock' })
    expect(((withBlockVisibility({ components: { X: { render: Named } } } as unknown as Config).components.X as ComponentConfig)
      .render as { displayName?: string }).displayName).toBe('BlockVisibility(FancyBlock)')
  })

  it('gives a fresh copy of the same block the same render', () => {
    const copy = withBlockVisibility({ components: { Leaf: { ...hostConfig.components.Leaf } } } as unknown as Config)
    expect((copy.components.Leaf as ComponentConfig).render).toBe((config.components.Leaf as ComponentConfig).render)
  })

  it('wraps blocks added to a config after it was first wrapped', () => {
    const mutable = { components: { ...hostConfig.components } } as unknown as Config
    withBlockVisibility(mutable)
    ;(mutable.components as Record<string, ComponentConfig>).Late = {
      render: () => createElement('b', null, 'late'),
    } as unknown as ComponentConfig
    const later = withBlockVisibility(mutable)
    expect(isWrapped(later.components.Late as ComponentConfig)).toBe(true)
    expect(render(later, page([{ type: 'Late', props: { id: 'l' } }, { type: 'Late', props: { id: 'h', _visibility: { hidden: true } } }])))
      .toBe('<div><b>late</b></div>')
  })

  it('puts the control back first on a copy that adds fields before it, keeping its render', () => {
    const leaf = config.components.Leaf as ComponentConfig
    const copy = { ...leaf, fields: { extra: { type: 'text' }, ...leaf.fields } } as unknown as ComponentConfig
    const rewrapped = withBlockVisibility({ components: { Leaf: copy } } as unknown as Config).components.Leaf as ComponentConfig
    expect(Object.keys(rewrapped.fields!)).toEqual(['_visibility', 'extra', 'text'])
    expect(rewrapped.render).toBe(leaf.render)
  })

  it('leaves a block that defines its own _visibility field alone, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const own = { fields: { _visibility: { type: 'text' } }, render: () => null }
    const result = withBlockVisibility({ components: { Own: own } } as unknown as Config)
    expect(result.components.Own).toBe(own)
    expect(warn.mock.calls.flat().join(' ')).toContain('"Own" defines its own "_visibility" field')
  })

  it('pins the control above a block with its own field layout', () => {
    const layout = createFieldLayout({ tabs: [{ label: 'General', fields: ['text'] }] })
    const wrapped = withBlockVisibility({
      components: { Leaf: { fields: { text: { type: 'text' } }, renderFields: layout, render: leafRender } },
    } as unknown as Config)
    const renderFields = (wrapped.components.Leaf as ComponentConfig).renderFields!
    const control = createElement('i', { key: 'v' }, 'visibility')
    const text = createElement('i', { key: 't' }, 'text')
    const tree = (renderFields as (p: { fields: Record<string, ReactNode> }) => ReactNode)({ fields: { _visibility: control, text } })

    expect(isValidElement(tree)).toBe(true)
    const [first, rest] = (tree as any).props.children
    expect(first).toBe(control)
    expect(rest.type).toBe(layout)
    expect(rest.props.fields).toEqual({ text })
  })

  it('excludes the field from AI generation', () => {
    const field = (config.components.Leaf as ComponentConfig).fields!._visibility as { ai?: { exclude?: boolean } }
    expect(field.ai).toEqual({ exclude: true })
  })
})

describe('withBlockVisibility — live page', () => {
  const config = withBlockVisibility(hostConfig)

  it('renders a block with no setting as before', () => {
    expect(render(config, page([leaf('a', 'Hello')]))).toBe('<main><div><p>Hello</p></div></main>')
    expect(render(config, page([leaf('a', 'Hello')]))).toBe(render(hostConfig, page([leaf('a', 'Hello')])))
  })

  it('leaves a Hidden block out of the HTML without running it', () => {
    const html = render(config, page([leaf('a', 'Shown'), leaf('b', 'Secret', { hidden: true })]))
    expect(html).toBe('<main><div><p>Shown</p></div></main>')
    expect(leafRender.mock.calls.map(([props]) => props.text)).toEqual(['Shown'])
  })

  it("doesn't run any block inside a Hidden block", () => {
    const html = render(config, page([
      { type: 'Box', props: { id: 'box', _visibility: { hidden: true }, content: [leaf('a', 'Inner')] } },
    ]))
    expect(html).toBe('<main><div></div></main>')
    expect(leafRender).not.toHaveBeenCalled()
  })

  it('hides a block nested in a slot', () => {
    const html = render(config, page([
      { type: 'Box', props: { id: 'box', content: [leaf('a', 'Kept'), leaf('b', 'Gone', { hidden: true })] } },
    ]))
    expect(html).toBe('<main><div><section><div><p>Kept</p></div></section></div></main>')
  })

  it('hides a block on chosen sizes with a layout-neutral wrapper and one stylesheet', () => {
    const html = render(config, page([leaf('a', 'Wide only', { hideOn: ['phone', 'tablet'] }), leaf('b', 'No phone', { hideOn: ['phone'] })]))
    expect(html).toContain(
      '<div class="payload-puck-visibility payload-puck-hide-on-phone payload-puck-hide-on-tablet" style="display:contents"><p>Wide only</p></div>',
    )
    expect(html).toContain('<div class="payload-puck-visibility payload-puck-hide-on-phone" style="display:contents"><p>No phone</p></div>')
    // React 19 dedupes the hoistable stylesheet by href
    expect(html.match(new RegExp(`data-href="${LIVE_STYLE_HREF}"|href="${LIVE_STYLE_HREF}"`, 'g'))?.length ?? 0).toBeLessThanOrEqual(1)
    expect(html).toContain('@media (max-width: 767.98px){.payload-puck-hide-on-phone{display:none!important}}')
  })

  it('uses media queries older Safari understands (no range syntax)', () => {
    expect(LIVE_CSS).not.toMatch(/width\s*[<>]/)
    expect(LIVE_CSS).toContain('@media (min-width: 768px) and (max-width: 1023.98px){.payload-puck-hide-on-tablet')
  })

  it('treats all three sizes as Hidden', () => {
    expect(render(config, page([leaf('a', 'x', { hideOn: ['phone', 'tablet', 'desktop'] })]))).toBe('<main><div></div></main>')
  })

  it('keeps hidden blocks rendered in the editor', () => {
    const Leaf = (config.components.Leaf as ComponentConfig).render as (p: object) => ReactNode
    const props = { id: 'a', text: 'Editable', _visibility: { hidden: true }, puck: { isEditing: true } }
    expect(renderToStaticMarkup(createElement(Leaf, props))).toBe('<p>Editable</p>')
  })
})

describe('withBlockVisibility — copies of wrapped blocks', () => {
  const config = withBlockVisibility(hostConfig)
  const MyLeaf = vi.fn(({ text }: { text: string }) => createElement('em', null, text))

  it('never wraps a render twice, whichever way a block is wrapped again', () => {
    function Inner() { return null }
    const displayName = (c: unknown) => ((c as ComponentConfig).render as { displayName?: string }).displayName
    const first = withBlockVisibility({ components: { X: { fields: { a: { type: 'text' } }, render: Inner } } } as unknown as Config)
    const x = first.components.X as ComponentConfig
    const again = [
      withBlockVisibility(first).components.X,
      withBlockVisibility({ ...first }).components.X,
      withBlockVisibility(first, { screenSizes: false }).components.X,
      withBlockVisibility({ components: { X: { ...x, fields: { b: { type: 'text' }, ...x.fields } } } } as unknown as Config).components.X,
      withBlockVisibility({ components: { X: { ...x, renderFields: () => null } } } as unknown as Config).components.X,
    ]
    for (const component of [x, ...again]) {
      expect(displayName(component)).toBe('BlockVisibility(Inner)')
      expect(isWrapped(component as ComponentConfig)).toBe(true)
    }
  })

  it('wraps again when a copy replaces render, so Hidden still hides', () => {
    const copy = { ...config.components.Leaf, render: MyLeaf } as unknown as ComponentConfig
    expect(isWrapped(copy)).toBe(false)
    const rewrapped = withBlockVisibility({ ...config, components: { ...config.components, Leaf: copy } } as Config)
    expect(isWrapped(rewrapped.components.Leaf as ComponentConfig)).toBe(true)
    expect(Object.keys((rewrapped.components.Leaf as ComponentConfig).fields!)[0]).toBe('_visibility')

    const html = render(rewrapped, page([leaf('a', 'Mine'), leaf('b', 'Secret', { hidden: true })]))
    expect(html).toBe('<main><div><em>Mine</em></div></main>')
    expect(MyLeaf.mock.calls.map(([props]) => props.text)).toEqual(['Mine'])
  })

  it('keeps a Hidden block hidden through PageRenderer after such a copy', () => {
    const html = renderToStaticMarkup(createElement(PageRenderer, {
      config: { ...config, components: { ...config.components, Leaf: { ...config.components.Leaf, render: MyLeaf } } } as unknown as Config,
      data: page([leaf('b', 'Secret', { hidden: true })]),
    }))
    expect(html).not.toContain('Secret')
  })

  it('keeps a Hidden email block out of a sent email after such a copy', () => {
    const MyText = ({ content }: { content: string }) => createElement('p', null, content)
    const emailConfig = {
      ...emailEditorConfig,
      components: { ...emailEditorConfig.components, EmailText: { ...emailEditorConfig.components.EmailText, render: MyText } },
    } as unknown as Config
    const html = renderToEmailHtml(page([
      { type: 'EmailText', props: { id: 'a', content: 'Kept paragraph' } },
      { type: 'EmailText', props: { id: 'b', content: 'Dropped paragraph', _visibility: { hidden: true } } },
    ]), { config: emailConfig })
    expect(html).toContain('Kept paragraph')
    expect(html).not.toContain('Dropped paragraph')
  })

  it('re-wraps a screen-sizes config for email: no wrapper, no stylesheet', () => {
    const html = renderToEmailHtml(page([leaf('a', 'Phone only', { hideOn: ['tablet', 'desktop'] })]), { config })
    expect(html).toContain('<p>Phone only</p>')
    expect(html).not.toContain('payload-puck')
    expect(html).not.toContain('display:contents')
    // The email shell has its own <style>; ours must not be there
    expect(html).not.toContain(LIVE_STYLE_HREF)
    expect(html).not.toContain('payload-puck-hide-on')
  })

  it('wraps again when a copy replaces renderFields or resolveFields', () => {
    const layout = vi.fn(() => null)
    const copy = { ...config.components.Leaf, renderFields: layout } as unknown as ComponentConfig
    const rewrapped = withBlockVisibility({ components: { Leaf: copy } } as unknown as Config)
    expect((rewrapped.components.Leaf as ComponentConfig).renderFields).not.toBe(layout)
  })
})

describe('blockVisibility: { screenSizes: false }', () => {
  const Row = vi.fn(({ text }: { text: string }) => createElement('li', null, text))
  const config = withBlockVisibility({
    components: {
      List: {
        fields: { items: { type: 'slot' } },
        render: ({ items: Items }: { items: () => ReactNode }) => createElement('ul', null, createElement(Items)),
      },
      Row: { blockVisibility: { screenSizes: false }, fields: { text: { type: 'text' } }, render: Row },
    },
  } as unknown as Config)

  it('offers Shown/Hidden only for that block type', () => {
    const field = (config.components.Row as ComponentConfig).fields!._visibility as any
    const markup = renderToStaticMarkup(field.render({ value: undefined, onChange: () => {}, name: '_visibility', id: 'x', field }))
    expect(markup).toContain('Hidden')
    expect(markup).not.toContain('Hide on phone')
    const listField = (config.components.List as ComponentConfig).fields!._visibility as any
    expect(renderToStaticMarkup(listField.render({ value: undefined, onChange: () => {}, name: '_visibility', id: 'y', field: listField })))
      .toContain('Hide on phone')
  })

  it('never wraps the block, so it stays a direct child of its list', () => {
    const html = render(config, page([{ type: 'List', props: { id: 'l', items: [
      { type: 'Row', props: { id: 'r1', text: 'One', _visibility: { hideOn: ['phone'] } } },
      { type: 'Row', props: { id: 'r2', text: 'Two', _visibility: { hidden: true } } },
    ] } }]))
    expect(html).toContain('<li>One</li>')
    expect(html).not.toContain('display:contents')
    expect(html).not.toContain('Two')
  })
})

describe("a block's own resolveFields", () => {
  const fresh = { text: { type: 'text' }, extra: { type: 'text' } }

  it('keeps the Visibility control first when the block returns new fields', async () => {
    const config = withBlockVisibility({
      components: {
        Sync: { fields: { text: { type: 'text' } }, resolveFields: () => ({ ...fresh }), render: () => null },
        Async: { fields: { text: { type: 'text' } }, resolveFields: async () => ({ ...fresh }), render: () => null },
      },
    } as unknown as Config)
    const run = (name: string) =>
      (config.components[name] as ComponentConfig).resolveFields!({ props: {} } as any, {} as any)

    const sync = (await run('Sync')) as Record<string, unknown>
    const asyncResult = (await run('Async')) as Record<string, unknown>
    for (const result of [sync, asyncResult]) {
      expect(Object.keys(result)).toEqual(['_visibility', 'text', 'extra'])
      expect(result._visibility).toBe((config.components.Sync as ComponentConfig).fields!._visibility)
    }
  })
})

describe('PageRenderer', () => {
  it('applies show/hide to any config it is given, including host blocks', () => {
    const html = renderToStaticMarkup(createElement(PageRenderer, {
      config: hostConfig,
      data: page([leaf('a', 'Visible'), leaf('b', 'Hidden text', { hidden: true })]),
    }))
    expect(html).toContain('Visible')
    expect(html).not.toContain('Hidden text')
  })
})

describe('email', () => {
  it('offers Shown/Hidden only in the email editor, and to blocks added to it', () => {
    const extended = withBlockVisibility({
      ...emailEditorConfig,
      components: { ...emailEditorConfig.components, HostEmailBlock: { render: () => null } },
    } as unknown as Config)
    const field = (name: string) => (extended.components[name] as ComponentConfig).fields!._visibility as any
    expect(field('EmailText')).toBe(field('HostEmailBlock'))

    const markup = renderToStaticMarkup(field('HostEmailBlock').render({ value: undefined, onChange: () => {}, name: '_visibility', id: 'x', field: field('HostEmailBlock') }))
    expect(markup).toContain('Shown')
    expect(markup).not.toContain('Hide on phone')
  })

  it('leaves a Hidden block out of the email and ignores screen sizes', () => {
    const base = emailBaseConfig as unknown as Config
    const text = (id: string, content: string, _visibility?: unknown) => ({
      type: 'EmailText',
      props: { ...(base.components.EmailText as ComponentConfig).defaultProps, id, content, ...(_visibility ? { _visibility } : {}) },
    })
    const html = renderToEmailHtml(page([
      text('a', 'Kept paragraph'),
      text('b', 'Dropped paragraph', { hidden: true }),
      text('c', 'Phone paragraph', { hideOn: ['phone'] }),
    ]))
    expect(html).toContain('Kept paragraph')
    expect(html).not.toContain('Dropped paragraph')
    expect(html).toContain('Phone paragraph')
    expect(html).not.toContain('payload-puck-hide-on')
  })
})

describe('the sidebar control', () => {
  const field = (withBlockVisibility(hostConfig).components.Leaf as ComponentConfig).fields!._visibility as any
  const markup = (value: unknown) =>
    renderToStaticMarkup(field.render({ value, onChange: () => {}, name: '_visibility', id: 'x', field }))

  it('uses the agreed wording', () => {
    const shown = markup(undefined)
    for (const text of ['Visibility', 'Shown', 'Hidden', 'Hide on phone', 'Hide on tablet', 'Hide on desktop',
      'Hiding on a screen size only hides it from view. The content is still in the page&#x27;s HTML.']) {
      expect(shown).toContain(text)
    }
    expect(markup({ hidden: true })).toContain('Hidden blocks stay in the editor but are left out of the live page.')
  })

  it('reflects the stored state', () => {
    expect(markup({ hideOn: ['tablet'] })).toMatch(/<input type="checkbox" checked=""[^>]*\/>Hide on tablet/)
    expect(markup({ hidden: true })).toMatch(/aria-pressed="true"[^>]*>Hidden</)
    expect(markup({ hidden: true })).not.toContain('Hide on phone')
  })
})
