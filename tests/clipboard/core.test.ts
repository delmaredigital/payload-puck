// @vitest-environment happy-dom

import type { ComponentData, Config } from '@puckeditor/core'
import { describe, expect, it, vi } from 'vitest'
import {
  CLIPBOARD_FORMAT,
  CLIPBOARD_STORAGE_KEY,
  CLIPBOARD_TTL_MS,
  CLIPBOARD_VERSION,
  checkPaste,
  clearStoredClipboard,
  clipboardScope,
  tabOwner,
  createClipboardStore,
  slotsInBlock,
  toClipboardBlock,
  randomUuid,
  vetoPaste,
  withNewIds,
} from '../../src/clipboard/core.js'
import { memoryStorage } from './memoryStorage.js'

const config = {
  components: {
    Box: { fields: { content: { type: 'slot' } }, render: () => null },
    Columns: { fields: { left: { type: 'slot', label: 'Left' }, right: { type: 'slot', label: 'Right' } }, render: () => null },
    Versions: { label: 'Variants', fields: { a: { type: 'slot', label: 'Variant A', disallow: ['Versions'] } }, render: () => null },
    OnlyLeaves: { fields: { content: { type: 'slot', label: 'Leaves', allow: ['Leaf'] } }, render: () => null },
    Leaf: { label: 'Text', fields: { text: { type: 'text' } }, render: () => null },
  },
} as unknown as Config

const leaf = (id: string): ComponentData => ({ type: 'Leaf', props: { id, text: id } })
const box = (id: string, content: ComponentData[]): ComponentData => ({ type: 'Box', props: { id, content } })
const anyone = () => true

const SCOPE = { storage: 'local' as const, key: 'user:a' }
const store = (storage: Storage | (() => Storage | undefined), options: { key?: string; now?: () => number; target?: any } = {}) =>
  createClipboardStore({
    scope: { storage: 'local', key: options.key ?? SCOPE.key },
    getStorage: typeof storage === 'function' ? storage : () => storage,
    now: options.now,
    target: options.target,
  })
const record = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  format: CLIPBOARD_FORMAT, version: CLIPBOARD_VERSION, scope: SCOPE.key, expiresAt: Date.now() + 60_000, block: leaf('a'), ...overrides,
})

