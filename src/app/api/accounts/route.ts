import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const accounts = db.prepare(
    'SELECT * FROM accounts ORDER BY sort_order ASC, created_at DESC'
  ).all();
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name, type, icon, color, balance, notes } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const result = db.prepare(
      `INSERT INTO accounts (name, type, icon, color, balance, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(name, type, icon || null, color || null, balance || 0, notes || null);

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
