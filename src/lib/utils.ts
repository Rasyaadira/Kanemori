import { format, parseISO } from 'date-fns';

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function formatCurrencyWithSign(amount: number): string {
  const formatted = Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (amount > 0) return `+Rp ${formatted}`;
  if (amount < 0) return `-Rp ${formatted}`;
  return `Rp 0`;
}

export function parseCurrencyInput(input: string): number {
  return parseInt(input.replace(/[^0-9-]/g, ''), 10) || 0;
}

export function formatDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM dd, yyyy'); } catch { return dateStr; }
}

export function formatDateShort(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM dd'); } catch { return dateStr; }
}

export function getCurrentDate(): string { return format(new Date(), 'yyyy-MM-dd'); }
export function getCurrentMonth(): string { return format(new Date(), 'yyyy-MM'); }

export function formatMonth(monthStr: string): string {
  try { return format(parseISO(`${monthStr}-01`), 'MMMM yyyy'); } catch { return monthStr; }
}

export function calcPercentage(current: number, total: number, max = 100): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((current / total) * 100), max);
}

export function getBudgetStatus(spent: number, budget: number): 'healthy' | 'warning' | 'exceeded' {
  if (budget <= 0) return 'healthy';
  const ratio = spent / budget;
  if (ratio > 1) return 'exceeded';
  if (ratio > 0.75) return 'warning';
  return 'healthy';
}

export const TRANSACTION_TYPES = {
  expense: { label: 'Expense', color: '#F87171' },
  income: { label: 'Income', color: '#10B981' },
  transfer: { label: 'Transfer', color: '#2853FF' },
} as const;

export const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'stored-value', label: 'Stored Value' },
  { value: 'other', label: 'Other' },
] as const;

export const DEBT_ORIGIN_TYPES = [
  { value: 'cash_loan', label: 'Cash Loan' },
  { value: 'paid_by_other', label: 'Paid by Other' },
  { value: 'paid_for_other', label: 'Paid for Other' },
  { value: 'shared_expense', label: 'Shared Expense' },
  { value: 'manual_entry', label: 'Manual Entry' },
] as const;

export function compactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}${abs}`;
}
