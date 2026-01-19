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
export { createVersionHistoryPlugin, type VersionHistoryPluginOptions, } from './versionHistoryPlugin.js';
export { VersionHistoryPanel, type VersionHistoryPanelProps, type PageVersion, } from './VersionHistoryPanel.js';
//# sourceMappingURL=index.d.ts.map