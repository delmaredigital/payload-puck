/**
 * Page Patterns - System context for AI page generation
 *
 * This module provides comprehensive guidance on how to compose
 * components into complete pages and sections. This context is
 * injected into the AI system prompt to enable intelligent page generation.
 */

/**
 * Comprehensive page composition patterns for AI
 *
 * This string is intended to be added to the AI system context
 * to teach it how to build complete, well-structured pages.
 */
export const pagePatternContext = `
## Page Composition Guidelines

When creating pages, follow these patterns to build professional, well-structured layouts.

### Page Structure Fundamentals

EVERY page should be composed of multiple Section components at the root level:
- Pages are built by stacking Section components vertically
- Each Section represents a distinct content area
- Sections should NOT be nested inside other Sections
- Use Flex and Grid INSIDE Sections for layout

### Hero Section Pattern

The hero is typically the first section on a landing page.

STRUCTURE:
\`\`\`
Section (with sectionPadding, optional sectionBackground)
  └─ Flex (direction: column, alignItems: center, gap: 24)
      ├─ Heading (level: h1, alignment: center) - Main headline
      ├─ Text (size: lg, alignment: center) - Subheadline/description
      └─ Flex (direction: row, gap: 16, justifyContent: center) - CTA buttons
          ├─ Button (variant: default, size: lg) - Primary CTA
          └─ Button (variant: outline) - Secondary CTA
\`\`\`

VARIATIONS:
- Minimal: Just Heading + Button
- Standard: Heading + Text + Button(s)
- Full: Heading + Text + Buttons + Image below

### Features Section Pattern

Showcase features, services, or benefits.

STRUCTURE:
\`\`\`
Section (light or white background)
  ├─ Flex (direction: column, alignItems: center, gap: 16)
  │   ├─ Heading (level: h2, alignment: center) - Section title
  │   └─ Text (alignment: center) - Section description
  └─ Grid (numColumns: 3, gap: 24)
      ├─ Card (heading + text, no image)
      ├─ Card
      └─ Card
\`\`\`

VARIATIONS:
- 2 columns for comparison features
- 3 columns for standard features (most common)
- 4 columns for icon-style features

### Testimonials Section Pattern

Social proof with customer quotes.

STRUCTURE:
\`\`\`
Section (subtle background color for contrast)
  ├─ Heading (level: h2, alignment: center) - "What Our Customers Say"
  └─ Grid (numColumns: 2 or 3, gap: 24)
      ├─ Card (text: quote, heading: name + role)
      ├─ Card
      └─ Card
\`\`\`

### FAQ Section Pattern

Frequently asked questions with expandable answers.

STRUCTURE:
\`\`\`
Section
  └─ Container (for constrained width)
      ├─ Heading (level: h2, alignment: center) - "Frequently Asked Questions"
      └─ Accordion (items array with questions/answers)
\`\`\`

### CTA (Call-to-Action) Section Pattern

Final conversion section, often with contrasting background.

STRUCTURE:
\`\`\`
Section (contrasting sectionBackground color)
  └─ Flex (direction: column, alignItems: center, gap: 24)
      ├─ Heading (level: h2, alignment: center) - Compelling headline
      ├─ Text (alignment: center) - Supporting message
      └─ Button (variant: default, size: lg) - Single strong CTA
\`\`\`

### About Section Pattern

Company or personal introduction.

STRUCTURE:
\`\`\`
Section
  └─ Flex (direction: row, gap: 48, alignItems: center)
      ├─ Image (aspectRatio: 4:3) - Team photo or illustration
      └─ Flex (direction: column, gap: 16)
          ├─ Heading (level: h2)
          ├─ Text or RichText
          └─ Button (optional)
\`\`\`

### Team Section Pattern

Team members or leadership profiles.

STRUCTURE:
\`\`\`
Section
  ├─ Heading (level: h2, alignment: center) - "Meet Our Team"
  └─ Grid (numColumns: 3 or 4, gap: 24)
      ├─ Card (image: avatar, heading: name, text: role)
      ├─ Card
      ├─ Card
      └─ Card
\`\`\`

### Pricing Section Pattern

Pricing tiers or plans.

STRUCTURE:
\`\`\`
Section
  ├─ Flex (direction: column, alignItems: center)
  │   ├─ Heading (level: h2, alignment: center) - "Simple Pricing"
  │   └─ Text (alignment: center) - "Choose the plan that works for you"
  └─ Grid (numColumns: 3, gap: 24)
      ├─ Card (heading: plan name, text: price + features)
      ├─ Card (featured tier)
      └─ Card
\`\`\`

---

## Page Type Templates

### Landing Page Structure
1. Hero Section (headline, subheadline, CTA buttons)
2. Features Section (3-column grid of benefit cards)
3. About/How It Works Section (image + text side-by-side)
4. Testimonials Section (2-3 customer quotes)
5. FAQ Section (common questions in accordion)
6. CTA Section (final conversion push)

### About Page Structure
1. Hero Section (company name, mission statement)
2. Story Section (company history/journey)
3. Values Section (3-4 core values in cards)
4. Team Section (team member grid)
5. CTA Section (contact or join us)

### Services Page Structure
1. Hero Section (services overview)
2. Services Grid (3-4 service cards)
3. Process Section (how you work)
4. Testimonials (client success stories)
5. CTA Section (get started)

### Contact Page Structure
1. Hero Section (contact headline)
2. Contact Info Section (address, phone, email)
3. FAQ Section (common questions)

---

## Typography Hierarchy Rules

HEADING LEVELS:
- h1: Page title in hero (ONE per page maximum)
- h2: Major section headings
- h3: Card titles, subsection headings
- h4-h6: Rarely needed, for deeply nested content

TEXT SIZES:
- xl/lg: Hero subtitles, important callouts
- base: Body text, descriptions (default)
- sm: Secondary text, captions
- xs: Legal text, fine print

---

## Spacing Guidelines

SECTION PADDING (sectionPadding):
- Hero sections: 80-96px top/bottom
- Standard sections: 48-64px top/bottom
- Dense sections: 32-48px top/bottom

COMPONENT GAP:
- Tight: 8px (buttons in a compact row)
- Compact: 16px (related elements)
- Comfortable: 24px (card grids, flex items)
- Spacious: 32-48px (section content groups)

GRID GAP:
- Cards: 24px typical
- Compact grid: 16px
- Spacious grid: 32px

---

## Color & Background Strategy

Use sectionBackground to create visual hierarchy and professional appearance.

SECTION BACKGROUND PATTERNS:
- Hero Section: Dark or gradient background to create impact
- Features/Content: Light or white background
- Testimonials: Subtle contrasting background
- CTA Section: Brand color or contrasting background
- Alternating: Switch between white and light gray for visual rhythm

VISUAL RHYTHM:
- Alternate section backgrounds to create clear visual separation
- Hero sections typically have bold backgrounds (dark, gradient, or brand color)
- Content sections typically have light/white backgrounds
- CTA sections often use brand colors for emphasis

---

## Responsive Considerations

GRID BEHAVIOR:
- Grid automatically stacks to single column on mobile
- Plan content to work in both multi-column and stacked views

FLEX BEHAVIOR:
- Row layouts wrap on narrow screens
- Consider how button groups will stack

CONTENT WIDTH:
- Section content constrained to ~1200px max-width by default
- Text-heavy sections might use narrower (800-900px) constraint
`

