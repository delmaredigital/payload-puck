import { type Data } from '@puckeditor/core';
/**
 * Version entry from Payload's versions system
 */
export interface PageVersion {
    id: string;
    parent: string;
    version: {
        title?: string;
        slug?: string;
        puckData?: Data;
        _status?: 'draft' | 'published';
        updatedAt: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
    autosave?: boolean;
    latest?: boolean;
}
export interface VersionHistoryPanelProps {
    /**
     * Page ID to fetch versions for
     */
    pageId: string;
    /**
     * API endpoint base path
     * @default '/api/puck/pages'
     */
    apiEndpoint?: string;
    /**
     * Callback after successful restore (e.g., to mark editor as clean)
     */
    onRestoreSuccess?: () => void;
}
/**
 * Version history panel for the Puck plugin rail
 *
 * Displays a list of previous versions with the ability to restore them.
 * Uses Puck's dispatch to update editor state without page reload.
 */
export declare const VersionHistoryPanel: import("react").NamedExoticComponent<VersionHistoryPanelProps>;
//# sourceMappingURL=VersionHistoryPanel.d.ts.map