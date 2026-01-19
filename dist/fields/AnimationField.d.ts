/**
 * AnimationField - Custom Puck field for transition and entrance animation controls
 *
 * Provides comprehensive animation configuration with:
 * - 27 preset entrance animations organized by category
 * - Customizable intensity (distance, scale, rotate, blur)
 * - Transform origin control
 * - Advanced easing options (including spring/bounce)
 * - Scroll trigger settings
 * - Stagger support for child elements
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { AnimationValue } from './shared';
interface AnimationFieldProps {
    value: AnimationValue | null;
    onChange: (value: AnimationValue | null) => void;
    label?: string;
    readOnly?: boolean;
    /** Whether to show stagger controls (for container components) */
    showStagger?: boolean;
}
declare function AnimationFieldInner({ value, onChange, label, readOnly, showStagger, }: AnimationFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const AnimationField: React.MemoExoticComponent<typeof AnimationFieldInner>;
interface CreateAnimationFieldConfig {
    label?: string;
    /** Whether to show stagger controls (for container components like Flex, Grid) */
    showStagger?: boolean;
}
/**
 * Creates a Puck field configuration for animation control
 *
 * @example
 * ```ts
 * fields: {
 *   animation: createAnimationField({ label: 'Animation' }),
 *   // For containers with child elements:
 *   animation: createAnimationField({ label: 'Animation', showStagger: true }),
 * }
 * ```
 */
export declare function createAnimationField(config?: CreateAnimationFieldConfig): CustomField<AnimationValue | null>;
export {};
//# sourceMappingURL=AnimationField.d.ts.map