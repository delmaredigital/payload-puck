# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-01-14

### Breaking Changes

#### Puck 0.21 Package Scope Migration

Puck 0.21 introduced a breaking package scope change. All Puck packages have moved from `@measured/*` to `@puckeditor/*`.

**Peer dependency change:**
```json
// Before
"@measured/puck": ">=0.20.0"

// After
"@puckeditor/core": ">=0.21.0"
```

**Installation:**
```bash
# Before
pnpm add @delmaredigital/payload-puck @measured/puck

# After
pnpm add @delmaredigital/payload-puck @puckeditor/core
```

**Import changes for custom components:**
```typescript
// Before
import type { ComponentConfig } from '@measured/puck'

// After
import type { ComponentConfig } from '@puckeditor/core'
```

This plugin no longer supports Puck versions prior to 0.21.

### Added

#### Version History Plugin Rail

Version history has moved from a header dropdown to a dedicated plugin rail panel, utilizing Puck 0.21's new plugin rail API.

**What changed:**
- History icon now appears in the left plugin rail (alongside Blocks, Outline, Fields)
- Clicking opens a full sidebar panel instead of a dropdown
- Restore no longer triggers a page reload—uses Puck's `dispatch` to update editor state instantly
- Success message appears briefly after restore

**New exports:**
```typescript
import { createVersionHistoryPlugin } from '@delmaredigital/payload-puck/editor'

// For custom plugin configurations
const versionPlugin = createVersionHistoryPlugin({
  pageId: 'page-123',
  apiEndpoint: '/api/puck/pages',
  onRestoreSuccess: () => markEditorClean(),
})

<Puck plugins={[versionPlugin]} />
```

**Deprecations:**
- `VersionHistory` component export (use `createVersionHistoryPlugin` instead)
- `showVersionHistory` prop on `HeaderActions` (version history now lives in plugin rail)

#### Semantic HTML Elements

Layout components now support semantic HTML output for better SEO and accessibility. Each component has an "HTML Element" dropdown in the editor sidebar:

| Component | Available Elements |
|-----------|-------------------|
| **Section** | `section`, `article`, `aside`, `nav`, `header`, `footer`, `main`, `div` |
| **Flex** | `div`, `nav`, `ul`, `ol`, `aside`, `section` |
| **Container** | `div`, `article`, `aside`, `section` |
| **Grid** | `div`, `ul`, `ol` |

This enables proper document structure without wrapper elements:
- Use `<nav>` for navigation menus
- Use `<article>` for blog posts
- Use `<aside>` for sidebars
- Use `<ul>`/`<ol>` for list layouts

#### Full-Width Viewport Option

The editor now includes a "Full Width" (100%) viewport option alongside Mobile (360px), Tablet (768px), and Desktop (1280px). This helps preview how components behave at any viewport width.

#### Dynamic Accordion Defaults

The Accordion component now uses dynamic `defaultItemProps`:
- First item opens by default (`defaultOpen: true`)
- Items are numbered automatically ("Accordion Item 1", "Accordion Item 2", etc.)

#### ContentAlignmentField (D-Pad Positioning)

New visual 3x3 grid selector for content positioning within containers. Provides an intuitive d-pad style control for setting both horizontal and vertical alignment.

```typescript
import { createContentAlignmentField, alignmentToFlexCSS } from '@delmaredigital/payload-puck/fields'

const BannerConfig = {
  fields: {
    position: createContentAlignmentField({ label: 'Content Position' }),
  },
  render: ({ position }) => (
    <div style={{ display: 'flex', ...alignmentToFlexCSS(position) }}>
      {/* Content positioned at selected grid cell */}
    </div>
  ),
}
```

Helper functions:
- `alignmentToFlexCSS()` - For Flexbox containers
- `alignmentToGridCSS()` - For Grid containers
- `alignmentToPlaceSelfCSS()` - For individual grid items
- `alignmentToTailwind()` - Returns Tailwind classes

#### Unpublish Button

The editor header now includes an "Unpublish" link button that appears when viewing a published page. This allows reverting a published page back to draft status directly from the Puck editor, matching Payload's native document edit functionality.

#### Editor Stylesheet Injection

The Puck editor renders content in an iframe, which previously lacked access to your frontend CSS. New options enable stylesheet injection into the editor iframe:

**Plugin-level configuration:**
```typescript
createPuckPlugin({
  editorStylesheet: 'src/app/(frontend)/globals.css',  // Compiled with PostCSS/Tailwind
  editorStylesheetUrls: ['https://fonts.googleapis.com/...'],  // External stylesheets
})
```

This creates an endpoint at `/api/puck/styles` that compiles and serves your CSS (cached after first request).

