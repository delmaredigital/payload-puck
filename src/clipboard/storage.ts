/**
 * Block clipboard: copy a block (with everything nested in its slots) and
 * paste it elsewhere, in this page or another one.
 *
 * What is stored, where, and for how long:
 * - one record under `payload-puck:block-clipboard`: the copied block (its
 *   type, settings and nested blocks), when it expires, and a scope;
 * - for a signed-in Payload user, in localStorage, so it survives switching
 *   pages and is shared by that user's editor tabs. The scope is a SHA-256
 *   hash of the user id (plus the host's own scope, if it sets one), so the
 *   id isn't stored in plain text, and a record with another scope reads as
 *   an empty clipboard;
 * - with no signed-in user (or no Web Crypto to hash with), in sessionStorage,
 *   so it doesn't outlive the tab;
 * - in memory for the tab when storage is blocked;
 * - for 24 hours. An expired record is deleted when it's next read;
 * - it also carries an owner: a hash of the user id alone, so the plugin's
 *   admin components (which don't know the host's scope) can delete a copy
 *   belonging to someone other than the signed-in user (see `./signOut.ts`).
 *
 * No React or Puck runtime here, so the plugin's admin components can use it
 * without loading the editor. The paste checks live in `./core.ts`.
 */

import type { ComponentData } from '@puckeditor/core'

export const CLIPBOARD_STORAGE_KEY = 'payload-puck:block-clipboard'
export const CLIPBOARD_FORMAT = 'payload-puck/block'
/**
 * Bump when the record shape changes. Older records are ignored silently;
 * newer ones (from a newer editor in another tab) say to copy again.
 */
export const CLIPBOARD_VERSION = 3
/** How long a copied block can be pasted. */
export const CLIPBOARD_TTL_MS = 24 * 60 * 60 * 1000

export interface ClipboardRecord {
  format: typeof CLIPBOARD_FORMAT
  version: number
  /** Who may read it; see `clipboardScope`. */
  scope: string
  /** Whose it is, by user alone (`user:<hash>`), or absent without a user. */
  owner?: string
  /** Epoch milliseconds after which the record is deleted. */
  expiresAt: number
  block: ComponentData
}

export type ClipboardContents =
  | { status: 'empty' }
  | { status: 'ready'; block: ComponentData }
  /** A block from a newer editor this version can't read. */
  | { status: 'unreadable' }


// -----------------------------------------------------------------------------
// Scope
// -----------------------------------------------------------------------------

/** Where a clipboard keeps its record, and who may read it. */
export interface ClipboardScope {
  storage: 'local' | 'session'
  /** Stored in the record; a record with another value reads as empty. */
  key: string
  /** The signed-in user alone, hashed (see `clipboardOwner`). */
  owner?: string
}

const HASH_PREFIX = 'payload-puck clipboard v1'

