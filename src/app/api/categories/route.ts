import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const categories = db.prepare(
    'SELECT * FROM categories ORDER BY type ASC, sort_order ASC, name ASC'
  ).all();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name, type, icon, color, parent_id } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const result = db.prepare(
      `INSERT INTO categories (name, type, icon, color, parent_id) VALUES (?, ?, ?, ?, ?)`
    ).run(name, type, icon || null, color || null, parent_id || null);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
