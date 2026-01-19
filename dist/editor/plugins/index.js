/**
 * Puck plugins re-exported for easy consumption
 *
 * @example
 * ```tsx
 * import { PuckEditor, headingAnalyzer, createVersionHistoryPlugin } from '@delmaredigital/payload-puck/editor'
 *
 * const versionPlugin = createVersionHistoryPlugin({ pageId: 'page-123' })
 * <PuckEditor plugins={[headingAnalyzer, versionPlugin]} />
 * ```
 */
export { default as headingAnalyzer } from '@puckeditor/plugin-heading-analyzer';
// Version History plugin for plugin rail
export { createVersionHistoryPlugin, } from './versionHistoryPlugin.js';
export { VersionHistoryPanel, } from './VersionHistoryPanel.js';
//# sourceMappingURL=index.js.map