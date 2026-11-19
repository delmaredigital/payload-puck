/**
 * Email builder exports
 *
 * @example
 * ```tsx
 * import {
 *   emailBaseConfig,
 *   emailEditorConfig,
 *   renderToEmailHtml,
 *   EmailRenderer,
 * } from '@delmaredigital/payload-puck/email'
 * ```
 */

// Configs
export { emailBaseConfig } from '../config/config.email.js'
export { emailEditorConfig } from '../config/config.email.editor.js'

// Rendering
export { EmailRenderer } from './EmailRenderer.js'
export type { EmailRendererProps } from './EmailRenderer.js'
export { renderToEmailHtml } from './renderToEmailHtml.js'
// Show/hide for email blocks (Shown/Hidden only). The email renderers apply it.
export { withBlockVisibility } from '../visibility/withBlockVisibility.js'
export type { BlockVisibilityOptions, BlockVisibilityComponentOptions } from '../visibility/withBlockVisibility.js'
export type { RenderToEmailHtmlOptions } from './renderToEmailHtml.js'

// Document shell (for advanced customization)
export { getEmailDocumentParts, EMAIL_RESET_CSS } from './email-document.js'
export type { EmailDocumentOptions } from './email-document.js'

// Email utilities (for custom component authors)
export {
  TABLE_ATTRS,
  FULL_WIDTH_TABLE_STYLE,
  centeredTableStyle,
  emailAlign,
  alignmentToMargin,
  WEB_SAFE_FONTS,
  tiptapHtmlToEmailHtml,
  vmlBackgroundOpen,
  vmlBackgroundClose,
} from '../components/email/utils.js'
export type { WebSafeFont } from '../components/email/utils.js'
