import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import Database from 'better-sqlite3';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'data', 'finance.db');
  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: 'Database not found' }, { status: 404 });
  }

  const backupName = `finance-backup-${new Date().toISOString().slice(0, 10)}.db`;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kanemori-backup-'));
  const tempPath = path.join(tempDir, backupName);

  try {
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });
    try {
      await db.backup(tempPath);
    } finally {
      db.close();
    }

    const buffer = fs.readFileSync(tempPath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.sqlite3',
        'Content-Disposition': `attachment; filename="${backupName}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
