"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "react-hot-toast";
import { Volume2 } from "lucide-react";

export default function StoryTellingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePath, setImagePath] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    isSpeaking,
    speakText,
  } = useSpeechSynthesis();

  const {
    isRecording,
    audioBlob,
    startRecording: baseStartRecording,
    stopRecording: baseStopRecording,
    resetAudioBlob
  } = useAudioRecorder({ maxDuration: 120000 });

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
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
  }, [id]);

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
      setTranscribedText(data.themes || "");
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    baseStopRecording(transcribeAudio);
  };

  const startRecording = () => {
    setTranscribedText("");
    baseStartRecording();
  };

  const playInstructionsAndRecord = () => {
    if (isRecording) {
      stopRecording();
    }
    const instructions = "Look at the image carefully. When the audio ends, recording will start automatically. Describe what you see in detail, including people, objects, settings, and any notable aspects of the image.";
    speakText(instructions, {
      onEnd: () => {
        setTimeout(() => {
          startRecording();
          toast.success("Recording started automatically! Speak now.");
        }, 500);
      }
    });
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
      toast.success("Your description has been saved and analyzed!");
      router.push(`/app/conversation/story-telling/${id}/result`);
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save your description. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset handler: reset transcribedText lalu reset audioBlob
  const handleReset = () => {
    setTranscribedText("");
    resetAudioBlob();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary">
        <p className="text-lg text-white">Loading image...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl relative min-h-screen">
      {/* Judul halaman di atas */}
      <h1 className="text-3xl font-bold mb-8 pt-6 text-color-text">Describe The Image</h1>
      <div className="p-6 text-white flex flex-col items-center">
        {/* Card wrapping the image */}
        {imagePath && (
          <Card className="w-full max-w-3xl bg-secondary mb-4 p-4">
            <CardContent className="p-0 flex justify-center">
              <div className="relative w-full h-[600px]">
                <Image
                  src={imagePath}
                  alt="Story telling image"
                  width={1200}
                  height={600}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  priority
                  unoptimized
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hasil transkrip di bawah gambar */}
        {transcribedText && (
          <div className="w-full max-w-3xl mb-4">
            <h2 className="text-xl font-semibold mb-2">Your Description:</h2>
            <div className="bg-tertiary p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{transcribedText}</p>
            </div>
          </div>
        )}

        <p className="text-center mt-2 mb-2">
          Look at the image carefully and describe what you see. Try to be detailed in your description.
        </p>

        {/* Buttons */}
        <div className="flex flex-row gap-4 mt-2 w-full max-w-3xl">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSpeaking}
            className={`px-6 py-2 rounded flex-1 ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-primary border border-tertiary text-color-text hover:bg-tertiary hover:text-white"}`}
            style={{ flexBasis: "75%" }}
          >
            {isRecording ? "Stop Recording" : "Start Recording Manually"}
          </Button>
          {!transcribedText ? (
            <Button
              onClick={playInstructionsAndRecord}
              disabled={isSpeaking || isRecording}
              className="bg-[#164869] hover:bg-tertiary flex items-center justify-center"
              style={{ flexBasis: "25%" }}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {isSpeaking ? "Speaking..." : "Listen to Instructions"}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded"
              style={{ flexBasis: "25%" }}
            >
              {isSubmitting ? "Analyzing..." : "Submit Description"}
            </Button>
          )}
        </div>

        {/* Reset & Back Button */}
        <div className="flex flex-row items-center w-full max-w-3xl mt-4 gap-4">
          <Button
            onClick={() => router.push("/app/conversation")}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded w-1/2"
          >
            Back to Conversations
          </Button>
          {!isRecording && audioBlob && (
            <Button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded w-1/2"
            >
              Reset
            </Button>
          )}
        </div>

        {isSpeaking && (
          <div className="mt-2 text-center">
            <p>Listening to instructions... Recording will start automatically when finished.</p>
          </div>
        )}

        {isTranscribing && (
          <div className="mt-2 text-center">
            <p>Transcribing your audio...</p>
          </div>
        )}
      </div>
    </div>
  );
}