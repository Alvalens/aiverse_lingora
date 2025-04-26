import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "User registered successfully." }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
			{
				error: "An error occurred while processing your request. Please try again later.",
			},
			{ status: 500 }
		);
    }
}

export async function GET() {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
}