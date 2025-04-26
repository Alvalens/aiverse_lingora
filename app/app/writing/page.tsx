"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type essayAnalysis = {
  id: string;
  originalFilename: string | null;
  score: number;
  createdAt: string;
};

export default function WritingPage() {
  const router = useRouter();
  const [essayAnalysiss, setessayAnalysiss] = useState<essayAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch writing sessions
    const fetchessayAnalysiss = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/writing");

        if (!response.ok) {
          throw new Error("Failed to fetch writing sessions");
        }
        const sessions = await response.json();
        setessayAnalysiss(sessions);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to fetch writing sessions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchessayAnalysiss();
  }, []);

  const handleCreateNew = () => {
    router.push("/app/writing/create");
  };

  const handleViewResult = (id: string) => {
    router.push(`/app/writing/${id}/result`);
  };

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-500";
    if (score >= 7) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    if (score >= 3) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Essay Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload essays and get detailed feedback to improve your writing skills
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Analyze New Essay
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : essayAnalysiss.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              No Essays Analyzed Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Upload your first essay to get detailed feedback and suggestions for improvement.
            </p>
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Analyze Essay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {essayAnalysiss.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span className="truncate">
                    {session.originalFilename || "Essay Analysis"}
                  </span>
                  <span className={`text-xl font-bold ${getScoreColor(session.score)}`}>
                    {session.score}/10
                  </span>
                </CardTitle>
                <CardDescription>
                  {/* {format(new Date(session.createdAt), "MMM d, yyyy • h:mm a")} */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewResult(session.id)}
                >
                  View Detailed Analysis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
