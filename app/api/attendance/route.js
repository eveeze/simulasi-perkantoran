import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {};

    // Managers can see all, staff only their own
    if (auth.role === 'STAFF') {
      where.employeeId = auth.id;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
