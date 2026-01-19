/**
 * Server-safe Puck configuration
 *
 * This config is safe for server-side rendering and should be used
 * with the PageRenderer component.
 */
import type { Config as PuckConfig } from '@puckeditor/core';
import { type LayoutDefinition } from '../layouts';
/**
 * Creates a Puck configuration with custom layouts
 *
 * @param layouts - Custom layout definitions
 * @returns Puck configuration with the specified layouts
 *
 * @example
 * ```tsx
 * import { createConfig, DEFAULT_LAYOUTS, createLayout } from '@delmaredigital/payload-puck/config'
 *
 * const customConfig = createConfig([
 *   ...DEFAULT_LAYOUTS,
 *   createLayout({
 *     value: 'blog',
 *     label: 'Blog Post',
 *     maxWidth: '720px',
 *   }),
 * ])
 * ```
 */
export declare function createConfig(layouts?: LayoutDefinition[]): PuckConfig;
/**
 * Base Puck configuration with server-safe component configs
 *
 * All components have server-safe versions (.server.tsx) that render
 * without client-side interactivity. Use editorConfig from ./config.editor
 * for the full interactive editor experience.
 *
 * For custom layouts, use createConfig() instead.
 */
export declare const baseConfig: PuckConfig;
export { mergeConfigs, mergeConfigs as extendConfig } from './merge';
export { DEFAULT_LAYOUTS, createLayout, type LayoutDefinition } from '../layouts';
export type { ServerComponentConfig, ServerRootConfig, SlotField } from './types';
//# sourceMappingURL=index.d.ts.map