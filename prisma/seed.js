const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.documentAttachment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.document.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Umum & Administrasi' } }),
    prisma.department.create({ data: { name: 'Keuangan & Akuntansi' } }),
    prisma.department.create({ data: { name: 'SDM & Personalia' } }),
    prisma.department.create({ data: { name: 'IT & Teknologi' } }),
    prisma.department.create({ data: { name: 'Pemasaran' } }),
  ]);

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Admin Utama',
        email: 'admin@simkantor.id',
        password: hashedPassword,
        role: 'ADMIN',
        departmentId: departments[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Budi Santoso',
        email: 'manager@simkantor.id',
        password: hashedPassword,
        role: 'MANAGER',
        departmentId: departments[1].id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Siti Rahayu',
        email: 'secretary@simkantor.id',
        password: hashedPassword,
        role: 'SECRETARY',
        departmentId: departments[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Ahmad Fauzi',
        email: 'staff@simkantor.id',
        password: hashedPassword,
        role: 'STAFF',
        departmentId: departments[2].id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Dewi Lestari',
        email: 'frontoffice@simkantor.id',
        password: hashedPassword,
        role: 'FRONT_OFFICE',
        departmentId: departments[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Rudi Hartono',
        email: 'rudi@simkantor.id',
        password: hashedPassword,
        role: 'STAFF',
        departmentId: departments[3].id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Maya Putri',
        email: 'maya@simkantor.id',
        password: hashedPassword,
        role: 'STAFF',
        departmentId: departments[4].id,
      },
    }),
  ]);

  // Set department managers
  await prisma.department.update({
    where: { id: departments[0].id },
    data: { managerId: employees[0].id },
  });
  await prisma.department.update({
    where: { id: departments[1].id },
    data: { managerId: employees[1].id },
  });

  // Attendance data (last 7 days)
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const emp of employees.slice(0, 5)) {
      const checkIn = new Date(date);
      checkIn.setHours(
        7 + Math.floor(Math.random() * 2),
        Math.floor(Math.random() * 60),
      );
      const checkOut = new Date(date);
      checkOut.setHours(
        16 + Math.floor(Math.random() * 2),
        Math.floor(Math.random() * 60),
      );
      const status = checkIn.getHours() > 8 ? 'LATE' : 'PRESENT';

      await prisma.attendance.create({
        data: { employeeId: emp.id, date, checkIn, checkOut, status },
      });
    }
  }

  // Leave requests
  await prisma.leaveRequest.create({
    data: {
      employeeId: employees[3].id,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-03'),
      reason: 'Urusan keluarga',
      status: 'PENDING',
    },
  });
  await prisma.leaveRequest.create({
    data: {
      employeeId: employees[5].id,
      startDate: new Date('2026-02-25'),
      endDate: new Date('2026-02-26'),
      reason: 'Acara pernikahan',
      status: 'APPROVED',
      approverId: employees[1].id,
    },
  });
  await prisma.leaveRequest.create({
    data: {
      employeeId: employees[6].id,
      startDate: new Date('2026-02-28'),
      endDate: new Date('2026-02-28'),
      reason: 'Sakit',
      status: 'PENDING',
    },
  });

  // Documents with enhanced fields
  await prisma.document.createMany({
    data: [
      {
        creatorId: employees[2].id,
        title: 'Undangan Rapat Koordinasi',
        content:
          'Dengan hormat, mengundang Bapak/Ibu untuk menghadiri rapat koordinasi.',
        category: 'INCOMING',
        letterNumber: '001/SK/II/2026',
        senderName: 'Dinas Pendidikan',
        recipientName: 'Kepala Kantor',
        priority: 'HIGH',
      },
      {
        creatorId: employees[2].id,
        title: 'Surat Penawaran Kerjasama',
        content: 'Kami bermaksud menawarkan kerjasama dalam bidang teknologi.',
        category: 'INCOMING',
        letterNumber: '002/SK/II/2026',
        senderName: 'PT Teknologi Maju',
        recipientName: 'Manajer Umum',
        priority: 'MEDIUM',
      },
      {
        creatorId: employees[0].id,
        title: 'Surat Permohonan Izin Kegiatan',
        content: 'Memohon izin untuk menyelenggarakan kegiatan team building.',
        category: 'OUTGOING',
        letterNumber: '001/SM/II/2026',
        senderName: 'SimKantor',
        recipientName: 'Dinas Terkait',
        priority: 'LOW',
      },
      {
        creatorId: employees[1].id,
        title: 'Memo Internal: Kebijakan WFH',
        content:
          'Mulai bulan depan, kebijakan WFH akan diberlakukan 2 hari per minggu.',
        category: 'MEMO',
        priority: 'HIGH',
        signedAt: new Date(),
      },
      {
        creatorId: employees[2].id,
        title: 'Laporan Kegiatan Triwulan I',
        content: 'Berikut laporan kegiatan triwulan pertama tahun 2026.',
        category: 'REPORT',
        letterNumber: 'LAP/001/II/2026',
        priority: 'MEDIUM',
      },
    ],
  });

  // Revenue data
  await prisma.revenue.createMany({
    data: [
      {
        title: 'Kontrak Proyek Website Pemda',
        amount: 75000000,
        source: 'Proyek Pemerintah',
        date: new Date('2026-02-01'),
        description: 'Pembayaran termin 1 proyek redesign website Pemda',
        createdById: employees[1].id,
      },
      {
        title: 'Jasa Konsultasi IT',
        amount: 15000000,
        source: 'Klien Swasta',
        date: new Date('2026-02-05'),
        description: 'Konsultasi infrastruktur jaringan PT ABC',
        createdById: employees[1].id,
      },
      {
        title: 'Pelatihan Karyawan Eksternal',
        amount: 8500000,
        source: 'Training',
        date: new Date('2026-02-10'),
        description: 'Pelatihan Microsoft Office untuk 20 peserta',
        createdById: employees[2].id,
      },
      {
        title: 'Maintenance Bulanan Server',
        amount: 5000000,
        source: 'Layanan Berkala',
        date: new Date('2026-02-15'),
        description: 'Biaya maintenance server klien bulanan',
        createdById: employees[1].id,
      },
      {
        title: 'Penjualan Lisensi Software',
        amount: 25000000,
        source: 'Produk',
        date: new Date('2026-01-20'),
        description: 'Lisensi software manajemen untuk 3 cabang',
        createdById: employees[1].id,
      },
    ],
  });

  // Expense data
  await prisma.expense.createMany({
    data: [
      {
        title: 'Gaji Karyawan Februari',
        amount: 45000000,
        category: 'GAJI',
        date: new Date('2026-02-01'),
        description: 'Pembayaran gaji seluruh karyawan',
        createdById: employees[0].id,
      },
      {
        title: 'Listrik & Internet',
        amount: 3500000,
        category: 'UTILITAS',
        date: new Date('2026-02-03'),
        description: 'Tagihan PLN dan internet kantor',
        createdById: employees[2].id,
      },
      {
        title: 'Pembelian ATK',
        amount: 1200000,
        category: 'PERLENGKAPAN',
        date: new Date('2026-02-07'),
        description: 'Kertas, tinta printer, alat tulis',
        createdById: employees[2].id,
      },
      {
        title: 'Transport Rapat Klien',
        amount: 850000,
        category: 'TRANSPORTASI',
        date: new Date('2026-02-12'),
        description: 'Biaya transport meeting dengan klien di luar kota',
        createdById: employees[3].id,
      },
      {
        title: 'Service AC Kantor',
        amount: 2000000,
        category: 'PEMELIHARAAN',
        date: new Date('2026-02-08'),
        description: 'Maintenance AC rutin kuartal I',
        createdById: employees[2].id,
      },
      {
        title: 'Langganan Cloud Server',
        amount: 4500000,
        category: 'OPERASIONAL',
        date: new Date('2026-02-01'),
        description: 'Biaya AWS & Cloudflare bulanan',
        createdById: employees[5].id,
      },
    ],
  });

  // Debt data
  await prisma.debt.createMany({
    data: [
      {
        debtorName: 'SimKantor',
        creditorName: 'Bank Mandiri',
        amount: 50000000,
        paidAmount: 15000000,
        dueDate: new Date('2026-06-01'),
        status: 'PARTIAL',
        description: 'Pinjaman modal kerja',
        createdById: employees[0].id,
      },
      {
        debtorName: 'PT Mitra Jaya',
        creditorName: 'SimKantor',
        amount: 20000000,
        paidAmount: 0,
        dueDate: new Date('2026-03-15'),
        status: 'UNPAID',
        description: 'Hutang proyek dari klien',
        createdById: employees[1].id,
      },
      {
        debtorName: 'SimKantor',
        creditorName: 'Supplier Komputer',
        amount: 12000000,
        paidAmount: 12000000,
        dueDate: new Date('2026-01-30'),
        status: 'PAID',
        description: 'Pembelian 3 unit laptop',
        createdById: employees[0].id,
      },
      {
        debtorName: 'CV Maju Bersama',
        creditorName: 'SimKantor',
        amount: 8000000,
        paidAmount: 0,
        dueDate: new Date('2026-02-10'),
        status: 'UNPAID',
        description: 'Piutang jasa konsultasi - sudah jatuh tempo',
        createdById: employees[1].id,
      },
    ],
  });

  // Report data
  await prisma.report.createMany({
    data: [
      {
        title: 'Laporan Keuangan Januari 2026',
        type: 'MONTHLY',
        period: 'Januari 2026',
        summary:
          'Total pendapatan Rp 128.5 juta dengan pengeluaran Rp 97 juta. Laba bersih Rp 31.5 juta.',
        content:
          'Pendapatan dari proyek pemerintah dan swasta menunjukkan peningkatan 15% dibanding bulan sebelumnya. Pengeluaran operasional tetap stabil.',
        createdById: employees[1].id,
      },
      {
        title: 'Laporan Kehadiran Mingguan',
        type: 'WEEKLY',
        period: 'Minggu ke-3 Feb 2026',
        summary:
          'Rata-rata kehadiran 92%. Keterlambatan menurun 5% dari minggu sebelumnya.',
        createdById: employees[2].id,
      },
      {
        title: 'Evaluasi Kinerja Triwulan I',
        type: 'CUSTOM',
        period: 'Q1 2026',
        summary: 'Evaluasi menyeluruh kinerja kantor triwulan pertama 2026.',
        content:
          'Berdasarkan evaluasi, produktivitas kantor meningkat 20%. Target pendapatan tercapai 95%.',
        createdById: employees[0].id,
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Accounts:');
  console.log('┌──────────────────────────────────────────┐');
  console.log('│ Admin:        admin@simkantor.id          │');
  console.log('│ Manager:      manager@simkantor.id        │');
  console.log('│ Secretary:    secretary@simkantor.id       │');
  console.log('│ Staff:        staff@simkantor.id           │');
  console.log('│ Front Office: frontoffice@simkantor.id    │');
  console.log('│ Password:     password123                  │');
  console.log('└──────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
