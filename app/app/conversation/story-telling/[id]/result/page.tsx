"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function StoryTellingResultPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params once with use()
  const { id } = use(params);
  const router = useRouter();

  // State for managing component
  const [isLoading, setIsLoading] = useState(true);
  const [imagePath, setImagePath] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [suggestions, setSuggestions] = useState<any>(null);  
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        // Fetch data from history endpoint
        const response = await fetch(`/api/conversations/story-telling/${id}/history`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch session details");
        }

        const data = await response.json();
        setImagePath(data.imagePath || "");
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
      <div className="bg-[#052038] p-6 rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Story-Telling Results</h1>

        <div className="mb-8 flex flex-col items-center">
          {imagePath && (
            <div className="relative w-full max-w-lg h-72 mb-4">
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
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Results</h2>
            {suggestions && (
              <div className="flex items-center gap-2">
                <span>Score:</span>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                  {suggestions.score}/10
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#0A3256] p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-2">Your Description:</h3>
            <p className="whitespace-pre-wrap mb-4">{userDescription}</p>

            {suggestions ? (
              <>
                <h3 className="text-lg font-medium mb-2">Overall Feedback:</h3>
                <p className="whitespace-pre-wrap mb-4">{suggestions.overallSuggestion}</p>

                {suggestions.suggestions && suggestions.suggestions.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium mb-2">Specific Suggestions:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {suggestions.suggestions.map((suggestion: any, index: number) => (
                        <li key={index} className="mb-2">
                          <span className="font-medium text-yellow-400">{suggestion.part}</span>
                          <p className="text-green-300">{suggestion.suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <p className="text-yellow-300">No suggestions available for this submission.</p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/app/conversation")}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded"
            >
              Back to Conversations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
