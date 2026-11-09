import { describe, expect, it, vi } from 'vitest'
import type { Config } from 'payload'
import { createPuckPlugin } from '../../src/plugin/index.js'
import type { ThemeConfig } from '../../src/theme/types.js'

const PuckEditorStub = vi.hoisted(() => vi.fn(() => null))
vi.mock('../../src/editor/PuckEditor.js', () => ({ PuckEditor: PuckEditorStub }))

const { PuckEditorView } = await import('../../src/views/PuckEditorView.js')

const theme: ThemeConfig = {
  buttonVariants: { default: { classes: 'bg-brand text-white' } },
  colorPresets: [{ hex: '#123456', label: 'Brand' }],
  focusRingColor: 'focus:ring-brand',
}

async function renderEditor(config: Config) {
  const payload = {
    config,
    collections: { pages: { config: { fields: [] } } },
    findByID: vi.fn(async () => ({ id: 'p1', title: 'Home', slug: 'home' })),
  }
  return PuckEditorView({
    initPageResult: { req: { payload, user: { id: 'u1' } } },
    params: Promise.resolve({ segments: ['puck-editor', 'pages', 'p1'] }),
    searchParams: Promise.resolve({}),
  } as never)
}

describe('plugin theme reaches the admin editor', () => {
  it('passes the complete theme through the server view to PuckEditor', async () => {
    const config = await createPuckPlugin({ theme })({ collections: [] } as never)
    const editor = await renderEditor(config)

    expect(editor.type).toBe(PuckEditorStub)
    expect(editor.props.theme).toEqual(theme)
  })

  it('preserves a prior plugin theme when a later instance omits it', async () => {
    const first = await createPuckPlugin({ theme })({ collections: [] } as never)
    const second = await createPuckPlugin({ pagesCollection: 'articles' })(first)

    expect((await renderEditor(second)).props.theme).toEqual(theme)
  })

  it('uses the last configured theme, including an empty theme to restore defaults', async () => {
    const first = await createPuckPlugin({ theme })({ collections: [] } as never)
    const second = await createPuckPlugin({ theme: {} })(first)

    expect((await renderEditor(second)).props.theme).toEqual({})
  })

  it('leaves theme undefined when omitted so the editor can use its provider', async () => {
    const config = await createPuckPlugin()({ collections: [] } as never)

    expect((await renderEditor(config)).props.theme).toBeUndefined()
  })
})
