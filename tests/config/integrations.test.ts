import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import type { ComponentConfig, Config } from '@puckeditor/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyIntegrations, mergeConfigs, resetIntegrationWarningsForTests, type PuckIntegration } from '../../src/config/merge.js'
import { baseConfig, extendConfig, applyIntegrations as renderApply } from '../../src/config/index.js'
import { editorConfig, applyIntegrations as editorApply } from '../../src/config/config.editor.js'
import { fullConfig, minimalConfig } from '../../src/config/presets.js'

const host: ComponentConfig<any> = { render: () => createElement('div') }
const dummy: ComponentConfig<any> = { render: () => createElement('div') }
const integration: PuckIntegration = {
  name: 'dummy',
  components: { DummyBlock: dummy },
  categories: { custom: { title: 'Dummy', components: ['DummyBlock'] } },
}

beforeEach(() => {
  resetIntegrationWarningsForTests()
  vi.stubEnv('NODE_ENV', 'development')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('integration config helpers', () => {
  it.each([
    ['baseConfig', baseConfig], ['editorConfig', editorConfig],
    ['fullConfig', fullConfig], ['minimalConfig', minimalConfig],
  ] as const)('preserves %s without integrations', (_name, base) => {
    const today = { ...base, components: { ...base.components }, categories: { ...base.categories } }
    expect(mergeConfigs({ base })).toEqual(today)
    expect(mergeConfigs({ base, integrations: [] })).toEqual(today)
    expect(mergeConfigs({ base, integrations: undefined })).toEqual(today)
    expect(applyIntegrations(base)).toBe(base)
    expect(applyIntegrations(base, [])).toBe(base)
  })

  it('exports the helper and supports extendConfig', () => {
    expect(renderApply).toBe(applyIntegrations)
    expect(editorApply).toBe(applyIntegrations)
    expect(extendConfig({ base: { components: {} }, integrations: [integration] }).components.DummyBlock).toBe(dummy)
  })

  it('fills missing keys without mutating inputs or consuming editor plugins', () => {
    const base = Object.freeze({ components: Object.freeze({ Host: host }) })
    const integrations = Object.freeze([Object.freeze({ ...integration, plugins: Object.freeze([{}]) })])
    const result = mergeConfigs({ base, integrations })
    expect(result.components).toEqual({ Host: host, DummyBlock: dummy })
    expect(base.components).toEqual({ Host: host })
    expect(integration.categories?.custom?.components).toEqual(['DummyBlock'])
    expect(result).not.toHaveProperty('plugins')
  })

  it.each(['base', 'components'] as const)('preserves a host %s key and warns', (source) => {
    const result = mergeConfigs({
      base: { components: source === 'base' ? { DummyBlock: host } : {} },
      components: source === 'components' ? { DummyBlock: host } : {},
      integrations: [integration],
    })
    expect(result.components.DummyBlock).toBe(host)
    expect(result.categories?.custom?.components).toEqual(['DummyBlock'])
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      '[payload-puck] integration "dummy": component "DummyBlock" already defined by the host; skipped',
    )
  })

  it('silently skips the same component value, including repeated wiring', () => {
    const result = mergeConfigs({ base: { components: { DummyBlock: dummy } }, integrations: [integration] })
    expect(applyIntegrations(result, [integration]).components.DummyBlock).toBe(dummy)
    expect(applyIntegrations(result, [integration]).categories?.custom?.components).toEqual(['DummyBlock'])
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('lets the first integration win', () => {
    const result = applyIntegrations({ components: {} }, [integration, {
      name: 'second', components: { DummyBlock: host },
    }])
    expect(result.components.DummyBlock).toBe(dummy)
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      '[payload-puck] integration "second": component "DummyBlock" already defined by integration "dummy"; skipped',
    )
  })

  it('warns once per collision message across repeated merges', () => {
    for (let i = 0; i < 2; i++) {
      applyIntegrations({ components: { DummyBlock: host } }, [integration])
      applyIntegrations({ components: {} }, [integration, {
        name: 'second', components: { DummyBlock: host },
      }])
    }
    expect(console.warn).toHaveBeenCalledTimes(2)
    expect(console.warn).toHaveBeenCalledWith(
      '[payload-puck] integration "dummy": component "DummyBlock" already defined by the host; skipped',
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[payload-puck] integration "second": component "DummyBlock" already defined by integration "dummy"; skipped',
    )
  })

  it('excludes integration keys and their category names', () => {
    const result = mergeConfigs({
      base: { components: { DummyBlock: host } },
      exclude: ['DummyBlock'], integrations: [integration],
    })
    expect(result.components).not.toHaveProperty('DummyBlock')
    expect(result.categories).not.toHaveProperty('custom')
    const applied = applyIntegrations({ components: {} }, [integration], ['DummyBlock'])
    expect(applied.components).toEqual({})
    expect(applied.categories).not.toHaveProperty('custom')
    const hostCategory = { title: 'Host', components: [] }
    expect(applyIntegrations({
      components: {}, categories: { custom: hostCategory },
    }, [integration], ['DummyBlock']).categories?.custom).toEqual(hostCategory)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('adds categories and appends only unique contributed names while keeping host fields', () => {
    const untouched = { title: 'Untouched', components: ['Host', 'Host'] }
    const base: Config = {
      components: { Host: host },
      categories: {
        shared: { title: 'Base', components: ['Host', 'Host'], defaultExpanded: false },
        untouched,
      },
    }
    const result = mergeConfigs({
      base,
      categories: { shared: { title: 'Host title', components: ['Host'] } },
      integrations: [{
        ...integration,
        categories: {
          custom: { title: 'New', components: ['DummyBlock', 'DummyBlock'] },
          shared: { title: 'Ignored', defaultExpanded: true, components: ['Host', 'DummyBlock', 'DummyBlock'] },
        },
      }, { name: 'second', categories: { shared: { components: ['DummyBlock', 'Other', 'Other'] } } }],
    })
    expect(result.categories?.custom).toEqual({ title: 'New', components: ['DummyBlock'] })
    expect(result.categories?.shared).toEqual({
      title: 'Host title', defaultExpanded: false, components: ['Host', 'Host', 'Host', 'DummyBlock', 'Other'],
    })
    expect(result.categories?.untouched).toEqual(untouched)
    expect(base.categories?.shared?.components).toEqual(['Host', 'Host'])
  })

  it('keeps untouched host lists unchanged', () => {
    const base: Config = { components: { Host: host }, categories: { shared: { components: ['Host', 'Host'] } } }
    const options = { base, categories: { shared: { components: ['Host'] } } }
    const today = mergeConfigs(options)
    expect(today.categories?.shared?.components).toEqual(['Host', 'Host', 'Host'])
    expect(mergeConfigs({ ...options, integrations: [] })).toEqual(today)
    expect(mergeConfigs({ ...options, integrations: [integration] }).categories?.shared).toEqual(today.categories?.shared)
  })

  it('does not warn in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(applyIntegrations({ components: { DummyBlock: host } }, [integration]).components.DummyBlock).toBe(host)
    expect(console.warn).not.toHaveBeenCalled()
  })
})

it('keeps source and tests generic with no allow-list', () => {
  const self = fileURLToPath(import.meta.url)
  const root = fileURLToPath(new URL('../../', import.meta.url))
  function files(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? files(path) : [path]
    })
  }
  const matches = ['src', 'tests'].flatMap((dir) => files(join(root, dir)))
    .filter((path) => path !== self && /\bexperiments?\b|payload-experiments/i.test(readFileSync(path, 'utf8')))
  expect(matches).toEqual([])
})
