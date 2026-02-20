import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['ADMIN', 'MANAGER', 'SECRETARY'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {};
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { date: 'desc' },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = expenses
      .filter((e) => {
        const now = new Date();
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    return NextResponse.json({ data: expenses, total, thisMonth, byCategory });
  } catch (error) {
    console.error('Get expenses error:', error);
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

    const { title, amount, category, date, description, attachmentUrl } =
      await request.json();

    if (!title || !amount || !date) {
      return NextResponse.json(
        { error: 'Title, amount, and date are required' },
        { status: 400 },
      );
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category: category || 'OPERASIONAL',
        date: new Date(date),
        description: description || null,
        attachmentUrl: attachmentUrl || null,
        createdById: auth.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
