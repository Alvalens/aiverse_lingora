import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import * as fs from "node:fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ThemeSchema = {
	description: "Generate a random theme for a daily conversation",
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			title: {
				type: SchemaType.STRING,
				description: "Theme for the daily conversation",
			},
			description: {
				type: SchemaType.STRING,
				description:
					"Detailed description of the theme, what the theme is about.",
			},
		},
		required: ["title", "description"],
	},
} as Schema;

const modelTheme = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
	systemInstruction:
		"You are an expert english teacher. Generate a random theme for a daily conversation. The theme should be a short phrase, and it should be suitable for a conversation between two people. The theme should be interesting and engaging about daily life. generate 5 themes in a object array with the following format: [{ theme: 'theme1', description: 'description1' } ...]",
	generationConfig: {
		temperature: 1.3,
		responseMimeType: "application/json",
		responseSchema: ThemeSchema,
	},
});

const modelConversation = genAI.getGenerativeModel({
    
    model: "gemini-2.0-flash",
    systemInstruction:
        "You are an expert english teacher. Generate a conversation between two people based on the theme and description provided. The conversation should be engaging and interesting, and it should be suitable for a daily conversation.",
    generationConfig: {
        temperature: 1.3,
    },
});

const modelTranscribe = genAI.getGenerativeModel({
    
    model: "gemini-2.0-flash",
    systemInstruction:
        "You are an expert english teacher. Transcribe the audio to text.",
})

export function fileToGenerativePart(path: string, mimeType: string) {
	return {
		inlineData: {
			data: Buffer.from(fs.readFileSync(path)).toString("base64"),
			mimeType,
		},
	};
}

export {
    modelTheme,
    modelConversation,
    modelTranscribe,
}