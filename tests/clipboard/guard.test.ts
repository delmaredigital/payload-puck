// @vitest-environment happy-dom

/**
 * The clipboard guard: the plugin's admin Edit button and list cell (already in
 * every host's import map) and the editor delete a copied block that belongs
 * to someone other than the signed-in user, and the copy on sign-out.
 */

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLIPBOARD_FORMAT, CLIPBOARD_STORAGE_KEY, CLIPBOARD_VERSION, clipboardOwner, tabOwner } from '../../src/clipboard/storage.js'
import { clipboardGuardSettledForTests, resetClipboardGuardForTests, useClipboardGuard, type ClipboardGuardOptions } from '../../src/clipboard/signOut.js'
import { memoryStorage } from './memoryStorage.js'

const auth = vi.hoisted(() => ({ user: null as { id: string } | null, copyPaste: undefined as unknown, noConfig: false }))
vi.mock('@payloadcms/ui', () => ({
  useAuth: () => ({ user: auth.user }),
  // Outside Payload's config provider, useConfig returns undefined
  useConfig: () => (auth.noConfig ? undefined : { config: { routes: { admin: '/admin' }, admin: { custom: { puck: { copyPaste: auth.copyPaste } } } } }),
  useDocumentInfo: () => ({ id: 'p1', collectionSlug: 'pages' }),
}))

const { EditWithPuckCell } = await import('../../src/admin/EditWithPuckCell.js')
const { EditWithPuckButton } = await import('../../src/admin/EditWithPuckButton.js')

let storage: Storage
let session: Storage
let root: Root

async function store(owner: string | undefined) {
  storage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify({
    format: CLIPBOARD_FORMAT, version: CLIPBOARD_VERSION, scope: 'user:x', ...(owner ? { owner } : {}),
    expiresAt: Date.now() + 60_000, block: { type: 'Leaf', props: { id: 'a' } },
  }))
}

const stored = () => storage.getItem(CLIPBOARD_STORAGE_KEY)

function Guard({ userId, ...options }: { userId?: string } & ClipboardGuardOptions) {
  useClipboardGuard(userId, options)
  return null
}

/** Renders, then waits for the guard's check (hashing is asynchronous) to finish. */
async function render(element: ReturnType<typeof createElement>) {
  await act(async () => { root.render(element) })
  await act(() => clipboardGuardSettledForTests())
}

const settled = (check: () => void) => check()

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  storage = memoryStorage()
  vi.stubGlobal('localStorage', storage)
  session = memoryStorage()
  vi.stubGlobal('sessionStorage', session)
  resetClipboardGuardForTests()
  auth.user = null
  auth.copyPaste = undefined
  auth.noConfig = false
  root = createRoot(document.createElement('div'))
})

afterEach(() => {
  act(() => root.unmount())
  vi.unstubAllGlobals()
})

describe('useClipboardGuard', () => {
  it("deletes a copy that belongs to someone else, and keeps the user's own", async () => {
    await store(await clipboardOwner('someone-else'))
    await render(createElement(Guard, { userId: 'me' }))
    await settled(() => expect(stored()).toBeNull())

    resetClipboardGuardForTests()
    await store(await clipboardOwner('me'))
    await render(createElement(Guard, { userId: 'me', clearWhenSignedOut: true }))
    expect(stored()).not.toBeNull()
  })

  it('deletes a copy with no owner, or one that can no longer be read', async () => {
    await store(undefined)
    await render(createElement(Guard, { userId: 'me' }))
    await settled(() => expect(stored()).toBeNull())

    resetClipboardGuardForTests()
    storage.setItem(CLIPBOARD_STORAGE_KEY, '{not json')
    await render(createElement(Guard, { userId: 'someone' }))
    await settled(() => expect(stored()).toBeNull())
  })

  it('deletes any copy when no one is signed in, where a user is expected (the admin)', async () => {
    await store(await clipboardOwner('someone'))
    await render(createElement(Guard, { clearWhenSignedOut: true }))
    await settled(() => expect(stored()).toBeNull())
  })

  it('leaves the copy alone without a user where none is expected (an editor outside the admin)', async () => {
    await store(await clipboardOwner('someone'))
    await render(createElement(Guard, {}))
    expect(stored()).not.toBeNull()
  })

  it('deletes the copy when the user signs out or changes while mounted', async () => {
    for (const next of [undefined, 'someone-else']) {
      resetClipboardGuardForTests()
      await store(await clipboardOwner('me'))
      await render(createElement(Guard, { userId: 'me' }))
      expect(stored()).not.toBeNull()
      await render(createElement(Guard, { userId: next }))
      await settled(() => expect(stored()).toBeNull())
    }
  })

  it('does nothing when turned off', async () => {
    await store(await clipboardOwner('someone-else'))
    await render(createElement(Guard, { userId: 'me', enabled: false, clearWhenSignedOut: true }))
    await render(createElement(Guard, { enabled: false, clearWhenSignedOut: true }))
    expect(stored()).not.toBeNull()
  })
})

