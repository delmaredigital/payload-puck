import { type ReactNode } from 'react';
import { type Data } from '@puckeditor/core';
export interface HeaderActionsProps {
    /**
     * Default Puck header actions (undo/redo, publish button)
     */
    children: ReactNode;
    /**
     * Handler for back button click
     */
    onBack: () => void;
    /**
     * Handler for preview button click
     */
    onPreview: () => void;
    /**
     * Handler for save button click
     */
    onSave: (data: Data) => void;
    /**
     * Handler for publish button click (optional, uses default Puck publish if not provided)
     */
    onPublish?: (data: Data) => void;
    /**
     * Handler for unpublish button click (reverts to draft)
     */
    onUnpublish?: () => void;
    /**
     * Whether a save operation is in progress
     */
    isSaving: boolean;
    /**
     * Whether there are unsaved changes
     */
    hasUnsavedChanges: boolean;
    /**
     * Last saved timestamp
     */
    lastSaved: Date | null;
    /**
     * Document status from Payload (_status field)
     * Shows visual indicator for draft vs published
     */
    documentStatus?: 'draft' | 'published';
    /**
     * Whether the document has ever been published (initially or during this session)
     * Used to show "Unpublished Changes" vs "Draft" badge
     */
    wasPublished?: boolean;
    /**
     * Custom actions to render at the start of the header
     */
    actionsStart?: ReactNode;
    /**
     * Custom actions to render at the end of the header (before publish)
     */
    actionsEnd?: ReactNode;
    /**
     * Whether to show the save draft button
     * @default true
     */
    showSaveDraft?: boolean;
    /**
     * Whether to show the view page button
     * @default true
     */
    showViewPage?: boolean;
    /**
     * Whether to show the interactive mode toggle
     * @default false
     * @deprecated Use the Preview button instead
     */
    showInteractiveToggle?: boolean;
    /**
     * Whether to show the preview button
     * @default true
     */
    showPreviewButton?: boolean;
    /**
     * Handler for opening the preview modal
     */
    onOpenPreview?: () => void;
    /**
     * Whether to show the version history button in the header
     * @default true
     * @deprecated Version history has moved to the plugin rail. This prop will be removed in a future version.
     */
    showVersionHistory?: boolean;
    /**
     * Page ID for version history (required if showVersionHistory is true)
     */
    pageId?: string;
    /**
     * API endpoint base path for version history
     * @default '/api/puck/pages'
     */
    apiEndpoint?: string;
    /**
     * Error message to display (e.g., validation errors)
     */
    saveError?: string | null;
    /**
     * Handler to dismiss the error message
     */
    onDismissError?: () => void;
    /**
     * Whether to show the preview dark mode toggle
     * @default false
     */
    showPreviewDarkModeToggle?: boolean;
    /**
     * Current state of preview dark mode
     */
    previewDarkMode?: boolean;
    /**
     * Handler for toggling preview dark mode
     */
    onPreviewDarkModeChange?: (isDarkMode: boolean) => void;
}
/**
 * Custom header actions component for the Puck editor
 *
 * Provides standard actions: Back, Edit/Interactive toggle, View Page, Save Draft
 * Also displays save status and last saved time.
 */
export declare const HeaderActions: import("react").NamedExoticComponent<HeaderActionsProps>;
//# sourceMappingURL=HeaderActions.d.ts.map