// @vitest-environment happy-dom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ComponentConfig, Config, Data, Plugin } from '@puckeditor/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PuckEditor, type PuckEditorProps } from '../../src/editor/PuckEditor.js'
import { PuckConfigProvider, usePuckConfig, type PuckConfigContextValue } from '../../src/views/PuckConfigContext.js'
import type { PuckIntegration } from '../../src/config/merge.js'

const capture = vi.hoisted(() => ({ props: null as PuckEditorProps | null }))
vi.mock('next/dynamic', () => ({
  default: () => (props: PuckEditorProps) => { capture.props = props; return null },
}))

const dummy: ComponentConfig<any> = { render: () => createElement('div') }
const config: Config = { components: {} }
const initialData = { content: [], root: { props: {} } }
const props: PuckEditorProps = { pageId: '1', pageTitle: 'Dummy', pageSlug: 'dummy', initialData, config }
let root: Root
let container: HTMLDivElement
let context: PuckConfigContextValue

function ContextReader() { context = usePuckConfig(); return null }
function render(
  editor: Partial<PuckEditorProps> = {},
  integrations?: readonly PuckIntegration[],
  plugins?: Plugin[],
  providerConfig: Config = config,
) {
  act(() => {
    root.render(createElement(PuckConfigProvider, {
      config: providerConfig, integrations, plugins,
      children: [createElement(ContextReader, { key: 'context' }), createElement(PuckEditor, { ...props, ...editor, key: 'editor' })],
    }))
  })
  return capture.props!
}

