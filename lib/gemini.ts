import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { GoogleGenAI, Modality } from "@google/genai";
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

const DailyTalkSuggestionSchema = {
	description:
		"Daily talk suggestion, grammary and suggestion for the user to improve their English skills",
	type: SchemaType.OBJECT,
	properties: {
		answers: {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					suggestion: {
						type: SchemaType.STRING,
						description:
							"A concise, constructive improvement tip and add the corrected answer or example if applicable",
					},
					reason: {
						type: SchemaType.STRING,
						description:
							"Why that change will strengthen the response",
					},
					mark: {
						type: SchemaType.NUMBER,
						description:
							"Numeric score (1-10) following the defined scale",
					},
				},
				required: ["suggestion", "reason", "mark"],
			},
		},
		overallSuggestion: {
			type: SchemaType.STRING,
			description:
				"A comprehensive summary of the entire daily conversation performance, including grammar, vocabulary, and fluency.Use a friendly and encouraging tone.",
		},
	},
	required: ["answers", "overallSuggestion"],
} as Schema;

const StoryTellingSuggestionSchema = {
	description:
		"Story Telling suggestion, grammary and suggestion for the user to improve their English skills ",
	type: SchemaType.OBJECT,
	properties: {
		overallSuggestion: {
			type: SchemaType.STRING,
			description: "overall suggestion of the user answer",
		},
		score: {
			type: SchemaType.NUMBER,
			description: "score overall"
		},
		suggestions: {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					part: {
						type: SchemaType.STRING,
						description: "part of the user answer that need correction"
					},
					suggestion: {
						type: SchemaType.STRING,
						description: "suggestion of the part based on the grammar etc"
					}
				}
			}
		}
	}
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
	systemInstruction: `
	You are a friendly and professional English conversation partner.
	Your task is to simulate a natural, daily conversation with the user, based on the provided theme and description.
	Speak **one turn at a time**, responding **only to the latest user input**, and **do not generate or predict future conversation turns**.
	After each user message, provide a relevant, engaging, and contextually appropriate reply — just like a real person would do in a daily talk, interview, or casual discussion.

	Keep your responses concise (1-3 sentences) and encourage the user to continue the conversation naturally.
	Do not summarize the entire conversation or generate multiple turns at once.
	Stay within the context of the given theme.

	Always assume the role of a real conversation partner, maintaining fluid, human-like interaction.
    `,
	generationConfig: {
		temperature: 1.3,
	},
});

const modelDailyTalkSuggestion = genAI.getGenerativeModel({
	model: "gemini-1.5-pro",
	systemInstruction: [
		"You are a professional English fluency coach specializing in daily conversation practice.",
		"Your task is to review each user response for grammar accuracy, fluency, naturalness, and relevance to the conversation theme.",
		"",
		"Use a score from 1 to 10, where:",
		"  1-2 (Very Poor): Grammatically broken, unnatural phrasing, difficult to understand.",
		"  3-4 (Poor): Frequent grammar issues or awkwardness, understandable but unnatural.",
		"  5-6 (Average): Mostly understandable with minor grammar errors or stiff phrasing.",
		"  7-8 (Strong): Fluent and clear with small improvements possible for full naturalness.",
		"  9-10 (Excellent): Fully natural, grammatically correct, and engaging for daily conversation.",
		"",
		"To ensure an unbiased evaluation, follow these guidelines:",
		"- Prioritize real conversational flow over textbook correctness.",
		"- Focus on idiomatic phrasing, appropriate word choices, and logical responses.",
		"- Reward confident, natural expressions even if very minor informalities exist.",
		"- Penalize critical grammar mistakes, confusing wording, or awkward structures.",
		"- Use the full 1-10 range based strictly on linguistic quality and naturalness.",
		"",
		"For each input answer, output a JSON array of objects with keys:",
		"  • suggestion: a concise improvement tip with an example correction if needed,",
		"  • reason: why the change will improve fluency, clarity, or naturalness,",
		"  • mark: a numeric score (1-10) following the above scale.",
		"",
		"Additionally, include an 'overallSuggestion' property that summarizes the user's conversational strengths, weaknesses, and provides strategic tips for improving everyday English fluency.",
		"",
		"Output only the JSON array and the overallSuggestion property, with no extra text or formatting.",
	].join("\n"),
	generationConfig: {
		responseMimeType: "application/json",
		responseSchema: DailyTalkSuggestionSchema,
	},
});

const modelTranscribe = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
	systemInstruction:
		"You are an expert english teacher. Transcribe the audio to text.",
});

