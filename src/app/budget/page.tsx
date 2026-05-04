'use client';
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { formatCurrency, formatMonth, getCurrentMonth, calcPercentage, getBudgetStatus } from '@/lib/utils';
import MonthSelector from '@/components/MonthSelector';

interface Category { id: number; name: string; icon: string; color: string; type: string; is_active: number; }
interface Budget { id: number; category_id: number; month: string; amount: number; }
interface BudgetDisplay extends Budget { name: string; icon: string; color: string; spent: number; }

export default function BudgetPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState<BudgetDisplay[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BudgetDisplay | null>(null);
  const [form, setForm] = useState({ category_id: '', amount: '' });

  const fetchBudgets = () => {
    Promise.all([
      fetch(`/api/budgets?month=${month}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([b, c]) => {
      setCategories(c);
      setBudgets(b);
    });
  };

  useEffect(() => { fetchBudgets(); }, [month]);

  const openCreate = () => {
    setEditing(null);
    setForm({ category_id: '', amount: '' });
    setShowModal(true);
  };

  const openEdit = (b: BudgetDisplay) => {
    setEditing(b);
    setForm({ category_id: String(b.category_id), amount: String(b.amount) });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/budgets/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(form.amount) || 0 }),
      });
    } else {
      await fetch('/api/budgets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: parseInt(form.category_id), month, amount: parseInt(form.amount) || 0 }),
      });
    }
    setShowModal(false);
    fetchBudgets();
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!confirm('Remove this budget?')) return;
    await fetch(`/api/budgets/${editing.id}`, { method: 'DELETE' });
    setShowModal(false);
    fetchBudgets();
  };

  const expenseCats = categories.filter(c => c.type === 'expense' && c.is_active);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Budget</h1>
          <p className="page-header-subtitle">
            {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)} spent
          </p>
        </div>
        <div className="page-header-actions">
          <MonthSelector value={month} onChange={setMonth} />
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Set Budget
          </button>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No budgets set for this month</h3><p>Set category budgets to track spending</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {budgets.map(b => {
            const pct = calcPercentage(b.spent, b.amount);
            const status = getBudgetStatus(b.spent, b.amount);
            const remaining = b.amount - b.spent;
            return (
              <div key={b.id} className="card card-interactive" style={{ padding: 18 }} onClick={() => openEdit(b)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="color-marker-lg" style={{ background: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</span>
                  </div>
                  <span className={`badge badge-${status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'danger'}`}>
                    {status === 'exceeded' ? 'Exceeded' : status === 'warning' ? 'Warning' : 'On Track'}
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 8, marginBottom: 8 }}>
                  <div className={`progress-fill ${status}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Spent: {formatCurrency(b.spent)}</span>
                  <span style={{ fontWeight: 500, color: remaining >= 0 ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
                    {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>Budget: {formatCurrency(b.amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Budget' : 'Set Budget'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  {editing ? (
                    <input className="form-input" value={editing.name} disabled style={{ background: 'var(--bg-hover)' }} />
                  ) : (
                    <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                      <option value="">Select category</option>
                      {expenseCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Amount (Rp)</label>
                  <input className="form-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required />
                </div>
                <p className="form-helper">Month: {formatMonth(month)}</p>
              </div>
              <div className="modal-footer">
                {editing && (
                  <div className="modal-footer-left">
                    <button type="button" className="btn-danger-text" onClick={handleDelete}>Delete Budget</button>
                  </div>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
