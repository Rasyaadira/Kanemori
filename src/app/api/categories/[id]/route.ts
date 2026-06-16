import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const PUT = safeHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const { name, type, icon, color, parent_id, is_active } = body;

  db.prepare(
    `UPDATE categories SET name=?, type=?, icon=?, color=?, parent_id=?, is_active=? WHERE id=?`
  ).run(name, type, icon || null, color || null, parent_id || null, is_active ?? 1, id);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  return NextResponse.json(category);
});

export const DELETE = safeHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
});
