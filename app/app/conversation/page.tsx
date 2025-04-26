"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ConversationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  const handleCreateInteractiveDebate = () => {
    router.push("/app/conversation/interactive-debate");
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
      </div>
      <div className="w-full max-w-lg p-6 bg-[#052038] rounded-lg shadow-lg text-white mt-3">
        <h1 className="text-2xl font-bold mb-6 text-center">Conversations</h1>

        <p className="mb-8 text-center">
          Interactive Debate
        </p>

        <div className="flex justify-center">
          <Button
            onClick={handleCreateInteractiveDebate}
            className="bg-[#0E63A9] hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Create New 
          </Button>
        </div>
      </div>
    </div>
  );
}