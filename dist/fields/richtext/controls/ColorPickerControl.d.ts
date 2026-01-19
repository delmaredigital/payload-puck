import type { Editor } from '@tiptap/react';
interface ColorPickerControlProps {
    editor: Editor;
    currentColor: string | undefined;
}
export declare function ColorPickerControl({ editor, currentColor }: ColorPickerControlProps): import("react/jsx-runtime").JSX.Element;
interface ColorPickerPanelProps {
    currentColor: string | undefined;
    onColorChange: (color: string | null) => void;
    onClose: () => void;
    mode: 'text' | 'highlight';
    showOpacity?: boolean;
}
export declare function ColorPickerPanel({ currentColor, onColorChange, onClose, mode, showOpacity, }: ColorPickerPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ColorPickerControl.d.ts.map