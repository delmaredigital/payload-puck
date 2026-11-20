/**
 * Types for the block clipboard's per-component hook, `blockClipboard`.
 * Types only: the `blockVisibility` augmentation in `../visibility/core.ts`
 * adds `blockClipboard` next to it, so both are typed wherever either is.
 */

import type { ComponentData } from '@puckeditor/core'

/** A block the paste lands inside, and which of its slots. */
export interface PasteAncestor {
  id: string
  type: string
  /** The slot (field name) on this block that leads to the destination. */
  slot: string
}

export interface PasteDestination {
  /** Puck's zone for the destination, `<parentId>:<slotName>`. */
  zone: string
  /** Where in that zone the block goes. */
  index: number
  /** The blocks the paste lands inside, nearest first. Empty at the top of the page. */
  ancestors: PasteAncestor[]
}

export interface CanPasteArgs {
  /** The copied block, with everything nested in it (before new ids are given). */
  block: ComponentData
  destination: PasteDestination
  /**
   * The ancestor this hook is being asked as, or undefined when it is asked
   * as the pasted block's own type.
   */
  ancestor?: PasteAncestor
}

export interface BlockClipboardComponentOptions {
  /**
   * Veto a paste. Asked for each block the paste lands inside (nearest first),
   * then for the pasted block's own type. Return `true` to allow it, or a
   * short message to refuse it; the first message stops the paste and is
   * shown to the editor. Runs in the browser, so it decides what the editor
   * offers, not what the server accepts.
   */
  canPaste?: (args: CanPasteArgs) => true | string
}
