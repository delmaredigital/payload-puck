'use client';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
// Import component configs
import { ContainerConfig, FlexConfig, GridConfig, SectionConfig, SpacerConfig, TemplateConfig, HeadingConfig, TextConfig, RichTextEditorConfig, ImageConfig, ButtonConfig, CardConfig, DividerConfig, AccordionConfig, } from '../components/exports.js';
// Import field factories for root config
import { createBackgroundField } from '../fields/BackgroundField.js';
import { lockedSlugField, lockedHomepageField } from '../fields/LockedField.js';
import { createFolderPickerField } from '../fields/FolderPickerField.js';
import { createLockedPageSegmentField } from '../fields/PageSegmentField.js';
import { createSlugPreviewField } from '../fields/SlugPreviewField.js';
/**
 * Default root configuration used by presets
 */
export const defaultRoot = {
    fields: {
        // Page identity (locked fields)
        slug: lockedSlugField,
        isHomepage: lockedHomepageField,
        // Page settings
        title: {
            type: 'text',
            label: 'Page Title',
        },
        pageLayout: {
            type: 'select',
            label: 'Page Layout',
            options: [
                { label: 'Default', value: 'default' },
                { label: 'Landing', value: 'landing' },
                { label: 'Full Width', value: 'full-width' },
            ],
        },
        // Page-level overrides
        showHeader: {
            type: 'radio',
            label: 'Show Header',
            options: [
                { label: 'Use Layout Default', value: 'default' },
                { label: 'Show', value: 'show' },
                { label: 'Hide', value: 'hide' },
            ],
        },
        showFooter: {
            type: 'radio',
            label: 'Show Footer',
            options: [
                { label: 'Use Layout Default', value: 'default' },
                { label: 'Show', value: 'show' },
                { label: 'Hide', value: 'hide' },
            ],
        },
        pageBackground: createBackgroundField({
            label: 'Page Background',
        }),
        pageMaxWidth: {
            type: 'select',
            label: 'Page Width',
            options: [
                { label: 'Use Layout Default', value: 'default' },
                { label: 'Narrow (720px)', value: '720px' },
                { label: 'Standard (1000px)', value: '1000px' },
                { label: 'Wide (1200px)', value: '1200px' },
                { label: 'Extra Wide (1400px)', value: '1400px' },
                { label: 'Full Width', value: '100%' },
            ],
        },
    },
    defaultProps: {
        slug: '',
        isHomepage: false,
        title: 'New Page',
        pageLayout: 'default',
        showHeader: 'default',
        showFooter: 'default',
        pageBackground: null,
        pageMaxWidth: 'default',
    },
    render: ({ children }) => _jsx(_Fragment, { children: children }),
};
/**
 * Root configuration for use with @delmaredigital/payload-page-tree
 *
 * Replaces the standard locked slug field with:
 * - Folder picker (select which folder the page belongs to)
 * - Page segment (editable URL segment for this page)
 * - Slug preview (read-only computed URL)
 *
 * @example
 * ```tsx
 * import { pageTreeRoot, fullConfig, extendConfig } from '@delmaredigital/payload-puck/config'
 *
 * export const puckConfig = extendConfig({
 *   base: fullConfig,
 *   root: pageTreeRoot,
 * })
 * ```
 */
export const pageTreeRoot = {
    fields: {
        // Page identity
        title: {
            type: 'text',
            label: 'Page Title',
        },
        // Page-tree specific fields
        folder: createFolderPickerField({ label: 'Folder' }),
        pageSegment: createLockedPageSegmentField({ label: 'Page Segment' }),
        slug: createSlugPreviewField({
            label: 'URL Slug',
            hint: 'Auto-generated from folder + page segment',
        }),
        isHomepage: lockedHomepageField,
        // Page settings
        pageLayout: {
            type: 'select',
            label: 'Page Layout',
            options: [
                { label: 'Default', value: 'default' },
                { label: 'Landing', value: 'landing' },
                { label: 'Full Width', value: 'full-width' },
            ],
        },
        // Page-level overrides
        showHeader: {
            type: 'radio',
            label: 'Show Header',
            options: [
                { label: 'Use Layout Default', value: 'default' },
                { label: 'Show', value: 'show' },
                { label: 'Hide', value: 'hide' },
            ],
        },
        showFooter: {
            type: 'radio',
            label: 'Show Footer',
            options: [
                { label: 'Use Layout Default', value: 'default' },
                { label: 'Show', value: 'show' },
                { label: 'Hide', value: 'hide' },
            ],
        },
        pageBackground: createBackgroundField({
            label: 'Page Background',
        }),
        pageMaxWidth: {
            type: 'select',
            label: 'Page Width',
            options: [
                { label: 'Use Layout Default', value: 'default' },
                { label: 'Narrow (720px)', value: '720px' },
                { label: 'Standard (1000px)', value: '1000px' },
                { label: 'Wide (1200px)', value: '1200px' },
                { label: 'Extra Wide (1400px)', value: '1400px' },
                { label: 'Full Width', value: '100%' },
            ],
        },
    },
    defaultProps: {
        title: 'New Page',
        folder: null,
        pageSegment: '',
        slug: '',
        isHomepage: false,
        pageLayout: 'default',
        showHeader: 'default',
        showFooter: 'default',
        pageBackground: null,
        pageMaxWidth: 'default',
    },
    render: ({ children }) => _jsx(_Fragment, { children: children }),
};
/**
 * Full configuration with all built-in components
 *
 * Use this as a base and extend with custom components via `extendConfig()`.
 */
export const fullConfig = {
    root: defaultRoot,
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
        Template: TemplateConfig,
        // Typography
        Heading: HeadingConfig,
        Text: TextConfig,
        RichText: RichTextEditorConfig,
        // Media
        Image: ImageConfig,
        // Interactive
        Button: ButtonConfig,
        Card: CardConfig,
        Divider: DividerConfig,
        Accordion: AccordionConfig,
    },
};
/**
 * Minimal configuration with essential components only
 *
 * Good for simple landing pages or when you want a cleaner editor sidebar.
 */
export const minimalConfig = {
    root: defaultRoot,
    categories: {
        layout: {
            title: 'Layout',
            components: ['Section'],
            defaultExpanded: true,
        },
        content: {
            title: 'Content',
            components: ['Heading', 'Text', 'Image', 'Button'],
        },
    },
    components: {
        Section: SectionConfig,
        Heading: HeadingConfig,
        Text: TextConfig,
        Image: ImageConfig,
        Button: ButtonConfig,
    },
};
// Re-export mergeConfigs as extendConfig for convenience
export { mergeConfigs, mergeConfigs as extendConfig } from './merge.js';
//# sourceMappingURL=presets.js.map