# 🧪 SimKantor — Panduan Pengetesan Lengkap

> **Base URL:** `http://localhost:3000`
> **Semua password demo:** `password123`

---

## Akun Demo

| Role         | Email                  | Hak Akses                                                                   |
| ------------ | ---------------------- | --------------------------------------------------------------------------- |
| Admin        | `admin@office.sim`     | Full akses CRUD: Karyawan, Keuangan, Laporan, Admin Panel, Registrasi Wajah |
| Manager      | `manager@office.sim`   | Akses: Approve Cuti, Keuangan, Laporan, Korespondensi                       |
| Secretary    | `secretary@office.sim` | Akses: Buat Dokumen (Korespondensi), Keuangan, Laporan                      |
| Staff        | `staff@office.sim`     | Akses Terbatas: Hanya data milik sendiri (Hadir, Cuti)                      |
| Front Office | `fo@office.sim`        | Akses: Halaman Kehadiran & Dashboard                                        |

---

## 1. 🔐 Authentication & Layout

### 1.1 Login Page (`/login`)

- [ ] Buka `/login` → form login tampil dengan split layout
- [ ] Klik tombol demo "Admin" → email & password auto-fill
- [ ] Klik "Masuk" → redirect ke `/dashboard`
- [ ] Coba login gagal (email/password salah) → "Invalid credentials"
- [ ] Ulangi login dengan Manager, Secretary, Staff, FO

### 1.2 Sidebar Menu Berdasarkan Role

- [ ] **Admin**: Tampil semua menu (Dashboard, Kehadiran, Cuti, Karyawan, Registrasi Wajah, Korespondensi, Kearsipan, Pendapatan, Pengeluaran, Hutang, Laporan, Panel Admin)
- [ ] **Staff / Front Office**: Tidak tampil menu Keuangan, Korespondensi, Laporan, Admin, atau Karyawan

---

## 2. 📊 Dashboard Utama (`/dashboard`)

- [ ] Tampil _greeting_ nama user dan role
- [ ] Tampil 4 kartu statistik: Total Karyawan, Hadir, Terlambat, Cuti Pending
- [ ] Menampilkan List Kehadiran Terkini dan Pengajuan Cuti Pending
- [ ] Data difilter sesuai role (Staff hanya melihat miliknya sendiri)

---

## 3. 👥 Karyawan & Biometrik (Admin Only)

### 3.1 Manajemen Karyawan (`/dashboard/employees`)

- [ ] Tampil tabel Karyawan: Nama, Email, Peran, Dept
- [ ] Form Create Karyawan berfungsi (Role tersedia: ADMIN, MANAGER, SECRETARY, STAFF, FRONT_OFFICE)
- [ ] Tambah email duplikat → error "Email already exists"
- [ ] Edit Karyawan & Hapus Karyawan berfungsi

### 3.2 Registrasi Wajah (`/dashboard/face-register`)

- [ ] Pilih karyawan dari dropdown yang belum didaftarkan wajahnya
- [ ] Kamera menyala (FaceScanner)
- [ ] Arahkan wajah ke kamera → Extract descriptor 128-dimensi → submit registrasi "Wajah berhasil didaftarkan"
- [ ] Cek status badge pada dropdown berubah menjadi "✓ Terdaftar"

---

## 4. ✅ Kehadiran (`/dashboard/attendance`)

- [ ] Tabel Kehadiran lengkap (Admin/Manager: semua karyawan, Staff: diri sendiri)
- [ ] API Check-in/Check-out berfungsi mengirim action type
- [ ] Tampil summary cards akurat (Hadir, Terlambat, Total)

---

## 5. 🏖️ Manajemen Cuti (`/dashboard/leave`)

- [ ] Staff & semua user dapat mengajukan cuti (PENDING)
- [ ] Admin & Manager dapat klik Setuju (APPROVED) atau Tolak (REJECTED)
- [ ] Badge status diperbarui secara _real-time_

---

## 6. 📄 Korespondensi & Arsip

- [ ] **Korespondensi (`/dashboard/correspondence`)**: Buat surat baru (INCOMING, OUTGOING, MEMO, REPORT)
- [ ] Tombol Tanda Tangan berfungsi (Admin/Secretary)
- [ ] **Arsip (`/dashboard/archive`)**: Mengarsipkan dokumen, memfilter berdasarkan kategori