const DebateThemeSchema = {
	description: "Generate a random topic for a debate session",
	type: SchemaType.ARRAY,
	items: {
	  type: SchemaType.OBJECT,
	  properties: {
		title: {
		  type: SchemaType.STRING,
		  description: "Debate topic title",
		},
		description: {
		  type: SchemaType.STRING,
		  description:
			"Brief overview of the topic and the key arguments on both sides",
		},
	  },
	  required: ["title", "description"],
	},
  } as Schema;

  const DebateSuggestionSchema = {
	description:
	  "Debate feedback suggestions, focusing on argument quality, coherence, persuasiveness, and language",
	type: SchemaType.OBJECT,
	properties: {
	  answers: {
		type: SchemaType.ARRAY,
		items: {
		  type: SchemaType.OBJECT,
		  properties: {
			suggestion: {
			  type: SchemaType.STRING,
			  description:
				"A concise tip to improve the specific argument or language use, with an example correction if applicable",
			},
			reason: {
			  type: SchemaType.STRING,
			  description:
				"Why this change will strengthen the argument’s clarity, logic, or rhetorical impact",
			},
			mark: {
			  type: SchemaType.NUMBER,
			  description:
				"Numeric score (1-10) assessing argument strength, coherence, and language accuracy",
			},
		  },
		  required: ["suggestion", "reason", "mark"],
		},
	  },
	  overallSuggestion: {
		type: SchemaType.STRING,
		description:
		  "A comprehensive summary of the user’s debate performance, highlighting strengths in reasoning and language, plus strategic tips for more persuasive debate",
	  },
	},
	required: ["answers", "overallSuggestion"],
  } as Schema;

  const modelDebateTheme = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
	systemInstruction: `
  You are an expert debate coach.
  Generate 5 compelling debate topics. Each should include:
  • title: a concise statement of the motion or question
  • description: context, stakes, and possible angles for both sides
  Output as a JSON array: [{ title: '...', description: '...' }, ...]
	`.trim(),
	generationConfig: {
	  temperature: 1.3,
	  responseMimeType: "application/json",
	  responseSchema: DebateThemeSchema,
	},
  });

  const modelDebateConversation = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
	systemInstruction: `
  You are a knowledgeable and respectful debate partner.
  Your task is to respond **one turn at a time** to the user’s latest argument on the given debate topic.
  • Address the user’s point directly with a counter-argument, supporting evidence, or probing question.
  • Keep replies concise (1–3 sentences) and encourage further exchange.
  • Do not script future turns—only reply to the most recent user input.
  • Maintain a formal yet engaging debate tone.
	`.trim(),
	generationConfig: {
	  temperature: 1.3,
	},
  });

  // Model to provide feedback on debate performance
const modelDebateSuggestion = genAI.getGenerativeModel({
	model: "gemini-1.5-pro",
	systemInstruction: [
	  "You are a professional Expert debate coach.",
	  "Your task is to evaluate each user argument for:",
	  "- Logical coherence and structure",
	  "- Persuasiveness and use of evidence",
	  "- Language accuracy and rhetorical style",
	  "",
	  "Use a score from 1 to 10, where:",
	  "  1-2 (Very Weak): Argument unclear or unsupported, major logical flaws.",
	  "  3-4 (Weak): Some logical gaps or poor evidence, language errors hindering clarity.",
	  "  5-6 (Average): Understandable argument with minor logic or language issues.",
	  "  7-8 (Strong): Well-structured, persuasive, with small language refinements possible.",
	  "  9-10 (Excellent): Highly convincing, logically sound, and eloquently expressed.",
	  "",
	  "For each user input, output a JSON array with objects containing:",
	  "  • suggestion: concise tip + example if needed,",
	  "  • reason: why it improves argument or language,",
	  "  • mark: numeric score (1–10).",
	  "",
	  "Also include an 'overallSuggestion' summarizing the debate strengths, weaknesses, and next-step strategies.",
	  "",
	  "Output only the JSON and overallSuggestion—no extra text.",
	].join("\n"),
	generationConfig: {
	  responseMimeType: "application/json",
	  responseSchema: DebateSuggestionSchema,
	},
  });

  const modelDebateTranscribe = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
	systemInstruction:
	  "You are an expert Debate Coach. Transcribe the submitted debate audio to text.",
  });

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
	modelDailyTalkSuggestion,
	modelDebateTheme,
	modelDebateConversation,
	modelDebateSuggestion,
	modelDebateTranscribe
	modelStoryTellingSuggestion,
	modelStoryTelling,
};