**Component-level configuration:**
```typescript
<PuckConfigProvider
  config={editorConfig}
  editorStylesheets={['/api/puck/styles']}
  editorCss=":root { --custom: value; }"
/>

// Or per-layout in layout definitions
const layout: LayoutDefinition = {
  value: 'dark',
  editorStylesheets: ['/dark-theme.css'],
  editorCss: ':root { --background: #1a1a1a; }',
}
```

New props added to `PuckEditor`, `PuckConfigProvider`, and `LayoutDefinition`.

### Fixed

#### Server/Client Boundary Error

Fixed `getSizeClasses()` and `sizeValueToCSS()` being called from server components. These utilities have been moved to a server-safe module (`shared.ts`) to prevent the "Attempted to call client function from server" error when using the Button component with custom sizes in `PageRenderer`.

#### Publish Button Status

Fixed the Publish button not correctly setting `_status: 'published'` when publishing a draft page. The API now correctly omits the `draft` parameter when publishing to ensure Payload properly updates the document status.

#### Responsive Breakpoint Styles

Fixed responsive field styles not applying correctly at different breakpoints. Styles now properly cascade through Mobile, Tablet, and Desktop viewports.

#### Overflow Styling

Fixed overflow styling issues in layout components that could cause content clipping in certain configurations.

### Changed

- Internal imports updated from `@measured/puck` to `@puckeditor/core` (74 files)
- Plugin heading-analyzer import updated from `@measured/puck-plugin-heading-analyzer` to `@puckeditor/plugin-heading-analyzer`
- CSS import updated from `@measured/puck/puck.css` to `@puckeditor/core/puck.css`

### Notes

#### TipTap Implementation

This release evaluated Puck 0.21's built-in `richtext` field but retained the custom TipTap implementation. The custom implementation provides features not available in Puck's built-in:
- 9 font size presets with custom input
- Theme-aware color picker with opacity support
- Modal editing mode (full-screen expand)
- HTML source view/edit
- Auto-adapting colors for dark/light themes

The custom implementation uses standard TipTap packages (`@tiptap/react`, `@tiptap/starter-kit`, extensions) and official APIs—the customization is in the toolbar UI, not TipTap internals.

---

## [0.4.0] - 2026-01-12

### Breaking Changes

#### Unified PuckEditor Component

The editor component architecture has been simplified to a single `PuckEditor` component with built-in page-tree support.

**Removed exports:**
- `PuckEditorCore` - Use `PuckEditor` instead
- `PuckEditorClient` - Use `PuckEditor` instead

**Migration:**

```typescript
// Before
import { PuckEditorCore } from '@delmaredigital/payload-puck/editor'
// or
import { PuckEditorClient } from '@delmaredigital/payload-puck/client'

// After
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
// or
import { PuckEditor } from '@delmaredigital/payload-puck/client'
```

The new `PuckEditor` component:
- Accepts `config` prop directly OR reads from `PuckConfigProvider` context
- Includes built-in page-tree support via `hasPageTree` prop
- Handles all save/publish functionality
- Includes dynamic loading to prevent hydration mismatches

### Added

#### Page-Tree Props on PuckEditor

For custom editor UIs using page-tree integration:

```typescript
<PuckEditor
  config={editorConfig}
  pageId={page.id}
  initialData={page.puckData}
  pageTitle={page.title}
  pageSlug={page.slug}
  apiEndpoint="/api/puck/pages"
  hasPageTree={true}           // Enable page-tree fields
  folder={page.folder}         // Initial folder ID
  pageSegment={page.pageSegment} // Initial page segment
/>
```

#### New Utility Exports

Page-tree field injection utilities exported from `/client` and `/editor`:

```typescript
import { injectPageTreeFields, hasPageTreeFields } from '@delmaredigital/payload-puck/client'

// Check if config already has page-tree fields
if (!hasPageTreeFields(config)) {
  config = injectPageTreeFields(config)
}
```

### Changed

- `PuckEditor` now supports both direct `config` prop and context-based config
- `PuckEditorView` (RSC) now renders `PuckEditor` directly instead of `PuckEditorClient`
- Page-tree field injection moved into `PuckEditor` component

---

## [0.3.0] - 2026-01-09

### Breaking Changes

#### Payload Admin UI Integration

The Puck editor now runs inside Payload's admin UI using `DefaultTemplate`. This provides a native admin experience with proper navigation, permissions, and styling.

**Migration:**
- Remove custom editor routes (`app/(manage)/pages/[id]/edit/page.tsx`)
- Remove custom editor layouts
- The plugin now auto-registers the editor view at `/admin/puck-editor/:collection/:id`
- "Edit with Puck" buttons in Payload admin now navigate to the integrated editor

#### PuckConfigProvider Pattern

The Puck configuration is now provided via React context instead of being passed directly to components.

