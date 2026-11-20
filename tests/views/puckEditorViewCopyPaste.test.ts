import { describe, expect, it, vi } from 'vitest'

// The real editor is a client component tree; only the props it receives matter.
const PuckEditorStub = vi.fn(() => null)
vi.mock('../../src/editor/PuckEditor.js', () => ({ PuckEditor: PuckEditorStub }))

const { PuckEditorView } = await import('../../src/views/PuckEditorView.js')

async function editorProps(copyPaste: unknown) {
  const payload = {
    config: { routes: { admin: '/admin' }, custom: { puck: copyPaste === undefined ? {} : { copyPaste } } },
    collections: { pages: { config: { slug: 'pages', fields: [], access: {} } } },
    findByID: vi.fn(async () => ({ id: 'p1', title: 'Home', slug: 'home' })),
    find: vi.fn(async () => ({ docs: [] })),
  }
  const rendered = (await PuckEditorView({
    initPageResult: { req: { payload, user: { id: 'u1' } } } as never,
    params: Promise.resolve({ segments: ['puck-editor', 'pages', 'p1'] }),
    searchParams: Promise.resolve({}),
  } as never)) as { props: { copyPaste?: unknown } }
  return rendered.props
}

describe("the plugin's copyPaste reaches the admin editor", () => {
  it.each([
    ['unset', undefined, true],
    ['off', false, false],
    ['scoped', { scope: 'tenant-a' }, { scope: 'tenant-a' }],
  ])('%s', async (_name, option, expected) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await editorProps(option)).copyPaste).toEqual(expected)
  })
})
