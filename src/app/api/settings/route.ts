import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const GET = safeHandler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return NextResponse.json(settings);
});

export const PUT = safeHandler(async (request: Request) => {
  const db = getDb();
  const body = await request.json();
  const { key, value } = body;
  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
  return NextResponse.json({ success: true });
});
