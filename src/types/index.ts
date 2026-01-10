import type { Access, CollectionConfig, Config as PayloadConfig, Field } from 'payload'
import type { Config as PuckConfig, Data as PuckData } from '@measured/puck'
import type { ThemeConfig } from '../theme/types'
import type { LayoutDefinition, LayoutConfig } from '../layouts/types'

// =============================================================================
// Plugin Configuration Types
// =============================================================================

/**
 * Admin UI configuration for the Puck plugin
 */
export interface PuckAdminConfig {
  /**
   * Whether to add the visual editor button to the collection
   * @default true
   */
  addEditButton?: boolean

  /**
   * Custom URL pattern for the Puck editor (for backwards compatibility)
   * By default, the plugin uses the integrated admin view at /admin/puck-editor/:collection/:id
   * Use {id} as placeholder for document ID, {collection} for collection slug
   * @deprecated The editor is now integrated into Payload admin. Only use this for custom external editors.
   */
  editorPathPattern?: string

  /**
   * Button label text
   * @default 'Edit with Puck'
   */
  buttonLabel?: string

  /**
   * Position of the edit button in admin sidebar
   * @default 'sidebar'
   */
  buttonPosition?: 'sidebar' | 'main'
}

/**
 * Configuration options for the Puck plugin
 */
export interface PuckPluginOptions {
  /**
   * Collection slug for pages
   * @default 'pages'
   */
  pagesCollection?: string

  /**
   * Whether to auto-generate the Pages collection
   * Set to false if you want to define your own collection
   * @default true
   */
  autoGenerateCollection?: boolean

  /**
   * Custom collection config to merge with defaults
   */
  collectionOverrides?: Partial<CollectionConfig>

  /**
   * Access control for Puck operations
   * Uses Payload's Access type for full compatibility
   */
  access?: {
    read?: Access
    create?: Access
    update?: Access
    delete?: Access
  }

  /**
   * Page layout configuration
   * Define custom layouts that affect how page content is rendered
   * @default DEFAULT_LAYOUTS
   */
  layouts?: LayoutDefinition[]

  /**
   * Additional fields to add to the Pages collection
   */
  additionalFields?: Field[]

  /**
   * Admin UI configuration
   * Configure how the visual editor integrates with Payload admin
   */
  admin?: PuckAdminConfig

  /**
   * Theme configuration for customizing button styles, colors, and presets
   * All values are optional and will fall back to defaults
   */
  theme?: ThemeConfig

  /**
   * Whether to enable the integrated admin view
   * When enabled, the Puck editor is accessible at /admin/puck-editor/:collection/:id
   * @default true
   */
  enableAdminView?: boolean

  /**
   * Custom path for the admin view (without /admin prefix)
   * @default '/puck-editor'
   */
  adminViewPath?: string

  /**
   * Whether to enable built-in API endpoints
   * When enabled, endpoints are registered at /api/puck/:collection/:id
   * @default true
   */
  enableEndpoints?: boolean

  /**
   * Integration with @delmaredigital/payload-page-tree plugin
   *
   * **Auto-detection:** The Puck editor automatically detects if page-tree is active
   * by checking for the `pageSegment` field on the collection. No configuration needed
   * in most cases.
   *
   * Use this option only if you need to:
   * - Explicitly disable page-tree integration: `pageTreeIntegration: false`
   * - Override default field names if you customized page-tree config
   *
   * @example
   * ```typescript
   * // Usually not needed - auto-detected!
   * createPuckPlugin({
   *   pagesCollection: 'pages',
   * })
   *
   * // Override field names if customized:
   * createPuckPlugin({
   *   pageTreeIntegration: {
   *     folderSlug: 'my-folders',
   *     pageSegmentFieldName: 'urlSegment',
   *   },
   * })
   *
   * // Explicitly disable even if page-tree is present:
   * createPuckPlugin({
   *   pageTreeIntegration: false,
   * })
   * ```
   */
  pageTreeIntegration?: boolean | PageTreeIntegrationOptions
}

/**
 * Configuration options for page-tree integration
 */
export interface PageTreeIntegrationOptions {
  /**
   * Collection slug for folders
   * @default 'payload-folders'
   */
  folderSlug?: string

