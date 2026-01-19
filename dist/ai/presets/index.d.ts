/**
 * AI Preset Configurations
 *
 * This module exports comprehensive AI instructions for Puck components
 * and page composition patterns.
 *
 * @example Using comprehensive config (recommended)
 * ```typescript
 * import { comprehensiveComponentAiConfig } from '@delmaredigital/payload-puck/ai'
 * import { injectAiConfig } from '@delmaredigital/payload-puck/ai'
 *
 * const aiEnabledConfig = injectAiConfig(editorConfig, comprehensiveComponentAiConfig)
 * ```
 *
 * @example Adding page pattern context to AI system prompt
 * ```typescript
 * import { pagePatternSystemContext } from '@delmaredigital/payload-puck/ai'
 *
 * createPuckAiApiRoutes({
 *   ai: {
 *     context: `${yourBusinessContext}\n\n${pagePatternSystemContext}`,
 *   },
 * })
 * ```
 */
import type { ComponentAiOverrides } from '../types.js';
import { pagePatternContext, componentFieldReference } from './instructions/pagePatterns.js';
export { defaultComponentAiConfig, minimalComponentAiConfig, } from './componentAiDefaults.js';
/**
 * Comprehensive AI configuration for all built-in components
 *
 * Combines detailed instructions from all component categories:
 * - Typography: Heading, Text, RichText
 * - Layout: Section, Container, Flex, Grid, Spacer
 * - Interactive: Button, Card, Accordion, Divider
 * - Media: Image, Template
 *
 * Each component includes:
 * - Purpose and usage guidelines
 * - Correct field names and recommended values
 * - Composition patterns with other components
 * - Common mistakes to avoid
 */
export declare const comprehensiveComponentAiConfig: ComponentAiOverrides;
/**
 * System context string for AI page generation
 *
 * Contains comprehensive guidance on:
 * - Page structure patterns (hero, features, testimonials, FAQ, CTA)
 * - Page type templates (landing, about, services, contact)
 * - Typography hierarchy rules
 * - Spacing and color guidelines
 * - Responsive considerations
 *
 * Add this to your AI context for better page generation:
 *
 * @example
 * ```typescript
 * createPuckAiApiRoutes({
 *   ai: {
 *     context: `${yourBusinessContext}\n\n${pagePatternSystemContext}`,
 *   },
 * })
 * ```
 */
