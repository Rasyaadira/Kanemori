import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { format, parseISO, subMonths } from 'date-fns';

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');
  const monthDate = parseISO(`${month}-01`);
  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]));
  const countAdminFeeAsExpense = settings.admin_fee_as_expense !== 'false';

  const totalIncome = (db.prepare(
    `SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='income' AND strftime('%Y-%m',date)=?`
  ).get(month) as { t: number }).t;

  const baseExpense = (db.prepare(
    `SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='expense' AND strftime('%Y-%m',date)=?`
  ).get(month) as { t: number }).t;

  const adminFees = countAdminFeeAsExpense ? (db.prepare(
    `SELECT COALESCE(SUM(admin_fee),0) as t FROM transactions WHERE type='transfer' AND admin_fee > 0 AND strftime('%Y-%m',date)=?`
  ).get(month) as { t: number }).t : 0;

  const totalExpense = baseExpense + adminFees;

  const expenseByCategory = db.prepare(
    `SELECT c.name,c.icon,c.color,COALESCE(SUM(t.amount),0) as total
     FROM transactions t JOIN categories c ON t.category_id=c.id
     WHERE t.type='expense' AND strftime('%Y-%m',t.date)=?
     GROUP BY c.id ORDER BY total DESC`
  ).all(month);

  const incomeByCategory = db.prepare(
    `SELECT c.name,c.icon,c.color,COALESCE(SUM(t.amount),0) as total
     FROM transactions t JOIN categories c ON t.category_id=c.id
     WHERE t.type='income' AND strftime('%Y-%m',t.date)=?
     GROUP BY c.id ORDER BY total DESC`
  ).all(month);

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const baseMonth = subMonths(monthDate, i);
    const m = format(baseMonth, 'yyyy-MM');
    const label = format(baseMonth, 'MMM');
    const inc = (db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='income' AND strftime('%Y-%m',date)=?`).get(m) as {t:number}).t;
    const exp = (db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='expense' AND strftime('%Y-%m',date)=?`).get(m) as {t:number}).t;
    const fee = countAdminFeeAsExpense ? (db.prepare(`SELECT COALESCE(SUM(admin_fee),0) as t FROM transactions WHERE type='transfer' AND admin_fee > 0 AND strftime('%Y-%m',date)=?`).get(m) as {t:number}).t : 0;
    monthlyTrend.push({ month: label, income: inc, expense: exp + fee });
  }

  return NextResponse.json({ totalIncome, totalExpense, expenseByCategory, incomeByCategory, monthlyTrend });
}