beforeEach(() => {
  capture.props = null
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('editor integrations', () => {
  it('passes provider integration components to the implementation with a context-only config', () => {
    expect(config.components).not.toHaveProperty('DummyBlock')
    const result = render({ config: undefined }, [{
      name: 'dummy', components: { DummyBlock: dummy },
    }])

    expect(context.config).toBe(config)
    expect(result.config?.components.DummyBlock).toBe(dummy)
    expect(config.components).not.toHaveProperty('DummyBlock')
  })

  it.each(['slot', 'zone'] as const)('resolves template content in a %s against the page editor config', (location) => {
    const template: ComponentConfig<any> = {
      fields: { content: { type: 'slot' } },
      render: () => createElement('div'),
    }
    const hostConfig: Config = { components: { Template: template } }
    const nested = { type: 'DummyBlock', props: { id: 'dummy-1' } }
    const data: Data = {
      root: { props: {} },
      content: [{ type: 'Template', props: {
        id: 'template-1', content: location === 'slot' ? [nested] : [],
      } }],
      ...(location === 'zone' ? { zones: { 'template-1:content': [nested] } } : {}),
    }
    const result = render({ config: undefined, initialData: data }, [{
      name: 'dummy', components: { DummyBlock: dummy },
    }], undefined, hostConfig)

    expect(result.initialData).toBe(data)
    expect(context.config).toBe(hostConfig)
    expect(hostConfig.components).not.toHaveProperty('DummyBlock')
    const parent = result.initialData.content[0]
    const children = location === 'slot'
      ? parent.props.content
      : result.initialData.zones!['template-1:content']
    expect(result.config?.components[parent.type]).toBe(template)
    expect(children).toEqual([nested])
    for (const child of children) {
      expect(result.config?.components[child.type]).toBe(dummy)
    }
  })

  it('keeps prop, context, then integration plugin order and copies readonly inputs', () => {
    const prop: Plugin = { name: 'prop' }
    const fromContext: Plugin = { name: 'context' }
    const fromBundle: Plugin = { name: 'bundle' }
    const fromPropBundle: Plugin = { name: 'prop-bundle' }
    const bundlePlugins = Object.freeze([fromBundle])
    const result = render({ plugins: [prop], integrations: [{ name: 'prop-dummy', plugins: [fromPropBundle] }] }, [
      { name: 'dummy', plugins: bundlePlugins },
    ], [fromContext])
    expect(result.plugins).toEqual([prop, fromContext, fromBundle, fromPropBundle])
    expect(result.plugins).not.toBe(bundlePlugins)
    expect(bundlePlugins).toEqual([fromBundle])
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('dedupes named plugins, first wins, and warns', () => {
    const first: Plugin = { name: 'shared' }
    const result = render({ plugins: [first] }, [{
      name: 'dummy', plugins: [{ name: 'shared' }, { name: 'unique' }, { name: 'unique' }],
    }], [{ name: 'shared' }])
    expect(result.plugins).toEqual([first, { name: 'unique' }])
    expect(console.warn).toHaveBeenCalledTimes(3)
    expect(console.warn).toHaveBeenCalledWith('[payload-puck] integration "dummy": plugin "shared" duplicate; skipped')
    expect(console.warn).toHaveBeenCalledWith('[payload-puck] integration "dummy": plugin "unique" duplicate; skipped')
  })

  it('keeps both unnamed plugins', () => {
    const first: Plugin = {}
    const second: Plugin = {}
    const result = render({}, [{ name: 'dummy', plugins: [first, second] }])
    expect(result.plugins).toEqual([first, second])
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('disables every plugin with false but still applies components', () => {
    const result = render({ plugins: false }, [{
      name: 'dummy', components: { DummyBlock: dummy }, plugins: [{ name: 'bundle' }],
    }], [{ name: 'context' }])
    expect(result.plugins).toBe(false)
    expect(result.config?.components.DummyBlock).toBe(dummy)
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      '[payload-puck] integration "dummy": plugins disabled by plugins={false}; skipped',
    )
  })

  it('keeps no-integration behavior and does not warn for bundles without plugins', () => {
    expect(render().config).toBe(config)
    expect(render().plugins).toBeUndefined()
    expect(render({ plugins: false }, [{ name: 'dummy', components: { DummyBlock: dummy } }]).plugins).toBe(false)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('silences plugin warnings in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const integrations = [{ name: 'dummy', plugins: [{ name: 'same' }, { name: 'same' }] }]
    expect(render({}, integrations).plugins).toHaveLength(1)
    expect(render({ plugins: false }, integrations).plugins).toBe(false)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('keeps config, plugin array and provider context identity stable across re-renders', () => {
    const integrations: readonly PuckIntegration[] = Object.freeze([{
      name: 'dummy', components: { DummyBlock: dummy }, plugins: Object.freeze([{ name: 'bundle' }]),
    }])
    const editor = { integrations: Object.freeze([{ name: 'prop-dummy', plugins: [{ name: 'prop-bundle' }] }]) }
    const first = render(editor, integrations)
    const firstContext = context
    const second = render(editor, integrations)
    expect(second.config).toBe(first.config)
    expect(second.plugins).toBe(first.plugins)
    expect(context).toBe(firstContext)
    expect(context.integrations).toBe(integrations)
  })

  it('updates config, plugins and provider context when integrations change', () => {
    render({}, [{ name: 'first' }])
    const firstContext = context
    const firstConfig = capture.props!.config
    const next: readonly PuckIntegration[] = [{ name: 'second', components: { DummyBlock: dummy }, plugins: [{ name: 'next' }] }]
    const result = render({}, next)
    expect(context).not.toBe(firstContext)
    expect(context.integrations).toBe(next)
    expect(result.config).not.toBe(firstConfig)
    expect(result.config?.components.DummyBlock).toBe(dummy)
    expect(result.plugins).toEqual([{ name: 'next' }])
  })

  it('applies context components first, then prop components, after the host config', () => {
    const other: ComponentConfig<any> = { render: () => createElement('div') }
    const result = render({ integrations: [{ name: 'prop', components: { DummyBlock: other } }] }, [
      { name: 'context', components: { DummyBlock: dummy } },
    ])
    expect(result.config?.components.DummyBlock).toBe(dummy)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('applies integration components before AI configuration', () => {
    const result = render({
      enableAi: true,
      aiComponentInstructions: { DummyBlock: { ai: { instructions: 'Dummy instructions' } } },
    }, [{ name: 'dummy', components: { DummyBlock: dummy } }])
    expect(result.config?.components.DummyBlock).toMatchObject({ ai: { instructions: 'Dummy instructions' } })
  })
})

it('keeps integration arrays inside the editor memos with raw input dependencies', () => {
  const source = readFileSync(resolve('src/editor/PuckEditor.tsx'), 'utf8')
  for (const name of ['mergedPlugins', 'finalConfig']) {
    const memo = source.match(new RegExp(`const ${name} = useMemo\\(\\(\\) => \\{([\\s\\S]*?)\\n  \\}, \\[([^\\]]*)\\]\\)`))
    expect(memo, name).not.toBeNull()
    expect(memo![1]).toContain('...(integrationsFromContext || [])')
    expect(memo![1]).toContain('...(integrations || [])')
    expect(memo![2].split(',').map((part) => part.trim())).toEqual(expect.arrayContaining(['integrations', 'integrationsFromContext']))
  }
})

it('places merged plugins between heading analyzer and version history / AI in the implementation', () => {
  const source = readFileSync(resolve('src/editor/PuckEditorImpl.client.tsx'), 'utf8')
  expect(source).toContain('const defaultPlugins: PuckPlugin[] = [headingAnalyzer]')
  const memo = source.slice(source.indexOf('const resolvedPlugins = useMemo('), source.indexOf('const editorContent ='))
  expect(memo).toContain('if (plugins === false) return undefined')
  expect(memo).toContain('[...defaultPlugins, ...plugins]')
  expect(memo.indexOf('base.push(versionHistoryPlugin)')).toBeLessThan(memo.indexOf('base.push(aiPlugin)'))
})