export declare const pagePatternSystemContext = "\n## Page Composition Guidelines\n\nWhen creating pages, follow these patterns to build professional, well-structured layouts.\n\n### Page Structure Fundamentals\n\nEVERY page should be composed of multiple Section components at the root level:\n- Pages are built by stacking Section components vertically\n- Each Section represents a distinct content area\n- Sections should NOT be nested inside other Sections\n- Use Flex and Grid INSIDE Sections for layout\n\n### Hero Section Pattern\n\nThe hero is typically the first section on a landing page.\n\nSTRUCTURE:\n```\nSection (with sectionPadding, optional sectionBackground)\n  \u2514\u2500 Flex (direction: column, alignItems: center, gap: 24)\n      \u251C\u2500 Heading (level: h1, alignment: center) - Main headline\n      \u251C\u2500 Text (size: lg, alignment: center) - Subheadline/description\n      \u2514\u2500 Flex (direction: row, gap: 16, justifyContent: center) - CTA buttons\n          \u251C\u2500 Button (variant: default, size: lg) - Primary CTA\n          \u2514\u2500 Button (variant: outline) - Secondary CTA\n```\n\nVARIATIONS:\n- Minimal: Just Heading + Button\n- Standard: Heading + Text + Button(s)\n- Full: Heading + Text + Buttons + Image below\n\n### Features Section Pattern\n\nShowcase features, services, or benefits.\n\nSTRUCTURE:\n```\nSection (light or white background)\n  \u251C\u2500 Flex (direction: column, alignItems: center, gap: 16)\n  \u2502   \u251C\u2500 Heading (level: h2, alignment: center) - Section title\n  \u2502   \u2514\u2500 Text (alignment: center) - Section description\n  \u2514\u2500 Grid (numColumns: 3, gap: 24)\n      \u251C\u2500 Card (heading + text, no image)\n      \u251C\u2500 Card\n      \u2514\u2500 Card\n```\n\nVARIATIONS:\n- 2 columns for comparison features\n- 3 columns for standard features (most common)\n- 4 columns for icon-style features\n\n### Testimonials Section Pattern\n\nSocial proof with customer quotes.\n\nSTRUCTURE:\n```\nSection (subtle background color for contrast)\n  \u251C\u2500 Heading (level: h2, alignment: center) - \"What Our Customers Say\"\n  \u2514\u2500 Grid (numColumns: 2 or 3, gap: 24)\n      \u251C\u2500 Card (text: quote, heading: name + role)\n      \u251C\u2500 Card\n      \u2514\u2500 Card\n```\n\n### FAQ Section Pattern\n\nFrequently asked questions with expandable answers.\n\nSTRUCTURE:\n```\nSection\n  \u2514\u2500 Container (for constrained width)\n      \u251C\u2500 Heading (level: h2, alignment: center) - \"Frequently Asked Questions\"\n      \u2514\u2500 Accordion (items array with questions/answers)\n```\n\n### CTA (Call-to-Action) Section Pattern\n\nFinal conversion section, often with contrasting background.\n\nSTRUCTURE:\n```\nSection (contrasting sectionBackground color)\n  \u2514\u2500 Flex (direction: column, alignItems: center, gap: 24)\n      \u251C\u2500 Heading (level: h2, alignment: center) - Compelling headline\n      \u251C\u2500 Text (alignment: center) - Supporting message\n      \u2514\u2500 Button (variant: default, size: lg) - Single strong CTA\n```\n\n### About Section Pattern\n\nCompany or personal introduction.\n\nSTRUCTURE:\n```\nSection\n  \u2514\u2500 Flex (direction: row, gap: 48, alignItems: center)\n      \u251C\u2500 Image (aspectRatio: 4:3) - Team photo or illustration\n      \u2514\u2500 Flex (direction: column, gap: 16)\n          \u251C\u2500 Heading (level: h2)\n          \u251C\u2500 Text or RichText\n          \u2514\u2500 Button (optional)\n```\n\n### Team Section Pattern\n\nTeam members or leadership profiles.\n\nSTRUCTURE:\n```\nSection\n  \u251C\u2500 Heading (level: h2, alignment: center) - \"Meet Our Team\"\n  \u2514\u2500 Grid (numColumns: 3 or 4, gap: 24)\n      \u251C\u2500 Card (image: avatar, heading: name, text: role)\n      \u251C\u2500 Card\n      \u251C\u2500 Card\n      \u2514\u2500 Card\n```\n\n### Pricing Section Pattern\n\nPricing tiers or plans.\n\nSTRUCTURE:\n```\nSection\n  \u251C\u2500 Flex (direction: column, alignItems: center)\n  \u2502   \u251C\u2500 Heading (level: h2, alignment: center) - \"Simple Pricing\"\n  \u2502   \u2514\u2500 Text (alignment: center) - \"Choose the plan that works for you\"\n  \u2514\u2500 Grid (numColumns: 3, gap: 24)\n      \u251C\u2500 Card (heading: plan name, text: price + features)\n      \u251C\u2500 Card (featured tier)\n      \u2514\u2500 Card\n```\n\n---\n\n## Page Type Templates\n\n### Landing Page Structure\n1. Hero Section (headline, subheadline, CTA buttons)\n2. Features Section (3-column grid of benefit cards)\n3. About/How It Works Section (image + text side-by-side)\n4. Testimonials Section (2-3 customer quotes)\n5. FAQ Section (common questions in accordion)\n6. CTA Section (final conversion push)\n\n### About Page Structure\n1. Hero Section (company name, mission statement)\n2. Story Section (company history/journey)\n3. Values Section (3-4 core values in cards)\n4. Team Section (team member grid)\n5. CTA Section (contact or join us)\n\n### Services Page Structure\n1. Hero Section (services overview)\n2. Services Grid (3-4 service cards)\n3. Process Section (how you work)\n4. Testimonials (client success stories)\n5. CTA Section (get started)\n\n### Contact Page Structure\n1. Hero Section (contact headline)\n2. Contact Info Section (address, phone, email)\n3. FAQ Section (common questions)\n\n---\n\n## Typography Hierarchy Rules\n\nHEADING LEVELS:\n- h1: Page title in hero (ONE per page maximum)\n- h2: Major section headings\n- h3: Card titles, subsection headings\n- h4-h6: Rarely needed, for deeply nested content\n\nTEXT SIZES:\n- xl/lg: Hero subtitles, important callouts\n- base: Body text, descriptions (default)\n- sm: Secondary text, captions\n- xs: Legal text, fine print\n\n---\n\n## Spacing Guidelines\n\nSECTION PADDING (sectionPadding):\n- Hero sections: 80-96px top/bottom\n- Standard sections: 48-64px top/bottom\n- Dense sections: 32-48px top/bottom\n\nCOMPONENT GAP:\n- Tight: 8px (buttons in a compact row)\n- Compact: 16px (related elements)\n- Comfortable: 24px (card grids, flex items)\n- Spacious: 32-48px (section content groups)\n\nGRID GAP:\n- Cards: 24px typical\n- Compact grid: 16px\n- Spacious grid: 32px\n\n---\n\n## Color & Background Strategy\n\nUse sectionBackground to create visual hierarchy and professional appearance.\n\nSECTION BACKGROUND PATTERNS:\n- Hero Section: Dark or gradient background to create impact\n- Features/Content: Light or white background\n- Testimonials: Subtle contrasting background\n- CTA Section: Brand color or contrasting background\n- Alternating: Switch between white and light gray for visual rhythm\n\nVISUAL RHYTHM:\n- Alternate section backgrounds to create clear visual separation\n- Hero sections typically have bold backgrounds (dark, gradient, or brand color)\n- Content sections typically have light/white backgrounds\n- CTA sections often use brand colors for emphasis\n\n---\n\n## Responsive Considerations\n\nGRID BEHAVIOR:\n- Grid automatically stacks to single column on mobile\n- Plan content to work in both multi-column and stacked views\n\nFLEX BEHAVIOR:\n- Row layouts wrap on narrow screens\n- Consider how button groups will stack\n\nCONTENT WIDTH:\n- Section content constrained to ~1200px max-width by default\n- Text-heavy sections might use narrower (800-900px) constraint\n\n\n\n## Quick Field Reference\n\nBUTTON: text (required), link (required), variant (default/secondary/outline), size (sm/default/lg), openInNewTab (yes/no)\n\nCARD: heading (required), text, image (user selects), link, shadow (none/sm/md/lg/xl)\n\nHEADING: text (required), level (h1-h6), alignment (left/center/right)\n\nTEXT: content (required), size (xs/sm/base/lg/xl), alignment (left/center/right)\n\nRICHTEXT: content (required, HTML string)\n\nACCORDION: items (array of {title, content, defaultOpen}), allowMultiple (yes/no)\n\nSECTION: content (slot), semanticElement, id, sectionBackground, sectionPadding\n  - sectionBackground: { type: 'solid', solid: { hex, opacity? } } or { type: 'gradient', gradient: { type, angle, stops } }\n  - sectionPadding: { xs: { top, right, bottom, left, unit: 'px', linked: boolean } }\n\nFLEX: content (slot), direction (row/column), justifyContent, alignItems, gap (number), wrap (wrap/nowrap)\n  - justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between'\n  - alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch'\n\nGRID: content (slot), numColumns (1-12), gap (number)\n\nSPACER: size (8/16/24/32/48/64/80/96/128), direction (vertical/horizontal/both)\n\nDIVIDER: style (solid/dashed/dotted)\n\nIMAGE: image (user selects), alt, aspectRatio (auto/1:1/16:9/4:3/3:2), link\n";
/**
 * Just the page pattern context (without field reference)
 * Use if you only need the composition patterns
 */
export { pagePatternContext };
/**
 * Just the field reference (without patterns)
 * Use if you only need a quick field name reference
 */
export { componentFieldReference };
/**
 * List of all component names by category
 */
export declare const allComponents: {
    readonly typography: readonly ["Heading", "Text", "RichText"];
    readonly layout: readonly ["Section", "Container", "Flex", "Grid", "Spacer"];
    readonly interactive: readonly ["Button", "Card", "Accordion", "Divider"];
    readonly media: readonly ["Image", "Template"];
};
/**
 * Flat list of all component names
 */
export declare const componentNames: readonly ["Heading", "Text", "RichText", "Section", "Container", "Flex", "Grid", "Spacer", "Button", "Card", "Accordion", "Divider", "Image", "Template"];
export { typographyInstructions } from './instructions/typography.js';
export { layoutInstructions } from './instructions/layout.js';
export { interactiveInstructions } from './instructions/interactive.js';
export { mediaInstructions } from './instructions/media.js';
//# sourceMappingURL=index.d.ts.map