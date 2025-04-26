import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { modelTheme } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const buildPrompt = () => {
	return `You are an expert english teacher. Generate a random theme for a daily conversation. The theme should be a short phrase, and it should be suitable for a conversation between two people. The theme should be interesting and engaging about daily life. Generate 5 themes in a object array with the following format: [{ theme: 'theme1', description: 'description1' } ...]`;
};

export async function POST() {
	try {
		const user_id = (await getServerSession(authOptions))?.user?.id;
		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				id: user_id as string,
			},
			include: {
				tokens: true,
			},
		});
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const prompt = buildPrompt();
		const result = await modelTheme.generateContent(prompt);
		const responseText = result.response.text();
		const response = JSON.parse(responseText);

		return NextResponse.json(
			{
				themes: response,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		console.error(
			"Error in POST /api/conversations/daily-talk/theme",
			error
		);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
