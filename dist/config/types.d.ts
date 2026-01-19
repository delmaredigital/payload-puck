/**
 * Server-specific Puck configuration types
 *
 * These types are designed for server-side rendering where field definitions
 * are not needed (only the render function matters).
 */
import type { ReactNode } from 'react';
/**
 * Slot field definition - the only field type needed in server configs
 *
 * When a component has child content (slots), Puck needs the slot field
 * defined so it can transform the slot data into a renderable component.
 */
export interface SlotField {
    type: 'slot';
}
/**
 * Server-safe component configuration
 *
 * Use this type for component configs in `.server.tsx` files.
 * Unlike Puck's full `ComponentConfig`, this type:
 * - Makes `fields` truly optional (no TypeScript pressure to define them)
 * - Only expects slot fields when components have child content
 * - Focuses on what servers actually need: `render` and `defaultProps`
 *
 * @example
 * ```tsx
 * // Component WITHOUT slots - no fields needed
 * import type { ServerComponentConfig } from '@delmaredigital/payload-puck/config'
 *
 * export const ButtonConfig: ServerComponentConfig<ButtonProps> = {
 *   label: 'Button',
 *   defaultProps,
 *   render: ({ text, link }) => <a href={link}>{text}</a>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Component WITH slots - only slot field needed
 * import type { ServerComponentConfig } from '@delmaredigital/payload-puck/config'
 *
 * export const SectionConfig: ServerComponentConfig<SectionProps> = {
 *   label: 'Section',
 *   fields: { content: { type: 'slot' } },
 *   defaultProps,
 *   render: ({ content: Content }) => <section><Content /></section>
 * }
 * ```
 */
export interface ServerComponentConfig<Props = Record<string, unknown>> {
    /**
     * Display label for the component in the editor sidebar
     */
    label?: string;
    /**
     * Default prop values for new instances of this component
     */
    defaultProps?: Props;
    /**
     * Slot fields only - define these when your component has child content areas
     *
     * For server configs, you only need to define slot fields. Other field types
     * (text, number, select, etc.) are only used by the editor and can be omitted.
     *
     * @example
     * ```tsx
     * fields: {
     *   content: { type: 'slot' },      // Main content area
     *   sidebar: { type: 'slot' },       // Optional sidebar slot
     * }
     * ```
     */
    fields?: Record<string, SlotField>;
    /**
     * Render function for the component
     *
     * This is called during server-side rendering. Must be a pure function
     * without React hooks or client-side interactivity.
     *
     * Slot props are transformed by Puck into renderable components.
     */
    render: (props: Props & {
        puck?: {
            isEditing?: boolean;
        };
        id?: string;
    }) => ReactNode;
}
/**
 * Server-safe root configuration
 *
 * Use this for the root config in server-side Puck configurations.
 */
export interface ServerRootConfig<Props extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Default prop values for the root
     */
    defaultProps?: Partial<Props>;
    /**
     * Root fields are not needed for server rendering
     */
    fields?: never;
    /**
     * Render function for the root wrapper
     */
    render: (props: Props & {
        children: ReactNode;
    }) => ReactNode;
}
//# sourceMappingURL=types.d.ts.map