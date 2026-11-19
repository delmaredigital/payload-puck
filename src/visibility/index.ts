/**
 * `@delmaredigital/payload-puck/visibility`: server-safe show/hide helpers.
 *
 * Every block can be Shown (the default) or Hidden, and can additionally be
 * hidden on chosen screen sizes. The setting lives on the block's own props;
 * a missing value means shown.
 *
 * No React or Puck runtime code, so it is safe to use from Payload hooks,
 * endpoints and other plugins on the server.
 *
 * This file is the public surface: only what the docs list is exported here.
 * Everything else lives in `./core.ts`, which no package export reaches.
 *
 * @example
 * ```ts
 * import { isBlockHidden, walkShownBlocks } from '@delmaredigital/payload-puck/visibility'
 *
 * walkShownBlocks(page.puckData, config, (block) => {
 *   if (block.type === 'Banner') banners.push(block.props.id)
 * })
 * ```
 */

export {
  SCREEN_SIZES,
  SCREEN_BREAKPOINTS,
  SCREEN_MEDIA_QUERIES,
  getBlockVisibility,
  isBlockHidden,
  isBlockHiddenOn,
  walkShownBlocks,
} from './core.js'

// Loading these types also loads the `blockVisibility` typing for component configs
export type {
  BlockLike,
  BlockVisibility,
  BlockVisibilityComponentOptions,
  ResolvedBlockVisibility,
  ScreenSize,
  WalkShownBlocksContext,
} from './core.js'
