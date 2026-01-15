import type { ComponentAiOverrides } from '../../types.js'
import { alignmentSchema, transformSchema } from './schemas.js'

/**
 * Comprehensive AI instructions for media components
 *
 * These instructions teach the AI:
 * - Image and Template component usage
 * - Limitations (AI cannot select from media library)
 * - When and how to use these components
 */
export const mediaInstructions: ComponentAiOverrides = {
  Image: {
    ai: {
      instructions: `Image component for displaying images from the media library.

PURPOSE:
- Hero background images
- Feature illustrations
- Product photos
- Team member avatars
- Gallery images

IMPORTANT LIMITATION:
AI cannot select actual images from the media library. When generating pages:
- The Image component can be placed in the layout
- Users must manually select the image from the media library afterward
- AI can suggest appropriate alt text describing what image should be there

ASPECT RATIOS:
- 'auto': Original image proportions
- '1:1': Square (avatars, product thumbnails)
- '16:9': Widescreen (hero images, video thumbnails)
- '4:3': Traditional (photos, cards)
- '3:2': Photography standard

USAGE PATTERNS:
- Hero Image: 16:9 ratio, full width
- Team Avatar: 1:1 ratio, smaller dimensions
- Product Photo: 4:3 or 1:1 ratio
- Gallery Image: auto or 4:3 ratio

COMPOSITION:
- Section > Image (for full-width hero images)
- Card > Image (automatically uses card's image field)
- Grid > Image + Image + Image (for galleries)
- Flex (row) > Image + Content (for side-by-side layouts)`,
    },
    fields: {
      image: {
        ai: {
          exclude: true,
          instructions:
            'AI cannot select images from media library. Leave this for users to fill in.',
        },
      },
      alt: {
        ai: {
          instructions:
            'Descriptive alt text for accessibility. Describe what the image should show, e.g., "Team members collaborating in modern office".',
        },
      },
      aspectRatio: {
        ai: {
          instructions:
            "'auto', '1:1' (square), '16:9' (widescreen), '4:3' (traditional), '3:2' (photo). Use '16:9' for hero images, '1:1' for avatars.",
        },
      },
      link: {
        ai: {
          instructions: 'Optional URL to make image clickable.',
        },
      },
      openInNewTab: {
        ai: {
          instructions: "'yes' or 'no'. Only relevant if link is provided.",
        },
      },
      alignment: {
        ai: {
          instructions: "'left', 'center' (default), or 'right'.",
          schema: alignmentSchema,
        },
      },
      transform: {
        ai: {
          instructions: `CSS transforms. Usually leave unset for images.`,
          schema: transformSchema,
        },
      },
    },
  },

  Template: {
    ai: {
      instructions: `Template component for inserting saved page templates.

PURPOSE:
- Reuse common page sections across pages
- Insert pre-built layouts
- Maintain consistency across pages

IMPORTANT LIMITATION:
AI cannot select actual templates from the template library. When generating pages:
- The Template component can be placed in the layout
- Users must manually select the template afterward
- Consider building sections directly instead of using Template placeholders

WHEN TO USE:
- When a pre-built section exists that matches the need
- For complex layouts that have been saved as templates
- For maintaining brand consistency

WHEN NOT TO USE:
- When building a custom section is more appropriate
- When the needed layout doesn't exist as a template
- For simple sections that can be built quickly

RECOMMENDATION:
In most cases, build sections directly using Section, Flex, Grid, and other components
rather than relying on Template placeholders that users must configure later.`,
    },
    fields: {
      templateId: {
        ai: {
          exclude: true,
          instructions:
            'AI cannot select templates from the library. Leave for users to fill in.',
        },
      },
      content: {
        ai: {
          instructions: 'Slot for template content. Usually auto-populated from selected template.',
        },
      },
    },
  },
}

/**
 * Media component names for reference
 */
export const mediaComponents = ['Image', 'Template'] as const
