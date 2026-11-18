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
  getBlockVisibility,
  isBlockHidden,
  isBlockHiddenOn,
  setBlockHidden,
  setBlockHiddenOn,
  walkShownBlocks,
} from '../../src/visibility/index.js'

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

  it('treats a block hidden on all three sizes as fully hidden', () => {
    expect(isBlockHidden(block('a', { hideOn: ['phone', 'tablet', 'desktop'] }))).toBe(true)
  })
})

describe('breakpoints', () => {
  it('cuts phone / tablet / desktop at 768 and 1024', () => {
    expect(SCREEN_BREAKPOINTS).toEqual({ tablet: 768, desktop: 1024 })
    expect(SCREEN_MEDIA_QUERIES).toEqual({
      phone: '(max-width: 767.98px)',
      tablet: '(min-width: 768px) and (max-width: 1023.98px)',
      desktop: '(min-width: 1024px)',
    })
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

  it('tolerates empty or partial data', () => {
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
