"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

type Theme = {
  theme: string;
  description: string;
};

type DailyTalkSession = {
  id: string;
  theme: string;
  description: string;
  createdAt: string;
};

export default function CreateConversationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // State for history
  const [history, setHistory] = useState<DailyTalkSession[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const response = await fetch("/api/conversations/daily-talk");
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        setHistory(data.sessions || []);
      } catch {
        toast.error("Failed to load history.");
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

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
      const mappedThemes = data.themes.map((t: any) => ({
        theme: t.title,
        description: t.description
      }));
      setThemes(mappedThemes);
      setSelectedTheme(null);
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

  const handleThemeSelection = (theme: Theme) => {
    setSelectedTheme({ ...theme });
  };

  return (
    <div className="container max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen p-4 bg-primary text-color-text ">
      <div className="w-full max-w-2xl p-6 rounded-lg  lg:min-w-7xl">
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
          <div className="flex justify-center mb-8">
            <Button
              onClick={startConversation}
              disabled={isLoading || !selectedTheme}
              className="bg-gradient-to-tr from-[#0A3558] to-tertiary text-white px-8 py-6 rounded-lg text-lg basis-3 flex-grow cursor-pointer"
            >
              {isLoading ? "Creating Session..." : "Start Conversation"}
            </Button>
            <Button
              onClick={startConversation}
              disabled={isLoading || !selectedTheme}
              className="border border-tertiary px-8 py-6 rounded-lg text-lg basis-1 text-color-text hover:bg-tertiary/20 transition-colors cursor-pointer w-full md:w-auto"
            >
              {isLoading ? "Generating Themes..." : "Generate Themes"}
            </Button>
          </div>
        )}

        {/* History Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-color-text">Your Daily Talk History</h2>
          {isHistoryLoading ? (
            <p className="text-gray-300">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-300">No history found.</p>
          ) : (
            <ul className="space-y-4 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="bg-tertiary rounded p-3 flex flex-col cursor-pointer hover:bg-[#0E3756] transition"
                  onClick={() => router.push(`/app/conversation/daily-talk/${item.id}/result`)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Theme: {item.theme}</span>
                    <span className="text-xs text-gray-300">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1 truncate">
                    {item.description ? item.description.slice(0, 80) + (item.description.length > 80 ? "..." : "") : <span className="italic text-gray-400">No description</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}