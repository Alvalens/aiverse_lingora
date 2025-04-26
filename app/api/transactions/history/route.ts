import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get pagination parameters from URL
	const url = new URL(request.url);
	const limit = parseInt(url.searchParams.get("limit") || "10");
	const skip = parseInt(url.searchParams.get("skip") || "0");

	// Add validation for pagination parameters
	if (isNaN(limit) || isNaN(skip) || limit <= 0 || skip < 0) {
		return NextResponse.json(
			{ error: "Invalid pagination parameters" },
			{ status: 400 }
		);
	}

	try {
		// Fetch transactions with token pack information
		const transactions = await prisma.transaction.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				tokenPack: {
					select: {
						name: true,
						tokens: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
			skip: skip,
		});

		// Get total count for pagination
		const total = await prisma.transaction.count({
			where: {
				userId: session.user.id,
			},
		});

		return NextResponse.json(
			{
				transactions,
				pagination: {
					total,
					limit,
					skip,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching transaction history:", error);
		return NextResponse.json(
			{ error: "Failed to load transaction history" },
			{ status: 500 }
		);
	}
}
