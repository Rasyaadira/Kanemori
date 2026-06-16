import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

export const POST = safeHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  const { amount, account_id, notes } = await request.json();

  const txn = db.transaction(() => {
    // Goal funding = tracker model, NO balance change
    db.prepare('UPDATE goals SET funded_amount = funded_amount + ?, updated_at = datetime(\'now\') WHERE id = ?').run(amount, id);
    db.prepare(
      `INSERT INTO goal_fundings (goal_id, account_id, amount, date, notes) VALUES (?, ?, ?, date('now'), ?)`
    ).run(id, account_id || null, amount, notes || null);

    // Check if goal is completed
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as { funded_amount: number; target_amount: number };
    if (goal.funded_amount >= goal.target_amount) {
      db.prepare("UPDATE goals SET status = 'completed', updated_at = datetime('now') WHERE id = ?").run(id);
    }
  });
  txn();
  return NextResponse.json({ success: true });
});
