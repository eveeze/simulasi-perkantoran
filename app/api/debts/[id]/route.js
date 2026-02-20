import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const debt = await prisma.debt.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });
    if (!debt) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(debt);
  } catch (error) {
    console.error('Get debt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || !['ADMIN', 'MANAGER', 'SECRETARY'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const data = await request.json();

    const debt = await prisma.debt.update({
      where: { id },
      data: {
        ...(data.debtorName && { debtorName: data.debtorName }),
        ...(data.creditorName && { creditorName: data.creditorName }),
        ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
        ...(data.paidAmount !== undefined && {
          paidAmount: parseFloat(data.paidAmount),
        }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.status && { status: data.status }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.attachmentUrl !== undefined && {
          attachmentUrl: data.attachmentUrl,
        }),
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(debt);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Update debt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PATCH for quick payment status update
export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || !['ADMIN', 'MANAGER', 'SECRETARY'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { paidAmount, status } = await request.json();

    const debt = await prisma.debt.update({
      where: { id },
      data: {
        ...(paidAmount !== undefined && { paidAmount: parseFloat(paidAmount) }),
        ...(status && { status }),
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(debt);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Patch debt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || !['ADMIN', 'MANAGER'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await prisma.debt.delete({ where: { id } });
    return NextResponse.json({ message: 'Debt deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Delete debt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
