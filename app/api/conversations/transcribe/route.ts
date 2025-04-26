import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { modelTranscribe } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const buildPrompt = () => {
	return `You are an expert audio transcriber. convert the audio to text. The audio is in English. The transcription should be accurate and clear. Don't correct any grammatical errors. The transcription should be in raw english without any additional changes or corrections.`;
};

export async function POST(request: Request) {
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

		const formData = await request.formData();
		const audioBlob = formData.get("audio") as Blob;
		const audioBlobBuffer = await audioBlob.arrayBuffer();

		if (!audioBlobBuffer) {
			return NextResponse.json(
				{ error: "Audio file is required" },
				{ status: 400 }
			);
		}

		// Convert audio buffer to base64 for Gemini
        const audioArrayBuffer = await audioBlob.arrayBuffer();
		const audioBuffer = Buffer.from(audioArrayBuffer);
		const audioBase64 = audioBuffer.toString("base64");

		const prompt = buildPrompt();
		const result = await modelTranscribe.generateContent([
			prompt,
			{
				inlineData: {
					data: audioBase64,
					mimeType: audioBlob.type,
				},
			},
		]);

        const response = await result.response;
		const text = response.text();

		// return to frontend
		return NextResponse.json(
			{
				themes: text,
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
