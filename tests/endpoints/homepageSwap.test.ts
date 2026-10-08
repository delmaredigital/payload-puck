/**
 * Regression tests for GHSA-cphw-vvv5-c8p7.
 *
 * The homepage-swap path of `PATCH /api/puck/:collection/:id` unset the current
 * homepage — a privileged `overrideAccess: true` write outside any transaction —
 * *before* the target page's own update was checked against collection access.
 * A user who could not edit the target page could therefore still clear the
 * site's homepage: the main update was rejected, but the unset had already
 * committed.
 */

import { describe, expect, it, vi } from 'vitest'
import { APIError } from 'payload'
import type { PayloadRequest } from 'payload'

import { createUpdateHandler } from '../../src/endpoints/index.js'

type RecordedCall = { op: string; args: Record<string, unknown> }

function fakeRequest(
  body: Record<string, unknown>,
  opts: { rejectTargetUpdate?: boolean; failUnset?: boolean } = {}
) {
  const calls: RecordedCall[] = []
  const tx = { begun: 0, committed: 0, rolledBack: 0 }

  const req = {
    user: { id: 'u1', collection: 'users' },
    routeParams: { collection: 'pages', id: 'target' },
    json: async () => body,
    payload: {
      find: vi.fn(async (args: Record<string, unknown>) => {
        calls.push({ op: 'find', args })
        return { docs: [{ id: 'old-home' }], totalDocs: 1 }
      }),
      update: vi.fn(async (args: Record<string, unknown>) => {
        calls.push({ op: 'update', args })
        if (args.id === 'target' && opts.rejectTargetUpdate) {
          throw new APIError('You are not allowed to perform this action.', 403)
        }
        if (args.id === 'old-home' && opts.failUnset) {
          throw new Error('db write failed')
        }
        return { id: args.id }
      }),
      db: {
        beginTransaction: async () => {
          tx.begun++
          return 'tx1'
        },
        commitTransaction: async () => {
          tx.committed++
        },
        rollbackTransaction: async () => {
          tx.rolledBack++
        },
      },
    },
  } as unknown as PayloadRequest

  return { req, calls, tx }
}

const handler = createUpdateHandler({ collections: ['pages'] })
const swapBody = { swapHomepage: true, isHomepage: true, title: 'New home' }

describe('homepage swap on the Puck update endpoint', () => {
  it('makes no privileged write when the target update is rejected', async () => {
    const { req, calls, tx } = fakeRequest(swapBody, { rejectTargetUpdate: true })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await handler(req)

    expect(res.status).toBe(403)
    // The only write attempted is the caller's own, access-checked one.
    expect(calls).toHaveLength(1)
    expect(calls[0].args).toMatchObject({ id: 'target', overrideAccess: false })
    expect(calls[0].args.req).toBe(req)
    expect(calls.some((c) => c.args.overrideAccess === true)).toBe(false)
    expect(tx.rolledBack).toBe(1)
    expect(tx.committed).toBe(0)
  })

  it('updates the target first, then unsets the old homepage in the same transaction', async () => {
    const { req, calls, tx } = fakeRequest(swapBody)

    const res = await handler(req)

    expect(res.status).toBe(200)
    expect(calls.map((c) => `${c.op}:${c.args.id ?? ''}`)).toEqual([
      'update:target',
      'find:',
      'update:old-home',
    ])

    const [target, lookup, unset] = calls
    expect(target.args).toMatchObject({ overrideAccess: false })
    expect(target.args.context).toMatchObject({ skipIsHomepageHook: true })
    // Privileged invariant maintenance, but only after authorization succeeded,
    // and threaded through `req` so it shares the caller's transaction.
    expect(lookup.args).toMatchObject({ overrideAccess: true, pagination: false })
    expect(lookup.args.req).toBe(req)
    expect(unset.args).toMatchObject({ overrideAccess: true, data: { isHomepage: false } })
    expect(unset.args.req).toBe(req)

    expect(tx).toEqual({ begun: 1, committed: 1, rolledBack: 0 })
  })

  it('rolls back the target update when unsetting the old homepage fails', async () => {
    const { req, tx } = fakeRequest(swapBody, { failUnset: true })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await handler(req)

    expect(res.status).toBe(500)
    expect(tx).toEqual({ begun: 1, committed: 0, rolledBack: 1 })
  })

  it('does not skip the uniqueness hook when the swap flag arrives without isHomepage', async () => {
    const { req, calls, tx } = fakeRequest({ swapHomepage: true, title: 'Not a homepage' })

    await handler(req)

    expect(calls).toHaveLength(1)
    expect(calls[0].args.context).not.toHaveProperty('skipIsHomepageHook')
    expect(tx.begun).toBe(0)
  })
})