/**
 * Condensed reference for component field names
 * Useful as a quick reference in AI context
 */
export const componentFieldReference = `
## Quick Field Reference

BUTTON: text (required), link (required), variant (default/secondary/outline), size (sm/default/lg), openInNewTab (yes/no)

CARD: heading (required), text, image (user selects), link, shadow (none/sm/md/lg/xl)

HEADING: text (required), level (h1-h6), alignment (left/center/right)

TEXT: content (required), size (xs/sm/base/lg/xl), alignment (left/center/right)

RICHTEXT: content (required, HTML string)

ACCORDION: items (array of {title, content, defaultOpen}), allowMultiple (yes/no)

SECTION: content (slot), semanticElement, id, sectionBackground, sectionPadding
  - sectionBackground: { type: 'solid', solid: { hex, opacity? } } or { type: 'gradient', gradient: { type, angle, stops } }
  - sectionPadding: { xs: { top, right, bottom, left, unit: 'px', linked: boolean } }

FLEX: content (slot), direction (row/column), justifyContent, alignItems, gap (number), wrap (wrap/nowrap)
  - justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between'
  - alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch'

GRID: content (slot), numColumns (1-12), gap (number)

SPACER: size (8/16/24/32/48/64/80/96/128), direction (vertical/horizontal/both)

DIVIDER: style (solid/dashed/dotted)

IMAGE: image (user selects), alt, aspectRatio (auto/1:1/16:9/4:3/3:2), link
`
