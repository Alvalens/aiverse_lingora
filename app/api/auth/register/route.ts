import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();
        console.log(email);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

export async function GET() {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
}