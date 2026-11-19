/**
 * Server-safe visibility helpers (`@delmaredigital/payload-puck/visibility`).
 * Other plugins rely on these to decide whether a block appears on the live
 * page, so their semantics are pinned here.
 */

import type { ComponentData, Config, Data } from '@puckeditor/core'
import { describe, expect, it } from 'vitest'

import {
  SCREEN_BREAKPOINTS,
  SCREEN_MEDIA_QUERIES,
  SCREEN_SIZES,
  describeVisibility,
  type BlockVisibility,
  getBlockVisibility,
  isBlockHidden,
  isBlockHiddenOn,
  setBlockHidden,
  setBlockHiddenOn,
  walkShownBlocks,
} from '../../src/visibility/core.js'

const block = (id: string, visibility?: unknown, extra: Record<string, unknown> = {}): ComponentData => ({
  type: 'Box',
  props: { id, ...(visibility === undefined ? {} : { _visibility: visibility }), ...extra },
})

describe('getBlockVisibility / isBlockHidden / isBlockHiddenOn', () => {
  it('treats a missing value as shown, so existing pages need no migration', () => {
    expect(getBlockVisibility(block('a'))).toEqual({ hidden: false, hideOn: [] })
    expect(isBlockHidden(block('a'))).toBe(false)
    for (const size of SCREEN_SIZES) expect(isBlockHiddenOn(block('a'), size)).toBe(false)
  })

  it('ignores malformed values instead of hiding content', () => {
    for (const bad of [null, 'hidden', true, [], { hidden: 'yes' }, { hideOn: 'phone' }, { hideOn: ['watch'] }]) {
      expect(getBlockVisibility(block('a', bad)), JSON.stringify(bad)).toEqual({ hidden: false, hideOn: [] })
    }
    expect(getBlockVisibility(null)).toEqual({ hidden: false, hideOn: [] })
    expect(getBlockVisibility({})).toEqual({ hidden: false, hideOn: [] })
  })

  it('reports a Hidden block as hidden on every size', () => {
    const b = block('a', { hidden: true, hideOn: ['phone'] })
    expect(getBlockVisibility(b)).toEqual({ hidden: true, hideOn: [] })
    expect(isBlockHidden(b)).toBe(true)
    for (const size of SCREEN_SIZES) expect(isBlockHiddenOn(b, size)).toBe(true)
  })

  it('keeps a block hidden on some sizes as appearing on the page', () => {
    const b = block('a', { hideOn: ['desktop', 'phone', 'phone'] })
    expect(getBlockVisibility(b)).toEqual({ hidden: false, hideOn: ['phone', 'desktop'] })
    expect(isBlockHidden(b)).toBe(false)
    expect(isBlockHiddenOn(b, 'phone')).toBe(true)
    expect(isBlockHiddenOn(b, 'tablet')).toBe(false)
    expect(isBlockHiddenOn(b, 'desktop')).toBe(true)
  })

  it('returns a fresh value each time, so callers cannot change shared state', () => {
    const first = getBlockVisibility(block('a'))
    first.hideOn.push('phone')
    first.hidden = true
    expect(getBlockVisibility(block('a'))).toEqual({ hidden: false, hideOn: [] })
    expect(getBlockVisibility(block('b'))).not.toBe(getBlockVisibility(block('b')))
  })

  it('types hidden as true or absent, matching the stored contract', () => {
    // @ts-expect-error hidden is never false: a shown block stores nothing
    const invalid: BlockVisibility = { hidden: false }
    const valid: BlockVisibility = { hidden: true, hideOn: ['phone'] }
    expect([invalid, valid]).toHaveLength(2)
  })

  it('treats a block hidden on all three sizes as fully hidden', () => {
    expect(isBlockHidden(block('a', { hideOn: ['phone', 'tablet', 'desktop'] }))).toBe(true)
  })
})

describe('breakpoints', () => {
  it('cuts phone / tablet / desktop at 768 and 1024 in the classic form older Safari reads', () => {
    expect(SCREEN_BREAKPOINTS).toEqual({ tablet: 768, desktop: 1024 })
    expect(SCREEN_MEDIA_QUERIES).toEqual({
      phone: '(max-width: 767.98px)',
      tablet: '(min-width: 768px) and (max-width: 1023.98px)',
      desktop: '(min-width: 1024px)',
    })
    // No range syntax anywhere: Safari before 16.4 drops those rules
    for (const query of Object.values(SCREEN_MEDIA_QUERIES)) expect(query).not.toMatch(/[<>]/)
  })
})

