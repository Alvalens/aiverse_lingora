import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newEmail, currentPassword, newPassword } = await request.json();
    if (!newEmail || !currentPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ error: 'User password not set' }, { status: 400 });
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const updatedData: any = {
      email: newEmail,
      emailVerified: null,
    };

    if (newPassword) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      updatedData.password = newHashedPassword;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updatedData,
    });

    return NextResponse.json({ message: 'Email and password updated successfully.' });
  } catch (error) {
    console.error('Error updating email and password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}