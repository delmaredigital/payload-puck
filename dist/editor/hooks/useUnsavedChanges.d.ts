export interface UseUnsavedChangesReturn {
    hasUnsavedChanges: boolean;
    markClean: () => void;
    markDirty: () => void;
}
/**
 * Hook to track unsaved changes and warn before navigation
 *
 * Registers a beforeunload handler to prevent accidental navigation
 * when there are unsaved changes.
 *
 * @example
 * ```tsx
 * const { hasUnsavedChanges, markClean, markDirty } = useUnsavedChanges()
 *
 * const handleChange = () => {
 *   markDirty()
 * }
 *
 * const handleSave = async () => {
 *   await save()
 *   markClean()
 * }
 * ```
 */
export declare function useUnsavedChanges(): UseUnsavedChangesReturn;
//# sourceMappingURL=useUnsavedChanges.d.ts.map