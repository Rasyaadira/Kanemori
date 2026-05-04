'use client';
import { useEffect, useState } from 'react';
import { Plus, Target, X, DollarSign } from 'lucide-react';
import { formatCurrency, calcPercentage, formatDate, getCurrentDate } from '@/lib/utils';

interface Goal { id: number; name: string; target_amount: number; funded_amount: number; deadline: string; icon: string; color: string; status: string; notes: string; }
interface Account { id: number; name: string; balance: number; is_active: number; }

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Goal | null>(null);
  const [showFund, setShowFund] = useState<Goal | null>(null);
  const [form, setForm] = useState({ name: '', target_amount: '', deadline: '', notes: '' });
  const [fundForm, setFundForm] = useState({ amount: '', account_id: '', notes: '' });

  const fetchAll = () => {
    fetch('/api/goals').then(r => r.json()).then(setGoals);
    fetch('/api/accounts').then(r => r.json()).then(setAccounts);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, target_amount: parseInt(form.target_amount) || 0 }) });
    setShowCreate(false); fetchAll();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    await fetch(`/api/goals/${showEdit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, target_amount: parseInt(form.target_amount) || 0, deadline: form.deadline || null, notes: form.notes || null }) });
    setShowEdit(null); fetchAll();
  };

  const handleDelete = async () => {
    if (!showEdit) return;
    if (!confirm('Delete this goal? Funding records will be removed.')) return;
    await fetch(`/api/goals/${showEdit.id}`, { method: 'DELETE' });
    setShowEdit(null); fetchAll();
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFund) return;
    await fetch(`/api/goals/${showFund.id}/fund`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(fundForm.amount) || 0, account_id: parseInt(fundForm.account_id) || null, notes: fundForm.notes }) });
    setShowFund(null); fetchAll();
  };

  const openEdit = (g: Goal) => {
    setForm({ name: g.name, target_amount: String(g.target_amount), deadline: g.deadline || '', notes: g.notes || '' });
    setShowEdit(g);
  };

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const activeAccounts = accounts.filter(a => a.is_active);

  return (
    <>
      <div className="page-header">
        <div><h1>Goals</h1><p className="page-header-subtitle">{active.length} active goals</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', target_amount: '', deadline: '', notes: '' }); setShowCreate(true); }}>
          <Plus size={18} /> New Goal
        </button>
      </div>

      {active.length === 0 && completed.length === 0 ? (
        <div className="card"><div className="empty-state"><Target size={44} /><h3>No goals yet</h3><p>Set savings targets to track your progress</p></div></div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="account-grid" style={{ marginBottom: 28 }}>
              {active.map(g => {
                const pct = calcPercentage(g.funded_amount, g.target_amount);
                return (
                  <div key={g.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="color-marker-lg" style={{ background: 'var(--secondary)' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                          {g.deadline && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due: {formatDate(g.deadline)}</div>}
                        </div>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 8, marginBottom: 8 }}>
                      <div className="progress-fill healthy" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, fontVariantNumeric: 'tabular-nums' }}>
                      <span>{formatCurrency(g.funded_amount)}</span><span>{formatCurrency(g.target_amount)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                        onClick={() => { setFundForm({ amount: '', account_id: '', notes: '' }); setShowFund(g); }}>
                        <DollarSign size={14} /> Add Fund
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(g)}>Edit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>Completed ({completed.length})</h3>
              <div className="account-grid">
                {completed.map(g => (
                  <div key={g.id} className="card" style={{ padding: 18, opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="color-marker" style={{ background: 'var(--success)' }} />
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{g.name}</span>
                      <span className="badge badge-success">Completed</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(g.target_amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Goal</h2><button className="modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. New Phone, Emergency Fund" required /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Target Amount (Rp)</label>
                    <input className="form-input" type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Deadline (optional)</label>
                    <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit Goal</h2><button className="modal-close" onClick={() => setShowEdit(null)}><X size={18} /></button></div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Target Amount (Rp)</label>
                    <input className="form-input" type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Deadline</label>
                    <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <div className="modal-footer-left"><button type="button" className="btn-danger-text" onClick={handleDelete}>Delete Goal</button></div>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Fund Modal */}
      {showFund && (
        <div className="modal-overlay" onClick={() => setShowFund(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Fund to {showFund.name}</h2><button className="modal-close" onClick={() => setShowFund(null)}><X size={18} /></button></div>
            <form onSubmit={handleFund}>
              <div className="modal-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Progress: {formatCurrency(showFund.funded_amount)} / {formatCurrency(showFund.target_amount)} ({calcPercentage(showFund.funded_amount, showFund.target_amount)}%)
                </p>
                <div className="form-group"><label className="form-label">Amount (Rp)</label>
                  <input className="form-input" type="number" value={fundForm.amount} onChange={e => setFundForm({ ...fundForm, amount: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Source Account (reference only)</label>
                  <select className="form-select" value={fundForm.account_id} onChange={e => setFundForm({ ...fundForm, account_id: e.target.value })}>
                    <option value="">None</option>
                    {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select></div>
                <p className="form-helper">Note: Account balance will not be affected.</p>
                <div className="form-group"><label className="form-label">Notes</label>
                  <input className="form-input" value={fundForm.notes} onChange={e => setFundForm({ ...fundForm, notes: e.target.value })} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowFund(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Fund</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
