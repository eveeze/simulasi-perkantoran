import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const source = searchParams.get('source');

    const where = {};
    if (source) where.source = { contains: source, mode: 'insensitive' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const revenues = await prisma.revenue.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const total = revenues.reduce((sum, r) => sum + r.amount, 0);
    const thisMonth = revenues
      .filter((r) => {
        const now = new Date();
        const d = new Date(r.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({ data: revenues, total, thisMonth });
  } catch (error) {
    console.error('Get revenue error:', error);
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
    if (!['ADMIN', 'MANAGER', 'SECRETARY'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, amount, source, date, description, attachmentUrl } =
      await request.json();

    if (!title || !amount || !source || !date) {
      return NextResponse.json(
        { error: 'Title, amount, source, and date are required' },
        { status: 400 },
      );
    }

    const revenue = await prisma.revenue.create({
      data: {
        title,
        amount: parseFloat(amount),
        source,
        date: new Date(date),
        description: description || null,
        attachmentUrl: attachmentUrl || null,
        createdById: auth.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(revenue, { status: 201 });
  } catch (error) {
    console.error('Create revenue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
