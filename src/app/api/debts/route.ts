import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const GET = safeHandler(async () => {
  const debts = getDb().prepare('SELECT * FROM debts ORDER BY created_at DESC').all();
  return NextResponse.json(debts);
});

export const POST = safeHandler(async (request: Request) => {
  const db = getDb();
  const { type, person_name, origin_type, start_date, due_date, total_amount, notes } = await request.json();
  const result = db.prepare(
    `INSERT INTO debts (type, person_name, origin_type, start_date, due_date, total_amount, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(type, person_name, origin_type || 'manual_entry', start_date, due_date || null, total_amount, notes || null);
  return NextResponse.json(db.prepare('SELECT * FROM debts WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
});
