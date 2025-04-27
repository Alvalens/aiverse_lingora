"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function StoryTellingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

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

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const response = await fetch("/api/conversations/story-telling/history");
        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }
        const data = await response.json();
        setHistory(data.sessions || []);
      } catch {
        toast.error("Failed to load history.");
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
      <div className="w-full max-w-lg p-6 bg-secondary rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-6 text-color-text text-center">Story Telling</h1>

        <p className="mb-8 text-color-text text-center">
          Practice your English by describing images. An AI will generate a random image for you to describe.
        </p>

        <div className="flex justify-center mb-8">
          <Button
            onClick={handleCreateStoryTelling}
            disabled={isLoading}
            className="bg-secondary border border-tertiary hover:bg-tertiary hover:text-white text-color-text px-6 py-2 rounded"
          >
            {isLoading ? "Creating..." : "Generate Image"}
          </Button>
        </div>

        {/* History Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-color-text">Your History</h2>
          {isHistoryLoading ? (
            <p className="text-gray-300">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-300">No history found.</p>
          ) : (
            <ul className="space-y-4 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="bg-tertiary rounded p-3 flex flex-col cursor-pointer hover:bg-[#0E3756] transition"
                  onClick={() => router.push(`/app/conversation/story-telling/${item.id}/result`)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Session: {item.id}</span>
                    <span className="text-xs text-gray-300">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1 truncate">
                    {item.userAnswer ? item.userAnswer.slice(0, 80) + (item.userAnswer.length > 80 ? "..." : "") : <span className="italic text-gray-400">No description</span>}
                  </div>
                  {item.score !== undefined && (
                    <div className="text-xs mt-1">
                      <span className="bg-green-700 text-white px-2 py-0.5 rounded">Score: {item.score}/10</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}