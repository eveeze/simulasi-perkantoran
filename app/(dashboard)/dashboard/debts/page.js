'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

export default function DebtsPage() {
  const { user, getAuthHeaders } = useAuth();
  const [data, setData] = useState({
    data: [],
    totalDebt: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [payingDebt, setPayingDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [form, setForm] = useState({
    debtorName: '',
    creditorName: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  async function fetchData() {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL' && activeFilter !== 'OVERDUE')
        params.append('status', activeFilter);
      if (activeFilter === 'OVERDUE') params.append('overdue', 'true');
      const res = await fetch(`/api/debts?${params}`, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Fetch debts error:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      debtorName: '',
      creditorName: '',
      amount: '',
      dueDate: '',
      description: '',
    });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      debtorName: item.debtorName,
      creditorName: item.creditorName,
      amount: item.amount.toString(),
      dueDate: new Date(item.dueDate).toISOString().split('T')[0],
      description: item.description || '',
    });
    setShowModal(true);
  }

  function openPayment(debt) {
    setPayingDebt(debt);
    setPayAmount('');
    setShowPayModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    try {
      if (editing) {
        await fetch(`/api/debts/${editing.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/debts', {
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

  async function handlePayment(e) {
    e.preventDefault();
    if (!payingDebt) return;
    const newPaidAmount = payingDebt.paidAmount + parseFloat(payAmount);
    const newStatus = newPaidAmount >= payingDebt.amount ? 'PAID' : 'PARTIAL';
    try {
      await fetch(`/api/debts/${payingDebt.id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidAmount: newPaidAmount, status: newStatus }),
      });
      setShowPayModal(false);
      fetchData();
    } catch (err) {
      console.error('Payment error:', err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus data hutang ini?')) return;
    try {
      await fetch(`/api/debts/${id}`, {
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

  const isOverdue = (dueDate, status) =>
    status !== 'PAID' && new Date(dueDate) < new Date();

  const statusBadge = (status) => {
    const map = {
      UNPAID: 'badge-error',
      PARTIAL: 'badge-warning',
      PAID: 'badge-success',
    };
    return map[status] || 'badge-neutral';
  };

  const statusLabel = (status) => {
    const map = { UNPAID: 'Belum Lunas', PARTIAL: 'Sebagian', PAID: 'Lunas' };
    return map[status] || status;
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
            Hutang<span style={{ color: 'var(--color-text-muted)' }}>.</span>
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
            Tambah Hutang
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          {
            label: 'Total Hutang',
            value: formatCurrency(data.totalDebt),
            icon: '📋',
          },
          {
            label: 'Belum Lunas',
            value: formatCurrency(data.totalUnpaid),
            icon: '⚠️',
            accent: true,
          },
          {
            label: 'Sudah Dibayar',
            value: formatCurrency(data.totalPaid),
            icon: '✅',
          },
          { label: 'Jatuh Tempo', value: data.overdueCount, icon: '🔴' },
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
                color: stat.accent ? 'var(--color-error)' : 'var(--color-text)',
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { key: 'ALL', label: 'Semua' },
          { key: 'UNPAID', label: 'Belum Lunas' },
          { key: 'PARTIAL', label: 'Sebagian' },
          { key: 'PAID', label: 'Lunas' },
          { key: 'OVERDUE', label: '⚠ Jatuh Tempo' },
        ].map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${activeFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveFilter(f.key);
              setLoading(true);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Memuat data hutang...</p>
          </div>
        ) : !data.data || data.data.length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada data hutang</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Pihak</th>
                <th>Jumlah</th>
                <th>Terbayar</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
                {canManage && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {data.data.map((item) => (
                <tr
                  key={item.id}
                  style={
                    isOverdue(item.dueDate, item.status)
                      ? { background: 'rgba(239, 68, 68, 0.05)' }
                      : {}
                  }
                >
                  <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                      {item.debtorName}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      → {item.creditorName}
                    </div>
                    {item.description && (
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '0.25rem',
                        }}
                      >
                        {item.description.substring(0, 60)}
                      </div>
                    )}
                  </td>
                  <td
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  >
                    {formatCurrency(item.amount)}
                  </td>
                  <td
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-success)',
                    }}
                  >
                    {formatCurrency(item.paidAmount)}
                  </td>
                  <td
                    className="text-mono"
                    style={{
                      fontSize: '0.75rem',
                      color: isOverdue(item.dueDate, item.status)
                        ? 'var(--color-error)'
                        : 'inherit',
                    }}
                  >
                    {formatDate(item.dueDate)}
                    {isOverdue(item.dueDate, item.status) && (
                      <div
                        style={{
                          fontSize: '0.6rem',
                          color: 'var(--color-error)',
                        }}
                      >
                        LEWAT
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.375rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {item.status !== 'PAID' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openPayment(item)}
                          >
                            Bayar
                          </button>
                        )}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Hutang' : 'Tambah Hutang'}
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label className="input-label">Pihak Berhutang</label>
              <input
                type="text"
                className="input"
                placeholder="Nama debitur"
                value={form.debtorName}
                onChange={(e) =>
                  setForm({ ...form, debtorName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="input-label">Pihak Pemberi</label>
              <input
                type="text"
                className="input"
                placeholder="Nama kreditur"
                value={form.creditorName}
                onChange={(e) =>
                  setForm({ ...form, creditorName: e.target.value })
                }
                required
              />
            </div>
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
              <label className="input-label">Jatuh Tempo</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
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
            {editing ? 'Simpan Perubahan' : 'Tambah Hutang'}
          </button>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Catat Pembayaran"
      >
        {payingDebt && (
          <form onSubmit={handlePayment}>
            <div
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Total Hutang
                </span>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                >
                  {formatCurrency(payingDebt.amount)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Sudah Dibayar
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-success)',
                  }}
                >
                  {formatCurrency(payingDebt.paidAmount)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '0.5rem',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Sisa
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--color-error)',
                  }}
                >
                  {formatCurrency(payingDebt.amount - payingDebt.paidAmount)}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Jumlah Bayar (Rp)</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                max={payingDebt.amount - payingDebt.paidAmount}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Catat Pembayaran
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
