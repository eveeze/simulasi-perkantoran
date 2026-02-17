'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem var(--spacing-page)',
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/frontoffice" className="btn btn-ghost">
            Front Office
          </Link>
          <Link href="/login" className="btn btn-primary">
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          padding: '0 var(--spacing-page)',
        }}
      >
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 80px)',
            maxWidth: '1400px',
          }}
        >
          {/* Top label */}
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <span className="badge badge-accent">v1.0</span>
            <span
              className="text-mono"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Simulasi Perkantoran Digital
            </span>
          </div>

          {/* Big headline */}
          <h1
            className="text-display animate-fade-in animate-delay-1"
            style={{
              marginBottom: '2rem',
              maxWidth: '900px',
            }}
          >
            Kantor
            <br />
            <span style={{ color: 'var(--color-accent)' }}>Virtual</span>
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>

          {/* Description */}
          <p
            className="animate-fade-in animate-delay-2"
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: '540px',
              lineHeight: 1.7,
              marginBottom: '3rem',
            }}
          >
            Platform simulasi perkantoran modern dengan sistem presensi
            biometrik, manajemen cuti, kearsipan digital, dan dashboard
            multi-peran — dibangun untuk mempersiapkan tenaga administratif masa
            depan.
          </p>

          {/* CTA row */}
          <div
            className="animate-fade-in animate-delay-3"
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <Link href="/login" className="btn btn-primary btn-lg">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Masuk Dashboard
            </Link>
            <Link href="/frontoffice" className="btn btn-secondary btn-lg">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Face ID Scanner
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-in animate-delay-4"
            style={{
              display: 'flex',
              gap: '3rem',
              marginTop: '5rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Departemen', value: '4' },
              { label: 'Peran Aktif', value: '5' },
              { label: 'Modul', value: '6' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-mono"
                  style={{
                    color: 'var(--color-text-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer bar */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem var(--spacing-page)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <span
          className="text-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          SimKantor © 2026
        </span>
        <span
          className="text-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {time} WIB
        </span>
      </footer>
    </div>
  );
}
