'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function AttendancePage() {
  const { user, getAuthHeaders } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    try {
      const res = await fetch('/api/attendance', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusBadge = (status) => {
    const map = {
      PRESENT: 'badge-success',
      LATE: 'badge-warning',
      ABSENT: 'badge-error',
      LEAVE: 'badge-info',
    };
    return map[status] || 'badge-neutral';
  };

  const statusLabel = (status) => {
    const map = {
      PRESENT: 'Hadir',
      LATE: 'Terlambat',
      ABSENT: 'Absen',
      LEAVE: 'Cuti',
    };
    return map[status] || status;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <p
          className="text-mono"
          style={{
            color: 'var(--color-text-muted)',
            marginBottom: '0.5rem',
            fontSize: '0.7rem',
          }}
        >
          Riwayat
        </p>
        <h1 className="text-title">
          Kehadiran
          <span style={{ color: 'var(--color-text-muted)' }}>.</span>
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          {
            label: 'Total Record',
            value: attendance.length,
            className: '',
          },
          {
            label: 'Hadir',
            value: attendance.filter((a) => a.status === 'PRESENT').length,
            className: 'badge-success',
          },
          {
            label: 'Terlambat',
            value: attendance.filter((a) => a.status === 'LATE').length,
            className: 'badge-warning',
          },
        ].map((s) => (
          <div key={s.label} className="card">
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
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                marginTop: '0.5rem',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Memuat data kehadiran...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada data kehadiran</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {user?.role !== 'STAFF' && <th>Karyawan</th>}
                <th>Tanggal</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((att) => (
                <tr key={att.id}>
                  {user?.role !== 'STAFF' && (
                    <td
                      style={{
                        fontWeight: 500,
                        color: 'var(--color-text)',
                      }}
                    >
                      {att.employee?.name || '—'}
                    </td>
                  )}
                  <td>{formatDate(att.date)}</td>
                  <td className="text-mono">{formatTime(att.checkIn)}</td>
                  <td className="text-mono">{formatTime(att.checkOut)}</td>
                  <td>
                    <span className={`badge ${statusBadge(att.status)}`}>
                      {statusLabel(att.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
