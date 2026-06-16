import { NextResponse } from 'next/server';
import { checkpointForBackup } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';
import fs from 'fs';

export const GET = safeHandler(async () => {
  // Checkpoint WAL to ensure backup gets ALL committed data
  const dbPath = checkpointForBackup();

  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: 'Database not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(dbPath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="finance-backup-${new Date().toISOString().slice(0, 10)}.db"`,
    },
  });
});
