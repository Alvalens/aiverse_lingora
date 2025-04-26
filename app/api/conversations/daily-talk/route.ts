import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Tokens } from "@/lib/constants";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await req.json();
		const { theme, description } = body;

		if (!theme) {
			return NextResponse.json(
				{ error: "Theme is required" },
				{ status: 400 }
			);
		}

		const tokenBalance = await prisma.tokenBalance.findUnique({
			where: { userId: session.user.id },
		});

		if (!tokenBalance || tokenBalance.token < Tokens.convDaily) {
			return NextResponse.json(
				{ error: "Insufficient tokens" },
				{ status: 403 }
			);
		}

		const dailyTalkSession = await prisma.dailyTalkSession.create({
			data: {
				userId: session.user.id,
				theme,
				description: description || "",
			},
		});

		await prisma.tokenBalance.update({
			where: { userId: session.user.id },
			data: {
				token: {
					decrement: Tokens.convDaily,
				},
			},
		});

		return NextResponse.json(
			{
				id: dailyTalkSession.id,
				theme: dailyTalkSession.theme,
				message: "Daily talk session created successfully",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating daily talk session:", error);
		return NextResponse.json(
			{ error: "Failed to create daily talk session" },
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
	  const session = await getServerSession(authOptions);
  
	  if (!session?.user?.id) {
		return NextResponse.json(
		  { error: "Unauthorized" },
		  { status: 401 }
		);
	  }
  
	  const sessions = await prisma.dailyTalkSession.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: "desc" },
		select: {
		  id: true,
		  theme: true,
		  description: true,
		  createdAt: true,
		},
	  });
  
	  return NextResponse.json({
		success: true,
		sessions,
	  }, { status: 200 });
	} catch (error) {
	  console.error("Error fetching daily talk sessions:", error);
	  return NextResponse.json(
		{ error: "Failed to fetch daily talk sessions" },
		{ status: 500 }
	  );
	}
  }