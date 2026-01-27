'use client'

/**
 * AnimatedWrapper - Client component for scroll-triggered animations
 *
 * Wraps children with animation support using IntersectionObserver.
 * Handles both preset entrance animations and custom transitions.
 * Supports 27 animation presets with customizable intensity, easing, and origin.
 */

import type { ReactNode, CSSProperties, ElementType } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'
import {
  getEntranceAnimationStyles,
  animationValueToCSS,
  type AnimationValue,
} from '../fields/shared.js'

export interface AnimatedWrapperProps {
  /** Animation configuration from the component */
  animation: AnimationValue | null | undefined
  /** Child content to animate */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Inline styles */
  style?: CSSProperties
  /** HTML element to render as (default: 'div') */
  as?: ElementType
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
export function AnimatedWrapper({
  animation,
  children,
  className,
  style,
  as: Component = 'div',
}: AnimatedWrapperProps) {
  // Check if animation should be applied
  const hasAnimation = animation && (
    (animation.mode === 'preset' && animation.entrance && animation.entrance !== 'none') ||
    animation.mode === 'custom'
  )

  // If no animation, render children directly without wrapper
  if (!hasAnimation) {
    // If there's a className or style, we still need to wrap
    if (className || style) {
      return <Component className={className} style={style}>{children}</Component>
    }
    return <>{children}</>
  }

  // Use the scroll animation hook
  const { ref, isInView } = useScrollAnimation({
    triggerOnScroll: animation.triggerOnScroll ?? true,
    threshold: animation.triggerThreshold ?? 0.1,
    once: animation.triggerOnce ?? true,
    rootMargin: animation.triggerMargin,
  })

  // Handle preset entrance animations
  if (animation.mode === 'preset') {
    const { initial, animate, duration, delay, easing, origin } = getEntranceAnimationStyles(animation)

    // Apply initial or animate styles based on visibility
    const animationStyles = isInView ? animate : initial

    // Build transition string with all relevant properties
    const transitionProperties = [
      `opacity ${duration}ms ${easing} ${delay}ms`,
      `transform ${duration}ms ${easing} ${delay}ms`,
      `filter ${duration}ms ${easing} ${delay}ms`,
    ].join(', ')

    return (
      <Component
        ref={ref}
        className={className}
        style={{
          ...style,
          ...animationStyles,
          transition: transitionProperties,
          transformOrigin: origin,
        }}
      >
        {children}
      </Component>
    )
  }

  // Handle custom transition mode
  const customStyles = animationValueToCSS(animation)

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        ...style,
        ...customStyles,
        // Apply opacity for visibility-based transitions
        opacity: isInView ? 1 : 0,
      }}
    >
      {children}
    </Component>
  )
}
