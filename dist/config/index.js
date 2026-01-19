import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_LAYOUTS, layoutsToOptions } from '../layouts';
// Layout Components (server-safe versions)
import { ContainerConfig } from '../components/layout/Container.server';
import { FlexConfig } from '../components/layout/Flex.server';
import { GridConfig } from '../components/layout/Grid.server';
import { SectionConfig } from '../components/layout/Section.server';
import { SpacerConfig } from '../components/layout/Spacer.server';
import { TemplateServerConfig } from '../components/layout/Template.server';
// Typography Components (server-safe versions)
import { HeadingConfig } from '../components/typography/Heading.server';
import { TextConfig } from '../components/typography/Text.server';
import { RichTextConfig } from '../components/typography/RichText.server';
// Media Components (server-safe versions)
import { ImageConfig } from '../components/media/Image.server';
// Interactive Components (server-safe versions)
import { ButtonConfig } from '../components/interactive/Button.server';
import { CardConfig } from '../components/interactive/Card.server';
import { DividerConfig } from '../components/interactive/Divider.server';
import { AccordionConfig } from '../components/interactive/Accordion.server';
/**
 * Creates a Puck configuration with custom layouts
 *
 * @param layouts - Custom layout definitions
 * @returns Puck configuration with the specified layouts
 *
 * @example
 * ```tsx
 * import { createConfig, DEFAULT_LAYOUTS, createLayout } from '@delmaredigital/payload-puck/config'
 *
 * const customConfig = createConfig([
 *   ...DEFAULT_LAYOUTS,
 *   createLayout({
 *     value: 'blog',
 *     label: 'Blog Post',
 *     maxWidth: '720px',
 *   }),
 * ])
 * ```
 */
export function createConfig(layouts = DEFAULT_LAYOUTS) {
    const layoutOptions = layoutsToOptions(layouts);
    return {
        root: {
            fields: {
                title: {
                    type: 'text',
                    label: 'Page Title',
                },
                pageLayout: {
                    type: 'select',
                    label: 'Page Layout',
                    options: layoutOptions.map(({ value, label }) => ({ value, label })),
                },
            },
            defaultProps: {
                title: 'New Page',
                pageLayout: 'default',
            },
            render: ({ children }) => _jsx(_Fragment, { children: children }),
        },
        categories: {
            layout: {
                title: 'Layout',
                components: ['Container', 'Flex', 'Grid', 'Section', 'Spacer', 'Template'],
                defaultExpanded: true,
            },
            typography: {
                title: 'Typography',
                components: ['Heading', 'Text', 'RichText'],
            },
            media: {
                title: 'Media',
                components: ['Image'],
            },
            interactive: {
                title: 'Interactive',
                components: ['Button', 'Card', 'Divider', 'Accordion'],
            },
        },
        components: {
            // Layout
            Container: ContainerConfig,
            Flex: FlexConfig,
            Grid: GridConfig,
            Section: SectionConfig,
            Spacer: SpacerConfig,
            Template: TemplateServerConfig,
            // Typography
            Heading: HeadingConfig,
            Text: TextConfig,
            RichText: RichTextConfig,
            // Media
            Image: ImageConfig,
            // Interactive
            Button: ButtonConfig,
            Card: CardConfig,
            Divider: DividerConfig,
            Accordion: AccordionConfig,
        },
    };
}
/**
 * Base Puck configuration with server-safe component configs
 *
 * All components have server-safe versions (.server.tsx) that render
 * without client-side interactivity. Use editorConfig from ./config.editor
 * for the full interactive editor experience.
 *
 * For custom layouts, use createConfig() instead.
 */
export const baseConfig = createConfig(DEFAULT_LAYOUTS);
// Re-export merge utility and layout helpers
export { mergeConfigs, mergeConfigs as extendConfig } from './merge';
export { DEFAULT_LAYOUTS, createLayout } from '../layouts';
//# sourceMappingURL=index.js.map