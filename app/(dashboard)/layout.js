'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';

function DashboardShell({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Memuat...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className="main-content"
        style={{
          flex: 1,
          marginLeft: '260px',
          minHeight: '100vh',
        }}
      >
        {/* Top bar */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem var(--spacing-page)',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            background: 'var(--color-bg)',
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div />
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <span
              className="text-mono"
              style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}
            >
              {user.department?.name || '—'}
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-inverse)',
              }}
            >
              {user.name?.[0] || '?'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: 'var(--spacing-page)' }}>{children}</div>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
