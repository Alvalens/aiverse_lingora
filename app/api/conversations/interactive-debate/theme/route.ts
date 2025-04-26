import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { modelDebateTheme } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const buildPrompt = () => {
	return `You are an expert debate coach.  
  Generate 5 thought-provoking debate themes. Each theme should be a concise phrase suitable for a two-person debate, and each must include a brief description outlining the core issue and potential arguments on both sides.  
  Output as a JSON array in this format:  
  [  
	{ theme: 'theme1', description: 'description1' },  
	...  
  ]`;
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
    const result = await modelDebateTheme.generateContent(prompt);
    const responseText = result.response.text();
    const response = JSON.parse(responseText);

    // return to frontend
    return NextResponse.json(
        {
            themes: response,
        },
        {
            status: 200,
        }
    );
} catch (error) {
        console.error("Error in POST /api/conversations/interactive-debate/theme", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}