async function sha256Hex(subtle: SubtleCrypto, text: string): Promise<string> {
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const hasUser = (userId: string | number | null | undefined): userId is string | number =>
  userId !== null && userId !== undefined && userId !== ''

/**
 * A short, non-cryptographic hash (32-bit FNV-1a) of the user id, for the
 * tab-only (sessionStorage) clipboard used without Web Crypto. It only has to
 * tell users apart in that one tab's storage, so two users signing in one
 * after the other in the same tab don't see each other's copy (unless their
 * ids happen to collide on this 32-bit hash, about a 1 in 4 billion chance
 * per pair); it is not a secret and isn't meant to hide the id from anyone
 * with access to the tab.
 */
export function tabOwner(userId: string | number | null | undefined): string | undefined {
  if (!hasUser(userId)) return undefined
  const id = String(userId)
  const text = `${id.length}:${id}`
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return `tab:${hash.toString(16).padStart(8, '0')}`
}

/**
 * The tab-only scope: sessionStorage, keyed by the user (as `tabOwner`) and
 * the host's scope, so another user in the same tab reads it as empty.
 */
export function sessionScope(userId: string | number | null | undefined, hostScope: string | undefined): ClipboardScope {
  const host = hostScope ?? ''
  const owner = tabOwner(userId)
  return { storage: 'session', key: `session:${owner ?? 'nobody'}:${host.length}:${host}`, ...(owner ? { owner } : {}) }
}

/**
 * The owner stored with a signed-in user's copy: a SHA-256 hash of the user
 * id alone (no host scope), or undefined without a user or Web Crypto.
 */
export async function clipboardOwner(
  userId: string | number | null | undefined,
  subtle: SubtleCrypto | null = globalThis.crypto?.subtle ?? null,
): Promise<string | undefined> {
  if (!hasUser(userId) || !subtle) return undefined
  const id = String(userId)
  return `user:${await sha256Hex(subtle, `${HASH_PREFIX} owner\n${id.length}:${id}`)}`
}

/**
 * The scope for an editor: a signed-in user gets localStorage, keyed by a
 * SHA-256 hash of their id and the host's scope, so the id isn't stored in
 * plain text. Without a user, or without Web Crypto (an admin served over
 * plain http), the clipboard stays in sessionStorage for the tab.
 */
export async function clipboardScope(
  userId: string | number | null | undefined,
  hostScope: string | undefined,
  /** Web Crypto's `subtle`; `null` means none (an admin served over plain http). */
  subtle: SubtleCrypto | null = globalThis.crypto?.subtle ?? null,
): Promise<ClipboardScope> {
  const host = hostScope ?? ''
  if (!hasUser(userId) || !subtle) return sessionScope(userId, hostScope)
  // Length-prefixed, so ("1", "2:x") and ("12", ":x") can't collide
  const id = String(userId)
  const key = `user:${await sha256Hex(subtle, `${HASH_PREFIX}\n${id.length}:${id}\n${host.length}:${host}`)}`
  return { storage: 'local', key, owner: await clipboardOwner(userId, subtle) }
}

// -----------------------------------------------------------------------------
// Storage
// -----------------------------------------------------------------------------

export interface ClipboardStore {
  read(): ClipboardContents
  write(block: ComponentData): void
  /** Called after any change, including one made in another tab, and on expiry. */
  subscribe(listener: () => void): () => void
}

const EMPTY: ClipboardContents = { status: 'empty' }
const UNREADABLE: ClipboardContents = { status: 'unreadable' }

type Parsed = { contents: ClipboardContents; expiresAt?: number; scope?: string }

/**
 * Reads a stored record. Its scope is read first and kept apart from the
 * rest: a record with another scope is invisible whatever else it holds
 * (even a newer version), so `read` checks the scope before anything else.
 * The block's full shape is checked at paste time, against the config.
 */
function parse(raw: string | null): Parsed {
  if (raw === null) return { contents: EMPTY }
  let record: Partial<ClipboardRecord> | null
  try {
    record = JSON.parse(raw) as Partial<ClipboardRecord> | null
  } catch {
    return { contents: EMPTY }
  }
  if (!record || typeof record !== 'object' || record.format !== CLIPBOARD_FORMAT) return { contents: EMPTY }
  const scope = typeof record.scope === 'string' ? record.scope : undefined
  if (typeof record.version !== 'number' || record.version < CLIPBOARD_VERSION) return { contents: EMPTY, scope }
  if (record.version > CLIPBOARD_VERSION) return { contents: UNREADABLE, scope }
  if (typeof record.expiresAt !== 'number' || !record.block || typeof record.block !== 'object') {
    return { contents: UNREADABLE, scope }
  }
  return { contents: { status: 'ready', block: record.block }, expiresAt: record.expiresAt, scope }
}

export function defaultStorage(kind: ClipboardScope['storage']): () => Storage | undefined {
  return () => {
    if (kind === 'local') return typeof localStorage === 'undefined' ? undefined : localStorage
    return typeof sessionStorage === 'undefined' ? undefined : sessionStorage
  }
}

export interface ClipboardStoreOptions {
  scope: ClipboardScope
  getStorage?: () => Storage | undefined
  now?: () => number
  target?: Pick<Window, 'addEventListener' | 'removeEventListener'>
}

/**
 * A clipboard for one scope. Reads only records with that scope; deletes an
 * expired record when it reads it; falls back to memory when storage is
 * missing or throws.
 */
export function createClipboardStore({
  scope,
  getStorage = defaultStorage(scope.storage),
  now = Date.now,
  target = typeof window === 'undefined' ? undefined : window,
}: ClipboardStoreOptions): ClipboardStore {
  let memory: string | null = null
  // Set when the last copy couldn't be stored: memory then wins over storage
  let memoryIsNewer = false
  // Readers compare snapshots by identity, so parse once per stored value
  let cache: { raw: string | null; parsed: Parsed } | undefined
  let expiryTimer: ReturnType<typeof setTimeout> | undefined
  const listeners = new Set<() => void>()

  const storage = (): Storage | undefined => {
    try {
      return getStorage()
    } catch {
      return undefined
    }
  }

  const raw = (): string | null => {
    if (memoryIsNewer) return memory
    try {
      const store = storage()
      if (store) return store.getItem(CLIPBOARD_STORAGE_KEY) ?? memory
    } catch {
      // Storage blocked: memory only
    }
    return memory
  }

  const remove = () => {
    memory = null
    memoryIsNewer = false
    try {
      storage()?.removeItem(CLIPBOARD_STORAGE_KEY)
    } catch {
      // Nothing more to do
    }
  }

  const notify = () => listeners.forEach((listener) => listener())

  // Tell subscribers when the current record expires, so Paste goes away
  const scheduleExpiry = (expiresAt: number | undefined) => {
    clearTimeout(expiryTimer)
    expiryTimer = undefined
    if (expiresAt === undefined || listeners.size === 0) return
    expiryTimer = setTimeout(notify, Math.min(Math.max(expiresAt - now(), 0), 2 ** 31 - 1))
  }

  const onClear = () => {
    memory = null
    memoryIsNewer = false
    cache = undefined
    notify()
  }
  target?.addEventListener(CLIPBOARD_CLEAR_EVENT, onClear)

  const onStorage = (event: StorageEvent) => {
    if (event.key !== CLIPBOARD_STORAGE_KEY && event.key !== null) return
    // A copy made in another tab is newer than our unstored one
    memoryIsNewer = false
    // Deleted in another tab (signed out, expired, cleared): forget ours too
    if (event.newValue === null) {
      memory = null
      cache = undefined
    }
    notify()
  }

  return {
    read() {
      const value = raw()
      if (cache?.raw !== value) {
        cache = { raw: value, parsed: parse(value) }
        if (cache.parsed.scope === scope.key) scheduleExpiry(cache.parsed.expiresAt)
      }
      const { contents, expiresAt, scope: recordScope } = cache.parsed
      // Another user's (or site's) copy, whatever it holds: as if nothing were copied
      if (recordScope !== scope.key) return EMPTY
      if (contents.status !== 'ready') return contents
      if (expiresAt! <= now()) {
        remove()
        cache = { raw: null, parsed: { contents: EMPTY } }
        return EMPTY
      }
      return contents
    },
    write(block) {
      const record: ClipboardRecord = {
        format: CLIPBOARD_FORMAT,
        version: CLIPBOARD_VERSION,
        scope: scope.key,
        ...(scope.owner ? { owner: scope.owner } : {}),
        expiresAt: now() + CLIPBOARD_TTL_MS,
        block,
      }
      const value = JSON.stringify(record)
      memory = value
      memoryIsNewer = false
      try {
        storage()?.setItem(CLIPBOARD_STORAGE_KEY, value)
      } catch {
        // Storage full or blocked: keep the copy in memory for this tab, and
        // never let an older stored copy stand in for it
        memoryIsNewer = true
        try {
          storage()?.removeItem(CLIPBOARD_STORAGE_KEY)
        } catch {
          // Blocked entirely: reads fall back to memory anyway
        }
      }
      notify()
    },
    subscribe(listener) {
      if (listeners.size === 0) target?.addEventListener('storage', onStorage as EventListener)
      listeners.add(listener)
      // React reads before it subscribes, so the first read couldn't schedule this
      if (listeners.size === 1 && cache?.parsed.scope === scope.key) scheduleExpiry(cache.parsed.expiresAt)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          target?.removeEventListener('storage', onStorage as EventListener)
          clearTimeout(expiryTimer)
          expiryTimer = undefined
          cache = undefined
        }
      }
    },
  }
}

