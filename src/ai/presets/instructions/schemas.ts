/**
 * Shared JSON Schemas for AI Field Generation
 *
 * Puck Cloud requires JSON schemas for custom fields to know what format to generate.
 * These schemas are used across all component instruction files.
 */

// =============================================================================
// Basic Types
// =============================================================================

/** JSON Schema for ColorValue */
export const colorSchema = {
  type: 'object',
  properties: {
    hex: { type: 'string', description: 'Hex color code, e.g., "#3b82f6"' },
    opacity: { type: 'number', minimum: 0, maximum: 100, description: 'Opacity 0-100, default 100' },
  },
  required: ['hex'],
}

/** JSON Schema for Alignment (text alignment) */
export const alignmentSchema = {
  type: 'string',
  enum: ['left', 'center', 'right'],
  description: "Text/content alignment: 'left', 'center', or 'right'",
}

/** JSON Schema for JustifyContent (flex) */
export const justifyContentSchema = {
  type: 'string',
  enum: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'],
  description: 'Main-axis distribution: flex-start (default), center, flex-end, space-between, space-around',
}

/** JSON Schema for AlignItems (flex) */
export const alignItemsSchema = {
  type: 'string',
  enum: ['flex-start', 'center', 'flex-end', 'stretch'],
  description: 'Cross-axis alignment: flex-start, center, flex-end, stretch',
}

// =============================================================================
// Padding/Margin Types
// =============================================================================

/** JSON Schema for PaddingValue (also used for margin) */
export const paddingSchema = {
  type: 'object',
  properties: {
    top: { type: 'number', description: 'Top padding in units' },
    right: { type: 'number', description: 'Right padding in units' },
    bottom: { type: 'number', description: 'Bottom padding in units' },
    left: { type: 'number', description: 'Left padding in units' },
    unit: { type: 'string', enum: ['px', 'rem', 'em', '%'], description: 'Unit for all values' },
    linked: { type: 'boolean', description: 'Whether all sides sync together' },
  },
  required: ['top', 'right', 'bottom', 'left', 'unit'],
}

/** JSON Schema for ResponsiveValue<PaddingValue> */
export const responsivePaddingSchema = {
  type: 'object',
  properties: {
    xs: { ...paddingSchema, description: 'Base (mobile) value - required' },
    sm: { ...paddingSchema, description: 'Small screens (640px+) - optional override' },
    md: { ...paddingSchema, description: 'Medium screens (768px+) - optional override' },
    lg: { ...paddingSchema, description: 'Large screens (1024px+) - optional override' },
    xl: { ...paddingSchema, description: 'Extra large screens (1280px+) - optional override' },
  },
  required: ['xs'],
}

// =============================================================================
// Dimensions Types
// =============================================================================

/** JSON Schema for DimensionConstraint */
export const dimensionConstraintSchema = {
  type: 'object',
  properties: {
    value: { type: 'number', description: 'Numeric value' },
    unit: { type: 'string', enum: ['px', 'rem', '%', 'vw', 'vh'], description: 'CSS unit' },
    enabled: { type: 'boolean', description: 'Whether this constraint is active' },
  },
  required: ['value', 'unit', 'enabled'],
}

/** JSON Schema for DimensionsValue */
export const dimensionsSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string', enum: ['full', 'contained', 'custom'], description: 'Width mode' },
    alignment: { type: 'string', enum: ['left', 'center', 'right'], description: 'Content alignment' },
    maxWidth: { ...dimensionConstraintSchema, description: 'Maximum width constraint' },
    minWidth: { ...dimensionConstraintSchema, description: 'Minimum width constraint (optional)' },
    minHeight: { ...dimensionConstraintSchema, description: 'Minimum height constraint (optional)' },
    maxHeight: { ...dimensionConstraintSchema, description: 'Maximum height constraint (optional)' },
  },
  required: ['mode', 'alignment', 'maxWidth'],
}

/** JSON Schema for ResponsiveValue<DimensionsValue> */
export const responsiveDimensionsSchema = {
  type: 'object',
  properties: {
    xs: { ...dimensionsSchema, description: 'Base (mobile) value - required' },
    sm: { ...dimensionsSchema, description: 'Small screens (640px+) - optional override' },
    md: { ...dimensionsSchema, description: 'Medium screens (768px+) - optional override' },
    lg: { ...dimensionsSchema, description: 'Large screens (1024px+) - optional override' },
    xl: { ...dimensionsSchema, description: 'Extra large screens (1280px+) - optional override' },
  },
  required: ['xs'],
}

// =============================================================================
// Background Types
// =============================================================================

/** JSON Schema for GradientStop */
export const gradientStopSchema = {
  type: 'object',
  properties: {
    color: colorSchema,
    position: { type: 'number', minimum: 0, maximum: 100, description: 'Position 0-100%' },
  },
  required: ['color', 'position'],
}

