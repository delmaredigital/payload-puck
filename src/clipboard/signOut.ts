'use client'

/**
 * Keeping a copied block from outliving its user in a shared browser. Puck-free,
 * so the plugin's admin components (the Edit button and list cell hosts already
 * have in their import maps) can use it without loading the editor.
 */

import { useEffect, useRef } from 'react'
import { clearClipboardUnlessOwnedBy, clearStoredClipboard, clipboardOwner, defaultStorage, tabOwner } from './storage.js'

/**
 * Whether copy and paste is on for this admin: the plugin mirrors its
 * `copyPaste` (or the host's `custom.puck.copyPaste`) into
 * `admin.custom.puck.copyPaste`, the part of the config client components get.
 */
export function clipboardEnabled(config: unknown): boolean {
  const value = (config as { admin?: { custom?: { puck?: { copyPaste?: unknown } } } } | undefined)?.admin?.custom?.puck?.copyPaste
  return value !== false
}

const isSet = (id: string | number | null | undefined) => id !== undefined && id !== null && id !== ''

export interface ClipboardGuardOptions {
  /** `false` turns the guard off (the plugin's `copyPaste: false`). */
  enabled?: boolean
  /**
   * Also delete the copy when no one is signed in. True where a user must be
   * signed in (the admin), false in an editor that may run without one.
   */
  clearWhenSignedOut?: boolean
}

/** The last user each document was checked for. */
const checked = new WeakMap<object, string>()
/** The check in flight per document, shared, so a list of cells checks once. */
const inflight = new WeakMap<object, { id: string; promise: Promise<void> }>()

/** The latest check in flight, for tests to wait on. */
let pending: Promise<void> = Promise.resolve()

/**
 * Deletes copies that aren't `userId`'s: this tab's sessionStorage one by the
 * tab owner (no hashing), and the localStorage one by the hashed owner. When
 * the hash can't be made (no Web Crypto), a signed-in user's localStorage copy
 * is left alone, as its owner can't be known; when hashing fails, this
 * rejects after the tab check and the caller treats it the same way.
 */
async function checkOwnership(userId: string | number | null | undefined): Promise<void> {
  clearClipboardUnlessOwnedBy(tabOwner(userId), defaultStorage('session'))
  const owner = await clipboardOwner(userId)
  if (isSet(userId) && owner === undefined) return
  clearClipboardUnlessOwnedBy(owner, defaultStorage('local'))
}

/**
 * While mounted, deletes the stored copy:
 * - on mount, and whenever the user changes, if it belongs to someone other
 *   than the signed-in user (or, with `clearWhenSignedOut`, to anyone when
 *   no one is signed in). Checked once per page and user, however many
 *   components ask;
 * - when the signed-in user changes, or signs out, without the component
 *   unmounting (in practice: in another tab, as Payload's Log out first
 *   navigates away from the page).
 */
export function useClipboardGuard(
  userId: string | number | null | undefined,
  { enabled = true, clearWhenSignedOut = false }: ClipboardGuardOptions = {},
): void {
  const previous = useRef(userId)

  useEffect(() => {
    const before = previous.current
    previous.current = userId
    if (!enabled) return
    if (isSet(before) && (!isSet(userId) || String(before) !== String(userId))) {
      clearStoredClipboard()
      return
    }
    if (!isSet(userId) && !clearWhenSignedOut) return
    if (typeof document === 'undefined') return

    const id = isSet(userId) ? `user:${userId}` : 'nobody'
    if (checked.get(document) === id || inflight.get(document)?.id === id) return

    const doc = document
    const promise = checkOwnership(userId)
      .then(() => { checked.set(doc, id) })
      // Hashing failed or storage is blocked: as without Web Crypto, leave the rest
      .catch(() => {})
      .finally(() => {
        if (inflight.get(doc)?.promise === promise) inflight.delete(doc)
      })
    inflight.set(doc, { id, promise })
    pending = promise
  }, [userId, enabled, clearWhenSignedOut])
}

/** Tests only: forget which users were checked. */
export function resetClipboardGuardForTests(): void {
  if (typeof document !== 'undefined') {
    checked.delete(document)
    inflight.delete(document)
  }
}

/** Tests only: resolves when the latest check has run. */
export function clipboardGuardSettledForTests(): Promise<void> {
  return pending
}
