/**
 * Default Layout Definitions
 *
 * These provide sensible defaults for common page layout patterns.
 * Users can override or extend these in their own configuration.
 */
/**
 * Default layout - standard content width with padding
 */
export const defaultLayout = {
    value: 'default',
    label: 'Default',
    description: 'Standard page layout with contained content width',
    classes: {
        wrapper: '',
        container: 'mx-auto px-4 sm:px-6 lg:px-8',
        content: '',
    },
    maxWidth: '1200px',
    fullWidth: false,
};
/**
 * Landing layout - optimized for marketing/landing pages
 */
export const landingLayout = {
    value: 'landing',
    label: 'Landing',
    description: 'Full-width sections with no global container constraints',
    classes: {
        wrapper: '',
        container: '',
        content: '',
    },
    fullWidth: true,
};
/**
 * Full width layout - edge-to-edge content
 */
export const fullWidthLayout = {
    value: 'full-width',
    label: 'Full Width',
    description: 'Content spans the full viewport width',
    classes: {
        wrapper: 'w-full',
        container: 'w-full',
        content: '',
    },
    maxWidth: '100%',
    fullWidth: true,
};
/**
 * Narrow layout - ideal for blog posts and articles
 */
export const narrowLayout = {
    value: 'narrow',
    label: 'Narrow',
    description: 'Narrow content width for optimal reading experience',
    classes: {
        wrapper: '',
        container: 'mx-auto px-4 sm:px-6',
        content: '',
    },
    maxWidth: '768px',
    fullWidth: false,
};
/**
 * Wide layout - extra wide content area
 */
export const wideLayout = {
    value: 'wide',
    label: 'Wide',
    description: 'Wider content area for dashboards or galleries',
    classes: {
        wrapper: '',
        container: 'mx-auto px-4 sm:px-6 lg:px-8',
        content: '',
    },
    maxWidth: '1440px',
    fullWidth: false,
};
/**
 * Default layouts included with the plugin
 */
export const DEFAULT_LAYOUTS = [
    defaultLayout,
    landingLayout,
    fullWidthLayout,
];
/**
 * Extended layouts for users who want more options
 */
export const EXTENDED_LAYOUTS = [
    defaultLayout,
    landingLayout,
    fullWidthLayout,
    narrowLayout,
    wideLayout,
];
/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT_CONFIG = {
    layouts: DEFAULT_LAYOUTS,
    defaultLayout: 'default',
};
//# sourceMappingURL=defaults.js.map