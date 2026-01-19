import type { Config as PuckConfig } from '@puckeditor/core';
import type { MergeConfigOptions } from '../types';
/**
 * Merges Puck configurations together
 *
 * @example
 * ```typescript
 * import { extendConfig, fullConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * const puckConfig = extendConfig({
 *   base: fullConfig,
 *   components: {
 *     CustomHero: myHeroConfig,
 *   },
 *   categories: {
 *     custom: { title: 'Custom', components: ['CustomHero'] },
 *   },
 *   exclude: ['CallToAction'], // Remove if not needed
 * })
 * ```
 */
export declare function mergeConfigs(options: MergeConfigOptions): PuckConfig;
//# sourceMappingURL=merge.d.ts.map