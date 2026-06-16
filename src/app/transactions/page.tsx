'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Trash2, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, TRANSACTION_TYPES } from '@/lib/utils';
import TransactionModal from '@/components/TransactionModal';

interface Transaction {
  id: number; type: string; name: string; date: string; amount: number; admin_fee: number;
  from_account_id: number; to_account_id: number; category_id: number;
  category_name: string; category_icon: string; category_color: string;
  from_account_name: string; to_account_name: string; notes: string; location: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchTransactions = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterType) params.set('type', filterType);
    fetch(`/api/transactions?${params}`).then(r => r.json()).then(d => {
      setTransactions(d.transactions || []);
      setTotal(d.total || 0);
    });
  }, [search, filterType]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction? Balance will be reversed.')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    fetchTransactions();
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(format);
    try {
      const url = `/api/export?format=${format}&month=all`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const ext = format === 'xlsx' ? 'xlsx' : 'csv';
      a.download = `kanemori-all-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const typeIcon = (t: string) => {
    if (t === 'income') return <ArrowUpRight size={14} />;
    if (t === 'expense') return <ArrowDownRight size={14} />;
    return <ArrowLeftRight size={14} />;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-header-subtitle">{total} transactions total</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleExport('xlsx')}
            disabled={exporting !== null}
            title="Export all data to Excel"
          >
            {exporting === 'xlsx' ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            Export Excel
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            title="Export all transactions to CSV"
          >
            {exporting === 'csv' ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <FileText size={16} />
            )}
            Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Transaction
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body-compact">
          <div className="filter-bar">
            <div className="search-input">
              <Search />
              <input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="tabs">
              {[{ v: '', l: 'All' }, { v: 'expense', l: 'Expense' }, { v: 'income', l: 'Income' }, { v: 'transfer', l: 'Transfer' }].map(f => (
                <button key={f.v} className={`tab-item ${filterType === f.v ? 'active' : ''}`} onClick={() => setFilterType(f.v)}>{f.l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body-compact">
          {transactions.length === 0 ? (
            <div className="empty-state"><ArrowLeftRight size={44} /><h3>No transactions found</h3><p>Add your first transaction to get started</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Date</th><th>Name</th><th>Type</th><th>Category</th><th>Account</th><th style={{ textAlign: 'right' }}>Amount</th><th></th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                      <td style={{ fontWeight: 500 }}>{t.name}</td>
                      <td><span className={`badge badge-${t.type}`}>{typeIcon(t.type)} {TRANSACTION_TYPES[t.type as keyof typeof TRANSACTION_TYPES]?.label}</span></td>
                      <td>{t.category_name ? <span style={{ fontSize: 13 }}>{t.category_name}</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {t.type === 'transfer' ? `${t.from_account_name} → ${t.to_account_name}` : t.from_account_name || t.to_account_name}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }} className={`tabular-nums ${t.type === 'income' ? 'amount-positive' : t.type === 'expense' ? 'amount-negative' : ''}`}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                        {t.admin_fee > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>fee: {formatCurrency(t.admin_fee)}</span>}
                      </td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(t.id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={fetchTransactions}
      />
    </>
  );
}
