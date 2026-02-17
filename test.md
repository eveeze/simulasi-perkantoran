# 🧪 SimKantor — Panduan Pengetesan Lengkap

> **Base URL:** `http://localhost:3000`
> **Semua password demo:** `password123`

---

## Akun Demo

| Role      | Email                  | Hak Akses                                     |
| --------- | ---------------------- | --------------------------------------------- |
| Admin     | `admin@office.sim`     | Full CRUD employees, approve cuti, semua data |
| Manager   | `manager@office.sim`   | Approve/reject cuti, lihat semua data         |
| Secretary | `secretary@office.sim` | Buat dokumen, lihat semua data                |
| Staff     | `staff@office.sim`     | Hanya data milik sendiri                      |
| Staff 2   | `staff2@office.sim`    | Hanya data milik sendiri                      |

---

## 1. 🔐 Authentication

### 1.1 Login Page (`/login`)

- [ ] Buka `/login` → halaman login tampil dengan split layout
- [ ] Klik tombol demo "Admin" → email & password auto-fill
- [ ] Klik "Masuk" → redirect ke `/dashboard`
- [ ] Coba login dengan email/password salah → muncul error merah
- [ ] Coba submit form kosong → validasi HTML mencegah submit
- [ ] Ulangi untuk setiap role (Manager, Secretary, Staff)

### 1.2 Logout

- [ ] Setelah login, klik Logout di sidebar → kembali ke `/login`
- [ ] Setelah logout, akses `/dashboard` → redirect ke `/login`

### 1.3 Session / Auth Guard

- [ ] Akses `/dashboard` tanpa login → redirect ke `/login`
- [ ] Login → refresh halaman → tetap login (cookie persists)

---

## 2. 📊 Dashboard Utama (`/dashboard`)

- [ ] Setelah login, dashboard tampil dengan data summary
- [ ] Tampil statistik: total karyawan, kehadiran hari ini, cuti pending, total dokumen
- [ ] Tampil tabel kehadiran terbaru
- [ ] Tampil tabel pengajuan cuti terbaru
- [ ] Data sesuai dengan role (Staff hanya lihat data sendiri)

---

## 3. 👥 Manajemen Karyawan (`/dashboard/employees`)

### 3.1 Daftar Karyawan

- [ ] Login sebagai **Admin** → navigasi ke halaman Karyawan
- [ ] Tabel karyawan tampil dengan kolom: Nama, Email, Role, Department
- [ ] Badge role tampil berwarna berbeda (Admin, Manager, Secretary, Staff)

### 3.2 Tambah Karyawan (Admin Only)

- [ ] Klik tombol "Tambah" → modal form muncul
- [ ] Isi form: nama, email, password, role, department
- [ ] Submit → karyawan baru muncul di tabel
- [ ] Coba tambah dengan email duplikat → error "Email already exists"

### 3.3 Edit Karyawan (Admin Only)

- [ ] Klik tombol edit pada karyawan → modal form dengan data terisi
- [ ] Ubah nama/role/department → submit → data terupdate di tabel

### 3.4 Hapus Karyawan (Admin Only)

- [ ] Klik tombol hapus → konfirmasi → karyawan hilang dari tabel

### 3.5 Akses Control

- [ ] Login sebagai **Staff** → halaman karyawan tidak punya tombol Tambah/Edit/Hapus
- [ ] Login sebagai **Manager** → tidak bisa tambah/edit/hapus karyawan

---

## 4. ✅ Kehadiran / Attendance (`/dashboard/attendance`)

### 4.1 Daftar Kehadiran

- [ ] Halaman menampilkan tabel riwayat kehadiran
- [ ] Kolom: (Karyawan jika Admin/Manager), Tanggal, Check In, Check Out, Status
- [ ] Summary cards: Total Record, Hadir, Terlambat
- [ ] Login sebagai **Staff** → hanya lihat data kehadiran sendiri (kolom Karyawan hidden)
- [ ] Login sebagai **Admin/Manager** → lihat semua karyawan

### 4.2 Check-in/Check-out (via Front Office)

- [ ] Lihat bagian **Front Office** di bawah

---

## 5. 🏖️ Manajemen Cuti (`/dashboard/leave`)

### 5.1 Daftar Cuti

- [ ] Tabel cuti tampil: Karyawan, Periode, Alasan, Status
- [ ] Badge status berwarna: Menunggu (kuning), Disetujui (hijau), Ditolak (merah)

### 5.2 Ajukan Cuti (Semua Role)

- [ ] Klik "Ajukan Cuti" → modal form muncul
- [ ] Isi: Tanggal Mulai, Tanggal Selesai, Alasan
- [ ] Submit → cuti baru muncul di tabel dengan status "Menunggu"

