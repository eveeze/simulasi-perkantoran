import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { email },
      include: { department: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, employee.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const token = signToken({
      id: employee.id,
      email: employee.email,
      role: employee.role,
      name: employee.name,
    });

    const { password: _, faceDescriptor: __, ...employeeData } = employee;

    const response = NextResponse.json({
      token,
      employee: employeeData,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
