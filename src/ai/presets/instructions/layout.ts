import type { ComponentAiOverrides } from '../../types.js'
import {
  backgroundSchema,
  borderSchema,
  responsivePaddingSchema,
  responsiveDimensionsSchema,
  animationSchema,
  visibilitySchema,
  justifyContentSchema,
  alignItemsSchema,
} from './schemas.js'

/**
 * Comprehensive AI instructions for layout components
 *
 * These instructions teach the AI:
 * - When to use each layout component
 * - How to nest and compose layouts
 * - Correct field names and recommended values
 * - Common page structure patterns
 */

export const layoutInstructions: ComponentAiOverrides = {
  Section: {
    ai: {
      instructions: `Section component - the primary building block for page sections.

PURPOSE:
- Creates distinct page sections with full-width backgrounds
- Two-layer architecture: outer section (full-bleed) + inner content (constrained)
- Every major page section should be wrapped in a Section

ARCHITECTURE:
- Outer layer (section): Full viewport width, holds background color/image
- Inner layer (content): Constrained max-width, centered, holds actual content

USAGE GUIDELINES:
- Use Section as the outermost wrapper for every page section
- NEVER nest Section inside Flex or Grid (only at root level)
- Set sectionBackground for full-width colored backgrounds
- Use contentDimensions to control inner content width (default: 1200px)

COMMON PATTERNS:
- Hero Section: Dark/gradient sectionBackground, large sectionPadding
- Feature Section: Light/white background, medium padding
- CTA Section: Contrasting accent color background
- Alternating sections: Alternate background colors for visual rhythm

RECOMMENDED VALUES:
- sectionPadding: { xs: { top: 48, right: 0, bottom: 48, left: 0, unit: 'px', linked: false } } for standard sections
- sectionPadding: { xs: { top: 80, right: 0, bottom: 80, left: 0, unit: 'px', linked: false } } for hero sections
- contentDimensions: { xs: { mode: 'contained', maxWidth: { value: 1200, unit: 'px', enabled: true }, alignment: 'center' } }

COMPOSITION:
- Section > Container (for text-heavy content)
- Section > Flex (for grouped elements)
- Section > Grid (for card layouts)`,
    },
    fields: {
      content: {
        ai: {
          required: true,
          instructions:
            'Slot for child components. Add Container, Flex, Grid, or individual components here.',
        },
      },
      semanticElement: {
        ai: {
          instructions:
            "HTML element type. Use 'section' (default) for most cases, 'header' for page header, 'footer' for page footer, 'main' for primary content.",
        },
      },
      id: {
        ai: {
          instructions:
            'Optional ID for anchor links. Use lowercase-with-dashes format, e.g., "features", "about-us", "contact".',
        },
      },
      sectionBackground: {
        ai: {
          instructions: `Full-width background for the section. Supports solid colors and gradients.
Use for: Hero sections (dark/gradient), CTA sections (brand color), alternating section backgrounds.
Example solid: { type: 'solid', solid: { hex: '#1e293b' } }
Example gradient: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ color: { hex: '#3b82f6' }, position: 0 }, { color: { hex: '#8b5cf6' }, position: 100 }] } }`,
          schema: backgroundSchema,
        },
      },
      sectionPadding: {
        ai: {
          instructions: `Vertical/horizontal padding for the section. Controls breathing room.
Hero sections: 80-96px top/bottom. Standard sections: 48-64px. Dense: 32-48px.
Example: { xs: { top: 64, right: 0, bottom: 64, left: 0, unit: 'px', linked: false } }`,
          schema: responsivePaddingSchema,
        },
      },
      sectionMargin: {
        ai: {
          instructions: `Margin around the section. Usually leave null - use sectionPadding for internal spacing.`,
          schema: responsivePaddingSchema,
        },
      },
      contentDimensions: {
        ai: {
          instructions: `Inner content width constraints. Default is 1200px max-width centered.
Example: { xs: { mode: 'contained', maxWidth: { value: 1200, unit: 'px', enabled: true }, alignment: 'center' } }
Use narrower (800-900px) for text-heavy content like blog posts.`,
          schema: responsiveDimensionsSchema,
        },
      },
      contentBackground: {
        ai: {
          instructions: `Background for the inner content area (not full-width). Use for card-like treatments within sections.
Example: { type: 'solid', solid: { hex: '#ffffff' } }`,
          schema: backgroundSchema,
        },
      },
      contentPadding: {
        ai: {
          instructions: `Padding for the inner content area.
Example: { xs: { top: 24, right: 24, bottom: 24, left: 24, unit: 'px', linked: true } }`,
          schema: responsivePaddingSchema,
        },
      },
      contentBorder: {
        ai: {
          instructions: `Border for the inner content area. Use for card-like treatments.
Example: { style: 'solid', width: 1, color: { hex: '#e5e7eb' }, radius: 8, sides: { top: true, right: true, bottom: true, left: true } }`,
          schema: borderSchema,
        },
      },
      animation: {
        ai: {
          instructions: `Entrance animation for the section. Use sparingly for key sections like heroes.
Example: { mode: 'preset', entrance: 'fade-up', entranceDuration: 600, triggerOnScroll: true, triggerOnce: true }`,
          schema: animationSchema,
        },
      },
      visibility: {
        ai: {
          instructions: `Show/hide at different breakpoints.
Example: { xs: true, sm: true, md: true, lg: true, xl: true }`,
          schema: visibilitySchema,
        },
      },
    },
  },

  Container: {
    ai: {
      instructions: `Container component for grouping and constraining content width.

PURPOSE:
- Constrains content to a maximum width
- Groups related elements together
- Provides padding/margin around content blocks

USAGE GUIDELINES:
- Use inside Section when you need additional grouping
- Useful for text-heavy content that needs width constraints
- Not always needed - Section already constrains content width

WHEN TO USE:
- Long-form text content (blog posts, about page)
- When you need nested width constraints
- To add background/border to a content group within a Section

WHEN NOT TO USE:
- For simple layouts - Section alone is sufficient
- For card grids - use Grid instead
- For horizontal layouts - use Flex instead

COMPOSITION:
- Section > Container > Heading + Text (for centered text blocks)
- Section > Container > RichText (for long-form content)`,
    },
    fields: {
      content: {
        ai: {
          required: true,
          instructions: 'Slot for child components.',
        },
      },
      semanticElement: {
        ai: {
          instructions: "HTML element type: 'div' (default), 'article', 'aside', 'section'.",
        },
      },
      background: {
        ai: {
          instructions: `Background color, gradient, or image. Use for card-like content blocks or visual emphasis.
Example: { type: 'solid', solid: { hex: '#f8fafc' } }`,
          schema: backgroundSchema,
        },
      },
      border: {
        ai: {
          instructions: `Border styling. Use for card treatments or visual separation.
Example: { style: 'solid', width: 1, color: { hex: '#e5e7eb' }, radius: 12, sides: { top: true, right: true, bottom: true, left: true } }`,
          schema: borderSchema,
        },
      },
      padding: {
        ai: {
          instructions: `Internal padding.
Example: { xs: { top: 24, right: 24, bottom: 24, left: 24, unit: 'px', linked: true } }`,
          schema: responsivePaddingSchema,
        },
      },
      dimensions: {
        ai: {
          instructions: `Width/height constraints.
Example: { xs: { mode: 'contained', maxWidth: { value: 800, unit: 'px', enabled: true }, alignment: 'center' } }`,
          schema: responsiveDimensionsSchema,
        },
      },
      margin: {
        ai: {
          instructions: `Margin outside the container.
Example: { xs: { top: 0, right: 0, bottom: 24, left: 0, unit: 'px', linked: false } }`,
          schema: responsivePaddingSchema,
        },
      },
      animation: {
        ai: {
          instructions: `Entrance animation for the container. Use for key content blocks.
Example: { mode: 'preset', entrance: 'fade-up', entranceDuration: 500, triggerOnScroll: true, triggerOnce: true }`,
          schema: animationSchema,
        },
      },
      visibility: {
        ai: {
          instructions: `Show/hide at different breakpoints.
Example: { xs: true, sm: true, md: true, lg: true, xl: true }`,
          schema: visibilitySchema,
        },
      },
    },
  },

  Flex: {
    ai: {
      instructions: `Flex component for flexible row/column layouts.

PURPOSE:
- Horizontal or vertical arrangements of elements
- Button groups, icon rows, horizontal lists
- Centering and distributing content

USAGE GUIDELINES:
- Use direction: 'row' for horizontal layouts (buttons side-by-side)
- Use direction: 'column' for vertical stacking (heading + text + button)
- NEVER place Section inside Flex

COMMON PATTERNS:
- Button Group: Flex (row, gap: 16) > Button + Button
- Hero Content: Flex (column, center) > Heading + Text + Flex(row) with Buttons
- Feature Item: Flex (column) > Image + Heading + Text
- Navigation: Flex (row, space-between) > Logo + Flex(row) with nav links

RECOMMENDED VALUES:
- gap: 8 (tight), 16 (compact), 24 (comfortable), 32 (spacious)
- direction: 'row' for horizontal, 'column' for vertical
- justifyContent: 'center' (centered), 'space-between' (spread out)
- alignItems: 'center' (vertically centered in row mode)

COMPOSITION:
- Section > Flex (column, center) > Content (for centered section content)
- Flex (row) > Button + Button (for button groups)
- Grid > Flex (column) > Content (for grid item content)`,
    },
    fields: {
      content: {
        ai: {
          required: true,
          instructions: 'Slot for child components. Cannot contain Section components.',
        },
      },
      direction: {
        ai: {
          instructions: "'row' for horizontal layout, 'column' for vertical stacking. Default: row.",
        },
      },
      justifyContent: {
        ai: {
          instructions:
            "Controls horizontal distribution: 'flex-start', 'center', 'flex-end', 'space-between', 'space-around'.",
          schema: justifyContentSchema,
        },
      },
      alignItems: {
        ai: {
          instructions:
            "Controls vertical alignment: 'flex-start', 'center', 'flex-end', 'stretch'.",
          schema: alignItemsSchema,
        },
      },
      gap: {
        ai: {
          instructions: 'Space between items in pixels. Common values: 8, 16, 24, 32.',
        },
      },
      wrap: {
        ai: {
          instructions: "'wrap' allows items to wrap to new lines, 'nowrap' keeps them on one line.",
        },
      },
      semanticElement: {
        ai: {
          instructions: "'div' (default), 'nav' for navigation, 'ul'/'ol' for lists.",
        },
      },
      background: {
        ai: {
          instructions: `Background for the flex container. Use for grouped content with visual separation.
Example: { type: 'solid', solid: { hex: '#f1f5f9' } }`,
          schema: backgroundSchema,
        },
      },
      border: {
        ai: {
          instructions: `Border styling for the flex container.
Example: { style: 'solid', width: 1, color: { hex: '#e2e8f0' }, radius: 8, sides: { top: true, right: true, bottom: true, left: true } }`,
          schema: borderSchema,
        },
      },
      customPadding: {
        ai: {
          instructions: `Padding inside the flex container.
Example: { xs: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px', linked: true } }`,
          schema: responsivePaddingSchema,
        },
      },
      margin: {
        ai: {
          instructions: `Margin outside the flex container.
Example: { xs: { top: 0, right: 0, bottom: 24, left: 0, unit: 'px', linked: false } }`,
          schema: responsivePaddingSchema,
        },
      },
      dimensions: {
        ai: {
          instructions: `Width/height constraints for the flex container.
Example: { xs: { mode: 'contained', maxWidth: { value: 600, unit: 'px', enabled: true }, alignment: 'center' } }`,
          schema: responsiveDimensionsSchema,
        },
      },
      animation: {
        ai: {
          instructions: `Entrance animation for the flex container. Use for key content groups.
Example: { mode: 'preset', entrance: 'fade-up', entranceDuration: 500, triggerOnScroll: true, triggerOnce: true }`,
          schema: animationSchema,
        },
      },
      visibility: {
        ai: {
          instructions: `Show/hide at different breakpoints.
Example: { xs: true, sm: true, md: true, lg: true, xl: true }`,
          schema: visibilitySchema,
        },
      },
    },
  },

  Grid: {
    ai: {
      instructions: `Grid component for multi-column card/item layouts.

PURPOSE:
- Display items in a responsive grid
- Feature cards, team members, product listings
- Image galleries, testimonial grids

USAGE GUIDELINES:
- Use for 2-4 column layouts with equal-width items
- Grid automatically stacks to single column on mobile
- NEVER place Section inside Grid

COMMON PATTERNS:
- Feature Grid: Grid (3 columns) > Card + Card + Card
- Team Grid: Grid (4 columns) > Card + Card + Card + Card
- Pricing Grid: Grid (3 columns) > Card (pricing tier) x 3
- Gallery: Grid (2-3 columns) > Image + Image + Image

RECOMMENDED VALUES:
- numColumns: 2 (comparison), 3 (features/pricing), 4 (team/gallery)
- gap: 16 (tight), 24 (comfortable), 32 (spacious)

COMPOSITION:
- Section > Grid > Cards (for feature/team sections)
- Section > Heading + Grid > Items (for titled grid sections)`,
    },
    fields: {
      content: {
        ai: {
          required: true,
          instructions:
            'Slot for child components (usually Cards). Cannot contain Section components.',
        },
      },
      numColumns: {
        ai: {
          instructions: 'Number of columns (1-12). Common: 2, 3, or 4. Default: 3.',
        },
      },
      gap: {
        ai: {
          instructions: 'Space between grid items in pixels. Common: 16, 24, 32. Default: 16.',
        },
      },
      semanticElement: {
        ai: {
          instructions: "'div' (default), 'ul' or 'ol' for list semantics.",
        },
      },
      background: {
        ai: {
          instructions: `Background for the grid container. Use for grouped content with visual emphasis.
Example: { type: 'solid', solid: { hex: '#fafafa' } }`,
          schema: backgroundSchema,
        },
      },
      border: {
        ai: {
          instructions: `Border styling for the grid container.
Example: { style: 'solid', width: 1, color: { hex: '#e5e7eb' }, radius: 16, sides: { top: true, right: true, bottom: true, left: true } }`,
          schema: borderSchema,
        },
      },
      customPadding: {
        ai: {
          instructions: `Padding inside the grid container.
Example: { xs: { top: 24, right: 24, bottom: 24, left: 24, unit: 'px', linked: true } }`,
          schema: responsivePaddingSchema,
        },
      },
      margin: {
        ai: {
          instructions: `Margin outside the grid container.
Example: { xs: { top: 0, right: 0, bottom: 24, left: 0, unit: 'px', linked: false } }`,
          schema: responsivePaddingSchema,
        },
      },
      dimensions: {
        ai: {
          instructions: `Width/height constraints for the grid container.
Example: { xs: { mode: 'contained', maxWidth: { value: 1000, unit: 'px', enabled: true }, alignment: 'center' } }`,
          schema: responsiveDimensionsSchema,
        },
      },
      animation: {
        ai: {
          instructions: `Entrance animation for the grid container. Use for key content groups.
Example: { mode: 'preset', entrance: 'fade-up', entranceDuration: 500, triggerOnScroll: true, triggerOnce: true }`,
          schema: animationSchema,
        },
      },
      visibility: {
        ai: {
          instructions: `Show/hide at different breakpoints.
Example: { xs: true, sm: true, md: true, lg: true, xl: true }`,
          schema: visibilitySchema,
        },
      },
    },
  },

  Spacer: {
    ai: {
      instructions: `Spacer component for adding vertical/horizontal space.

PURPOSE:
- Add breathing room between components
- Create visual separation without borders
- Fine-tune spacing beyond component margins

USAGE GUIDELINES:
- Use sparingly - prefer component margin/padding when possible
- Good for adding extra space between sections or within sections
- Available sizes: 8, 16, 24, 32, 48, 64, 80, 96, 128 pixels

WHEN TO USE:
- Extra space between a heading and content
- Separation between distinct content groups
- When section padding alone isn't enough

WHEN NOT TO USE:
- Don't overuse - proper component spacing should suffice
- Not for separating sections (use Section padding instead)`,
    },
    fields: {
      size: {
        ai: {
          instructions:
            'Space in pixels: 8, 16, 24, 32 (small), 48, 64 (medium), 80, 96, 128 (large).',
        },
      },
      direction: {
        ai: {
          instructions: "'vertical' (default), 'horizontal', or 'both'.",
        },
      },
    },
  },
}

/**
 * Layout component names for reference
 */
export const layoutComponents = ['Section', 'Container', 'Flex', 'Grid', 'Spacer'] as const
