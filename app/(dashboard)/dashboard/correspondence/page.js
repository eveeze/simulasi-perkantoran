'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

const categoryLabel = {
  INCOMING: 'Surat Masuk',
  OUTGOING: 'Surat Keluar',
  MEMO: 'Memo',
  REPORT: 'Laporan',
};
const categoryBadge = {
  INCOMING: 'badge-info',
  OUTGOING: 'badge-accent',
  MEMO: 'badge-warning',
  REPORT: 'badge-neutral',
};
const priorityLabel = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  URGENT: 'Mendesak',
};
const priorityBadge = {
  LOW: 'badge-neutral',
  MEDIUM: 'badge-info',
  HIGH: 'badge-warning',
  URGENT: 'badge-error',
};

export default function CorrespondencePage() {
  const { user, getAuthHeaders } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'INCOMING',
    letterNumber: '',
    senderName: '',
    recipientName: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    fetchDocs();
  }, [activeTab]);

  async function fetchDocs() {
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.append('category', activeTab);
      const res = await fetch(`/api/documents?${params}`, {
        headers: getAuthHeaders(),
      });
      setDocuments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({
      title: '',
      content: '',
      category: 'INCOMING',
      letterNumber: '',
      senderName: '',
      recipientName: '',
      priority: 'MEDIUM',
    });
    setUploadedFiles([]);
    setShowModal(true);
  }

  function openDetail(doc) {
    setSelectedDoc(doc);
    setShowDetailModal(true);
  }

  async function handleFileUpload(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'correspondence');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          setUploadedFiles((prev) => [
            ...prev,
            {
              fileName: data.fileName,
              fileUrl: data.url,
              fileType: data.fileType,
              fileSize: data.fileSize,
              publicId: data.publicId,
            },
          ]);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeFile(index) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        }),
      });
      setShowModal(false);
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSign(id) {
    try {
      await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed: true }),
      });
      fetchDocs();
      if (selectedDoc?.id === id) {
        const res = await fetch(`/api/documents/${id}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) setSelectedDoc(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDisposition(id, disposition) {
    try {
      await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ disposition }),
      });
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  }

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';
  const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  const canManage = ['ADMIN', 'MANAGER', 'SECRETARY'].includes(user?.role);

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
            Surat Menyurat
          </p>
          <h1 className="text-title">
            Korespondensi
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openCreate}>
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

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Surat', value: documents.length, icon: '📄' },
          {
            label: 'Surat Masuk',
            value: documents.filter((d) => d.category === 'INCOMING').length,
            icon: '📥',
          },
          {
            label: 'Surat Keluar',
            value: documents.filter((d) => d.category === 'OUTGOING').length,
            icon: '📤',
          },
          {
            label: 'Tertandatangani',
            value: documents.filter((d) => d.signedAt).length,
            icon: '✅',
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
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { key: 'ALL', label: 'Semua' },
          ...Object.entries(categoryLabel).map(([k, v]) => ({
            key: k,
            label: v,
          })),
        ].map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab(t.key);
              setLoading(true);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Memuat surat...</p>
          </div>
        ) : !documents.length ? (
          <div className="empty-state">
            <p>Tidak ada surat</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>No. Surat</th>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Prioritas</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="text-mono" style={{ fontSize: '0.7rem' }}>
                    {doc.letterNumber || '—'}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    <div>{doc.title}</div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {doc.senderName && `Dari: ${doc.senderName}`}
                      {doc.recipientName && ` → ${doc.recipientName}`}
                    </div>
                    {doc.attachments?.length > 0 && (
                      <span
                        style={{
                          fontSize: '0.6rem',
                          color: 'var(--color-accent)',
                        }}
                      >
                        📎 {doc.attachments.length} lampiran
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${categoryBadge[doc.category]}`}>
                      {categoryLabel[doc.category]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${priorityBadge[doc.priority]}`}>
                      {priorityLabel[doc.priority]}
                    </span>
                  </td>
                  <td className="text-mono" style={{ fontSize: '0.7rem' }}>
                    {fmtDate(doc.createdAt)}
                  </td>
                  <td>
                    {doc.signedAt ? (
                      <span className="badge badge-success">
                        Ditandatangani
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Belum</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openDetail(doc)}
                      >
                        Detail
                      </button>
                      {canManage && !doc.signedAt && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSign(doc.id)}
                        >
                          Tanda Tangan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Buat Surat Baru"
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label className="input-label">Kategori</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {Object.entries(categoryLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Prioritas</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {Object.entries(priorityLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Nomor Surat</label>
            <input
              type="text"
              className="input"
              placeholder="001/SK/II/2026"
              value={form.letterNumber}
              onChange={(e) =>
                setForm({ ...form, letterNumber: e.target.value })
              }
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Judul</label>
            <input
              type="text"
              className="input"
              placeholder="Perihal surat..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label className="input-label">Pengirim</label>
              <input
                type="text"
                className="input"
                placeholder="Nama pengirim"
                value={form.senderName}
                onChange={(e) =>
                  setForm({ ...form, senderName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="input-label">Penerima</label>
              <input
                type="text"
                className="input"
                placeholder="Nama penerima"
                value={form.recipientName}
                onChange={(e) =>
                  setForm({ ...form, recipientName: e.target.value })
                }
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Isi Surat</label>
            <textarea
              className="input"
              placeholder="Konten surat..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ minHeight: 120 }}
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Lampiran</label>
            <div
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dt = new DataTransfer();
                for (const f of e.dataTransfer.files) dt.items.add(f);
                fileInputRef.current.files = dt.files;
                handleFileUpload({ target: { files: e.dataTransfer.files } });
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {uploading ? (
                <p
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Mengupload...
                </p>
              ) : (
                <div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Klik atau seret file ke sini
                  </p>
                  <p
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Maks. 10MB per file
                  </p>
                </div>
              )}
            </div>
            {uploadedFiles.length > 0 && (
              <div
                style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    <span>
                      📎 {f.fileName}{' '}
                      {f.fileSize ? `(${fmtSize(f.fileSize)})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      style={{
                        color: 'var(--color-error)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Surat"
      >
        {selectedDoc && (
          <div>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              <span className={`badge ${categoryBadge[selectedDoc.category]}`}>
                {categoryLabel[selectedDoc.category]}
              </span>
              <span className={`badge ${priorityBadge[selectedDoc.priority]}`}>
                {priorityLabel[selectedDoc.priority]}
              </span>
              {selectedDoc.signedAt && (
                <span className="badge badge-success">Ditandatangani</span>
              )}
            </div>
            {selectedDoc.letterNumber && (
              <div style={{ marginBottom: '0.75rem' }}>
                <span
                  className="text-mono"
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  NO. SURAT
                </span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {selectedDoc.letterNumber}
                </div>
              </div>
            )}
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              {selectedDoc.title}
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              {selectedDoc.senderName && (
                <div>
                  <span
                    className="text-mono"
                    style={{
                      fontSize: '0.6rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    PENGIRIM
                  </span>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>
                    {selectedDoc.senderName}
                  </div>
                </div>
              )}
              {selectedDoc.recipientName && (
                <div>
                  <span
                    className="text-mono"
                    style={{
                      fontSize: '0.6rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    PENERIMA
                  </span>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>
                    {selectedDoc.recipientName}
                  </div>
                </div>
              )}
            </div>
            {selectedDoc.content && (
              <div
                style={{
                  padding: '1rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedDoc.content}
              </div>
            )}
            {selectedDoc.disposition && (
              <div style={{ marginBottom: '1rem' }}>
                <span
                  className="text-mono"
                  style={{
                    fontSize: '0.6rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  DISPOSISI
                </span>
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--color-accent)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {selectedDoc.disposition}
                </div>
              </div>
            )}
            {selectedDoc.attachments?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <span
                  className="text-mono"
                  style={{
                    fontSize: '0.6rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  LAMPIRAN ({selectedDoc.attachments.length})
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {selectedDoc.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        color: 'var(--color-text)',
                        fontSize: 'var(--font-size-sm)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span>📎 {att.fileName}</span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {fmtSize(att.fileSize)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: 'var(--color-text-muted)',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <span>Dibuat: {fmtDate(selectedDoc.createdAt)}</span>
              <span>Oleh: {selectedDoc.creator?.name}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
