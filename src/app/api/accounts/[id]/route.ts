import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const GET = safeHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as any;
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Calculate tracked balance from transactions
  const incoming = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE to_account_id = ?`
  ).get(id) as { total: number };

  const outgoing = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE from_account_id = ?`
  ).get(id) as { total: number };

  const adminFees = db.prepare(
    `SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions WHERE from_account_id = ? AND type = 'transfer' AND admin_fee > 0`
  ).get(id) as { total: number };

  // Debt payments outgoing (my debts I paid)
  const debtPayments = db.prepare(
    `SELECT COALESCE(SUM(dp.amount), 0) as total FROM debt_payments dp
     JOIN debts d ON dp.debt_id = d.id
     WHERE dp.account_id = ? AND d.type = 'debt'`
  ).get(id) as { total: number };

  // Debt collections incoming (receivables I collected)
  const debtCollections = db.prepare(
    `SELECT COALESCE(SUM(dp.amount), 0) as total FROM debt_payments dp
     JOIN debts d ON dp.debt_id = d.id
     WHERE dp.account_id = ? AND d.type = 'receivable'`
  ).get(id) as { total: number };

  const tracked_balance = incoming.total - outgoing.total - adminFees.total - debtPayments.total + debtCollections.total;

  return NextResponse.json({ ...account, tracked_balance });
});

export const PUT = safeHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();
  const { name, type, balance, is_active, notes, hide_balance } = body;

  db.prepare(
    `UPDATE accounts SET name=?, type=?, balance=?, is_active=?, notes=?, hide_balance=?, updated_at=datetime('now')
     WHERE id=?`
  ).run(name, type, balance ?? 0, is_active ?? 1, notes || null, hide_balance ?? 0, id);

  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
  return NextResponse.json(account);
});

export const DELETE = safeHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  db.prepare('UPDATE accounts SET is_active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
});
