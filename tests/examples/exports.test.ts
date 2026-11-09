import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../../', import.meta.url))
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  name: string
  exports: Record<string, { import: string }>
}
const config = JSON.parse(readFileSync(resolve(root, 'tsconfig.examples.json'), 'utf8')) as {
  compilerOptions: { paths: Record<string, string[]> }
}

describe('example package resolution', () => {
  it('maps exactly the public exports to their real source entry points', () => {
    const expected = Object.fromEntries(Object.entries(manifest.exports).map(([subpath, entry]) => {
      const source = entry.import.replace('./dist/', './src/').replace(/\.js$/, '')
      const target = `${source}${existsSync(resolve(root, `${source}.tsx`)) ? '.tsx' : '.ts'}`
      expect(existsSync(resolve(root, target)), subpath).toBe(true)
      return [`${manifest.name}${subpath === '.' ? '' : subpath.slice(1)}`, [target]]
    }))
    const actual = Object.fromEntries(Object.entries(config.compilerOptions.paths)
      .filter(([specifier]) => specifier.startsWith(manifest.name)))

    // A wildcard would let examples depend on private source files that consumers
    // cannot import from the published package.
    expect(actual).toEqual(expected)
  })
})