**Before:**
```tsx
// app/(manage)/pages/[id]/edit/page.tsx
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

<PuckEditor config={editorConfig} ... />
```

**After:**
```tsx
// app/(admin)/layout.tsx (or root layout)
import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

export default function Layout({ children }) {
  return (
    <PuckConfigProvider config={editorConfig}>
      {children}
    </PuckConfigProvider>
  )
}
```

The editor view automatically retrieves the config from context.

#### Build System Change

Migrated from tsup to tsc for simpler, more reliable builds.

- `tsup.config.ts` removed
- Build output structure unchanged
- No changes needed for consumers

### Added

#### Page-Tree Plugin Integration

Automatic integration with `@delmaredigital/payload-page-tree` when detected:

- **Auto-detection**: Checks if collection has `pageSegment` field (page-tree's signature)
- **Folder Picker Field**: Hierarchical folder selection in Puck sidebar
- **Page Segment Field**: Editable URL segment with live slugification
- **Slug Preview Field**: Read-only computed slug preview

When page-tree is active, the Puck editor sidebar shows:
```
Root Fields:
├── Page Title
├── Folder (picker dropdown with tree)
├── Page Segment (editable text, auto-slugified)
└── URL Slug (read-only preview)
```

**Configuration:**
```typescript
createPuckPlugin({
  // Auto-detect (default) - checks for pageSegment field
  pageTreeIntegration: undefined,

  // Explicitly enable with custom config
  pageTreeIntegration: {
    folderSlug: 'payload-folders',
    pageSegmentFieldName: 'pageSegment',
  },

  // Explicitly disable
  pageTreeIntegration: false,
})
```

#### New Field Exports

Three new custom Puck fields for page-tree integration:

```typescript
import {
  createFolderPickerField,
  createPageSegmentField,
  createSlugPreviewField,
} from '@delmaredigital/payload-puck/fields'

// Folder picker with hierarchical tree
const folderField = createFolderPickerField({
  label: 'Folder',
  folderSlug: 'payload-folders',
})

// Page segment with auto-slugification
const segmentField = createPageSegmentField({
  label: 'Page Segment',
})

// Read-only slug preview
const slugField = createSlugPreviewField({
  label: 'URL Slug',
  hint: 'Auto-generated from folder + page segment',
})
```

#### New Export Paths

- `@delmaredigital/payload-puck/client` - Client components including `PuckConfigProvider`
- `@delmaredigital/payload-puck/rsc` - React Server Component exports
- `@delmaredigital/payload-puck/admin/client` - Admin-specific client components

### Changed

- Editor view now uses `DefaultTemplate` from `@payloadcms/next/templates`
- API routes now support `folder` and `pageSegment` fields in save payload
- Folder picker includes "Manage folders" link to `/admin/page-tree`

### Fixed

- Folder picker dropdown now appears inline (fixed `position: relative`)
- Folder picker refreshes folder list when opened (catches newly created folders)
- "No folder" selection no longer breaks the dropdown

---

## [0.2.0] - 2026-01-09

### Breaking Changes

#### Section Component Redesign
The Section component now has a two-layer architecture for more powerful layout control:

- **Section layer** (outer, full-width): Controls the full-bleed background, border, padding, and margin
- **Content layer** (inner, constrained): Controls the content area with max-width, background, border, and padding

**Field renames:**
- `background` → `sectionBackground`
- `border` → `sectionBorder`
- `customPadding` → `sectionPadding`
- `margin` → `sectionMargin`

**New fields:**
- `contentDimensions` - Max-width, min-height for content area (default: 1200px centered)
- `contentBackground` - Background for the content area
- `contentBorder` - Border around the content area
- `contentPadding` - Padding inside the content area

**Removed fields:**
- `fullWidth` - No longer needed; set `contentDimensions` to full width instead

#### Container Component Simplified
The Container component has been simplified to a single-layer organizational wrapper:

**Removed fields:**
- `innerBackground` - Use Section for two-layer backgrounds
- `innerBorder` - Use Section for two-layer borders
- `innerPadding` - Now just `padding`

**Migration:** If you were using Container's inner/outer backgrounds, migrate to Section which now provides this functionality with clearer naming.

### Added

- Changelog file to track breaking changes and new features

### Fixed

- Slot/DropZone now expands to fill container's minHeight in the editor
- RichText component now fills available width (removed Tailwind prose max-width constraint)
- Removed hardcoded padding defaults across components; now properly set via defaultProps

### Changed

- Section component now provides full-bleed background with constrained content area out of the box
- Container component simplified for basic organizational use cases
- Better field grouping in the editor panel (Section styling → Content styling)
- Default content area max-width of 1200px makes the two-layer design immediately visible