---

## 7. 💰 Manajemen Keuangan (Admin, Manager, Secretary)

### 7.1 Pendapatan (`/dashboard/revenue`)

- [ ] Tabel pendapatan beserta kartu summary "Total Pendapatan" & "Pendapatan Bulan Ini"
- [ ] Tambah Pendapatan: Judul, Jumlah, Sumber, Tanggal
- [ ] Edit & Hapus Pendapatan berfungsi

### 7.2 Pengeluaran (`/dashboard/expenses`)

- [ ] Tabel pengeluaran lengkap dengan diagram/pengelompokan berdasarkan Kategori (OPERASIONAL, GAJI, UTILITAS, TRANSPORTASI, dsb.)
- [ ] Form Tambah: Judul, Kategori, Jumlah, Tanggal
- [ ] Edit & Hapus Pengeluaran berfungsi

### 7.3 Hutang Piutang (`/dashboard/debts`)

- [ ] Tabel hutang dengan tracking status (UNPAID, PARTIAL, PAID) dan badge Overdue merah
- [ ] Summary total hutang, total dibayar, dan hutang menunggak (unpaid)
- [ ] Form Tambah Hutang (Nama Debitur, Kreditur, Jumlah, Jatuh Tempo)
- [ ] Tombol Update Bayar untuk mencicil hutang secara parsial (`paidAmount`) -> status bisa berubah ke PARTIAL/PAID otomatis tergantung saldo

---

## 8. 📈 Analitik & Laporan (Admin, Manager, Secretary)

### 8.1 Laporan Berkala (`/dashboard/reports`)

- [ ] Widget _Financial Summary_ tampil otomatis (menghitung Omset, Pengeluaran, Laba/Profit bulan ini, & Tanggungan)
- [ ] Tabel Laporan Kinerja/Khusus list (Form: Tipe Laporan, Periode, Ringkasan)
- [ ] Tambah Laporan baru (Manual)

### 8.2 Panel Admin (`/dashboard/admin`) _— Admin Only_

- [ ] Halaman ringkasan terpusat khusus untuk Top Management
- [ ] Statistik Overview (Total Dept, Karyawan, Dokumen)
- [ ] Statistik Finansial Cepat (Laba/Rugi/Hutang)
- [ ] Tampilan Widget Aktivitas Terkini (Recent Documents, Recent Revenues, Recent Expenses)

---

## 9. 🏢 Front Office (`/frontoffice`)

- [ ] Halaman scanner Biometrik `face-api.js` (Webcam harus menyala)
- [ ] Fitur Check-In Otomatis: Wajah terdeteksi -> API `/api/face/verify` -> Presensi "CHECK_IN" tersimpan
- [ ] Fitur Check-Out Otomatis (Arahkan wajah yang sama di hari yang sama)
- [ ] Gagal verifikasi menampilkan "Wajah tidak dikenal"

---

## 10. 🛡️ API Endpoints Testing (Cheatsheet curl/Tools)

| Method              | Endpoint             | Auth | Role          | Deskripsi                                      |
| ------------------- | -------------------- | ---- | ------------- | ---------------------------------------------- |
| POST                | `/api/auth/login`    | ❌   | All           | Mendapat token JWT (Cookie HTTP-Only & Body)   |
| GET                 | `/api/auth/me`       | ✅   | All           | Mendapat data sesi user saat ini               |
| GET/POST/PUT/DELETE | `/api/employees/:id` | ✅   | Admin         | CRUD Karyawan                                  |
| GET/POST/PUT/DELETE | `/api/revenue/:id`   | ✅   | Admin/Mgr/Sec | Pencatatan Dana Masuk                          |
| GET/POST/PUT/DELETE | `/api/expenses/:id`  | ✅   | Admin/Mgr/Sec | Pencatatan Dana Keluar                         |
| GET/POST/PUT/DELETE | `/api/debts/:id`     | ✅   | Admin/Mgr/Sec | Pengelolaan Hutang/Kredit                      |
| PATCH               | `/api/debts/:id`     | ✅   | Admin/Mgr/Sec | Quick Update Cicilan / Payment Hutang          |
| GET/POST/PUT/DELETE | `/api/reports/:id`   | ✅   | Admin/Mgr/Sec | Dokumentasi Laporan (Harian-Tahunan)           |
| GET                 | `/api/admin`         | ✅   | Admin         | Agregasi dashboard khusus Administrator        |
| POST                | `/api/upload`        | ✅   | All           | Multiform File Upload ke Cloudinary (max 10MB) |
| POST                | `/api/face/register` | ✅   | Admin         | Register Face Descriptor 128-dimensi           |
| POST                | `/api/face/verify`   | ❌   | FO            | Verifikasi dan auto-presensi Kehadiran         |

