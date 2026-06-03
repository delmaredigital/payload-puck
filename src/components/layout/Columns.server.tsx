/**
 * Columns Component - Server-safe Puck Configuration
 *
 * Unlike Grid (a single slot styled as CSS grid, where children auto-place into
 * cells), Columns exposes one independent drop zone PER column. Each column is
 * its own slot, so components can be targeted into a specific column.
 *
 * Puck slots are static named fields, so we declare a fixed maximum set of
 * column slots (column1..columnN) and render only the first `count`.
 *
 * Responsive: stacks vertically on mobile (flex column), switches to a CSS grid
 * at md+ (≥768px), matching the Grid component's behavior.
 *
 * This is the server-safe variant (slots only, no editor fields). For the full
 * editor version with fields, use Columns.tsx
 */

import type { ComponentConfig } from '@puckeditor/core'
import {
  cn,
  dimensionsValueToCSS,
  marginValueToCSS,
  paddingValueToCSS,
  borderValueToCSS,
  backgroundValueToCSS,
  responsiveValueToCSS,
  visibilityValueToCSS,
  type PaddingValue,
  type BorderValue,
  type DimensionsValue,
  type BackgroundValue,
  type AnimationValue,
  type ResponsiveValue,
  type VisibilityValue,
} from '../../fields/shared.js'
import { AnimatedWrapper } from '../AnimatedWrapper.js'

/** Maximum number of column slots the component declares. */
export const MAX_COLUMNS = 4

export type ColumnCount = 2 | 3 | 4

export interface ColumnsProps {
  column1: unknown
  column2: unknown
  column3: unknown
  column4: unknown
  count: ColumnCount
  /**
   * Column width distribution. 'equal' splits evenly; otherwise a colon-separated
   * fr ratio (e.g. '2:1', '1:2', '1:1:2'). Ratios whose segment count doesn't
   * match `count` fall back to equal.
   */
  distribution: string
  gap: number
  // Background
  background: BackgroundValue | null
  // Advanced custom options
  customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  border: BorderValue | null
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  animation: AnimationValue | null
  // Responsive visibility
  visibility: VisibilityValue | null
}

const defaultProps: ColumnsProps = {
  column1: [],
  column2: [],
  column3: [],
  column4: [],
  count: 2,
  distribution: 'equal',
  gap: 24,
  background: null,
  customPadding: null,
  dimensions: null,
  border: null,
  margin: null,
  animation: null,
  visibility: null,
}

// Simple ID generator for server-side rendering
let idCounter = 0
function generateUniqueId(): string {
  return `c${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Resolve the `grid-template-columns` value from the column count and the
 * distribution preset. Falls back to equal widths when the ratio doesn't match.
 */
export function resolveColumnsTemplate(count: number, distribution: string): string {
  const safeCount = Math.min(Math.max(Math.round(count) || 2, 1), MAX_COLUMNS)
  if (distribution && distribution !== 'equal') {
    const parts = distribution.split(':').map((p) => p.trim())
    if (parts.length === safeCount && parts.every((p) => /^\d+(\.\d+)?$/.test(p))) {
      return parts.map((p) => `${p}fr`).join(' ')
    }
  }
  return `repeat(${safeCount}, minmax(0, 1fr))`
}

export const ColumnsConfig: ComponentConfig = {
  label: 'Columns',
  fields: {
    column1: { type: 'slot' },
    column2: { type: 'slot' },
    column3: { type: 'slot' },
    column4: { type: 'slot' },
  },
  defaultProps,
  render: ({
    column1: Column1,
    column2: Column2,
    column3: Column3,
    column4: Column4,
    count = 2,
    distribution = 'equal',
    gap,
    background,
    customPadding,
    dimensions,
    border,
    margin,
    animation,
    visibility,
  }) => {
    const safeCount = Math.min(Math.max(Math.round(count) || 2, 1), MAX_COLUMNS)

    // Generate unique IDs for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
    const wrapperClass = `puck-columns-${uniqueId}`
    const contentClass = `puck-columns-content-${uniqueId}`

    // Collect all media query CSS
    const mediaQueries: string[] = []

    // Generate styles from BackgroundValue
    const backgroundStyles = backgroundValueToCSS(background)
    const wrapperStyles: React.CSSProperties = { ...backgroundStyles }

    // Padding (responsive)
    const paddingResult = responsiveValueToCSS(
      customPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      wrapperClass
    )
    Object.assign(wrapperStyles, paddingResult.baseStyles)
    if (paddingResult.mediaQueryCSS) mediaQueries.push(paddingResult.mediaQueryCSS)

    // Border
    const borderStyles = borderValueToCSS(border)
    if (borderStyles) Object.assign(wrapperStyles, borderStyles)

    // Margin (responsive)
    const marginResult = responsiveValueToCSS(
      margin,
      (v) => ({ margin: marginValueToCSS(v) }),
      wrapperClass
    )
    Object.assign(wrapperStyles, marginResult.baseStyles)
    if (marginResult.mediaQueryCSS) mediaQueries.push(marginResult.mediaQueryCSS)

    // Dimensions (responsive)
    const dimensionsResult = responsiveValueToCSS(
      dimensions,
      dimensionsValueToCSS,
      contentClass
    )

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass)
    if (visibilityCSS) mediaQueries.push(visibilityCSS)

    // Tailwind: flex column on mobile, grid on md+
    const contentClasses = cn('flex flex-col w-full', 'md:grid', contentClass)

    const contentStyles: React.CSSProperties = {
      gap,
      ...dimensionsResult.baseStyles,
    }
    if (dimensionsResult.mediaQueryCSS) mediaQueries.push(dimensionsResult.mediaQueryCSS)

    // grid-template-columns is dynamic, so drive it from a CSS var and scope the
    // media-query rule to this instance's content class (no cross-instance leak).
    const colsTemplate = resolveColumnsTemplate(safeCount, distribution)
    const gridStyles: React.CSSProperties = {
      ...contentStyles,
      '--cols-template': colsTemplate,
    } as React.CSSProperties

    const slots = [Column1, Column2, Column3, Column4]
    const allMediaQueryCSS = mediaQueries.join('\n')

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <div className={wrapperClass} style={wrapperStyles}>
          <div className={contentClasses} style={gridStyles}>
            {slots.slice(0, safeCount).map((Slot, i) => {
              const ColumnSlot = Slot as any
              return <ColumnSlot key={i} />
            })}
          </div>
          <style>{`
            @media (min-width: 768px) {
              .${contentClass} {
                grid-template-columns: var(--cols-template);
              }
            }
          `}</style>
        </div>
      </AnimatedWrapper>
    )
  },
}
