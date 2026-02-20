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
    const report = await prisma.report.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });
    if (!report) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error('Get report error:', error);
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

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.period !== undefined && { period: data.period }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.attachmentUrl !== undefined && {
          attachmentUrl: data.attachmentUrl,
        }),
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(report);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Update report error:', error);
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
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ message: 'Report deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
