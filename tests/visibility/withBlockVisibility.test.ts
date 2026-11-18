/**
 * withBlockVisibility: the config transform that gives every block show/hide.
 * Live-page behaviour is checked by rendering through Puck's real <Render>.
 */

import { createElement, isValidElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Render, type ComponentConfig, type Config, type Data } from '@puckeditor/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hasBlockVisibility, withBlockVisibility } from '../../src/visibility/withBlockVisibility.js'
import { LIVE_STYLE_HREF } from '../../src/visibility/css.js'
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
      expect(hasBlockVisibility(component)).toBe(true)
    }
    expect(config.root).toBe(hostConfig.root)
    expect((config.root as ComponentConfig).fields).not.toHaveProperty('_visibility')
  })

  it('keeps the rest of each block config', () => {
    const box = config.components.Box as ComponentConfig
    expect(box.fields).toHaveProperty('content', { type: 'slot' })
  })

  it('is idempotent and cached', () => {
    expect(withBlockVisibility(hostConfig)).toBe(config)
    expect(withBlockVisibility(config)).toBe(config)
    const again = withBlockVisibility({ ...config })
    expect(again.components.Leaf).toBe(config.components.Leaf)
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
      '<div class="payload-puck-hide-on-phone payload-puck-hide-on-tablet" style="display:contents"><p>Wide only</p></div>',
    )
    expect(html).toContain('<div class="payload-puck-hide-on-phone" style="display:contents"><p>No phone</p></div>')
    // React 19 dedupes the hoistable stylesheet by href
    expect(html.match(new RegExp(`data-href="${LIVE_STYLE_HREF}"|href="${LIVE_STYLE_HREF}"`, 'g'))?.length ?? 0).toBeLessThanOrEqual(1)
    expect(html).toContain('@media (max-width: 767.98px){.payload-puck-hide-on-phone{display:none!important}}')
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
