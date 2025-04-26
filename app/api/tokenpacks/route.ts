// app/api/tokenpacks/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const tokenPacks = await prisma.tokenPack.findMany();
		return NextResponse.json({ tokenPacks });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to fetch token packs" },
			{ status: 500 }
		);
	}
}
