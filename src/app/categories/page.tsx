'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Category {
  id: number; name: string; type: string; icon: string; color: string;
  parent_id: number | null; is_active: number; sort_order: number;
}

const BLUE_SHADES = ['#2853FF', '#4A7BFF', '#66BFE8', '#1A2F6E', '#8BD0F0', '#B8E2F8', '#3D6AFF', '#5598E8'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', type: 'expense' });

  const fetchCategories = () => { fetch('/api/categories').then(r => r.json()).then(setCategories); };
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = (type: string) => {
    setEditing(null);
    setForm({ name: '', type });
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/categories/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, is_active: 1 }) });
    } else {
      await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setShowModal(false);
    fetchCategories();
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!confirm('Hide this category? Existing transactions will keep their saved category, but this category will no longer appear for new selections.')) return;
    await fetch(`/api/categories/${editing.id}`, { method: 'DELETE' });
    setShowModal(false);
    fetchCategories();
  };

  const active = categories.filter(c => c.is_active);
  const expense = active.filter(c => c.type === 'expense');
  const income = active.filter(c => c.type === 'income');

  const renderGroup = (title: string, items: Category[], type: string) => (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <h3 className="card-title">{title} ({items.length})</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => openCreate(type)}><Plus size={16} /> Add</button>
      </div>
      <div className="card-body">
        {items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No categories</p>
        ) : (
          <div className="category-grid">
            {items.map((c, i) => (
              <button key={c.id} className="category-tile" onClick={() => openEdit(c)}>
                <div className="color-marker" style={{ background: BLUE_SHADES[i % BLUE_SHADES.length] }} />
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div><h1>Categories</h1><p className="page-header-subtitle">Organize your transactions</p></div>
      </div>

      {renderGroup('Expense Categories', expense, 'expense')}
      {renderGroup('Income Categories', income, 'income')}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Category' : 'New Category'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category name" required />
                </div>
              </div>
              <div className="modal-footer">
                {editing && (
                  <div className="modal-footer-left">
                    <button type="button" className="btn-danger-text" onClick={handleDelete}>Hide Category</button>
                  </div>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
