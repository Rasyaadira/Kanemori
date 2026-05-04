'use client';

import { useEffect, useState } from 'react';
import { Plus, Wallet, X, Eye, EyeOff } from 'lucide-react';
import { formatCurrency, ACCOUNT_TYPES } from '@/lib/utils';

interface Account {
  id: number; name: string; type: string; icon: string; color: string;
  balance: number; hide_balance: number; is_active: number; notes: string; sort_order: number;
}

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  bank: '#2853FF', cash: '#66BFE8', 'e-wallet': '#4A7BFF',
  prepaid: '#8BD0F0', 'stored-value': '#B8E2F8', other: '#1A2F6E',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form, setForm] = useState({ name: '', type: 'bank', balance: '', notes: '' });
  const [globalHide, setGlobalHide] = useState(false);
  const [trackedBalance, setTrackedBalance] = useState<number | null>(null);

  const fetchAccounts = () => {
    fetch('/api/accounts').then(r => r.json()).then(setAccounts);
  };

  useEffect(() => {
    fetchAccounts();
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s.hide_all_balances === 'true') setGlobalHide(true);
    });
  }, []);

  const toggleGlobalHide = async () => {
    const next = !globalHide;
    setGlobalHide(next);
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'hide_all_balances', value: String(next) }),
    });
  };

  const openCreate = () => {
    setEditingAccount(null);
    setTrackedBalance(null);
    setForm({ name: '', type: 'bank', balance: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (a: Account) => {
    setEditingAccount(a);
    setForm({ name: a.name, type: a.type, balance: String(a.balance), notes: a.notes || '' });
    // Fetch tracked balance
    fetch(`/api/accounts/${a.id}`)
      .then(r => r.json())
      .then(d => setTrackedBalance(d.tracked_balance ?? null))
      .catch(() => setTrackedBalance(null));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, balance: parseInt(form.balance) || 0 };

    if (editingAccount) {
      await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, is_active: editingAccount.is_active, hide_balance: editingAccount.hide_balance }),
      });
    } else {
      await fetch('/api/accounts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    fetchAccounts();
  };

  const handleToggleHideBalance = async () => {
    if (!editingAccount) return;
    const next = editingAccount.hide_balance ? 0 : 1;
    setEditingAccount({ ...editingAccount, hide_balance: next });
  };

  const handleDelete = async () => {
    if (!editingAccount) return;
    if (!confirm('Deactivate this account? It will be hidden from all views.')) return;
    await fetch(`/api/accounts/${editingAccount.id}`, { method: 'DELETE' });
    setShowModal(false);
    fetchAccounts();
  };

  const activeAccounts = accounts.filter(a => a.is_active);
  const totalBalance = activeAccounts.reduce((s, a) => s + a.balance, 0);

  const shouldHideBalance = (a: Account) => globalHide || a.hide_balance;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Accounts</h1>
          <p className="page-header-subtitle">
            Total Balance: {globalHide ? '•••••' : formatCurrency(totalBalance)}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={toggleGlobalHide} title={globalHide ? 'Show balances' : 'Hide balances'}>
            {globalHide ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Account</button>
        </div>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="card"><div className="empty-state"><Wallet size={44} /><h3>No accounts yet</h3><p>Add your first account to start tracking</p></div></div>
      ) : (
        <div className="account-grid">
          {activeAccounts.map(a => (
            <div key={a.id} className="card account-card card-interactive" onClick={() => openEdit(a)}>
              <div className="account-card-header">
                <div className="account-card-icon" style={{ background: `${ACCOUNT_TYPE_COLORS[a.type] || '#2853FF'}12` }}>
                  <div className="color-marker-lg" style={{ background: ACCOUNT_TYPE_COLORS[a.type] || '#2853FF' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="account-card-name">{a.name}</div>
                  <div className="account-card-type">{a.type.replace('-', ' ')}</div>
                </div>
              </div>
              <div className="account-card-balance" style={{ color: a.balance >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                {shouldHideBalance(a) ? '•••••' : formatCurrency(a.balance)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAccount ? 'Edit Account' : 'New Account'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Account Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. BCA, Cash, GoPay" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Balance (Rp)</label>
                    <input className="form-input" type="number" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} placeholder="0" />
                  </div>
                </div>

                {editingAccount && trackedBalance !== null && (
                  <div style={{ background: 'var(--blue-50)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginTop: 14, border: '1px solid var(--blue-100)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tracked Balance</span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(trackedBalance)}</span>
                    </div>
                    {trackedBalance !== editingAccount.balance && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--warning)' }}>
                        <span>Difference</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(Math.abs(editingAccount.balance - trackedBalance))}</span>
                      </div>
                    )}
                  </div>
                )}

                {editingAccount && (
                  <div style={{ marginTop: 14, padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Hide balance on main view</label>
                      <button type="button" className={`toggle ${editingAccount.hide_balance ? 'active' : ''}`} onClick={handleToggleHideBalance} />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>This change will be saved when you click Save Changes.</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about this account" />
                </div>
              </div>
              <div className="modal-footer">
                {editingAccount && (
                  <div className="modal-footer-left">
                    <button type="button" className="btn-danger-text" onClick={handleDelete}>Deactivate Account</button>
                  </div>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingAccount ? 'Save Changes' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
