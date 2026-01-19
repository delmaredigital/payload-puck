/**
 * Puck Data Validation Utilities
 *
 * Provides validation functions for ensuring Puck data structures are well-formed.
 */
// =============================================================================
// Type Guards
// =============================================================================
/**
 * Type guard to check if a value is a valid PuckPageData structure.
 * Performs basic structural validation.
 */
export function isPuckData(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    const obj = data;
    // Check root structure
    if (!obj.root || typeof obj.root !== 'object') {
        return false;
    }
    const root = obj.root;
    if (!root.props || typeof root.props !== 'object') {
        return false;
    }
    // Check content array
    if (!Array.isArray(obj.content)) {
        return false;
    }
    // Validate each content item has required fields
    for (const item of obj.content) {
        if (!item || typeof item !== 'object') {
            return false;
        }
        const contentItem = item;
        if (typeof contentItem.type !== 'string') {
            return false;
        }
        if (!contentItem.props || typeof contentItem.props !== 'object') {
            return false;
        }
    }
    // Check zones (optional but must be object if present)
    if (obj.zones !== undefined && typeof obj.zones !== 'object') {
        return false;
    }
    return true;
}
/**
 * Type guard for PuckRootProps
 */
export function isPuckRootProps(props) {
    if (!props || typeof props !== 'object') {
        return false;
    }
    return true;
}
// =============================================================================
// Validation Functions
// =============================================================================
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
export function validatePuckData(data, options = {}) {
    const { requireContentIds = true, validateRoot = true, requiredRootProps = ['title'], allowedComponentTypes, strictComponentTypes = false, } = options;
    const errors = [];
    const warnings = [];
    // Basic type check
    if (!data || typeof data !== 'object') {
        errors.push('Data must be a non-null object');
        return { valid: false, errors, warnings };
    }
    const obj = data;
    // ==========================================================================
    // Validate root structure
    // ==========================================================================
    if (!obj.root || typeof obj.root !== 'object') {
        errors.push('Missing or invalid root object');
    }
    else if (validateRoot) {
        const root = obj.root;
        if (!root.props || typeof root.props !== 'object') {
            errors.push('Missing root.props object');
        }
        else {
            const rootProps = root.props;
            // Check required root props
            for (const prop of requiredRootProps) {
                if (rootProps[prop] === undefined || rootProps[prop] === null) {
                    errors.push(`Missing required root prop: ${prop}`);
                }
            }
            // Validate pageLayout if present
            if (rootProps.pageLayout !== undefined) {
                if (typeof rootProps.pageLayout !== 'string') {
                    errors.push('root.props.pageLayout must be a string');
                }
            }
        }
    }
    // ==========================================================================
    // Validate content array
    // ==========================================================================
    if (!Array.isArray(obj.content)) {
        errors.push('content must be an array');
    }
    else {
        const seenIds = new Set();
        obj.content.forEach((item, index) => {
            if (!item || typeof item !== 'object') {
                errors.push(`Content item at index ${index} is not an object`);
                return;
            }
            const contentItem = item;
            // Validate type
            if (!contentItem.type || typeof contentItem.type !== 'string') {
                errors.push(`Content item at index ${index} missing or invalid type`);
            }
            else if (allowedComponentTypes) {
                if (!allowedComponentTypes.includes(contentItem.type)) {
                    const message = `Unknown component type "${contentItem.type}" at index ${index}`;
                    if (strictComponentTypes) {
                        errors.push(message);
                    }
                    else {
                        warnings.push(message);
                    }
                }
            }
            // Validate props
            if (!contentItem.props || typeof contentItem.props !== 'object') {
                errors.push(`Content item at index ${index} missing props object`);
            }
            else if (requireContentIds) {
                const props = contentItem.props;
                if (!props.id || typeof props.id !== 'string') {
                    errors.push(`Content item at index ${index} missing or invalid props.id`);
                }
                else {
                    // Check for duplicate IDs
                    if (seenIds.has(props.id)) {
                        warnings.push(`Duplicate content item ID "${props.id}" at index ${index}`);
                    }
                    seenIds.add(props.id);
                }
            }
        });
    }
    // ==========================================================================
    // Validate zones
    // ==========================================================================
    if (obj.zones !== undefined) {
        if (typeof obj.zones !== 'object' || obj.zones === null) {
            errors.push('zones must be an object');
        }
        else {
            const zones = obj.zones;
            for (const [zoneName, zoneContent] of Object.entries(zones)) {
                if (!Array.isArray(zoneContent)) {
                    errors.push(`Zone "${zoneName}" content must be an array`);
                    continue;
                }
                zoneContent.forEach((item, index) => {
                    if (!item || typeof item !== 'object') {
                        errors.push(`Zone "${zoneName}" item at index ${index} is not an object`);
                        return;
                    }
                    const contentItem = item;
                    if (!contentItem.type || typeof contentItem.type !== 'string') {
                        errors.push(`Zone "${zoneName}" item at index ${index} missing or invalid type`);
                    }
                    if (!contentItem.props || typeof contentItem.props !== 'object') {
                        errors.push(`Zone "${zoneName}" item at index ${index} missing props object`);
                    }
                    else if (requireContentIds) {
                        const props = contentItem.props;
                        if (!props.id || typeof props.id !== 'string') {
                            errors.push(`Zone "${zoneName}" item at index ${index} missing or invalid props.id`);
                        }
                    }
                });
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Validates and returns typed PuckPageData, throwing if invalid.
 *
 * @param data - The data to validate
 * @param options - Validation options
 * @returns The validated PuckPageData
 * @throws Error if validation fails
 */
export function assertPuckData(data, options) {
    const result = validatePuckData(data, options);
    if (!result.valid) {
        throw new Error(`Invalid Puck data: ${result.errors.join('; ')}`);
    }
    return data;
}
/**
 * Safely parses JSON and validates as PuckPageData.
 *
 * @param json - JSON string to parse
 * @param options - Validation options
 * @returns Validation result with parsed data if valid
 */
export function parsePuckDataJson(json, options) {
    let parsed;
    try {
        parsed = JSON.parse(json);
    }
    catch (e) {
        return {
            valid: false,
            errors: [`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`],
            warnings: [],
        };
    }
    const result = validatePuckData(parsed, options);
    if (result.valid) {
        return {
            ...result,
            data: parsed,
        };
    }
    return result;
}
//# sourceMappingURL=validation.js.map