import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { modelStoryTellingSuggestion } from "@/lib/gemini";

// Build the prompt for story telling suggestion
const buildPrompt = (description: string, imagePath: string) => {
	return [
		`User has described an image as part of an English language practice exercise.`,
		`Please analyze their description for English language usage, grammar, vocabulary, and storytelling quality.`,
		``,
		`The image being described is: ${imagePath}`,
		``,
		`The user's description of the image is:`,
		`${description}`,
		``,
		`Provide constructive feedback on their description, following the schema with:`,
		`- An overall suggestion summarizing strengths and areas for improvement`,
		`- A score from 1-10 based on grammar, vocabulary, fluency, coherence, and storytelling quality`,
		`- Specific suggestions for parts of their description that could be improved`,
	].join("\n");
};

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }>}
) {
	try {
		const user_id = (await getServerSession(authOptions))?.user?.id;
		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id: sessionId } = await params;
		const { description } = await request.json();

		if (!description) {
			return NextResponse.json(
				{ error: "Description is required" },
				{ status: 400 }
			);
		}
		// Verify the session exists and belongs to the user
		const storyTellingSession = await prisma.storyTellingSession.findUnique(
			{
				where: {
					id: sessionId,
					userId: user_id,
				},
			}
		);

		if (!storyTellingSession) {
			return NextResponse.json(
				{ error: "Session not found" },
				{ status: 404 }
			);
		}

		// Generate suggestions for the user's description
		const prompt = buildPrompt(description, storyTellingSession.image);
		const suggestionResult =
			await modelStoryTellingSuggestion.generateContent(prompt);
		const suggestionResponse = await suggestionResult.response;

		// Parse the suggestions JSON from the model response
		let suggestions;
		try {
			suggestions = suggestionResponse.text();
			suggestions = JSON.parse(suggestions);
		} catch (error) {
			console.error("Error parsing suggestions:", error);
			suggestions = {
				overallSuggestion:
					"We couldn't generate suggestions at this time.",
				score: 5,
				suggestions: [],
			};
		}
		// Update the session with the user's description and suggestions
		const updatedSession = await prisma.storyTellingSession.update({
			where: {
				id: sessionId,
			},
			data: {
				userAnswer: description,
				suggestions: suggestions,
				score: suggestions.score || null,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json({
			success: true,
			id: updatedSession.id,
			suggestions: suggestions,
		});
	} catch (error) {
		console.error("Error saving story telling description:", error);
		return NextResponse.json(
			{ error: "Failed to save description" },
			{ status: 500 }
		);
	}
}
