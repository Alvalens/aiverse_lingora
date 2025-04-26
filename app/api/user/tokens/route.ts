import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const user_id = (await getServerSession(authOptions))?.user?.id;

		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const token = await prisma.tokenBalance.findUnique({
			where: {
				userId: user_id,
			},
			select: {
				token: true,
			},
		});

		return NextResponse.json({ token: token?.token }, { status: 200 });
	} catch (error) {
		console.error("Failed to fetch token balance", error);
		return NextResponse.json(
			{ error: "Failed to fetch token balance" },
			{ status: 500 }
		);
	}
}
