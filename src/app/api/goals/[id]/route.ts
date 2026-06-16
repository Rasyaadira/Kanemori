import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const PUT = safeHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const existing = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as
    | { icon: string | null; color: string | null; status: string; notes: string | null }
    | undefined;

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db.prepare(
    `UPDATE goals SET name=?, target_amount=?, deadline=?, icon=?, color=?, status=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).run(
    body.name,
    body.target_amount,
    body.deadline || null,
    body.icon ?? existing.icon ?? '🎯',
    body.color ?? existing.color ?? '#6366F1',
    body.status ?? existing.status ?? 'active',
    body.notes ?? existing.notes ?? null,
    id
  );
  return NextResponse.json(db.prepare('SELECT * FROM goals WHERE id = ?').get(id));
});

export const DELETE = safeHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();

  const txn = db.transaction(() => {
    db.prepare('DELETE FROM goal_fundings WHERE goal_id = ?').run(id);
    db.prepare('DELETE FROM goals WHERE id = ?').run(id);
  });

  txn();
  return NextResponse.json({ success: true });
});
