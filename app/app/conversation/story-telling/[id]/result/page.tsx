"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function StoryTellingResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [imagePath, setImagePath] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [suggestions, setSuggestions] = useState<any>(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(`/api/conversations/story-telling/${id}/history`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch session details");
        }
        const data = await response.json();
        setImagePath(data.image || "");
        setUserDescription(data.userAnswer || "");
        setSuggestions(data.suggestions || null);
      } catch (error) {
        console.error("Error fetching session details:", error);
        toast.error("Failed to load results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessionDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary">
        <p className="text-lg text-white">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Judul di kiri atas */}
      <h2 className="text-xl font-semibold mb-6 text-left">Your Results</h2>

      {/* Card 1: Gambar */}
      <div className="bg-secondary p-6 rounded-lg shadow-lg text-color-text mb-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Story-Telling Results</h1>
        {imagePath && (
          <div className="relative w-full max-w-2xl h-[420px] mb-2">
            <Image
              src={imagePath}
              alt="Story telling image"
              width={900}
              height={420}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Card 2: Deskripsi, Feedback, Score */}
      <div className="bg-secondary p-6 rounded-lg shadow-lg text-color-text mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Your Description</h3>
          {suggestions && (
            <div className="flex items-center gap-2">
              <span>Score:</span>
              <div className="bg-tertiary text-white px-3 py-1 rounded-full font-bold">
                {suggestions.score}/10
              </div>
            </div>
          )}
        </div>
        <p className="whitespace-pre-wrap mb-4">{userDescription}</p>
        {suggestions && (
          <>
            <h3 className="text-lg font-medium mb-2">Overall Feedback:</h3>
            <p className="whitespace-pre-wrap">{suggestions.overallSuggestion}</p>
          </>
        )}
      </div>

      {/* Card 3: Specific Suggestions Accordion */}
      <div className="bg-secondary p-6 rounded-lg shadow-lg text-color-text mb-6">
        <h3 className="text-lg font-medium mb-4">Specific Suggestions</h3>
        {suggestions && suggestions.suggestions && suggestions.suggestions.length > 0 ? (
          <Accordion type="single" collapsible className="mb-2">
            {suggestions.suggestions.map((suggestion: any, index: number) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{suggestion.part}</AccordionTrigger>
                <AccordionContent>
                  {suggestion.suggestion}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-yellow-300">No suggestions available for this submission.</p>
        )}
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => router.push("/app/conversation")}
          className="bg-primary border border-tertiary text-color-text hover:bg-tertiary hover:text-white px-6 py-2 rounded"
        >
          Back to Conversations
        </Button>
      </div>
    </div>
  );
}