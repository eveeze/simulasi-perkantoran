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
    const type = searchParams.get('type');

    const where = {};
    if (type) where.type = type;

    const reports = await prisma.report.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-generate financial summary
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenueData, expenseData, debtData] = await Promise.all([
      prisma.revenue.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.debt.aggregate({
        _sum: { amount: true, paidAmount: true },
        _count: true,
        where: { status: { not: 'PAID' } },
      }),
    ]);

    const financialSummary = {
      revenueThisMonth: revenueData._sum.amount || 0,
      expenseThisMonth: expenseData._sum.amount || 0,
      profit: (revenueData._sum.amount || 0) - (expenseData._sum.amount || 0),
      outstandingDebt:
        (debtData._sum.amount || 0) - (debtData._sum.paidAmount || 0),
      unpaidDebtCount: debtData._count || 0,
    };

    return NextResponse.json({ data: reports, financialSummary });
  } catch (error) {
    console.error('Get reports error:', error);
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

    const { title, type, period, content, summary, attachmentUrl } =
      await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        title,
        type: type || 'MONTHLY',
        period: period || null,
        content: content || null,
        summary: summary || null,
        attachmentUrl: attachmentUrl || null,
        createdById: auth.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
