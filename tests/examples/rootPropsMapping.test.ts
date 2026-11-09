import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'
import { generatePagesCollection } from '../../src/plugin/collections/Pages.js'
import {
  mapPayloadFieldsToRootProps,
  mapRootPropsToPayloadFields,
} from '../../src/api/utils/mapRootProps.js'
import type { RootPropsMapping } from '../../src/api/types.js'

const examples = fileURLToPath(new URL('../../examples/', import.meta.url))

// Read the real starter configuration without importing Next routes or requiring
// a consumer's @payload-config. Fail if a mapping stops being a literal example.
function exampleMappings(dir: string): { file: string; mappings: RootPropsMapping[] }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return exampleMappings(path)
    if (!/\.tsx?$/.test(entry.name)) return []
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
    const results: { file: string; mappings: RootPropsMapping[] }[] = []
    function visit(node: ts.Node) {
      if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'rootPropsMapping') {
        expect(ts.isArrayLiteralExpression(node.initializer)).toBe(true)
        const mappings = (node.initializer as ts.ArrayLiteralExpression).elements.map((element) => {
          expect(ts.isObjectLiteralExpression(element)).toBe(true)
          const mapping: Record<string, string> = {}
          for (const prop of (element as ts.ObjectLiteralExpression).properties) {
            if (ts.isPropertyAssignment(prop) && ['from', 'to'].includes(prop.name.getText(source))) {
              expect(ts.isStringLiteral(prop.initializer)).toBe(true)
              mapping[prop.name.getText(source)] = (prop.initializer as ts.StringLiteral).text
            }
          }
          expect(mapping.from).toBeTruthy()
          expect(mapping.to).toBeTruthy()
          return mapping as unknown as RootPropsMapping
        })
        results.push({ file: relative(examples, path), mappings })
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    return results
  })
}

function fieldPaths(fields: Field[], prefix = ''): string[] {
  return fields.flatMap((field): string[] => {
    const path = 'name' in field && field.name ? `${prefix}${field.name}` : undefined
    const children = 'fields' in field ? fieldPaths(field.fields, path ? `${path}.` : prefix) : []
    const tabs = field.type === 'tabs'
      ? field.tabs.flatMap((tab) => fieldPaths(tab.fields, 'name' in tab ? `${prefix}${tab.name}.` : prefix))
      : []
    return [...(path ? [path] : []), ...children, ...tabs]
  })
}

describe('starter root prop mappings', () => {
  const examplesWithMappings = exampleMappings(examples)
  // The starter generates its pages collection without extra consumer fields.
  const paths = fieldPaths(generatePagesCollection('pages', {}).fields)

  it('only maps to fields that exist on the generated pages collection', () => {
    expect(examplesWithMappings).toHaveLength(2)
    for (const { file, mappings } of examplesWithMappings) {
      for (const mapping of mappings) {
        expect(paths, `${file}: ${mapping.from} → ${mapping.to}`).toContain(mapping.to)
      }
    }
  })

  it('uses the same mappings for admin loading and custom route saving', () => {
    expect(examplesWithMappings.map(({ file }) => file).sort()).toEqual([
      'app/api/puck/pages/[id]/route.ts',
      'payload.config.ts',
    ])
    expect(examplesWithMappings[0].mappings).toEqual(examplesWithMappings[1].mappings)
  })

  it('keeps the default SEO load/save mappings working', () => {
    const props = { metaTitle: 'SEO title', metaDescription: 'SEO description' }
    for (const { mappings } of examplesWithMappings) {
      const data = mapRootPropsToPayloadFields(props, mappings)
      expect(data).toEqual({ meta: { title: props.metaTitle, description: props.metaDescription } })
      expect(paths).toContain('meta.title')
      expect(paths).toContain('meta.description')
      expect(mapPayloadFieldsToRootProps(data, mappings)).toEqual(props)
    }
  })
})
