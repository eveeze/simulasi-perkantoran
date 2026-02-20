import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      );
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      employeeCount,
      departmentCount,
      documentCount,
      todayAttendance,
      pendingLeaves,
      revenueThisMonth,
      expenseThisMonth,
      outstandingDebts,
      recentDocuments,
      recentRevenues,
      recentExpenses,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.document.count(),
      prisma.attendance.count({
        where: { date: { gte: todayStart } },
      }),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
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
      prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { id: true, name: true } } },
      }),
      prisma.revenue.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true } } },
      }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true } } },
      }),
    ]);

    return NextResponse.json({
      overview: {
        employeeCount,
        departmentCount,
        documentCount,
        todayAttendance,
        pendingLeaves,
      },
      financial: {
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
        expenseThisMonth: expenseThisMonth._sum.amount || 0,
        profit:
          (revenueThisMonth._sum.amount || 0) -
          (expenseThisMonth._sum.amount || 0),
        outstandingDebt:
          (outstandingDebts._sum.amount || 0) -
          (outstandingDebts._sum.paidAmount || 0),
        unpaidDebtCount: outstandingDebts._count || 0,
      },
      recentActivity: {
        documents: recentDocuments,
        revenues: recentRevenues,
        expenses: recentExpenses,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
