/**
 * Puck Data Validation Utilities
 *
 * Provides validation functions for ensuring Puck data structures are well-formed.
 */
import type { PuckPageData, PuckRootProps } from '../types';
/**
 * Result of a validation operation
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Options for validation
 */
export interface ValidationOptions {
    /**
     * Whether to validate that all content items have IDs
     * @default true
     */
    requireContentIds?: boolean;
    /**
     * Whether to validate root props
     * @default true
     */
    validateRoot?: boolean;
    /**
     * Required root prop fields
     * @default ['title']
     */
    requiredRootProps?: string[];
    /**
     * Allowed component types (if specified, unknown types will be flagged)
     */
    allowedComponentTypes?: string[];
    /**
     * Whether to treat unknown component types as errors (vs warnings)
     * @default false
     */
    strictComponentTypes?: boolean;
}
/**
 * Type guard to check if a value is a valid PuckPageData structure.
 * Performs basic structural validation.
 */
export declare function isPuckData(data: unknown): data is PuckPageData;
/**
 * Type guard for PuckRootProps
 */
export declare function isPuckRootProps(props: unknown): props is PuckRootProps;
/**
 * Validates that a PuckPageData structure is well-formed.
 * Useful for testing and debugging migration issues.
 *
 * @param data - The data to validate
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```ts
 * const result = validatePuckData(puckData)
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors)
 * }
 * ```
 */
export declare function validatePuckData(data: unknown, options?: ValidationOptions): ValidationResult;
/**
 * Validates and returns typed PuckPageData, throwing if invalid.
 *
 * @param data - The data to validate
 * @param options - Validation options
 * @returns The validated PuckPageData
 * @throws Error if validation fails
 */
export declare function assertPuckData(data: unknown, options?: ValidationOptions): PuckPageData;
/**
 * Safely parses JSON and validates as PuckPageData.
 *
 * @param json - JSON string to parse
 * @param options - Validation options
 * @returns Validation result with parsed data if valid
 */
export declare function parsePuckDataJson(json: string, options?: ValidationOptions): ValidationResult & {
    data?: PuckPageData;
};
//# sourceMappingURL=validation.d.ts.map