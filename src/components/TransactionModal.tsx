'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency, getCurrentDate, TRANSACTION_TYPES } from '@/lib/utils';

interface Account { id: number; name: string; type: string; balance: number; is_active: number; }
interface Category { id: number; name: string; type: string; icon: string; is_active: number; }

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function TransactionModal({ open, onClose, onSaved }: TransactionModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hideBalances, setHideBalances] = useState(false);
  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [form, setForm] = useState({
    name: '', date: getCurrentDate(), amount: '', admin_fee: '',
    from_account_id: '', to_account_id: '', category_id: '', notes: '', location: '',
  });

  useEffect(() => {
    if (!open) return;
    fetch('/api/accounts').then(r => r.json()).then(setAccounts);
    fetch('/api/categories').then(r => r.json()).then(setCategories);
    fetch('/api/settings').then(r => r.json()).then(s => setHideBalances(s.hide_all_balances === 'true')).catch(() => setHideBalances(false));
    setTxType('expense');
    setForm({
      name: '', date: getCurrentDate(), amount: '', admin_fee: '',
      from_account_id: '', to_account_id: '', category_id: '', notes: '', location: '',
    });
  }, [open]);

  if (!open) return null;

  const activeAccounts = accounts.filter(a => a.is_active);
  const filteredCategories = categories.filter(c => c.is_active && c.type === txType);
  const accountLabel = (a: Account) => hideBalances ? a.name : `${a.name} (${formatCurrency(a.balance)})`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: txType, name: form.name, date: form.date,
      amount: parseInt(form.amount) || 0,
      admin_fee: txType === 'transfer' ? (parseInt(form.admin_fee) || 0) : 0,
      from_account_id: (txType === 'expense' || txType === 'transfer') ? parseInt(form.from_account_id) || null : null,
      to_account_id: (txType === 'income' || txType === 'transfer') ? parseInt(form.to_account_id) || null : null,
      category_id: txType !== 'transfer' ? parseInt(form.category_id) || null : null,
      notes: form.notes || null, location: form.location || null,
    };
    await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Transaction</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="tabs" style={{ marginBottom: 18 }}>
              {(['expense', 'income', 'transfer'] as const).map(t => (
                <button type="button" key={t} className={`tab-item ${txType === t ? 'active' : ''}`}
                  onClick={() => setTxType(t)}>
                  {TRANSACTION_TYPES[t].label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={txType === 'expense' ? 'e.g. Lunch, Grab ride' : txType === 'income' ? 'e.g. Monthly salary' : 'e.g. Top up GoPay'} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{txType === 'transfer' ? 'Transfer Amount (Rp)' : txType === 'income' ? 'Nominal (Rp)' : 'Price (Rp)'}</label>
                <input className="form-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required />
              </div>
            </div>

            {txType === 'transfer' && (
              <div className="form-group">
                <label className="form-label">Admin Fee (Rp)</label>
                <input className="form-input" type="number" value={form.admin_fee} onChange={e => setForm({ ...form, admin_fee: e.target.value })} placeholder="0" />
              </div>
            )}

            {(txType === 'expense' || txType === 'transfer') && (
              <div className="form-group">
                <label className="form-label">From Account</label>
                <select className="form-select" value={form.from_account_id} onChange={e => setForm({ ...form, from_account_id: e.target.value })} required>
                  <option value="">Select account</option>
                  {activeAccounts.map(a => <option key={a.id} value={a.id}>{accountLabel(a)}</option>)}
                </select>
              </div>
            )}

            {(txType === 'income' || txType === 'transfer') && (
              <div className="form-group">
                <label className="form-label">To Account</label>
                <select className="form-select" value={form.to_account_id} onChange={e => setForm({ ...form, to_account_id: e.target.value })} required>
                  <option value="">Select account</option>
                  {activeAccounts.map(a => <option key={a.id} value={a.id}>{accountLabel(a)}</option>)}
                </select>
              </div>
            )}

            {txType !== 'transfer' && (
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select category</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Location (optional)</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Mall, Office" />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}
