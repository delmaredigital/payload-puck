/**
 * createFieldLayout builds a Puck `renderFields` function. Puck only shows the
 * fields that function places, so a typo or an omission silently hides a field
 * from the sidebar. These tests walk the returned element tree (no rendering)
 * to check where each field lands.
 */

import { createElement, isValidElement, type ReactNode } from 'react'
import { FieldGroup, FieldTab, type ComponentConfig } from '@puckeditor/core'
import { describe, expect, it } from 'vitest'

import { createFieldLayout } from '../../src/fields/fieldLayout.js'
import { AccordionConfig } from '../../src/components/interactive/Accordion.js'
import { ButtonConfig } from '../../src/components/interactive/Button.js'
import { CardConfig } from '../../src/components/interactive/Card.js'
import { DividerConfig } from '../../src/components/interactive/Divider.js'
import { ColumnsConfig } from '../../src/components/layout/Columns.js'
import { ContainerConfig } from '../../src/components/layout/Container.js'
import { FlexConfig } from '../../src/components/layout/Flex.js'
import { GridConfig } from '../../src/components/layout/Grid.js'
import { SectionConfig } from '../../src/components/layout/Section.js'
import { TemplateConfig } from '../../src/components/layout/Template.js'
import { ImageConfig } from '../../src/components/media/Image.js'
import { HeadingConfig } from '../../src/components/typography/Heading.js'
import { TextConfig } from '../../src/components/typography/Text.js'
import { RichTextEditorConfig } from '../../src/components/typography/RichText.editor.js'

/** Stand-in for Puck's rendered field node */
const fieldNode = (name: string) => createElement('i', { 'data-field': name, key: name })

const fieldNodes = (names: string[]) =>
  Object.fromEntries(names.map((name) => [name, fieldNode(name)]))

interface Placement {
  field: string
  tab: string | null
  group: string | null
}

/** Collects every field node with the tab and group that contain it */
function collect(node: ReactNode, tab: string | null = null, group: string | null = null): Placement[] {
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, tab, group))
  if (!isValidElement(node)) return []
  const props = node.props as Record<string, any>
  if (props['data-field']) return [{ field: props['data-field'], tab, group }]
  if (node.type === FieldTab) return collect(props.children, props.value ?? props.label, group)
  if (node.type === FieldGroup) return collect(props.children, tab, props.label)
  return collect(props.children, tab, group)
}

const tabsOf = (node: ReactNode): string[] =>
  Array.isArray(node)
    ? node.flatMap(tabsOf)
    : isValidElement(node)
      ? node.type === FieldTab
        ? [(node.props as any).label]
        : tabsOf((node.props as any).children)
      : []

describe('createFieldLayout', () => {
  const renderFields = createFieldLayout({
    pinned: ['_reset'],
    tabs: [
      { label: 'General', fields: ['text'] },
      { label: 'Style', fields: [{ group: 'Box', fields: ['background', 'border'] }, 'color'] },
      { label: 'Layout', fields: ['margin'] },
    ],
  })

  it('places pinned fields outside the tabs and the rest in their tab and group', () => {
    const tree = renderFields({ fields: fieldNodes(['_reset', 'text', 'background', 'border', 'color', 'margin']) })
    expect(collect(tree)).toEqual([
      { field: '_reset', tab: null, group: null },
      { field: 'text', tab: 'General', group: null },
      { field: 'background', tab: 'Style', group: 'Box' },
      { field: 'border', tab: 'Style', group: 'Box' },
      { field: 'color', tab: 'Style', group: null },
      { field: 'margin', tab: 'Layout', group: null },
    ])
  })

  it('appends fields the layout does not mention to the first tab', () => {
    const tree = renderFields({ fields: fieldNodes(['text', 'consumerExtra']) })
    expect(collect(tree)).toContainEqual({ field: 'consumerExtra', tab: 'General', group: null })
  })

  it('omits tabs and groups whose fields are all hidden', () => {
    const tree = renderFields({ fields: fieldNodes(['text', 'color']) })
    expect(tabsOf(tree)).toEqual(['General', 'Style'])
    expect(collect(tree).map((p) => p.group)).not.toContain('Box')
  })
})

const builtIns: Record<string, ComponentConfig> = {
  Accordion: AccordionConfig,
  Button: ButtonConfig,
  Card: CardConfig,
  Divider: DividerConfig,
  Columns: ColumnsConfig,
  Container: ContainerConfig,
  Flex: FlexConfig,
  Grid: GridConfig,
  Section: SectionConfig,
  Template: TemplateConfig,
  Image: ImageConfig,
  Heading: HeadingConfig,
  Text: TextConfig,
  RichText: RichTextEditorConfig,
}

describe.each(Object.entries(builtIns))('%s field layout', (_name, config) => {
  // Slots are never shown in the sidebar, so Puck leaves them out of the map
  const visible = Object.entries(config.fields ?? {})
    .filter(([, field]) => field.type !== 'slot')
    .map(([name]) => name)

  it('places every visible field explicitly, exactly once', () => {
    const accessed = new Set<string>()
    const fields = new Proxy(fieldNodes(visible), {
      get: (target, key: string) => {
        accessed.add(key)
        return target[key]
      },
      // Hide the keys so the first-tab fallback finds nothing to rescue
      ownKeys: () => [],
    })
    const placements = collect(config.renderFields!({ fields } as any))

    expect(placements.map((p) => p.field).sort()).toEqual([...visible].sort())
    // Every name the layout asks for is a real field (catches typos)
    expect([...accessed].filter((key) => !visible.includes(key))).toEqual([])
  })
})
