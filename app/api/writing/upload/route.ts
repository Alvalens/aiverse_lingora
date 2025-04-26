"use server";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Create required directories if they don't exist
const ensureDirectoriesExist = async () => {
	try {
		const uploadDir = path.join(
			process.cwd(),
			"public",
			"uploads",
			"essays"
		);
		await mkdir(uploadDir, { recursive: true });
		return uploadDir;
	} catch (error) {
		console.error("Error creating directories:", error);
		throw error;
	}
};

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		// Process the form data
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return new NextResponse(
				JSON.stringify({ error: "No file provided" }),
				{ status: 400 }
			);
		}

		// Check file type
		if (file.type !== "application/pdf") {
			return new NextResponse(
				JSON.stringify({ error: "Only PDF files are allowed" }),
				{ status: 400 }
			);
		}

		// Check file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			return new NextResponse(
				JSON.stringify({ error: "File size exceeds 10MB limit" }),
				{ status: 400 }
			);
		}

		// Create directory if it doesn't exist
		const uploadDir = await ensureDirectoriesExist();

		// Generate unique filename
		const uniqueId = uuidv4();
		const fileName = `essay-${uniqueId}.pdf`;
		const filePath = path.join(uploadDir, fileName);

		// Read file contents
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Write file to storage
		await writeFile(filePath, buffer);

		// Return the file path for further processing
		return new NextResponse(
			JSON.stringify({
				message: "File uploaded successfully",
				filePath: `/uploads/essays/${fileName}`,
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error uploading file:", error);
		return new NextResponse(
			JSON.stringify({ error: "Failed to upload file" }),
			{ status: 500 }
		);
	}
}
