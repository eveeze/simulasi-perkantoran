'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardPage() {
  const { user, getAuthHeaders } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      };

      const [attRes, leaveRes, empRes] = await Promise.all([
        fetch('/api/attendance', { headers }),
        fetch('/api/leave?status=PENDING', { headers }),
        fetch('/api/employees'),
      ]);

      const attendance = await attRes.json();
      const leaves = await leaveRes.json();
      const employees = await empRes.json();

      setRecentAttendance(
        Array.isArray(attendance) ? attendance.slice(0, 5) : [],
      );
      setPendingLeaves(Array.isArray(leaves) ? leaves : []);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const todayAttendance = Array.isArray(attendance)
        ? attendance.filter((a) => a.date?.startsWith(todayStr))
        : [];

      setStats({
        totalEmployees: Array.isArray(employees) ? employees.length : 0,
        todayPresent: todayAttendance.filter((a) => a.status === 'PRESENT')
          .length,
        todayLate: todayAttendance.filter((a) => a.status === 'LATE').length,
        pendingLeaves: Array.isArray(leaves) ? leaves.length : 0,
      });
    } catch (err) {
      console.error('Dashboard data error:', err);
    }
  }

  const roleGreeting = {
    ADMIN: 'Administrator',
    MANAGER: 'Manajer',
    SECRETARY: 'Sekretaris',
    STAFF: 'Staf',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
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
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-error',
    };
    return map[status] || 'badge-neutral';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p
          className="text-mono"
          style={{
            color: 'var(--color-text-muted)',
            marginBottom: '0.5rem',
            fontSize: '0.7rem',
          }}
        >
          {roleGreeting[user?.role] || 'Dashboard'}
        </p>
        <h1 className="text-title">
          Selamat datang,{' '}
          <span style={{ color: 'var(--color-accent)' }}>
            {user?.name?.split(' ')[0]}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>.</span>
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          {
            label: 'Total Karyawan',
            value: stats?.totalEmployees ?? '—',
            icon: '👥',
          },
          {
            label: 'Hadir Hari Ini',
            value: stats?.todayPresent ?? '—',
            icon: '✓',
            accent: true,
          },
          {
            label: 'Terlambat',
            value: stats?.todayLate ?? '—',
            icon: '⏰',
          },
          {
            label: 'Cuti Pending',
            value: stats?.pendingLeaves ?? '—',
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
                fontSize: '2rem',
                fontWeight: 700,
                color: stat.accent
                  ? 'var(--color-accent)'
                  : 'var(--color-text)',
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="dashboard-grid">
        {/* Recent Attendance */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
              }}
            >
              Kehadiran Terkini
            </h3>
            <span className="badge badge-neutral">
              {recentAttendance.length}
            </span>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>
                Belum ada data kehadiran
              </p>
            </div>
          ) : (
            <div>
              {recentAttendance.map((att) => (
                <div
                  key={att.id}
                  style={{
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 500,
                        marginBottom: '0.125rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {att.employee?.name || '—'}
                    </div>
                    <div
                      className="text-mono"
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.65rem',
                      }}
                    >
                      {formatDate(att.date)} · {formatTime(att.checkIn)} →{' '}
                      {formatTime(att.checkOut)}
                    </div>
                  </div>
                  <span className={`badge ${statusBadge(att.status)}`}>
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Leaves */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
              }}
            >
              Pengajuan Cuti Pending
            </h3>
            <span className="badge badge-warning">{pendingLeaves.length}</span>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>
                Tidak ada pengajuan cuti pending
              </p>
            </div>
          ) : (
            <div>
              {pendingLeaves.slice(0, 5).map((leave) => (
                <div
                  key={leave.id}
                  style={{
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {leave.employee?.name || '—'}
                    </span>
                    <span className="badge badge-warning">PENDING</span>
                  </div>
                  <div
                    className="text-mono"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '0.65rem',
                    }}
                  >
                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                  </div>
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      marginTop: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {leave.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
