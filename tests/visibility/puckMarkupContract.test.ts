/**
 * Contract with the installed @puckeditor/core for block visibility.
 *
 * The editor marks hidden blocks with CSS keyed on attributes Puck renders:
 * - `data-puck-component="<id>"` on every block in the canvas;
 * - `data-puck-layer-tree-id="<id>"` on every Outline row (undocumented).
 * It also relies on the action bar being drawn outside the block, so greying
 * a block's content never dims its toolbar, and on `puck.isEditing` telling
 * editor renders from live ones.
 *
 * These read Puck's shipped code, so a Puck upgrade that changes any of this
 * fails here instead of silently dropping the badges or the live-page hiding.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const dist = join(dirname(require.resolve('@puckeditor/core/package.json')), 'dist')
const shipped = readdirSync(dist)
  .filter((file) => file.endsWith('.mjs'))
  .map((file) => readFileSync(join(dist, file), 'utf8'))
  .join('\n')

/** Source of one module as bundled, from its `// path` marker to the next marker. */
function moduleSource(path: string): string {
  const parts = shipped.split(`// ${path}\n`)
  expect(parts.length, `${path} not found in the installed Puck`).toBeGreaterThan(1)
  // A module can appear in several pieces (imports first, body later); keep them all
  return parts.slice(1).map((part) => part.split(/\n\/\/ [\w@./-]+\.(?:tsx?|css)[^\n]*\n/)[0]).join('\n')
}

describe('installed Puck markup used by block visibility', () => {
  it('puts data-puck-layer-tree-id on each Outline row', () => {
    const layer = moduleSource('components/LayerTree/components/layer/index.tsx')
    expect(layer).toMatch(/\(\s*"li",\s*\{[^]*?"data-puck-layer-tree-id": node\.itemId/)
  })

  it('puts data-puck-component on each block in the canvas', () => {
    const draggable = moduleSource('components/DraggableComponent/index.tsx')
    expect(draggable).toContain('el.setAttribute("data-puck-component", id)')
  })

  it("draws the action bar in a portal outside the block, so greying a block can't dim it", () => {
    const draggable = moduleSource('components/DraggableComponent/index.tsx')
    expect(draggable).toMatch(/createPortal\d*\([^]*?CustomActionBar[^]*?portalEl \|\| document\.body/)
    expect(draggable).toContain('ownerDocument.body')
  })

  it('passes puck.isEditing true in the editor and false in <Render>', () => {
    expect(shipped).toMatch(/renderDropZone: DropZoneEditPure,\s*isEditing: true/)
    expect(moduleSource('components/Render/index.tsx')).toMatch(/isEditing: false/)
  })

  it('composes overrides.actionBar as a component that receives the actions as children', () => {
    const draggable = moduleSource('components/DraggableComponent/index.tsx')
    expect(draggable).toContain('overrides.actionBar || DefaultActionBar')
  })
})
