import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';
import * as XLSX from 'xlsx';

/**
 * Export API — generates Excel (.xlsx) or CSV files with all financial data.
 * 
 * Query params:
 *   format: 'xlsx' | 'csv' (default: xlsx)
 *   month: 'YYYY-MM' or 'all' (default: all)
 */
export const GET = safeHandler(async (request: Request) => {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'xlsx';
  const month = searchParams.get('month');

  // Build date filter
  let dateFilter = '';
  const dateParams: string[] = [];
  if (month && month !== 'all') {
    dateFilter = "AND strftime('%Y-%m', t.date) = ?";
    dateParams.push(month);
  }

  // ============================================
  // 1. Transactions Sheet
  // ============================================
  const transactions = db.prepare(`
    SELECT 
      t.date AS "Date",
      t.type AS "Type",
      t.name AS "Name",
      t.amount AS "Amount",
      t.admin_fee AS "Admin Fee",
      COALESCE(c.name, '') AS "Category",
      COALESCE(fa.name, '') AS "From Account",
      COALESCE(ta.name, '') AS "To Account",
      COALESCE(t.notes, '') AS "Notes",
      COALESCE(t.location, '') AS "Location",
      t.created_at AS "Created At"
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts fa ON t.from_account_id = fa.id
    LEFT JOIN accounts ta ON t.to_account_id = ta.id
    WHERE 1=1 ${dateFilter}
    ORDER BY t.date DESC, t.created_at DESC
  `).all(...dateParams);

  // ============================================
  // 2. Accounts Sheet
  // ============================================
  const accounts = db.prepare(`
    SELECT 
      name AS "Account Name",
      type AS "Type",
      balance AS "Balance",
      CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END AS "Status",
      COALESCE(notes, '') AS "Notes",
      created_at AS "Created At"
    FROM accounts
    ORDER BY sort_order ASC, name ASC
  `).all();

  // ============================================
  // 3. Monthly Summary Sheet
  // ============================================
  const monthlySummary = db.prepare(`
    SELECT 
      strftime('%Y-%m', date) AS "Month",
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS "Income",
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS "Expense",
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS "Net",
      COUNT(*) AS "Transaction Count"
    FROM transactions
    GROUP BY strftime('%Y-%m', date)
    ORDER BY "Month" DESC
  `).all();

  // ============================================
  // 4. Category Spending Sheet
  // ============================================
  const categorySpending = db.prepare(`
    SELECT 
      c.name AS "Category",
      c.type AS "Type",
      SUM(t.amount) AS "Total Amount",
      COUNT(t.id) AS "Transaction Count",
      AVG(t.amount) AS "Average"
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE 1=1 ${dateFilter}
    GROUP BY c.id
    ORDER BY SUM(t.amount) DESC
  `).all(...dateParams);

  // ============================================
  // 5. Budgets Sheet
  // ============================================
  const budgets = db.prepare(`
    SELECT 
      b.month AS "Month",
      c.name AS "Category",
      b.amount AS "Budget",
      COALESCE((SELECT SUM(t.amount) FROM transactions t 
       WHERE t.type = 'expense' AND t.category_id = b.category_id 
       AND strftime('%Y-%m', t.date) = b.month), 0) AS "Spent",
      b.amount - COALESCE((SELECT SUM(t.amount) FROM transactions t 
       WHERE t.type = 'expense' AND t.category_id = b.category_id 
       AND strftime('%Y-%m', t.date) = b.month), 0) AS "Remaining"
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    ORDER BY b.month DESC, c.name ASC
  `).all();

  // ============================================
  // 6. Goals Sheet
  // ============================================
  const goals = db.prepare(`
    SELECT 
      name AS "Goal",
      target_amount AS "Target",
      funded_amount AS "Funded",
      ROUND(CAST(funded_amount AS REAL) / NULLIF(target_amount, 0) * 100, 1) AS "Progress %",
      status AS "Status",
      COALESCE(deadline, '') AS "Deadline",
      created_at AS "Created At"
    FROM goals
    ORDER BY created_at DESC
  `).all();

  // ============================================
  // 7. Debts Sheet
  // ============================================
  const debts = db.prepare(`
    SELECT 
      type AS "Type",
      person_name AS "Person",
      origin_type AS "Origin",
      total_amount AS "Total Amount",
      paid_amount AS "Paid",
      total_amount - paid_amount AS "Remaining",
      status AS "Status",
      start_date AS "Start Date",
      COALESCE(due_date, '') AS "Due Date",
      COALESCE(notes, '') AS "Notes"
    FROM debts
    ORDER BY created_at DESC
  `).all();

  // ============================================
  // Generate file
  // ============================================
  const wb = XLSX.utils.book_new();

  const addSheet = (data: unknown[], name: string) => {
    const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{}]);
    // Auto-width columns
    if (data.length > 0) {
      const keys = Object.keys(data[0] as Record<string, unknown>);
      ws['!cols'] = keys.map((k) => ({
        wch: Math.max(
          k.length,
          ...data.map((row) => String((row as Record<string, unknown>)[k] ?? '').length)
        ) + 2,
      }));
    }
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet(transactions, 'Transactions');
  addSheet(accounts, 'Accounts');
  addSheet(monthlySummary, 'Monthly Summary');
  addSheet(categorySpending, 'Category Spending');
  addSheet(budgets, 'Budgets');
  addSheet(goals, 'Goals');
  addSheet(debts, 'Debts');

  const dateStr = new Date().toISOString().slice(0, 10);
  const monthLabel = month && month !== 'all' ? `-${month}` : '';

  if (format === 'csv') {
    // Export as CSV (transactions sheet only for CSV)
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets['Transactions']);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="kanemori${monthLabel}-${dateStr}.csv"`,
      },
    });
  }

  // Export as Excel
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="kanemori${monthLabel}-${dateStr}.xlsx"`,
    },
  });
});
