'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

const REPORT_TYPES = {
  DAILY: 'Harian',
  WEEKLY: 'Mingguan',
  MONTHLY: 'Bulanan',
  ANNUAL: 'Tahunan',
  CUSTOM: 'Khusus',
};

export default function ReportsPage() {
  const { user, getAuthHeaders } = useAuth();
  const [data, setData] = useState({ data: [], financialSummary: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [form, setForm] = useState({
    title: '',
    type: 'MONTHLY',
    period: '',
    content: '',
    summary: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  async function fetchData() {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.append('type', activeFilter);
      const res = await fetch(`/api/reports?${params}`, {
        headers: getAuthHeaders(),
      });
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      title: '',
      type: 'MONTHLY',
      period: '',
      content: '',
      summary: '',
    });
    setShowModal(true);
  }
  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title,
      type: item.type,
      period: item.period || '',
      content: item.content || '',
      summary: item.summary || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    try {
      if (editing)
        await fetch(`/api/reports/${editing.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(form),
        });
      else
        await fetch('/api/reports', {
          method: 'POST',
          headers,
          body: JSON.stringify(form),
        });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n || 0);
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—';
  const canManage = ['ADMIN', 'MANAGER', 'SECRETARY'].includes(user?.role);
  const fs = data.financialSummary || {};

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
            Analitik
          </p>
          <h1 className="text-title">
            Laporan<span style={{ color: 'var(--color-text-muted)' }}>.</span>
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
            Buat Laporan
          </button>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          Ringkasan Keuangan Bulan Ini
        </h3>
        <div className="stats-grid">
          {[
            {
              label: 'Pendapatan',
              value: fmt(fs.revenueThisMonth),
              icon: '📈',
              color: 'var(--color-success)',
            },
            {
              label: 'Pengeluaran',
              value: fmt(fs.expenseThisMonth),
              icon: '📉',
              color: 'var(--color-error)',
            },
            {
              label: 'Laba/Rugi',
              value: fmt(fs.profit),
              icon: (fs.profit || 0) >= 0 ? '✅' : '⚠️',
              color:
                (fs.profit || 0) >= 0
                  ? 'var(--color-success)'
                  : 'var(--color-error)',
            },
            {
              label: 'Hutang Outstanding',
              value: fmt(fs.outstandingDebt),
              icon: '💳',
              color: 'var(--color-warning)',
            },
          ].map((s) => (
            <div key={s.label} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
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
                  {s.label}
                </span>
                <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {(fs.revenueThisMonth > 0 || fs.expenseThisMonth > 0) && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Rasio Pendapatan vs Pengeluaran
            </span>
            <span
              className="text-mono"
              style={{
                fontSize: '0.7rem',
                color:
                  (fs.profit || 0) >= 0
                    ? 'var(--color-success)'
                    : 'var(--color-error)',
              }}
            >
              {(fs.profit || 0) >= 0 ? '+' : ''}
              {fmt(fs.profit)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                width: `${Math.max(5, (fs.revenueThisMonth / Math.max(fs.revenueThisMonth + fs.expenseThisMonth, 1)) * 100)}%`,
                background: 'var(--color-success)',
                transition: 'width 0.5s',
              }}
            />
            <div
              style={{
                width: `${Math.max(5, (fs.expenseThisMonth / Math.max(fs.revenueThisMonth + fs.expenseThisMonth, 1)) * 100)}%`,
                background: 'var(--color-error)',
                transition: 'width 0.5s',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
            }}
          >
            <span
              style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}
            >
              ● Pendapatan
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-error)' }}>
              ● Pengeluaran
            </span>
          </div>
        </div>
      )}

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
        {Object.entries(REPORT_TYPES).map(([k, v]) => (
          <button
            key={k}
            className={`btn btn-sm ${activeFilter === k ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveFilter(k);
              setLoading(true);
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="empty-state">
            <p>Memuat laporan...</p>
          </div>
        ) : !data.data?.length ? (
          <div className="empty-state">
            <p>Belum ada laporan</p>
          </div>
        ) : (
          data.data.map((r) => (
            <div key={r.id} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span className="badge badge-info">
                      {REPORT_TYPES[r.type]}
                    </span>
                    {r.period && (
                      <span className="badge badge-neutral">{r.period}</span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {r.title}
                  </h3>
                  {r.summary && (
                    <p
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                        lineHeight: 1.6,
                      }}
                    >
                      {r.summary.substring(0, 200)}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    className="text-mono"
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {r.createdBy?.name}
                  </div>
                  <div
                    className="text-mono"
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {fmtDate(r.createdAt)}
                  </div>
                  {canManage && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.375rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDelete(r.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Laporan' : 'Buat Laporan'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Judul</label>
            <input
              type="text"
              className="input"
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
              <label className="input-label">Tipe</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {Object.entries(REPORT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Periode</label>
              <input
                type="text"
                className="input"
                placeholder="Feb 2026"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Ringkasan</label>
            <textarea
              className="input"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              style={{ minHeight: 80 }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Konten</label>
            <textarea
              className="input"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ minHeight: 150 }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {editing ? 'Simpan' : 'Buat Laporan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
