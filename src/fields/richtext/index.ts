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
} from './createRichTextField.js'

// Extensions (for advanced customization)
export { FontSize } from './extensions/FontSize.js'

// Controls (for custom menu building)
export { ColorPickerControl, ColorPickerPanel } from './controls/ColorPickerControl.js'
export { FontSizeControl } from './controls/FontSizeControl.js'
export { HighlightControl } from './controls/HighlightControl.js'

// Utilities
export {
  normalizeHex,
  hexToRgba,
  parseColor,
  FONT_SIZES,
  FONT_SIZE_UNITS,
  controlStyles,
  type FontSizeUnit,
} from './controls/shared.js'
