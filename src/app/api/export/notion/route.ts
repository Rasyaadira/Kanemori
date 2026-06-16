import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { safeHandler } from '@/lib/api-handler';

/**
 * Notion Export API
 * 
 * POST — Exports transactions to a Notion database.
 * 
 * Body:
 *   notionToken: string — Notion integration token (secret_xxx)
 *   databaseId: string — Target Notion database ID
 *   month: string — 'YYYY-MM' or 'all'
 * 
 * The Notion database must have these properties:
 *   - Name (title)
 *   - Date (date)
 *   - Type (select: income/expense/transfer)
 *   - Amount (number)
 *   - Category (select)
 *   - Account (rich_text)
 *   - Notes (rich_text)
 */
export const POST = safeHandler(async (request: Request) => {
  const { notionToken, databaseId, month } = await request.json();

  if (!notionToken || !databaseId) {
    return NextResponse.json(
      { error: 'Notion token and database ID are required' },
      { status: 400 }
    );
  }

  const db = getDb();

  // Build query
  let dateFilter = '';
  const dateParams: string[] = [];
  if (month && month !== 'all') {
    dateFilter = "AND strftime('%Y-%m', t.date) = ?";
    dateParams.push(month);
  }

  const transactions = db.prepare(`
    SELECT 
      t.date, t.type, t.name, t.amount, t.admin_fee,
      COALESCE(c.name, '') as category_name,
      COALESCE(fa.name, '') as from_account,
      COALESCE(ta.name, '') as to_account,
      COALESCE(t.notes, '') as notes
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts fa ON t.from_account_id = fa.id
    LEFT JOIN accounts ta ON t.to_account_id = ta.id
    WHERE 1=1 ${dateFilter}
    ORDER BY t.date DESC, t.created_at DESC
  `).all(...dateParams) as Array<{
    date: string; type: string; name: string; amount: number;
    admin_fee: number; category_name: string;
    from_account: string; to_account: string; notes: string;
  }>;

  if (transactions.length === 0) {
    return NextResponse.json({ success: true, exported: 0, message: 'No transactions to export' });
  }

  // Notion API has a rate limit of ~3 requests/second
  // We batch with delays to stay safe
  let exported = 0;
  let failed = 0;
  const errors: string[] = [];
  const BATCH_SIZE = 3;
  const DELAY_MS = 1100; // ~1.1s between batches

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((t) => createNotionPage(notionToken, databaseId, t))
    );

    for (const r of results) {
      if (r.status === 'fulfilled') {
        exported++;
      } else {
        failed++;
        const errMsg = r.reason?.message || String(r.reason);
        if (errors.length < 5) errors.push(errMsg);
      }
    }

    // Rate limit delay between batches (skip on last batch)
    if (i + BATCH_SIZE < transactions.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return NextResponse.json({
    success: failed === 0,
    exported,
    failed,
    total: transactions.length,
    errors: errors.length > 0 ? errors : undefined,
  });
});

async function createNotionPage(
  token: string,
  databaseId: string,
  t: {
    date: string; type: string; name: string; amount: number;
    admin_fee: number; category_name: string;
    from_account: string; to_account: string; notes: string;
  }
) {
  const accountText = t.type === 'transfer'
    ? `${t.from_account} → ${t.to_account}`
    : t.from_account || t.to_account;

  const properties: Record<string, unknown> = {
    Name: {
      title: [{ text: { content: t.name } }],
    },
    Date: {
      date: { start: t.date },
    },
    Type: {
      select: { name: capitalize(t.type) },
    },
    Amount: {
      number: t.amount,
    },
    Category: {
      select: t.category_name ? { name: t.category_name } : null,
    },
    Account: {
      rich_text: [{ text: { content: accountText || '-' } }],
    },
    Notes: {
      rich_text: [{ text: { content: t.notes || '-' } }],
    },
  };

  // Remove null select values
  if (!t.category_name) {
    delete properties.Category;
  }

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Notion API error: ${err.message || response.statusText}`);
  }

  return response.json();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
