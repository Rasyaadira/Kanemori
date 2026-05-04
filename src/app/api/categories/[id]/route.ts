import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();
    const { name, type, icon, color, parent_id, is_active } = body;

    db.prepare(
      `UPDATE categories SET name=?, type=?, icon=?, color=?, parent_id=?, is_active=? WHERE id=?`
    ).run(name, type, icon || null, color || null, parent_id || null, is_active ?? 1, id);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
