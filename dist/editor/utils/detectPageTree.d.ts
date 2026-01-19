import type { Config as PuckConfig } from '@puckeditor/core';
/**
 * Detects whether page-tree integration should be enabled.
 *
 * Detection priority:
 * 1. Explicit prop takes precedence (true/false)
 * 2. Auto-detect from config: checks if root.fields has both 'folder' and 'pageSegment'
 *
 * @param config - The Puck config to check
 * @param explicitProp - Optional explicit hasPageTree prop value
 * @returns Whether page-tree fields should be injected
 */
export declare function detectPageTree(config: PuckConfig, explicitProp?: boolean): boolean;
/**
 * Checks if a config already has page-tree fields configured.
 * Useful for determining if injectPageTreeFields would be redundant.
 *
 * @param config - The Puck config to check
 * @returns Whether the config already has page-tree fields
 */
export declare function hasPageTreeFields(config: PuckConfig): boolean;
//# sourceMappingURL=detectPageTree.d.ts.map