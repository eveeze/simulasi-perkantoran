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
    const status = searchParams.get('status');
    const overdue = searchParams.get('overdue');

    const where = {};
    if (status) where.status = status;
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'PAID' };
    }

    const debts = await prisma.debt.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalUnpaid = debts
      .filter((d) => d.status !== 'PAID')
      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
    const overdueCount = debts.filter(
      (d) => d.status !== 'PAID' && new Date(d.dueDate) < new Date(),
    ).length;

    return NextResponse.json({
      data: debts,
      totalDebt,
      totalPaid,
      totalUnpaid,
      overdueCount,
    });
  } catch (error) {
    console.error('Get debts error:', error);
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

    const {
      debtorName,
      creditorName,
      amount,
      dueDate,
      description,
      attachmentUrl,
    } = await request.json();

    if (!debtorName || !creditorName || !amount || !dueDate) {
      return NextResponse.json(
        {
          error:
            'Debtor name, creditor name, amount, and due date are required',
        },
        { status: 400 },
      );
    }

    const debt = await prisma.debt.create({
      data: {
        debtorName,
        creditorName,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        description: description || null,
        attachmentUrl: attachmentUrl || null,
        createdById: auth.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    console.error('Create debt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
