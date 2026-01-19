/**
 * Version entry from Payload's versions system
 */
export interface PageVersion {
    id: string;
    parent: string;
    version: {
        title?: string;
        slug?: string;
        _status?: 'draft' | 'published';
        updatedAt: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
    autosave?: boolean;
    latest?: boolean;
}
export interface VersionHistoryProps {
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
     * Callback when a version is restored
     */
    onRestore?: (version: PageVersion) => void;
    /**
     * Whether restore operations are disabled
     */
    disabled?: boolean;
}
/**
 * Version history dropdown for the Puck editor
 *
 * Shows a list of previous versions with the ability to restore them.
 */
export declare const VersionHistory: import("react").NamedExoticComponent<VersionHistoryProps>;
//# sourceMappingURL=VersionHistory.d.ts.map