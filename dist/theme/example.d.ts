/**
 * Example Theme Configuration
 *
 * Copy this file to your project and customize it to match your design system.
 *
 * Usage:
 * 1. Copy this file to your project (e.g., src/lib/puck-theme.ts)
 * 2. Customize the values to match your CSS variables/design tokens
 * 3. Import and pass to PageRenderer or PuckEditor:
 *
 * ```tsx
 * import { puckTheme } from '@/lib/puck-theme'
 *
 * <PageRenderer data={data} config={config} theme={puckTheme} />
 * ```
 */
import type { ThemeConfig } from './types';
/**
 * Example theme using shadcn/ui CSS variables
 *
 * This example assumes you have CSS variables like:
 * --primary, --primary-foreground
 * --secondary, --secondary-foreground
 * --accent, --accent-foreground
 * --muted, --muted-foreground
 * --destructive, --destructive-foreground
 * --ring (for focus rings)
 */
export declare const exampleTheme: ThemeConfig;
//# sourceMappingURL=example.d.ts.map