describe('without Web Crypto (plain-http admin)', () => {
  const realCrypto = globalThis.crypto
  const noSubtle = () => vi.stubGlobal('crypto', { getRandomValues: <T extends ArrayBufferView>(array: T) => realCrypto.getRandomValues(array) })
  const storeInTab = (owner: string | undefined) =>
    session.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify({
      format: CLIPBOARD_FORMAT, version: CLIPBOARD_VERSION, scope: 'session:x', ...(owner ? { owner } : {}),
      expiresAt: Date.now() + 60_000, block: { type: 'Leaf', props: { id: 'a' } },
    }))

  it("deletes the previous user's tab copy when another user signs in to that tab", async () => {
    noSubtle()
    storeInTab(tabOwner('alice'))
    await render(createElement(Guard, { userId: 'bob' }))
    expect(session.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
  })

  it("keeps the user's own tab copy", async () => {
    noSubtle()
    storeInTab(tabOwner('alice'))
    await render(createElement(Guard, { userId: 'alice' }))
    expect(session.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
  })

  it("leaves a signed-in user's localStorage copy alone, as its owner can't be known", async () => {
    noSubtle()
    await store('user:not-checkable')
    await render(createElement(Guard, { userId: 'alice', clearWhenSignedOut: true }))
    expect(stored()).not.toBeNull()
  })

  it('treats a failing digest like no Web Crypto, without an unhandled rejection', async () => {
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    vi.stubGlobal('crypto', { subtle: { digest: () => Promise.reject(new Error('boom')) }, getRandomValues: realCrypto.getRandomValues.bind(realCrypto) })
    await store('user:someone')
    storeInTab(tabOwner('eve'))
    await render(createElement(Guard, { userId: 'alice' }))
    await new Promise((resolve) => setImmediate(resolve))
    process.off('unhandledRejection', unhandled)
    expect(unhandled).not.toHaveBeenCalled()
    expect(stored()).not.toBeNull()
    expect(session.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
  })
})

describe('many components at once', () => {
  it('checks once: one hash and one read of storage for a whole list of cells', async () => {
    auth.user = { id: 'me' }
    await store(await clipboardOwner('someone-else'))
    const digest = vi.spyOn(globalThis.crypto.subtle, 'digest')
    const getItem = vi.spyOn(storage, 'getItem')
    const cells = Array.from({ length: 100 }, (_, index) =>
      createElement(EditWithPuckCell, { key: index, rowData: { id: `p${index}` }, field: {}, collectionSlug: 'pages' } as never))
    await render(createElement('div', null, cells))
    const reads = getItem.mock.calls.filter(([key]) => key === CLIPBOARD_STORAGE_KEY).length
    expect(digest).toHaveBeenCalledTimes(1)
    expect(reads).toBe(1)
    expect(stored()).toBeNull()
  })
})

describe('the admin list cell and Edit button', () => {
  const cell = () =>
    createElement(EditWithPuckCell, { rowData: { id: 'p1' }, field: {}, collectionSlug: 'pages' } as never)
  const button = () => createElement(EditWithPuckButton as never, { field: {} } as never)

  it.each([['cell', cell], ['button', button]])("the %s deletes another user's copy", async (_name, make) => {
    auth.user = { id: 'me' }
    await store(await clipboardOwner('someone-else'))
    await render(make())
    expect(stored()).toBeNull()
  })

  it.each([['cell', cell], ['button', button]])("the %s leaves it alone when the config's copyPaste is off", async (_name, make) => {
    auth.user = { id: 'me' }
    auth.copyPaste = false
    await store(await clipboardOwner('someone-else'))
    await render(make())
    expect(stored()).not.toBeNull()
  })

  it.each([['cell', cell], ['button', button]])('the %s renders outside a config provider, with the guard on', async (_name, make) => {
    auth.user = { id: 'me' }
    auth.noConfig = true
    await store(await clipboardOwner('someone-else'))
    await expect(render(make())).resolves.toBeUndefined()
    expect(stored()).toBeNull()
  })
})
