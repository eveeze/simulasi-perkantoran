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
    const status = searchParams.get('status');

    const where = {};

    if (auth.role === 'STAFF') {
      where.employeeId = auth.id;
    }

    if (status) {
      where.status = status;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: { select: { name: true } },
          },
        },
        approver: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate, reason } = await request.json();

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Start date, end date, and reason are required' },
        { status: 400 },
      );
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: auth.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
