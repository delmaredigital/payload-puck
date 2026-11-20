/**
 * Finding a block's slots from its config: top-level slot fields, and slot
 * fields inside array items and object fields, at any depth, with the same
 * prop paths Puck uses for their zones. No React or Puck runtime, so server
 * code (validation) can use it too.
 */

import type { ComponentData, Config } from '@puckeditor/core'

type FieldLike = {
  type?: string
  label?: string
  allow?: string[]
  disallow?: string[]
  arrayFields?: Record<string, FieldLike | undefined>
  objectFields?: Record<string, FieldLike | undefined>
}

/** One slot on one block, wherever its field sits (top level, array item, object). */
export interface SlotInfo {
  /** Puck's prop path for it, as in the zone `<blockId>:<path>`: `content`, `tabs[0].body`, `side.aside`. */
  path: string
  /** A readable name for menus and messages, e.g. `Tabs 1 › Content`. */
  label: string
  allow?: string[]
  disallow?: string[]
  /** What the block holds there now (not checked: may be anything in a copied record). */
  value: unknown
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

/** Words for a field name: `sideBar` → `Side bar` (when the field has no label). */
function readable(name: string): string {
  const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase()
  return words ? words[0].toUpperCase() + words.slice(1) : name
}

/**
 * Every slot `block` has, at any depth, in field order, with the same prop
 * paths Puck uses for their zones. Slots inside an array field are listed per
 * item, so an empty array has none.
 */
export function slotsInBlock(block: ComponentData, config: Config): SlotInfo[] {
  const fields = (config.components[block.type]?.fields ?? {}) as Record<string, FieldLike | undefined>
  const slots: SlotInfo[] = []
  const walk = (fieldSet: Record<string, FieldLike | undefined>, value: Record<string, unknown>, path: string, label: string) => {
    for (const [name, field] of Object.entries(fieldSet)) {
      if (!field) continue
      const fieldPath = path ? `${path}.${name}` : name
      const fieldLabel = `${label}${field.label || readable(name)}`
      if (field.type === 'slot') {
        slots.push({ path: fieldPath, label: fieldLabel, allow: field.allow, disallow: field.disallow, value: value[name] })
      } else if (field.type === 'array' && field.arrayFields && Array.isArray(value[name])) {
        ;(value[name] as unknown[]).forEach((item, index) => {
          if (isRecord(item)) walk(field.arrayFields!, item, `${fieldPath}[${index}]`, `${fieldLabel} ${index + 1} › `)
        })
      } else if (field.type === 'object' && field.objectFields && isRecord(value[name])) {
        walk(field.objectFields, value[name] as Record<string, unknown>, fieldPath, `${fieldLabel} › `)
      }
    }
  }
  if (isRecord(block.props)) walk(fields, block.props, '', '')
  return slots
}

