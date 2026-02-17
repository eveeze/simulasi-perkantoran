import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: { name: 'Human Resources' },
    }),
    prisma.department.upsert({
      where: { name: 'Information Technology' },
      update: {},
      create: { name: 'Information Technology' },
    }),
    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: { name: 'Finance' },
    }),
    prisma.department.upsert({
      where: { name: 'Operations' },
      update: {},
      create: { name: 'Operations' },
    }),
  ]);

  console.log(`✅ Created ${departments.length} departments`);

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create employees with different roles
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { email: 'admin@office.sim' },
      update: {},
      create: {
        name: 'Andi Prasetyo',
        email: 'admin@office.sim',
        password: hashedPassword,
        role: 'ADMIN',
        departmentId: departments[1].id,
      },
    }),
    prisma.employee.upsert({
      where: { email: 'manager@office.sim' },
      update: {},
      create: {
        name: 'Budi Santoso',
        email: 'manager@office.sim',
        password: hashedPassword,
        role: 'MANAGER',
        departmentId: departments[0].id,
      },
    }),
    prisma.employee.upsert({
      where: { email: 'secretary@office.sim' },
      update: {},
      create: {
        name: 'Citra Dewi',
        email: 'secretary@office.sim',
        password: hashedPassword,
        role: 'SECRETARY',
        departmentId: departments[0].id,
      },
    }),
    prisma.employee.upsert({
      where: { email: 'staff@office.sim' },
      update: {},
      create: {
        name: 'Dian Permana',
        email: 'staff@office.sim',
        password: hashedPassword,
        role: 'STAFF',
        departmentId: departments[2].id,
      },
    }),
    prisma.employee.upsert({
      where: { email: 'staff2@office.sim' },
      update: {},
      create: {
        name: 'Eka Fitriani',
        email: 'staff2@office.sim',
        password: hashedPassword,
        role: 'STAFF',
        departmentId: departments[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${employees.length} employees`);

  // Update department managers
  await prisma.department.update({
    where: { id: departments[0].id },
    data: { managerId: employees[1].id },
  });

  await prisma.department.update({
    where: { id: departments[1].id },
    data: { managerId: employees[0].id },
  });

  console.log('✅ Assigned department managers');

  // Create some sample attendance records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  for (const emp of employees.slice(2)) {
    for (const date of [twoDaysAgo, yesterday]) {
      const checkIn = new Date(date);
      checkIn.setHours(8, Math.floor(Math.random() * 30), 0);
      const checkOut = new Date(date);
      checkOut.setHours(17, Math.floor(Math.random() * 30), 0);

      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: emp.id,
            date: date,
          },
        },
        update: {},
        create: {
          employeeId: emp.id,
          date: date,
          checkIn: checkIn,
          checkOut: checkOut,
          status: checkIn.getHours() > 8 ? 'LATE' : 'PRESENT',
        },
      });
    }
  }

  console.log('✅ Created sample attendance records');

  // Create sample leave requests
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

  await prisma.leaveRequest.create({
    data: {
      employeeId: employees[3].id,
      startDate: nextWeek,
      endDate: nextWeekEnd,
      reason: 'Acara keluarga - pernikahan saudara',
      status: 'PENDING',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: employees[4].id,
      startDate: yesterday,
      endDate: today,
      reason: 'Sakit - demam tinggi',
      status: 'APPROVED',
      approverId: employees[1].id,
    },
  });

  console.log('✅ Created sample leave requests');

  // Create sample documents
  await prisma.document.createMany({
    data: [
      {
        creatorId: employees[2].id,
        title: 'Surat Undangan Rapat Koordinasi Q1 2026',
        category: 'OUTGOING',
        content:
          'Dengan hormat, mengundang seluruh kepala departemen untuk menghadiri rapat koordinasi triwulan pertama tahun 2026.',
      },
      {
        creatorId: employees[2].id,
        title: 'Memo Internal: Pembaruan Kebijakan WFH',
        category: 'MEMO',
        content:
          'Diberitahukan bahwa kebijakan Work From Home diperbarui mulai Maret 2026. Maksimal 2 hari per minggu.',
      },
      {
        creatorId: employees[0].id,
        title: 'Laporan Audit Sistem IT Januari 2026',
        category: 'REPORT',
        content:
          'Hasil audit menunjukkan tingkat uptime server mencapai 99.7% dengan 3 insiden minor yang telah ditangani.',
      },
      {
        creatorId: employees[1].id,
        title: 'Surat Masuk: Kerjasama dengan PT Maju Bersama',
        category: 'INCOMING',
        content:
          'Proposal kerjasama dalam bidang pengembangan SDM dan pelatihan digital.',
      },
    ],
  });

  console.log('✅ Created sample documents');
  console.log('\n🎉 Seed completed!');
  console.log('\n📋 Demo Accounts:');
  console.log('   Admin:     admin@office.sim / password123');
  console.log('   Manager:   manager@office.sim / password123');
  console.log('   Secretary: secretary@office.sim / password123');
  console.log('   Staff:     staff@office.sim / password123');
  console.log('   Staff 2:   staff2@office.sim / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
