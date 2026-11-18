/**
 * Adds show/hide to every block of a Puck config.
 *
 * Server-safe (no hooks, no 'use client'): PageRenderer calls it on the server.
 * The sidebar control it references is a client component and only runs in
 * the editor.
 */

import { createElement, Fragment, type ComponentType, type ReactNode } from 'react'
import type { ComponentConfig, Config, CustomField } from '@puckeditor/core'
import { BlockVisibilityControl } from './BlockVisibilityField.js'
import { LIVE_CSS, LIVE_STYLE_HREF, hideOnClassName } from './css.js'
import { VISIBILITY_PROP, getBlockVisibility, type BlockVisibility } from './index.js'
import { warnOnce } from '../config/merge.js'

export interface BlockVisibilityOptions {
  /**
   * Offer hiding per screen size (phone / tablet / desktop). Set false for
   * email, where media queries are unreliable.
   *
   * Defaults to the setting already used by blocks in the config (so blocks
   * added to `emailEditorConfig` inherit Shown/Hidden only), otherwise true.
   */
  screenSizes?: boolean
}

/** Field objects created here, so a second pass recognises its own work. */
const ownFields = new WeakSet<object>()

function createVisibilityField(screenSizes: boolean): CustomField<BlockVisibility | undefined> {
  const field: CustomField<BlockVisibility | undefined> = {
    type: 'custom',
    label: 'Visibility',
    // Visibility is an editorial choice; generated pages start shown
    ai: { exclude: true },
    render: ({ value, onChange, readOnly }) =>
      createElement(BlockVisibilityControl, { value, onChange, readOnly, screenSizes }),
  }
  ownFields.add(field)
  return field
}

/** Which screenSizes setting each of our field objects was made with. */
const fieldSizes = new WeakMap<object, boolean>()
const fieldsBySizes = new Map<boolean, CustomField<BlockVisibility | undefined>>()
const visibilityField = (screenSizes: boolean) => {
  let field = fieldsBySizes.get(screenSizes)
  if (!field) {
    fieldsBySizes.set(screenSizes, (field = createVisibilityField(screenSizes)))
    fieldSizes.set(field, screenSizes)
  }
  return field
}

/** True for the Visibility field this module adds (and nothing else). */
export function isBlockVisibilityField(field: unknown): boolean {
  return typeof field === 'object' && field !== null && ownFields.has(field)
}

/** Wrapped component → the component it was made from. */
const sources = new WeakMap<object, ComponentConfig<any>>()

/**
 * The component config a wrapped block was made from, or the component itself
 * if it was never wrapped.
 * @internal
 */
export function blockVisibilitySource<T extends object>(component: T): T {
  return (sources.get(component) as T | undefined) ?? component
}

/** True when the component already went through withBlockVisibility. */
export function hasBlockVisibility(component: Pick<ComponentConfig, 'fields'> | undefined): boolean {
  const field = (component?.fields as Record<string, object> | undefined)?.[VISIBILITY_PROP]
  return !!field && ownFields.has(field)
}

type RenderProps = Record<string, unknown> & { puck?: { isEditing?: boolean } }

function wrapRender(Render: ComponentType<any>, screenSizes: boolean, name: string) {
  function BlockVisibilityRender(props: RenderProps): ReactNode {
    // In the editor a hidden block stays fully rendered and editable; the
    // editor greys it with CSS keyed on Puck's own block attribute
    if (props.puck?.isEditing) return createElement(Render, props)

    const visibility = getBlockVisibility({ props })
    if (visibility.hidden) return null
    if (!screenSizes || !visibility.hideOn.length) return createElement(Render, props)

    return createElement(
      Fragment,
      null,
      // React 19 hoists this into <head> and emits it once per page
      createElement('style', { href: LIVE_STYLE_HREF, precedence: 'default' }, LIVE_CSS),
      createElement(
        'div',
        { className: visibility.hideOn.map(hideOnClassName).join(' '), style: { display: 'contents' } },
        createElement(Render, props),
      ),
    )
  }
  BlockVisibilityRender.displayName = `BlockVisibility(${name})`
  return BlockVisibilityRender
}

type RenderFieldsFn = NonNullable<ComponentConfig['renderFields']>

/** Pins the visibility control above whatever layout the block uses. */
function wrapRenderFields(RenderFields: RenderFieldsFn): RenderFieldsFn {
  return function BlockVisibilityRenderFields({ fields, ...rest }) {
    const { [VISIBILITY_PROP]: control, ...others } = fields as Record<string, ReactNode>
    return createElement(
      Fragment,
      null,
      control,
      createElement(RenderFields as ComponentType<any>, { ...rest, fields: others }),
    )
  }
}

function withComponentVisibility(name: string, component: ComponentConfig<any>, screenSizes: boolean): ComponentConfig<any> {
  if (hasBlockVisibility(component)) return component
  if (component.fields && VISIBILITY_PROP in component.fields) {
    warnOnce(`[payload-puck] component "${name}" defines its own "${VISIBILITY_PROP}" field; show/hide was not added to it`)
    return component
  }
  const wrapped: ComponentConfig<any> = {
    ...component,
    // First in the object so Puck's default field order puts it on top
    fields: { [VISIBILITY_PROP]: visibilityField(screenSizes), ...component.fields },
    ...(component.renderFields ? { renderFields: wrapRenderFields(component.renderFields) } : {}),
    render: wrapRender(component.render as ComponentType<any>, screenSizes, name) as unknown as ComponentConfig['render'],
  }
  sources.set(wrapped, component)
  return wrapped
}

/** The screenSizes setting of blocks that already have visibility, if any. */
function inheritedScreenSizes(config: Config<any>): boolean | undefined {
  for (const component of Object.values(config.components ?? {})) {
    const field = (component?.fields as Record<string, object> | undefined)?.[VISIBILITY_PROP]
    if (field && fieldSizes.has(field)) return fieldSizes.get(field)
  }
  return undefined
}

const cache = new WeakMap<object, Map<boolean, Config>>()

/**
 * Returns a config in which every block (not the root) can be shown or hidden:
 *
 * - adds a Visibility control at the top of each block's sidebar;
 * - on the live page, a Hidden block renders nothing (its children don't run)
 *   and a block hidden on some screen sizes is hidden there with CSS;
 * - in the editor, hidden blocks stay rendered and editable.
 *
 * Idempotent, and cached per config object. `PuckEditor`, `PageRenderer`,
 * `HybridPageRenderer` and the email renderers apply it for you; call it
 * yourself only when you pass a config straight to Puck's `<Render>`.
 */
export function withBlockVisibility<C extends Config<any>>(config: C, options: BlockVisibilityOptions = {}): C {
  const screenSizes = options.screenSizes ?? inheritedScreenSizes(config) ?? true
  let byOption = cache.get(config)
  const cached = byOption?.get(screenSizes)
  if (cached) return cached as C

  const components: Record<string, ComponentConfig<any>> = {}
  let changed = false
  for (const [name, component] of Object.entries(config.components ?? {})) {
    components[name] = component ? withComponentVisibility(name, component as ComponentConfig<any>, screenSizes) : component
    if (components[name] !== component) changed = true
  }
  // Nothing to add (no blocks, or all already have it): keep the config's identity
  const result = changed ? ({ ...config, components } as C) : config

  if (!byOption) cache.set(config, (byOption = new Map()))
  byOption.set(screenSizes, result)
  cache.set(result, new Map([[screenSizes, result]]))
  return result
}
