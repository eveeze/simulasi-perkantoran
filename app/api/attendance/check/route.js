import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, name: true, role: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    const now = new Date();

    // No record today → check in
    if (!existingAttendance) {
      const isLate = now.getHours() >= 9; // Late if after 9 AM
      const attendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: today,
          checkIn: now,
          status: isLate ? 'LATE' : 'PRESENT',
        },
      });

      return NextResponse.json({
        action: 'CHECK_IN',
        message: `Selamat datang, ${employee.name}! Check-in berhasil.${isLate ? ' (Terlambat)' : ''}`,
        attendance,
      });
    }

    // Already checked in but not out → check out
    if (existingAttendance.checkIn && !existingAttendance.checkOut) {
      const attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { checkOut: now },
      });

      return NextResponse.json({
        action: 'CHECK_OUT',
        message: `Sampai jumpa, ${employee.name}! Check-out berhasil.`,
        attendance,
      });
    }

    // Both done → already completed
    return NextResponse.json({
      action: 'COMPLETED',
      message: `${employee.name}, Anda sudah menyelesaikan shift hari ini.`,
      attendance: existingAttendance,
    });
  } catch (error) {
    console.error('Check attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
