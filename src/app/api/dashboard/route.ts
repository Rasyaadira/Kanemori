import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';
import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from 'date-fns';

/**
 * Validates and normalizes a month string.
 * Returns a valid 'YYYY-MM' string or the current month as fallback.
 */
function safeMonth(param: string | null): string {
  if (!param) return format(new Date(), 'yyyy-MM');

  // Must match YYYY-MM format
  if (!/^\d{4}-\d{2}$/.test(param)) return format(new Date(), 'yyyy-MM');

  const [yearStr, monthStr] = param.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Validate ranges — support far-future use
  if (year < 2000 || year > 2099) return format(new Date(), 'yyyy-MM');
  if (month < 1 || month > 12) return format(new Date(), 'yyyy-MM');

  return param;
}

export const GET = safeHandler(async (request: Request) => {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const currentMonth = safeMonth(searchParams.get('month'));

  const settingsRows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]));
  const countAdminFeeAsExpense = settings.admin_fee_as_expense !== 'false';
  const hideAllBalances = settings.hide_all_balances === 'true';

  // Parse month for previous month calculation
  const monthDate = parseISO(`${currentMonth}-01`);
  const prevMonth = format(subMonths(monthDate, 1), 'yyyy-MM');

  // Total balance (sum of all active accounts — always current, not filtered by month)
  const totalBalance = db.prepare(
    `SELECT COALESCE(SUM(balance), 0) as total FROM accounts WHERE is_active = 1`
  ).get() as { total: number };

  // This month income
  const monthIncome = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m', date) = ?`
  ).get(currentMonth) as { total: number };

  // This month expense
  const monthExpense = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?`
  ).get(currentMonth) as { total: number };

  // Admin fees as expense (from transfers this month)
  const monthAdminFees = countAdminFeeAsExpense ? db.prepare(
    `SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions 
     WHERE type = 'transfer' AND admin_fee > 0 AND strftime('%Y-%m', date) = ?`
  ).get(currentMonth) as { total: number } : { total: 0 };

  // Cash flow per day for selected month
  const cashFlow = eachDayOfInterval({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate),
  }).map((day) => {
    const dayKey = format(day, 'yyyy-MM-dd');

    const inc = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'income' AND date = ?`
    ).get(dayKey) as { total: number };

    const exp = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'expense' AND date = ?`
    ).get(dayKey) as { total: number };

    const fee = countAdminFeeAsExpense ? db.prepare(
      `SELECT COALESCE(SUM(admin_fee), 0) as total FROM transactions
       WHERE type = 'transfer' AND admin_fee > 0 AND date = ?`
    ).get(dayKey) as { total: number } : { total: 0 };

    return {
      day: format(day, 'd'),
      income: inc.total,
      expense: exp.total + fee.total,
    };
  });

  // Spending by category (selected month)
  const spendingByCategory = db.prepare(
    `SELECT c.name, c.color, c.icon, COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'expense' AND strftime('%Y-%m', t.date) = ?
     GROUP BY c.id
     ORDER BY total DESC
     LIMIT 6`
  ).all(currentMonth) as Array<{ name: string; color: string; icon: string; total: number }>;

  // Budget progress (selected month)
  const budgets = db.prepare(
    `SELECT b.id, b.amount as budget_amount, c.name, c.color, c.icon,
            COALESCE((SELECT SUM(t.amount) FROM transactions t 
             WHERE t.type = 'expense' AND t.category_id = b.category_id 
             AND strftime('%Y-%m', t.date) = b.month), 0) as spent
     FROM budgets b
     JOIN categories c ON b.category_id = c.id
     WHERE b.month = ?
     ORDER BY spent DESC
     LIMIT 5`
  ).all(currentMonth) as Array<{
    id: number; budget_amount: number; name: string;
    color: string; icon: string; spent: number;
  }>;

  // Goals progress (active goals — not month-filtered)
  const goals = db.prepare(
    `SELECT id, name, target_amount, funded_amount, deadline, icon, color, status
     FROM goals WHERE status = 'active' ORDER BY created_at DESC LIMIT 4`
  ).all() as Array<{
    id: number; name: string; target_amount: number;
    funded_amount: number; deadline: string; icon: string; color: string; status: string;
  }>;

  // Recent transactions (selected month)
  const recentTransactions = db.prepare(
    `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
            fa.name as from_account_name, ta.name as to_account_name
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN accounts fa ON t.from_account_id = fa.id
     LEFT JOIN accounts ta ON t.to_account_id = ta.id
     WHERE strftime('%Y-%m', t.date) = ?
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT 6`
  ).all(currentMonth);

  // Last month totals for trend
  const lastMonthExpense = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?`
  ).get(prevMonth) as { total: number };

  const lastMonthIncome = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
     WHERE type = 'income' AND strftime('%Y-%m', date) = ?`
  ).get(prevMonth) as { total: number };

  return NextResponse.json({
    totalBalance: totalBalance.total,
    monthIncome: monthIncome.total,
    monthExpense: monthExpense.total + monthAdminFees.total,
    cashflowHealth: monthIncome.total - (monthExpense.total + monthAdminFees.total),
    lastMonthExpense: lastMonthExpense.total,
    lastMonthIncome: lastMonthIncome.total,
    cashFlow,
    spendingByCategory,
    budgets,
    goals,
    recentTransactions,
    hideAllBalances,
  });
});
