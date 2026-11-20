import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import type { Data } from '@puckeditor/core'
import { stripEditorOnlyPropsForTests as strip } from '../../src/editor/components/PreviewModal.js'

describe('the preview strips editor-only props', () => {
  it('from every block, nested in slots at any depth and in legacy zones', () => {
    const block = (id: string, extra: Record<string, unknown> = {}) =>
      ({ type: 'Gallery', props: { id, editorPreviewFilter: 'x', title: id, ...extra } })
    const data = {
      root: { props: {} },
      content: [block('top', { content: [block('nested', { tabs: [{ body: [block('deep')] }] })] })],
      zones: { 'top:legacy': [block('zoned')] },
    } as unknown as Data

    const json = JSON.stringify(strip(data))
    expect(json).not.toContain('editorPreviewFilter')
    for (const id of ['top', 'nested', 'deep', 'zoned']) expect(json).toContain(`"title":"${id}"`)
    // The original is untouched
    expect(JSON.stringify(data)).toContain('editorPreviewFilter')
  })

  it('passes dates and class instances through untouched', () => {
    class Money { constructor(public cents: number) {} }
    const when = new Date('2026-11-19T00:00:00Z')
    const price = new Money(500)
    const data = {
      root: { props: {} },
      content: [{ type: 'Card', props: { id: 'c', editorPreviewFilter: 'x', when, price, content: [{ type: 'Card', props: { id: 'd', when } }] } }],
    } as unknown as Data
    const props = (strip(data).content[0].props as any)
    expect(props.when).toBe(when)
    expect(props.price).toBe(price)
    expect(props.content[0].props.when).toBe(when)
    expect(props).not.toHaveProperty('editorPreviewFilter')
  })

  it('passes React elements through untouched', () => {
    const element = createElement('em', null, 'Hi')
    const data = { root: { props: {} }, content: [{ type: 'Card', props: { id: 'c', editorPreviewFilter: 'x', icon: element } }] } as unknown as Data
    expect((strip(data).content[0].props as any).icon).toBe(element)
  })
})
