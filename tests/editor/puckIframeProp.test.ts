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

describe('PuckEditorImpl — <Puck> iframe prop', () => {
  it('is passed', () => {
    expect(source).toMatch(/\biframe=\{/)
  })

  it('is not an inline object literal (a new reference on every render)', () => {
    expect(source).not.toMatch(/\biframe=\{\s*\{/)
  })
})
