import { NextResponse } from 'next/server';

/**
 * Wraps an API handler with comprehensive error handling.
 * Catches ALL errors — including native module crashes, DB corruption,
 * and unexpected runtime errors — and returns a proper JSON error response
 * instead of crashing the server process.
 * 
 * Usage:
 *   export const GET = safeHandler(async (request) => {
 *     // ... your handler logic ...
 *     return NextResponse.json(data);
 *   });
 */
export function safeHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const message = err.message || 'Internal server error';
      const code = (err as NodeJS.ErrnoException).code;

      // Log full stack for debugging
      console.error(`[API Error] ${message}`, err.stack || '');

      // Determine appropriate status code and user-friendly message
      if (code === 'ERR_DLOPEN_FAILED') {
        // Native module issue (better-sqlite3 needs rebuild)
        return NextResponse.json(
          {
            error: 'Database engine needs to be recompiled. Please run: npm rebuild better-sqlite3',
            code: 'NATIVE_MODULE_ERROR',
          },
          { status: 503 }
        );
      }

      if (message.includes('database is locked') || message.includes('SQLITE_BUSY')) {
        return NextResponse.json(
          { error: 'Database is busy, please try again', code: 'DB_BUSY' },
          { status: 503 }
        );
      }

      if (message.includes('database disk image is malformed') || message.includes('SQLITE_CORRUPT')) {
        return NextResponse.json(
          { error: 'Database may be corrupted. Please restore from backup.', code: 'DB_CORRUPT' },
          { status: 500 }
        );
      }

      if (message.includes('Not found')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      // Generic error
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }
  };
}
