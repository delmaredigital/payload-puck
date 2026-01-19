'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useCallback, memo, useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { ANIMATION_CATEGORIES, DEFAULT_ANIMATION, getRelevantIntensityControls, getDefaultEasingForAnimation, } from './shared';
// =============================================================================
// Easing Options
// =============================================================================
const EASING_OPTIONS = [
    // Standard
    { value: 'linear', label: 'Linear', group: 'Standard' },
    { value: 'ease', label: 'Ease', group: 'Standard' },
    { value: 'ease-in', label: 'Ease In', group: 'Standard' },
    { value: 'ease-out', label: 'Ease Out', group: 'Standard' },
    { value: 'ease-in-out', label: 'Ease In Out', group: 'Standard' },
    // Spring/Bounce
    { value: 'spring', label: 'Spring', group: 'Spring' },
    { value: 'spring-gentle', label: 'Spring Gentle', group: 'Spring' },
    { value: 'bounce', label: 'Bounce', group: 'Spring' },
    { value: 'bounce-in', label: 'Bounce In', group: 'Spring' },
    { value: 'bounce-out', label: 'Bounce Out', group: 'Spring' },
    // Back
    { value: 'back-in', label: 'Back In', group: 'Back' },
    { value: 'back-out', label: 'Back Out', group: 'Back' },
    { value: 'back-in-out', label: 'Back In Out', group: 'Back' },
    // Elastic
    { value: 'elastic', label: 'Elastic', group: 'Elastic' },
];
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-800)',
    },
    clearButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        padding: 0,
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    sectionLabel: {
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--theme-elevation-500)',
    },
    select: {
        width: '100%',
        height: '36px',
        padding: '0 8px',
        fontSize: '14px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    selectSmall: {
        width: '100%',
        height: '32px',
        padding: '0 8px',
        fontSize: '14px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    controlsPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '6px',
    },
    collapsibleContainer: {
        border: '1px solid var(--theme-elevation-100)',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    collapsibleHeader: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--theme-elevation-50)',
        border: 'none',
        cursor: 'pointer',
    },
    collapsibleTitle: {
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--theme-elevation-500)',
    },
    collapsibleContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
    },
    sliderRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    sliderHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sliderValue: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    slider: {
        width: '100%',
        height: '6px',
        accentColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    sliderDisabled: {
        cursor: 'not-allowed',
        opacity: 0.5,
    },
    originGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
        width: '96px',
    },
    originButton: {
        width: '28px',
        height: '28px',
        padding: 0,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-50)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    originButtonActive: {
        width: '28px',
        height: '28px',
        padding: 0,
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    originDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--theme-elevation-400)',
    },
    originDotActive: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--theme-bg)',
    },
    originDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    checkboxRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    checkbox: {
        width: '16px',
        height: '16px',
        accentColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '14px',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    helpText: {
        fontSize: '10px',
        color: 'var(--theme-elevation-500)',
        marginTop: '-8px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
};
function CollapsibleSection({ title, defaultOpen = false, children }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (_jsxs("div", { style: styles.collapsibleContainer, children: [_jsxs("button", { type: "button", onClick: () => setIsOpen(!isOpen), style: styles.collapsibleHeader, children: [_jsx("span", { style: styles.collapsibleTitle, children: title }), isOpen ? (_jsx(ChevronDown, { style: { width: '14px', height: '14px', color: 'var(--theme-elevation-500)' } })) : (_jsx(ChevronRight, { style: { width: '14px', height: '14px', color: 'var(--theme-elevation-500)' } }))] }), isOpen && _jsx("div", { style: styles.collapsibleContent, children: children })] }));
}
function OriginGrid({ value, onChange, disabled }) {
    const origins = [
        'top-left', 'top', 'top-right',
        'left', 'center', 'right',
        'bottom-left', 'bottom', 'bottom-right',
    ];
    return (_jsx("div", { style: styles.originGrid, children: origins.map((origin) => {
            const isActive = value === origin;
            return (_jsx("button", { type: "button", onClick: () => onChange(origin), disabled: disabled, style: {
                    ...(isActive ? styles.originButtonActive : styles.originButton),
                    ...(disabled ? styles.originDisabled : {}),
                }, title: origin.replace('-', ' '), children: _jsx("span", { style: isActive ? styles.originDotActive : styles.originDot }) }, origin));
        }) }));
}
function SliderRow({ label, value, min, max, step = 1, unit = '', onChange, disabled }) {
    return (_jsxs("div", { style: styles.sliderRow, children: [_jsxs("div", { style: styles.sliderHeader, children: [_jsx("label", { style: styles.sectionLabel, children: label }), _jsxs("span", { style: styles.sliderValue, children: [value, unit] })] }), _jsx("input", { type: "range", min: min, max: max, step: step, value: value, onChange: (e) => onChange(Number(e.target.value)), disabled: disabled, style: {
                    ...styles.slider,
                    ...(disabled ? styles.sliderDisabled : {}),
                } })] }));
}
// =============================================================================
// AnimationField Component
// =============================================================================
function AnimationFieldInner({ value, onChange, label = 'Animation', readOnly, showStagger = false, }) {
    const currentValue = value || DEFAULT_ANIMATION;
    // Get which intensity controls to show based on animation type
    const intensityControls = getRelevantIntensityControls(currentValue.entrance || 'none');
    const hasIntensityControls = Object.values(intensityControls).some(Boolean);
    // Helpers to update specific fields
    const updateField = useCallback((key, val) => {
        onChange({
            ...currentValue,
            [key]: val,
        });
    }, [currentValue, onChange]);
    // Handle entrance animation change - also update default easing
    const handleEntranceChange = useCallback((entrance) => {
        const defaultEasing = getDefaultEasingForAnimation(entrance);
        onChange({
            ...currentValue,
            entrance,
            // Only set default easing if current is 'ease' (not explicitly set)
            easing: currentValue.easing === 'ease' ? defaultEasing : currentValue.easing,
        });
    }, [currentValue, onChange]);
    // Handle stagger config updates
    const updateStagger = useCallback((updates) => {
        onChange({
            ...currentValue,
            stagger: {
                enabled: currentValue.stagger?.enabled ?? false,
                delay: currentValue.stagger?.delay ?? 100,
                direction: currentValue.stagger?.direction ?? 'forward',
                ...currentValue.stagger,
                ...updates,
            },
        });
    }, [currentValue, onChange]);
    // Handle clear
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const thresholdPercent = Math.round((currentValue.triggerThreshold ?? 0.1) * 100);
    // Format animation label
    const formatAnimationLabel = (anim) => {
        if (anim === 'none')
            return 'None';
        return anim
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.sectionLabel, children: "Animation" }), _jsx("select", { value: currentValue.entrance || 'none', onChange: (e) => handleEntranceChange(e.target.value), disabled: readOnly, style: styles.select, children: ANIMATION_CATEGORIES.map(({ category, label: catLabel, animations }) => (_jsx("optgroup", { label: catLabel, children: animations.map((anim) => (_jsx("option", { value: anim, children: formatAnimationLabel(anim) }, anim))) }, category))) })] }), currentValue.entrance && currentValue.entrance !== 'none' && (_jsxs(_Fragment, { children: [_jsxs("div", { style: styles.controlsPanel, children: [_jsx(SliderRow, { label: "Duration", value: currentValue.entranceDuration ?? 500, min: 100, max: 2000, step: 50, unit: "ms", onChange: (v) => updateField('entranceDuration', v), disabled: readOnly }), _jsx(SliderRow, { label: "Delay", value: currentValue.entranceDelay ?? 0, min: 0, max: 2000, step: 50, unit: "ms", onChange: (v) => updateField('entranceDelay', v), disabled: readOnly })] }), hasIntensityControls && (_jsxs(CollapsibleSection, { title: "Intensity", children: [intensityControls.showDistance && (_jsx(SliderRow, { label: "Distance", value: currentValue.distance ?? 24, min: 8, max: 200, step: 4, unit: "px", onChange: (v) => updateField('distance', v), disabled: readOnly })), intensityControls.showScale && (_jsx(SliderRow, { label: "Scale From", value: Math.round((currentValue.scaleFrom ?? 0.9) * 100), min: 10, max: 200, step: 5, unit: "%", onChange: (v) => updateField('scaleFrom', v / 100), disabled: readOnly })), intensityControls.showRotate && (_jsx(SliderRow, { label: "Rotation", value: currentValue.rotateAngle ?? 15, min: -180, max: 180, step: 5, unit: "deg", onChange: (v) => updateField('rotateAngle', v), disabled: readOnly })), intensityControls.showBlur && (_jsx(SliderRow, { label: "Blur", value: currentValue.blurAmount ?? 8, min: 0, max: 50, step: 1, unit: "px", onChange: (v) => updateField('blurAmount', v), disabled: readOnly }))] })), _jsx(CollapsibleSection, { title: "Transform Origin", children: _jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(OriginGrid, { value: currentValue.origin ?? 'center', onChange: (v) => updateField('origin', v), disabled: readOnly }) }) }), _jsxs(CollapsibleSection, { title: "Easing", children: [_jsx("select", { value: currentValue.easing || 'ease', onChange: (e) => updateField('easing', e.target.value), disabled: readOnly, style: styles.selectSmall, children: ['Standard', 'Spring', 'Back', 'Elastic'].map((group) => (_jsx("optgroup", { label: group, children: EASING_OPTIONS.filter(e => e.group === group).map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) }, group))) }), _jsx("p", { style: styles.helpText, children: "Spring and bounce easings create overshoot effects" })] }), _jsx(CollapsibleSection, { title: "Scroll Trigger", defaultOpen: true, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", id: "trigger-on-scroll", checked: currentValue.triggerOnScroll ?? true, onChange: (e) => updateField('triggerOnScroll', e.target.checked), disabled: readOnly, style: styles.checkbox }), _jsx("label", { htmlFor: "trigger-on-scroll", style: styles.checkboxLabel, children: "Trigger on scroll" })] }), currentValue.triggerOnScroll && (_jsxs(_Fragment, { children: [_jsx(SliderRow, { label: "Threshold", value: thresholdPercent, min: 0, max: 100, step: 5, unit: "%", onChange: (v) => updateField('triggerThreshold', v / 100), disabled: readOnly }), _jsx("p", { style: styles.helpText, children: "Element visibility % before animation triggers" }), _jsxs("div", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", id: "animate-once", checked: currentValue.triggerOnce ?? true, onChange: (e) => updateField('triggerOnce', e.target.checked), disabled: readOnly, style: styles.checkbox }), _jsx("label", { htmlFor: "animate-once", style: styles.checkboxLabel, children: "Animate only once" })] })] }))] }) }), showStagger && (_jsx(CollapsibleSection, { title: "Stagger Children", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", id: "stagger-enabled", checked: currentValue.stagger?.enabled ?? false, onChange: (e) => updateStagger({ enabled: e.target.checked }), disabled: readOnly, style: styles.checkbox }), _jsx("label", { htmlFor: "stagger-enabled", style: styles.checkboxLabel, children: "Enable stagger" })] }), currentValue.stagger?.enabled && (_jsxs(_Fragment, { children: [_jsx(SliderRow, { label: "Delay Between", value: currentValue.stagger?.delay ?? 100, min: 50, max: 500, step: 25, unit: "ms", onChange: (v) => updateStagger({ delay: v }), disabled: readOnly }), _jsx(SliderRow, { label: "Max Total Delay", value: currentValue.stagger?.maxDelay ?? 2000, min: 500, max: 5000, step: 100, unit: "ms", onChange: (v) => updateStagger({ maxDelay: v }), disabled: readOnly }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.sectionLabel, children: "Direction" }), _jsxs("select", { value: currentValue.stagger?.direction ?? 'forward', onChange: (e) => updateStagger({ direction: e.target.value }), disabled: readOnly, style: styles.selectSmall, children: [_jsx("option", { value: "forward", children: "Forward" }), _jsx("option", { value: "reverse", children: "Reverse" }), _jsx("option", { value: "center", children: "From Center" }), _jsx("option", { value: "edges", children: "From Edges" })] })] })] }))] }) }))] }))] }));
}
export const AnimationField = memo(AnimationFieldInner);
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
export function createAnimationField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(AnimationField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, showStagger: config.showStagger })),
    };
}
//# sourceMappingURL=AnimationField.js.map