"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type Theme = {
  theme: string;
  description: string;
};

type ConversationType = "daily-talk" | "interactive-debate";

export default function CreateConversationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<Record<ConversationType, boolean>>({
    "daily-talk": false,
    "interactive-debate": false
  });
  const [isGenerating, setIsGenerating] = useState<Record<ConversationType, boolean>>({
    "daily-talk": false,
    "interactive-debate": false
  });
  const [themes, setThemes] = useState<Record<ConversationType, Theme[]>>({
    "daily-talk": [],
    "interactive-debate": []
  });
  const [selectedTheme, setSelectedTheme] = useState<Record<ConversationType, Theme | null>>({
    "daily-talk": null,
    "interactive-debate": null
  });

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Please login to continue</div>;
  }

  const generateThemes = async (type: ConversationType) => {
    setIsGenerating(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(`/api/conversations/${type}/theme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to generate ${type} themes`);

      const data = await response.json();
      const mappedThemes = data.themes.map((t: any) => ({
        theme: t.title,
        description: t.description
      }));
      setThemes(prev => ({ ...prev, [type]: mappedThemes }));
      setSelectedTheme(prev => ({ ...prev, [type]: null }));
    } catch (error) {
      console.error(`Error generating ${type} themes:`, error);
      toast.error("Failed to generate themes. Please try again.");
    } finally {
      setIsGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const startConversation = async (type: ConversationType) => {
    if (!selectedTheme[type]) {
      toast.error("Please select a theme to continue");
      return;
    }

    setIsLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(`/api/conversations/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: selectedTheme[type]?.theme,
          description: selectedTheme[type]?.description
        }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const data = await response.json();
      toast.success("Conversation created successfully");
      router.push(`/app/conversation/${type}/${data.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleThemeSelection = (type: ConversationType, theme: Theme) => {
    setSelectedTheme(prev => ({ ...prev, [type]: { ...theme } }));
  };

  const ConversationCard = ({ type }: { type: ConversationType }) => (
    <div className="w-full max-w-xl p-6 bg-[#052038] rounded-lg shadow-lg text-white mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {type === "daily-talk" ? "Daily Talk" : "Interactive Debate"}
      </h2>

      <div className="mb-8">
        <Button
          onClick={() => generateThemes(type)}
          disabled={isGenerating[type]}
          className="w-full bg-[#0E63A9] hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {isGenerating[type] ? "Generating Themes..." : `Generate ${type === "daily-talk" ? "Daily Talk" : "Debate"} Themes`}
        </Button>
      </div>

      {themes[type].length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Select a Theme:</h3>
          <div className="space-y-3">
            {themes[type].map((theme, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-900 transition-colors ${
                  selectedTheme[type]?.theme === theme.theme ? "bg-blue-900 border-blue-500" : "border-gray-700"
                }`}
                onClick={() => handleThemeSelection(type, theme)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={`themeSelection-${type}`}
                    checked={selectedTheme[type]?.theme === theme.theme}
                    onChange={() => handleThemeSelection(type, theme)}
                    className="w-5 h-5 mr-3"
                  />
                  <div>
                    <h4 className="font-medium">{theme.theme}</h4>
                    <p className="text-gray-300 text-sm mt-1">{theme.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {themes[type].length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={() => startConversation(type)}
            disabled={isLoading[type] || !selectedTheme[type]}
            className={`${
              type === "daily-talk" ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"
            } text-white px-8 py-3 rounded-lg text-lg`}
          >
            {isLoading[type] ? "Creating Session..." : `Start ${type === "daily-talk" ? "Conversation" : "Debate"}`}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
      <div className="flex flex-col md:flex-row md:space-x-8 items-start justify-center w-full">
        <ConversationCard type="daily-talk" />
        <ConversationCard type="interactive-debate" />
      </div>
    </div>
  );
}