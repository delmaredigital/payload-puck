import type { ComponentAiOverrides } from '../../types.js'
import {
  colorSchema,
  alignmentSchema,
  sizeSchema,
  transformSchema,
  backgroundSchema,
  borderSchema,
} from './schemas.js'

/**
 * Comprehensive AI instructions for interactive components
 *
 * These instructions teach the AI:
 * - Button, Card, Accordion, and Divider usage
 * - Correct field names and recommended values
 * - Common patterns and compositions
 */
export const interactiveInstructions: ComponentAiOverrides = {
  Button: {
    ai: {
      instructions: `Button component for calls-to-action and links.

PURPOSE:
- Primary and secondary call-to-action buttons
- Navigation links styled as buttons
- Form submission triggers (visual only - actual forms need implementation)

USAGE GUIDELINES:
- Use action-oriented text: "Get Started", "Learn More", "Contact Us", "Sign Up"
- Avoid generic text like "Click Here" or "Submit"
- Primary variant for main CTA, secondary/outline for supporting actions

VARIANTS:
- 'default': Primary button with filled background (use for main CTAs)
- 'secondary': Secondary styling (use for less important actions)
- 'outline': Bordered with transparent background (use for subtle actions)

SIZES:
- 'sm': Small, compact buttons
- 'default': Standard size (recommended for most uses)
- 'lg': Large, prominent buttons (hero CTAs)

COMMON PATTERNS:
- Hero CTA: Two buttons in Flex(row) - primary "Get Started" + outline "Learn More"
- Card CTA: Single button at bottom of card
- Section CTA: Centered button below section content
- Navigation: Multiple outline buttons in a row

COMPOSITION:
- Flex (row, gap: 16) > Button (default) + Button (outline) for button pairs
- Section > Flex (column, center) > Content + Button for section CTAs`,
    },
    fields: {
      text: {
        ai: {
          required: true,
          instructions:
            'Button text. Use action verbs: "Get Started", "Learn More", "Contact Us", "Sign Up", "Download Now".',
        },
      },
      link: {
        ai: {
          required: true,
          instructions:
            'URL the button links to. Use "#" as placeholder if URL is unknown. Use "/" for home, "/contact" for contact page, etc.',
        },
      },
      variant: {
        ai: {
          instructions:
            "'default' (primary, filled), 'secondary' (alternate style), 'outline' (bordered, transparent). Use 'default' for main CTAs.",
        },
      },
      size: {
        ai: {
          instructions: `Button size preset. Use 'lg' for hero buttons, 'default' elsewhere.
Example: { mode: 'lg' } or { mode: 'default' }`,
          schema: sizeSchema,
        },
      },
      openInNewTab: {
        ai: {
          instructions:
            "'yes' or 'no'. Use 'yes' for external links, 'no' for internal navigation.",
        },
      },
      alignment: {
        ai: {
          instructions:
            "'left', 'center', or 'right'. Typically 'center' for standalone buttons, 'left' in content areas.",
          schema: alignmentSchema,
        },
      },
      customBackgroundColor: {
        ai: {
          instructions: `Custom background color (overrides variant). Use sparingly.
Example: { hex: '#3b82f6', opacity: 100 }`,
          schema: colorSchema,
        },
      },
      customTextColor: {
        ai: {
          instructions: `Custom text color (overrides variant). Use sparingly.
Example: { hex: '#ffffff', opacity: 100 }`,
          schema: colorSchema,
        },
      },
      transform: {
        ai: {
          instructions: `CSS transforms for rotation, scale, etc. Usually leave unset.
Example: { rotate: 0, scaleX: 1, scaleY: 1, origin: 'center' }`,
          schema: transformSchema,
        },
      },
    },
  },

  Card: {
    ai: {
      instructions: `Card component for featured content blocks.

PURPOSE:
- Feature cards with image, title, and description
- Team member profiles
- Product or service highlights
- Testimonial cards
- Blog post previews

USAGE GUIDELINES:
- Always include a heading - it's the card's title
- Text is optional but recommended for context
- Image is optional but adds visual appeal
- Link makes the entire card clickable

COMMON PATTERNS:
- Feature Card: heading + text (no image for icon-style features)
- Team Card: image (avatar) + heading (name) + text (role/bio)
- Product Card: image + heading (product name) + text (description) + link
- Testimonial Card: text (quote) + heading (person name)
- Blog Card: image + heading (title) + text (excerpt) + link

STYLING:
- shadow: 'none', 'sm', 'md', 'lg', 'xl' - use 'md' for subtle elevation
- border: Optional border for flat design
- background: Optional custom background color

COMPOSITION:
- Grid (3 columns) > Card + Card + Card (feature grid)
- Grid (4 columns) > Card + Card + Card + Card (team grid)
- Flex (row) > Card + Card + Card (scrollable row)`,
    },
    fields: {
      heading: {
        ai: {
          required: true,
          instructions:
            'Card title. Keep concise - 2-5 words typically. For features: "Fast Performance". For team: "Jane Smith".',
        },
      },
      text: {
        ai: {
          instructions:
            'Card description. 1-3 sentences. For features: explain the benefit. For team: job title and brief bio.',
        },
      },
      image: {
        ai: {
          exclude: true,
          instructions: 'AI cannot select images from media library. Leave unset or provide alt text.',
        },
      },
      link: {
        ai: {
          instructions:
            'Optional URL to make card clickable. Use for blog posts, products, or "learn more" functionality.',
        },
      },
      openInNewTab: {
        ai: {
          instructions: "'yes' or 'no'. Use 'no' for internal links.",
        },
      },
      shadow: {
        ai: {
          instructions:
            "'none', 'sm', 'md', 'lg', 'xl'. Use 'md' for subtle elevation, 'lg' for prominent cards.",
        },
      },
      alignment: {
        ai: {
          instructions: "'left', 'center', or 'right'. Usually 'left' for cards.",
          schema: alignmentSchema,
        },
      },
      background: {
        ai: {
          instructions: `Custom background color for the card.
Example: { type: 'solid', solid: { hex: '#f8fafc' } }`,
          schema: backgroundSchema,
        },
      },
      border: {
        ai: {
          instructions: `Border styling for the card.
Example: { style: 'solid', width: 1, color: { hex: '#e5e7eb' }, radius: 12, sides: { top: true, right: true, bottom: true, left: true } }`,
          schema: borderSchema,
        },
      },
      transform: {
        ai: {
          instructions: `CSS transforms for rotation, scale, etc. Usually leave unset.
Example: { rotate: 0, scaleX: 1, scaleY: 1, origin: 'center' }`,
          schema: transformSchema,
        },
      },
    },
  },

  Accordion: {
    ai: {
      instructions: `Accordion component for collapsible content sections.

PURPOSE:
- FAQ (Frequently Asked Questions) sections
- Expandable feature lists
- Terms and conditions sections
- Step-by-step guides
- Collapsible documentation

USAGE GUIDELINES:
- Each item needs a title (question/header) and content (answer/body)
- Set defaultOpen: true for items that should be expanded initially
- Use allowMultiple: false for FAQ style (one open at a time)
- Use allowMultiple: true for reference/docs style (multiple can be open)

COMMON PATTERNS:
- FAQ Section: 5-10 items, allowMultiple: false
- Feature Details: 3-5 items explaining features in depth
- Pricing FAQ: Common billing/pricing questions
- Support/Help: Troubleshooting steps

ITEM STRUCTURE:
Each item in the items array needs:
- title: The clickable header (e.g., "How do I reset my password?")
- content: The expandable content (can be multiple paragraphs)
- defaultOpen: Boolean, whether expanded by default

COMPOSITION:
- Section > Container > Heading (h2 "FAQ") + Accordion
- Section > Flex (column) > Heading + Text + Accordion`,
    },
    fields: {
      items: {
        ai: {
          required: true,
          instructions: `Array of accordion items. Each item needs:
- title (string): The clickable header text
- content (string): The expandable body content
- defaultOpen (boolean): Whether to show expanded initially

Example: [
  { title: "What is your return policy?", content: "We offer 30-day returns...", defaultOpen: false },
  { title: "How do I contact support?", content: "Email us at support@...", defaultOpen: false }
]`,
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                defaultOpen: { type: 'boolean' },
              },
            },
          },
        },
      },
      allowMultiple: {
        ai: {
          instructions:
            "'yes' to allow multiple items open simultaneously, 'no' for FAQ-style (one at a time). Default: no.",
        },
      },
      textColor: {
        ai: {
          instructions: `Optional text color for accordion headers and content.
Example: { hex: '#1f2937', opacity: 100 }`,
          schema: colorSchema,
        },
      },
      transform: {
        ai: {
          instructions: `CSS transforms. Usually leave unset for accordions.`,
          schema: transformSchema,
        },
      },
    },
  },

  Divider: {
    ai: {
      instructions: `Divider component for horizontal line separators.

PURPOSE:
- Visual separation between content sections
- Breaking up long content areas
- Subtle section boundaries

USAGE GUIDELINES:
- Use sparingly - whitespace often works better
- Good for separating distinct content within a Section
- Not needed between Sections (use Section backgrounds instead)

STYLES:
- 'solid': Standard line (default)
- 'dashed': Dashed line (subtle, informal)
- 'dotted': Dotted line (decorative)

WHEN TO USE:
- Between paragraphs of distinct topics
- Above or below a quote/callout
- In footer to separate sections

WHEN NOT TO USE:
- Between page sections (use Section component backgrounds)
- Above every heading (use spacing instead)
- As decoration without purpose`,
    },
    fields: {
      style: {
        ai: {
          instructions: "'solid' (default), 'dashed', or 'dotted'.",
        },
      },
      color: {
        ai: {
          instructions: `Optional color for the divider line.
Example: { hex: '#e5e7eb', opacity: 100 }`,
          schema: colorSchema,
        },
      },
      transform: {
        ai: {
          instructions: `CSS transforms. Usually leave unset for dividers.`,
          schema: transformSchema,
        },
      },
    },
  },
}

/**
 * Interactive component names for reference
 */
export const interactiveComponents = ['Button', 'Card', 'Accordion', 'Divider'] as const