### 5.3 Approve/Reject Cuti (Admin & Manager Only)

- [ ] Login sebagai **Admin** atau **Manager**
- [ ] Pada cuti status "Menunggu", tampil tombol "Setuju" dan "Tolak"
- [ ] Klik "Setuju" → status berubah ke "Disetujui"
- [ ] Klik "Tolak" pada cuti lain → status berubah ke "Ditolak"

### 5.4 Akses Control

- [ ] Login sebagai **Staff** → tidak ada tombol Setuju/Tolak
- [ ] Staff hanya bisa lihat cuti milik sendiri

---

## 6. 📄 Surat Menyurat / Correspondence (`/dashboard/correspondence`)

### 6.1 Daftar Dokumen

- [ ] Tabel dokumen tampil: Judul, Kategori, Pembuat, Tanggal
- [ ] Filter berdasarkan kategori (INCOMING, OUTGOING, MEMO, REPORT)
- [ ] Badge kategori berwarna berbeda

### 6.2 Buat Dokumen Baru

- [ ] Klik tombol tambah → modal form muncul
- [ ] Isi: Judul, Konten, Kategori
- [ ] Submit → dokumen baru muncul di tabel

### 6.3 Tanda Tangani Dokumen

- [ ] Klik tombol "Tanda Tangani" pada dokumen → dokumen ditandai sudah ditandatangani

---

## 7. 🗂️ Arsip Dokumen (`/dashboard/archive`)

### 7.1 Daftar Arsip

- [ ] Tabel arsip tampil mirip dengan surat menyurat
- [ ] Filter berdasarkan kategori

### 7.2 Tambah Arsip

- [ ] Klik tombol tambah → modal form → submit → arsip baru muncul

### 7.3 Hapus Arsip

- [ ] Klik tombol hapus → dokumen hilang dari tabel

---

## 8. 🏢 Front Office (`/frontoffice`)

### 8.1 Halaman Front Office

- [ ] Buka `/frontoffice` → tampil halaman face recognition
- [ ] Kamera menyala (minta izin browser)
- [ ] FaceScanner component ter-load

### 8.2 Face Check-in

- [ ] Scan wajah yang sudah terdaftar → muncul nama karyawan + "Check-in berhasil"
- [ ] Status attendance tercatat di database

### 8.3 Face Check-out

- [ ] Scan wajah lagi (hari yang sama) → "Check-out berhasil"

### 8.4 Face Not Recognized

- [ ] Scan wajah yang belum didaftarkan → "Wajah tidak dikenali"

> **Note:** Fitur face recognition membutuhkan webcam dan face.api.js models

---

## 9. 🧭 Navigation & Sidebar

- [ ] Sidebar menampilkan menu sesuai navigasi
- [ ] Klik setiap menu → navigasi ke halaman yang benar
- [ ] Highlight aktif pada menu yang sedang dikunjungi
- [ ] Responsive pada mobile (jika ada)

---

## 10. 🌐 Landing Page (`/`)

- [ ] Buka `/` → tampil halaman utama
- [ ] Ada link/tombol ke Login dan Front Office

---

## 11. 🛡️ API Endpoint Testing (Manual via curl/Postman)

### 11.1 Auth

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@office.sim","password":"password123"}'
# → Expect: { token, employee }

# Get Profile (pakai token dari login)
curl http://localhost:3000/api/auth/me \
  -H "Cookie: token=<TOKEN>"
# → Expect: employee data

# Logout
curl -X POST http://localhost:3000/api/auth/logout
# → Expect: { message: "Logged out" }
```

### 11.2 Employees

```bash
# List semua karyawan
curl http://localhost:3000/api/employees

# Detail karyawan
curl http://localhost:3000/api/employees/<ID>

# Tambah karyawan (Admin)
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<ADMIN_TOKEN>" \
  -d '{"name":"Test User","email":"test@office.sim","password":"test123","role":"STAFF"}'

# Update karyawan (Admin)
curl -X PUT http://localhost:3000/api/employees/<ID> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<ADMIN_TOKEN>" \
  -d '{"name":"Updated Name"}'

# Hapus karyawan (Admin)
curl -X DELETE http://localhost:3000/api/employees/<ID> \
  -H "Cookie: token=<ADMIN_TOKEN>"
```

### 11.3 Attendance

```bash
# List kehadiran
curl http://localhost:3000/api/attendance \
  -H "Cookie: token=<TOKEN>"

