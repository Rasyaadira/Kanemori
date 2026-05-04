import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'finance.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) {
    try {
      // Quick health check — if this throws, the cached connection is stale/corrupt
      db.prepare('SELECT 1').get();
      return db;
    } catch {
      try { db.close(); } catch {}
      db = null;
    }
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initTables(db);
  seedData(db);

  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      balance INTEGER NOT NULL DEFAULT 0,
      hide_balance INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      parent_id INTEGER REFERENCES categories(id),
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      admin_fee INTEGER DEFAULT 0,
      from_account_id INTEGER REFERENCES accounts(id),
      to_account_id INTEGER REFERENCES accounts(id),
      category_id INTEGER REFERENCES categories(id),
      notes TEXT,
      location TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      month TEXT NOT NULL,
      amount INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_id, month)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount INTEGER NOT NULL,
      funded_amount INTEGER NOT NULL DEFAULT 0,
      deadline TEXT,
      icon TEXT,
      color TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS goal_fundings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL REFERENCES goals(id),
      account_id INTEGER REFERENCES accounts(id),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      person_name TEXT NOT NULL,
      origin_type TEXT NOT NULL DEFAULT 'manual_entry',
      start_date TEXT NOT NULL,
      due_date TEXT,
      total_amount INTEGER NOT NULL,
      paid_amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS debt_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debt_id INTEGER NOT NULL REFERENCES debts(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedData(db: Database.Database) {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count > 0) return;

  const insertCategory = db.prepare(
    'INSERT INTO categories (name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)'
  );

  const expenseCategories = [
    ['Food & Dining', 'expense', '🍽️', '#F97316', 1],
    ['Drinks & Snacks', 'expense', '🧋', '#FB923C', 2],
    ['Groceries', 'expense', '🛒', '#84CC16', 3],
    ['Transportation', 'expense', '🚌', '#3B82F6', 4],
    ['Shopping', 'expense', '🛍️', '#EC4899', 5],
    ['Bills & Utilities', 'expense', '📄', '#8B5CF6', 6],
    ['Subscriptions', 'expense', '🔄', '#A855F7', 7],
    ['Entertainment', 'expense', '🎮', '#F43F5E', 8],
    ['Education', 'expense', '📚', '#0EA5E9', 9],
    ['Health & Fitness', 'expense', '💊', '#10B981', 10],
    ['Housing', 'expense', '🏠', '#6366F1', 11],
    ['Personal Care', 'expense', '✨', '#D946EF', 12],
    ['Donations', 'expense', '❤️', '#F87171', 13],
    ['Top Up', 'expense', '📱', '#14B8A6', 14],
    ['Administrative Fees', 'expense', '📋', '#94A3B8', 15],
    ['Emergency', 'expense', '🚨', '#EF4444', 16],
    ['Investment', 'expense', '📈', '#059669', 17],
    ['Other', 'expense', '📦', '#64748B', 18],
  ];

  const incomeCategories = [
    ['Salary', 'income', '💰', '#10B981', 1],
    ['Freelance', 'income', '💻', '#3B82F6', 2],
    ['Gift', 'income', '🎁', '#EC4899', 3],
    ['Refund', 'income', '↩️', '#F59E0B', 4],
    ['Bonus', 'income', '🎉', '#8B5CF6', 5],
    ['Side Income', 'income', '📊', '#14B8A6', 6],
    ['Other Income', 'income', '📥', '#64748B', 7],
  ];

  const insertMany = db.transaction(() => {
    for (const cat of expenseCategories) {
      insertCategory.run(...cat);
    }
    for (const cat of incomeCategories) {
      insertCategory.run(...cat);
    }
  });

  insertMany();

  // Seed default settings
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  insertSetting.run('admin_fee_as_expense', 'true');
  insertSetting.run('default_account_id', '');
  insertSetting.run('app_name', 'Kanemori');
  insertSetting.run('hide_all_balances', 'false');
}
