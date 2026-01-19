/**
 * FontSize Extension for TipTap
 *
 * Custom TipTap extension that adds font-size support via inline styles.
 * Used with Puck's native richtext field via tiptap.extensions.
 */
import { Extension } from '@tiptap/core';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size (e.g., '1.5rem', '24px', '1.25em')
             */
            setFontSize: (size: string) => ReturnType;
            /**
             * Remove the font size (revert to default)
             */
            unsetFontSize: () => ReturnType;
        };
    }
}
export declare const FontSize: Extension<any, any>;
//# sourceMappingURL=FontSize.d.ts.map