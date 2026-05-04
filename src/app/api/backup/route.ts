import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'data', 'finance.db');
  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: 'Database not found' }, { status: 404 });
  }
  const buffer = fs.readFileSync(dbPath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="finance-backup-${new Date().toISOString().slice(0,10)}.db"`,
    },
  });
}
