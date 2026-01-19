/**
 * DropdownPortal - Renders dropdown content in a portal to escape overflow clipping
 *
 * Uses React Portal to render outside the DOM hierarchy, similar to how
 * Puck's native dropdowns use @radix-ui/react-popover with PopoverPortal.
 */
import React, { type ReactNode } from 'react';
interface DropdownPortalProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement | null>;
    children: ReactNode;
    minWidth?: number;
}
export declare function DropdownPortal({ isOpen, onClose, triggerRef, children, minWidth }: DropdownPortalProps): React.ReactPortal | null;
export {};
//# sourceMappingURL=DropdownPortal.d.ts.map