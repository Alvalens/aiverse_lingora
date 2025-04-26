import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { isSessionEnded } from "@/lib/utils";
import { modelConversation } from "@/lib/gemini";

function buildPrompt(title: string, description: string) {
return `You are an expert english teacher. Generate a conversation between two people based on the theme and description provided. The conversation should be engaging and interesting, and it should be suitable for a daily conversation. The theme is "${title}" and the description of the theme is "${description}".`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
		const { id: dailyTalkId } = await params;
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const dailyTalkSession = await prisma.dailyTalkSession.findUnique({
			where: {
				id: dailyTalkId,
				userId: session.user.id,
			},
		});

		if (!dailyTalkSession || dailyTalkSession.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Daily talk session not found" },
				{ status: 404 }
			);
		}

		if (dailyTalkSession.endedAt !== null) {
			return NextResponse.redirect(
				new URL(`/app/conversation/daily-talk${dailyTalkId}/history`, req.url)
			);
		}

		let { history } = await req.json();

		const ended = isSessionEnded(
			dailyTalkSession.startedAt,
			dailyTalkSession.duration
		);

		const remainingTime = Math.max(
			0,
			Math.floor(
				(dailyTalkSession.startedAt.getTime() +
					dailyTalkSession.duration * 60 * 1000 -
					Date.now()) /
					1000
			)
		);

		console.log("remainingTime", remainingTime);

		if (ended) {
			await prisma.dailyTalkSession.update({
				where: { id: dailyTalkId },
				data: { endedAt: new Date() },
			});
			const endText =
				"Thank you for your time. I hope you enjoyed the conversation. Have a great day!";

			const finalMessage = {
				role: "model",
				parts: [
					{
						text: endText,
					},
				],
			};

			if (history) {
				history.push(finalMessage);
			} else {
				// In case history is null (shouldn't happen but just to be safe)
				history = [finalMessage];
			}

			return NextResponse.json({
				history,
				response: finalMessage.parts[0].text,
				ended: true,
			});
		}

		if (!history) {
			const prompt = buildPrompt(
				dailyTalkSession.theme,
				dailyTalkSession.description
			);

			history = [
				{
					role: "user",
					parts: [{ text: prompt }],
				},
			];
		}
		const lastMessage = history[history.length - 1];

		const chat = await modelConversation.startChat({
			history: history.slice(0, -1),
		});

		// Process the last message and get AI response
		if (lastMessage.role === "user") {
			const result = await chat.sendMessage(lastMessage.parts[0].text);
			const responseText = result.response.text();

			history.push({
				role: "model",
				parts: [{ text: responseText }],
			});

			return NextResponse.json({
				history,
				response: responseText,
			});
		} else {
			// If the last message was from interviewer (or system),
			// just return the current history
			return NextResponse.json({ history, ended });
		}
	} catch (error) {
        console.error("Error in POST /api/conversations/daily-talk/id", error);
		return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}