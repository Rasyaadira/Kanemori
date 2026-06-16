import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const POST = safeHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const { amount, account_id, notes } = await request.json();

  const txn = db.transaction(() => {
    const debt = db.prepare('SELECT * FROM debts WHERE id = ?').get(id) as {
      type: string; paid_amount: number; total_amount: number;
    };
    if (!debt) throw new Error('Not found');

    // Update account balance (real money movement)
    if (debt.type === 'debt') {
      // I'm paying my debt — money leaves my account
      db.prepare("UPDATE accounts SET balance = balance - ?, updated_at = datetime('now') WHERE id = ?").run(amount, account_id);
    } else {
      // Receiving payment on receivable — money enters my account
      db.prepare("UPDATE accounts SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?").run(amount, account_id);
    }

    // Update debt progress
    db.prepare("UPDATE debts SET paid_amount = paid_amount + ?, updated_at = datetime('now') WHERE id = ?").run(amount, id);

    // Record payment
    db.prepare('INSERT INTO debt_payments (debt_id, account_id, amount, date, notes) VALUES (?, ?, ?, date(\'now\'), ?)').run(id, account_id, amount, notes || null);

    // Check if settled
    const updated = db.prepare('SELECT * FROM debts WHERE id = ?').get(id) as { paid_amount: number; total_amount: number };
    if (updated.paid_amount >= updated.total_amount) {
      db.prepare("UPDATE debts SET status = 'settled', updated_at = datetime('now') WHERE id = ?").run(id);
    }
  });
  txn();
  return NextResponse.json({ success: true });
});
