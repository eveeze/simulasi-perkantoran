'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

export default function LeavePage() {
  const { user, getAuthHeaders } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    try {
      const res = await fetch('/api/leave', { headers: getAuthHeaders() });
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch leaves error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ startDate: '', endDate: '', reason: '' });
        fetchLeaves();
      }
    } catch (err) {
      console.error('Submit leave error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(id, status) {
    try {
      await fetch(`/api/leave/${id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchLeaves();
    } catch (err) {
      console.error('Leave action error:', err);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusBadge = (status) => {
    const map = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-error',
    };
    return map[status] || 'badge-neutral';
  };

  const statusLabel = (status) => {
    const map = {
      PENDING: 'Menunggu',
      APPROVED: 'Disetujui',
      REJECTED: 'Ditolak',
    };
    return map[status] || status;
  };

  const canApprove = ['ADMIN', 'MANAGER'].includes(user?.role);

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
            Manajemen
          </p>
          <h1 className="text-title">
            Cuti
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
          Ajukan Cuti
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Memuat data cuti...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pengajuan cuti</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Periode</th>
                <th>Alasan</th>
                <th>Status</th>
                {canApprove && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    <div>{leave.employee?.name || '—'}</div>
                    <div
                      className="text-mono"
                      style={{
                        fontSize: '0.6rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {leave.employee?.department?.name || '—'}
                    </div>
                  </td>
                  <td className="text-mono" style={{ fontSize: '0.75rem' }}>
                    {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  </td>
                  <td style={{ maxWidth: '250px' }}>{leave.reason}</td>
                  <td>
                    <span className={`badge ${statusBadge(leave.status)}`}>
                      {statusLabel(leave.status)}
                    </span>
                  </td>
                  {canApprove && (
                    <td>
                      {leave.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAction(leave.id, 'APPROVED')}
                          >
                            Setuju
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleAction(leave.id, 'REJECTED')}
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Leave Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ajukan Cuti"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Tanggal Mulai</label>
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Tanggal Selesai</label>
            <input
              type="date"
              className="input"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Alasan</label>
            <textarea
              className="input"
              placeholder="Jelaskan alasan pengajuan cuti..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
