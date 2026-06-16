import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const GET = safeHandler(async () => {
  const goals = getDb().prepare('SELECT * FROM goals ORDER BY created_at DESC').all();
  return NextResponse.json(goals);
});

export const POST = safeHandler(async (request: Request) => {
  const db = getDb();
  const { name, target_amount, deadline, icon, color, notes } = await request.json();
  const result = db.prepare(
    `INSERT INTO goals (name, target_amount, deadline, icon, color, notes) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(name, target_amount, deadline || null, icon || '🎯', color || '#6366F1', notes || null);
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(goal, { status: 201 });
});
