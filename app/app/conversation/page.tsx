"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FilePlus2, FileText, Timer } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const dummyHistory = [
  {
    id: "1",
    theme: "Travel",
    description: "Talk about your favorite travel destinations.",
    createdAt: "2024-06-01T10:00:00Z",
    simulationType: "daily-talk",
    score: 8,
    duration: "10",
  },
  {
    id: "2",
    theme: "Hobbies",
    description: "Discuss your favorite hobbies and pastimes.",
    createdAt: "2024-06-01T12:00:00Z",
    simulationType: "daily-talk",
    score: 7,
    duration: "15",
  },
  {
    id: "3",
    theme: "Food",
    description: "Discuss your favorite cuisines and dishes.",
    createdAt: "2024-06-02T14:30:00Z",
    simulationType: "reteller",
    score: 9,
    duration: "12",
  },
  {
    id: "4",
    theme: "Childhood Memories",
    description: "Retell a memorable story from your childhood.",
    createdAt: "2024-06-05T16:45:00Z",
    simulationType: "reteller",
    score: 6,
    duration: "8",
  },
  {
    id: "5",
    theme: "Technology",
    description: "Share thoughts on the latest tech trends.",
    createdAt: "2024-06-03T09:15:00Z",
    simulationType: "debate",
    score: 8,
    duration: "20",
  },
  {
    id: "6",
    theme: "Education",
    description: "Debate the pros and cons of online learning.",
    createdAt: "2024-06-06T13:10:00Z",
    simulationType: "debate",
    score: 7,
    duration: "18",
  },
];

const simulations = [
  {
    id: 1,
    title: "Dialy Talk",
    description:
      "Practice real-life conversations to build fluency, confidence, and quick responses in low-pressure settings.",
    defaultImg: "/dialy-talk/default-bubble-chat.svg",
    gradientImg: "/dialy-talk/gradient-bubble-chat.svg",
  },
  {
    id: 2,
    title: "Retell & Describe",
    description:
      "Improve coherence and memory by retelling stories or describing visuals—perfect for organizing thoughts and practicing grammar naturally.",
    defaultImg: "/dialy-talk/off-retell.svg",
    gradientImg: "/dialy-talk/gradient-retell.svg",
  },
  {
    id: 3,
    title: "Interactive Debate",
    description:
      "Sharpen critical thinking and argumentation through real-time debates that mimic IELTS Part 3 and real-world discussions.",
    defaultImg: "/dialy-talk/off-debate.svg",
    gradientImg: "/dialy-talk/gradient-debate.svg",
  },
];

type Simulation = {
  id: number;
  title: string;
  description: string;
  defaultImg: string;
  gradientImg: string;
};

type History = {
  id: string;
  theme: string;
  description: string;
  createdAt: string;
  simulationType: string;
  score: number;
};

