import { NextResponse } from "next/server";
import { modelDailyTalkSuggestion } from "@/lib/gemini";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

function generateSuggestions(
	history: { question: string; answer: string }[],
	theme: string,
	description: string,
) {
	if (history.length === 0) {
		return "No conversation history provided.";
	}

	const conversation = history
		.map(
			(item) =>
				`{"question": "${item.question}", "answer": "${item.answer}"}`
		)
		.join(", ");

	return `You are a professional English fluency coach specializing in daily conversation practice.
	Your task is to review each user response for grammar accuracy, fluency, naturalness, and relevance to the conversation theme.
	
	The conversation theme is: "${theme}"
	Theme description: "${description}"
	
	Use a score from 1 to 10, where:
		1-2 (Very Poor): Grammatically broken, unnatural phrasing, difficult to understand.
		3-4 (Poor): Frequent grammar issues or awkwardness, understandable but unnatural.
		5-6 (Average): Mostly understandable with minor grammar errors or stiff phrasing.
		7-8 (Strong): Fluent and clear with small improvements possible for full naturalness.
		9-10 (Excellent): Fully natural, grammatically correct, and engaging for daily conversation.
	
	To ensure an unbiased evaluation, follow these guidelines:
		- Prioritize real conversational flow over textbook correctness.
		- Focus on idiomatic phrasing, appropriate word choices, and logical responses.
		- Reward confident, natural expressions even if very minor informalities exist.
		- Penalize critical grammar mistakes, confusing wording, or awkward structures.
		- Use the full 1-10 range based strictly on linguistic quality and naturalness.
	
	For each answer in the history, output an object with:
		• "suggestion": a concise, constructive improvement tip with an example correction if needed,
		• "reason": why the change will improve fluency, clarity, or naturalness,
		• "mark": the numeric score (1-10) based on the above criteria.
	
	In addition, provide an "overallSuggestion" that summarizes the user's conversational strengths, weaknesses, and provides strategic tips for improving everyday English fluency.
	
	Your response should be structured as:
	{
		"answers": [array of individual answer assessments - exactly ${
			history.length
		} objects],
		"overallSuggestion": "comprehensive summary of conversation performance"
	}
	
	Respond in "EN".
	
	Conversation history: [${conversation}]`;
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await (params);

		if (!id) {
			return NextResponse.json(
				{ error: "Invalid request" },
				{ status: 400 }
			);
		}

		const user_id = (await getServerSession(authOptions))?.user?.id;
		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const dailyTalkSession = await prisma.dailyTalkSession.findUnique({
			where: {
				id: id,
				userId: user_id,
			},
		});

		if (!dailyTalkSession || dailyTalkSession.userId !== user_id) {
			return NextResponse.json(
				{ error: "Daily talk session not found" },
				{ status: 404 }
			);
		}

		if (!dailyTalkSession.endedAt) {
			return NextResponse.json(
				{ error: "Daily talk session has not ended" },
				{ status: 400 }
			);
		}
		const { history } = await req.json();

		if (!history || !Array.isArray(history)) {
			return NextResponse.json(
				{ error: "No history provided" },
				{ status: 400 }
			);
		}

		if (history.length === 0) {
			return NextResponse.json(
				{ error: "No valid conversation exchanges found" },
				{ status: 400 }
			);
		}

		// Generate suggestions using the AI model
		const prompt = generateSuggestions(
			history,
			dailyTalkSession.theme,
			dailyTalkSession.description,
		);

		const result = await modelDailyTalkSuggestion.generateContent(prompt);
		const responseText = result.response.text();

		let parsedResponse;
		try {
			let jsonText = responseText;
			const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
			const match = jsonRegex.exec(jsonText);
			if (match && match[1]) {
				jsonText = match[1];
			}
			parsedResponse = JSON.parse(jsonText);
		} catch (error) {
			console.error("Failed to parse model response:", error);
			return NextResponse.json(
				{ error: "Invalid response format from AI model" },
				{ status: 500 }
			);
		}
		// Extract the answers array and overall suggestion
		let suggestions = [];
		let overallSuggestion = "";

		// Handle all possible response formats
		if (parsedResponse.answers && Array.isArray(parsedResponse.answers)) {
			suggestions = parsedResponse.answers;
			overallSuggestion = parsedResponse.overallSuggestion || "";
		} else if (
			parsedResponse.answer &&
			Array.isArray(parsedResponse.answer)
		) {
			// Handle case where field is named "answer" instead of "answers"
			suggestions = parsedResponse.answer;
			overallSuggestion = parsedResponse.overallSuggestion || "";
		} else if (Array.isArray(parsedResponse)) {
			// Handle old format where response is just an array
			suggestions = parsedResponse;
			// No overallSuggestion in this format
		} else {
			console.error(
				"Invalid response structure:",
				JSON.stringify(parsedResponse)
			);
			return NextResponse.json(
				{ error: "Invalid response format from AI model" },
				{ status: 500 }
			);
		}

		// Ensure suggestions is an array with the expected length
		if (suggestions.length !== history.length) {
			return NextResponse.json(
				{ error: "AI model response format mismatch" },
				{ status: 500 }
			);
		}

		// Insert each question, answer, and suggestion into the database
		let totalMark = 0;
		for (let i = 0; i < history.length; i++) {
			await prisma.dailyTalkQuestion.create({
				data: {
					dailyTalkId: id,
					question: history[i].question,
					answer: history[i].answer,
					suggestion: suggestions[i].suggestion,
					reason: suggestions[i].reason,
				},
			});

			if (suggestions[i].mark) {
				totalMark += parseFloat(suggestions[i].mark);
			}
		}

		// Update the session with overall score and suggestions
		await prisma.dailyTalkSession.update({
			where: { id: id },
			data: {
				score: Math.round(totalMark / history.length),
				suggestions: overallSuggestion,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Daily talk session saved successfully with suggestions",
		});
	} catch (error) {
		console.error("Error in saving daily talk session:", error);
		return NextResponse.json(
			{ error: "Failed to save daily talk session" },
			{ status: 500 }
		);
	}
}
