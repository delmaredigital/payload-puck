/**
 * Layout Wrapper Component
 *
 * Wraps page content with layout-specific styling and structure.
 */
import type { ReactNode } from 'react';
import type { LayoutDefinition } from './types';
import { type BackgroundValue } from '../fields/shared';
/**
 * Page-level overrides for layout settings
 */
export interface PageOverrides {
    /** Override header visibility: 'default' uses layout, 'show'/'hide' overrides */
    showHeader?: 'default' | 'show' | 'hide';
    /** Override footer visibility: 'default' uses layout, 'show'/'hide' overrides */
    showFooter?: 'default' | 'show' | 'hide';
    /** Page background (overrides any layout background) */
    background?: BackgroundValue | null;
    /** Page max width: 'default' uses layout, otherwise uses the value */
    maxWidth?: string;
}
export interface LayoutWrapperProps {
    children: ReactNode;
    layout?: LayoutDefinition;
    className?: string;
    /** Page-level overrides from Puck root props */
    overrides?: PageOverrides;
}
/**
 * Applies layout configuration to page content
 */
export declare function LayoutWrapper({ children, layout, className, overrides }: LayoutWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=LayoutWrapper.d.ts.map