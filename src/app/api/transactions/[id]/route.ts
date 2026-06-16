import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const DELETE = safeHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();

  const txn = db.transaction(() => {
    const t = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as {
      id: number; type: string; amount: number; admin_fee: number;
      from_account_id: number | null; to_account_id: number | null;
    } | undefined;

    if (!t) throw new Error('Not found');

    // Reverse balance changes
    if (t.type === 'expense' && t.from_account_id) {
      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(t.amount, t.from_account_id);
    } else if (t.type === 'income' && t.to_account_id) {
      db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(t.amount, t.to_account_id);
    } else if (t.type === 'transfer') {
      if (t.from_account_id) {
        db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(t.amount + (t.admin_fee || 0), t.from_account_id);
      }
      if (t.to_account_id) {
        db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(t.amount, t.to_account_id);
      }
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  });

  txn();
  return NextResponse.json({ success: true });
});
