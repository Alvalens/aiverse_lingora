"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type Theme = {
  theme: string;
  description: string;
};

type ConversationType = "daily-talk" | "interactive-debate";

export default function CreateConversationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<Record<ConversationType, boolean>>({
    "daily-talk": false,
    "interactive-debate": false
  });
  const [isGenerating, setIsGenerating] = useState<Record<ConversationType, boolean>>({
    "daily-talk": false,
    "interactive-debate": false
  });
  const [themes, setThemes] = useState<Record<ConversationType, Theme[]>>({
    "daily-talk": [],
    "interactive-debate": []
  });
  const [selectedTheme, setSelectedTheme] = useState<Record<ConversationType, Theme | null>>({
    "daily-talk": null,
    "interactive-debate": null
  });

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Please login to continue</div>;
  }

  const handleCreateDailyTalk = () => {
    router.push("/app/conversation/daily-talk");
  };

  const handleCreateStoryTelling = () => {
    router.push("/app/conversation/story-telling");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
      <div className="w-full max-w-lg p-6 bg-[#052038] rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Conversations</h1>

        <p className="mb-8 text-center">
          Daily Talk with AI
        </p>

        <div className="flex justify-center">
          <Button
            onClick={handleCreateDailyTalk}
            className="bg-[#0E63A9] hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Create New
          </Button>
        </div>
      </div>
      <div className="w-full max-w-lg p-6 bg-[#052038] rounded-lg shadow-lg text-white mt-3">
        <h1 className="text-2xl font-bold mb-6 text-center">Conversations</h1>

        <p className="mb-8 text-center">
          Story Telling 
        </p>

        <div className="flex justify-center">
          <Button
            onClick={handleCreateStoryTelling}
            className="bg-[#0E63A9] hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Create New 
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
      <div className="flex flex-col md:flex-row md:space-x-8 items-start justify-center w-full">
        <ConversationCard type="daily-talk" />
        <ConversationCard type="interactive-debate" />
      </div>
    </div>
  );
}