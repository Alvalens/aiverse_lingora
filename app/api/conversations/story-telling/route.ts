import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { modelStoryTelling } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST() {
	try {
		const user_id = (await getServerSession(authOptions))?.user?.id;
		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Generate an image prompt for story telling
		const imagePrompt =
			"Generate a highly realistic image depicting a detailed scene from everyday life, designed specifically to be used in an IELTS-style image description speaking task. The image should capture beauty in the ordinary, featuring rich and nuanced details—such as setting, characters, objects, and activities—that naturally invite in-depth verbal description. Focus on authenticity, emotional resonance, and vivid textures, with realistic lighting and atmosphere. The scene should spark curiosity and encourage the viewer to imagine the story behind the moment, supporting fluent, coherent, and organized English storytelling during the task. The image must be suitable as a cover photo for a narrative article while being accessible for intermediate to advanced English learners.";

		try {
			// Generate image using the Gemini model
			const imageBuffer = await modelStoryTelling(imagePrompt);

			// Create directory if it doesn't exist
			const publicDir = path.join(process.cwd(), "public");
			const generatedDir = path.join(publicDir, "generated");

			if (!fs.existsSync(generatedDir)) {
				fs.mkdirSync(generatedDir, { recursive: true });
			}

			// Generate unique filename based on timestamp and random string
			const timestamp = Date.now();
			const randomStr = Math.random().toString(36).substring(2, 8);
			const filename = `storytelling-${timestamp}-${randomStr}.jpg`;
			const imagePath = path.join(generatedDir, filename);

			// Save the image to the file system
			fs.writeFileSync(imagePath, imageBuffer);

			// Store relative path in the database (relative to the public directory)
			const relativeImagePath = `/generated/${filename}`;

			// Create a new story telling session
			const storyTellingSession = await prisma.storyTellingSession.create(
				{
					data: {
						userId: user_id,
						image: relativeImagePath,
					},
				}
			);

			return NextResponse.json({
				success: true,
				id: storyTellingSession.id,
				imagePath: relativeImagePath,
			});
		} catch (imageError) {
			console.error("Error generating image:", imageError);

			// Fallback to a default image if image generation fails
			const defaultImagePath = "/landing-page/images/story-image.jpg";

			// Create a new story telling session with the default image
			const storyTellingSession = await prisma.storyTellingSession.create(
				{
					data: {
						userId: user_id,
						image: defaultImagePath,
					},
				}
			);

			return NextResponse.json({
				success: true,
				id: storyTellingSession.id,
				imagePath: defaultImagePath,
				note: "Used default image due to generation failure",
			});
		}
	} catch (error) {
		console.error("Error creating story telling session:", error);
		return NextResponse.json(
			{ error: "Failed to create story telling session" },
			{ status: 500 }
		);
	}
}




export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		const user_id = session?.user?.id;

		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const storyTellingSessions = await prisma.storyTellingSession.findMany({
			where: {
				userId: user_id,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				image: true,
				userAnswer: true,
				suggestions: true,
				score: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return NextResponse.json({
			success: true,
			sessions: storyTellingSessions,
		});
	} catch (error) {
		console.error("Error fetching story telling history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch history" },
			{ status: 500 }
		);
	}
}