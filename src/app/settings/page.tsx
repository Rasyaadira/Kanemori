'use client';
import { useEffect, useState } from 'react';
import { Download, Upload, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [appName, setAppName] = useState('Kanemori');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [hideBalances, setHideBalances] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      if (s.app_name) setAppName(s.app_name);
      if (s.profile_photo) setProfilePhoto(s.profile_photo);
      if (s.hide_all_balances === 'true') setHideBalances(true);
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

  const monogram = (appName || 'K').charAt(0).toUpperCase();

  return (
    <>
      <div className="page-header">
        <div><h1>Settings</h1><p className="page-header-subtitle">App identity, display, and backup</p></div>
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
