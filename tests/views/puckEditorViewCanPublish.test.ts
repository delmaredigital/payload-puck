import { describe, expect, it, vi } from 'vitest'
import type { Config } from 'payload'
import { createPuckPlugin } from '../../src/plugin/index.js'

const PuckEditorStub = vi.hoisted(() => vi.fn(() => null))
vi.mock('../../src/editor/PuckEditor.js', () => ({ PuckEditor: PuckEditorStub }))

const { PuckEditorView } = await import('../../src/views/PuckEditorView.js')

async function renderEditor(config: Config, user: unknown = { id: 'u1', role: 'editor' }) {
  const payload = {
    config,
    collections: { pages: { config: { fields: [] } } },
    findByID: vi.fn(async () => ({ id: 'p1', title: 'Home', slug: 'home' })),
  }
  return PuckEditorView({
    initPageResult: { req: { payload, user } },
    params: Promise.resolve({ segments: ['puck-editor', 'pages', 'p1'] }),
    searchParams: Promise.resolve({}),
  } as never)
}

const base = { collections: [] } as never

describe('canPublish plugin option', () => {
  it('allows publishing when the option is omitted', async () => {
    const config = await createPuckPlugin()(base)
    expect((await renderEditor(config)).props.canPublish).toBe(true)
  })

  it('passes the user, collection and id to the function and uses its answer', async () => {
    const canPublish = vi.fn(({ user }: { user: { role?: string } }) => user.role === 'publisher')
    const config = await createPuckPlugin({ canPublish: canPublish as never })(base)

    expect((await renderEditor(config, { id: 'u1', role: 'editor' })).props.canPublish).toBe(false)
    expect((await renderEditor(config, { id: 'u2', role: 'publisher' })).props.canPublish).toBe(true)
    expect(canPublish).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'pages', id: 'p1', user: { id: 'u1', role: 'editor' } }),
    )
  })

  it('supports async functions', async () => {
    const config = await createPuckPlugin({ canPublish: async () => false })(base)
    expect((await renderEditor(config)).props.canPublish).toBe(false)
  })

  it('hides the buttons if the function throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const config = await createPuckPlugin({
      canPublish: () => {
        throw new Error('boom')
      },
    })(base)
    expect((await renderEditor(config)).props.canPublish).toBe(false)
    spy.mockRestore()
  })

  it('keeps a prior plugin instance function when a later one omits it', async () => {
    const first = await createPuckPlugin({ canPublish: () => false })(base)
    const second = await createPuckPlugin({ pagesCollection: 'articles' })(first)
    expect((await renderEditor(second)).props.canPublish).toBe(false)
  })
})
