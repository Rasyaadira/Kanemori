'use client';
import { useEffect, useState } from 'react';
import { Download, Upload, Eye, EyeOff, FileSpreadsheet, FileText, ExternalLink, Loader2 } from 'lucide-react';
import MonthSelector from '@/components/MonthSelector';
import { getCurrentMonth, formatMonth } from '@/lib/utils';

export default function SettingsPage() {
  const [appName, setAppName] = useState('Kanemori');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [hideBalances, setHideBalances] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');
  const [saved, setSaved] = useState(false);

  // Export state
  const [exportMonth, setExportMonth] = useState(getCurrentMonth());
  const [exportAll, setExportAll] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  // Notion state
  const [notionToken, setNotionToken] = useState('');
  const [notionDbId, setNotionDbId] = useState('');
  const [notionExporting, setNotionExporting] = useState(false);
  const [notionResult, setNotionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedNotionToken, setSavedNotionToken] = useState('');
  const [savedNotionDbId, setSavedNotionDbId] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s.app_name) setAppName(s.app_name);
      if (s.profile_photo) setProfilePhoto(s.profile_photo);
      if (s.hide_all_balances === 'true') setHideBalances(true);
      if (s.notion_token) { setNotionToken(s.notion_token); setSavedNotionToken(s.notion_token); }
      if (s.notion_database_id) { setNotionDbId(s.notion_database_id); setSavedNotionDbId(s.notion_database_id); }
    });
  }, []);

  const saveAppName = async (name: string) => {
    setAppName(name);
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'app_name', value: name }) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setProfilePhoto(base64);
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'profile_photo', value: base64 }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = async () => {
    setProfilePhoto(null);
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'profile_photo', value: '' }) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleHideBalances = async () => {
    const next = !hideBalances;
    setHideBalances(next);
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'hide_all_balances', value: String(next) }) });
  };

  const handleExport = () => { window.open('/api/backup', '_blank'); };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('This will replace ALL your data. Are you sure?')) return;
    const formData = new FormData();
    formData.append('file', file);
    setRestoreStatus('Restoring...');
    try {
      const res = await fetch('/api/restore', { method: 'POST', body: formData });
      if (res.ok) {
        setRestoreStatus('Restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } else { setRestoreStatus('Restore failed.'); }
    } catch { setRestoreStatus('Restore failed.'); }
  };

  // ============================================
  // Export handlers
  // ============================================
  const handleExportFile = async (format: 'xlsx' | 'csv') => {
    setExporting(format);
    try {
      const monthParam = exportAll ? 'all' : exportMonth;
      const url = `/api/export?format=${format}&month=${monthParam}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const ext = format === 'xlsx' ? 'xlsx' : 'csv';
      const label = exportAll ? 'all' : exportMonth;
      a.download = `kanemori-${label}-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // ============================================
  // Notion handlers
  // ============================================
  const saveNotionSettings = async () => {
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'notion_token', value: notionToken }) });
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'notion_database_id', value: notionDbId }) });
    setSavedNotionToken(notionToken);
    setSavedNotionDbId(notionDbId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNotionExport = async () => {
    if (!notionToken || !notionDbId) {
      setNotionResult({ success: false, message: 'Please configure Notion token and database ID first.' });
      return;
    }
    setNotionExporting(true);
    setNotionResult(null);
    try {
      const monthParam = exportAll ? 'all' : exportMonth;
      const res = await fetch('/api/export/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notionToken,
          databaseId: notionDbId,
          month: monthParam,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotionResult({
          success: true,
          message: `Exported ${data.exported} transactions to Notion!`,
        });
      } else {
        setNotionResult({
          success: false,
          message: `Exported ${data.exported}/${data.total}. ${data.errors?.[0] || 'Some failed.'}`,
        });
      }
    } catch {
      setNotionResult({ success: false, message: 'Failed to connect to Notion API.' });
    } finally {
      setNotionExporting(false);
    }
  };

  const monogram = (appName || 'K').charAt(0).toUpperCase();
  const notionConfigured = !!savedNotionToken && !!savedNotionDbId;

  return (
    <>
      <div className="page-header">
        <div><h1>Settings</h1><p className="page-header-subtitle">App identity, export, integrations & backup</p></div>
      </div>

      {/* App Identity */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">App Identity</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                monogram
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input className="form-input" value={appName}
                onChange={e => setAppName(e.target.value)}
                onBlur={e => saveAppName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveAppName(appName); } }}
                style={{ fontSize: 16, fontWeight: 600, border: '1px solid var(--border-light)' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              Change Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
            {profilePhoto && (
              <button type="button" className="btn-danger-text" onClick={deletePhoto} style={{ padding: '0 8px' }}>
                Remove Photo
              </button>
            )}
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {saved ? '✓ Saved — refresh sidebar to see changes' : 'This name and photo appears in the sidebar.'}
          </p>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">Display Preferences</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Hide All Balances</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Replace all monetary values with dots</div>
            </div>
            <button type="button" className={`toggle ${hideBalances ? 'active' : ''}`} onClick={toggleHideBalances} />
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 12, paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Currency</div>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rp — Indonesian Rupiah</span>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Export Data */}
      {/* ============================== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">Export Data</h3></div>
        <div className="card-body">
          {/* Period selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Export Period</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="exportPeriod" checked={!exportAll}
                  onChange={() => setExportAll(false)} />
                Specific month
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="exportPeriod" checked={exportAll}
                  onChange={() => setExportAll(true)} />
                All data
              </label>
              {!exportAll && (
                <MonthSelector value={exportMonth} onChange={setExportMonth} />
              )}
            </div>
          </div>

          {/* Export buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => handleExportFile('xlsx')}
              disabled={exporting !== null}
              style={{ minWidth: 160 }}
            >
              {exporting === 'xlsx' ? (
                <><Loader2 size={16} className="spin" /> Exporting...</>
              ) : (
                <><FileSpreadsheet size={16} /> Export Excel (.xlsx)</>
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleExportFile('csv')}
              disabled={exporting !== null}
              style={{ minWidth: 140 }}
            >
              {exporting === 'csv' ? (
                <><Loader2 size={16} className="spin" /> Exporting...</>
              ) : (
                <><FileText size={16} /> Export CSV</>
              )}
            </button>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
            Excel includes 7 sheets: Transactions, Accounts, Monthly Summary, Category Spending, Budgets, Goals, Debts.
            CSV exports transactions only.
          </p>
        </div>
      </div>

      {/* ============================== */}
      {/* Notion Integration */}
      {/* ============================== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
              <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="currentColor"/>
              <path d="M61.35.227l-55.333 4.087C.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L75.05 3.504l-.1-.067C71.553.187 69.8-.2 63.003.383L61.35.227z" fill="var(--bg-card)"/>
              <path d="M25.723 19.277c-5.247.353-6.437.433-9.417-1.99L8.927 11.42c-1.167-.97-1.75-1.36-1.75-2.527 0-1.553.78-2.14 3.497-2.333l51.25-3.887c4.277-.387 6.413.777 8.167 2.137l9.03 6.607c.387.193 1.553 1.553 1.553 2.333v3.497l-1.94 1.163H27.467l-1.743-1.137v2.003z" fill="currentColor"/>
              <path d="M19.56 88.6V29.177c0-2.53.777-3.697 3.107-3.89l61.05-3.5c2.14-.193 3.11.97 3.11 3.5V85.1c0 2.53-.39 4.667-3.887 4.86L26.55 93.46c-3.497.193-6.99-1.36-6.99-4.86z" fill="var(--bg-card)"/>
              <path d="M68.133 35.847c.387 1.75 0 3.497-1.75 3.693l-2.723.583v42.187c-2.333 1.167-4.47 1.75-6.22 1.75-2.917 0-3.693-.97-5.833-3.5L34.623 55.107v24.267l5.833 1.36s0 3.5-4.857 3.5L24.86 84.817c-.39-.777 0-2.723 1.363-3.11l3.497-.97V44.597l-4.857-.39c-.39-1.75.583-4.277 3.3-4.47l11.867-.777 17.857 27.377V42.84l-4.857-.583c-.39-2.14 1.167-3.693 3.11-3.887l11.793-.523z" fill="currentColor"/>
            </svg>
            Notion Integration
          </h3>
          {notionConfigured && (
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>Connected</span>
          )}
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
            Export your transactions directly to a Notion database.
            You need a <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Notion integration</a> and
            a database with these properties: <strong>Name</strong> (title), <strong>Date</strong> (date), <strong>Type</strong> (select), <strong>Amount</strong> (number), <strong>Category</strong> (select), <strong>Account</strong> (text), <strong>Notes</strong> (text).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Integration Token
              </label>
              <input
                className="form-input"
                type="password"
                value={notionToken}
                onChange={e => setNotionToken(e.target.value)}
                placeholder="secret_..."
                style={{ fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Database ID
              </label>
              <input
                className="form-input"
                value={notionDbId}
                onChange={e => setNotionDbId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{ fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={saveNotionSettings}
              disabled={!notionToken || !notionDbId}
            >
              Save Settings
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleNotionExport}
              disabled={!notionConfigured || notionExporting}
              style={{ minWidth: 140 }}
            >
              {notionExporting ? (
                <><Loader2 size={14} className="spin" /> Exporting...</>
              ) : (
                <><ExternalLink size={14} /> Export to Notion</>
              )}
            </button>
          </div>

          {notionResult && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontWeight: 500,
              background: notionResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: notionResult.success ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${notionResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            }}>
              {notionResult.message}
            </div>
          )}

          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
            Uses the same period selection from Export Data above. Tokens are stored locally on your machine only.
          </p>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">Backup & Restore</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download size={18} /> Export Database
            </button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={18} /> Import Database
              <input type="file" accept=".db" onChange={handleRestore} style={{ display: 'none' }} />
            </label>
          </div>
          {restoreStatus && <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, marginBottom: 8 }}>{restoreStatus}</p>}
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Your database is stored as a single file (data/finance.db). Export to create a backup copy.
          </p>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">About</h3></div>
        <div className="card-body">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{appName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Personal Finance Tracker v0.1.0</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Local-first personal finance tracker. All data stored locally on your machine.
          </p>
        </div>
      </div>
    </>
  );
}
