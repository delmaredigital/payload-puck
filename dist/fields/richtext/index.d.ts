/**
 * RichText field for Puck
 *
 * Enhanced richtext field using Puck's native implementation with
 * custom TipTap extensions for colors, font sizes, and more.
 */
import './richtext-menu.css';
export { createRichTextField, fullRichTextField, minimalRichTextField, sidebarRichTextField, type CreateRichTextFieldOptions, } from './createRichTextField';
export { FontSize } from './extensions/FontSize';
export { ColorPickerControl, ColorPickerPanel } from './controls/ColorPickerControl';
export { FontSizeControl } from './controls/FontSizeControl';
export { HighlightControl } from './controls/HighlightControl';
export { normalizeHex, hexToRgba, parseColor, FONT_SIZES, FONT_SIZE_UNITS, controlStyles, type FontSizeUnit, } from './controls/shared';
//# sourceMappingURL=index.d.ts.map