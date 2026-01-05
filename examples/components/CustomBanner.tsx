/**
 * Custom Banner Component Example
 *
 * This example demonstrates how to create a custom Puck component that:
 * - Uses proper TypeScript typing with ComponentConfig
 * - Leverages custom fields from the payload-puck library
 * - Integrates with the theme system for color presets
 * - Provides sensible default props
 * - Uses Tailwind CSS for styling
 *
 * Copy this file to your project and customize it to your needs.
 */

import type { ComponentConfig } from '@measured/puck'

// =============================================================================
// Imports from payload-puck
// =============================================================================

// Custom field creators - use these to add rich field experiences
import { createColorPickerField } from '@delmaredigital/payload-puck/fields'
import { createPaddingField } from '@delmaredigital/payload-puck/fields'

// Utility functions for converting field values to CSS
import {
  colorValueToCSS,
  paddingValueToCSS,
  cn,
  type ColorValue,
  type PaddingValue,
} from '@delmaredigital/payload-puck/fields/shared'

// =============================================================================
// Component Props Interface
// =============================================================================

/**
 * Define your props interface for type safety.
 * This ensures your component has proper TypeScript support throughout.
 */
export interface CustomBannerProps {
  /** The type/severity of the banner - affects default styling */
  variant: 'info' | 'success' | 'warning' | 'error'
  /** Main banner title */
  title: string
  /** Optional longer message */
  message: string
  /** Whether to show an icon (based on variant) */
  showIcon: boolean
  /** Whether the banner can be dismissed (visual only in editor) */
  dismissible: boolean
  /** Custom background color - overrides variant default */
  backgroundColor: ColorValue | null
  /** Custom text color - overrides variant default */
  textColor: ColorValue | null
  /** Custom padding around the banner content */
  padding: PaddingValue | null
}

// =============================================================================
// Styling Maps
// =============================================================================

/**
 * Map variant names to default Tailwind classes.
 * These are used when no custom colors are specified.
 */
const variantStyles: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: 'text-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-500',
  },
}

/**
 * Simple SVG icons for each variant.
 * In a real project, you might use an icon library like lucide-react or tabler-icons.
 */
const variantIcons: Record<string, React.ReactNode> = {
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

// =============================================================================
// Component Configuration
// =============================================================================

/**
 * The Puck ComponentConfig defines:
 * - label: Display name in the component picker
 * - fields: The editable properties shown in the right sidebar
 * - defaultProps: Initial values when the component is added
 * - render: The React component that renders the output
 */
export const CustomBannerConfig: ComponentConfig<CustomBannerProps> = {
  // Display name in Puck's component list
  label: 'Banner',

  // Field definitions - these appear in the Puck editor sidebar
  fields: {
    // Standard select field for variant
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

    // Standard text fields
    title: {
      type: 'text',
      label: 'Title',
    },
    message: {
      type: 'textarea',
      label: 'Message',
    },

    // Radio buttons for boolean options
    showIcon: {
      type: 'radio',
      label: 'Show Icon',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    dismissible: {
      type: 'radio',
      label: 'Dismissible',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },

    // Custom fields from payload-puck library
    // These provide rich UI experiences for color picking and spacing

    // ColorPickerField provides:
    // - Color picker with visual preview
    // - Hex input for precise values
    // - Opacity slider (when showOpacity is true)
    // - Preset color swatches from theme
    backgroundColor: createColorPickerField({
      label: 'Background Color',
      showOpacity: true, // Enable opacity slider
      // Optionally, provide custom presets instead of theme defaults:
      // presets: [
      //   { hex: '#3b82f6', label: 'Blue' },
      //   { hex: '#10b981', label: 'Green' },
      // ],
    }),

    textColor: createColorPickerField({
      label: 'Text Color',
      showOpacity: false, // Text usually doesn't need opacity
    }),

    // PaddingField provides:
    // - 4-sided input for top/right/bottom/left
    // - Link/unlink toggle to sync all sides
    // - Unit selector (px, rem)
    padding: createPaddingField({
      label: 'Padding',
      showUnits: true,
    }),
  },

  // Default values when component is first added
  defaultProps: {
    variant: 'info',
    title: 'Information',
    message: 'This is an informational banner message.',
    showIcon: true,
    dismissible: false,
    // null means "use variant defaults"
    backgroundColor: null,
    textColor: null,
    // Default padding - can be null to use component defaults
    padding: {
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
      unit: 'px',
      linked: true,
    },
  },

  // The render function - receives props and returns JSX
  render: ({
    variant,
    title,
    message,
    showIcon,
    dismissible,
    backgroundColor,
    textColor,
    padding,
  }) => {
    // Get default styles for the variant
    const styles = variantStyles[variant] || variantStyles.info

    // Build inline styles for custom colors and padding
    const inlineStyles: React.CSSProperties = {}

    // Convert custom color values to CSS
    // colorValueToCSS returns undefined if the value is null/empty
    const customBg = colorValueToCSS(backgroundColor)
    const customText = colorValueToCSS(textColor)
    const customPadding = paddingValueToCSS(padding)

    if (customBg) {
      inlineStyles.backgroundColor = customBg
    }
    if (customText) {
      inlineStyles.color = customText
    }
    if (customPadding) {
      inlineStyles.padding = customPadding
    }

    // Build class names - use custom colors or fall back to variant defaults
    const bannerClasses = cn(
      // Base styles
      'relative rounded-lg border',
      // Variant styles (only if no custom colors)
      !customBg && styles.bg,
      !customText && styles.text,
      styles.border
    )

    const iconClasses = cn(
      'flex-shrink-0',
      // Icon inherits text color or uses variant default
      !customText && styles.icon
    )

    return (
      <div className={bannerClasses} style={inlineStyles} role="alert">
        <div className="flex items-start gap-3">
          {/* Icon */}
          {showIcon && (
            <span className={iconClasses}>{variantIcons[variant]}</span>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-sm">{title}</h4>
            )}
            {message && (
              <p className={cn('text-sm', title && 'mt-1')}>{message}</p>
            )}
          </div>

          {/* Dismiss button (visual only in this example) */}
          {dismissible && (
            <button
              type="button"
              className={cn(
                'flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors',
                !customText && styles.text
              )}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  },
}

// =============================================================================
// Export Notes
// =============================================================================

/**
 * To use this component in your Puck configuration:
 *
 * 1. Import the config:
 *    import { CustomBannerConfig } from './components/CustomBanner'
 *
 * 2. Add to your Puck config using mergeConfigs:
 *    import { mergeConfigs, editorConfig } from '@delmaredigital/payload-puck/config'
 *
 *    const myConfig = mergeConfigs({
 *      base: editorConfig,
 *      components: {
 *        Banner: CustomBannerConfig,
 *      },
 *      categories: {
 *        interactive: {
 *          title: 'Interactive',
 *          components: ['Banner'],  // Add to existing category
 *        },
 *      },
 *    })
 *
 * See examples/config/custom-config.ts for a complete example.
 */
