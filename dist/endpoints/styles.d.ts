/**
 * Styles Endpoint Handler
 *
 * Compiles and serves CSS for the editor iframe.
 * Uses the consumer's PostCSS/Tailwind installation via peer dependencies.
 * Loads the project's postcss.config.js for proper plugin configuration.
 */
import type { PayloadHandler } from 'payload';
/**
 * Creates a handler that serves compiled CSS for the editor iframe
 *
 * @param cssFilePath - Path to CSS file relative to project root
 * @returns PayloadHandler that serves compiled CSS
 */
export declare function createStylesHandler(cssFilePath: string): PayloadHandler;
/**
 * Helper constant for the styles endpoint URL
 */
export declare const PUCK_STYLES_ENDPOINT = "/api/puck/styles";
//# sourceMappingURL=styles.d.ts.map