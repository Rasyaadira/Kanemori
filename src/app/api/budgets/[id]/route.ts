import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const PUT = safeHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const { amount } = await request.json();

  db.prepare(`UPDATE budgets SET amount = ? WHERE id = ?`).run(amount, id);
  return NextResponse.json(db.prepare('SELECT * FROM budgets WHERE id = ?').get(id));
});

export const DELETE = safeHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  getDb().prepare('DELETE FROM budgets WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
});
