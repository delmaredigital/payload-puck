import type { ComponentAiOverrides } from '../../types.js'
import { colorSchema, alignmentSchema } from './schemas.js'

/**
 * Comprehensive AI instructions for typography components
 *
 * These instructions teach the AI:
 * - What each component is for
 * - Correct field names and values
 * - When to use each component
 * - How to compose them with other components
 */
export const typographyInstructions: ComponentAiOverrides = {
  Heading: {
    ai: {
      instructions: `Heading component for titles and section headings.

PURPOSE:
- Page titles, section headings, and subsection titles
- Establishes content hierarchy and structure
- Improves accessibility and SEO

USAGE GUIDELINES:
- Use h1 ONLY ONCE per page for the main page title (in the hero section)
- Use h2 for major section headings (Features, Testimonials, FAQ, etc.)
- Use h3 for subsection headings or card titles within sections
- Use h4-h6 rarely, only for deeply nested content

COMMON PATTERNS:
- Hero headline: h1 level, centered alignment
- Section title: h2 level, often centered
- Card/feature title: h3 level, left or center aligned
- Sidebar heading: h4 level

COMPOSITION:
- Place inside Section > Container for centered section headings
- Place inside Flex (column) for grouped text content
- Pair with Text component for headline + description combos`,
    },
    fields: {
      text: {
        ai: {
          required: true,
          instructions:
            'The heading text content. Keep headlines concise and impactful - typically 3-8 words for h1/h2, can be longer for h3+.',
        },
      },
      level: {
        ai: {
          instructions:
            'Heading level (h1-h6). Follow hierarchy: h1 once for page title, h2 for sections, h3 for subsections. Default: h2.',
        },
      },
      textColor: {
        ai: {
          instructions: `Optional text color. Use for emphasis or brand colors.
Example: { hex: '#3b82f6', opacity: 100 }`,
          schema: colorSchema,
        },
      },
      alignment: {
        ai: {
          instructions:
            "Text alignment: 'left', 'center', or 'right'. Use 'center' for hero/section headings, 'left' for content areas.",
          schema: alignmentSchema,
        },
      },
    },
  },

  Text: {
    ai: {
      instructions: `Text component for paragraphs and body content.

PURPOSE:
- Body text, descriptions, and supporting content
- Single paragraphs or short text blocks
- Subtitles and secondary text under headings

USAGE GUIDELINES:
- Use for 1-3 paragraphs of plain text
- For longer formatted content with lists/links, use RichText instead
- Size options: xs, sm, base (default), lg, xl

COMMON PATTERNS:
- Hero subtitle: lg or xl size, centered, below h1
- Section description: base size, centered, below h2
- Card description: sm or base size, left-aligned
- Feature text: base size, often paired with heading

COMPOSITION:
- Usually follows a Heading component
- Place inside Flex (column) with Heading for text blocks
- Place inside Card for card descriptions`,
    },
    fields: {
      content: {
        ai: {
          required: true,
          instructions:
            'The text content. Write clear, concise copy. Use line breaks for multiple paragraphs if needed.',
        },
      },
      size: {
        ai: {
          instructions:
            "Text size: 'xs', 'sm', 'base' (default), 'lg', 'xl'. Use 'lg' or 'xl' for hero subtitles, 'sm' for secondary text.",
        },
      },
      textColor: {
        ai: {
          instructions: `Optional text color. Use for emphasis or brand colors.
Example: { hex: '#64748b', opacity: 100 }`,
          schema: colorSchema,
        },
      },
      alignment: {
        ai: {
          instructions:
            "Text alignment: 'left', 'center', or 'right'. Match the alignment of the heading above it.",
          schema: alignmentSchema,
        },
      },
    },
  },

  RichText: {
    ai: {
      instructions: `RichText component - TipTap-powered rich text with advanced formatting.

PURPOSE:
- Long-form content with sophisticated formatting
- Content needing font sizes, colors, highlights
- Blog posts, about pages, formatted descriptions
- Any content needing more than plain text

USAGE GUIDELINES:
- Use RichText over Text when you need ANY formatting
- Supports font sizes from xs to 5xl
- Supports text colors with opacity
- Supports highlights/background colors
- Content is HTML with data attributes for styling

TIPTAP FEATURES AVAILABLE:
- Font sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl
- Text colors: Any hex color with opacity (via data attributes)
- Highlights: Background color highlights on text
- Formatting: bold, italic, underline, strikethrough
- Special: superscript, subscript
- Blocks: blockquotes, code blocks
- Lists: bullet lists, numbered lists
- Links: clickable hyperlinks

COMMON PATTERNS:
- Hero subtitle with large colorful text
- Feature descriptions with highlights
- Blog content with mixed formatting
- FAQ answers with styled callouts
- About page with branded text colors

HTML STRUCTURE:
- <p>Paragraph text</p>
- <p><span style="font-size:...">Sized text</span></p>
- <p><span style="color:...">Colored text</span></p>
- <p><mark>Highlighted text</mark></p>
- <ul><li>Bullet item</li></ul>
- <ol><li>Numbered item</li></ol>
- <blockquote>Quote text</blockquote>
- <pre><code>Code block</code></pre>
- <a href="url">Link text</a>
- <strong>Bold</strong>, <em>Italic</em>, <u>Underline</u>, <s>Strikethrough</s>
- <sup>Superscript</sup>, <sub>Subscript</sub>

COMPOSITION:
- Place inside Container for constrained width
- Use in Accordion items for formatted FAQ answers
- Combine with Section backgrounds for contrast`,
    },
    fields: {
      content: {
        ai: {
          required: true,
          schema: { type: 'string' },
          instructions: `HTML content for the TipTap rich text editor. Structure with proper HTML tags:
- <p>Paragraph text</p>
- <p><span style="font-size: 1.5rem">Large text</span></p>
- <p><span style="color: #3b82f6">Colored text</span></p>
- <ul><li>Bullet item</li></ul>
- <ol><li>Numbered item</li></ol>
- <blockquote>Quote</blockquote>
- <a href="url">Link text</a>
- <strong>Bold</strong>, <em>Italic</em>`,
        },
      },
    },
  },
}

/**
 * Typography component names for reference
 */
export const typographyComponents = ['Heading', 'Text', 'RichText'] as const
