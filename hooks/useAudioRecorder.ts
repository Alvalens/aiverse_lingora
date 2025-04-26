"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";

export function useAudioRecorder() {
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);

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
				}
			};

			mediaRecorder.start();
			setIsRecording(true);
		} catch (error) {
			console.error("Error starting audio recording:", error);
			toast.error(
				"Could not access your microphone. Please check your browser permissions."
			);
		}
	};

	const stopRecording = () => {
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
	};
}