export default function ConversationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSimulation, setSelectedSimulation] =
    useState<Simulation | null>(null);

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

  const handleCreateConversation = () => {
    router.push("/app/conversation/daily-talk");
  };

  const handleSelectSimulation = (simulation: Simulation) => {
    setSelectedSimulation(simulation);
  };

  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-primary">
  //     <div className="w-full max-w-lg p-6 bg-[#052038] rounded-lg shadow-lg text-white">
  //       <h1 className="text-2xl font-bold mb-6 text-center">Conversations</h1>

  //       <p className="mb-8 text-center">
  //         Start a new conversation session to practice your English skills with AI.
  //       </p>

  //       <div className="flex justify-center">
  //         <Button
  //           onClick={handleCreateConversation}
  //           className="bg-[#0E63A9] hover:bg-blue-700 text-white px-6 py-2 rounded"
  //         >
  //           Create New Conversation
  //         </Button>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="container mx-auto px-4 md:px-10 py-8 text-color-text">
      <div className="bg-secondary p-4 md:p-6 rounded-3xl mb-4 border-2 border-color-border-secondary">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Conversation</h1>
          <button className="text-lg bg-[#123C60] aspect-square w-10 rounded-full hover:bg-[#0f2e48] transition-colors duration-300 text-white">
            i
          </button>
        </div>
        <p className="font-thin tracking-wide md:w-3/4">
          Hello {session?.user.name?.split(" ")[0]}, welcome to the Conversation
          page! You can start a new conversation session by first choosing a
          simulation. You can also view your previous conversation history. For
          more details, click the ℹ️ icon beside each section.
        </p>
      </div>

      {/* Simulation Choices */}
      <h3 className="text-3xl my-6 font-semibold">Choose Simulation</h3>
      <div className="grid md:grid-cols-3 gap-6 md:w-5/6 mx-auto">
        {simulations.map((simulation) => {
          // return (
          //   <div className="border-2 border-tertiary rounded-3xl p-4">
          //     <Image
          //       src={simulation.defaultImg}
          //       width={100}
          //       height={100}
          //       alt="Simulation Logo"
          //     />
          //     <h2 className="text-xl">{simulation.title}</h2>
          //     <p>{simulation.description}</p>
          //   </div>
          // );
          return (
            <div
              key={simulation.id}
              className={`p-4 border-2 rounded-lg cursor-pointer   transition-colors flex flex-col justify-center h-[15rem] ${
                selectedSimulation?.id === simulation.id
                  ? "border-tertiary/70"
                  : "border-gray-700"
              }`}
              onClick={() => handleSelectSimulation(simulation)}
            >
              <div className="flex mx-auto items-center">
                <input
                  type="radio"
                  name="themeSelection"
                  checked={selectedSimulation?.id === simulation.id}
                  onChange={() => handleSelectSimulation(simulation)}
                  className="w-5 h-5 mr-3 hidden"
                />
                <div className="flex flex-col ">
                  <Image
                    src={
                      selectedSimulation?.id === simulation.id
                        ? "/dialy-talk/gradient-bubble-chat.svg"
                        : "/dialy-talk/default-bubble-chat.svg"
                    }
                    width={100}
                    height={100}
                    alt="Theme Image"
                    className="w-12 h-12 mx-auto"
                  />
                  <h3 className="font-medium">{simulation.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {simulation.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="container mx-auto py-8 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8">
        <Button
          className="bg-gradient-to-tr from-[#0A3558] to-tertiary text-white px-8 py-6 rounded-lg text-lg basis-3 flex-grow cursor-pointer"
          onClick={handleCreateConversation}
        >
          <span className="flex gap-8 justify-center items-center text-white">
            <FilePlus2 />
            <p>Start your Conversation</p>
          </span>
        </Button>
        <Button
          onClick={() => router.push("/app/help")}
          className="border border-tertiary px-8 py-6 rounded-lg text-lg basis-1 text-color-text hover:bg-tertiary/20 transition-colors cursor-pointer w-full md:w-auto"
        >
          How to Use?
        </Button>
      </div>
      <p className="text-center tracking-wide max-w-4xl mx-auto mb-4 md:mb-12">
        Personalized AI-powered speaking practice with live conversation,
        real-time verbal and non-verbal feedback, and adaptive learning paths.
      </p>

      <p className="text-lg mb-4">History</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-10">
        {!isLoading && dummyHistory.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No analysis history yet
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Start your first conversation session to practice and improve your
              English speaking skills with AI-powered simulations.
            </p>
            {/* <Link href="/app/converstation" passHref>
              <Button>Start Your First Analysis</Button>
            </Link> */}
          </div>
        ) : (
          // Analysis history cards
          dummyHistory.map((history) => (
            <Card
              key={history.id}
              className="overflow-hidden border-4 border-[#223849] bg-transparent rounded-3xl text-color-text"
            >
              <CardHeader className="p-0 block md:hidden">
                <div className="w-24 h-24 aspect-square rounded-full border-4 border-tertiary flex items-center justify-center mb-2 mx-auto">
                  <p className="text-4xl mb-3">
                    {history.score}
                    <sub>/10</sub>
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-0 text-color-text">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-12 md:col-span-8 space-y-2 py-2 px-4">
                    <p className="text-sm text-muted-foreground">
                      {new Date(history.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <h2 className="text-4xl font-semibold truncate">
                      {history.simulationType}
                    </h2>
                    <h3 className="truncate">Theme: {history.theme || ""}</h3>
                    <p className="flex items-center gap-1">
                      <Timer />
                      {history.duration} Minutes
                    </p>
                  </div>
                  <div className="hidden md:flex col-span-4 h-full flex-col gap-1 items-center justify-center rounded-3xl -m-1">
                    <div className="w-24 h-24 aspect-square rounded-full border-4 border-tertiary flex items-center justify-center mb-2">
                      <p className="text-4xl mb-3">
                        {history.score}
                        <sub>/10</sub>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
