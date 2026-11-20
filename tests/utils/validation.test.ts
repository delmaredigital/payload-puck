import { describe, expect, it } from 'vitest'
import type { Config } from '@puckeditor/core'
import { isPuckData, validatePuckData } from '../../src/utils/validation.js'

const page = (content: unknown[]) => ({ root: { props: { title: 'Home' } }, content })
const leaf = (id: string, type = 'Leaf') => ({ type, props: { id } })

describe('validatePuckData walks blocks nested in slots', () => {
  it('accepts well-formed nested blocks', () => {
    const result = validatePuckData(page([
      { type: 'Box', props: { id: 'box', content: [leaf('a')], tabs: [{ label: 'One', body: [leaf('b')] }], side: { aside: [leaf('c')] } } },
    ]), { allowedComponentTypes: ['Box', 'Leaf'], strictComponentTypes: true })
    expect(result).toEqual({ valid: true, errors: [], warnings: [] })
  })

  it('reports a nested block with no id, a duplicate id, no props, or an unknown type', () => {
    const result = validatePuckData(page([
      { type: 'Box', props: { id: 'box', content: [
        { type: 'Leaf', props: {} },
        leaf('box'),
        { type: 'Leaf' },
      ], tabs: [{ body: [leaf('x', 'Mystery')] }] } },
    ]), { allowedComponentTypes: ['Box', 'Leaf'], strictComponentTypes: true })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual([
      'content[0].props.content[0] missing or invalid props.id',
      'content[0].props.content[2] missing props object',
      'Unknown component type "Mystery" at content[0].props.tabs[0].body[0]',
    ])
    expect(result.warnings).toEqual(['Duplicate content item ID "box" at content[0].props.content[1]'])
  })

  it('warns about unknown nested types when not strict', () => {
    const result = validatePuckData(page([{ type: 'Box', props: { id: 'box', content: [leaf('a', 'Mystery')] } }]), {
      allowedComponentTypes: ['Box'],
    })
    expect(result.valid).toBe(true)
    expect(result.warnings).toEqual(['Unknown component type "Mystery" at content[0].props.content[0]'])
  })

  it('leaves arrays that hold no blocks alone', () => {
    const result = validatePuckData(page([{ type: 'Box', props: { id: 'box', tags: ['a', 'b'], items: [{ label: 'x' }] } }]))
    expect(result).toEqual({ valid: true, errors: [], warnings: [] })
  })
})

describe('isPuckData walks blocks nested in slots', () => {
  it('rejects a nested block without props', () => {
    expect(isPuckData(page([{ type: 'Box', props: { id: 'box', content: [leaf('a')] } }]))).toBe(true)
    expect(isPuckData(page([{ type: 'Box', props: { id: 'box', content: [leaf('a'), { type: 'Leaf' }] } }]))).toBe(false)
    // A lone item with no props can't be told from data without a config
    expect(isPuckData(page([{ type: 'Box', props: { id: 'box', content: [{ type: 'Leaf' }] } }]))).toBe(true)
    expect(isPuckData(page([{ type: 'Box', props: { id: 'box', side: { aside: [leaf('b'), { type: 'Leaf', props: [] }] } } }]))).toBe(false)
  })
})

describe('values that only look like blocks', () => {
  const links = [{ type: 'internal', href: '/a' }, { type: 'external', href: 'https://x.test' }]
  const richText = { type: 'doc', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hi' }] }] }

  it('are not treated as blocks, at any depth', () => {
    const data = page([
      { type: 'Box', props: { id: 'box', links, body: richText, content: [
        { type: 'Card', props: { id: 'card', links, items: [{ label: 'x', nodes: richText.children }] } },
      ] } },
    ])
    expect(validatePuckData(data, { allowedComponentTypes: ['Box', 'Card'], strictComponentTypes: true }))
      .toEqual({ valid: true, errors: [], warnings: [] })
    expect(isPuckData(data)).toBe(true)
  })

  it('with a config, only its slot fields hold blocks', () => {
    const config = {
      components: {
        Box: { fields: { content: { type: 'slot' }, extra: { type: 'array', arrayFields: { body: { type: 'slot' } } } }, render: () => null },
        Leaf: { fields: {}, render: () => null },
      },
    } as unknown as Config
    // A block-shaped value outside any slot is data, not a block
    const data = page([{ type: 'Box', props: { id: 'box', notASlot: [{ type: 'Leaf', props: {} }], content: [leaf('a')], extra: [{ body: [{ type: 'Leaf', props: {} }] }] } }])
    const result = validatePuckData(data, { config })
    expect(result.errors).toEqual(['content[0].props.extra[0].body[0] missing or invalid props.id'])
    expect(isPuckData(page([{ type: 'Box', props: { id: 'box', content: [{ type: 'Leaf' }] } }]), config)).toBe(false)
    expect(isPuckData(page([{ type: 'Box', props: { id: 'box', notASlot: [{ type: 'Leaf' }] } }]), config)).toBe(true)
  })

  it('with a config, reports a type it does not know instead of guessing its slots', () => {
    const config = { components: { Box: { fields: { content: { type: 'slot' } }, render: () => null } } } as unknown as Config
    const result = validatePuckData(page([
      { type: 'Box', props: { id: 'box', content: [{ type: 'Mystery', props: { id: 'm', inner: [{ type: 'Box', props: {} }] } }] } },
    ]), { config })
    // Mystery is unknown; nothing inside it is guessed at (its inner Box has no id, but isn't checked)
    expect(result.errors).toEqual(['Unknown component type "Mystery" at content[0].props.content[0]'])
  })
})

