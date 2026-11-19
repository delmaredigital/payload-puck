// @vitest-environment happy-dom

/**
 * Publish and Unpublish follow `canPublish` through the real editor:
 * PuckEditor → PuckEditorImpl → HeaderActions, rendered by Puck (#57).
 * Only the Next.js and Payload admin hooks are faked.
 */

import { act, createElement, lazy, Suspense, type ComponentType } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Config } from '@puckeditor/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/dynamic', () => ({
  default: (load: () => Promise<ComponentType<any>>) => {
    const Lazy = lazy(() => load().then((component) => ({ default: component })))
    return (props: Record<string, unknown>) => createElement(Suspense, null, createElement(Lazy, props))
  },
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }) }))
vi.mock('@payloadcms/ui', () => ({ useLocale: () => ({ code: 'en' }) }))

const { PuckEditor } = await import('../../src/editor/PuckEditor.js')

const config: Config = { components: {} }
const initialData = { content: [], root: { props: {} } }

let root: Root
let container: HTMLDivElement

async function mount(props: { canPublish?: boolean; initialStatus?: 'draft' | 'published' }) {
  await act(async () => {
    root.render(createElement(PuckEditor, {
      pageId: '1', pageTitle: 'Home', pageSlug: 'home', initialData, config, ...props,
    }))
  })
  // Wait for the lazily loaded editor to render its header
  await vi.waitFor(() => expect(buttonLabels()).toContain('Save'))
}

function buttonLabels() {
  return [...container.querySelectorAll('button')].map((button) => button.textContent?.trim())
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Publish and Unpublish buttons', () => {
  it('shows both by default on a published page', async () => {
    await mount({ initialStatus: 'published' })
    expect(buttonLabels()).toEqual(expect.arrayContaining(['Save', 'Publish', 'Unpublish']))
  })

  it('hides both for a user who may not publish, keeping Save', async () => {
    await mount({ canPublish: false, initialStatus: 'published' })
    const labels = buttonLabels()
    expect(labels).toContain('Save')
    expect(labels).not.toContain('Publish')
    expect(labels).not.toContain('Unpublish')
  })
})
