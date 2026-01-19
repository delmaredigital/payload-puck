/**
 * Shared utilities for RichText controls
 *
 * Color manipulation, font size presets, and common types.
 */
import type { CSSProperties } from 'react';
export declare const FONT_SIZES: readonly [{
    readonly label: "XS";
    readonly value: "0.75rem";
    readonly px: "12px";
}, {
    readonly label: "Small";
    readonly value: "0.875rem";
    readonly px: "14px";
}, {
    readonly label: "Normal";
    readonly value: null;
    readonly px: "16px";
}, {
    readonly label: "Medium";
    readonly value: "1.125rem";
    readonly px: "18px";
}, {
    readonly label: "Large";
    readonly value: "1.25rem";
    readonly px: "20px";
}, {
    readonly label: "XL";
    readonly value: "1.5rem";
    readonly px: "24px";
}, {
    readonly label: "2XL";
    readonly value: "1.875rem";
    readonly px: "30px";
}, {
    readonly label: "3XL";
    readonly value: "2.25rem";
    readonly px: "36px";
}, {
    readonly label: "4XL";
    readonly value: "3rem";
    readonly px: "48px";
}];
export declare const FONT_SIZE_UNITS: readonly ["px", "rem", "em"];
export type FontSizeUnit = (typeof FONT_SIZE_UNITS)[number];
/**
 * Validates and normalizes a hex color string
 */
export declare function normalizeHex(hex: string): string;
/**
 * Converts hex + opacity to rgba CSS string
 */
export declare function hexToRgba(hex: string, opacity: number): string;
/**
 * Parses a color string (hex or rgba) and returns hex + opacity
 */
export declare function parseColor(color: string | undefined): {
    hex: string;
    opacity: number;
};
export declare const controlStyles: {
    icon: CSSProperties;
    dropdownTrigger: CSSProperties;
    dropdownTriggerActive: CSSProperties;
    dropdown: CSSProperties;
    dropdownItem: CSSProperties;
    dropdownLabel: CSSProperties;
    dropdownSeparator: CSSProperties;
    colorPickerContainer: CSSProperties;
    colorPickerRow: CSSProperties;
    colorPickerInput: CSSProperties;
    colorPickerHexInput: CSSProperties;
    colorPickerPreview: CSSProperties;
    colorPickerCheckerboard: CSSProperties;
    colorPickerOverlay: CSSProperties;
    colorPickerOpacitySection: CSSProperties;
    colorPickerOpacityHeader: CSSProperties;
    colorPickerOpacityLabel: CSSProperties;
    colorPickerOpacityValue: CSSProperties;
    colorPickerOpacitySlider: CSSProperties;
    colorPickerOpacityInputRange: CSSProperties;
    colorPickerOpacityThumb: CSSProperties;
    colorPickerPresetsLabel: CSSProperties;
    colorPickerPresetsGrid: CSSProperties;
    colorPickerPresetButton: CSSProperties;
    colorPickerPresetButtonSelected: CSSProperties;
    colorPickerThemeButton: CSSProperties;
    colorPickerThemeSwatch: CSSProperties;
    fontSizeGrid: CSSProperties;
    fontSizeButton: CSSProperties;
    fontSizeButtonActive: CSSProperties;
    customSizeRow: CSSProperties;
    customSizeInput: CSSProperties;
    customSizeSelect: CSSProperties;
    customSizeApply: CSSProperties;
};
//# sourceMappingURL=shared.d.ts.map