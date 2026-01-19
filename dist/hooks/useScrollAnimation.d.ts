export interface UseScrollAnimationOptions {
    /**
     * Whether to trigger animation on scroll into view.
     * If false, isInView will always be true.
     * @default true
     */
    triggerOnScroll?: boolean;
    /**
     * Threshold for intersection (0-1).
     * 0 = trigger as soon as any pixel is visible.
     * 1 = trigger only when fully visible.
     * @default 0.1
     */
    threshold?: number;
    /**
     * Whether to only trigger once.
     * If true, hasAnimated will stay true after first trigger.
     * @default true
     */
    once?: boolean;
    /**
     * Root margin for intersection observer.
     * Allows triggering before/after the element enters the viewport.
     * @example "-50px" // Trigger 50px before entering viewport
     * @example "100px 0px" // 100px top/bottom, 0px left/right
     * @default "0px"
     */
    rootMargin?: string;
    /**
     * Delay in milliseconds before setting isInView to true.
     * Useful for staggering animations.
     * @default 0
     */
    delay?: number;
}
export interface UseScrollAnimationResult<T extends HTMLElement = HTMLElement> {
    /**
     * Ref to attach to the element you want to observe
     */
    ref: React.RefObject<T | null>;
    /**
     * Whether the element is currently in view
     */
    isInView: boolean;
    /**
     * Whether the element has ever been in view
     * (useful for once-only animations)
     */
    hasAnimated: boolean;
    /**
     * Manually reset the animation state
     */
    reset: () => void;
}
export declare function useScrollAnimation<T extends HTMLElement = HTMLElement>(options?: UseScrollAnimationOptions): UseScrollAnimationResult<T>;
//# sourceMappingURL=useScrollAnimation.d.ts.map