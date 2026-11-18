/**
 * Adds show/hide to every block of a Puck config.
 *
 * Server-safe (no hooks, no 'use client'): PageRenderer calls it on the server.
 * The sidebar control it references is a client component and only runs in
 * the editor.
 */

import { createElement, Fragment, type ComponentType, type ReactNode } from 'react'
import type { ComponentConfig, Config, CustomField, Fields } from '@puckeditor/core'
import { BlockVisibilityControl } from './BlockVisibilityField.js'
import { LIVE_CSS, LIVE_STYLE_HREF, VISIBILITY_WRAPPER_CLASS, hideOnClassName } from './css.js'
import { VISIBILITY_PROP, getBlockVisibility, type BlockVisibility } from './index.js'
import { warnOnce } from '../config/merge.js'

export interface BlockVisibilityOptions {
  /**
   * Offer hiding per screen size (phone / tablet / desktop). Set false for
   * email, where media queries are unreliable.
   *
   * Defaults to the setting the config's blocks were already given (so blocks
   * added to `emailEditorConfig` inherit Shown/Hidden only), otherwise true.
   * A block type can turn it off for itself with
   * `blockVisibility: { screenSizes: false }`.
   */
  screenSizes?: boolean
}

// -----------------------------------------------------------------------------
// Our own pieces, recognized by identity
// -----------------------------------------------------------------------------

type RenderFieldsFn = NonNullable<ComponentConfig['renderFields']>
type ResolveFieldsFn = NonNullable<ComponentConfig['resolveFields']>
type VisibilityField = CustomField<BlockVisibility | undefined>

/** Field objects created here → whether they offer screen sizes. */
const fieldSizes = new WeakMap<object, boolean>()
const fieldsBySizes = new Map<boolean, VisibilityField>()

/** Render wrappers created here → what they wrap and how. */
const renderWrappers = new WeakMap<object, { inner: ComponentType<any>; screenSizes: boolean; requested: boolean }>()
/** renderFields / resolveFields wrappers created here → the host function they wrap. */
const renderFieldsWrappers = new WeakMap<object, RenderFieldsFn>()
const resolveFieldsWrappers = new WeakMap<object, { inner: ResolveFieldsFn; field: VisibilityField }>()

function visibilityField(screenSizes: boolean): VisibilityField {
  let field = fieldsBySizes.get(screenSizes)
  if (!field) {
    field = {
      type: 'custom',
      label: 'Visibility',
      // Visibility is an editorial choice; generated pages start shown
      ai: { exclude: true },
      render: ({ value, onChange, readOnly }) =>
        createElement(BlockVisibilityControl, { value, onChange, readOnly, screenSizes }),
    }
    fieldsBySizes.set(screenSizes, field)
    fieldSizes.set(field, screenSizes)
  }
  return field
}

/** True for the Visibility field this module adds (and nothing else). */
export function isBlockVisibilityField(field: unknown): boolean {
  return typeof field === 'object' && field !== null && fieldSizes.has(field)
}

/**
 * True when the component renders through show/hide: its `render` is ours.
 * A copy that replaced `render` (e.g. `{ ...wrapped, render: Mine }`) is not.
 */
export function hasBlockVisibility(component: Pick<ComponentConfig, 'render'> | undefined): boolean {
  return !!component?.render && renderWrappers.has(component.render)
}

// -----------------------------------------------------------------------------
// Wrappers
// -----------------------------------------------------------------------------

type RenderProps = Record<string, unknown> & { puck?: { isEditing?: boolean } }

function wrapRender(Render: ComponentType<any>, screenSizes: boolean, requested: boolean, name: string) {
  function BlockVisibilityRender(props: RenderProps): ReactNode {
    // In the editor a hidden block stays fully rendered and editable; the
    // editor grays it with CSS keyed on Puck's own block attribute
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
        {
          className: [VISIBILITY_WRAPPER_CLASS, ...visibility.hideOn.map(hideOnClassName)].join(' '),
          style: { display: 'contents' },
        },
        createElement(Render, props),
      ),
    )
  }
  BlockVisibilityRender.displayName = `BlockVisibility(${name})`
  renderWrappers.set(BlockVisibilityRender, { inner: Render, screenSizes, requested })
  return BlockVisibilityRender
}

/** Pins the visibility control above whatever layout the block uses. */
function wrapRenderFields(RenderFields: RenderFieldsFn): RenderFieldsFn {
  const wrapper: RenderFieldsFn = function BlockVisibilityRenderFields({ fields, ...rest }) {
    const { [VISIBILITY_PROP]: control, ...others } = fields as Record<string, ReactNode>
    return createElement(
      Fragment,
      null,
      control,
      createElement(RenderFields as ComponentType<any>, { ...rest, fields: others }),
    )
  }
  renderFieldsWrappers.set(wrapper, RenderFields)
  return wrapper
}

