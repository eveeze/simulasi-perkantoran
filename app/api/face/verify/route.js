import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { descriptor } = await request.json();

    if (
      !descriptor ||
      !Array.isArray(descriptor) ||
      descriptor.length !== 128
    ) {
      return NextResponse.json(
        { error: 'Valid 128-dimensional face descriptor is required' },
        { status: 400 },
      );
    }

    // Get all employees with registered face descriptors
    const employees = await prisma.employee.findMany({
      where: {
        faceDescriptor: { isEmpty: false },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        faceDescriptor: true,
      },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'No registered faces found' },
        { status: 404 },
      );
    }

    // Find best match using Euclidean distance
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const emp of employees) {
      const storedDesc = emp.faceDescriptor;
      if (storedDesc.length !== 128) continue;

      let sumSquares = 0;
      for (let i = 0; i < 128; i++) {
        const diff = descriptor[i] - storedDesc[i];
        sumSquares += diff * diff;
      }
      const distance = Math.sqrt(sumSquares);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = emp;
      }
    }

    const THRESHOLD = 0.5;

    if (bestDistance > THRESHOLD || !bestMatch) {
      return NextResponse.json(
        {
          matched: false,
          distance: bestDistance,
          message: 'Wajah tidak dikenali. Silakan daftarkan terlebih dahulu.',
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      matched: true,
      distance: bestDistance,
      employee: {
        id: bestMatch.id,
        name: bestMatch.name,
        email: bestMatch.email,
        role: bestMatch.role,
      },
    });
  } catch (error) {
    console.error('Face verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