/** JSON Schema for GradientValue */
export const gradientSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['linear', 'radial'], description: 'Gradient type' },
    angle: { type: 'number', minimum: 0, maximum: 360, description: 'Angle in degrees (linear)' },
    stops: { type: 'array', items: gradientStopSchema, description: 'Color stops' },
    radialShape: { type: 'string', enum: ['circle', 'ellipse'], description: 'Radial shape' },
    radialPosition: { type: 'string', enum: ['center', 'top', 'bottom', 'left', 'right'] },
  },
  required: ['type', 'stops'],
}

/** JSON Schema for BackgroundValue */
export const backgroundSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['none', 'solid', 'gradient', 'image'], description: 'Background type' },
    solid: { ...colorSchema, description: 'Solid color (when type="solid")' },
    gradient: { ...gradientSchema, description: 'Gradient (when type="gradient")' },
    // Note: image backgrounds require media selection, AI should use solid/gradient
  },
  required: ['type'],
}

// =============================================================================
// Border Types
// =============================================================================

/** JSON Schema for BorderValue */
export const borderSchema = {
  type: 'object',
  properties: {
    style: { type: 'string', enum: ['none', 'solid', 'dashed', 'dotted'], description: 'Border style' },
    width: { type: 'number', description: 'Border width in pixels' },
    color: { ...colorSchema, description: 'Border color' },
    radius: { type: 'number', description: 'Border radius in pixels' },
    sides: {
      type: 'object',
      properties: {
        top: { type: 'boolean' },
        right: { type: 'boolean' },
        bottom: { type: 'boolean' },
        left: { type: 'boolean' },
      },
      description: 'Which sides have borders',
    },
  },
  required: ['style', 'width', 'radius', 'sides'],
}

// =============================================================================
// Animation Types
// =============================================================================

/** JSON Schema for AnimationValue (simplified for AI) */
export const animationSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string', enum: ['preset', 'custom'], description: 'Animation mode' },
    entrance: {
      type: 'string',
      enum: ['none', 'fade-in', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'fade-scale',
             'scale-in', 'scale-up', 'scale-down', 'slide-up', 'slide-down', 'slide-left', 'slide-right'],
      description: 'Entrance animation preset',
    },
    entranceDuration: { type: 'number', description: 'Duration in ms, default 500' },
    entranceDelay: { type: 'number', description: 'Delay in ms, default 0' },
    triggerOnScroll: { type: 'boolean', description: 'Trigger when scrolled into view' },
    triggerOnce: { type: 'boolean', description: 'Only animate once' },
  },
}

// =============================================================================
// Visibility Types
// =============================================================================

/** JSON Schema for VisibilityValue */
export const visibilitySchema = {
  type: 'object',
  properties: {
    xs: { type: 'boolean', description: 'Visible on mobile (default true)' },
    sm: { type: 'boolean', description: 'Visible on small screens 640px+' },
    md: { type: 'boolean', description: 'Visible on medium screens 768px+' },
    lg: { type: 'boolean', description: 'Visible on large screens 1024px+' },
    xl: { type: 'boolean', description: 'Visible on extra large screens 1280px+' },
  },
  required: ['xs'],
}

// =============================================================================
// Size Types (for Button, etc.)
// =============================================================================

/** JSON Schema for SizeValue */
export const sizeSchema = {
  type: 'object',
  properties: {
    mode: { type: 'string', enum: ['sm', 'default', 'lg', 'custom'], description: 'Size preset or custom' },
    height: { type: 'number', description: 'Custom height in units (only when mode="custom")' },
    paddingX: { type: 'number', description: 'Custom horizontal padding (only when mode="custom")' },
    paddingY: { type: 'number', description: 'Custom vertical padding (only when mode="custom")' },
    fontSize: { type: 'number', description: 'Custom font size (only when mode="custom")' },
    unit: { type: 'string', enum: ['px', 'rem'], description: 'Unit for custom values' },
  },
  required: ['mode'],
}

// =============================================================================
// Transform Types
// =============================================================================

/** JSON Schema for TransformValue */
export const transformSchema = {
  type: 'object',
  properties: {
    rotate: { type: 'number', minimum: -360, maximum: 360, description: 'Rotation in degrees' },
    scaleX: { type: 'number', minimum: 0.1, maximum: 3, description: 'Horizontal scale factor' },
    scaleY: { type: 'number', minimum: 0.1, maximum: 3, description: 'Vertical scale factor' },
    scaleLocked: { type: 'boolean', description: 'Lock X and Y scale together' },
    skewX: { type: 'number', minimum: -45, maximum: 45, description: 'Horizontal skew in degrees' },
    skewY: { type: 'number', minimum: -45, maximum: 45, description: 'Vertical skew in degrees' },
    translateX: { type: 'number', description: 'Horizontal translation' },
    translateY: { type: 'number', description: 'Vertical translation' },
    translateUnit: { type: 'string', enum: ['px', 'rem', '%'], description: 'Unit for translation' },
    origin: {
      type: 'string',
      enum: ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
      description: 'Transform origin point',
    },
    enable3D: { type: 'boolean', description: 'Enable 3D transforms' },
    perspective: { type: 'number', description: '3D perspective in pixels' },
    rotateX: { type: 'number', description: '3D rotation around X axis' },
    rotateY: { type: 'number', description: '3D rotation around Y axis' },
  },
}
