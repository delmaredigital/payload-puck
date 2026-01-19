/**
 * Puck API Endpoint Handlers
 *
 * These handlers are registered via config.endpoints in the plugin.
 * They provide CRUD operations for Puck-enabled collections.
 */
import type { PayloadHandler } from 'payload';
export interface PuckEndpointOptions {
    collections: string[];
}
/**
 * GET /api/puck/:collection
 * List all documents in a Puck-enabled collection
 */
export declare function createListHandler(options: PuckEndpointOptions): PayloadHandler;
/**
 * POST /api/puck/:collection
 * Create a new document in a Puck-enabled collection
 */
export declare function createCreateHandler(options: PuckEndpointOptions): PayloadHandler;
/**
 * GET /api/puck/:collection/:id
 * Get a single document by ID
 */
export declare function createGetHandler(options: PuckEndpointOptions): PayloadHandler;
/**
 * PATCH /api/puck/:collection/:id
 * Update a document (supports draft saving and publishing)
 */
export declare function createUpdateHandler(options: PuckEndpointOptions): PayloadHandler;
/**
 * DELETE /api/puck/:collection/:id
 * Delete a document
 */
export declare function createDeleteHandler(options: PuckEndpointOptions): PayloadHandler;
/**
 * GET /api/puck/:collection/:id/versions
 * Get version history for a document
 */
export declare function createVersionsHandler(options: PuckEndpointOptions): PayloadHandler;
/**
 * POST /api/puck/:collection/:id/restore
 * Restore a specific version
 */
export declare function createRestoreHandler(options: PuckEndpointOptions): PayloadHandler;
//# sourceMappingURL=index.d.ts.map