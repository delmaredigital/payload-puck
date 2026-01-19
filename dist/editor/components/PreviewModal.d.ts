import type { Data as PuckData } from '@puckeditor/core';
import type { LayoutDefinition } from '../../layouts/index.js';
export interface PreviewModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;
    /**
     * Handler for closing the modal
     */
    onClose: () => void;
    /**
     * Puck data to render in the preview
     */
    data: PuckData | null;
    /**
     * Page title for the modal header
     */
    pageTitle?: string;
    /**
     * Handler for opening the page in a new tab
     */
    onOpenInNewTab?: () => void;
    /**
     * Available layouts for rendering
     */
    layouts?: LayoutDefinition[];
    /**
     * Whether there are unsaved changes in the editor
     */
    hasUnsavedChanges?: boolean;
    /**
     * Handler to save the current data before navigating
     */
    onSave?: () => Promise<void>;
    /**
     * Whether a save is in progress
     */
    isSaving?: boolean;
    /**
     * Stylesheet URLs to inject into the preview
     */
    editorStylesheets?: string[];
    /**
     * Raw CSS to inject into the preview
     */
    editorCss?: string;
}
/**
 * Full-screen preview modal with client-side rendering
 *
 * Renders the current editor data directly using PageRenderer.
 * Links prompt for confirmation before navigating (with option to save first).
 *
 * Features:
 * - Zero consumer setup required
 * - Shows current editor state (including unsaved changes)
 * - Interactive elements (accordions, hover states) still work
 * - Links show confirmation dialog before navigating
 */
export declare const PreviewModal: import("react").NamedExoticComponent<PreviewModalProps>;
//# sourceMappingURL=PreviewModal.d.ts.map