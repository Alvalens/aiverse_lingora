import { NextResponse } from "next/server";
import { modelDebateSuggestion } from "@/lib/gemini";
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

		return `You are a professional English debate coach specializing in structured debate practice.
		Your task is to evaluate each user response as an argument, focusing on:
		  - Logical coherence and structure
		  - Persuasiveness and use of evidence
		  - Rhetorical impact and language accuracy
	
Debate topic: "${theme}"
Topic description: "${description}"
	
		Use a score from 1 to 10, where:
		1-2 (Very Weak): Argument is unclear or unsupported, containing major logical flaws.
		3-4 (Weak): Some structure present but evidence is poor or language errors hinder clarity.
		5-6 (Average): Argument is understandable with minor logical lapses or phrasing issues.
		7-8 (Strong): Well-structured, persuasive argument with relevant evidence and clear expression.
		9-10 (Excellent): Exceptionally convincing, logically rigorous, and eloquently articulated.

	To ensure an unbiased evaluation, follow these guidelines:
		- Prioritize sound reasoning and clear argumentative structure over verbosity.
		- Focus on the relevance and strength of evidence supporting each claim.
		- Reward concise, coherent, and well-supported arguments.
		- Penalize logical fallacies, unsupported assertions, or digressions from the topic.
		- Use the full 1–10 range based strictly on argumentative quality and language precision.
	
For each exchange in the history, output an object with:
  • "suggestion": a concise tip to strengthen the argument or improve language, with an example correction if applicable,
  • "reason": why this change enhances clarity, logic, or persuasiveness,
  • "mark": the numeric score (1–10) based on the above criteria.

In addition, include an "overallSuggestion" that summarizes the debater’s strengths, weaknesses, and offers strategic tips for more effective debating.

Your response should be structured as:
{
  "answers": [/* exactly ${history.length} objects */],
  "overallSuggestion": "comprehensive summary of debate performance"
}



Debate history: [${conversation}]`;
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
  ) {
	try {
	  const { id } = await params;
  
	  if (!id) {
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
  
	  const debateSession = await prisma.debateSession.findUnique({
		where: {
		  id: id,
		  userId: user_id,
		},
	  });

		if (!debateSession || debateSession.userId !== user_id) {
			return NextResponse.json(
				{ error: "Debate session not found" },
				{ status: 404 }
			);
		}

		if (!debateSession.endedAt) {
			return NextResponse.json(
				{ error: "Debate session has not ended" },
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

		console.log(history);

		if (history.length === 0) {
			return NextResponse.json(
				{ error: "No valid conversation exchanges found" },
				{ status: 400 }
			);
		}

		// Generate suggestions using the AI model
		const prompt = generateSuggestions(
			history,
			debateSession.theme,
			debateSession.description,
			
		);

		const result = await modelDebateSuggestion.generateContent(prompt);
		const responseText = result.response.text();

		let parsedResponse;
		console.log(responseText);

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
		console.log(suggestions.length, history.length);
		if (suggestions.length !== history.length) {
			return NextResponse.json(
				{ error: "AI model response format mismatch" },
				{ status: 500 }
			);
		}

		// Insert each question, answer, and suggestion into the database
		let totalMark = 0;
    for (let i = 0; i < history.length; i++) {
      await prisma.debateQuestion.create({
        data: {
          debateId: id,
          question: history[i].question,
          answer: history[i].answer || null, // Make nullable
          suggestion: suggestions[i].suggestion || null, // Make nullable
          reason: suggestions[i].reason || null, // Make nullable
        },
      });

      if (suggestions[i].mark) {
        totalMark += parseFloat(suggestions[i].mark);
      }
    }

		// Update the session with overall score and suggestions
		await prisma.debateSession.update({
			where: { id: id },
			data: {
			  score: totalMark > 0 ? Math.round(totalMark / history.length) : null,
			  suggestions: overallSuggestion || null, // Make nullable and convert to String
			},
		  });
	  
		  return NextResponse.json({
			success: true,
			message: "Debate session saved successfully with suggestions",
		  });
		} catch (error) {
		  console.error("Error in saving debate session:", error);
		  return NextResponse.json(
			{ error: "Failed to save debate session" },
			{ status: 500 }
		  );
		}
	  }