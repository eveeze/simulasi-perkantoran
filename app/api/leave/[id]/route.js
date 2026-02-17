import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || !['ADMIN', 'MANAGER'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or REJECTED' },
        { status: 400 },
      );
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approverId: auth.id,
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 },
      );
    }
    console.error('Update leave request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
