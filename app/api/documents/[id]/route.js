import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.category && { category: data.category }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.signed && { signedAt: new Date() }),
      },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }
    console.error('Update document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ message: 'Document deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
