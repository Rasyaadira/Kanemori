import { NextResponse } from 'next/server';
import { invalidateDbConnection } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';
import path from 'path';
import fs from 'fs';

export const POST = safeHandler(async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  // Basic SQLite validation — check magic header bytes
  const SQLITE_MAGIC = 'SQLite format 3\0';
  const header = buffer.subarray(0, 16).toString('ascii');
  if (header !== SQLITE_MAGIC) {
    return NextResponse.json({ error: 'Invalid SQLite database file' }, { status: 400 });
  }

  const dbDir = path.join(process.cwd(), 'data');
  const dbPath = path.join(dbDir, 'finance.db');

  // Close the cached connection BEFORE writing to prevent corruption
  invalidateDbConnection();

  // Backup current before overwriting
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, dbPath + '.bak');
  }

  // Remove WAL and SHM files from old connection
  try { fs.unlinkSync(dbPath + '-wal'); } catch { /* ok if not exists */ }
  try { fs.unlinkSync(dbPath + '-shm'); } catch { /* ok if not exists */ }

  fs.writeFileSync(dbPath, buffer);
  return NextResponse.json({ success: true });
});
