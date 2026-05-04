import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const { amount } = await request.json();

  db.prepare(`UPDATE budgets SET amount = ? WHERE id = ?`).run(amount, id);
  return NextResponse.json(db.prepare('SELECT * FROM budgets WHERE id = ?').get(id));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  getDb().prepare('DELETE FROM budgets WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
