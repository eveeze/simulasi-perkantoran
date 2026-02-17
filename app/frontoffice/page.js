'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const FaceScanner = dynamic(() => import('@/components/FaceScanner'), {
  ssr: false,
  loading: () => (
    <div className="empty-state" style={{ minHeight: '300px' }}>
      <p className="text-mono" style={{ color: 'var(--color-text-muted)' }}>
        Memuat komponen Face ID...
      </p>
    </div>
  ),
});

export default function FrontOfficePage() {
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleDescriptor = useCallback(async (descriptor) => {
    setProcessing(true);
    setResult(null);

    try {
      // Step 1: Verify face
      const verifyRes = await fetch('/api/face/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.matched) {
        setResult({
          type: 'error',
          message:
            verifyData.message ||
            'Wajah tidak dikenali. Hubungi Admin untuk mendaftarkan wajah Anda.',
        });
        return;
      }

      // Step 2: Auto check-in/out
      const checkRes = await fetch('/api/attendance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: verifyData.employee.id }),
      });
      const checkData = await checkRes.json();

      setResult({
        type: 'success',
        message: checkData.message,
        employee: verifyData.employee,
        action: checkData.action,
        distance: verifyData.distance,
      });
    } catch (err) {
      setResult({
        type: 'error',
        message: 'Terjadi kesalahan. Coba lagi.',
      });
    } finally {
      setProcessing(false);
    }
  }, []);

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
        <span className="badge badge-accent">Front Office</span>
      </nav>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '3rem var(--spacing-page)',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <h1
          className="text-headline animate-fade-in"
          style={{
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          Face <span style={{ color: 'var(--color-accent)' }}>ID</span>
          <span style={{ color: 'var(--color-text-muted)' }}>.</span>
        </h1>
        <p
          className="animate-fade-in animate-delay-1"
          style={{
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            marginBottom: '2.5rem',
            maxWidth: '420px',
          }}
        >
          Sistem presensi biometrik berbasis pengenalan wajah. Arahkan wajah ke
          kamera untuk absen masuk atau pulang.
        </p>

        {/* Face scanner — verify only */}
        <div
          className="animate-fade-in animate-delay-2"
          style={{ width: '100%' }}
        >
          <FaceScanner mode="verify" onDescriptorCaptured={handleDescriptor} />
        </div>

        {/* Processing */}
        {processing && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span
              className="text-mono"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.75rem',
              }}
            >
              Memproses...
            </span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background:
                result.type === 'success'
                  ? 'rgba(34, 197, 94, 0.08)'
                  : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${
                result.type === 'success'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)'
              }`,
              width: '100%',
              maxWidth: '640px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>
                {result.type === 'success' ? '✓' : '✗'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  color: result.type === 'success' ? '#4ade80' : '#f87171',
                }}
              >
                {result.type === 'success' ? 'Berhasil' : 'Gagal'}
              </span>
              {result.action && (
                <span className="badge badge-success">{result.action}</span>
              )}
            </div>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {result.message}
            </p>
            {result.employee && (
              <div
                className="text-mono"
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.7rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {result.employee.name} · {result.employee.role}
                {result.distance !== undefined &&
                  ` · Jarak: ${result.distance.toFixed(4)}`}
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        <div
          className="animate-fade-in animate-delay-3"
          style={{
            marginTop: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            maxWidth: '640px',
            width: '100%',
          }}
        >
          <p
            className="text-mono"
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            Wajah belum terdaftar? Hubungi Administrator untuk mendaftarkan
            wajah Anda melalui menu <strong>Registrasi Wajah</strong> di
            dashboard.
          </p>
        </div>
      </main>
    </div>
  );
}
