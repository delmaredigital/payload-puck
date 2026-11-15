import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

// HeaderActions needs a live Puck context to render, so these check the wiring in source.
describe('canPublish reaches the header buttons', () => {
  it('gates both Publish and Unpublish on showPublish', () => {
    const header = read('src/editor/components/HeaderActions.tsx')
    expect(header).toContain('showPublish = true')
    expect(header).toMatch(/\{showPublish && onPublish && \(/)
    expect(header).toMatch(/\{showPublish && onUnpublish && documentStatus === 'published' && \(/)
  })

  it('passes canPublish from PuckEditor through the implementation to HeaderActions', () => {
    expect(read('src/editor/PuckEditor.tsx')).toContain('canPublish={canPublish}')
    const impl = read('src/editor/PuckEditorImpl.client.tsx')
    expect(impl).toContain('showPublish={canPublish}')
    expect(impl).toMatch(/canPublish = true/)
  })
})
