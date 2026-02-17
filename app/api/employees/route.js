import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        departmentId: true,
        department: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { name, email, password, role, departmentId } = data;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword(password);

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'STAFF',
        departmentId: departmentId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: { select: { name: true } },
        createdAt: true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 },
      );
    }
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
