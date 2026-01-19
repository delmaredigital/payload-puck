/**
 * Client-side Puck configuration with custom fields
 *
 * This config includes all components plus client-only features like:
 * - TipTap rich text editor for RichText
 * - Accordion (requires useState)
 *
 * Use this config for the Puck visual editor.
 */
import type { ComponentConfig } from '@puckeditor/core';
import type { ReactNode } from 'react';
/**
 * Editor Puck configuration with all components including client-only ones
 *
 * Use this config for the Puck <Editor /> component.
 */
export declare const editorConfig: {
    root: {
        fields: {
            slug: import("@puckeditor/core").CustomField<string>;
            isHomepage: import("@puckeditor/core").CustomField<boolean>;
            title: {
                type: "text";
                label: string;
            };
            pageLayout: {
                type: "select";
                label: string;
                options: {
                    label: string;
                    value: string;
                }[];
            };
            showHeader: {
                type: "radio";
                label: string;
                options: {
                    label: string;
                    value: string;
                }[];
            };
            showFooter: {
                type: "radio";
                label: string;
                options: {
                    label: string;
                    value: string;
                }[];
            };
            pageBackground: import("@puckeditor/core").CustomField<import("../fields").BackgroundValue | null>;
            pageMaxWidth: {
                type: "select";
                label: string;
                options: {
                    label: string;
                    value: string;
                }[];
            };
        };
        defaultProps: {
            slug: string;
            isHomepage: boolean;
            title: string;
            pageLayout: string;
            showHeader: string;
            showFooter: string;
            pageBackground: null;
            pageMaxWidth: string;
        };
        render: ({ children }: {
            children: ReactNode;
        }) => import("react/jsx-runtime").JSX.Element;
    };
    categories: {
        layout: {
            title: string;
            components: string[];
            defaultExpanded: true;
        };
        typography: {
            title: string;
            components: string[];
        };
        media: {
            title: string;
            components: string[];
        };
        interactive: {
            title: string;
            components: string[];
        };
    };
    components: {
        Container: ComponentConfig<any>;
        Flex: ComponentConfig<any>;
        Grid: ComponentConfig<any>;
        Section: ComponentConfig<any>;
        Spacer: ComponentConfig<any>;
        Template: ComponentConfig<any>;
        Heading: ComponentConfig<any>;
        Text: ComponentConfig<any>;
        RichText: ComponentConfig<any>;
        Image: ComponentConfig<any>;
        Button: ComponentConfig<any>;
        Card: ComponentConfig<any>;
        Divider: ComponentConfig<any>;
        Accordion: ComponentConfig<any>;
    };
};
export { mergeConfigs } from './merge';
export { fullConfig, minimalConfig, defaultRoot, pageTreeRoot, extendConfig, } from './presets.js';
//# sourceMappingURL=config.editor.d.ts.map