/** The fields with the control first, replacing any copy of it. */
function withVisibilityField(fields: Fields<any> | undefined, field: VisibilityField): Fields<any> {
  const { [VISIBILITY_PROP]: _ignored, ...rest } = (fields ?? {}) as Record<string, any>
  return { [VISIBILITY_PROP]: field, ...rest } as Fields<any>
}

/** Puts the control back, first, when the block's own resolveFields returns new fields. */
function wrapResolveFields(resolveFields: ResolveFieldsFn, field: VisibilityField): ResolveFieldsFn {
  const wrapper: ResolveFieldsFn = (data, params) => {
    const result = resolveFields(data, params)
    return result instanceof Promise
      ? result.then((fields) => withVisibilityField(fields, field))
      : withVisibilityField(result, field)
  }
  resolveFieldsWrappers.set(wrapper, { inner: resolveFields, field })
  return wrapper
}

// -----------------------------------------------------------------------------
// Per component
// -----------------------------------------------------------------------------

function withComponentVisibility(name: string, component: ComponentConfig<any>, requested: boolean): ComponentConfig<any> {
  const existing = (component.fields as Record<string, unknown> | undefined)?.[VISIBILITY_PROP]
  if (existing !== undefined && !isBlockVisibilityField(existing)) {
    warnOnce(`[payload-puck] component "${name}" defines its own "${VISIBILITY_PROP}" field; show/hide was not added to it`)
    return component
  }

  const screenSizes = requested && component.blockVisibility?.screenSizes !== false
  const field = visibilityField(screenSizes)
  const render = renderWrappers.get(component.render)
  const resolve = component.resolveFields ? resolveFieldsWrappers.get(component.resolveFields) : undefined

  // Done only when every piece is ours and made for these settings. A copy
  // with its own render, renderFields or resolveFields is wrapped again
  const done =
    render?.screenSizes === screenSizes &&
    render.requested === requested &&
    existing === field &&
    (!component.renderFields || renderFieldsWrappers.has(component.renderFields)) &&
    (!component.resolveFields || resolve?.field === field)
  if (done) return component

  const innerRender = render?.inner ?? (component.render as ComponentType<any>)
  const innerRenderFields = component.renderFields
    ? (renderFieldsWrappers.get(component.renderFields) ?? component.renderFields)
    : undefined
  const innerResolveFields = component.resolveFields ? (resolve?.inner ?? component.resolveFields) : undefined

  return {
    ...component,
    // First in the object so Puck's default field order puts it on top
    fields: withVisibilityField(component.fields, field),
    ...(innerRenderFields ? { renderFields: wrapRenderFields(innerRenderFields) } : {}),
    ...(innerResolveFields ? { resolveFields: wrapResolveFields(innerResolveFields, field) } : {}),
    render: wrapRender(innerRender, screenSizes, requested, name) as unknown as ComponentConfig['render'],
  }
}

/** The screenSizes setting the config's blocks were given, if any were. */
function inheritedScreenSizes(config: Config<any>): boolean | undefined {
  for (const component of Object.values(config.components ?? {})) {
    const render = component?.render && renderWrappers.get(component.render)
    if (render) return render.requested
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
 * Safe to call repeatedly, and cached per config object. Blocks copied from a
 * wrapped config with their own `render` (or `renderFields` / `resolveFields`)
 * are wrapped again. `PuckEditor`, `PageRenderer`, `HybridPageRenderer` and the
 * email renderers apply it for you; call it yourself only when you pass a
 * config straight to Puck's `<Render>`.
 */
export function withBlockVisibility<C extends Config<any>>(config: C, options: BlockVisibilityOptions = {}): C {
  const requested = options.screenSizes ?? inheritedScreenSizes(config) ?? true
  let byOption = cache.get(config)
  const cached = byOption?.get(requested)
  if (cached) return cached as C

  const components: Record<string, ComponentConfig<any>> = {}
  let changed = false
  for (const [name, component] of Object.entries(config.components ?? {})) {
    components[name] = component ? withComponentVisibility(name, component as ComponentConfig<any>, requested) : component
    if (components[name] !== component) changed = true
  }
  // Nothing to change (no blocks, or all already done): keep the config's identity
  const result = changed ? ({ ...config, components } as C) : config

  if (!byOption) cache.set(config, (byOption = new Map()))
  byOption.set(requested, result)
  if (result !== config) cache.set(result, new Map([[requested, result]]))
  return result
}
