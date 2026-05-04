import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const accountId = searchParams.get('account_id');
  const categoryId = searchParams.get('category_id');
  const search = searchParams.get('search');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let where = '1=1';
  const params: (string | number)[] = [];

  if (type) { where += ' AND t.type = ?'; params.push(type); }
  if (accountId) { where += ' AND (t.from_account_id = ? OR t.to_account_id = ?)'; params.push(accountId, accountId); }
  if (categoryId) { where += ' AND t.category_id = ?'; params.push(categoryId); }
  if (search) { where += ' AND t.name LIKE ?'; params.push(`%${search}%`); }
  if (startDate) { where += ' AND t.date >= ?'; params.push(startDate); }
  if (endDate) { where += ' AND t.date <= ?'; params.push(endDate); }

  const transactions = db.prepare(
    `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
            fa.name as from_account_name, ta.name as to_account_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN accounts fa ON t.from_account_id = fa.id
     LEFT JOIN accounts ta ON t.to_account_id = ta.id
     WHERE ${where}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  const countResult = db.prepare(
    `SELECT COUNT(*) as total FROM transactions t WHERE ${where}`
  ).get(...params) as { total: number };

  return NextResponse.json({ transactions, total: countResult.total });
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { type, name, date, amount, admin_fee, from_account_id, to_account_id, category_id, notes, location } = body;

    if (!type || !name || !date || !amount) {
      return NextResponse.json({ error: 'Type, name, date, and amount are required' }, { status: 400 });
    }

    const txn = db.transaction(() => {
      const result = db.prepare(
        `INSERT INTO transactions (type, name, date, amount, admin_fee, from_account_id, to_account_id, category_id, notes, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(type, name, date, amount, admin_fee || 0, from_account_id || null, to_account_id || null, category_id || null, notes || null, location || null);

      // Update account balances
      if (type === 'expense' && from_account_id) {
        db.prepare('UPDATE accounts SET balance = balance - ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(amount, from_account_id);
      } else if (type === 'income' && to_account_id) {
        db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(amount, to_account_id);
      } else if (type === 'transfer' && from_account_id && to_account_id) {
        const totalDeducted = amount + (admin_fee || 0);
        db.prepare('UPDATE accounts SET balance = balance - ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(totalDeducted, from_account_id);
        db.prepare('UPDATE accounts SET balance = balance + ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(amount, to_account_id);
      }

      return result.lastInsertRowid;
    });

    const newId = txn();
    const transaction = db.prepare(
      `SELECT t.*, c.name as category_name, c.icon as category_icon,
              fa.name as from_account_name, ta.name as to_account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts fa ON t.from_account_id = fa.id
       LEFT JOIN accounts ta ON t.to_account_id = ta.id
       WHERE t.id = ?`
    ).get(newId);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
