/**
 * Columns Component - Puck Configuration (editor)
 *
 * Unlike Grid (a single CSS-grid slot where children auto-place into cells),
 * Columns exposes one independent drop zone PER column — components can be
 * dropped into a specific column. Puck slots are static named fields, so a fixed
 * maximum set of column slots (column1..columnN) is declared and only the first
 * `count` are rendered.
 *
 * Responsive: stacks vertically on mobile, switches to a CSS grid at md+ (≥768px).
 *
 * Width distribution supports equal columns or fr ratios (e.g. 2:1, 1:2, 1:1:2)
 * for asymmetric layouts.
 */

import { useId } from 'react'
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
import { createPaddingField } from '../../fields/PaddingField.js'
import { createBorderField } from '../../fields/BorderField.js'
import { createDimensionsField } from '../../fields/DimensionsField.js'
import { createMarginField } from '../../fields/MarginField.js'
import { createResetField } from '../../fields/ResetField.js'
import { createBackgroundField } from '../../fields/BackgroundField.js'
import { createAnimationField } from '../../fields/AnimationField.js'
import { createResponsiveField } from '../../fields/ResponsiveField.js'
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField.js'

export const MAX_COLUMNS = 4

export type ColumnCount = 2 | 3 | 4

const DEFAULT_PADDING: PaddingValue = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
}

const DEFAULT_DIMENSIONS: DimensionsValue = {
  mode: 'full',
  alignment: 'center',
  maxWidth: { value: 100, unit: '%', enabled: true },
}

export interface ColumnsProps {
  column1: unknown
  column2: unknown
  column3: unknown
  column4: unknown
  count: ColumnCount
  distribution: string
  gap: number
  background: BackgroundValue | null
  customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  border: BorderValue | null
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  animation: AnimationValue | null
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

/**
 * Resolve `grid-template-columns` from the column count and distribution preset.
 * Falls back to equal widths when the ratio's segment count doesn't match.
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
    _reset: createResetField({ defaultProps }),
    // One independent drop zone per column. Disallow Section (full-width) inside
    // a column, matching Grid — it would break the column layout.
    column1: { type: 'slot', disallow: ['Section'] },
    column2: { type: 'slot', disallow: ['Section'] },
    column3: { type: 'slot', disallow: ['Section'] },
    column4: { type: 'slot', disallow: ['Section'] },
    // Responsive visibility control
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    count: {
      type: 'select',
      label: 'Number of Columns',
      options: [
        { label: '2 Columns', value: 2 },
        { label: '3 Columns', value: 3 },
        { label: '4 Columns', value: 4 },
      ],
    },
    distribution: {
      type: 'select',
      label: 'Column Widths',
      options: [
        { label: 'Equal', value: 'equal' },
        { label: '2 : 1 (wide left)', value: '2:1' },
        { label: '1 : 2 (wide right)', value: '1:2' },
        { label: '3 : 1', value: '3:1' },
        { label: '1 : 3', value: '1:3' },
        { label: '2 : 1 : 1', value: '2:1:1' },
        { label: '1 : 2 : 1 (wide center)', value: '1:2:1' },
        { label: '1 : 1 : 2', value: '1:1:2' },
      ],
    },
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
    },
    background: createBackgroundField({ label: 'Background' }),
    border: createBorderField({ label: 'Border' }),
    dimensions: createResponsiveField({
      label: 'Dimensions (Responsive)',
      innerField: (config) => createDimensionsField(config),
      defaultValue: DEFAULT_DIMENSIONS,
    }),
    animation: createAnimationField({ label: 'Animation' }),
    margin: createResponsiveField({
      label: 'Margin (Responsive)',
      innerField: (config) => createMarginField(config),
      defaultValue: DEFAULT_PADDING,
    }),
    customPadding: createResponsiveField({
      label: 'Padding (Responsive)',
      innerField: (config) => createPaddingField(config),
      defaultValue: DEFAULT_PADDING,
    }),
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

    // Generate unique IDs for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
    const wrapperClass = `puck-columns-${uniqueId}`
    const contentClass = `puck-columns-content-${uniqueId}`

    const mediaQueries: string[] = []

    const backgroundStyles = backgroundValueToCSS(background)
    const wrapperStyles: React.CSSProperties = { ...backgroundStyles }

    const paddingResult = responsiveValueToCSS(
      customPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      wrapperClass
    )
    Object.assign(wrapperStyles, paddingResult.baseStyles)
    if (paddingResult.mediaQueryCSS) mediaQueries.push(paddingResult.mediaQueryCSS)

    const borderStyles = borderValueToCSS(border)
    if (borderStyles) Object.assign(wrapperStyles, borderStyles)

    const marginResult = responsiveValueToCSS(
      margin,
      (v) => ({ margin: marginValueToCSS(v) }),
      wrapperClass
    )
    Object.assign(wrapperStyles, marginResult.baseStyles)
    if (marginResult.mediaQueryCSS) mediaQueries.push(marginResult.mediaQueryCSS)

    const dimensionsResult = responsiveValueToCSS(
      dimensions,
      dimensionsValueToCSS,
      contentClass
    )

    const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass)
    if (visibilityCSS) mediaQueries.push(visibilityCSS)

    const contentClasses = cn('flex flex-col w-full', 'md:grid', contentClass)

    const contentStyles: React.CSSProperties = {
      gap,
      ...dimensionsResult.baseStyles,
    }
    if (dimensionsResult.mediaQueryCSS) mediaQueries.push(dimensionsResult.mediaQueryCSS)

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
              const ColumnSlot = Slot as React.ElementType
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
