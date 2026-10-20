/**
 * Static guard: `<Puck iframe={…}>` must get a stable reference.
 *
 * Puck's canvas viewport effect lists `iframe` in its dependencies, and while
 * undo history holds a single entry, every run of that effect replaces the entry
 * with the current app state. `PuckEditorImpl` re-renders on every change (it
 * marks the document dirty), so an inline object literal re-ran the effect after
 * the first move or duplicate, before Puck's debounced history record. The
 * "initial" entry then already held the change, and undo restored it: the undo
 * button greyed out while the canvas kept the moved or duplicated block.
 *
 * Rendering the editor isn't practical in this node test environment, so this
 * pins the cause in the source instead.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  fileURLToPath(new URL('../../src/editor/PuckEditorImpl.client.tsx', import.meta.url)),
  'utf8',
)

const iframeProps = [...source.matchAll(/\biframe=\{([^}]*)\}/g)].map((m) => m[1].trim())

describe('PuckEditorImpl — <Puck> iframe prop', () => {
  it('is passed exactly once', () => {
    expect(iframeProps).toHaveLength(1)
  })

  it('is not an inline object literal (a new reference on every render)', () => {
    expect(source).not.toMatch(/\biframe=\{\s*\{/)
  })

  // An identifier alone isn't enough: a `const` declared inside the component
  // body is just as new on every render. Require a module-scope declaration.
  it('is a bare identifier declared at module scope', () => {
    const [expr] = iframeProps
    expect(expr).toMatch(/^[A-Za-z_$][\w$]*$/)
    expect(source).toMatch(new RegExp(`^const ${expr}\\b`, 'm'))
  })
})
