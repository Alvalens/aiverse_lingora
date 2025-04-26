"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Coins, Download, RefreshCcw, Share2, Upload } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DailyTalkQuestion {
  id: string;
  dailyTalkId: string;
  question: string;
  answer: string;
  suggestion: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DailyTalkSession {
  id: string;
  userId: string;
  theme: string;
  description: string;
  duration: number;
  startedAt: string;
  endedAt: string | null;
  score: number | null;
  suggestions: any | null;
  questions: DailyTalkQuestion[];
  createdAt: string;
  updatedAt: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<DailyTalkSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  console.log({ session });

  useEffect(() => {
    const fetchDailyTalkHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/conversations/daily-talk/${id}/history`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch daily talk history"
          );
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        console.error("Error fetching daily talk history:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast.error("Failed to load daily talk history");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyTalkHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Loading daily talk history...
          </h2>
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
            <CardDescription>
              Could not find daily talk session data.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Extract overall suggestion if it exists in the session.suggestions
  let overallSuggestion = "";
  if (session.suggestions && typeof session.suggestions === "object") {
    overallSuggestion = session.suggestions.overallSuggestion || "";
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Talk Review</h1>
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
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              Overall Score: {session.score}/10&nbsp;
              <span className="ml-2 font-semibold">
                (
                {session.score! <= 4
                  ? "B1: I ntermediate"
                  : session.score! <= 6
                  ? "B2: Upper intermediate"
                  : session.score! <= 8
                  ? "C1: Advance"
                  : "C2: Proficient"}
                )
              </span>
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
        <Card className="bg-secondary text-color-text border-2 border-secondary rounded-3xl p-6 grid grid-cols-2 md:grid-cols-9 gap-2 mb-4 md:mb-10">
          {/* Col 1 */}
          <div className="md:col-span-2 p-4 bg-primary border-2 border-secondary rounded-xl flex flex-col justify-center items-center gap-6 ">
            <h3>Score:</h3>
            <div className="flex items-center gap-2">
              <p className="text-5xl font-bold text-center w-full">
                {(session.score || 0) * 10}%
              </p>
            </div>

            <Badge
              className={`mx-auto px-4 ${
                session.score! >= 8
                  ? "bg-[#00478B] hover:bg-[#00478B]"
                  : session.score! >= 6
                  ? "bg-[#0074D9] hover:bg-[#0074D9]"
                  : session.score! >= 4
                  ? "bg-[#FF851B] hover:bg-[#FF851B]"
                  : session.score! >= 2
                  ? "bg-[#FF4136] hover:bg-[#FF4136]"
                  : "bg-[#85144b] hover:bg-[#85144b]"
              }`}
            >
              <span className="ml-2 font-semibold">
                (
                {session.score! <= 4
                  ? "B1: Intermediate"
                  : session.score! <= 6
                  ? "B2: Upper intermediate"
                  : session.score! <= 8
                  ? "C1: Advance"
                  : "C2: Proficient"}
                )
              </span>
            </Badge>
          </div>
          <div className="col-span-1 flex md:hidden flex-col  gap-3 text-sm ">
            <div className="flex items-center gap-2 border border-color-border-secondary rounded-md p-2">
              <h4>Last Updated: </h4>
              <p>
                {new Date(session.updatedAt)
                  .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                  .replace(",", "")
                  .replace(":", ".")}
              </p>
            </div>
            <div className="flex items-center gap-2 border border-color-border-secondary rounded-md p-2">
              <h4>Duration: </h4>
              <p>{session.duration}</p> minutes
            </div>
            <div className="flex items-center gap-2 border border-color-border-secondary rounded-md p-2">
              <h4>Theme: </h4>
              <p>{session.theme}</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-7 grid grid-cols-7 gap-y-2">
            {/* Col 2 */}
            <div className="col-span-7 md:col-span-4 flex flex-col gap-2  ">
              <div className="p-4 bg-primary border-2 border-secondary rounded-xl h-full">
                <p className="h-32 overflow-auto max-h-40 scrollbar-hide">
                  {session.suggestions || ""}
                </p>
              </div>
            </div>
            {/* Col 3 */}
            <div className="col-span-3 p-2 hidden md:flex flex-col  gap-3 text-sm ">
              <div className="flex items-center gap-2 border border-color-border-secondary rounded-md p-2">
                <h4>Last Updated: </h4>
                <p>
                  {new Date(session.updatedAt)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(",", "")
                    .replace(":", ".")}
                </p>
              </div>
              <div className="flex items-center gap-2 border border-color-border-secondary rounded-md p-2">
                <h4>Duration: </h4>
                <p>{session.duration}</p> minutes
              </div>
              <div className="flex items-center gap-2 border border-color-border-secondary rounded-md p-2">
                <h4>Theme: </h4>
                <p>{session.theme}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="bg-secondary border-2 border-color-border-secondary rounded-3xl px-6 py-5 md:py-10">
          {session.questions && session.questions.length > 0 ? (
            <div className="space-y-6">
              {session.questions.map((question, index) => {
                // Extract suggestion and reason
                const suggestion = question.suggestion || "";
                const reason = question.reason || "";

                // Try to get the mark from the session.suggestions if it exists
                let mark = null;
                if (
                  session.suggestions &&
                  session.suggestions.answers &&
                  Array.isArray(session.suggestions.answers) &&
                  session.suggestions.answers[index]
                ) {
                  mark = session.suggestions.answers[index].mark;
                }

                return (
                  <div className="bg-white rounded-lg p-4">
                    Exchange {index + 1}:
                    <CardContent className="pt-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="h-1 font-semibold mb-2 text-gray-800">
                            Question:{" "}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div>
                              <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                                {question.question}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="h-1 font-semibold mb-2 text-gray-800">
                            Your Answer:{" "}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div>
                              <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                                {question.answer || "No answer provided"}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="h-1 font-semibold mb-2 text-green-700">
                            Sugestion:{" "}
                          </AccordionTrigger>
                          <AccordionContent>
                            {suggestion && (
                              <div>
                                <p className="whitespace-pre-wrap bg-green-50 p-3 rounded-md text-green-800">
                                  {suggestion}
                                </p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="h-1 font-semibold mb-2 text-purple-700">
                            Reasoning:{" "}
                          </AccordionTrigger>
                          <AccordionContent>
                            {reason && (
                              <div>
                                <p className="whitespace-pre-wrap bg-purple-50 p-3 rounded-md text-purple-800">
                                  {reason}
                                </p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">
                  No conversation history found for this daily talk session.
                </p>
              </CardContent>
            </Card>
          )}
        </Card>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button onClick={() => (window.location.href = "/app/conversation")}>
          New Daily Talk
        </Button>
      </div>
    </div>
  );
}