# Check-in/Check-out (via face verify → lalu hit check)
curl -X POST http://localhost:3000/api/attendance/check \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"<EMPLOYEE_ID>"}'
```

### 11.4 Leave

```bash
# List cuti
curl http://localhost:3000/api/leave \
  -H "Cookie: token=<TOKEN>"

# Ajukan cuti
curl -X POST http://localhost:3000/api/leave \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<TOKEN>" \
  -d '{"startDate":"2026-03-01","endDate":"2026-03-03","reason":"Liburan"}'

# Approve/reject cuti (Admin/Manager)
curl -X PATCH http://localhost:3000/api/leave/<ID> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<ADMIN_TOKEN>" \
  -d '{"status":"APPROVED"}'
```

### 11.5 Documents

```bash
# List dokumen
curl http://localhost:3000/api/documents

# Buat dokumen
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<TOKEN>" \
  -d '{"title":"Test Doc","content":"Test content","category":"MEMO"}'

# Update dokumen (tanda tangan)
curl -X PUT http://localhost:3000/api/documents/<ID> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<TOKEN>" \
  -d '{"signed":true}'

# Hapus dokumen
curl -X DELETE http://localhost:3000/api/documents/<ID> \
  -H "Cookie: token=<TOKEN>"
```

### 11.6 Departments

```bash
# List departments
curl http://localhost:3000/api/departments
```

### 11.7 Face Recognition

```bash
# Register face (128-dimensional float array)
curl -X POST http://localhost:3000/api/face/register \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"<ID>","descriptor":[0.1,0.2,...128 values]}'

# Verify face
curl -X POST http://localhost:3000/api/face/verify \
  -H "Content-Type: application/json" \
  -d '{"descriptor":[0.1,0.2,...128 values]}'
```

---

## 12. ⚠️ Edge Cases & Error Handling

- [ ] Login dengan email tidak terdaftar → "Invalid credentials"
- [ ] Login dengan password salah → "Invalid credentials"
- [ ] Akses API tanpa token → 401 Unauthorized
- [ ] Staff akses employee CRUD API → 403 Forbidden
- [ ] Update/delete ID yang tidak ada → 404 Not Found
- [ ] Tambah employee email duplikat → 409 Conflict
- [ ] Face descriptor bukan 128 dimensi → 400 Bad Request
- [ ] Check-in dua kali dalam sehari → response "COMPLETED"
- [ ] Leave PATCH dengan status selain APPROVED/REJECTED → 400

---

---

# 🤖 PROMPT AI TESTING — Copy & Paste ke AI (Kombai/dll)

> Copy seluruh prompt di bawah ini dan paste ke AI testing tool.

---

```
Kamu adalah QA tester untuk aplikasi web "SimKantor" — Digital Office Simulation platform.

## Informasi Aplikasi
- URL: http://localhost:3000
- Tech: Next.js 16, Prisma 7, Neon PostgreSQL, Face API
- Auth: JWT via httpOnly cookie

## Akun Demo (password semua: password123)
- Admin: admin@office.sim (full access, CRUD karyawan, approve cuti)
- Manager: manager@office.sim (approve/reject cuti, lihat semua data)
- Secretary: secretary@office.sim (buat dokumen, lihat semua data)
- Staff: staff@office.sim (hanya data sendiri, tidak bisa CRUD karyawan)

## Halaman yang Harus Ditest

### 1. Landing Page (/)
- Pastikan halaman utama tampil tanpa error
- Ada navigasi ke Login dan Front Office

### 2. Login Page (/login)
- Test login dengan setiap akun demo (Admin, Manager, Secretary, Staff)
- Test login gagal (email salah, password salah, form kosong)
- Pastikan setelah login redirect ke /dashboard
- Test tombol demo account auto-fill email & password
- Test logout → kembali ke /login
- Test auth guard: akses /dashboard tanpa login → redirect /login

### 3. Dashboard (/dashboard)
- Login sebagai Admin → pastikan menampilkan:
  - Statistik summary (total karyawan, kehadiran hari ini, cuti pending, dokumen)
  - Tabel kehadiran terbaru
  - Tabel cuti terbaru
- Login sebagai Staff → pastikan hanya data milik sendiri

### 4. Karyawan (/dashboard/employees)
- Login Admin:
  - Tabel karyawan tampil semua data
  - Test Create: tambah karyawan baru → muncul di tabel
  - Test Create duplicate email → error
  - Test Edit: ubah nama/role → data terupdate
  - Test Delete: hapus karyawan → hilang dari tabel
- Login Staff/Manager:
  - Tombol Create/Edit/Delete TIDAK boleh muncul
  - API POST/PUT/DELETE harus return 403

