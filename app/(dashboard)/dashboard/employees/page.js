'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Modal from '@/components/Modal';

export default function EmployeesPage() {
  const { user, getAuthHeaders } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    departmentId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [empRes, deptRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments'),
      ]);
      const emps = await empRes.json();
      const depts = await deptRes.json();
      setEmployees(Array.isArray(emps) ? emps : []);
      setDepartments(Array.isArray(depts) ? depts : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingEmployee(null);
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'STAFF',
      departmentId: '',
    });
    setShowModal(true);
  }

  function openEdit(emp) {
    setEditingEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      password: '',
      role: emp.role,
      departmentId: emp.departmentId || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    const body = { ...form };
    if (!body.password) delete body.password;
    if (!body.departmentId) body.departmentId = null;

    try {
      if (editingEmployee) {
        await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/employees', {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return;
    try {
      await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  const roleBadge = (role) => {
    const map = {
      ADMIN: 'badge-accent',
      MANAGER: 'badge-info',
      SECRETARY: 'badge-warning',
      STAFF: 'badge-neutral',
    };
    return map[role] || 'badge-neutral';
  };

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
            Manajemen
          </p>
          <h1 className="text-title">
            Karyawan
            <span style={{ color: 'var(--color-text-muted)' }}>.</span>
          </h1>
        </div>
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
          Tambah Karyawan
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Memuat...</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Departemen</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    {emp.name}
                  </td>
                  <td className="text-mono" style={{ fontSize: '0.75rem' }}>
                    {emp.email}
                  </td>
                  <td>
                    <span className={`badge ${roleBadge(emp.role)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td>{emp.department?.name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDelete(emp.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Nama Lengkap</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">
              Password {editingEmployee && '(kosongkan jika tidak diubah)'}
            </label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              {...(!editingEmployee && { required: true })}
            />
          </div>
          <div className="form-grid-2col">
            <div>
              <label className="input-label">Peran</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STAFF">Staff</option>
                <option value="SECRETARY">Secretary</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="input-label">Departemen</label>
              <select
                className="input"
                value={form.departmentId}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
              >
                <option value="">— Pilih —</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </button>
        </form>
      </Modal>
      <style jsx>{`
        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 480px) {
          .form-grid-2col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
