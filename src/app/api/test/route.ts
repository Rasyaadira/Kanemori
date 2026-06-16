import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const GET = safeHandler(async () => {
  const db = getDb();
  // Run integrity check for diagnostics
  const integrity = db.pragma('integrity_check') as Array<{ integrity_check: string }>;
  const isHealthy = integrity.length === 1 && integrity[0].integrity_check === 'ok';

  return NextResponse.json({
    success: true,
    healthy: isHealthy,
    integrity: integrity.map((r) => r.integrity_check),
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});
