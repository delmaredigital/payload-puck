import type { Config as PuckConfig } from '@puckeditor/core';
/**
 * Injects page-tree fields (folder, pageSegment, slug) into a Puck config's root fields.
 * Replaces any existing slug field with the page-tree slug preview.
 *
 * @param config - The base Puck config to enhance
 * @returns A new config with page-tree fields injected into root.fields
 */
export declare function injectPageTreeFields(config: PuckConfig): PuckConfig;
//# sourceMappingURL=injectPageTreeFields.d.ts.map