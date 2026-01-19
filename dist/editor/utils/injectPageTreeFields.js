import { createFolderPickerField } from '../../fields/FolderPickerField.js';
import { createLockedPageSegmentField } from '../../fields/PageSegmentField.js';
import { createSlugPreviewField } from '../../fields/SlugPreviewField.js';
/**
 * Injects page-tree fields (folder, pageSegment, slug) into a Puck config's root fields.
 * Replaces any existing slug field with the page-tree slug preview.
 *
 * @param config - The base Puck config to enhance
 * @returns A new config with page-tree fields injected into root.fields
 */
export function injectPageTreeFields(config) {
    // Create page-tree specific fields
    const pageTreeFields = {
        folder: createFolderPickerField({ label: 'Folder' }),
        pageSegment: createLockedPageSegmentField({ label: 'Page Segment' }),
        slug: createSlugPreviewField({
            label: 'URL Slug',
            hint: 'Auto-generated from folder + page segment',
        }),
    };
    // Merge page-tree fields into root config, replacing existing slug field
    const existingRootFields = config.root?.fields || {};
    const { slug: _existingSlug, ...otherFields } = existingRootFields;
    return {
        ...config,
        root: {
            ...config.root,
            fields: {
                ...otherFields,
                ...pageTreeFields,
            },
        },
    };
}
//# sourceMappingURL=injectPageTreeFields.js.map