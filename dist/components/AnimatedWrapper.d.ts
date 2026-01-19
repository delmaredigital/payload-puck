/**
 * AnimatedWrapper - Client component for scroll-triggered animations
 *
 * Wraps children with animation support using IntersectionObserver.
 * Handles both preset entrance animations and custom transitions.
 * Supports 27 animation presets with customizable intensity, easing, and origin.
 */
import type { ReactNode, CSSProperties, ElementType } from 'react';
import { type AnimationValue } from '../fields/shared';
export interface AnimatedWrapperProps {
    /** Animation configuration from the component */
    animation: AnimationValue | null | undefined;
    /** Child content to animate */
    children: ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
    /** HTML element to render as (default: 'div') */
    as?: ElementType;
}
/**
 * Wraps children with scroll-triggered animation support.
 *
 * For preset animations: Applies initial/animate inline styles
 * when element enters viewport.
 *
 * For custom animations: Applies CSS transition properties.
 *
 * If no animation is set, renders children without a wrapper div.
 */
export declare function AnimatedWrapper({ animation, children, className, style, as: Component, }: AnimatedWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AnimatedWrapper.d.ts.map