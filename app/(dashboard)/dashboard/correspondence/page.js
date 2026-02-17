'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

export default function CorrespondencePage() {
  const { user, getAuthHeaders } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'OUTGOING',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      const filtered = Array.isArray(data)
        ? data.filter((d) =>
            ['INCOMING', 'OUTGOING', 'MEMO'].includes(d.category),
          )
        : [];
      setDocuments(filtered);
    } catch (err) {
      console.error('Fetch docs error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ title: '', content: '', category: 'OUTGOING' });
        fetchDocuments();
      }
    } catch (err) {
      console.error('Create doc error:', err);
    }
  }

  async function handleSign(id) {
    try {
      await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed: true }),
      });
      fetchDocuments();
    } catch (err) {
      console.error('Sign error:', err);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categoryBadge = (cat) => {
    const map = {
      INCOMING: 'badge-info',
      OUTGOING: 'badge-accent',
      MEMO: 'badge-warning',
      REPORT: 'badge-neutral',
    };
    return map[cat] || 'badge-neutral';
  };

  const categoryLabel = (cat) => {
    const map = {
      INCOMING: 'Surat Masuk',
      OUTGOING: 'Surat Keluar',
      MEMO: 'Memo',
    };
    return map[cat] || cat;
  };

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
            Modul
          </p>
          <h1 className="text-title">
            Korespondensi
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>
        </div>
        {['SECRETARY', 'ADMIN', 'MANAGER'].includes(user?.role) && (
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
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
            Buat Surat
          </button>
        )}
      </div>

      {/* Documents list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="empty-state">
            <p>Memuat korespondensi...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada surat</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="card card-interactive"
              style={{ cursor: 'default' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span className={`badge ${categoryBadge(doc.category)}`}>
                      {categoryLabel(doc.category)}
                    </span>
                    {doc.signedAt && (
                      <span className="badge badge-success">
                        ✓ Ditandatangani
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {doc.title}
                  </h3>
                  {doc.content && (
                    <p
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                      }}
                    >
                      {doc.content.substring(0, 200)}
                      {doc.content.length > 200 ? '...' : ''}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <div
                    className="text-mono"
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {doc.creator?.name || '—'}
                  </div>
                  <div
                    className="text-mono"
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {formatDate(doc.createdAt)}
                  </div>
                  {!doc.signedAt &&
                    ['MANAGER', 'ADMIN'].includes(user?.role) && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.75rem' }}
                        onClick={() => handleSign(doc.id)}
                      >
                        Tanda Tangan
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Buat Surat Baru"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Jenis Surat</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="OUTGOING">Surat Keluar</option>
              <option value="INCOMING">Surat Masuk</option>
              <option value="MEMO">Memo Internal</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Judul / Perihal</label>
            <input
              type="text"
              className="input"
              placeholder="Perihal surat..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Isi Surat</label>
            <textarea
              className="input"
              placeholder="Isi surat..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ minHeight: '150px' }}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Kirim Surat
          </button>
        </form>
      </Modal>
    </div>
  );
}