/** Fired on `window` when the clipboard is cleared, so open stores drop their memory copy. */
export const CLIPBOARD_CLEAR_EVENT = 'payload-puck:clipboard-clear'

/**
 * Deletes the stored record, whoever it belongs to, from localStorage and
 * this tab's sessionStorage, and tells open editors in this tab to forget
 * their in-memory copy (used on sign-out).
 */
export function clearStoredClipboard(
  storages: Array<() => Storage | undefined> = [defaultStorage('local'), defaultStorage('session')],
): void {
  for (const getStorage of storages) {
    try {
      getStorage()?.removeItem(CLIPBOARD_STORAGE_KEY)
    } catch {
      // Storage blocked: nothing stored there
    }
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CLIPBOARD_CLEAR_EVENT))
}

/**
 * Deletes the stored copy unless it belongs to `owner` (from
 * `clipboardOwner`), including when `owner` is undefined because no one is
 * signed in. A record that can't be read is deleted too. Returns whether
 * anything was deleted.
 */
export function clearClipboardUnlessOwnedBy(
  owner: string | undefined,
  getStorage: () => Storage | undefined = defaultStorage('local'),
): boolean {
  let raw: string | null = null
  try {
    raw = getStorage()?.getItem(CLIPBOARD_STORAGE_KEY) ?? null
  } catch {
    return false
  }
  if (raw === null) return false
  if (owner !== undefined && recordOwnerOf(raw) === owner) return false
  clearStoredClipboard([getStorage])
  return true
}

/**
 * The owner written in a stored record, read without parsing the whole
 * (possibly large) block: records are written with `owner` before `block`,
 * and an owner is a plain `user:<hex>` / `tab:<hex>` string.
 */
function recordOwnerOf(raw: string): string | undefined {
  const blockAt = raw.indexOf('"block":')
  const head = blockAt === -1 ? raw : raw.slice(0, blockAt)
  return /"owner":"((?:user|tab):[0-9a-f]+)"/.exec(head)?.[1]
}