  /**
   * Field name for folder path segments
   * @default 'pathSegment'
   */
  segmentFieldName?: string

  /**
   * Field name for page segments
   * @default 'pageSegment'
   */
  pageSegmentFieldName?: string

  /**
   * Field name for the folder relationship
   * @default 'folder'
   */
  folderFieldName?: string
}

// =============================================================================
// Page Data Types
// =============================================================================

/**
 * Root properties for a Puck page
 */
export interface PuckRootProps {
  title?: string
  pageLayout?: string
  [key: string]: unknown
}

/**
 * Complete Puck page data structure
 */
export interface PuckPageData extends PuckData {
  root: {
    props: PuckRootProps
  }
}

/**
 * SEO/Meta configuration for a page.
 * Uses the official @payloadcms/plugin-seo convention.
 */
export interface PageMeta {
  title?: string
  description?: string
  image?: string | { id: string; url: string; alt?: string }
  noindex?: boolean
  nofollow?: boolean
  excludeFromSitemap?: boolean
}

/**
 * @deprecated Use PageMeta instead. This alias is kept for backwards compatibility.
 */
export type PageSEO = PageMeta

/**
 * Conversion type options
 */
export type ConversionType =
  | 'lead'
  | 'registration'
  | 'purchase'
  | 'donation'
  | 'newsletter'
  | 'contact'
  | 'custom'

/**
 * Conversion tracking configuration for a page
 */
export interface PageConversionTracking {
  isConversionPage?: boolean
  conversionType?: ConversionType
  conversionValue?: number
}

/**
 * Editor version options
 */
export type EditorVersion = 'legacy' | 'puck'

/**
 * Page document from Payload
 */
export interface PageDocument {
  id: string
  title: string
  slug: string
  pageLayout: string
  editorVersion?: EditorVersion
  isHomepage: boolean
  puckData: PuckPageData | null
  meta?: PageMeta
  conversionTracking?: PageConversionTracking
  createdAt: string
  updatedAt: string
  _status?: 'draft' | 'published'
  // Page-tree fields (when pageTreeIntegration is enabled)
  folder?: string | { id: string; name?: string; pathSegment?: string }
  pageSegment?: string
}

/**
 * Puck root props when page-tree integration is enabled
 */
export interface PageTreeRootProps extends PuckRootProps {
  folder?: string | null
  pageSegment?: string
}

// =============================================================================
// Component Types
// =============================================================================

/**
 * Shared props for all Puck components
 */
export interface SharedComponentProps {
  id?: string
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
  verticalPadding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  visibility?: 'always' | 'authenticated' | 'guest'
}

/**
 * Media object from Payload
 */
export interface MediaObject {
  id: string
  url: string
  alt?: string
  width?: number
  height?: number
  filename?: string
  mimeType?: string
  sizes?: {
    thumbnail?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  }
}

// =============================================================================
// Config Types
// =============================================================================

/**
 * Options for merging Puck configurations
 */
export interface MergeConfigOptions {
  /**
   * Base config to extend
   */
  base: PuckConfig

  /**
   * Additional components to add
   */
  components?: PuckConfig['components']

  /**
   * Additional categories to add/merge
   */
  categories?: PuckConfig['categories']

  /**
   * Root config overrides
   */
  root?: Partial<PuckConfig['root']>

  /**
   * Components to exclude from base
   */
  exclude?: string[]
}

// =============================================================================
// Field Types
// =============================================================================

/**
 * Props for the MediaField custom field
 */
export interface MediaFieldProps {
  value: MediaObject | string | null
  onChange: (value: MediaObject | string | null) => void
  label?: string
  allowedTypes?: string[]
}

/**
 * Props for the ColorPickerField custom field
 */
export interface ColorPickerFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  showOpacity?: boolean
}

/**
 * Props for the TiptapField custom field
 */
export interface TiptapFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  readOnly?: boolean
}

// =============================================================================
// Re-exports from Puck
// =============================================================================

export type { Config as PuckConfig, Data as PuckData } from '@measured/puck'
export type { ThemeConfig } from '../theme/types'

// =============================================================================
// Re-exports for Hybrid Integration
// =============================================================================

export type { GetPuckFieldsOptions } from '../plugin/fields/types'
