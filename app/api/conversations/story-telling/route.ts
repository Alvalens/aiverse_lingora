import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { modelStoryTelling } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export async function POST() {
	try {
		const session = await getServerSession(authOptions);
		const user_id = session?.user?.id;

		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Generate an image prompt for story telling
		const imagePrompt =
			"Create a realistic image that depicts a daily life scene. It should be suitable for language learning and storytelling practice. The scene should be clear, detailed, and engaging.";

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
