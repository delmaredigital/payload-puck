'use client'

/**
 * Editor side of block visibility: the action bar toggle and the styles that
 * grey hidden blocks in the canvas and tag them in the Outline.
 *
 * `composeVisibilityOverrides` wraps the editor's final overrides, so a host's
 * own `actionBar`, `iframe` or `puck` override keeps working with these added.
 */

import { createElement, Fragment, useMemo, type ReactNode } from 'react'
import { ActionBar, createUsePuck, walkTree, type ComponentData, type Config, type Data, type Overrides, type PuckAction } from '@puckeditor/core'
import { Eye, EyeOff } from 'lucide-react'
import { buildCanvasCss, buildOutlineCss, type VisibilityEntry } from './css.js'
import { VISIBILITY_STRINGS } from './BlockVisibilityField.js'
import { VISIBILITY_PROP, getBlockVisibility, readBlockVisibility, setBlockHidden } from './index.js'

const usePuck = createUsePuck()

/** Every block with a visibility setting, including blocks inside hidden ones. */
export function collectVisibilityEntries(data: Data, config: Config): VisibilityEntry[] {
  const entries: VisibilityEntry[] = []
  walkTree(data, config, (content) => {
    for (const block of content) {
      const visibility = getBlockVisibility(block)
      if ((visibility.hidden || visibility.hideOn.length) && typeof block.props?.id === 'string') {
        entries.push({ id: block.props.id, visibility })
      }
    }
  })
  return entries
}

function useVisibilityEntries(): VisibilityEntry[] {
  const data = usePuck((s) => s.appState.data)
  const config = usePuck((s) => s.config)
  return useMemo(() => collectVisibilityEntries(data, config), [data, config])
}

/** Greys hidden blocks in the canvas. Rendered inside the preview iframe. */
export function VisibilityCanvasStyles() {
  const css = buildCanvasCss(useVisibilityEntries())
  return css ? createElement('style', { 'data-payload-puck-visibility': 'canvas' }, css) : null
}

/** Tags hidden blocks in the Outline, and covers the canvas when it isn't in an iframe. */
export function VisibilityEditorStyles() {
  const entries = useVisibilityEntries()
  const css = [buildOutlineCss(entries), buildCanvasCss(entries)].filter(Boolean).join('\n')
  return css ? createElement('style', { 'data-payload-puck-visibility': 'editor' }, css) : null
}

/**
 * The Puck action that flips a block between Shown and Hidden. A `replace`,
 * so Puck records it in history (undo/redo) like any other edit.
 */
export function toggleVisibilityAction(
  block: ComponentData,
  selector: { index: number; zone: string },
): PuckAction {
  const props: Record<string, unknown> = { ...block.props }
  const next = setBlockHidden(readBlockVisibility(props), !getBlockVisibility(block).hidden)
  if (next) props[VISIBILITY_PROP] = next
  else delete props[VISIBILITY_PROP]
  return {
    type: 'replace',
    destinationIndex: selector.index,
    destinationZone: selector.zone,
    data: { ...block, props } as ComponentData,
  }
}

/**
 * Hide/show toggle for the action bar. Puck only makes the selected block's
 * action bar visible and clickable, so it acts on the selected block.
 */
export function VisibilityAction() {
  const selectedItem = usePuck((s) => s.selectedItem)
  const dispatch = usePuck((s) => s.dispatch)
  const getSelectorForId = usePuck((s) => s.getSelectorForId)
  if (!selectedItem) return null

  const hidden = getBlockVisibility(selectedItem).hidden
  const label = hidden ? VISIBILITY_STRINGS.showAction : VISIBILITY_STRINGS.hideAction

  const onClick = () => {
    const selector = getSelectorForId(selectedItem.props.id as string)
    if (selector) dispatch(toggleVisibilityAction(selectedItem, selector))
  }

  return createElement(ActionBar.Action, {
    onClick,
    label,
    active: hidden,
    children: createElement(hidden ? EyeOff : Eye, { size: 16 }),
  })
}

type ActionBarProps = Parameters<Overrides['actionBar']>[0]

/** Puck's default action bar layout (not exported by Puck). */
export function DefaultActionBar({ label, children, parentAction, dragHandle }: ActionBarProps) {
  return createElement(
    ActionBar,
    null,
    createElement(ActionBar.Group, null, parentAction, label ? createElement(ActionBar.Label, { label }) : null),
    createElement(ActionBar.Group, null, children),
    dragHandle ? createElement(ActionBar.Group, null, dragHandle) : null,
  )
}

/**
 * Adds visibility to an editor's overrides without replacing any of them:
 * - `actionBar`: the toggle is passed as the first action into the host's
 *   action bar (or Puck's default one);
 * - `iframe`: canvas styles are added next to the existing preview wrapper;
 * - `puck`: Outline styles are added around the existing editor UI.
 */
export function composeVisibilityOverrides(overrides: Partial<Overrides>): Partial<Overrides> {
  const { actionBar: HostActionBar, iframe: HostIframe, puck: HostPuck } = overrides
  const Bar = HostActionBar ?? DefaultActionBar

  return {
    ...overrides,
    actionBar: (props: ActionBarProps) =>
      createElement(Bar, props, createElement(VisibilityAction, null), props.children),
    iframe: (props: { children: ReactNode; document?: Document }) =>
      createElement(
        Fragment,
        null,
        createElement(VisibilityCanvasStyles, null),
        HostIframe ? createElement(HostIframe, props) : props.children,
      ),
    puck: (props: { children: ReactNode }) =>
      createElement(
        Fragment,
        null,
        createElement(VisibilityEditorStyles, null),
        HostPuck ? createElement(HostPuck, props) : props.children,
      ),
  }
}
