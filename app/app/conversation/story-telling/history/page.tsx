"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface StoryTellingSession {
  id: string;
  image: string;
  userAnswer: string;
  suggestions: any;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export default function StoryTellingHistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<StoryTellingSession[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/conversations/story-telling/history");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch history");
        }

        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("Error fetching story-telling history:", error);
        toast.error("Failed to load your story-telling history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleViewSession = (sessionId: string) => {
    router.push(`/app/conversation/story-telling/${sessionId}/result`);
  };

  const handleCreateNew = () => {
    router.push("/app/conversation/story-telling");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary">
        <p className="text-lg text-white">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-[#052038] p-6 rounded-lg shadow-lg text-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Story-Telling History</h1>
          <Button
            onClick={handleCreateNew}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Start New Session
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-6">You havent completed any story-telling sessions yet.</p>
            <Button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
            >
              Start Your First Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-[#0A3256] p-4 rounded-lg">
                <div className="flex">
                  <div className="w-1/3 mr-4">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={session.image}
                        alt="Story telling image"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300 text-sm">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                        {session.score && (
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-sm font-bold">
                            Score: {session.score}/10
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-3 text-sm mb-2">
                        {session.userAnswer}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleViewSession(session.id)}
                      className="bg-[#0E63A9] hover:bg-blue-700 mt-auto self-end px-3 py-1 text-sm rounded"
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
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
