/**
 * Pre-built Puck configuration presets
 *
 * These presets provide ready-to-use configurations that can be extended
 * with custom components.
 *
 * @example
 * ```tsx
 * import { fullConfig, extendConfig } from '@delmaredigital/payload-puck/config'
 * import { MyHeroConfig } from '@/components/puck/Hero'
 *
 * export const puckConfig = extendConfig({
 *   base: fullConfig,
 *   components: {
 *     Hero: MyHeroConfig,
 *   },
 *   categories: {
 *     custom: { title: 'Custom', components: ['Hero'] },
 *   },
 * })
 * ```
 */
import type { ComponentConfig } from '@puckeditor/core';
import type { ReactNode } from 'react';
/**
 * Default root configuration used by presets
 */
export declare const defaultRoot: {
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
        pageBackground: import("@puckeditor/core").CustomField<import("../fields/shared.js").BackgroundValue | null>;
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
export declare const pageTreeRoot: {
    fields: {
        title: {
            type: "text";
            label: string;
        };
        folder: import("@puckeditor/core").CustomField<string | null>;
        pageSegment: import("@puckeditor/core").CustomField<string>;
        slug: import("@puckeditor/core").CustomField<string>;
        isHomepage: import("@puckeditor/core").CustomField<boolean>;
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
        pageBackground: import("@puckeditor/core").CustomField<import("../fields/shared.js").BackgroundValue | null>;
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
        title: string;
        folder: null;
        pageSegment: string;
        slug: string;
        isHomepage: boolean;
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
/**
 * Full configuration with all built-in components
 *
 * Use this as a base and extend with custom components via `extendConfig()`.
 */
export declare const fullConfig: {
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
            pageBackground: import("@puckeditor/core").CustomField<import("../fields/shared.js").BackgroundValue | null>;
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
/**
 * Minimal configuration with essential components only
 *
 * Good for simple landing pages or when you want a cleaner editor sidebar.
 */
export declare const minimalConfig: {
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
            pageBackground: import("@puckeditor/core").CustomField<import("../fields/shared.js").BackgroundValue | null>;
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
        content: {
            title: string;
            components: string[];
        };
    };
    components: {
        Section: ComponentConfig<any>;
        Heading: ComponentConfig<any>;
        Text: ComponentConfig<any>;
        Image: ComponentConfig<any>;
        Button: ComponentConfig<any>;
    };
};
export { mergeConfigs, mergeConfigs as extendConfig } from './merge.js';
//# sourceMappingURL=presets.d.ts.map