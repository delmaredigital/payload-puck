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
  isDraftOnlySave,
} from '../../src/plugin/hooks/isHomepageUnique.js'

const hook = createIsHomepageUniqueHook()

function run(data: Record<string, unknown>, drafts: boolean) {
  const find = vi.fn(async () => ({
    docs: [{ id: 'old-home', title: 'Home', slug: 'home' }],
  }))
  const req = { payload: { find }, context: {} } as unknown as PayloadRequest
  const collection = { slug: 'pages', versions: drafts ? { drafts: true } : false }

  const result = hook({
    data,
    originalDoc: { id: 'target', isHomepage: false },
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

  it('blocks a second homepage on a collection without drafts, whatever _status says', async () => {
    // Without drafts every save is live, so a stray `_status: 'draft'` must not
    // switch the check off.
    const { result } = run({ isHomepage: true, _status: 'draft' }, false)

    await expect(result).rejects.toBeInstanceOf(HomepageConflictError)
  })
})

describe('isDraftOnlySave', () => {
  it.each([
    [{ versions: { drafts: true } }, 'draft', true],
    [{ versions: { drafts: true } }, undefined, true],
    [{ versions: { drafts: true } }, 'published', false],
    [{ versions: { drafts: false } }, 'draft', false],
    [{ versions: false }, 'draft', false],
    [undefined, 'draft', false],
  ])('%j with status %s → %s', (collection, status, expected) => {
    expect(isDraftOnlySave(collection as never, status)).toBe(expected)
  })
})
