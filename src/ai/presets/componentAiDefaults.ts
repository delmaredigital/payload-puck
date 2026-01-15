import type { ComponentAiOverrides } from '../types.js'

/**
 * Default AI configurations for built-in payload-puck components
 *
 * These provide sensible defaults that help the AI understand how to use
 * each component effectively. Users can override or extend these.
 *
 * NOTE: Custom fields (type: 'custom') are automatically excluded by injectAiConfig.
 * This includes: _reset, visibility, background, media, animation, padding, margin,
 * border, dimensions, transform, alignment fields, etc.
 *
 * @example Using defaults
 * ```typescript
 * import { injectAiConfig, defaultComponentAiConfig } from '@delmaredigital/payload-puck/ai'
 *
 * const aiEnabledConfig = injectAiConfig(editorConfig, defaultComponentAiConfig)
 * ```
 *
 * @example Extending defaults
 * ```typescript
 * const customAiConfig = {
 *   ...defaultComponentAiConfig,
 *   Heading: {
 *     ...defaultComponentAiConfig.Heading,
 *     ai: {
 *       instructions: 'Use our brand voice',
 *     },
 *   },
 * }
 * ```
 */
export const defaultComponentAiConfig: ComponentAiOverrides = {
  // Typography Components
  Heading: {
    ai: {
      instructions:
        'Use for section headings and titles. Choose appropriate heading level (h1-h6) based on document structure.',
    },
    fields: {
      text: {
        ai: { required: true },
      },
      level: {
        ai: {
          instructions:
            'Use h1 only once per page for the main title. Use h2 for main sections, h3 for subsections.',
        },
      },
    },
  },

  Text: {
    ai: {
      instructions: 'Use for body text and single paragraphs.',
    },
    fields: {
      content: {
        ai: { required: true },
      },
    },
  },

  RichText: {
    ai: {
      instructions:
        'Use for formatted text content with multiple paragraphs, lists, links, or other rich formatting.',
    },
    fields: {
      content: {
        ai: {
          required: true,
          // TipTap content is complex, provide schema hint
          schema: { type: 'string' },
          instructions: 'Provide HTML content for the rich text editor.',
        },
      },
    },
  },

  // Interactive Components
  Button: {
    ai: {
      instructions:
        'Use for call-to-action buttons. Always provide meaningful, action-oriented button text.',
    },
    fields: {
      label: {
        ai: {
          required: true,
          instructions:
            'Use action-oriented text like "Get Started", "Learn More", "Sign Up", "Contact Us".',
        },
      },
      href: {
        ai: {
          required: true,
          instructions: 'Use # as placeholder if the actual URL is unknown.',
        },
      },
      variant: {
        ai: {
          instructions:
            'Use "primary" for main CTAs, "secondary" for less prominent actions, "outline" for subtle actions.',
        },
      },
    },
  },

  // Media Components
  Image: {
    ai: {
      instructions:
        'Use for displaying images. Note: AI cannot select actual images from the media library.',
    },
    fields: {
      alt: {
        ai: {
          instructions:
            'Provide descriptive alt text for accessibility. Describe what the image shows.',
        },
      },
    },
  },

  // Layout Components
  Section: {
    ai: {
      instructions:
        'Use to group related content into a section. Sections can have background colors and padding.',
    },
  },

  Container: {
    ai: {
      instructions:
        'Use to constrain content width and center it on the page. Good for text-heavy sections.',
    },
  },

  Flex: {
    ai: {
      instructions:
        'Use for horizontal or vertical layouts with flexible spacing between items.',
    },
    fields: {
      direction: {
        ai: {
          instructions: 'Use "row" for horizontal layout, "column" for vertical stacking.',
        },
      },
      gap: {
        ai: {
          instructions: 'Set spacing between items. Common values: 8, 16, 24, 32.',
        },
      },
    },
  },

  Grid: {
    ai: {
      instructions: 'Use for multi-column layouts. Specify the number of columns.',
    },
    fields: {
      columns: {
        ai: {
          instructions:
            'Use 2-4 columns for most layouts. 12-column grid for advanced layouts.',
        },
      },
    },
  },

  // Content Components
  Card: {
    ai: {
      instructions:
        'Use for content cards with optional image, title, and description. Good for feature lists, team members, products.',
    },
    fields: {
      title: {
        ai: { required: true },
      },
      description: {
        ai: {
          instructions: 'Keep descriptions concise, 1-2 sentences.',
        },
      },
    },
  },

  Accordion: {
    ai: {
      instructions:
        'Use for FAQ sections or collapsible content. Each item has a title and expandable content.',
    },
    fields: {
      items: {
        ai: {
          required: true,
          instructions: 'Provide an array of items with title and content properties.',
        },
      },
    },
  },

  // Utility Components
  Spacer: {
    ai: {
      instructions:
        'Use to add vertical spacing between elements. Specify height in pixels.',
    },
    fields: {
      height: {
        ai: {
          instructions: 'Common values: 16, 24, 32, 48, 64. Use larger values for section breaks.',
        },
      },
    },
  },

  Divider: {
    ai: {
      instructions:
        'Use to visually separate sections of content with a horizontal line.',
    },
  },

  // Template Component
  Template: {
    ai: {
      instructions:
        'Use to insert a saved page template. Note: AI cannot select actual templates.',
    },
  },
}

/**
 * Minimal AI configuration for components
 *
 * Use this for a lighter-weight configuration that only marks
 * required fields. Custom fields are still auto-excluded by injectAiConfig.
 */
export const minimalComponentAiConfig: ComponentAiOverrides = {
  Heading: {
    fields: {
      text: { ai: { required: true } },
    },
  },
  Text: {
    fields: {
      content: { ai: { required: true } },
    },
  },
  RichText: {
    fields: {
      content: {
        ai: {
          required: true,
          schema: { type: 'string' },
        },
      },
    },
  },
  Button: {
    fields: {
      label: { ai: { required: true } },
      href: { ai: { required: true } },
    },
  },
}
