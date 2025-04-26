"use client";

import { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';

interface DebateQuestion {
  id: string;
  debateId: string;
  question: string;
  answer: string;
  suggestion: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DebateSession {
  id: string;
  userId: string;
  theme: string;
  description: string;
  duration: number;
  startedAt: string;
  endedAt: string | null;
  score: number | null;
  suggestions: any | null;
  questions: DebateQuestion[];
  createdAt: string;
  updatedAt: string;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<DebateSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebateHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/conversations/interactive-debate/${id}/history`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch debate history');
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        console.error('Error fetching debate history:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Failed to load  debate history');
      } finally {
        setLoading(false);
      }
    };

    fetchDebateHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading debate history...</h2>
          <div className="animate-pulse h-2 bg-gray-300 rounded w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Data Found</CardTitle>
            <CardDescription>Could not find debate session data.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Extract overall suggestion if it exists in the session.suggestions
  let overallSuggestion = '';
  if (session.suggestions && typeof session.suggestions === 'object') {
    overallSuggestion = session.suggestions.overallSuggestion || '';
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debate Review</h1>
        <p className="text-gray-600 mb-4">
          Theme: <span className="font-medium">{session.theme}</span>
        </p>
        <div className="flex gap-4 flex-wrap">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
            {session.description}
          </div>
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
            {new Date(session.startedAt).toLocaleString()}
          </div>
          <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
            Duration: {session.duration} minutes
          </div>
          {session.score && (
            <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
              Overall Score: {session.score}/10
            </div>
          )}
        </div>
      </div>

      {overallSuggestion && (
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Overall Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{overallSuggestion}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Conversation Review</h2>

        {session.questions && session.questions.length > 0 ? (
          <div className="space-y-6">
            {session.questions.map((question, index) => {
              // Extract suggestion and reason
              const suggestion = question.suggestion || '';
              const reason = question.reason || '';

              // Try to get the mark from the session.suggestions if it exists
              let mark = null;
              if (session.suggestions &&
                session.suggestions.answers &&
                Array.isArray(session.suggestions.answers) &&
                session.suggestions.answers[index]) {
                mark = session.suggestions.answers[index].mark;
              }

              return (
                <Card key={question.id} className="border shadow-sm">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg">
                      Exchange {index + 1}
                      {mark && (
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                          Score: {mark}/10
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-800">Question:</h3>
                      <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                        {question.question}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-gray-800">Your Answer:</h3>
                      <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                        {question.answer || "No answer provided"}
                      </p>
                    </div>

                    {suggestion && (
                      <div>
                        <h3 className="font-semibold mb-2 text-green-700">Suggestion:</h3>
                        <p className="whitespace-pre-wrap bg-green-50 p-3 rounded-md text-green-800">
                          {suggestion}
                        </p>
                      </div>
                    )}

                    {reason && (
                      <div>
                        <h3 className="font-semibold mb-2 text-purple-700">Reasoning:</h3>
                        <p className="whitespace-pre-wrap bg-purple-50 p-3 rounded-md text-purple-800">
                          {reason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">No conversation history found for this debate session.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button onClick={() => window.location.href = "/app/conversation"}>
          New Interactive Debate
        </Button>
      </div>
    </div>
  );
}