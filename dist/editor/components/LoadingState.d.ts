export interface LoadingStateProps {
    /**
     * Loading message to display
     * @default 'Loading editor...'
     */
    message?: string;
}
/**
 * Loading indicator shown while the Puck editor is being loaded
 *
 * Used as the fallback for dynamic import with ssr: false
 */
export declare function LoadingState({ message }: LoadingStateProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=LoadingState.d.ts.map