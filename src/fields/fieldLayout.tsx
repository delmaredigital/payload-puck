/**
 * Field Layout - arranges a component's sidebar fields into tabs and groups
 *
 * Builds a Puck `renderFields` function (Puck 0.24+) from a declarative layout.
 * Only the editor sidebar changes; props, saved data and rendering are untouched.
 *
 * Fields the layout doesn't mention are appended to the first tab rather than
 * dropped, so a consumer who extends a built-in component with extra fields
 * still sees them.
 *
 * Usage:
 * ```tsx
 * renderFields: createFieldLayout({
 *   pinned: ['_reset'],
 *   tabs: [
 *     { label: 'General', fields: ['text', 'link'] },
 *     { label: 'Style', fields: ['background', { group: 'Border', fields: ['border', 'radius'] }] },
 *   ],
 * })
 * ```
 */

import type { ReactNode } from 'react'
import { FieldGroup, FieldTab, type FieldGroupVariant } from '@puckeditor/core'

// =============================================================================
// Types
// =============================================================================

export interface FieldLayoutGroup {
  /** Group label shown above its fields */
  group: string
  fields: string[]
  /** Let users collapse the group (default: false) */
  collapsible?: boolean
  /** Start expanded when collapsible (default: true) */
  defaultExpanded?: boolean
  variant?: FieldGroupVariant
  /**
   * Key for the group's expanded state. Groups sharing an id share that state,
   * which keeps it stable while switching between components.
   */
  id?: string
}

export type FieldLayoutEntry = string | FieldLayoutGroup

export interface FieldLayoutTab {
  label: string
  /** Tab identity; the selected tab persists across components with the same value */
  value?: string
  fields: FieldLayoutEntry[]
}

export interface FieldLayout {
  /** Fields shown above the tabs, on every tab */
  pinned?: string[]
  tabs: FieldLayoutTab[]
}

type RenderedFields = Partial<Record<string, ReactNode>>

// =============================================================================
// Helpers
// =============================================================================

/** Every field name a layout places explicitly, in layout order */
export function getFieldLayoutNames(layout: FieldLayout): string[] {
  const names = [...(layout.pinned ?? [])]
  for (const tab of layout.tabs) {
    for (const entry of tab.fields) {
      if (typeof entry === 'string') names.push(entry)
      else names.push(...entry.fields)
    }
  }
  return names
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function renderEntry(entry: FieldLayoutEntry, fields: RenderedFields): ReactNode {
  if (typeof entry === 'string') return fields[entry]

  const nodes = entry.fields.map((name) => fields[name]).filter((node) => node != null)
  if (nodes.length === 0) return null

  const id = entry.id ?? `payload-puck-${slugify(entry.group)}`
  return entry.collapsible ? (
    <FieldGroup
      key={id}
      id={id}
      label={entry.group}
      variant={entry.variant}
      defaultExpanded={entry.defaultExpanded ?? true}
    >
      {nodes}
    </FieldGroup>
  ) : (
    <FieldGroup key={id} collapsible={false} label={entry.group} variant={entry.variant}>
      {nodes}
    </FieldGroup>
  )
}

// =============================================================================
// Factory
// =============================================================================

/**
 * Creates a `renderFields` function that lays out fields in tabs and groups.
 *
 * Hidden fields (slots, or fields hidden by `resolveFields`) are absent from
 * Puck's rendered map and simply don't appear; a tab or group left with no
 * visible fields isn't rendered.
 */
export function createFieldLayout(layout: FieldLayout) {
  const placed = new Set(getFieldLayoutNames(layout))

  return function renderFields({ fields }: { fields: RenderedFields }) {
    const unplaced = Object.keys(fields).filter((name) => !placed.has(name))

    return (
      <>
        {layout.pinned?.map((name) => fields[name])}
        {layout.tabs.map((tab, index) => {
          const content = tab.fields.map((entry) => renderEntry(entry, fields))
          if (index === 0) content.push(...unplaced.map((name) => fields[name]))
          if (content.every((node) => node == null)) return null

          return (
            <FieldTab key={tab.value ?? tab.label} label={tab.label} value={tab.value}>
              {content}
            </FieldTab>
          )
        })}
      </>
    )
  }
}
