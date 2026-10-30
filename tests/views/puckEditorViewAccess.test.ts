/**
 * The admin editor view must read the page as the signed-in user.
 *
 * `PuckEditorView` reads the page's draft with the Local API, whose default is
 * `overrideAccess: true`. Without an explicit access posture, any admin user who
 * opened /admin/puck-editor/:collection/:id got the draft of a page the
 * collection's read access denies them.
 *
 * The fake Payload below behaves like the real one on the point that matters:
 * it skips access control unless the call opts in with `overrideAccess: false`,
 * and then evaluates the collection's read rule against the request's user.
 */

import { describe, expect, it, vi } from 'vitest'
import { Forbidden } from 'payload'

// The real editor is a client component tree; only the props it receives matter.
const PuckEditorStub = vi.fn(() => null)
vi.mock('../../src/editor/PuckEditor.js', () => ({ PuckEditor: PuckEditorStub }))

const { PuckEditorView } = await import('../../src/views/PuckEditorView.js')

const PAGE = { id: 'p1', title: 'Board minutes', slug: 'board', puckData: { content: [], root: { props: {} } } }

type User = { id: string; role: 'admin' | 'author' }

/** Collection read access: admins only. */
const canRead = (user: User | null | undefined) => user?.role === 'admin'

function renderView(user: User) {
  const findByID = vi.fn(async (args: Record<string, unknown>) => {
    if (args.overrideAccess !== false) return PAGE
    const req = args.req as { user?: User } | undefined
    const actingUser = (args.user as User | undefined) ?? req?.user
    if (!canRead(actingUser)) throw new Forbidden()
    return PAGE
  })

  const payload = {
    config: { routes: { admin: '/admin' }, custom: { puck: {} } },
    collections: { pages: { config: { fields: [] } } },
    findByID,
    find: vi.fn(async () => ({ docs: [] })),
  }
  const req = { payload, user, locale: undefined }

  const element = PuckEditorView({
    initPageResult: { req } as never,
    params: Promise.resolve({ segments: ['puck-editor', 'pages', 'p1'] }),
    searchParams: Promise.resolve({}),
  } as never)

  return { element, findByID }
}

describe('PuckEditorView — page read access', () => {
  it('denies a user without read access on the collection', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { element, findByID } = renderView({ id: 'u2', role: 'author' })
    const rendered = (await element) as { type: unknown; props: Record<string, unknown> }

    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false }))
    expect(rendered.type).not.toBe(PuckEditorStub)
    expect(rendered.props.isError).toBe(true)
    expect(JSON.stringify(rendered.props)).not.toContain('Board minutes')
  })

  it('loads the editor for a user with read access', async () => {
    const { element } = renderView({ id: 'u1', role: 'admin' })
    const rendered = (await element) as { type: unknown; props: Record<string, unknown> }

    expect(rendered.type).toBe(PuckEditorStub)
    expect(rendered.props.pageTitle).toBe('Board minutes')
  })
})
