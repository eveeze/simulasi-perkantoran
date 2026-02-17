'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

export default function ArchivePage() {
  const { getAuthHeaders } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'REPORT',
  });

  useEffect(() => {
    fetchDocuments();
  }, [activeFilter, searchQuery]);

  async function fetchDocuments() {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.append('category', activeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
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
        setForm({ title: '', content: '', category: 'REPORT' });
        fetchDocuments();
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus dokumen ini?')) return;
    try {
      await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchDocuments();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
      REPORT: 'Laporan',
    };
    return map[cat] || cat;
  };

  const filters = [
    { key: 'ALL', label: 'Semua' },
    { key: 'INCOMING', label: 'Masuk' },
    { key: 'OUTGOING', label: 'Keluar' },
    { key: 'MEMO', label: 'Memo' },
    { key: 'REPORT', label: 'Laporan' },
  ];

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
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
            Digital
          </p>
          <h1 className="text-title">
            Kearsipan
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
          Arsipkan Dokumen
        </button>
      </div>

      {/* Filters + Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={`btn btn-sm ${activeFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setActiveFilter(f.key);
                setLoading(true);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="input"
          placeholder="Cari dokumen..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setLoading(true);
          }}
          style={{ maxWidth: '280px' }}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Memuat arsip...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada dokumen ditemukan</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Pembuat</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td
                    style={{
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      maxWidth: '300px',
                    }}
                  >
                    {doc.title}
                  </td>
                  <td>
                    <span className={`badge ${categoryBadge(doc.category)}`}>
                      {categoryLabel(doc.category)}
                    </span>
                  </td>
                  <td>{doc.creator?.name || '—'}</td>
                  <td className="text-mono" style={{ fontSize: '0.75rem' }}>
                    {formatDate(doc.createdAt)}
                  </td>
                  <td>
                    {doc.signedAt ? (
                      <span className="badge badge-success">
                        Ditandatangani
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Draf</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-error)' }}
                      onClick={() => handleDelete(doc.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Archive Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Arsipkan Dokumen"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Kategori</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="INCOMING">Surat Masuk</option>
              <option value="OUTGOING">Surat Keluar</option>
              <option value="MEMO">Memo Internal</option>
              <option value="REPORT">Laporan</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Judul Dokumen</label>
            <input
              type="text"
              className="input"
              placeholder="Judul dokumen..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Deskripsi / Konten</label>
            <textarea
              className="input"
              placeholder="Deskripsi singkat dokumen..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Simpan Arsip
          </button>
        </form>
      </Modal>
    </div>
  );
}
