"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateWritingPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file to analyze");
      return;
    }

    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload file
      const uploadResponse = await fetch("/api/writing/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const uploadData = await uploadResponse.json();
      console.log("File uploaded successfully:", uploadData);

      // Start analysis
      setIsUploading(false);
      setIsAnalyzing(true);

      toast.loading("Analyzing essay. This may take a minute, please wait...", {
        id: "analyzing",
      });

      const analysisResponse = await fetch("/api/writing/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: uploadData.filePath }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || "Failed to analyze essay");
      }

      const result = await analysisResponse.json();
      console.log("Analysis complete:", result);

      toast.dismiss("analyzing");
      toast.success("Analysis complete!");

      // Navigate to results page
      if (result.sessionId) {
        router.push(`/app/writing/${result.sessionId}/result`);
      } else {
        throw new Error("No session ID returned from analysis");
      }

    } catch (error) {
      console.error("Error:", error);
      toast.dismiss("analyzing");
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const goBack = () => {
    router.push("/app/writing");
  };

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

      <h1 className="text-3xl font-bold mb-2">Analyze New Essay</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Upload your essay in PDF format for detailed feedback and suggestions.
      </p>


      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload Essay</CardTitle>
            <CardDescription>
              Select a PDF file containing your essay for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF (MAX. 10MB)
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading || isAnalyzing}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : "Analyze Essay"}
              </Button>

              {(isUploading || isAnalyzing) && (
                <p className="text-sm text-center text-gray-500 mt-2">
                  This may take a minute or two. Please don&apos;t close the page.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