---

## 11. ⚠️ Edge Cases & Security (WAJIB DITEST)

- [ ] Akses API Admin/Revenue dengan header Authorization `Bearer <token-staff>` → WAJIB **403 Forbidden**
- [ ] Akses routing frontend seperti `/dashboard/admin` atau `/dashboard/face-register` dengan akun Staff → Tampil komponen UI **Akses Ditolak**
- [ ] API Upload `/api/upload` tanpa token → **401 Unauthorized**
- [ ] API Upload dengan file di atas 10MB → **400 File too large**
- [ ] Scan `/frontoffice` tanpa data biometrik yang sesuai → Ditolak sistem (akurasi `euclidean distance`)

---

---

# 🤖 PROMPT AI TESTING — Copy & Paste ke AI (Kombai/dll)

> Copy seluruh prompt di bawah ini lalu tempel ke AI Testing tool / QA bot.

\`\`\`markdown
Kamu adalah QA tester yang akan melakukan E2E testing dan API testing pada aplikasi "SimKantor" versi terbaru.

APP URL: http://localhost:3000

## PEMBARUAN VERSI BARU

Selain modul utama (Auth, Kehadiran, Cuti, Karyawan, Dokumen), aplikasi sekarang dilengkapi 6 MODUL BARU yang membutuhkan validasi ketat:

1. PENDAPATAN (/api/revenue & /dashboard/revenue)
2. PENGELUARAN (/api/expenses & /dashboard/expenses)
3. HUTANG (/api/debts & /dashboard/debts) - termasuk sistem pembayaran parsial (PATCH)
4. LAPORAN & KALKULASI (/api/reports & /dashboard/reports)
5. PANEL ADMIN (/api/admin & /dashboard/admin)
6. REGISTRASI WAJAH (/api/face/register & /dashboard/face-register)
7. CLOUDINARY FILE UPLOAD (/api/upload)

## RULES VALIDASI:

- Role 'Admin' punya full akses ke SEMUA modul. (Email: admin@office.sim / Pass: password123)
- Role 'Manager' dan 'Secretary' bisa mengelola Keuangan & Laporan, tetapi TIDAK BISA mengakses Panel Admin dan Manajemen Karyawan/Registrasi Wajah.
- Role 'Staff' dan 'Front Office' TERLARANG mengakses Keuangan, Laporan, Admin, dan Karyawan, baik di sisi UI Frontend (Akses Ditolak) maupun di API Backend (403 Forbidden).

## TESTING WORKFLOW (Harap eksekusi):

1. **Financial CRUD Flow:**
   - Login admin, buat 1 Pendapatan (Rp100.000), 1 Pengeluaran Operasional (Rp50.000), 1 Hutang (Rp200.000).
   - Pastikan API endpoint membalikkan HTTP 201 Created.
   - Panggil GET /api/reports dan pastikan `financialSummary.profit` adalah Rp50.000 (100k - 50k), dan `financialSummary.outstandingDebt` adalah Rp200.000.
2. **Debt Payment Flow:**
   - Panggil PATCH /api/debts/<id> dengan `paidAmount: 50.000` dan `status: PARTIAL`.
   - Konfirmasi HTTP 200, GET ulang pastikan outstanding debt berkurang dari 200rb menjadi 150rb.
3. **Admin Exclusivity Flow:**
   - Login menggunakan staff@office.sim / password123
   - Lakukan GET /api/admin -> Jika 403 Forbidden = PASS.
   - Lakukan POST /api/revenue -> Jika 403 Forbidden = PASS.
4. **Biometric Edge Case Flow:**
   - Login Admin, coba POST /api/face/register tanpa ID Karyawan -> Jika 400 = PASS.
   - Modul "/frontoffice" hanya butuh izin kamera.

Jalankan test tersebut dan berikan tabel "TEST REPORT SUMMARY" berupa Total Test, Passed, Failed berdasarkan observasimu secara programatis.
\`\`\`
