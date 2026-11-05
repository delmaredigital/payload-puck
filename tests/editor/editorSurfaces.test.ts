import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../../', import.meta.url))
const implementation = 'src/editor/PuckEditorImpl.client.tsx'
const guidance = 'Route editor config through applyIntegrations in PuckEditor before rendering <Puck>.'

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(path) : /\.[cm]?[jt]sx?$/.test(path) ? [path] : []
  })
}

const sources = sourceFiles(join(root, 'src')).map((path) => ({
  file: relative(root, path),
  ast: ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true),
}))

function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node)
  ts.forEachChild(node, (child) => walk(child, visit))
}

describe('editor surfaces resolve integrations', () => {
  it('permits direct <Puck> JSX only in the resolved implementation', () => {
    const surfaces: string[] = []
    for (const { file, ast } of sources) {
      walk(ast, (node) => {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
          && node.tagName.getText(ast) === 'Puck') surfaces.push(file)
      })
    }

    expect(surfaces).toContain(implementation)
    expect(surfaces.filter((file) => file !== implementation), guidance).toEqual([])
  })
})
