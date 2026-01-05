/**
 * Ambient type declaration for @payload-config
 *
 * This module is provided by the consuming project and resolves to their Payload config.
 * The consuming project should have this alias configured in their tsconfig.json:
 *
 * {
 *   "compilerOptions": {
 *     "paths": {
 *       "@payload-config": ["./src/payload.config.ts"]
 *     }
 *   }
 * }
 */
declare module '@payload-config' {
  import type { SanitizedConfig } from 'payload'

  const config: Promise<SanitizedConfig>
  export default config
}
