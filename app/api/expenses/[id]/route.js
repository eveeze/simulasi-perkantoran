import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['ADMIN', 'MANAGER', 'SECRETARY'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });
    if (!expense) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
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

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
        ...(data.category && { category: data.category }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.attachmentUrl !== undefined && {
          attachmentUrl: data.attachmentUrl,
        }),
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(expense);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Update expense error:', error);
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
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
