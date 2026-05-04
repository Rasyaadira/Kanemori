import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const goals = getDb().prepare('SELECT * FROM goals ORDER BY created_at DESC').all();
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { name, target_amount, deadline, icon, color, notes } = await request.json();
    const result = db.prepare(
      `INSERT INTO goals (name, target_amount, deadline, icon, color, notes) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(name, target_amount, deadline || null, icon || '🎯', color || '#6366F1', notes || null);
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
