/**
 * The `blockVisibility` key on component configs is typed by a module
 * augmentation in `src/visibility/index.ts`. Hosts only get it if the
 * published declarations they import load that file.
 *
 * This emits the package's declarations in memory (as `pnpm build:types`
 * does) and compiles small host files against them, importing only one entry
 * point each, so it checks what consumers actually receive rather than the
 * source.
 */

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { beforeAll, describe, expect, it } from 'vitest'

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const dist = join(root, '__emitted_dist__')

// Every public entry point, mapped to its emitted declaration file
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  name: string
  exports: Record<string, { types: string }>
}
const entryPaths = Object.fromEntries(
  Object.entries(manifest.exports).map(([subpath, entry]) => [
    `${manifest.name}${subpath === '.' ? '' : subpath.slice(1)}`,
    [join(dist, entry.types.replace('./dist/', ''))],
  ]),
)
const declarations = new Map<string, string>()

beforeAll(() => {
  const parsed = ts.getParsedCommandLineOfConfigFile(join(root, 'tsconfig.json'), {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    },
  })!
  const program = ts.createProgram(parsed.fileNames, {
    ...parsed.options,
    outDir: dist,
    declaration: true,
    emitDeclarationOnly: true,
    noEmit: false,
  })
  const result = program.emit(undefined, (fileName, text) => {
    if (fileName.endsWith('.d.ts')) declarations.set(resolve(fileName), text)
  })
  expect(result.emitSkipped).toBe(false)
}, 120_000)

/** Type errors from compiling `source` as a host file against the emitted declarations. */
function compile(source: string): string[] {
  const fixture = join(root, '__host_fixture__.ts')
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.Preserve,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    paths: entryPaths,
  }
  const host = ts.createCompilerHost(options)
  const read = (name: string) => (resolve(name) === fixture ? source : declarations.get(resolve(name)))
  const { fileExists, readFile, getSourceFile, directoryExists } = host
  host.fileExists = (name) => read(name) !== undefined || fileExists.call(host, name)
  host.readFile = (name) => read(name) ?? readFile.call(host, name)
  host.directoryExists = (name) =>
    resolve(name).startsWith(dist) || (directoryExists ? directoryExists.call(host, name) : true)
  host.getSourceFile = (name, version, ...rest) => {
    const text = read(name)
    return text !== undefined
      ? ts.createSourceFile(name, text, version)
      : getSourceFile.call(host, name, version, ...rest)
  }
  const program = ts.createProgram([fixture], options, host)
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file && resolve(diagnostic.file.fileName) === fixture)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
}

const hostBlock = (entry: string) => `
import type { ComponentConfig } from '@puckeditor/core'
import { withBlockVisibility } from '@delmaredigital/payload-puck/${entry}'

export const Row: ComponentConfig<{ text: string }> = {
  blockVisibility: { screenSizes: false },
  fields: { text: { type: 'text' } },
  render: ({ text }) => text as any,
}

export const config = withBlockVisibility({ components: { Row } })
`

describe('published types for blockVisibility', () => {
  it('emits declarations that load the augmentation', () => {
    const emitted = declarations.get(join(dist, 'visibility/withBlockVisibility.d.ts'))
    expect(emitted).toContain("from './index.js'")
  })

  it('types blockVisibility for a host that imports only /render', () => {
    expect(compile(hostBlock('render'))).toEqual([])
  })

  it('types blockVisibility for a host that imports only /email', () => {
    expect(compile(hostBlock('email'))).toEqual([])
  })

  it('rejects the key when nothing loads the augmentation (the check is real)', () => {
    const errors = compile(`
import type { ComponentConfig } from '@puckeditor/core'
export const Row: ComponentConfig<{ text: string }> = {
  blockVisibility: { screenSizes: false },
  render: ({ text }) => text as any,
}
`)
    expect(errors.join('\n')).toContain('blockVisibility')
  })

  it('keeps hasBlockVisibility out of every package entry point', () => {
    const specifiers = Object.keys(entryPaths)
    const errors = compile(specifiers
      .map((specifier, i) => `import { hasBlockVisibility as h${i} } from '${specifier}'\nvoid h${i}\n`)
      .join(''))
    // One "no exported member" error per entry, and nothing else
    expect(errors).toHaveLength(specifiers.length)
    for (const error of errors) expect(error).toMatch(/has no exported member.*'hasBlockVisibility'|declares 'hasBlockVisibility' locally/)
  }, 60_000)

  it('rejects a wrong value type once loaded', () => {
    const errors = compile(hostBlock('render').replace('screenSizes: false', "screenSizes: 'no'"))
    expect(errors.length).toBeGreaterThan(0)
  })
})

