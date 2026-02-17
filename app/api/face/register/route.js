import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { employeeId, descriptor } = await request.json();

    if (!employeeId || !descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json(
        { error: 'Employee ID and face descriptor array are required' },
        { status: 400 },
      );
    }

    if (descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Face descriptor must be a 128-dimensional vector' },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { faceDescriptor: descriptor },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({
      message: `Face registered for ${employee.name}`,
      employee,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 },
      );
    }
    console.error('Face register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
