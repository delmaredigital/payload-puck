/**
 * RichText field for Puck
 *
 * Enhanced richtext field using Puck's native implementation with
 * custom TipTap extensions for colors, font sizes, and more.
 */

// Import CSS for menu overrides (flex-wrap fix)
import './richtext-menu.css'

// Main factory
export {
  createRichTextField,
  fullRichTextField,
  minimalRichTextField,
  sidebarRichTextField,
  type CreateRichTextFieldOptions,
} from './createRichTextField'

// Extensions (for advanced customization)
export { FontSize } from './extensions/FontSize'

// Controls (for custom menu building)
export { ColorPickerControl, ColorPickerPanel } from './controls/ColorPickerControl'
export { FontSizeControl } from './controls/FontSizeControl'
export { HighlightControl } from './controls/HighlightControl'

// Utilities
export {
  normalizeHex,
  hexToRgba,
  parseColor,
  FONT_SIZES,
  FONT_SIZE_UNITS,
  controlStyles,
  type FontSizeUnit,
} from './controls/shared'
