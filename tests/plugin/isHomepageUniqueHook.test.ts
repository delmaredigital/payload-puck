/**
 * The homepage uniqueness hook enforces "one live homepage". A draft save on a
 * drafts-enabled collection leaves the live document untouched, so the hook
 * must not block it — otherwise the editor prompts for a swap on every draft
 * save, and accepting that prompt unset the live homepage before anything was
 * published.
 */

import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'

import {
  createIsHomepageUniqueHook,
  HomepageConflictError,
  collectionHasDrafts,
} from '../../src/plugin/hooks/isHomepageUnique.js'

const hook = createIsHomepageUniqueHook()

function run(
  data: Record<string, unknown>,
  drafts: boolean,
  originalDoc: Record<string, unknown> = { id: 'target', isHomepage: false }
) {
  const find = vi.fn(async () => ({
    docs: [{ id: 'old-home', title: 'Home', slug: 'home' }],
  }))
  const req = { payload: { find }, context: {} } as unknown as PayloadRequest
  const collection = { slug: 'pages', versions: drafts ? { drafts: true } : false }

  const result = hook({
    data,
    originalDoc,
    req,
    collection,
    context: {},
    operation: 'update',
  } as never)

  return { result, find }
}

describe('isHomepage uniqueness hook', () => {
  it('lets a draft save through on a drafts-enabled collection', async () => {
    const data = { isHomepage: true, _status: 'draft' }
    const { result, find } = run(data, true)

    await expect(result).resolves.toBe(data)
    expect(find).not.toHaveBeenCalled()
  })

  it('blocks a second homepage when publishing', async () => {
    const { result } = run({ isHomepage: true, _status: 'published' }, true)

    await expect(result).rejects.toBeInstanceOf(HomepageConflictError)
  })

  it('checks on publish even when the latest draft is already marked homepage', async () => {
    // Payload's `originalDoc` is the latest *version*, which is the draft that
    // was saved with isHomepage: true. Trusting it as "already the homepage"
    // would publish a second live homepage without ever offering the swap.
    const { result } = run({ isHomepage: true, _status: 'published' }, true, {
      id: 'target',
      isHomepage: true,
      _status: 'draft',
    })

    await expect(result).rejects.toBeInstanceOf(HomepageConflictError)
  })

  it('passes when this page is already the only live homepage', async () => {
    const data = { isHomepage: true, _status: 'published' }
    const find = vi.fn(async (_args: Record<string, unknown>) => ({ docs: [] }))
    const req = { payload: { find }, context: {} } as unknown as PayloadRequest

    const result = await hook({
      data,
      originalDoc: { id: 'target', isHomepage: true },
      req,
      collection: { slug: 'pages', versions: { drafts: true } },
      context: {},
      operation: 'update',
    } as never)

    expect(result).toBe(data)
    // The lookup excludes this page, so it only ever finds *other* homepages.
    expect(find.mock.calls[0][0]).toMatchObject({
      where: { and: [{ isHomepage: { equals: true } }, { id: { not_equals: 'target' } }] },
    })
  })

  it('checks a live write with no _status on a drafts-enabled collection', async () => {
    // e.g. `payload.update({ data: { isHomepage: true } })` or a REST PATCH
    // without `?draft=true`: Payload writes the live document and keeps it
    // published, so skipping here would allow a second live homepage.
    const { result } = run({ isHomepage: true }, true)

    await expect(result).rejects.toBeInstanceOf(HomepageConflictError)
  })

  it('blocks a second homepage on a collection without drafts, whatever _status says', async () => {
    // Without drafts every save is live, so a stray `_status: 'draft'` must not
    // switch the check off.
    const { result } = run({ isHomepage: true, _status: 'draft' }, false)

    await expect(result).rejects.toBeInstanceOf(HomepageConflictError)
  })
})

describe('collectionHasDrafts', () => {
  it.each([
    [{ versions: { drafts: true } }, true],
    [{ versions: { drafts: { autosave: true } } }, true],
    [{ versions: { drafts: false } }, false],
    [{ versions: false }, false],
    [undefined, false],
  ])('%j → %s', (collection, expected) => {
    expect(collectionHasDrafts(collection as never)).toBe(expected)
  })
})
