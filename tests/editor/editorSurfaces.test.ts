import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../../', import.meta.url))
const implementation = 'src/editor/PuckEditorImpl.client.tsx'
// Legacy editor: safe only while no source import or package export reaches it.
const unreachableEditors = ['src/render/PuckEditor.client.tsx']
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

// Source uses emitted .js specifiers; normalize them and extensionless imports.
function modulePath(path: string): string {
  return path.replace(/\.(?:[cm]?[jt]sx?|d\.ts)$/, '').replace(/\/index$/, '')
}

function exportTargets(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  return value && typeof value === 'object' ? Object.values(value).flatMap(exportTargets) : []
}

describe('editor surfaces resolve integrations', () => {
  it('permits direct <Puck> JSX only in the resolved implementation or unreachable allow-list', () => {
    const surfaces: string[] = []
    for (const { file, ast } of sources) {
      walk(ast, (node) => {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
          && node.tagName.getText(ast) === 'Puck') surfaces.push(file)
      })
    }

    expect(surfaces).toContain(implementation)
    expect(surfaces.filter((file) => file !== implementation && !unreachableEditors.includes(file)), guidance)
      .toEqual([])
  })

  it.each(unreachableEditors)('%s stays unimported and outside package exports', (editor) => {
    const target = modulePath(resolve(root, editor))
    const imports: string[] = []
    for (const { file, ast } of sources) {
      walk(ast, (node) => {
        let specifier: ts.Node | undefined
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
          specifier = node.moduleSpecifier
        } else if (ts.isCallExpression(node)
          && (node.expression.kind === ts.SyntaxKind.ImportKeyword
            || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
          specifier = node.arguments[0]
        }
        if (specifier && ts.isStringLiteralLike(specifier)
          && modulePath(resolve(root, dirname(file), specifier.text)) === target) imports.push(file)
      })
    }

    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    const exports = exportTargets(pkg.exports).filter((path) =>
      modulePath(resolve(root, path.replace(/^\.\/dist\//, './src/'))) === target)
    expect(imports, `${editor} must remain unimported. ${guidance}`).toEqual([])
    expect(exports, `${editor} must remain unexported. ${guidance}`).toEqual([])
  })
})
