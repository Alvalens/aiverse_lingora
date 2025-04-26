"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import toast from "react-hot-toast";

type WritingSessionResult = {
  id: string;
  originalFilename: string | null;
  overallSuggestion: string;
  score: number;
  structureScore: number;
  structureFeedback: string;
  contentScore: number;
  contentFeedback: string;
  languageScore: number;
  languageFeedback: string;
  suggestions: {
    part: string;
    suggestion: string;
    category: string;
  }[];
  createdAt: string;
};

export default function WritingResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<WritingSessionResult | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/writing/${sessionId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch writing analysis result");
        }

        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error instanceof Error ? error.message : "An error occurred while fetching results");
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  const goBack = () => {
    router.push("/app/writing");
  };

  const ScoreIndicator = ({ score }: { score: number }) => {
    let color = "bg-red-500";
    if (score >= 9) color = "bg-green-500";
    else if (score >= 7) color = "bg-green-400";
    else if (score >= 5) color = "bg-yellow-400";
    else if (score >= 3) color = "bg-orange-500";

    return (
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full ${color}`}></div>
        <span className="font-semibold">{score}/10</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-6xl">
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-6"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Essays
        </Button>

        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container py-8 max-w-6xl">
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-6"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Essays
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Analysis Result Not Found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              The requested analysis result could not be found. Please try another one or create a new analysis.
            </p>
            <Button onClick={goBack}>
              Go Back to Essays
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-6"
        onClick={goBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Essays
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Essay Analysis Result</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {result.originalFilename || "Unnamed Essay"} • {format(new Date(result.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold mt-2 md:mt-0">
          Overall Score: <span className={`${result.score >= 7 ? 'text-green-500' : result.score >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>{result.score}/10</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="language">Language</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-6">
                <h3 className="font-semibold mb-2">Overall Assessment</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {result.overallSuggestion}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Structure</h4>
                    <ScoreIndicator score={result.structureScore} />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {result.structureFeedback}
                  </p>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Content</h4>
                    <ScoreIndicator score={result.contentScore} />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {result.contentFeedback}
                  </p>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Language</h4>
                    <ScoreIndicator score={result.languageScore} />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {result.languageFeedback}
                  </p>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Key Improvement Areas</h3>
              <div className="space-y-4">
                {result.suggestions.slice(0, 5).map((suggestion, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {suggestion.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 italic">
                      &quot;{suggestion.part}&quot;
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {suggestion.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="structure">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Structure Assessment</h3>
                  <ScoreIndicator score={result.structureScore} />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {result.structureFeedback}
                </p>
              </div>

              <h3 className="font-semibold mb-3">Structure Suggestions</h3>
              <div className="space-y-4">
                {result.suggestions
                  .filter(s => s.category.toLowerCase().includes('structure'))
                  .map((suggestion, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 italic">
                        &quot;{suggestion.part}&quot;
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.suggestion}
                      </p>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="content">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Content Assessment</h3>
                  <ScoreIndicator score={result.contentScore} />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {result.contentFeedback}
                </p>
              </div>

              <h3 className="font-semibold mb-3">Content Suggestions</h3>
              <div className="space-y-4">
                {result.suggestions
                  .filter(s => s.category.toLowerCase().includes('content') ||
                    s.category.toLowerCase().includes('argument') ||
                    s.category.toLowerCase().includes('evidence'))
                  .map((suggestion, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 italic">
                        &quot;{suggestion.part}&quot;
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.suggestion}
                      </p>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="language">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Language Assessment</h3>
                  <ScoreIndicator score={result.languageScore} />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {result.languageFeedback}
                </p>
              </div>

              <h3 className="font-semibold mb-3">Language Suggestions</h3>
              <div className="space-y-4">
                {result.suggestions
                  .filter(s => s.category.toLowerCase().includes('grammar') ||
                    s.category.toLowerCase().includes('vocabulary') ||
                    s.category.toLowerCase().includes('language') ||
                    s.category.toLowerCase().includes('style'))
                  .map((suggestion, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 italic">
                        &quot;{suggestion.part}&quot;
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.suggestion}
                      </p>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
