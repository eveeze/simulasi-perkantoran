import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const revenue = await prisma.revenue.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });
    if (!revenue) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Get revenue error:', error);
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

    const revenue = await prisma.revenue.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
        ...(data.source && { source: data.source }),
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
    return NextResponse.json(revenue);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Update revenue error:', error);
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
    await prisma.revenue.delete({ where: { id } });
    return NextResponse.json({ message: 'Revenue deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Delete revenue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
