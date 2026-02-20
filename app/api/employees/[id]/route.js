import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        departmentId: true,
        department: { select: { name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.departmentId !== undefined)
      updateData.departmentId = data.departmentId;
    if (data.password) updateData.password = await hashPassword(data.password);

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: { select: { name: true } },
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 },
      );
    }
    console.error('Update employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ message: 'Employee deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 },
      );
    }
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
