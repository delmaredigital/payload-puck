import type { ComponentConfig } from '@puckeditor/core'
import {
  createColorPickerField,
  createPaddingField,
  colorValueToCSS,
  paddingValueToCSS,
  cn,
  type ColorValue,
  type PaddingValue,
} from '@delmaredigital/payload-puck/fields'

export interface CustomBannerProps {
  variant: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  showIcon: boolean
  backgroundColor: ColorValue | null // overrides the variant default
  textColor: ColorValue | null       // overrides the variant default
  padding: PaddingValue | null
}

const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  success: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  error: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
}

export const CustomBannerConfig: ComponentConfig<CustomBannerProps> = {
  label: 'Banner',

  fields: {
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
    },
    title: { type: 'text', label: 'Title' },
    message: { type: 'textarea', label: 'Message' },
    showIcon: {
      type: 'radio',
      label: 'Show Icon',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    // Colour picker with hex input, opacity slider and theme presets
    backgroundColor: createColorPickerField({ label: 'Background Color', showOpacity: true }),
    textColor: createColorPickerField({ label: 'Text Color', showOpacity: false }),
    // Four sides, link/unlink toggle, unit selector
    padding: createPaddingField({ label: 'Padding', showUnits: true }),
  },

  defaultProps: {
    variant: 'info',
    title: 'Information',
    message: 'This is an informational banner message.',
    showIcon: true,
    backgroundColor: null, // null means "use the variant default"
    textColor: null,
    padding: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px', linked: true },
  },

  render: ({ variant, title, message, backgroundColor, textColor, padding }) => {
    const styles = variantStyles[variant] || variantStyles.info

    // Each helper returns undefined for an empty value
    const customBg = colorValueToCSS(backgroundColor)
    const customText = colorValueToCSS(textColor)

    return (
      <div
        role="alert"
        className={cn(
          'relative rounded-lg border',
          !customBg && styles.bg,
          !customText && styles.text,
          styles.border,
        )}
        style={{
          backgroundColor: customBg,
          color: customText,
          padding: paddingValueToCSS(padding),
        }}
      >
        {title && <h4 className="font-semibold text-sm">{title}</h4>}
        {message && <p className={cn('text-sm', title && 'mt-1')}>{message}</p>}
      </div>
    )
  },
}