describe('clipboard storage', () => {
  it('keeps a versioned, scoped record that expires in 24 hours, readable by a second store', () => {
    const storage = memoryStorage()
    store(storage, { now: () => 1_000 }).write(leaf('a'))

    expect(JSON.parse(storage.getItem(CLIPBOARD_STORAGE_KEY)!)).toEqual({
      format: CLIPBOARD_FORMAT, version: CLIPBOARD_VERSION, scope: 'user:a', expiresAt: 1_000 + CLIPBOARD_TTL_MS, block: leaf('a'),
    })
    expect(CLIPBOARD_TTL_MS).toBe(24 * 60 * 60 * 1000)
    expect(store(storage, { now: () => 2_000 }).read()).toEqual({ status: 'ready', block: leaf('a') })
  })

  it('is empty until something is copied', () => {
    expect(store(memoryStorage()).read()).toEqual({ status: 'empty' })
  })

  it('deletes an expired record when it reads it, and reads as empty', () => {
    const storage = memoryStorage()
    let now = 1_000
    const clipboard = store(storage, { now: () => now })
    clipboard.write(leaf('a'))

    now += CLIPBOARD_TTL_MS - 1
    expect(clipboard.read().status).toBe('ready')
    now += 1
    expect(clipboard.read()).toEqual({ status: 'empty' })
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
  })

  it('tells subscribers when the copy expires', () => {
    vi.useFakeTimers()
    try {
      const clipboard = store(memoryStorage(), { now: () => Date.now() })
      clipboard.write(leaf('a'))
      expect(clipboard.read().status).toBe('ready')
      const listener = vi.fn()
      clipboard.subscribe(listener)

      vi.advanceTimersByTime(CLIPBOARD_TTL_MS)
      expect(listener).toHaveBeenCalled()
      expect(clipboard.read()).toEqual({ status: 'empty' })
    } finally {
      vi.useRealTimers()
    }
  })

  it("reads another user's or site's record as empty, and leaves it alone", () => {
    const storage = memoryStorage()
    store(storage, { key: 'user:someone-else' }).write(leaf('a'))
    expect(store(storage).read()).toEqual({ status: 'empty' })
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).not.toBeNull()
  })

  it('ignores older records, other formats and bad JSON silently, and calls a newer record unreadable', () => {
    for (const raw of [
      record({ version: 1, scope: undefined, expiresAt: undefined }),
      record({ version: 1 }),
      record({ format: 'something-else' }),
      record({ scope: undefined }),
      '{not json',
    ]) {
      const storage = memoryStorage()
      storage.setItem(CLIPBOARD_STORAGE_KEY, raw)
      expect(store(storage).read(), raw).toEqual({ status: 'empty' })
    }
    const storage = memoryStorage()
    storage.setItem(CLIPBOARD_STORAGE_KEY, record({ version: CLIPBOARD_VERSION + 1 }))
    expect(store(storage).read()).toEqual({ status: 'unreadable' })
    // This version but broken: also unreadable (the block's own shape is checked at paste)
    for (const broken of [record({ expiresAt: undefined }), record({ block: undefined })]) {
      storage.setItem(CLIPBOARD_STORAGE_KEY, broken)
      expect(store(storage).read(), broken).toEqual({ status: 'unreadable' })
    }
  })

  it("never shows another user's record, whatever version it is", () => {
    const storage = memoryStorage()
    storage.setItem(CLIPBOARD_STORAGE_KEY, record({ version: CLIPBOARD_VERSION + 1, scope: 'user:someone-else' }))
    expect(store(storage).read()).toEqual({ status: 'empty' })
  })

  it("never pastes an older copy when a new one can't be stored", () => {
    const storage = memoryStorage()
    store(storage).write(leaf('older'))
    const setItem = storage.setItem
    storage.setItem = () => { throw new Error('QuotaExceededError') }

    const clipboard = store(storage)
    clipboard.write(leaf('newer'))
    expect(clipboard.read()).toEqual({ status: 'ready', block: leaf('newer') })
    // The stale copy is gone, so other tabs don't paste it either
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()

    // A copy made later in another tab wins again
    storage.setItem = setItem
    const target = new EventTarget()
    const listening = store(storage, { target })
    listening.subscribe(() => {})
    listening.write(leaf('newer'))
    storage.setItem = () => { throw new Error('QuotaExceededError') }
    listening.write(leaf('unstored'))
    storage.setItem = setItem
    store(storage).write(leaf('from-another-tab'))
    target.dispatchEvent(Object.assign(new Event('storage'), { key: CLIPBOARD_STORAGE_KEY }))
    expect(listening.read()).toEqual({ status: 'ready', block: leaf('from-another-tab') })
  })

  it('keeps showing the newer copy when storage refuses both the write and the clean-up', () => {
    const storage = memoryStorage()
    store(storage).write(leaf('older'))
    storage.setItem = () => { throw new Error('QuotaExceededError') }
    storage.removeItem = () => { throw new Error('blocked') }

    const clipboard = store(storage)
    clipboard.write(leaf('newer'))
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toContain('older')
    expect(clipboard.read()).toEqual({ status: 'ready', block: leaf('newer') })
  })

  it('forgets its own copy when another tab deletes the stored one (signed out there)', () => {
    const storage = memoryStorage()
    const targetB = new EventTarget()
    const tabB = store(storage, { target: targetB })
    tabB.subscribe(() => {})
    tabB.write(leaf('a'))
    expect(tabB.read().status).toBe('ready')

    // Tab A deletes it; the browser tells tab B
    storage.removeItem(CLIPBOARD_STORAGE_KEY)
    targetB.dispatchEvent(Object.assign(new Event('storage'), { key: CLIPBOARD_STORAGE_KEY, newValue: null }))
    expect(tabB.read()).toEqual({ status: 'empty' })
  })

  it('falls back to memory when storage throws or is missing', () => {
    const blocked = store(() => { throw new Error('blocked') })
    blocked.write(leaf('a'))
    expect(blocked.read()).toEqual({ status: 'ready', block: leaf('a') })

    const missing = store(() => undefined)
    missing.write(leaf('b'))
    expect(missing.read()).toEqual({ status: 'ready', block: leaf('b') })

    const full = memoryStorage()
    full.setItem = () => { throw new Error('QuotaExceededError') }
    const clipboard = store(full)
    clipboard.write(leaf('c'))
    expect(clipboard.read()).toEqual({ status: 'ready', block: leaf('c') })
  })

  it('returns the same snapshot until the stored value changes', () => {
    const clipboard = store(memoryStorage())
    clipboard.write(leaf('a'))
    expect(clipboard.read()).toBe(clipboard.read())
  })

  it('tells subscribers about copies here and in other tabs', () => {
    const target = new EventTarget()
    const clipboard = store(memoryStorage(), { target })
    const listener = vi.fn()
    const unsubscribe = clipboard.subscribe(listener)

    clipboard.write(leaf('a'))
    target.dispatchEvent(Object.assign(new Event('storage'), { key: CLIPBOARD_STORAGE_KEY }))
    target.dispatchEvent(Object.assign(new Event('storage'), { key: 'unrelated' }))
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    target.dispatchEvent(Object.assign(new Event('storage'), { key: CLIPBOARD_STORAGE_KEY }))
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('clearStoredClipboard deletes the record, whoever it belongs to, and open stores forget theirs', () => {
    const storage = memoryStorage()
    const session = memoryStorage()
    const blocked = store(() => { throw new Error('blocked') }, { target: window })
    blocked.write(leaf('in-memory'))
    store(storage, { key: 'user:someone-else' }).write(leaf('a'))
    session.setItem(CLIPBOARD_STORAGE_KEY, record())

    clearStoredClipboard([() => storage, () => session])
    expect(storage.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
    expect(session.getItem(CLIPBOARD_STORAGE_KEY)).toBeNull()
    expect(blocked.read()).toEqual({ status: 'empty' })
  })
})

describe('clipboardScope', () => {
  it('keys a signed-in user by a hash, never the id in plain text', async () => {
    const scope = await clipboardScope('user-42', undefined)
    expect(scope.storage).toBe('local')
    expect(scope.key).toMatch(/^user:[0-9a-f]{64}$/)
    expect(scope.key).not.toContain('user-42')
    expect(await clipboardScope('user-42', undefined)).toEqual(scope)
  })

  it('gives other users, and other host scopes, other keys', async () => {
    const base = (await clipboardScope('1', undefined)).key
    expect((await clipboardScope('2', undefined)).key).not.toBe(base)
    expect((await clipboardScope('1', 'tenant-a')).key).not.toBe(base)
    expect((await clipboardScope('1', 'tenant-a')).key).not.toBe((await clipboardScope('1', 'tenant-b')).key)
    // The parts can't run together
    expect((await clipboardScope('1', '2:x')).key).not.toBe((await clipboardScope('12', ':x')).key)
    expect((await clipboardScope(7, undefined)).key).toBe((await clipboardScope('7', undefined)).key)
  })

  it('keeps the clipboard in the tab without a user, or without Web Crypto', async () => {
    for (const userId of [undefined, null, '']) {
      expect(await clipboardScope(userId, 'tenant-a')).toEqual({ storage: 'session', key: 'session:nobody:8:tenant-a' })
    }
    const tab = await clipboardScope('1', undefined, null)
    expect(tab).toEqual({ storage: 'session', key: `session:${tabOwner('1')}:0:`, owner: tabOwner('1') })
    // Two users in one tab get two scopes
    expect((await clipboardScope('2', undefined, null)).key).not.toBe(tab.key)
  })

  it('tells users apart in the tab-only clipboard with a short non-secret hash', () => {
    expect(tabOwner('1')).toMatch(/^tab:[0-9a-f]{8}$/)
    expect(tabOwner('1')).toBe(tabOwner(1))
    expect(tabOwner('1')).not.toBe(tabOwner('2'))
    expect(tabOwner(undefined)).toBeUndefined()
    expect(tabOwner('')).toBeUndefined()
  })
})

describe('slotsInBlock', () => {
  const tabsConfig = {
    components: {
      ...config.components,
      Tabs: {
        fields: {
          title: { type: 'text' },
          tabs: { type: 'array', label: 'Tabs', arrayFields: { label: { type: 'text' }, body: { type: 'slot', label: 'Content', allow: ['Leaf'] } } },
          sideBar: { type: 'object', objectFields: { aside: { type: 'slot' } } },
        },
        render: () => null,
      },
    },
  } as unknown as Config

  it('lists top-level slots in field order, labelled', () => {
    const cols = { type: 'Columns', props: { id: 'c', left: [leaf('x')], right: [] } } as unknown as ComponentData
    expect(slotsInBlock(cols, config).map(({ path, label, value }) => [path, label, value])).toEqual([
      ['left', 'Left', [leaf('x')]],
      ['right', 'Right', []],
    ])
    expect(slotsInBlock(leaf('a'), config)).toEqual([])
    expect(slotsInBlock({ type: 'Missing', props: {} } as ComponentData, config)).toEqual([])
  })

  it('finds slots inside array items and object fields, with Puck\'s paths and readable labels', () => {
    const tabs = {
      type: 'Tabs',
      props: { id: 't', tabs: [{ label: 'A', body: [leaf('x')] }, { label: 'B', body: [] }], sideBar: { aside: [] } },
    } as unknown as ComponentData
    expect(slotsInBlock(tabs, tabsConfig).map(({ path, label, allow }) => [path, label, allow])).toEqual([
      ['tabs[0].body', 'Tabs 1 › Content', ['Leaf']],
      ['tabs[1].body', 'Tabs 2 › Content', ['Leaf']],
      ['sideBar.aside', 'Side bar › Aside', undefined],
    ])
  })

  it('checks nested slots: their allow lists, and unknown types inside them', () => {
    const tabs = (body: unknown[]) =>
      ({ type: 'Tabs', props: { id: 't', tabs: [{ label: 'A', body }] } }) as unknown as ComponentData
    expect(checkPaste(tabs([leaf('x')]), { slotPath: 'default-zone' }, tabsConfig, anyone)).toEqual({ ok: true })
    expect(checkPaste(tabs([box('b', [])]), { slotPath: 'default-zone' }, tabsConfig, anyone))
      .toEqual({ ok: false, reason: "Box blocks aren't allowed in Tabs 1 › Content." })
    expect(checkPaste(tabs([{ type: 'Gone', props: {} }]), { slotPath: 'default-zone' }, tabsConfig, anyone))
      .toMatchObject({ ok: false, reason: expect.stringContaining('"Gone"') })
    // And the destination itself, by path
    const parent = tabs([])
    expect(checkPaste(box('b', []), { parent, slotPath: 'tabs[0].body' }, tabsConfig, anyone))
      .toEqual({ ok: false, reason: "Box blocks aren't allowed in Tabs 1 › Content." })
  })

  it('reports a malformed copy as unreadable', () => {
    for (const block of [
      { type: 'Box', props: { id: 'b', content: 'not a list' } },
      { type: 'Box', props: { id: 'b', content: [{ props: {} }] } },
      { type: 'Box', props: { id: 'b', content: [{ type: 'Leaf', props: 'no' }] } },
      { type: 'Box', props: [] },
      { props: {} },
    ]) {
      expect(checkPaste(block as unknown as ComponentData, { slotPath: 'default-zone' }, config, anyone), JSON.stringify(block))
        .toEqual({ ok: false, reason: 'The copied block came from a different version of the editor. Copy it again.' })
    }
  })
})

describe('toClipboardBlock', () => {
  it('keeps what saving the page would store: no undefined, dates as ISO strings', () => {
    const when = new Date('2026-11-19T10:00:00.000Z')
    expect(toClipboardBlock({ type: 'Leaf', props: { id: 'a', gone: undefined, when, list: [1, undefined, 'x'], bad: Number.NaN } } as any))
      .toEqual({ type: 'Leaf', props: { id: 'a', when: '2026-11-19T10:00:00.000Z', list: [1, null, 'x'], bad: null } })
  })

  it("refuses what JSON can't carry", () => {
    for (const value of [() => 1, { $$typeof: Symbol.for('react.element') }, new Map(), Symbol('x'), BigInt(1), new (class Thing {})()]) {
      expect(toClipboardBlock({ type: 'Leaf', props: { id: 'a', value } } as any)).toBeUndefined()
    }
  })
})

describe('randomUuid', () => {
  const shape = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  it('works without crypto.randomUUID (plain-http admin) and without Web Crypto at all', () => {
    const fromRandomValues = randomUuid({ getRandomValues: (array: any) => crypto.getRandomValues(array) } as Partial<Crypto>)
    expect(fromRandomValues).toMatch(shape)
    expect(randomUuid({})).toMatch(shape)
    expect(randomUuid(undefined as unknown as Partial<Crypto>)).toMatch(shape)
    expect(randomUuid({})).not.toBe(randomUuid({}))
  })
})

describe('checkPaste', () => {
  it('allows a known block into a slot that accepts it', () => {
    expect(checkPaste(leaf('a'), { parent: box('p', []), slotPath: 'content' }, config, anyone)).toEqual({ ok: true })
    expect(checkPaste(leaf('a'), { slotPath: 'default-zone' }, config, anyone)).toEqual({ ok: true })
  })

  it('refuses a type this editor does not have, at any depth', () => {
    expect(checkPaste({ type: 'Gone', props: { id: 'g' } }, { slotPath: 'default-zone' }, config, anyone))
      .toEqual({ ok: false, reason: 'This editor has no "Gone" block, so the copied block can\'t be pasted here.' })
    expect(checkPaste(box('b', [box('c', [{ type: 'Gone', props: { id: 'g' } }])]), { slotPath: 'default-zone' }, config, anyone))
      .toMatchObject({ ok: false, reason: expect.stringContaining('"Gone"') })
  })

  it('follows the destination slot\'s allow and disallow lists', () => {
    expect(checkPaste({ type: 'Versions', props: { id: 'v', a: [] } }, { parent: { type: 'Versions', props: { id: 'p', a: [] } } as ComponentData, slotPath: 'a' }, config, anyone))
      .toEqual({ ok: false, reason: "Variants blocks aren't allowed in Variant A." })
    expect(checkPaste(box('b', []), { parent: { type: 'OnlyLeaves', props: { id: 'p', content: [] } } as ComponentData, slotPath: 'content' }, config, anyone))
      .toEqual({ ok: false, reason: "Box blocks aren't allowed in Leaves." })
  })

  it('checks the slots inside the pasted block against this config', () => {
    const inside = { type: 'OnlyLeaves', props: { id: 'o', content: [box('b', [])] } } as ComponentData
    expect(checkPaste(inside, { slotPath: 'default-zone' }, config, anyone))
      .toEqual({ ok: false, reason: "Box blocks aren't allowed in Leaves." })
  })

  it('follows Puck\'s insert permission', () => {
    expect(checkPaste(leaf('a'), { slotPath: 'default-zone' }, config, (type) => type !== 'Leaf'))
      .toEqual({ ok: false, reason: "You can't add Text blocks here." })
  })
})

describe('withNewIds', () => {
  it('gives the block and every nested block a new, unique id, keeping everything else', () => {
    const original = box('outer', [leaf('one'), box('inner', [leaf('deep')])])
    const copy = withNewIds(original, config)

    const ids: string[] = []
    const collect = (block: ComponentData) => {
      ids.push(block.props.id as string)
      for (const child of ((block.props as { content?: ComponentData[] }).content ?? [])) collect(child)
    }
    collect(copy)

    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
    for (const old of ['outer', 'one', 'inner', 'deep']) expect(ids).not.toContain(old)
    expect(ids.every((id) => /^(Box|Leaf)-[0-9a-f-]{36}$/.test(id))).toBe(true)
    expect((copy.props as any).content[1].props.content[0].props.text).toBe('deep')
    expect(original.props.id).toBe('outer')
  })
})

describe('vetoPaste', () => {
  const destination = {
    zone: 'inner:content',
    index: 0,
    ancestors: [{ id: 'inner', type: 'Box', slot: 'content' }, { id: 'outer', type: 'Columns', slot: 'left' }],
  }
  const withHooks = (hooks: Record<string, (args: any) => true | string>) => ({
    components: Object.fromEntries(Object.entries(config.components).map(([type, component]) =>
      [type, hooks[type] ? { ...component, blockClipboard: { canPaste: hooks[type] } } : component])),
  }) as unknown as Config

  it('asks every ancestor, nearest first, then the pasted type, and stops at the first message', () => {
    const asked: string[] = []
    const hooks = {
      Box: (args: any) => { asked.push(`Box as ${args.ancestor?.id}`); return true as const },
      Columns: (args: any) => { asked.push(`Columns as ${args.ancestor?.id}`); return 'Not in columns.' },
      Leaf: (args: any) => { asked.push(`Leaf as ${args.ancestor?.id}`); return true as const },
    }
    expect(vetoPaste(leaf('a'), destination, withHooks(hooks))).toBe('Not in columns.')
    expect(asked).toEqual(['Box as inner', 'Columns as outer'])
  })

  it('asks the pasted type last, with no ancestor, and passes the whole destination', () => {
    const canPaste = vi.fn(() => true as const)
    expect(vetoPaste(leaf('a'), destination, withHooks({ Leaf: canPaste }))).toBeUndefined()
    expect(canPaste).toHaveBeenCalledWith({ block: leaf('a'), destination, ancestor: undefined })
  })

  it('refuses when a hook throws or answers with something other than true or a message', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(vetoPaste(leaf('a'), destination, withHooks({ Box: () => { throw new Error('boom') } })))
      .toBe("This block can't be pasted here.")
    expect(error).toHaveBeenCalled()
    for (const answer of [false, '', '  ', undefined]) {
      expect(vetoPaste(leaf('a'), destination, withHooks({ Box: () => answer as never }))).toBe("This block can't be pasted here.")
    }
    error.mockRestore()
  })

  it('allows a paste when no type has a hook', () => {
    expect(vetoPaste(leaf('a'), destination, config)).toBeUndefined()
  })
})
