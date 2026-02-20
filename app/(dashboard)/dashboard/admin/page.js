'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminPage() {
  const { user, getAuthHeaders } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin', { headers: getAuthHeaders() });
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (user?.role !== 'ADMIN')
    return (
      <div className="animate-fade-in">
        <div className="empty-state">
          <p>Akses hanya untuk Admin</p>
        </div>
      </div>
    );

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
          Sistem
        </p>
        <h1 className="text-title">
          Panel Admin<span style={{ color: 'var(--color-text-muted)' }}>.</span>
        </h1>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Memuat data...</p>
        </div>
      ) : !data ? (
        <div className="empty-state">
          <p>Gagal memuat data</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
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
              Ikhtisar Kantor
            </h3>
            <div className="stats-grid">
              {[
                {
                  label: 'Total Karyawan',
                  value: data.overview.employeeCount,
                  icon: '👥',
                },
                {
                  label: 'Departemen',
                  value: data.overview.departmentCount,
                  icon: '🏢',
                },
                {
                  label: 'Hadir Hari Ini',
                  value: data.overview.todayAttendance,
                  icon: '✅',
                },
                {
                  label: 'Cuti Pending',
                  value: data.overview.pendingLeaves,
                  icon: '📋',
                  color:
                    data.overview.pendingLeaves > 0
                      ? 'var(--color-warning)'
                      : undefined,
                },
                {
                  label: 'Total Dokumen',
                  value: data.overview.documentCount,
                  icon: '📄',
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
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      color: s.color || 'var(--color-text)',
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Overview */}
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
              Keuangan Bulan Ini
            </h3>
            <div className="stats-grid">
              {[
                {
                  label: 'Pendapatan',
                  value: fmt(data.financial.revenueThisMonth),
                  icon: '📈',
                  color: 'var(--color-success)',
                },
                {
                  label: 'Pengeluaran',
                  value: fmt(data.financial.expenseThisMonth),
                  icon: '📉',
                  color: 'var(--color-error)',
                },
                {
                  label: 'Laba Bersih',
                  value: fmt(data.financial.profit),
                  icon: data.financial.profit >= 0 ? '💰' : '⚠️',
                  color:
                    data.financial.profit >= 0
                      ? 'var(--color-success)'
                      : 'var(--color-error)',
                },
                {
                  label: 'Hutang Aktif',
                  value: `${data.financial.unpaidDebtCount} (${fmt(data.financial.outstandingDebt)})`,
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
                      fontSize: '1.1rem',
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

          {/* Recent Activity */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Recent Documents */}
            <div className="card">
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                📄 Dokumen Terbaru
              </h4>
              {data.recentActivity.documents?.length ? (
                data.recentActivity.documents.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 500,
                        }}
                      >
                        {d.title}
                      </div>
                      <div
                        className="text-mono"
                        style={{
                          fontSize: '0.6rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {d.creator?.name} · {fmtDate(d.createdAt)}
                      </div>
                    </div>
                    <span
                      className="badge badge-info"
                      style={{ fontSize: '0.6rem', alignSelf: 'center' }}
                    >
                      {d.category}
                    </span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Tidak ada dokumen
                </p>
              )}
            </div>

            {/* Recent Revenue */}
            <div className="card">
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                📈 Pendapatan Terbaru
              </h4>
              {data.recentActivity.revenues?.length ? (
                data.recentActivity.revenues.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 500,
                        }}
                      >
                        {r.title}
                      </div>
                      <div
                        className="text-mono"
                        style={{
                          fontSize: '0.6rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {r.createdBy?.name}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-success)',
                        fontSize: 'var(--font-size-sm)',
                        alignSelf: 'center',
                      }}
                    >
                      {fmt(r.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Tidak ada pendapatan
                </p>
              )}
            </div>

            {/* Recent Expenses */}
            <div className="card">
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                📉 Pengeluaran Terbaru
              </h4>
              {data.recentActivity.expenses?.length ? (
                data.recentActivity.expenses.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 500,
                        }}
                      >
                        {e.title}
                      </div>
                      <div
                        className="text-mono"
                        style={{
                          fontSize: '0.6rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {e.createdBy?.name}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-error)',
                        fontSize: 'var(--font-size-sm)',
                        alignSelf: 'center',
                      }}
                    >
                      {fmt(e.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Tidak ada pengeluaran
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
