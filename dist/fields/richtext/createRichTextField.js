'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RichTextMenu } from '@puckeditor/core';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import HighlightExtension from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Superscript as SuperscriptIcon, Subscript as SubscriptIcon } from 'lucide-react';
import { FontSize } from './extensions/FontSize';
import { ColorPickerControl } from './controls/ColorPickerControl';
import { FontSizeControl } from './controls/FontSizeControl';
import { HighlightControl } from './controls/HighlightControl';
// =============================================================================
// Factory Function
// =============================================================================
/**
 * Creates a Puck richtext field with enhanced features.
 *
 * @example
 * ```tsx
 * const myConfig: ComponentConfig = {
 *   fields: {
 *     content: createRichTextField({
 *       label: 'Content',
 *       contentEditable: true,
 *     }),
 *   },
 *   // ...
 * }
 * ```
 */
export function createRichTextField(options = {}) {
    const { label, contentEditable = false, initialHeight = 192, headingLevels = [1, 2, 3, 4, 5, 6], fontSize = true, textColor = true, highlight = true, superscript = true, subscript = true, codeBlock = true, blockquote = true, } = options;
    // Build custom TipTap extensions array
    // Using any[] to avoid complex union types with TipTap extensions
    const customExtensions = [TextStyle];
    if (textColor) {
        customExtensions.push(Color);
    }
    if (highlight) {
        customExtensions.push(HighlightExtension.configure({ multicolor: true }));
    }
    if (fontSize) {
        customExtensions.push(FontSize);
    }
    if (superscript) {
        customExtensions.push(Superscript);
    }
    if (subscript) {
        customExtensions.push(Subscript);
    }
    return {
        type: 'richtext',
        label,
        // Puck richtext options
        contentEditable,
        initialHeight,
        // Configure built-in extensions
        // Note: Puck expects `false` to disable or config object to customize
        // Omitting a key or setting to `undefined` means "use default" (enabled)
        options: {
            heading: { levels: headingLevels },
            codeBlock: codeBlock ? undefined : false,
            blockquote: blockquote ? undefined : false,
        },
        // Add our custom TipTap extensions
        tiptap: {
            extensions: customExtensions,
            // Expose custom state for our controls
            // Cast to any because Puck's types expect Record<string, boolean> but we need strings for colors/sizes
            selector: ((ctx) => {
                if (!ctx.editor) {
                    return {};
                }
                return {
                    // Text color state
                    currentColor: ctx.editor.getAttributes('textStyle').color,
                    // Highlight state
                    highlightColor: ctx.editor.getAttributes('highlight').color,
                    isHighlight: ctx.editor.isActive('highlight'),
                    // Font size state
                    currentFontSize: ctx.editor.getAttributes('textStyle').fontSize,
                    // Superscript/Subscript state
                    isSuperscript: ctx.editor.isActive('superscript'),
                    isSubscript: ctx.editor.isActive('subscript'),
                    canSuperscript: ctx.editor.can().toggleSuperscript(),
                    canSubscript: ctx.editor.can().toggleSubscript(),
                };
            }),
        },
        // Custom menu with our additional controls
        // Using any types for Puck compatibility - our selector adds custom properties to editorState
        renderMenu: ({ editor, editorState }) => {
            // Guard against null editor/state during initialization
            if (!editor || !editorState) {
                return null;
            }
            return (_jsxs(RichTextMenu, { children: [_jsxs(RichTextMenu.Group, { children: [_jsx(RichTextMenu.Bold, {}), _jsx(RichTextMenu.Italic, {}), _jsx(RichTextMenu.Underline, {}), _jsx(RichTextMenu.Strikethrough, {}), superscript && (_jsx(RichTextMenu.Control, { icon: _jsx(SuperscriptIcon, { size: 16 }), title: "Superscript", active: editorState.isSuperscript, disabled: !editorState.canSuperscript, onClick: () => editor.chain().focus().toggleSuperscript().run() })), subscript && (_jsx(RichTextMenu.Control, { icon: _jsx(SubscriptIcon, { size: 16 }), title: "Subscript", active: editorState.isSubscript, disabled: !editorState.canSubscript, onClick: () => editor.chain().focus().toggleSubscript().run() }))] }), _jsxs(RichTextMenu.Group, { children: [_jsx(RichTextMenu.HeadingSelect, {}), _jsx(RichTextMenu.ListSelect, {}), _jsx(RichTextMenu.AlignSelect, {})] }), _jsxs(RichTextMenu.Group, { children: [fontSize && _jsx(FontSizeControl, { editor: editor, currentSize: editorState.currentFontSize }), textColor && _jsx(ColorPickerControl, { editor: editor, currentColor: editorState.currentColor }), highlight && (_jsx(HighlightControl, { editor: editor, currentColor: editorState.highlightColor, isActive: editorState.isHighlight }))] }), _jsxs(RichTextMenu.Group, { children: [blockquote && _jsx(RichTextMenu.Blockquote, {}), codeBlock && _jsx(RichTextMenu.CodeBlock, {}), _jsx(RichTextMenu.HorizontalRule, {})] })] }));
        },
    };
}
// =============================================================================
// Preset Configurations
// =============================================================================
/**
 * Full-featured richtext field with all enhancements
 */
export const fullRichTextField = createRichTextField({
    contentEditable: true,
    fontSize: true,
    textColor: true,
    highlight: true,
    superscript: true,
    subscript: true,
});
/**
 * Minimal richtext field - structure only, no styling controls
 */
export const minimalRichTextField = createRichTextField({
    contentEditable: true,
    fontSize: false,
    textColor: false,
    highlight: false,
    superscript: false,
    subscript: false,
    headingLevels: [1, 2, 3],
});
/**
 * Sidebar-only richtext field (no inline editing)
 */
export const sidebarRichTextField = createRichTextField({
    contentEditable: false,
    initialHeight: 300,
    fontSize: true,
    textColor: true,
    highlight: true,
});
//# sourceMappingURL=createRichTextField.js.map