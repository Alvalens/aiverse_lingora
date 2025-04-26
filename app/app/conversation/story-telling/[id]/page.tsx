"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { toast } from "react-hot-toast";

export default function StoryTellingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params once with use()
  const { id } = use(params);
  const router = useRouter();

  // State for managing component
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePath, setImagePath] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Basic recorder setup
  const {
    isRecording,
    audioBlob,
    startRecording: baseStartRecording,
    stopRecording: baseStopRecording,
    resetAudioBlob
  } = useAudioRecorder();

  // Fetch the image path for this session
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        // Fetch from the API endpoint we created
        const response = await fetch(`/api/conversations/story-telling/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch session details");
        }

        const data = await response.json();
        setImagePath(data.imagePath);
      } catch (error) {
        console.error("Error fetching session details:", error);
        toast.error("Failed to load image. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [id]); // Only depend on the id, which is stable

  // Transcribe audio automatically
  const transcribeAudio = async (blob: Blob) => {
    if (!blob) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob);

      const response = await fetch("/api/conversations/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to transcribe audio");
      }

      const data = await response.json();
      setTranscribedText(data.themes || ""); // The API returns 'themes' for transcribed text
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Override stopRecording to automatically transcribe
  const stopRecording = () => {
    baseStopRecording();

    // Use a small timeout to allow audioBlob to be set
    setTimeout(() => {
      if (audioBlob) {
        transcribeAudio(audioBlob);
      }
    }, 500);
  };

  const handleSubmit = async () => {
    if (!transcribedText) {
      toast.error("Please record and transcribe your description first");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/conversations/story-telling/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: transcribedText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save description");
      }

      toast.success("Your description has been saved successfully!");

      // Redirect to the conversations page
      router.push("/app/conversation");
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save your description. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary">
        <p className="text-lg text-white">Loading image...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-[#052038] p-6 rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Describe the Image</h1>

        <div className="mb-8 flex flex-col items-center">
          {imagePath && (
            <div className="relative w-full max-w-lg h-96 mb-4">
              <Image
                src={imagePath}
                alt="Story telling image"
                width={500}
                height={500}
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                priority
                unoptimized
              />
            </div>
          )}

          <p className="text-center mt-4">
            Look at the image carefully and describe what you see. Try to be detailed in your description.
          </p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="flex gap-4 mb-6 justify-center">
            <Button
              onClick={isRecording ? stopRecording : baseStartRecording}
              className={`px-6 py-2 rounded ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-[#0E63A9] hover:bg-blue-700"
                }`}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>

            {!isRecording && audioBlob && (
              <Button
                onClick={resetAudioBlob}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded"
              >
                Reset
              </Button>
            )}
          </div>

          {isTranscribing && (
            <div className="mt-2 text-center">
              <p>Transcribing your audio...</p>
            </div>
          )}
        </div>

        {transcribedText && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Your Description:</h2>
            <div className="bg-[#0A3256] p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{transcribedText}</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded mt-6 w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Description"}
            </Button>
          </div>
        )}

        <div className="text-center mt-6">
          <Button
            onClick={() => router.push("/app/conversation")}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded"
          >
            Back to Conversations
          </Button>
        </div>
      </div>
    </div>
  );
}
