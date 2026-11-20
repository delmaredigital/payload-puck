import type { ComponentData, Config } from '@puckeditor/core'
import { describe, expect, it } from 'vitest'
import { withTemplateContent } from '../../src/fields/TemplateField.js'

const config = {
  components: {
    Template: { fields: { content: { type: 'slot' } }, render: () => null },
    Box: { fields: { content: { type: 'slot' } }, render: () => null },
    Leaf: { fields: {}, render: () => null },
  },
} as unknown as Config

const stored = [
  { type: 'Box', props: { id: 'stored-box', content: [{ type: 'Leaf', props: { id: 'stored-leaf', text: 'Hi' } }] } },
] as unknown as ComponentData[]

const ids = (blocks: ComponentData[]): string[] =>
  blocks.flatMap((block) => [block.props.id as string, ...ids(((block.props as { content?: ComponentData[] }).content ?? []))])

describe('loading a template', () => {
  it('gives every loaded block a new id, so loading twice never duplicates ids', () => {
    const block = { type: 'Template', props: { id: 't1', content: [] } } as unknown as ComponentData
    const first = withTemplateContent(block, stored, 'tpl', config)
    const second = withTemplateContent(block, stored, 'tpl', config)

    const all = [...ids(first.props.content as ComponentData[]), ...ids(second.props.content as ComponentData[])]
    expect(all).toHaveLength(4)
    expect(new Set(all).size).toBe(4)
    expect(all).not.toContain('stored-box')
    expect(all).not.toContain('stored-leaf')
    expect(first).toMatchObject({ type: 'Template', props: { id: 't1', templateId: 'tpl' } })
    expect((first.props.content as any)[0].props.content[0].props.text).toBe('Hi')
  })
})
