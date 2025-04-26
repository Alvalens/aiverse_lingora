"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ConversationDetailPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, you would fetch the conversation details
    // using the ID from params.id
    setIsLoading(false);
  }, [params.id]);

  if (status === "loading" || isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Please login to continue</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
      <div className="w-full max-w-4xl p-6 bg-[#052038] rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Conversation Session</h1>

        <div className="mb-8 text-center">
          <p>Conversation ID: {params.id}</p>
          <p className="mt-4">This is a placeholder for the conversation session page.</p>
          <p className="mt-2">Here you would implement the actual conversation interface.</p>
        </div>
      </div>
    </div>
  );
}
