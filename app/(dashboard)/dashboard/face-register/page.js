'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
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

export default function FaceRegisterPage() {
  const { user, getAuthHeaders } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleDescriptor = useCallback(
    async (descriptor) => {
      if (!selectedEmployee) {
        setResult({
          type: 'error',
          message: 'Pilih karyawan terlebih dahulu.',
        });
        return;
      }

      setProcessing(true);
      setResult(null);

      try {
        const res = await fetch('/api/face/register', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeId: selectedEmployee,
            descriptor,
          }),
        });
        const data = await res.json();

        if (res.ok) {
          setResult({
            type: 'success',
            message: data.message || 'Wajah berhasil didaftarkan!',
          });
        } else {
          setResult({
            type: 'error',
            message: data.error || 'Gagal mendaftarkan wajah.',
          });
        }
      } catch (err) {
        setResult({
          type: 'error',
          message: 'Terjadi kesalahan. Coba lagi.',
        });
      } finally {
        setProcessing(false);
      }
    },
    [selectedEmployee, getAuthHeaders],
  );

  // Only Admin can access
  if (user?.role !== 'ADMIN') {
    return (
      <div className="empty-state" style={{ minHeight: '50vh' }}>
        <h2 className="text-title" style={{ marginBottom: '0.5rem' }}>
          Akses Ditolak
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Halaman ini hanya dapat diakses oleh Administrator.
        </p>
      </div>
    );
  }

  const selectedEmp = employees.find((e) => e.id === selectedEmployee);

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
          Biometrik
        </p>
        <h1 className="text-title">
          Registrasi Wajah
          <span style={{ color: 'var(--color-text-muted)' }}>.</span>
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            marginTop: '0.5rem',
            maxWidth: '500px',
          }}
        >
          Daftarkan wajah karyawan untuk sistem presensi biometrik. Pilih
          karyawan, lalu arahkan wajah mereka ke kamera.
        </p>
      </div>

      {/* Employee selection */}
      <div
        style={{
          marginBottom: '2rem',
          maxWidth: '500px',
        }}
      >
        <label className="input-label">Pilih Karyawan</label>
        <select
          className="input"
          value={selectedEmployee}
          onChange={(e) => {
            setSelectedEmployee(e.target.value);
            setResult(null);
          }}
        >
          <option value="">— Pilih karyawan untuk didaftarkan —</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.role})
              {emp.faceDescriptor?.length > 0 ? ' ✓ Terdaftar' : ''}
            </option>
          ))}
        </select>

        {selectedEmp && (
          <div
            className="card"
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-bg)',
                fontWeight: 700,
                fontSize: 'var(--font-size-sm)',
                flexShrink: 0,
              }}
            >
              {selectedEmp.name.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                {selectedEmp.name}
              </div>
              <div
                className="text-mono"
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {selectedEmp.email} · {selectedEmp.role}
              </div>
            </div>
            <span
              className={`badge ${selectedEmp.faceDescriptor?.length > 0 ? 'badge-success' : 'badge-warning'}`}
              style={{ marginLeft: 'auto', flexShrink: 0 }}
            >
              {selectedEmp.faceDescriptor?.length > 0
                ? '✓ Terdaftar'
                : 'Belum Terdaftar'}
            </span>
          </div>
        )}
      </div>

      {/* Face scanner */}
      <div style={{ maxWidth: '640px' }}>
        <FaceScanner mode="register" onDescriptorCaptured={handleDescriptor} />
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
            maxWidth: '640px',
          }}
        >
          <span
            className="text-mono"
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
            }}
          >
            Mendaftarkan wajah...
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
          </div>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
