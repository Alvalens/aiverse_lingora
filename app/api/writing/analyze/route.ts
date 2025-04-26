"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";
import { modelWritingAnalysis } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

// @ts-expect-error expected to be a type error, but we need to import parse from pdf-parse
// the current path causing error which can be mitigated by access lib
// source: https://gitlab.com/autokent/pdf-parse/-/issues/24

import parse from "pdf-parse/lib/pdf-parse";

// Create required directories if they don't exist
const ensureDirectoriesExist = async () => {
	try {
		const uploadDir = path.join(
			process.cwd(),
			"public",
			"uploads",
			"essays"
		);
		await fs.mkdir(uploadDir, { recursive: true });
	} catch (error) {
		console.error("Error creating directories:", error);
	}
};

export async function POST(request: NextRequest) {
	try {
		// Ensure required directories exist
		await ensureDirectoriesExist();

		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		const { filePath } = await request.json();

		if (!filePath) {
			return new NextResponse(
				JSON.stringify({ error: "File path is required" }),
				{ status: 400 }
			);
		}

		// Get absolute path to the file
		const absolutePath = path.join(process.cwd(), "public", filePath);
		console.log("Processing file at:", absolutePath);

		// Check if file exists
		try {
			await fs.access(absolutePath);
		} catch (err) {
			console.error(`File not found: ${absolutePath}`, err);
			return new NextResponse(
				JSON.stringify({
					error: "File not found",
					details: `The file at ${absolutePath} could not be accessed.`,
					path: absolutePath,
				}),
				{ status: 404 }
			);
		}

		// Read the PDF file and extract text
		try {
			const pdfBuffer = await fs.readFile(absolutePath);
			const pdfData = await parse(pdfBuffer);
			const essayText = pdfData.text;

			// Check if there's enough text to analyze
			if (essayText.trim().length < 100) {
				return new NextResponse(
					JSON.stringify({ error: "Essay is too short to analyze" }),
					{ status: 400 }
				);
			}

			// Use Gemini model to analyze the essay
			const result = await modelWritingAnalysis.generateContent({
				contents: [{ role: "user", parts: [{ text: essayText }] }],
			});

			const response = result.response;
			const analysisResult = response.text();
			const parsedResult = JSON.parse(analysisResult);

			// Save analysis result to database
			const fileName = path.basename(filePath);
			const writingResult = await prisma.essayAnalysis.create({
				data: {
					userId: session.user.id,
					originalFilename: fileName,
					overallSuggestion: parsedResult.overallSuggestion,
					score: parsedResult.score,
					structureScore: parsedResult.structure.score,
					structureFeedback: parsedResult.structure.feedback,
					contentScore: parsedResult.content.score,
					contentFeedback: parsedResult.content.feedback,
					languageScore: parsedResult.language.score,
					languageFeedback: parsedResult.language.feedback,
					suggestions: parsedResult.suggestions,
				},
			});

			// Clean up the temporary file
			try {
				await fs.unlink(absolutePath);
				console.log("Successfully deleted file:", absolutePath);
			} catch (unlinkErr) {
				console.error("Error deleting file:", absolutePath, unlinkErr);
				// Continue execution even if file deletion fails
			}

			// Return the analysis result with the session ID
			return new NextResponse(
				JSON.stringify({
					...parsedResult,
					sessionId: writingResult.id,
				}),
				{ status: 200 }
			);
		} catch (fileError) {
			console.error("Error processing PDF:", fileError);
			return new NextResponse(
				JSON.stringify({
					error: "Failed to process PDF file",
					details:
						fileError instanceof Error
							? fileError.message
							: "Unknown error",
				}),
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Error analyzing essay:", error);
		return new NextResponse(
			JSON.stringify({
				error: "Failed to analyze essay",
				details:
					error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500 }
		);
	}
}
