import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: dailyTalkId } = await params;

		if (!dailyTalkId) {
			return NextResponse.json(
				{ error: "Invalid request" },
				{ status: 400 }
			);
		}

		const sessionUser = await getServerSession(authOptions);
		const user_id = sessionUser?.user?.id;

		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const session = await prisma.dailyTalkSession.findUnique({
			where: {
				id: dailyTalkId,
				userId: user_id,
			},
			include: {
				questions: true,
			},
		});

		if (!session || session.userId !== user_id) {
			return NextResponse.json(
				{ error: "Daily talk session not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(session, { status: 200 });
	} catch (error) {
		console.error("Failed to get daily talk session", error);
		return NextResponse.json(
			{ error: "Failed to get daily talk session" },
			{ status: 500 }
		);
	}
}
