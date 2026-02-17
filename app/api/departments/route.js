import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        manager: { select: { id: true, name: true } },
        _count: { select: { employees: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
