"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

interface AudioRecorderOptions {
	maxDuration?: number; // Maximum recording duration in milliseconds
}

export function useAudioRecorder(options: AudioRecorderOptions = {}) {
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const onStopCallbackRef = useRef<((blob: Blob) => void) | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Default max duration is 30 seconds
	const maxDuration = options.maxDuration || 30000;

	// Cleanup function for timers
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	const startRecording = async () => {
		try {
			// First ensure any previous recording session is stopped
			if (mediaRecorderRef.current && isRecording) {
				mediaRecorderRef.current.stop();
				if (mediaRecorderRef.current.stream) {
					mediaRecorderRef.current.stream
						.getTracks()
						.forEach((track) => track.stop());
				}
			}

			// Clear any existing timer
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}

			// Reset state
			audioChunksRef.current = [];

			// Start new recording
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				if (audioChunksRef.current.length > 0) {
					const audioBlob = new Blob(audioChunksRef.current, {
						type: "audio/webm",
					});
					setAudioBlob(audioBlob);

					// Call the onStop callback if it exists
					if (onStopCallbackRef.current) {
						onStopCallbackRef.current(audioBlob);
					}
				}
			};

			mediaRecorder.start();
			setIsRecording(true);

			// Set a timer to automatically stop recording after maxDuration
			timerRef.current = setTimeout(() => {
				if (isRecording) {
					stopRecording();
					toast.success(
						"Recording stopped automatically due to time limit"
					);
				}
			}, maxDuration);
		} catch (error) {
			console.error("Error starting audio recording:", error);
			toast.error(
				"Could not access your microphone. Please check your browser permissions."
			);
		}
	};

	const stopRecording = (onStopCallback?: (blob: Blob) => void) => {
		// Clear any timer
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		// Set the callback if provided
		if (onStopCallback) {
			onStopCallbackRef.current = onStopCallback;
		}

		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);

			// Stop all audio tracks
			if (mediaRecorderRef.current.stream) {
				mediaRecorderRef.current.stream
					.getTracks()
					.forEach((track) => track.stop());
			}
		}
	};

	const resetAudioBlob = () => {
		setAudioBlob(null);
	};

	return {
		isRecording,
		audioBlob,
		startRecording,
		stopRecording,
		resetAudioBlob,
		maxDuration,
	};
}
