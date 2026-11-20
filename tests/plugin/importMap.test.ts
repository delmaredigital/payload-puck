import { describe, expect, it } from 'vitest'
import { createPuckPlugin } from '../../src/plugin/index.js'

/**
 * Payload renders admin components through an import map that only a dev run
 * (or `payload generate:importmap`) regenerates. A component path missing from
 * a host's map renders nothing, and a missing admin *provider* blanks every
 * admin page. So the plugin may only register paths that 0.12.0 already
 * registered (checked against the v0.12.0 tag), and never an admin provider.
 */
const PATHS_IN_0_12_0 = [
  '@delmaredigital/payload-puck/admin/client#EditWithPuckButton',
  '@delmaredigital/payload-puck/admin/client#EditWithPuckCell',
  '@delmaredigital/payload-puck/rsc#PuckEditorView',
]

/**
 * Every component reference in the config, in each form Payload accepts:
 * `'path#Export'`, `'path'` (default export) and `{ path, exportName }`. A
 * reference is anything pointing into this package.
 */
function componentPaths(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string') {
    if (value.startsWith('@delmaredigital/payload-puck')) found.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => componentPaths(item, found))
  } else if (value && typeof value === 'object') {
    const ref = value as { path?: unknown; exportName?: unknown }
    if (typeof ref.path === 'string' && ref.path.startsWith('@delmaredigital/payload-puck')) {
      found.push(typeof ref.exportName === 'string' ? `${ref.path.split('#')[0]}#${ref.exportName}` : ref.path)
      return found
    }
    Object.values(value).forEach((item) => componentPaths(item, found))
  }
  return found
}

const base = { collections: [], custom: {} } as never

describe('componentPaths', () => {
  it('finds each form of component reference', () => {
    expect(componentPaths({
      a: '@delmaredigital/payload-puck/x#A',
      b: ['@delmaredigital/payload-puck/y'],
      c: { deep: { path: '@delmaredigital/payload-puck/z', exportName: 'C' } },
      d: { path: '@delmaredigital/payload-puck/w#D' },
      other: '@app/thing#X',
    })).toEqual([
      '@delmaredigital/payload-puck/x#A',
      '@delmaredigital/payload-puck/y',
      '@delmaredigital/payload-puck/z#C',
      '@delmaredigital/payload-puck/w#D',
    ])
  })
})

describe("the plugin can't blank the admin with a 0.12.0-era import map", () => {
  it.each([
    ['defaults', {}],
    ['copy and paste off', { copyPaste: false }],
    ['a host scope', { copyPaste: { scope: 'tenant' } }],
    ['AI on', { ai: { enabled: true } }],
  ] as const)('registers only component paths 0.12.0 registered (%s)', async (_name, options) => {
    const config = await createPuckPlugin(options as never)(base)
    const paths = componentPaths(config)
    expect(paths.length).toBeGreaterThan(0)
    for (const path of paths) expect(PATHS_IN_0_12_0).toContain(path)
  })

  it('adds no admin provider', async () => {
    const config = (await createPuckPlugin()(base)) as { admin?: { components?: { providers?: unknown[] } } }
    expect(config.admin?.components?.providers ?? []).toEqual([])
  })
})

describe('copyPaste: false', () => {
  it('reaches the client config (for the Edit button and list) and the admin editor', async () => {
    const config = (await createPuckPlugin({ copyPaste: false })(base)) as any
    expect(config.admin.custom.puck.copyPaste).toBe(false)
    expect(config.custom.puck.copyPaste).toBe(false)
  })

  it("follows the host's own custom.puck.copyPaste when the option isn't set", async () => {
    const config = (await createPuckPlugin()({ collections: [], custom: { puck: { copyPaste: false } } } as never)) as any
    expect(config.admin.custom.puck.copyPaste).toBe(false)
    expect(config.custom.puck.copyPaste).toBe(false)
  })

  it('keeps the rest of admin.custom', async () => {
    const config = (await createPuckPlugin()({ collections: [], admin: { custom: { mine: 1, puck: { other: 2 } } } } as never)) as any
    expect(config.admin.custom).toStrictEqual({ mine: 1, puck: { other: 2 } })
    expect(config.admin.custom.puck).not.toHaveProperty('copyPaste')
  })
})
