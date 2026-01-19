import type { Plugin } from '@puckeditor/core';
export interface VersionHistoryPluginOptions {
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
 * Creates a Puck plugin for version history
 *
 * Adds a "History" button to the plugin rail that opens a panel
 * showing version history with the ability to restore previous versions.
 *
 * @example
 * ```tsx
 * import { createVersionHistoryPlugin } from '@delmaredigital/payload-puck/editor'
 *
 * const versionPlugin = createVersionHistoryPlugin({
 *   pageId: 'page-123',
 *   apiEndpoint: '/api/puck/pages',
 *   onRestoreSuccess: () => markEditorClean(),
 * })
 *
 * <Puck plugins={[versionPlugin]} />
 * ```
 */
export declare function createVersionHistoryPlugin(options: VersionHistoryPluginOptions): Plugin;
//# sourceMappingURL=versionHistoryPlugin.d.ts.map