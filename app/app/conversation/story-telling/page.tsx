"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function StoryTellingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateStoryTelling = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/conversations/story-telling", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create story telling session");
      }

      const data = await response.json();

      // Redirect to the story telling session page
      router.push(`/app/conversation/story-telling/${data.id}`);
    } catch (error) {
      console.error("Error creating story telling session:", error);
      toast.error("Failed to create story telling session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
      <div className="w-full max-w-lg p-6 bg-[#052038] rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Story Telling</h1>

        <p className="mb-8 text-center">
          Practice your English by describing images. An AI will generate a random image for you to describe.
        </p>

        <div className="flex justify-center mb-8">
          <Button
            onClick={handleCreateStoryTelling}
            disabled={isLoading}
            className="bg-[#0E63A9] hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            {isLoading ? "Creating..." : "Generate Image"}
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => router.push("/app/conversation/story-telling/history")}
            className="bg-[#164869] hover:bg-[#0E3756] text-white px-6 py-2 rounded"
          >
            View History
          </Button>
        </div>
      </div>
    </div>
  );
}
