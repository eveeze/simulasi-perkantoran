'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

const CATEGORIES = {
  OPERASIONAL: 'Operasional',
  GAJI: 'Gaji',
  UTILITAS: 'Utilitas',
  TRANSPORTASI: 'Transportasi',
  PERLENGKAPAN: 'Perlengkapan',
  PEMELIHARAAN: 'Pemeliharaan',
  LAINNYA: 'Lainnya',
};

const categoryColors = {
  OPERASIONAL: 'badge-info',
  GAJI: 'badge-warning',
  UTILITAS: 'badge-accent',
  TRANSPORTASI: 'badge-neutral',
  PERLENGKAPAN: 'badge-success',
  PEMELIHARAAN: 'badge-error',
  LAINNYA: 'badge-neutral',
};

export default function ExpensesPage() {
  const { user, getAuthHeaders } = useAuth();
  const [data, setData] = useState({
    data: [],
    total: 0,
    thisMonth: 0,
    byCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'OPERASIONAL',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  async function fetchData() {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.append('category', activeFilter);
      const res = await fetch(`/api/expenses?${params}`, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      title: '',
      amount: '',
      category: 'OPERASIONAL',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title,
      amount: item.amount.toString(),
      category: item.category,
      date: new Date(item.date).toISOString().split('T')[0],
      description: item.description || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    try {
      if (editing) {
        await fetch(`/api/expenses/${editing.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/expenses', {
          method: 'POST',
          headers,
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus data pengeluaran ini?')) return;
    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  const formatCurrency = (num) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const canManage = ['ADMIN', 'MANAGER', 'SECRETARY'].includes(user?.role);

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <p
            className="text-mono"
            style={{
              color: 'var(--color-text-muted)',
              marginBottom: '0.5rem',
              fontSize: '0.7rem',
            }}
          >
            Keuangan
          </p>
          <h1 className="text-title">
            Pengeluaran
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openCreate}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Pengeluaran
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          {
            label: 'Total Pengeluaran',
            value: formatCurrency(data.total),
            icon: '💸',
          },
          {
            label: 'Bulan Ini',
            value: formatCurrency(data.thisMonth),
            icon: '📉',
            accent: true,
          },
          {
            label: 'Kategori Terbanyak',
            value: Object.entries(data.byCategory || {}).sort(
              (a, b) => b[1] - a[1],
            )[0]?.[0]
              ? CATEGORIES[
                  Object.entries(data.byCategory).sort(
                    (a, b) => b[1] - a[1],
                  )[0][0]
                ]
              : '—',
            icon: '📋',
          },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <span
                className="text-mono"
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {stat.label}
              </span>
              <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize:
                  typeof stat.value === 'string' && stat.value.length > 15
                    ? '1.25rem'
                    : '1.75rem',
                fontWeight: 700,
                color: stat.accent
                  ? 'var(--color-warning)'
                  : 'var(--color-text)',
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <button
          className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveFilter('ALL');
            setLoading(true);
          }}
        >
          Semua
        </button>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            className={`btn btn-sm ${activeFilter === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveFilter(key);
              setLoading(true);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Memuat data pengeluaran...</p>
          </div>
        ) : !data.data || data.data.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada data pengeluaran</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
                <th>Pembuat</th>
                {canManage && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {data.data.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    <div>{item.title}</div>
                    {item.description && (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '0.25rem',
                        }}
                      >
                        {item.description.substring(0, 80)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${categoryColors[item.category] || 'badge-neutral'}`}
                    >
                      {CATEGORIES[item.category] || item.category}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--color-error)',
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="text-mono" style={{ fontSize: '0.75rem' }}>
                    {formatDate(item.date)}
                  </td>
                  <td>{item.createdBy?.name || '—'}</td>
                  {canManage && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => handleDelete(item.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Judul</label>
            <input
              type="text"
              className="input"
              placeholder="Judul pengeluaran..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label className="input-label">Jumlah (Rp)</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Kategori</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Tanggal</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Keterangan</label>
            <textarea
              className="input"
              placeholder="Keterangan tambahan..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {editing ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
