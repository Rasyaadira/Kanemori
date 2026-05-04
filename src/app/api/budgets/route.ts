import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  if (!month) return NextResponse.json([]);

  const budgets = db.prepare(
    `SELECT b.*, c.name, c.icon, c.color,
            COALESCE((SELECT SUM(t.amount) FROM transactions t
             WHERE t.type = 'expense' AND t.category_id = b.category_id
             AND strftime('%Y-%m', t.date) = b.month), 0) as spent
     FROM budgets b JOIN categories c ON b.category_id = c.id
     WHERE b.month = ? ORDER BY spent DESC`
  ).all(month);
  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { category_id, month, amount } = await request.json();
    db.prepare(
      `INSERT OR REPLACE INTO budgets (category_id, month, amount) VALUES (?, ?, ?)`
    ).run(category_id, month, amount);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
