'use client';
import { useEffect, useState } from 'react';
import { Plus, HandCoins, X } from 'lucide-react';
import { formatCurrency, calcPercentage, formatDate, getCurrentDate, DEBT_ORIGIN_TYPES } from '@/lib/utils';

interface Debt { id: number; type: string; person_name: string; origin_type: string; start_date: string; due_date: string; total_amount: number; paid_amount: number; status: string; notes: string; }
interface Account { id: number; name: string; is_active: number; }

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tab, setTab] = useState<'debt' | 'receivable'>('debt');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Debt | null>(null);
  const [showPay, setShowPay] = useState<Debt | null>(null);
  const [form, setForm] = useState({ person_name: '', origin_type: 'manual_entry', start_date: getCurrentDate(), due_date: '', total_amount: '', notes: '' });
  const [payForm, setPayForm] = useState({ amount: '', account_id: '', notes: '' });

  const fetchAll = () => { fetch('/api/debts').then(r => r.json()).then(setDebts); fetch('/api/accounts').then(r => r.json()).then(setAccounts); };
  useEffect(() => { fetchAll(); }, []);

  const filtered = debts.filter(d => d.type === tab && d.status !== 'cancelled');
  const activeAccounts = accounts.filter(a => a.is_active);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/debts', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: tab, total_amount: parseInt(form.total_amount) || 0 }) });
    setShowCreate(false); fetchAll();
  };

  const openEdit = (d: Debt) => {
    setForm({ person_name: d.person_name, origin_type: d.origin_type, start_date: d.start_date, due_date: d.due_date || '', total_amount: String(d.total_amount), notes: d.notes || '' });
    setShowEdit(d);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    await fetch(`/api/debts/${showEdit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, total_amount: parseInt(form.total_amount) || 0 }) });
    setShowEdit(null); fetchAll();
  };

  const handleDelete = async () => {
    if (!showEdit) return;
    if (!confirm('Cancel this record? Existing payment history and account balance changes will be kept.')) return;
    await fetch(`/api/debts/${showEdit.id}`, { method: 'DELETE' });
    setShowEdit(null); fetchAll();
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPay) return;
    await fetch(`/api/debts/${showPay.id}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(payForm.amount) || 0, account_id: parseInt(payForm.account_id), notes: payForm.notes }) });
    setShowPay(null); fetchAll();
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Debt & Credit</h1><p className="page-header-subtitle">Track money owed and owing</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ person_name: '', origin_type: 'manual_entry', start_date: getCurrentDate(), due_date: '', total_amount: '', notes: '' }); setShowCreate(true); }}>
          <Plus size={18} /> Add {tab === 'debt' ? 'Debt' : 'Receivable'}
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: 20, maxWidth: 300 }}>
        <button className={`tab-item ${tab === 'debt' ? 'active' : ''}`} onClick={() => setTab('debt')}>My Debts</button>
        <button className={`tab-item ${tab === 'receivable' ? 'active' : ''}`} onClick={() => setTab('receivable')}>My Receivables</button>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><HandCoins size={44} /><h3>No {tab === 'debt' ? 'debts' : 'receivables'}</h3><p>Add a record to start tracking</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(d => {
            const pct = calcPercentage(d.paid_amount, d.total_amount);
            const remaining = d.total_amount - d.paid_amount;
            return (
              <div key={d.id} className="card card-interactive" style={{ padding: 18 }} onClick={() => openEdit(d)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{d.person_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>{DEBT_ORIGIN_TYPES.find(o => o.value === d.origin_type)?.label}</span>
                      {d.due_date && <span>Due: {formatDate(d.due_date)}</span>}
                    </div>
                  </div>
                  <span className={`badge ${d.status === 'settled' ? 'badge-success' : d.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                    {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 6, marginBottom: 8 }}>
                  <div className="progress-fill healthy" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>Paid: {formatCurrency(d.paid_amount)} / {formatCurrency(d.total_amount)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {remaining > 0 && <span style={{ fontWeight: 600, color: 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(remaining)} left</span>}
                    {d.status === 'active' && (
                      <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setPayForm({ amount: '', account_id: '', notes: '' }); setShowPay(d); }}>
                        {tab === 'debt' ? 'Pay' : 'Collect'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New {tab === 'debt' ? 'Debt' : 'Receivable'}</h2><button className="modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Person / Institution</label>
                  <input className="form-input" value={form.person_name} onChange={e => setForm({ ...form, person_name: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Origin Type</label>
                  <select className="form-select" value={form.origin_type} onChange={e => setForm({ ...form, origin_type: e.target.value })}>
                    {DEBT_ORIGIN_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Amount (Rp)</label>
                    <input className="form-input" type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Start Date</label>
                    <input className="form-input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Due Date (optional)</label>
                  <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <p className="form-helper">Note: Creating this record will not affect any account balance.</p>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit {showEdit.type === 'debt' ? 'Debt' : 'Receivable'}</h2><button className="modal-close" onClick={() => setShowEdit(null)}><X size={18} /></button></div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Person / Institution</label>
                  <input className="form-input" value={form.person_name} onChange={e => setForm({ ...form, person_name: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Origin Type</label>
                  <select className="form-select" value={form.origin_type} onChange={e => setForm({ ...form, origin_type: e.target.value })}>
                    {DEBT_ORIGIN_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Amount (Rp)</label>
                    <input className="form-input" type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Start Date</label>
                    <input className="form-input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Due Date</label>
                    <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <div className="modal-footer-left"><button type="button" className="btn-danger-text" onClick={handleDelete}>Cancel Record</button></div>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPay && (
        <div className="modal-overlay" onClick={() => setShowPay(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{showPay.type === 'debt' ? 'Record Payment' : 'Record Collection'}</h2><button className="modal-close" onClick={() => setShowPay(null)}><X size={18} /></button></div>
            <form onSubmit={handlePay}>
              <div className="modal-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  {showPay.person_name} — Remaining: {formatCurrency(showPay.total_amount - showPay.paid_amount)}
                </p>
                <div className="form-group"><label className="form-label">Amount (Rp)</label>
                  <input className="form-input" type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Account</label>
                  <select className="form-select" value={payForm.account_id} onChange={e => setPayForm({ ...payForm, account_id: e.target.value })} required>
                    <option value="">Select account</option>
                    {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select></div>
                <p className="form-helper">
                  {showPay.type === 'debt' ? 'Your account balance will decrease.' : 'Your account balance will increase.'}
                </p>
                <div className="form-group"><label className="form-label">Notes</label>
                  <input className="form-input" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowPay(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{showPay.type === 'debt' ? 'Record Payment' : 'Record Collection'}</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
