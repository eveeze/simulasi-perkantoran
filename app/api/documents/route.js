import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');

    const where = {};
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { letterNumber: { contains: search, mode: 'insensitive' } },
        { senderName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, role: true },
        },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
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

    const {
      title,
      content,
      category,
      letterNumber,
      senderName,
      recipientName,
      priority,
      fileUrl,
      attachments,
    } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        creatorId: auth.id,
        title,
        content: content || '',
        category: category || 'INCOMING',
        letterNumber: letterNumber || null,
        senderName: senderName || null,
        recipientName: recipientName || null,
        priority: priority || 'MEDIUM',
        fileUrl: fileUrl || null,
        ...(attachments &&
          attachments.length > 0 && {
            attachments: {
              create: attachments.map((att) => ({
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileType: att.fileType || null,
                fileSize: att.fileSize || null,
                publicId: att.publicId || null,
              })),
            },
          }),
      },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        attachments: true,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
