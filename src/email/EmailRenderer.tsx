/**
 * EmailRenderer - Server-safe React component for rendering Puck email data
 *
 * Wraps Puck's Render with email config.
 * For producing HTML strings, use renderToEmailHtml() instead.
 */

import { Render } from '@puckeditor/core'
import type { Config as PuckConfig, Data as PuckData } from '@puckeditor/core'
import { emailBaseConfig } from '../config/config.email.js'
import { withBlockVisibility } from '../visibility/withBlockVisibility.js'

export interface EmailRendererProps {
  data: PuckData
  config?: PuckConfig
}

/**
 * Renders Puck email data as React elements.
 * Server-safe — no hooks or client-side interactivity.
 */
export function EmailRenderer({
  data,
  config = emailBaseConfig,
}: EmailRendererProps) {
  if (!data || !data.content) {
    return null
  }

  // Email gets Shown/Hidden only: media queries are unreliable in email clients
  return <Render config={withBlockVisibility(config, { screenSizes: false })} data={data} />
}
