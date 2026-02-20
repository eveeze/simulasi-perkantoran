'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const roleLabels = {
  ADMIN: 'Administrator',
  MANAGER: 'Manajer',
  SECRETARY: 'Sekretaris',
  STAFF: 'Staf',
  FRONT_OFFICE: 'Front Office',
};

function NavIcon({ name }) {
  const icons = {
    dashboard: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
    attendance: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
    leave: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
    employees: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
    archive: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 8v13H3V8" />
        <path d="M1 3h22v5H1z" />
        <path d="M10 12h4" />
      </svg>
    ),
    correspondence: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    revenue: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    expenses: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
      </svg>
    ),
    debts: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 8v4l2 2" />
        <path d="M8 14h.01M16 14h.01" />
      </svg>
    ),
    reports: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    admin: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    faceRegister: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    logout: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const role = user?.role;

    if (role === 'FRONT_OFFICE') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        {
          href: '/dashboard/attendance',
          label: 'Kehadiran',
          icon: 'attendance',
        },
      ];
    }

    const items = [
      { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { href: '/dashboard/attendance', label: 'Kehadiran', icon: 'attendance' },
      { href: '/dashboard/leave', label: 'Cuti', icon: 'leave' },
    ];

    if (role === 'ADMIN') {
      items.push({
        href: '/dashboard/employees',
        label: 'Karyawan',
        icon: 'employees',
      });
      items.push({
        href: '/dashboard/face-register',
        label: 'Registrasi Wajah',
        icon: 'faceRegister',
      });
    }

    if (['ADMIN', 'SECRETARY', 'MANAGER'].includes(role)) {
      items.push({
        href: '/dashboard/correspondence',
        label: 'Korespondensi',
        icon: 'correspondence',
      });
    }

    items.push({
      href: '/dashboard/archive',
      label: 'Kearsipan',
      icon: 'archive',
    });

    // Financial section - for ADMIN, MANAGER, SECRETARY
    if (['ADMIN', 'MANAGER', 'SECRETARY'].includes(role)) {
      items.push({ type: 'divider', label: 'Keuangan' });
      items.push({
        href: '/dashboard/revenue',
        label: 'Pendapatan',
        icon: 'revenue',
      });
      items.push({
        href: '/dashboard/expenses',
        label: 'Pengeluaran',
        icon: 'expenses',
      });
      items.push({ href: '/dashboard/debts', label: 'Hutang', icon: 'debts' });
    }

    // Analytics & Admin - for ADMIN, MANAGER, SECRETARY
    if (['ADMIN', 'MANAGER', 'SECRETARY'].includes(role)) {
      items.push({ type: 'divider', label: 'Analitik' });
      items.push({
        href: '/dashboard/reports',
        label: 'Laporan',
        icon: 'reports',
      });
    }

    if (role === 'ADMIN') {
      items.push({
        href: '/dashboard/admin',
        label: 'Panel Admin',
        icon: 'admin',
      });
    }

    return items;
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 39,
          }}
          className="md-hidden"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div
          style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-accent)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              SimKantor
            </span>
          </div>
        </div>

        <nav
          style={{
            flex: 1,
            padding: '1rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
            <span
              className="text-mono"
              style={{
                fontSize: '0.65rem',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Menu
            </span>
          </div>

          {getNavItems().map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={`divider-${index}`}
                  style={{
                    padding: '0.75rem 1rem 0.5rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <span
                    className="text-mono"
                    style={{
                      fontSize: '0.6rem',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                onClick={onClose}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div style={{ marginBottom: '0.75rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 'var(--font-size-sm)',
                marginBottom: '0.125rem',
              }}
            >
              {user?.name || 'User'}
            </div>
            <span className="badge badge-accent" style={{ fontSize: '0.6rem' }}>
              {roleLabels[user?.role] || user?.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="sidebar-link"
            style={{
              width: '100%',
              border: 'none',
              cursor: 'pointer',
              background: 'none',
              textAlign: 'left',
            }}
          >
            <NavIcon name="logout" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