describe('walkShownBlocks', () => {
  const config = {
    components: {
      Box: { fields: { content: { type: 'slot' }, aside: { type: 'slot' }, title: { type: 'text' } }, render: () => null },
    },
  } as unknown as Config

  const visited = (data: Partial<Data>) => {
    const seen: string[] = []
    walkShownBlocks(data, config, (b, ctx) => seen.push(`${b.props.id}@${ctx.zone}`))
    return seen
  }

  it('visits every shown block top-down, through slots at any depth', () => {
    const data = {
      root: { props: {} },
      content: [
        block('a', undefined, { content: [block('b', undefined, { aside: [block('c')] })] }),
        block('d'),
      ],
    }
    expect(visited(data)).toEqual(['a@root:default-zone', 'b@a:content', 'c@b:aside', 'd@root:default-zone'])
  })

  it('skips a hidden block and everything inside it', () => {
    const data = {
      root: { props: {} },
      content: [
        block('a', { hidden: true }, { content: [block('b')] }),
        block('c', undefined, { content: [block('d', { hideOn: ['phone', 'tablet', 'desktop'] }, { content: [block('e')] })] }),
      ],
    }
    expect(visited(data)).toEqual(['c@root:default-zone'])
  })

  it('still visits blocks hidden on only some sizes', () => {
    const data = { root: { props: {} }, content: [block('a', { hideOn: ['phone'] })] }
    expect(visited(data)).toEqual(['a@root:default-zone'])
  })

  it('follows legacy DropZone zones, skipping zones of hidden blocks', () => {
    const data = {
      root: { props: {} },
      content: [block('a'), block('h', { hidden: true })],
      zones: { 'a:left': [block('b')], 'h:left': [block('x')], 'root:extra': [block('r')] },
    }
    expect(visited(data)).toEqual(['a@root:default-zone', 'b@a:left', 'r@root:extra'])
  })

  it('follows slots inside array and object fields, like Puck', () => {
    const nestedConfig = {
      components: {
        Tabs: {
          fields: {
            tabs: { type: 'array', arrayFields: { label: { type: 'text' }, content: { type: 'slot' } } },
            aside: { type: 'object', objectFields: { body: { type: 'slot' } } },
          },
          render: () => null,
        },
        Box: config.components.Box,
      },
    } as unknown as Config
    const data = {
      root: { props: {} },
      content: [{ type: 'Tabs', props: {
        id: 't',
        tabs: [{ label: 'One', content: [block('a')] }, { label: 'Two', content: [block('b', { hidden: true }, { content: [block('x')] })] }],
        aside: { body: [block('c')] },
      } }],
    }
    const seen: string[] = []
    walkShownBlocks(data, nestedConfig, (b, ctx) => seen.push(`${b.props.id}@${ctx.zone}`))
    expect(seen).toEqual(['t@root:default-zone', 'a@t:tabs[0].content', 'c@t:aside.body'])
  })

  it('stops on cyclic legacy zones and skips zone keys without a parent', () => {
    const data = {
      root: { props: {} },
      content: [block('a')],
      zones: { 'a:inner': [block('a2')], 'a2:inner': [block('a')], nocolon: [block('z')], ':orphan': [block('o')] },
    }
    // Each zone is followed once, so the a → a2 → a loop ends
    expect(visited(data)).toEqual(['a@root:default-zone', 'a2@a:inner', 'a@a2:inner'])
  })

  it('stops on blocks that contain themselves', () => {
    const self: any = block('loop')
    self.props.content = [self]
    expect(visited({ root: { props: {} }, content: [self] })).toEqual(['loop@root:default-zone'])
  })

  it('handles very deep nesting without overflowing the stack', () => {
    let inner: ComponentData = block('leaf')
    for (let i = 0; i < 20_000; i++) inner = block(`b${i}`, undefined, { content: [inner] })
    let count = 0
    walkShownBlocks({ root: { props: {} }, content: [inner] }, config, () => { count++ })
    expect(count).toBe(20_001)
  })

  it('never throws, whatever the data or config', () => {
    const inputs: unknown[] = [null, undefined, 0, 'x', [], {}, { content: 'x' }, { content: [null, 1, 'a', { type: 1 }, { type: 'Box' }, { type: 'Box', props: null }] },
      { content: [{ type: 'Box', props: { id: 1, content: 'not a list' } }], zones: [] },
      { content: [], zones: { 'a:b': 'x', 'c:d': [null] } }]
    const configs: unknown[] = [config, {}, { components: null }, { components: { Box: null } }, { components: { Box: { fields: 'x' } } },
      { components: { Box: { fields: { content: null, list: { type: 'array', arrayFields: null } } } } }]
    for (const data of inputs) {
      for (const cfg of configs) {
        expect(() => walkShownBlocks(data as any, cfg as any, () => {})).not.toThrow()
      }
    }
    expect(visited({})).toEqual([])
    walkShownBlocks(null, config, () => { throw new Error('should not visit') })
  })
})

describe('setBlockHidden / setBlockHiddenOn', () => {
  it('stores nothing for a block shown everywhere', () => {
    expect(setBlockHidden(undefined, false)).toBeUndefined()
    expect(setBlockHiddenOn({ hideOn: ['phone'] }, 'phone', false)).toBeUndefined()
  })

  it('remembers screen-size choices across hide and show', () => {
    const hidden = setBlockHidden({ hideOn: ['phone'] }, true)
    expect(hidden).toEqual({ hidden: true, hideOn: ['phone'] })
    expect(setBlockHidden(hidden, false)).toEqual({ hideOn: ['phone'] })
  })

  it('turns ticking the last remaining size into Hidden', () => {
    const value = setBlockHiddenOn({ hideOn: ['phone', 'tablet'] }, 'desktop', true)
    expect(value).toEqual({ hidden: true })
    expect(setBlockHidden(value, false)).toBeUndefined()
  })

  it('shows a block that was only hidden by all three sizes on every size', () => {
    expect(setBlockHidden({ hideOn: ['phone', 'tablet', 'desktop'] }, false)).toBeUndefined()
  })

  it('keeps sizes in phone, tablet, desktop order', () => {
    expect(setBlockHiddenOn({ hideOn: ['desktop'] }, 'phone', true)).toEqual({ hideOn: ['phone', 'desktop'] })
  })
})

describe('describeVisibility', () => {
  it('words the badge in plain terms', () => {
    expect(describeVisibility({ hidden: false, hideOn: [] })).toBeNull()
    expect(describeVisibility({ hidden: true, hideOn: [] })).toBe('Hidden')
    expect(describeVisibility({ hidden: false, hideOn: ['phone'] })).toBe('Hidden on phone')
    expect(describeVisibility({ hidden: false, hideOn: ['phone', 'tablet'] })).toBe('Hidden on phone and tablet')
  })
})
