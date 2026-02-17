'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const demoAccounts = [
    { label: 'Admin', email: 'admin@office.sim' },
    { label: 'Manager', email: 'manager@office.sim' },
    { label: 'Secretary', email: 'secretary@office.sim' },
    { label: 'Staff', email: 'staff@office.sim' },
    { label: 'Front Office', email: 'frontoffice@office.sim' },
  ];

  return (
    <div className="login-page">
      {/* Left — Branding */}
      <div className="login-branding">
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
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
        </Link>

        <div>
          <h1
            className="text-headline animate-fade-in"
            style={{ marginBottom: '1.5rem' }}
          >
            Masuk ke
            <br />
            <span style={{ color: 'var(--color-accent)' }}>Ruang Kerja</span>
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>
          <p
            className="animate-fade-in animate-delay-1"
            style={{
              color: 'var(--color-text-secondary)',
              maxWidth: '380px',
              lineHeight: 1.7,
            }}
          >
            Simulasi perkantoran digital dengan sistem presensi biometrik wajah.
            Gunakan akun demo untuk mengeksplorasi berbagai peran dalam
            organisasi.
          </p>
        </div>

        <span
          className="text-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          © 2026 SimKantor
        </span>
      </div>

      {/* Right — Form */}
      <div className="login-form-section">
        <div
          className="animate-fade-in animate-delay-2"
          style={{ width: '100%', maxWidth: '380px' }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="nama@office.sim"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '2rem' }}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Demo accounts */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--color-border)',
                }}
              />
              <span
                className="text-mono"
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.65rem',
                }}
              >
                AKUN DEMO
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--color-border)',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
              }}
            >
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('password123');
                  }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .login-branding {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: var(--spacing-page);
          border-right: 1px solid var(--color-border);
        }

        .login-form-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-page);
        }

        @media (max-width: 768px) {
          .login-page {
            grid-template-columns: 1fr;
          }

          .login-branding {
            border-right: none;
            border-bottom: 1px solid var(--color-border);
            padding: 1.5rem var(--spacing-page);
            gap: 1.5rem;
          }

          .login-form-section {
            padding: 2rem var(--spacing-page);
          }
        }
      `}</style>
    </div>
  );
}
