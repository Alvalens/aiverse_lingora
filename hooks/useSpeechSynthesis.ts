import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface SpeakOptions {
	rate?: number;
	pitch?: number;
	onEnd?: () => void;
	onError?: (error: SpeechSynthesisErrorEvent) => void;
}

export function useSpeechSynthesis() {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const synthRef = useRef<SpeechSynthesis | null>(null);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const textQueueRef = useRef<string[]>([]);
	const isProcessingRef = useRef(false);
	const retriesRef = useRef(0);
	const maxRetries = 3;

	// Map language codes to BCP 47 language tags for speech synthesis
	const getSynthesisLanguage = (langCode: string): string => {
		switch (langCode) {
			case "EN":
				return "en-US";
			case "ID":
				return "id-ID";
			default:
				return "en-US";
		}
	};

	// Find appropriate voice for the language
	const findVoiceForLanguage = (): SpeechSynthesisVoice | null => {
		const lang = getSynthesisLanguage("EN");

		// Try to find a voice that matches exactly the language code
		let voice = voices.find(
			(v) => v.lang.toLowerCase() === lang.toLowerCase()
		);

		// If no exact match, try to find a voice that starts with the language prefix
		if (!voice) {
			const prefix = lang.split("-")[0].toLowerCase();
			voice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
		}

		// If still no match, return null and let the browser pick a default
		return voice || null;
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			synthRef.current = window.speechSynthesis;

			const loadVoices = () => {
				const availableVoices = synthRef.current?.getVoices() || [];
				setVoices(availableVoices);
			};

			if (synthRef.current) {
				loadVoices();
				synthRef.current.onvoiceschanged = loadVoices;
			}
		}

		return () => {
			if (synthRef.current) {
				synthRef.current.cancel();
				isProcessingRef.current = false;
				textQueueRef.current = [];
			}
		};
	}, []);

	// Split text by sentence boundaries to create manageable chunks
	const splitTextIntoChunks = (text: string, maxLength = 200): string[] => {
		if (text.length <= maxLength) return [text];

		// Split by common sentence terminators, but keep the terminators
		const sentenceRegex = /([.!?])\s+/g;
		const sentences = text
			.split(sentenceRegex)
			.reduce((acc: string[], curr, i, arr) => {
				if (i % 2 === 0) {
					// This is the text part
					if (i + 1 < arr.length) {
						// Add the text plus its terminator
						acc.push(curr + arr[i + 1]);
					} else {
						// Last item might not have a terminator
						acc.push(curr);
					}
				}
				return acc;
			}, []);

		// Combine sentences into chunks of reasonable size
		const chunks: string[] = [];
		let currentChunk = "";

		for (const sentence of sentences) {
			if (currentChunk.length + sentence.length <= maxLength) {
				currentChunk += sentence;
			} else {
				if (currentChunk) chunks.push(currentChunk);
				currentChunk = sentence;
			}
		}

		if (currentChunk) chunks.push(currentChunk);
		return chunks;
	};

	// Process the text queue sequentially
	const processTextQueue = (options: SpeakOptions) => {
		if (
			textQueueRef.current.length === 0 ||
			isProcessingRef.current === false
		) {
			isProcessingRef.current = false;
			setIsSpeaking(false);
			return;
		}

		const text = textQueueRef.current.shift();
		if (!text) {
			isProcessingRef.current = false;
			setIsSpeaking(false);
			return;
		}

		// Create a new utterance for this chunk
		const utterance = new SpeechSynthesisUtterance(text);
		utteranceRef.current = utterance;

		// Configure voice settings
		utterance.rate = options.rate ?? 1.1;
		utterance.pitch = options.pitch ?? 0.9;

		// Try to find an appropriate voice for the language
		const voice = findVoiceForLanguage();
		if (voice) {
			utterance.voice = voice;
		}

		// Event handlers
		utterance.onend = () => {
			if (textQueueRef.current.length > 0) {
				// If there are more chunks, process the next one
				processTextQueue(options);
			} else {
				// All done
				isProcessingRef.current = false;
				setIsSpeaking(false);
				if (options.onEnd) {
					options.onEnd();
				}
			}
		};

		utterance.onerror = (event) => {
			console.error("Speech synthesis error:", event.error);
			isProcessingRef.current = false;
			setIsSpeaking(false);
			toast.error("Text-to-speech error. Please try again.");
			if (options.onError) {
				options.onError(event);
			}
			// Retry mechanism
			if (retriesRef.current < maxRetries) {
				retriesRef.current += 1;
				setTimeout(() => {
					processTextQueue(options);
				}, 1000);
			} else {
				retriesRef.current = 0;
			}
		};

		// Speak the text chunk
		if (synthRef.current) {
			synthRef.current.speak(utterance);
		}
	};

	const speakText = (text: string, options: SpeakOptions = {}) => {
		if (!synthRef.current) {
			toast.error("Speech synthesis not available");
			return;
		}

		// Cancel any ongoing speech
		stopSpeaking();

		// Split text into manageable chunks
		const chunks = splitTextIntoChunks(text);
		textQueueRef.current = chunks;

		// Set speaking state
		setIsSpeaking(true);
		isProcessingRef.current = true;

		// Start processing the queue
		processTextQueue(options);
	};

	const stopSpeaking = () => {
		if (synthRef.current) {
			synthRef.current.cancel();
			textQueueRef.current = [];
			isProcessingRef.current = false;
			setIsSpeaking(false);
		}
	};

	return {
		isSpeaking,
		speakText,
		stopSpeaking,
		voices,
	};
}
