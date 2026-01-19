/**
 * Shared JSON Schemas for AI Field Generation
 *
 * Puck Cloud requires JSON schemas for custom fields to know what format to generate.
 * These schemas are used across all component instruction files.
 */
/** JSON Schema for ColorValue */
export declare const colorSchema: {
    type: string;
    properties: {
        hex: {
            type: string;
            description: string;
        };
        opacity: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
    };
    required: string[];
};
/** JSON Schema for Alignment (text alignment) */
export declare const alignmentSchema: {
    type: string;
    enum: string[];
    description: string;
};
/** JSON Schema for JustifyContent (flex) */
export declare const justifyContentSchema: {
    type: string;
    enum: string[];
    description: string;
};
/** JSON Schema for AlignItems (flex) */
export declare const alignItemsSchema: {
    type: string;
    enum: string[];
    description: string;
};
/** JSON Schema for PaddingValue (also used for margin) */
export declare const paddingSchema: {
    type: string;
    properties: {
        top: {
            type: string;
            description: string;
        };
        right: {
            type: string;
            description: string;
        };
        bottom: {
            type: string;
            description: string;
        };
        left: {
            type: string;
            description: string;
        };
        unit: {
            type: string;
            enum: string[];
            description: string;
        };
        linked: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
/** JSON Schema for ResponsiveValue<PaddingValue> */
export declare const responsivePaddingSchema: {
    type: string;
    properties: {
        xs: {
            description: string;
            type: string;
            properties: {
                top: {
                    type: string;
                    description: string;
                };
                right: {
                    type: string;
                    description: string;
                };
                bottom: {
                    type: string;
                    description: string;
                };
                left: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                linked: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        sm: {
            description: string;
            type: string;
            properties: {
                top: {
                    type: string;
                    description: string;
                };
                right: {
                    type: string;
                    description: string;
                };
                bottom: {
                    type: string;
                    description: string;
                };
                left: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                linked: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        md: {
            description: string;
            type: string;
            properties: {
                top: {
                    type: string;
                    description: string;
                };
                right: {
                    type: string;
                    description: string;
                };
                bottom: {
                    type: string;
                    description: string;
                };
                left: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                linked: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        lg: {
            description: string;
            type: string;
            properties: {
                top: {
                    type: string;
                    description: string;
                };
                right: {
                    type: string;
                    description: string;
                };
                bottom: {
                    type: string;
                    description: string;
                };
                left: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                linked: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        xl: {
            description: string;
            type: string;
            properties: {
                top: {
                    type: string;
                    description: string;
                };
                right: {
                    type: string;
                    description: string;
                };
                bottom: {
                    type: string;
                    description: string;
                };
                left: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                linked: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    required: string[];
};
/** JSON Schema for DimensionConstraint */
export declare const dimensionConstraintSchema: {
    type: string;
    properties: {
        value: {
            type: string;
            description: string;
        };
        unit: {
            type: string;
            enum: string[];
            description: string;
        };
        enabled: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
/** JSON Schema for DimensionsValue */
export declare const dimensionsSchema: {
    type: string;
    properties: {
        mode: {
            type: string;
            enum: string[];
            description: string;
        };
        alignment: {
            type: string;
            enum: string[];
            description: string;
        };
        maxWidth: {
            description: string;
            type: string;
            properties: {
                value: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                enabled: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        minWidth: {
            description: string;
            type: string;
            properties: {
                value: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                enabled: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        minHeight: {
            description: string;
            type: string;
            properties: {
                value: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                enabled: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        maxHeight: {
            description: string;
            type: string;
            properties: {
                value: {
                    type: string;
                    description: string;
                };
                unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                enabled: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
    required: string[];
};
/** JSON Schema for ResponsiveValue<DimensionsValue> */
export declare const responsiveDimensionsSchema: {
    type: string;
    properties: {
        xs: {
            description: string;
            type: string;
            properties: {
                mode: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                alignment: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                maxWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                maxHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
        };
        sm: {
            description: string;
            type: string;
            properties: {
                mode: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                alignment: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                maxWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                maxHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
        };
        md: {
            description: string;
            type: string;
            properties: {
                mode: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                alignment: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                maxWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                maxHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
        };
        lg: {
            description: string;
            type: string;
            properties: {
                mode: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                alignment: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                maxWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                maxHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
        };
        xl: {
            description: string;
            type: string;
            properties: {
                mode: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                alignment: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                maxWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minWidth: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                minHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                maxHeight: {
                    description: string;
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        enabled: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
        };
    };
    required: string[];
};
/** JSON Schema for GradientStop */
export declare const gradientStopSchema: {
    type: string;
    properties: {
        color: {
            type: string;
            properties: {
                hex: {
                    type: string;
                    description: string;
                };
                opacity: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
            };
            required: string[];
        };
        position: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
    };
    required: string[];
};
/** JSON Schema for GradientValue */
export declare const gradientSchema: {
    type: string;
    properties: {
        type: {
            type: string;
            enum: string[];
            description: string;
        };
        angle: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
        stops: {
            type: string;
            items: {
                type: string;
                properties: {
                    color: {
                        type: string;
                        properties: {
                            hex: {
                                type: string;
                                description: string;
                            };
                            opacity: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    position: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                };
                required: string[];
            };
            description: string;
        };
        radialShape: {
            type: string;
            enum: string[];
            description: string;
        };
        radialPosition: {
            type: string;
            enum: string[];
        };
    };
    required: string[];
};
/** JSON Schema for BackgroundValue */
export declare const backgroundSchema: {
    type: string;
    properties: {
        type: {
            type: string;
            enum: string[];
            description: string;
        };
        solid: {
            description: string;
            type: string;
            properties: {
                hex: {
                    type: string;
                    description: string;
                };
                opacity: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
            };
            required: string[];
        };
        gradient: {
            description: string;
            type: string;
            properties: {
                type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                angle: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                stops: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            color: {
                                type: string;
                                properties: {
                                    hex: {
                                        type: string;
                                        description: string;
                                    };
                                    opacity: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                        description: string;
                                    };
                                };
                                required: string[];
                            };
                            position: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    description: string;
                };
                radialShape: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                radialPosition: {
                    type: string;
                    enum: string[];
                };
            };
            required: string[];
        };
    };
    required: string[];
};
/** JSON Schema for BorderValue */
export declare const borderSchema: {
    type: string;
    properties: {
        style: {
            type: string;
            enum: string[];
            description: string;
        };
        width: {
            type: string;
            description: string;
        };
        color: {
            description: string;
            type: string;
            properties: {
                hex: {
                    type: string;
                    description: string;
                };
                opacity: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
            };
            required: string[];
        };
        radius: {
            type: string;
            description: string;
        };
        sides: {
            type: string;
            properties: {
                top: {
                    type: string;
                };
                right: {
                    type: string;
                };
                bottom: {
                    type: string;
                };
                left: {
                    type: string;
                };
            };
            description: string;
        };
    };
    required: string[];
};
/** JSON Schema for AnimationValue (simplified for AI) */
export declare const animationSchema: {
    type: string;
    properties: {
        mode: {
            type: string;
            enum: string[];
            description: string;
        };
        entrance: {
            type: string;
            enum: string[];
            description: string;
        };
        entranceDuration: {
            type: string;
            description: string;
        };
        entranceDelay: {
            type: string;
            description: string;
        };
        triggerOnScroll: {
            type: string;
            description: string;
        };
        triggerOnce: {
            type: string;
            description: string;
        };
    };
};
/** JSON Schema for VisibilityValue */
export declare const visibilitySchema: {
    type: string;
    properties: {
        xs: {
            type: string;
            description: string;
        };
        sm: {
            type: string;
            description: string;
        };
        md: {
            type: string;
            description: string;
        };
        lg: {
            type: string;
            description: string;
        };
        xl: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
/** JSON Schema for SizeValue */
export declare const sizeSchema: {
    type: string;
    properties: {
        mode: {
            type: string;
            enum: string[];
            description: string;
        };
        height: {
            type: string;
            description: string;
        };
        paddingX: {
            type: string;
            description: string;
        };
        paddingY: {
            type: string;
            description: string;
        };
        fontSize: {
            type: string;
            description: string;
        };
        unit: {
            type: string;
            enum: string[];
            description: string;
        };
    };
    required: string[];
};
/** JSON Schema for TransformValue */
export declare const transformSchema: {
    type: string;
    properties: {
        rotate: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
        scaleX: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
        scaleY: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
        scaleLocked: {
            type: string;
            description: string;
        };
        skewX: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
        skewY: {
            type: string;
            minimum: number;
            maximum: number;
            description: string;
        };
        translateX: {
            type: string;
            description: string;
        };
        translateY: {
            type: string;
            description: string;
        };
        translateUnit: {
            type: string;
            enum: string[];
            description: string;
        };
        origin: {
            type: string;
            enum: string[];
            description: string;
        };
        enable3D: {
            type: string;
            description: string;
        };
        perspective: {
            type: string;
            description: string;
        };
        rotateX: {
            type: string;
            description: string;
        };
        rotateY: {
            type: string;
            description: string;
        };
    };
};
//# sourceMappingURL=schemas.d.ts.map