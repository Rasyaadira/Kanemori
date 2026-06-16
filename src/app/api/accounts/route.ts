import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const GET = safeHandler(async () => {
  const db = getDb();
  const accounts = db.prepare(
    'SELECT * FROM accounts ORDER BY sort_order ASC, created_at DESC'
  ).all();
  return NextResponse.json(accounts);
});

export const POST = safeHandler(async (request: Request) => {
  const db = getDb();
  const body = await request.json();
  const { name, type, icon, color, balance, notes } = body;

  if (!name || !type) {
    return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
  }

  const result = db.prepare(
    `INSERT INTO accounts (name, type, icon, color, balance, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(name, type, icon || null, color || null, balance || 0, notes || null);

  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(account, { status: 201 });
});
