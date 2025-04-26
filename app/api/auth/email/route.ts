import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    // Cek session pengguna
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data dari request body
    const { newEmail, currentPassword, newPassword } = await request.json();
    if (!newEmail || !currentPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Cari user di database berdasarkan session
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verifikasi password saat ini menggunakan field password (yang sudah di-hash)
    if (!user.password) {
      return NextResponse.json({ error: 'User password not set' }, { status: 400 });
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    }

    // Pastikan email baru belum dipakai oleh user lain
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Jika newPassword dikirimkan, hash dan gunakan sebagai password baru. Jika tidak, biarkan password tetap.
    const updatedData: any = {
      email: newEmail,
      emailVerified: null, // reset verifikasi jika email diupdate
    };

    if (newPassword) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      updatedData.password = newHashedPassword;
    }

    // Update data user di database
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