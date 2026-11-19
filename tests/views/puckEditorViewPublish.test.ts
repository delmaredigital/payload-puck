/**
 * The admin editor view offers Publish only to users the collection's update
 * access lets publish this page (#57). It uses Payload's own permission check
 * (`docAccessOperation`), not a stub, against the fake collection below, whose
 * rule is the usual one: anyone signed in may save drafts, only publishers may
 * publish.
 */

import { describe, expect, it, vi } from 'vitest'
import type { Access } from 'payload'

// The real editor is a client component tree; only the props it receives matter.
const PuckEditorStub = vi.fn(() => null)
vi.mock('../../src/editor/PuckEditor.js', () => ({ PuckEditor: PuckEditorStub }))

const { PuckEditorView } = await import('../../src/views/PuckEditorView.js')

const PAGE = { id: 'p1', title: 'Home', slug: 'home', _status: 'draft', puckData: { content: [], root: { props: {} } } }

type User = { id: string; role: 'editor' | 'publisher' }

const publishersOnly: Access = ({ req, data }) =>
  Boolean(req.user) && (data?._status !== 'published' || (req.user as unknown as User).role === 'publisher')

async function canPublishFor(user: User | null, update: Access = publishersOnly, collection = 'pages') {
  const updateAccess = vi.fn(update)
  const payload = {
    config: { routes: { admin: '/admin' }, custom: { puck: {} } },
    collections: {
      pages: {
        config: {
          slug: 'pages',
          fields: [],
          versions: { drafts: true },
          access: { read: () => true, create: () => true, delete: () => false, readVersions: () => true, update: updateAccess },
        },
      },
    },
    findByID: vi.fn(async () => PAGE),
    find: vi.fn(async () => ({ docs: [] })),
  }
  const rendered = (await PuckEditorView({
    initPageResult: { req: { payload, user, locale: undefined } } as never,
    params: Promise.resolve({ segments: ['puck-editor', collection, 'p1'] }),
    searchParams: Promise.resolve({}),
  } as never)) as { type: unknown; props: { canPublish?: boolean } }
  expect(rendered.type).toBe(PuckEditorStub)
  return { canPublish: rendered.props.canPublish, updateAccess }
}

describe('PuckEditorView — Publish follows publish access', () => {
  it('hides Publish from a user who may save drafts but not publish', async () => {
    expect((await canPublishFor({ id: 'u1', role: 'editor' })).canPublish).toBe(false)
  })

  it('shows Publish to a user who may publish', async () => {
    expect((await canPublishFor({ id: 'u2', role: 'publisher' })).canPublish).toBe(true)
  })

  it('asks update access about publishing this page', async () => {
    const { updateAccess } = await canPublishFor({ id: 'u2', role: 'publisher' })
    expect(updateAccess).toHaveBeenCalledWith(expect.objectContaining({
      id: 'p1',
      data: expect.objectContaining({ title: 'Home', _status: 'published' }),
    }))
  })

  it('hides Publish if the access check fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { canPublish } = await canPublishFor({ id: 'u2', role: 'publisher' }, () => {
      throw new Error('access rule failed')
    })
    expect(canPublish).toBe(false)
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('hides Publish when the collection is not registered', async () => {
    expect((await canPublishFor({ id: 'u2', role: 'publisher' }, publishersOnly, 'missing')).canPublish).toBe(false)
  })
})
