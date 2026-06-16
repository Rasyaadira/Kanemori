import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const PUT = safeHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const { person_name, origin_type, total_amount, start_date, due_date, notes } = body;

  const existing = db.prepare('SELECT * FROM debts WHERE id = ?').get(id) as
    | { start_date: string }
    | undefined;

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db.prepare(
    `UPDATE debts SET person_name=?, origin_type=?, total_amount=?, start_date=?, due_date=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).run(person_name, origin_type, total_amount, start_date || existing.start_date, due_date || null, notes || null, id);

  const debt = db.prepare('SELECT * FROM debts WHERE id = ?').get(id);
  return NextResponse.json(debt);
});

export const DELETE = safeHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  getDb().prepare("UPDATE debts SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
});
