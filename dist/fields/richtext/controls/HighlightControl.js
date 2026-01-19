'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * HighlightControl - Text highlight control for Puck RichText toolbar
 *
 * A dropdown color picker for text highlighting with:
 * - Native color input
 * - Hex input with validation
 * - Opacity slider (RGBA support)
 * - Theme color presets
 * - Remove highlight option
 */
import { useState, useRef, useCallback } from 'react';
import { Highlighter, ChevronDown } from 'lucide-react';
import { controlStyles } from './shared';
import { ColorPickerPanel } from './ColorPickerControl';
import { DropdownPortal } from './DropdownPortal';
export function HighlightControl({ editor, currentColor, isActive }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const handleColorChange = useCallback((color) => {
        if (color) {
            editor.chain().focus().setHighlight({ color }).run();
        }
        else {
            editor.chain().focus().unsetHighlight().run();
        }
    }, [editor]);
    const close = useCallback(() => setIsOpen(false), []);
    return (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("button", { ref: triggerRef, type: "button", onClick: () => setIsOpen(!isOpen), title: "Highlight", style: {
                    ...controlStyles.dropdownTrigger,
                    ...(isActive ? controlStyles.dropdownTriggerActive : {}),
                }, children: [_jsx(Highlighter, { style: controlStyles.icon }), _jsx(ChevronDown, { style: { width: '12px', height: '12px' } }), currentColor && (_jsx("span", { style: {
                            position: 'absolute',
                            bottom: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '12px',
                            height: '3px',
                            borderRadius: '1px',
                            backgroundColor: currentColor,
                        } }))] }), _jsx(DropdownPortal, { isOpen: isOpen, onClose: close, triggerRef: triggerRef, minWidth: 260, children: _jsx(ColorPickerPanel, { currentColor: currentColor, onColorChange: handleColorChange, onClose: close, mode: "highlight" }) })] }));
}
//# sourceMappingURL=HighlightControl.js.map