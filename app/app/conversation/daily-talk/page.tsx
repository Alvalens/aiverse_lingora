"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

type Theme = {
  theme: string;
  description: string;
};

export default function CreateConversationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please login to continue
      </div>
    );
  }

  const generateThemes = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/conversations/daily-talk/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate themes");
      }

      const data = await response.json();
      // Map title -> theme for frontend compatibility
      const mappedThemes = data.themes.map((t: any) => ({
        theme: t.title, // support both keys just in case
        description: t.description,
      }));
      setThemes(mappedThemes);
      setSelectedTheme(null); // Reset selection when generating new themes
    } catch (error) {
      console.error("Error generating themes:", error);
      toast.error("Failed to generate themes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const startConversation = async () => {
    if (!selectedTheme) {
      toast.error("Please select a theme to continue");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating conversation with theme:", selectedTheme.theme);
      const response = await fetch("/api/conversations/daily-talk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: selectedTheme.theme,
          description: selectedTheme.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      toast.success("Conversation created successfully");
      router.push(`/app/conversation/daily-talk/${data.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Handle theme selection
  const handleThemeSelection = (theme: Theme) => {
    console.log("Selected theme:", theme); // Debug log
    setSelectedTheme({ ...theme }); // Create a new object to ensure state update
  };

  return (
    <div className="container max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen p-4 bg-primary text-color-text border">
      <div className="w-full max-w-2xl p-6 rounded-lg shadow-lg lg:min-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create New Conversation
        </h1>

        <div className="mb-8">
          <Button
            onClick={generateThemes}
            disabled={isGenerating}
            className="w-full bg-[#0E63A9] hover:bg-blue-700 px-6 py-2 rounded"
          >
            {isGenerating ? "Generating Themes..." : "Generate Themes"}
          </Button>
        </div>
        {themes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl md:text-3xl tracking-wide font-semibold">
                  Choose Theme:
                </h2>
                <p className="mb-4">
                  Please choose a theme you would like to talk about.
                </p>
              </div>
              <button className="bg-[#0A3558] text-primary aspect-square h-10 rounded-full cursor-pointer">
                i
              </button>
            </div>
            <div className="space-y-1 md:space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-10">
              {themes.map((theme, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer   transition-colors flex flex-col justify-center h-[15rem] ${
                    selectedTheme?.theme === theme.theme
                      ? "border-tertiary/70"
                      : "border-gray-700"
                  }`}
                  onClick={() => handleThemeSelection(theme)}
                >
                  <div className="flex mx-auto items-center">
                    <input
                      type="radio"
                      name="themeSelection"
                      checked={selectedTheme?.theme === theme.theme}
                      onChange={() => handleThemeSelection(theme)}
                      className="w-5 h-5 mr-3 hidden"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src={
                          selectedTheme?.theme === theme.theme
                            ? "/dialy-talk/gradient-bubble-chat.svg"
                            : "/dialy-talk/default-bubble-chat.svg"
                        }
                        width={100}
                        height={100}
                        alt="Theme Image"
                        className="w-12 h-12 mx-auto"
                      />
                      <h3 className="font-medium">{theme.theme}</h3>
                      <p className="text-gray-300 text-sm mt-1">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {themes.length > 0 && (
          <div className="flex justify-center w-full gap-4">
            <Button
              onClick={startConversation}
              disabled={isLoading || !selectedTheme}
              className="bg-gradient-to-tr from-[#0A3558] to-tertiary text-white px-8 py-6 rounded-lg text-lg basis-3 flex-grow cursor-pointer"
            >
              {isLoading ? "Creating Session..." : "Start Conversation"}
            </Button>
            <Button
              onClick={generateThemes}
              disabled={isLoading || !selectedTheme}
              className="border border-tertiary px-8 py-6 rounded-lg text-lg basis-1 text-color-text hover:bg-tertiary/20 transition-colors cursor-pointer"
            >
              {isLoading ? "Generating Themes..." : "Generate Themes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
