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

  const handleCreateConversation = () => {
    router.push("/app/conversation/daily-talk");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
      <div className="w-full max-w-lg p-6 bg-[#052038] rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Conversations</h1>

        <p className="mb-8 text-center">
          Start a new conversation session to practice your English skills with AI.
        </p>

        <div className="flex justify-center">
          <Button
            onClick={handleCreateConversation}
            className="bg-[#0E63A9] hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Create New Conversation
          </Button>
        </div>
      </div>
    </div>
  );
}
