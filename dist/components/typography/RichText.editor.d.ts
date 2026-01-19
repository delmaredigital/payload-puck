/**
 * RichText Component - Puck Editor Configuration
 *
 * Uses Puck's native richtext field with custom extensions for:
 * - Text colors with opacity (RGBA)
 * - Highlight with multicolor support
 * - Font sizes (presets + custom)
 * - Superscript and subscript
 *
 * Supports contentEditable for inline canvas editing.
 * Requires @tailwindcss/typography - uses the `prose` class for styling.
 */
import React from 'react';
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type DimensionsValue } from '../../fields/shared';
export interface RichTextEditorProps {
    content: React.ReactNode;
    dimensions: DimensionsValue | null;
    margin: PaddingValue | null;
    customPadding: PaddingValue | null;
    id?: string;
}
export declare const RichTextEditorConfig: ComponentConfig;
//# sourceMappingURL=RichText.editor.d.ts.map