### 5. Kehadiran (/dashboard/attendance)
- Login Admin/Manager → lihat semua data kehadiran
- Login Staff → hanya data sendiri, kolom "Karyawan" hidden
- Summary cards: Total Record, Hadir, Terlambat harus akurat

### 6. Cuti (/dashboard/leave)
- Test ajukan cuti (semua role bisa):
  - Klik "Ajukan Cuti" → isi form → submit → muncul status "Menunggu"
- Test approve/reject (Admin & Manager only):
  - Tombol "Setuju"/"Tolak" muncul pada cuti PENDING
  - Klik Setuju → status jadi "Disetujui"
  - Klik Tolak → status jadi "Ditolak"
- Login Staff → TIDAK ada tombol Setuju/Tolak
- Staff hanya lihat cuti miliknya sendiri

### 7. Surat Menyurat (/dashboard/correspondence)
- Tabel dokumen tampil dengan kategori badge berwarna
- Test filter by kategori (INCOMING, OUTGOING, MEMO, REPORT)
- Test buat dokumen baru
- Test tanda tangan dokumen

### 8. Arsip (/dashboard/archive)
- Tampil daftar arsip dokumen
- Test tambah arsip baru
- Test hapus arsip

### 9. Front Office (/frontoffice)
- Halaman tampil dengan face scanner
- Kamera menyala (perlu izin browser)
- Scan wajah terdaftar → check-in, scan lagi → check-out
- Scan wajah tidak dikenal → "Wajah tidak dikenali"

### 10. Sidebar/Navigation
- Semua menu navigasi berfungsi
- Menu aktif di-highlight
- Logout berfungsi dari sidebar

## API Endpoints yang Harus Ditest
Test setiap endpoint dengan browser dev tools Network tab atau curl:

| Method | Endpoint | Auth? | Role | Deskripsi |
|--------|----------|-------|------|-----------|
| POST | /api/auth/login | ❌ | All | Login → return token + employee |
| POST | /api/auth/logout | ❌ | All | Logout → clear cookie |
| GET | /api/auth/me | ✅ | All | Get profil employee |
| GET | /api/employees | ❌ | All | List semua karyawan |
| GET | /api/employees/:id | ❌ | All | Detail karyawan |
| POST | /api/employees | ✅ | Admin | Tambah karyawan |
| PUT | /api/employees/:id | ✅ | Admin | Update karyawan |
| DELETE | /api/employees/:id | ✅ | Admin | Hapus karyawan |
| GET | /api/attendance | ✅ | All | List kehadiran (staff=own) |
| POST | /api/attendance/check | ❌ | — | Check-in/check-out by employee ID |
| GET | /api/leave | ✅ | All | List cuti (staff=own) |
| POST | /api/leave | ✅ | All | Ajukan cuti |
| PATCH | /api/leave/:id | ✅ | Admin/Manager | Approve/reject cuti |
| GET | /api/documents | ❌ | All | List dokumen |
| POST | /api/documents | ✅ | All | Buat dokumen |
| GET | /api/documents/:id | ❌ | All | Detail dokumen |
| PUT | /api/documents/:id | ✅ | All | Update/tanda tangan |
| DELETE | /api/documents/:id | ✅ | All | Hapus dokumen |
| GET | /api/departments | ❌ | All | List departemen |
| POST | /api/face/register | ❌ | — | Daftar wajah (128-dim array) |
| POST | /api/face/verify | ❌ | — | Verifikasi wajah |

## Error Cases yang WAJIB Ditest
1. Login email/password salah → 401 "Invalid credentials"
2. Akses protected API tanpa token → 401 "Unauthorized"
3. Staff hit POST/PUT/DELETE /api/employees → 403 "Unauthorized"
4. Staff hit PATCH /api/leave/:id → 403 "Unauthorized"
5. GET/PUT/DELETE resource yang tidak ada → 404 "Not found"
6. POST employee email yang sudah ada → 409 "Email already exists"
7. PATCH leave status bukan APPROVED/REJECTED → 400
8. Face descriptor bukan array 128 elemen → 400
9. Check-in 2x sehari → response action "COMPLETED"
10. Form validation: submit tanpa required fields

## Checklist Output
Untuk setiap test, report hasilnya dalam format:
- ✅ PASS: [nama test] — berjalan sesuai ekspektasi
- ❌ FAIL: [nama test] — [detail masalah yang ditemukan]
- ⚠️ SKIP: [nama test] — [alasan skip, misalnya butuh webcam]

Laporkan summary di akhir:
- Total tests: X
- Passed: X
- Failed: X
- Skipped: X
```

---

> **Catatan:** Untuk test face recognition secara programmatic, kamu perlu face-api.js models yang berjalan di browser. Test via `/frontoffice` lebih praktis daripada curl.
