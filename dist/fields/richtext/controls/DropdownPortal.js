'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * DropdownPortal - Renders dropdown content in a portal to escape overflow clipping
 *
 * Uses React Portal to render outside the DOM hierarchy, similar to how
 * Puck's native dropdowns use @radix-ui/react-popover with PopoverPortal.
 */
import { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
export function DropdownPortal({ isOpen, onClose, triggerRef, children, minWidth = 160 }) {
    const dropdownRef = useRef(null);
    const [position, setPosition] = useState(null);
    // Calculate position based on trigger element
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const dropdownWidth = minWidth;
            const viewportWidth = window.innerWidth;
            // Position below the trigger
            let left = rect.left;
            const top = rect.bottom + 4;
            // Check if it would overflow the right edge
            if (left + dropdownWidth > viewportWidth - 16) {
                // Align to right edge of trigger instead
                left = rect.right - dropdownWidth;
            }
            // Ensure it doesn't go off the left edge
            if (left < 16) {
                left = 16;
            }
            setPosition({ top, left });
        }
    }, [isOpen, triggerRef, minWidth]);
    // Close on click outside
    useEffect(() => {
        if (!isOpen)
            return;
        function handleClickOutside(event) {
            const target = event.target;
            // Don't close if clicking color input (native picker)
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'INPUT' && activeElement.type === 'color') {
                return;
            }
            // Check if click is outside both dropdown and trigger
            if (dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)) {
                onClose();
            }
        }
        // Use setTimeout to avoid closing immediately on the click that opened it
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);
    // Close on escape key
    useEffect(() => {
        if (!isOpen)
            return;
        function handleEscape(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    if (!isOpen || !position)
        return null;
    const style = {
        position: 'fixed',
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--puck-color-white)',
        border: '1px solid var(--puck-color-grey-09)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 99999,
        minWidth,
    };
    return ReactDOM.createPortal(_jsx("div", { ref: dropdownRef, style: style, "data-puck-dropdown-portal": true, children: children }), document.body);
}
//# sourceMappingURL=DropdownPortal.js.map