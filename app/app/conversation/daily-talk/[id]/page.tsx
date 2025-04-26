"use client";

import React, { useState, useEffect, useRef, use, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  ArrowUp,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
} from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useVideoCapture } from "@/hooks/useVideoCapture";

interface ChatMessage {
  role: "system" | "user" | "model";
  parts: { text: string }[];
}

interface response {
  history: ChatMessage[];
  ended: boolean;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [ended, setEnded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { id } = use(params);

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetAudioBlob,
  } = useAudioRecorder();

  const { videoRef, permission, requestCameraPermission, stopCamera } =
    useVideoCapture({
      fps: 15,
    });

  // Handle camera toggle
  const toggleCamera = async () => {
    if (cameraEnabled) {
      stopCamera();
      setCameraEnabled(false);
    } else {
      // Wait a moment to ensure the video element is in the DOM
      setTimeout(async () => {
        const hasPermission = await requestCameraPermission();
        setCameraEnabled(hasPermission);
        if (!hasPermission) {
          toast.error(
            "Camera access denied. Please check your browser settings."
          );
        }
      }, 100);
    }
  };
  const { isSpeaking, speakText, stopSpeaking } = useSpeechSynthesis();
  // Function to transcribe audio using the API
  const transcribeAudio = useCallback(
    async (blob: Blob) => {
      if (!blob) return;

      try {
        setIsTranscribing(true);

        const formData = new FormData();
        formData.append("audio", blob);

        const response = await fetch("/api/conversations/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to transcribe audio");
        }

        const data = await response.json();
        setUserInput(data.themes);
      } catch (error) {
        console.error("Error transcribing audio:", error);
        toast.error("Failed to transcribe your audio. Please try again.");
      } finally {
        setIsTranscribing(false);
        resetAudioBlob();
      }
    },
    [resetAudioBlob]
  ); // Effect to transcribe audio when available
  useEffect(() => {
    if (audioBlob && !isRecording) {
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, isRecording, transcribeAudio]);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, []);

  // Fetch interview data on initial load or restore from localStorage
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const savedData = localStorage.getItem(`interview_${id}`);

        if (savedData) {
          // Restore chat from localStorage
          const parsedData = JSON.parse(savedData);
          setHistory(parsedData.history || []);
          setEnded(parsedData.ended || false);

          // Set the current question to display
          const parsedHistory = parsedData.history || [];
          const lastMessage = parsedHistory[parsedHistory.length - 1];
          if (lastMessage && lastMessage.role === "model") {
            setCurrentQuestion(lastMessage.parts[0].text);

            // Speak the question
            speakText(lastMessage.parts[0].text, {
              onEnd: () => {
                listeningTimeoutRef.current = setTimeout(() => {
                  // After speech ends, wait a moment before allowing recording
                }, 1000);
              },
            });
          }
          setPageLoading(false);
          return;
        }

        // If no saved chat, fetch initial question
        setLoading(true);
        const response = await fetch(`/api/conversations/daily-talk/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ history: null }),
        });

        if (response.redirected) {
          window.location.href = response.url;
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch interview data");
        }

        const data: response = await response.json();
        setHistory(data.history);
        setEnded(data.ended);

        // Display the first question
        const lastMessage = data.history[data.history.length - 1];
        if (lastMessage && lastMessage.role === "model") {
          setCurrentQuestion(lastMessage.parts[0].text);

          // Speak the question
          speakText(lastMessage.parts[0].text, {
            onEnd: () => {
              // Start listening after speaking ends with a short delay
              listeningTimeoutRef.current = setTimeout(() => {
                // Ready for user input
              }, 1000);
            },
          });
        }

        // Save to localStorage
        localStorage.setItem(
          `interview_${id}`,
          JSON.stringify({
            history: data.history,
            ended: data.ended,
          })
        );
        setPageLoading(false);
      } catch (error) {
        console.error("Error fetching interview data:", error);
        toast.error("Failed to load interview. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim() || loading) return;

    // Clear any scheduled listening timeouts
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    // Stop speech synthesis if active
    stopSpeaking();

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      const updatedHistory: ChatMessage[] = [
        ...history,
        {
          role: "user" as const,
          parts: [{ text: userInput }],
        },
      ];
      setUserInput('');

      setLoading(true);
      setCurrentQuestion("Thinking...");

      const response = await fetch(`/api/conversations/daily-talk/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ history: updatedHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data: response = await response.json();

      setEnded(data.ended);

      localStorage.setItem(
        `interview_${id}`,
        JSON.stringify({
          history: data.history,
          ended: data.ended,
        })
      );

      setHistory(data.history);

      const lastMessage = data.history[data.history.length - 1];
      if (lastMessage && lastMessage.role === "model") {
        setCurrentQuestion(lastMessage.parts[0].text);
        setUserInput("");

        speakText(lastMessage.parts[0].text, {
          onEnd: () => {
            listeningTimeoutRef.current = setTimeout(() => {
              // Ready for next user input
            }, 1000);
          },
        });
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to send your response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInterview = async () => {
    // Stop any scheduled listener
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    // Stop speech synthesis if active
    stopSpeaking();

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      setLoading(true);
      const formattedHistory = history
        .filter((msg) => msg.role === "model" || msg.role === "user")
        .reduce((acc: any[], msg, i, arr) => {
          if (
            msg.role === "model" &&
            i < arr.length - 1 &&
            arr[i + 1].role === "user"
          ) {
            acc.push({
              question: msg.parts[0].text,
              answer: arr[i + 1].parts[0].text,
            });
          }
          return acc;
        }, []);

      // Send history to the API
      const response = await fetch(`/api/conversations/daily-talk/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: formattedHistory,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to save interview. Please try again.");
        return;
      }

      // Clear local storage after successful save
      localStorage.removeItem(`interview_${id}`);
      localStorage.clear();

      toast.success("Interview saved successfully with AI suggestions!");

      // Redirect to results page or show completion message
      window.location.href = `/app/conversation/daily-talk/${id}/result`;
    } catch (error) {
      console.error("Error saving interview:", error);
      toast.error("Failed to save interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end the session? This will save your interview and provide feedback."
    );

    if (!confirmEnd) {
      return; // Exit if the user cancels
    }

    // Stop any scheduled listener
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    // Stop speech synthesis if active
    stopSpeaking();

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      setLoading(true);

      // Mark the session as ended
      const endSessionResponse = await fetch(
        `/api/conversations/daily-talk/${id}/end`,
        {
          method: "POST",
        }
      );

      if (!endSessionResponse.ok) {
        const errorText = await endSessionResponse.text();
        console.error("End session error:", errorText);
        throw new Error("Failed to mark session as ended.");
      }

      // Format the history for saving
      const formattedHistory = history
        .filter((msg) => msg.role === "model" || msg.role === "user")
        .reduce((acc: any[], msg, i, arr) => {
          if (
            msg.role === "model" &&
            i < arr.length - 1 &&
            arr[i + 1].role === "user"
          ) {
            acc.push({
              question: msg.parts[0].text,
              answer: arr[i + 1].parts[0].text,
            });
          }
          return acc;
        }, []);

      // Send history to the save API
      const saveResponse = await fetch(
        `/api/conversations/daily-talk/${id}/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            history: formattedHistory,
          }),
        }
      );

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error("Save session error:", errorText);
        throw new Error("Failed to save interview.");
      }

      // Clear local storage after successful save
      localStorage.removeItem(`interview_${id}`);
      localStorage.clear();

      toast.success("Session ended successfully with AI feedback!");

      // Redirect to results page or show completion message
      window.location.href = `/app/conversation/daily-talk/${id}/result`;
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <p className="text-gray-500">Loading daily talk session...</p>
        </div>
      </div>
    );
  }
  console.log({ userInput });
  console.log({ isRecording });
  return (
    <div className="container  mx-auto p-4 flex flex-col h-[calc(100vh-100px)] text-color-text">
      <h1 className="text-2xl font-bold mb-4">Conversation - Daily Talk</h1>
      <p className="mb-4 text-gray-500">
        Respond to the questions to continue the conversation.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Camera preview area (mobile) */}
        <div className="block lg:hidden col-span-1">
          {cameraEnabled ? (
            <div className="flex flex-col h-full">
              <Card className="h-full flex flex-col bg-secondary p-6 rounded-3xl border-2 border-color-border-secondary">
                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="font-semibold mb-2 text-3xl text-color-text">
                    Camera Preview
                  </div>
                  <div
                    className="relative flex-grow bg-black rounded-md overflow-hidden"
                    // ref={cameraContainerRef}
                    style={{ minHeight: "240px" }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                      // style={{ backgroundColor: "black" }}
                    />
                    {isRecording && (
                      <div className="absolute bottom-2 left-2 flex items-center">
                        <div className="h-6 w-6 rounded-full border-2 border-red-500 animate-pulse mr-1 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-red-500  "></div>
                        </div>
                        <span className="text-white text-xs">Recording</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-color-text mt-2">
                    The camera preview is for your own self-evaluation. Use it
                    to observe your body language and expressions as you
                    practice your responses.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center bg-secondary p-6 rounded-3xl border-2 border-color-border-secondary">
              <Camera className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-center text-gray-500 mb-4">
                Enable your camera to get feedback on your body language and
                expressions during the conversation.
              </p>
              <Button variant="outline" onClick={toggleCamera}>
                Enable Camera
              </Button>
            </Card>
          )}
        </div>
        {/* Main chat area */}
        <div className="lg:col-span-2 flex flex-col md:h-[calc(100vh-240px)] bg-secondary p-6 rounded-3xl border-2 border-color-border-secondary">
          <div className="flex-grow overflow-y-auto mb-4">
            <Card
              className={`mb-4 ${
                loading ? "animate-pulse" : ""
              } opacity-50 border-2 border-color-border-secondary`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-2 space-x-2">
                  <div className="w-16 aspect-square p-1 rounded-full flex items-center justify-center font-bold text-xl">
                    <Image
                      className="w-4 aspect-square object-cover"
                      src="/landing-page/logo.svg"
                      width={100}
                      height={100}
                      alt="Lingora logo"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-color-text text-xl">
                      Lingora
                    </p>
                    <p className="mt-1 text-color-text whitespace-pre-wrap">
                      {loading ? "Thinking..." : currentQuestion}
                    </p>
                    <Button
                      size="sm"
                      className="mt-6 rounded-full w-8 aspect-square bg-black text-white "
                      onClick={() => {
                        // Clear any scheduled listener
                        if (listeningTimeoutRef.current) {
                          clearTimeout(listeningTimeoutRef.current);
                          listeningTimeoutRef.current = null;
                        }

                        // Stop listening before playing speech
                        // if (loading || pageLoading) {
                        //   stopListening();
                        // }

                        // Prevent duplicate recordings when replaying questions
                        if (isRecording) {
                          stopRecording();
                        }
                        // setRecordTriggered(false);
                        speakText(currentQuestion);
                      }}
                      disabled={isSpeaking || loading}
                    >
                      <Volume2 />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div ref={bottomRef}></div>
          </div>

          <div className="mt-2">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <div />
                <Button
                  type="button"
                  variant={loading || pageLoading ? "default" : "outline"}
                  className="flex items-center justify-center text-color-text cursor-pointer"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading || isSpeaking}
                >
                  {isRecording ? (
                    <>
                      <Mic className="h-5 w-5 mr-1 " />
                      <span className="">Listening... (Click to stop)</span>
                    </>
                  ) : (
                    <>
                      <MicOff className="h-5 w-5 mr-1" />
                      <span className="">Start Voice Recording</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant={cameraEnabled ? "default" : "outline"}
                  className="w-12 h-12 flex items-center justify-center text-color-text"
                  onClick={toggleCamera}
                >
                  {cameraEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="relative">
                <Textarea
                  value={userInput}
                  placeholder="Your response..."
                  className="min-h-[150px] p-3 text-color-text bg-secondary border-2 border-tertiary outline-none rounded-3xl"
                  readOnly={true}
                />
                <Button
                  type="submit"
                  disabled={loading || !userInput.trim()}
                  className="w-8 h-8 rounded-full bg-[#CACACA] hover:bg-[#CACACA80] text-color-text absolute bottom-3 right-3"
                >
                  <ArrowUp className="font-bold" />
                </Button>
              </div>

              {ended && (
                <Button
                  type="button"
                  className="w-full bg-tertiary hover:bg-tertiary/80"
                  onClick={handleSaveInterview}
                  disabled={loading || isSpeaking} // Also disable during speech synthesis
                >
                  {loading ? "Saving..." : "Save Interview & Get Feedback"}
                </Button>
              )}
            </form>
          </div>
        </div>
        {/* Camera preview area */}
        <div className="hidden lg:block col-span-1">
          {cameraEnabled ? (
            <div className="flex flex-col h-full">
              <Card className="h-full flex flex-col bg-secondary p-6 rounded-3xl border-2 border-color-border-secondary">
                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="font-semibold mb-2 text-3xl text-color-text">
                    Camera Preview
                  </div>
                  <div
                    className="relative flex-grow bg-black rounded-md overflow-hidden"
                    // ref={cameraContainerRef}
                    style={{ minHeight: "240px" }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                      // style={{ backgroundColor: "black" }}
                    />
                    {isRecording && (
                      <div className="absolute bottom-2 left-2 flex items-center">
                        <div className="h-6 w-6 rounded-full border-2 border-red-500 animate-pulse mr-1 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-red-500  "></div>
                        </div>
                        <span className="text-white text-xs">Recording</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-color-text mt-2">
                    The camera preview is for your own self-evaluation. Use it
                    to observe your body language and expressions as you
                    practice your responses.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center bg-secondary p-6 rounded-3xl border-2 border-color-border-secondary">
              <Camera className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-center text-gray-500 mb-4">
                Enable your camera to get feedback on your body language and
                expressions during the conversation.
              </p>
              <Button variant="outline" onClick={toggleCamera}>
                Enable Camera
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* End Session Button */}
      <div className="fixed bottom-4 right-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-[#FF4D4D] hover:bg-[#FF6666] text-white"
              // onClick={handleEndSession}
              disabled={loading || isSpeaking} // Also disable during speech synthesis
            >
              {loading ? "Ending Session..." : "End Session"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#062039] text-white border-4 border-[#172F45]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you certain you want to end the session? This action will
                save your interview and generate feedback.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-0 hover:bg-transparent hover:text-white text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-[#58BFFA] hover:bg-[#70D0FF] text-black"
                onClick={handleEndSession}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
